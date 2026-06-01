'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { STORIES } from '@/lib/stories'

export default function TourMode() {
  const isTouring = useAppStore((s) => s.tourMode)
  const setTouring = useAppStore((s) => s.setTourMode)
  const setActiveStoryId = useAppStore((s) => s.setActiveStoryId)
  const setActivePanel = useAppStore((s) => s.setActivePanel)
  
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!isTouring) {
      setStepIndex(0)
      return
    }

    const runTour = async () => {
      // Logic to cycle through STORIES
      for (let i = 0; i < STORIES.length; i++) {
        setStepIndex(i)
        setActiveStoryId(STORIES[i].id)
        setActivePanel('stories')
        
        // Wait for user to read and map to fly
        await new Promise(r => setTimeout(r, 9000))
        if (!useAppStore.getState().tourMode) break
      }

      setTouring(false)
      setActiveStoryId(null)
      setActivePanel(null)
    }

    runTour()
  }, [isTouring, setActiveStoryId, setActivePanel, setTouring])

  return (
    <AnimatePresence>
      {isTouring && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 sm:top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 sm:gap-4 bg-black/60 backdrop-blur-md rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-green-soft/30 panel-shadow w-[calc(100%-24px)] sm:w-auto max-w-sm sm:max-w-none"
        >
          <div className="flex bg-green-soft/20 text-green-soft p-1.5 sm:p-2 rounded-full animate-pulse shrink-0">
            <Play size={14} />
          </div>
          
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-green-soft tracking-widest uppercase font-bold">
              Guided Tour
            </span>
            <span className="text-[13px] sm:text-sm text-white font-medium truncate">
              {STORIES[stepIndex]?.title}
            </span>
          </div>

          <button 
            onClick={() => setTouring(false)}
            className="flex items-center gap-1.5 text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/40 px-3 py-2 rounded-full transition-colors font-bold tracking-wider uppercase shrink-0 active:scale-95"
          >
            <Square size={12} /> Stop
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
