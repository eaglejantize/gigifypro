import { db } from "../db";
import { profiles, reviewLikes, jobRequests } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

interface GigScoreComponents {
  reviewQuality: number; // 0-40 points
  completedJobs: number; // 0-25 points
  responseTime: number; // 0-15 points
  cancellations: number; // 0-10 points
  repeatClients: number; // 0-10 points
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

  // 1. Review Quality (40 points max)
  // Average rating from reviews (1-5 stars) normalized to 0-40
  const reviewStats = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${reviewLikes.rating}), 0)`,
      reviewCount: sql<number>`COUNT(*)`,
    })
    .from(reviewLikes)
    .where(eq(reviewLikes.workerId, profileData.userId))
    .then((res: any) => res[0]);

  const reviewQuality = reviewStats.avgRating
    ? Math.min(40, (reviewStats.avgRating / 5) * 40)
    : 0;

  // 2. Completed Jobs (25 points max)
  // Logarithmic scale: log10(jobs + 1) / log10(100) * 25
  // 0 jobs = 0 points, 10 jobs = ~12.5 points, 100 jobs = 25 points
  const completedJobsCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(jobRequests)
    .where(eq(jobRequests.profileId, profileId))
    .then((res: any) => res[0]?.count || 0);

  const completedJobs = Math.min(
    25,
    (Math.log10(Number(completedJobsCount) + 1) / Math.log10(100)) * 25
  );

  // 3. Response Time (15 points max)
  // Faster response = more points
  // 0-15 min = 15 points, 16-30 min = 12 points, 31-60 min = 8 points, 60+ min = 3 points
  const avgResponseMinutes = profileData.avgResponseMinutes || 60;
  let responseTime = 0;
  if (avgResponseMinutes <= 15) {
    responseTime = 15;
  } else if (avgResponseMinutes <= 30) {
    responseTime = 12;
  } else if (avgResponseMinutes <= 60) {
    responseTime = 8;
  } else if (avgResponseMinutes <= 120) {
    responseTime = 5;
  } else {
    responseTime = 3;
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

  // Calculate total score
  const totalScore = Math.round(
    reviewQuality + completedJobs + responseTime + cancellations + repeatClients
  );

  return {
    reviewQuality: Math.round(reviewQuality * 100) / 100,
    completedJobs: Math.round(completedJobs * 100) / 100,
    responseTime: Math.round(responseTime * 100) / 100,
    cancellations: Math.round(cancellations * 100) / 100,
    repeatClients: Math.round(repeatClients * 100) / 100,
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
