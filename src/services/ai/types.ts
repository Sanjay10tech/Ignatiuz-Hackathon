import type { LeadTemperature } from "@/types";

/**
 * Contract for AI-driven lead qualification. This is the stable boundary the
 * rest of the app depends on, so the underlying provider can be implemented
 * and swapped later without touching UI or business code.
 */

export interface QualificationSignal {
  label: string;
  detail: string;
}

export interface QualificationResult {
  /** Explainable score, 0–100. */
  score: number;
  temperature: LeadTemperature;
  summary: string;
  buyingIntent: string[];
  positiveSignals: QualificationSignal[];
  risks: QualificationSignal[];
  missingInformation: string[];
  nextBestAction: string;
}

export interface OutreachDraft {
  subject: string;
  body: string;
}

export interface AiQualificationProvider {
  /** Analyze a lead and return an explainable qualification result. */
  qualifyLead(input: unknown): Promise<QualificationResult>;
  /** Generate a personalized outreach draft for a lead. */
  generateOutreach(input: unknown): Promise<OutreachDraft>;
}
