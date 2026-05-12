import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE } from '../lib/supabase'
import { useLang } from '../hooks/useLang'

// Tell MapLibre how to render Hebrew/Arabic labels correctly.
// Without this, the renderer outputs RTL text reversed character-by-character.
// The plugin file is self-hosted in public/ (copied from
// @mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js) so the PWA still works
// offline once cached. Safe to call repeatedly — MapLibre ignores re-calls.
// `lazy: true` defers download until the first RTL glyph appears on a tile.
if (typeof window !== 'undefined' && maplibregl.getRTLTextPluginStatus &&
    maplibregl.getRTLTextPluginStatus() === 'unavailable') {
  maplibregl.setRTLTextPlugin('/mapbox-gl-rtl-text.js', null, true)
}

const POPUP_STRINGS = {
  he: { day: 'יום', stop: 'עצירה', food: 'אוכל/מים', hotel: 'מחנה/לינה', transport: 'תחבורה', waypoint: 'נקודת ציון', attraction: 'נקודת תצפית' },
  en: { day: 'Day', stop: 'Stop', food: 'Food/Water', hotel: 'Camp/Lodge', transport: 'Transport', waypoint: 'Waypoint', attraction: 'Viewpoint' },
}

// Tell MapLibre how to render Hebrew/Arabic labels correctly.
// Without this, the renderer outputs RTL text reversed character-by-character.
// Must be called BEFORE any map is constructed; safe to call repeatedly —
// MapLibre ignores second+ calls. `lazy: true` defers download until the
// first RTL glyph is seen on a tile.
if (maplibregl.getRTLTextPluginStatus && maplibregl.getRTLTextPluginStatus() === 'unavailable') {
  maplibregl.setRTLTextPlugin(rtlTextPluginUrl, null, true)
}

// Props:
//   days – array of { id, day_number, color, stops: [{ id, name, type, lat, lng, time_slot, note }] }
//   onSelect – called with stop object when pin is tapped
export default function TripMap({ days = [], onSelect }) {
  const { lang } = useLang()
  const isHe = lang === 'he'
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const popupRef = useRef(null)

  // Init map once
  useEffect(() => {
    if (mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [0, 20],
      zoom: 2,
      attributionControl: false, // we add a compact one below
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    // Required by ODbL license: show OpenStreetMap attribution
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Update markers + routes whenever days change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const ready = () => {
      // Clear old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }

      // Remove old route layers/sources
      const existingLayers = map.getStyle().layers.map(l => l.id).filter(id => id.startsWith('route-day-'))
      existingLayers.forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
      const existingSources = Object.keys(map.getStyle().sources).filter(id => id.startsWith('route-day-'))
      existingSources.forEach(id => { if (map.getSource(id)) map.removeSource(id) })

      const allValid = []
      let globalStopIndex = 1

      days.forEach((day) => {
        const validStops = (day.stops || []).filter(s => s.lat && s.lng)
        if (!validStops.length) return

        const dayColor = day.color || '#C4622D'

        // Draw route for this day
        if (validStops.length > 1) {
          const coords = validStops.map(s => [s.lng, s.lat])
          const sourceId = `route-day-${day.id}`
          map.addSource(sourceId, {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
          })
          map.addLayer({
            id: sourceId,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': dayColor,
              'line-width': 2.5,
              'line-opacity': 0.7,
              'line-dasharray': [2, 3],
            }
          })
        }

        // Draw pins numbered globally across all days
        validStops.forEach((stop) => {
          const stopNum = globalStopIndex++
          const el = document.createElement('div')
          el.innerHTML = `
            <div style="
              position:relative; cursor:pointer;
              filter: drop-shadow(0 2px 6px rgba(0,0,0,0.28));
              transition: transform 0.15s;
            " class="map-pin">
              <svg width="30" height="38" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z" fill="${dayColor}"/>
                <circle cx="16" cy="16" r="6" fill="white" fill-opacity="0.9"/>
                <text x="16" y="20" text-anchor="middle" font-size="9" font-weight="700" fill="${dayColor}" font-family="DM Sans,sans-serif">${stopNum}</text>
              </svg>
            </div>`
          el.style.cssText = 'width:30px;height:38px;'
          el.addEventListener('mouseenter', () => el.querySelector('.map-pin').style.transform = 'scale(1.18) translateY(-2px)')
          el.addEventListener('mouseleave', () => el.querySelector('.map-pin').style.transform = '')
          el.addEventListener('click', () => {
            if (popupRef.current) popupRef.current.remove()
            const s = POPUP_STRINGS[isHe ? 'he' : 'en']
            const typeLabel = s[stop.type] || s.attraction
            const dir = isHe ? 'rtl' : 'ltr'
            const popup = new maplibregl.Popup({ closeButton: false, offset: [0, -42], maxWidth: '240px' })
              .setLngLat([stop.lng, stop.lat])
              .setHTML(`
                <div dir="${dir}" style="font-family:'DM Sans',sans-serif;">
                  <div style="font-size:10px;font-weight:600;color:${dayColor};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">
                    ${s.day} ${day.day_number} · ${s.stop} ${stopNum}
                  </div>
                  <div style="font-size:15px;font-weight:500;color:#1A1612;margin-bottom:2px">${stop.name}</div>
                  <div style="font-size:11px;color:${dayColor};margin-bottom:2px">${typeLabel}</div>
                  ${stop.time_slot ? `<div style="font-size:12px;color:#7A6E64">${stop.time_slot}${stop.note ? ' · ' + stop.note : ''}</div>` : ''}
                </div>`)
              .addTo(map)
            popupRef.current = popup
            if (onSelect) onSelect(stop)
          })
          const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([stop.lng, stop.lat])
            .addTo(map)
          markersRef.current.push(marker)
          allValid.push(stop)
        })
      })

      // Fit bounds to all visible stops
      if (allValid.length === 1) {
        map.flyTo({ center: [allValid[0].lng, allValid[0].lat], zoom: 14, duration: 800 })
      } else if (allValid.length > 1) {
        const lngs = allValid.map(s => s.lng)
        const lats = allValid.map(s => s.lat)
        map.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: { top: 80, bottom: 80, left: 40, right: 40 }, duration: 800, maxZoom: 14 }
        )
      }
    }

    if (map.isStyleLoaded()) ready()
    else map.once('load', ready)
  }, [days, isHe])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  )
}
