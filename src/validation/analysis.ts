import { z } from "zod";

/**
 * Validation for the AI qualification response. The model is instructed to
 * return exactly this shape; we validate before trusting or persisting it.
 */

export const qualificationEnum = z.enum(["HOT", "WARM", "COLD"]);
export const levelEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

const subScore = z.number().int().min(0).max(100);

export const aiAnalysisSchema = z.object({
  score: z.number().int().min(0).max(100),
  qualification: qualificationEnum,
  buying_intent: levelEnum,
  reason: z.string().min(1).max(2000),
  signals: z.array(z.string().min(1).max(300)).max(10).default([]),
  risks: z.array(z.string().min(1).max(300)).max(10).default([]),
  missing_information: z.array(z.string().min(1).max(300)).max(10).default([]),
  next_action: z.string().min(1).max(500),
  priority: levelEnum,
  timeframe: z.string().min(1).max(120),
  // Explainability sub-scores, each 0–100.
  buying_intent_score: subScore,
  budget_fit_score: subScore,
  business_fit_score: subScore,
  urgency_score: subScore,
});

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;

/** Map a score to its qualification band (single source of truth). */
export function qualificationFromScore(score: number): AiAnalysis["qualification"] {
  if (score >= 80) return "HOT";
  if (score >= 60) return "WARM";
  return "COLD";
}
