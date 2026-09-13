import { z } from "zod";

/**
 * Validation for the AI qualification response.
 *
 * The model is instructed to return an exact shape, but LLM output can be
 * imperfect (empty strings, missing fields, lowercase enums, out-of-range
 * numbers). This schema is intentionally lenient: it coerces and clamps values
 * and supplies safe fallbacks so a sparse-but-usable response is accepted
 * rather than discarded. Anything genuinely unusable still fails.
 */

export const qualificationEnum = z.enum(["HOT", "WARM", "COLD"]);
export const levelEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

/** 0–100 integer, coerced from strings/floats and clamped into range. */
const subScore = z
  .coerce.number()
  .transform((n) => {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  });

/** Normalize a level enum, tolerating case and unknown values. */
const level = z
  .any()
  .transform((v) => (typeof v === "string" ? v.trim().toUpperCase() : ""))
  .transform((v): "HIGH" | "MEDIUM" | "LOW" =>
    v === "HIGH" || v === "MEDIUM" || v === "LOW" ? v : "MEDIUM"
  );

/** Required-ish string with a fallback so empty output doesn't crash saving. */
const textWithFallback = (max: number, fallback: string) =>
  z
    .any()
    .transform((v) => (typeof v === "string" ? v.trim() : ""))
    .transform((v) => (v ? v.slice(0, max) : fallback));

/** Array of non-empty strings; empties are filtered, not rejected. */
const stringList = (maxLen: number, maxItems: number) =>
  z
    .any()
    .transform((v) => (Array.isArray(v) ? v : []))
    .transform((arr) =>
      arr
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => x.trim().slice(0, maxLen))
        .slice(0, maxItems)
    );

export const aiAnalysisSchema = z
  .object({
    score: subScore,
    qualification: z.any(),
    buying_intent: level,
    reason: textWithFallback(2000, "No detailed reasoning was provided."),
    signals: stringList(300, 10),
    risks: stringList(300, 10),
    missing_information: stringList(300, 10),
    next_action: textWithFallback(500, "Follow up with the lead."),
    priority: level,
    timeframe: textWithFallback(120, "This week"),
    buying_intent_score: subScore,
    budget_fit_score: subScore,
    business_fit_score: subScore,
    urgency_score: subScore,
  })
  .transform((data) => ({
    ...data,
    // Derive qualification from score so it's always consistent, regardless of
    // what the model returned for `qualification`.
    qualification: qualificationFromScore(data.score),
  }));

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;

/** Map a score to its qualification band (single source of truth). */
export function qualificationFromScore(
  score: number
): "HOT" | "WARM" | "COLD" {
  if (score >= 80) return "HOT";
  if (score >= 60) return "WARM";
  return "COLD";
}
