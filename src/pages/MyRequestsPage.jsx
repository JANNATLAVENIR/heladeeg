import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Inbox, MapPin, Clock3, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'
import { categoryLabel, useLanguage } from '../context/LanguageContext'

export default function MyRequestsPage() {
  const { requests, user, backendConfigured, serviceCategories } = useApp()
  const { language, t } = useLanguage()
  const [filter, setFilter] = useState('all')
  const mine = requests.filter((request) => user.role === 'admin' || request.customer_id === user.id)
  const visible = filter === 'all' ? mine : filter === 'active'
    ? mine.filter((request) => ['new', 'accepted', 'in_progress'].includes(request.status))
    : mine.filter((request) => ['completed', 'cancelled', 'declined', 'disputed'].includes(request.status))
  return <div className="animate-fade-in">
    <div className="mb-5"><h1 className="text-2xl font-bold text-slate-900">{t('requestlist.title')}</h1><p className="text-sm text-slate-500">{t('requestlist.description')}</p></div>
    {!user.isLoggedIn && !backendConfigured && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{language === 'en' ? 'This is demo data.' : language === 'ar' ? 'هذه بيانات تجريبية.' : 'Tani waa xog tijaabo ah.'} <Link className="font-bold underline" to="/login">{t('nav.login')}</Link> {language === 'en' ? 'to view your requests.' : language === 'ar' ? 'لعرض طلباتك.' : 'si aad u aragto codsiyadaada.'}</div>}
    <div className="mb-4 flex gap-2">{[['all', t('requestlist.all')], ['active', t('requestlist.active')], ['history', t('requestlist.history')]].map(([key, label]) => <button key={key} onClick={() => setFilter(key)} className={`chip ${filter === key ? 'bg-primary-700 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>{label}</button>)}</div>
    {visible.length ? <div className="space-y-3">{visible.map((request) => {
      const category = serviceCategories.find((item) => item.id === request.category_id)
      return <Link to={`/requests/${request.id}`} key={request.id} className="card block p-4 transition hover:border-primary-200 hover:shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-900">{request.provider_name || t('requests.providerWaiting')}</h2><StatusBadge status={request.status} /></div><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span className="chip bg-slate-100 text-slate-600">{category ? categoryLabel(category, language) : request.category_name}</span><span className="inline-flex items-center gap-1"><MapPin size={12} />{request.neighborhood}</span><span className="inline-flex items-center gap-1"><Clock3 size={12} />{request.preferred_time}</span></div><p className="mt-2 line-clamp-2 text-sm text-slate-600">{request.description}</p><p className="mt-2 text-[11px] text-slate-400">{t('requests.reference')} {request.id} · {new Date(request.created_at).toLocaleDateString(language === 'so' ? 'so-SO' : language === 'ar' ? 'ar' : 'en')}</p></div><ChevronRight size={18} className="mt-1 shrink-0 text-slate-300" /></div></Link>
    })}</div> : <div className="card flex flex-col items-center justify-center py-14 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100"><Inbox size={28} className="text-slate-400" /></div><h2 className="mt-4 font-semibold text-slate-800">{mine.length ? t('requests.emptyTitle') : t('requests.noRequests')}</h2><p className="mt-1 max-w-sm text-sm text-slate-500">{mine.length ? t('requests.changeFilter') : t('requests.trackHint')}</p><Link to="/search" className="btn-primary mt-4"><ClipboardList size={16} /> {t('requests.search')}</Link></div>}
  </div>
}
