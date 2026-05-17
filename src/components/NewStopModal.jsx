import { useState, lazy, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../hooks/useLang'
import { track } from '../lib/analytics'
import BottomSheet from './BottomSheet'
import Icon from './Icon'
import { useLocationSearch } from '../hooks/useLocationSearch'

// Same lazy chunk as TripDetailPage's map view - opening the picker doesn't
// re-download MapLibre if the user already loaded the Map tab.
const TripMap = lazy(() => import('./TripMap'))

const STRINGS = {
  he: {
    title: 'הוספת עצירה',
    type: 'סוג',
    attraction: 'נקודת תצפית', food: 'אוכל/מים', hotel: 'מחנה/לינה', transport: 'תחבורה', waypoint: 'נקודת ציון',
    name: 'שם *',
    namePh: 'למשל פסגת איגל פיק',
    searchLoc: 'חיפוש מיקום',
    searchPh: 'חפשו מקום כדי למלא קואורדינטות אוטומטית…',
    pickOnMap: 'בחירה במפה',
    pickHide: 'הסתרת מפה',
    pickHint: 'הקישו במפה לבחירת המיקום',
    time: 'שעה',
    cost: 'עלות',
    note: 'הערה',
    notePh: 'כרטיסים שהוזמנו מראש, שם הזמנה…',
    addBtn: 'הוספת עצירה',
    adding: 'מוסיף…',
    errName: 'נדרש שם',
  },
  en: {
    title: 'Add stop',
    type: 'Type',
    attraction: 'Viewpoint', food: 'Food/Water', hotel: 'Camp/Lodge', transport: 'Transport', waypoint: 'Waypoint',
    name: 'Name *',
    namePh: 'e.g. Eagle Peak Summit',
    searchLoc: 'Search location',
    searchPh: 'Search a place to auto-fill coordinates…',
    pickOnMap: 'Pick on map',
    pickHide: 'Hide map',
    pickHint: 'Tap the map to drop a pin',
    time: 'Time',
    cost: 'Cost',
    note: 'Note',
    notePh: 'Pre-booked tickets, reservation name…',
    addBtn: 'Add stop',
    adding: 'Adding…',
    errName: 'Name is required',
  }
}

export default function NewStopModal({ dayId, nextOrder, onClose, onCreated }) {
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const isHe = lang === 'he'
  const TYPES = [
    { id: 'attraction', label: t.attraction, icon: 'navigate' },
    { id: 'food',       label: t.food,       icon: 'food' },
    { id: 'hotel',      label: t.hotel,      icon: 'hotel' },
    { id: 'transport',  label: t.transport,  icon: 'transport' },
    { id: 'waypoint',   label: t.waypoint,   icon: 'pin' },
  ]
  const [form, setForm]       = useState({ name: '', type: 'attraction', time_slot: '', note: '', lat: '', lng: '', cost: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const { query: placeQuery, results: placeResults, searching: searchingPlace,
          searchError, handleInput: handlePlaceInput, clearResults, setQuery: setPlaceQuery } = useLocationSearch()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

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
    clearResults()
  }

  const handleCreate = async () => {
    if (!form.name.trim()) { setError(t.errName); return }
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
    track('stop_added', { type: form.type, hasCoords: !!(form.lat && form.lng) })
    setLoading(false); onCreated(data)
  }

  return (
    <BottomSheet onClose={onClose} title={t.title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type selector */}
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
          <input className="input" placeholder={t.namePh} value={form.name} onChange={set('name')} />
        </div>

        {/* Place search */}
        <div>
          <label style={lbl}>
            <Icon name="search" size={11} color="var(--ink-light)" style={{ display: 'inline', marginInlineEnd: 4, verticalAlign: 'middle' }} />
            {t.searchLoc}
          </label>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder={t.searchPh}
              value={placeQuery} onChange={e => handlePlaceInput(e.target.value)} autoComplete="off" />
            {searchingPlace && (
              <div style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-muted)' }}>…</div>
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
          {searchError && !placeResults.length && (
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 5 }}>{searchError}</p>
          )}
          {(form.lat && form.lng) && (
            <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: 5, direction: 'ltr' }}>
              {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
            </p>
          )}

          {/* Drop-pin-on-map alternative - visible button so users know
              there's an option to point on the map instead of searching by
              name. Useful when you know the spot but can't name it (a
              viewpoint off the road, an unmarked campsite). */}
          <button
            type="button"
            onClick={() => setShowPicker(s => !s)}
            style={{
              marginTop: 10,
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: `1.5px ${showPicker ? 'solid' : 'dashed'} var(--accent)`,
              background: showPicker ? 'var(--accent-pale)' : 'transparent',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}
          >
            <Icon name="pin" size={14} color="var(--accent)" />
            {showPicker ? t.pickHide : t.pickOnMap}
          </button>

          {showPicker && (
            <div style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
              <div style={{ height: 260, background: 'var(--cream-dark)' }}>
                <Suspense fallback={
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)', fontSize: 12 }}>
                    <Icon name="map" size={20} color="var(--sand-dark)" />
                  </div>
                }>
                  <TripMap
                    days={[]}
                    pickMode
                    initialPick={form.lat && form.lng ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } : null}
                    onPick={({ lat, lng }) => setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }))}
                  />
                </Suspense>
              </div>
              <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, background: 'rgba(26,22,18,0.85)', color: '#F5F0E8', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500, pointerEvents: 'none' }}>
                {t.pickHint}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>{t.time}</label>
            <input className="input" type="time" value={form.time_slot} onChange={set('time_slot')} />
          </div>
          <div>
            <label style={lbl}>
              <Icon name="dollar" size={11} color="var(--ink-light)" style={{ display: 'inline', marginInlineEnd: 3, verticalAlign: 'middle' }} />
              {t.cost}
            </label>
            <input className="input" placeholder="0.00" value={form.cost} onChange={set('cost')} inputMode="decimal" />
          </div>
        </div>

        <div>
          <label style={lbl}>{t.note}</label>
          <input className="input" placeholder={t.notePh} value={form.note} onChange={set('note')} />
        </div>

        {error && <p className="error-box">{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleCreate} disabled={loading}>
          {loading ? t.adding : t.addBtn} {!loading && <Icon name={isHe ? 'arrow_left' : 'arrow_right'} size={16} color="white" />}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
