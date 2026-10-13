import { Link, useNavigate } from 'react-router-dom'
import { Bell, BriefcaseBusiness, FileText, Flag, LogOut, Shield, UserRound, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

const tile = 'card flex items-center gap-3 p-4 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50/40'

export default function ProfilePage() {
  const { user, logout, backendConfigured } = useApp()
  const { t } = useLanguage()
  const navigate = useNavigate()
  if (!user.isLoggedIn) return <div className="mx-auto max-w-xl py-6"><div className="card p-6 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><UserRound size={28}/></div><h1 className="mt-4 text-xl font-bold text-slate-900">{t('profile.title')}</h1><p className="mt-1 text-sm text-slate-500">{t('profile.signinHint')}</p><div className="mt-5 flex justify-center gap-2"><Link to="/login" className="btn-primary">{t('nav.login')}</Link><Link to="/signup" className="btn-secondary">{t('nav.signup')}</Link></div><p className="mt-5 text-xs text-slate-400">{t('profile.providerHint')} <Link className="font-semibold text-primary-700" to="/provider-onboarding">{t('profile.providerLink')}</Link>.</p></div></div>

  const roleLabels = { customer: t('role.customer'), provider: t('role.provider'), admin: t('role.admin') }
  return <div className="mx-auto max-w-3xl"><div className="card overflow-hidden"><div className="h-20 bg-gradient-to-r from-[#e0e1e0] to-[#c9cbca]"/><div className="px-5 pb-5"><div className="-mt-10 flex items-end gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-primary-700 ring-4 ring-white">{user.name.charAt(0)}</div><div className="pb-1"><h1 className="text-xl font-bold text-slate-900">{user.name}</h1><span className="chip bg-primary-50 text-primary-700">{roleLabels[user.role]}</span></div></div></div></div>
    {!backendConfigured && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">{t('profile.demo')}</p>}
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <Link to="/account" className={tile}><UserRound size={18} className="text-primary-700"/> {t('profile.personal')}</Link>
      <Link to="/notifications" className={tile}><Bell size={18} className="text-primary-700"/> {t('profile.notifications')}</Link>
      <Link to="/help" className={tile}><Flag size={18} className="text-primary-700"/> {t('profile.help')}</Link>
      <Link to="/privacy" className={tile}><Shield size={18} className="text-primary-700"/> {t('profile.privacy')}</Link>
      <Link to="/terms" className={tile}><FileText size={18} className="text-primary-700"/> {t('profile.terms')}</Link>
      {user.role==='provider'&&<><Link to="/provider-dashboard" className={tile}><BriefcaseBusiness size={18} className="text-primary-700"/> {t('profile.dashboard')}</Link><Link to="/provider/services" className={tile}><Wrench size={18} className="text-primary-700"/> {t('profile.myServices')}</Link></>}
      {user.role==='admin'&&<Link to="/admin" className={tile}><Shield size={18} className="text-primary-700"/> {t('profile.adminDashboard')}</Link>}
    </div>
    <button onClick={()=>{logout();navigate('/')}} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><LogOut size={16}/> {t('profile.logout')}</button>
  </div>
}
