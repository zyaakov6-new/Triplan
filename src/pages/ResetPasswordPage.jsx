import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Icon from '../components/Icon'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const [ready, setReady]         = useState(false)

  // Supabase sends the recovery token as a URL fragment - detect the session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => navigate('/'), 2500)
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--white)', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lock" size={18} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>Set new password</h1>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="check" size={28} color="var(--teal)" />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Password updated!</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Taking you back to the app…</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Verifying your reset link…</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: 12, marginTop: 12 }}>
              If this page stays blank, the link may have expired.{' '}
              <button onClick={() => navigate('/')} style={{ color: 'var(--accent)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                Back to sign in
              </button>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>New password</label>
              <input className="input" type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label style={lbl}>Confirm password</label>
              <input className="input" type="password" placeholder="••••••••" value={confirm}
                onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <p className="error-box">{error}</p>}
            <button className="btn btn-accent" style={{ width: '100%', marginTop: 4 }} onClick={handleReset} disabled={loading}>
              {loading ? 'Saving…' : 'Set new password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
