import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/Icon'

// ── Slide illustrations ───────────────────────────────────────────────────────

function MapIllustration() {
  return (
    <svg viewBox="0 0 320 240" style={{ width: '100%', height: '100%' }}>
      {/* Grid */}
      {[40,80,120,160,200].map(y => (
        <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      {[64,128,192,256].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      {/* Route shadow */}
      <path d="M 50 185 C 90 140, 130 100, 165 115 C 200 130, 230 170, 270 145"
        stroke="rgba(0,0,0,0.3)" strokeWidth="8" fill="none" strokeLinecap="round"/>
      {/* Route line */}
      <defs>
        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C4622D"/>
          <stop offset="50%" stopColor="#2D9E6E"/>
          <stop offset="100%" stopColor="#5B8FD4"/>
        </linearGradient>
      </defs>
      <path d="M 50 185 C 90 140, 130 100, 165 115 C 200 130, 230 170, 270 145"
        stroke="url(#routeGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="6 3"/>
      {/* Pin 1 */}
      <circle cx="50" cy="185" r="18" fill="#C4622D" opacity="0.2"/>
      <circle cx="50" cy="185" r="13" fill="#C4622D"/>
      <text x="50" y="190" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">1</text>
      {/* Pin 2 */}
      <circle cx="165" cy="115" r="18" fill="#2D9E6E" opacity="0.2"/>
      <circle cx="165" cy="115" r="13" fill="#2D9E6E"/>
      <text x="165" y="120" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">2</text>
      {/* Pin 3 */}
      <circle cx="270" cy="145" r="18" fill="#5B8FD4" opacity="0.2"/>
      <circle cx="270" cy="145" r="13" fill="#5B8FD4"/>
      <text x="270" y="150" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">3</text>
      {/* Distance badge */}
      <rect x="118" y="54" width="84" height="24" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <text x="160" y="70" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" fontFamily="monospace">247 ק"מ</text>
      {/* City labels */}
      <text x="50" y="208" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10">תל אביב</text>
      <text x="165" y="138" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10">ירושלים</text>
      <text x="270" y="168" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10">אילת</text>
    </svg>
  )
}

function CollabIllustration() {
  return (
    <svg viewBox="0 0 320 240" style={{ width: '100%', height: '100%' }}>
      {/* Connection lines */}
      <line x1="160" y1="120" x2="80" y2="60" stroke="rgba(45,158,110,0.3)" strokeWidth="1.5" strokeDasharray="5 4"/>
      <line x1="160" y1="120" x2="240" y2="60" stroke="rgba(91,143,212,0.3)" strokeWidth="1.5" strokeDasharray="5 4"/>
      <line x1="160" y1="120" x2="160" y2="195" stroke="rgba(196,98,45,0.3)" strokeWidth="1.5" strokeDasharray="5 4"/>
      {/* Central hub */}
      <circle cx="160" cy="120" r="36" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <circle cx="160" cy="120" r="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      {/* Globe icon in center */}
      <circle cx="160" cy="120" r="12" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none"/>
      <line x1="148" y1="120" x2="172" y2="120" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
      <ellipse cx="160" cy="120" rx="5" ry="12" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none"/>
      {/* Avatar 1 - top left */}
      <circle cx="80" cy="60" r="26" fill="#2D9E6E" opacity="0.15"/>
      <circle cx="80" cy="60" r="20" fill="#2D9E6E"/>
      <text x="80" y="66" textAnchor="middle" fill="white" fontSize="15" fontWeight="700">א</text>
      <circle cx="98" cy="44" r="7" fill="#1A3333" stroke="#2D9E6E" strokeWidth="1.5"/>
      <text x="98" y="49" textAnchor="middle" fill="#2D9E6E" fontSize="8">✓</text>
      {/* Avatar 2 - top right */}
      <circle cx="240" cy="60" r="26" fill="#5B8FD4" opacity="0.15"/>
      <circle cx="240" cy="60" r="20" fill="#5B8FD4"/>
      <text x="240" y="66" textAnchor="middle" fill="white" fontSize="15" fontWeight="700">ב</text>
      <circle cx="258" cy="44" r="7" fill="#0F1A2E" stroke="#5B8FD4" strokeWidth="1.5"/>
      <text x="258" y="49" textAnchor="middle" fill="#5B8FD4" fontSize="8">✓</text>
      {/* Avatar 3 - bottom */}
      <circle cx="160" cy="195" r="26" fill="#C4622D" opacity="0.15"/>
      <circle cx="160" cy="195" r="20" fill="#C4622D"/>
      <text x="160" y="201" textAnchor="middle" fill="white" fontSize="15" fontWeight="700">ג</text>
      {/* Live badge */}
      <rect x="112" y="14" width="76" height="22" rx="11" fill="rgba(45,158,110,0.25)" stroke="#2D9E6E" strokeWidth="1"/>
      <circle cx="128" cy="25" r="4" fill="#2D9E6E"/>
      <text x="148" y="29" fill="#2D9E6E" fontSize="11" fontWeight="600">בזמן אמת</text>
    </svg>
  )
}

function AllInOneIllustration() {
  return (
    <svg viewBox="0 0 320 240" style={{ width: '100%', height: '100%' }}>
      {/* Card */}
      <rect x="40" y="20" width="240" height="200" rx="16" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      {/* Card header */}
      <rect x="40" y="20" width="240" height="44" rx="16" fill="rgba(255,255,255,0.1)"/>
      <rect x="40" y="48" width="240" height="16" fill="rgba(255,255,255,0.1)"/>
      <text x="160" y="48" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="13" fontWeight="600">טיול לאיטליה 🇮🇹</text>
      <text x="160" y="63" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10">7 ימים · 12 עצירות</text>
      {/* Progress bar */}
      <rect x="60" y="74" width="200" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="60" y="74" width="130" height="4" rx="2" fill="#2D9E6E"/>
      {/* Stop rows */}
      {[
        { y: 94, color: '#C4622D', label: 'קולוסיאום', done: true },
        { y: 122, color: '#2D9E6E', label: 'ורטיקאן', done: true },
        { y: 150, color: '#5B8FD4', label: 'פונטנה די טרווי', done: false },
        { y: 178, color: '#E8A020', label: 'פיאצה נבונה', done: false },
      ].map(({ y, color, label, done }) => (
        <g key={y}>
          <circle cx="68" cy={y + 8} r="10" fill={color} opacity={done ? 1 : 0.5}/>
          <text x="68" y={y + 13} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">{done ? '✓' : '·'}</text>
          <rect x="86" y={y + 2} width={done ? 110 : 130} height="8" rx="4" fill={done ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)'}
            style={done ? { textDecoration: 'line-through' } : {}}/>
          {done && <line x1="86" y1={y + 6} x2="196" y2={y + 6} stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>}
          {!done && <rect x="86" y={y + 14} width="60" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>}
          {/* Cost badge */}
          <rect x="238" y={y} width="32" height="16" rx="8" fill={`${color}33`} stroke={color} strokeWidth="1"/>
          <text x="254" y={y + 11} textAnchor="middle" fill={color} fontSize="9" fontWeight="600">₪180</text>
        </g>
      ))}
    </svg>
  )
}

// ── Slide data ────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    bg: 'linear-gradient(160deg, #1A1612 0%, #2D1A0E 70%, #3A200E 100%)',
    illustration: <MapIllustration />,
    title: 'כל הטיול שלכם, על מפה',
    subtitle: 'עצירות, מסלולים ומרחקים — הכל בצמוד לתכנית',
    accent: '#C4622D',
  },
  {
    bg: 'linear-gradient(160deg, #0D1F1F 0%, #0D2B2B 70%, #102F2F 100%)',
    illustration: <CollabIllustration />,
    title: 'תכנן עם כל הקבוצה',
    subtitle: 'לינק אחד — כל שינוי מתעדכן לכולם בזמן אמת',
    accent: '#2D9E6E',
  },
  {
    bg: 'linear-gradient(160deg, #0F1A2E 0%, #152340 70%, #182B50 100%)',
    illustration: <AllInOneIllustration />,
    title: 'הכל במקום אחד',
    subtitle: 'ציוד, תקציב, עצירות ותמונות — בלי גוגל דוקס ובלי וואטסאפ',
    accent: '#5B8FD4',
  },
]

// ── Auth form ─────────────────────────────────────────────────────────────────

function AuthForm({ onBack }) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    if (mode === 'signup') {
      if (!form.name.trim()) { setError('נא להזין שם'); setLoading(false); return }
      const err = await signUp(form.email, form.password, form.name)
      if (err) setError(err.message)
    } else {
      const err = await signIn(form.email, form.password)
      if (err) setError(err.message?.includes('Invalid') ? 'אימייל או סיסמה שגויים' : (err.message || 'הכניסה נכשלה'))
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    const err = await signInWithGoogle()
    if (err) { setError(err.message || 'כניסה עם גוגל נכשלה'); setGoogleLoading(false) }
  }

  return (
    <div dir="rtl" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--ink)' }}>
      {/* Header */}
      <div style={{ paddingTop: 'calc(var(--safe-top) + 12px)', padding: 'calc(var(--safe-top) + 12px) 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="chevron_right" size={18} color="rgba(255,255,255,0.7)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="globe" size={14} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', letterSpacing: '-0.02em' }}>Triplan</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px calc(var(--safe-bottom) + 24px)' }} className="scroll-y">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'white', fontWeight: 400, marginBottom: 6, lineHeight: 1.2 }}>
          {mode === 'login' ? 'ברוכים הבאים חזרה' : 'מוכנים לצאת לדרך?'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 28 }}>
          {mode === 'login' ? 'כנסו לחשבון שלכם' : 'צרו חשבון בחינם — לוקח 10 שניות'}
        </p>

        {/* Google — primary CTA */}
        <button onClick={handleGoogle} disabled={googleLoading || loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '15px 20px', borderRadius: 14, background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1A1612', marginBottom: 16, transition: 'opacity 0.15s', opacity: googleLoading ? 0.7 : 1, border: 'none' }}>
          {googleLoading ? (
            <span style={{ color: '#555' }}>מעביר לגוגל…</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              המשך עם גוגל
            </>
          )}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>או עם אימייל</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 14, fontWeight: 500,
              background: mode === m ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
              border: 'none', transition: 'all 0.15s', cursor: 'pointer',
            }}>
              {m === 'login' ? 'כניסה' : 'הרשמה'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div className="anim-up">
              <label style={lbl}>שם מלא</label>
              <input className="input" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', textAlign: 'right' }}
                placeholder="למשל: יוסי כהן" value={form.name} onChange={set('name')} autoComplete="name" />
            </div>
          )}
          <div>
            <label style={lbl}>אימייל</label>
            <input className="input" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', direction: 'ltr', textAlign: 'left' }}
              type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" />
          </div>
          <div>
            <label style={lbl}>סיסמה</label>
            <input className="input" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', direction: 'ltr', textAlign: 'left' }}
              type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,80,80,0.15)', borderRadius: 10, border: '1px solid rgba(255,80,80,0.3)' }}>
            <p style={{ fontSize: 13, color: '#FF8080', textAlign: 'right' }}>{error}</p>
          </div>
        )}

        <button className="btn btn-accent" style={{ marginTop: 20, width: '100%', fontSize: 16, padding: '15px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'רגע...' : mode === 'login' ? 'כניסה' : 'יצירת חשבון'}
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [view, setView] = useState(() =>
    localStorage.getItem('triplan_onboarded') ? 'auth' : 'slides'
  )
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef(0)

  const finish = () => {
    localStorage.setItem('triplan_onboarded', '1')
    setView('auth')
  }

  const next = () => {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1)
    else finish()
  }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -50 && slide < SLIDES.length - 1) setSlide(s => s + 1)
    if (dx > 50 && slide > 0) setSlide(s => s - 1)
  }

  if (view === 'auth') return <AuthForm onBack={() => setView('slides')} />

  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  return (
    <div dir="rtl" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: current.bg, transition: 'background 0.5s ease', overflow: 'hidden' }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* Skip */}
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 16px)', left: 20, zIndex: 10 }}>
        <button onClick={finish} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '6px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.08)' }}>
          דלג
        </button>
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 16px)', right: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.12)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="globe" size={14} color="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.02em' }}>Triplan</span>
      </div>

      {/* Illustration */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 0', minHeight: 0 }}>
        <div key={slide} style={{ width: '100%', maxWidth: 360, animation: 'fadeIn 0.4s ease' }}>
          {current.illustration}
        </div>
      </div>

      {/* Bottom card */}
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px 28px 0 0', padding: '28px 28px calc(var(--safe-bottom) + 28px)', flexShrink: 0 }}>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? 24 : 7, height: 7, borderRadius: 4,
              background: i === slide ? current.accent : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', padding: 0,
            }} />
          ))}
        </div>

        <h2 key={`title-${slide}`} style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'white', fontWeight: 400, marginBottom: 10, lineHeight: 1.3, textAlign: 'right', animation: 'slideUp 0.35s ease' }}>
          {current.title}
        </h2>
        <p key={`sub-${slide}`} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 24, textAlign: 'right', animation: 'slideUp 0.4s ease' }}>
          {current.subtitle}
        </p>

        <button onClick={next} style={{
          width: '100%', padding: '16px', borderRadius: 14, fontSize: 16, fontWeight: 600,
          background: current.accent, color: 'white', border: 'none', cursor: 'pointer',
          transition: 'background 0.4s ease, transform 0.15s',
          boxShadow: `0 8px 24px ${current.accent}55`,
        }}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onTouchEnd={e => e.currentTarget.style.transform = ''}>
          {isLast ? 'מתחילים!' : 'הבא'}
        </button>
      </div>
    </div>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6, textAlign: 'right' }
