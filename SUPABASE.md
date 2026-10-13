# HelAdeeg + Supabase

Backend-ku waxa uu daboolayaa email/password Auth, profiles, adeeg-bixiyeyaasha iyo listings, codsiyada iyo xaaladahooda, reviews, reports, notifications, audit log, iyo kaydinta gaarka ah ee sawirrada/dukumiintiyada. Database-ka waxa lagu ilaaliyey Row Level Security (RLS). [Supabase waxay ku talisaa RLS miisaska API-gu arki karo.](https://supabase.com/docs/guides/database/postgres/row-level-security)

Project-ka HelADEEG ee hadda ku xiran: `bbbewkcqrsxjsswthngc`.

## 1. Samee project-ka

1. Ka samee project cusub [Supabase](https://supabase.com/dashboard).
2. Project Settings → API ka soo qaado **Project URL** iyo **publishable key** (ama anon key-gi hore).
3. Nuqul ka samee `.env.example` una bixi `.env.local`, kadib geli labada qiime:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
VITE_DEMO_MODE=false
```

Furaha `service_role` / `secret` ha gelin `.env.local`, browser, Expo bundle, ama Git. App-ku wuxuu adeegsanayaa oo keliya publishable/anon key; oggolaanshaha xogta waxaa xukuma RLS iyo database functions.

## 2. Ku rakib schema-ga

Habka CLI:

```sh
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Ama Supabase Dashboard → SQL Editor: marka hore orod `supabase/migrations/20261004000000_initial_schema.sql`, dabadeed `supabase/seed.sql`. Seed-ku wuxuu geliyaa qaybaha adeegga bilowga ah. Ha orodin migration-ka laba jeer si gacanta ah; CLI-gu isagaa la socda migrations-ka la dabaqay.

## 3. Auth settings

Authentication → URL Configuration ku dar URL-ka app-kaaga (inta Vite socdo, badanaa `http://localhost:3000`; hubi port-ka terminal-ka). Email confirmation waa la shidi karaa ama la damin karaa iyadoo ku xiran SMTP-ga aad dejisay. Marka confirmation-ku shidan yahay, user-ku email ayuu ka xaqiijinayaa ka hor login.

Signup-ka hadda waa email/password. Telefoonka waxa lagu kaydiyaa profile; phone OTP weli laguma darin maadaama uu u baahan yahay SMS provider iyo dejin dheeraad ah.

## 4. Maamulaha koowaad

Iska diiwaangeli app-ka, kadib Auth → Users ka hel UUID-ga user-ka. SQL Editor ku orod adiga oo UUID-ga ku beddelaya:

```sql
update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
```

Tani waa hawl maamulka project-ka, browser-ka ma laha awood uu qof iskaga dhigo admin. Ka bax oo mar kale soo gal si app-ku u helo role-ka cusub.

## 5. Orod app-ka

```sh
npm install
npm run dev
```

Haddii aad Expo Go wrapper-ka isticmaalayso, isla `.env.local` ayuu Vite ka akhriyaa; orod `npm run dev:expo`. Marka `.env.local` la abuuro ama la beddelo, jooji oo dib u bilow dev server-ka.

## Miisaska iyo xeerarka amniga

- Profile cusub waxaa si otomaatig ah u abuura trigger-ka Auth; dhammaan signup-yadu waxay ku bilaabmaan `customer`.
- Adeeg-bixiye wuxuu ku bilaabmaa `pending`; admin ayaa ku ansixiya `review_provider` RPC.
- Codsiyada iyo beddelka xaaladdooda waxay maraan RPC si actor-ka iyo kala dambaynta xaaladaha loo xaqiijiyo.
- Review waxaa la qori karaa oo keliya qofkii lahaa codsi dhammaaday.
- `provider-documents` iyo `request-photos` waa buckets gaar ah. Siyaasadaha Storage waxay xaddidaan upload/read/delete; [Storage policies](https://supabase.com/docs/guides/storage/security/access-control) ayaa go'aamiya gelitaanka faylasha.
- `profiles.role` iyo `providers.verification_status` user-ka caadiga ahi ma beddeli karo. Ha ka qaadin RLS ama grants-ka migration-ka.

## Xadka isku xirka UI-ga hadda

Login/signup, session/profile, category/provider akhris, codsi dirid/xaalad beddelid/claim, codsi provider, listing iyo availability, reviews, reports, admin go'aanka provider-ka/cabashada, notifications, iyo category CRUD waxay wacaan Supabase. Bogga maamulka isticmaalayaashu hadda wuxuu akhriyaa profiles-ka; xannibaad ama tirtirid user admin ah weli lama hirgelin. Dukumiintiyada provider-ka admin-ku wuxuu furan karaa iyadoo la adeegsanayo signed link gaaban.

Database-ka remote-ka hore ayuu u lahaa schema-ga, RPC-yada, policies-ka RLS, buckets-ka iyo categories-ka ay migration/seed-kani qeexaan. Waxaan isbarbar dhignay schema-ga, kadibna migration version-ka `20261004000000` ayaan ku diiwaangelinnay CLI-ga si uu ula ekaado xaaladda remote-ka; DDL-ka dib looma orodin si miisas iyo xog hore loo ilaaliyo. `npx supabase migration list --linked` ayaa xaqiijiyey in local iyo remote versions-ku is waafaqaan. Build-ka app-ka waa guulaystay; weli waxaa habboon in la tijaabiyo Auth iyo socodka customer/provider/admin gudaha app-ka.

## Website-ka PWA iyo Home Screen

App-ku wuxuu leeyahay web manifest, icons, service worker iyo badhanka **Ku rakib** ee browser-rada taageera. Expo Go wrapper-ka iyo PWA-gu waxay wada isticmaalaan isla web app-ka.

Si website-ka taleefanka loogu rakibo:

1. Samee build-ka adigoo adeegsanaya `npm run build`, kadibna ku daabac `dist/` hosting leh HTTPS (tusaale Vercel, Netlify ama domain/server-kaaga).
2. Browser-ka taleefanka ku fur URL-ka HTTPS ee la daabacay. Android/Chrome waxay muujin karaan **Ku rakib** ama **Install app**; iPhone/iPad Safari ka dooro **Share → Add to Home Screen**.
3. Service worker-ku wuxuu kaydiyaa app shell-ka iyo faylasha frontend-ka si boggu u furmo marka internetku go'an yahay. Xogta Supabase waxay u baahan tahay internet.

Localhost waxaa loo isticmaali karaa horumarinta, laakiin rakibidda website-ka taleefanka waxay u baahan tahay HTTPS. Marka release cusub la daabaco, beddel `CACHE_NAME` ee `public/sw.js` si browser-radu u soo qaataan faylasha cusub.
