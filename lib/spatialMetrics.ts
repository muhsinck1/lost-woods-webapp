export interface SpatialMetrics {
  totalRecords: number
  sensitivityIndex: number
  dominantKingdom: string
  dominantPct: number
}

// Compute metrics based on currently visible geometries and layer intersections
export function computeSpatialMetrics(
  activeLayers: Record<string, any>,
  visibleFeaturesLength: number,
  kingdomCounts: { birds: number; fungi: number; plants: number }
): SpatialMetrics {
  const totalRecords = visibleFeaturesLength || Object.values(kingdomCounts).reduce((a, b) => a + b, 0)
  
  // Calculate dominant kingdom
  let dominantKingdom = 'Unknown'
  let highestCount = 0
  for (const [k, v] of Object.entries(kingdomCounts)) {
    if (v > highestCount) {
      highestCount = v
      dominantKingdom = k.charAt(0).toUpperCase() + k.slice(1)
    }
  }

  const dominantPct = totalRecords > 0 ? (highestCount / totalRecords) * 100 : 0

  // Calculate environmental sensitivity index (Base formula)
  let sensitivityIndex = 0

  if (activeLayers['phi']?.visible || activeLayers['priority-habitats']?.visible) sensitivityIndex += 40
  if (kingdomCounts.birds > 0 || kingdomCounts.fungi > 0) sensitivityIndex += 30 // Protected presence bump
  if (activeLayers['ecohabitat']?.visible || activeLayers['ecological-habitat']?.visible) sensitivityIndex += 20
  if (activeLayers['trail-impact']?.visible) sensitivityIndex += 10

  // Constrain between 0-100%
  sensitivityIndex = Math.min(Math.max(sensitivityIndex, 0), 100)

  return {
    totalRecords,
    sensitivityIndex,
    dominantKingdom,
    dominantPct
  }
}
