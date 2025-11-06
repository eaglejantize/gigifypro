import { Router } from "express";
import { db } from "../db";
import { users, userBadges, badges, profiles, profileServices, insertProfileSchema, reviewLikes, workerProfiles } from "@shared/schema";
import { eq, and, sql as drizzleSql } from "drizzle-orm";
import { refreshUserBadges } from "../services/badgeService";
import { calculateGigScore, updateGigScore } from "../services/gigScoreService";
import { z } from "zod";

// Validation schema for profile updates (excludes userId and id to prevent tampering)
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  niche: z.string().optional(),
});

const router = Router();

// Auth guard
function needAuth(req: any, res: any, next: any) {
  const uid = (req.session as any)?.uid;
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// GET /api/profile/:id/badges
router.get("/:id/badges", async (req, res) => {
  try {
    const userId = req.params.id;

    // Refresh user badges based on progress
    await refreshUserBadges(userId);

    // Fetch all user badges with badge details
    const userBadgesList = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
      with: {
        badge: true,
      },
    });

    const badgeData = userBadgesList.map(ub => ({
      id: ub.badge.id,
      type: ub.badge.type,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      color: ub.badge.color,
      earnedAt: ub.earnedAt,
    }));

    res.json(badgeData);
  } catch (error) {
    console.error("Error fetching profile badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

// GET /api/profile/:id/gigscore
router.get("/:id/gigscore", async (req, res) => {
  try {
    const profileId = req.params.id;

    // Calculate GigScore components (returns zero score if profile doesn't exist)
    const scoreComponents = await calculateGigScore(profileId);

    res.json(scoreComponents);
  } catch (error: any) {
    console.error("Error calculating GigScore:", error);
    res.status(500).json({ error: "Failed to calculate GigScore" });
  }
});

// POST /api/profile/:id/gigscore/update
router.post("/:id/gigscore/update", async (req, res) => {
  try {
    const profileId = req.params.id;

    // Calculate and save GigScore to database
    const totalScore = await updateGigScore(profileId);

    res.json({ gigScore: totalScore });
  } catch (error: any) {
    console.error("Error updating GigScore:", error);
    if (error.message === "Profile not found") {
      res.status(404).json({ error: "Profile not found" });
    } else {
      res.status(500).json({ error: "Failed to update GigScore" });
    }
  }
});

// Get Available Gig Pros by Service
router.get("/gigers/by-service/:serviceKey", async (req, res) => {
  try {
    const { serviceKey } = req.params;

    // Find all profiles that offer this service and are live
    const gigersWithService = await db
      .select({
        profileId: profileServices.profileId,
        serviceKey: profileServices.serviceKey,
        isPrimary: profileServices.isPrimary,
        profile: profiles,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(profileServices)
      .innerJoin(profiles, eq(profileServices.profileId, profiles.id))
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(and(
        eq(profileServices.serviceKey, serviceKey),
        eq(profiles.isLive, true)
      ));

    // Get ratings stats for each Gig Pro (use workerProfiles for backward compat)
    const gigProStats = await Promise.all(
      gigersWithService.map(async (gigPro) => {
        // Get review count and average rating
        const reviewStats = await db
          .select({
            count: drizzleSql<number>`count(*)::int`,
            avgRating: drizzleSql<number>`COALESCE(avg(${reviewLikes.rating}), 0)`,
            likeCount: drizzleSql<number>`count(${reviewLikes.id})::int`,
          })
          .from(reviewLikes)
          .innerJoin(workerProfiles, eq(reviewLikes.workerId, workerProfiles.id))
          .where(eq(workerProfiles.userId, gigPro.user.id));

        const stats = reviewStats[0] || { count: 0, avgRating: 0, likeCount: 0 };

        return {
          profileId: gigPro.profile.id,
          profileName: gigPro.profile.name,
          tagline: gigPro.profile.tagline,
          bio: gigPro.profile.bio,
          mainNiche: gigPro.profile.mainNiche,
          city: gigPro.profile.city,
          state: gigPro.profile.state,
          rateCents: gigPro.profile.rateCents,
          pricingModel: gigPro.profile.pricingModel,
          userId: gigPro.user.id,
          userName: gigPro.user.name,
          avatar: gigPro.user.avatar,
          reviewCount: stats.count,
          avgRating: parseFloat(stats.avgRating?.toString() || "0"),
          likeCount: stats.likeCount,
          isPrimaryService: gigPro.isPrimary,
        };
      })
    );

    res.json(gigProStats);
  } catch (error) {
    console.error("Error fetching Gig Pros by service:", error);
    res.status(500).json({ error: "Failed to fetch Gig Pros" });
  }
});

// Create Gig Pro Profile(s)
// NOTE: Neon HTTP driver doesn't support transactions - race conditions possible under high concurrency
// In production, add a database constraint or use Neon WebSocket driver
router.post("/giger/create", needAuth, async (req, res) => {
  try {
    const userId = (req.session as any).uid;
    const { profiles: profilesData } = req.body;

    if (!Array.isArray(profilesData) || profilesData.length === 0) {
      return res.status(400).json({ error: "Profiles array required" });
    }

    // No limit on number of profiles - Gig Pros can offer unlimited services
    const existingProfiles = await db.select().from(profiles).where(eq(profiles.userId, userId));

    const createdProfiles = [];

    for (const profileData of profilesData) {
      const { services, ...profileFields } = profileData;

      // Validate profile data
      const validatedProfile = insertProfileSchema.parse({
        ...profileFields,
        userId,
      });

      // Create profile
      const [newProfile] = await db.insert(profiles).values(validatedProfile).returning();

      // Add services
      if (Array.isArray(services) && services.length > 0) {
        const serviceRecords = services.map((svc: any) => ({
          profileId: newProfile.id,
          serviceKey: svc.serviceKey,
          isPrimary: svc.isPrimary || false,
        }));

        await db.insert(profileServices).values(serviceRecords);
      }

      createdProfiles.push(newProfile);
    }

    res.json({ profiles: createdProfiles });
  } catch (error) {
    console.error("Error creating profiles:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid profile data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create profiles" });
  }
});

// Update Gig Pro Profile
router.patch("/giger/:id", needAuth, async (req, res) => {
  try {
    const userId = (req.session as any).uid;
    const profileId = req.params.id;
    const updates = req.body;

    // Verify ownership
    const existingProfile = await db.select().from(profiles).where(
      and(eq(profiles.id, profileId), eq(profiles.userId, userId))
    ).limit(1);

    if (existingProfile.length === 0) {
      return res.status(404).json({ error: "Profile not found or unauthorized" });
    }

    // Extract and validate profile updates (excludes userId to prevent tampering)
    const { services, ...rawProfileUpdates } = updates;
    const validatedUpdates = updateProfileSchema.parse(rawProfileUpdates);

    // Update profile with validated fields only
    const [updatedProfile] = await db.update(profiles)
      .set({ ...validatedUpdates, updatedAt: new Date() })
      .where(eq(profiles.id, profileId))
      .returning();

    // Update services if provided
    if (Array.isArray(services)) {
      // Delete existing services
      await db.delete(profileServices).where(eq(profileServices.profileId, profileId));

      // Insert new services
      if (services.length > 0) {
        const serviceRecords = services.map((svc: any) => ({
          profileId,
          serviceKey: svc.serviceKey,
          isPrimary: svc.isPrimary || false,
        }));
        await db.insert(profileServices).values(serviceRecords);
      }
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid update data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get My Gig Pro Profiles
router.get("/giger/mine", needAuth, async (req, res) => {
  try {
    const userId = (req.session as any).uid;

    const userProfiles = await db.select().from(profiles).where(eq(profiles.userId, userId));

    // Fetch services for each profile
    const profilesWithServices = await Promise.all(
      userProfiles.map(async (profile) => {
        const services = await db.select()
          .from(profileServices)
          .where(eq(profileServices.profileId, profile.id));

        return {
          ...profile,
          services,
        };
      })
    );

    res.json(profilesWithServices);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

// Get Gig Pro Profile by ID
router.get("/giger/:id", async (req, res) => {
  try {
    const profileId = req.params.id;

    const profile = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const services = await db.select()
      .from(profileServices)
      .where(eq(profileServices.profileId, profileId));

    res.json({
      ...profile[0],
      services,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
