'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

import { useAppStore } from '@/lib/store/useAppStore'
import { useRef, useEffect } from 'react'

import { STORIES } from '@/lib/stories'

export default function StoriesPanel() {
  const isOpen = useAppStore(s => s.activeView === 'stories' || s.activePanel === 'stories')
  const activeStoryId = useAppStore(s => s.activeStoryId)
  const setActiveStoryId = useAppStore(s => s.setActiveStoryId)
  const setActivePanel = useAppStore(s => s.setActivePanel)

  // Use an IntersectionObserver to auto-select stories when user swipes on mobile
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setActiveStoryId(null)
      return
    }
    // Set first story default upon opening
    if (!activeStoryId) setActiveStoryId(STORIES[0].id)
  }, [isOpen, activeStoryId, setActiveStoryId])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 sm:bottom-20 inset-x-0 z-30 px-2 sm:px-3"
        >
          {/* Section header */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3 px-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-green-soft">
              Ecological Narratives
            </span>
            <div className="flex-1 h-px bg-nature-border/50" />
            <button 
              onClick={() => {
                const s = useAppStore.getState()
                if (s.activeView === 'stories') s.setActiveView('map')
                else s.setActivePanel(null)
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} className="text-nature-muted" />
            </button>
          </div>

          {/* Horizontal scroll cards */}
          <div
            className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            ref={scrollRef}
            onScroll={() => {
              const el = scrollRef.current
              if (!el) return
              const center = el.scrollLeft + el.clientWidth / 2
              let closest = 0
              let minDiff = Infinity
              for (let i = 0; i < el.children.length; i++) {
                const child = el.children[i] as HTMLElement
                const childCenter = child.offsetLeft + child.clientWidth / 2 - el.offsetLeft
                const diff = Math.abs(center - childCenter)
                if (diff < minDiff) {
                  minDiff = diff
                  closest = i
                }
              }
              const newId = STORIES[closest]?.id || null
              if (newId !== activeStoryId) setActiveStoryId(newId)
            }}
          >
            {STORIES.map((story, i) => {
              const isSelected = activeStoryId === story.id
              return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                onClick={() => {
                  setActiveStoryId(story.id)
                  const el = scrollRef.current
                  if (el) {
                    const child = el.children[STORIES.indexOf(story)] as HTMLElement
                    child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                  }
                }}
                className={`shrink-0 w-56 sm:w-64 snap-center rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out active:scale-95 ${
                  isSelected ? 'scale-100 opacity-100 border border-green-soft/50' : 'scale-95 opacity-50 border border-white/5'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${story.color}, ${story.color}dd)`,
                  boxShadow: isSelected ? '0 16px 32px rgba(0,0,0,0.6)' : '0 8px 16px rgba(0,0,0,0.3)',
                }}
              >
                <div className="p-4">
                  <div className="text-2xl mb-2">{story.icon}</div>
                  <div
                    className="text-[9px] font-bold tracking-widest uppercase mb-1"
                    style={{ color: story.color }}
                  >
                    {story.era}
                  </div>
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-nature-text mb-2">{story.title}</h3>
                  <p className="text-[11px] font-playfair text-nature-muted leading-relaxed line-clamp-3 italic opacity-90">
                    {story.body}
                  </p>
                  <button
                    className="mt-3 text-[10px] font-semibold tracking-wide"
                    style={{ color: story.color }}
                  >
                    Read more →
                  </button>
                </div>
              </motion.div>
            )})}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
