insert into public.service_categories (slug, name_so, name_en, icon, sort_order) values
 ('plumbing','Tuubooyin','Plumbing','Wrench',1),
 ('electrical','Koronto','Electrical','Zap',2),
 ('cleaning','Nadaafad','Cleaning','Sparkles',3),
 ('moving','Guuritaan','Moving','Truck',4),
 ('painting','Rinjiyeeyn','Painting','Paintbrush',5),
 ('carpentry','Nijaar','Carpentry','Hammer',6),
 ('appliance-repair','Dayactirka qalabka','Appliance repair','Settings',7),
 ('gardening','Beer-fal','Gardening','Flower2',8)
on conflict (slug) do update set name_so=excluded.name_so, name_en=excluded.name_en, icon=excluded.icon, sort_order=excluded.sort_order;

-- Synthetic providers for safe booking-flow demos. They have no auth identity.
insert into public.providers
  (user_id, is_demo, demo_code, display_name, bio, years_experience, service_area, verification_status, is_available, rating, review_count)
values
  (null,true,'demo-plumber-hodan-01','Tuubiste Tusaale 01','Tusaale tuubo hagaajin iyo rakibid guri.',8,array['Hodan','Boondheere','Shibis'],'approved',true,0,0),
  (null,true,'demo-plumber-wadajir-02','Tuubiste Tusaale 02','Tusaale dayactirka tuubooyinka iyo biyo-mareennada.',6,array['Wadajir','Hodan','Waaberi'],'approved',true,0,0),
  (null,true,'demo-plumber-dayniile-03','Tuubiste Tusaale 03','Tusaale rakibidda tubooyinka iyo baarista daadashada.',5,array['Dayniile','Huriwaa','Yaqshiid'],'approved',true,0,0),
  (null,true,'demo-electrician-01','Koronto Tusaale 01','Tusaale baarista iyo hagaajinta korontada guryaha.',7,array['Hodan','Howl-Wadaag','Waaberi'],'approved',true,0,0),
  (null,true,'demo-cleaner-01','Nadaafad Tusaale 01','Tusaale nadiifinta guryaha iyo xafiisyada.',4,array['Hodan','Wadajir','Kaaraan'],'approved',true,0,0),
  (null,true,'demo-moving-01','Guuritaan Tusaale 01','Tusaale rarista iyo gaarsiinta alaabta guryaha.',6,array['Wadajir','Hodan','Dayniile'],'approved',true,0,0),
  (null,true,'demo-painter-01','Rinjiye Tusaale 01','Tusaale rinjiyeynta gudaha iyo dibadda guryaha.',9,array['Hodan','Shibis','Yaqshiid'],'approved',true,0,0),
  (null,true,'demo-carpenter-01','Nijaar Tusaale 01','Tusaale samaynta iyo hagaajinta alaabta alwaaxa.',8,array['Boondheere','Hodan','Kaaraan'],'approved',true,0,0),
  (null,true,'demo-appliance-repair-01','Qalab Tusaale 01','Tusaale baarista iyo dayactirka qalabka guriga.',5,array['Hodan','Wadajir','Yaqshiid'],'approved',true,0,0),
  (null,true,'demo-gardener-01','Beer-fal Tusaale 01','Tusaale daryeelka jardiinooyinka iyo dhirta.',4,array['Wadajir','Hodan','Dayniile'],'approved',true,0,0)
on conflict (demo_code) do update set
  display_name=excluded.display_name,
  bio=excluded.bio,
  years_experience=excluded.years_experience,
  service_area=excluded.service_area,
  verification_status='approved',
  is_available=true,
  rating=excluded.rating,
  review_count=excluded.review_count;

delete from public.service_listings
where provider_id in (select id from public.providers where is_demo);

insert into public.service_listings (provider_id, category_id, title, description, price_type, price_min, price_max)
select p.id, c.id, x.title, x.description, x.price_type, x.price_min, x.price_max
from (values
  ('demo-plumber-hodan-01','plumbing','Tuubo hagaajin iyo rakibid','Tusaale ballan adeeg tuubo.', 'fixed',20,65),
  ('demo-plumber-wadajir-02','plumbing','Dayactirka biyaha iyo biyo-mareenka','Tusaale ballan adeeg tuubo.', 'fixed',15,55),
  ('demo-plumber-dayniile-03','plumbing','Baarista daadashada iyo rakibidda','Tusaale ballan adeeg tuubo.', 'quote',null,null),
  ('demo-electrician-01','electrical','Baaris iyo hagaajin koronto','Tusaale ballan koronto.', 'fixed',20,80),
  ('demo-cleaner-01','cleaning','Nadiifinta guryaha','Tusaale ballan nadaafad.', 'fixed',25,75),
  ('demo-moving-01','moving','Rarista alaabta guriga','Tusaale ballan rarid.', 'quote',null,null),
  ('demo-painter-01','painting','Rinjiyeynta gudaha iyo dibadda','Tusaale ballan rinjiyeyn.', 'quote',null,null),
  ('demo-carpenter-01','carpentry','Samaynta iyo hagaajinta alwaaxa','Tusaale ballan nijaar.', 'fixed',25,100),
  ('demo-appliance-repair-01','appliance-repair','Dayactirka qalabka guriga','Tusaale ballan qalab.', 'quote',null,null),
  ('demo-gardener-01','gardening','Daryeelka jardiinooyinka','Tusaale ballan beer-fal.', 'fixed',20,60)
) as x(demo_code, category_slug, title, description, price_type, price_min, price_max)
join public.providers p on p.demo_code=x.demo_code
join public.service_categories c on c.slug=x.category_slug;
