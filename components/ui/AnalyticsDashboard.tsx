'use client'

import { motion } from 'framer-motion'
import { Activity, ShieldAlert, Bug } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

export default function AnalyticsDashboard() {
  const stats = useAppStore((s) => s.globalStats)
  const totalObs = stats.birds + stats.fungi + stats.plants

  // Mock sensitivity metric based on volume of observations (for demonstration)
  const sensitivityBase = Math.min((totalObs / 2500) * 100, 100) 
  const sensitivityScore = totalObs > 0 ? (sensitivityBase).toFixed(1) : '...'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
      className="absolute bottom-24 right-4 z-20 pointer-events-none hidden sm:flex flex-col gap-3"
    >
      {/* Primary Analytics Card — hidden on mobile to avoid overlap with ExploreBar */}
      <div className="glass panel-shadow rounded-2xl p-4 border border-white/10 w-48 pointer-events-auto">
        <div className="flex items-center gap-2 mb-3 px-1 border-b border-white/5 pb-2">
          <Activity size={14} className="text-green-soft" />
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-nature-muted">Spatial Metrics</h3>
        </div>

        <div className="space-y-4">
          {/* Observation Volume */}
          <div>
            <p className="text-[10px] text-nature-muted tracking-wide uppercase mb-1">Total Geo-Records</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white leading-none">
                {totalObs.toLocaleString()}
              </span>
              <span className="text-[10px] text-green-soft mb-0.5">+12%</span>
            </div>
          </div>

          {/* Environmental Sensitivity Index */}
          <div>
            <p className="text-[10px] text-nature-muted tracking-wide uppercase mb-1">Sensitivity Index</p>
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-orange-400" />
              <span className="text-lg font-medium text-white leading-none">
                {sensitivityScore}
              </span>
              <span className="text-[10px] text-nature-muted">/ 100</span>
            </div>
            {/* Minimal progress bar */}
            <div className="mt-1.5 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-soft to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${sensitivityScore}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Top Ecological Class */}
          <div>
            <p className="text-[10px] text-nature-muted tracking-wide uppercase mb-1">Dominant Kingdom</p>
            <div className="flex items-center gap-2">
              <Bug size={14} className="text-[#c084fc]" />
              <span className="text-sm font-medium text-white">Fungi</span>
              <span className="text-[10px] text-nature-muted ml-auto">{(stats.fungi / (totalObs || 1) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
