import { Link, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, HelpCircle, LogOut, MapPin, Search, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

export default function TopBar() {
  const { user, logout, notifications, offlinePreview, ownerSettings } = useApp()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const unread = notifications.filter((item) => !item.read_at).length
  return <>
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-lg font-extrabold text-white">H</div><div className="leading-none"><span className="block text-base font-extrabold tracking-tight text-slate-900">{ownerSettings.app_name || 'HelAdeeg'}</span><span className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-slate-400"><MapPin size={9}/> {t('brand.city')}</span></div></Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/">{t('nav.home')}</NavLink><NavLink to="/search">{t('nav.search')}</NavLink><NavLink to="/requests">{t('nav.requests')}</NavLink>
          {user.isLoggedIn && user.role==='provider' && <><NavLink to="/provider/requests">{t('nav.jobs')}</NavLink><NavLink to="/provider/services">{t('nav.services')}</NavLink></>}
          {user.isLoggedIn && user.role==='admin' && <><NavLink to="/admin">{t('nav.admin')}</NavLink><NavLink to="/admin/reports">{t('nav.reports')}</NavLink></>}
        </nav>
        <div className="flex items-center gap-2">
          <select aria-label={t('language.label')} value={language} onChange={(event)=>setLanguage(event.target.value)} className="max-w-[86px] rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary-400 sm:max-w-none sm:px-3 sm:text-sm"><option value="en">English</option><option value="so">Somali</option><option value="ar">العربية</option></select>
          <button aria-label={t('nav.search')} onClick={()=>navigate('/search')} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"><Search size={17}/></button>
          <Link aria-label={t('nav.notifications')} to="/notifications" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"><Bell size={17}/>{unread>0&&<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{unread}</span>}</Link>
          {user.isLoggedIn ? <div className="relative"><button onClick={()=>setShowMenu(!showMenu)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-700"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{user.name.charAt(0)}</span><span className="hidden sm:inline">{user.name}</span><ChevronDown size={14}/></button>{showMenu&&<><button aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={()=>setShowMenu(false)}/><div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl"><MenuLink to="/account" onClick={()=>setShowMenu(false)} icon={UserRound}>{t('nav.account')}</MenuLink><MenuLink to="/notifications" onClick={()=>setShowMenu(false)} icon={Bell}>{t('nav.notifications')}</MenuLink><MenuLink to="/help" onClick={()=>setShowMenu(false)} icon={HelpCircle}>{t('nav.help')}</MenuLink>{user.role==='provider'&&<MenuLink to="/provider-dashboard" onClick={()=>setShowMenu(false)} icon={UserRound}>{t('nav.dashboard')}</MenuLink>}{user.role==='admin'&&<MenuLink to="/admin" onClick={()=>setShowMenu(false)} icon={UserRound}>{t('nav.dashboard')}</MenuLink>}<button onClick={()=>{logout();setShowMenu(false);navigate('/')}} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"><LogOut size={15}/> {t('nav.logout')}</button></div></>}</div>:<div className="flex gap-2"><Link className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex" to="/login">{t('nav.login')}</Link><Link className="btn-primary px-3 py-2" to="/signup">{t('nav.signup')}</Link></div>}
        </div>
      </div>
    </header>
    {offlinePreview&&<div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-700">{language === 'en' ? 'You are in offline demo mode. No data is being sent.' : language === 'ar' ? 'أنت في الوضع التجريبي دون اتصال. لم يتم إرسال أي بيانات.' : 'Waxaad ku jirtaa demo-ga offline-ka ah. Xog lama dirayo.'}</div>}
  </>
}

function NavLink({to,children}) { return <Link to={to} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">{children}</Link> }
function MenuLink({to,onClick,icon:Icon,children}) { return <Link to={to} onClick={onClick} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><Icon size={15}/>{children}</Link> }
