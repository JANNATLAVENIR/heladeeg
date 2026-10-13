create extension if not exists pgcrypto;

create type public.app_role as enum ('customer','provider','admin');
create type public.provider_status as enum ('pending','approved','rejected','suspended');
create type public.request_status as enum ('new','accepted','declined','in_progress','completed','cancelled','disputed');
create type public.report_status as enum ('open','investigating','resolved','dismissed');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', phone text, email text,
 role public.app_role not null default 'customer', avatar_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.service_categories (
 id uuid primary key default gen_random_uuid(), slug text not null unique,
 name_so text not null, name_en text not null, description text, icon text,
 sort_order integer not null default 0, is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.providers (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references public.profiles(id) on delete cascade,
 display_name text not null, bio text not null default '', phone text, years_experience integer not null default 0 check (years_experience between 0 and 80),
 service_area text[] not null default '{}', verification_status public.provider_status not null default 'pending',
 verification_reason text, is_available boolean not null default false, rating numeric(2,1) not null default 0,
 review_count integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.provider_documents (
 id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade,
 storage_path text not null, file_name text not null, mime_type text not null, created_at timestamptz not null default now()
);
create table public.service_listings (
 id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id) on delete cascade,
 category_id uuid not null references public.service_categories(id), title text not null, description text not null default '',
 price_type text not null default 'quote' check(price_type in ('fixed','hourly','quote')),
 price_min numeric(12,2), price_max numeric(12,2), is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(price_min is null or price_min >= 0), check(price_max is null or price_max >= 0)
);
create table public.service_requests (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id),
 provider_id uuid references public.providers(id), listing_id uuid references public.service_listings(id),
 category_id uuid not null references public.service_categories(id), description text not null,
 neighborhood text not null, preferred_time text not null, photo_path text,
 status public.request_status not null default 'new', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.request_events (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.service_requests(id) on delete cascade,
 actor_id uuid references public.profiles(id), old_status public.request_status, new_status public.request_status not null,
 note text, created_at timestamptz not null default now()
);
create table public.reviews (
 id uuid primary key default gen_random_uuid(), request_id uuid not null unique references public.service_requests(id),
 provider_id uuid not null references public.providers(id), customer_id uuid not null references public.profiles(id),
 rating integer not null check(rating between 1 and 5), comment text not null default '', created_at timestamptz not null default now()
);
create table public.reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id),
 request_id uuid references public.service_requests(id), target_type text not null, target_id uuid,
 reason text not null, details text not null, status public.report_status not null default 'open',
 resolution_note text, resolved_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.admin_audit_log (
 id bigint generated always as identity primary key, admin_id uuid not null references public.profiles(id),
 action text not null, target_type text not null, target_id text, note text, created_at timestamptz not null default now()
);

create index on public.providers(verification_status, is_available);
create index on public.service_listings(category_id, is_active);
create index on public.service_requests(customer_id, created_at desc);
create index on public.service_requests(provider_id, created_at desc);
create index on public.notifications(user_id, created_at desc);
create index on public.reports(status, created_at desc);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 insert into public.profiles(id,full_name,phone,email)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone',new.email);
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin')
$$;
create or replace function public.create_provider_application(p_display_name text,p_bio text,p_phone text,p_years integer,p_areas text[],p_category_ids uuid[],p_price_type text,p_price_min numeric,p_price_max numeric,p_document_path text,p_document_name text,p_document_type text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_id uuid; v_category uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
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
 if auth.uid() is null then raise exception 'Authentication required'; end if;
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
 if not public.is_admin() then raise exception 'Admin only'; end if;
 update public.providers set verification_status=p_status,verification_reason=p_reason,updated_at=now() where id=p_provider_id returning user_id into v_user;
 if v_user is null then raise exception 'Provider not found'; end if;
 insert into public.notifications(user_id,title,body) values(v_user,'Natiijada codsiga adeeg-bixiyaha',coalesce(p_reason,'Xaaladda codsigaaga waa '||p_status::text));
 insert into public.admin_audit_log(admin_id,action,target_type,target_id,note) values(auth.uid(),'provider_'||p_status::text,'provider',p_provider_id::text,p_reason);
end $$;
create or replace function public.resolve_report(p_report_id uuid,p_note text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.is_admin() then raise exception 'Admin only'; end if;
 update public.reports set status='resolved',resolution_note=p_note,resolved_by=auth.uid(),updated_at=now() where id=p_report_id;
 if not found then raise exception 'Report not found'; end if;
 insert into public.admin_audit_log(admin_id,action,target_type,target_id,note) values(auth.uid(),'resolve_report','report',p_report_id::text,p_note);
end $$;

alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.providers enable row level security;
alter table public.provider_documents enable row level security;
alter table public.service_listings enable row level security;
alter table public.service_requests enable row level security;
alter table public.request_events enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "profiles read self or admin" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy "profiles update self" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "categories public read" on public.service_categories for select to anon,authenticated using(is_active or public.is_admin());
create policy "categories admin manage" on public.service_categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "providers public approved or own" on public.providers for select to anon,authenticated using(verification_status='approved' or user_id=auth.uid() or public.is_admin());
create policy "providers own update" on public.providers for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "documents owner/admin read" on public.provider_documents for select to authenticated using(public.is_admin() or exists(select 1 from public.providers p where p.id=provider_id and p.user_id=auth.uid()));
create policy "listings public active" on public.service_listings for select to anon,authenticated using(is_active and exists(select 1 from public.providers p where p.id=provider_id and p.verification_status='approved') or public.is_admin() or exists(select 1 from public.providers p where p.id=provider_id and p.user_id=auth.uid()));
create policy "listing owner manage" on public.service_listings for all to authenticated using(exists(select 1 from public.providers p where p.id=provider_id and p.user_id=auth.uid()) or public.is_admin()) with check(exists(select 1 from public.providers p where p.id=provider_id and p.user_id=auth.uid()) or public.is_admin());
create policy "requests participants read" on public.service_requests for select to authenticated using(customer_id=auth.uid() or public.is_admin() or exists(select 1 from public.providers p where p.id=provider_id and p.user_id=auth.uid()) or (provider_id is null and status='new' and exists(select 1 from public.providers p where p.user_id=auth.uid() and p.verification_status='approved' and p.is_available)));
create policy "request events participants read" on public.request_events for select to authenticated using(public.is_admin() or exists(select 1 from public.service_requests r where r.id=request_id and (r.customer_id=auth.uid() or exists(select 1 from public.providers p where p.id=r.provider_id and p.user_id=auth.uid()))));
create policy "reviews public read" on public.reviews for select to anon,authenticated using(true);
create policy "customer review completed request" on public.reviews for insert to authenticated with check(customer_id=auth.uid() and exists(select 1 from public.service_requests r where r.id=request_id and r.customer_id=auth.uid() and r.provider_id=reviews.provider_id and r.status='completed'));
create policy "reports owner create/read" on public.reports for select to authenticated using(reporter_id=auth.uid() or public.is_admin());
create policy "reports owner submit" on public.reports for insert to authenticated with check(reporter_id=auth.uid());
create policy "reports admin update" on public.reports for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "notifications owner read/update" on public.notifications for select to authenticated using(user_id=auth.uid());
create policy "notifications owner update" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "audit admin read" on public.admin_audit_log for select to authenticated using(public.is_admin());

grant usage on schema public to anon,authenticated;
grant select on public.service_categories,public.providers,public.service_listings,public.reviews to anon,authenticated;
grant select on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name,phone,avatar_url,updated_at) on public.profiles to authenticated;
grant select,insert,update,delete on public.service_categories to authenticated;
grant select on public.providers to authenticated;
revoke update on public.providers from authenticated;
grant update (display_name,bio,phone,years_experience,service_area,is_available,updated_at) on public.providers to authenticated;
grant select,insert,update,delete on public.service_listings to authenticated;
grant select on public.provider_documents,public.service_requests,public.request_events,public.reports,public.notifications,public.admin_audit_log to authenticated;
grant insert on public.reviews,public.reports to authenticated;
grant update on public.reports to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant usage,select on sequence public.admin_audit_log_id_seq to authenticated;
revoke all on function public.handle_new_user() from public,anon,authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
revoke all on function public.create_provider_application(text,text,text,integer,text[],uuid[],text,numeric,numeric,text,text,text) from public,anon;
grant execute on function public.create_provider_application(text,text,text,integer,text[],uuid[],text,numeric,numeric,text,text,text) to authenticated;
revoke all on function public.create_service_request(uuid,uuid,uuid,text,text,text,text) from public,anon;
grant execute on function public.create_service_request(uuid,uuid,uuid,text,text,text,text) to authenticated;
revoke all on function public.change_request_status(uuid,public.request_status,text) from public,anon;
grant execute on function public.change_request_status(uuid,public.request_status,text) to authenticated;
revoke all on function public.claim_service_request(uuid) from public,anon;
grant execute on function public.claim_service_request(uuid) to authenticated;
revoke all on function public.review_provider(uuid,public.provider_status,text) from public,anon;
grant execute on function public.review_provider(uuid,public.provider_status,text) to authenticated;
revoke all on function public.resolve_report(uuid,text) from public,anon;
grant execute on function public.resolve_report(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('provider-documents','provider-documents',false,5242880,array['image/jpeg','image/png','application/pdf']),
 ('request-photos','request-photos',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "users upload own private files" on storage.objects for insert to authenticated with check(bucket_id in ('provider-documents','request-photos') and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users read owned files" on storage.objects for select to authenticated using(
 bucket_id in ('provider-documents','request-photos') and (
  (storage.foldername(name))[1]=auth.uid()::text or public.is_admin() or
  (bucket_id='request-photos' and exists(select 1 from public.service_requests r where r.photo_path=name and
    (r.customer_id=auth.uid() or exists(select 1 from public.providers p where p.id=r.provider_id and p.user_id=auth.uid()))))
 ));
create policy "users delete own private files" on storage.objects for delete to authenticated using(bucket_id in ('provider-documents','request-photos') and (storage.foldername(name))[1]=auth.uid()::text);
