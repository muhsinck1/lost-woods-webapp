/**
 * Shared trail metadata — imported by both MapCore (click handlers)
 * and TrailsListPanel (trail cards UI).
 */
export interface TrailMeta {
  name: string
  difficulty: string
  distance: string
  duration: string
  note: string
  habitats: string[]
  color: string          // trail line colour on map
  dataPath: string       // GeoJSON path relative to /public
}

export const TRAIL_META: Record<string, TrailMeta> = {
  burley: {
    name:       'Henfield Trail',
    difficulty: 'Moderate',
    distance:   '7.6 km',
    duration:   '2h 30m',
    note:       'Passes ancient oak hedgerows, wetland margins and open farmland edging Sussex deciduous woodland.',
    habitats:   ['Deciduous Woodland', 'Wetland Margin', 'Lowland Meadow'],
    color:      '#ff8c42',
    dataPath:   '/data/burlyevillagetrails.geojson',
  },
  emery: {
    name:       "Butcher's Wood Trail",
    difficulty: 'Moderate–Challenging',
    distance:   '9.5 km',
    duration:   '3h 00m',
    note:       "Winds through veteran trees and fungi-rich woodland floor from Danny House to the Hurstpierpoint Folly Tower.",
    habitats:   ['Ancient Woodland', 'Wood Pasture', 'Hedgerow'],
    color:      '#ff4d6d',
    dataPath:   '/data/emerydowncircle.geojson',
  },
  reihan: {
    name:       'Tottington Trail',
    difficulty: 'Easy–Moderate',
    distance:   '5.4 km',
    duration:   '2h 00m',
    note:       'Varied route across grassy fields into ancient woodland — ideal for birdwatching with open South Downs views.',
    habitats:   ['Lowland Grassland', 'Ancient Woodland', 'Valley Bog'],
    color:      '#f59e0b',
    dataPath:   '/data/reihanfiled.geojson',
  },
}
