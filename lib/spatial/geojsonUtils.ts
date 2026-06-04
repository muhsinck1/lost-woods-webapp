/**
 * Spatial utilities — lightweight GeoJSON helpers
 * These avoid heavy Turf.js in the browser bundle.
 */

export type Coordinate = [number, number]
export type GeoFeature = { type: string; geometry: Record<string, unknown>; properties: Record<string, unknown> }

/** Calculate rough bounding box of a GeoJSON FeatureCollection */
export function getBounds(geojson: { features: GeoFeature[] }): [[number, number], [number, number]] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity

  const processCoord = ([lng, lat]: number[]) => {
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  }

  const processGeometry = (geom: Record<string, unknown>) => {
    const coords = geom.coordinates as unknown[]
    if (!coords) return
    if (geom.type === 'Point') processCoord(coords as number[])
    else if (geom.type === 'LineString') (coords as number[][]).forEach(processCoord)
    else if (geom.type === 'Polygon') (coords as number[][][]).forEach(r => r.forEach(processCoord))
    else if (geom.type === 'MultiPolygon') (coords as number[][][][]).forEach(p => p.forEach(r => r.forEach(processCoord)))
  }

  geojson.features.forEach(f => processGeometry(f.geometry))
  return [[minLng, minLat], [maxLng, maxLat]]
}

/** Filter features within a rough bounding box */
export function filterByBounds(
  features: GeoFeature[],
  bounds: [[number, number], [number, number]]
): GeoFeature[] {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds
  return features.filter(f => {
    const g = f.geometry
    if (g.type === 'Point') {
      const [lng, lat] = (g as { coordinates: number[] }).coordinates
      return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
    }
    return true
  })
}

/** Simple distance in km (Haversine) */
export function distanceKm([lng1, lat1]: Coordinate, [lng2, lat2]: Coordinate): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
