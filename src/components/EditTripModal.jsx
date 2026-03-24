import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import BottomSheet from './BottomSheet'
import Icon from './Icon'
import { THEMES } from '../lib/themes'

const BOOKING_TYPES = [
  { id: 'flight', label: 'Flight', icon: 'transport' },
  { id: 'hotel', label: 'Hotel', icon: 'hotel' },
  { id: 'car', label: 'Car', icon: 'navigate' },
  { id: 'other', label: 'Other', icon: 'external_link' },
]

export default function EditTripModal({ trip, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth()
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
    setUploadingCover(true)
    const ext = file.name.split('.').pop()
    const path = `${trip.id}/cover.${ext}`
    await supabase.storage.from('trip-photos').upload(path, file, { upsert: true })
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
    if (!form.name.trim()) { setError('Trip name is required'); return }
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
    await supabase.from('trips').delete().eq('id', trip.id)
    setDeleting(false)
    onDeleted(trip.id)
  }

  return (
    <BottomSheet onClose={onClose} title="Edit trip">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Cover photo */}
        <div>
          <label style={lbl}>Cover photo</label>
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
                  {uploadingCover ? 'Uploading…' : 'Tap to add cover photo'}
                </p>
              </div>
            )}
          </div>
          <input ref={coverFileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => e.target.files[0] && handleCoverUpload(e.target.files[0])} />
        </div>

        {/* Color theme */}
        <div>
          <label style={lbl}>Color theme</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.values(THEMES).map(t => (
              <button key={t.id} onClick={() => setForm(f => ({ ...f, color_theme: t.id }))}
                title={t.label}
                style={{ width: 36, height: 36, borderRadius: '50%', background: t.swatch, border: `3px solid ${form.color_theme === t.id ? '#1A1612' : 'transparent'}`, outline: form.color_theme === t.id ? `2px solid ${t.swatch}` : 'none', outlineOffset: 2, cursor: 'pointer', transition: 'all 0.15s' }}>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 6 }}>{THEMES[form.color_theme]?.label || 'Terracotta'}</p>
        </div>

        <div>
          <label style={lbl}>Trip name *</label>
          <input className="input" value={form.name} onChange={set('name')} />
        </div>

        <div>
          <label style={lbl}>Main destination</label>
          <input className="input" value={form.destination} onChange={set('destination')} />
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

        {/* Booking links */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>
              <Icon name="plane" size={11} color="var(--ink-light)" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Bookings & Links
            </label>
            <button className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setShowAddBooking(s => !s)}>
              + Add
            </button>
          </div>

          {showAddBooking && (
            <div style={{ background: 'var(--cream)', borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {BOOKING_TYPES.map(t => (
                  <button key={t.id} onClick={() => setNewBooking(b => ({ ...b, type: t.id }))}
                    style={{ padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${newBooking.type === t.id ? 'var(--accent)' : 'var(--border)'}`, background: newBooking.type === t.id ? 'var(--accent-pale)' : 'var(--white)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 10 }}>
                    <Icon name={t.icon} size={16} color={newBooking.type === t.id ? 'var(--accent)' : 'var(--ink-muted)'} />
                    <span style={{ fontWeight: 500, color: newBooking.type === t.id ? 'var(--accent)' : 'var(--ink-muted)' }}>{t.label}</span>
                  </button>
                ))}
              </div>
              <input className="input" style={{ fontSize: 14 }} placeholder="Label (e.g. Rome → Paris flight)" value={newBooking.label} onChange={e => setNewBooking(b => ({ ...b, label: e.target.value }))} />
              <input className="input" style={{ fontSize: 14 }} placeholder="Booking URL (optional)" value={newBooking.url} onChange={e => setNewBooking(b => ({ ...b, url: e.target.value }))} />
              <input className="input" style={{ fontSize: 14 }} placeholder="Booking ref / confirmation code" value={newBooking.ref} onChange={e => setNewBooking(b => ({ ...b, ref: e.target.value }))} />
              <button className="btn btn-accent btn-sm" onClick={addBooking} style={{ width: '100%' }}>Add booking</button>
            </div>
          )}

          {form.booking_links.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.booking_links.map((bl, i) => {
                const btype = BOOKING_TYPES.find(t => t.id === bl.type) || BOOKING_TYPES[3]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <Icon name={btype.icon} size={18} color="var(--ink-muted)" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{bl.label}</p>
                      {bl.ref && <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Ref: {bl.ref}</p>}
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

        {error && <p style={{ fontSize: 13, color: '#C00', padding: '8px 12px', background: '#FEE', borderRadius: 8 }}>{error}</p>}

        <button className="btn btn-accent" style={{ width: '100%' }} onClick={handleUpdate} disabled={loading || uploadingCover}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>

        <button
          className={confirmDelete ? 'btn btn-danger' : 'btn btn-ghost'}
          style={{ width: '100%' }}
          onClick={handleDelete}
          disabled={deleting}
        >
          <Icon name="trash" size={14} color={confirmDelete ? '#b91c1c' : 'var(--ink-muted)'} />
          {deleting ? 'Deleting…' : confirmDelete ? 'Tap again to confirm delete' : 'Delete trip'}
        </button>
      </div>
    </BottomSheet>
  )
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }
