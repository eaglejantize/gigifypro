import { Router } from "express";
import { db } from "../db";
import { communityStats, volunteerServices, profiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import { computeCommunityScore, computeVolunteerScore } from "../lib/score-signals";
import { calculateGigScore } from "../services/gigScoreService";
import type { Request, Response, NextFunction } from "express";

const router = Router();

// Middleware to require authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const uid = (req.session as any)?.uid;
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// 1) Upsert community stat (called by G-Square actions or admin seeder)
router.post("/community", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).uid as string;
    const { posts = 0, comments = 0, helpfulReacts = 0, acceptedAnswers = 0 } = req.body || {};

    // Check if stat exists
    const existing = await db
      .select()
      .from(communityStats)
      .where(eq(communityStats.userId, userId))
      .then(res => res[0]);

    let row;
    if (existing) {
      // Update incrementally
      row = await db
        .update(communityStats)
        .set({
          posts: existing.posts + posts,
          comments: existing.comments + comments,
          helpfulReacts: existing.helpfulReacts + helpfulReacts,
          acceptedAnswers: existing.acceptedAnswers + acceptedAnswers,
          lastComputedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(communityStats.userId, userId))
        .returning()
        .then(res => res[0]);
    } else {
      // Create new
      row = await db
        .insert(communityStats)
        .values({
          userId,
          posts,
          comments,
          helpfulReacts,
          acceptedAnswers,
        })
        .returning()
        .then(res => res[0]);
    }

    res.json(row);
  } catch (error: any) {
    console.error("Error upserting community stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2) Create a volunteer entry (admin can approve later)
router.post("/volunteer", requireAuth, async (req: Request, res: Response) => {
  try {
    const { profileId, title, description, hours = 0, valueCents = 0 } = req.body || {};
    
    if (!profileId) {
      return res.status(400).json({ error: "profileId required" });
    }

    // Verify the profile belongs to the current user
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .then(res => res[0]);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (profile.userId !== (req.session as any).uid) {
      return res.status(403).json({ error: "Access denied" });
    }

    const volunteer = await db
      .insert(volunteerServices)
      .values({
        profileId,
        title,
        description,
        hours: hours.toString(),
        valueCents,
        status: "pending",
      })
      .returning()
      .then(res => res[0]);

    res.json(volunteer);
  } catch (error: any) {
    console.error("Error creating volunteer entry:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3) Admin approve/complete volunteer entries
router.patch("/volunteer/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, rating, verifiedBy } = req.body || {};

    const updates: any = { updatedAt: new Date() };
    
    if (status) {
      updates.status = status;
      if (status === "completed") {
        updates.completedAt = new Date();
      }
    }
    
    if (rating !== undefined) {
      updates.rating = rating;
    }
    
    if (verifiedBy) {
      updates.verifiedBy = verifiedBy;
    }

    const volunteer = await db
      .update(volunteerServices)
      .set(updates)
      .where(eq(volunteerServices.id, id))
      .returning()
      .then(res => res[0]);

    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer service not found" });
    }

    res.json(volunteer);
  } catch (error: any) {
    console.error("Error updating volunteer entry:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4) Get GigScore preview for current user
router.get("/preview/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).uid as string;

    // Get user's first profile for full calculation
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .then(res => res[0]);

    if (!userProfile) {
      return res.json({
        error: "No profile found. Create a Giger profile first.",
        gigScore: 0,
      });
    }

    // Calculate full score using the service
    const scoreComponents = await calculateGigScore(userProfile.id);
    
    // Get raw scores for display
    const communityScore = await computeCommunityScore(userId);
    const volunteerScore = await computeVolunteerScore(userId);

    res.json({
      ...scoreComponents,
      communityScoreRaw: communityScore,
      volunteerScoreRaw: volunteerScore,
    });
  } catch (error: any) {
    console.error("Error calculating GigScore preview:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5) Get community stats for current user
router.get("/community/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).uid as string;
    
    const stats = await db
      .select()
      .from(communityStats)
      .where(eq(communityStats.userId, userId))
      .then(res => res[0]);

    if (!stats) {
      return res.json({ posts: 0, comments: 0, helpfulReacts: 0, acceptedAnswers: 0 });
    }

    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching community stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6) Get volunteer services for current user
router.get("/volunteer/list", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).uid as string;

    // Get user's profiles
    const userProfiles = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (userProfiles.length === 0) {
      return res.json([]);
    }

    const profileIds = userProfiles.map(p => p.id);

    // Get volunteer services for these profiles
    const services = await db
      .select()
      .from(volunteerServices)
      .where(eq(volunteerServices.profileId, profileIds[0])); // Simplified for now

    res.json(services);
  } catch (error: any) {
    console.error("Error fetching volunteer services:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
