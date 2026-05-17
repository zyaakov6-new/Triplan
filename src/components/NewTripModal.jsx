import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../hooks/useLang'
import { track } from '../lib/analytics'
import BottomSheet from './BottomSheet'
import Icon from './Icon'
import { THEMES } from '../lib/themes'

const STRINGS = {
  he: {
    title: 'טיול חדש',
    theme: 'ערכת צבעים:',
    tripName: 'שם הטיול *',
    tripNamePh: 'טרק בהרי הרוקי 2026',
    destination: 'יעד עיקרי',
    destinationPh: 'למשל איטליה, דרום-מזרח אסיה…',
    dateStart: 'תאריך התחלה',
    dateEnd: 'תאריך סיום',
    createBtn: 'יצירת טיול',
    creating: 'יוצר…',
    errName: 'נדרש שם לטיול',
    errDates: 'תאריך הסיום לא יכול להיות לפני תאריך ההתחלה',
  },
  en: {
    title: 'New trip',
    theme: 'Theme:',
    tripName: 'Trip name *',
    tripNamePh: 'Rocky Mountains Trek 2025',
    destination: 'Main destination',
    destinationPh: 'e.g. Italy, Southeast Asia…',
    dateStart: 'Start date',
    dateEnd: 'End date',
    createBtn: 'Create trip',
    creating: 'Creating…',
    errName: 'Trip name is required',
    errDates: 'End date cannot be before start date',
  }
}

export default function NewTripModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const isHe = lang === 'he'
  const [form, setForm] = useState({ name: '', destination: '', date_start: '', date_end: '', color_theme: 'terracotta' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = async () => {
    if (!form.name.trim()) { setError(t.errName); return }
    if (form.date_start && form.date_end && form.date_end < form.date_start) {
      setError(t.errDates); return
    }
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('trips')
      .insert({ owner_id: user.id, name: form.name.trim(), destination: form.destination.trim(), date_start: form.date_start || null, date_end: form.date_end || null, color_theme: form.color_theme })
      .select().single()
    if (err) { setError(err.message); setLoading(false); return }
    // Add owner as member too
    await supabase.from('trip_members').insert({ trip_id: data.id, user_id: user.id, role: 'owner' })
    track('trip_created', { theme: form.color_theme, hasDates: !!form.date_start })
    setLoading(false)
    onCreated(data)
  }

  return (
    <BottomSheet onClose={onClose} title={t.title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Color theme - compact row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>{t.theme}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.values(THEMES).map(th => (
              <button key={th.id} onClick={() => setForm(f => ({ ...f, color_theme: th.id }))}
                title={th.label}
                style={{ width: 24, height: 24, borderRadius: '50%', background: th.swatch, border: `2px solid ${form.color_theme === th.id ? '#1A1612' : 'transparent'}`, outline: form.color_theme === th.id ? `2px solid ${th.swatch}` : 'none', outlineOffset: 2, cursor: 'pointer', transition: 'all 0.15s' }}>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>{t.tripName}</label>
          <input className="input" placeholder={t.tripNamePh} value={form.name} onChange={set('name')} />
        </div>

        <div>
          <label style={lbl}>{t.destination}</label>
          <input className="input" placeholder={t.destinationPh} value={form.destination} onChange={set('destination')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>{t.dateStart}</label>
            <input className="input" type="date" value={form.date_start} onChange={set('date_start')} />
          </div>
          <div>
            <label style={lbl}>{t.dateEnd}</label>
            <input className="input" type="date" value={form.date_end} min={form.date_start || undefined} onChange={set('date_end')} />
          </div>
        </div>

        {error && <p className="error-box">{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%', marginTop: 4 }} onClick={handleCreate} disabled={loading}>
          {loading ? t.creating : t.createBtn} {!loading && <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={16} color="white" />}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
