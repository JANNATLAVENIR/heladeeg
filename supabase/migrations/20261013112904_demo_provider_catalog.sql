-- Demo providers use the production request flow, but have no login identity.
-- Their dedicated demo_code makes seed inserts repeatable and visible as demo.
alter table public.providers
  alter column user_id drop not null,
  add column is_demo boolean not null default false,
  add column demo_code text unique,
  add constraint providers_demo_identity_check check (
    (is_demo and user_id is null and demo_code is not null)
    or (not is_demo and user_id is not null and demo_code is null)
  );
alter table public.service_requests
  add column is_demo boolean not null default false;

-- Demo requests are stored and trackable but have no provider account to notify.
create or replace function public.create_service_request(
  p_provider_id uuid,
  p_listing_id uuid,
  p_category_id uuid,
  p_description text,
  p_neighborhood text,
  p_preferred_time text,
  p_photo_path text default null
)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_id uuid;
  v_is_demo boolean := false;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_provider_id is not null and not exists(
   select 1 from public.providers
   where id=p_provider_id and verification_status='approved' and is_available
 ) then raise exception 'Provider unavailable'; end if;
 if p_provider_id is not null then
   select is_demo into v_is_demo from public.providers where id=p_provider_id;
 end if;
 insert into public.service_requests(customer_id,provider_id,listing_id,category_id,description,neighborhood,preferred_time,photo_path,is_demo)
 values(auth.uid(),p_provider_id,p_listing_id,p_category_id,p_description,p_neighborhood,p_preferred_time,p_photo_path,v_is_demo)
 returning id into v_id;
 insert into public.request_events(request_id,actor_id,new_status) values(v_id,auth.uid(),'new');
 if p_provider_id is not null then
   insert into public.notifications(user_id,title,body)
   select user_id,'Codsi adeeg oo cusub','Waxaa laguu soo diray codsi cusub.'
   from public.providers where id=p_provider_id and user_id is not null;
 end if;
 return v_id;
end $$;

revoke all on function public.create_service_request(uuid,uuid,uuid,text,text,text,text) from public,anon;
grant execute on function public.create_service_request(uuid,uuid,uuid,text,text,text,text) to authenticated;
