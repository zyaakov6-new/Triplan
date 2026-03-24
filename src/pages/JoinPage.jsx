import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/Icon'

export default function JoinPage() {
  const { token } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('joining') // joining | success | error

  useEffect(() => {
    if (!user || !token) return
    supabase.rpc('join_trip_by_token', { token })
      .then(({ data, error }) => {
        if (error) { setStatus('error'); return }
        setStatus('success')
        setTimeout(() => navigate(`/trip/${data}`), 1200)
      })
  }, [user, token])

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      {status === 'joining' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="map" size={28} color="var(--ink-muted)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Joining trip…</p>
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
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Go home</button>
      </>}
    </div>
  )
}
