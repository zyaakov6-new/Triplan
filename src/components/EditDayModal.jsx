import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../hooks/useLang'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

const STRINGS = {
  he: {
    titlePrefix: 'עריכת יום',
    date: 'תאריך',
    physical: 'הערות פיזיות',
    physicalPh: 'הרבה הליכה, להביא נעליים נוחות…',
    logistics: 'תזכורות לוגיסטיות',
    logisticsPh: 'לזכור דרכון, להזמין כרטיסים מראש…',
    journal: 'יומן / הערות',
    journalPh: 'איך היה היום? זיכרונות, טיפים, מחשבות…',
    save: 'שמירת שינויים',
    saving: 'שומר…',
    deleteDay: 'מחיקת היום וכל העצירות',
    deleting: 'מוחק…',
    confirmDelete: 'הקישו שוב לאישור המחיקה',
  },
  en: {
    titlePrefix: 'Edit Day',
    date: 'Date',
    physical: 'Physical notes',
    physicalPh: 'Lots of walking, bring comfortable shoes…',
    logistics: 'Logistics reminders',
    logisticsPh: 'Remember passport, book tickets in advance…',
    journal: 'Journal / Notes',
    journalPh: 'How was the day? Any memories, tips, or thoughts…',
    save: 'Save changes',
    saving: 'Saving…',
    deleteDay: 'Delete day & all stops',
    deleting: 'Deleting…',
    confirmDelete: 'Tap again to confirm delete',
  }
}

export default function EditDayModal({ day, onClose, onUpdated, onDeleted }) {
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
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
    const { error: err } = await supabase.from('trip_days').delete().eq('id', day.id)
    if (err) { setError(err.message); setDeleting(false); setConfirmDelete(false); return }
    setDeleting(false)
    onDeleted(day.id)
  }

  return (
    <BottomSheet onClose={onClose} title={`${t.titlePrefix} ${day.day_number}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={lbl}>{t.date}</label>
          <input className="input" type="date" value={form.trip_date} onChange={set('trip_date')} />
        </div>
        <div>
          <label style={lbl}>{t.physical}</label>
          <textarea className="input" value={form.physical_note} onChange={set('physical_note')} rows={2} style={{ resize: 'none' }} placeholder={t.physicalPh} />
        </div>
        <div>
          <label style={lbl}>{t.logistics}</label>
          <textarea className="input" value={form.logistics_note} onChange={set('logistics_note')} rows={2} style={{ resize: 'none' }} placeholder={t.logisticsPh} />
        </div>
        <div>
          <label style={lbl}>{t.journal}</label>
          <textarea className="input" value={form.journal} onChange={set('journal')} rows={3} style={{ resize: 'none' }} placeholder={t.journalPh} />
        </div>

        {error && <p className="error-box">{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleUpdate} disabled={loading}>
          {loading ? t.saving : t.save}
        </button>

        <button
          className={confirmDelete ? 'btn btn-danger' : 'btn btn-ghost'}
          style={{ width: '100%' }}
          onClick={handleDelete}
          disabled={deleting}
        >
          <Icon name="trash" size={14} color={confirmDelete ? '#b91c1c' : 'var(--ink-muted)'} />
          {deleting ? t.deleting : confirmDelete ? t.confirmDelete : t.deleteDay}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
