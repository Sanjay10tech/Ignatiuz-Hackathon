-- Row Level Security for LeadIQ
--
-- Every application table has RLS enabled with owner-scoped policies.
-- - leads: accessible only to the user whose user_id matches auth.uid()
-- - related tables: accessible only when the parent lead is owned by the user
--
-- No "allow all authenticated" policies. RLS is never disabled.

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
alter table public.leads enable row level security;

drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
  on public.leads for select
  using (auth.uid() = user_id);

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own"
  on public.leads for insert
  with check (auth.uid() = user_id);

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own"
  on public.leads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own"
  on public.leads for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Helper: does the current user own the given lead?
-- ---------------------------------------------------------------------------
create or replace function public.owns_lead(target_lead_id uuid)
returns boolean
language sql
security invoker
stable
as $$
  select exists (
    select 1
    from public.leads l
    where l.id = target_lead_id
      and l.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- lead_analyses
-- ---------------------------------------------------------------------------
alter table public.lead_analyses enable row level security;

drop policy if exists "lead_analyses_select_own" on public.lead_analyses;
create policy "lead_analyses_select_own"
  on public.lead_analyses for select
  using (public.owns_lead(lead_id));

drop policy if exists "lead_analyses_insert_own" on public.lead_analyses;
create policy "lead_analyses_insert_own"
  on public.lead_analyses for insert
  with check (public.owns_lead(lead_id));

drop policy if exists "lead_analyses_update_own" on public.lead_analyses;
create policy "lead_analyses_update_own"
  on public.lead_analyses for update
  using (public.owns_lead(lead_id))
  with check (public.owns_lead(lead_id));

drop policy if exists "lead_analyses_delete_own" on public.lead_analyses;
create policy "lead_analyses_delete_own"
  on public.lead_analyses for delete
  using (public.owns_lead(lead_id));

-- ---------------------------------------------------------------------------
-- recommended_actions
-- ---------------------------------------------------------------------------
alter table public.recommended_actions enable row level security;

drop policy if exists "recommended_actions_select_own" on public.recommended_actions;
create policy "recommended_actions_select_own"
  on public.recommended_actions for select
  using (public.owns_lead(lead_id));

drop policy if exists "recommended_actions_insert_own" on public.recommended_actions;
create policy "recommended_actions_insert_own"
  on public.recommended_actions for insert
  with check (public.owns_lead(lead_id));

drop policy if exists "recommended_actions_update_own" on public.recommended_actions;
create policy "recommended_actions_update_own"
  on public.recommended_actions for update
  using (public.owns_lead(lead_id))
  with check (public.owns_lead(lead_id));

drop policy if exists "recommended_actions_delete_own" on public.recommended_actions;
create policy "recommended_actions_delete_own"
  on public.recommended_actions for delete
  using (public.owns_lead(lead_id));

-- ---------------------------------------------------------------------------
-- outreach
-- ---------------------------------------------------------------------------
alter table public.outreach enable row level security;

drop policy if exists "outreach_select_own" on public.outreach;
create policy "outreach_select_own"
  on public.outreach for select
  using (public.owns_lead(lead_id));

drop policy if exists "outreach_insert_own" on public.outreach;
create policy "outreach_insert_own"
  on public.outreach for insert
  with check (public.owns_lead(lead_id));

drop policy if exists "outreach_update_own" on public.outreach;
create policy "outreach_update_own"
  on public.outreach for update
  using (public.owns_lead(lead_id))
  with check (public.owns_lead(lead_id));

drop policy if exists "outreach_delete_own" on public.outreach;
create policy "outreach_delete_own"
  on public.outreach for delete
  using (public.owns_lead(lead_id));

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
alter table public.activities enable row level security;

drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_own"
  on public.activities for select
  using (public.owns_lead(lead_id));

drop policy if exists "activities_insert_own" on public.activities;
create policy "activities_insert_own"
  on public.activities for insert
  with check (public.owns_lead(lead_id));

drop policy if exists "activities_update_own" on public.activities;
create policy "activities_update_own"
  on public.activities for update
  using (public.owns_lead(lead_id))
  with check (public.owns_lead(lead_id));

drop policy if exists "activities_delete_own" on public.activities;
create policy "activities_delete_own"
  on public.activities for delete
  using (public.owns_lead(lead_id));
