export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getDayDistance(stops) {
  const geo = stops.filter(s => s.lat && s.lng)
  let total = 0
  for (let i = 1; i < geo.length; i++) total += haversine(geo[i-1].lat, geo[i-1].lng, geo[i].lat, geo[i].lng)
  return total
}

export function optimizeRoute(stops) {
  const withCoords = stops.filter(s => s.lat && s.lng)
  const without = stops.filter(s => !s.lat || !s.lng)
  if (withCoords.length < 2) return stops
  const visited = new Set([0])
  const result = [withCoords[0]]
  while (result.length < withCoords.length) {
    const last = result[result.length - 1]
    let best = -1, bestDist = Infinity
    for (let i = 0; i < withCoords.length; i++) {
      if (visited.has(i)) continue
      const d = haversine(last.lat, last.lng, withCoords[i].lat, withCoords[i].lng)
      if (d < bestDist) { bestDist = d; best = i }
    }
    visited.add(best)
    result.push(withCoords[best])
  }
  return [...result, ...without].map((s, i) => ({ ...s, sort_order: i }))
}
