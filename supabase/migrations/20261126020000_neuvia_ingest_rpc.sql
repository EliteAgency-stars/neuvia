-- Ingest RPCs used by the n8n workflow with the publishable key.
-- The shared secret is stored ONLY as a SHA-256 hash. Replace the placeholder when (re)creating:
--   update public.neuvia_private_settings set value = '<sha256 hex of secret>' where key = 'ingest_secret_sha256';
create table if not exists public.neuvia_private_settings (key text primary key, value text not null);
alter table public.neuvia_private_settings enable row level security;
revoke all on public.neuvia_private_settings from anon, authenticated;
insert into public.neuvia_private_settings (key, value) values ('ingest_secret_sha256', '__SET_SHA256_OF_INGEST_SECRET__') on conflict (key) do nothing;

create or replace function public.neuvia_submit_request(p jsonb, s text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare expected text; new_id uuid;
begin
  select value into expected from public.neuvia_private_settings where key = 'ingest_secret_sha256';
  if expected is null or s is null or encode(extensions.digest(s, 'sha256'), 'hex') <> expected then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  insert into public.neuvia_access_requests (full_name, email, organization, role, country, org_type, interest, infrastructure,
    problem, message, privacy_accepted, newsletter_opt_in, locale, idempotency_key, ip_hash, user_agent)
  values (p->>'fullName', lower(p->>'email'), p->>'organization', p->>'role', nullif(p->>'country', ''), p->>'orgType', p->>'interest',
    nullif(p->>'infrastructure', ''), p->>'problem', nullif(p->>'message', ''), coalesce((p->>'privacyAccepted')::boolean, false),
    coalesce((p->>'newsletter')::boolean, false), coalesce(p->>'locale', 'en'), (p->>'idempotencyKey')::uuid, p->>'ipHash', left(p->>'userAgent', 300))
  on conflict (idempotency_key) do nothing
  returning id into new_id;
  return new_id;
end; $$;

create or replace function public.neuvia_mark_notified(rid uuid, s text) returns void
language plpgsql security definer set search_path = '' as $$
declare expected text;
begin
  select value into expected from public.neuvia_private_settings where key = 'ingest_secret_sha256';
  if expected is null or s is null or encode(extensions.digest(s, 'sha256'), 'hex') <> expected then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.neuvia_access_requests set notified_at = now() where id = rid;
end; $$;

revoke all on function public.neuvia_submit_request(jsonb, text) from public;
revoke all on function public.neuvia_mark_notified(uuid, text) from public;
grant execute on function public.neuvia_submit_request(jsonb, text) to anon;
grant execute on function public.neuvia_mark_notified(uuid, text) to anon;
