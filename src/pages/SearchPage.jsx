import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, Star, X, Inbox } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProviderCard from '../components/ProviderCard'
import { useLanguage, categoryLabel } from '../context/LanguageContext'

export default function SearchPage() {
  const { providers, serviceCategories, neighborhoods, backendConfigured, backendReady, user } = useApp()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [minimumRating, setMinimumRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('rating')

  const filteredProviders = useMemo(() => {
    let result = [...providers]

    // Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.listings?.some((l) => l.category_id === selectedCategory))
    }

    // Filter by neighborhood
    if (selectedNeighborhood) {
      result = result.filter((p) => p.service_area.includes(selectedNeighborhood))
    }

    if (availableOnly) result = result.filter((p) => p.is_available !== false)
    if (minimumRating) result = result.filter((p) => p.rating >= minimumRating)

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.listings?.some((l) => l.title.toLowerCase().includes(q))
      )
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'experience') {
      result.sort((a, b) => b.years_experience - a.years_experience)
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.review_count - a.review_count)
    }

    return result
  }, [providers, selectedCategory, selectedNeighborhood, availableOnly, minimumRating, search, sortBy])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(search)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setSelectedNeighborhood('')
    setAvailableOnly(false)
    setMinimumRating(0)
    setSearchParams({})
  }

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedNeighborhood ? 1 : 0) + (availableOnly ? 1 : 0) + (minimumRating ? 1 : 0)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('search.title')}</h1>
        <p className="text-sm text-slate-500">{t('search.description')}</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center justify-center rounded-xl border px-3 py-3 transition-all ${
            activeFilterCount > 0 ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          <SlidersHorizontal size={18} />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* Quick category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <button
          onClick={() => setSelectedCategory('')}
          className={`chip shrink-0 ${
            !selectedCategory ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t('search.all')}
        </button>
        {serviceCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
            className={`chip shrink-0 ${
              selectedCategory === cat.id ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {categoryLabel(cat, language)}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="card animate-slide-up space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{t('search.filters')}</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600">
                <X size={12} /> {t('search.clearAll')}
              </button>
            )}
          </div>

          {/* Neighborhood */}
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500">
              <MapPin size={12} /> {t('search.neighborhood')}
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="input-field"
            >
              <option value="">{t('search.allNeighborhoods')}</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} />
            {t('search.available')}
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500"><Star size={12}/>{t('search.minRating')}</span>
            <select value={minimumRating} onChange={(event) => setMinimumRating(Number(event.target.value))} className="input-field">
              <option value={0}>{t('search.allRatings')}</option><option value={4}>{t('search.fourPlus')}</option><option value={4.5}>{t('search.fourHalfPlus')}</option>
            </select>
          </label>

          {/* Sort */}
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500">
              <Star size={12} /> {t('search.sort')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'rating', label: t('search.rating') },
                { value: 'experience', label: t('search.experience') },
                { value: 'reviews', label: t('search.reviews') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`chip flex-1 justify-center ${
                    sortBy === opt.value ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-500">
          <span className="font-semibold text-slate-700">{filteredProviders.length}</span> {t('search.found')}
        </p>
        {search.trim() && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600">
            <X size={12} /> {t('search.clearSearch')}
          </button>
        )}
      </div>

      {/* Results */}
      {backendConfigured && !backendReady ? <div className="card py-12 text-center text-sm text-slate-500" role="status">{t('search.loading')}</div> : filteredProviders.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Inbox size={28} className="text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-700">{providers.filter(p=>p.verification_status==='approved').length ? t('search.noResults') : t('search.noProviders')}</h3>
          <p className="mt-1 max-w-lg text-xs text-slate-500">{providers.filter(p=>p.verification_status==='approved').length ? t('search.adjust') : t('search.providersWillAppear')}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2"><button onClick={clearFilters} className="btn-secondary">{t('search.clearFilters')}</button>{!providers.some(p=>p.user_id===user.id)&&<button onClick={()=>navigate(user.isLoggedIn?'/provider-onboarding':'/signup')} className="btn-primary">{t('search.becomeProvider')}</button>}</div>
        </div>
      )}
    </div>
  )
}
