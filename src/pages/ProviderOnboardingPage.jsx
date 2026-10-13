import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Upload, Wrench, MapPin, DollarSign, ShieldCheck, User, Mail, Phone } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage, categoryLabel } from '../context/LanguageContext'

export default function ProviderOnboardingPage() {
  const navigate = useNavigate()
  const { serviceCategories, neighborhoods, submitProviderApplication, offlinePreview, user, backendConfigured } = useApp()
  const { t, language } = useLanguage()

  const [step, setStep] = useState(1)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    phone: '',
    email: '',
    categories: [],
    service_areas: [],
    years_experience: '',
    price_type: 'fixed',
    price_min: '',
    price_max: '',
    document_name: '',
    document_file: null,
  })

  const totalSteps = 4

  const toggleArray = (field, value) => {
    setForm((prev) => {
      const arr = prev[field]
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const handleSubmit = async () => {
    if (offlinePreview) { setSubmitError(language === 'en' ? 'You are offline. The application cannot be sent right now.' : language === 'ar' ? 'لا يوجد اتصال بالإنترنت. لا يمكن إرسال الطلب الآن.' : 'Internet ma jiro. Codsiga lama diri karo hadda.'); return }
    if (!user.isLoggedIn) { setSubmitError(language === 'en' ? 'Log in or create an account before applying as a provider.' : language === 'ar' ? 'سجّل الدخول أو أنشئ حسابًا قبل التقديم كمزود خدمة.' : 'Soo gal ama samee akoon ka hor intaadan codsan adeeg-bixiye.'); return }
    setSubmitting(true)
    try {
      await submitProviderApplication(form)
      navigate('/provider-dashboard')
    } catch (error) { setSubmitError(error.message || 'Codsiga lama dirin. Isku day mar kale.') }
    finally { setSubmitting(false) }
  }

  const canProceed = () => {
    if (step === 1) return form.full_name.length >= 3 && form.bio.length >= 10 && form.phone.length >= 7
    if (step === 2) return form.categories.length > 0 && form.service_areas.length > 0
    if (step === 3) return form.years_experience !== '' && form.price_type && (form.price_type !== 'fixed' || (form.price_min !== '' && form.price_max !== '' && Number(form.price_min) >= 0 && Number(form.price_max) >= Number(form.price_min)))
    return Boolean(form.document_name)
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('onboard.back')}
      </button>

      {/* Progress */}
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? 'bg-primary-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <div className="card p-6">
        {!backendConfigured && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">{t('onboard.demo')}</p>}
        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">
              <div>
              <h1 className="text-xl font-bold text-slate-900">{t('onboard.step1')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('onboard.step1.desc')}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.name')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder={t('onboard.name.placeholder')}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.bio')}</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder={t('onboard.bio.placeholder')}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.phone')}</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+252 ..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@tusaale.com"
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services & areas */}
        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('onboard.step2')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('onboard.step2.desc')}</p>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Wrench size={14} /> {t('onboard.categories')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {serviceCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleArray('categories', cat.id)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                      form.categories.includes(cat.id)
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {form.categories.includes(cat.id) && <Check size={14} />}
                    <span className="text-sm font-medium">{categoryLabel(cat, language)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <MapPin size={14} /> {t('onboard.areas')}
              </label>
              <div className="flex flex-wrap gap-2">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
                    onClick={() => toggleArray('service_areas', n)}
                    className={`chip ${
                      form.service_areas.includes(n)
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {form.service_areas.includes(n) && <Check size={11} />}
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing & experience */}
        {step === 3 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('onboard.step3')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('onboard.step3.desc')}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.experience')}</label>
              <input
                type="number"
                value={form.years_experience}
                onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
                placeholder="Tusaale: 5"
                className="input-field"
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.priceType')}</label>
              <div className="flex gap-2">
                {[
                  { value: 'fixed', label: language === 'en' ? 'Fixed price' : language === 'ar' ? 'سعر ثابت' : 'Qiime go\'an' },
                  { value: 'quote', label: language === 'en' ? 'Request a quote' : language === 'ar' ? 'طلب عرض سعر' : 'Qiime lagu wadaagtiyo' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, price_type: opt.value })}
                    className={`flex-1 rounded-xl border p-3 text-sm font-medium transition-all ${
                      form.price_type === opt.value
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.price_type === 'fixed' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.minPrice')}</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={form.price_min}
                      onChange={(e) => setForm({ ...form, price_min: e.target.value })}
                      placeholder="10"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('onboard.maxPrice')}</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={form.price_max}
                      onChange={(e) => setForm({ ...form, price_max: e.target.value })}
                      placeholder="100"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <div className="space-y-5 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t('onboard.step4')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('onboard.step4.desc')}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{t('onboard.idPhoto')}</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 transition-colors hover:border-primary-300 hover:bg-primary-50/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Upload size={24} className="text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">{t('onboard.addDocument')}</p>
                <p className="mt-1 text-xs text-slate-400">{t('onboard.fileLimit')}</p>
                <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  if (file.size > 5 * 1024 * 1024) {
                    setForm({ ...form, document_name: '' })
                    window.alert(language === 'en' ? 'The file must be smaller than 5 MB.' : language === 'ar' ? 'يجب أن يكون حجم الملف أقل من 5 ميغابايت.' : 'Faylku waa inuu ka yaraadaa 5MB.')
                    return
                  }
                  setForm({ ...form, document_name: file.name, document_file: file })
                }} />
              </label>
              {form.document_name && <p className="text-sm text-green-700">{t('onboard.fileSelected')} {form.document_name}</p>}
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">
                Dukumiintiyadaaga ma wadaagno qof kale. Marka la ansixiyo, waxaad helaysaa calaamadda "La xaqiijiyey".
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                <p className="text-sm font-medium text-green-800">{t('onboard.ready')}</p>
              </div>
              <p className="mt-1 text-xs text-green-600">{t('onboard.submitInfo')}</p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
              <ArrowLeft size={16} /> {t('onboard.back')}
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary flex-1"
            >
              {language === 'en' ? 'Continue' : language === 'ar' ? 'متابعة' : 'Soco'} <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || submitting || offlinePreview} className="btn-primary flex-1">
              <Check size={16} /> {submitting ? (language === 'en' ? 'Submitting…' : language === 'ar' ? 'جارٍ الإرسال…' : 'Waa la dirayaa…') : (language === 'en' ? 'Submit application' : language === 'ar' ? 'إرسال الطلب' : 'Diiwaangelin')}
            </button>
          )}
        </div>
        {submitError && <p role="alert" className="mt-3 text-sm text-red-600">{submitError}</p>}
      </div>
    </div>
  )
}
