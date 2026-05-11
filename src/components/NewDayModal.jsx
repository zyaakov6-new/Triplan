import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import Icon from './Icon'
import { useLocationSearch } from '../hooks/useLocationSearch'

function addDays(dateStr, n) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function NewDayModal({ tripId, nextDayNumber, tripDateStart, tripDateEnd, onClose, onCreated }) {
  const autoDate = useMemo(() => addDays(tripDateStart, nextDayNumber - 1), [tripDateStart, nextDayNumber])

  const [tripDate, setTripDate] = useState(autoDate)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Start point
  const [startLat, setStartLat] = useState(null)
  const [startLng, setStartLng] = useState(null)
  const { query: startQuery, setQuery: setStartQuery, results: startResults,
          searching: searchingStart, searchError: startSearchError,
          handleInput: handleStartInput, clearResults: clearStartResults } = useLocationSearch()

  // End point
  const [endLat, setEndLat]     = useState(null)
  const [endLng, setEndLng]     = useState(null)
  const { query: endQuery, setQuery: setEndQuery, results: endResults,
          searching: searchingEnd, searchError: endSearchError,
          handleInput: handleEndInput, clearResults: clearEndResults } = useLocationSearch()

  const selectStart = (feature) => {
    const [lon, lat] = feature.geometry.coordinates
    const p = feature.properties
    setStartQuery([p.name, p.city || p.state, p.country].filter(Boolean).join(', '))
    setStartLat(parseFloat(lat))
    setStartLng(parseFloat(lon))
    clearStartResults()
  }

  const selectEnd = (feature) => {
    const [lon, lat] = feature.geometry.coordinates
    const p = feature.properties
    setEndQuery([p.name, p.city || p.state, p.country].filter(Boolean).join(', '))
    setEndLat(parseFloat(lat))
    setEndLng(parseFloat(lon))
    clearEndResults()
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
    let stopsFailed = 0

    if (startQuery.trim()) {
      const { data: s, error: sErr } = await supabase.from('stops').insert({
        day_id: day.id, name: startQuery.trim(), type: 'waypoint',
        lat: startLat, lng: startLng, sort_order: 0, note: 'Start point',
      }).select().single()
      if (s) insertedStops.push(s)
      else if (sErr) stopsFailed++
    }
    if (endQuery.trim()) {
      const { data: s, error: sErr } = await supabase.from('stops').insert({
        day_id: day.id, name: endQuery.trim(), type: 'waypoint',
        lat: endLat, lng: endLng, sort_order: 999, note: 'End point',
      }).select().single()
      if (s) insertedStops.push(s)
      else if (sErr) stopsFailed++
    }

    setLoading(false)
    if (stopsFailed > 0) {
      setError(`Day added, but ${stopsFailed} stop${stopsFailed > 1 ? 's' : ''} failed to save. You can add them manually.`)
    }
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
            className="input" type="date" value={tripDate}
            min={tripDateStart || undefined} max={tripDateEnd || undefined}
            onChange={e => setTripDate(e.target.value)}
          />
        </div>

        {/* Start location */}
        <div>
          <label style={lbl}>Start point</label>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder="Search a location…" value={startQuery}
              onChange={e => { handleStartInput(e.target.value); if (!e.target.value) { setStartLat(null); setStartLng(null) } }}
              autoComplete="off" />
            {searchingStart && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-muted)' }}>…</div>}
            {startResults.length > 0 && (
              <div className="place-results">
                {startResults.map((f, i) => {
                  const p = f.properties
                  const sub = [p.city || p.state, p.country].filter(Boolean).join(', ')
                  return (
                    <div key={i} className="place-result-item" onClick={() => selectStart(f)}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)', marginBottom: 1 }}>{p.name}</div>
                      {sub && <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{sub}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {startSearchError && !startResults.length && <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 5 }}>{startSearchError}</p>}
          {startLat && <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: 5 }}>{startLat.toFixed(4)}, {startLng.toFixed(4)}</p>}
        </div>

        {/* End location */}
        <div>
          <label style={lbl}>End point</label>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder="Search a location…" value={endQuery}
              onChange={e => { handleEndInput(e.target.value); if (!e.target.value) { setEndLat(null); setEndLng(null) } }}
              autoComplete="off" />
            {searchingEnd && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-muted)' }}>…</div>}
            {endResults.length > 0 && (
              <div className="place-results">
                {endResults.map((f, i) => {
                  const p = f.properties
                  const sub = [p.city || p.state, p.country].filter(Boolean).join(', ')
                  return (
                    <div key={i} className="place-result-item" onClick={() => selectEnd(f)}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)', marginBottom: 1 }}>{p.name}</div>
                      {sub && <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{sub}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {endSearchError && !endResults.length && <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 5 }}>{endSearchError}</p>}
          {endLat && <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: 5 }}>{endLat.toFixed(4)}, {endLng.toFixed(4)}</p>}
        </div>

        {error && <p className="error-box">{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleCreate} disabled={loading}>
          {loading ? 'Adding…' : `Add Day ${nextDayNumber}`} {!loading && <Icon name="arrow_right" size={16} color="white" />}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
