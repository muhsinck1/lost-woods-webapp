'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Database, Network, Map, GitMerge, FileCheck, X, Compass } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

const WORKFLOW_STEPS = [
  { icon: <Database size={16} />, title: 'Collection & Harmonization', desc: 'Ingesting GBIF Darwin Core records and local GeoJSON trails into a unified GeoStore interface.' },
  { icon: <GitMerge size={16} />, title: 'Spatial Normalisation', desc: 'Sanitising scientific names, grid refs, and taxonomies via our NormalizedFeature pipeline.' },
  { icon: <Network size={16} />, title: 'Proximity Buffering', desc: 'Calculating trail-species interference zones (50m - 500m) using client-side WebGL vector shaders.' },
  { icon: <Map size={16} />, title: 'Adaptive Suitability', desc: 'Interpolating categorical habitat indices into research-backed ecological sensitivity heatmaps.' },
  { icon: <FileCheck size={16} />, title: 'Environmental Intelligence', desc: 'Delivering real-time decision support dashboards with dynamic kingdom-based metrics.' },
]

export default function MethodologyPanel() {
  const isOpen = useAppStore((s) => s.methodologyOpen)
  const setOpen = useAppStore((s) => s.setMethodologyOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-2xl glass panel-shadow rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 border-t sm:border border-green-soft/20 overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto sm:mx-4"
          >
            {/* Geometric accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-soft/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            {/* Mobile drag handle */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-nature-muted hover:text-white transition-colors">
              <X size={22} />
            </button>

            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2.5 sm:p-3 bg-green-soft/10 rounded-xl text-green-soft">
                <Compass size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">GIS Methodology</h2>
                <p className="text-[10px] sm:text-xs text-green-soft tracking-[0.2em] uppercase">Spatial Architecture</p>
              </div>
            </div>

            <p className="text-sm text-nature-muted leading-relaxed mb-6 sm:mb-8">
              This platform bridges the gap between raw geocomputation and immersive storytelling. Rather than relying on heavy server-side ArcGIS geoprocessing, we execute complex visual spatial algorithms directly within the client using Mapbox GL WebGL shaders and rigorous data normalisation.
            </p>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-green-soft/50 via-green-soft/10 to-transparent" />
              
              <div className="space-y-5 sm:space-y-6">
                {WORKFLOW_STEPS.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex gap-3 sm:gap-4 relative"
                  >
                    <div className="relative z-10 flex border border-green-soft/20 items-center justify-center w-10 h-10 rounded-full bg-[#0a1a0c] text-green-soft shadow-[0_0_15px_rgba(34,197,94,0.15)] shrink-0">
                      {step.icon}
                    </div>
                    <div className="pt-1.5 sm:pt-2 min-w-0">
                      <h3 className="text-[13px] sm:text-sm font-bold text-white mb-1 tracking-wide">{step.title}</h3>
                      <p className="text-[11px] sm:text-xs text-nature-muted leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Safe area */}
            <div className="h-4 sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
