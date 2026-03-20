import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import TripMap from '../components/TripMap'
import BottomSheet from '../components/BottomSheet'
import NewDayModal from '../components/NewDayModal'
import NewStopModal from '../components/NewStopModal'
import EditStopModal from '../components/EditStopModal'
import EditDayModal from '../components/EditDayModal'
import EditTripModal from '../components/EditTripModal'
import PackingList from '../components/PackingList'
import Icon from '../components/Icon'

const TYPE_META = {
  attraction: { emoji: '🏛', label: 'Attraction', color: '#C4622D' },
  food:       { emoji: '🍽', label: 'Restaurant',  color: '#2D6B6B' },
  hotel:      { emoji: '🏨', label: 'Hotel',        color: '#5B3D8F' },
  transport:  { emoji: '🚌', label: 'Transport',    color: '#2D5C8E' },
}

const BOOKING_TYPE_META = {
  flight: { emoji: '✈️', label: 'Flight' },
  hotel:  { emoji: '🏨', label: 'Hotel' },
  car:    { emoji: '🚗', label: 'Car' },
  other:  { emoji: '🔗', label: 'Link' },
}

export default function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileRef = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const [trip, setTrip] = useState(null)
  const [days, setDays] = useState([])
  const [photos, setPhotos] = useState({})
  const [loading, setLoading] = useState(true)
  const [votes, setVotes] = useState({}) // stopId -> { up, down, userVote }

  const [tab, setTab] = useState('map')
  const [tabDir, setTabDir] = useState('left')
  const [selectedDay, setSelectedDay] = useState(null)
  const [openDaySheet, setOpenDaySheet] = useState(null)
  const [showNewDay, setShowNewDay] = useState(false)
  const [showNewStop, setShowNewStop] = useState(false)
  const [addStopForDay, setAddStopForDay] = useState(null)
  const [showCollabSheet, setShowCollabSheet] = useState(false)
  const [showEditTrip, setShowEditTrip] = useState(false)
  const [editingStop, setEditingStop] = useState(null)
  const [editingDay, setEditingDay] = useState(null)
  const [copied, setCopied] = useState(false)
  const [collaborators, setCollaborators] = useState([])

  const TABS = ['map', 'days', 'pack']

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    setLoading(true)
    const [tripRes, daysRes, membersRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('trip_days').select('*, stops(*)').eq('trip_id', id).order('day_number'),
      supabase.from('trip_members').select('*, profiles(*)').eq('trip_id', id),
    ])
    if (tripRes.error) { navigate('/'); return }
    setTrip(tripRes.data)
    const daysData = (daysRes.data || []).map(d => ({
      ...d,
      stops: (d.stops || []).sort((a, b) => a.sort_order - b.sort_order),
    }))
    setDays(daysData)
    setCollaborators(membersRes.data || [])

    const photoMap = {}
    for (const day of daysData) {
      const { data: ph } = await supabase.from('trip_photos').select('*').eq('day_id', day.id).order('created_at')
      if (ph?.length) {
        photoMap[day.id] = ph.map(p => supabase.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl)
      }
    }
    setPhotos(photoMap)

    // Fetch votes for all stops
    const allStopIds = daysData.flatMap(d => d.stops.map(s => s.id))
    if (allStopIds.length > 0) {
      const { data: voteData } = await supabase
        .from('stop_votes')
        .select('*')
        .in('stop_id', allStopIds)
      if (voteData) {
        const vMap = {}
        for (const stopId of allStopIds) {
          const stopVotes = voteData.filter(v => v.stop_id === stopId)
          vMap[stopId] = {
            up: stopVotes.filter(v => v.vote_type === 'up').length,
            down: stopVotes.filter(v => v.vote_type === 'down').length,
            userVote: stopVotes.find(v => v.user_id === user.id)?.vote_type || null,
          }
        }
        setVotes(vMap)
      }
    }

    setLoading(false)
  }

  const changeTab = (newTab) => {
    const curIdx = TABS.indexOf(tab)
    const newIdx = TABS.indexOf(newTab)
    setTabDir(newIdx > curIdx ? 'left' : 'right')
    setTab(newTab)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (dy > 40) return // vertical scroll, ignore
    const curIdx = TABS.indexOf(tab)
    if (dx < -60 && curIdx < TABS.length - 1) changeTab(TABS[curIdx + 1])
    else if (dx > 60 && curIdx > 0) changeTab(TABS[curIdx - 1])
  }

  const allStops = days.flatMap(d => d.stops.map(s => ({ ...s, dayCity: d.city })))
  const mapStops = selectedDay
    ? days.find(d => d.id === selectedDay.id)?.stops.filter(s => s.lat && s.lng) || []
    : allStops.filter(s => s.lat && s.lng)

  const totalBudget = allStops.reduce((sum, s) => sum + (s.cost || 0), 0)

  const toggleDone = async (stop) => {
    await supabase.from('stops').update({ done: !stop.done }).eq('id', stop.id)
    setDays(prev => prev.map(d => ({
      ...d,
      stops: d.stops.map(s => s.id === stop.id ? { ...s, done: !s.done } : s),
    })))
  }

  const handleVote = async (stopId, voteType) => {
    const current = votes[stopId] || { up: 0, down: 0, userVote: null }
    if (current.userVote === voteType) {
      // Remove vote
      await supabase.from('stop_votes').delete().eq('stop_id', stopId).eq('user_id', user.id)
      setVotes(prev => ({
        ...prev,
        [stopId]: {
          up: voteType === 'up' ? Math.max(0, current.up - 1) : current.up,
          down: voteType === 'down' ? Math.max(0, current.down - 1) : current.down,
          userVote: null,
        }
      }))
    } else {
      // Upsert vote
      await supabase.from('stop_votes').upsert({ stop_id: stopId, user_id: user.id, vote_type: voteType }, { onConflict: 'stop_id,user_id' })
      setVotes(prev => ({
        ...prev,
        [stopId]: {
          up: voteType === 'up' ? (current.up + 1) : (current.userVote === 'up' ? Math.max(0, current.up - 1) : current.up),
          down: voteType === 'down' ? (current.down + 1) : (current.userVote === 'down' ? Math.max(0, current.down - 1) : current.down),
          userVote: voteType,
        }
      }))
    }
  }

  const handleReorderStops = async (dayId, newStops) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, stops: newStops } : d))
    // Update sort_order in DB
    const updates = newStops.map((s, i) => supabase.from('stops').update({ sort_order: i }).eq('id', s.id))
    await Promise.all(updates)
  }

  const handleUploadPhoto = async (dayId, files) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${id}/${dayId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('trip-photos').upload(path, file)
      if (upErr) continue
      await supabase.from('trip_photos').insert({ day_id: dayId, uploaded_by: user.id, storage_path: path })
      const url = supabase.storage.from('trip-photos').getPublicUrl(path).data.publicUrl
      setPhotos(prev => ({ ...prev, [dayId]: [...(prev[dayId] || []), url] }))
    }
  }

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/join/${trip?.invite_token}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleStopUpdated = (updated) => {
    setDays(prev => prev.map(d => ({
      ...d,
      stops: d.stops.map(s => s.id === updated.id ? updated : s),
    })))
    setEditingStop(null)
  }

  const handleStopDeleted = (stopId) => {
    setDays(prev => prev.map(d => ({
      ...d,
      stops: d.stops.filter(s => s.id !== stopId),
    })))
    setEditingStop(null)
  }

  const handleDayUpdated = (updated) => {
    setDays(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d))
    setEditingDay(null)
  }

  const handleDayDeleted = (dayId) => {
    setDays(prev => prev.filter(d => d.id !== dayId))
    setEditingDay(null)
  }

  const handleTripUpdated = (updated) => {
    setTrip(updated)
    setShowEditTrip(false)
  }

  const handleTripDeleted = () => {
    navigate('/')
  }

  const doneCount = allStops.filter(s => s.done).length
  const totalCount = allStops.length

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Skeleton top bar */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: 'calc(var(--safe-top) + 12px) 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className="skeleton-circle" style={{ width: 36, height: 36, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton-text" style={{ width: '50%' }} />
            <div className="skeleton-text" style={{ width: '30%', height: 11 }} />
          </div>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ flex: 1, height: 40, borderRadius: 0 }} />)}
        </div>
      </div>
      {/* Skeleton content */}
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2].map(i => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div className="skeleton-circle" style={{ width: 40, height: 40 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                <div className="skeleton-text" style={{ width: '55%', animationDelay: `${i * 0.1}s` }} />
                <div className="skeleton-text" style={{ width: '35%', height: 11, animationDelay: `${i * 0.15}s` }} />
              </div>
            </div>
            {[1, 2, 3].map(j => (
              <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div className="skeleton-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
                <div className="skeleton-text" style={{ flex: 1, animationDelay: `${j * 0.08}s` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Print view (hidden on screen) ── */}
      <div className="print-only" style={{ padding: 32 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, marginBottom: 4 }}>{trip.cover_emoji} {trip.name}</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>{trip.destination}</p>
        {days.map(day => (
          <div key={day.id} style={{ marginBottom: 32, pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, borderBottom: '2px solid #333', paddingBottom: 4 }}>
              Day {day.day_number}: {day.city}
            </h2>
            {day.trip_date && <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>{new Date(day.trip_date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>}
            {day.stops.map((s, i) => {
              const m = TYPE_META[s.type] || TYPE_META.attraction
              return (
                <div key={s.id} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: 16 }}>{m.emoji}</span>
                  <div>
                    <strong>{i + 1}. {s.name}</strong>
                    {s.time_slot && <span style={{ color: '#666', marginLeft: 8 }}>{s.time_slot}</span>}
                    {s.cost && <span style={{ color: '#666', marginLeft: 8 }}>${s.cost}</span>}
                    {s.note && <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{s.note}</p>}
                  </div>
                </div>
              )
            })}
            {day.stops.length > 0 && (
              <p style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', color: '#555' }}>
                Day budget: ${day.stops.reduce((s, stop) => s + (stop.cost || 0), 0).toFixed(2)}
              </p>
            )}
          </div>
        ))}
        {totalBudget > 0 && <p style={{ fontWeight: 700, fontSize: 16, borderTop: '2px solid #333', paddingTop: 12 }}>Total budget: ${totalBudget.toFixed(2)}</p>}
      </div>

      {/* ── Top bar ── */}
      <div className="no-print" style={{ flexShrink: 0, background: 'var(--white)', borderBottom: '1px solid var(--border)', paddingTop: 'calc(var(--safe-top) + 12px)' }}>
        {/* Cover photo strip */}
        {trip.cover_photo_url && (
          <div style={{ height: 80, overflow: 'hidden', position: 'relative' }}>
            <img src={trip.cover_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))' }} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 12px', marginTop: 12 }}>
          <button onClick={() => navigate('/')} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="chevron_left" size={18} color="var(--ink)" />
          </button>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trip.cover_emoji} {trip.name}
            </p>
            {trip.date_start && (
              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                {new Date(trip.date_start).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                {trip.date_end ? ` – ${new Date(trip.date_end).toLocaleDateString('en', { month: 'short', day: 'numeric' })}` : ''}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={handleExportPDF} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer' }} title="Export PDF">
              <Icon name="download" size={16} color="var(--ink-muted)" />
            </button>
            <button onClick={() => setShowEditTrip(true)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer' }}>
              <Icon name="edit" size={16} color="var(--ink-muted)" />
            </button>
            <button onClick={() => setShowCollabSheet(true)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer' }}>
              <Icon name="users" size={17} color="var(--ink-muted)" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          {[
            { id: 'map', label: 'Map', icon: 'map' },
            { id: 'days', label: 'Days', icon: 'calendar' },
            { id: 'pack', label: 'Pack', icon: 'package' },
          ].map(t => (
            <button key={t.id} onClick={() => changeTab(t.id)}
              style={{ flex: 1, padding: '11px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, fontWeight: tab === t.id ? 500 : 400, color: tab === t.id ? 'var(--accent)' : 'var(--ink-muted)', borderBottom: `2.5px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, background: 'none', cursor: 'pointer', transition: 'color 0.15s' }}>
              <Icon name={t.icon} size={15} color={tab === t.id ? 'var(--accent)' : 'var(--ink-muted)'} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map view ── */}
      {tab === 'map' && (
        <div className={`no-print ${tabDir === 'left' ? 'tab-content' : 'tab-content-back'}`} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <TripMap stops={mapStops} onSelect={() => {}} />

          {days.length > 0 && (
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, zIndex: 10, overflowX: 'auto', display: 'flex', gap: 8, padding: '0 16px' }}
              className="scroll-y" onScroll={e => e.stopPropagation()}>
              <button onClick={() => setSelectedDay(null)}
                style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: !selectedDay ? 'var(--ink)' : 'var(--white)', color: !selectedDay ? 'var(--cream)' : 'var(--ink-light)', border: !selectedDay ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s' }}>
                All days
              </button>
              {days.map(d => (
                <button key={d.id} onClick={() => setSelectedDay(selectedDay?.id === d.id ? null : d)}
                  style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: selectedDay?.id === d.id ? 'var(--accent)' : 'var(--white)', color: selectedDay?.id === d.id ? 'white' : 'var(--ink-light)', border: selectedDay?.id === d.id ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  Day {d.day_number} · {d.city}
                </button>
              ))}
            </div>
          )}

          {totalCount > 0 && (
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--white)', borderRadius: 100, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', zIndex: 10, whiteSpace: 'nowrap' }}>
              <div style={{ width: 60, height: 4, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(doneCount / totalCount) * 100}%`, background: 'var(--teal)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{doneCount}/{totalCount} done</span>
              {totalBudget > 0 && <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500 }}>${totalBudget.toFixed(0)} total</span>}
            </div>
          )}
        </div>
      )}

      {/* ── Days view ── */}
      {tab === 'days' && (
        <div className={`no-print scroll-y ${tabDir === 'left' ? 'tab-content' : 'tab-content-back'}`}
          style={{ flex: 1, padding: '16px 16px 100px' }}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

          {/* Booking links */}
          {trip.booking_links && trip.booking_links.length > 0 && (
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-muted)', marginBottom: 10 }}>
                Bookings & Links
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trip.booking_links.map((bl, i) => {
                  const bm = BOOKING_TYPE_META[bl.type] || BOOKING_TYPE_META.other
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{bm.emoji}</span>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bl.label}</p>
                        {bl.ref && <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Ref: {bl.ref}</p>}
                      </div>
                      {bl.url && (
                        <a href={bl.url} target="_blank" rel="noopener noreferrer"
                          style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name="external_link" size={14} color="var(--accent)" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Budget summary */}
          {totalBudget > 0 && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--teal-light)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(45,107,107,0.2)' }}>
              <Icon name="wallet" size={18} color="var(--teal)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>Total trip budget</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-display)' }}>${totalBudget.toFixed(2)}</p>
              </div>
            </div>
          )}

          {days.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 48 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>No days yet</p>
              <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 24 }}>Add your first day to start planning</p>
              <button className="btn btn-accent" onClick={() => setShowNewDay(true)}>
                <Icon name="plus" size={15} color="white" /> Add first day
              </button>
            </div>
          ) : (
            <>
              {days.map(day => (
                <DayCard
                  key={day.id}
                  day={day}
                  photos={photos[day.id] || []}
                  votes={votes}
                  onToggleStop={toggleDone}
                  onVote={handleVote}
                  onAddStop={() => { setAddStopForDay(day); setShowNewStop(true) }}
                  onOpenSheet={() => setOpenDaySheet(day)}
                  onUploadPhoto={(files) => handleUploadPhoto(day.id, files)}
                  onEditStop={(stop) => setEditingStop(stop)}
                  onEditDay={() => setEditingDay(day)}
                  onReorderStops={(newStops) => handleReorderStops(day.id, newStops)}
                />
              ))}
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowNewDay(true)}>
                <Icon name="plus" size={15} color="var(--ink-light)" /> Add day
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Pack view ── */}
      {tab === 'pack' && (
        <div className={`no-print ${tabDir === 'left' ? 'tab-content' : 'tab-content-back'}`}
          style={{ flex: 1, overflowY: 'auto' }}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <PackingList tripId={id} />
        </div>
      )}

      {/* ── Collab sheet ── */}
      {showCollabSheet && (
        <BottomSheet title="Collaborate" onClose={() => setShowCollabSheet(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Invite link</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                Only people you share this link with can view and edit this trip.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {window.location.origin}/join/{trip.invite_token}
                </div>
                <button className="btn btn-accent btn-sm" onClick={handleCopyInvite} style={{ flexShrink: 0 }}>
                  <Icon name={copied ? 'check' : 'copy'} size={14} color="white" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Members ({collaborators.length})</p>
              {collaborators.map(m => (
                <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{(m.profiles?.name || '?')[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{m.profiles?.name || 'Unknown'}</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'capitalize' }}>{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* ── Day detail sheet ── */}
      {openDaySheet && (
        <BottomSheet title={`Day ${openDaySheet.day_number} — ${openDaySheet.city}`} onClose={() => setOpenDaySheet(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {openDaySheet.physical_note && <InfoBox icon="walk" color="var(--accent)" label="Physical" text={openDaySheet.physical_note} />}
            {openDaySheet.logistics_note && <InfoBox icon="bag" color="var(--teal)" label="Logistics" text={openDaySheet.logistics_note} />}
          </div>
        </BottomSheet>
      )}

      {showNewDay && (
        <NewDayModal tripId={id} nextDayNumber={days.length + 1}
          onClose={() => setShowNewDay(false)}
          onCreated={(day) => { setShowNewDay(false); setDays(prev => [...prev, { ...day, stops: [] }]) }}
        />
      )}

      {showNewStop && addStopForDay && (
        <NewStopModal dayId={addStopForDay.id}
          nextOrder={(days.find(d => d.id === addStopForDay.id)?.stops.length || 0)}
          onClose={() => { setShowNewStop(false); setAddStopForDay(null) }}
          onCreated={(stop) => {
            setShowNewStop(false); setAddStopForDay(null)
            setDays(prev => prev.map(d => d.id === stop.day_id ? { ...d, stops: [...d.stops, stop] } : d))
          }}
        />
      )}

      {editingStop && (
        <EditStopModal stop={editingStop} onClose={() => setEditingStop(null)}
          onUpdated={handleStopUpdated} onDeleted={handleStopDeleted}
        />
      )}

      {editingDay && (
        <EditDayModal day={editingDay} onClose={() => setEditingDay(null)}
          onUpdated={handleDayUpdated} onDeleted={handleDayDeleted}
        />
      )}

      {showEditTrip && (
        <EditTripModal trip={trip} onClose={() => setShowEditTrip(false)}
          onUpdated={handleTripUpdated} onDeleted={handleTripDeleted}
        />
      )}
    </div>
  )
}

// ── DayCard ──────────────────────────────────────────────────────────────────

function DayCard({ day, photos, votes, onToggleStop, onVote, onAddStop, onOpenSheet, onUploadPhoto, onEditStop, onEditDay, onReorderStops }) {
  const [expanded, setExpanded] = useState(true)
  const fileRef = useRef(null)
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  const doneCount = day.stops.filter(s => s.done).length
  const dayBudget = day.stops.reduce((sum, s) => sum + (s.cost || 0), 0)

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (idx !== dragOverIdx) setDragOverIdx(idx)
  }

  const handleDrop = (e, idx) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === idx) { setDraggedIdx(null); setDragOverIdx(null); return }
    const newStops = [...day.stops]
    const [moved] = newStops.splice(draggedIdx, 1)
    newStops.splice(idx, 0, moved)
    onReorderStops(newStops.map((s, i) => ({ ...s, sort_order: i })))
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const handleDragEnd = () => { setDraggedIdx(null); setDragOverIdx(null) }

  return (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setExpanded(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>{day.day_number}</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500 }}>{day.city}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              {day.trip_date ? new Date(day.trip_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
              {day.stops.length > 0 ? `${day.trip_date ? ' · ' : ''}${doneCount}/${day.stops.length} done` : 'No stops yet'}
              {dayBudget > 0 && ` · $${dayBudget.toFixed(0)}`}
            </p>
          </div>
          <div style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <Icon name="chevron_down" size={16} color="var(--sand-dark)" />
          </div>
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {(day.physical_note || day.logistics_note) && (
            <button onClick={e => { e.stopPropagation(); onOpenSheet() }}
              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="info" size={14} color="var(--ink-muted)" />
            </button>
          )}
          <button onClick={onEditDay}
            style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="edit" size={13} color="var(--ink-muted)" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {day.stops.length > 0 && (
        <div style={{ height: 2, background: 'var(--cream-dark)', margin: '0 16px' }}>
          <div style={{ height: '100%', width: `${(doneCount / day.stops.length) * 100}%`, background: 'var(--teal)', transition: 'width 0.3s' }} />
        </div>
      )}

      {expanded && (
        <div className="anim-up">
          {/* Stops with drag & drop */}
          {day.stops.length > 0 && (
            <div style={{ padding: '12px 16px 0' }}>
              {day.stops.map((stop, i) => {
                const meta = TYPE_META[stop.type] || TYPE_META.attraction
                const stopVotes = votes[stop.id] || { up: 0, down: 0, userVote: null }
                const isDragging = draggedIdx === i
                const isDragOver = dragOverIdx === i && draggedIdx !== i

                return (
                  <div
                    key={stop.id}
                    draggable
                    onDragStart={e => handleDragStart(e, i)}
                    onDragOver={e => handleDragOver(e, i)}
                    onDrop={e => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: 'flex', gap: 8, paddingBottom: i < day.stops.length - 1 ? 14 : 0, position: 'relative',
                      opacity: isDragging ? 0.4 : 1,
                      borderTop: isDragOver ? '2px solid var(--accent)' : '2px solid transparent',
                      transition: 'opacity 0.15s, border-color 0.1s',
                    }}
                  >
                    {i < day.stops.length - 1 && (
                      <div style={{ position: 'absolute', left: 23, top: 30, bottom: 0, width: 1, background: 'var(--border)' }} />
                    )}

                    {/* Drag handle */}
                    <div className="drag-handle" style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 6 }}>
                      <Icon name="drag" size={14} color="var(--sand-dark)" />
                    </div>

                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: stop.done ? 'var(--cream-dark)' : 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, zIndex: 1 }}>
                      {meta.emoji}
                    </div>
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: stop.done ? 'var(--ink-muted)' : 'var(--ink)', textDecoration: stop.done ? 'line-through' : 'none', lineHeight: 1.3 }}>
                            {stop.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                            {(stop.time_slot || stop.note) && (
                              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                                {[stop.time_slot, stop.note].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            {stop.cost > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-light)', padding: '1px 6px', borderRadius: 20 }}>
                                ${stop.cost}
                              </span>
                            )}
                          </div>
                          {/* Votes */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button className={`vote-btn ${stopVotes.userVote === 'up' ? 'active-up' : ''}`}
                              onClick={() => onVote(stop.id, 'up')}>
                              👍 {stopVotes.up || 0}
                            </button>
                            <button className={`vote-btn ${stopVotes.userVote === 'down' ? 'active-down' : ''}`}
                              onClick={() => onVote(stop.id, 'down')}>
                              👎 {stopVotes.down || 0}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                          <button onClick={() => onEditStop(stop)}
                            style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                            <Icon name="edit" size={11} color="var(--ink-muted)" />
                          </button>
                          <button onClick={() => onToggleStop(stop)}
                            style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${stop.done ? 'var(--teal)' : 'var(--border-strong)'}`, background: stop.done ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', marginTop: 2, transition: 'all 0.15s' }}>
                            {stop.done && <Icon name="check" size={12} color="white" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add stop */}
          <button onClick={onAddStop}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px', fontSize: 13, color: 'var(--accent)', fontWeight: 500, cursor: 'pointer', background: 'none', borderTop: day.stops.length > 0 ? '1px dashed var(--sand)' : 'none', marginTop: day.stops.length > 0 ? 12 : 4 }}>
            <Icon name="plus" size={14} color="var(--accent)" />
            Add stop
          </button>

          {/* Photos */}
          <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 8px' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-light)' }}>
                📷 Photos {photos.length > 0 ? `(${photos.length})` : ''}
              </span>
              <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', fontSize: 12 }}>
                + Add
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => onUploadPhoto(e.target.files)} />
            </div>
            {photos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {photos.map((url, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: 'var(--cream-dark)' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                style={{ border: '1.5px dashed var(--sand)', borderRadius: 10, padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <Icon name="image" size={22} color="var(--sand-dark)" />
                <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Add trip photos</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoBox({ icon, color, label, text }) {
  return (
    <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon name={icon} size={14} color={color} />
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color }}>{label}</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--ink-light)', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}
