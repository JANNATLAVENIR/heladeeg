import { useNavigate } from 'react-router-dom'
import { Search, BadgeCheck, Star, ArrowRight, MapPin, Shield, Zap, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ServiceCard from '../components/ServiceCard'
import ProviderCard from '../components/ProviderCard'
import { useLanguage } from '../context/LanguageContext'

export default function HomePage() {
  const { serviceCategories, providers, user, backendConfigured, backendReady } = useApp()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const verifiedProviders = providers
    .filter((p) => p.verification_status === 'approved' || p.is_demo)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
  const providerCtaHref = user.role === 'provider' ? '/provider-dashboard' : user.role === 'admin' ? '/admin' : user.isLoggedIn ? '/provider-onboarding' : '/signup'
  const providerCtaLabel = user.role === 'provider' ? t('home.provider.cta.dashboard') : user.role === 'admin' ? t('home.provider.cta.admin') : user.isLoggedIn ? t('home.provider.cta.logged') : t('home.provider.cta')

  const handleSearch = (e) => {
    e.preventDefault()
    navigate('/search')
  }

  return (
    <div className="home-page space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-intro">
          <div className="home-location">
            <MapPin size={12} /> {t('home.location')}
          </div>
          <h1>
            {t('home.title')}<br />
            <span>{t('home.subtitle')}</span>
          </h1>
          <p>{t('home.description')}</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="home-search">
            <div>
              <Search size={17} />
              <input
                type="text"
                placeholder={t('home.search.placeholder')}
                aria-label={t('home.search.placeholder')}
                onFocus={() => navigate('/search')}
              />
            </div>
            <button type="submit" aria-label={t('home.search.button')}>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Trust badges */}
          <div className="home-trust">
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} /> {t('home.verified')}</span>
            <span className="flex items-center gap-1.5"><Shield size={14} /> {t('home.trust')}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {t('home.fast')}</span>
          </div>
        </div>
        <div className="home-promo" role="img" aria-label={t('home.description')}>
          <div>
            <span>{t('home.providers')}</span>
            <h2>{t('home.trust')}</h2>
            <p>{t('home.providers.hint')}</p>
          </div>
          <button type="button" onClick={() => navigate('/search')} aria-label={t('common.viewAll')}><ArrowRight size={17} /></button>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('home.categories')}</h2>
            <p className="text-sm text-slate-500">{t('home.categories.hint')}</p>
          </div>
          <button onClick={() => navigate('/search')} className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            {t('common.viewAll')} <ArrowRight size={14} />
          </button>
        </div>
        {serviceCategories.length ? <div className="home-category-grid">
          {serviceCategories.map((cat) => <ServiceCard key={cat.id} category={cat} />)}
        </div> : <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600" role="status">
          {backendConfigured && !backendReady ? t('home.loadingCategories') : t('home.categoriesUnavailable')}
        </div>}
      </section>

      {/* Verified Providers */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              {language === 'en' ? 'Service professionals' : language === 'ar' ? 'مقدمو الخدمات' : 'Adeeg-bixiyeyaasha'}
            </h2>
            <p className="text-sm text-slate-500">{t('home.providers.hint')}</p>
          </div>
          <button onClick={() => navigate('/search')} className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            {t('common.viewAll')} <ArrowRight size={14} />
          </button>
        </div>
        {backendConfigured && !backendReady ? <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600" role="status">{t('home.loadingProviders')}</div> : verifiedProviders.length ? <div className="grid gap-3 md:grid-cols-3">
          {verifiedProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
        </div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <h3 className="font-semibold text-slate-900">{t('home.noProviders')}</h3>
          <p className="mx-auto mt-1 max-w-xl text-sm text-slate-600">{t('home.noProviders.hint')}</p>
          <button onClick={() => navigate(providerCtaHref)} className="btn-primary mt-4">{providerCtaLabel}</button>
        </div>}
      </section>

      {/* How it works */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8">
        <h2 className="text-lg font-bold text-slate-900">{t('home.how')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('home.how.hint')}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            { step: '1', title: t('home.step.search'), desc: t('home.step.search.desc'), icon: Search },
            { step: '2', title: t('home.step.compare'), desc: t('home.step.compare.desc'), icon: Star },
            { step: '3', title: t('home.step.request'), desc: t('home.step.request.desc'), icon: Zap },
            { step: '4', title: t('home.step.track'), desc: t('home.step.track.desc'), icon: BadgeCheck },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.step} className="relative rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <Icon size={20} />
                </div>
                <div className="absolute right-3 top-3 text-2xl font-extrabold text-slate-200">{item.step}</div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA for providers */}
      {user.role !== 'provider' && (
        <section className="rounded-3xl bg-gradient-to-r from-[#e4e5e4] to-[#d1d3d2] p-6 text-slate-900 md:p-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">{t('home.provider.title')}</h2>
              <p className="mt-1 text-sm text-slate-600">{t('home.provider.description')}</p>
            </div>
            <button
              onClick={() => navigate('/provider-onboarding')}
              className="rounded-xl border border-primary-200 bg-[#fffefa] px-5 py-3 text-sm font-semibold text-primary-800 shadow-sm transition-all hover:bg-primary-50 active:scale-[0.98]"
            >
              {t('home.provider.register')}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
