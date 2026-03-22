export default function BeautifulPrintView({ trip, days, themeColor = '#C4622D' }) {
  const allStops = days.flatMap(d => d.stops || [])
  const totalBudget = allStops.reduce((s, st) => s + (st.cost || 0), 0)

  const TYPE_META = {
    attraction: { emoji: '🏛' }, food: { emoji: '🍽' },
    hotel: { emoji: '🏨' }, transport: { emoji: '🚌' },
  }

  const accentPale = themeColor + '18'
  const accentMid = themeColor + '30'

  const dateRange = trip.date_start
    ? `${new Date(trip.date_start).toLocaleDateString('en', { month: 'long', day: 'numeric' })}${trip.date_end ? ` – ${new Date(trip.date_end).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}` : `, ${new Date(trip.date_start).getFullYear()}`}`
    : null

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1A1612', maxWidth: 680, margin: '0 auto' }}>
      {/* Colored top stripe */}
      <div style={{ height: 6, background: themeColor, marginBottom: 28 }} />

      {/* Cover */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: accentPale, border: `2px solid ${accentMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
          {trip.cover_emoji || '✈️'}
        </div>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.1 }}>{trip.name}</h1>
          {trip.destination && <p style={{ fontSize: 15, color: '#7A6E64', margin: '0 0 3px' }}>{trip.destination}</p>}
          {dateRange && <p style={{ fontSize: 13, color: themeColor, fontWeight: 600, margin: 0 }}>{dateRange}</p>}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${accentMid}` }}>
        {[
          { value: days.length, label: 'Days' },
          { value: allStops.length, label: 'Stops' },
          ...(totalBudget > 0 ? [{ value: `$${totalBudget.toFixed(0)}`, label: 'Budget' }] : []),
          { value: [...new Set(days.map(d => d.city).filter(Boolean))].length, label: 'Cities' },
        ].map((stat, i, arr) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: i % 2 === 0 ? accentPale : 'white', borderRight: i < arr.length - 1 ? `1px solid ${accentMid}` : 'none' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: themeColor, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: '#7A6E64', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Days */}
      {days.map((day, di) => {
        const dayBudget = (day.stops || []).reduce((s, st) => s + (st.cost || 0), 0)
        return (
          <div key={day.id} style={{ marginBottom: 32, pageBreakInside: 'avoid' }}>
            {/* Day header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${themeColor}` }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: themeColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Day</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1 }}>{day.day_number}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, margin: 0 }}>{day.city}</h2>
                {day.trip_date && <p style={{ fontSize: 12, color: '#7A6E64', margin: '2px 0 0' }}>{new Date(day.trip_date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>}
              </div>
              {dayBudget > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#7A6E64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day Budget</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: themeColor }}>${dayBudget.toFixed(0)}</div>
                </div>
              )}
            </div>

            {/* Stops */}
            {(day.stops || []).length > 0 && (
              <div style={{ paddingLeft: 8 }}>
                {(day.stops || []).map((stop, i) => {
                  const meta = TYPE_META[stop.type] || TYPE_META.attraction
                  return (
                    <div key={stop.id} style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: accentPale, border: `2px solid ${themeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, zIndex: 1 }}>{meta.emoji}</div>
                        {i < (day.stops || []).length - 1 && <div style={{ width: 1.5, flex: 1, background: accentMid, minHeight: 12 }} />}
                      </div>
                      <div style={{ flex: 1, paddingTop: 4, paddingBottom: i < (day.stops || []).length - 1 ? 10 : 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{stop.name}</span>
                            {stop.time_slot && <span style={{ fontSize: 12, color: '#7A6E64', marginLeft: 8 }}>· {stop.time_slot}</span>}
                            {stop.note && <p style={{ fontSize: 12, color: '#7A6E64', margin: '2px 0 0', lineHeight: 1.5 }}>{stop.note}</p>}
                          </div>
                          {stop.cost > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: themeColor, background: accentPale, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>${stop.cost}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Journal */}
            {day.journal && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#F5F0E8', borderRadius: 8, borderLeft: `3px solid ${themeColor}` }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#7A6E64', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>✍️ Notes</p>
                <p style={{ fontSize: 13, color: '#4A3F35', lineHeight: 1.6, margin: 0 }}>{day.journal}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Total */}
      {totalBudget > 0 && (
        <div style={{ paddingTop: 16, borderTop: `2px solid ${themeColor}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 14, color: '#7A6E64', fontWeight: 500 }}>Total trip budget</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: themeColor }}>${totalBudget.toFixed(2)}</span>
        </div>
      )}

      <div style={{ marginTop: 32, paddingTop: 12, borderTop: '1px solid #D4C5A9', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#B5A48A', margin: 0 }}>Made with Triplan</p>
      </div>
    </div>
  )
}
