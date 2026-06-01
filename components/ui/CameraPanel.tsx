'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

export default function CameraPanel() {
  const isOpen = useAppStore(s => s.activePanel === 'camera')
  const setCameraOpen = useAppStore(s => s.setCameraOpen)
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    simulateGeminiAnalysis()
  }

  const simulateGeminiAnalysis = () => {
    setIsAnalyzing(true)
    setResult(null)
    
    // Simulate Gemini Vision response delay
    setTimeout(() => {
      setIsAnalyzing(false)
      setResult({
        identified: true,
        common_name: "Red Deer",
        scientific_name: "Cervus elaphus",
        kingdom: "Animalia",
        confidence: "high",
        habitat: "Mixed Woodland & Heathland",
        conservation_status: "Least Concern",
        ecological_note: "The UK's largest land mammal, crucial for grazing and maintaining heathland structure.",
        inaturalist_search_term: "Cervus elaphus",
        safe_to_approach: false,
        child_friendly_fact: "Only the male stags grow antlers, which they drop and regrow every single year!"
      })
    }, 2500)
  }

  const reset = () => {
    setPreviewUrl(null)
    setResult(null)
    setIsAnalyzing(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-forest-950/90 backdrop-blur-xl"
        onClick={() => setCameraOpen(false)}
      />

      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="relative w-full max-w-md glass-light rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Camera size={20} className="text-green-soft" />
            Species Identifier
          </h2>
          <button onClick={() => setCameraOpen(false)} className="p-2 text-nature-muted">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {!previewUrl ? (
            <div className="flex flex-col items-center gap-6 py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-green-soft/10 flex items-center justify-center">
                <Camera size={48} className="text-green-soft" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Capture or Upload</h3>
                <p className="text-sm text-nature-muted mt-1 px-4">
                  Take a photo of a plant, bird, or mammal to identify it instantly using Gemini AI.
                </p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-soft text-forest-950 px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
              >
                Choose Photo
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                onChange={handleCapture}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview */}
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-forest-950/60 flex flex-col items-center justify-center text-white">
                    <RefreshCw className="animate-spin mb-3" size={32} />
                    <span className="text-sm font-bold tracking-widest uppercase">Analyzing...</span>
                  </div>
                )}
              </div>

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white font-playfair">{result.common_name}</h3>
                        <p className="text-sm text-green-soft italic">{result.scientific_name}</p>
                      </div>
                      <div className="px-3 py-1 bg-green-soft/20 text-green-soft rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {result.confidence} Confidence
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <DataPill label="Habitat" value={result.habitat} icon={<Info size={12} />} />
                      <DataPill label="Status" value={result.conservation_status} icon={<CheckCircle2 size={12} />} color={result.conservation_status === 'Protected' ? 'text-orange-400' : 'text-green-soft'} />
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-xs text-nature-muted leading-relaxed">
                        <strong className="text-white block mb-1">Ecological Role</strong>
                        {result.ecological_note}
                      </p>
                    </div>

                    {!result.safe_to_approach && (
                      <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                        <AlertCircle size={18} className="shrink-0" />
                        <p className="text-[11px] font-bold uppercase tracking-wider">Do not approach — maintain safe distance</p>
                      </div>
                    )}

                    <div className="p-4 bg-orange-400/10 rounded-2xl border border-orange-400/20">
                      <p className="text-[11px] text-orange-400 font-bold mb-1 uppercase tracking-widest">Did you know?</p>
                      <p className="text-sm text-white italic">"{result.child_friendly_fact}"</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={reset}
                        className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors"
                      >
                        Try Another
                      </button>
                      <a 
                        href={`https://www.inaturalist.org/search?q=${encodeURIComponent(result.inaturalist_search_term)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-[1.5] py-3 rounded-xl bg-green-soft text-forest-950 font-bold text-sm flex items-center justify-center gap-2"
                      >
                        iNaturalist Data
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function DataPill({ label, value, icon, color = 'text-nature-text' }: { label: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
      <span className="text-[9px] uppercase tracking-[0.2em] text-nature-muted block mb-1">{label}</span>
      <div className={`text-xs font-bold flex items-center gap-2 ${color}`}>
        {icon}
        {value}
      </div>
    </div>
  )
}
