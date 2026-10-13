import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Send, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage, categoryLabel } from '../context/LanguageContext'

export default function RequestServicePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { getProviderById, serviceCategories, neighborhoods, submitRequest, user, offlinePreview } = useApp()

  const provider = getProviderById(id)

  const [form, setForm] = useState({
    listing_id: provider?.listings?.[0]?.id || '',
    category_id: provider?.listings?.[0]?.category_id || '',
    description: '',
    neighborhood: '',
    preferred_time: '',
    photo: null,
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-bold text-slate-700">{t('request.providerMissing')}</h2>
        <button onClick={() => navigate('/search')} className="btn-primary mt-4">{t('request.backSearch')}</button>
      </div>
    )
  }

  if (!user.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={40} className="text-amber-400" />
        <h2 className="mt-3 text-lg font-bold text-slate-700">{t('request.loginTitle')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('request.loginHint')}</p>
        <button onClick={() => navigate('/profile')} className="btn-primary mt-4">{t('nav.login')}</button>
      </div>
    )
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.category_id) errs.category_id = 'Dooro nooca shaqada'
    if (!form.description || form.description.trim().length < 10) {
      errs.description = 'Faahfaahinta waa inay noqotaa ugu yaraan 10 xaraf'
    }
    if (!form.neighborhood) errs.neighborhood = 'Dooro xaafadda'
    if (!form.preferred_time) errs.preferred_time = 'Geli waqtiga aad u baahan tahay'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const category = serviceCategories.find((c) => c.id === form.category_id)
    if (offlinePreview) {
      setErrors({ form: 'Internet ma jiro. Codsiga lama dirin; isku day mar kale marka xiriirku soo noqdo.' })
      return
    }
    setSubmitting(true)
    const created = await submitRequest({
      provider_id: provider.id,
      provider_name: provider.display_name,
      listing_id: form.listing_id,
      category_id: form.category_id,
      category_name: category?.name_so || '',
      description: form.description.trim(),
      neighborhood: form.neighborhood,
      preferred_time: form.preferred_time,
    })
    if (created?.id) { setSubmittedId(created.id); setSubmitted(true) }
    else setErrors((current) => ({ ...current, form: 'Codsiga lama dirin. Isku day mar kale.' }))
    setSubmitting(false)
  }

  // Success state
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">{t('request.sent')}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Adeeg-bixiyaha <span className="font-semibold text-slate-700">{provider.display_name}</span> ayaa la soo diray.
          Waxaad la socodsi kartaa xaaladda bogga Codsiyada.
        </p>
        {provider.is_demo && <p className="mt-3 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          {language === 'en' ? 'Demo booking saved to the database for testing. No real provider will receive or accept it.' : language === 'ar' ? 'تم حفظ الحجز التجريبي في قاعدة البيانات للاختبار. لن يستلمه أو يقبله مزود خدمة حقيقي.' : 'Codsiga demo-ga ah database-ka ayaa loogu kaydiyey tijaabo. Adeeg-bixiye dhab ah ma helayo mana aqbalayo.'}
        </p>}
        <p className="mt-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-800">{t('request.reference')} <strong>{submittedId}</strong></p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate(`/requests/${submittedId}`)} className="btn-primary">{t('request.details')}</button>
          <button onClick={() => navigate('/requests')} className="btn-secondary">{t('request.myRequests')}</button>
          <button onClick={() => navigate('/search')} className="btn-secondary">
            Raadi kale
          </button>
        </div>
      </div>
    )
  }

  const providerCategories = [...new Set(provider.listings?.map((l) => l.category_id) || [])]
    .map((cid) => serviceCategories.find((c) => c.id === cid))
    .filter(Boolean)

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900">{t('request.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Adeeg-bixiye: <span className="font-semibold text-slate-700">{provider.display_name}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {offlinePreview && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Internet ma jiro. Codsiyada lama diri karo marka offline preview-ku shidan yahay.</p>}
          {errors.form && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
          {/* Job type / category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t('request.service')} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.listing_id}
              onChange={(event) => {
                const listing = provider.listings?.find((item) => item.id === event.target.value)
                setForm((current) => ({ ...current, listing_id: event.target.value, category_id: listing?.category_id || '' }))
                if (errors.category_id) setErrors((current) => ({ ...current, category_id: null }))
              }}
              className={`input-field ${errors.category_id ? 'border-red-300 focus:ring-red-100' : ''}`}
            >
              <option value="">{t('request.chooseService')}</option>
              {provider.listings?.map((listing) => (
                <option key={listing.id} value={listing.id}>{listing.title} · {categoryLabel(serviceCategories.find((category) => category.id === listing.category_id), language)}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
          </div>

          {/* Neighborhood */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t('request.neighborhood')} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              className={`input-field ${errors.neighborhood ? 'border-red-300 focus:ring-red-100' : ''}`}
            >
              <option value="">{t('request.chooseNeighborhood')}</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {errors.neighborhood && <p className="mt-1 text-xs text-red-500">{errors.neighborhood}</p>}
          </div>

          {/* Preferred time */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t('request.time')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.preferred_time}
              onChange={(e) => handleChange('preferred_time', e.target.value)}
              placeholder={t('request.time.placeholder')}
              className={`input-field ${errors.preferred_time ? 'border-red-300 focus:ring-red-100' : ''}`}
            />
            {errors.preferred_time && <p className="mt-1 text-xs text-red-500">{errors.preferred_time}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t('request.description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder={t('request.description.placeholder')}
              className={`input-field resize-none ${errors.description ? 'border-red-300 focus:ring-red-100' : ''}`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400">{form.description.length}/500</span>
            </div>
          </div>

          {/* Photo upload (optional) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t('request.photo')}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <ImagePlus size={20} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">{t('request.addPhoto')}</p>
                <p className="text-xs text-slate-400">{t('request.photoLimit')}</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleChange('photo', e.target.files[0].name)
                  }
                }}
              />
            </label>
            {form.photo && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={12} /> {form.photo}
              </p>
            )}
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3">
            <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700">
              {language === 'en' ? 'Do not include sensitive information unrelated to the job, such as bank details or personal identification.' : language === 'ar' ? 'لا تُدرج معلومات حساسة لا تتعلق بالعمل، مثل بيانات البنك أو الهوية الشخصية.' : 'Ha gelin xog aad u gaar ah oo aan shaqada khusayn (tusaale: lambarka bangiga ama aqoonsiga gaarka).'}
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || offlinePreview} className="btn-primary w-full py-3.5">
            <Send size={16} /> {submitting ? t('request.submitting') : t('request.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
