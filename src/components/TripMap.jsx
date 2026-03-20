import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { MAP_STYLE } from '../lib/supabase'

// Draws the map, route line, and stop markers.
// Props:
//   stops   – array of { id, name, type, lat, lng, time_slot, note }
//   onSelect – called with a stop object when a pin is tapped
//   focusDay – if set, only show stops for that day (pass all stops already filtered)
export default function TripMap({ stops = [], onSelect }) {
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
      center: [12.4922, 41.8902], // default: Rome
      zoom: 5,
      attributionControl: false,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Update markers + route whenever stops change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const ready = () => {
      // Clear old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }

      // Remove old route layer
      if (map.getLayer('route')) map.removeLayer('route')
      if (map.getSource('route')) map.removeSource('route')

      const validStops = stops.filter(s => s.lat && s.lng)
      if (!validStops.length) return

      const typeColor = { attraction: '#C4622D', food: '#2D6B6B', hotel: '#5B3D8F', transport: '#2D5C8E' }

      // Add markers
      validStops.forEach((stop, i) => {
        const color = typeColor[stop.type] || '#4A3F35'
        const el = document.createElement('div')
        el.innerHTML = `
          <div style="
            position:relative; cursor:pointer;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
            transition: transform 0.15s;
          " class="map-pin">
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z" fill="${color}"/>
              <circle cx="16" cy="16" r="6" fill="white" fill-opacity="0.9"/>
              <text x="16" y="20" text-anchor="middle" font-size="9" font-weight="700" fill="${color}" font-family="DM Sans,sans-serif">${i + 1}</text>
            </svg>
          </div>`
        el.style.cssText = 'width:32px;height:40px;'
        el.addEventListener('mouseenter', () => el.querySelector('.map-pin').style.transform = 'scale(1.15) translateY(-2px)')
        el.addEventListener('mouseleave', () => el.querySelector('.map-pin').style.transform = '')
        el.addEventListener('click', () => {
          if (popupRef.current) { popupRef.current.remove() }
          const popup = new maplibregl.Popup({ closeButton: false, offset: [0, -42], maxWidth: '240px' })
            .setLngLat([stop.lng, stop.lat])
            .setHTML(`
              <div style="font-family:'DM Sans',sans-serif;">
                <div style="font-size:11px;font-weight:600;color:${color};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">
                  ${stop.type === 'food' ? '🍽 Restaurant' : stop.type === 'hotel' ? '🏨 Hotel' : stop.type === 'transport' ? '🚌 Transport' : '🏛 Attraction'}
                </div>
                <div style="font-size:15px;font-weight:500;color:#1A1612;margin-bottom:2px">${stop.name}</div>
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
      })

      // Draw route line through all stops in order
      if (validStops.length > 1) {
        const coords = validStops.map(s => [s.lng, s.lat])
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
        })
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#C4622D',
            'line-width': 2.5,
            'line-opacity': 0.65,
            'line-dasharray': [2, 3],
          }
        })
      }

      // Fit bounds to show all stops
      if (validStops.length === 1) {
        map.flyTo({ center: [validStops[0].lng, validStops[0].lat], zoom: 14, duration: 800 })
      } else {
        const lngs = validStops.map(s => s.lng)
        const lats = validStops.map(s => s.lat)
        map.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: { top: 80, bottom: 80, left: 40, right: 40 }, duration: 800, maxZoom: 14 }
        )
      }
    }

    if (mapRef.current.isStyleLoaded()) ready()
    else mapRef.current.once('load', ready)
  }, [stops])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  )
}
