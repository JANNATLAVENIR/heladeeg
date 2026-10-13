import { Link } from 'react-router-dom'
import { Zap, Sparkles, Wrench, Wind, Hammer, Droplets, Paintbrush, Truck } from 'lucide-react'
import { useLanguage, categoryLabel } from '../context/LanguageContext'

const iconMap = {
  Zap,
  Sparkles,
  Wrench,
  Wind,
  Hammer,
  Pipe: Droplets,
  Paintbrush,
  Truck,
}

const colorMap = {
  amber: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  cyan: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  slate: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  blue: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  teal: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  orange: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  violet: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  green: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
  rose: { bg: 'bg-primary-50', text: 'text-primary-800', ring: 'ring-primary-100', hover: 'hover:bg-primary-100', icon: 'text-primary-700' },
}

export default function ServiceCard({ category }) {
  const { language } = useLanguage()
  const Icon = iconMap[category.icon] || Wrench
  const colors = colorMap[category.color] || colorMap.slate

  return (
    <Link
      to={`/categories/${category.slug || category.id}`}
      className={`flex flex-col items-center gap-2 rounded-2xl ${colors.bg} p-3.5 ring-1 ${colors.ring} transition-all hover:scale-105 active:scale-95`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white ${colors.icon}`}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <span className={`text-xs font-semibold ${colors.text}`}>{categoryLabel(category, language)}</span>
    </Link>
  )
}
