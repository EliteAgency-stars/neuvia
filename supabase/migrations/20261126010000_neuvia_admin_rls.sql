-- Admin access through Supabase Auth: only emails in public.neuvia_admins may read/manage requests.
create table if not exists public.neuvia_admins (email text primary key check (email = lower(email)), created_at timestamptz not null default now());
alter table public.neuvia_admins enable row level security;
revoke all on public.neuvia_admins from anon, authenticated;
insert into public.neuvia_admins (email) values ('founder@proyectumia.com') on conflict do nothing;

create or replace function public.neuvia_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.neuvia_admins a where a.email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.neuvia_is_admin() from public, anon;
grant execute on function public.neuvia_is_admin() to authenticated;

grant select, update, delete on public.neuvia_access_requests to authenticated;
create policy neuvia_requests_admin_select on public.neuvia_access_requests for select to authenticated using ((select public.neuvia_is_admin()));
create policy neuvia_requests_admin_update on public.neuvia_access_requests for update to authenticated using ((select public.neuvia_is_admin())) with check ((select public.neuvia_is_admin()));
create policy neuvia_requests_admin_delete on public.neuvia_access_requests for delete to authenticated using ((select public.neuvia_is_admin()));

grant select, insert on public.neuvia_admin_audit to authenticated;
create policy neuvia_audit_admin_select on public.neuvia_admin_audit for select to authenticated using ((select public.neuvia_is_admin()));
create policy neuvia_audit_admin_insert on public.neuvia_admin_audit for insert to authenticated with check ((select public.neuvia_is_admin()));

alter table public.neuvia_admin_audit add column if not exists actor_email text;
alter table public.neuvia_access_requests add column if not exists notified_at timestamptz;
