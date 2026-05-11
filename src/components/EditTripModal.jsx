import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../hooks/useLang'
import BottomSheet from './BottomSheet'
import Icon from './Icon'
import { THEMES } from '../lib/themes'

const STRINGS = {
  he: {
    title: 'עריכת טיול',
    coverPhoto: 'תמונת שער',
    uploading: 'מעלה…',
    addCover: 'הקש להוספת תמונת שער',
    colorTheme: 'ערכת צבעים',
    tripName: 'שם הטיול *',
    destination: 'יעד עיקרי',
    dateStart: 'תאריך התחלה',
    dateEnd: 'תאריך סיום',
    bookings: 'הזמנות וקישורים',
    add: '+ הוסף',
    flight: 'טיסה', hotel: 'מלון', car: 'רכב', other: 'אחר',
    labelPh: 'תיאור (למשל טיסה רומא → פריז)',
    urlPh: 'קישור הזמנה (לא חובה)',
    refPh: 'מספר הזמנה / אישור',
    addBooking: 'הוסף הזמנה',
    ref: 'הזמנה:',
    save: 'שמור שינויים',
    saving: 'שומר…',
    deleteTrip: 'מחק טיול',
    deleting: 'מוחק…',
    confirmDelete: 'הקש שוב לאישור מחיקה',
    errName: 'שם הטיול נדרש',
    errDates: 'תאריך הסיום לא יכול להיות לפני תאריך ההתחלה',
    errImgType: 'תמונת השער חייבת להיות קובץ תמונה (JPG, PNG, WEBP…)',
    errImgSize: 'תמונת השער חייבת להיות עד 10 MB',
    errUpload: 'העלאת התמונה נכשלה — נסו שוב',
    terracotta: 'טרקוטה',
  },
  en: {
    title: 'Edit trip',
    coverPhoto: 'Cover photo',
    uploading: 'Uploading…',
    addCover: 'Tap to add cover photo',
    colorTheme: 'Color theme',
    tripName: 'Trip name *',
    destination: 'Main destination',
    dateStart: 'Start date',
    dateEnd: 'End date',
    bookings: 'Bookings & Links',
    add: '+ Add',
    flight: 'Flight', hotel: 'Hotel', car: 'Car', other: 'Other',
    labelPh: 'Label (e.g. Rome → Paris flight)',
    urlPh: 'Booking URL (optional)',
    refPh: 'Booking ref / confirmation code',
    addBooking: 'Add booking',
    ref: 'Ref:',
    save: 'Save changes',
    saving: 'Saving…',
    deleteTrip: 'Delete trip',
    deleting: 'Deleting…',
    confirmDelete: 'Tap again to confirm delete',
    errName: 'Trip name is required',
    errDates: 'End date cannot be before start date',
    errImgType: 'Cover photo must be an image file (JPG, PNG, WEBP…)',
    errImgSize: 'Cover photo must be under 10 MB',
    errUpload: 'Cover upload failed — please try again',
    terracotta: 'Terracotta',
  }
}

export default function EditTripModal({ trip, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const BOOKING_TYPES = [
    { id: 'flight', label: t.flight, icon: 'transport' },
    { id: 'hotel',  label: t.hotel,  icon: 'hotel' },
    { id: 'car',    label: t.car,    icon: 'navigate' },
    { id: 'other',  label: t.other,  icon: 'external_link' },
  ]
  const coverFileRef = useRef(null)
  const [form, setForm] = useState({
    name: trip.name || '',
    destination: trip.destination || '',
    date_start: trip.date_start || '',
    date_end: trip.date_end || '',
    booking_links: trip.booking_links || [],
    color_theme: trip.color_theme || 'terracotta',
  })
  const [coverPhoto, setCoverPhoto] = useState(trip.cover_photo_url || null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newBooking, setNewBooking] = useState({ type: 'flight', label: '', url: '', ref: '' })
  const [showAddBooking, setShowAddBooking] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleCoverUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(t.errImgType)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t.errImgSize)
      return
    }
    setUploadingCover(true)
    setError('')
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${trip.id}/cover.${ext}`
    const { error: upErr } = await supabase.storage.from('trip-photos').upload(path, file, { upsert: true })
    if (upErr) { setError(t.errUpload); setUploadingCover(false); return }
    const url = supabase.storage.from('trip-photos').getPublicUrl(path).data.publicUrl
    setCoverPhoto(url)
    setUploadingCover(false)
  }

  const addBooking = () => {
    if (!newBooking.label.trim()) return
    setForm(f => ({ ...f, booking_links: [...f.booking_links, { ...newBooking, id: Date.now() }] }))
    setNewBooking({ type: 'flight', label: '', url: '', ref: '' })
    setShowAddBooking(false)
  }

  const removeBooking = (idx) => {
    setForm(f => ({ ...f, booking_links: f.booking_links.filter((_, i) => i !== idx) }))
  }

  const handleUpdate = async () => {
    if (!form.name.trim()) { setError(t.errName); return }
    if (form.date_start && form.date_end && form.date_end < form.date_start) {
      setError(t.errDates); return
    }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('trips').update({
      name: form.name.trim(),
      destination: form.destination.trim(),
      date_start: form.date_start || null,
      date_end: form.date_end || null,
      booking_links: form.booking_links,
      cover_photo_url: coverPhoto,
      color_theme: form.color_theme,
    }).eq('id', trip.id).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); onUpdated(data)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const { error: err } = await supabase.from('trips').delete().eq('id', trip.id)
    if (err) { setError(err.message); setDeleting(false); setConfirmDelete(false); return }
    setDeleting(false)
    onDeleted(trip.id)
  }

  return (
    <BottomSheet onClose={onClose} title={t.title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Cover photo */}
        <div>
          <label style={lbl}>{t.coverPhoto}</label>
          <div
            onClick={() => coverFileRef.current?.click()}
            style={{ borderRadius: 12, overflow: 'hidden', border: `1.5px dashed var(--sand)`, cursor: 'pointer', minHeight: 90, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            {coverPhoto ? (
              <img src={coverPhoto} alt="cover" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Icon name="camera" size={24} color="var(--sand-dark)" />
                <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 6 }}>
                  {uploadingCover ? t.uploading : t.addCover}
                </p>
              </div>
            )}
          </div>
          <input ref={coverFileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => e.target.files[0] && handleCoverUpload(e.target.files[0])} />
        </div>

        {/* Color theme */}
        <div>
          <label style={lbl}>{t.colorTheme}</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.values(THEMES).map(th => (
              <button key={th.id} onClick={() => setForm(f => ({ ...f, color_theme: th.id }))}
                title={th.label}
                style={{ width: 36, height: 36, borderRadius: '50%', background: th.swatch, border: `3px solid ${form.color_theme === th.id ? '#1A1612' : 'transparent'}`, outline: form.color_theme === th.id ? `2px solid ${th.swatch}` : 'none', outlineOffset: 2, cursor: 'pointer', transition: 'all 0.15s' }}>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 6 }}>{THEMES[form.color_theme]?.label || t.terracotta}</p>
        </div>

        <div>
          <label style={lbl}>{t.tripName}</label>
          <input className="input" value={form.name} onChange={set('name')} />
        </div>

        <div>
          <label style={lbl}>{t.destination}</label>
          <input className="input" value={form.destination} onChange={set('destination')} />
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

        {/* Booking links */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>
              <Icon name="plane" size={11} color="var(--ink-light)" style={{ display: 'inline', marginInlineEnd: 4, verticalAlign: 'middle' }} />
              {t.bookings}
            </label>
            <button className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setShowAddBooking(s => !s)}>
              {t.add}
            </button>
          </div>

          {showAddBooking && (
            <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {BOOKING_TYPES.map(bt => (
                  <button key={bt.id} onClick={() => setNewBooking(b => ({ ...b, type: bt.id }))}
                    style={{ padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${newBooking.type === bt.id ? 'var(--accent)' : 'var(--border)'}`, background: newBooking.type === bt.id ? 'var(--accent-pale)' : 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 10 }}>
                    <Icon name={bt.icon} size={16} color={newBooking.type === bt.id ? 'var(--accent)' : 'var(--ink-muted)'} />
                    <span style={{ fontWeight: 500, color: newBooking.type === bt.id ? 'var(--accent)' : 'var(--ink-muted)' }}>{bt.label}</span>
                  </button>
                ))}
              </div>
              <input className="input" style={{ fontSize: 14 }} placeholder={t.labelPh} value={newBooking.label} onChange={e => setNewBooking(b => ({ ...b, label: e.target.value }))} />
              <input className="input" style={{ fontSize: 14, direction: 'ltr', textAlign: 'left' }} placeholder={t.urlPh} value={newBooking.url} onChange={e => setNewBooking(b => ({ ...b, url: e.target.value }))} />
              <input className="input" style={{ fontSize: 14 }} placeholder={t.refPh} value={newBooking.ref} onChange={e => setNewBooking(b => ({ ...b, ref: e.target.value }))} />
              <button className="btn btn-accent btn-sm" onClick={addBooking} style={{ width: '100%' }}>{t.addBooking}</button>
            </div>
          )}

          {form.booking_links.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.booking_links.map((bl, i) => {
                const btype = BOOKING_TYPES.find(bt => bt.id === bl.type) || BOOKING_TYPES[3]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <Icon name={btype.icon} size={18} color="var(--ink-muted)" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{bl.label}</p>
                      {bl.ref && <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{t.ref} {bl.ref}</p>}
                    </div>
                    <button onClick={() => removeBooking(i)} style={{ padding: 4, cursor: 'pointer', color: 'var(--ink-muted)' }}>
                      <Icon name="close" size={14} color="var(--ink-muted)" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {error && <p className="error-box">{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleUpdate} disabled={loading || uploadingCover}>
          {loading ? t.saving : t.save}
        </button>

        <button
          className={confirmDelete ? 'btn btn-danger' : 'btn btn-ghost'}
          style={{ width: '100%' }}
          onClick={handleDelete}
          disabled={deleting}
        >
          <Icon name="trash" size={14} color={confirmDelete ? '#b91c1c' : 'var(--ink-muted)'} />
          {deleting ? t.deleting : confirmDelete ? t.confirmDelete : t.deleteTrip}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
