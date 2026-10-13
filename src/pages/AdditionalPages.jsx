import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, BriefcaseBusiness, Check, CheckCircle2,
  ChevronRight, Clock3, FileText, Flag, HelpCircle, Inbox, LockKeyhole, MapPin,
  Eye, EyeOff, Plus, Search, Shield, ShieldCheck, Star, Trash2, UserRound, Wrench, X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { backend } from '../lib/api'
import ProviderCard from '../components/ProviderCard'
import StatusBadge from '../components/StatusBadge'
import RatingStars from '../components/RatingStars'
import { useLanguage, categoryLabel } from '../context/LanguageContext'

const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50'
const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
const field = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100'

function PageHeading({ eyebrow, title, description, back = false }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  return <div className="mb-5">
    {back && <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500"><ArrowLeft size={16} /> {t('common.back')}</button>}
    {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-primary-700">{eyebrow}</p>}
    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
  </div>
}

const demoNoteText = 'Muuqaal tijaabo ah: xogta halkan lagu daro weli server looma dirayo.'
function DemoNote({ children = demoNoteText }) {
  const { backendConfigured } = useApp()
  const { language } = useLanguage()
  if (backendConfigured && children === demoNoteText) return null
  const content = children === demoNoteText && language !== 'so'
    ? (language === 'ar' ? 'هذا عرض تجريبي؛ البيانات المضافة هنا لا تُحفظ على الخادم.' : 'Demo preview: information added here is not saved to a server.')
    : children
  return <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">{content}</div>
}

function TextField({ label, value, onChange, type = 'text', required = false, placeholder, error, ...props }) {
  return <label className="block space-y-1.5">
    <span className="text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500"> *</span>}</span>
    <input className={`${field} ${error ? 'border-red-400' : ''}`} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} {...props} />
    {error && <span className="text-xs text-red-600">{error}</span>}
  </label>
}

export function LoginPage({ admin = false }) {
  const { login, offlinePreview, backendConfigured } = useApp()
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => localStorage.getItem('heladeeg-remember-email') || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem('heladeeg-remember-email')))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim() || password.length < 6) {
      setError(t('login.validation'))
      return
    }
    if (offlinePreview) { setError(t('login.offline')); return }
    if (remember && email.trim()) localStorage.setItem('heladeeg-remember-email', email.trim())
    else localStorage.removeItem('heladeeg-remember-email')
    setLoading(true)
    try { await login(email.trim(), password); navigate(admin ? '/admin' : '/') }
    catch (e) { setError(e.code === 'ACCOUNT_PENDING' ? (language === 'en' ? 'Your account is waiting for admin approval.' : language === 'ar' ? 'حسابك ينتظر موافقة المسؤول.' : 'Akoonkaagu wuxuu sugayaa ansixinta admin-ka.') : e.code === 'ACCOUNT_REJECTED' ? (language === 'en' ? 'Your account was not approved. Contact support for help.' : language === 'ar' ? 'لم تتم الموافقة على حسابك. تواصل مع الدعم.' : 'Akoonka lama ansixin. La xiriir taageerada.') : e.message?.toLowerCase().includes('invalid login credentials') ? t('login.error.credentials') : e.message || (language === 'en' ? 'Login failed.' : language === 'ar' ? 'فشل تسجيل الدخول.' : 'Soo galiddu way fashilantay.')) }
    finally { setLoading(false) }
  }
  const requestReset = async () => {
    setError(''); setMessage('')
    if (!email.trim()) { setError(t('login.reset.email')); return }
    if (!backendConfigured) { setError(t('login.reset.notConfigured')); return }
    setResetLoading(true)
    try { await backend.requestPasswordReset(email.trim()); setMessage(language === 'en' ? 'If this email belongs to an account, a reset link has been sent. Check your inbox and spam folder.' : language === 'ar' ? 'إذا كان هذا البريد مرتبطًا بحساب، فسيصلك رابط لإعادة تعيين كلمة المرور. تحقق من الوارد والرسائل غير المرغوب فيها.' : t('login.reset.sent')) }
    catch (e) { setError(e.message || t('login.reset.error')) }
    finally { setResetLoading(false) }
  }

  return <div className="login-page login-page--editorial">
    <div className="login-editorial-photo" aria-hidden="true" />
    <div className="login-card login-card--editorial">
      <PageHeading eyebrow={admin ? (language === 'en' ? 'HelAdeeg · Admin' : language === 'ar' ? 'HelAdeeg · الإدارة' : 'HelAdeeg · maamulka') : ''} title={admin ? t('login.admin') : (language === 'en' ? 'Welcome Back' : language === 'ar' ? 'مرحبًا بعودتك' : 'Soo Dhawoow')} description={admin ? t('login.admin.description') : (language === 'en' ? 'Log in to your HELADEEG account to access trusted service professionals near you.' : language === 'ar' ? 'سجل الدخول إلى حسابك للعثور على محترفي الخدمات الموثوقين بالقرب منك.' : 'Gal akoonkaaga HELADEEG si aad u hesho xirfadlayaal adeeg oo lagu kalsoon yahay oo kuu dhow.')} />
      {!backendConfigured && <DemoNote>{import.meta.env.VITE_DEMO_MODE === 'true' ? 'Demo mode ayaa shaqaynaya; xogtu server kuma kaydsamayso.' : 'Supabase wali lama dejin. Geli keys-ka .env.local si aad u soo gasho.'}</DemoNote>}
      <form onSubmit={submit} className="login-editorial-form" noValidate>
        <label className="login-editorial-field"><span className="sr-only">{t('login.email')}</span><UserRound size={21} strokeWidth={1.5} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={language === 'en' ? 'Email address' : language === 'ar' ? 'البريد الإلكتروني' : 'Iimayl'} autoComplete="username" required /></label>
        <label className="login-editorial-field"><span className="sr-only">{t('login.password')}</span><LockKeyhole size={21} strokeWidth={1.5} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={language === 'en' ? 'Password' : language === 'ar' ? 'كلمة المرور' : 'Eray-sir'} autoComplete="current-password" /><button type="button" className="login-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></label>
        <div className="login-editorial-options"><label className="login-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>{language === 'en' ? 'Remember me' : language === 'ar' ? 'تذكرني' : 'I xasuuso'}</span></label><button type="button" disabled={resetLoading} onClick={requestReset}>{resetLoading ? t('login.reset.sending') : t('login.forgot')}</button></div>
        {error && <p role="alert" className="login-editorial-alert">{error}</p>}
        {message && <p role="status" className="login-editorial-message">{message}</p>}
        <button className="editorial-primary login-editorial-submit" disabled={loading}>{loading ? t('login.wait') : admin ? t('login.admin') : (language === 'en' ? 'Log In' : t('login.submit'))}<ArrowRight size={20} /></button>
      </form>
      {!admin && import.meta.env.VITE_DEMO_MODE === 'true' && <div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-2 text-xs font-semibold text-slate-500">Dhex mar demo-ga</p><div className="grid grid-cols-2 gap-2"><button className={secondary} onClick={()=>{login('provider','demo');navigate('/provider-dashboard')}}>Provider demo</button><button className={secondary} onClick={()=>{login('admin','demo');navigate('/admin')}}>Admin demo</button></div></div>}
      {!admin && <p className="login-editorial-signup">{language === 'en' ? 'Don’t have an account?' : language === 'ar' ? 'ليس لديك حساب؟' : 'Akoon ma lihid?'} <Link to="/signup">{language === 'en' ? 'Sign Up' : t('login.signup')}<ArrowRight size={16} /></Link></p>}
      <footer className="editorial-company login-editorial-company"><img src="/jannat-avenir-logo.png" alt="" /><span>JANNAT L’AVENIR</span></footer>
      {admin && <Link to="/login" className="mt-4 block text-center text-sm text-slate-500">{t('login.customerBack')}</Link>}
    </div>
  </div>
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function save(event) {
    event.preventDefault(); setError(''); setMessage('')
    if (password.length < 8 || password !== confirm) { setError(t('reset.error')); return }
    setSaving(true)
    try { await backend.updatePassword(password); setMessage(t('reset.success')); window.setTimeout(() => navigate('/login'), 1200) }
    catch (e) { setError(e.message || t('reset.linkError')) }
    finally { setSaving(false) }
  }
  return <div className="mx-auto max-w-md py-6"><div className="card p-6 sm:p-8"><PageHeading title={t('reset.title')} description={t('reset.description')}/><form className="space-y-4" onSubmit={save}><TextField label={t('reset.password')} type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/><TextField label={t('reset.confirm')} type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/>{error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message&&<p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}<button className={`${button} w-full`} disabled={saving}>{saving ? t('reset.saving') : t('reset.submit')}</button></form></div></div>
}

export function SignupPage() {
  const { signUp, offlinePreview, backendConfigured } = useApp()
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', consent: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmationRequired, setConfirmationRequired] = useState(true)
  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (form.name.trim().length < 3 || !form.email.trim() || form.password.length < 8 || form.confirm !== form.password || !form.consent) {
      setError(t('signup.error'))
      return
    }
    if (offlinePreview) { setError(language === 'en' ? 'You are offline. Try again when your connection returns.' : language === 'ar' ? 'لا يوجد اتصال بالإنترنت. حاول مرة أخرى عند عودة الاتصال.' : 'Internet ma jiro. Markuu soo noqdo isku day mar kale.'); return }
    setLoading(true)
    try { const result = await signUp(form); if (result?.pendingApproval && backendConfigured) { setConfirmationRequired(result.emailConfirmationRequired); setSuccess(true) } else navigate('/') } catch (e) { setError(e.message || 'Akoon sameyntu way fashilantay.') } finally { setLoading(false) }
  }
  return <div className="mx-auto max-w-xl py-6">
    <div className="card p-6 sm:p-8">
      <PageHeading eyebrow={t('signup.eyebrow')} title={t('signup.title')} description={backendConfigured ? t('signup.description') : (language === 'en' ? 'Create an account to explore the app.' : language === 'ar' ? 'أنشئ حسابًا لاستخدام التطبيق.' : 'Samee akoon si aad u tijaabiso shaashadaha.')} />
      <DemoNote />
      {success ? <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
        <p className="font-bold">{language === 'en' ? 'Account request received' : language === 'ar' ? 'تم استلام طلب الحساب' : 'Codsiga akoonka waa la helay'}</p>
        <p className="mt-1">{language === 'en' ? (confirmationRequired ? 'Confirm your email using the link we sent. ' : '') + 'Your account will stay pending until the admin approves it.' : language === 'ar' ? (confirmationRequired ? 'أكد بريدك من الرابط المرسل. ' : '') + 'سيبقى حسابك بانتظار موافقة المسؤول.' : (confirmationRequired ? 'Email-ka ka xaqiiji linkiga laguu soo diray. ' : '') + 'Akoonkaagu Pending ayuu ahaanayaa ilaa admin-ku ansixiyo.'}</p>
        <Link className="mt-3 inline-flex font-semibold text-primary-700 underline" to="/login">{t('signup.login')}</Link>
      </div> : <form onSubmit={submit} className="space-y-4">
        <TextField label={t('signup.name')} required value={form.name} onChange={change('name')} autoComplete="name" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Email" type="email" required value={form.email} onChange={change('email')} autoComplete="email" />
          <TextField label={t('signup.phone')} type="tel" value={form.phone} onChange={change('phone')} placeholder="+252..." autoComplete="tel" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={t('signup.password')} type="password" required value={form.password} onChange={change('password')} autoComplete="new-password" />
          <TextField label={t('signup.confirm')} type="password" required value={form.confirm} onChange={change('confirm')} autoComplete="new-password" />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.consent} onChange={change('consent')} className="mt-1" /> {language === 'en' ? <>I accept the <Link className="text-primary-700 underline" to="/terms">terms</Link> and <Link className="text-primary-700 underline" to="/privacy">privacy policy</Link>.</> : language === 'ar' ? <>أوافق على <Link className="text-primary-700 underline" to="/terms">الشروط</Link> و<Link className="text-primary-700 underline" to="/privacy">سياسة الخصوصية</Link>.</> : <>Waxaan aqbalay <Link className="text-primary-700 underline" to="/terms">shuruudaha</Link> iyo <Link className="text-primary-700 underline" to="/privacy">siyaasadda xogta</Link>.</>}</label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className={`${button} w-full`} disabled={loading}>{loading ? t('signup.loading') : t('signup.submit')}</button>
      </form>}
      <p className="mt-4 text-center text-sm text-slate-500">{t('signup.existing')} <Link className="font-semibold text-primary-700" to="/login">{t('signup.login')}</Link></p>
    </div>
  </div>
}

export function CategoryPage() {
  const { slug } = useParams()
  const { serviceCategories, providers } = useApp()
  const { language, t } = useLanguage()
  const category = serviceCategories.find((item) => item.id === slug || item.slug === slug)
  const results = providers.filter((provider) => provider.listings?.some((listing) => listing.category_id === category?.id))
  if (!category) return <Empty title={t('category.notFound')} action={t('common.searchProviders')} href="/search" />
  const name = categoryLabel(category, language)
  const description = language === 'so' ? category.description : category.description_en || (language === 'ar' ? `خدمات ${name} في مقديشو.` : `${name} service providers in Mogadishu.`)
  return <div>
    <PageHeading eyebrow={t('category.eyebrow')} title={name} description={description} />
    <div className="mb-5 flex items-center justify-between text-sm text-slate-500"><span>{results.length} {t('category.providers')}</span><Link to={`/search?category=${category.id}`} className="font-semibold text-primary-700">{t('category.filter')}</Link></div>
    {results.length ? <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{results.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div> : <Empty title={t('category.none')} action={t('category.other')} href="/search" />}
  </div>
}

export function NewRequestPage() {
  const { serviceCategories, neighborhoods, providers, submitRequest, user, offlinePreview, backendConfigured } = useApp()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState({ provider_id: '', listing_id: '', category_id: '', neighborhood: '', location_note: '', preferred_time: '', description: '', photo: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [createdId, setCreatedId] = useState('')
  const selectedProvider = providers.find((provider) => provider.id === form.provider_id)
  const availableListings = selectedProvider?.listings || []
  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.category_id) next.category_id = t('newRequest.errorCategory')
    if (!form.neighborhood) next.neighborhood = t('newRequest.errorArea')
    if (!form.preferred_time) next.preferred_time = t('newRequest.errorTime')
    if (form.description.trim().length < 10) next.description = t('newRequest.errorDetails')
    if (!user.isLoggedIn) next.account = t('newRequest.errorLogin')
    if (offlinePreview) next.network = t('newRequest.errorOffline')
    setErrors(next)
    if (Object.keys(next).length) return
    const category = serviceCategories.find((item) => item.id === form.category_id)
    const listing = availableListings.find((item) => item.id === form.listing_id)
    setLoading(true)
    try {
      const request = await submitRequest({
        provider_id: form.provider_id || null,
        provider_name: selectedProvider?.display_name || '',
        listing_id: listing?.id || null,
        category_id: form.category_id,
        category_name: category?.name_so || '',
        description: form.description.trim(),
        neighborhood: form.neighborhood,
        location_note: form.location_note.trim(),
        preferred_time: form.preferred_time.trim(),
        photo_file: form.photo_file || null,
      })
      if (request) setCreatedId(request.id)
      else setErrors({ network: t('newRequest.errorNetwork') })
    } finally { setLoading(false) }
  }
  if (createdId) return <div className="mx-auto max-w-2xl py-10"><div className="card p-7 text-center"><CheckCircle2 size={44} className="mx-auto text-green-600"/><h1 className="mt-4 text-2xl font-bold text-slate-900">{t('newRequest.success')}</h1><p className="mt-2 text-sm text-slate-600">{t('requests.reference')} <strong>{createdId}</strong>. {backendConfigured ? t('newRequest.saved') : t('newRequest.demo')}</p><Link to={`/requests/${createdId}`} className={`${button} mt-5`}>{t('newRequest.viewStatus')}</Link></div></div>
  return <div className="mx-auto max-w-2xl"><PageHeading back eyebrow={t('newRequest.eyebrow')} title={t('newRequest.title')} description={t('newRequest.intro')}/>
    <form className="card space-y-4 p-5 sm:p-7" onSubmit={submit}>
      <label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('newRequest.service')}<select className={field} value={form.category_id} onChange={(event)=>setForm({...form,category_id:event.target.value,listing_id:''})}><option value="">{t('newRequest.chooseService')}</option>{serviceCategories.map((category)=><option key={category.id} value={category.id}>{categoryLabel(category, language)}</option>)}</select>{errors.category_id&&<span className="text-xs text-red-600">{errors.category_id}</span>}</label>
      <label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('newRequest.providerOptional')}<select className={field} value={form.provider_id} onChange={(event)=>setForm({...form,provider_id:event.target.value,listing_id:''})}><option value="">{t('newRequest.autoProvider')}</option>{providers.filter((provider)=>provider.verification_status==='approved'&&provider.is_available!==false&&provider.listings?.some((listing)=>listing.category_id===form.category_id)).map((provider)=><option key={provider.id} value={provider.id}>{provider.display_name}</option>)}</select></label>
      {selectedProvider&&<label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('newRequest.customOptional')}<select className={field} value={form.listing_id} onChange={(event)=>setForm({...form,listing_id:event.target.value})}><option value="">{t('newRequest.chooseOne')}</option>{availableListings.filter((listing)=>listing.category_id===form.category_id).map((listing)=><option key={listing.id} value={listing.id}>{listing.title}</option>)}</select></label>}
      <label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('newRequest.neighborhood')}<select className={field} value={form.neighborhood} onChange={(event)=>setForm({...form,neighborhood:event.target.value})}><option value="">{t('newRequest.chooseArea')}</option>{neighborhoods.map((area)=><option key={area}>{area}</option>)}</select>{errors.neighborhood&&<span className="text-xs text-red-600">{errors.neighborhood}</span>}</label>
      <TextField label={t('newRequest.location')} value={form.location_note} onChange={(event)=>setForm({...form,location_note:event.target.value})} placeholder={t('newRequest.locationPlaceholder')} />
      <TextField label={t('newRequest.time')} required value={form.preferred_time} onChange={(event)=>setForm({...form,preferred_time:event.target.value})} placeholder={t('newRequest.timePlaceholder')} error={errors.preferred_time} />
      <label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('newRequest.work')}<textarea className={field} rows={4} maxLength={500} value={form.description} onChange={(event)=>setForm({...form,description:event.target.value})} placeholder={t('newRequest.workPlaceholder')}/><span className="text-xs text-slate-400">{form.description.length}/500</span>{errors.description&&<span className="block text-xs text-red-600">{errors.description}</span>}</label>
      <label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('newRequest.photo')}<input className={field} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event)=>{const file=event.target.files?.[0];if(!file)return;if(file.size>5*1024*1024){setErrors({...errors,photo:t('newRequest.photoTooLarge')});return}setForm({...form,photo:file.name,photo_file:file});setErrors({...errors,photo:''})}}/>{form.photo&&<span className="text-xs text-green-700">{t('newRequest.fileSaved').replace('{file}',form.photo)}</span>}{errors.photo&&<span className="block text-xs text-red-600">{errors.photo}</span>}</label>
      {errors.account&&<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{errors.account} <Link className="font-bold underline" to="/login">{t('nav.login')}</Link></p>}{errors.network&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.network}</p>}
      <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">{t('newRequest.privacy')}</p>
      <button className={`${button} w-full`} disabled={loading||offlinePreview}>{loading ? t('newRequest.sending') : t('newRequest.submit')}</button>
    </form>
  </div>
}

function Empty({ title, detail = 'Marka xog tijaabo ah la helo ayay halkan ka muuqan doontaa.', action, href = '/search' }) {
  return <div className="card flex flex-col items-center py-12 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100"><Inbox className="text-slate-400" /></div>
    <h2 className="mt-3 font-semibold text-slate-800">{title}</h2><p className="mt-1 max-w-sm text-sm text-slate-500">{detail}</p>
    {action && <Link to={href} className={`${button} mt-4`}>{action}</Link>}
  </div>
}

export function NotFoundPage() {
  return <div className="mx-auto max-w-xl py-10"><div className="card p-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Search size={24}/></div><h1 className="mt-4 text-xl font-bold text-slate-900">Bogga lama helin</h1><p className="mt-1 text-sm text-slate-500">Cinwaanka aad furtay sax ma aha ama bogga waa la raray.</p><Link to="/" className={`${button} mt-5`}>Ku noqo Hoyga</Link></div></div>
}

export function RequestDetailPage() {
  const { id } = useParams()
  const { requests, updateRequestStatus, user } = useApp()
  const { t, language } = useLanguage()
  const request = requests.find((item) => item.id === id)
  const [error, setError] = useState('')
  if (!request) return <Empty title={t('detail.notFound')} action={t('detail.back')} href="/requests" />
  const canView = user.isLoggedIn && (user.role === 'admin' || request.customer_id === user.id || request.provider_id === user.id)
  if (!canView) return <Empty title={t('detail.unavailable')} detail={t('detail.signInHint')} action={t('detail.signIn')} href="/login" />
  const steps = ['new', 'accepted', 'in_progress', 'completed']
  const position = steps.indexOf(request.status)
  const canCancel = request.customer_id === user.id && ['new', 'accepted'].includes(request.status)
  return <div className="mx-auto max-w-3xl">
    <PageHeading back eyebrow={`${t('requests.reference')} ${request.id}`} title={t('detail.title')} description={t('detail.description')} />
    <DemoNote />
    <div className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-slate-500">{t('detail.provider')}</p><p className="mt-1 text-lg font-bold text-slate-900">{request.provider_name || t('detail.providerPending')}</p></div><StatusBadge status={request.status} /></div>
      <div className="my-6 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2">
        <Detail label={t('detail.service')} value={request.category_name} /><Detail label={t('detail.neighborhood')} value={request.neighborhood} /><Detail label={t('detail.preferredTime')} value={request.preferred_time} /><Detail label={t('detail.date')} value={new Date(request.created_at).toLocaleString(language === 'so' ? 'so-SO' : language === 'ar' ? 'ar' : 'en')} />
      </div>
      <Detail label={t('detail.workDetails')} value={request.description} />
      <div className="mt-7">
        <h2 className="mb-4 font-bold text-slate-900">{t('detail.timeline')}</h2>
        <ol className="grid gap-3 sm:grid-cols-4">{steps.map((step, index) => <li key={step} className={`rounded-xl border p-3 ${index <= position ? 'border-primary-200 bg-primary-50' : 'border-slate-100 bg-slate-50'}`}><div className="flex items-center gap-2 text-sm font-semibold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary-700">{index < position ? <Check size={14} /> : index + 1}</span>{({ new: t('detail.sent'), accepted: t('detail.accepted'), in_progress: t('detail.progress'), completed: t('detail.completed') })[step]}</div></li>)}</ol>
        {!steps.includes(request.status) && <p className="mt-2 text-sm text-amber-700">Xaalad: {request.status}</p>}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-2">
        {canCancel && <button className={secondary} onClick={() => { if (!updateRequestStatus(request.id, 'cancelled')) setError(language === 'en' ? 'This request cannot be cancelled right now.' : language === 'ar' ? 'لا يمكن إلغاء هذا الطلب الآن.' : 'Codsiga lama joojin karo hadda.') }}>{t('detail.cancel')}</button>}
        {request.status === 'completed' && <Link className={button} to={`/providers/${request.provider_id}/reviews`}>{t('detail.rate')} <Star size={16} /></Link>}
        <Link className={secondary} to={`/help?request=${request.id}`}>{t('detail.report')} <Flag size={16} /></Link>
      </div>
    </div>
  </div>
}

function Detail({ label, value }) { return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-800">{value || '—'}</p></div> }

export function AccountPage() {
  const { user, updateProfile, login } = useApp()
  const { t, language, setLanguage } = useLanguage()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || '+252 ')
  const [locale, setLocale] = useState(language)
  useEffect(() => { setLocale(language) }, [language])
  if (!user.isLoggedIn) return <div className="mx-auto max-w-xl"><PageHeading title={t('account.title')} description={t('account.signInHint')} /><div className="card p-5"><Link className={button} to="/login">{t('account.signIn')}</Link><Link className={`${secondary} ml-2`} to="/signup">{t('account.create')}</Link></div></div>
  return <div className="mx-auto max-w-2xl"><PageHeading title={t('account.personal')} description={t('account.personalHint')} /><DemoNote /><form className="card space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); updateProfile({ name, phone, locale }) }}><TextField label={t('account.fullName')} required value={name} onChange={(event) => setName(event.target.value)} /><TextField label={t('account.phone')} type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /><label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">{t('account.language')}</span><select className={field} value={locale} onChange={(event) => { setLocale(event.target.value); setLanguage(event.target.value) }}><option value="en">English</option><option value="so">Af-Soomaali</option><option value="ar">العربية</option></select></label><button className={button}>{t('account.save')}</button></form><div className="mt-4 card p-5"><h2 className="font-bold text-slate-900">{t('account.security')}</h2><p className="mt-1 text-sm text-slate-500">{t('account.securityHint')}</p><div className="mt-4 flex flex-wrap gap-2"><Link to="/privacy" className={secondary}>{t('footer.privacy')}</Link><Link to="/terms" className={secondary}>{t('footer.terms')}</Link><button className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700" onClick={() => window.alert(language === 'en' ? 'Account deletion requests will be connected to the backend.' : language === 'ar' ? 'سيتم ربط طلب حذف الحساب بالخادم.' : 'Codsiga tirtiridda akoonka waxaa lagu xiri doonaa backend-ka.')}>{t('account.delete')}</button></div></div></div>
}

export function ProviderServicesPage() {
  const { providers, serviceCategories, upsertListing, removeListing, updateProviderAvailability, user, offlinePreview } = useApp()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ category_id: serviceCategories[0]?.id || '', title: '', price_type: 'quote', price_min: '', price_max: '', description: '' })
  const provider = providers.find((item) => item.id === user.id || item.user_id === user.id) || providers[0]
  const listings = provider?.listings || []
  const save = (event) => { event.preventDefault(); if (!form.title.trim() || offlinePreview) return; upsertListing({ ...form, id: editing || undefined }); setEditing(null); setForm({ category_id: serviceCategories[0]?.id || '', title: '', price_type: 'quote', price_min: '', price_max: '', description: '' }) }
  return <div className="mx-auto max-w-4xl"><PageHeading title="Adeegyadayda" description="Ku dar ama wax ka beddel adeegyada iyo qiimaha aad tilmaamayso." /><DemoNote /><div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4"><div><h2 className="font-bold text-slate-900">Xaaladda helitaanka</h2><p className="mt-1 text-sm text-slate-500">U sheeg macaamiisha inaad qaadanayso codsiyo cusub.</p></div><button disabled={offlinePreview} className={provider?.is_available===false?'btn-secondary':button} onClick={()=>updateProviderAvailability(provider?.is_available===false)}>{provider?.is_available===false?'Ma qaadanayo codsiyo':'Waan diyaar ahay'}</button></div>
    <form className="card mb-5 space-y-4 p-5" onSubmit={save}><h2 className="font-bold">{editing ? 'Wax ka beddel adeeg' : 'Ku dar adeeg cusub'}</h2><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium text-slate-700">Qaybta<select className={field} value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}>{serviceCategories.map((category) => <option key={category.id} value={category.id}>{category.name_so}</option>)}</select></label><TextField label="Magaca adeegga" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Tusaale: Hagaajinta korontada" /></div><label className="block space-y-1.5 text-sm font-medium text-slate-700">Faahfaahin<textarea className={field} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="grid gap-4 sm:grid-cols-3"><label className="space-y-1.5 text-sm font-medium text-slate-700">Qaabka qiimaha<select className={field} value={form.price_type} onChange={(event) => setForm({ ...form, price_type: event.target.value })}><option value="quote">Qiime la isla garto</option><option value="fixed">Qiime qiyaas ah</option></select></label>{form.price_type === 'fixed' && <><TextField label="Ugu yar ($)" type="number" min="0" value={form.price_min} onChange={(event) => setForm({ ...form, price_min: event.target.value })} /><TextField label="Ugu badan ($)" type="number" min="0" value={form.price_max} onChange={(event) => setForm({ ...form, price_max: event.target.value })} /></>}</div><div className="flex gap-2"><button className={button}><Plus size={16} />{editing ? 'Kaydi wax ka beddelka' : 'Ku dar adeegga'}</button>{editing && <button className={secondary} type="button" onClick={() => setEditing(null)}>Jooji</button>}</div></form>
    {listings.length ? <div className="grid gap-3 md:grid-cols-2">{listings.map((listing) => <article className="card p-5" key={listing.id}><div className="flex items-start justify-between gap-3"><div><span className="chip bg-primary-50 text-primary-700">{serviceCategories.find((category) => category.id === listing.category_id)?.name_so}</span><h3 className="mt-2 font-bold text-slate-900">{listing.title}</h3></div><Wrench className="text-primary-600" size={20} /></div><p className="mt-2 text-sm text-slate-500">{listing.description || 'Faahfaahin laguma darin.'}</p><p className="mt-3 text-sm font-semibold text-slate-700">{listing.price_type === 'fixed' ? `$${listing.price_min || '—'} – $${listing.price_max || '—'}` : 'Qiime la isla garto'}</p><div className="mt-4 flex gap-2"><button className={secondary} onClick={() => { setForm({ ...listing, description: listing.description || '' }); setEditing(listing.id) }}>Wax ka beddel</button><button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700" onClick={() => removeListing(listing.id)}>Ka saar</button></div></article>)}</div> : <Empty title="Adeeg weli laguma darin" detail="Isticmaal foomka kore si aad ugu darto adeeggaaga koowaad." />}
  </div>
}

export function ProviderRequestsPage() {
  const { requests, user, providers, updateRequestStatus } = useApp()
  const provider = providers.find((item) => item.id === user.id || item.user_id === user.id) || providers[0]
  const [filter, setFilter] = useState('all')
  const mine = requests.filter((request) => request.provider_id === provider?.id)
  const visible = filter === 'all' ? mine : mine.filter((request) => request.status === filter)
  return <div><PageHeading title="Codsiyada la ii soo diray" description="Eeg faahfaahinta codsiyada oo ka jawaab kuwa cusub." /><DemoNote /><div className="mb-4 flex flex-wrap gap-2">{[['all','Dhammaan'],['new','Cusub'],['accepted','La aqbalay'],['in_progress','Socda'],['completed','Dhammaaday']].map(([key,label]) => <button key={key} onClick={() => setFilter(key)} className={`chip ${filter===key?'bg-primary-600 text-white':'border border-slate-200 bg-white text-slate-600'}`}>{label}</button>)}</div>{visible.length ? <div className="space-y-3">{visible.map((request) => <article className="card p-5" key={request.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><Link className="font-bold text-slate-900 hover:text-primary-700" to={`/requests/${request.id}`}>{request.customer_name}</Link><p className="mt-1 text-sm text-slate-500">{request.category_name} · {request.neighborhood} · {request.preferred_time}</p></div><StatusBadge status={request.status} /></div><p className="mt-3 text-sm text-slate-700">{request.description}</p><div className="mt-4 flex flex-wrap gap-2"><Link className={secondary} to={`/requests/${request.id}`}>Faahfaahinta</Link>{request.status==='new' && <><button className={button} onClick={() => updateRequestStatus(request.id,'accepted')}>Aqbal</button><button className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700" onClick={() => updateRequestStatus(request.id,'declined')}>Diid</button></>}{request.status==='accepted' && <button className={button} onClick={() => updateRequestStatus(request.id,'in_progress')}>Bilaab shaqada</button>}{request.status==='in_progress' && <button className={button} onClick={() => updateRequestStatus(request.id,'completed')}>Dhammee shaqada</button>}</div></article>)}</div> : <Empty title="Codsiyo laguma helin shaandhayntan" action="Eeg dashboard-ka" href="/provider-dashboard" />}</div>
}

export function ReviewsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { providers, reviews, requests, addReview, user, offlinePreview } = useApp()
  const provider = providers.find((item) => item.id === id) || providers[0]
  const current = reviews.filter((review) => review.provider_id === provider?.id)
  const eligible = requests.filter((request) => request.provider_id === provider?.id && request.customer_id === user.id && request.status === 'completed' && !reviews.some((review) => review.request_id === request.id))
  const averageRating = current.length ? current.reduce((total, review) => total + Number(review.rating || 0), 0) / current.length : 0
  const [requestId, setRequestId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const submit = async (event) => { event.preventDefault(); if (!user.isLoggedIn) { navigate('/login'); return } if (offlinePreview) { setError('Internet ma jiro. Qiimeynta lama dirin.'); return } if (!requestId || comment.trim().length < 8) { setError('Dooro codsi dhammaystiran oo geli faallo ugu yaraan 8 xaraf ah.'); return } try { await addReview({ request_id: requestId, provider_id: provider.id, rating, comment: comment.trim() }); setComment(''); setRequestId(''); setError('') } catch (e) { setError(e.message || 'Qiimeynta lama kaydin. Isku day mar kale.') } }
  return <div className="mx-auto max-w-3xl"><PageHeading back title={`Qiimeynta ${provider?.display_name || 'adeeg-bixiyaha'}`} description="Akhriso faallooyinka, kuna dar qiimeyn tijaabo ah." /><DemoNote /><section className="card mb-5 flex flex-wrap items-center gap-4 p-5"><div><p className="text-3xl font-extrabold text-slate-900">{averageRating?averageRating.toFixed(1):'—'}</p><RatingStars rating={averageRating}/><p className="mt-1 text-xs text-slate-500">{current.length} qiimeyn</p></div><div className="flex-1 space-y-1">{[5,4,3,2,1].map((value)=>{const count=current.filter((review)=>Number(review.rating)===value).length;return <div key={value} className="flex items-center gap-2 text-xs text-slate-500"><span className="w-8">{value} ★</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{width:`${current.length?count/current.length*100:0}%`}}/></div><span className="w-5 text-right">{count}</span></div>})}</div></section>
    <form className="card mb-5 space-y-3 p-5" onSubmit={submit}><h2 className="font-bold text-slate-900">Ku dar qiimeyn</h2>{eligible.length ? <label className="block space-y-1.5 text-sm font-medium text-slate-700">Codsiga la dhammaystiray<select className={field} value={requestId} onChange={(event) => setRequestId(event.target.value)}><option value="">Dooro codsiga...</option>{eligible.map((request)=><option key={request.id} value={request.id}>{request.id} · {request.category_name}</option>)}</select></label> : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Qiimeyn waxaa lagu dari karaa codsi adeeg oo dhammaystiran oo adiga kuu gaar ah. Hadda ma jiro codsi noocaas ah oo sugaya qiimeyn.</p>}<label className="block text-sm font-medium text-slate-700">Xiddigaha<select className={`${field} mt-1`} value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5,4,3,2,1].map((value) => <option value={value} key={value}>{value} / 5</option>)}</select></label><label className="block space-y-1.5 text-sm font-medium text-slate-700">Faallada<textarea className={field} rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Sidee ayuu adeeggu ahaa?" /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button className={button} disabled={!eligible.length}>Gudbi qiimeynta</button></form>
    <div className="space-y-3">{current.length ? current.map((review) => <article className="card p-5" key={review.id}><div className="flex items-center justify-between"><p className="font-semibold text-slate-900">{review.customer_name}</p><span className="text-xs text-slate-400">{review.created_at}</span></div><RatingStars rating={review.rating} /><p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p></article>) : <Empty title="Faallo weli lama qorin" />}</div>
  </div>
}

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, user } = useApp()
  const { t } = useLanguage()
  const mine = user.isLoggedIn ? notifications.filter((item) => item.user_id === user.id) : []
  const unread = mine.filter((item) => !item.read_at).length
  return <div className="mx-auto max-w-3xl"><PageHeading title={t('notifications.title')} description={t('notifications.description')} /><DemoNote /><div className="mb-4 flex items-center justify-between"><span className="text-sm text-slate-500">{unread} {t('notifications.unread')}</span><button className={secondary} onClick={markAllNotificationsRead}>{t('notifications.readAll')}</button></div>{mine.length ? <div className="space-y-2">{mine.map((item) => <article key={item.id} className={`card flex items-start gap-3 p-4 ${!item.read_at?'border-primary-200 bg-primary-50/50':''}`}><div className="rounded-xl bg-white p-2 text-primary-700"><Bell size={18} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.body}</p><p className="mt-2 text-xs text-slate-400">{item.created_at}</p></div>{!item.read_at && <button className="text-xs font-semibold text-primary-700" onClick={() => markNotificationRead(item.id)}>{t('notifications.read')}</button>}</article>)}</div> : <Empty title={t('notifications.none')} detail={t('notifications.noneHint')} />}</div>
}

export function HelpPage() {
  const { addReport, requests, providers, setOfflinePreview, offlinePreview, backendConfigured, user, ownerSettings } = useApp()
  const { language, t } = useLanguage()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ target_type: 'provider', target_id: '', reason: '', details: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const messages = {
    en: ['Your report will be sent to the HelAdeeg team.', 'Support and reports are in demo mode.', 'Your report was recorded and is available for admin review.', 'Choose an item', 'Choose a reason…', 'Preview the message shown when the network disconnects.', 'You are offline. No data was sent; try again when you reconnect.', 'Log in before submitting a report.', 'You are offline. The report was not sent.', 'Choose a reason and enter at least 10 characters.', 'The report could not be saved. Try again.', 'Contact', 'Terms of service'],
    so: ['Warbixintaada waxaa loo gudbinayaa maamulka HelAdeeg.', 'Taageerada iyo warbixinnadu wali waa muuqaal tijaabo ah.', 'Warbixinta tijaabada waa la diiwaangeliyey. Maamulka ayaa ka arki kara qaybta cabashooyinka.', 'Dooro xogta', 'Dooro sababta...', 'Ku dayo fariinta app-ku soo bandhigayo marka network-ku go’o.', 'Internet ma jiro. Xog cusub lama dirin; isku day mar kale marka xiriirku soo noqdo.', 'Soo gal ka hor intaadan warbixin gudbin.', 'Internet ma jiro. Warbixinta lama gudbin.', 'Dooro sabab oo faahfaahi ugu yaraan 10 xaraf.', 'Warbixinta lama kaydin. Mar kale isku day.', 'Xiriir', 'Shuruudaha adeegga'],
    ar: ['سيتم إرسال بلاغك إلى فريق HelAdeeg.', 'الدعم والبلاغات في الوضع التجريبي.', 'تم تسجيل بلاغك ويمكن للإدارة مراجعته ضمن التقارير.', 'اختر عنصرًا', 'اختر سببًا…', 'معاينة الرسالة التي تظهر عند انقطاع الشبكة.', 'لا يوجد اتصال. لم يتم إرسال بيانات؛ حاول مجددًا عند عودة الاتصال.', 'سجّل الدخول قبل إرسال البلاغ.', 'لا يوجد اتصال. لم يتم إرسال البلاغ.', 'اختر سببًا واكتب 10 أحرف على الأقل.', 'تعذر حفظ البلاغ. حاول مرة أخرى.', 'تواصل', 'شروط الخدمة'],
  }[language]
  const submit = async (event) => {
    event.preventDefault()
    if (!user.isLoggedIn) { setError(messages[7]); return }
    if (offlinePreview) { setError(messages[8]); return }
    if (!form.reason || form.details.trim().length < 10) { setError(messages[9]); return }
    try { await addReport({ ...form, request_id: params.get('request') || undefined }); setSent(true); setError('') }
    catch (e) { setError(e.message || messages[10]) }
  }
  const reasons = language === 'en' ? ['Safety or misconduct', 'Service not provided', 'Price disagreement', 'Incorrect information', 'Other'] : language === 'ar' ? ['مشكلة سلامة أو سلوك', 'لم يتم تقديم الخدمة', 'خلاف حول السعر', 'معلومات غير صحيحة', 'سبب آخر'] : ['Amni ama dhaqan xumo', 'Adeeg aan la bixin', 'Qiime aan lagu heshiin', 'Xog khaldan', 'Sabab kale']
  return <div className="mx-auto max-w-3xl"><PageHeading title={t('help.title')} description={t('help.description')} /><DemoNote />
    <section className="card mb-5 p-5"><div className="flex items-center gap-2"><HelpCircle className="text-primary-600" /><h2 className="font-bold">{t('help.support')}</h2></div><p className="mt-2 text-sm text-slate-600">{backendConfigured ? messages[0] : messages[1]}</p>{ownerSettings.support_contact && <p className="mt-2 text-sm font-semibold text-primary-700">{messages[11]}: {ownerSettings.support_contact}</p>}<div className="mt-4 grid gap-2 sm:grid-cols-2"><Link to="/privacy" className={secondary}>{t('footer.privacy')}</Link><Link to="/terms" className={secondary}>{messages[12]}</Link></div></section>
    <section className="card p-5"><h2 className="font-bold text-slate-900">{t('help.report')}</h2>{sent ? <p role="status" className="mt-3 rounded-xl bg-green-50 p-4 text-sm text-green-800">{messages[2]}</p> : <form onSubmit={submit} className="mt-4 space-y-4"><label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('help.target')}<select className={field} value={form.target_type} onChange={(event) => setForm({ ...form, target_type: event.target.value, target_id: '' })}><option value="provider">{t('help.provider')}</option><option value="request">{t('help.request')}</option></select></label><label className="block space-y-1.5 text-sm font-medium text-slate-700">{messages[3]}<select className={field} value={form.target_id} onChange={(event) => setForm({ ...form, target_id: event.target.value })}><option value="">{t('help.choose')}...</option>{form.target_type === 'request' ? requests.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.category_name}</option>) : providers.map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}</select></label><label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('help.reason')}<select className={field} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })}><option value="">{messages[4]}</option>{reasons.map((reason) => <option key={reason}>{reason}</option>)}</select></label><label className="block space-y-1.5 text-sm font-medium text-slate-700">{t('help.details')}<textarea className={field} rows={4} value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button className={button}><Flag size={16} /> {t('help.submit')}</button></form>}</section>
    <section className="card mt-5 p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">{t('help.offline')}</h2><p className="mt-1 text-sm text-slate-500">{messages[5]}</p></div><button className={offlinePreview ? 'btn-danger' : 'btn-secondary'} onClick={() => setOfflinePreview(!offlinePreview)}>{offlinePreview ? t('help.turnOff') : t('help.turnOn')}</button></div>{offlinePreview && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{messages[6]}</p>}</section>
  </div>
}
export function AdminProvidersPage() {
  const { providers, verifyProvider, getProviderDocumentUrl, showToast } = useApp()
  const [reason, setReason] = useState({})
  const [documentUrls, setDocumentUrls] = useState({})
  const [filter, setFilter] = useState('pending')
  const visible = providers.filter((provider) => filter==='all' || provider.verification_status===filter)
  const openDocument = async (provider) => {
    if (!provider.verification_document_path) return
    try { const url = await getProviderDocumentUrl(provider.verification_document_path); setDocumentUrls(current=>({...current,[provider.id]:url})) }
    catch (error) { showToast(error.message || 'Dukumiintiga lama furi karin.','error') }
  }
  return <div><PageHeading title="Hubinta adeeg-bixiyeyaasha" description="Dib u eeg xogta tijaabada, kadib geli sababta go’aanka." /><DemoNote />
    <div className="mb-4 flex gap-2">{[['pending','Sugaya'],['approved','La ansixiyey'],['rejected','La diiday'],['all','Dhammaan']].map(([key,label])=><button key={key} onClick={()=>setFilter(key)} className={`chip ${filter===key?'bg-primary-600 text-white':'border border-slate-200 bg-white text-slate-600'}`}>{label}</button>)}</div>
    {visible.length?<div className="space-y-3">{visible.map((provider)=><article className="card p-5" key={provider.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">{provider.display_name}</h2><p className="mt-1 text-sm text-slate-500">{provider.years_experience} sano · {provider.service_area?.join(', ')}</p><p className="mt-2 text-sm text-slate-700">{provider.bio}</p></div><span className="chip bg-amber-50 text-amber-800">{provider.verification_status}</span></div><div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"><FileText size={16} className="mr-2 inline" />{provider.verification_document_name || 'Dukumiinti kuma xirna'}{provider.verification_document_path && <>{' · '}<button className="font-semibold text-primary-700 underline" onClick={()=>openDocument(provider)}>Abuur link ammaan ah</button>{documentUrls[provider.id] && <a className="ml-3 font-semibold text-primary-700 underline" href={documentUrls[provider.id]} target="_blank" rel="noreferrer">Fur dukumiintiga</a>}</>}</div>{provider.verification_status==='pending'&&<div className="mt-4 space-y-3"><label className="block space-y-1 text-sm font-medium text-slate-700">Sababta go’aanka<textarea className={field} rows={2} value={reason[provider.id]||''} onChange={(event)=>setReason({...reason,[provider.id]:event.target.value})} placeholder="Geli sababta; diidmada sabab bay u baahan tahay." /></label><div className="flex gap-2"><button className={button} onClick={()=>verifyProvider(provider.id,'approved',reason[provider.id])}><CheckCircle2 size={16}/> Ansixi</button><button disabled={!reason[provider.id]?.trim()} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-50" onClick={()=>verifyProvider(provider.id,'rejected',reason[provider.id])}><X size={16}/> Diid</button></div></div>}{provider.verification_reason&&<p className="mt-3 text-sm text-slate-600">Sababta: {provider.verification_reason}</p>}</article>)}</div>:<Empty title="Ma jiraan adeeg-bixiyeyaal xaaladdan ku jira" />}
  </div>
}

export function AdminCategoriesPage() {
  const { allCategories, upsertCategory, offlinePreview } = useApp()
  const [form, setForm] = useState({ name_so:'', name_en:'', slug:'' })
  const [editing, setEditing] = useState(null)
  const save = (event) => { event.preventDefault(); if (!form.name_so.trim() || !form.slug.trim() || offlinePreview) return; upsertCategory({ ...form, id: editing || undefined }); setForm({ name_so:'', name_en:'', slug:'' }); setEditing(null) }
  return <div><PageHeading title="Maamulka qaybaha" description="Samee, wax ka beddel ama qari qaybaha adeegga." /><DemoNote /><form className="card mb-5 grid gap-3 p-5 sm:grid-cols-4" onSubmit={save}><TextField label="Magaca Soomaaliga" required value={form.name_so} onChange={(event)=>setForm({...form,name_so:event.target.value})}/><TextField label="Magaca English" value={form.name_en} onChange={(event)=>setForm({...form,name_en:event.target.value})}/><TextField label="Slug" required value={form.slug} onChange={(event)=>setForm({...form,slug:event.target.value.toLowerCase().replace(/\s+/g,'-')})}/><button disabled={offlinePreview} className={`${button} self-end`}><Plus size={16}/>{editing?'Kaydi':'Ku dar'}</button></form><div className="card divide-y divide-slate-100">{allCategories.map((category)=><div key={category.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold text-slate-900">{category.name_so} <span className="font-normal text-slate-400">/ {category.name_en || '—'}</span></p><p className="text-xs text-slate-500">/{category.slug || category.id} · {category.is_active===false?'Qarsan':'Firfircoon'}</p></div><div className="flex gap-2"><button disabled={offlinePreview} className={secondary} onClick={()=>{setEditing(category.id);setForm({name_so:category.name_so,name_en:category.name_en||'',slug:category.slug||category.id})}}>Wax ka beddel</button><button disabled={offlinePreview} className={category.is_active===false?button:'rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800'} onClick={()=>upsertCategory({...category,is_active:category.is_active===false})}>{category.is_active===false?'Dib u muuji':'Qari'}</button></div></div>)}</div></div>
}

export function AdminReportsPage() {
  const { complaints, resolveReport } = useApp()
  const [notes, setNotes] = useState({})
  const open = complaints.filter((item)=>item.status!=='resolved')
  const resolved = complaints.filter((item)=>item.status==='resolved')
  return <div><PageHeading title="Cabashooyinka iyo warbixinnada" description="Baadh warbixinnada, qor go’aanka, kuna calaamadee xallisan." /><DemoNote /><div className="mb-4 flex gap-2"><span className="chip bg-amber-50 text-amber-800">Furan: {open.length}</span><span className="chip bg-green-50 text-green-800">La xalliyey: {resolved.length}</span></div>{complaints.length?<div className="space-y-3">{complaints.map((item)=><article className="card p-5" key={item.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">{item.reason||item.subject}</h2><p className="mt-1 text-xs text-slate-500">{item.requester} · {item.created_at} · {item.target_type||'Cabasho'}</p></div><span className={`chip ${item.status==='resolved'?'bg-green-50 text-green-800':'bg-amber-50 text-amber-800'}`}>{item.status==='resolved'?'La xalliyey':'Furan'}</span></div><p className="mt-3 text-sm text-slate-700">{item.details||item.subject}</p>{item.status!=='resolved'?<div className="mt-4 flex flex-col gap-2 sm:flex-row"><input className={field} placeholder="Qor go’aanka iyo tallaabada la qaaday" value={notes[item.id]||''} onChange={(event)=>setNotes({...notes,[item.id]:event.target.value})}/><button className={button} onClick={()=>resolveReport(item.id,notes[item.id]||'Waa la baaray; tallaabada xigta waa la diiwaangeliyey.')}>Xalli cabashada</button></div>:<p className="mt-3 text-sm text-green-800">Go’aan: {item.resolution_note}</p>}</article>)}</div>:<Empty title="Warbixin ma jirto" detail="Marka warbixin la soo gudbiyo ayaa halkan lagu muujin doonaa." />}</div>
}

export function AdminUsersPage() {
  const { users, user, refreshUsers, showToast, setUserSuspension, setUserApproval } = useApp()
  async function changeRole(item, role) {
    if (!user.isOwner || item.id === user.id || !window.confirm(`Ma hubtaa inaad doorka ${item.full_name || item.email} u beddelayso ${role}?`)) return
    try { await backend.changeUserRole(item.id, role); await refreshUsers(); showToast('Doorka waa la beddelay.') } catch (error) { showToast(error.message, 'error') }
  }
  async function toggleSuspension(item) {
    if (!user.isOwner || item.id === user.id) return
    if (item.suspended_at) {
      if (window.confirm(`Dib ma u hawlgelinaysaa akoonka ${item.full_name || item.email}?`)) await setUserSuspension(item.id, false)
      return
    }
    const reason = window.prompt(`Sababta loo joojinayo akoonka ${item.full_name || item.email}:`)
    if (reason?.trim()) await setUserSuspension(item.id, true, reason.trim())
  }
  return <div><PageHeading title="Isticmaaleyaasha" description={`${users.length} akoon - owner-ka ayaa ansixiya akoonnada cusub, maamula roles iyo joojinta`} /><div className="card divide-y divide-slate-100">{users.length ? users.map((item)=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><UserRound className={item.approval_status==='pending'?'text-amber-500':item.suspended_at?'text-red-500':'text-slate-400'}/><div><p className="font-semibold text-slate-900">{item.full_name || 'Magac lama gelin'}</p><p className="text-xs text-slate-500">{item.email} | {item.phone || 'Telefoon ma jiro'}</p>{item.suspended_at&&<p className="mt-1 text-xs text-red-700">La joojiyey: {item.suspension_reason}</p>}</div></div><div className="flex flex-wrap items-center justify-end gap-2"><div className="text-right"><p className={`text-sm font-medium ${item.approval_status==='pending'?'text-amber-700':item.approval_status==='rejected'?'text-red-700':item.suspended_at?'text-red-700':'text-slate-800'}`}>{item.approval_status==='pending'?'Sugaya ansixin':item.approval_status==='rejected'?'Waa la diiday':item.suspended_at?'Akoon la joojiyey':item.role === 'admin' ? 'Maamule' : item.role === 'provider' ? 'Adeeg-bixiye' : 'Macmiil'}</p><p className="text-xs text-slate-500">{item.provider_status || new Date(item.created_at).toLocaleDateString('so-SO')}</p>{user.isOwner && item.id !== user.id && <select className={`${field} mt-2`} value={item.role} onChange={e=>changeRole(item,e.target.value)}><option value="customer">Macmiil</option><option value="provider">Adeeg-bixiye</option><option value="admin">Maamule</option></select>}</div>{user.isOwner&&item.id!==user.id&&<>{(item.approval_status==='pending'||item.approval_status==='rejected')&&<button className={button} onClick={()=>setUserApproval(item.id,'approved').catch(()=>{})}>Ansixi</button>}{item.approval_status==='pending'&&<button className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700" onClick={()=>setUserApproval(item.id,'rejected').catch(()=>{})}>Diid</button>}<button className={item.suspended_at?secondary:'rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700'} onClick={()=>toggleSuspension(item)}>{item.suspended_at?'Dib u hawlgeli':'Jooji akoonka'}</button></>}</div></div>) : <div className="p-8 text-center text-sm text-slate-500">Akoonno Supabase ah lama helin.</div>}</div></div>
}

export function AdminAuditPage() {
  const { auditLog } = useApp()
  return <div><PageHeading title="Diiwaanka maamulka" description="Tallaabooyinka maamulka ee demo-ga iyo sababaha go’aanka."/><DemoNote/>{auditLog.length?<div className="space-y-2">{auditLog.map((entry)=><article key={entry.id} className="card flex flex-wrap items-start justify-between gap-3 p-4"><div><p className="font-semibold text-slate-900">{entry.action} <span className="font-normal text-slate-500">· {entry.target}</span></p><p className="mt-1 text-sm text-slate-600">{entry.note}</p><p className="mt-2 text-xs text-slate-400">{entry.admin} · {entry.created_at}</p></div><ShieldCheck className="text-primary-700" size={18}/></article>)}</div>:<Empty title="Tallaabo maamul weli lama diiwaangelin" detail="Ansixi adeeg-bixiye, maamul qayb, ama xalli warbixin si aad u aragto diiwaanka tijaabada."/>}</div>
}

export function AdminSettingsPage() {
  const { user, ownerSettings, saveOwnerSettings, backendConfigured } = useApp()
  const [areas, setAreas] = useState('')
  const [support, setSupport] = useState('')
  const [appName, setAppName] = useState('HelAdeeg')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    setAreas(Array.isArray(ownerSettings.service_areas) ? ownerSettings.service_areas.join('\n') : '')
    setSupport(ownerSettings.support_contact || '')
    setAppName(ownerSettings.app_name || 'HelAdeeg')
  }, [ownerSettings])
  async function save(event) {
    event.preventDefault(); setSaving(true)
    try { await saveOwnerSettings({ app_name: appName.trim(), support_contact: support.trim(), service_areas: areas.split(/\r?\n/).map(value=>value.trim()).filter(Boolean) }) }
    catch { /* Context displays the backend error. */ }
    finally { setSaving(false) }
  }
  if (!user.isOwner) return <div><PageHeading title="Dejimaha owner-ka" description="Boggan waxaa geli kara owner-ka app-ka oo keliya."/><div className="card p-5 text-sm text-slate-600">Aqoonsiga owner-ka ee la xaqiijiyey ayaa loo baahan yahay.</div></div>
  return <div><PageHeading eyebrow="Owner control center" title="Dejimaha app-ka" description="Magaca app-ka, xiriirka taageerada iyo xaafadaha waxaa lagu kaydiyaa Supabase."/><form className="card space-y-5 p-5" onSubmit={save}><label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">Magaca app-ka</span><input className={field} value={appName} onChange={e=>setAppName(e.target.value)} required/></label><label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">Xiriirka taageerada</span><input className={field} value={support} onChange={e=>setSupport(e.target.value)} placeholder="Telefoon ama email taageero"/></label><label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">Xaafadaha la adeegayo</span><textarea className={`${field} min-h-40`} value={areas} onChange={e=>setAreas(e.target.value)} placeholder="Xaafad kasta sadar cusub geli"/><span className="text-xs text-slate-500">Xaafad kasta sadar cusub geli. Liiskan wuxuu ka muuqanayaa foomamka codsiga iyo adeeg-bixiyaha.</span></label><button className={button} disabled={saving || !backendConfigured}>{saving?'Waa la kaydinayaa…':'Kaydi dejimaha'}</button></form><p className="mt-4 text-xs leading-5 text-slate-500">Qaybaha adeegga iyo roles-ka users-ka sidoo kale halkan maamulka ayay leeyihiin. Lacag-bixin, SMS, iyo isbeddel ku yimaada hab-dhaqanka app-ka waxay u baahan karaan integration ama code cusub marka adeegyadaas lagu daro.</p></div>
}

export function LegalPage({ type = 'privacy' }) {
  const privacy = type === 'privacy'
  return <div className="mx-auto max-w-3xl"><PageHeading back eyebrow="HelAdeeg · Muqdisho" title={privacy?'Siyaasadda asturnaanta':'Shuruudaha adeegga'} description="Qoraal tusaale ah oo sugaya dib-u-eegis sharci iyo xogta xiriirka rasmiga ah." /><DemoNote>Qoraalkan waa placeholder frontend ah; ha u qaadan siyaasad sharci oo la ansixiyey.</DemoNote><article className="card space-y-5 p-5 sm:p-8">{(privacy?[
    ['Xogta la ururiyo','App-ku wuxuu qorshaynayaa xogta profile-ka, codsiyada adeegga, qiimeynta iyo warbixinnada. Macluumaadka saxda ah iyo sababta loo ururinayo waa in la xaqiijiyaa ka hor pilot-ka.'],
    ['Xogta adeeg-bixiyaha','Dukumiintiyada xaqiijinta waa xog xasaasi ah. Marka backend la hirgeliyo, waa in lagu kaydiyaa meel gaar ah, loo oggolaadaa shaqaalaha loo xilsaaray oo keliya, lana dejiyo muddada tirtiridda.'],
    ['Wadaagista iyo muuqaalka','Telefoonka iyo goobta saxda ah si guud looma muujinayo ilaa oggolaansho iyo baahi cad jirto.'],
    ['Ilaalinta iyo tirtiridda','Habka codsiga nuqulka ama tirtiridda xogta, xiriirka taageerada iyo masuulka xogta waa in lagu daraa ka hor sii-daynta.'],
  ]:[
    ['Adeegga','HelAdeeg wuxuu isku xiraa macaamiisha iyo adeeg-bixiyeyaasha Muqdisho. Heshiiska adeegga, qiimaha iyo waqtiga waa in labada dhinac caddeeyaan.'],
    ['Badbaadada','Isticmaalayaashu waa inay soo gudbiyaan xog sax ah oo ixtiraamaan dadka kale. Cabashooyinka waxaa dib u eegi doona maamul loo xilsaaray marka nidaamka dhabta ah la hawlgeliyo.'],
    ['Joojinta iyo khilaafka','Xeerarka joojinta, khilaafka iyo lacag celinta (haddii mustaqbalka payment yimaado) wali waa in ganacsigu go’aamiyaa.'],
    ['Xiriirka','Ku dar email ama telefoon taageero oo shaqaynaya ka hor inta aan adeeggu dadweynaha u furmin.'],
  ]).map(([heading,body])=><section key={heading}><h2 className="font-bold text-slate-900">{heading}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{body}</p></section>)}</article></div>
}

export function AdminHomeLinks() { const { user } = useApp(); return <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Link className={secondary} to="/admin/providers"><ShieldCheck size={16}/> Hubinta providers</Link><Link className={secondary} to="/admin/categories"><Wrench size={16}/> Qaybaha adeegga</Link><Link className={secondary} to="/admin/reports"><Flag size={16}/> Cabashooyinka</Link><Link className={secondary} to="/admin/users"><UserRound size={16}/> Isticmaaleyaasha</Link><Link className={secondary} to="/admin/audit"><FileText size={16}/> Diiwaanka maamulka</Link>{user.isOwner&&<Link className={secondary} to="/admin/settings"><Shield size={16}/> Dejimaha guud</Link>}</div> }
