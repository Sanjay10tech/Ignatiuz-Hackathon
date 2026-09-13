import { z } from "zod";

/**
 * Validation for the AI-generated follow-up email. Lenient like the analysis
 * schema: tolerates imperfect model output and supplies safe fallbacks so a
 * usable-but-imperfect response is accepted rather than discarded.
 */

const textWithFallback = (max: number, fallback: string) =>
  z
    .any()
    .transform((v) => (typeof v === "string" ? v.trim() : ""))
    .transform((v) => (v ? v.slice(0, max) : fallback));

export const outreachEmailSchema = z.object({
  subject: textWithFallback(200, "Following up on your requirement"),
  body: textWithFallback(4000, "Hi,\n\nThanks for your interest. Let's connect.\n\nBest regards"),
});

export type OutreachEmail = z.infer<typeof outreachEmailSchema>;
