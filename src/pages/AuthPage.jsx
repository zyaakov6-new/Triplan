import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/Icon'

// ── i18n ──────────────────────────────────────────────────────────────────────

const T = {
  he: {
    dir: 'rtl',
    // Landing
    heroTitle:      'הטיול הבא שלכם, מסודר סוף סוף',
    heroSub:        'מפות, תוכנית יומית, ציוד וסינכרון בזמן אמת. לינק אחד לכל הקבוצה.',
    ctaPrimary:     'מתחילים בחינם',
    ctaFree:        'בחינם לגמרי. לא צריך כרטיס אשראי.',
    signIn:         'כניסה',
    featuresTitle:  'בנוי בשביל קבוצות אמיתיות',
    featuresSub:    'כי אף אחד לא רוצה לנהל 12 שיחות וואטסאפ וגוגל שיטס.',
    features: [
      { title: 'הטיול שלכם על המפה',   desc: 'כל עצירה, מסלול ומרחק בהצצה אחת. בלי "אנחנו איפה עכשיו?"', icon: 'map',   color: '#C4622D', bg: 'var(--accent-pale)' },
      { title: 'כולם מסונכרנים',         desc: 'שלחו לינק אחד. כל שינוי מגיע לכולם ברגע שהוא קורה.',        icon: 'users', color: '#2D6B6B', bg: 'var(--teal-light)' },
      { title: 'הכל במקום אחד',          desc: 'לוח זמנים, ציוד, תמונות ותקציב. ביחד תמיד. בלי פיצולים.',  icon: 'list',  color: '#5B8FD4', bg: 'rgba(91,143,212,0.12)' },
    ],
    howTitle: 'מוכנים תוך כמה דקות',
    steps: [
      { title: 'יוצרים טיול',    desc: 'שם, תאריכים ויעד. עשר שניות ומסיימים.' },
      { title: 'בונים את התוכנית', desc: 'מוסיפים ימים ועצירות. המפה מתמלאת מעצמה.' },
      { title: 'שולחים לקבוצה',   desc: 'לינק אחד לכולם. לא צריך להוריד כלום לצפייה.' },
    ],
    ctaTitle: 'מוכנים לטיול הבא?',
    ctaSub:   'בחינם. לוקח פחות מדקה להתחיל.',
    privacy:  'מדיניות פרטיות',
    terms:    'תנאי שימוש',
    // Auth form
    welcomeBack:    'ברוכים הבאים חזרה',
    readyToGo:      'מוכנים לצאת לדרך?',
    signInSub:      'כנסו לחשבון שלכם',
    signUpSub:      'צרו חשבון בחינם',
    googleBtn:      'המשך עם גוגל',
    googleLoading:  'מעביר לגוגל…',
    orEmail:        'או עם אימייל',
    tabLogin:       'כניסה',
    tabSignup:      'הרשמה',
    labelName:      'שם מלא',
    placeholderName:'למשל: יוסי כהן',
    labelEmail:     'אימייל',
    labelPassword:  'סיסמה',
    nameRequired:   'נא להזין שם',
    badCredentials: 'אימייל או סיסמה שגויים',
    loginFailed:    'הכניסה נכשלה',
    googleFailed:   'כניסה עם גוגל נכשלה',
    networkError:   'לא ניתן להתחבר לשרת. בדוק את האינטרנט ונסה שוב.',
    forgotPassword: 'שכחת סיסמה?',
    resetTitle:     'איפוס סיסמה',
    resetSub:       'נשלח אליך קישור לאיפוס הסיסמה',
    resetBtn:       'שלח קישור',
    resetSent:      'נשלח! בדוק את תיבת הדואר שלך',
    backToLogin:    'חזרה לכניסה',
    wait:           'רגע...',
    submitLogin:    'כניסה',
    submitSignup:   'יצירת חשבון',
  },
  en: {
    dir: 'ltr',
    // Landing
    heroTitle:      'Your group trip, sorted',
    heroSub:        'Maps, itineraries, packing lists and real-time sync. One link for your whole crew.',
    ctaPrimary:     'Start planning free',
    ctaFree:        'Free forever. No credit card needed.',
    signIn:         'Sign in',
    featuresTitle:  'Built for how groups actually travel',
    featuresSub:    "Because nobody wants to manage 12 WhatsApp threads and a Google Sheet.",
    features: [
      { title: 'Your whole trip on a map',   desc: "Every stop, route and distance at a glance. No more \"where are we even going?\" texts.",   icon: 'map',   color: '#C4622D', bg: 'var(--accent-pale)' },
      { title: 'Everyone stays in sync',      desc: 'Share one link. Every update reaches the whole group the moment it happens.',                 icon: 'users', color: '#2D6B6B', bg: 'var(--teal-light)' },
      { title: 'Everything in one place',     desc: 'Itinerary, packing list, photos and budget. All together, always. No scattered tabs.',        icon: 'list',  color: '#5B8FD4', bg: 'rgba(91,143,212,0.12)' },
    ],
    howTitle: 'Up and running in minutes',
    steps: [
      { title: 'Create your trip',       desc: 'Name it, set your dates and pick a destination. Ten seconds.' },
      { title: 'Build your itinerary',   desc: 'Add days and stops. The map fills itself in.' },
      { title: 'Share with your crew',   desc: 'One link for everyone. No app install needed to view.' },
    ],
    ctaTitle: 'Ready for your next trip?',
    ctaSub:   'Free to start. Takes less than a minute.',
    privacy:  'Privacy Policy',
    terms:    'Terms',
    // Auth form
    welcomeBack:    'Welcome back',
    readyToGo:      'Ready to hit the road?',
    signInSub:      'Sign in to your account',
    signUpSub:      'Create a free account',
    googleBtn:      'Continue with Google',
    googleLoading:  'Redirecting to Google…',
    orEmail:        'or with email',
    tabLogin:       'Sign in',
    tabSignup:      'Sign up',
    labelName:      'Full name',
    placeholderName:'e.g. John Smith',
    labelEmail:     'Email',
    labelPassword:  'Password',
    nameRequired:   'Please enter your name',
    badCredentials: 'Invalid email or password',
    loginFailed:    'Sign in failed',
    googleFailed:   'Google sign in failed',
    networkError:   "Can't reach the server. Check your internet and try again.",
    forgotPassword: 'Forgot password?',
    resetTitle:     'Reset password',
    resetSub:       "We'll send you a link to reset your password",
    resetBtn:       'Send reset link',
    resetSent:      'Sent! Check your inbox',
    backToLogin:    'Back to sign in',
    wait:           'Please wait...',
    submitLogin:    'Sign in',
    submitSignup:   'Create account',
  },
}

// Detect language from browser locale only — no external service, GDPR-safe
function detectLang(setLang) {
  const KEY = 'triplan_lang'
  const TS  = 'triplan_lang_ts'
  const DAY = 86_400_000
  const cached = localStorage.getItem(KEY)
  const ts     = parseInt(localStorage.getItem(TS) || '0', 10)
  if (cached && Date.now() - ts < DAY) { setLang(cached); return }
  const lang = navigator.language?.startsWith('he') ? 'he' : 'en'
  localStorage.setItem(KEY, lang)
  localStorage.setItem(TS, String(Date.now()))
  setLang(lang)
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

      {/* Phone chassis */}
      <rect x="1" y="1" width="198" height="398" rx="38" fill="#0D0D0D"/>
      <rect x="4" y="4" width="192" height="392" rx="35" fill="#1A1612"/>

      {/* Camera pill */}
      <rect x="72" y="10" width="56" height="12" rx="6" fill="#0A0A0A"/>
      <circle cx="100" cy="16" r="3.5" fill="#111"/>

      {/* Clipped screen */}
      <g clipPath="url(#pmScreen)">

        {/* Map background */}
        <rect x="8" y="34" width="184" height="198" fill="url(#pmMapBg)"/>

        {/* Map grid — very subtle */}
        {[70,100,130,160,190,220].map(y => (
          <line key={`h${y}`} x1="8" y1={y} x2="192" y2={y} stroke="rgba(255,255,255,0.033)" strokeWidth="1"/>
        ))}
        {[40,75,110,145,180].map(x => (
          <line key={`v${x}`} x1={x} y1="34" x2={x} y2="232" stroke="rgba(255,255,255,0.033)" strokeWidth="1"/>
        ))}

        {/* Route shadow */}
        <path d="M 38 206 C 68 163, 110 122, 150 146 C 168 157, 174 180, 162 188"
          stroke="rgba(0,0,0,0.4)" strokeWidth="7" fill="none" strokeLinecap="round"/>
        {/* Route line */}
        <path d="M 38 206 C 68 163, 110 122, 150 146 C 168 157, 174 180, 162 188"
          stroke="url(#pmRoute)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="7 3"/>

        {/* Stop 1 */}
        <circle cx="38"  cy="206" r="12" fill="rgba(196,98,45,0.2)"/>
        <circle cx="38"  cy="206" r="9"  fill="#C4622D"/>
        <text x="38"  y="210" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">1</text>
        {/* Stop 2 */}
        <circle cx="116" cy="123" r="12" fill="rgba(45,158,110,0.2)"/>
        <circle cx="116" cy="123" r="9"  fill="#2D9E6E"/>
        <text x="116" y="127" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">2</text>
        {/* Stop 3 */}
        <circle cx="162" cy="188" r="12" fill="rgba(91,143,212,0.2)"/>
        <circle cx="162" cy="188" r="9"  fill="#5B8FD4"/>
        <text x="162" y="192" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">3</text>

        {/* Distance chip */}
        <rect x="70" y="88" width="60" height="17" rx="8.5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.14)" strokeWidth="0.75"/>
        <text x="100" y="100" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="monospace">
          {isHe ? '247 ק"מ' : '154 mi'}
        </text>

        {/* App header bar */}
        <rect x="8" y="34" width="184" height="40" fill="rgba(8,14,22,0.92)"/>
        <text x={isHe ? 176 : 22} y="59"
          textAnchor={isHe ? 'end' : 'start'}
          fill="rgba(255,255,255,0.9)" fontSize="12" fontWeight="600" fontFamily="Georgia,serif">
          Triplan
        </text>
        <circle cx={isHe ? 22 : 178} cy="54" r="11" fill="rgba(196,98,45,0.2)"/>
        <circle cx={isHe ? 22 : 178} cy="54" r="8"  fill="#C4622D"/>
        <text x={isHe ? 22 : 178} y="58" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">+</text>

        {/* White panel */}
        <rect x="8" y="232" width="184" height="151" fill="#F2EDE5"/>

        {/* Trip title */}
        <text x={isHe ? 178 : 20} y="252"
          textAnchor={isHe ? 'end' : 'start'}
          fill="#1A1612" fontSize="13" fontWeight="600" fontFamily="Georgia,serif">
          {isHe ? 'טיול לאיטליה 🇮🇹' : 'Italy Trip 🇮🇹'}
        </text>
        <text x={isHe ? 178 : 20} y="265"
          textAnchor={isHe ? 'end' : 'start'}
          fill="rgba(26,22,18,0.45)" fontSize="9.5">
          {isHe ? '7 ימים · 12 עצירות' : '7 days · 12 stops'}
        </text>

        {/* Progress bar */}
        <rect x="20" y="275" width="160" height="3" rx="1.5" fill="rgba(26,22,18,0.1)"/>
        <rect x="20" y="275" width="100" height="3" rx="1.5" fill="#2D9E6E"/>

        {/* Day rows */}
        {[
          { y: 285, col: '#C4622D', label: isHe ? 'יום 1 — רומא'    : 'Day 1 — Rome',     sub: isHe ? '3 עצירות' : '3 stops' },
          { y: 310, col: '#2D9E6E', label: isHe ? 'יום 2 — פירנצה'  : 'Day 2 — Florence', sub: isHe ? '4 עצירות' : '4 stops' },
          { y: 335, col: '#5B8FD4', label: isHe ? 'יום 3 — ונציה'   : 'Day 3 — Venice',   sub: isHe ? '5 עצירות' : '5 stops' },
        ].map(({ y, col, label, sub }) => (
          <g key={y}>
            <rect x="16" y={y} width="168" height="21" rx="7" fill="white" stroke="rgba(26,22,18,0.07)" strokeWidth="0.75"/>
            <rect x={isHe ? 176 : 19} y={y + 6} width="3" height="9" rx="1.5" fill={col}/>
            <text x={isHe ? 170 : 26} y={y + 14}
              textAnchor={isHe ? 'end' : 'start'}
              fill="#1A1612" fontSize="9" fontWeight="500">{label}</text>
            <text x={isHe ? 26 : 176} y={y + 14}
              textAnchor={isHe ? 'start' : 'end'}
              fill="rgba(26,22,18,0.4)" fontSize="8.5">{sub}</text>
          </g>
        ))}

        {/* Home indicator */}
        <rect x="72" y="367" width="56" height="3" rx="1.5" fill="rgba(26,22,18,0.18)"/>
      </g>

      {/* Frame gloss */}
      <rect x="1" y="1" width="198" height="398" rx="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
    </svg>
  )
}

// ── Landing page ──────────────────────────────────────────────────────────────

function LandingPage({ t, isHe, onGetStarted }) {
  const dir = isHe ? 'rtl' : 'ltr'

  return (
    <div dir={dir} style={{ background: '#1A1612', overflowY: 'auto', height: '100%' }}>

      {/* ── Hero ── */}
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80%', height: '65%',
            background: 'radial-gradient(ellipse at 85% 100%, rgba(196,98,45,0.28) 0%, transparent 60%)' }}/>
          <div style={{ position: 'absolute', top: '8%', left: 0, width: '55%', height: '50%',
            background: 'radial-gradient(ellipse at 10% 25%, rgba(45,107,107,0.18) 0%, transparent 60%)' }}/>
          {/* Star dots */}
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
          <button onClick={onGetStarted} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {t.signIn}
          </button>
        </div>

        {/* Phone mockup */}
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
            onClick={onGetStarted}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e   => e.currentTarget.style.transform = ''}
            style={{ width: '100%', padding: '17px 24px', borderRadius: 16, background: 'var(--accent)', color: 'white', fontSize: 17, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(196,98,45,0.45)', marginBottom: 10, fontFamily: 'var(--font-body)', transition: 'transform 0.15s' }}>
            {t.ctaPrimary}
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{t.ctaFree}</p>

          {/* Scroll hint */}
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
      <div style={{ background: '#1A1612', padding: '68px 28px calc(var(--safe-bottom) + 40px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, rgba(196,98,45,0.3) 0%, transparent 55%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'white', fontWeight: 400, marginBottom: 10, lineHeight: 1.25 }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            {t.ctaSub}
          </p>
          <button
            onClick={onGetStarted}
            style={{ padding: '16px 44px', borderRadius: 14, background: 'var(--accent)', color: 'white', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(196,98,45,0.4)', fontFamily: 'var(--font-body)' }}>
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

// ── Auth form ─────────────────────────────────────────────────────────────────

function AuthForm({ t, isHe, onBack, isSheet = false }) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const [mode, setMode]             = useState('login') // 'login' | 'signup' | 'forgot'
  const [form, setForm]             = useState({ name: '', email: '', password: '' })
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGLoader] = useState(false)
  const [resetSent, setResetSent]   = useState(false)

  const dir  = isHe ? 'rtl' : 'ltr'
  const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    if (mode === 'signup') {
      if (!form.name.trim()) { setError(t.nameRequired); setLoading(false); return }
      const err = await signUp(form.email, form.password, form.name)
      if (err) setError(err.message)
    } else {
      const err = await signIn(form.email, form.password)
      if (err) {
        const msg = err.message || ''
        if (/fetch|network|failed to fetch/i.test(msg))                                setError(t.networkError)
        else if (/invalid login|invalid email|invalid password|credentials/i.test(msg)) setError(t.badCredentials)
        else                                                                             setError(msg || t.loginFailed)
      }
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGLoader(true); setError('')
    const err = await signInWithGoogle()
    if (err) { setError(err.message || t.googleFailed); setGLoader(false) }
  }

  const handleForgot = async () => {
    if (!form.email.trim()) { setError(t.labelEmail + ' required'); return }
    setLoading(true); setError('')
    const err = await resetPassword(form.email.trim())
    setLoading(false)
    if (err) setError(err.message || t.loginFailed)
    else setResetSent(true)
  }

  const formBody = (
    <div dir={dir} style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Google */}
      <button onClick={handleGoogle} disabled={googleLoading || loading}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '15px 20px', borderRadius: 14, background: 'var(--white)', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1A1612', marginBottom: 16, transition: 'opacity 0.15s', opacity: googleLoading ? 0.7 : 1, border: '1.5px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', fontFamily: 'var(--font-body)' }}>
        {googleLoading ? (
          <span style={{ color: 'var(--ink-muted)' }}>{t.googleLoading}</span>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t.googleBtn}
          </>
        )}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{t.orEmail}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Forgot password view */}
      {mode === 'forgot' && (
        <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 6 }}>{t.resetTitle}</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{t.resetSub}</p>
          </div>
          {resetSent ? (
            <div style={{ padding: '14px 16px', background: 'rgba(45,107,107,0.12)', borderRadius: 12, border: '1px solid rgba(45,107,107,0.3)', textAlign: isHe ? 'right' : 'left' }}>
              <p style={{ fontSize: 14, color: 'var(--teal)', fontWeight: 500 }}>{t.resetSent}</p>
            </div>
          ) : (
            <>
              <div>
                <label style={lbl}>{t.labelEmail}</label>
                <input className="input" style={{ direction: 'ltr', textAlign: 'left' }}
                  type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" />
              </div>
              {error && <div style={{ padding: '10px 14px', background: 'rgba(255,80,80,0.15)', borderRadius: 10, border: '1px solid rgba(255,80,80,0.3)' }}><p style={{ fontSize: 13, color: '#FF8080' }}>{error}</p></div>}
              <button className="btn btn-accent" style={{ width: '100%', fontSize: 16, padding: '15px' }} onClick={handleForgot} disabled={loading}>
                {loading ? t.wait : t.resetBtn}
              </button>
            </>
          )}
          <button onClick={() => { setMode('login'); setError(''); setResetSent(false) }}
            style={{ fontSize: 13, color: 'var(--ink-muted)', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', textAlign: isHe ? 'right' : 'left' }}>
            {isHe ? '→' : '←'} {t.backToLogin}
          </button>
        </div>
      )}

      {/* Login / Signup */}
      {mode !== 'forgot' && (
        <>
          <div style={{ display: 'flex', background: 'var(--cream-dark)', borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 14, fontWeight: 500,
                background: mode === m ? 'var(--white)'    : 'transparent',
                color:      mode === m ? 'var(--ink)'      : 'var(--ink-muted)',
                border:     mode === m ? '1px solid var(--border)' : 'none',
                boxShadow:  mode === m ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                {m === 'login' ? t.tabLogin : t.tabSignup}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div className="anim-up">
                <label style={lbl}>{t.labelName}</label>
                <input className="input" style={{ textAlign: isHe ? 'right' : 'left' }}
                  placeholder={t.placeholderName} value={form.name} onChange={set('name')} autoComplete="name" />
              </div>
            )}
            <div>
              <label style={lbl}>{t.labelEmail}</label>
              <input className="input" style={{ direction: 'ltr', textAlign: 'left' }}
                type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>{t.labelPassword}</label>
                {mode === 'login' && (
                  <button onClick={() => { setMode('forgot'); setError('') }}
                    style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <input className="input" style={{ direction: 'ltr', textAlign: 'left' }}
                type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,80,80,0.15)', borderRadius: 10, border: '1px solid rgba(255,80,80,0.3)' }}>
              <p style={{ fontSize: 13, color: '#FF8080', textAlign: isHe ? 'right' : 'left' }}>{error}</p>
            </div>
          )}

          <button className="btn btn-accent" style={{ marginTop: 20, width: '100%', fontSize: 16, padding: '15px' }} onClick={handleSubmit} disabled={loading}>
            {loading ? t.wait : mode === 'login' ? t.submitLogin : t.submitSignup}
          </button>
        </>
      )}
    </div>
  )

  // ── Sheet mode (compact, no dark hero) ──
  if (isSheet) {
    return (
      <div dir={dir} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ padding: '12px 24px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isHe ? 'flex-end' : 'flex-start', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="globe" size={13} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.02em' }}>Triplan</span>
          </div>
        </div>
        <div className="scroll-y" style={{ flex: 1, padding: '0 24px calc(var(--safe-bottom) + 24px)' }}>
          {formBody}
        </div>
      </div>
    )
  }

  // ── Full-screen mode (with dark hero) ──
  return (
    <div dir={dir} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Dark hero */}
      <div style={{ background: '#1A1612', flexShrink: 0, padding: 'calc(var(--safe-top) + 16px) 24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 85% 85%, rgba(196,98,45,0.35) 0%, transparent 55%), radial-gradient(ellipse at 15% 15%, rgba(45,107,107,0.2) 0%, transparent 55%)' }} />
        <div style={{ position: 'relative' }}>
          {onBack && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name={isHe ? 'chevron_right' : 'chevron_left'} size={16} color="rgba(255,255,255,0.6)" />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="globe" size={14} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', letterSpacing: '-0.02em' }}>Triplan</span>
              </div>
            </div>
          )}
          {!onBack && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 24 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="globe" size={14} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', letterSpacing: '-0.02em' }}>Triplan</span>
            </div>
          )}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'white', fontWeight: 400, marginBottom: 6, lineHeight: 1.2 }}>
            {t.welcomeBack}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>{t.signInSub}</p>
        </div>
      </div>

      {/* Form */}
      <div className="scroll-y" style={{ flex: 1, background: 'var(--cream)', padding: '24px 24px calc(var(--safe-bottom) + 24px)' }}>
        {formBody}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [lang, setLang] = useState(() => {
    const cached = localStorage.getItem('triplan_lang')
    return cached || (navigator.language?.startsWith('he') ? 'he' : 'en')
  })
  const [showAuthSheet, setShowAuthSheet] = useState(false)

  useEffect(() => { detectLang(setLang) }, [])

  const t          = T[lang]
  const isHe       = lang === 'he'
  const isReturning = !!localStorage.getItem('triplan_onboarded')

  const handleGetStarted = () => {
    localStorage.setItem('triplan_onboarded', '1')
    setShowAuthSheet(true)
  }

  // Returning user: go straight to auth form
  if (isReturning) {
    return <AuthForm t={t} isHe={isHe} />
  }

  // New user: show landing page + auth bottom sheet
  return (
    <div dir={isHe ? 'rtl' : 'ltr'} style={{ height: '100%', position: 'relative' }}>
      <LandingPage t={t} isHe={isHe} onGetStarted={handleGetStarted} />

      {showAuthSheet && (
        <>
          <div
            onClick={() => setShowAuthSheet(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
          <div
            className="anim-up"
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--cream)', borderRadius: '22px 22px 0 0', maxHeight: '92svh', zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '12px auto 4px', flexShrink: 0 }} />
            <AuthForm t={t} isHe={isHe} onBack={() => setShowAuthSheet(false)} isSheet />
          </div>
        </>
      )}
    </div>
  )
}

const lbl = {
  display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-muted)',
  letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6,
}
