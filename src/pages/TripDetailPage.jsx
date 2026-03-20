import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import TripMap from '../components/TripMap'
import BottomSheet from '../components/BottomSheet'
import NewDayModal from '../components/NewDayModal'
import NewStopModal from '../components/NewStopModal'
import Icon from '../components/Icon'

const TYPE_META = {
  attraction: { emoji: '🏛', label: 'Attraction', color: '#C4622D' },
  food:       { emoji: '🍽', label: 'Restaurant',  color: '#2D6B6B' },
  hotel:      { emoji: '🏨', label: 'Hotel',        color: '#5B3D8F' },
  transport:  { emoji: '🚌', label: 'Transport',    color: '#2D5C8E' },
}

export default function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileRef = useRef(null)
  const uploadDayRef = useRef(null)

  const [trip, setTrip] = useState(null)
  const [days, setDays] = useState([])
  const [photos, setPhotos] = useState({}) // dayId -> [url]
  const [loading, setLoading] = useState(true)

  const [tab, setTab] = useState('map') // 'map' | 'days'
  const [selectedDay, setSelectedDay] = useState(null) // day object
  const [openDaySheet, setOpenDaySheet] = useState(null) // day object for bottom sheet
  const [showNewDay, setShowNewDay] = useState(false)
  const [showNewStop, setShowNewStop] = useState(false)
  const [addStopForDay, setAddStopForDay] = useState(null)
  const [showCollabSheet, setShowCollabSheet] = useState(false)
  const [copied, setCopied] = useState(false)
  const [collaborators, setCollaborators] = useState([])

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

    // Fetch photos per day
    const photoMap = {}
    for (const day of daysData) {
      const { data: ph } = await supabase.from('trip_photos').select('*').eq('day_id', day.id).order('created_at')
      if (ph?.length) {
        photoMap[day.id] = ph.map(p => supabase.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl)
      }
    }
    setPhotos(photoMap)
    setLoading(false)
  }

  const allStops = days.flatMap(d => d.stops.map(s => ({ ...s, dayCity: d.city })))
  const mapStops = selectedDay
    ? days.find(d => d.id === selectedDay.id)?.stops.filter(s => s.lat && s.lng) || []
    : allStops.filter(s => s.lat && s.lng)

  const toggleDone = async (stop) => {
    await supabase.from('stops').update({ done: !stop.done }).eq('id', stop.id)
    setDays(prev => prev.map(d => ({
      ...d,
      stops: d.stops.map(s => s.id === stop.id ? { ...s, done: !s.done } : s),
    })))
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
    const token = trip?.invite_token
    const url = `${window.location.origin}/join/${token}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const doneCount = allStops.filter(s => s.done).length
  const totalCount = allStops.length

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32 }}>🗺️</div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Loading your trip…</p>
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ flexShrink: 0, background: 'var(--white)', borderBottom: '1px solid var(--border)', paddingTop: 'calc(var(--safe-top) + 12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 12px' }}>
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
          <button onClick={() => setShowCollabSheet(true)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="users" size={17} color="var(--ink-muted)" />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          {[
            { id: 'map', label: 'Map', icon: 'map' },
            { id: 'days', label: 'Days', icon: 'calendar' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '11px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, fontWeight: tab === t.id ? 500 : 400, color: tab === t.id ? 'var(--accent)' : 'var(--ink-muted)', borderBottom: `2.5px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, background: 'none', cursor: 'pointer', transition: 'color 0.15s' }}>
              <Icon name={t.icon} size={15} color={tab === t.id ? 'var(--accent)' : 'var(--ink-muted)'} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map view ── */}
      {tab === 'map' && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <TripMap stops={mapStops} onSelect={() => {}} />

          {/* Day filter pills */}
          {days.length > 0 && (
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, zIndex: 10, overflowX: 'auto', display: 'flex', gap: 8, padding: '0 16px' }}
              className="scroll-y" onScroll={e => e.stopPropagation()}>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: !selectedDay ? 'var(--ink)' : 'var(--white)', color: !selectedDay ? 'white' : 'var(--ink-light)', border: !selectedDay ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s' }}>
                All days
              </button>
              {days.map(d => (
                <button key={d.id}
                  onClick={() => setSelectedDay(selectedDay?.id === d.id ? null : d)}
                  style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: selectedDay?.id === d.id ? 'var(--accent)' : 'var(--white)', color: selectedDay?.id === d.id ? 'white' : 'var(--ink-light)', border: selectedDay?.id === d.id ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  Day {d.day_number} · {d.city}
                </button>
              ))}
            </div>
          )}

          {/* Progress chip */}
          {totalCount > 0 && (
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--white)', borderRadius: 100, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', zIndex: 10, whiteSpace: 'nowrap' }}>
              <div style={{ width: 60, height: 4, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(doneCount / totalCount) * 100}%`, background: 'var(--teal)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{doneCount}/{totalCount} done</span>
            </div>
          )}
        </div>
      )}

      {/* ── Days view ── */}
      {tab === 'days' && (
        <div className="scroll-y" style={{ flex: 1, padding: '16px 16px 100px' }}>
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
                  onToggleStop={toggleDone}
                  onAddStop={() => { setAddStopForDay(day); setShowNewStop(true) }}
                  onOpenSheet={() => setOpenDaySheet(day)}
                  onUploadPhoto={(files) => handleUploadPhoto(day.id, files)}
                />
              ))}
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowNewDay(true)}>
                <Icon name="plus" size={15} color="var(--ink-light)" /> Add day
              </button>
            </>
          )}
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
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
                      {(m.profiles?.name || '?')[0].toUpperCase()}
                    </span>
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
            {openDaySheet.physical_note && (
              <InfoBox icon="walk" color="var(--accent)" label="Physical" text={openDaySheet.physical_note} />
            )}
            {openDaySheet.logistics_note && (
              <InfoBox icon="bag" color="var(--teal)" label="Logistics" text={openDaySheet.logistics_note} />
            )}
          </div>
        </BottomSheet>
      )}

      {showNewDay && (
        <NewDayModal
          tripId={id}
          nextDayNumber={days.length + 1}
          onClose={() => setShowNewDay(false)}
          onCreated={(day) => { setShowNewDay(false); setDays(prev => [...prev, { ...day, stops: [] }]) }}
        />
      )}

      {showNewStop && addStopForDay && (
        <NewStopModal
          dayId={addStopForDay.id}
          nextOrder={(days.find(d => d.id === addStopForDay.id)?.stops.length || 0)}
          onClose={() => { setShowNewStop(false); setAddStopForDay(null) }}
          onCreated={(stop) => {
            setShowNewStop(false); setAddStopForDay(null)
            setDays(prev => prev.map(d => d.id === stop.day_id ? { ...d, stops: [...d.stops, stop] } : d))
          }}
        />
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function DayCard({ day, photos, onToggleStop, onAddStop, onOpenSheet, onUploadPhoto }) {
  const [expanded, setExpanded] = useState(true)
  const fileRef = useRef(null)

  const doneCount = day.stops.filter(s => s.done).length

  return (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      {/* Header */}
      <button onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>{day.day_number}</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500 }}>{day.city}</p>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            {day.trip_date ? new Date(day.trip_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
            {day.stops.length > 0 ? `${day.trip_date ? ' · ' : ''}${doneCount}/${day.stops.length} done` : 'No stops yet'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(day.physical_note || day.logistics_note) && (
            <button onClick={e => { e.stopPropagation(); onOpenSheet() }}
              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="info" size={14} color="var(--ink-muted)" />
            </button>
          )}
          <div style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <Icon name="chevron_down" size={16} color="var(--sand-dark)" />
          </div>
        </div>
      </button>

      {/* Progress bar */}
      {day.stops.length > 0 && (
        <div style={{ height: 2, background: 'var(--cream-dark)', margin: '0 16px' }}>
          <div style={{ height: '100%', width: `${(doneCount / day.stops.length) * 100}%`, background: 'var(--teal)', transition: 'width 0.3s' }} />
        </div>
      )}

      {expanded && (
        <div className="anim-up">
          {/* Stops */}
          {day.stops.length > 0 && (
            <div style={{ padding: '12px 16px 0' }}>
              {day.stops.map((stop, i) => {
                const meta = TYPE_META[stop.type] || TYPE_META.attraction
                return (
                  <div key={stop.id} style={{ display: 'flex', gap: 12, paddingBottom: i < day.stops.length - 1 ? 14 : 0, position: 'relative' }}>
                    {i < day.stops.length - 1 && (
                      <div style={{ position: 'absolute', left: 15, top: 30, bottom: 0, width: 1, background: 'var(--border)' }} />
                    )}
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: stop.done ? 'var(--cream-dark)' : 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, zIndex: 1 }}>
                      {meta.emoji}
                    </div>
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: stop.done ? 'var(--ink-muted)' : 'var(--ink)', textDecoration: stop.done ? 'line-through' : 'none', lineHeight: 1.3 }}>
                            {stop.name}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>
                            {[stop.time_slot, stop.note].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <button onClick={() => onToggleStop(stop)}
                          style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${stop.done ? 'var(--teal)' : 'var(--border-strong)'}`, background: stop.done ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', marginTop: 2, transition: 'all 0.15s' }}>
                          {stop.done && <Icon name="check" size={12} color="white" />}
                        </button>
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
                <Icon name="camera" size={12} color="var(--ink-muted)" style={{ display: 'inline', marginRight: 5 }} />
                Photos {photos.length > 0 ? `(${photos.length})` : ''}
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
