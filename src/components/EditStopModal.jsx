import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

const TYPES = [
  { id: 'attraction', label: 'Attraction', emoji: '🏛' },
  { id: 'food', label: 'Food', emoji: '🍽' },
  { id: 'hotel', label: 'Hotel', emoji: '🏨' },
  { id: 'transport', label: 'Transport', emoji: '🚌' },
]

export default function EditStopModal({ stop, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    name: stop.name || '',
    type: stop.type || 'attraction',
    time_slot: stop.time_slot || '',
    note: stop.note || '',
    lat: stop.lat != null ? String(stop.lat) : '',
    lng: stop.lng != null ? String(stop.lng) : '',
    cost: stop.cost != null ? String(stop.cost) : '',
  })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
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
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setPlaceResults(data)
    } catch { setPlaceResults([]) }
    setSearchingPlace(false)
  }

  const handlePlaceInput = (e) => {
    const val = e.target.value
    setPlaceQuery(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => searchPlaces(val), 500)
  }

  const selectPlace = (place) => {
    setForm(f => ({
      ...f,
      lat: parseFloat(place.lat).toFixed(6),
      lng: parseFloat(place.lon).toFixed(6),
    }))
    setPlaceQuery(place.display_name.split(',').slice(0, 2).join(','))
    setPlaceResults([])
  }

  const handleUpdate = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('stops').update({
      name: form.name.trim(),
      type: form.type,
      time_slot: form.time_slot || null,
      note: form.note.trim() || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      cost: form.cost ? parseFloat(form.cost) : null,
    }).eq('id', stop.id).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); onUpdated(data)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await supabase.from('stops').delete().eq('id', stop.id)
    setDeleting(false)
    onDeleted(stop.id)
  }

  return (
    <BottomSheet onClose={onClose} title="Edit stop">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type */}
        <div>
          <label style={lbl}>Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${form.type === t.id ? 'var(--accent)' : 'var(--border)'}`, background: form.type === t.id ? 'var(--accent-pale)' : 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: form.type === t.id ? 'var(--accent)' : 'var(--ink-muted)' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>Name *</label>
          <input className="input" value={form.name} onChange={set('name')} />
        </div>

        {/* Place search */}
        <div>
          <label style={lbl}>Update location</label>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder="Search a new location…" value={placeQuery} onChange={handlePlaceInput} autoComplete="off" />
            {searchingPlace && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-muted)' }}>…</div>}
            {placeResults.length > 0 && (
              <div className="place-results">
                {placeResults.map((p, i) => (
                  <div key={i} className="place-result-item" onClick={() => selectPlace(p)}>
                    <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)' }}>{p.display_name.split(',')[0]}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.display_name.split(',').slice(1, 3).join(',').trim()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {form.lat && form.lng && (
            <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: 5 }}>📍 {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Time</label>
            <input className="input" type="time" value={form.time_slot} onChange={set('time_slot')} />
          </div>
          <div>
            <label style={lbl}>Cost</label>
            <input className="input" placeholder="0.00" value={form.cost} onChange={set('cost')} inputMode="decimal" />
          </div>
        </div>

        <div>
          <label style={lbl}>Note</label>
          <input className="input" placeholder="Notes…" value={form.note} onChange={set('note')} />
        </div>

        {error && <p style={{ fontSize: 13, color: '#C00', padding: '8px 12px', background: '#FEE', borderRadius: 8 }}>{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleUpdate} disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>

        <button
          className={confirmDelete ? 'btn btn-danger' : 'btn btn-ghost'}
          style={{ width: '100%' }}
          onClick={handleDelete}
          disabled={deleting}
        >
          <Icon name="trash" size={14} color={confirmDelete ? '#b91c1c' : 'var(--ink-muted)'} />
          {deleting ? 'Deleting…' : confirmDelete ? 'Tap again to confirm delete' : 'Delete stop'}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
