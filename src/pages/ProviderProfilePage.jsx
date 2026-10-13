import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, MapPin, Star, Clock, Wrench, DollarSign, MessageCircle, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import RatingStars from '../components/RatingStars'
import { useLanguage, categoryLabel } from '../context/LanguageContext'

const avatarColors = {
  amber: 'bg-primary-100 text-primary-800',
  cyan: 'bg-primary-100 text-primary-800',
  slate: 'bg-primary-100 text-primary-800',
  blue: 'bg-primary-100 text-primary-800',
  teal: 'bg-primary-100 text-primary-800',
  orange: 'bg-primary-100 text-primary-800',
}

export default function ProviderProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { getProviderById, serviceCategories, getReviewsForProvider, user } = useApp()

  const provider = getProviderById(id)

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-bold text-slate-700">{t('profile.notFound')}</h2>
        <p className="mt-2 text-sm text-slate-400">{t('profile.returnSearch')}</p>
        <button onClick={() => navigate('/search')} className="btn-primary mt-4">
          {t('common.searchProviders')}
        </button>
      </div>
    )
  }

  const isDemoProvider = Boolean(provider.is_demo) || /^p\d+$/.test(provider.id)
  const verified = !isDemoProvider && provider.verification_status === 'approved'
  const reviews = getReviewsForProvider(provider.id)
  const categoryIds = [...new Set(provider.listings?.map((l) => l.category_id) || [])]
  const categories = categoryIds.map((cid) => serviceCategories.find((c) => c.id === cid)).filter(Boolean)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(language === 'so' ? 'so-SO' : language === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      {/* Provider header card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-[#e0e1e0] to-[#c9cbca]" />

        <div className="px-5 pb-5">
          {/* Avatar + name */}
          <div className="-mt-10 flex items-end gap-3">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-bold ring-4 ring-white ${avatarColors[provider.avatar_color] || avatarColors.slate}`}>
              {provider.avatar}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-slate-900">{provider.display_name}</h1>
                {verified && (
                  <BadgeCheck size={20} className="text-primary-600" fill="currentColor" stroke="white" strokeWidth={2.5} />
                )}
              </div>
              {isDemoProvider ? (
                <span className="badge bg-amber-50 text-amber-800">DEMO</span>
              ) : verified ? (
                <span className="badge bg-green-50 text-green-700">{t('provider.verifiedBadge')}</span>
              ) : (
                <span className="badge bg-amber-50 text-amber-700">{t('provider.pendingBadge')}</span>
              )}
              <span className={`badge mt-1 ${provider.is_available === false ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-700'}`}>{provider.is_available === false ? t('provider.unavailable') : t('provider.available')}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex items-center gap-5 text-sm">
            {!isDemoProvider && <div className="flex items-center gap-1">
              <Star size={15} className="text-amber-400" fill="currentColor" />
              <span className="font-semibold text-slate-800">{provider.rating}</span>
              <span className="text-slate-400">({provider.review_count} {t('provider.reviewCount')})</span>
            </div>}
            <div className="flex items-center gap-1 text-slate-500">
              <Clock size={15} />
              <span>{provider.years_experience} {t('provider.experienceYears')}</span>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{isDemoProvider && language !== 'so' ? t('provider.profileBio') : provider.bio}</p>
          {isDemoProvider && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            {language === 'en' ? 'DEMO profile: bookings are saved for testing, but no real technician receives or accepts them.' : language === 'ar' ? 'ملف تجريبي: تُحفظ الحجوزات للاختبار، لكن لا يستقبلها أو يقبلها فني حقيقي.' : 'Profile DEMO ah: codsiyada tijaabada waa la kaydinayaa, balse adeeg-bixiye dhab ah ma helayo mana aqbalayo.'}
          </p>}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {/* Services / Listings */}
          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Wrench size={16} className="text-primary-600" />
              {t('provider.services')}
            </h2>{!isDemoProvider && <Link to={`/providers/${provider.id}/reviews`} className="text-xs font-semibold text-primary-700">{t('provider.reviewsLink')}</Link>}</div>
            <div className="mt-3 space-y-2">
              {provider.listings?.map((listing) => {
                const cat = serviceCategories.find((c) => c.id === listing.category_id)
                return (
                  <div key={listing.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">{isDemoProvider && language !== 'so' ? categoryLabel(cat, language) : listing.title}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="chip bg-primary-50 text-primary-700">{categoryLabel(cat, language)}</span>
                          {listing.price_type === 'fixed' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                              <DollarSign size={11} /> ${listing.price_min}–${listing.price_max}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-500">{t('provider.priceDiscuss')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Service Areas */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin size={16} className="text-primary-600" />
              {t('provider.areas')}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {provider.service_area.map((area) => (
                <span key={area} className="chip bg-slate-100 text-slate-600">
                  <MapPin size={11} /> {area}
                </span>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MessageCircle size={16} className="text-primary-600" />
              {t('provider.customerReviews')}
              <span className="ml-1 text-xs font-normal text-slate-400">({reviews.length})</span>
            </h2>
            {reviews.length > 0 ? (
              <div className="mt-3 space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {review.customer_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{review.customer_name}</p>
                          <p className="text-[10px] text-slate-400">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} showValue={false} size={13} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">{t('provider.noReviews')}</p>
            )}
          </section>
        </div>

        {/* Sidebar - CTA */}
        <div className="space-y-4">
          <div className="card sticky top-20 p-5">
            <h2 className="text-sm font-bold text-slate-900">{t('provider.requestService')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('provider.requestPrompt')}</p>

            {/* Price estimate */}
            <div className="mt-3 rounded-xl bg-primary-50 p-3">
              <p className="text-xs font-medium text-primary-700">{t('provider.estimate')}</p>
              <p className="mt-0.5 text-lg font-bold text-primary-800">
                {provider.listings?.[0]?.price_type === 'fixed'
                  ? `$${provider.listings[0].price_min} – $${provider.listings[0].price_max}`
                  : t('provider.sharePrice')}
              </p>
            </div>

            {/* Trust info */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-green-500" />
                {isDemoProvider ? (language === 'en' ? 'DEMO listing · not verified' : language === 'ar' ? 'قائمة تجريبية · غير موثقة' : 'Liis DEMO ah · lama xaqiijin') : verified ? t('provider.verifiedInfo') : t('provider.pendingInfo')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock size={14} className="text-slate-400" />
                {t('provider.responseTime')}
              </div>
            </div>

            {provider.is_available === false ? <p className="mt-4 rounded-lg bg-slate-100 p-3 text-center text-sm text-slate-600">{t('provider.currentlyUnavailable')}</p> : <button
              onClick={() => navigate(user.isLoggedIn ? `/request/${provider.id}` : '/login')}
              className="btn-primary mt-4 w-full py-3"
            >{user.isLoggedIn ? t('provider.requestService') : t('provider.loginFirst')}</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
