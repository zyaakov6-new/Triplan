import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/Icon'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // login | signup | onboard
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    if (mode === 'signup') {
      if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return }
      const err = await signUp(form.email, form.password, form.name)
      if (err) setError(err.message)
    } else {
      const err = await signIn(form.email, form.password)
      if (err) setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top hero */}
      <div style={{
        flex: '0 0 42%', background: 'var(--ink)', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 28px 32px',
        paddingTop: 'calc(var(--safe-top) + 16px)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 15% 85%, rgba(196,98,45,0.35) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(45,107,107,0.25) 0%, transparent 55%)' }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 20px)', left: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="globe" size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'white', letterSpacing: '-0.02em' }}>Triplan</span>
        </div>

        <div style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 400, marginBottom: 10 }}>
            Every trip,<br /><em style={{ color: 'var(--accent-light)' }}>perfectly</em> organized.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6 }}>
            Map routes, plan days, share with travel companions.
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
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div className="anim-up">
              <label style={labelStyle}>Your name</label>
              <input className="input" placeholder="Ziv" value={form.name} onChange={set('name')} autoComplete="name" />
            </div>
          )}
          <div>
            <label style={labelStyle}>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" inputMode="email" />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEE', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(200,0,0,0.15)' }}>
            <p style={{ fontSize: 13, color: '#C00' }}>{error}</p>
          </div>
        )}

        <button className="btn btn-accent" style={{ marginTop: 24, width: '100%', fontSize: 16, padding: '15px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          {!loading && <Icon name="arrow_right" size={16} color="white" />}
        </button>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-muted)' }}>
            New to Triplan?{' '}
            <button onClick={() => setMode('signup')} style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 13 }}>Create account</button>
          </p>
        )}

        <div style={{ marginTop: 32, padding: '20px 0', borderTop: '1px solid var(--border)' }}>
          {[
            { icon: 'map',      text: 'Interactive trip maps' },
            { icon: 'calendar', text: 'Day-by-day planning' },
            { icon: 'users',    text: 'Collaborative with your group' },
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

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
