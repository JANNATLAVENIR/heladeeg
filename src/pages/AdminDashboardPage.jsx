import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Users, ClipboardList, ShieldCheck, AlertTriangle, CheckCircle2, FileText, Star, RefreshCw, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'
import { useLanguage } from '../context/LanguageContext'

const avatarColors = {
  amber: 'bg-primary-100 text-primary-800',
  cyan: 'bg-primary-100 text-primary-800',
  slate: 'bg-primary-100 text-primary-800',
  blue: 'bg-primary-100 text-primary-800',
  teal: 'bg-primary-100 text-primary-800',
  orange: 'bg-primary-100 text-primary-800',
}

export default function AdminDashboardPage() {
  const { providers, requests, complaints, users, user, backendConfigured, refreshDashboard } = useApp()
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    if (user.isLoggedIn && user.role === 'admin') void refreshDashboard()
  }, [user.id, user.role, user.isLoggedIn, refreshDashboard])

  if (!user.isLoggedIn || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-bold text-slate-700">{t('admin.noAccessTitle')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('admin.noAccessHint')}</p>
        <button onClick={() => navigate('/profile')} className="btn-primary mt-4">{t('nav.login')}</button>
      </div>
    )
  }

  const pendingProviders = providers.filter((p) => p.verification_status === 'pending')
  const pendingAccounts = users.filter((account) => account.approval_status === 'pending')
  const verifiedCount = providers.filter((p) => p.verification_status === 'approved').length
  const totalProviders = providers.length
  const activeRequests = requests.filter((r) => r.status === 'new' || r.status === 'accepted' || r.status === 'in_progress').length
  const pendingRequests = requests.filter((r) => r.status === 'new')
  const totalRequests = requests.length

  const stats = [
    { label: t('admin.providers'), value: totalProviders, sub: `${verifiedCount} ${t('admin.verifiedCount')}`, icon: Users, color: 'bg-primary-50 text-primary-600' },
    { label: t('admin.requests'), value: totalRequests, sub: `${activeRequests} ${t('admin.active')}`, icon: ClipboardList, color: 'bg-blue-50 text-blue-600' },
    { label: t('admin.pendingRequests'), value: pendingRequests.length, sub: t('admin.requests'), icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
    { label: t('admin.pendingAccounts'), value: pendingAccounts.length, sub: t('admin.accounts'), icon: UserRound, color: 'bg-violet-50 text-violet-600' },
    { label: t('admin.pending'), value: pendingProviders.length, sub: t('admin.providers'), icon: ShieldCheck, color: 'bg-amber-50 text-amber-600' },
    { label: t('admin.customers'), value: 124, sub: t('admin.registered'), icon: Star, color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('admin.title')}</h1>
        <p className="text-sm text-slate-500">{t('admin.description')}</p>
          </div>
          <button type="button" onClick={() => void refreshDashboard()} className="btn-secondary flex shrink-0 items-center gap-2" aria-label={t('admin.refresh')}>
            <RefreshCw size={15} /> <span className="hidden sm:inline">{t('admin.refresh')}</span>
          </button>
        </div>
        <p className={`mt-2 inline-block rounded-lg px-3 py-1.5 text-xs ${backendConfigured ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>{backendConfigured ? 'Xogta Supabase' : 'Dashboard tijaabo ah · xog mock ah'}</p>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-600">{stat.label}</p>
              <p className="text-[10px] text-slate-400">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <UserRound size={16} className="text-violet-600" /> {t('admin.pendingAccounts')}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">{t('admin.pendingAccountsHint')}</p>
            </div>
            <Link to="/admin/users" className="shrink-0 text-xs font-medium text-primary-600 hover:text-primary-700">{t('admin.manageUsers')}</Link>
          </div>
          <div className="mt-4 space-y-2">
            {pendingAccounts.length ? pendingAccounts.slice(0, 5).map((account) => (
              <div key={account.id} className="flex items-center justify-between gap-3 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{account.full_name || t('admin.customer')}</p>
                  <p className="truncate text-[11px] text-slate-500">{account.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">{t('admin.awaitingApproval')}</span>
              </div>
            )) : <p className="py-5 text-center text-sm text-slate-400">{t('admin.noPendingAccounts')}</p>}
          </div>
        </section>

        {/* Provider verification */}
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldCheck size={16} className="text-primary-600" />
            {t('admin.verifyProviders')}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{t('admin.approveOrReject')}</p>

          <div className="mt-4 space-y-3">
            {pendingProviders.length > 0 ? (
              pendingProviders.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${avatarColors[provider.avatar_color] || avatarColors.slate}`}>
                        {provider.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{provider.display_name}</p>
                        <p className="text-[11px] text-slate-400">{provider.years_experience} sano · {provider.service_area.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/admin/providers" className="btn-secondary mt-3 w-full">{t('admin.reviewDocuments')}</Link>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-slate-400">
                <CheckCircle2 size={16} className="mr-2" /> {t('admin.allApproved')}
              </div>
            )}
          </div>
        </section>

        {/* Complaints */}
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <AlertTriangle size={16} className="text-amber-500" />
            {t('admin.complaints')}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{t('admin.openReports')}</p>
          <Link to="/admin/reports" className="mt-2 inline-block text-xs font-semibold text-primary-700">{t('admin.manageReports')} →</Link>

          <div className="mt-4 space-y-3">
            {complaints.length > 0 ? (
              complaints.map((c) => (
                <div key={c.id} className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.subject}</p>
                      <p className="text-[11px] text-slate-400">Gudaha: {c.requester} · {c.created_at}</p>
                    </div>
                    <span className="badge bg-amber-100 text-amber-700">{t('admin.open')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-slate-400">
                {t('admin.noComplaints')}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ClipboardList size={16} className="text-amber-600" /> {t('admin.pendingRequests')}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{t('admin.pendingRequestsHint')}</p>
          </div>
          <button type="button" onClick={() => navigate('/requests')} className="text-xs font-medium text-primary-600 hover:text-primary-700">{t('admin.viewAll')}</button>
        </div>
        <div className="mt-3 space-y-2">
          {pendingRequests.length ? pendingRequests.slice(0, 5).map((req) => (
            <div key={req.id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{req.customer_name || t('admin.customer')}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{req.category_name || t('admin.requests')} · {req.neighborhood || ''}</p>
              </div>
              <StatusBadge status={req.status} />
            </div>
          )) : <p className="py-5 text-center text-sm text-slate-400">{t('admin.noPendingRequests')}</p>}
        </div>
      </section>

      {/* Recent requests overview */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileText size={16} className="text-primary-600" />
            {t('admin.recentRequests')}
          </h2>
              <button onClick={() => navigate('/requests')} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            {t('admin.viewAll')}
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {requests.slice(0, 5).map((req) => (
            <div key={req.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{req.customer_name}</span>
                  <span className="text-xs text-slate-400">→</span>
                  <span className="text-sm text-slate-600">{req.provider_name}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{req.category_name} · {req.neighborhood}</p>
              </div>
              <StatusBadge status={req.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
