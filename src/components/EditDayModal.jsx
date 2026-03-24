import { useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

export default function EditDayModal({ day, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    trip_date: day.trip_date || '',
    physical_note: day.physical_note || '',
    logistics_note: day.logistics_note || '',
    journal: day.journal || '',
  })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleUpdate = async () => {
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('trip_days').update({
      trip_date: form.trip_date || null,
      physical_note: form.physical_note.trim() || null,
      logistics_note: form.logistics_note.trim() || null,
      journal: form.journal.trim() || null,
    }).eq('id', day.id).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); onUpdated(data)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await supabase.from('trip_days').delete().eq('id', day.id)
    setDeleting(false)
    onDeleted(day.id)
  }

  return (
    <BottomSheet onClose={onClose} title={`Edit Day ${day.day_number}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={lbl}>Date</label>
          <input className="input" type="date" value={form.trip_date} onChange={set('trip_date')} />
        </div>
        <div>
          <label style={lbl}>Physical notes</label>
          <textarea className="input" value={form.physical_note} onChange={set('physical_note')} rows={2} style={{ resize: 'none' }} placeholder="Lots of walking, bring comfortable shoes…" />
        </div>
        <div>
          <label style={lbl}>Logistics reminders</label>
          <textarea className="input" value={form.logistics_note} onChange={set('logistics_note')} rows={2} style={{ resize: 'none' }} placeholder="Remember passport, book tickets in advance…" />
        </div>
        <div>
          <label style={lbl}>Journal / Notes</label>
          <textarea className="input" value={form.journal} onChange={set('journal')} rows={3} style={{ resize: 'none' }} placeholder="How was the day? Any memories, tips, or thoughts…" />
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
          {deleting ? 'Deleting…' : confirmDelete ? 'Tap again to confirm delete' : 'Delete day & all stops'}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
