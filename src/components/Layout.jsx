import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Toast from './Toast'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const onboarding = pathname === '/welcome' || (localStorage.getItem('heladeeg-onboarding-complete') !== 'true' && pathname === '/')
  const authPage = ['/login', '/signup', '/reset-password', '/admin/login'].includes(pathname)
  const hideAppNavigation = onboarding || authPage
  const { backendConfigured } = useApp()
  const { t, language } = useLanguage()
  return (
    <div className={onboarding ? 'welcome-shell' : 'min-h-screen bg-slate-50'}>
      {!hideAppNavigation && <TopBar />}
      <main className={onboarding ? 'welcome-main' : authPage ? 'auth-page-main' : 'mx-auto max-w-6xl px-4 pb-24 pt-4 md:pb-8 md:pt-6'}>
        {children}
      </main>
      {!hideAppNavigation && <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 pb-24 text-xs text-slate-500 md:pb-5">
          <span>HelAdeeg · {t('brand.city')}{language === 'en' ? ', Somalia' : language === 'ar' ? '، الصومال' : ', Soomaaliya'}</span>
          <nav aria-label="Xiriirro iyo sharci" className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-primary-700">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-primary-700">{t('footer.terms')}</Link>
            <Link to="/help" className="hover:text-primary-700">{t('nav.help')}</Link>
          </nav>
          {!backendConfigured && <span>{language === 'en' ? 'Demo preview' : language === 'ar' ? 'نسخة تجريبية' : 'Muuqaal tijaabo ah'}</span>}
        </div>
      </footer>}
      {!hideAppNavigation && <><BottomNav /><Toast /></>}
    </div>
  )
}
