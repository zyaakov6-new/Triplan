import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../hooks/useLang'
import BottomSheet from './BottomSheet'
import Icon from './Icon'
import { useLocationSearch } from '../hooks/useLocationSearch'

const STRINGS = {
  he: {
    title: 'עריכת עצירה',
    type: 'סוג',
    attraction: 'נקודת תצפית', food: 'אוכל/מים', hotel: 'מחנה/לינה', transport: 'תחבורה', waypoint: 'נקודת ציון',
    name: 'שם *',
    updateLoc: 'עדכון מיקום',
    searchPh: 'חפשו מיקום חדש…',
    time: 'שעה',
    cost: 'עלות',
    note: 'הערה',
    notePh: 'הערות…',
    save: 'שמור שינויים',
    saving: 'שומר…',
    cancelMove: 'בטל העברה',
    moveToDay: 'העבר ליום אחר',
    dayLabel: 'יום',
    deleteStop: 'מחק עצירה',
    deleting: 'מוחק…',
    confirmDelete: 'הקש שוב לאישור מחיקה',
    errName: 'נדרש שם',
  },
  en: {
    title: 'Edit stop',
    type: 'Type',
    attraction: 'Viewpoint', food: 'Food/Water', hotel: 'Camp/Lodge', transport: 'Transport', waypoint: 'Waypoint',
    name: 'Name *',
    updateLoc: 'Update location',
    searchPh: 'Search a new location…',
    time: 'Time',
    cost: 'Cost',
    note: 'Note',
    notePh: 'Notes…',
    save: 'Save changes',
    saving: 'Saving…',
    cancelMove: 'Cancel move',
    moveToDay: 'Move to another day',
    dayLabel: 'Day',
    deleteStop: 'Delete stop',
    deleting: 'Deleting…',
    confirmDelete: 'Tap again to confirm delete',
    errName: 'Name is required',
  }
}

export default function EditStopModal({ stop, days = [], onClose, onUpdated, onDeleted, onMoved }) {
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const isHe = lang === 'he'
  const dateLocale = isHe ? 'he-IL' : 'en'
  const TYPES = [
    { id: 'attraction', label: t.attraction, icon: 'navigate' },
    { id: 'food',       label: t.food,       icon: 'food' },
    { id: 'hotel',      label: t.hotel,      icon: 'hotel' },
    { id: 'transport',  label: t.transport,  icon: 'transport' },
    { id: 'waypoint',   label: t.waypoint,   icon: 'pin' },
  ]
  const [form, setForm] = useState({
    name: stop.name || '',
    type: stop.type || 'attraction',
    time_slot: stop.time_slot || '',
    note: stop.note || '',
    lat: stop.lat != null ? String(stop.lat) : '',
    lng: stop.lng != null ? String(stop.lng) : '',
    cost: stop.cost != null ? String(stop.cost) : '',
  })
  const [loading, setLoading]           = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [moving, setMoving]             = useState(false)
  const [error, setError]               = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showMoveDay, setShowMoveDay]   = useState(false)

  const { query: placeQuery, results: placeResults, searching: searchingPlace,
          searchError, handleInput: handlePlaceInputRaw, clearResults,
          setQuery: setPlaceQuery } = useLocationSearch()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePlaceInput = (e) => handlePlaceInputRaw(e.target.value)

  const selectPlace = (feature) => {
    const [lon, lat] = feature.geometry.coordinates
    const p = feature.properties
    const label = [p.name, p.city || p.state, p.country].filter(Boolean).join(', ')
    setForm(f => ({
      ...f,
      lat: parseFloat(lat).toFixed(6),
      lng: parseFloat(lon).toFixed(6),
    }))
    setPlaceQuery(label)
    clearResults()
  }

  const handleUpdate = async () => {
    if (!form.name.trim()) { setError(t.errName); return }
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
    const { error: err } = await supabase.from('stops').delete().eq('id', stop.id)
    if (err) { setError(err.message); setDeleting(false); setConfirmDelete(false); return }
    setDeleting(false)
    onDeleted(stop.id)
  }

  const handleMoveToDay = async (newDayId) => {
    if (!newDayId || newDayId === stop.day_id) return
    setMoving(true)
    await supabase.from('stops').update({ day_id: newDayId, sort_order: 9999 }).eq('id', stop.id)
    setMoving(false)
    onMoved?.(stop.id, stop.day_id, newDayId)
  }

  return (
    <BottomSheet onClose={onClose} title={t.title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type */}
        <div>
          <label style={lbl}>{t.type}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {TYPES.map(ty => (
              <button key={ty.id} onClick={() => setForm(f => ({ ...f, type: ty.id }))}
                style={{ padding: '10px 4px', borderRadius: 10, border: `2px solid ${form.type === ty.id ? 'var(--accent)' : 'var(--border)'}`, background: form.type === ty.id ? 'var(--accent-pale)' : 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.15s' }}>
                <Icon name={ty.icon} size={18} color={form.type === ty.id ? 'var(--accent)' : 'var(--ink-muted)'} />
                <span style={{ fontSize: 10, fontWeight: 500, color: form.type === ty.id ? 'var(--accent)' : 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.2 }}>{ty.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>{t.name}</label>
          <input className="input" value={form.name} onChange={set('name')} />
        </div>

        {/* Place search */}
        <div>
          <label style={lbl}>{t.updateLoc}</label>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder={t.searchPh} value={placeQuery} onChange={handlePlaceInput} autoComplete="off" />
            {searchingPlace && <div style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-muted)' }}>…</div>}
            {placeResults.length > 0 && (
              <div className="place-results">
                {placeResults.map((feature, i) => {
                  const p = feature.properties
                  const subtitle = [p.city || p.state, p.country].filter(Boolean).join(', ')
                  return (
                    <div key={i} className="place-result-item" onClick={() => selectPlace(feature)}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)' }}>{p.name}</div>
                      {subtitle && <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{subtitle}</div>}
                    </div>
                  )
                })}

              </div>
            )}
          </div>
          {searchError && !placeResults.length && (
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 5 }}>{searchError}</p>
          )}
          {form.lat && form.lng && (
            <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: 5, direction: 'ltr' }}>{parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>{t.time}</label>
            <input className="input" type="time" value={form.time_slot} onChange={set('time_slot')} />
          </div>
          <div>
            <label style={lbl}>{t.cost}</label>
            <input className="input" placeholder="0.00" value={form.cost} onChange={set('cost')} inputMode="decimal" />
          </div>
        </div>

        <div>
          <label style={lbl}>{t.note}</label>
          <input className="input" placeholder={t.notePh} value={form.note} onChange={set('note')} />
        </div>

        {error && <p className="error-box">{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleUpdate} disabled={loading}>
          {loading ? t.saving : t.save}
        </button>

        {/* Move to day */}
        {days.length > 1 && (
          <div>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setShowMoveDay(v => !v)}>
              <Icon name="move" size={14} color="var(--ink-muted)" />
              {showMoveDay ? t.cancelMove : t.moveToDay}
            </button>
            {showMoveDay && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }} className="anim-up">
                {days.filter(d => d.id !== stop.day_id).map(d => (
                  <button key={d.id} onClick={() => handleMoveToDay(d.id)} disabled={moving}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--cream)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>{t.dayLabel}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'white', lineHeight: 1 }}>{d.day_number}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{d.city}</p>
                      {d.trip_date && <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{new Date(d.trip_date).toLocaleDateString(dateLocale, { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
                    </div>
                    <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={14} color="var(--accent)" style={{ marginInlineStart: 'auto' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          className={confirmDelete ? 'btn btn-danger' : 'btn btn-ghost'}
          style={{ width: '100%' }}
          onClick={handleDelete}
          disabled={deleting}
        >
          <Icon name="trash" size={14} color={confirmDelete ? '#b91c1c' : 'var(--ink-muted)'} />
          {deleting ? t.deleting : confirmDelete ? t.confirmDelete : t.deleteStop}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
