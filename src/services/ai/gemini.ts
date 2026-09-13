import "server-only";

import { getServerEnv } from "@/lib/env";
import type { Lead } from "@/types";
import { aiAnalysisSchema, type AiAnalysis } from "@/validation/analysis";
import {
  outreachEmailSchema,
  type OutreachEmail,
} from "@/validation/outreach";
import type { StoredAnalysis } from "@/services/analyses";

/**
 * Gemini-backed lead qualification.
 *
 * Runs server-side only; the API key is read from server env and never reaches
 * the browser. Uses the REST `generateContent` endpoint to avoid an extra SDK
 * dependency.
 */

export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiError";
  }
}

const MODEL = "gemini-1.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function buildPrompt(lead: Lead): string {
  const facts = [
    `Company: ${lead.company}`,
    `Industry: ${lead.industry ?? "unknown"}`,
    `Job title: ${lead.jobTitle ?? "unknown"}`,
    `Budget: ${lead.budget ?? "unknown"}`,
    `Timeline: ${lead.timeline ?? "unknown"}`,
    `Requirement: ${lead.requirement}`,
    `Pain point: ${lead.painPoint ?? "unknown"}`,
  ].join("\n");

  return [
    "You are a B2B sales lead qualification expert.",
    "Analyze the following lead and score it from 0 to 100 based on",
    "requirement clarity, budget, timeline urgency, company/industry fit,",
    "and seniority of the job title.",
    "",
    "Scoring bands: 80-100 = HOT, 60-79 = WARM, 0-59 = COLD.",
    "buying_intent and priority must each be HIGH, MEDIUM, or LOW.",
    "Provide sub-scores (0-100) for buying intent, budget fit, business fit,",
    "and urgency. Provide a recommended timeframe for the next action",
    "(e.g. 'Within 24 hours', 'This week'). In missing_information, list gaps",
    "that would improve qualification (e.g. 'Budget not confirmed',",
    "'Decision maker unknown'); use an empty array if nothing is missing.",
    "",
    "Return ONLY a JSON object (no markdown, no code fences) with exactly",
    "these keys:",
    '{"score": number, "qualification": "HOT|WARM|COLD",',
    '"buying_intent": "HIGH|MEDIUM|LOW", "reason": string,',
    '"signals": string[], "risks": string[], "missing_information": string[],',
    '"next_action": string, "priority": "HIGH|MEDIUM|LOW", "timeframe": string,',
    '"buying_intent_score": number, "budget_fit_score": number,',
    '"business_fit_score": number, "urgency_score": number}',
    "",
    "Lead:",
    facts,
  ].join("\n");
}

/** Extract the model's text output and strip any accidental code fences. */
function extractText(payload: unknown): string {
  const candidates = (payload as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  })?.candidates;
  const text = candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new AiError("The AI response was empty.");
  }
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

/**
 * Shared Gemini call: sends a prompt, returns parsed JSON text. Throws AiError
 * on any failure. `context` is used only for log labels.
 */
async function callGeminiJson(
  prompt: string,
  context: string
): Promise<unknown> {
  const { GEMINI_API_KEY } = getServerEnv();
  if (!GEMINI_API_KEY) {
    throw new AiError("The AI service is not configured.");
  }

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (error) {
    console.error(`[gemini.${context}] network error`, error);
    throw new AiError("Could not reach the AI service. Please try again.");
  }

  if (!response.ok) {
    console.error(
      `[gemini.${context}] non-OK response`,
      response.status,
      await response.text().catch(() => "")
    );
    throw new AiError("The AI service returned an error. Please try again.");
  }

  const payload = await response.json().catch(() => null);
  const rawText = extractText(payload);

  try {
    return JSON.parse(rawText);
  } catch {
    console.error(`[gemini.${context}] invalid JSON from model`, rawText);
    throw new AiError("The AI returned an unexpected response. Please retry.");
  }
}

/**
 * Analyze a lead with Gemini and return a validated qualification result.
 */
export async function qualifyLead(lead: Lead): Promise<AiAnalysis> {
  const parsedJson = await callGeminiJson(buildPrompt(lead), "qualifyLead");

  const result = aiAnalysisSchema.safeParse(parsedJson);
  if (!result.success) {
    console.error("[gemini.qualifyLead] schema validation failed", result.error);
    throw new AiError("The AI returned an unexpected response. Please retry.");
  }

  // The schema already derives a consistent qualification from the score.
  return result.data;
}

function buildEmailPrompt(lead: Lead, analysis: StoredAnalysis | null): string {
  const facts = [
    `Contact name: ${lead.name}`,
    `Company: ${lead.company}`,
    `Job title: ${lead.jobTitle ?? "unknown"}`,
    `Industry: ${lead.industry ?? "unknown"}`,
    `Requirement: ${lead.requirement}`,
    `Pain point: ${lead.painPoint ?? "unknown"}`,
    `Timeline: ${lead.timeline ?? "unknown"}`,
  ];
  if (analysis) {
    facts.push(
      `AI qualification: ${analysis.qualification} (score ${analysis.score}/100)`,
      `Buying intent: ${analysis.buyingIntent}`,
      `Recommended next action: ${analysis.nextAction || "n/a"}`
    );
    if (analysis.signals.length) {
      facts.push(`Positive signals: ${analysis.signals.join("; ")}`);
    }
  }

  return [
    "You are an expert B2B sales rep writing a concise, personalized",
    "follow-up email to a lead. Keep it professional, warm, and specific to",
    "their requirement and pain point. 120-160 words. No placeholders like",
    "[Name] — use the actual contact name. Sign off as 'The LeadIQ Team'.",
    "",
    "Return ONLY a JSON object (no markdown, no code fences) with exactly:",
    '{"subject": string, "body": string}',
    "",
    "Lead:",
    facts.join("\n"),
  ].join("\n");
}

/**
 * Generate a personalized follow-up email for a lead, informed by its latest
 * AI analysis when available. Returns a validated subject + body.
 */
export async function generateOutreachEmail(
  lead: Lead,
  analysis: StoredAnalysis | null
): Promise<OutreachEmail> {
  const parsedJson = await callGeminiJson(
    buildEmailPrompt(lead, analysis),
    "generateOutreachEmail"
  );

  const result = outreachEmailSchema.safeParse(parsedJson);
  if (!result.success) {
    console.error(
      "[gemini.generateOutreachEmail] schema validation failed",
      result.error
    );
    throw new AiError("The AI returned an unexpected response. Please retry.");
  }

  return result.data;
}
