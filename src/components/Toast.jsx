import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()
  if (!toast) return null

  const config = {
    success: { bg: 'bg-green-600', icon: CheckCircle2 },
    error: { bg: 'bg-red-600', icon: AlertCircle },
    info: { bg: 'bg-slate-700', icon: Info },
  }
  const cfg = config[toast.type] || config.success
  const Icon = cfg.icon

  return (
    <div className="fixed bottom-20 left-1/2 z-[100] -translate-x-1/2 md:bottom-6">
      <div className={`flex items-center gap-2.5 rounded-xl ${cfg.bg} px-5 py-3 text-sm font-medium text-white shadow-lg animate-slide-up`}>
        <Icon size={18} />
        {toast.message}
      </div>
    </div>
  )
}
