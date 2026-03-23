import { useState, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

function addDays(dateStr, n) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function LocationSearch({ label, value, onChange, onSelect, results, onClearResults }) {
  const timer = useRef(null)

  const handleInput = async (e) => {
    const q = e.target.value
    onChange(q)
    clearTimeout(timer.current)
    if (q.trim().length < 2) { onClearResults(); return }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`)
        const data = await res.json()
        onSelect(null, data.features || [])
      } catch { onClearResults() }
    }, 400)
  }

  return (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          placeholder="Search a location…"
          value={value}
          onChange={handleInput}
          autoComplete="off"
        />
        {results.length > 0 && (
          <div className="place-results">
            {results.map((f, i) => {
              const p = f.properties
              const subtitle = [p.city || p.state, p.country].filter(Boolean).join(', ')
              return (
                <div key={i} className="place-result-item"
                  onClick={() => onSelect(f, [])}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)', marginBottom: 1 }}>{p.name}</div>
                  {subtitle && <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{subtitle}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewDayModal({ tripId, nextDayNumber, tripDateStart, tripDateEnd, onClose, onCreated }) {
  const autoDate = useMemo(() => addDays(tripDateStart, nextDayNumber - 1), [tripDateStart, nextDayNumber])

  const [tripDate, setTripDate] = useState(autoDate)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Start point
  const [startQuery, setStartQuery] = useState('')
  const [startResults, setStartResults] = useState([])
  const [startLat, setStartLat] = useState(null)
  const [startLng, setStartLng] = useState(null)

  // End point
  const [endQuery, setEndQuery] = useState('')
  const [endResults, setEndResults] = useState([])
  const [endLat, setEndLat] = useState(null)
  const [endLng, setEndLng] = useState(null)

  const handleStartSelect = (feature, results) => {
    setStartResults(results)
    if (feature) {
      const [lon, lat] = feature.geometry.coordinates
      const p = feature.properties
      setStartQuery([p.name, p.city || p.state, p.country].filter(Boolean).join(', '))
      setStartLat(parseFloat(lat))
      setStartLng(parseFloat(lon))
      setStartResults([])
    }
  }

  const handleEndSelect = (feature, results) => {
    setEndResults(results)
    if (feature) {
      const [lon, lat] = feature.geometry.coordinates
      const p = feature.properties
      setEndQuery([p.name, p.city || p.state, p.country].filter(Boolean).join(', '))
      setEndLat(parseFloat(lat))
      setEndLng(parseFloat(lon))
      setEndResults([])
    }
  }

  const handleCreate = async () => {
    setLoading(true); setError('')
    const { data: day, error: err } = await supabase.from('trip_days').insert({
      trip_id: tripId,
      day_number: nextDayNumber,
      city: startQuery.trim() || null,   // use start name as city for backward compat
      trip_date: tripDate || null,
    }).select().single()
    if (err) { setError(err.message); setLoading(false); return }

    const insertedStops = []
    if (startQuery.trim()) {
      const { data: s } = await supabase.from('stops').insert({
        day_id: day.id,
        name: startQuery.trim(),
        type: 'waypoint',
        lat: startLat, lng: startLng,
        sort_order: 0,
        note: '🟢 Start',
      }).select().single()
      if (s) insertedStops.push(s)
    }
    if (endQuery.trim()) {
      const { data: s } = await supabase.from('stops').insert({
        day_id: day.id,
        name: endQuery.trim(),
        type: 'waypoint',
        lat: endLat, lng: endLng,
        sort_order: 999,
        note: '🔴 End',
      }).select().single()
      if (s) insertedStops.push(s)
    }

    setLoading(false)
    onCreated({ ...day, stops: insertedStops })
  }

  const dateLabel = tripDate
    ? new Date(tripDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  return (
    <BottomSheet onClose={onClose} title={`Day ${nextDayNumber}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Date */}
        <div>
          <label style={lbl}>Date {dateLabel && <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--accent)', marginLeft: 6 }}>{dateLabel}</span>}</label>
          <input
            className="input"
            type="date"
            value={tripDate}
            min={tripDateStart || undefined}
            max={tripDateEnd || undefined}
            onChange={e => setTripDate(e.target.value)}
          />
        </div>

        {/* Start location */}
        <LocationSearch
          label="🟢 Start point"
          value={startQuery}
          onChange={q => { setStartQuery(q); if (!q) { setStartLat(null); setStartLng(null) } }}
          onSelect={handleStartSelect}
          results={startResults}
          onClearResults={() => setStartResults([])}
        />
        {startLat && <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: -10 }}>📍 {startLat.toFixed(4)}, {startLng.toFixed(4)}</p>}

        {/* End location */}
        <LocationSearch
          label="🔴 End point"
          value={endQuery}
          onChange={q => { setEndQuery(q); if (!q) { setEndLat(null); setEndLng(null) } }}
          onSelect={handleEndSelect}
          results={endResults}
          onClearResults={() => setEndResults([])}
        />
        {endLat && <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: -10 }}>📍 {endLat.toFixed(4)}, {endLng.toFixed(4)}</p>}

        {error && <p style={{ fontSize: 13, color: '#C00', padding: '8px 12px', background: '#FEE', borderRadius: 8 }}>{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleCreate} disabled={loading}>
          {loading ? 'Adding…' : `Add Day ${nextDayNumber}`} {!loading && <Icon name="arrow_right" size={16} color="white" />}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
