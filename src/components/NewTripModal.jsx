import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import BottomSheet from './BottomSheet'
import Icon from './Icon'

const EMOJIS = ['✈️','🏖️','🏔️','🗺️','🚢','🚂','🏕️','🌍','🌴','🎒']

export default function NewTripModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', destination: '', date_start: '', date_end: '', cover_emoji: '✈️' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCreate = async () => {
    if (!form.name.trim()) { setError('Trip name is required'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('trips')
      .insert({ owner_id: user.id, name: form.name.trim(), destination: form.destination.trim(), date_start: form.date_start || null, date_end: form.date_end || null, cover_emoji: form.cover_emoji })
      .select().single()
    if (err) { setError(err.message); setLoading(false); return }
    // Add owner as member too
    await supabase.from('trip_members').insert({ trip_id: data.id, user_id: user.id, role: 'owner' })
    setLoading(false)
    onCreated(data)
  }

  return (
    <BottomSheet onClose={onClose} title="New trip">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Emoji picker */}
        <div>
          <label style={lbl}>Vibe</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, cover_emoji: e }))}
                style={{ width: 44, height: 44, borderRadius: 12, fontSize: 22, border: `2px solid ${form.cover_emoji === e ? 'var(--accent)' : 'var(--border)'}`, background: form.cover_emoji === e ? 'var(--accent-pale)' : 'var(--white)', transition: 'all 0.15s', cursor: 'pointer' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>Trip name *</label>
          <input className="input" placeholder="European Summer 2025" value={form.name} onChange={set('name')} />
        </div>

        <div>
          <label style={lbl}>Main destination</label>
          <input className="input" placeholder="e.g. Italy, Southeast Asia…" value={form.destination} onChange={set('destination')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Start date</label>
            <input className="input" type="date" value={form.date_start} onChange={set('date_start')} />
          </div>
          <div>
            <label style={lbl}>End date</label>
            <input className="input" type="date" value={form.date_end} onChange={set('date_end')} />
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: '#C00', padding: '8px 12px', background: '#FEE', borderRadius: 8 }}>{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%', marginTop: 4 }} onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating…' : 'Create trip'} {!loading && <Icon name="arrow_right" size={16} color="white" />}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
