import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import NewTripModal from '../components/NewTripModal'
import EditTripModal from '../components/EditTripModal'
import Icon from '../components/Icon'

// Three-way: 'light' → 'dark' → 'system'
function applyThemeMode(mode) {
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else if (mode === 'light') {
    document.documentElement.setAttribute('data-theme', '')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : '')
  }
}

function useThemeMode() {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light')

  useEffect(() => {
    applyThemeMode(mode)
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyThemeMode('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [mode])

  const cycle = () => {
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
    setMode(next)
    localStorage.setItem('themeMode', next)
    applyThemeMode(next)
  }

  return { mode, cycle }
}

export default function HomePage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { mode, cycle: cycleTheme } = useThemeMode()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [joinToken, setJoinToken] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => { fetchTrips() }, [user])

  const fetchTrips = async () => {
    setLoading(true)
    setFetchError(false)
    const { data, error } = await supabase
      .from('trips')
      .select('*, trip_members!inner(user_id)')
      .eq('trip_members.user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) { setFetchError(true); setLoading(false); return }
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

  const handleTripUpdated = (updated) => {
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t))
    setEditingTrip(null)
  }

  const handleTripDeleted = (id) => {
    setTrips(prev => prev.filter(t => t.id !== id))
    setEditingTrip(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      <div style={{ padding: 'calc(var(--safe-top) + 20px) 20px 0', background: 'var(--white)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="globe" size={14} color="var(--cream)" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '-0.02em' }}>Triplan</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Hey {profile?.name || 'there'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={cycleTheme} title={`Theme: ${mode}`}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}>
              <Icon name={mode === 'dark' ? 'sun' : mode === 'system' ? 'monitor' : 'moon'} size={16} color="var(--ink-muted)" />
            </button>
            <button onClick={signOut}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="logout" size={16} color="var(--ink-muted)" />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 16 }}>
          <input className="input" style={{ flex: 1, fontSize: 14, padding: '10px 14px' }} placeholder="Paste invite code to join a trip…" value={joinToken} onChange={e => setJoinToken(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()} />
          <button className="btn btn-ghost btn-sm" onClick={handleJoin} disabled={joining || !joinToken.trim()}>
            {joining ? '…' : 'Join'}
          </button>
        </div>
        {joinError && <p style={{ fontSize: 12, color: '#C00', marginBottom: 10, marginTop: -8 }}>{joinError}</p>}
      </div>

      <div className="scroll-y" style={{ flex: 1, padding: '20px 20px 100px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 80, borderRadius: 0 }} />
                <div style={{ padding: '12px 16px', display: 'flex', gap: 12 }}>
                  <div className="skeleton-circle" style={{ width: 44, height: 44, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                    <div className="skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton-text" style={{ width: '40%', height: 11 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ marginBottom: 16 }}><Icon name="close" size={44} color="var(--sand-dark)" /></div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Couldn't load trips</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 24 }}>Check your connection and try again</p>
            <button className="btn btn-accent" onClick={fetchTrips}>Retry</button>
          </div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ marginBottom: 16 }}><Icon name="map" size={52} color="var(--sand-dark)" /></div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>No trips yet</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 28 }}>Start planning your next adventure</p>
            <button className="btn btn-accent" onClick={() => setShowNew(true)}>
              <Icon name="plus" size={16} color="white" /> New trip
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} formatDates={formatDates}
                onClick={() => navigate(`/trip/${trip.id}`)}
                onEdit={e => { e.stopPropagation(); setEditingTrip(trip) }}
              />
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowNew(true)}
        style={{ position: 'fixed', bottom: 'calc(var(--safe-bottom) + 28px)', right: 24, width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(26,22,18,0.3)', zIndex: 100, cursor: 'pointer', transition: 'transform 0.15s', border: 'none' }}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
        onTouchEnd={e => e.currentTarget.style.transform = ''}>
        <Icon name="plus" size={22} color="var(--cream)" />
      </button>

      {showNew && <NewTripModal onClose={() => setShowNew(false)} onCreated={(trip) => { setShowNew(false); fetchTrips(); navigate(`/trip/${trip.id}`) }} />}
      {editingTrip && <EditTripModal trip={editingTrip} onClose={() => setEditingTrip(null)} onUpdated={handleTripUpdated} onDeleted={handleTripDeleted} />}
    </div>
  )
}

function TripCard({ trip, formatDates, onClick, onEdit }) {
  return (
    <button onClick={onClick} className="card"
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.15s' }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.985)'}
      onTouchEnd={e => e.currentTarget.style.transform = ''}>
      {trip.cover_photo_url ? (
        <div style={{ position: 'relative', height: 110, overflow: 'hidden' }}>
          <img src={trip.cover_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(26,22,18,0.65))' }} />
          <div style={{ position: 'absolute', bottom: 10, left: 14, right: 50 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: '#fff', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>{[trip.destination, formatDates(trip)].filter(Boolean).join(' · ') || 'No dates set'}</p>
          </div>
          <button onClick={onEdit} style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Icon name="edit" size={13} color="white" />
          </button>
        </div>
      ) : (
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="map" size={24} color="var(--accent)" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{[trip.destination, formatDates(trip)].filter(Boolean).join(' · ') || 'No dates set'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={onEdit} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="edit" size={13} color="var(--ink-muted)" />
            </button>
            <Icon name="chevron_right" size={18} color="var(--sand-dark)" />
          </div>
        </div>
      )}
    </button>
  )
}
