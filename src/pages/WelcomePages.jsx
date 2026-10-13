import { ArrowRight, Clock3, Cog, House, Search, ShieldCheck, Wrench, Zap, Droplets } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export function GetStartedPage() {
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()
  return (
    <section className="welcome-page">
      <div className="welcome-language">
        <select aria-label={t('language.label')} value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option value="en">English</option><option value="so">Somali</option><option value="ar">العربية</option>
        </select>
      </div>
      <header className="welcome-brand">
        <div className="welcome-mark"><House size={62} strokeWidth={2.5} /><Wrench className="welcome-wrench" size={36} strokeWidth={3} /></div>
        <h1>HELADEEG</h1>
        <p>{t('welcome.tagline')}</p>
      </header>
      <div className="welcome-visual" aria-label={t('welcome.visualAlt')}>
        <div className="welcome-skyline" />
        <div className="trust-float"><span className="trust-icon"><ShieldCheck size={34} fill="currentColor" /></span><span><b>{t('welcome.trusted')}</b><small>{t('welcome.trustedHint')}</small></span></div>
        <div className="fast-float"><span className="clock-icon"><Clock3 size={34} /></span><span><b>{t('welcome.fast')}</b><small>{t('welcome.fastHint')}</small></span></div>
        <div className="phone-mockup">
          <div className="phone-screen">
            <div className="phone-notch" />
            <div className="phone-brand">HELADEEG</div>
            <div className="phone-search"><Search size={14} /><span>{t('welcome.search')}</span></div>
            <div className="phone-services">
              <div className="phone-service service-plumb"><Droplets size={26} /><span>{t('welcome.plumbing')}</span><ArrowRight size={14} /></div>
              <div className="phone-service service-mech"><Cog size={27} /><span>{t('welcome.mechanic')}</span><ArrowRight size={14} /></div>
              <div className="phone-service service-electric"><Zap size={27} /><span>{t('welcome.electrical')}</span><ArrowRight size={14} /></div>
              <div className="phone-service service-general"><Wrench size={26} /><span>{t('welcome.repair')}</span><ArrowRight size={14} /></div>
            </div>
          </div>
        </div>
        <div className="toolbox"><div className="toolbox-handle"/><div className="toolbox-clasp"/><Wrench className="toolbox-wrench" size={86} strokeWidth={2.4}/></div>
      </div>
      <button className="welcome-cta" onClick={() => (localStorage.setItem('heladeeg-onboarding-complete', 'true'), navigate('/login'))}>{t('welcome.getStarted')}<ArrowRight size={25}/></button>
      <footer className="welcome-company" aria-label="App developer">
        <img src="/jannat-avenir-logo.png" alt="" />
        <span>JANNAT L’AVENIR</span>
      </footer>
    </section>
  )
}
