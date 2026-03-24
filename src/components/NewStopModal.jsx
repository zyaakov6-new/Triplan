import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

const TYPES = [
  { id: 'attraction', label: 'Viewpoint',   icon: 'navigate' },
  { id: 'food',       label: 'Food/Water',  icon: 'food' },
  { id: 'hotel',      label: 'Camp/Lodge',  icon: 'hotel' },
  { id: 'transport',  label: 'Transport',   icon: 'transport' },
  { id: 'waypoint',   label: 'Waypoint',    icon: 'pin' },
]

export default function NewStopModal({ dayId, nextOrder, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', type: 'attraction', time_slot: '', note: '', lat: '', lng: '', cost: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [placeQuery, setPlaceQuery] = useState('')
  const [placeResults, setPlaceResults] = useState([])
  const [searchingPlace, setSearchingPlace] = useState(false)
  const searchTimer = useRef(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const searchPlaces = async (q) => {
    if (!q.trim() || q.trim().length < 3) { setPlaceResults([]); return }
    setSearchingPlace(true)
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`
      )
      const data = await res.json()
      setPlaceResults(data.features || [])
    } catch { setPlaceResults([]) }
    setSearchingPlace(false)
  }

  const handlePlaceInput = (e) => {
    const val = e.target.value
    setPlaceQuery(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => searchPlaces(val), 400)
  }

  const selectPlace = (feature) => {
    const [lon, lat] = feature.geometry.coordinates
    const p = feature.properties
    const label = [p.name, p.city || p.state, p.country].filter(Boolean).join(', ')
    setForm(f => ({
      ...f,
      name: f.name || p.name || label,
      lat: parseFloat(lat).toFixed(6),
      lng: parseFloat(lon).toFixed(6),
    }))
    setPlaceQuery(label)
    setPlaceResults([])
  }

  const handleCreate = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('stops').insert({
      day_id: dayId,
      name: form.name.trim(),
      type: form.type,
      time_slot: form.time_slot || null,
      note: form.note.trim() || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      cost: form.cost ? parseFloat(form.cost) : null,
      sort_order: nextOrder,
    }).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); onCreated(data)
  }

  return (
    <BottomSheet onClose={onClose} title="Add stop">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type selector */}
        <div>
          <label style={lbl}>Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                style={{ padding: '10px 4px', borderRadius: 10, border: `2px solid ${form.type === t.id ? 'var(--accent)' : 'var(--border)'}`, background: form.type === t.id ? 'var(--accent-pale)' : 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.15s' }}>
                <Icon name={t.icon} size={18} color={form.type === t.id ? 'var(--accent)' : 'var(--ink-muted)'} />
                <span style={{ fontSize: 10, fontWeight: 500, color: form.type === t.id ? 'var(--accent)' : 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.2 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>Name *</label>
          <input className="input" placeholder="e.g. Eagle Peak Summit" value={form.name} onChange={set('name')} />
        </div>

        {/* Place search */}
        <div>
          <label style={lbl}>
            <Icon name="search" size={11} color="var(--ink-light)" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Search location
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder="Search a place to auto-fill coordinates…"
              value={placeQuery}
              onChange={handlePlaceInput}
              autoComplete="off"
            />
            {searchingPlace && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-muted)' }}>…</div>
            )}
            {placeResults.length > 0 && (
              <div className="place-results">
                {placeResults.map((feature, i) => {
                  const p = feature.properties
                  const subtitle = [p.city || p.state, p.country].filter(Boolean).join(', ')
                  return (
                    <div key={i} className="place-result-item" onClick={() => selectPlace(feature)}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)', marginBottom: 1 }}>{p.name}</div>
                      {subtitle && <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{subtitle}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {(form.lat && form.lng) && (
            <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: 5 }}>
              {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Time</label>
            <input className="input" type="time" value={form.time_slot} onChange={set('time_slot')} />
          </div>
          <div>
            <label style={lbl}>
              <Icon name="dollar" size={11} color="var(--ink-light)" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
              Cost
            </label>
            <input className="input" placeholder="0.00" value={form.cost} onChange={set('cost')} inputMode="decimal" />
          </div>
        </div>

        <div>
          <label style={lbl}>Note</label>
          <input className="input" placeholder="Pre-booked tickets, reservation name…" value={form.note} onChange={set('note')} />
        </div>

        {error && <p style={{ fontSize: 13, color: '#C00', padding: '8px 12px', background: '#FEE', borderRadius: 8 }}>{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleCreate} disabled={loading}>
          {loading ? 'Adding…' : 'Add stop'} {!loading && <Icon name="arrow_right" size={16} color="white" />}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
