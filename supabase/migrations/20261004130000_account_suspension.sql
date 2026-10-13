alter table public.profiles
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select exists(select 1 from public.profiles where id=auth.uid() and suspended_at is null)
$$;

create or replace function public.is_account_suspended()
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select exists(select 1 from public.profiles where id=auth.uid() and suspended_at is not null)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and suspended_at is null)
$$;

create or replace function public.owner_set_user_suspension(p_user_id uuid, p_suspend boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare target_email text;
begin
  if not public.is_app_owner() or not public.is_active_user() then raise exception 'Active owner only'; end if;
  select email into target_email from public.profiles where id=p_user_id for update;
  if not found then raise exception 'User not found'; end if;
  if lower(coalesce(target_email,''))='jannatlavenir@gmail.com' then raise exception 'Owner account cannot be suspended'; end if;
  if p_suspend and length(trim(coalesce(p_reason,''))) < 3 then raise exception 'Provide a suspension reason'; end if;
  update public.profiles set
    suspended_at=case when p_suspend then now() else null end,
    suspension_reason=case when p_suspend then trim(p_reason) else null end,
    updated_at=now()
  where id=p_user_id;
  insert into public.admin_audit_log(admin_id,action,target_type,target_id,note)
  values(auth.uid(),case when p_suspend then 'suspend_user' else 'restore_user' end,'profile',p_user_id::text,case when p_suspend then trim(p_reason) else 'Account restored' end);
end $$;

revoke all on function public.is_active_user() from public;
revoke all on function public.is_account_suspended() from public;
revoke all on function public.owner_set_user_suspension(uuid,boolean,text) from public;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.is_account_suspended() to authenticated;
grant execute on function public.owner_set_user_suspension(uuid,boolean,text) to authenticated;

do $$
declare t text;
begin
  foreach t in array array['profiles','service_categories','providers','provider_documents','service_listings','service_requests','request_events','reviews','reports','notifications','admin_audit_log','app_settings'] loop
    execute format('drop policy if exists "active account required" on public.%I', t);
    execute format('create policy "active account required" on public.%I as restrictive for all to authenticated using (public.is_active_user()) with check (public.is_active_user())', t);
  end loop;
end $$;

drop policy if exists "active account required" on storage.objects;
create policy "active account required" on storage.objects as restrictive for all to authenticated using (public.is_active_user()) with check (public.is_active_user());
