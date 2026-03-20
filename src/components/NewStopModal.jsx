import { useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

const TYPES = [
  { id: 'attraction', label: 'Attraction', emoji: '🏛' },
  { id: 'food', label: 'Food', emoji: '🍽' },
  { id: 'hotel', label: 'Hotel', emoji: '🏨' },
  { id: 'transport', label: 'Transport', emoji: '🚌' },
]

export default function NewStopModal({ dayId, nextOrder, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', type: 'attraction', time_slot: '', note: '', lat: '', lng: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

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
          <input className="input" placeholder="e.g. Louvre Museum" value={form.name} onChange={set('name')} />
        </div>

        <div>
          <label style={lbl}>Time</label>
          <input className="input" type="time" value={form.time_slot} onChange={set('time_slot')} />
        </div>

        <div>
          <label style={lbl}>Note</label>
          <input className="input" placeholder="Pre-booked tickets, reservation name…" value={form.note} onChange={set('note')} />
        </div>

        <div>
          <label style={lbl}>📍 Coordinates (for map pin)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input className="input" placeholder="Lat e.g. 48.8606" value={form.lat} onChange={set('lat')} inputMode="decimal" />
            <input className="input" placeholder="Lng e.g. 2.3376" value={form.lng} onChange={set('lng')} inputMode="decimal" />
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 5 }}>
            Tip: copy coords from Google Maps (long-press on a location)
          </p>
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
