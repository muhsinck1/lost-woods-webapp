'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Leaf, Bug, Trees, X } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { STORIES } from '@/lib/stories'

const TAXON_ICONS: Record<string, any> = {
  birds: <Bug size={14} className="text-bird" />,
  fungi: <Leaf size={14} className="text-fungi" />,
  plants: <Trees size={14} className="text-plant" />
}

export default function SearchBar() {
  const isOpen = useAppStore(s => s.activePanel === 'search')
  const searchQuery = useAppStore(s => s.searchQuery)
  const setSearchQuery = useAppStore(s => s.setSearchQuery)
  const setPanel = useAppStore(s => s.setActivePanel)
  const setSelectedFeature = useAppStore(s => s.setSelectedFeature)
  
  const [results, setResults] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Mock search logic — in a real setup, this would query the GeoJSON sources
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const q = searchQuery.toLowerCase()
    
    // Search stories
    const storyResults = STORIES.filter(s => 
      s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q)
    ).map(s => ({ ...s, type: 'Story', icon: '📖' }))

    // Mock species results (we'd ideally filter loaded geojson here)
    const mockSpecies = [
      { id: 's1', commonName: 'Ancient Oak', scientificName: 'Quercus robur', taxonGroup: 'plants', type: 'Species' },
      { id: 's2', commonName: 'Fallow Deer', scientificName: 'Dama dama', taxonGroup: 'birds', type: 'Species' },
      { id: 's3', commonName: 'Fly Agaric', scientificName: 'Amanita muscaria', taxonGroup: 'fungi', type: 'Species' },
    ].filter(s => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q))

    setResults([...storyResults, ...mockSpecies].slice(0, 5))
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[58] bg-black/30 sm:hidden"
        onClick={() => setPanel(null)}
      />

      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-16 sm:top-24 left-0 sm:left-1/2 sm:-translate-x-1/2 z-[60] w-full sm:max-w-md px-3 sm:px-4"
      >
        <div className="glass panel-shadow rounded-2xl overflow-hidden border border-green-soft/30 bg-forest-950/80 backdrop-blur-xl">
          <div className="flex items-center p-3 sm:p-4 gap-3">
            <Search size={18} className="text-green-soft shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search species, habitats..."
              className="flex-1 bg-transparent border-none outline-none text-nature-text placeholder:text-nature-muted text-[15px] sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={() => setPanel(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0">
              <X size={18} className="text-nature-muted" />
            </button>
          </div>

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-white/5 divide-y divide-white/5"
              >
                {results.map((res, i) => (
                  <button
                    key={res.id || i}
                    className="w-full text-left px-4 sm:px-5 py-3.5 sm:py-3 hover:bg-green-soft/10 active:bg-green-soft/15 transition-colors flex items-center justify-between group"
                    onClick={() => {
                      setPanel(null)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-black/40 flex items-center justify-center text-lg shrink-0">
                        {res.type === 'Species' ? TAXON_ICONS[res.taxonGroup] : res.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] sm:text-[13px] font-semibold text-white group-hover:text-green-soft transition-colors truncate">
                          {res.commonName || res.title}
                        </div>
                        <div className="text-[11px] sm:text-[10px] text-nature-muted italic font-playfair uppercase tracking-wider truncate">
                          {res.scientificName || res.type}
                        </div>
                      </div>
                    </div>
                    <MapPin size={14} className="text-nature-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
