import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLang } from '../hooks/useLang'
import Icon from '../components/Icon'

/* ─────────────────────────────────────────────────────────────────────────
   Landing page, v3
   Aesthetic: outdoor field guide x software craft. Topographic contour
   lines, trail-blaze markers, mono section dividers, big serif Hebrew at
   editorial scale. Hebrew-first. No phone-mockup hero, no purple gradients,
   no glassmorphism. Every section earns its space.

   Copy notes:
   - Headline kept (most-direct pain hook from the prior version).
   - Everything else rewritten for rhythm and field-guide tone: short
     declarative sentences, mono labels with section numbers, "§" markers.
   - No em-dashes anywhere.
   ───────────────────────────────────────────────────────────────────────── */

const T = {
  he: {
    // Nav
    signIn:        'כניסה',
    langToggle:    'EN',

    // Hero
    eyebrow:       'מדריך לתכנון טרק קבוצתי',
    eyebrowEdition:'גרסה 2026',
    heroTitle:     'תכננו טרק בלי הכאוס של ווטסאפ',
    heroSubA:      'מתכננים יחד.',
    heroSubB:      'רואים יחד.',
    heroSubC:      'גם בלי קליטה.',
    ctaPrimary:    'התחילו עכשיו',
    ctaMicro:      '30 שניות. בלי כרטיס אשראי. בלי הורדה.',
    trustA:        'חינם תמיד',
    trustB:        'עברית מלאה',
    trustC:        'עובד בלב שטח',

    // § 01
    s01Eyebrow:    'סצנה',
    s01Number:     '§ 01',
    s01Title:      'ככה זה נראה היום',
    s01Sub:        'אם הובלתם פעם קבוצה, אתם מכירים את כל אחד מאלה.',
    pains: [
      '25 צ׳אטים בווטסאפ. ארבע גרסאות. אף אחת לא העדכנית.',
      'טבלת אקסל ששני אנשים פתחו, פעם אחת.',
      '17 פינים בגוגל מפות, על המסך של חבר אחד.',
      'להסביר הכל מההתחלה לכל מי שמצטרף. שוב ושוב.',
    ],

    // § 02
    s02Eyebrow:    'שיטה',
    s02Number:     '§ 02',
    s02Title:      'הקבוצה כולה. באותו דף. ברגע אחד.',
    s02Sub:        'כלי אחד עם כל מה שצריך כדי להוציא טרק לפועל.',
    features: [
      { n: '01', title: 'מפה אחת לקבוצה',         body: 'נקודות תצפית, מקורות מים, חניוני לילה. הקבוצה כולה רואה אותה.', icon: 'map',     accent: '#C4622D' },
      { n: '02', title: 'סנכרון בזמן אמת',         body: 'מישהו מוסיף עצירה, כל הקבוצה רואה אותה ברגע. אין "איזו גרסה עדכנית".', icon: 'users',   accent: '#2D6B6B' },
      { n: '03', title: 'רשימת ציוד משותפת',       body: 'כל אחד מסמן מה הוא מביא. בלי שני אוהלים. בלי לשכוח גז.',         icon: 'package', accent: '#5B8FD4' },
      { n: '04', title: 'קישור צפייה לחברים',       body: 'שלחו להורים, לבני זוג, למצטרפים. רואים את התוכנית בלי להוריד שום דבר.', icon: 'eye',     accent: '#8B7355' },
      { n: '05', title: 'עובד בלב שטח',              body: 'אחרי הטעינה הראשונה, הכל מקומי על המכשיר. כולל המפה.',          icon: 'lock',    accent: '#5B3D8F' },
      { n: '06', title: 'יומן ותמונות לכל יום',      body: 'מתעדים תוך כדי. אוסף יפה בסוף הדרך.',                              icon: 'camera',  accent: '#2D9E6E' },
    ],

    // § 03
    s03Eyebrow:    'מסלול לדוגמה',
    s03Number:     '§ 03',
    s03Title:      'יש בחשבון שלכם טרק מוכן',
    s03Sub:        'יצרנו לכם טיול ים אל ים של 3 ימים, 12 עצירות, ורשימת ציוד מוכנה. תכירו את האפליקציה לפני שאתם בונים את הטיול שלכם.',
    s03Trek:       'ים אל ים',
    s03TrekSub:    'הגליל העליון',
    s03Stats:      [
      { k: '3',  v: 'ימים' },
      { k: '12', v: 'עצירות' },
      { k: '47', v: 'ק״מ' },
    ],
    s03Days:       [
      { n: 1, name: 'נחל כזיב',     stops: 4 },
      { n: 2, name: 'פארק גורן',     stops: 4 },
      { n: 3, name: 'חוף גינוסר',   stops: 4 },
    ],

    // § 04
    s04Eyebrow:    'שאלות',
    s04Number:     '§ 04',
    s04Title:      'מה כולם שואלים לפני שמתחילים',
    faqs: [
      { q: 'זה באמת חינם?',             a: 'כן. בלי פרסומות. בלי מודל פרימיום. פרויקט פתוח לקהילת המטיילים.' },
      { q: 'צריך להוריד אפליקציה?',     a: 'לא. נפתח בדפדפן. אפשר להוסיף למסך הבית בלחיצה אחת אם רוצים.' },
      { q: 'החברים שלי חייבים להירשם?', a: 'רק אם הם רוצים לערוך. קישור צפייה עובד בלי הרשמה ובלי חשבון.' },
      { q: 'מה לגבי פרטיות?',            a: 'הנתונים מוצפנים בענן. אנחנו לא מוכרים מידע. אין מודל פרסומי.' },
      { q: 'באמת עובד בלב שטח?',         a: 'כן. אחרי הטעינה הראשונה, ערכו והוסיפו גם בלי קליטה. הסנכרון יקרה כשתחזרו.' },
    ],

    // Final
    finalEyebrow:  'יוצאים לדרך',
    finalTitle:    'הטרק הבא שלכם מתחיל פה',
    finalSub:      'הקבוצה הבאה שלכם תודה לכם.',
    finalCta:      'מתחילים בחינם',
    finalMicro:    'דקה להתחיל. טרק לדוגמה מובנה. בלי כרטיס אשראי.',
    privacy:       'מדיניות פרטיות',
    terms:         'תנאי שימוש',
    madeWith:      'נבנה בישראל, בידי מטייל אחד',
  },
  en: {
    signIn:        'Sign in',
    langToggle:    'עב',

    eyebrow:       'A field guide to group trip planning',
    eyebrowEdition:'2026 edition',
    heroTitle:     'Plan group treks without the WhatsApp chaos',
    heroSubA:      'Plan together.',
    heroSubB:      'See together.',
    heroSubC:      'Even with no signal.',
    ctaPrimary:    'Get started',
    ctaMicro:      '30 seconds. No credit card. No download.',
    trustA:        'Free forever',
    trustB:        'Hebrew + English',
    trustC:        'Works offline',

    s01Eyebrow:    'Scene',
    s01Number:     '§ 01',
    s01Title:      'Here is what it looks like today',
    s01Sub:        'If you have ever led a group, you know every single one of these.',
    pains: [
      '25 WhatsApp threads. Four versions. None of them current.',
      'A spreadsheet two people opened, once.',
      "17 pins on Google Maps, on one person's phone.",
      'Re-explaining the plan to every new joiner. Over and over.',
    ],

    s02Eyebrow:    'Method',
    s02Number:     '§ 02',
    s02Title:      'The whole crew. The same page. Right now.',
    s02Sub:        'One tool with everything you need to actually run a trip.',
    features: [
      { n: '01', title: 'One map for the group',        body: 'Viewpoints, water, camps. The whole crew sees the same one.',          icon: 'map',     accent: '#C4622D' },
      { n: '02', title: 'Live sync',                     body: 'Someone adds a stop, the group sees it. No "which version is current?"', icon: 'users',   accent: '#2D6B6B' },
      { n: '03', title: 'Shared gear list',              body: 'Each person marks what they bring. No duplicate tents. No forgotten stove.', icon: 'package', accent: '#5B8FD4' },
      { n: '04', title: 'View link for everyone else',   body: 'Send a link to parents, partners, late joiners. They see the plan without downloading anything.', icon: 'eye',     accent: '#8B7355' },
      { n: '05', title: 'Works without signal',          body: 'Once loaded, everything is local on your device. Map included.',         icon: 'lock',    accent: '#5B3D8F' },
      { n: '06', title: 'Journal and photos per day',    body: 'Document as it happens. Beautiful album when you are home.',             icon: 'camera',  accent: '#2D9E6E' },
    ],

    s03Eyebrow:    'Sample route',
    s03Number:     '§ 03',
    s03Title:      'A trek is already waiting in your account',
    s03Sub:        'We seeded a 3-day Yam-le-Yam trek with 12 stops and a ready gear list. Get a feel for the app before you build your own.',
    s03Trek:       'Yam-le-Yam',
    s03TrekSub:    'Upper Galilee',
    s03Stats:      [
      { k: '3',  v: 'days' },
      { k: '12', v: 'stops' },
      { k: '47', v: 'km' },
    ],
    s03Days:       [
      { n: 1, name: 'Nahal Kziv',     stops: 4 },
      { n: 2, name: 'Goren Park',     stops: 4 },
      { n: 3, name: 'Ginosar Beach',  stops: 4 },
    ],

    s04Eyebrow:    'Questions',
    s04Number:     '§ 04',
    s04Title:      'What people ask before they start',
    faqs: [
      { q: 'Is it really free?',                   a: 'Yes. No ads. No premium tier. Open community project for trekkers.' },
      { q: 'Do I need to install an app?',         a: 'No. Opens in the browser. Add it to your home screen with one tap if you want.' },
      { q: 'Do my friends need to sign up?',       a: 'Only if they want to edit. View links work without signup or account.' },
      { q: 'What about privacy?',                  a: 'Data is encrypted in the cloud. We do not sell anything. There is no advertising model.' },
      { q: 'Really works offline?',                a: 'Yes. After the first load, edit and add in the field. Sync happens when you are back on signal.' },
    ],

    finalEyebrow:  'On the trail',
    finalTitle:    'Your next trek starts here',
    finalSub:      'Your next crew is going to thank you.',
    finalCta:      'Start free',
    finalMicro:    'A minute to start. Sample trek included. No credit card.',
    privacy:       'Privacy',
    terms:         'Terms',
    madeWith:      'Made in Israel, by one trekker',
  },
}

/* ── Atmospheric SVGs ──────────────────────────────────────────────────── */

// Topographic contour lines, used as the hero backdrop. Three nested rings
// with subtle radial fade so the centre stays readable. Animated by parent.
function ContourBackdrop({ colour = '#F5F0E8', opacity = 0.11 }) {
  return (
    <svg
      viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cb-fade" cx="50%" cy="55%" r="60%">
          <stop offset="0%"  stopColor="white" stopOpacity="0.3" />
          <stop offset="55%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="cb-mask">
          <rect width="1200" height="800" fill="url(#cb-fade)" />
        </mask>
      </defs>
      <g stroke={colour} strokeWidth="1" fill="none" mask="url(#cb-mask)" style={{ opacity }}>
        <path d="M 100,450 C 180,310 460,260 720,360 C 960,440 1080,540 980,640 C 880,720 540,720 320,660 C 150,610 60,540 100,450 Z" />
        <path d="M 160,450 C 230,330 470,290 720,380 C 940,450 1030,540 950,620 C 870,680 560,690 360,640 C 200,600 130,540 160,450 Z" />
        <path d="M 220,450 C 280,360 480,320 720,400 C 920,460 990,540 920,600 C 850,650 580,660 400,620 C 260,590 200,540 220,450 Z" />
        <path d="M 280,450 C 320,380 490,350 720,420 C 900,470 950,540 890,580 C 830,620 600,630 440,600 C 320,580 270,540 280,450 Z" />
        <path d="M 340,450 C 370,400 510,380 720,440 C 880,480 910,540 860,560 C 810,580 620,600 480,580 C 380,570 330,540 340,450 Z" />
      </g>
      <g stroke={colour} strokeWidth="0.5" fill="none" mask="url(#cb-mask)" style={{ opacity: opacity * 0.6 }}>
        <path d="M 60,200 Q 400,140 720,200 T 1140,200" />
        <path d="M 60,720 Q 400,680 720,720 T 1140,720" />
      </g>
    </svg>
  )
}

// Single trail blaze marker. Square wood block with a painted terracotta stripe.
function TrailBlaze({ size = 44, stripe = '#C4622D', bg = '#3D332A' }) {
  const h = Math.round(size * 1.35)
  return (
    <svg width={size} height={h} viewBox="0 0 40 54" aria-hidden="true">
      <rect x="1.5" y="1.5" width="37" height="51" rx="3" fill={bg} stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
      <rect x="5"   y="18"  width="30" height="18" fill={stripe} />
      <rect x="5"   y="18"  width="30" height="3"  fill="rgba(255,255,255,0.15)" />
      <rect x="5"   y="33"  width="30" height="3"  fill="rgba(0,0,0,0.18)" />
    </svg>
  )
}

// Sample-trek map illustration. Hand-drawn topo feel showing the 3-day route.
function SampleTrekMap({ isHe }) {
  const pinR = 9
  return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id="strm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#E8DDC8" />
          <stop offset="100%" stopColor="#DCCEB0" />
        </linearGradient>
        <linearGradient id="strm-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#C4622D" />
          <stop offset="55%"  stopColor="#2D9E6E" />
          <stop offset="100%" stopColor="#5B8FD4" />
        </linearGradient>
      </defs>

      {/* Paper-coloured base */}
      <rect width="400" height="280" fill="url(#strm-bg)" rx="14" />

      {/* Topo contours */}
      <g stroke="rgba(26,22,18,0.13)" fill="none">
        <path d="M 50,180 Q 130,140 220,165 T 360,150" strokeWidth="0.9" />
        <path d="M 50,200 Q 140,170 220,185 T 360,170" strokeWidth="0.9" />
        <path d="M 50,220 Q 145,195 225,205 T 360,190" strokeWidth="0.9" />
        <path d="M 60,100 Q 160,70 250,90 T 350,80" strokeWidth="0.9" />
        <path d="M 60,80  Q 170,55 260,70  T 350,65" strokeWidth="0.9" />
      </g>

      {/* Coastline / lake suggestion on the right (Kineret) */}
      <path d="M 330,90 Q 360,120 370,170 Q 378,210 360,250 L 400,250 L 400,80 L 330,80 Z"
            fill="rgba(91,143,212,0.18)" stroke="rgba(91,143,212,0.4)" strokeWidth="0.6" />

      {/* Trail (route) */}
      <path d="M 60,200 C 110,150 160,140 200,150 C 250,162 270,210 320,205"
            stroke="rgba(0,0,0,0.35)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M 60,200 C 110,150 160,140 200,150 C 250,162 270,210 320,205"
            stroke="url(#strm-route)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 4" />

      {/* Day pins */}
      <g>
        <circle cx="60"  cy="200" r={pinR + 5} fill="rgba(196,98,45,0.18)" />
        <circle cx="60"  cy="200" r={pinR} fill="#C4622D" stroke="#1A1612" strokeWidth="1.2" />
        <text x="60" y="204" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="ui-monospace, monospace">1</text>

        <circle cx="200" cy="150" r={pinR + 5} fill="rgba(45,158,110,0.18)" />
        <circle cx="200" cy="150" r={pinR} fill="#2D9E6E" stroke="#1A1612" strokeWidth="1.2" />
        <text x="200" y="154" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="ui-monospace, monospace">2</text>

        <circle cx="320" cy="205" r={pinR + 5} fill="rgba(91,143,212,0.18)" />
        <circle cx="320" cy="205" r={pinR} fill="#5B8FD4" stroke="#1A1612" strokeWidth="1.2" />
        <text x="320" y="209" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="ui-monospace, monospace">3</text>
      </g>

      {/* Compass rose, lower left */}
      <g transform="translate(38, 245)" opacity="0.65">
        <circle r="13" fill="none" stroke="#1A1612" strokeWidth="0.7" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#1A1612" strokeWidth="0.6" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#1A1612" strokeWidth="0.6" />
        <polygon points="0,-12 -2,-2 0,-5 2,-2" fill="#C4622D" />
        <text x="0" y="-15" textAnchor="middle" fill="#1A1612" fontSize="6" fontFamily="ui-monospace, monospace">N</text>
      </g>

      {/* Grid coordinates, decorative */}
      <text x="370" y="20" textAnchor="end" fill="rgba(26,22,18,0.42)" fontSize="7" fontFamily="ui-monospace, monospace">
        {isHe ? '33.05°N · 35.10°E' : '33.05°N · 35.10°E'}
      </text>
      <text x="370" y="270" textAnchor="end" fill="rgba(26,22,18,0.42)" fontSize="7" fontFamily="ui-monospace, monospace">
        {isHe ? '32.84°N · 35.52°E' : '32.84°N · 35.52°E'}
      </text>
    </svg>
  )
}

/* ── Small atoms ───────────────────────────────────────────────────────── */

function MonoLabel({ children, color = 'rgba(245,240,232,0.55)', dot = true, style }) {
  return (
    <span className="mono-label" style={{ color, display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />}
      {children}
    </span>
  )
}

function SectionNumber({ children, color = 'var(--accent)' }) {
  return (
    <span className="mono-label" style={{ color, fontSize: 12, letterSpacing: '0.2em' }}>
      {children}
    </span>
  )
}

function LangToggleDark({ lang, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={lang === 'he' ? 'Switch to English' : 'החלף לעברית'}
      className="mono-label"
      style={{
        color: 'rgba(245,240,232,0.7)',
        padding: '7px 12px',
        borderRadius: 8,
        background: 'rgba(245,240,232,0.06)',
        border: '1px solid rgba(245,240,232,0.14)',
        cursor: 'pointer',
        fontSize: 11,
      }}
    >
      {lang === 'he' ? 'EN' : 'עב'}
    </button>
  )
}

function FAQItem({ q, a, isHe, isLast }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid rgba(26,22,18,0.10)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14,
          padding: '20px 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: isHe ? 'right' : 'left',
          fontFamily: 'inherit',
          color: 'var(--ink)',
        }}
        aria-expanded={open}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.2 }}>
          {q}
        </span>
        <Icon
          name="chevron_down" size={18} color="var(--ink-muted)"
          style={{ flexShrink: 0, transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>
      {open && (
        <p style={{
          paddingBottom: 20, paddingTop: 0,
          fontSize: 15, lineHeight: 1.65,
          color: 'var(--ink-light)',
          maxWidth: 560,
        }}>
          {a}
        </p>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate()
  const { lang, toggleLang } = useLang()
  const t    = T[lang]
  const isHe = lang === 'he'
  const dir  = isHe ? 'rtl' : 'ltr'

  const goAuth = () => navigate('/auth')

  /* Common section padding (mobile/desktop responsive via clamp). */
  const sectionPad = {
    paddingInline: 'clamp(20px, 5vw, 56px)',
    paddingBlock:  'clamp(72px, 12vh, 120px)',
  }

  return (
    <div dir={dir} style={{ background: '#1A1612', overflowY: 'auto', height: '100%', color: 'var(--cream)' }}>

      {/* ───────────── HERO ───────────── */}
      <section style={{
        minHeight: '100svh',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        paddingInline: 'clamp(20px, 5vw, 56px)',
      }}>

        {/* Atmospheric layers */}
        <div className="contour-drift" style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-hidden="true">
          <ContourBackdrop />
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 80% 90%, rgba(196,98,45,0.22), transparent 55%), radial-gradient(ellipse at 10% 18%, rgba(45,107,107,0.16), transparent 50%)',
        }} />

        {/* Nav */}
        <div style={{
          position: 'relative', zIndex: 2,
          paddingTop: 'calc(var(--safe-top) + 18px)',
          paddingBottom: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30,
              background: 'var(--accent)',
              borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(196,98,45,0.35)',
            }}>
              <Icon name="globe" size={15} color="white" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500,
              color: 'var(--cream)', letterSpacing: '-0.02em',
            }}>Triplan</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangToggleDark lang={lang} onToggle={toggleLang} />
            <button onClick={goAuth} className="mono-label"
              style={{
                fontSize: 11, color: 'rgba(245,240,232,0.72)',
                padding: '7px 14px', borderRadius: 8,
                background: 'transparent', border: '1px solid rgba(245,240,232,0.16)',
                cursor: 'pointer',
              }}
            >
              {t.signIn}
            </button>
          </div>
        </div>

        {/* Hero body */}
        <div style={{
          position: 'relative', zIndex: 2,
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingTop: 'clamp(40px, 6vh, 72px)',
          paddingBottom: 'clamp(60px, 8vh, 96px)',
          maxWidth: 760,
        }}>
          <div className="rise-in" style={{ '--rise-delay': '0ms', marginBottom: 28 }}>
            <MonoLabel color="rgba(245,240,232,0.55)">
              {t.eyebrow}
              <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>
              <span style={{ opacity: 0.75 }}>{t.eyebrowEdition}</span>
            </MonoLabel>
          </div>

          <h1 className="rise-in" style={{
            '--rise-delay': '120ms',
            fontFamily: 'var(--font-display)',
            // Hebrew display serifs need room to breathe. Latin can tighten.
            fontSize: 'clamp(38px, 8.6vw, 70px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: isHe ? '-0.005em' : '-0.02em',
            color: 'var(--cream)',
            marginBottom: 32,
            maxWidth: '15ch',
          }}>
            {t.heroTitle}
          </h1>

          {/* Sub: serif removed in favour of a clean body-weight stack.
              Hebrew has no real italic, so synthesised italic looked off.
              Heebo / DM Sans light-weight reads cleanly at this size and
              gives the headline more space. */}
          <div className="rise-in" style={{
            '--rise-delay': '240ms',
            display: 'flex', flexDirection: 'column', gap: 2,
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(18px, 2.6vw, 22px)',
            fontWeight: 300,
            color: 'rgba(245,240,232,0.78)',
            lineHeight: 1.45,
            marginBottom: 40,
            letterSpacing: isHe ? '-0.002em' : 0,
          }}>
            <span>{t.heroSubA}</span>
            <span>{t.heroSubB}</span>
            <span style={{ color: 'var(--accent-light)', fontWeight: 400 }}>{t.heroSubC}</span>
          </div>

          <div className="rise-in" style={{ '--rise-delay': '360ms', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button onClick={goAuth} className="lp-cta">
              {t.ctaPrimary}
              <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={16} color="white" />
            </button>
            <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.40)', maxWidth: 260, lineHeight: 1.5 }}>
              {t.ctaMicro}
            </span>
          </div>

          {/* Trust strip */}
          <div className="rise-in" style={{
            '--rise-delay': '480ms',
            marginTop: 48,
            display: 'flex', gap: 'clamp(16px, 3vw, 28px)', flexWrap: 'wrap',
          }}>
            {[t.trustA, t.trustB, t.trustC].map((label, i) => (
              <span key={i} className="mono-label" style={{
                color: 'rgba(245,240,232,0.42)',
                fontSize: 10.5,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Trail blaze marker, lower opposite corner */}
        <div aria-hidden="true" className="blaze-pulse" style={{
          position: 'absolute',
          bottom: 'calc(var(--safe-bottom) + 24px)',
          [isHe ? 'left' : 'right']: 'clamp(20px, 5vw, 56px)',
          zIndex: 2,
        }}>
          <TrailBlaze size={42} />
        </div>

      </section>

      {/* ───────────── § 01 PAIN ───────────── */}
      <section className="paper-grain" style={{
        ...sectionPad,
        background: 'var(--cream)',
        color: 'var(--ink)',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 920, marginInline: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 28 }}>
            <SectionNumber color="var(--accent)">{t.s01Number}</SectionNumber>
            <span className="mono-label" style={{ color: 'var(--ink-muted)' }}>{t.s01Eyebrow}</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(30px, 5.5vw, 48px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            marginBottom: 16,
            maxWidth: '18ch',
          }}>
            {t.s01Title}
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.65,
            marginBottom: 48, maxWidth: 520,
          }}>
            {t.s01Sub}
          </p>

          <ol style={{
            display: 'flex', flexDirection: 'column', gap: 0,
            listStyle: 'none', padding: 0, margin: 0,
          }}>
            {t.pains.map((p, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 20,
                padding: '22px 0',
                borderTop: i === 0 ? '1px solid rgba(26,22,18,0.12)' : 'none',
                borderBottom: '1px solid rgba(26,22,18,0.12)',
              }}>
                <span className="mono-label" style={{
                  color: 'var(--accent)', fontSize: 12,
                  paddingTop: 4, minWidth: 32, flexShrink: 0,
                }}>
                  0{i + 1}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(18px, 2.4vw, 22px)',
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: 'var(--ink)',
                  letterSpacing: '-0.005em',
                }}>
                  {p}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── § 02 SOLUTION ───────────── */}
      <section style={{
        ...sectionPad,
        background: '#1A1612',
        color: 'var(--cream)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0,
        }} className="pan-x">
          <ContourBackdrop opacity={0.06} />
        </div>

        <div style={{ maxWidth: 1080, marginInline: 'auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 28 }}>
            <SectionNumber color="var(--accent-light)">{t.s02Number}</SectionNumber>
            <span className="mono-label" style={{ color: 'rgba(245,240,232,0.5)' }}>{t.s02Eyebrow}</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(30px, 5.5vw, 52px)',
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: 'var(--cream)',
            marginBottom: 16,
            maxWidth: '17ch',
          }}>
            {t.s02Title}
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(245,240,232,0.6)', lineHeight: 1.65,
            marginBottom: 56, maxWidth: 540,
          }}>
            {t.s02Sub}
          </p>

          {/* Uniform 6-card grid. Driven by .lp-features-grid in CSS so we
              can use a real media query (clean 3 / 2 / 1 column breakpoints,
              no auto-fit edge cases that left the 6th card alone on a row). */}
          <div className="lp-features-grid">
            {t.features.map((f, i) => (
              <FeatureCard key={i} f={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── § 03 SAMPLE TREK ───────────── */}
      <section className="paper-grain" style={{
        ...sectionPad,
        background: 'var(--cream)',
        color: 'var(--ink)',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 1080, marginInline: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 28 }}>
            <SectionNumber color="var(--accent)">{t.s03Number}</SectionNumber>
            <span className="mono-label" style={{ color: 'var(--ink-muted)' }}>{t.s03Eyebrow}</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 'clamp(32px, 5vw, 56px)',
            alignItems: 'center',
          }}>

            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(30px, 5vw, 44px)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
                marginBottom: 16,
                maxWidth: '20ch',
              }}>
                {t.s03Title}
              </h2>
              <p style={{
                fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.65,
                marginBottom: 32, maxWidth: 560,
              }}>
                {t.s03Sub}
              </p>

              {/* Trek card */}
              <div style={{
                background: '#1A1612', color: 'var(--cream)',
                borderRadius: 16,
                padding: 'clamp(20px, 4vw, 32px)',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Map illustration */}
                <div style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
                  <SampleTrekMap isHe={isHe} />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <p className="mono-label" style={{ color: 'rgba(245,240,232,0.5)', marginBottom: 4 }}>
                      {t.s03TrekSub}
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                      {t.s03Trek}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 18 }}>
                    {t.s03Stats.map((s, i) => (
                      <div key={i} style={{ textAlign: isHe ? 'right' : 'left' }}>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 22, fontWeight: 500, color: 'var(--accent-light)',
                          lineHeight: 1,
                        }}>
                          {s.k}
                        </div>
                        <div className="mono-label" style={{ color: 'rgba(245,240,232,0.45)', fontSize: 10, marginTop: 4 }}>
                          {s.v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  borderTop: '1px solid rgba(245,240,232,0.12)',
                  paddingTop: 18,
                }}>
                  {t.s03Days.map((d, i) => {
                    const colours = ['#C4622D', '#2D9E6E', '#5B8FD4']
                    return (
                      <div key={i} style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colours[i] }} />
                          <span className="mono-label" style={{ color: 'rgba(245,240,232,0.55)', fontSize: 10 }}>
                            {isHe ? 'יום' : 'Day'} {d.n}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 13, color: 'var(--cream)', fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {d.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 2 }}>
                          {d.stops} {isHe ? 'עצירות' : 'stops'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button onClick={goAuth} className="lp-cta">
                {t.ctaPrimary}
                <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={16} color="white" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────── § 04 FAQ ───────────── */}
      <section className="paper-grain" style={{
        ...sectionPad,
        background: 'var(--cream-dark)',
        color: 'var(--ink)',
      }}>
        <div style={{ maxWidth: 760, marginInline: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
            <SectionNumber color="var(--accent)">{t.s04Number}</SectionNumber>
            <span className="mono-label" style={{ color: 'var(--ink-muted)' }}>{t.s04Eyebrow}</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4.5vw, 40px)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            marginBottom: 36,
            maxWidth: '20ch',
          }}>
            {t.s04Title}
          </h2>

          <div>
            {t.faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} isHe={isHe} isLast={i === t.faqs.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section style={{
        ...sectionPad,
        paddingBlock: 'clamp(96px, 16vh, 160px)',
        background: '#1A1612',
        color: 'var(--cream)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 130%, rgba(196,98,45,0.30), transparent 55%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} className="pan-x">
          <ContourBackdrop opacity={0.07} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, marginInline: 'auto' }}>
          <div style={{ marginBottom: 20 }}>
            <MonoLabel color="var(--accent-light)" dot={false}>
              <span style={{ width: 18, height: 1, background: 'currentColor', opacity: 0.7, display: 'inline-block' }} />
              {t.finalEyebrow}
              <span style={{ width: 18, height: 1, background: 'currentColor', opacity: 0.7, display: 'inline-block' }} />
            </MonoLabel>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 7vw, 64px)',
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: 'var(--cream)',
            marginBottom: 18,
          }}>
            {t.finalTitle}
          </h2>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(18px, 2.6vw, 22px)',
            fontStyle: 'italic',
            color: 'rgba(245,240,232,0.65)',
            marginBottom: 40,
          }}>
            {t.finalSub}
          </p>

          <button onClick={goAuth} className="lp-cta" style={{ padding: '18px 36px', fontSize: 16 }}>
            {t.finalCta}
            <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={16} color="white" />
          </button>
          <p style={{ marginTop: 18, fontSize: 12, color: 'rgba(245,240,232,0.40)' }}>
            {t.finalMicro}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'clamp(72px, 12vh, 120px)',
          position: 'relative', zIndex: 1,
          maxWidth: 720, marginInline: 'auto',
        }}>
          <div className="lp-rule" style={{ color: 'rgba(245,240,232,0.30)', marginBottom: 24 }}>
            <Icon name="globe" size={14} color="rgba(245,240,232,0.40)" />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
          }}>
            <span className="mono-label" style={{ color: 'rgba(245,240,232,0.35)', fontSize: 10 }}>
              {t.madeWith}
            </span>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <a href="/privacy" className="mono-label" style={{ color: 'rgba(245,240,232,0.35)', fontSize: 10, textDecoration: 'none' }}>{t.privacy}</a>
              <a href="/terms"   className="mono-label" style={{ color: 'rgba(245,240,232,0.35)', fontSize: 10, textDecoration: 'none' }}>{t.terms}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Feature card ──────────────────────────────────────────────────────── */

function FeatureCard({ f }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: 'clamp(20px, 2.6vw, 26px)',
        background: 'rgba(245,240,232,0.03)',
        border: '1px solid rgba(245,240,232,0.10)',
        borderRadius: 14,
        transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
        height: '100%',
        display: 'flex', flexDirection: 'column',
        ...(hover ? {
          background: 'rgba(245,240,232,0.05)',
          borderColor: 'rgba(245,240,232,0.18)',
          transform: 'translateY(-2px)',
        } : null),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <span className="mono-label" style={{ color: 'rgba(245,240,232,0.45)', fontSize: 11 }}>
          {f.n}
        </span>
        <div style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: `${f.accent}1F`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={f.icon} size={17} color={f.accent} />
        </div>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(19px, 2.1vw, 22px)',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        color: 'var(--cream)',
        marginBottom: 8,
        lineHeight: 1.22,
      }}>
        {f.title}
      </h3>
      <p style={{
        fontSize: 13.5,
        lineHeight: 1.6,
        color: 'rgba(245,240,232,0.58)',
      }}>
        {f.body}
      </p>
    </div>
  )
}
