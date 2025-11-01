import { db } from "../db";
import { profiles, reviewLikes, jobRequests, workerProfiles } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { computeCommunityScore, computeVolunteerScore } from "../lib/score-signals";

interface GigScoreComponents {
  reviewQuality: number; // 0-35 points
  completedJobs: number; // 0-22 points
  responseTime: number; // 0-12 points
  cancellations: number; // 0-10 points (penalty)
  repeatClients: number; // 0-10 points
  communityInvolvement: number; // 0-6 points
  volunteerism: number; // 0-5 points
  totalScore: number; // 0-100 points
}

export async function calculateGigScore(profileId: string): Promise<GigScoreComponents> {
  // Get user_id from profile
  const profileData = await db
    .select({ 
      userId: profiles.userId,
      avgResponseMinutes: profiles.avgResponseMinutes
    })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .then((res: any) => res[0]);

  if (!profileData) {
    throw new Error("Profile not found");
  }

  // Get worker profile ID for this user (for reviews)
  const workerProfile = await db
    .select({ id: workerProfiles.id })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, profileData.userId))
    .then((res: any) => res[0]);

  // 1. Review Quality (35 points max)
  // Average rating from reviews (1-5 stars) normalized to 0-35
  let reviewQuality = 0;
  if (workerProfile) {
    const reviewStats = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${reviewLikes.rating}), 0)`,
        reviewCount: sql<number>`COUNT(*)`,
      })
      .from(reviewLikes)
      .where(eq(reviewLikes.workerId, workerProfile.id))
      .then((res: any) => res[0] || { avgRating: 0, reviewCount: 0 });

    reviewQuality = reviewStats.avgRating
      ? Math.min(35, (reviewStats.avgRating / 5) * 35)
      : 0;
  }

  // 2. Completed Jobs (22 points max)
  // Logarithmic scale: log10(jobs + 1) / log10(100) * 22
  // 0 jobs = 0 points, 10 jobs = ~11 points, 100 jobs = 22 points
  const completedJobsCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(jobRequests)
    .where(eq(jobRequests.profileId, profileId))
    .then((res: any) => res[0]?.count || 0);

  const completedJobs = Math.min(
    22,
    (Math.log10(Number(completedJobsCount) + 1) / Math.log10(100)) * 22
  );

  // 3. Response Time (12 points max)
  // Faster response = more points
  // 0-15 min = 12 points, 16-30 min = 9 points, 31-60 min = 6 points, 60+ min = 3 points
  const avgResponseMinutes = profileData.avgResponseMinutes || 60;
  let responseTime = 0;
  if (avgResponseMinutes <= 15) {
    responseTime = 12;
  } else if (avgResponseMinutes <= 30) {
    responseTime = 9;
  } else if (avgResponseMinutes <= 60) {
    responseTime = 6;
  } else if (avgResponseMinutes <= 120) {
    responseTime = 4;
  } else {
    responseTime = 2;
  }

  // 4. Cancellations (10 points max)
  // For now, give full points since we don't track cancellations in job_requests
  // This can be updated when we add a status field
  const cancellations = 10;

  // 5. Repeat Clients (10 points max)
  // Percentage of clients who booked more than once
  const repeatClientStats = await db.execute<{
    total_clients: string;
    repeat_clients: string;
  }>(sql`
    SELECT 
      COUNT(DISTINCT client_id) as total_clients,
      COUNT(DISTINCT CASE 
        WHEN booking_count > 1 THEN client_id 
      END) as repeat_clients
    FROM (
      SELECT client_id, COUNT(*) as booking_count
      FROM job_requests
      WHERE profile_id = ${profileId}
      GROUP BY client_id
    ) as client_bookings
  `);

  const totalClients = Number(repeatClientStats.rows[0]?.total_clients || 0);
  const repeatClientsCount = Number(repeatClientStats.rows[0]?.repeat_clients || 0);
  const repeatClientRate = totalClients > 0 ? repeatClientsCount / totalClients : 0;

  const repeatClients = Math.min(10, repeatClientRate * 10);

  // 6. Community Involvement (6 points max)
  // G-Square activity & helpfulness normalized from 0-100 to 0-6
  const communityScoreRaw = await computeCommunityScore(profileData.userId);
  const communityInvolvement = (communityScoreRaw / 100) * 6;

  // 7. Volunteerism (5 points max)
  // Approved donated services normalized from 0-100 to 0-5
  const volunteerScoreRaw = await computeVolunteerScore(profileData.userId);
  const volunteerism = (volunteerScoreRaw / 100) * 5;

  // Calculate total score (sum of all weighted components)
  const totalScore = Math.round(
    reviewQuality + completedJobs + responseTime + cancellations + repeatClients + communityInvolvement + volunteerism
  );

  return {
    reviewQuality: Math.round(reviewQuality * 100) / 100,
    completedJobs: Math.round(completedJobs * 100) / 100,
    responseTime: Math.round(responseTime * 100) / 100,
    cancellations: Math.round(cancellations * 100) / 100,
    repeatClients: Math.round(repeatClients * 100) / 100,
    communityInvolvement: Math.round(communityInvolvement * 100) / 100,
    volunteerism: Math.round(volunteerism * 100) / 100,
    totalScore,
  };
}

export async function updateGigScore(profileId: string): Promise<number> {
  const scoreComponents = await calculateGigScore(profileId);

  await db
    .update(profiles)
    .set({
      gigScore: scoreComponents.totalScore.toString(),
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId));

  return scoreComponents.totalScore;
}
