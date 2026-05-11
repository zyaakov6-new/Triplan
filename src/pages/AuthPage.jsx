import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../hooks/useLang'
import Icon from '../components/Icon'

// ── i18n ──────────────────────────────────────────────────────────────────────

const T = {
  he: {
    dir:            'rtl',
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
    backToHome:     'חזרה לדף הבית',
    wait:           'רגע...',
    submitLogin:    'כניסה',
    submitSignup:   'יצירת חשבון',
    langToggle:     'EN',
  },
  en: {
    dir:            'ltr',
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
    backToHome:     'Back to home',
    wait:           'Please wait...',
    submitLogin:    'Sign in',
    submitSignup:   'Create account',
    langToggle:     'עב',
  },
}

const lbl = {
  display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-muted)',
  letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const navigate               = useNavigate()
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const { lang, toggleLang }   = useLang()

  const t    = T[lang]
  const isHe = lang === 'he'

  const [mode, setMode]             = useState('login') // 'login' | 'signup' | 'forgot'
  const [form, setForm]             = useState({ name: '', email: '', password: '' })
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGLoader] = useState(false)
  const [resetSent, setResetSent]   = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

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

  return (
    <div dir={t.dir} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Dark hero bar */}
      <div style={{ background: '#1A1612', flexShrink: 0, padding: 'calc(var(--safe-top) + 16px) 24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 85% 85%, rgba(196,98,45,0.35) 0%, transparent 55%), radial-gradient(ellipse at 15% 15%, rgba(45,107,107,0.2) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>

          {/* Top row: back + logo + lang toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button
              onClick={() => navigate('/')}
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              aria-label={t.backToHome}
            >
              <Icon name={isHe ? 'chevron_right' : 'chevron_left'} size={16} color="rgba(255,255,255,0.6)" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="globe" size={14} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', letterSpacing: '-0.02em' }}>Triplan</span>
            </div>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title={lang === 'he' ? 'Switch to English' : 'החלף לעברית'}
              style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', padding: '6px 13px', borderRadius: 20, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: 'var(--font-body)' }}
            >
              {t.langToggle}
            </button>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'white', fontWeight: 400, marginBottom: 6, lineHeight: 1.2 }}>
            {mode === 'forgot' ? t.resetTitle : t.welcomeBack}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            {mode === 'login' ? t.signInSub : mode === 'signup' ? t.signUpSub : t.resetSub}
          </p>
        </div>
      </div>

      {/* Form area */}
      <div className="scroll-y" style={{ flex: 1, background: 'var(--cream)', padding: '24px 24px calc(var(--safe-bottom) + 24px)' }}>

        {/* Forgot password view */}
        {mode === 'forgot' && (
          <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            {/* Tabs */}
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

            {/* Fields */}
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
    </div>
  )
}
