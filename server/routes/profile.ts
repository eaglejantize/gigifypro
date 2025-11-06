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

// Get Available Gigers by Service
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

    // Get ratings stats for each giger (use workerProfiles for backward compat)
    const gigersWithStats = await Promise.all(
      gigersWithService.map(async (giger) => {
        // Get review count and average rating
        const reviewStats = await db
          .select({
            count: drizzleSql<number>`count(*)::int`,
            avgRating: drizzleSql<number>`COALESCE(avg(${reviewLikes.rating}), 0)`,
            likeCount: drizzleSql<number>`count(${reviewLikes.id})::int`,
          })
          .from(reviewLikes)
          .innerJoin(workerProfiles, eq(reviewLikes.workerId, workerProfiles.id))
          .where(eq(workerProfiles.userId, giger.user.id));

        const stats = reviewStats[0] || { count: 0, avgRating: 0, likeCount: 0 };

        return {
          profileId: giger.profile.id,
          profileName: giger.profile.name,
          tagline: giger.profile.tagline,
          bio: giger.profile.bio,
          mainNiche: giger.profile.mainNiche,
          city: giger.profile.city,
          state: giger.profile.state,
          rateCents: giger.profile.rateCents,
          pricingModel: giger.profile.pricingModel,
          userId: giger.user.id,
          userName: giger.user.name,
          avatar: giger.user.avatar,
          reviewCount: stats.count,
          avgRating: parseFloat(stats.avgRating?.toString() || "0"),
          likeCount: stats.likeCount,
          isPrimaryService: giger.isPrimary,
        };
      })
    );

    res.json(gigersWithStats);
  } catch (error) {
    console.error("Error fetching gigers by service:", error);
    res.status(500).json({ error: "Failed to fetch gigers" });
  }
});

// Create Giger Profile(s)
// NOTE: Neon HTTP driver doesn't support transactions - race conditions possible under high concurrency
// In production, add a database constraint or use Neon WebSocket driver
router.post("/giger/create", needAuth, async (req, res) => {
  try {
    const userId = (req.session as any).uid;
    const { profiles: profilesData } = req.body;

    if (!Array.isArray(profilesData) || profilesData.length === 0) {
      return res.status(400).json({ error: "Profiles array required" });
    }

    // Check user doesn't exceed 3 profiles
    const existingProfiles = await db.select().from(profiles).where(eq(profiles.userId, userId));
    if (existingProfiles.length + profilesData.length > 3) {
      return res.status(400).json({ error: "Maximum 3 profiles allowed per user" });
    }

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

// Update Giger Profile
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

// Get My Giger Profiles
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

// Get Giger Profile by ID
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
