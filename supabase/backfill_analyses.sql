-- LeadIQ demo backfill: create AI analysis records for EXISTING leads that
-- don't have one yet, so the dashboard KPIs and charts populate.
--
-- This is a DEMO convenience only. It does NOT call Gemini and does NOT change
-- schema, auth, or the real AI flow. It derives a plausible score from each
-- lead's own data (budget, timeline urgency, requirement length) so numbers
-- look realistic rather than random.
--
-- Safe + idempotent: only inserts for leads that have no analysis yet, and
-- targets the most recently created user (no hardcoded id). Run once in the
-- Supabase SQL Editor.

do $$
declare
  target_user uuid;
  r record;
  v_score int;
  v_qual text;
  v_intent text;
  v_priority text;
  v_action text;
  v_timeframe text;
begin
  select id into target_user
  from auth.users
  order by created_at desc
  limit 1;

  if target_user is null then
    raise exception 'No user found in auth.users.';
  end if;

  for r in
    select l.*
    from public.leads l
    where l.user_id = target_user
      and not exists (
        select 1 from public.lead_analyses a where a.lead_id = l.id
      )
  loop
    -- Derive a score 0-100 from the lead's own attributes.
    v_score := 40;
    if coalesce(r.budget, 0) >= 50000 then v_score := v_score + 25;
      elsif coalesce(r.budget, 0) >= 20000 then v_score := v_score + 15;
      elsif coalesce(r.budget, 0) >= 5000 then v_score := v_score + 6;
    end if;
    if r.timeline ilike '%30 day%' or r.timeline ilike '%24%' or r.timeline ilike '%week%'
      then v_score := v_score + 20;
      elsif r.timeline ilike '%45 day%' or r.timeline ilike '%60 day%' or r.timeline ilike '%quarter%'
      then v_score := v_score + 12;
      elsif r.timeline ilike '%month%' then v_score := v_score + 6;
    end if;
    if length(coalesce(r.requirement, '')) >= 40 then v_score := v_score + 10; end if;
    if r.status = 'converted' then v_score := greatest(v_score, 85); end if;
    if r.status = 'lost' then v_score := least(v_score, 45); end if;
    if v_score > 100 then v_score := 100; end if;
    if v_score < 0 then v_score := 0; end if;

    if v_score >= 80 then v_qual := 'HOT'; v_intent := 'HIGH'; v_priority := 'HIGH';
      elsif v_score >= 60 then v_qual := 'WARM'; v_intent := 'MEDIUM'; v_priority := 'MEDIUM';
      else v_qual := 'COLD'; v_intent := 'LOW'; v_priority := 'LOW';
    end if;

    if v_qual = 'HOT' then
      v_action := 'Schedule a product demo'; v_timeframe := 'Within 24 hours';
    elsif v_qual = 'WARM' then
      v_action := 'Send a tailored follow-up and qualify budget'; v_timeframe := 'This week';
    else
      v_action := 'Nurture with relevant content'; v_timeframe := 'This month';
    end if;

    insert into public.lead_analyses
      (lead_id, overall_score, qualification, buying_intent, buying_intent_score,
       budget_fit_score, business_fit_score, urgency_score,
       positive_signals, risks, missing_information, reasoning)
    values
      (r.id, v_score, v_qual, v_intent, v_score,
       least(100, coalesce(r.budget,0) / 1000)::int, v_score, v_score,
       to_jsonb(array['Requirement provided', 'Company: ' || coalesce(r.company,'n/a')]),
       to_jsonb(array['Some qualification details may be missing']),
       to_jsonb(array['Confirm decision maker', 'Confirm procurement timeline']),
       'Score derived from budget, timeline urgency and requirement clarity for '
         || coalesce(r.name,'this lead') || '.');

    insert into public.recommended_actions
      (lead_id, action, priority, timeframe, reason, status)
    values
      (r.id, v_action, v_priority, v_timeframe,
       'Based on the qualification band ' || v_qual || '.', 'pending');

    -- Reflect that the lead has been analyzed (don't downgrade further stages).
    if r.status = 'new' then
      update public.leads set status = 'analyzed' where id = r.id;
    end if;
  end loop;

  raise notice 'Backfilled analyses for user %', target_user;
end $$;
