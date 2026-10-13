-- New accounts must be approved by the verified app owner before using the app.
alter table public.profiles
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected'));

-- Preserve access for accounts that existed before this gate was introduced.
update public.profiles set approval_status = 'approved' where approval_status = 'pending';

create or replace function public.claim_app_owner()
returns boolean language plpgsql security definer set search_path = public, auth, pg_temp as $$
begin
  if not public.is_app_owner() or auth.uid() is null then raise exception 'Owner account not authorized'; end if;
  if not exists (select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null) then
    raise exception 'Confirm the owner email before claiming access';
  end if;
  update public.profiles set role='admin', approval_status='approved',
    email=(select email from auth.users where id=auth.uid()), updated_at=now() where id=auth.uid();
  if not found then raise exception 'Owner profile is not ready'; end if;
  return true;
end $$;

create or replace function public.account_approval_status()
returns text language plpgsql stable security definer set search_path = public, auth, pg_temp as $$
declare v_status text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select approval_status into v_status from public.profiles where id=auth.uid();
  if not found then raise exception 'Profile not ready'; end if;
  return v_status;
end $$;

-- The existing restrictive policies on all app tables and private storage use this function.
create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public, auth, pg_temp as $$
  select exists(select 1 from public.profiles where id=auth.uid() and suspended_at is null and approval_status='approved')
$$;

create or replace function public.owner_set_user_approval(p_user_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare target_email text;
begin
  if not public.is_app_owner() or not public.is_active_user() then raise exception 'Active owner only'; end if;
  if p_status not in ('approved','rejected') then raise exception 'Invalid account approval status'; end if;
  select email into target_email from public.profiles where id=p_user_id for update;
  if not found then raise exception 'User not found'; end if;
  if lower(coalesce(target_email,''))='jannatlavenir@gmail.com' and p_status='rejected' then
    raise exception 'Owner account cannot be rejected';
  end if;
  update public.profiles set approval_status=p_status, updated_at=now() where id=p_user_id;
  insert into public.admin_audit_log(admin_id,action,target_type,target_id,note)
    values(auth.uid(),'account_'||p_status,'profile',p_user_id::text,null);
end $$;

-- SECURITY DEFINER RPCs bypass table RLS, so gate each app action explicitly as well.
create or replace function public.create_provider_application(p_display_name text,p_bio text,p_phone text,p_years integer,p_areas text[],p_category_ids uuid[],p_price_type text,p_price_min numeric,p_price_max numeric,p_document_path text,p_document_name text,p_document_type text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_id uuid; v_category uuid;
begin
 if not public.is_active_user() then raise exception 'Active approved account required'; end if;
 if exists(select 1 from public.providers where user_id=auth.uid()) then raise exception 'Provider application already exists'; end if;
 if coalesce(array_length(p_category_ids,1),0)=0 then raise exception 'Select at least one service category'; end if;
 insert into public.providers(user_id,display_name,bio,phone,years_experience,service_area) values(auth.uid(),p_display_name,p_bio,p_phone,greatest(0,least(p_years,80)),coalesce(p_areas,'{}')) returning id into v_id;
 foreach v_category in array p_category_ids loop
   insert into public.service_listings(provider_id,category_id,title,description,price_type,price_min,price_max)
   select v_id,c.id,c.name_so,p_bio,p_price_type,p_price_min,p_price_max from public.service_categories c where c.id=v_category and c.is_active;
 end loop;
 if p_document_path is not null then insert into public.provider_documents(provider_id,storage_path,file_name,mime_type) values(v_id,p_document_path,p_document_name,p_document_type); end if;
 update public.profiles set role='provider',updated_at=now() where id=auth.uid();
 insert into public.notifications(user_id,title,body) select id,'Codsi adeeg-bixiye cusub','Codsi cusub ayaa sugaya xaqiijin.' from public.profiles where role='admin';
 return v_id;
end $$;

create or replace function public.create_service_request(p_provider_id uuid,p_listing_id uuid,p_category_id uuid,p_description text,p_neighborhood text,p_preferred_time text,p_photo_path text default null)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_id uuid;
begin
 if not public.is_active_user() then raise exception 'Active approved account required'; end if;
 if p_provider_id is not null and not exists(select 1 from public.providers where id=p_provider_id and verification_status='approved' and is_available) then raise exception 'Provider unavailable'; end if;
 insert into public.service_requests(customer_id,provider_id,listing_id,category_id,description,neighborhood,preferred_time,photo_path)
 values(auth.uid(),p_provider_id,p_listing_id,p_category_id,p_description,p_neighborhood,p_preferred_time,p_photo_path) returning id into v_id;
 insert into public.request_events(request_id,actor_id,new_status) values(v_id,auth.uid(),'new');
 if p_provider_id is not null then insert into public.notifications(user_id,title,body) select user_id,'Codsi adeeg oo cusub','Waxaa laguu soo diray codsi cusub.' from public.providers where id=p_provider_id; end if;
 return v_id;
end $$;

create or replace function public.change_request_status(p_request_id uuid,p_status public.request_status,p_note text default null)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.service_requests%rowtype; allowed boolean:=false;
begin
 if not public.is_active_user() then raise exception 'Active approved account required'; end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found then raise exception 'Request not found'; end if;
 if public.is_admin() then allowed:=true;
 elsif r.provider_id is not null and exists(select 1 from public.providers where id=r.provider_id and user_id=auth.uid()) then
   allowed := (r.status='new' and p_status in ('accepted','declined')) or (r.status='accepted' and p_status='in_progress') or (r.status='in_progress' and p_status='completed');
 elsif r.customer_id=auth.uid() then allowed := p_status='cancelled' and r.status in ('new','accepted'); end if;
 if not allowed then raise exception 'Status change not allowed'; end if;
 update public.service_requests set status=p_status,updated_at=now() where id=p_request_id;
 insert into public.request_events(request_id,actor_id,old_status,new_status,note) values(p_request_id,auth.uid(),r.status,p_status,p_note);
 insert into public.notifications(user_id,title,body) values(r.customer_id,'Xaaladda codsiga waa la beddelay','Codsigaagu hadda waa '||p_status::text||'.');
end $$;

create or replace function public.claim_service_request(p_request_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.service_requests%rowtype; v_provider uuid;
begin
 if not public.is_active_user() then raise exception 'Active approved account required'; end if;
 select id into v_provider from public.providers where user_id=auth.uid() and verification_status='approved' and is_available;
 if v_provider is null then raise exception 'Approved available provider required'; end if;
 select * into r from public.service_requests where id=p_request_id for update;
 if not found or r.provider_id is not null or r.status<>'new' then raise exception 'Request unavailable'; end if;
 update public.service_requests set provider_id=v_provider,status='accepted',updated_at=now() where id=p_request_id;
 insert into public.request_events(request_id,actor_id,old_status,new_status) values(p_request_id,auth.uid(),'new','accepted');
 insert into public.notifications(user_id,title,body) values(r.customer_id,'Adeeg-bixiye ayaa aqbalay codsigaaga','Codsigaaga waa la aqbalay.');
end $$;

create or replace function public.review_provider(p_provider_id uuid,p_status public.provider_status,p_reason text default null)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_user uuid;
begin
 if not public.is_active_user() or not public.is_admin() then raise exception 'Active admin only'; end if;
 update public.providers set verification_status=p_status,verification_reason=p_reason,updated_at=now() where id=p_provider_id returning user_id into v_user;
 if v_user is null then raise exception 'Provider not found'; end if;
 insert into public.notifications(user_id,title,body) values(v_user,'Natiijada codsiga adeeg-bixiyaha',coalesce(p_reason,'Xaaladda codsigaaga waa '||p_status::text));
 insert into public.admin_audit_log(admin_id,action,target_type,target_id,note) values(auth.uid(),'provider_'||p_status::text,'provider',p_provider_id::text,p_reason);
end $$;

create or replace function public.resolve_report(p_report_id uuid,p_note text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.is_active_user() or not public.is_admin() then raise exception 'Active admin only'; end if;
 update public.reports set status='resolved',resolution_note=p_note,resolved_by=auth.uid(),updated_at=now() where id=p_report_id;
 if not found then raise exception 'Report not found'; end if;
 insert into public.admin_audit_log(admin_id,action,target_type,target_id,note) values(auth.uid(),'resolve_report','report',p_report_id::text,p_note);
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.profiles(id,full_name,phone,email)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone',new.email);
  insert into public.notifications(user_id,title,body)
  select id,'Akoon cusub ayaa sugaya ansixin','Fadlan dib u eeg akoonka cusub ee sugaya ansixinta.'
  from public.profiles where role='admin';
  return new;
end $$;

revoke all on function public.account_approval_status() from public, anon;
revoke all on function public.owner_set_user_approval(uuid,text) from public, anon;
grant execute on function public.account_approval_status() to authenticated;
grant execute on function public.owner_set_user_approval(uuid,text) to authenticated;

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
