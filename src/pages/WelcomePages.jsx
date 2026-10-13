import { ArrowRight, Brush, Droplets, Hammer, Paintbrush, Search, Sparkles, Truck, WashingMachine, Wrench, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { categoryLabel, useLanguage } from '../context/LanguageContext'
import { serviceCategories as demoCategories } from '../data/mockData'

const icons = {
  plumbing: Droplets, tuubooyin: Droplets,
  electrical: Zap, koronto: Zap,
  cleaning: Sparkles, nadiifin: Sparkles,
  moving: Truck, gaarsiin: Truck,
  painting: Paintbrush, rinjiyeyn: Paintbrush,
  carpentry: Hammer, farsamo: Hammer,
  'appliance-repair': WashingMachine, gardening: Brush,
  makaanik: Wrench, 'dayactir-ac': Wrench,
}

function Brand({ compact = false }) {
  return <div className={`welcome-luxe-brand${compact ? ' welcome-luxe-brand--compact' : ''}`}>
    <span className="welcome-luxe-monogram" aria-hidden="true"><b>H</b><i>✦</i></span>
    <span className="welcome-luxe-name">HELADEEG</span>
    {!compact && <span className="welcome-luxe-tag">ALL SERVICES <i /> ONE APP</span>}
  </div>
}

export function GetStartedPage() {
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()
  const { serviceCategories } = useApp()
  const categories = (serviceCategories.length ? serviceCategories : demoCategories).slice(0, 8)
  const goLogin = () => {
    localStorage.setItem('heladeeg-onboarding-complete', 'true')
    navigate('/login')
  }
  const skip = () => {
    localStorage.setItem('heladeeg-onboarding-complete', 'true')
    navigate('/app', { replace: true })
  }

  return <section className="welcome-luxe">
    <header className="welcome-luxe-header">
      <Brand />
      <div className="welcome-luxe-header-actions">
        <label className="sr-only" htmlFor="welcome-language">{t('language.label')}</label>
        <select id="welcome-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option value="en">EN</option><option value="so">SO</option><option value="ar">AR</option>
        </select>
        <button onClick={skip}>{language === 'so' ? 'Ka gudub' : language === 'ar' ? 'تخطّ' : 'Skip'}<ArrowRight size={17} /></button>
      </div>
    </header>

    <div className="welcome-luxe-hero">
      <div className="welcome-luxe-copy">
        <p className="welcome-luxe-eyebrow">{language === 'so' ? 'ADEEG-BIXIYAHAAGA LA AAMINI KARO' : language === 'ar' ? 'شريك الخدمات الموثوق' : 'YOUR TRUSTED SERVICE PARTNER'}</p>
        <h1>{language === 'so' ? <>Hel xirfadlayaal<br />dayactir oo kuu dhow</> : language === 'ar' ? <>اعثر على خدمات<br />موثوقة بالقرب منك</> : <>Find Trusted<br />Repair &amp; Home<br />Services Near You</>}</h1>
        <p>{language === 'so' ? 'Laga bilaabo tuubooyinka ilaa rinjiyeynta, HelAdeeg wuxuu kugu xidhayaa xirfadlayaal xirfad leh oo daboolaya baahiyaha gurigaaga.' : language === 'ar' ? 'من السباكة إلى الطلاء، يربطك HelAdeeg بمحترفين مهرة لجميع احتياجات منزلك.' : 'From plumbing to painting, Heladeeg connects you with skilled professionals for all your home and personal needs.'}</p>
      </div>

      <div className="welcome-luxe-visual" aria-label={t('welcome.visualAlt')}>
        <div className="welcome-luxe-room" />
        <div className="welcome-luxe-phone">
          <div className="welcome-luxe-screen">
            <div className="welcome-luxe-status"><span>9:41</span><span>● ◔ ▰</span></div>
            <div className="welcome-luxe-notch" />
            <Brand compact />
            <div className="welcome-luxe-location">⌖ &nbsp; Mogadishu⌄</div>
            <div className="welcome-luxe-search"><Search size={13} /><span>Search for a service...</span></div>
            <div className="welcome-luxe-promo"><b>Quality Services<br />for a Better Home</b><small>Fast · Trusted · Professional</small><i>→</i></div>
            <div className="welcome-luxe-popular"><b>Popular Services</b><span>View all</span></div>
            <div className="welcome-luxe-mini-grid">{categories.slice(0, 6).map((category) => {
              const Icon = icons[category.slug] || icons[category.id] || Wrench
              return <div key={category.id}><Icon size={17} /><small>{categoryLabel(category, language)}</small></div>
            })}</div>
            <div className="welcome-luxe-nav"><span>⌂<small>Home</small></span><span>▤<small>Bookings</small></span><span>♡<small>Messages</small></span><span>♙<small>Profile</small></span></div>
          </div>
        </div>
      </div>
    </div>

    <section className="welcome-luxe-services">
      <div className="welcome-luxe-services-heading">
        <div><p className="welcome-luxe-eyebrow">{language === 'so' ? 'ADEEGYADEENNA' : language === 'ar' ? 'خدماتنا' : 'OUR SERVICES'}</p><h2>{language === 'so' ? 'Maxaad u baahan tahay?' : language === 'ar' ? 'ما الخدمة التي تحتاجها؟' : 'What Do You Need Help With?'}</h2></div>
        <button onClick={goLogin}>{language === 'so' ? 'Dhammaan adeegyada' : language === 'ar' ? 'كل الخدمات' : 'All services'}<ArrowRight size={18} /></button>
      </div>
      <div className="welcome-luxe-service-grid">{categories.map((category) => {
        const Icon = icons[category.slug] || icons[category.id] || Wrench
        return <button key={category.id} className="welcome-luxe-tile" onClick={goLogin}>
          <span className="welcome-luxe-tile-icon"><Icon size={27} strokeWidth={1.35} /></span>
          <span className="welcome-luxe-tile-label">{categoryLabel(category, language)}</span><ArrowRight size={15} />
        </button>
      })}</div>
      <button className="welcome-luxe-cta" onClick={goLogin}>{t('welcome.getStarted')}<ArrowRight size={21} /></button>
      <footer className="welcome-luxe-company" aria-label="App developer"><img src="/jannat-avenir-logo.png" alt="" /><span>JANNAT L’AVENIR</span></footer>
    </section>
  </section>
}
