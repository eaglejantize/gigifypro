/**
 * Calculate hot score for posts based on reaction weights
 * Formula: score = weighted_reactions / (age_hours + 2)^1.5
 * Reaction weights: LIKE=1, HELPFUL=2, INSIGHTFUL=3
 */
export function hotScore(reactions: { kind: string }[], createdAt: Date): number {
  const now = new Date();
  const ageMs = now.getTime() - createdAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  
  // Calculate weighted reaction count
  const weights: Record<string, number> = {
    'LIKE': 1,
    'HELPFUL': 2,
    'INSIGHTFUL': 3,
  };
  
  const weightedReactions = reactions.reduce((sum, r) => {
    return sum + (weights[r.kind] || 0);
  }, 0);
  
  const score = weightedReactions / Math.pow(ageHours + 2, 1.5);
  return Math.round(score * 1000) / 1000; // Round to 3 decimal places
}
