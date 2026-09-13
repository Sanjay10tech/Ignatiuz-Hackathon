import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Read-only data for the lead comparison feature: the user's leads plus their
 * latest AI score, qualification, buying intent, and recommended action.
 * Scoped by user_id (and RLS).
 */

export class ComparisonServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComparisonServiceError";
  }
}

const NOT_CONFIGURED = "The backend is not configured.";
const NOT_AUTHENTICATED = "You must be signed in.";
const GENERIC_FAILURE = "Something went wrong. Please try again.";

export interface ComparableLead {
  id: string;
  name: string;
  company: string;
  industry: string | null;
  score: number | null;
  qualification: "HOT" | "WARM" | "COLD" | null;
  buyingIntent: string | null;
  nextAction: string | null;
}

export const comparisonService = {
  async getComparableLeads(): Promise<ComparableLead[]> {
    const supabase = createClient();
    if (!supabase) throw new ComparisonServiceError(NOT_CONFIGURED);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new ComparisonServiceError(NOT_AUTHENTICATED);

    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, name, company, industry")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("[comparisonService] leads", leadsError);
      throw new ComparisonServiceError(GENERIC_FAILURE);
    }

    const rows = leads ?? [];
    const leadIds = rows.map((l) => l.id);

    // Latest analysis + action per lead.
    const score = new Map<string, number>();
    const band = new Map<string, "HOT" | "WARM" | "COLD">();
    const intent = new Map<string, string>();
    const action = new Map<string, string>();

    if (leadIds.length) {
      const { data: analyses } = await supabase
        .from("lead_analyses")
        .select("lead_id, overall_score, qualification, buying_intent, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: false });

      const seen = new Set<string>();
      for (const a of analyses ?? []) {
        if (seen.has(a.lead_id)) continue;
        seen.add(a.lead_id);
        if (a.overall_score !== null) score.set(a.lead_id, a.overall_score);
        if (
          a.qualification === "HOT" ||
          a.qualification === "WARM" ||
          a.qualification === "COLD"
        ) {
          band.set(a.lead_id, a.qualification);
        }
        if (a.buying_intent) intent.set(a.lead_id, a.buying_intent);
      }

      const { data: actions } = await supabase
        .from("recommended_actions")
        .select("lead_id, action, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: false });

      const seenAction = new Set<string>();
      for (const act of actions ?? []) {
        if (seenAction.has(act.lead_id)) continue;
        seenAction.add(act.lead_id);
        if (act.action) action.set(act.lead_id, act.action);
      }
    }

    return rows.map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      industry: l.industry,
      score: score.get(l.id) ?? null,
      qualification: band.get(l.id) ?? null,
      buyingIntent: intent.get(l.id) ?? null,
      nextAction: action.get(l.id) ?? null,
    }));
  },
};
