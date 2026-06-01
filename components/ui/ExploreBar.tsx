'use client'

import { motion } from 'framer-motion'
import { Map, Camera, Footprints, BookOpen } from 'lucide-react'
import { useAppStore, type AppView } from '@/lib/store/useAppStore'

const TABS: { id: AppView; label: string; icon: React.ReactNode }[] = [
  { id: 'map',      label: 'Map',      icon: <Map size={18} /> },
  { id: 'discover', label: 'Discover', icon: <Camera size={18} /> },
  { id: 'trails',   label: 'Trails',   icon: <Footprints size={18} /> },
  { id: 'stories',  label: 'Stories',  icon: <BookOpen size={18} /> },
]

export default function ExploreBar() {
  const activeView = useAppStore(s => s.activeView)
  const onChangeView = useAppStore(s => s.setActiveView)
  const setCameraOpen = useAppStore(s => s.setCameraOpen)

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-safe"
      aria-label="Explore navigation"
    >
      <div
        className="w-full max-w-sm mx-4 mb-3 flex items-center rounded-2xl overflow-hidden glass panel-shadow relative"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Floating Camera Icon specifically for mobile-first identification */}
        <button
          onClick={() => setCameraOpen(true)}
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-green-soft text-forest-950 flex items-center justify-center shadow-lg active:scale-90 transition-transform z-50 border-4 border-forest-950"
          aria-label="Identify a Species"
        >
          <Camera size={24} />
        </button>

        {TABS.map(tab => {
          const isActive = activeView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChangeView(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-200 ${
                isActive ? 'text-green-soft' : 'text-nature-muted hover:text-nature-text'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(92,219,128,0.1)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10 text-[10px] font-medium tracking-wide">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-dot"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-green-soft"
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}
