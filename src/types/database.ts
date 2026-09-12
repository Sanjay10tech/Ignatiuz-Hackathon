/**
 * Database types.
 *
 * These mirror the Supabase schema (see supabase/migrations) and represent the
 * exact shape of rows as stored. They are intentionally kept separate from
 * UI-facing domain types so the two can evolve independently.
 *
 * This file is hand-written for Phase 2. It can later be replaced by output
 * from `supabase gen types typescript` without changing the public shape.
 */

export type LeadStatus =
  | "new"
  | "analyzed"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

/** JSON value type for JSONB columns. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface LeadRow {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string;
  job_title: string | null;
  industry: string | null;
  company_size: number | null;
  budget: number | null;
  timeline: string | null;
  requirement: string;
  pain_point: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

/** Columns a client may supply on insert. user_id is set server-side. */
export interface LeadInsert {
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company: string;
  job_title?: string | null;
  industry?: string | null;
  company_size?: number | null;
  budget?: number | null;
  timeline?: string | null;
  requirement: string;
  pain_point?: string | null;
  status?: LeadStatus;
}

export type LeadUpdate = Partial<Omit<LeadInsert, "user_id">>;

export interface LeadAnalysisRow {
  id: string;
  lead_id: string;
  overall_score: number | null;
  qualification: string | null;
  buying_intent: string | null;
  buying_intent_score: number | null;
  budget_fit_score: number | null;
  business_fit_score: number | null;
  urgency_score: number | null;
  positive_signals: Json | null;
  risks: Json | null;
  missing_information: Json | null;
  reasoning: string | null;
  confidence_score: number | null;
  created_at: string;
}

export interface RecommendedActionRow {
  id: string;
  lead_id: string;
  action: string;
  priority: string | null;
  timeframe: string | null;
  reason: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
}

export interface OutreachRow {
  id: string;
  lead_id: string;
  subject: string | null;
  body: string | null;
  type: string;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string | null;
  created_at: string;
}

/**
 * Supabase `Database` generic. Provides typed table access to the Supabase
 * client. Only the columns used by the app are typed here.
 */
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: [];
      };
      lead_analyses: {
        Row: LeadAnalysisRow;
        Insert: Omit<LeadAnalysisRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<LeadAnalysisRow, "id" | "lead_id">>;
        Relationships: [];
      };
      recommended_actions: {
        Row: RecommendedActionRow;
        Insert: Omit<RecommendedActionRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<RecommendedActionRow, "id" | "lead_id">>;
        Relationships: [];
      };
      outreach: {
        Row: OutreachRow;
        Insert: Omit<OutreachRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OutreachRow, "id" | "lead_id">>;
        Relationships: [];
      };
      activities: {
        Row: ActivityRow;
        Insert: Omit<ActivityRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ActivityRow, "id" | "lead_id">>;
        Relationships: [];
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
}
