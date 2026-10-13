import { Link, useNavigate } from 'react-router-dom'
import { Check, X, Clock, Loader, CheckCircle2, MapPin, Wrench, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import StatusBadge, { statusConfig } from '../components/StatusBadge'
import { useLanguage } from '../context/LanguageContext'

export default function ProviderDashboardPage() {
  const { requests, providers, updateRequestStatus, user } = useApp()
  const { t } = useLanguage()
  const navigate = useNavigate()

  if (!user.isLoggedIn || user.role !== 'provider') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-bold text-slate-700">{t('provider.notProvider')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('provider.signinHint')}</p>
        <button onClick={() => navigate('/profile')} className="btn-primary mt-4">{t('nav.login')}</button>
      </div>
    )
  }

  const myProvider = providers.find((p) => p.id === user.id || p.user_id === user.id)
  const myRequests = requests.filter((r) => r.provider_id === myProvider?.id || r.provider_id === user.id || (!r.provider_id && r.status === 'new'))
  const displayRequests = myRequests

  const newRequests = displayRequests.filter((r) => r.status === 'new')
  const activeRequests = displayRequests.filter((r) => r.status === 'accepted' || r.status === 'in_progress')
  const completedRequests = displayRequests.filter((r) => r.status === 'completed')

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('provider.dashboard')}</h1>
          <p className="text-sm text-slate-500">{t('provider.manage')}</p>
        </div>
        <div className="flex items-center gap-2">
          {myProvider && (
            <span className={`badge ${myProvider.verification_status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {myProvider.verification_status === 'approved' ? t('provider.verified') : t('provider.pending')}
            </span>
          )}
        </div>
      </div>
      <div className="mb-5 flex flex-wrap gap-2"><Link to="/provider/requests" className="btn-primary">{t('provider.allRequests')}</Link><Link to="/provider/services" className="btn-secondary">{t('provider.manageServices')}</Link></div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <Clock size={18} className="text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{newRequests.length}</p>
          <p className="text-xs text-slate-400">{t('provider.new')}</p>
        </div>
        <div className="card p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
            <Loader size={18} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{activeRequests.length}</p>
          <p className="text-xs text-slate-400">{t('provider.active')}</p>
        </div>
        <div className="card p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{completedRequests.length}</p>
          <p className="text-xs text-slate-400">{t('provider.done')}</p>
        </div>
      </div>

      {/* New requests */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-slate-900">{t('provider.newRequests')}</h2>
        {newRequests.length > 0 ? (
          <div className="space-y-3">
            {newRequests.map((req) => (
              <div key={req.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{req.customer_name}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">{req.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {req.neighborhood}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {req.preferred_time}</span>
                      <span className="flex items-center gap-1"><Wrench size={11} /> {req.category_name}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => updateRequestStatus(req.id, 'accepted')}
                    className="btn-success flex-1"
                  >
                    <Check size={14} /> {t('provider.accept')}
                  </button>
                  <button
                    onClick={() => updateRequestStatus(req.id, 'declined')}
                    className="btn-danger flex-1"
                  >
                    <X size={14} /> {t('provider.decline')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card flex items-center justify-center py-8 text-sm text-slate-400">
            {t('provider.none')}
          </div>
        )}
      </section>

      {/* Active requests */}
      {activeRequests.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-slate-900">{t('provider.activeJobs')}</h2>
          <div className="space-y-3">
            {activeRequests.map((req) => (
              <div key={req.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{req.customer_name}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">{req.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {req.neighborhood}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {req.preferred_time}</span>
                    </div>
                  </div>
                </div>
                {req.status === 'accepted' && (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'in_progress')}
                    className="btn-secondary mt-3 w-full"
                  >
                    <Loader size={14} /> {t('provider.start')}
                  </button>
                )}
                {req.status === 'in_progress' && (
                  <button
                    onClick={() => updateRequestStatus(req.id, 'completed')}
                    className="btn-success mt-3 w-full"
                  >
                    <CheckCircle2 size={14} /> {t('provider.complete')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completedRequests.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-900">{t('provider.completedJobs')}</h2>
          <div className="space-y-3">
            {completedRequests.map((req) => (
              <div key={req.id} className="card p-4 opacity-75">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{req.customer_name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{req.category_name} · {req.neighborhood}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
