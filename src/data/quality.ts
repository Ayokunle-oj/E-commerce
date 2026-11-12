// Quality score to colour step, in steps of 20 points
export type QualityTier = "very-low" | "low" | "fair" | "good" | "high";

export const clampScore = (quality: number) =>
  Math.min(100, Math.max(0, Math.round(quality)));

export function qualityTier(score: number): QualityTier {
  if (score < 20) return "very-low";
  if (score < 40) return "low";
  if (score < 60) return "fair";
  if (score < 80) return "good";
  return "high";
}
