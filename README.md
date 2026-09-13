# LeadIQ — Sales Intelligence Engine

LeadIQ is an AI-powered sales lead qualification platform. It analyzes a lead,
produces an explainable qualification score (0–100), classifies the lead as
HOT / WARM / COLD, surfaces buying intent, positive signals, risks, and
qualification gaps, and recommends the next best sales action with a priority
and timeframe.

---

# 🎯 Hackathon Challenge 3 — Sales Lead Qualification Tool

## Problem Statement

Sales teams receive a large number of leads, but manually evaluating each lead
is time-consuming and inconsistent. Salespeople need to quickly identify
high-value opportunities, understand the reason behind a lead's priority, and
know what action to take next.

## Challenge Requirement

The solution must:

- Analyze incoming leads
- Generate qualification scores
- Suggest the next best action

## 💡 Our Solution — LeadIQ

LeadIQ is an AI-powered Sales Intelligence Engine that transforms raw lead
information into an actionable sales pipeline.

**Core workflow:**

Lead Input → AI Analysis → 0–100 Score → HOT/WARM/COLD → Explainability → Next Best Action

### Key Capabilities

- AI-powered lead analysis
- Explainable 0–100 qualification score
- HOT / WARM / COLD classification
- Buying intent detection
- Positive signals and risk identification
- Qualification gaps / missing information
- AI-recommended next best action
- Sales dashboard with real-time Supabase data
- Lead prioritization and comparison
- AI-generated follow-up email assistance

## 🤖 AI-Assisted Development

This project was developed using AI-assisted coding with Kiro.

AI was used as a development accelerator, not as a replacement for engineering
decisions.

Development was divided into focused phases:

1. Architecture and project foundation
2. Database, authentication and security
3. Lead management
4. AI qualification workflow
5. AI result and action UX
6. Dashboard and analytics
7. Testing and deployment
8. UI polish and demo preparation

Each prompt defined a clear objective, requirements, constraints and expected
behavior. Generated code was reviewed, tested and validated before moving to
the next phase.

## 🏗️ Architecture

```
User
  ↓
Next.js Frontend
  ↓
Supabase Auth + PostgreSQL + RLS
  ↓
Server-side AI API
  ↓
Google Gemini
  ↓
Structured AI Qualification Result
  ↓
Supabase
  ↓
Lead Detail + Dashboard
```

## 🔐 Security

- Gemini API key remains server-side
- Supabase Row Level Security protects user data
- AI responses are validated before use

## 🛠️ Tech Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase, PostgreSQL, Gemini API,
Zod, Recharts, Vercel, Kiro AI

---

## Feature details

- Email/password authentication with protected app routes.
- Lead management: create, list (with search), view, edit, and delete leads.
- AI qualification (Gemini): explainable score, HOT/WARM/COLD band, buying
  intent, score breakdown (buying intent, budget fit, business fit, urgency),
  positive signals, risks, qualification gaps, and a recommended next action.
- AI follow-up email generator (personalized subject + body, copy to clipboard).
- Lead comparison: select up to 3 leads and compare score, qualification,
  buying intent, and next action, with the highest-priority lead highlighted.
- Dashboard: KPI cards (total / hot / warm / cold), lead distribution and
  status/industry charts, AI insights, top priority leads, AI recommendation,
  conversion funnel, and recent leads.
- Per-user data isolation enforced by Supabase Row Level Security.
- Loading, empty, and error states throughout; responsive, accessible UI.

## Project structure

```
src/
  app/
    (auth)/            # login, signup, auth actions
    (app)/             # authenticated shell + pages
      dashboard/       # KPIs, charts, insights, top leads, funnel, recent leads
      leads/           # list, new, compare, [id] detail/edit/analyze/email
  components/
    auth/              # auth form
    dashboard/         # charts + dashboard sections
    layout/            # app shell: sidebar, top nav, page header
    leads/             # lead feature components
    ui/                # shadcn/ui primitives + toast
  lib/
    supabase/          # browser + server clients, middleware helper
    env.ts             # validated env access (server/client boundary)
  services/            # server-only business logic (leads, analyses, dashboard, comparison, ai)
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

Sanjay Kumar Shukla

© 2026 Sanjay Kumar Shukla. All rights reserved.
