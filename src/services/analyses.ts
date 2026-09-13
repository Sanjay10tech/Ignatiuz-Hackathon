import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AiAnalysis } from "@/validation/analysis";

/**
 * Persistence for AI analyses and their recommended actions.
 *
 * All access is scoped to leads owned by the authenticated user (enforced by
 * RLS and by an explicit ownership check here). Raw DB errors are logged and
 * never surfaced to callers.
 */

export class AnalysisServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisServiceError";
  }
}

const NOT_CONFIGURED = "The backend is not configured.";
const NOT_AUTHENTICATED = "You must be signed in to perform this action.";
const NOT_FOUND = "Lead not found.";
const GENERIC_FAILURE = "Something went wrong. Please try again.";

/** Shape returned to the UI for displaying a saved analysis. */
export interface StoredAnalysis {
  score: number;
  qualification: "HOT" | "WARM" | "COLD";
  buyingIntent: string;
  reason: string;
  signals: string[];
  risks: string[];
  missingInformation: string[];
  nextAction: string;
  priority: string;
  timeframe: string | null;
  buyingIntentScore: number | null;
  budgetFitScore: number | null;
  businessFitScore: number | null;
  urgencyScore: number | null;
  createdAt: string;
}

async function getContext() {
  const supabase = createClient();
  if (!supabase) throw new AnalysisServiceError(NOT_CONFIGURED);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AnalysisServiceError(NOT_AUTHENTICATED);
  return { supabase, userId: user.id };
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export const analysesService = {
  /**
   * Persist an AI analysis: writes the analysis row, the recommended action,
   * and flips the lead status to "analyzed". Verifies lead ownership first.
   */
  async saveAnalysis(leadId: string, analysis: AiAnalysis): Promise<void> {
    const { supabase, userId } = await getContext();

    // Ownership check (defense-in-depth on top of RLS).
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", leadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (leadError) {
      console.error("[analysesService.saveAnalysis] lead lookup", leadError);
      throw new AnalysisServiceError(GENERIC_FAILURE);
    }
    if (!lead) {
      throw new AnalysisServiceError(NOT_FOUND);
    }

    const { error: analysisError } = await supabase
      .from("lead_analyses")
      .insert({
        lead_id: leadId,
        overall_score: analysis.score,
        qualification: analysis.qualification,
        buying_intent: analysis.buying_intent,
        buying_intent_score: analysis.buying_intent_score,
        budget_fit_score: analysis.budget_fit_score,
        business_fit_score: analysis.business_fit_score,
        urgency_score: analysis.urgency_score,
        positive_signals: analysis.signals,
        risks: analysis.risks,
        missing_information: analysis.missing_information,
        reasoning: analysis.reason,
        confidence_score: null,
      });

    if (analysisError) {
      console.error("[analysesService.saveAnalysis] analysis insert", analysisError);
      throw new AnalysisServiceError(GENERIC_FAILURE);
    }

    const { error: actionError } = await supabase
      .from("recommended_actions")
      .insert({
        lead_id: leadId,
        action: analysis.next_action,
        priority: analysis.priority,
        timeframe: analysis.timeframe,
        reason: analysis.reason,
        status: "pending",
        due_date: null,
      });

    if (actionError) {
      console.error("[analysesService.saveAnalysis] action insert", actionError);
      throw new AnalysisServiceError(GENERIC_FAILURE);
    }

    const { error: statusError } = await supabase
      .from("leads")
      .update({ status: "analyzed" })
      .eq("id", leadId)
      .eq("user_id", userId);

    if (statusError) {
      console.error("[analysesService.saveAnalysis] status update", statusError);
      throw new AnalysisServiceError(GENERIC_FAILURE);
    }
  },

  /**
   * Fetch the most recent analysis for a lead (with its recommended action),
   * or null when none exists.
   */
  async getLatestAnalysis(leadId: string): Promise<StoredAnalysis | null> {
    const { supabase, userId } = await getContext();

    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", leadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!lead) return null;

    const { data: analysis, error } = await supabase
      .from("lead_analyses")
      .select(
        "overall_score, qualification, buying_intent, buying_intent_score, budget_fit_score, business_fit_score, urgency_score, reasoning, positive_signals, risks, missing_information, created_at"
      )
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[analysesService.getLatestAnalysis] analysis", error);
      throw new AnalysisServiceError(GENERIC_FAILURE);
    }
    if (!analysis || analysis.overall_score === null) return null;

    const { data: action } = await supabase
      .from("recommended_actions")
      .select("action, priority, timeframe")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const score = analysis.overall_score;
    const qualification =
      analysis.qualification === "HOT" ||
      analysis.qualification === "WARM" ||
      analysis.qualification === "COLD"
        ? analysis.qualification
        : "COLD";

    return {
      score,
      qualification,
      buyingIntent: analysis.buying_intent ?? "LOW",
      reason: analysis.reasoning ?? "",
      signals: toStringArray(analysis.positive_signals),
      risks: toStringArray(analysis.risks),
      missingInformation: toStringArray(analysis.missing_information),
      nextAction: action?.action ?? "",
      priority: action?.priority ?? "MEDIUM",
      timeframe: action?.timeframe ?? null,
      buyingIntentScore: analysis.buying_intent_score,
      budgetFitScore: analysis.budget_fit_score,
      businessFitScore: analysis.business_fit_score,
      urgencyScore: analysis.urgency_score,
      createdAt: analysis.created_at,
    };
  },

  /**
   * Save a generated outreach email to the existing `outreach` table, scoped
   * to a lead the user owns. Best-effort: failures are logged, not thrown, so
   * a save issue never blocks showing the generated email.
   */
  async saveOutreach(
    leadId: string,
    email: { subject: string; body: string }
  ): Promise<void> {
    const { supabase, userId } = await getContext();

    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", leadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!lead) return;

    const { error } = await supabase.from("outreach").insert({
      lead_id: leadId,
      subject: email.subject,
      body: email.body,
      type: "email",
    });

    if (error) {
      console.error("[analysesService.saveOutreach]", error);
    }
  },
};
