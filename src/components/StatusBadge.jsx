import { Clock, CheckCircle, Loader, CheckCircle2, XCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const statusConfig = {
  new: { label: 'Cusub', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, dot: 'bg-blue-500' },
  accepted: { label: 'La aqbalay', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: CheckCircle, dot: 'bg-amber-500' },
  in_progress: { label: 'Socda', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Loader, dot: 'bg-indigo-500' },
  completed: { label: 'Dhammaaday', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, dot: 'bg-green-500' },
  cancelled: { label: 'La joojiyey', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, dot: 'bg-red-500' },
  declined: { label: 'La diiday', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, dot: 'bg-red-500' },
  disputed: { label: 'Cabasho furan', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: XCircle, dot: 'bg-orange-500' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const { t } = useLanguage()
  const config = statusConfig[status] || statusConfig.new
  const labelKey = { new:'status.new', accepted:'status.accepted', in_progress:'status.progress', completed:'status.completed', cancelled:'status.cancelled', declined:'status.declined', disputed:'status.disputed' }[status] || 'status.new'
  const Icon = config.icon
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.color} ${padding}`}>
      {size === 'sm' ? (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      ) : (
        <Icon size={14} />
      )}
      {t(labelKey)}
    </span>
  )
}

export { statusConfig }
