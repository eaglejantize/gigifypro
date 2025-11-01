import { db } from "../db";
import { communityStats, volunteerServices, profiles } from "@shared/schema";
import { eq, and, gte, inArray, sql, or } from "drizzle-orm";

/**
 * Compute Community Score (0-100) based on last 90 days of G-Square activity
 * 
 * Point model:
 * - 3 points per helpful reaction
 * - 2 points per post created
 * - 1 point per comment
 * - 4 points per accepted answer
 * 
 * ~60 points normalized to 100 score
 */
export async function computeCommunityScore(userId: string): Promise<number> {
  const stat = await db
    .select()
    .from(communityStats)
    .where(eq(communityStats.userId, userId))
    .then(res => res[0]);

  if (!stat) return 0;

  // Simple point model; cap for stability
  const points =
    3 * stat.helpfulReacts +
    2 * stat.posts +
    1 * stat.comments +
    4 * stat.acceptedAnswers;

  // Non-linear scale with cap ~100
  // ~60 points → 100 score
  const score = Math.min(100, Math.round((points / 60) * 100));
  return score;
}

/**
 * Compute Volunteer Score (0-100) from approved/completed entries in last 12 months
 * 
 * Scoring model:
 * - 5 points per hour (up to 12 hours = 60 base points)
 * - Rating bonus: (avgRating - 3) * 10, up to +20 for 5-star avg
 */
export async function computeVolunteerScore(userId: string): Promise<number> {
  // Get profiles for this user
  const userProfiles = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId));

  if (userProfiles.length === 0) return 0;

  const profileIds = userProfiles.map(p => p.id);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Get approved/completed volunteer entries from last 12 months
  // Use completedAt if available (for completed entries), otherwise createdAt (for approved entries)
  const entries = await db
    .select()
    .from(volunteerServices)
    .where(
      and(
        inArray(volunteerServices.profileId, profileIds),
        inArray(volunteerServices.status, ["approved", "completed"]),
        or(
          and(
            sql`${volunteerServices.completedAt} IS NOT NULL`,
            gte(volunteerServices.completedAt, oneYearAgo)
          ),
          and(
            sql`${volunteerServices.completedAt} IS NULL`,
            gte(volunteerServices.createdAt, oneYearAgo)
          )
        )
      )
    );

  if (entries.length === 0) return 0;

  let totalHours = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const entry of entries) {
    totalHours += Number(entry.hours || 0);
    if (entry.rating) {
      ratingSum += entry.rating;
      ratingCount++;
    }
  }

  const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 5;

  // 5 pts per hour (up to 12 hrs = 60 max base)
  const baseScore = Math.min(60, totalHours * 5);
  
  // Rating bonus: up to +20 if ~5★
  const ratingBonus = Math.max(0, (avgRating - 3) * 10);
  
  const totalScore = Math.min(100, Math.round(baseScore + ratingBonus));
  
  return totalScore;
}

export default { computeCommunityScore, computeVolunteerScore };
