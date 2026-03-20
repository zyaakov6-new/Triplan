import { useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

export default function NewDayModal({ tripId, nextDayNumber, onClose, onCreated }) {
  const [form, setForm] = useState({ city: '', trip_date: '', physical_note: '', logistics_note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = async () => {
    if (!form.city.trim()) { setError('City is required'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('trip_days').insert({
      trip_id: tripId,
      day_number: nextDayNumber,
      city: form.city.trim(),
      trip_date: form.trip_date || null,
      physical_note: form.physical_note.trim() || null,
      logistics_note: form.logistics_note.trim() || null,
    }).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false)
    onCreated(data)
  }

  return (
    <BottomSheet onClose={onClose} title={`Add Day ${nextDayNumber}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={lbl}>City *</label>
          <input className="input" placeholder="e.g. Paris" value={form.city} onChange={set('city')} />
        </div>
        <div>
          <label style={lbl}>Date</label>
          <input className="input" type="date" value={form.trip_date} onChange={set('trip_date')} />
        </div>
        <div>
          <label style={lbl}>Physical notes</label>
          <textarea className="input" placeholder="Lots of walking, bring comfortable shoes…" value={form.physical_note} onChange={set('physical_note')} rows={2} style={{ resize: 'none' }} />
        </div>
        <div>
          <label style={lbl}>Logistics reminders</label>
          <textarea className="input" placeholder="Remember passport, book tickets in advance…" value={form.logistics_note} onChange={set('logistics_note')} rows={2} style={{ resize: 'none' }} />
        </div>
        {error && <p style={{ fontSize: 13, color: '#C00', padding: '8px 12px', background: '#FEE', borderRadius: 8 }}>{error}</p>}
        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleCreate} disabled={loading}>
          {loading ? 'Adding…' : 'Add day'} {!loading && <Icon name="arrow_right" size={16} color="white" />}
        </button>
      </div>
    </BottomSheet>
  )
}
const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
