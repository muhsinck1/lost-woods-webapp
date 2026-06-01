import { create } from 'zustand'
import type { NormalizedSpecies } from '../spatial/normalizeData'

export type AppView = 'map' | 'discover' | 'trails' | 'stories'
export type ActivePanel = 'layers' | 'info' | 'stories' | 'tour' | 'search' | 'trail' | 'camera' | 'habitat' | null

export type LayerId = 
  | 'birds' | 'fungi' | 'plants'         // Raw Data
  | 'boundary' | 'phi' | 'ecohabitat' | 'buffer-zones'   // Contextual Boundaries
  | 'burley' | 'emery' | 'reihan'        // Trails
  | 'biodiversity-density' | 'habitat-suitability' | 'trail-impact' // Analytical Surfaces

export type LayerGroup = 'Data Layer' | 'Contextual Boundary' | 'Analytical Surface'

export interface SelectedFeature {
  id: string
  commonName: string
  scientificName: string
  taxonGroup: 'birds' | 'fungi' | 'plants' | string
  recorder: string
  date: string
  habitat: string
  conservationStatus: string
  gridRef: string
  count?: number
  inatUrl?: string        // iNaturalist observation URL
  imageUrl?: string       // observation photo
  taxonId?: number        // iNaturalist taxon id
  geometry?: any
  screenPos?: { x: number; y: number }
}

export interface LayerState {
  id: LayerId
  visible: boolean
  opacity: number
  group: LayerGroup
  label: string
}

interface AppState {
  // Navigation & UI Panels
  activeView: AppView
  setActiveView: (view: AppView) => void

  activePanel: ActivePanel
  setActivePanel: (panel: ActivePanel) => void

  selectedFeature: SelectedFeature | null
  setSelectedFeature: (feature: SelectedFeature | null) => void

  selectedTrail: any | null
  setSelectedTrail: (trail: any | null) => void

  userLocation: [number, number] | null
  setUserLocation: (loc: [number, number] | null) => void

  activeStoryId: string | null
  setActiveStoryId: (id: string | null) => void

  // Metrics Engine
  globalStats: { birds: number; fungi: number; plants: number }
  setGlobalStats: (stats: { birds: number; fungi: number; plants: number }) => void

  spatialMetrics: { totalRecords: number, sensitivityIndex: number, dominantKingdom: string, dominantPct: number }
  setSpatialMetrics: (metrics: any) => void

  searchQuery: string
  setSearchQuery: (q: string) => void

  methodologyOpen: boolean
  setMethodologyOpen: (open: boolean) => void

  tourMode: boolean
  setTourMode: (open: boolean) => void

  // Spatial Layers
  layers: Record<LayerId, LayerState>
  toggleLayer: (id: LayerId) => void
  setLayerVisibility: (id: LayerId, visible: boolean) => void
  setLayerOpacity: (id: LayerId, opacity: number) => void

  highlightedSpatialZone: string | null
  setHighlightedSpatialZone: (zone: string | null) => void

  showWelcome: boolean
  setShowWelcome: (show: boolean) => void

  cameraOpen: boolean
  setCameraOpen: (open: boolean) => void

  activeHabitat: any | null
  setActiveHabitat: (habitat: any | null) => void

  // Centralised map orchestration
  syncLayersForView: (view: AppView) => void
}

const defaultLayers: Record<LayerId, LayerState> = {
  'biodiversity-density': { id: 'biodiversity-density', visible: false, opacity: 0.6, group: 'Analytical Surface', label: 'Biodiversity Hotspots' },
  'habitat-suitability': { id: 'habitat-suitability', visible: false, opacity: 0.8, group: 'Analytical Surface', label: 'Habitat Suitability Index' },
  'trail-impact': { id: 'trail-impact', visible: false, opacity: 0.7, group: 'Analytical Surface', label: 'Trail Impact Zones' },
  boundary: { id: 'boundary', visible: true, opacity: 0.8, group: 'Contextual Boundary', label: 'Lost Woods Boundary' },
  phi: { id: 'phi', visible: true, opacity: 0.8, group: 'Contextual Boundary', label: 'Priority Habitats' },
  ecohabitat: { id: 'ecohabitat', visible: true, opacity: 0.7, group: 'Contextual Boundary', label: 'Habitat Types' },
  'buffer-zones': { id: 'buffer-zones', visible: true, opacity: 0.6, group: 'Contextual Boundary', label: 'Buffer Zones' },
  birds: { id: 'birds', visible: true, opacity: 1, group: 'Data Layer', label: 'Avian Species' },
  fungi: { id: 'fungi', visible: true, opacity: 1, group: 'Data Layer', label: 'Fungi Records' },
  plants: { id: 'plants', visible: true, opacity: 1, group: 'Data Layer', label: 'Flora Records' },
  burley: { id: 'burley', visible: true, opacity: 1, group: 'Data Layer', label: 'Henfield Trail' },
  emery: { id: 'emery', visible: true, opacity: 1, group: 'Data Layer', label: "Butcher's Wood Trail" },
  reihan: { id: 'reihan', visible: true, opacity: 1, group: 'Data Layer', label: 'Tottington Trail' },
}

export const useAppStore = create<AppState>((set, get) => ({
  activeView: 'map',
  setActiveView: (view) => {
    set({ activeView: view })
    get().syncLayersForView(view)
  },

  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),

  selectedFeature: null,
  setSelectedFeature: (feature) => {
    set({ selectedFeature: feature })
    if (feature) {
      if (get().activePanel !== 'layers') set({ activePanel: 'info' })
    } else {
      if (get().activePanel === 'info') set({ activePanel: null })
      if (get().activePanel === 'trail') set({ activePanel: null })
    }
  },

  selectedTrail: null,
  setSelectedTrail: (trail) => {
    set({ selectedTrail: trail })
    if (trail) set({ activePanel: 'trail' })
    else if (get().activePanel === 'trail') set({ activePanel: null })
  },

  userLocation: null,
  setUserLocation: (loc) => set({ userLocation: loc }),

  activeStoryId: null,
  setActiveStoryId: (id) => set({ activeStoryId: id }),

  globalStats: { birds: 0, fungi: 0, plants: 0 },
  setGlobalStats: (stats) => set({ globalStats: stats }),

  spatialMetrics: { totalRecords: 0, sensitivityIndex: 0, dominantKingdom: '', dominantPct: 0 },
  setSpatialMetrics: (m) => set({ spatialMetrics: m }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  methodologyOpen: false,
  setMethodologyOpen: (open) => set({ methodologyOpen: open }),

  tourMode: false,
  setTourMode: (open) => set({ tourMode: open }),

  highlightedSpatialZone: null,
  setHighlightedSpatialZone: (zone) => set({ highlightedSpatialZone: zone }),

  showWelcome: true,
  setShowWelcome: (show) => set({ showWelcome: show }),

  cameraOpen: false,
  setCameraOpen: (open) => {
    set({ cameraOpen: open })
    if (open) set({ activePanel: 'camera' })
    else if (get().activePanel === 'camera') set({ activePanel: null })
  },

  activeHabitat: null,
  setActiveHabitat: (habitat) => {
    set({ activeHabitat: habitat })
    if (habitat) set({ activePanel: 'habitat' })
    else if (get().activePanel === 'habitat') set({ activePanel: null })
  },

  layers: defaultLayers,
  toggleLayer: (id) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: { ...state.layers[id], visible: !state.layers[id].visible },
      },
    })),
  setLayerVisibility: (id, visible) =>
    set((state) => ({
      layers: { ...state.layers, [id]: { ...state.layers[id], visible } },
    })),
  setLayerOpacity: (id, opacity) =>
    set((state) => ({
      layers: { ...state.layers, [id]: { ...state.layers[id], opacity } },
    })),

  syncLayersForView: (view) => {
    const { setLayerVisibility } = get()
    if (view === 'map') {
      setLayerVisibility('birds', true); setLayerVisibility('fungi', true); setLayerVisibility('boundary', true); setLayerVisibility('phi', true); setLayerVisibility('burley', true);
      setLayerVisibility('ecohabitat', true); setLayerVisibility('buffer-zones', true);
    } else if (view === 'discover') {
      setLayerVisibility('birds', true); setLayerVisibility('fungi', true); setLayerVisibility('plants', true); setLayerVisibility('burley', false); setLayerVisibility('phi', false);
      setLayerVisibility('ecohabitat', true); setLayerVisibility('buffer-zones', false);
    } else if (view === 'trails') {
      setLayerVisibility('birds', false); setLayerVisibility('burley', true); setLayerVisibility('emery', true); setLayerVisibility('reihan', true); setLayerVisibility('phi', true);
      setLayerVisibility('ecohabitat', true); setLayerVisibility('buffer-zones', true);
    } else if (view === 'stories') {
      setLayerVisibility('birds', false); setLayerVisibility('burley', false); setLayerVisibility('boundary', true);
      setLayerVisibility('ecohabitat', false); setLayerVisibility('buffer-zones', false);
    }
  },
}))
