import {
  ArrowRight, Brush, Droplets, Hammer, Paintbrush, Search, Sparkles,
  Truck, WashingMachine, Wrench, Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage, categoryLabel } from '../context/LanguageContext'
import { useApp } from '../context/AppContext'
import { serviceCategories as demoCategories } from '../data/mockData'

const categoryIcons = {
  plumbing: Droplets,
  electrical: Zap,
  cleaning: Sparkles,
  moving: Truck,
  painting: Paintbrush,
  carpentry: Hammer,
  'appliance-repair': WashingMachine,
  gardening: Brush,
  koronto: Zap,
  nadiifin: Sparkles,
  makaanik: Wrench,
  tuubooyin: Droplets,
  rinjiyeyn: Paintbrush,
  gaarsiin: Truck,
  farsamo: Hammer,
  appliance: WashingMachine,
  'dayactir-ac': Wrench,
}

const categoryPhotos = [
  'photo-1585704032915-c3400ca199e7',
  'photo-1507473885765-e6ed057f782c',
  'photo-1581578731548-c64695cc6952',
  'photo-1600210492486-724fe5c67fb0',
  'photo-1562259949-e8e7689d7828',
  'photo-1504148455328-c376907d081c',
  'photo-1626806787461-102c1bfaaea1',
  'photo-1416879595882-3373a0480b5b',
]

function BrandLockup({ compact = false }) {
  return (
    <div className={`welcome-brand-lockup${compact ? ' welcome-brand-lockup--compact' : ''}`} aria-label="HelAdeeg">
      <span className="welcome-brand-monogram" aria-hidden="true"><b>H</b><i>✦</i><b>H</b></span>
      <span className="welcome-brand-name">HELADEEG</span>
      {!compact && <span className="welcome-brand-caption">ALL SERVICES <i /> ONE APP</span>}
    </div>
  )
}

export function GetStartedPage() {
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()
  const { serviceCategories } = useApp()
  const categories = (serviceCategories.length ? serviceCategories : demoCategories).slice(0, 8)
  const startLogin = () => {
    localStorage.setItem('heladeeg-onboarding-complete', 'true')
    navigate('/login')
  }
  const skip = () => {
    localStorage.setItem('heladeeg-onboarding-complete', 'true')
    navigate('/app', { replace: true })
  }

  return (
    <section className="welcome-page welcome-editorial">
      <header className="welcome-editorial-header">
        <BrandLockup />
        <div className="welcome-editorial-actions">
          <label className="sr-only" htmlFor="welcome-language">{t('language.label')}</label>
          <select id="welcome-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="en">EN</option><option value="so">SO</option><option value="ar">AR</option>
          </select>
          <button className="welcome-skip" onClick={skip}>
            {language === 'so' ? 'Ka gudub' : language === 'ar' ? 'تخطّ' : 'Skip'}<ArrowRight size={18} />
          </button>
        </div>
      </header>

      <div className="welcome-editorial-hero">
        <div className="welcome-editorial-copy">
          <p className="welcome-editorial-kicker">{language === 'so' ? 'ADEEG-BIXIYAHAAGA LA AAMINI KARO' : language === 'ar' ? 'شريك الخدمات الموثوق' : 'YOUR TRUSTED SERVICE PARTNER'}</p>
          <h1>{language === 'so' ? <>Hel xirfadlayaal<br />dayactir oo kuu dhow</> : language === 'ar' ? <>اعثر على خدمات<br />موثوقة بالقرب منك</> : <>Find Trusted<br />Repair &amp; Home<br className="welcome-desktop-break" /> Services Near You</>}</h1>
          <p className="welcome-editorial-description">{language === 'so' ? 'Laga bilaabo tuubooyinka ilaa rinjiyeynta, HelAdeeg wuxuu kugu xidhayaa xirfadlayaal xirfad leh oo kuu dhow.' : language === 'ar' ? 'من السباكة إلى الطلاء، يربطك HelAdeeg بمحترفين مهرة بالقرب منك.' : 'From plumbing to painting, HelAdeeg connects you with skilled professionals for all your home and personal needs.'}</p>
        </div>

        <div className="welcome-editorial-product" aria-label={t('welcome.visualAlt')}>
          <div className="welcome-editorial-room" />
          <div className="welcome-editorial-phone">
            <div className="welcome-phone-screen">
              <div className="welcome-phone-status"><span>9:41</span><span>● ◔ ▰</span></div>
              <div className="welcome-phone-notch" />
              <BrandLockup compact />
              <div className="welcome-phone-location">⌖ &nbsp; Mogadishu⌄</div>
              <div className="welcome-phone-search"><Search size={13} /><span>{language === 'so' ? 'Raadi adeeg...' : language === 'ar' ? 'ابحث عن خدمة...' : 'Search for a service...'}</span></div>
              <div className="welcome-phone-promo"><span>Quality Services<br />for a Better Home</span><small>Fast · Trusted · Professional</small><i>→</i></div>
              <div className="welcome-phone-popular"><b>Popular Services</b><span>View all</span></div>
              <div className="welcome-phone-categories">
                {categories.slice(0, 6).map((category) => {
                  const Icon = categoryIcons[category.slug] || categoryIcons[category.id] || Wrench
                  return <div key={category.id}><Icon size={17} /><small>{categoryLabel(category, language)}</small></div>
                })}
              </div>
              <div className="welcome-phone-nav"><span>⌂<small>Home</small></span><span>▤<small>Bookings</small></span><span>♡<small>Messages</small></span><span>♙<small>Profile</small></span></div>
            </div>
          </div>
        </div>
      </div>

      <section className="welcome-service-panel">
        <div className="welcome-service-heading">
          <div><p className="welcome-editorial-kicker">{language === 'so' ? 'ADEEGYADEENNA' : language === 'ar' ? 'خدماتنا' : 'OUR SERVICES'}</p><h2>{language === 'so' ? 'Maxaad u baahan tahay?' : language === 'ar' ? 'ما الخدمة التي تحتاجها؟' : 'What Do You Need Help With?'}</h2></div>
          <button onClick={() => { localStorage.setItem('heladeeg-onboarding-complete', 'true'); navigate('/search') }}>
            {language === 'so' ? 'Dhammaan adeegyada' : language === 'ar' ? 'كل الخدمات' : 'All services'}<ArrowRight size={19} />
          </button>
        </div>
        <div className="welcome-service-grid">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || categoryIcons[category.id] || Wrench
            const photo = categoryPhotos[index % categoryPhotos.length]
            return (
              <button className="welcome-service-tile" key={category.id} onClick={() => { localStorage.setItem('heladeeg-onboarding-complete', 'true'); navigate(`/categories/${category.slug || category.id}`) }}>
                <span className="welcome-service-photo" style={{ backgroundImage: `linear-gradient(0deg,rgba(243,238,230,.96) 0%,rgba(243,238,230,0) 70%),url(https://images.unsplash.com/${photo}?auto=format&fit=crop&w=500&q=78)` }}><Icon size={28} strokeWidth={1.3} /></span>
                <span className="welcome-service-name">{categoryLabel(category, language)}</span><ArrowRight size={16} />
              </button>
            )
          })}
        </div>
        <button className="welcome-cta welcome-editorial-cta" onClick={startLogin}>{t('welcome.getStarted')}<ArrowRight size={21} /></button>
        <footer className="welcome-company welcome-editorial-company" aria-label="App developer">
          <img src="/jannat-avenir-logo.png" alt="" />
          <span>JANNAT L’AVENIR</span>
        </footer>
      </section>
    </section>
  )
}
