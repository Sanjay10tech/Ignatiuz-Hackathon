import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types";
import type { LeadRow } from "@/types/database";

/**
 * Read-only aggregates for the dashboard, derived from the authenticated
 * user's existing leads and AI analyses. Scoped by user_id (and RLS).
 */

export class DashboardServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardServiceError";
  }
}

const NOT_CONFIGURED = "The backend is not configured.";
const NOT_AUTHENTICATED = "You must be signed in to view the dashboard.";
const GENERIC_FAILURE = "Something went wrong. Please try again.";

export interface StatusDatum {
  status: string;
  label: string;
  count: number;
}

export interface IndustryDatum {
  industry: string;
  count: number;
  /** Average score for analyzed leads in this industry (null if none). */
  averageScore: number | null;
}

export interface DashboardStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  /** Leads with no analysis yet (not scored). */
  unscored: number;
  /** Average overall score across analyzed leads (0 when none). */
  averageScore: number;
  /** Analyzed leads whose recommended action is still pending. */
  needingAction: number;
  recentLeads: Lead[];
  /** Lead counts grouped by pipeline status. */
  statusDistribution: StatusDatum[];
  /** Lead counts and average score grouped by industry. */
  byIndustry: IndustryDatum[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  analyzed: "Analyzed",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};
const STATUS_ORDER = [
  "new",
  "analyzed",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

const RECENT_LIMIT = 5;

function mapRow(row: LeadRow): Lead {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    jobTitle: row.job_title,
    industry: row.industry,
    companySize: row.company_size,
    budget: row.budget,
    timeline: row.timeline,
    requirement: row.requirement,
    painPoint: row.pain_point,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const LEAD_COLUMNS =
  "id, user_id, name, email, phone, company, job_title, industry, company_size, budget, timeline, requirement, pain_point, status, created_at, updated_at";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const supabase = createClient();
    if (!supabase) throw new DashboardServiceError(NOT_CONFIGURED);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new DashboardServiceError(NOT_AUTHENTICATED);

    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select(LEAD_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("[dashboardService.getStats] leads", leadsError);
      throw new DashboardServiceError(GENERIC_FAILURE);
    }

    const leads = (leadsData ?? []).map(mapRow);
    const total = leads.length;
    const recentLeads = leads.slice(0, RECENT_LIMIT);

    // Status distribution (from lead rows directly).
    const statusCounts = new Map<string, number>();
    for (const l of leads) {
      statusCounts.set(l.status, (statusCounts.get(l.status) ?? 0) + 1);
    }
    const statusDistribution: StatusDatum[] = STATUS_ORDER.filter((s) =>
      statusCounts.has(s)
    ).map((s) => ({
      status: s,
      label: STATUS_LABELS[s] ?? s,
      count: statusCounts.get(s) ?? 0,
    }));

    // Map lead -> industry for per-industry score aggregation.
    const industryByLead = new Map<string, string>();
    const industryCounts = new Map<string, number>();
    for (const l of leads) {
      const industry = l.industry?.trim() || "Unspecified";
      industryByLead.set(l.id, industry);
      industryCounts.set(industry, (industryCounts.get(industry) ?? 0) + 1);
    }

    // Pull all analyses for the user's leads, newest first, then keep the
    // latest per lead in JS (simple and avoids extra round trips).
    const leadIds = leads.map((l) => l.id);
    let hot = 0;
    let warm = 0;
    let cold = 0;
    let scoreSum = 0;
    let scoredCount = 0;
    const industryScoreSum = new Map<string, number>();
    const industryScoreCount = new Map<string, number>();

    if (leadIds.length) {
      const { data: analyses, error: analysesError } = await supabase
        .from("lead_analyses")
        .select("lead_id, overall_score, qualification, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: false });

      if (analysesError) {
        console.error("[dashboardService.getStats] analyses", analysesError);
        throw new DashboardServiceError(GENERIC_FAILURE);
      }

      const seen = new Set<string>();
      for (const row of analyses ?? []) {
        if (seen.has(row.lead_id)) continue;
        seen.add(row.lead_id);

        if (row.overall_score !== null) {
          scoreSum += row.overall_score;
          scoredCount += 1;

          const industry = industryByLead.get(row.lead_id);
          if (industry) {
            industryScoreSum.set(
              industry,
              (industryScoreSum.get(industry) ?? 0) + row.overall_score
            );
            industryScoreCount.set(
              industry,
              (industryScoreCount.get(industry) ?? 0) + 1
            );
          }
        }

        const band =
          row.qualification === "HOT" ||
          row.qualification === "WARM" ||
          row.qualification === "COLD"
            ? row.qualification
            : null;
        if (band === "HOT") hot += 1;
        else if (band === "WARM") warm += 1;
        else if (band === "COLD") cold += 1;
      }
    }

    const byIndustry: IndustryDatum[] = Array.from(industryCounts.entries())
      .map(([industry, count]) => {
        const cnt = industryScoreCount.get(industry) ?? 0;
        const sum = industryScoreSum.get(industry) ?? 0;
        return {
          industry,
          count,
          averageScore: cnt ? Math.round(sum / cnt) : null,
        };
      })
      .sort((a, b) => b.count - a.count);

    const scoredLeadIds = new Set<string>();
    // "needingAction" = analyzed leads with a pending recommended action.
    let needingAction = 0;
    if (leadIds.length) {
      const { data: actions } = await supabase
        .from("recommended_actions")
        .select("lead_id, status")
        .in("lead_id", leadIds)
        .eq("status", "pending");

      for (const a of actions ?? []) {
        if (!scoredLeadIds.has(a.lead_id)) {
          scoredLeadIds.add(a.lead_id);
          needingAction += 1;
        }
      }
    }

    const averageScore = scoredCount
      ? Math.round(scoreSum / scoredCount)
      : 0;
    const unscored = Math.max(0, total - (hot + warm + cold));

    return {
      total,
      hot,
      warm,
      cold,
      unscored,
      averageScore,
      needingAction,
      recentLeads,
      statusDistribution,
      byIndustry,
    };
  },
};
