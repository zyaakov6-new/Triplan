import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/Icon'

export default function JoinPage() {
  const { token } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('joining') // joining | success | error | timeout
  const timeoutRef = useRef(null)

  const attemptJoin = () => {
    if (!user || !token) return
    setStatus('joining')
    // 10-second safety timeout
    timeoutRef.current = setTimeout(() => setStatus('timeout'), 10_000)
    supabase.rpc('join_trip_by_token', { token })
      .then(({ data, error }) => {
        clearTimeout(timeoutRef.current)
        if (error) { setStatus('error'); return }
        setStatus('success')
        setTimeout(() => navigate(`/trip/${data}`), 1200)
      })
      .catch(() => { clearTimeout(timeoutRef.current); setStatus('error') })
  }

  useEffect(() => {
    attemptJoin()
    return () => clearTimeout(timeoutRef.current)
  }, [user, token])

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      {status === 'joining' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="map" size={28} color="var(--ink-muted)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Joining trip…</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>This should only take a moment</p>
      </>}
      {status === 'success' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={28} color="var(--teal)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>You're in! Redirecting…</p>
      </>}
      {status === 'error' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={28} color="var(--accent)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Invalid invite link</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>This link may have expired or already been used.</p>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Go home</button>
      </>}
      {status === 'timeout' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={28} color="var(--sand-dark)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Taking too long…</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>Check your connection and try again.</p>
        <button className="btn btn-accent" onClick={attemptJoin}>Retry</button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Go home</button>
      </>}
    </div>
  )
}
