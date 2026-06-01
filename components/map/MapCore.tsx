'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useAppStore } from '@/lib/store/useAppStore'
import { normalizeFeatureProps } from '@/lib/spatial/normalizeData'
import { Home } from 'lucide-react'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

const MAP_CONFIG = {
  center: [-0.2300, 50.9250] as [number, number],
  zoom: 12.2,
  pitch: 35,
  bearing: 5,
  maxPitch: 85,
  minZoom: 8,
  maxBounds: [[-0.6, 50.8], [0.1, 51.1]] as [[number, number], [number, number]],
}

const DATA_PATHS: Record<string, string> = {
  boundary: '/data/boundary.geojson',
  burley:   '/data/burlyevillagetrails.geojson',
  emery:    '/data/emerydowncircle.geojson',
  reihan:   '/data/reihanfiled.geojson',
  ecohabitat:'/data/ecotrailhabitat.geojson',
  phi:      '/data/phinewforest.geojson',
  birds:    '/data/birds.geojson',
  fungi:    '/data/fungi.geojson',
  plants:   '/data/plants.geojson',
}

const TRAIL_STYLES: Record<string, { color: string; width: number; dash?: number[] }> = {
  burley: { color: '#ff8c42', width: 3, dash: [6, 3] },
  emery:  { color: '#ff4d6d', width: 3, dash: [6, 3] },
  reihan: { color: '#f59e0b', width: 3, dash: [6, 3] },
}

const SPECIES_STYLES: Record<string, { color: string; icon: string }> = {
  birds:  { color: '#38bdf8', icon: 'icon-bird' }, // Cyan / Sky blue
  plants: { color: '#10b981', icon: 'icon-plant' }, // Green botanical
  fungi:  { color: '#d946ef', icon: 'icon-fungi' }, // Magenta / Purple glow
}

/** Convert hex color to rgba string with given alpha (0-1) */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function getKeySpeciesForHabitat(mainHabs: string): string[] {
  const norm = (mainHabs || '').toLowerCase()
  if (norm.includes('woodland') || norm.includes('deciduous')) {
    return ['Tawny Owl', 'Greater Spotted Woodpecker', 'Bluebell', 'Stag Beetle']
  }
  if (norm.includes('calcareous') || norm.includes('grassland')) {
    return ['Chalkhill Blue Butterfly', 'Common Spotted Orchid', 'Skylark', 'Yellow Rattle']
  }
  if (norm.includes('heathland')) {
    return ['Dartford Warbler', 'Sand Lizard', 'Bell Heather', 'Silver-studded Blue']
  }
  if (norm.includes('fen') || norm.includes('wetland') || norm.includes('grazing marsh')) {
    return ['Marsh Harrier', 'Lapwing', 'Southern Marsh Orchid', 'Reed Bunting']
  }
  if (norm.includes('pond') || norm.includes('water')) {
    return ['Great Crested Newt', 'Common Toad', 'Water Crowfoot', 'Kingfisher']
  }
  if (norm.includes('orchard')) {
    return ['Bullfinch', 'Mistletoe', 'Noble Chafer Beetle', 'Common Redstart']
  }
  return ['Common Buzzard', 'Roe Deer', 'Wood Anemone', 'Speckled Wood Butterfly']
}

function getEcologicalStory(category: string, name: string): { relation: string, fact: string } {
  const cat = (category || '').toLowerCase()
  if (cat.includes('bird')) {
    return {
      relation: "Relies on the mosaic of woodland, hedgerow, and calcareous grassland habitats typical of the Sussex Downs.",
      fact: "West Sussex supports over 200 breeding bird species, with ancient woodlands providing critical nesting corridors."
    }
  }
  if (cat.includes('plant')) {
    return {
      relation: "Depends on the rich chalk soils and damp woodland edges characteristic of the Low Weald landscape.",
      fact: "The Sussex woodlands preserve nationally rare flora including Herb Paris and Wild Service Tree."
    }
  }
  if (cat.includes('fungi') || cat.includes('mushroom')) {
    return {
      relation: "Forms vital mycorrhizal networks beneath the roots of ancient oak and beech trees.",
      fact: "Deciduous woodland fungi are essential decomposers, recycling nutrients and sustaining the entire forest food web."
    }
  }
  return {
    relation: "Contributes to the rich biodiversity of the Low Weald and South Downs landscape.",
    fact: "The Lost Woods area sits within a nationally important wildlife corridor linking ancient Sussex woodlands."
  }
}

interface MapCoreProps {
  is3D: boolean
  onMapReady: (ready: boolean) => void
  onProgress: (p: { done: number; total: number }) => void
}

export default function MapCore({
  is3D,
  onMapReady,
  onProgress,
}: MapCoreProps) {
  const activeLayers = useAppStore(s => s.layers)
  const setGlobalStats = useAppStore(s => s.setGlobalStats)
  const setSelectedFeature = useAppStore(s => s.setSelectedFeature)
  const activeStoryId = useAppStore(s => s.activeStoryId)
  const activeView = useAppStore(s => s.activeView)
  const userLocation = useAppStore(s => s.userLocation)

  // Part 3.5: Fly to hiker's current location
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({ center: userLocation, zoom: 15, speed: 1.2, curve: 1.4 })
    }
  }, [userLocation])

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const layersReady = useRef(false)

  // ── Init map ──────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: buildMapStyle(),
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      pitch: MAP_CONFIG.pitch,
      bearing: MAP_CONFIG.bearing,
      maxPitch: MAP_CONFIG.maxPitch,
      minZoom: MAP_CONFIG.minZoom,
      maxBounds: MAP_CONFIG.maxBounds,
      antialias: true,
      renderWorldCopies: false,
    })

    mapRef.current = map

    // Cinematic Atmosphere (Fog & Light)
    map.on('style.load', () => {
      map.setFog({
        'range': [-1, 2],
        'color': '#050d07', // Match dark forest BG
        'high-color': '#112215',
        'space-color': '#000000',
        'star-intensity': 0.1,
      })

      // Add directional light if MAPBOX v2/v3 supports it natively
      if (map.setLight) {
        map.setLight({
          anchor: 'viewport',
          color: '#ffffff',
          intensity: 0.15,
          position: [1.15, 210, 30] // Soft morning angle
        })
      }
    })

    // Controls
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: true }), 'top-right')

    map.on('load', async () => {
      onMapReady(true)

      // Cinematic fly-in entrance
      map.flyTo({
        center: MAP_CONFIG.center,
        zoom: 12.2,
        pitch: 52,
        bearing: 20,
        duration: 3500,
        essential: true,
      })

      const total = Object.keys(DATA_PATHS).length
      let done = 0
      const stats = { birds: 0, fungi: 0, plants: 0 }
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'eco-habitat-popup'
      })

      const load = async (key: string, path: string) => {
        try {
          const res = await fetch(path)
          if (!res.ok) throw new Error(`${res.status}`)
          return await res.json()
        } catch {
          return null
        } finally {
          done++
          onProgress({ done, total })
        }
      }

      // ── Boundary ──
      const boundaryData = await load('boundary', DATA_PATHS.boundary)
      if (boundaryData) {
        map.addSource('boundary', { type: 'geojson', data: boundaryData })
        map.addLayer({
          id: 'boundary-fill',
          type: 'fill',
          source: 'boundary',
          paint: { 'fill-color': '#1a3d1f', 'fill-opacity': 0.03 },
        })
        map.addLayer({
          id: 'boundary-line',
          type: 'line',
          source: 'boundary',
          paint: {
            'line-color': '#22c55e',
            'line-width': 2.5,
            'line-dasharray': [5, 3],
            'line-opacity': 0.9,
          },
        })
      }

      // ── Priority Habitat ──
      const phiData = await load('phi', DATA_PATHS.phi)
      if (phiData) {
        map.addSource('phi', { type: 'geojson', data: phiData })
        map.addLayer({
          id: 'phi-fill',
          type: 'fill',
          source: 'phi',
          paint: { 
            'fill-color': [
              'match', ['get', 'MainHabs'],
              'Deciduous woodland',                         '#2d6a2d',
              'Lowland heathland',                         '#9b59b6',
              'Coastal and floodplain grazing marsh',       '#2980b9',
              'Lowland calcareous grassland',               '#f1c40f',
              'Good quality semi improved grassland',       '#27ae60',
              'Traditional orchard',                        '#e67e22',
              'Lowland dry acid grassland',                 '#d4ac0d',
              'Coastal saltmarsh',                          '#1abc9c',
              'Lowland meadows',                            '#a8d08d',
              'No main habitat but additional habitats present', '#7f8c8d',
              '#5d8a5d'
            ], 
            'fill-opacity': 0.55
          },
        })
        map.addLayer({
          id: 'phi-line',
          type: 'line',
          source: 'phi',
          paint: { 'line-color': '#ffffff', 'line-width': 0.6, 'line-opacity': 0.4 },
        })
      }

      // ── Eco Habitat Buffer & Habitat Suitability ──
      const ecoData = await load('ecohabitat', DATA_PATHS.ecohabitat)
      if (ecoData) {
        map.addSource('ecohabitat', { type: 'geojson', data: ecoData })
        
        // ── Trail Buffer Zones – outlines only, no fill ──

        // ── Trail Buffer Zone outline – dashed green ring ──
        map.addLayer({
          id: 'ecohabitat-buffer-500m',
          type: 'line',
          source: 'ecohabitat',
          paint: { 'line-color': '#86efac', 'line-width': 2, 'line-opacity': 0.3, 'line-dasharray': [6, 4] },
        })
        map.addLayer({
          id: 'ecohabitat-buffer-250m',
          type: 'line',
          source: 'ecohabitat',
          paint: { 'line-color': '#4ade80', 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [4, 3] },
        })
        map.addLayer({
          id: 'ecohabitat-buffer-100m',
          type: 'line',
          source: 'ecohabitat',
          paint: { 'line-color': '#22c55e', 'line-width': 1, 'line-opacity': 0.7 },
        })
        map.addLayer({
          id: 'ecohabitat-core-outline',
          type: 'line',
          source: 'ecohabitat',
          paint: { 'line-color': '#16a34a', 'line-width': 1.5, 'line-opacity': 0.8 },
        })

        // ── Hover highlight layers ──
        map.addLayer({
          id: 'ecohabitat-hover',
          type: 'fill',
          source: 'ecohabitat',
          paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.0 },
          filter: ['==', ['get', 'uid'], ''],
        })
        map.addLayer({
          id: 'ecohabitat-hover-outline',
          type: 'line',
          source: 'ecohabitat',
          paint: { 'line-color': '#5cdb80', 'line-width': 2, 'line-opacity': 0.8 },
          filter: ['==', ['get', 'uid'], ''],
        })

        // Habitat Suitability (analytical, hidden by default - no fill on buffer zones)
        map.addLayer({
          id: 'ecohabitat-suitability',
          type: 'line',
          source: 'ecohabitat',
          layout: { visibility: 'none' },
          paint: { 'line-color': '#4cde8f', 'line-width': 2, 'line-opacity': 0.6 },
        })
      }

      // ── Species points & Density Heatmaps  (rendered BEFORE trails) ──
      for (const [key, style] of Object.entries(SPECIES_STYLES)) {
        const data = await load(key, DATA_PATHS[key])
        if (!data?.features) continue
        stats[key as keyof typeof stats] = data.features.length

        map.addSource(key, {
          type: 'geojson',
          data,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 40,
        })

        // ── Biodiversity Hotspot Heatmap ──
        map.addLayer({
          id: `${key}-heatmap`,
          type: 'heatmap',
          source: key,
          maxzoom: 11.5,
          paint: {
            'heatmap-weight':     ['interpolate', ['linear'], ['get', 'count'], 1, 1, 10, 3],
            'heatmap-intensity':  ['interpolate', ['linear'], ['zoom'], 6, 1.2, 11, 4],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0,   'rgba(5,13,7,0)',
              0.3, hexToRgba(style.color, 0.2),
              0.7, hexToRgba(style.color, 0.5),
              1,   style.color
            ],
            'heatmap-radius':  ['interpolate', ['linear'], ['zoom'], 6, 14, 11, 28],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.85, 11.5, 0]
          }
        })

        // ── Cluster glow halo (soft, low-key) ──
        map.addLayer({
          id: `${key}-clusters-glow`,
          type: 'circle',
          source: key,
          filter: ['has', 'point_count'],
          paint: {
            'circle-radius': ['step', ['get', 'point_count'], 28, 10, 36, 50, 46],
            'circle-color':   style.color,
            'circle-opacity': 0.12,
            'circle-blur':    1,
          },
        })

        // ── Cluster circles ──
        map.addLayer({
          id: `${key}-clusters`,
          type: 'circle',
          source: key,
          filter: ['has', 'point_count'],
          paint: {
            'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 28],
            'circle-color':          style.color,
            'circle-opacity':        0.88,
            'circle-stroke-width':   2,
            'circle-stroke-color':   'rgba(255,255,255,0.25)',
          },
        })

        // ── Cluster count labels ──
        map.addLayer({
          id: `${key}-cluster-count`,
          type: 'symbol',
          source: key,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size':  12,
            'text-font':  ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          },
          paint: { 'text-color': '#050d07' },
        })

        // ── Individual point glow halo ──
        map.addLayer({
          id: `${key}-points-glow`,
          type: 'circle',
          source: key,
          minzoom: 11,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius':  ['interpolate', ['linear'], ['zoom'], 11, 10, 16, 20],
            'circle-color':   style.color,
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 11.5, 0.15],
            'circle-blur':    1,
          },
        })

        // ── Individual points ──
        map.addLayer({
          id: `${key}-points`,
          type: 'circle',
          source: key,
          minzoom: 11,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius':       ['interpolate', ['linear'], ['zoom'], 11, 4, 16, 8],
            'circle-color':        style.color,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': 'rgba(255,255,255,0.5)',
            'circle-opacity':      ['interpolate', ['linear'], ['zoom'], 11, 0, 11.5, 0.95],
          },
        })

        map.on('mousemove', `${key}-points`, (e) => {
          if (!e.features?.length) return
          map.getCanvas().style.cursor = 'pointer'
          const f = e.features[0]
          const props  = f.properties || {}
          const name   = props.common_name || props.commonName || props.vernacularName || props.name || 'Wildlife Observation'
          const sciName = props.scientific_name || props.scientificName || ''
          const count  = props.individualCount || props.count || 1
          const story  = getEcologicalStory(key, name)
          const catLabel: Record<string,string> = { birds: '🐦 Bird', plants: '🌿 Plant', fungi: '🍄 Fungi' }
          popup.setLngLat(e.lngLat)
            .setHTML(`<div style="padding:12px 14px;font-family:sans-serif;max-width:220px">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${style.color};margin-bottom:4px">${catLabel[key] || key}</div>
              <div style="font-weight:700;color:#e8f5e0;font-size:13px;line-height:1.2;margin-bottom:2px">${name}</div>
              ${sciName ? `<div style="font-size:10px;color:#7aa87e;font-style:italic;margin-bottom:6px">${sciName}</div>` : ''}
              <div style="font-size:10px;color:#7aa87e;margin-bottom:6px">Observed: <span style="color:#e8f5e0;font-weight:600">${count}</span></div>
              <div style="border-top:1px solid rgba(92,219,128,0.15);padding-top:6px;font-size:10px;color:#7aa87e;line-height:1.4;margin-bottom:4px">${story.relation}</div>
              <div style="font-size:10px;color:${style.color};font-style:italic;line-height:1.4">💡 ${story.fact}</div>
            </div>`)
            .addTo(map)
        })
        map.on('mouseleave', `${key}-points`, () => {
          map.getCanvas().style.cursor = ''
          popup.remove()
        })

        // Cluster hover tooltip (count + category)
        map.on('mousemove', `${key}-clusters`, (e) => {
          if (!e.features?.length) return
          map.getCanvas().style.cursor = 'pointer'
          const count = e.features[0].properties?.point_count_abbreviated || ''
          const catLabel: Record<string,string> = { birds: '🐦 Bird cluster', plants: '🌿 Plant cluster', fungi: '🍄 Fungi cluster' }
          popup.setLngLat(e.lngLat)
            .setHTML(`<div style="padding:10px 12px;font-family:sans-serif">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${style.color};margin-bottom:3px">${catLabel[key] || key}</div>
              <div style="font-weight:700;color:#e8f5e0;font-size:13px">${count} observations</div>
              <div style="font-size:10px;color:#7aa87e;margin-top:4px">Click to explore</div>
            </div>`)
            .addTo(map)
        })
        map.on('mouseleave', `${key}-clusters`, () => {
          map.getCanvas().style.cursor = ''
          popup.remove()
        })

        // Click individual points → info panel
        map.on('click', `${key}-points`, (e) => {
          popup.remove()
          const f = e.features?.[0]
          if (f) {
            const props = f.properties || {}
            setSelectedFeature({
              id: props.id || String(Math.random()),
              commonName: props.common_name || props.commonName || props.vernacularName || 'Observation',
              scientificName: props.scientific_name || props.scientificName || 'Unknown',
              taxonGroup: key,
              recorder: props.user_login || props.user_name || props.recorder || props.recordedBy || 'iNaturalist',
              date: props.observed_on || props.date || props.eventDate || 'Unknown Date',
              habitat: props.place_guess || props.habitat || 'West Sussex',
              conservationStatus: props.quality_grade || props.conservationStatus || 'Research Grade',
              gridRef: props.gridRef || props.gridReference || '',
              count: props.count || props.individualCount || 1,
              inatUrl: props.url || null,
              imageUrl: props.image_url || null,
              taxonId: props.taxon_id ? Number(props.taxon_id) : undefined,
              geometry: f.geometry,
              screenPos: { x: e.point.x, y: e.point.y }
            })
          }
        })

        // Click to expand clusters
        map.on('click', `${key}-clusters`, (e) => {
          popup.remove()
          const features  = map.queryRenderedFeatures(e.point, { layers: [`${key}-clusters`] })
          const clusterId = features[0]?.properties?.cluster_id
          const src = map.getSource(key) as mapboxgl.GeoJSONSource
          src.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return
            const geo = features[0].geometry as unknown as { coordinates: [number, number] }
            map.easeTo({ center: geo.coordinates, zoom })
          })
        })
      }

      // ── Trails (rendered ON TOP of species) ──
      for (const [key, style] of Object.entries(TRAIL_STYLES)) {
        const data = await load(key, DATA_PATHS[key])
        if (!data) continue
        map.addSource(key, { type: 'geojson', data })
        map.addLayer({
          id: `${key}-glow`,
          type: 'line',
          source: key,
          paint: {
            'line-color': style.color,
            'line-width': style.width * 2,
            'line-opacity': 0.2,
            'line-blur': 2,
          },
        })
        map.addLayer({
          id: `${key}-impact`,
          type: 'line',
          source: key,
          paint: { 'line-color': '#ef4444', 'line-width': style.width * 12, 'line-opacity': 0.12, 'line-blur': 8 },
        })
        map.addLayer({
          id: `${key}-line`,
          type: 'line',
          source: key,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color':     style.color,
            'line-width':     style.width,
            'line-dasharray': style.dash || [1],
            'line-opacity':   0.9,
          },
        })
        map.on('mouseenter', `${key}-line`, () => {
          map.setPaintProperty(`${key}-line`, 'line-width', style.width + 2)
          map.setPaintProperty(`${key}-glow`, 'line-opacity', 0.35)
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', `${key}-line`, () => {
          map.setPaintProperty(`${key}-line`, 'line-width', style.width)
          map.setPaintProperty(`${key}-glow`, 'line-opacity', 0.12)
          map.getCanvas().style.cursor = ''
        })
      }

      setGlobalStats({ ...stats })
      layersReady.current = true
    })

    // Part 3.2: Universal Map Click Handler for Features & Background
    map.on('click', (e) => {
      const speciesLayers = ['birds-points', 'fungi-points', 'plants-points']
      const features = map.queryRenderedFeatures(e.point, { layers: [...speciesLayers, 'walking-trails'] })
      
      if (!features.length) {
        useAppStore.getState().setSelectedFeature(null)
        useAppStore.getState().setSelectedTrail(null)
        return
      }

      const f = features[0]
      if (f?.layer?.id === 'walking-trails') {
        useAppStore.getState().setSelectedTrail({
          id: f.id,
          name: f.properties?.Name || f.properties?.Descript || 'Lost Woods Trail',
          difficulty: 'Moderate',
          distance: '5.4 km',
          habitats: ['Ancient Woodland', 'Valley Bog'],
          observationsNearTrail: 612,
          breakdown: { birds: 210, fungi: 150, plants: 252 },
          note: 'This section passes through critical wood pasture habitat.',
          osLink: 'https://osmaps.ordnancesurvey.co.uk/'
        })
        useAppStore.getState().setSelectedFeature(null)
        return
      }

      // Habitat Click
      const habitatFeatures = map.queryRenderedFeatures(e.point, { layers: ['phi-fill'] })
      if (habitatFeatures.length > 0) {
        const h = habitatFeatures[0]
        if (h.layer?.id === 'phi-fill') {
          const mainHabs = h.properties?.MainHabs || 'Priority Habitat'
          const keySpecies = getKeySpeciesForHabitat(mainHabs)
          useAppStore.getState().setActiveHabitat({
            name: h.properties?.featdesc?.trim() || mainHabs,
            type: mainHabs,
            description: `A vital section of the Lost Woods area's ${mainHabs.toLowerCase()}, forming a critical component of the Sussex biodiversity network.`,
            keySpecies: keySpecies,
            suitability: Math.round(70 + ((h.properties?.FID || 0) % 28))
          })
        } else {
          useAppStore.getState().setActiveHabitat({
            name: h.properties?.MainHabs || 'Priority Habitat',
            type: h.properties?.HabCodes || 'Ecological Zone',
            description: 'A designated priority habitat in West Sussex, supporting rare invertebrates, woodland birds, and protected plant species.',
            keySpecies: ['Common Buzzard', 'Tawny Owl', 'Bluebell', 'Stag Beetle'],
            suitability: 88
          })
        }
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Layer visibility ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layersReady.current) return

    const layerMap: Record<string, string[]> = {
      // Raw Data
      birds: ['birds-clusters', 'birds-cluster-count', 'birds-points'],
      fungi: ['fungi-clusters', 'fungi-cluster-count', 'fungi-points'],
      plants: ['plants-clusters', 'plants-cluster-count', 'plants-points'],
      burley: ['burley-glow', 'burley-line'],
      emery: ['emery-glow', 'emery-line'],
      reihan: ['reihan-glow', 'reihan-line'],
      
      // Boundaries
      boundary: ['boundary-fill', 'boundary-line'],
      phi: ['phi-fill', 'phi-line'],
      ecohabitat: ['ecohabitat-hover-outline'],
      'buffer-zones': [
        'ecohabitat-buffer-500m',
        'ecohabitat-buffer-250m',
        'ecohabitat-buffer-100m',
        'ecohabitat-core-outline'
      ],

      // Analytical Surfaces
      'biodiversity-density': ['birds-heatmap', 'fungi-heatmap', 'plants-heatmap'],
      'habitat-suitability': ['ecohabitat-suitability'],
      'trail-impact': ['burley-impact', 'emery-impact', 'reihan-impact'],
    }

    for (const [key, layers] of Object.entries(layerMap)) {
      const state = activeLayers[key as keyof typeof activeLayers]
      const vis = state?.visible ? 'visible' : 'none'
      const opacityMultiplier = state?.opacity ?? 1

      layers.forEach(l => { 
        const layerObj = map.getLayer(l)
        if (layerObj) {
          map.setLayoutProperty(l, 'visibility', vis)
          // Opacity adjustments based on layer type
          if (layerObj.type === 'fill') {
            if (l.includes('suitability')) {
              map.setPaintProperty(l, 'fill-opacity', 0.6 * opacityMultiplier)
            } else if (l === 'phi-fill') {
              map.setPaintProperty(l, 'fill-opacity', 0.65 * opacityMultiplier)
            } else if (l === 'boundary-fill') {
              map.setPaintProperty(l, 'fill-opacity', 0.05 * opacityMultiplier)
            } else {
              map.setPaintProperty(l, 'fill-opacity', 0.2 * opacityMultiplier)
            }
          } else if (layerObj.type === 'line') {
            if (l.includes('glow')) {
              map.setPaintProperty(l, 'line-opacity', 0.2 * opacityMultiplier)
            } else if (l === 'ecohabitat-buffer-500m') {
              map.setPaintProperty(l, 'line-opacity', 0.05 * opacityMultiplier)
            } else if (l === 'ecohabitat-buffer-250m') {
              map.setPaintProperty(l, 'line-opacity', 0.09 * opacityMultiplier)
            } else if (l === 'ecohabitat-buffer-100m') {
              map.setPaintProperty(l, 'line-opacity', 0.16 * opacityMultiplier)
            } else if (l === 'ecohabitat-core-outline') {
              map.setPaintProperty(l, 'line-opacity', 0.45 * opacityMultiplier)
            } else {
              map.setPaintProperty(l, 'line-opacity', opacityMultiplier)
            }
          } else if (layerObj.type === 'circle') {
            map.setPaintProperty(l, 'circle-opacity', opacityMultiplier)
          } else if (layerObj.type === 'heatmap') {
            map.setPaintProperty(l, 'heatmap-opacity', 0.8 * opacityMultiplier)
          }
        }
      })
    }
  }, [activeLayers])

  // ── 3D terrain ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layersReady.current) return

    if (is3D) {
      if (!map.getSource('terrain')) {
        map.addSource('terrain', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
        })
      }
      map.setTerrain({ source: 'terrain', exaggeration: 1.8 })
      map.easeTo({ pitch: 65, duration: 800 })
      
      // Part 2.1: 3D Fix - Prevent map from going too dark
      map.setPaintProperty('osm', 'raster-opacity', 0.65)
      
      // Ambient environmental fog for depth
      if (!map.getLayer('sky')) {
        map.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }
        })
      }
    } else {
      map.setTerrain(null)
      map.easeTo({ pitch: 45, duration: 800 })
      map.setPaintProperty('osm', 'raster-opacity', 1.0)
      if (map.getLayer('sky')) map.removeLayer('sky')
    }
  }, [is3D])

  // ── Cinematic Storytelling flyovers ─────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layersReady.current) return

    // Quick map of story IDs to locations
    const storyLocs: Record<string, { center: [number, number], zoom: number, pitch?: number, bearing?: number }> = {
      'ancient-woodland': { center: [-0.18, 50.92], zoom: 14.5, pitch: 70, bearing: 80 },
      'chalk-grassland':  { center: [-0.23, 50.93], zoom: 14.2, pitch: 65, bearing: -20 },
      'hidden-trails':    { center: [-0.27, 50.94], zoom: 13.8, pitch: 60, bearing: 110 },
    }

    if (activeView === 'stories' && activeStoryId && storyLocs[activeStoryId]) {
      map.flyTo({
        ...storyLocs[activeStoryId],
        duration: 4000,
        essential: true,
      })
    } else if (activeView === 'map' && activeStoryId === null) {
      // Return to overview map when exiting stories
      map.flyTo({
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        pitch: MAP_CONFIG.pitch,
        bearing: MAP_CONFIG.bearing,
        duration: 3000
      })
    }
  }, [activeStoryId, activeView])

  return <div id="map-container" ref={containerRef} />
}

// ── Map style (dark forest base) ──────────────────────────────
function buildMapStyle(): mapboxgl.Style {
  return {
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}',
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#f0ede6' } },
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
        paint: {
          'raster-opacity': 0.85,
          'raster-saturation': -0.1,
          'raster-contrast': 0.0,
          'raster-brightness-min': 0.3,
          'raster-brightness-max': 1.0,
        },
      },
    ],
  } as mapboxgl.Style
}
