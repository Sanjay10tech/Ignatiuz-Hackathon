# Supabase setup

SQL migrations for the LeadIQ backend.

## Apply the migrations

Run the files in `migrations/` in order against your Supabase project.

**Option A — Supabase Dashboard (simplest):**

1. Open your project → SQL Editor.
2. Paste and run `migrations/0001_schema.sql`.
3. Paste and run `migrations/0002_rls.sql`.

**Option B — Supabase CLI:**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## What each migration does

- `0001_schema.sql` — Creates the five application tables (`leads`,
  `lead_analyses`, `recommended_actions`, `outreach`, `activities`) with
  indexes and an `updated_at` trigger for `leads`.
- `0002_rls.sql` — Enables Row Level Security on all tables and adds
  owner-scoped policies. Related tables are gated through the `owns_lead()`
  helper so a user can only touch rows tied to leads they own.

## Auth configuration

In the Supabase Dashboard → Authentication → Providers, enable
**Email**. For local hackathon testing you may disable "Confirm email"
so signup logs the user in immediately; keep it enabled for production.
