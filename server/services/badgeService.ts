import { db } from "../db";
import { users, userBadges, badges, trainingProgress } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export async function refreshUserBadges(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      badges: {
        with: {
          badge: true,
        },
      },
      trainingProgress: true,
    },
  });

  if (!user) return { awarded: [] };

  // Get all available badges
  const allBadges = await db.query.badges.findMany();
  const badgeMap = new Map(allBadges.map(b => [b.type, b]));
  
  // Track which badges the user already has
  const haveBadgeTypes = new Set(user.badges.map(ub => ub.badge.type));
  const toAward: string[] = [];

  // Safety Verified - awarded for completing safety_compliance section
  const safetyArticlesCompleted = user.trainingProgress.filter(
    tp => tp.completed
  ).length;
  
  if (safetyArticlesCompleted >= 2 && !haveBadgeTypes.has("safety_verified")) {
    toAward.push("safety_verified");
  }

  // Business Ready - awarded for completing at least 3 training modules
  const totalCompleted = user.trainingProgress.filter(tp => tp.completed).length;
  if (totalCompleted >= 3 && !haveBadgeTypes.has("business_ready")) {
    toAward.push("business_ready");
  }

  // Verified Identity - placeholder for future background check integration
  if (user.role === "worker" && !haveBadgeTypes.has("verified_identity")) {
    // Auto-award for now, would integrate with background check API
    toAward.push("verified_identity");
  }

  // Award new badges
  for (const badgeType of toAward) {
    const badge = badgeMap.get(badgeType as any);
    if (badge) {
      try {
        await db.insert(userBadges).values({
          userId: user.id,
          badgeId: badge.id,
        }).onConflictDoNothing();
      } catch (error) {
        console.error(`Error awarding badge ${badgeType}:`, error);
      }
    }
  }

  return { awarded: toAward };
}
