-- NEUVIA — early access requests and admin audit log.
-- RLS is enabled with NO policies: anon/authenticated roles cannot read or write.
-- Only the server (service_role key, kept in server env vars) can access these tables.

create table if not exists public.neuvia_access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  organization text not null check (char_length(organization) between 1 and 160),
  role text not null check (char_length(role) between 1 and 120),
  country text check (country is null or char_length(country) <= 80),
  org_type text not null check (org_type in ('ai_lab','model_developer','enterprise','startup','academic','public_sector','investor','independent','other')),
  interest text not null check (interest in ('early_access','research_collaboration','enterprise_integration','model_evaluation','technical_partnership','academic_collaboration','investment','developer_access','general')),
  infrastructure text check (infrastructure is null or char_length(infrastructure) <= 300),
  problem text not null check (char_length(problem) between 20 and 4000),
  message text check (message is null or char_length(message) <= 4000),
  privacy_accepted boolean not null check (privacy_accepted),
  newsletter_opt_in boolean not null default false,
  locale text not null default 'en' check (locale in ('en','es','de')),
  status text not null default 'new' check (status in ('new','under_review','contacted','in_discussion','closed')),
  idempotency_key uuid not null unique,
  ip_hash text,
  user_agent text check (user_agent is null or char_length(user_agent) <= 300)
);

create index if not exists neuvia_access_requests_created_idx on public.neuvia_access_requests (created_at desc);
create index if not exists neuvia_access_requests_status_idx on public.neuvia_access_requests (status);
create index if not exists neuvia_access_requests_interest_idx on public.neuvia_access_requests (interest);

create table if not exists public.neuvia_admin_audit (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  action text not null check (action in ('login','login_failed','logout','view','status_change','delete','export')),
  request_id uuid,
  detail jsonb not null default '{}'::jsonb,
  ip_hash text
);
create index if not exists neuvia_admin_audit_created_idx on public.neuvia_admin_audit (created_at desc);

create or replace function public.neuvia_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists neuvia_access_requests_touch on public.neuvia_access_requests;
create trigger neuvia_access_requests_touch before update on public.neuvia_access_requests
for each row execute function public.neuvia_touch_updated_at();

alter table public.neuvia_access_requests enable row level security;
alter table public.neuvia_admin_audit enable row level security;
revoke all on public.neuvia_access_requests from anon, authenticated;
revoke all on public.neuvia_admin_audit from anon, authenticated;
