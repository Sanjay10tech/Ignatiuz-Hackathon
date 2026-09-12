import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "./types";

/**
 * Browser Supabase client for use in client components.
 *
 * Returns `null` when public credentials are not configured, so callers can
 * render a clean "not configured" state instead of crashing.
 */
export function createClient(): TypedSupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createBrowserClient<Database>(
    config.url,
    config.anonKey
  ) as TypedSupabaseClient;
}
