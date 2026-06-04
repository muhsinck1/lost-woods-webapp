'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Trees, Bird, Info, MapPin } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

export default function HabitatCard() {
  const activeHabitat = useAppStore(s => s.activeHabitat)
  const setActiveHabitat = useAppStore(s => s.setActiveHabitat)

  if (!activeHabitat) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 inset-x-0 z-50 flex justify-center p-4 pb-safe"
      >
        <div className="w-full max-w-lg glass panel-shadow rounded-t-[2.5rem] overflow-hidden border border-white/10">
          {/* Header */}
          <div className="relative h-32 bg-forest-950 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-50"
              alt="Habitat"
            />
            <button 
              onClick={() => setActiveHabitat(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-4 left-6 z-20">
              <span className="px-3 py-1 bg-green-soft text-forest-950 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 inline-block">
                {activeHabitat.type}
              </span>
              <h2 className="text-2xl font-bold text-white font-playfair">{activeHabitat.name}</h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 bg-forest-950/80 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-green-soft">
                <Info size={18} />
              </div>
              <p className="text-sm text-nature-muted leading-relaxed">
                {activeHabitat.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-green-soft mb-2">
                  <Trees size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Key Species</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeHabitat.keySpecies.map((s: string) => (
                    <span key={s} className="text-[11px] text-white/80 bg-white/5 px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Bird size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Suitability</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-white">{activeHabitat.suitability}%</span>
                  <span className="text-[10px] text-nature-muted mb-1">Index Score</span>
                </div>
              </div>
            </div>

            <button className="w-full py-4 rounded-2xl bg-white text-forest-950 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              Learn More
              <MapPin size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
