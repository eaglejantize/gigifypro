export function hotScore(upvotes: number, ageHours: number): number {
  // Simple "hot" rank: weighted by time decay
  return Math.round(upvotes * 1000 / Math.pow(1 + ageHours, 1.5));
}
