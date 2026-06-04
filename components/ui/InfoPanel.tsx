'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, User, Trees, Star, Bug, Leaf, ExternalLink, Camera } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

const TAXON_INFO: Record<string, { color: string, icon: any, label: string }> = {
  birds: { color: '#4cde8f', icon: <Bug size={14} className="mr-1" />, label: 'Avian' }, 
  fungi: { color: '#c084fc', icon: <Leaf size={14} className="mr-1" />, label: 'Fungi' },
  plants: { color: '#22d3ee', icon: <Trees size={14} className="mr-1" />, label: 'Flora' }
}

export default function InfoPanel() {
  const selectedObj    = useAppStore(s => s.selectedFeature)
  const selectedTrail  = useAppStore(s => s.selectedTrail)
  const setActivePanel = useAppStore(s => s.setActivePanel)
  const feature = selectedObj

  const onClose = () => {
    useAppStore.getState().setSelectedFeature(null)
    // If the trail panel was open when species was tapped, go back to it
    if (selectedTrail) setActivePanel('trail')
  }

  if (!feature) return null

  const taxonInfo = TAXON_INFO[feature.taxonGroup] ?? { color: '#5cdb80', icon: <Leaf size={14} />, label: 'Species' }
  const accentColor = taxonInfo.color

  // Multi-recorder formatting part of Part 1.1
  const isMultipleRecorders = feature.recorder.includes(';')
  const displayRecorder = isMultipleRecorders ? 'Multiple Recorders' : feature.recorder

  const consStatus = feature.conservationStatus || 'Protected Native Species'

  const getInsight = () => {
    if (feature.taxonGroup === 'birds') return `Crucial for local seed dispersal. Habitat suitability modeling suggests a high dependency on established ancient woodland canopies.`
    if (feature.taxonGroup === 'fungi') return `Forms essential mycorrhizal networks. Represents high soil health and minimal previous ecological disturbance.`
    return `Contributes to the micro-climate stability of priority habitats, acting as a crucial carbon sink.`
  }


  return (
    <AnimatePresence>
        <>
          {/* Mobile backdrop */}
          <motion.div
            className="fixed inset-0 z-40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.45)' }}
          />

          {/* Panel — bottom sheet on mobile, right side on desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="fixed bottom-0 inset-x-0 z-50 sm:bottom-auto sm:top-20 sm:right-4 sm:inset-x-auto"
            style={{ sm: { width: '320px' } } as React.CSSProperties}
          >
            <div
              className="glass panel-shadow rounded-t-3xl sm:rounded-2xl overflow-hidden w-full sm:w-80"
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* ← Back button row */}
              <div className="px-4 pt-4 pb-2">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-nature-muted hover:text-white transition-colors min-h-[44px] -ml-1 px-1 rounded-xl"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                  <span className="text-[12px] font-semibold tracking-wide">
                    {selectedTrail ? `Back to ${selectedTrail.name ?? 'Trail'}` : 'Back'}
                  </span>
                </button>
              </div>

              {/* Header */}
              <div
                className="flex items-start px-5 pt-1 pb-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {feature.taxonGroup === 'birds' && <Star size={8} className="text-orange-400" />}
                    <span
                      className="badge flex items-center"
                      style={{ background: `${accentColor}20`, color: accentColor }}
                    >
                      {taxonInfo.icon} {taxonInfo.label}
                    </span>
                  </div>
                  <h2 className="text-2xl font-playfair text-white leading-tight tracking-wide">
                    {feature.commonName !== 'Observation' ? feature.commonName : `Record ${feature.gridRef}`}
                  </h2>
                  <p className="text-[11px] italic text-nature-muted mt-0.5 opacity-80">
                    {feature.scientificName}
                  </p>
                </div>
              </div>

              {/* Detail grid */}
              <div className="px-5 py-4 grid grid-cols-2 gap-3">
                {([
                  { icon: <Calendar size={12} />, label: 'Date', value: feature.date },
                  { icon: <User size={12} />, label: 'Recorder', value: displayRecorder, title: isMultipleRecorders ? feature.recorder : undefined },
                  { icon: <Trees size={12} />, label: 'Habitat', value: feature.habitat },
                  { icon: <MapPin size={12} />, label: 'Count', value: feature.count ? String(feature.count) : null },
                ] as { icon: React.ReactNode; label: string; value: string | null; title?: string }[]).map(({ icon, label, value, title }) => (
                  value ? (
                    <div key={label} title={title}>
                      <div className="flex items-center gap-1 text-[9px] text-nature-muted mb-0.5 uppercase tracking-wider">
                        {icon} {label}
                      </div>
                      <div className="text-[11px] font-medium text-nature-text truncate">{value}</div>
                    </div>
                  ) : null
                ))}
              </div>

              {/* GIS Ecological Insights System */}
              <div className="px-5 pb-5">
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-nature-muted block mb-1">Conservation Significance</span>
                    <span className={`text-[11px] font-bold tracking-wide text-orange-400`}>
                      {feature.conservationStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-nature-muted block mb-1">Spatial Ecological Insight</span>
                    <p className="text-xs font-playfair text-nature-muted leading-relaxed italic">
                      {getInsight()}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── iNaturalist links ── */}
              <div className="px-5 pb-4 space-y-2">
                {/* Observation photo thumbnail */}
                {feature.imageUrl && (
                  <div
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                      aspectRatio: '16/9',
                      background: '#0a1a0e',
                      marginBottom: 8,
                    }}
                  >
                    <img
                      src={feature.imageUrl.replace('square', 'medium')}
                      alt={feature.commonName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                    />
                  </div>
                )}

                {/* Primary: view this observation */}
                {feature.inatUrl && (
                  <a
                    href={feature.inatUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '9px 14px',
                      borderRadius: 10,
                      background: 'rgba(92,219,128,0.12)',
                      border: '1px solid rgba(92,219,128,0.3)',
                      color: '#5cdb80',
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(92,219,128,0.22)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(92,219,128,0.12)')}
                  >
                    <ExternalLink size={13} />
                    View observation on iNaturalist
                  </a>
                )}

                {/* Secondary: explore taxon page */}
                <a
                  href={
                    feature.taxonId
                      ? `https://www.inaturalist.org/taxa/${feature.taxonId}`
                      : `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(feature.scientificName || feature.commonName)}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#7aa87e',
                    fontSize: 11,
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Camera size={12} />
                  Explore species on iNaturalist
                </a>

                {/* Submit your own observation */}
                <a
                  href={`https://www.inaturalist.org/observations/new?taxon_name=${encodeURIComponent(feature.scientificName || feature.commonName)}&latitude=50.924&longitude=-0.220&place_guess=Lost+Woods%2C+West+Sussex`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#7aa87e',
                    fontSize: 11,
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  + Record your own sighting at Lost Woods
                </a>
              </div>

              {/* Safe bottom area for mobile */}
              <div className="h-4 sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
            </div>
          </motion.div>
        </>
    </AnimatePresence>
  )
}
