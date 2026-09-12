import type { LeadStatus } from "./database";

/**
 * UI-facing domain types for the sales lead pipeline.
 *
 * These describe application data in the shape the UI and services prefer.
 * Database row types live in `./database` and are mapped into these where
 * needed, keeping persistence concerns separate from the domain model.
 */

export type { LeadStatus } from "./database";

export type LeadTemperature = "hot" | "warm" | "cold";

export interface Lead {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string;
  jobTitle: string | null;
  industry: string | null;
  companySize: number | null;
  budget: number | null;
  timeline: string | null;
  requirement: string;
  painPoint: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

/** Fields captured when a user creates or edits a lead. */
export interface LeadInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  company: string;
  jobTitle?: string | null;
  industry?: string | null;
  companySize?: number | null;
  budget?: number | null;
  timeline?: string | null;
  requirement: string;
  painPoint?: string | null;
}
