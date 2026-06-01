/**
 * Data Normalization Layer
 * Transforms diverse GeoJSON properties into a confident, unified schema.
 * Supports iNaturalist exports (LostWoods Project) and legacy NBN/NFNPA formats.
 */

export interface NormalizedSpecies {
  id: string
  species_name: string
  scientific_name: string
  category: string
  habitat: string
  description: string | null
  latitude: number | null
  longitude: number | null
  image: string | null
  audio: string | null
  source: string
  count?: number
  date?: string
  recorder?: string
  rawProperties: Record<string, unknown>
}

export function normalizeFeatureProps(
  properties: Record<string, unknown> | null,
  geometry?: any
): NormalizedSpecies | null {
  if (!properties) return null

  // 1. Identify Category
  // iNaturalist uses iconic_taxon_name (Aves, Fungi, Plantae), legacy uses type/Type
  const iconicTaxon = (properties?.iconic_taxon_name as string || '').toLowerCase()
  let categoryRaw = (properties?.type || properties?.Type || 'Species') as string
  if (iconicTaxon.includes('aves'))    categoryRaw = 'Bird'
  if (iconicTaxon.includes('fungi'))   categoryRaw = 'Fungi'
  if (iconicTaxon.includes('plantae')) categoryRaw = 'Plant'
  const category = categoryRaw.charAt(0).toUpperCase() + categoryRaw.slice(1).toLowerCase()

  // 2. Resolve Names
  // iNaturalist: common_name + scientific_name
  // Legacy NBN: Common_Name + Latin_Name
  let species_name =
    (properties?.common_name as string) ||
    (properties?.Common_Name as string) ||
    (properties?.species_guess as string) ||
    (properties?.name as string)

  let scientific_name =
    (properties?.scientific_name as string) ||
    (properties?.Latin_Name as string) ||
    (properties?.scientific as string)

  if (!species_name && scientific_name) {
    species_name = scientific_name
  } else if (!species_name) {
    species_name = `Unidentified ${category}`
  }
  scientific_name = scientific_name || 'Unknown'

  // 3. Coordinates
  let latitude  = (properties?.latitude  as number) ?? (properties?.lat as number) ?? null
  let longitude = (properties?.longitude as number) ?? (properties?.lon as number) ?? (properties?.lng as number) ?? null
  if (geometry?.type === 'Point') {
    longitude = geometry.coordinates[0]
    latitude  = geometry.coordinates[1]
  }

  // 4. Habitat — iNaturalist has place_guess, legacy has Broad_Habitat
  const habitat =
    (properties?.Broad_Habitat as string) ||
    (properties?.habitat as string) ||
    (properties?.place_guess as string) ||
    'West Sussex Woodland'

  const description = (properties?.Notes as string) || (properties?.description as string) || null

  // 5. Source — iNaturalist URL or legacy source field
  const source =
    (properties?.url as string) ||
    (properties?.source as string) ||
    'iNaturalist / LostWoods Project'

  // 6. Recorder — iNaturalist user_login or legacy Recorder
  const recorder =
    (properties?.user_login as string) ||
    (properties?.user_name as string) ||
    (properties?.Recorder as string) ||
    undefined

  // 7. Date — iNaturalist observed_on or legacy Date
  const date =
    (properties?.observed_on as string) ||
    (properties?.Date as string) ||
    undefined

  return {
    id: String(properties?.id || properties?.OBJECTID || Math.random().toString(36).substr(2, 9)),
    species_name,
    scientific_name,
    category,
    habitat,
    description: description !== 'None' ? description : null,
    latitude,
    longitude,
    image: (properties?.image_url as string) || null,
    audio: (properties?.sound_url as string) || (properties?.audio_url as string) || null,
    source,
    count: properties?.Count__Abun ? Number(properties.Count__Abun) : undefined,
    date,
    recorder,
    rawProperties: properties,
  }
}
