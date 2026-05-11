import { useNavigate } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import Icon from '../components/Icon'

// ── i18n ──────────────────────────────────────────────────────────────────────

const T = {
  he: {
    heroTitle:     'הטיול הבא שלכם, מסודר סוף סוף',
    heroSub:       'מפות, תוכנית יומית, ציוד וסינכרון בזמן אמת. לינק אחד לכל הקבוצה.',
    ctaPrimary:    'מתחילים בחינם',
    ctaFree:       'בחינם לגמרי. לא צריך כרטיס אשראי.',
    signIn:        'כניסה',
    langToggle:    'EN',
    featuresTitle: 'בנוי בשביל קבוצות אמיתיות',
    featuresSub:   'כי אף אחד לא רוצה לנהל 12 שיחות וואטסאפ וגוגל שיטס.',
    features: [
      { title: 'הטיול שלכם על המפה',   desc: 'כל עצירה, מסלול ומרחק בהצצה אחת. בלי "אנחנו איפה עכשיו?"', icon: 'map',   color: '#C4622D', bg: 'var(--accent-pale)' },
      { title: 'כולם מסונכרנים',         desc: 'שלחו לינק אחד. כל שינוי מגיע לכולם ברגע שהוא קורה.',        icon: 'users', color: '#2D6B6B', bg: 'var(--teal-light)' },
      { title: 'הכל במקום אחד',          desc: 'לוח זמנים, ציוד, תמונות ותקציב. ביחד תמיד. בלי פיצולים.',  icon: 'list',  color: '#5B8FD4', bg: 'rgba(91,143,212,0.12)' },
    ],
    howTitle: 'מוכנים תוך כמה דקות',
    steps: [
      { title: 'יוצרים טיול',      desc: 'שם, תאריכים ויעד. עשר שניות ומסיימים.' },
      { title: 'בונים את התוכנית', desc: 'מוסיפים ימים ועצירות. המפה מתמלאת מעצמה.' },
      { title: 'שולחים לקבוצה',    desc: 'לינק אחד לכולם. לא צריך להוריד כלום לצפייה.' },
    ],
    ctaTitle: 'מוכנים לטיול הבא?',
    ctaSub:   'בחינם. לוקח פחות מדקה להתחיל.',
    privacy:  'מדיניות פרטיות',
    terms:    'תנאי שימוש',
  },
  en: {
    heroTitle:     'Your group trip, sorted',
    heroSub:       'Maps, itineraries, packing lists and real-time sync. One link for your whole crew.',
    ctaPrimary:    'Start planning free',
    ctaFree:       'Free forever. No credit card needed.',
    signIn:        'Sign in',
    langToggle:    'עב',
    featuresTitle: 'Built for how groups actually travel',
    featuresSub:   "Because nobody wants to manage 12 WhatsApp threads and a Google Sheet.",
    features: [
      { title: 'Your whole trip on a map', desc: "Every stop, route and distance at a glance. No more \"where are we even going?\" texts.", icon: 'map',   color: '#C4622D', bg: 'var(--accent-pale)' },
      { title: 'Everyone stays in sync',   desc: 'Share one link. Every update reaches the whole group the moment it happens.',          icon: 'users', color: '#2D6B6B', bg: 'var(--teal-light)' },
      { title: 'Everything in one place',  desc: 'Itinerary, packing list, photos and budget. All together, always. No scattered tabs.', icon: 'list',  color: '#5B8FD4', bg: 'rgba(91,143,212,0.12)' },
    ],
    howTitle: 'Up and running in minutes',
    steps: [
      { title: 'Create your trip',     desc: 'Name it, set your dates and pick a destination. Ten seconds.' },
      { title: 'Build your itinerary', desc: 'Add days and stops. The map fills itself in.' },
      { title: 'Share with your crew', desc: 'One link for everyone. No app install needed to view.' },
    ],
    ctaTitle: 'Ready for your next trip?',
    ctaSub:   'Free to start. Takes less than a minute.',
    privacy:  'Privacy Policy',
    terms:    'Terms',
  },
}

// ── Phone mockup illustration ─────────────────────────────────────────────────

function PhoneMockup({ isHe }) {
  return (
    <svg
      viewBox="0 0 200 400"
      style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.65)) drop-shadow(0 4px 16px rgba(196,98,45,0.2))' }}
    >
      <defs>
        <linearGradient id="pmRoute" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#C4622D"/>
          <stop offset="55%"  stopColor="#2D9E6E"/>
          <stop offset="100%" stopColor="#5B8FD4"/>
        </linearGradient>
        <linearGradient id="pmMapBg" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="#1C2B3A"/>
          <stop offset="100%" stopColor="#0D1520"/>
        </linearGradient>
        <clipPath id="pmScreen">
          <rect x="8" y="34" width="184" height="349" rx="4"/>
        </clipPath>
      </defs>

      <rect x="1" y="1" width="198" height="398" rx="38" fill="#0D0D0D"/>
      <rect x="4" y="4" width="192" height="392" rx="35" fill="#1A1612"/>
      <rect x="72" y="10" width="56" height="12" rx="6" fill="#0A0A0A"/>
      <circle cx="100" cy="16" r="3.5" fill="#111"/>

      <g clipPath="url(#pmScreen)">
        <rect x="8" y="34" width="184" height="198" fill="url(#pmMapBg)"/>

        {[70,100,130,160,190,220].map(y => (
          <line key={`h${y}`} x1="8" y1={y} x2="192" y2={y} stroke="rgba(255,255,255,0.033)" strokeWidth="1"/>
        ))}
        {[40,75,110,145,180].map(x => (
          <line key={`v${x}`} x1={x} y1="34" x2={x} y2="232" stroke="rgba(255,255,255,0.033)" strokeWidth="1"/>
        ))}

        <path d="M 38 206 C 68 163, 110 122, 150 146 C 168 157, 174 180, 162 188"
          stroke="rgba(0,0,0,0.4)" strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M 38 206 C 68 163, 110 122, 150 146 C 168 157, 174 180, 162 188"
          stroke="url(#pmRoute)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="7 3"/>

        <circle cx="38"  cy="206" r="12" fill="rgba(196,98,45,0.2)"/>
        <circle cx="38"  cy="206" r="9"  fill="#C4622D"/>
        <text x="38"  y="210" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">1</text>
        <circle cx="116" cy="123" r="12" fill="rgba(45,158,110,0.2)"/>
        <circle cx="116" cy="123" r="9"  fill="#2D9E6E"/>
        <text x="116" y="127" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">2</text>
        <circle cx="162" cy="188" r="12" fill="rgba(91,143,212,0.2)"/>
        <circle cx="162" cy="188" r="9"  fill="#5B8FD4"/>
        <text x="162" y="192" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">3</text>

        <rect x="70" y="88" width="60" height="17" rx="8.5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.14)" strokeWidth="0.75"/>
        <text x="100" y="100" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="monospace">
          {isHe ? '247 ק"מ' : '154 mi'}
        </text>

        <rect x="8" y="34" width="184" height="40" fill="rgba(8,14,22,0.92)"/>
        <text x={isHe ? 176 : 22} y="59" textAnchor={isHe ? 'end' : 'start'}
          fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600" fontFamily="Georgia,serif">
          Triplan
        </text>
        <circle cx={isHe ? 22 : 178} cy="54" r="11" fill="rgba(196,98,45,0.2)"/>
        <circle cx={isHe ? 22 : 178} cy="54" r="8"  fill="#C4622D"/>
        <text x={isHe ? 22 : 178} y="58" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">+</text>

        <rect x="8" y="232" width="184" height="151" fill="#F2EDE5"/>

        <text x={isHe ? 178 : 20} y="252" textAnchor={isHe ? 'end' : 'start'}
          fill="#1A1612" fontSize="13" fontWeight="600" fontFamily="Georgia,serif">
          {isHe ? 'טיול לאיטליה 🇮🇹' : 'Italy Trip 🇮🇹'}
        </text>
        <text x={isHe ? 178 : 20} y="265" textAnchor={isHe ? 'end' : 'start'}
          fill="rgba(26,22,18,0.45)" fontSize="9.5">
          {isHe ? '7 ימים · 12 עצירות' : '7 days · 12 stops'}
        </text>

        <rect x="20" y="275" width="160" height="3" rx="1.5" fill="rgba(26,22,18,0.1)"/>
        <rect x="20" y="275" width="100" height="3" rx="1.5" fill="#2D9E6E"/>

        {[
          { y: 285, col: '#C4622D', label: isHe ? 'יום 1 — רומא'   : 'Day 1 — Rome',     sub: isHe ? '3 עצירות' : '3 stops' },
          { y: 310, col: '#2D9E6E', label: isHe ? 'יום 2 — פירנצה' : 'Day 2 — Florence', sub: isHe ? '4 עצירות' : '4 stops' },
          { y: 335, col: '#5B8FD4', label: isHe ? 'יום 3 — ונציה'  : 'Day 3 — Venice',   sub: isHe ? '5 עצירות' : '5 stops' },
        ].map(({ y, col, label, sub }) => (
          <g key={y}>
            <rect x="16" y={y} width="168" height="21" rx="7" fill="white" stroke="rgba(26,22,18,0.07)" strokeWidth="0.75"/>
            <rect x={isHe ? 176 : 19} y={y + 6} width="3" height="9" rx="1.5" fill={col}/>
            <text x={isHe ? 170 : 26} y={y + 14} textAnchor={isHe ? 'end' : 'start'}
              fill="#1A1612" fontSize="9" fontWeight="500">{label}</text>
            <text x={isHe ? 26 : 176} y={y + 14} textAnchor={isHe ? 'start' : 'end'}
              fill="rgba(26,22,18,0.4)" fontSize="8.5">{sub}</text>
          </g>
        ))}

        <rect x="72" y="367" width="56" height="3" rx="1.5" fill="rgba(26,22,18,0.18)"/>
      </g>

      <rect x="1" y="1" width="198" height="398" rx="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
    </svg>
  )
}

// ── Lang toggle (pill button, dark surface) ───────────────────────────────────

function LangToggleDark({ lang, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={lang === 'he' ? 'Switch to English' : 'החלף לעברית'}
      style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', padding: '7px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
    >
      {lang === 'he' ? 'EN' : 'עב'}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate       = useNavigate()
  const { lang, toggleLang } = useLang()
  const t    = T[lang]
  const isHe = lang === 'he'
  const dir  = isHe ? 'rtl' : 'ltr'

  const goAuth = () => navigate('/auth')

  return (
    <div dir={dir} style={{ background: '#1A1612', overflowY: 'auto', height: '100%' }}>

      {/* ── Hero ── */}
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80%', height: '65%',
            background: 'radial-gradient(ellipse at 85% 100%, rgba(196,98,45,0.28) 0%, transparent 60%)' }}/>
          <div style={{ position: 'absolute', top: '8%', left: 0, width: '55%', height: '50%',
            background: 'radial-gradient(ellipse at 10% 25%, rgba(45,107,107,0.18) 0%, transparent 60%)' }}/>
          {[[18,12],[82,7],[152,20],[172,55],[28,75],[62,42],[134,68],[48,35]].map(([x, y], i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 1.5, height: 1.5, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }}/>
          ))}
        </div>

        {/* Nav */}
        <div style={{ padding: 'calc(var(--safe-top) + 16px) 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="globe" size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'white', letterSpacing: '-0.02em' }}>Triplan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangToggleDark lang={lang} onToggle={toggleLang} />
            <button onClick={goAuth} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {t.signIn}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 48px 0', position: 'relative', zIndex: 1, minHeight: 0 }}>
          <div className="anim-float" style={{ height: 'min(52svh, 320px)', aspectRatio: '1/2' }}>
            <PhoneMockup isHe={isHe} />
          </div>
        </div>

        {/* Hero text + CTA */}
        <div style={{ padding: '28px 28px calc(var(--safe-bottom) + 40px)', position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 33, fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: 12, textAlign: isHe ? 'right' : 'left' }}>
            {t.heroTitle}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.65, marginBottom: 28, textAlign: isHe ? 'right' : 'left' }}>
            {t.heroSub}
          </p>
          <button
            onClick={goAuth}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e   => e.currentTarget.style.transform = ''}
            style={{ width: '100%', padding: '17px 24px', borderRadius: 16, background: 'var(--accent)', color: 'white', fontSize: 17, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(196,98,45,0.45)', marginBottom: 10, fontFamily: 'var(--font-body)', transition: 'transform 0.15s' }}>
            {t.ctaPrimary}
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{t.ctaFree}</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22, gap: 8, alignItems: 'center', opacity: 0.25 }}>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.7)' }}/>
            <span style={{ fontSize: 9, color: 'white', letterSpacing: '0.14em', textTransform: 'uppercase' }}>scroll</span>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.7)' }}/>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div dir={dir} style={{ background: 'var(--cream)', padding: '56px 24px 64px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 8, textAlign: isHe ? 'right' : 'left' }}>
          {t.featuresTitle}
        </h2>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.65, marginBottom: 32, textAlign: isHe ? 'right' : 'left' }}>
          {t.featuresSub}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {t.features.map((f, i) => (
            <div key={i} style={{ padding: 18, background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start', gap: 14, flexDirection: isHe ? 'row-reverse' : 'row' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={20} color={f.color} />
              </div>
              <div style={{ textAlign: isHe ? 'right' : 'left' }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'var(--ink)' }}>{f.title}</p>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div dir={dir} style={{ background: 'var(--cream-dark)', padding: '56px 24px 68px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 36, textAlign: isHe ? 'right' : 'left' }}>
          {t.howTitle}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {t.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexDirection: isHe ? 'row-reverse' : 'row' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                {i + 1}
              </div>
              <div style={{ paddingTop: 5, textAlign: isHe ? 'right' : 'left' }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, color: 'var(--ink)' }}>{s.title}</p>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.55 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ background: '#1A1612', padding: '68px 28px calc(var(--safe-bottom) + 44px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, rgba(196,98,45,0.3) 0%, transparent 55%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'white', fontWeight: 400, marginBottom: 10, lineHeight: 1.25 }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            {t.ctaSub}
          </p>
          <button onClick={goAuth} style={{ padding: '16px 44px', borderRadius: 14, background: 'var(--accent)', color: 'white', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(196,98,45,0.4)', fontFamily: 'var(--font-body)' }}>
            {t.ctaPrimary}
          </button>
          <div style={{ marginTop: 44, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/privacy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>{t.privacy}</a>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>·</span>
            <a href="/terms" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>{t.terms}</a>
          </div>
        </div>
      </div>

    </div>
  )
}
