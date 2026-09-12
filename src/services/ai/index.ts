import type { AiQualificationProvider } from "./types";

/**
 * AI service accessor.
 *
 * The concrete Gemini-backed provider is implemented in a later phase and will
 * run server-side only (the API key must never reach the browser). For now
 * this returns a boundary that signals the feature is not configured, keeping
 * a single integration point for the rest of the app.
 */

const NOT_IMPLEMENTED =
  "AI qualification is not configured yet. This will be implemented in a later phase.";

export function getAiProvider(): AiQualificationProvider {
  return {
    async qualifyLead() {
      throw new Error(NOT_IMPLEMENTED);
    },
    async generateOutreach() {
      throw new Error(NOT_IMPLEMENTED);
    },
  };
}

export type {
  AiQualificationProvider,
  QualificationResult,
  QualificationSignal,
  OutreachDraft,
} from "./types";
