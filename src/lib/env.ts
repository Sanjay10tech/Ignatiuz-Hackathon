import { z } from "zod";

/**
 * Centralized, validated environment access.
 *
 * Public variables (NEXT_PUBLIC_*) are safe for the browser.
 * Server-only secrets are validated lazily via `getServerEnv()` and must
 * never be imported into client components.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
});

/**
 * Public env, readable anywhere. Values are optional so the app boots without
 * external services configured; use `getSupabaseConfig()` when non-null values
 * are required.
 */
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

/**
 * Server-only env. Call inside server code (route handlers, server actions,
 * server components). Throws if used where secrets are unavailable.
 */
export function getServerEnv() {
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  });
}

/** True when the public Supabase credentials are present. */
export function isSupabaseConfigured() {
  return Boolean(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL &&
      clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Returns the public Supabase config with non-null types, or `null` when it is
 * not configured. Callers can narrow once and pass typed values downstream.
 */
export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}
