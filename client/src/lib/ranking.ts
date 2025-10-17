/**
 * Worker ranking algorithm for gigifypro
 * Formula: score = LIKE_WEIGHT×likes + RATING_WEIGHT×avg_rating×√reviews + recency_decay + response_bonus
 */

const LIKE_WEIGHT = 1.0;
const RATING_WEIGHT = 2.5;
const RECENCY_DECAY = 0.85; // Per week
const RESPONSE_BONUS_MAX = 5.0;

export interface WorkerMetrics {
  workerId: string;
  likeCount: number;
  avgRating: number;
  reviewCount: number;
  lastActivityDate: Date;
  responseTimeMinutes: number;
}

export interface RankedWorker extends WorkerMetrics {
  score: number;
  breakdown: {
    likeScore: number;
    ratingScore: number;
    recencyScore: number;
    responseScore: number;
  };
}

/**
 * Calculate worker ranking score
 */
export function calculateWorkerScore(metrics: WorkerMetrics): RankedWorker {
  // Like score
  const likeScore = LIKE_WEIGHT * metrics.likeCount;

  // Rating score (weighted by square root of review count for diminishing returns)
  const ratingScore = metrics.reviewCount > 0
    ? RATING_WEIGHT * metrics.avgRating * Math.sqrt(metrics.reviewCount)
    : 0;

  // Recency decay (based on weeks since last activity)
  const weeksAgo = Math.floor(
    (Date.now() - metrics.lastActivityDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const recencyScore = Math.pow(RECENCY_DECAY, weeksAgo);

  // Response time bonus (faster response = higher bonus)
  // 0-15 min: +5, 15-30 min: +4, 30-60 min: +3, 60-120 min: +2, 120+ min: +1
  let responseScore = 0;
  if (metrics.responseTimeMinutes <= 15) responseScore = 5;
  else if (metrics.responseTimeMinutes <= 30) responseScore = 4;
  else if (metrics.responseTimeMinutes <= 60) responseScore = 3;
  else if (metrics.responseTimeMinutes <= 120) responseScore = 2;
  else responseScore = 1;

  // Calculate total score
  const score = (likeScore + ratingScore) * recencyScore + responseScore;

  return {
    ...metrics,
    score,
    breakdown: {
      likeScore,
      ratingScore,
      recencyScore,
      responseScore,
    },
  };
}

/**
 * Rank multiple workers
 */
export function rankWorkers(workerMetrics: WorkerMetrics[]): RankedWorker[] {
  return workerMetrics
    .map(calculateWorkerScore)
    .sort((a, b) => b.score - a.score);
}

/**
 * Get badge based on score
 */
export function getWorkerBadge(score: number): {
  label: string;
  variant: "default" | "secondary" | "outline";
} {
  if (score >= 50) return { label: "Top Rated", variant: "default" };
  if (score >= 30) return { label: "Excellent", variant: "secondary" };
  if (score >= 15) return { label: "Great", variant: "outline" };
  return { label: "New", variant: "outline" };
}
