/**
 * GigifyPro Score Algorithm
 * 
 * Calculates a worker's overall score based on multiple weighted factors:
 * - Review Quality (35%): Average rating normalized to 0-100
 * - Completed Jobs (22%): Exponential curve, diminishing returns after 50 jobs
 * - Response Time (12%): Inverse relationship, faster = better
 * - Cancellations (−10%): Penalty for high cancellation rate
 * - Repeat Clients (10%): Bonus for client retention
 * - Community Involvement (6%): G-Square activity & helpfulness
 * - Volunteerism (5%): Approved donated services
 */

export interface GigScoreFactors {
  avgRating: number;          // 0-5
  reviewCount: number;        // Total number of reviews
  completedJobs: number;      // Total completed bookings
  responseTimeMinutes: number; // Average response time
  cancelledJobs: number;      // Total cancelled bookings
  repeatClients: number;      // Number of returning clients
  communityScore?: number;    // 0-100 (optional)
  volunteerScore?: number;    // 0-100 (optional)
}

export function calculateGigScore(factors: GigScoreFactors): number {
  const {
    avgRating,
    reviewCount,
    completedJobs,
    responseTimeMinutes,
    cancelledJobs,
    repeatClients,
    communityScore = 0,
    volunteerScore = 0,
  } = factors;

  // 1. Review Quality Score (35%)
  // Normalize rating to 0-100 scale, with diminishing returns for low review counts
  const reviewConfidence = Math.min(reviewCount / 10, 1); // Full confidence after 10 reviews
  const reviewScore = (avgRating / 5) * 100 * reviewConfidence;

  // 2. Completed Jobs Score (22%)
  // Exponential curve with diminishing returns after 50 jobs
  const jobsScore = Math.min(100, (Math.log(completedJobs + 1) / Math.log(51)) * 100);

  // 3. Response Time Score (12%)
  // Inverse relationship: lower response time = higher score
  // Perfect score at <= 15 mins, declining to 0 at 240+ mins
  const responseScore = Math.max(0, 100 - (responseTimeMinutes / 240) * 100);

  // 4. Cancellation Penalty (−10%)
  // Calculate cancellation rate and invert (lower cancellations = higher score)
  const totalJobs = completedJobs + cancelledJobs;
  const cancellationRate = totalJobs > 0 ? cancelledJobs / totalJobs : 0;
  const cancellationPenalty = Math.max(0, (cancellationRate * 200)); // Double penalty

  // 5. Repeat Clients Score (10%)
  // Bonus for client retention, capped at 100
  const repeatScore = Math.min(100, (repeatClients / Math.max(completedJobs, 1)) * 100);

  // 6. Community Involvement Score (6%)
  // Already normalized to 0-100 by computeCommunityScore

  // 7. Volunteerism Score (5%)
  // Already normalized to 0-100 by computeVolunteerScore

  // Calculate weighted average
  const gigScore = (
    (reviewScore * 0.35) +
    (jobsScore * 0.22) +
    (responseScore * 0.12) +
    (repeatScore * 0.10) +
    -(cancellationPenalty * 0.10) +
    (communityScore * 0.06) +
    (volunteerScore * 0.05)
  );

  // Clamp to 0-100 and return rounded to 1 decimal place
  const clamped = Math.max(0, Math.min(100, gigScore));
  return Math.round(clamped * 10) / 10;
}

/**
 * Calculate GigScore from a worker profile with review data
 */
export function calculateWorkerGigScore(worker: {
  avgRating?: number | null;
  reviewCount?: number;
  completedJobs?: number;
  responseTimeMinutes?: number | null;
  cancelledJobs?: number;
  repeatClients?: number;
  communityScore?: number;
  volunteerScore?: number;
}): number {
  return calculateGigScore({
    avgRating: worker.avgRating || 0,
    reviewCount: worker.reviewCount || 0,
    completedJobs: worker.completedJobs || 0,
    responseTimeMinutes: worker.responseTimeMinutes || 60,
    cancelledJobs: worker.cancelledJobs || 0,
    repeatClients: worker.repeatClients || 0,
    communityScore: worker.communityScore || 0,
    volunteerScore: worker.volunteerScore || 0,
  });
}
