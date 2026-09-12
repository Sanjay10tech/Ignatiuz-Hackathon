import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadInput } from "@/types";
import type { LeadRow, LeadInsert, LeadUpdate } from "@/types/database";

/**
 * Leads repository — the single boundary between the application and lead
 * persistence in Supabase.
 *
 * Security notes:
 * - `user_id` is always derived from the authenticated session, never trusted
 *   from the client.
 * - Row Level Security is the ultimate guard; these methods scope queries as
 *   an additional layer.
 * - Raw database errors are logged server-side and never surfaced to callers.
 */

/** Error type callers can rely on without leaking database internals. */
export class LeadServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadServiceError";
  }
}

const NOT_CONFIGURED =
  "The backend is not configured. Set Supabase environment variables.";
const NOT_AUTHENTICATED = "You must be signed in to perform this action.";
const GENERIC_FAILURE = "Something went wrong. Please try again.";

/** Columns selected for list/detail views. */
const LEAD_COLUMNS =
  "id, user_id, name, email, phone, company, job_title, industry, company_size, budget, timeline, requirement, pain_point, status, created_at, updated_at";

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

async function getContext() {
  const supabase = createClient();
  if (!supabase) {
    throw new LeadServiceError(NOT_CONFIGURED);
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new LeadServiceError(NOT_AUTHENTICATED);
  }
  return { supabase, userId: user.id };
}

export const leadsService = {
  /** Fetch the authenticated user's leads, newest first. */
  async getLeads(): Promise<Lead[]> {
    const { supabase, userId } = await getContext();

    const { data, error } = await supabase
      .from("leads")
      .select(LEAD_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[leadsService.getLeads]", error);
      throw new LeadServiceError(GENERIC_FAILURE);
    }

    return (data ?? []).map(mapRow);
  },

  /** Fetch a single lead by id (scoped to the authenticated user). */
  async getLeadById(id: string): Promise<Lead | null> {
    const { supabase, userId } = await getContext();

    const { data, error } = await supabase
      .from("leads")
      .select(LEAD_COLUMNS)
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[leadsService.getLeadById]", error);
      throw new LeadServiceError(GENERIC_FAILURE);
    }

    return data ? mapRow(data) : null;
  },

  /** Create a lead owned by the authenticated user. */
  async createLead(input: LeadInput): Promise<Lead> {
    const { supabase, userId } = await getContext();

    // user_id is derived from the session, never trusted from the client.
    const payload: LeadInsert = {
      user_id: userId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      company: input.company,
      job_title: input.jobTitle ?? null,
      industry: input.industry ?? null,
      company_size: input.companySize ?? null,
      budget: input.budget ?? null,
      timeline: input.timeline ?? null,
      requirement: input.requirement,
      pain_point: input.painPoint ?? null,
    };

    const { data, error } = await supabase
      .from("leads")
      .insert(payload)
      .select(LEAD_COLUMNS)
      .single();

    if (error || !data) {
      console.error("[leadsService.createLead]", error);
      throw new LeadServiceError(GENERIC_FAILURE);
    }

    return mapRow(data);
  },

  /** Update a lead owned by the authenticated user. */
  async updateLead(id: string, input: Partial<LeadInput>): Promise<Lead> {
    const { supabase, userId } = await getContext();

    const patch: LeadUpdate = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.email !== undefined) patch.email = input.email ?? null;
    if (input.phone !== undefined) patch.phone = input.phone ?? null;
    if (input.company !== undefined) patch.company = input.company;
    if (input.jobTitle !== undefined) patch.job_title = input.jobTitle ?? null;
    if (input.industry !== undefined) patch.industry = input.industry ?? null;
    if (input.companySize !== undefined)
      patch.company_size = input.companySize ?? null;
    if (input.budget !== undefined) patch.budget = input.budget ?? null;
    if (input.timeline !== undefined) patch.timeline = input.timeline ?? null;
    if (input.requirement !== undefined) patch.requirement = input.requirement;
    if (input.painPoint !== undefined)
      patch.pain_point = input.painPoint ?? null;

    const { data, error } = await supabase
      .from("leads")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select(LEAD_COLUMNS)
      .single();

    if (error || !data) {
      console.error("[leadsService.updateLead]", error);
      throw new LeadServiceError(GENERIC_FAILURE);
    }

    return mapRow(data);
  },

  /** Delete a lead owned by the authenticated user. */
  async deleteLead(id: string): Promise<void> {
    const { supabase, userId } = await getContext();

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("[leadsService.deleteLead]", error);
      throw new LeadServiceError(GENERIC_FAILURE);
    }
  },
};
