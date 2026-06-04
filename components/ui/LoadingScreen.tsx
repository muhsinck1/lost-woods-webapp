'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Leaf } from 'lucide-react'

interface LoadingScreenProps {
  isVisible: boolean
  progress: { done: number; total: number }
}

const NATURE_MESSAGES = [
  'Reading the forest…',
  'Counting bird calls…',
  'Tracing ancient trails…',
  'Mapping habitats…',
  'Cataloguing fungi…',
  'Loading biodiversity data…',
  'Almost there…',
]

export default function LoadingScreen({ isVisible, progress }: LoadingScreenProps) {
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0
  const msgIndex = Math.min(Math.floor((pct / 100) * NATURE_MESSAGES.length), NATURE_MESSAGES.length - 1)
  const message = NATURE_MESSAGES[msgIndex]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #050d07 0%, #0d2212 50%, #050d07 100%)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, rgba(92,219,128,0.08) 0%, transparent 60%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6 px-8">
            {/* Animated logo */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1a3d1f, #122b16)',
                boxShadow: '0 0 32px rgba(92,219,128,0.35)',
              }}
            >
              <Leaf size={26} className="text-green-soft" />
            </motion.div>

            {/* Title */}
            <div className="text-center">
              <div className="text-2xl font-bold text-nature-text">Lost Woods Explorer</div>
              <div className="text-[10px] tracking-widest uppercase text-nature-muted mt-1">
                National Park · UK
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-56">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(92,219,128,0.12)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #5cdb80, #7ec850)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-nature-muted italic">{message}</span>
                <span className="text-[10px] font-mono text-green-soft">{pct}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
