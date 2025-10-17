/**
 * Pricing calculator for gigifypro
 * Default anchor: $25 per 30 minutes
 */

export interface PricingQuote {
  duration: number;
  baseRate: number;
  total: number;
  breakdown: string;
}

/**
 * Calculate price based on duration in minutes
 * @param durationMinutes - Duration in minutes
 * @param baseAnchor - Base rate per 30 minutes (default $25)
 * @returns Pricing quote with breakdown
 */
export function calculatePrice(
  durationMinutes: number,
  baseAnchor: number = 25
): PricingQuote {
  // Calculate number of 30-minute blocks (ceiling)
  const blocks = Math.ceil(durationMinutes / 30);
  const total = blocks * baseAnchor;

  const breakdown = blocks === 1
    ? `${durationMinutes} min (1 × $${baseAnchor})`
    : `${durationMinutes} min (${blocks} × $${baseAnchor})`;

  return {
    duration: durationMinutes,
    baseRate: baseAnchor,
    total,
    breakdown,
  };
}

/**
 * Get price display string
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate custom hourly rate equivalent
 */
export function calculateHourlyRate(rate30min: number): number {
  return rate30min * 2;
}

/**
 * Get duration options for UI
 */
export const durationOptions = [
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 },
  { label: "4 hours", value: 240 },
];
