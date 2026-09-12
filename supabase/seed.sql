-- LeadIQ demo seed data
--
-- Inserts 6 realistic demo leads (mixed statuses/industries/budgets) for a
-- single user, plus AI analysis + recommended action records for the leads
-- that are ANALYZED or QUALIFIED, so the dashboard charts are populated.
--
-- Target user = the most recently created account in auth.users (no user id is
-- hardcoded). To target a specific account instead, replace the target_user
-- selection with:  select id into target_user from auth.users where email = 'you@example.com';
--
-- Idempotent: re-running will not create duplicate leads (matches company +
-- name for the same user). Analyses are only inserted for leads that don't
-- already have one.
--
-- Run once in the Supabase SQL Editor.

do $$
declare
  target_user uuid;
begin
  select id into target_user
  from auth.users
  order by created_at desc
  limit 1;

  if target_user is null then
    raise exception 'No user found in auth.users. Create a user first.';
  end if;

  -- 1) Leads (mixed statuses).
  insert into public.leads
    (user_id, name, company, email, job_title, industry, company_size, budget, timeline, requirement, pain_point, status)
  select v.user_id, v.name, v.company, v.email, v.job_title, v.industry, v.company_size,
         v.budget, v.timeline, v.requirement, v.pain_point, v.status
  from (values
    (target_user, 'Sarah Johnson', 'NovaTech Solutions', 'sarah@novatech.example', 'VP Engineering', 'SaaS', 250, 50000::numeric, 'Within 30 days',
      'AI-powered customer support for 50,000 monthly users.', 'Slow support response times.', 'qualified'),
    (target_user, 'Daniel Lee', 'HealthCore', 'daniel@healthcore.example', 'Head of Operations', 'Healthcare', 400, 75000::numeric, 'Within 45 days',
      'Enterprise automation platform to reduce operational workload.', 'Manual processes are increasing operational costs.', 'analyzed'),
    (target_user, 'Priya Mehta', 'FinEdge Technologies', 'priya@finedge.example', 'Product Director', 'FinTech', 180, 35000::numeric, 'Within 60 days',
      'Improve customer onboarding and automate support workflows.', 'High manual workload during customer onboarding.', 'contacted'),
    (target_user, 'Rahul Sharma', 'BrightRetail', 'rahul@brightretail.example', 'Operations Manager', 'Retail', 80, 15000::numeric, '3-6 months',
      'Automate repetitive customer support queries.', 'Support team spends too much time on repetitive requests.', 'new'),
    (target_user, 'Emily Carter', 'SummitEdu', 'emily@summitedu.example', 'Director of IT', 'Education', 120, 28000::numeric, 'This quarter',
      'Student support chatbot and ticket automation.', 'Support desk is overwhelmed during admissions.', 'converted'),
    (target_user, 'Amit Verma', 'SmallBiz Works', 'amit@smallbiz.example', 'Founder', 'Consulting', 12, 5000::numeric, 'No fixed timeline',
      'Exploring AI tools for business automation.', 'Business requirement is not clearly defined.', 'lost')
  ) as v(user_id, name, company, email, job_title, industry, company_size, budget, timeline, requirement, pain_point, status)
  where not exists (
    select 1 from public.leads l
    where l.user_id = v.user_id and l.company = v.company and l.name = v.name
  );

  -- 2) AI analyses + recommended actions for ANALYZED / QUALIFIED leads.
  --    Only added when the lead has no analysis yet.
  insert into public.lead_analyses
    (lead_id, overall_score, qualification, buying_intent, buying_intent_score,
     budget_fit_score, business_fit_score, urgency_score,
     positive_signals, risks, missing_information, reasoning)
  select l.id, a.overall_score, a.qualification, a.buying_intent, a.buying_intent_score,
         a.budget_fit_score, a.business_fit_score, a.urgency_score,
         a.positive_signals::jsonb, a.risks::jsonb, a.missing_information::jsonb, a.reasoning
  from public.leads l
  join (values
    ('NovaTech Solutions', 'Sarah Johnson', 88, 'HOT', 'HIGH', 90, 85, 90, 88,
      '["Clear requirement","Strong budget","Senior decision maker","Urgent timeline"]',
      '["Competitive evaluation likely"]',
      '["Procurement process unknown"]',
      'Senior buyer with a clear, funded requirement and a 30-day timeline. Strong fit for our platform.'),
    ('HealthCore', 'Daniel Lee', 82, 'HOT', 'HIGH', 84, 88, 80, 82,
      '["Large company","High budget","Operational urgency"]',
      '["Compliance requirements in healthcare"]',
      '["Security review timeline unclear"]',
      'Enterprise healthcare account with a strong budget and clear operational pain. High potential value.')
  ) as a(company, name, overall_score, qualification, buying_intent, buying_intent_score,
         budget_fit_score, business_fit_score, urgency_score,
         positive_signals, risks, missing_information, reasoning)
    on a.company = l.company and a.name = l.name
  where l.user_id = target_user
    and not exists (select 1 from public.lead_analyses x where x.lead_id = l.id);

  insert into public.recommended_actions
    (lead_id, action, priority, timeframe, reason, status)
  select l.id, a.action, a.priority, a.timeframe, a.reason, 'pending'
  from public.leads l
  join (values
    ('NovaTech Solutions', 'Sarah Johnson', 'Schedule a product demo', 'HIGH', 'Within 24 hours',
      'Hot lead with budget and urgency; move fast to secure the demo.'),
    ('HealthCore', 'Daniel Lee', 'Send enterprise proposal and security overview', 'HIGH', 'This week',
      'High-value healthcare account; address compliance early.')
  ) as a(company, name, action, priority, timeframe, reason)
    on a.company = l.company and a.name = l.name
  where l.user_id = target_user
    and not exists (select 1 from public.recommended_actions x where x.lead_id = l.id);

  raise notice 'Demo data ensured for user %', target_user;
end $$;
