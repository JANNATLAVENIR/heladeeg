import { Link } from 'react-router-dom'
import { Star, BadgeCheck, MapPin, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage, categoryLabel } from '../context/LanguageContext'

const colorMap = {
  amber: 'bg-primary-100 text-primary-800',
  cyan: 'bg-primary-100 text-primary-800',
  slate: 'bg-primary-100 text-primary-800',
  blue: 'bg-primary-100 text-primary-800',
  teal: 'bg-primary-100 text-primary-800',
  orange: 'bg-primary-100 text-primary-800',
}

export default function ProviderCard({ provider, compact = false }) {
  const { serviceCategories } = useApp()
  const { language, t } = useLanguage()
  const verified = !provider.is_demo && provider.verification_status === 'approved'

  // Get categories from listings
  const categoryIds = [...new Set(provider.listings?.map((l) => l.category_id) || [])]
  const categories = categoryIds.map((id) => serviceCategories.find((c) => c.id === id)).filter(Boolean)

  return (
    <Link
      to={`/provider/${provider.id}`}
      className="card flex gap-3 p-3 transition-all hover:shadow-md hover:border-primary-200 active:scale-[0.99] block"
    >
      {/* Avatar */}
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${colorMap[provider.avatar_color] || colorMap.slate}`}>
        {provider.avatar}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-slate-900">{provider.display_name}</h3>
              {provider.is_demo && <span className="chip shrink-0 bg-amber-50 text-[9px] font-bold text-amber-800">DEMO</span>}
              {verified && (
                <BadgeCheck size={14} className="shrink-0 text-primary-600" fill="currentColor" stroke="white" strokeWidth={2.5} />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              {!provider.is_demo && <><Star size={12} className="text-amber-400" fill="currentColor" />
                <span className="font-medium text-slate-700">{provider.rating}</span>
                <span>({provider.review_count})</span></>}
              <span>·</span>
              <span>{provider.years_experience} {t('provider.years')}</span>
            </div>
          </div>
          {!compact && <ChevronRight size={18} className="shrink-0 text-slate-300" />}
        </div>

        {/* Categories */}
        <div className="mt-2 flex flex-wrap gap-1">
          {categories.map((cat) => (
            <span key={cat.id} className="chip bg-slate-100 text-slate-600">
              {categoryLabel(cat, language)}
            </span>
          ))}
        </div>

        {/* Service area */}
        {!compact && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={11} />
            <span className="truncate">{provider.service_area.join(' · ')}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
