/**
 * Create a sample trip on first login so the new user has something to poke
 * at instead of an empty list.  Returns the trip row.
 *
 * The sample is a real Israeli route (Yam-le-Yam, the classic "sea to sea"
 * 3-day trek across the Galilee) because that's our focus audience.  Each
 * stop has real-ish coordinates so the Map tab is interesting, real notes
 * so the daily-detail view isn't empty, and the packing list has the items
 * you'd actually bring for a multi-day hike.
 *
 * We tag the trip ID in localStorage so the onboarding flow's "delete this
 * sample and start fresh" button knows which trip to remove - without
 * needing an `is_example` column on the trips table.
 */
import { supabase } from './supabase'

// Per-user key so the example trip ID from User A isn't used when User B
// signs in on the same browser. The plain `triplan_example_trip_id` key was
// shared across all accounts, which caused stale-ID bugs.
const EXAMPLE_KEY = (userId) => `triplan_example_trip_id_${userId}`

const SAMPLE = {
  he: {
    name: 'דוגמה: ים אל ים · 3 ימי טרק',
    destination: 'הגליל העליון',
    days: [
      {
        city: 'נחל כזיב',
        physical_note: 'יום מתון. בעיקר ירידה לתוך הנחל. נעליים סגורות חובה.',
        logistics_note: 'חניית הזנקה בחוף אכזיב. שאטל חזרה מהיעד.',
        journal: '',
        stops: [
          { name: 'חוף אכזיב',         type: 'waypoint',   lat: 33.0492, lng: 35.1024, time_slot: '07:00', note: 'נקודת התחלה. מים אחרונים לפני הכניסה לנחל.' },
          { name: 'מעיין עין זיו',     type: 'food',       lat: 33.0438, lng: 35.1612, time_slot: '11:00', note: 'מילוי מים. מקום טוב לארוחת בוקר שנייה.' },
          { name: 'מבצר מונפור',       type: 'attraction', lat: 33.0506, lng: 35.2226, time_slot: '14:30', note: 'תצפית של הצלבנים. שווה לעלות.' },
          { name: 'קמפינג נחל כזיב',   type: 'hotel',      lat: 33.0451, lng: 35.2354, time_slot: '17:00', note: 'אזור לינה. אש בטיחותית בלבד.' },
        ]
      },
      {
        city: 'פארק גורן',
        physical_note: 'יום ארוך, 18 ק״מ. עליה משמעותית. צריך הרבה מים.',
        logistics_note: 'אין חנות בדרך. הצטיידו בבוקר בכפר ראש הנקרה.',
        journal: '',
        stops: [
          { name: 'נחל כזיב, יציאה',   type: 'waypoint',   lat: 33.0451, lng: 35.2354, time_slot: '06:30', note: 'יציאה מוקדמת בגלל החום.' },
          { name: 'מעיין תמרים',       type: 'food',       lat: 33.0298, lng: 35.2812, time_slot: '09:30', note: 'מעיין יציב. מילוי מים אחרון לפני העלייה.' },
          { name: 'תצפית הר אדיר',     type: 'attraction', lat: 33.0124, lng: 35.3057, time_slot: '13:00', note: 'תצפית 360°. ארוחת צהריים מומלצת.' },
          { name: 'פארק גורן, חניון',  type: 'hotel',      lat: 33.0205, lng: 35.3204, time_slot: '18:00', note: 'חניון לילה. ברזיה ושירותים.' },
        ]
      },
      {
        city: 'הכנרת',
        physical_note: 'יום קל יחסית, סיום ביציאה לכנרת. שחייה בסוף!',
        logistics_note: 'איסוף מחוף גינוסר ב-17:00.',
        journal: '',
        stops: [
          { name: 'פארק גורן, יציאה',  type: 'waypoint',   lat: 33.0205, lng: 35.3204, time_slot: '07:00', note: '' },
          { name: 'נחל מירון',         type: 'attraction', lat: 32.9851, lng: 35.4109, time_slot: '11:00', note: 'נחל איתן עם בריכות שחייה.' },
          { name: 'הר מירון, תצפית',   type: 'attraction', lat: 32.9947, lng: 35.4196, time_slot: '14:00', note: 'נקודה הכי גבוהה בישראל אחרי הר חרמון.' },
          { name: 'חוף גינוסר',        type: 'waypoint',   lat: 32.8442, lng: 35.5247, time_slot: '17:00', note: 'יעד! שחייה בכנרת.' },
        ]
      }
    ],
    packing: ['דרכון/ת.ז.', 'תיק יום', 'בקבוקי מים (3 ליטר ליום)', 'נעלי טיולים', 'גרביים גבוהות', 'כובע רחב שוליים', 'קרם הגנה', 'מקל הליכה', 'פנס ראש', 'ערכת עזרה ראשונה', 'מטען נייד', 'אוכל לדרך', 'שק שינה'],
  },
  en: {
    name: 'Sample: Yam-le-Yam · 3-day trek',
    destination: 'Upper Galilee, Israel',
    days: [
      {
        city: 'Nahal Kziv',
        physical_note: 'Moderate day. Mostly descending into the canyon. Closed shoes required.',
        logistics_note: 'Park at Achziv beach. Shuttle back arranged at the end.',
        journal: '',
        stops: [
          { name: 'Achziv Beach',         type: 'waypoint',   lat: 33.0492, lng: 35.1024, time_slot: '07:00', note: 'Trailhead. Last fresh water before the canyon.' },
          { name: 'Ein Ziv spring',       type: 'food',       lat: 33.0438, lng: 35.1612, time_slot: '11:00', note: 'Refill water. Good spot for second breakfast.' },
          { name: 'Montfort Castle',      type: 'attraction', lat: 33.0506, lng: 35.2226, time_slot: '14:30', note: 'Crusader fortress with a 360° view. Worth the climb.' },
          { name: 'Kziv camp',            type: 'hotel',      lat: 33.0451, lng: 35.2354, time_slot: '17:00', note: 'Designated camping area. Safe fire only.' },
        ]
      },
      {
        city: 'Goren Park',
        physical_note: 'Long day, 18 km. Significant elevation gain. Carry plenty of water.',
        logistics_note: 'No shops on the route. Resupply at Rosh HaNikra village in the morning.',
        journal: '',
        stops: [
          { name: 'Nahal Kziv exit',      type: 'waypoint',   lat: 33.0451, lng: 35.2354, time_slot: '06:30', note: 'Early start to beat the heat.' },
          { name: 'Tmarim spring',        type: 'food',       lat: 33.0298, lng: 35.2812, time_slot: '09:30', note: 'Reliable spring. Last refill before the climb.' },
          { name: 'Mt Adir viewpoint',    type: 'attraction', lat: 33.0124, lng: 35.3057, time_slot: '13:00', note: '360° view. Lunch break here.' },
          { name: 'Goren Park campground',type: 'hotel',      lat: 33.0205, lng: 35.3204, time_slot: '18:00', note: 'Night stop. Tap water and toilets.' },
        ]
      },
      {
        city: 'Sea of Galilee',
        physical_note: 'Easier day, ending at the lake. Swim at the end!',
        logistics_note: 'Pickup from Ginosar beach at 17:00.',
        journal: '',
        stops: [
          { name: 'Goren Park exit',      type: 'waypoint',   lat: 33.0205, lng: 35.3204, time_slot: '07:00', note: '' },
          { name: 'Nahal Meiron',         type: 'attraction', lat: 32.9851, lng: 35.4109, time_slot: '11:00', note: 'Perennial stream with swimming pools.' },
          { name: 'Mt Meiron summit',     type: 'attraction', lat: 32.9947, lng: 35.4196, time_slot: '14:00', note: "Israel's second highest peak after Hermon." },
          { name: 'Ginosar Beach',        type: 'waypoint',   lat: 32.8442, lng: 35.5247, time_slot: '17:00', note: 'Finish line! Swim in the Sea of Galilee.' },
        ]
      }
    ],
    packing: ['Passport / ID', 'Day pack', 'Water bottles (3L/day)', 'Hiking shoes', 'Long socks', 'Wide-brim hat', 'Sunscreen', 'Trekking pole', 'Headlamp', 'First aid kit', 'Power bank', 'Trail food', 'Sleeping bag'],
  }
}

export async function createExampleTrip(userId, lang = 'en') {
  const data = SAMPLE[lang === 'he' ? 'he' : 'en']
  console.log('[exampleTrip] starting for user', userId, 'lang', lang)

  // 1. Trip row - try a few color_theme values since we don't know which
  //    ones exist on this Supabase. Some schemas have only 'terracotta'.
  let trip = null
  for (const theme of ['forest', 'terracotta']) {
    const { data: t, error } = await supabase
      .from('trips')
      .insert({
        owner_id: userId,
        name: data.name,
        destination: data.destination,
        date_start: null,
        date_end: null,
        color_theme: theme,
      })
      .select()
      .single()
    if (t) { trip = t; break }
    if (error) console.warn('[exampleTrip] trip insert with theme=' + theme + ' failed:', error.message)
  }
  if (!trip) {
    console.error('[exampleTrip] could not create trip after retries')
    return null
  }
  console.log('[exampleTrip] trip created', trip.id)

  // 2. Owner member row (best-effort - schema may auto-add via trigger)
  const { error: memberErr } = await supabase
    .from('trip_members')
    .insert({ trip_id: trip.id, user_id: userId, role: 'owner' })
  if (memberErr) console.warn('[exampleTrip] member insert (probably already via trigger):', memberErr.message)

  // 3. Days + stops. Days are inserted serially because we need the IDs.
  //    If the optional note columns (physical_note / logistics_note / journal)
  //    don't exist in this schema, we fall back to a minimal insert.
  for (let i = 0; i < data.days.length; i++) {
    const d = data.days[i]
    let dayRow = null

    // Try with notes first
    {
      const { data: row, error } = await supabase
        .from('trip_days')
        .insert({
          trip_id: trip.id,
          day_number: i + 1,
          city: d.city,
          trip_date: null,
          physical_note: d.physical_note || null,
          logistics_note: d.logistics_note || null,
          journal: d.journal || null,
        })
        .select()
        .single()
      if (row) dayRow = row
      else if (error) console.warn('[exampleTrip] day insert (with notes) failed:', error.message)
    }

    // Fallback: minimal day insert without notes
    if (!dayRow) {
      const { data: row, error } = await supabase
        .from('trip_days')
        .insert({ trip_id: trip.id, day_number: i + 1, city: d.city, trip_date: null })
        .select()
        .single()
      if (row) dayRow = row
      else if (error) {
        console.error('[exampleTrip] day insert (minimal) also failed:', error.message)
        continue
      }
    }

    const stopRows = d.stops.map((s, idx) => ({
      day_id: dayRow.id,
      name: s.name,
      type: s.type,
      lat: s.lat,
      lng: s.lng,
      time_slot: s.time_slot || null,
      note: s.note || null,
      sort_order: idx,
    }))
    const { error: stopsErr } = await supabase.from('stops').insert(stopRows)
    if (stopsErr) console.warn('[exampleTrip] stops insert for day', i + 1, 'failed:', stopsErr.message)
  }

  // 4. Packing items
  const packingRows = data.packing.map(text => ({ trip_id: trip.id, text }))
  const { error: packErr } = await supabase.from('packing_items').insert(packingRows)
  if (packErr) console.warn('[exampleTrip] packing insert failed:', packErr.message)

  // Remember which trip is the example so we can delete it on demand.
  try { localStorage.setItem(EXAMPLE_KEY(userId), trip.id) } catch {}

  console.log('[exampleTrip] done')
  return trip
}

export function getExampleTripId(userId) {
  if (!userId) return null
  try { return localStorage.getItem(EXAMPLE_KEY(userId)) } catch { return null }
}

export function clearExampleTripId(userId) {
  if (!userId) return
  try { localStorage.removeItem(EXAMPLE_KEY(userId)) } catch {}
}

export async function deleteExampleTrip(userId) {
  const id = getExampleTripId(userId)
  if (!id) return
  await supabase.from('trips').delete().eq('id', id)
  clearExampleTripId(userId)
}
