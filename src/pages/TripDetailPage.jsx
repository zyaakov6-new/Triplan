import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import PhotoLightbox from '../components/PhotoLightbox'
import Icon from '../components/Icon'
import { THEMES, getThemeVars } from '../lib/themes'
import { getDayDistance, optimizeRoute } from '../lib/tripUtils'
import BeautifulPrintView from '../components/BeautifulPrintView'

const TYPE_META = {
  waypoint:   { icon: 'pin',       label: 'Waypoint',     color: '#7A6E64' },
  attraction: { icon: 'navigate',  label: 'Viewpoint',    color: '#C4622D' },
  food:       { icon: 'food',      label: 'Food & Water', color: '#2D6B6B' },
  hotel:      { icon: 'hotel',     label: 'Camp/Lodge',   color: '#5B3D8F' },
  transport:  { icon: 'transport', label: 'Transport',    color: '#2D5C8E' },
}

const DAY_COLORS = ['#E05C3A','#2E9E6E','#5B6FE8','#E8A020','#B045C8','#2DA8C4','#C44B7A','#8B7355','#3D9E3D','#9B59B6']

const BOOKING_TYPE_META = {
  flight: { icon: 'transport', label: 'Flight' },
  hotel:  { icon: 'hotel',     label: 'Hotel' },
  car:    { icon: 'navigate',  label: 'Car' },
  other:  { icon: 'external_link', label: 'Link' },
}

// ── Confetti component ────────────────────────────────────────────────────────
function Confetti({ onDone }) {
  const pieces = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#C4622D','#2D6B6B','#F5C842','#4A90E2','#E06B8A','#5B8F5B','#B45FCB'][i % 7],
      size: 6 + Math.random() * 9,
      delay: Math.random() * 0.7,
      duration: 2.2 + Math.random() * 1.4,
      isCircle: Math.random() > 0.45,
      wobble: Math.random() > 0.5,
    })), []
  )
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: -12,
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.isCircle ? '50%' : '2px',
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards${p.wobble ? ', confettiWiggle 0.6s ease-in-out infinite' : ''}`,
        }} />
      ))}
      <div style={{ position: 'absolute', top: '30%', left: '50%', animation: 'confettiCheck 3.5s ease forwards', pointerEvents: 'none' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 12px rgba(45,107,107,0.2)' }}>
          <Icon name="check" size={32} color="white" />
        </div>
      </div>
    </div>
  )
}

// ── AgendaView ────────────────────────────────────────────────────────────────
function AgendaView({ days, onDirections }) {
  const allDays = days.filter(d => d.stops.length > 0)
  if (allDays.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-muted)' }}>No stops yet</div>
  )
  return (
    <div>
      {allDays.map(day => {
        const sorted = [...day.stops].sort((a, b) => {
          if (!a.time_slot && !b.time_slot) return a.sort_order - b.sort_order
          if (!a.time_slot) return 1
          if (!b.time_slot) return -1
          return a.time_slot.localeCompare(b.time_slot)
        })
        return (
          <div key={day.id} style={{ marginBottom: 8 }}>
            {/* Day header */}
            <div className="agenda-day-header">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>Day</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white', lineHeight: 1 }}>{day.day_number}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500 }}>{day.city}</p>
                {day.trip_date && <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{new Date(day.trip_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
              </div>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {sorted.map((stop, i) => {
                const meta = TYPE_META[stop.type] || TYPE_META.attraction
                const gmapsUrl = stop.lat && stop.lng
                  ? `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name)}`
                return (
                  <div key={stop.id} className="agenda-time-row" style={{ padding: '10px 14px' }}>
                    <span className="agenda-time">{stop.time_slot || '—'}</span>
                    <Icon name={meta.icon} size={15} color={meta.color} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: stop.done ? 'var(--ink-muted)' : 'var(--ink)', textDecoration: stop.done ? 'line-through' : 'none' }}>{stop.name}</p>
                      {stop.note && <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>{stop.note}</p>}
                      {stop.cost > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-light)', padding: '1px 6px', borderRadius: 20, marginTop: 3, display: 'inline-block' }}>${stop.cost}</span>}
                    </div>
                    <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
                      style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--cream)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}
                      title="Directions"><Icon name="navigate" size={14} color="var(--accent)" /></a>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Photos Tab ────────────────────────────────────────────────────────────────
function PhotosTab({ days, photos, onLightbox, onUploadPhoto }) {
  const fileRefs = useRef({})
  const allPhotos = days.flatMap(d => (photos[d.id] || []).map(url => ({ url, dayId: d.id, dayNumber: d.day_number, color: d.color })))
  const hasAny = allPhotos.length > 0

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '12px 16px 100px' }}>
      {!hasAny && (
        <div style={{ textAlign: 'center', paddingTop: 48 }}>
          <div style={{ marginBottom: 12 }}><Icon name="image" size={40} color="var(--sand-dark)" /></div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>No photos yet</p>
          <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Upload photos from each day to build your trip album</p>
        </div>
      )}
      {days.map(day => {
        const dayPhotos = photos[day.id] || []
        return (
          <div key={day.id} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: day.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{day.day_number}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-light)' }}>
                  {day.trip_date ? new Date(day.trip_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }) : `Day ${day.day_number}`}
                </span>
                {dayPhotos.length > 0 && <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>({dayPhotos.length})</span>}
              </div>
              <button
                onClick={() => fileRefs.current[day.id]?.click()}
                className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', fontSize: 12 }}>
                + Add
              </button>
              <input
                ref={el => fileRefs.current[day.id] = el}
                type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => onUploadPhoto(day.id, e.target.files)}
              />
            </div>
            {dayPhotos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {dayPhotos.map((url, i) => (
                  <div key={i} onClick={() => onLightbox(dayPhotos, i)}
                    style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: 'var(--cream-dark)', cursor: 'pointer', borderTop: `3px solid ${day.color}` }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <div onClick={() => fileRefs.current[day.id]?.click()}
                style={{ border: '1.5px dashed var(--sand)', borderRadius: 10, padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <Icon name="image" size={20} color="var(--sand-dark)" />
                <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Add photos for Day {day.day_number}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Gas Calculator ────────────────────────────────────────────────────────────
function GasCalculator({ days, unitKm, showGasCalc, setShowGasCalc, gasEfficiency, setGasEfficiency, gasPrice, setGasPrice }) {
  const totalDistKm = days.reduce((sum, d) => sum + getDayDistance(d.stops), 0)
  const totalDist = unitKm ? totalDistKm : totalDistKm * 0.621371
  const unit = unitKm ? 'km' : 'mi'

  const eff = parseFloat(gasEfficiency)
  const price = parseFloat(gasPrice)
  let gasCost = null
  if (eff > 0 && price > 0) {
    if (totalDistKm > 0) {
      gasCost = unitKm
        ? (totalDistKm * eff / 100) * price           // L/100km
        : (totalDistKm * 0.621371 / eff) * price      // mpg
    }
  }

  return (
    <div style={{ marginBottom: 12, background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <button onClick={() => setShowGasCalc(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="gas" size={16} color="var(--ink-muted)" />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-light)' }}>Gas Cost Calculator</span>
          {totalDist > 0 && (
            <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>· {totalDist.toFixed(0)} {unit}</span>
          )}
        </div>
        <div style={{ transform: showGasCalc ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <Icon name="chevron_down" size={14} color="var(--sand-dark)" />
        </div>
      </button>

      {showGasCalc && (
        <div className="anim-up" style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {totalDistKm === 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'var(--cream)', padding: '8px 10px', borderRadius: 8 }}>
              Add locations to your stops to enable distance tracking
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: 4 }}>
                {unitKm ? 'Consumption (L/100km)' : 'Fuel economy (mpg)'}
              </label>
              <input className="input" style={{ fontSize: 13 }}
                placeholder={unitKm ? 'e.g. 8.5' : 'e.g. 30'}
                value={gasEfficiency}
                onChange={e => setGasEfficiency(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)', display: 'block', marginBottom: 4 }}>
                {unitKm ? 'Price / liter ($)' : 'Price / gallon ($)'}
              </label>
              <input className="input" style={{ fontSize: 13 }}
                placeholder={unitKm ? 'e.g. 1.80' : 'e.g. 3.50'}
                value={gasPrice}
                onChange={e => setGasPrice(e.target.value)}
                inputMode="decimal"
              />
            </div>
          </div>
          {gasCost !== null ? (
            <div style={{ padding: '10px 14px', background: 'var(--accent-pale)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="gas" size={22} color="var(--accent)" />
              <div>
                <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Estimated fuel cost</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>${gasCost.toFixed(2)}</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{totalDist.toFixed(0)} {unit}</p>
                <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{unitKm ? `${eff} L/100km` : `${eff} mpg`}</p>
              </div>
            </div>
          ) : (eff > 0 || price > 0) ? (
            <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Fill in both fields to calculate</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

// ── TripStats ─────────────────────────────────────────────────────────────────
function TripStatsCard({ days, unitKm }) {
  const allStops = days.flatMap(d => d.stops)
  const total = allStops.length
  const done = allStops.filter(s => s.done).length
  const budget = allStops.reduce((s, st) => s + (st.cost || 0), 0)
  const cities = [...new Set(days.map(d => d.city).filter(Boolean))]
  const avgPerDay = days.length > 0 ? budget / days.length : 0
  const topStop = allStops.reduce((max, s) => (s.cost || 0) > (max?.cost || 0) ? s : max, null)

  // Total trip distance in km across all days
  const totalDistKm = days.reduce((sum, d) => sum + getDayDistance(d.stops), 0)
  const totalDist = unitKm ? totalDistKm : totalDistKm * 0.621371
  const unit = unitKm ? 'km' : 'mi'

  return (
    <div style={{ marginBottom: 12, padding: '14px 14px 10px', background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon name="bar_chart" size={15} color="var(--accent)" />
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-light)' }}>Trip Stats</span>
      </div>
      <div className="stats-grid">
        <div className="stat-cell">
          <div className="stat-value">{days.length}</div>
          <div className="stat-label">Days</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Stops</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{total > 0 ? Math.round((done / total) * 100) : 0}%</div>
          <div className="stat-label">Done</div>
        </div>
        {budget > 0 && <>
          <div className="stat-cell">
            <div className="stat-value" style={{ fontSize: 16 }}>${budget.toFixed(0)}</div>
            <div className="stat-label">Total Budget</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value" style={{ fontSize: 16 }}>${avgPerDay.toFixed(0)}</div>
            <div className="stat-label">Avg/Day</div>
          </div>
        </>}
        <div className="stat-cell">
          <div className="stat-value">{cities.length}</div>
          <div className="stat-label">Cities</div>
        </div>
        {totalDist > 0 && (
          <div className="stat-cell">
            <div className="stat-value" style={{ fontSize: 15 }}>{totalDist.toFixed(0)}</div>
            <div className="stat-label">Total {unit}</div>
          </div>
        )}
      </div>
      {topStop?.cost > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-muted)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <Icon name="dollar" size={11} color="var(--ink-muted)" />
          Priciest: <strong>{topStop.name}</strong> · ${topStop.cost}
        </div>
      )}

    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
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
  const [loadError, setLoadError] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState('')

  const [tab, setTab] = useState('map')
  const [tabDir, setTabDir] = useState('left')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)
  const [detailDay, setDetailDay] = useState(null)    // full-screen day detail view
  const [daysSubTab, setDaysSubTab] = useState('route') // 'route' | 'stats' | 'gas'
  const [openDaySheet, setOpenDaySheet] = useState(null)
  const [showNewDay, setShowNewDay] = useState(false)
  const [showNewStop, setShowNewStop] = useState(false)
  const [addStopForDay, setAddStopForDay] = useState(null)
  const [showCollabSheet, setShowCollabSheet] = useState(false)
  const [showEditTrip, setShowEditTrip] = useState(false)
  const [editingStop, setEditingStop] = useState(null)
  const [editingDay, setEditingDay] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedView, setCopiedView] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const [lightbox, setLightbox] = useState(null)   // { photos: [], idx: 0 }
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [syncFlash, setSyncFlash] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [togglingStopId, setTogglingStopId] = useState(null)
  const [unitKm, setUnitKm] = useState(() => localStorage.getItem('unit') !== 'miles')
  const [showGasCalc, setShowGasCalc] = useState(false)
  const [gasEfficiency, setGasEfficiency] = useState('')   // mpg or L/100km
  const [gasPrice, setGasPrice] = useState('')              // per gallon or per liter

  const TABS = ['map', 'days', 'photos', 'pack']

  useEffect(() => { fetchAll() }, [id])

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`trip-rt-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stops' }, (payload) => {
        const stop = payload.new
        setDays(prev => {
          const day = prev.find(d => d.id === stop.day_id)
          if (!day || day.stops.find(s => s.id === stop.id)) return prev
          return prev.map(d => d.id === stop.day_id
            ? { ...d, stops: [...d.stops, stop].sort((a, b) => a.sort_order - b.sort_order) }
            : d)
        })
        setSyncFlash(true); setTimeout(() => setSyncFlash(false), 2000)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stops' }, (payload) => {
        const stop = payload.new
        setDays(prev => {
          const sourceDay = prev.find(d => d.stops.find(s => s.id === stop.id))
          if (!sourceDay) return prev
          if (stop.day_id !== sourceDay.id) {
            return prev.map(d => {
              if (d.id === sourceDay.id) return { ...d, stops: d.stops.filter(s => s.id !== stop.id) }
              if (d.id === stop.day_id) return { ...d, stops: [...d.stops, stop].sort((a, b) => a.sort_order - b.sort_order) }
              return d
            })
          }
          return prev.map(d => ({ ...d, stops: d.stops.map(s => s.id === stop.id ? { ...s, ...stop } : s) }))
        })
        setSyncFlash(true); setTimeout(() => setSyncFlash(false), 2000)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'stops' }, (payload) => {
        setDays(prev => prev.map(d => ({ ...d, stops: d.stops.filter(s => s.id !== payload.old.id) })))
        setSyncFlash(true); setTimeout(() => setSyncFlash(false), 2000)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trip_days', filter: `trip_id=eq.${id}` }, (payload) => {
        setDays(prev => {
          if (prev.find(d => d.id === payload.new.id)) return prev
          return [...prev, { ...payload.new, stops: [] }].sort((a, b) => a.day_number - b.day_number)
        })
        setSyncFlash(true); setTimeout(() => setSyncFlash(false), 2000)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trip_days', filter: `trip_id=eq.${id}` }, (payload) => {
        setDays(prev => prev.map(d => d.id === payload.new.id ? { ...d, ...payload.new } : d))
        setSyncFlash(true); setTimeout(() => setSyncFlash(false), 2000)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'trip_days', filter: `trip_id=eq.${id}` }, (payload) => {
        setDays(prev => prev.filter(d => d.id !== payload.old.id))
        setSyncFlash(true); setTimeout(() => setSyncFlash(false), 2000)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const [tripRes, daysRes, membersRes] = await Promise.all([
        supabase.from('trips').select('*').eq('id', id).single(),
        supabase.from('trip_days').select('*, stops(*)').eq('trip_id', id).order('day_number'),
        supabase.from('trip_members').select('*, profiles(*)').eq('trip_id', id),
      ])
      if (tripRes.error) { navigate('/'); return }
      // Permission check — user must be a member of this trip
      const members = membersRes.data || []
      const isMember = members.some(m => m.user_id === user.id)
      if (!isMember) { setAccessDenied(true); setLoading(false); return }
      setTrip(tripRes.data)
      const daysData = (daysRes.data || []).map(d => ({
        ...d,
        stops: (d.stops || []).sort((a, b) => a.sort_order - b.sort_order),
      }))
      setDays(daysData)
      setCollaborators(members)

      const photoMap = {}
      await Promise.all(daysData.map(async (day) => {
        try {
          const { data: ph } = await supabase.from('trip_photos').select('*').eq('day_id', day.id).order('created_at')
          if (ph?.length) {
            photoMap[day.id] = ph.map(p => supabase.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl)
          }
        } catch { /* photo load failure is non-fatal */ }
      }))
      setPhotos(photoMap)
    } catch {
      setLoadError(true)
    }
    setLoading(false)
  }

  // ── Countdown ──────────────────────────────────────────────────────────────
  const countdown = useMemo(() => {
    if (!trip?.date_start) return null
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const start = new Date(trip.date_start); start.setHours(0, 0, 0, 0)
    const diff = Math.round((start - today) / (1000 * 60 * 60 * 24))
    if (diff < 0) return null
    if (diff === 0) return 'Trip starts today!'
    return `${diff} day${diff !== 1 ? 's' : ''} to go`
  }, [trip])

  // ── Days with colors ───────────────────────────────────────────────────────
  const daysWithColors = useMemo(() =>
    days.map((d, i) => ({ ...d, color: DAY_COLORS[i % DAY_COLORS.length] }))
  , [days])

  // ── Filtered days (search) ─────────────────────────────────────────────────
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) return daysWithColors
    const q = searchQuery.toLowerCase()
    return daysWithColors.map(day => {
      const filteredStops = day.stops.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.note?.toLowerCase().includes(q) ||
        s.type?.toLowerCase().includes(q)
      )
      if (filteredStops.length === 0) return null
      return { ...day, stops: filteredStops }
    }).filter(Boolean)
  }, [daysWithColors, searchQuery])

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
    if (dy > 40) return
    const curIdx = TABS.indexOf(tab)
    if (dx < -60 && curIdx < TABS.length - 1) changeTab(TABS[curIdx + 1])
    else if (dx > 60 && curIdx > 0) changeTab(TABS[curIdx - 1])
  }

  const allStops = days.flatMap(d => d.stops)
  const mapDays = useMemo(() => {
    const colored = daysWithColors.map(d => ({
      ...d,
      stops: d.stops.filter(s => s.lat && s.lng)
    }))
    if (selectedDay) return colored.filter(d => d.id === selectedDay.id)
    return colored
  }, [daysWithColors, selectedDay])
  const totalBudget = allStops.reduce((sum, s) => sum + (s.cost || 0), 0)
  const doneCount = allStops.filter(s => s.done).length
  const totalCount = allStops.length

  const toggleDone = async (stop) => {
    if (togglingStopId === stop.id) return   // prevent double-tap
    setTogglingStopId(stop.id)
    const newDone = !stop.done
    await supabase.from('stops').update({ done: newDone }).eq('id', stop.id)
    setDays(prev => {
      const updated = prev.map(d => ({
        ...d,
        stops: d.stops.map(s => s.id === stop.id ? { ...s, done: newDone } : s),
      }))
      if (newDone) {
        const day = updated.find(d => d.stops.some(s => s.id === stop.id))
        if (day && day.stops.length > 0 && day.stops.every(s => s.done)) {
          setTimeout(() => setShowConfetti(true), 150)
        }
      }
      return updated
    })
    setTogglingStopId(null)
  }

  const handleReorderStops = async (dayId, newStops) => {
    setDays(prev => prev.map(d => d.id === dayId ? { ...d, stops: newStops } : d))
    try {
      await Promise.all(newStops.map((s, i) => supabase.from('stops').update({ sort_order: i }).eq('id', s.id)))
    } catch {
      // revert on failure
      setDays(prev => prev.map(d => d.id === dayId ? { ...d, stops: d.stops } : d))
    }
  }

  const handleOptimizeRoute = async (dayId) => {
    const day = days.find(d => d.id === dayId)
    if (!day) return
    const optimized = optimizeRoute(day.stops)
    await handleReorderStops(dayId, optimized)
  }

  const handleUploadPhoto = async (dayId, files) => {
    setPhotoUploadError('')
    let failed = 0
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${id}/${dayId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('trip-photos').upload(path, file)
      if (upErr) { failed++; continue }
      await supabase.from('trip_photos').insert({ day_id: dayId, uploaded_by: user.id, storage_path: path })
      const url = supabase.storage.from('trip-photos').getPublicUrl(path).data.publicUrl
      setPhotos(prev => ({ ...prev, [dayId]: [...(prev[dayId] || []), url] }))
    }
    if (failed > 0) setPhotoUploadError(`${failed} photo${failed > 1 ? 's' : ''} failed to upload`)
  }

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/join/${trip?.invite_token}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2200)
  }

  const handleCopyViewLink = () => {
    const url = `${window.location.origin}/view/${trip?.view_token}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopiedView(true); setTimeout(() => setCopiedView(false), 2200)
  }

  const handleExportPDF = () => setShowPdfPreview(true)

  const handleExportIcal = () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Triplan//Trip//EN', 'CALSCALE:GREGORIAN']
    for (const day of days) {
      if (!day.trip_date) continue
      for (const stop of day.stops) {
        const dateStr = day.trip_date.replace(/-/g, '')
        const time = stop.time_slot ? stop.time_slot.replace(':', '') + '00' : '090000'
        lines.push('BEGIN:VEVENT')
        lines.push(`UID:${stop.id}@triplan`)
        lines.push(`DTSTART:${dateStr}T${time}`)
        lines.push(`DTEND:${dateStr}T${time}`)
        lines.push(`SUMMARY:${stop.name.replace(/[,;\\]/g, m => '\\' + m)}`)
        if (stop.note) lines.push(`DESCRIPTION:${stop.note.replace(/[,;\\]/g, m => '\\' + m)}`)
        if (stop.lat && stop.lng) lines.push(`GEO:${stop.lat};${stop.lng}`)
        lines.push('END:VEVENT')
      }
    }
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${trip?.name || 'trip'}.ics`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleStopUpdated = (updated) => {
    setDays(prev => prev.map(d => ({ ...d, stops: d.stops.map(s => s.id === updated.id ? updated : s) })))
    setEditingStop(null)
  }

  const handleStopDeleted = (stopId) => {
    setDays(prev => prev.map(d => ({ ...d, stops: d.stops.filter(s => s.id !== stopId) })))
    setEditingStop(null)
  }

  const handleStopMoved = (stopId, fromDayId, toDayId) => {
    setDays(prev => {
      const stop = prev.find(d => d.id === fromDayId)?.stops.find(s => s.id === stopId)
      if (!stop) return prev
      return prev.map(d => {
        if (d.id === fromDayId) return { ...d, stops: d.stops.filter(s => s.id !== stopId) }
        if (d.id === toDayId) return { ...d, stops: [...d.stops, { ...stop, day_id: toDayId }] }
        return d
      })
    })
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

  const handleTripUpdated = (updated) => { setTrip(updated); setShowEditTrip(false) }
  const handleTripDeleted = () => { navigate('/') }

  const toggleUnit = () => {
    const next = !unitKm
    setUnitKm(next)
    localStorage.setItem('unit', next ? 'km' : 'miles')
  }

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: 'calc(var(--safe-top) + 12px) 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton-text" style={{ width: '50%' }} />
            <div className="skeleton-text" style={{ width: '30%', height: 11 }} />
          </div>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ flex: 1, height: 40, borderRadius: 0 }} />)}
        </div>
      </div>
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1,2].map(i => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div className="skeleton-circle" style={{ width: 40, height: 40 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                <div className="skeleton-text" style={{ width: '55%', animationDelay: `${i * 0.1}s` }} />
                <div className="skeleton-text" style={{ width: '35%', height: 11, animationDelay: `${i * 0.15}s` }} />
              </div>
            </div>
            {[1,2,3].map(j => (
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

  if (accessDenied) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={28} color="var(--accent)" />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, textAlign: 'center' }}>Access denied</p>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center' }}>You're not a member of this trip. Ask the organiser for an invite link.</p>
      <button className="btn btn-accent" onClick={() => navigate('/')}>Back to my trips</button>
    </div>
  )

  if (loadError) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <Icon name="close" size={40} color="var(--sand-dark)" />
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Couldn't load trip</p>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center' }}>Check your connection and try again</p>
      <button className="btn btn-accent" onClick={() => fetchAll()}>Retry</button>
      <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to trips</button>
    </div>
  )

  const theme = THEMES[trip?.color_theme] || THEMES.terracotta
  const themeVars = getThemeVars(trip?.color_theme)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...themeVars }}>

      {/* ── Print view ── */}
      {!showPdfPreview && (
      <div className="print-only" style={{ padding: 32 }}>
        <BeautifulPrintView trip={trip} days={days} themeColor={theme.accent} />
      </div>
      )}

      {/* ── Top bar ── */}
      <div className="no-print" style={{ flexShrink: 0, background: 'var(--white)', borderBottom: '1px solid var(--border)', paddingTop: 'calc(var(--safe-top) + 12px)' }}>
        {trip.cover_photo_url && (
          <div style={{ height: 80, overflow: 'hidden', position: 'relative' }}>
            <img src={trip.cover_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))' }} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 10px', marginTop: 12 }}>
          <button onClick={() => navigate('/')} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="chevron_left" size={18} color="var(--ink)" />
          </button>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trip.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {trip.date_start && (
                <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                  {new Date(trip.date_start).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  {trip.date_end ? ` – ${new Date(trip.date_end).toLocaleDateString('en', { month: 'short', day: 'numeric' })}` : ''}
                </p>
              )}
              <span style={{ fontSize: 10, color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 100, background: 'var(--teal-light)', border: '1px solid rgba(45,107,107,0.2)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: syncFlash ? 'var(--accent)' : 'var(--teal)', transition: 'background 0.3s' }} />
                {syncFlash ? 'Syncing' : 'Live'}
              </span>
            </div>
            {countdown && <span className="countdown-badge" style={{ marginTop: 3, display: 'inline-block' }}>{countdown}</span>}
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
            { id: 'map',    label: 'Map',    icon: 'map' },
            { id: 'days',   label: 'Days',   icon: 'calendar' },
            { id: 'photos', label: 'Photos', icon: 'image' },
            { id: 'pack',   label: 'Pack',   icon: 'package' },
          ].map(t => (
            <button key={t.id} onClick={() => changeTab(t.id)}
              style={{ flex: 1, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--accent)' : 'var(--ink-muted)', borderBottom: `2.5px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, background: 'none', cursor: 'pointer', transition: 'color 0.15s' }}>
              <Icon name={t.icon} size={14} color={tab === t.id ? 'var(--accent)' : 'var(--ink-muted)'} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map view ── */}
      {tab === 'map' && (
        <div className={`no-print ${tabDir === 'left' ? 'tab-content' : 'tab-content-back'}`}
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <TripMap days={mapDays} onSelect={() => {}} />
          {daysWithColors.length > 0 && (
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, zIndex: 10, overflowX: 'auto', display: 'flex', gap: 8, padding: '0 16px' }}
              className="scroll-y" onScroll={e => e.stopPropagation()}>
              <button onClick={() => setSelectedDay(null)}
                style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: !selectedDay ? 'var(--ink)' : 'var(--white)', color: !selectedDay ? 'var(--cream)' : 'var(--ink-light)', border: !selectedDay ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s' }}>
                All days
              </button>
              {daysWithColors.map(d => (
                <button key={d.id} onClick={() => setSelectedDay(selectedDay?.id === d.id ? null : d)}
                  style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, flexShrink: 0, cursor: 'pointer', background: selectedDay?.id === d.id ? d.color : 'var(--white)', color: selectedDay?.id === d.id ? 'white' : 'var(--ink-light)', border: selectedDay?.id === d.id ? 'none' : `2px solid ${d.color}30`, boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: selectedDay?.id === d.id ? 'white' : d.color, marginRight: 5 }} />
                  Day {d.day_number}
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
        <div className={`no-print ${tabDir === 'left' ? 'tab-content' : 'tab-content-back'}`}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

          {/* Sub-tab bar: Route | Stats | Gas */}
          <div style={{ display: 'flex', background: 'var(--white)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {[
              { id: 'route', label: 'Route',   icon: 'map' },
              { id: 'stats', label: 'Stats',   icon: 'bar_chart' },
              { id: 'gas',   label: 'Gas',     icon: 'gas' },
            ].map(st => (
              <button key={st.id} onClick={() => setDaysSubTab(st.id)}
                style={{ flex: 1, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, fontWeight: daysSubTab === st.id ? 600 : 400, color: daysSubTab === st.id ? 'var(--accent)' : 'var(--ink-muted)', borderBottom: `2px solid ${daysSubTab === st.id ? 'var(--accent)' : 'transparent'}`, background: 'none', cursor: 'pointer' }}>
                <Icon name={st.icon} size={13} color={daysSubTab === st.id ? 'var(--accent)' : 'var(--ink-muted)'} />
                {st.label}
              </button>
            ))}
          </div>

          {/* Route sub-tab */}
          {daysSubTab === 'route' && (
            <>
              {/* Search + unit toolbar */}
              <div style={{ padding: '8px 14px', background: 'var(--white)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <div className="search-bar-wrap" style={{ flex: 1 }}>
                  <div className="search-icon"><Icon name="search" size={14} color="var(--ink-muted)" /></div>
                  <input className="input" style={{ fontSize: 13, padding: '8px 12px 8px 34px', height: 36 }}
                    placeholder="Search stops…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  {searchQuery && <button className="search-clear" onClick={() => setSearchQuery('')}><Icon name="close" size={10} color="var(--ink-muted)" /></button>}
                </div>
                <button onClick={toggleUnit}
                  style={{ padding: '5px 9px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid var(--border)', background: 'var(--cream)', color: 'var(--ink-muted)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="navigate" size={11} color="var(--ink-muted)" />
                  {unitKm ? 'km' : 'mi'}
                </button>
              </div>

              <div className="scroll-y" style={{ flex: 1, padding: '10px 14px 100px' }}>
                {days.length === 0 ? (
                  <div style={{ textAlign: 'center', paddingTop: 48 }}>
                    <Icon name="map" size={40} color="var(--sand-dark)" />
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6, marginTop: 12 }}>No days yet</p>
                    <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 24 }}>Add your first day to start planning</p>
                    <button className="btn btn-accent" onClick={() => setShowNewDay(true)}>
                      <Icon name="plus" size={15} color="white" /> Add first day
                    </button>
                  </div>
                ) : filteredDays.length === 0 && searchQuery ? (
                  <div style={{ textAlign: 'center', paddingTop: 32 }}>
                    <Icon name="search" size={32} color="var(--sand-dark)" />
                    <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginTop: 12 }}>No results for "<strong>{searchQuery}</strong>"</p>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setSearchQuery('')}>Clear</button>
                  </div>
                ) : (
                  <>
                    {filteredDays.map(day => (
                      <DayCard key={day.id} day={day} dayColor={day.color} unitKm={unitKm}
                        onOpen={() => setDetailDay(day)} />
                    ))}
                    <button className="btn btn-ghost" style={{ width: '100%', marginTop: 6 }} onClick={() => setShowNewDay(true)}>
                      <Icon name="plus" size={15} color="var(--ink-light)" /> Add day
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Stats sub-tab */}
          {daysSubTab === 'stats' && (
            <div className="scroll-y" style={{ flex: 1, padding: '14px 14px 100px' }}>
              {days.length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', textAlign: 'center', paddingTop: 40, fontSize: 14 }}>Add days to see stats</p>
              ) : (
                <>
                  {totalBudget > 0 && (
                    <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--teal-light)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(45,107,107,0.2)' }}>
                      <Icon name="wallet" size={18} color="var(--teal)" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>Total budget</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-display)' }}>${totalBudget.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  <TripStatsCard days={days} unitKm={unitKm} />
                  {trip.booking_links?.length > 0 && (
                    <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-muted)', marginBottom: 10 }}>Bookings</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {trip.booking_links.map((bl, i) => {
                          const bm = BOOKING_TYPE_META[bl.type] || BOOKING_TYPE_META.other
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon name={bm.icon} size={14} color="var(--accent)" />
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bl.label}</p>
                                {bl.ref && <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Ref: {bl.ref}</p>}
                              </div>
                              {bl.url && <a href={bl.url} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="external_link" size={13} color="var(--accent)" /></a>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Gas sub-tab */}
          {daysSubTab === 'gas' && (
            <div className="scroll-y" style={{ flex: 1, padding: '14px 14px 100px' }}>
              <GasCalculator
                days={days} unitKm={unitKm}
                showGasCalc={showGasCalc} setShowGasCalc={setShowGasCalc}
                gasEfficiency={gasEfficiency} setGasEfficiency={setGasEfficiency}
                gasPrice={gasPrice} setGasPrice={setGasPrice}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Day detail view (slides over everything) ── */}
      {detailDay && (() => {
        const currentDay = daysWithColors.find(d => d.id === detailDay.id) || detailDay
        return (
          <DayDetailView
            day={currentDay}
            dayColor={currentDay.color}
            unitKm={unitKm}
            onBack={() => setDetailDay(null)}
            onToggleStop={toggleDone}
            togglingStopId={togglingStopId}
            onAddStop={() => { setAddStopForDay(currentDay); setShowNewStop(true) }}
            onOpenSheet={() => setOpenDaySheet(currentDay)}
            onEditStop={(stop) => setEditingStop(stop)}
            onEditDay={() => setEditingDay(currentDay)}
            onReorderStops={(newStops) => handleReorderStops(currentDay.id, newStops)}
            onOptimize={() => handleOptimizeRoute(currentDay.id)}
          />
        )
      })()}

      {/* ── Photos view ── */}
      {tab === 'photos' && (
        <>
          {photoUploadError && (
            <div style={{ margin: '8px 16px 0', padding: '10px 14px', background: '#FEE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#C00' }}>{photoUploadError}</span>
              <button onClick={() => setPhotoUploadError('')} style={{ color: '#C00', cursor: 'pointer', lineHeight: 1 }}><Icon name="close" size={14} color="#C00" /></button>
            </div>
          )}
          <PhotosTab
            days={daysWithColors}
            photos={photos}
            onLightbox={(p, i) => setLightbox({ photos: p, idx: i })}
            onUploadPhoto={handleUploadPhoto}
          />
        </>
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

            {/* Invite link */}
            <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Icon name="edit" size={13} color="var(--ink)" />
                <p style={{ fontSize: 13, fontWeight: 500 }}>Invite to edit</p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 12, lineHeight: 1.5 }}>Anyone with this link can view and edit the trip.</p>
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

            {/* Read-only link */}
            <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Icon name="eye" size={13} color="var(--ink)" />
                <p style={{ fontSize: 13, fontWeight: 500 }}>Read-only share link</p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 12, lineHeight: 1.5 }}>Share a view-only version — no login required.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {window.location.origin}/view/{trip.view_token}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleCopyViewLink} style={{ flexShrink: 0 }}>
                  <Icon name={copiedView ? 'check' : 'share'} size={14} color={copiedView ? 'var(--teal)' : 'var(--ink-muted)'} />
                  {copiedView ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Export actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { handleExportIcal(); setShowCollabSheet(false) }}>
                <Icon name="ical" size={14} color="var(--ink-muted)" /> Export iCal
              </button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { handleExportPDF(); setShowCollabSheet(false) }}>
                <Icon name="download" size={14} color="var(--ink-muted)" /> Export PDF
              </button>
            </div>

            {/* Members */}
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
            {openDaySheet.journal && <InfoBox icon="edit" color="var(--ink-muted)" label="Journal" text={openDaySheet.journal} />}
          </div>
        </BottomSheet>
      )}

      {showNewDay && (
        <NewDayModal
          tripId={id}
          nextDayNumber={days.length + 1}
          tripDateStart={trip?.date_start || ''}
          tripDateEnd={trip?.date_end || ''}
          onClose={() => setShowNewDay(false)}
          onCreated={(day) => {
            setShowNewDay(false)
            setDays(prev => {
              if (prev.find(d => d.id === day.id)) return prev  // realtime may have already added it
              return [...prev, { ...day, stops: day.stops || [] }].sort((a, b) => a.day_number - b.day_number)
            })
          }}
        />
      )}

      {showNewStop && addStopForDay && (
        <NewStopModal dayId={addStopForDay.id}
          nextOrder={(days.find(d => d.id === addStopForDay.id)?.stops.length || 0)}
          onClose={() => { setShowNewStop(false); setAddStopForDay(null) }}
          onCreated={(stop) => {
            setShowNewStop(false); setAddStopForDay(null)
            setDays(prev => prev.map(d => {
              if (d.id !== stop.day_id) return d
              if (d.stops.find(s => s.id === stop.id)) return d  // realtime may have already added it
              return { ...d, stops: [...d.stops, stop].sort((a, b) => a.sort_order - b.sort_order) }
            }))
          }}
        />
      )}

      {editingStop && (
        <EditStopModal
          stop={editingStop}
          days={days}
          onClose={() => setEditingStop(null)}
          onUpdated={handleStopUpdated}
          onDeleted={handleStopDeleted}
          onMoved={handleStopMoved}
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

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.idx} onClose={() => setLightbox(null)} />
      )}

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {showPdfPreview && (
        <div className="pdf-preview-overlay no-print">
          <div className="pdf-preview-toolbar">
            <button onClick={() => setShowPdfPreview(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontSize: 14, color: 'var(--ink-light)' }}>
              <Icon name="chevron_left" size={16} color="var(--ink-muted)" /> Back
            </button>
            <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 16, textAlign: 'center' }}>PDF Preview</span>
            <button onClick={() => window.print()} className="btn btn-accent btn-sm">
              <Icon name="download" size={14} color="white" /> Save as PDF
            </button>
          </div>
          <div className="pdf-preview-content">
            <BeautifulPrintView trip={trip} days={days} themeColor={theme.accent} />
          </div>
        </div>
      )}

      {showPdfPreview && (
        <div className="print-only pdf-print-content">
          <BeautifulPrintView trip={trip} days={days} themeColor={theme.accent} />
        </div>
      )}
    </div>
  )
}

// ── DayCard ───────────────────────────────────────────────────────────────────
// ── Compact day row (Route list) ─────────────────────────────────────────────
function DayCard({ day, dayColor, unitKm = true, onOpen }) {
  const doneCount = day.stops.filter(s => s.done).length
  const dayBudget = day.stops.reduce((sum, s) => sum + (s.cost || 0), 0)
  const dayDistKm = getDayDistance(day.stops)
  const dayDist = unitKm ? dayDistKm : dayDistKm * 0.621371
  const color = dayColor || 'var(--accent)'
  const dateLabel = day.trip_date
    ? new Date(day.trip_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
    : `Day ${day.day_number}`

  return (
    <button onClick={onOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 7, borderLeft: `4px solid ${color}`, cursor: 'pointer', textAlign: 'left' }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DAY</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1 }}>{day.day_number}</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{dateLabel}</p>
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>
          {day.stops.length > 0 ? `${doneCount}/${day.stops.length} stops` : 'No stops yet'}
          {dayBudget > 0 && ` · $${dayBudget.toFixed(0)}`}
          {dayDist > 0.1 && ` · ${dayDist.toFixed(1)} ${unitKm ? 'km' : 'mi'}`}
        </p>
      </div>
      {day.stops.length > 0 && (
        <div style={{ width: 32, height: 3, background: 'var(--cream-dark)', borderRadius: 2, flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${(doneCount / day.stops.length) * 100}%`, background: color, borderRadius: 2 }} />
        </div>
      )}
      <Icon name="chevron_right" size={14} color="var(--sand-dark)" />
    </button>
  )
}

// ── Stop list shared between DayDetailView and other views ────────────────────
function StopsList({ stops, color, onToggleStop, togglingStopId, onEditStop, onReorderStops }) {
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  const handleDragStart = (e, idx) => { setDraggedIdx(idx); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver = (e, idx) => { e.preventDefault(); if (idx !== dragOverIdx) setDragOverIdx(idx) }
  const handleDrop = (e, idx) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === idx) { setDraggedIdx(null); setDragOverIdx(null); return }
    const newStops = [...stops]
    const [moved] = newStops.splice(draggedIdx, 1)
    newStops.splice(idx, 0, moved)
    onReorderStops(newStops.map((s, i) => ({ ...s, sort_order: i })))
    setDraggedIdx(null); setDragOverIdx(null)
  }
  const handleDragEnd = () => { setDraggedIdx(null); setDragOverIdx(null) }

  return (
    <div>
      {stops.map((stop, i) => {
        const meta = TYPE_META[stop.type] || TYPE_META.attraction
        const gmapsUrl = stop.lat && stop.lng
          ? `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name)}`
        return (
          <div key={stop.id} draggable
            onDragStart={e => handleDragStart(e, i)}
            onDragOver={e => handleDragOver(e, i)}
            onDrop={e => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            style={{ display: 'flex', gap: 8, paddingBottom: i < stops.length - 1 ? 14 : 0, position: 'relative', opacity: draggedIdx === i ? 0.4 : 1, borderTop: dragOverIdx === i && draggedIdx !== i ? `2px solid ${color}` : '2px solid transparent', transition: 'opacity 0.15s, border-color 0.1s' }}>
            {i < stops.length - 1 && (
              <div style={{ position: 'absolute', left: 22, top: 30, bottom: 0, width: 1, background: 'var(--border)' }} />
            )}
            <div className="drag-handle" style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 6 }}>
              <Icon name="drag" size={14} color="var(--sand-dark)" />
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: stop.done ? 'var(--cream-dark)' : `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
              <Icon name={meta.icon} size={13} color={stop.done ? 'var(--sand-dark)' : color} />
            </div>
            <div style={{ flex: 1, paddingTop: 3 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: stop.done ? 'var(--ink-muted)' : 'var(--ink)', textDecoration: stop.done ? 'line-through' : 'none', lineHeight: 1.3 }}>{stop.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                    {(stop.time_slot || stop.note) && (
                      <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{[stop.time_slot, stop.note].filter(Boolean).join(' · ')}</p>
                    )}
                    {stop.cost > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-light)', padding: '1px 6px', borderRadius: 20 }}>${stop.cost}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                    <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1px solid var(--border)', background: 'var(--cream)', color: 'var(--ink-muted)', textDecoration: 'none' }}>
                      <Icon name="navigate" size={10} color="var(--ink-muted)" /> Directions
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                  <button onClick={() => onEditStop(stop)}
                    style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                    <Icon name="edit" size={11} color="var(--ink-muted)" />
                  </button>
                  <button onClick={() => onToggleStop(stop)}
                    disabled={togglingStopId === stop.id}
                    style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${stop.done ? 'var(--teal)' : 'var(--border-strong)'}`, background: stop.done ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: togglingStopId === stop.id ? 'default' : 'pointer', marginTop: 2, transition: 'all 0.15s', opacity: togglingStopId === stop.id ? 0.5 : 1 }}>
                    {stop.done && <Icon name="check" size={12} color="white" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Day detail full-screen view ────────────────────────────────────────────────
function DayDetailView({ day, dayColor, unitKm, onBack, onToggleStop, togglingStopId, onAddStop, onOpenSheet, onEditStop, onEditDay, onReorderStops, onOptimize }) {
  const color = dayColor || 'var(--accent)'
  const doneCount = day.stops.filter(s => s.done).length
  const dayBudget = day.stops.reduce((sum, s) => sum + (s.cost || 0), 0)
  const dayDistKm = getDayDistance(day.stops)
  const dayDist = unitKm ? dayDistKm : dayDistKm * 0.621371
  const dateLabel = day.trip_date
    ? new Date(day.trip_date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
    : `Day ${day.day_number}`

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--cream)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', flexShrink: 0, paddingTop: 'var(--safe-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
          <button onClick={onBack}
            style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="chevron_left" size={18} color="var(--ink)" />
          </button>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>DAY</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1 }}>{day.day_number}</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dateLabel}</p>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              {doneCount}/{day.stops.length} done
              {dayBudget > 0 && ` · $${dayBudget.toFixed(0)}`}
              {dayDist > 0.1 && ` · ${dayDist.toFixed(1)} ${unitKm ? 'km' : 'mi'}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {day.stops.filter(s => s.lat && s.lng).length >= 2 && (
              <button onClick={onOptimize} title="Optimize route"
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="navigate" size={13} color="var(--ink-muted)" />
              </button>
            )}
            {(day.physical_note || day.logistics_note || day.journal) && (
              <button onClick={onOpenSheet}
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="info" size={13} color="var(--ink-muted)" />
              </button>
            )}
            <button onClick={onEditDay}
              style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="edit" size={13} color="var(--ink-muted)" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        {day.stops.length > 0 && (
          <div style={{ height: 3, background: 'var(--cream-dark)', margin: '0 14px 0' }}>
            <div style={{ height: '100%', width: `${(doneCount / day.stops.length) * 100}%`, background: color, transition: 'width 0.3s' }} />
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="scroll-y" style={{ flex: 1, padding: '14px 14px 100px' }}>
        {day.stops.length > 0 ? (
          <StopsList
            stops={day.stops}
            color={color}
            onToggleStop={onToggleStop}
            togglingStopId={togglingStopId}
            onEditStop={onEditStop}
            onReorderStops={onReorderStops}
          />
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 32, color: 'var(--ink-muted)' }}>
            <Icon name="map" size={36} color="var(--sand-dark)" />
            <p style={{ marginTop: 10, fontSize: 14 }}>No stops yet</p>
          </div>
        )}

        {/* Add stop */}
        <button onClick={onAddStop}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 0', fontSize: 13, color: color, fontWeight: 500, cursor: 'pointer', background: 'none', borderTop: day.stops.length > 0 ? '1px dashed var(--sand)' : 'none', marginTop: day.stops.length > 0 ? 14 : 0 }}>
          <Icon name="plus" size={14} color={color} />
          Add stop
        </button>

        {/* Journal */}
        {day.journal && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--cream)', borderRadius: 10, borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Icon name="edit" size={11} color="var(--ink-muted)" />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)' }}>Journal</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.6 }}>{day.journal}</p>
          </div>
        )}
      </div>
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
