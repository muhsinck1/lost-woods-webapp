'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Ruler, Clock, ChevronRight, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { TRAIL_META } from '@/lib/trailMeta'

const TRAILS = Object.entries(TRAIL_META).map(([key, meta]) => ({ key, ...meta }))

// Difficulty badge colour
function diffColor(difficulty: string): string {
  if (difficulty.toLowerCase().includes('easy'))       return '#4cde8f'
  if (difficulty.toLowerCase().includes('challenging')) return '#f87171'
  return '#fbbf24'
}

export default function TrailsListPanel() {
  const activeView     = useAppStore(s => s.activeView)
  const setSelectedTrail = useAppStore(s => s.setSelectedTrail)
  const selectedTrail  = useAppStore(s => s.selectedTrail)

  const isOpen = activeView === 'trails'

  function openTrail(key: string) {
    const meta = TRAIL_META[key]
    setSelectedTrail({
      trailKey:   key,
      name:       meta.name,
      difficulty: meta.difficulty,
      distance:   meta.distance,
      duration:   meta.duration,
      note:       meta.note,
      habitats:   meta.habitats,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Desktop: left sidebar ─────────────────────────────── */}
          <motion.div
            key="trails-desktop"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0,    opacity: 1 }}
            exit={{    x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden sm:flex fixed left-4 top-20 z-20 flex-col gap-3 w-72"
          >
            {/* Header */}
            <div className="glass panel-shadow rounded-2xl px-5 py-4 border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nature-muted mb-0.5">
                Lost Woods
              </p>
              <h2 className="text-lg font-bold text-white">Trails</h2>
              <p className="text-[11px] text-nature-muted mt-0.5">
                {TRAILS.length} routes · Tap to explore
              </p>
            </div>

            {/* Trail cards */}
            {TRAILS.map((trail, i) => {
              const isActive = selectedTrail?.trailKey === trail.key
              return (
                <motion.button
                  key={trail.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => openTrail(trail.key)}
                  className="glass panel-shadow rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98] border"
                  style={{
                    borderColor: isActive ? `${trail.color}50` : 'rgba(255,255,255,0.08)',
                    background:  isActive ? `${trail.color}10` : undefined,
                  }}
                >
                  {/* Colour accent bar */}
                  <div className="h-1 w-full" style={{ background: trail.color }} />

                  <div className="px-5 py-4">
                    {/* Difficulty badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          background: `${diffColor(trail.difficulty)}18`,
                          color:       diffColor(trail.difficulty),
                        }}
                      >
                        {trail.difficulty}
                      </span>
                      <ChevronRight
                        size={14}
                        className="transition-transform"
                        style={{ color: isActive ? trail.color : 'rgba(255,255,255,0.25)',
                          transform: isActive ? 'translateX(2px)' : 'none' }}
                      />
                    </div>

                    {/* Trail name */}
                    <h3 className="text-[15px] font-bold text-white leading-snug mb-3">
                      {trail.name}
                    </h3>

                    {/* Stats row */}
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[11px] text-nature-muted">
                        <Ruler size={11} style={{ color: trail.color, opacity: 0.8 }} />
                        {trail.distance}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-nature-muted">
                        <Clock size={11} style={{ color: trail.color, opacity: 0.8 }} />
                        {trail.duration}
                      </span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>

          {/* ── Mobile: horizontal scroll row at bottom ───────────── */}
          <motion.div
            key="trails-mobile"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{    y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="sm:hidden fixed bottom-20 inset-x-0 z-20 px-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-soft mb-2 px-1">
              Choose a trail
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}>
              {TRAILS.map((trail, i) => {
                const isActive = selectedTrail?.trailKey === trail.key
                return (
                  <motion.button
                    key={trail.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => openTrail(trail.key)}
                    className="shrink-0 snap-center glass panel-shadow rounded-2xl overflow-hidden text-left active:scale-95 transition-all border"
                    style={{
                      width: 200,
                      borderColor: isActive ? `${trail.color}60` : 'rgba(255,255,255,0.08)',
                      background:  isActive ? `${trail.color}12` : undefined,
                    }}
                  >
                    {/* Colour bar */}
                    <div className="h-1.5 w-full" style={{ background: trail.color }} />

                    <div className="px-4 py-3.5">
                      {/* Difficulty */}
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ color: diffColor(trail.difficulty) }}
                      >
                        {trail.difficulty}
                      </span>

                      {/* Name */}
                      <h3 className="text-[14px] font-bold text-white leading-snug mt-1 mb-2.5">
                        {trail.name}
                      </h3>

                      {/* Stats */}
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-nature-muted">
                          <Ruler size={10} style={{ color: trail.color }} />{trail.distance}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-nature-muted">
                          <Clock size={10} style={{ color: trail.color }} />{trail.duration}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
