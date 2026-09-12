-- LeadIQ schema
-- Tables: leads, lead_analyses, recommended_actions, outreach, activities
-- Conventions: UUID primary keys, timezone-aware timestamps, JSONB for
-- structured analysis metadata, indexes on common query columns.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  email         text,
  phone         text,
  company       text not null,
  job_title     text,
  industry      text,
  company_size  integer,
  budget        numeric,
  timeline      text,
  requirement   text not null,
  pain_point    text,
  status        text not null default 'new'
                check (status in (
                  'new', 'analyzed', 'contacted',
                  'qualified', 'converted', 'lost'
                )),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists leads_user_id_idx     on public.leads (user_id);
create index if not exists leads_created_at_idx   on public.leads (created_at desc);
create index if not exists leads_status_idx       on public.leads (status);

-- ---------------------------------------------------------------------------
-- lead_analyses
-- ---------------------------------------------------------------------------
create table if not exists public.lead_analyses (
  id                   uuid primary key default gen_random_uuid(),
  lead_id              uuid not null references public.leads (id) on delete cascade,
  overall_score        integer,
  qualification        text,
  buying_intent        text,
  buying_intent_score  integer,
  budget_fit_score     integer,
  business_fit_score   integer,
  urgency_score        integer,
  positive_signals     jsonb,
  risks                jsonb,
  missing_information  jsonb,
  reasoning            text,
  confidence_score     integer,
  created_at           timestamptz not null default now()
);

create index if not exists lead_analyses_lead_id_idx on public.lead_analyses (lead_id);

-- ---------------------------------------------------------------------------
-- recommended_actions
-- ---------------------------------------------------------------------------
create table if not exists public.recommended_actions (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  action      text not null,
  priority    text,
  timeframe   text,
  reason      text,
  status      text not null default 'pending',
  due_date    timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists recommended_actions_lead_id_idx on public.recommended_actions (lead_id);

-- ---------------------------------------------------------------------------
-- outreach
-- ---------------------------------------------------------------------------
create table if not exists public.outreach (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  subject     text,
  body        text,
  type        text not null default 'email',
  created_at  timestamptz not null default now()
);

create index if not exists outreach_lead_id_idx on public.outreach (lead_id);

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid not null references public.leads (id) on delete cascade,
  activity_type  text not null,
  description    text,
  created_at     timestamptz not null default now()
);

create index if not exists activities_lead_id_idx on public.activities (lead_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for leads
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();
