import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import NewTripModal from '../components/NewTripModal'
import Icon from '../components/Icon'

export default function HomePage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [joinToken, setJoinToken] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => { fetchTrips() }, [user])

  const fetchTrips = async () => {
    setLoading(true)
    // Get trips where user is owner or member
    const { data } = await supabase
      .from('trips')
      .select('*, trip_members!inner(user_id)')
      .eq('trip_members.user_id', user.id)
      .order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!joinToken.trim()) return
    setJoining(true); setJoinError('')
    const { data, error } = await supabase.rpc('join_trip_by_token', { token: joinToken.trim().toLowerCase() })
    if (error) { setJoinError('Invalid invite link'); setJoining(false); return }
    setJoining(false); setJoinToken('')
    navigate(`/trip/${data}`)
  }

  const formatDates = (t) => {
    if (!t.date_start) return null
    const s = new Date(t.date_start).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    const e = t.date_end ? new Date(t.date_end).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : null
    return e ? `${s} – ${e}` : s
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ padding: 'calc(var(--safe-top) + 20px) 20px 0', background: 'var(--white)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="globe" size={14} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '-0.02em' }}>Triplan</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              Hey {profile?.name || 'there'} 👋
            </p>
          </div>
          <button onClick={signOut} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="logout" size={16} color="var(--ink-muted)" />
          </button>
        </div>

        {/* Join via invite */}
        <div style={{ display: 'flex', gap: 8, paddingBottom: 16 }}>
          <input className="input" style={{ flex: 1, fontSize: 14, padding: '10px 14px' }} placeholder="Paste invite code to join a trip…" value={joinToken} onChange={e => setJoinToken(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()} />
          <button className="btn btn-ghost btn-sm" onClick={handleJoin} disabled={joining || !joinToken.trim()}>
            {joining ? '…' : 'Join'}
          </button>
        </div>
        {joinError && <p style={{ fontSize: 12, color: '#C00', marginBottom: 10, marginTop: -8 }}>{joinError}</p>}
      </div>

      {/* Trip list */}
      <div className="scroll-y" style={{ flex: 1, padding: '20px 20px 100px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 'var(--radius)' }} />)}
          </div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🗺️</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>No trips yet</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 28 }}>Start planning your next adventure</p>
            <button className="btn btn-accent" onClick={() => setShowNew(true)}>
              <Icon name="plus" size={16} color="white" /> New trip
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trips.map(trip => (
              <button key={trip.id} onClick={() => navigate(`/trip/${trip.id}`)}
                className="card"
                style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.985)'}
                onTouchEnd={e => e.currentTarget.style.transform = ''}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {trip.cover_emoji || '✈️'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {trip.name}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                    {[trip.destination, formatDates(trip)].filter(Boolean).join(' · ') || 'No dates set'}
                  </p>
                </div>
                <Icon name="chevron_right" size={18} color="var(--sand-dark)" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowNew(true)}
        style={{ position: 'fixed', bottom: 'calc(var(--safe-bottom) + 28px)', right: 24, width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(26,22,18,0.3)', zIndex: 100, cursor: 'pointer', transition: 'transform 0.15s', border: 'none' }}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
        onTouchEnd={e => e.currentTarget.style.transform = ''}>
        <Icon name="plus" size={22} color="white" />
      </button>

      {showNew && (
        <NewTripModal
          onClose={() => setShowNew(false)}
          onCreated={(trip) => { setShowNew(false); fetchTrips(); navigate(`/trip/${trip.id}`) }}
        />
      )}
    </div>
  )
}
