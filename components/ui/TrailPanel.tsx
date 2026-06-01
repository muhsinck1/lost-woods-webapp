'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Ruler, TrendingUp, Info, ExternalLink, Trees, Bug, Leaf } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

export default function TrailPanel() {
  const activePanel = useAppStore(s => s.activePanel)
  const setPanel = useAppStore(s => s.setActivePanel)
  const selectedTrail = useAppStore(s => s.selectedTrail)
  
  if (activePanel !== 'trail' || !selectedTrail) return null

  const trail = selectedTrail

  return (
    <AnimatePresence>
      <>
        {/* Mobile backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 sm:hidden bg-black/40"
          onClick={() => setPanel(null)}
        />

        {/* Panel: bottom sheet on mobile, right side on desktop */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 sm:bottom-auto sm:top-20 sm:right-4 sm:left-auto sm:w-80 max-h-[85vh] sm:max-h-[calc(100vh-160px)] overflow-y-auto overflow-x-hidden"
        >
          <div className="glass panel-shadow rounded-t-3xl sm:rounded-2xl overflow-hidden">
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="p-5 border-b border-white/5 relative bg-trail/10">
              <div className="absolute top-0 right-0 p-3">
                <button 
                  onClick={() => setPanel(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-nature-muted"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="badge" style={{ background: 'rgba(255,140,66,0.15)', color: '#ff8c42' }}>
                  <TrendingUp size={10} className="inline mr-1" /> Trail Analysis
                </span>
                <span className="text-[10px] text-nature-muted uppercase tracking-widest font-bold">
                  {trail.difficulty}
                </span>
              </div>
              
              <h3 className="text-2xl font-playfair text-white leading-tight">{trail.name}</h3>
            </div>

            {/* Stats Bar */}
            <div className="p-5 grid grid-cols-2 gap-4 border-b border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-nature-muted uppercase tracking-wider">
                  <Ruler size={12} /> Distance
                </div>
                <div className="text-base font-bold text-white">{trail.distance}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-nature-muted uppercase tracking-wider">
                  <Info size={12} /> Intersection
                </div>
                <div className="text-[11px] font-medium text-nature-text">3 Primary Habitats</div>
              </div>
            </div>

            {/* Detailed analysis */}
            <div className="p-5 space-y-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-nature-muted block mb-3">Habitat Connectivity</span>
                <div className="flex flex-wrap gap-2">
                  {trail.habitats.map((h: string) => (
                    <span key={h} className="px-2.5 py-1.5 bg-white/5 rounded-lg text-[10px] text-nature-text border border-white/5 uppercase">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-nature-muted block mb-2">Species Near Trail (50m Buffer)</span>
                <div className="flex items-end justify-between mb-4">
                  <div className="text-3xl font-mono text-green-soft leading-none">{trail.observationsNearTrail}</div>
                  <div className="text-[10px] text-nature-muted uppercase font-bold">Records Found</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <Bug size={16} className="mx-auto mb-1 text-bird" />
                    <div className="text-xs font-bold text-white">{trail.breakdown.birds}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <Leaf size={16} className="mx-auto mb-1 text-fungi" />
                    <div className="text-xs font-bold text-white">{trail.breakdown.fungi}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg text-center">
                    <Trees size={16} className="mx-auto mb-1 text-plant" />
                    <div className="text-xs font-bold text-white">{trail.breakdown.plants}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-400/5 rounded-xl border border-orange-400/20">
                <div className="flex gap-3">
                  <Info size={16} className="text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-playfair italic leading-relaxed text-nature-text/90">
                    {trail.note}
                  </p>
                </div>
              </div>

              <a 
                href={trail.osLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full btn-accent flex items-center justify-center gap-2 group py-3.5"
              >
                View on OS Maps <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Safe area */}
            <div className="h-2 sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
