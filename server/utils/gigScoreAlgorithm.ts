/**
 * GigifyPro Score Algorithm
 * 
 * Calculates a worker's overall score based on multiple weighted factors:
 * - Review Quality (40%): Average rating normalized to 0-100
 * - Completed Jobs (25%): Exponential curve, diminishing returns after 50 jobs
 * - Response Time (15%): Inverse relationship, faster = better
 * - Cancellations (10%): Penalty for high cancellation rate
 * - Repeat Clients (10%): Bonus for client retention
 */

export interface GigScoreFactors {
  avgRating: number;          // 0-5
  reviewCount: number;        // Total number of reviews
  completedJobs: number;      // Total completed bookings
  responseTimeMinutes: number; // Average response time
  cancelledJobs: number;      // Total cancelled bookings
  repeatClients: number;      // Number of returning clients
}

export function calculateGigScore(factors: GigScoreFactors): number {
  const {
    avgRating,
    reviewCount,
    completedJobs,
    responseTimeMinutes,
    cancelledJobs,
    repeatClients,
  } = factors;

  // 1. Review Quality Score (40%)
  // Normalize rating to 0-100 scale, with diminishing returns for low review counts
  const reviewConfidence = Math.min(reviewCount / 10, 1); // Full confidence after 10 reviews
  const reviewScore = (avgRating / 5) * 100 * reviewConfidence;

  // 2. Completed Jobs Score (25%)
  // Exponential curve with diminishing returns after 50 jobs
  const jobsScore = Math.min(100, (Math.log(completedJobs + 1) / Math.log(51)) * 100);

  // 3. Response Time Score (15%)
  // Inverse relationship: lower response time = higher score
  // Perfect score at <= 15 mins, declining to 0 at 240+ mins
  const responseScore = Math.max(0, 100 - (responseTimeMinutes / 240) * 100);

  // 4. Cancellation Penalty (10%)
  // Calculate cancellation rate and invert (lower cancellations = higher score)
  const totalJobs = completedJobs + cancelledJobs;
  const cancellationRate = totalJobs > 0 ? cancelledJobs / totalJobs : 0;
  const cancellationScore = Math.max(0, 100 - (cancellationRate * 200)); // Double penalty

  // 5. Repeat Clients Score (10%)
  // Bonus for client retention, capped at 100
  const repeatScore = Math.min(100, (repeatClients / Math.max(completedJobs, 1)) * 100);

  // Calculate weighted average
  const gigScore = (
    (reviewScore * 0.40) +
    (jobsScore * 0.25) +
    (responseScore * 0.15) +
    (cancellationScore * 0.10) +
    (repeatScore * 0.10)
  );

  // Return score rounded to 1 decimal place
  return Math.round(gigScore * 10) / 10;
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
}): number {
  return calculateGigScore({
    avgRating: worker.avgRating || 0,
    reviewCount: worker.reviewCount || 0,
    completedJobs: worker.completedJobs || 0,
    responseTimeMinutes: worker.responseTimeMinutes || 60,
    cancelledJobs: worker.cancelledJobs || 0,
    repeatClients: worker.repeatClients || 0,
  });
}
