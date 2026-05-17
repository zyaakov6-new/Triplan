import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLang } from '../hooks/useLang'
import Icon from '../components/Icon'

// ── i18n ──────────────────────────────────────────────────────────────────────
// Hebrew is the canonical version — written first, then translated. Tone is
// direct, slightly informal, no marketing-speak.  Avoiding em-dashes
// throughout (the user explicitly doesn't want them).

const T = {
  he: {
    // Hero
    pill:          'פרויקט קהילתי · חינם · עברית מלאה',
    heroTitle:     'תכננו טרק בלי הכאוס של ווטסאפ',
    heroSub:       'כלי אחד לקבוצה: ימים, עצירות, מפה משותפת, רשימת אריזה. כולם רואים את אותו דבר בזמן אמת.',
    ctaPrimary:    'מתחילים עכשיו',
    ctaFree:       '30 שניות. בלי כרטיס אשראי. בלי הורדות.',
    signIn:        'כניסה',
    langToggle:    'EN',

    // Pain section
    painTitle:     'מכירים את זה?',
    painSub:       'אם תכננתם פעם טיול בקבוצה, אתם יודעים בדיוק על מה אנחנו מדברים.',
    pains: [
      '25 צ׳אטים בקבוצת ווטסאפ עם 4 גרסאות של אותה תוכנית',
      'טבלת אקסל שאף אחד לא פותח חוץ ממי שבנה אותה',
      'גוגל מפות עם 17 פינים שרק על המסך של אחד החברים',
      'מסבירים את התוכנית מההתחלה לכל מי שמצטרף, שוב ושוב',
    ],

    // Solution / features
    solutionEyebrow: 'מה Triplan עושה אחרת',
    solutionTitle:   'הכל במקום אחד. הקבוצה כולה. בזמן אמת.',
    features: [
      { title: 'מפה אחת לכל הקבוצה',     desc: 'נקודות תצפית, מקורות מים, חניוני לילה. כולם רואים אותו דבר.',           icon: 'map',     color: '#C4622D', bg: 'var(--accent-pale)' },
      { title: 'סנכרון חי',                desc: 'מישהו מוסיף עצירה, כולם רואים אותה ברגע. אין יותר "איזו גרסה היא העדכנית".', icon: 'users',   color: '#2D6B6B', bg: 'var(--teal-light)' },
      { title: 'רשימת אריזה משותפת',      desc: 'כל אחד מוסיף מה שהוא מביא. בלי לכפול ציוד. בלי לשכוח אוהל.',            icon: 'package', color: '#5B8FD4', bg: 'rgba(91,143,212,0.12)' },
      { title: 'קישור צפייה להורים',       desc: 'בלי שיצטרכו להירשם או להוריד כלום. רק רואים את התוכנית.',                icon: 'eye',     color: '#8B7355', bg: 'rgba(139,115,85,0.15)' },
      { title: 'עובד גם בלי אינטרנט',     desc: 'אחרי הטעינה הראשונה הכל זמין מהמכשיר. גם בלב שטח.',                       icon: 'lock',    color: '#5B3D8F', bg: 'rgba(91,61,143,0.13)' },
      { title: 'יומן ותמונות לכל יום',     desc: 'מתעדים את הטיול תוך כדי. אוסף יפה בסוף הדרך.',                            icon: 'camera',  color: '#2D9E6E', bg: 'rgba(45,158,110,0.13)' },
    ],

    // Sample preview
    sampleEyebrow: 'אחרי ההרשמה',
    sampleTitle:   'יש לכם כבר טיול לדוגמה לשחק איתו',
    sampleSub:     'יצרנו בחשבון שלכם טרק ים-אל-ים של 3 ימים, 12 עצירות, ורשימת אריזה מלאה. תוסיפו, תמחקו, תערכו. כשמתחילים את הטיול האמיתי שלכם, אפשר לשמור או למחוק את הדוגמה.',
    samplePoints: [
      '3 ימים, 12 עצירות עם קואורדינטות אמיתיות',
      'מקורות מים, חניוני לילה, נקודות תצפית',
      'הערות פיזיות ולוגיסטיות לכל יום',
      'רשימת אריזה של 13 פריטים',
    ],

    // FAQ
    faqTitle: 'שאלות שכולם שואלים',
    faqs: [
      { q: 'זה באמת חינם?',                       a: 'כן, לחלוטין. בלי פרסומות, בלי freemium, בלי גרסה פרימיום. פרויקט קהילתי.' },
      { q: 'צריך להוריד אפליקציה?',                a: 'לא. נפתח בדפדפן כמו אתר רגיל. אם תרצו, אפשר להוסיף למסך הבית בלחיצה אחת.' },
      { q: 'החברים שלי חייבים להירשם?',           a: 'רק אם הם רוצים לערוך את הטיול. קישור צפייה בלבד עובד בלי הרשמה ובלי חשבון.' },
      { q: 'הנתונים שלי מאובטחים?',                a: 'הכל מאוחסן ב-Supabase עם הצפנה. אנחנו לא מוכרים מידע. לא קיים מודל פרסומי.' },
      { q: 'אפשר באמת בלי אינטרנט?',               a: 'אחרי הטעינה הראשונה, הכל זמין מהמכשיר. ערכו והוסיפו, הסנכרון יקרה כשתחזרו לקליטה.' },
    ],

    // Final CTA
    ctaTitle:    'מוכנים?',
    ctaSubFinal: 'הקבוצה הבאה שלכם תודה לכם.',
    ctaBtn:      'מתחילים עכשיו, בחינם',
    ctaFooter:   'דקה להתחיל. דוגמה מובנית כדי לראות איך זה עובד.',
    privacy:  'מדיניות פרטיות',
    terms:    'תנאי שימוש',
  },
  en: {
    pill:          'Community project · Free · Hebrew + English',
    heroTitle:     'Plan group treks without the WhatsApp chaos',
    heroSub:       'One tool for the whole crew: days, stops, a shared map, packing list. Everyone sees the same thing in real time.',
    ctaPrimary:    'Get started',
    ctaFree:       '30 seconds. No credit card. No downloads.',
    signIn:        'Sign in',
    langToggle:    'עב',

    painTitle:     'Know the feeling?',
    painSub:       'If you have ever organised a group trip, you know exactly what we mean.',
    pains: [
      '25 WhatsApp threads with 4 versions of the same plan',
      'A spreadsheet nobody opens except the person who built it',
      'Google Maps with 17 pins, only on one person\'s screen',
      'Re-explaining the plan to every new joiner, over and over',
    ],

    solutionEyebrow: 'What Triplan does differently',
    solutionTitle:   'Everything in one place. The whole group. Live.',
    features: [
      { title: 'One map for the group',     desc: 'Viewpoints, water sources, camps. Everyone sees the same thing.',                       icon: 'map',     color: '#C4622D', bg: 'var(--accent-pale)' },
      { title: 'Live sync',                  desc: 'Someone adds a stop, everyone sees it instantly. No more "which version is current".',  icon: 'users',   color: '#2D6B6B', bg: 'var(--teal-light)' },
      { title: 'Shared packing list',        desc: 'Everyone adds what they bring. No duplicate gear. No forgotten tent.',                   icon: 'package', color: '#5B8FD4', bg: 'rgba(91,143,212,0.12)' },
      { title: 'Read-only link for parents', desc: "Without signup or download. They just see the plan.",                                    icon: 'eye',     color: '#8B7355', bg: 'rgba(139,115,85,0.15)' },
      { title: 'Works offline',              desc: 'After the first load, everything is on your device. Even in the middle of nowhere.',    icon: 'lock',    color: '#5B3D8F', bg: 'rgba(91,61,143,0.13)' },
      { title: 'Journal and photos',         desc: 'Document the trip as it happens. Beautiful album at the end.',                           icon: 'camera',  color: '#2D9E6E', bg: 'rgba(45,158,110,0.13)' },
    ],

    sampleEyebrow: 'After signup',
    sampleTitle:   'You get a sample trek to play with',
    sampleSub:     'We seed your account with a 3-day Yam-le-Yam trek, 12 stops, full packing list. Add, delete, edit. When you start your real trip, keep or delete the sample.',
    samplePoints: [
      '3 days, 12 stops with real coordinates',
      'Water sources, camps, viewpoints',
      'Physical and logistics notes per day',
      '13-item packing list',
    ],

    faqTitle: 'Questions everyone asks',
    faqs: [
      { q: 'Is it really free?',                   a: 'Yes, fully. No ads, no freemium, no premium tier. Community project.' },
      { q: 'Do I need to install an app?',         a: 'No. Opens in the browser like a website. If you want, you can add it to your home screen in one tap.' },
      { q: 'Do my friends have to sign up?',       a: 'Only if they want to edit. The view-only link works without signup or account.' },
      { q: 'Is my data secure?',                   a: 'Everything is stored in Supabase with encryption. We do not sell data. There is no advertising model.' },
      { q: 'Really works offline?',                a: 'After the first load, everything is on your device. Edit and add, sync happens when you are back online.' },
    ],

    ctaTitle:    'Ready?',
    ctaSubFinal: 'Your next group is going to thank you.',
    ctaBtn:      'Get started, free',
    ctaFooter:   'A minute to start. Sample trek included so you can see how it works.',
    privacy:  'Privacy Policy',
    terms:    'Terms',
  },
}

// ── Phone mockup illustration ─────────────────────────────────────────────────
// Shows a real Yam-le-Yam trek (not Italy) since the audience is outdoor /
// trek-focused. The labels match the sample trip we seed for new users so
// what they see here is what they get.

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
          {isHe ? '47 ק"מ' : '47 km'}
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
          {isHe ? 'טרק ים-אל-ים 🥾' : 'Yam-le-Yam Trek 🥾'}
        </text>
        <text x={isHe ? 178 : 20} y="265" textAnchor={isHe ? 'end' : 'start'}
          fill="rgba(26,22,18,0.45)" fontSize="9.5">
          {isHe ? '3 ימים · 12 עצירות' : '3 days · 12 stops'}
        </text>

        <rect x="20" y="275" width="160" height="3" rx="1.5" fill="rgba(26,22,18,0.1)"/>
        <rect x="20" y="275" width="100" height="3" rx="1.5" fill="#2D9E6E"/>

        {[
          { y: 285, col: '#C4622D', label: isHe ? 'יום 1 · נחל כזיב'   : 'Day 1 · Nahal Kziv',  sub: isHe ? '4 עצירות' : '4 stops' },
          { y: 310, col: '#2D9E6E', label: isHe ? 'יום 2 · פארק גורן'  : 'Day 2 · Goren Park',  sub: isHe ? '4 עצירות' : '4 stops' },
          { y: 335, col: '#5B8FD4', label: isHe ? 'יום 3 · הכנרת'     : 'Day 3 · Sea of Galilee', sub: isHe ? '4 עצירות' : '4 stops' },
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

// ── FAQ item with accordion ───────────────────────────────────────────────────

function FAQItem({ q, a, isHe }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          textAlign: isHe ? 'right' : 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{q}</span>
        <Icon name="chevron_down" size={16} color="var(--ink-muted)"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
      </button>
      {open && (
        <p style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.65 }}>
          {a}
        </p>
      )}
    </div>
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

        {/* Trust pill (above the fold) */}
        <div style={{ padding: '24px 24px 0', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2D9E6E', display: 'inline-block' }}/>
            {t.pill}
          </span>
        </div>

        {/* Phone */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 48px 0', position: 'relative', zIndex: 1, minHeight: 0 }}>
          <div className="anim-float" style={{ height: 'min(48svh, 300px)', aspectRatio: '1/2' }}>
            <PhoneMockup isHe={isHe} />
          </div>
        </div>

        {/* Hero text + CTA */}
        <div style={{ padding: '24px 28px calc(var(--safe-bottom) + 36px)', position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 8vw, 36px)', fontWeight: 500, color: 'white', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em' }}>
            {t.heroTitle}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, marginBottom: 26 }}>
            {t.heroSub}
          </p>
          <button
            onClick={goAuth}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e   => e.currentTarget.style.transform = ''}
            style={{ width: '100%', padding: '18px 24px', borderRadius: 16, background: 'var(--accent)', color: 'white', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(196,98,45,0.45)', marginBottom: 10, fontFamily: 'var(--font-body)', transition: 'transform 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {t.ctaPrimary}
            <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={18} color="white" />
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', textAlign: 'center' }}>{t.ctaFree}</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22, gap: 8, alignItems: 'center', opacity: 0.25 }}>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.7)' }}/>
            <span style={{ fontSize: 9, color: 'white', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{isHe ? 'גלילה' : 'scroll'}</span>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.7)' }}/>
          </div>
        </div>
      </div>

      {/* ── Pain section (agitate the problem before pitching the solution) ── */}
      <div dir={dir} style={{ background: 'var(--cream)', padding: '60px 24px 48px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 10, letterSpacing: '-0.01em' }}>
          {t.painTitle}
        </h2>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          {t.painSub}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {t.pains.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(196,98,45,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon name="close" size={12} color="var(--accent)" />
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-light)', lineHeight: 1.5 }}>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Solution / features grid ── */}
      <div dir={dir} style={{ background: 'var(--cream-dark)', padding: '60px 24px 64px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
          {t.solutionEyebrow}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 32, letterSpacing: '-0.01em' }}>
          {t.solutionTitle}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {t.features.map((f, i) => (
            <div key={i} style={{ padding: 16, background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={f.icon} size={18} color={f.color} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>{f.title}</p>
              <p style={{ fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sample preview (risk reduction: "look what you get") ── */}
      <div dir={dir} style={{ background: 'var(--cream)', padding: '60px 24px 64px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 8 }}>
          {t.sampleEyebrow}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.01em' }}>
          {t.sampleTitle}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: 22 }}>
          {t.sampleSub}
        </p>
        <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {t.samplePoints.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={12} color="var(--teal)" />
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ (objection handling) ── */}
      <div dir={dir} style={{ background: 'var(--cream-dark)', padding: '60px 24px 60px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 18, letterSpacing: '-0.01em' }}>
          {t.faqTitle}
        </h2>
        <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: '4px 18px' }}>
          {t.faqs.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} isHe={isHe} />
          ))}
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ background: '#1A1612', padding: '72px 28px calc(var(--safe-bottom) + 44px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 120%, rgba(196,98,45,0.32) 0%, transparent 55%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'white', fontWeight: 500, marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
            {t.ctaSubFinal}
          </p>
          <button onClick={goAuth} style={{ padding: '17px 36px', borderRadius: 14, background: 'var(--accent)', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(196,98,45,0.45)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {t.ctaBtn}
            <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={16} color="white" />
          </button>
          <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.32)' }}>{t.ctaFooter}</p>
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
