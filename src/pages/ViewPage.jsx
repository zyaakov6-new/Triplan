import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PhotoLightbox from '../components/PhotoLightbox'

const TYPE_META = {
  attraction: { emoji: '🏛', label: 'Attraction' },
  food:       { emoji: '🍽', label: 'Restaurant' },
  hotel:      { emoji: '🏨', label: 'Hotel' },
  transport:  { emoji: '🚌', label: 'Transport' },
}

export default function ViewPage() {
  const { token } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [photos, setPhotos] = useState({})
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => { fetchTrip() }, [token])

  const fetchTrip = async () => {
    try {
      const { data, error: err } = await supabase.rpc('get_trip_by_view_token', { p_token: token })
      if (err || !data) { setError(true); setLoading(false); return }
      setTrip(data)

      // Fetch photos for each day
      const days = data.days || []
      const photoMap = {}
      for (const day of days) {
        const { data: ph } = await supabase.from('trip_photos').select('*').eq('day_id', day.id).order('created_at')
        if (ph?.length) {
          photoMap[day.id] = ph.map(p => supabase.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl)
        }
      }
      setPhotos(photoMap)
    } catch { setError(true) }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>✈️</div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Loading trip…</p>
    </div>
  )

  if (error || !trip) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>😕</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Trip not found</p>
      <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>This link may be invalid or expired</p>
      <a href="/" style={{ marginTop: 8, fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>← Back to Triplan</a>
    </div>
  )

  const days = trip.days || []
  const allStops = days.flatMap(d => d.stops || [])
  const totalBudget = allStops.reduce((s, st) => s + (st.cost || 0), 0)
  const dateStr = trip.date_start
    ? `${new Date(trip.date_start).toLocaleDateString('en', { month: 'short', day: 'numeric' })}${trip.date_end ? ` – ${new Date(trip.date_end).toLocaleDateString('en', { month: 'short', day: 'numeric' })}` : ''}`
    : null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        {trip.cover_photo_url ? (
          <div style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
            <img src={trip.cover_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 20, right: 20 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', fontWeight: 500, marginBottom: 2 }}>{trip.cover_emoji} {trip.name}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>{[trip.destination, dateStr].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 20px 12px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{trip.cover_emoji} {trip.name}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>{[trip.destination, dateStr].filter(Boolean).join(' · ')}</p>
          </div>
        )}
        <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'var(--cream)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 100 }}>👁 Read-only</span>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{days.length} day{days.length !== 1 ? 's' : ''} · {allStops.length} stop{allStops.length !== 1 ? 's' : ''}</span>
          {totalBudget > 0 && <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>${totalBudget.toFixed(0)} total</span>}
        </div>
      </div>

      {/* Days */}
      <div className="scroll-y" style={{ flex: 1, padding: '16px 16px 48px' }}>
        {days.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--ink-muted)', paddingTop: 40 }}>No days planned yet</p>
        ) : days.map(day => {
          const stops = day.stops || []
          const dayBudget = stops.reduce((s, st) => s + (st.cost || 0), 0)
          const dayPhotos = photos[day.id] || []
          return (
            <div key={day.id} className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
              {/* Day header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>{day.day_number}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500 }}>{day.city}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    {day.trip_date ? new Date(day.trip_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                    {stops.length > 0 ? `${day.trip_date ? ' · ' : ''}${stops.length} stop${stops.length !== 1 ? 's' : ''}` : 'No stops'}
                    {dayBudget > 0 && ` · $${dayBudget.toFixed(0)}`}
                  </p>
                </div>
              </div>

              {/* Stops */}
              {stops.length > 0 && (
                <div style={{ padding: '0 16px 12px' }}>
                  {stops.map((stop, i) => {
                    const meta = TYPE_META[stop.type] || TYPE_META.attraction
                    const gmapsUrl = stop.lat && stop.lng
                      ? `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name)}`
                    return (
                      <div key={stop.id} style={{ display: 'flex', gap: 10, paddingBottom: i < stops.length - 1 ? 14 : 0, position: 'relative' }}>
                        {i < stops.length - 1 && <div style={{ position: 'absolute', left: 15, top: 30, bottom: 0, width: 1, background: 'var(--border)' }} />}
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, zIndex: 1 }}>{meta.emoji}</div>
                        <div style={{ flex: 1, paddingTop: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 500 }}>{stop.name}</p>
                              {(stop.time_slot || stop.note) && (
                                <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>{[stop.time_slot, stop.note].filter(Boolean).join(' · ')}</p>
                              )}
                              {stop.cost > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-light)', padding: '1px 6px', borderRadius: 20, marginTop: 3, display: 'inline-block' }}>${stop.cost}</span>}
                            </div>
                            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer"
                              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, color: 'var(--accent)', fontSize: 14 }}
                              title="Directions">
                              🧭
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Photos */}
              {dayPhotos.length > 0 && (
                <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-light)', padding: '10px 0 8px' }}>📷 Photos ({dayPhotos.length})</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                    {dayPhotos.map((url, i) => (
                      <div key={i} onClick={() => setLightbox({ photos: dayPhotos, idx: i })}
                        style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: 'var(--cream-dark)', cursor: 'pointer' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Journal */}
              {day.journal && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--cream)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-muted)', marginBottom: 4 }}>✍️ Notes</p>
                  <p style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.6 }}>{day.journal}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', background: 'var(--white)', borderTop: '1px solid var(--border)', textAlign: 'center', flexShrink: 0 }}>
        <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Shared via <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Triplan</span> · <a href="/" style={{ color: 'var(--accent)' }}>Plan your own trip →</a></p>
      </div>

      {lightbox && <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.idx} onClose={() => setLightbox(null)} />}
    </div>
  )
}
