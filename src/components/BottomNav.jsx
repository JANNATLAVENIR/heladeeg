import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ClipboardList, UserRound, ShieldCheck, Wrench, Flag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

export default function BottomNav() {
  const location = useLocation()
  const { user } = useApp()
  const { t, language } = useLanguage()
  const navItems = user.isLoggedIn && user.role === 'provider'
    ? [
        { path: '/', label: t('nav.home'), icon: Home },
        { path: '/provider/requests', label: t('nav.jobs'), icon: ClipboardList },
        { path: '/provider/services', label: t('nav.services'), icon: Wrench },
        { path: '/account', label: t('nav.account'), icon: UserRound },
      ]
    : user.isLoggedIn && user.role === 'admin'
      ? [
          { path: '/admin', label: language === 'en' ? 'Overview' : language === 'ar' ? 'نظرة عامة' : 'Guud', icon: Home },
          { path: '/admin/providers', label: language === 'en' ? 'Verify' : language === 'ar' ? 'التحقق' : 'Hubin', icon: ShieldCheck },
          { path: '/admin/reports', label: t('nav.reports'), icon: Flag },
          { path: '/account', label: t('nav.account'), icon: UserRound },
        ]
      : [
          { path: '/', label: t('nav.home'), icon: Home },
          { path: '/search', label: t('nav.search'), icon: Search },
          { path: '/requests', label: t('nav.requests'), icon: ClipboardList },
          { path: '/account', label: t('nav.account'), icon: UserRound },
        ]
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  return <nav aria-label="Navigation-ka hoose" className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg md:hidden">
    <div className="mx-auto flex max-w-2xl items-stretch justify-around">
      {navItems.map(({path,label,icon:Icon}) => { const active=isActive(path); return <Link key={path} to={path} aria-current={active?'page':undefined} className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 ${active?'text-primary-700':'text-slate-400'}`}><div className={`flex h-8 w-8 items-center justify-center rounded-xl ${active?'bg-primary-50':''}`}><Icon size={20} strokeWidth={active?2.5:2}/></div><span className={`text-[10px] ${active?'font-semibold':''}`}>{label}</span></Link> })}
    </div>
    <div className="h-[env(safe-area-inset-bottom)]" />
  </nav>
}
