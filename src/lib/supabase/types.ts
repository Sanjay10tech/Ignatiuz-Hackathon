import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostgrestClient } from "@supabase/postgrest-js";

import type { Database } from "@/types/database";

/**
 * Correctly-typed Supabase client for our schema.
 *
 * In the installed versions, `SupabaseClient<Database>` does not thread the
 * schema generic into `.from(...).insert()/.update()` (those resolve to
 * `never`), while `PostgrestClient<Database>` does. We therefore override the
 * `from` method with the one from `PostgrestClient` so table operations are
 * correctly typed, while keeping the rest of `SupabaseClient` (notably
 * `.auth`) intact. The runtime object already behaves this way; this only
 * corrects the static types.
 */
export type TypedSupabaseClient = Omit<SupabaseClient<Database>, "from"> &
  Pick<PostgrestClient<Database>, "from">;
