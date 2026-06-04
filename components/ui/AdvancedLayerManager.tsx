'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronRight, Leaf, Trees, Footprints, X } from 'lucide-react'
import { useState } from 'react'
import { useAppStore, type LayerGroup, type LayerId } from '@/lib/store/useAppStore'

const GROUP_ORDER: LayerGroup[] = ['Analytical Surface', 'Contextual Boundary', 'Data Layer']

export default function AdvancedLayerManager({ isHidden = false }: { isHidden?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const layers = useAppStore(s => s.layers)
  const toggleLayer = useAppStore(s => s.toggleLayer)
  const setLayerOpacity = useAppStore(s => s.setLayerOpacity)
  const setLayerVisibility = useAppStore(s => s.setLayerVisibility)

  // Simplified Preset Logic
  const presets = [
    { id: 'wildlife', label: 'Wildlife', icon: <Leaf size={16} />, layerIds: ['birds', 'fungi', 'plants'] },
    { id: 'habitats', label: 'Habitat Types', icon: <Trees size={16} />, layerIds: ['ecohabitat'] },
    { id: 'buffers',  label: 'Buffer Zones',  icon: <Layers size={16} />, layerIds: ['buffer-zones'] },
    { id: 'trails',   label: 'Trails',        icon: <Footprints size={16} />, layerIds: ['burley', 'emery', 'reihan'] },
  ]

  const isPresetActive = (layerIds: string[]) => layerIds.some(id => layers[id as LayerId]?.visible)
  
  const togglePreset = (layerIds: string[]) => {
    const active = isPresetActive(layerIds)
    layerIds.forEach(id => setLayerVisibility(id as LayerId, !active))
  }

  // Group layers based on their predefined groups
  const groupedLayers = Object.values(layers).reduce((acc, layer) => {
    if (!acc[layer.group]) acc[layer.group] = []
    acc[layer.group].push(layer)
    return acc
  }, {} as Record<LayerGroup, typeof layers[LayerId][]>)

  if (isHidden) return null

  return (
    <>
      {/* Desktop: Floating button + side panel */}
      <div className="hidden sm:flex absolute left-4 top-24 z-20 flex-col pointer-events-none">
        {/* Floating Toggle Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto h-12 w-12 rounded-2xl glass mb-2 flex items-center justify-center text-nature-text shadow-lg border border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-soft/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <Layers size={22} className={isOpen ? 'text-green-soft' : ''} />
        </motion.button>

        {/* Desktop Manager Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto w-80 glass panel-shadow rounded-3xl border border-white/10 overflow-hidden"
              style={{ maxHeight: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}
            >
              <LayerContent
                isAdvanced={isAdvanced}
                setIsAdvanced={setIsAdvanced}
                presets={presets}
                isPresetActive={isPresetActive}
                togglePreset={togglePreset}
                groupedLayers={groupedLayers}
                toggleLayer={toggleLayer}
                setLayerOpacity={setLayerOpacity}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: FAB + Bottom Sheet */}
      <div className="sm:hidden">
        {/* Mobile FAB */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.9 }}
          className="fixed left-4 top-16 z-30 h-12 w-12 rounded-2xl glass flex items-center justify-center text-nature-text shadow-lg border border-white/10"
        >
          <Layers size={22} className={isOpen ? 'text-green-soft' : ''} />
        </motion.button>

        {/* Mobile Bottom Sheet */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed bottom-0 inset-x-0 z-50"
              >
                <div className="mx-2 mb-2 glass panel-shadow rounded-3xl overflow-hidden border border-white/10"
                  style={{ maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-4 p-2 text-nature-muted hover:text-white z-10"
                  >
                    <X size={18} />
                  </button>

                  <LayerContent
                    isAdvanced={isAdvanced}
                    setIsAdvanced={setIsAdvanced}
                    presets={presets}
                    isPresetActive={isPresetActive}
                    togglePreset={togglePreset}
                    groupedLayers={groupedLayers}
                    toggleLayer={toggleLayer}
                    setLayerOpacity={setLayerOpacity}
                  />

                  {/* Safe area */}
                  <div className="h-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

function LayerContent({
  isAdvanced,
  setIsAdvanced,
  presets,
  isPresetActive,
  togglePreset,
  groupedLayers,
  toggleLayer,
  setLayerOpacity,
}: {
  isAdvanced: boolean
  setIsAdvanced: (v: boolean) => void
  presets: { id: string; label: string; icon: React.ReactNode; layerIds: string[] }[]
  isPresetActive: (ids: string[]) => boolean
  togglePreset: (ids: string[]) => void
  groupedLayers: Record<string, any[]>
  toggleLayer: (id: LayerId) => void
  setLayerOpacity: (id: LayerId, opacity: number) => void
}) {
  return (
    <>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-soft/10 text-green-soft">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white uppercase">Layers</h2>
            <p className="text-[10px] text-nature-muted tracking-widest uppercase">Map Visibility</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdvanced(!isAdvanced)}
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border transition-colors ${
            isAdvanced ? 'bg-green-soft text-forest-950 border-green-soft' : 'text-nature-muted border-white/10 hover:text-white'
          }`}
        >
          Advanced
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-4 sm:space-y-6 scrollbar-hide">
        {!isAdvanced ? (
          /* Simplified Preset View */
          <div className="space-y-3">
            {presets.map(preset => {
              const active = isPresetActive(preset.layerIds)
              return (
                <button
                  key={preset.id}
                  onClick={() => togglePreset(preset.layerIds)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                    active ? 'bg-green-soft/10 border-green-soft/30' : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${active ? 'bg-green-soft text-forest-950' : 'bg-white/10 text-nature-muted'}`}>
                    {preset.icon}
                  </div>
                  <span className={`flex-1 text-left text-sm font-bold ${active ? 'text-white' : 'text-nature-muted'}`}>
                    {preset.label}
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-soft shadow-[0_0_8px_rgba(92,219,128,0.6)]' : 'bg-white/10'}`} />
                </button>
              )
            })}
          </div>
        ) : (
          /* Full GIS Controls */
          GROUP_ORDER.map((groupName) => {
            const groupItems = groupedLayers[groupName]
            if (!groupItems || groupItems.length === 0) return null

            return (
              <div key={groupName} className="space-y-2">
                <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-nature-muted flex items-center gap-2">
                  <ChevronRight size={12} className="text-green-soft" />
                  {groupName}
                </h3>
                {groupItems.map((layer: any) => (
                  <div key={layer.id} className="flex items-center gap-3 py-3 sm:py-2 px-3 rounded-xl hover:bg-white/5 transition-colors">
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      className={`w-10 h-6 sm:w-8 sm:h-5 rounded-full transition-all relative shrink-0 ${
                        layer.visible ? 'bg-green-soft' : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-white shadow transition-transform ${
                        layer.visible ? 'translate-x-4 sm:translate-x-3.5' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <span className={`flex-1 text-xs font-medium ${layer.visible ? 'text-white' : 'text-nature-muted'}`}>
                      {layer.label}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(layer.opacity * 100)}
                      onChange={(e) => setLayerOpacity(layer.id, Number(e.target.value) / 100)}
                      className="w-16 accent-green-500 h-1"
                    />
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
