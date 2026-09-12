# LeadIQ — Sales Intelligence Engine

LeadIQ is an AI-powered sales lead qualification platform. It analyzes a lead,
produces an explainable qualification score (0–100), classifies the lead as
HOT / WARM / COLD, surfaces buying intent, positive signals, risks, and
qualification gaps, and recommends the next best sales action with a priority
and timeframe.

## Key features

- Email/password authentication with protected app routes.
- Lead management: create, list (with search), view, edit, and delete leads.
- AI qualification (Gemini): explainable score, HOT/WARM/COLD band, buying
  intent, score breakdown (buying intent, budget fit, business fit, urgency),
  positive signals, risks, qualification gaps, and a recommended next action.
- Dashboard: KPI cards (total / hot / warm / cold), a lead distribution chart,
  AI insights (hot leads, leads needing action, average score), and recent
  leads with quick actions.
- Per-user data isolation enforced by Supabase Row Level Security.
- Loading, empty, and error states throughout; responsive, accessible UI.

## Tech stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui + Lucide React
- Supabase (PostgreSQL, Auth, Row Level Security)
- Zod for validation
- Recharts for the dashboard chart
- Gemini API for AI qualification (server-side only)

## Project structure

```
src/
  app/
    (auth)/            # login, signup, auth actions
    (app)/             # authenticated shell + pages
      dashboard/       # KPIs, chart, insights, recent leads
      leads/           # list, new, [id] detail, [id]/edit, [id]/analyze (API)
  components/
    auth/              # auth form
    dashboard/         # distribution chart
    layout/            # app shell: sidebar, top nav, page header
    leads/             # lead feature components
    ui/                # shadcn/ui primitives + toast
  lib/
    supabase/          # browser + server clients, middleware helper
    env.ts             # validated env access (server/client boundary)
  services/            # server-only business logic (leads, analyses, dashboard, ai)
  types/               # domain + database types
  validation/          # Zod schemas
supabase/
  migrations/          # SQL: schema + RLS policies
```

## How to run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then apply the migrations (Supabase Dashboard →
   SQL Editor, run in order):

   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`

   In Authentication → Providers, enable **Email**. For quick local testing you
   may disable "Confirm email" so signup logs in immediately.

3. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the values (see below). `.env.local` is gitignored and never
   committed.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. Sign up, add a lead, open it, and click
   "Analyze Lead with AI".

## Environment variables

Defined in `.env.example`. Secrets have no `NEXT_PUBLIC_` prefix and are only
read server-side.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Reserved for privileged server ops (optional) |
| `GEMINI_API_KEY` | Server | AI qualification — never exposed to the client |
| `NEXT_PUBLIC_APP_URL` | Public | Base application URL |

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint
- `npm run typecheck` — TypeScript checks

## Deployment

Vercel-compatible. Set the environment variables above in your hosting
provider, ensure the Supabase migrations have been applied, and deploy.

## Author

Sanjay
