'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import ExploreBar from '@/components/ui/ExploreBar'
import AnalyticsDashboard from '@/components/ui/AnalyticsDashboard'
import AdvancedLayerManager from '@/components/ui/AdvancedLayerManager'
import InfoPanel from '@/components/ui/InfoPanel'
import StoriesPanel from '@/components/ui/StoriesPanel'
import MethodologyPanel from '@/components/ui/MethodologyPanel'
import TourMode from '@/components/ui/TourMode'
import FloatingHeader from '@/components/ui/FloatingHeader'
import LoadingScreen from '@/components/ui/LoadingScreen'
import SearchBar from '@/components/ui/SearchBar'
import TrailPanel from '@/components/ui/TrailPanel'
import TrailsListPanel from '@/components/ui/TrailsListPanel'
import WelcomeScreen from '@/components/ui/WelcomeScreen'
import CameraPanel from '@/components/ui/CameraPanel'
import HabitatCard from '@/components/ui/HabitatCard'
import HabitatLegend from '@/components/ui/HabitatLegend'
import WeatherWidget from '@/components/ui/WeatherWidget'
import { useAppStore } from '@/lib/store/useAppStore'

// Dynamic import MapCore to avoid SSR issues with Mapbox
const MapCore = dynamic(() => import('@/components/map/MapCore'), {
  ssr: false,
  loading: () => null,
})

export default function HomePage() {
  const showWelcome = useAppStore(s => s.showWelcome)
  const setShowWelcome = useAppStore(s => s.setShowWelcome)
  const [mapReady, setMapReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({ done: 0, total: 9 })
  const [is3D, setIs3D] = useState(false)

  const isLoading = !mapReady || loadingProgress.done < loadingProgress.total

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-forest-950">
      {/* ── Persistent map background ── */}
      <MapCore
        is3D={is3D}
        onMapReady={setMapReady}
        onProgress={setLoadingProgress}
      />

      {/* ── Loading Screen ── */}
      <LoadingScreen isVisible={isLoading} progress={loadingProgress} />

      {/* ── UI overlays — only after map ready ── */}
      {!isLoading && (
        <>
          {/* Welcome splash */}
          <AnimatePresence>
            {showWelcome && <WelcomeScreen />}
          </AnimatePresence>

          {/* Floating header (top-left brand pill) */}
          {!showWelcome && (
            <FloatingHeader is3D={is3D} onToggle3D={() => setIs3D(p => !p)} />
          )}

          {/* Species / feature info panel */}
          <InfoPanel />

          {/* Stories panel */}
          <StoriesPanel />

          {/* Search bar overlay */}
          <SearchBar />

          {/* Trails list — shown when activeView = 'trails' */}
          <TrailsListPanel />

          {/* Trail details panel */}
          <TrailPanel />

          {/* Professional Overlay Modals */}
          <MethodologyPanel />
          <TourMode />

          {/* Advanced GIS Layer Manager */}
          <AdvancedLayerManager isHidden={showWelcome} />

          {/* Floating advanced GIS analytics */}
          {!showWelcome && <AnalyticsDashboard />}

          {/* Bottom explore tab bar */}
          {!showWelcome && <ExploreBar />}

          {/* New Mobile GIS Panels */}
          <CameraPanel />
          <HabitatCard />

          {/* ── Habitat legend — bottom left of map ── */}
          <HabitatLegend />

          {/* ── Live weather — top right, below floating header ── */}
          <WeatherWidget />
        </>
      )}
    </main>
  )
}
