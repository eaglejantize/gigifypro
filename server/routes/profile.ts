import { Router } from "express";
import { db } from "../db";
import { users, userBadges, badges } from "@shared/schema";
import { eq } from "drizzle-orm";
import { refreshUserBadges } from "../services/badgeService";

const router = Router();

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

export default router;
