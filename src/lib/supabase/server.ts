import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";
import type { TypedSupabaseClient } from "./types";

/**
 * Server Supabase client for server components, route handlers, and server
 * actions. Uses the request cookie store for auth session management.
 *
 * Returns `null` when public credentials are not configured.
 *
 * The return type uses `TypedSupabaseClient` because the `@supabase/ssr`
 * wrapper's inferred return type does not thread the schema generic into
 * insert/update typing in this version. The runtime object is identical.
 */
export function createClient(): TypedSupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` can be called from a Server Component where writing
          // cookies is not allowed. Session refresh via middleware handles
          // this case, so it is safe to ignore here.
        }
      },
    },
  }) as TypedSupabaseClient;
}
