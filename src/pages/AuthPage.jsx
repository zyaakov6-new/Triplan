import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/Icon'

export default function AuthPage() {
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
    <div dir="rtl" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top hero */}
      <div style={{
        flex: '0 0 42%', background: 'var(--ink)', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 28px 32px',
        paddingTop: 'calc(var(--safe-top) + 16px)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 85% 85%, rgba(196,98,45,0.35) 0%, transparent 55%), radial-gradient(ellipse at 15% 15%, rgba(45,107,107,0.25) 0%, transparent 55%)' }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 20px)', right: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="globe" size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'white', letterSpacing: '-0.02em' }}>Triplan</span>
        </div>

        <div style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'white', lineHeight: 1.2, letterSpacing: '-0.01em', fontWeight: 400, marginBottom: 10, textAlign: 'right' }}>
            כל טיול,<br /><em style={{ color: 'var(--accent-light)' }}>מאורגן בצורה מושלמת.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, textAlign: 'right' }}>
            מסלולים על מפה, תכנון ימים, שיתוף עם חברי הטיול.
          </p>
        </div>
      </div>

      {/* Form area */}
      <div style={{ flex: 1, background: 'var(--cream)', padding: '28px 24px', display: 'flex', flexDirection: 'column', overflow: 'auto' }} className="scroll-y">
        {/* Mode tabs */}
        <div style={{ display: 'flex', background: 'var(--cream-dark)', borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 14, fontWeight: 500,
              background: mode === m ? 'var(--white)' : 'transparent',
              color: mode === m ? 'var(--ink)' : 'var(--ink-muted)',
              boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
              border: mode === m ? '1px solid var(--border)' : 'none',
              transition: 'all 0.15s',
            }}>
              {m === 'login' ? 'כניסה' : 'יצירת חשבון'}
            </button>
          ))}
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={googleLoading || loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 20, transition: 'background 0.15s', opacity: googleLoading ? 0.7 : 1 }}>
          {googleLoading ? (
            <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>מעביר לגוגל…</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>או המשך עם אימייל</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div className="anim-up">
              <label style={labelStyle}>שם מלא</label>
              <input className="input" style={{ textAlign: 'right' }} placeholder="למשל: יוסי כהן" value={form.name} onChange={set('name')} autoComplete="name" />
            </div>
          )}
          <div>
            <label style={labelStyle}>אימייל</label>
            <input className="input" style={{ textAlign: 'left', direction: 'ltr' }} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" />
          </div>
          <div>
            <label style={labelStyle}>סיסמה</label>
            <input className="input" style={{ textAlign: 'left', direction: 'ltr' }} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEE', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200,0,0,0.15)' }}>
            <p style={{ fontSize: 13, color: '#C00', textAlign: 'right' }}>{error}</p>
          </div>
        )}

        <button className="btn btn-accent" style={{ marginTop: 24, width: '100%', fontSize: 16, padding: '15px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'רגע...' : mode === 'login' ? 'כניסה' : 'יצירת חשבון'}
          {!loading && <Icon name="arrow_right" size={16} color="white" style={{ transform: 'scaleX(-1)' }} />}
        </button>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-muted)' }}>
            חדש בטריפלן?{' '}
            <button onClick={() => setMode('signup')} style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 13 }}>צור חשבון</button>
          </p>
        )}

        <div style={{ marginTop: 32, padding: '20px 0', borderTop: '1px solid var(--border)' }}>
          {[
            { icon: 'map',      text: 'מפות טיול אינטראקטיביות' },
            { icon: 'calendar', text: 'תכנון יום יום' },
            { icon: 'users',    text: 'שיתופי עם כל הקבוצה' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={14} color="var(--accent)" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6, textAlign: 'right' }
