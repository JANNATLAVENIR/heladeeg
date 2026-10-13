-- Owner access is tied to the verified Supabase Auth identity, never to a client supplied role.
create or replace function public.is_app_owner()
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select lower(coalesce(auth.jwt()->>'email','')) = 'jannatlavenir@gmail.com'
$$;

create or replace function public.claim_app_owner()
returns boolean language plpgsql security definer set search_path = public, auth, pg_temp as $$
begin
  if not public.is_app_owner() or auth.uid() is null then
    raise exception 'Owner account not authorized';
  end if;
  if not exists (select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null) then
    raise exception 'Confirm the owner email before claiming access';
  end if;
  update public.profiles set role='admin', email=(select email from auth.users where id=auth.uid()), updated_at=now()
    where id=auth.uid();
  if not found then raise exception 'Owner profile is not ready'; end if;
  return true;
end $$;

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);
alter table public.app_settings enable row level security;
grant select on public.app_settings to anon, authenticated;
drop policy if exists "owner reads app settings" on public.app_settings;
create policy "owner reads app settings" on public.app_settings for select to authenticated using (public.is_app_owner());
drop policy if exists "public app settings read" on public.app_settings;
create policy "public app settings read" on public.app_settings for select to anon, authenticated using (key in ('app_name','support_contact','service_areas'));

create or replace function public.owner_save_app_settings(p_values jsonb)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
begin
  if not public.is_app_owner() or auth.uid() is null then raise exception 'Owner only'; end if;
  if jsonb_typeof(p_values) <> 'object' then raise exception 'Settings must be an object'; end if;
  insert into public.app_settings(key,value,updated_by,updated_at)
  select key, value, auth.uid(), now() from jsonb_each(p_values)
  on conflict(key) do update set value=excluded.value, updated_by=excluded.updated_by, updated_at=now();
end $$;

create or replace function public.owner_change_user_role(p_user_id uuid, p_role public.app_role)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
begin
  if not public.is_app_owner() or auth.uid() is null then raise exception 'Owner only'; end if;
  if p_user_id = auth.uid() then raise exception 'Owner role cannot be changed here'; end if;
  if p_role not in ('customer','provider','admin') then raise exception 'Invalid role'; end if;
  update public.profiles set role=p_role, updated_at=now() where id=p_user_id;
  if not found then raise exception 'User not found'; end if;
  insert into public.admin_audit_log(admin_id,action,target_type,target_id,details)
  values(auth.uid(),'change_user_role','profile',p_user_id::text,jsonb_build_object('role',p_role));
end $$;

revoke all on function public.claim_app_owner() from public;
revoke all on function public.owner_save_app_settings(jsonb) from public;
revoke all on function public.owner_change_user_role(uuid,public.app_role) from public;
grant execute on function public.claim_app_owner() to authenticated;
grant execute on function public.owner_save_app_settings(jsonb) to authenticated;
grant execute on function public.owner_change_user_role(uuid,public.app_role) to authenticated;
