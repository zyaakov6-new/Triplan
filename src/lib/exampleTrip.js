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
 * sample and start fresh" button knows which trip to remove — without
 * needing an `is_example` column on the trips table.
 */
import { supabase } from './supabase'

const EXAMPLE_KEY = 'triplan_example_trip_id'

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

  // 1. Trip row
  const { data: trip, error: tripErr } = await supabase
    .from('trips')
    .insert({
      owner_id: userId,
      name: data.name,
      destination: data.destination,
      date_start: null,
      date_end: null,
      color_theme: 'forest',
    })
    .select()
    .single()
  if (tripErr || !trip) {
    console.error('[exampleTrip] trip insert failed', tripErr)
    return null
  }

  // 2. Owner member row
  await supabase.from('trip_members').insert({ trip_id: trip.id, user_id: userId, role: 'owner' })

  // 3. Days + stops. We insert days serially so we get IDs back, then batch
  //    each day's stops.
  for (let i = 0; i < data.days.length; i++) {
    const d = data.days[i]
    const { data: dayRow } = await supabase
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

    if (!dayRow) continue

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
    await supabase.from('stops').insert(stopRows)
  }

  // 4. Packing items
  const packingRows = data.packing.map(text => ({ trip_id: trip.id, text }))
  await supabase.from('packing_items').insert(packingRows)

  // Remember which trip is the example so we can delete it on demand.
  try { localStorage.setItem(EXAMPLE_KEY, trip.id) } catch {}

  return trip
}

export function getExampleTripId() {
  try { return localStorage.getItem(EXAMPLE_KEY) } catch { return null }
}

export function clearExampleTripId() {
  try { localStorage.removeItem(EXAMPLE_KEY) } catch {}
}

export async function deleteExampleTrip() {
  const id = getExampleTripId()
  if (!id) return
  await supabase.from('trips').delete().eq('id', id)
  clearExampleTripId()
}
