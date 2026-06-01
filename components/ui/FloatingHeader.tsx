'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Box, RotateCcw, Play, Search, Crosshair, Home, Info, MoreHorizontal, X } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

interface FloatingHeaderProps {
  is3D: boolean
  onToggle3D: () => void
}

export default function FloatingHeader({ is3D, onToggle3D }: FloatingHeaderProps) {
  const setTourMode = useAppStore(s => s.setTourMode)
  const setActivePanel = useAppStore(s => s.setActivePanel)
  const activePanel = useAppStore(s => s.activePanel)
  const setShowWelcome = useAppStore(s => s.setShowWelcome)
  const setAboutOpen = useAppStore(s => s.setMethodologyOpen)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        useAppStore.setState({ userLocation: [pos.coords.longitude, pos.coords.latitude] as [number, number] })
      })
    }
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl glass panel-shadow"
        style={{ maxWidth: 'calc(100vw - 16px)' }}
      >
        {/* Brand */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1a3d1f, #122b16)',
            boxShadow: '0 0 14px rgba(92,219,128,0.4)',
          }}
        >
          <Leaf size={14} className="text-green-soft" />
        </div>

        {/* Desktop title */}
        <div className="hidden sm:block mr-1">
          <div className="text-[13px] font-bold text-nature-text leading-none uppercase tracking-wider">
            Eco Trail
          </div>
          <div className="text-[9px] tracking-[0.2em] uppercase text-green-soft mt-0.5">
            Lost Woods · West Sussex
          </div>
        </div>

        {/* Mobile title */}
        <div className="sm:hidden text-[12px] font-semibold text-nature-text mr-1">
          Eco Trail
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-2 sm:min-w-4" />

        {/* === Mobile: show only 3 key buttons + overflow menu === */}

        {/* Search (always visible) */}
        <button
          onClick={() => setActivePanel(activePanel === 'search' ? null : 'search')}
          className={`w-9 h-9 sm:w-auto sm:h-auto sm:p-1.5 flex items-center justify-center rounded-xl border transition-all ${
            activePanel === 'search'
              ? 'border-green-soft text-green-soft bg-green-soft/10'
              : 'border-nature-border text-nature-muted hover:text-nature-text'
          }`}
          title="Search Species"
        >
          <Search size={16} className="sm:w-[14px] sm:h-[14px]" />
        </button>

        {/* Locate Me (always visible) */}
        <button
          onClick={handleLocateMe}
          className="w-9 h-9 sm:w-auto sm:h-auto sm:p-1.5 flex items-center justify-center rounded-xl text-nature-muted hover:text-nature-text border border-nature-border hover:border-green-soft/50 transition-all"
          title="Locate Me"
        >
          <Crosshair size={16} className="sm:w-[14px] sm:h-[14px]" />
        </button>

        {/* Home (always visible) */}
        <button
          onClick={() => setShowWelcome(true)}
          className="w-9 h-9 sm:w-auto sm:h-auto sm:p-1.5 flex items-center justify-center rounded-xl text-nature-muted hover:text-white border border-nature-border hover:border-green-soft/50 transition-all"
          title="Home Screen"
        >
          <Home size={16} className="sm:w-[14px] sm:h-[14px]" />
        </button>

        {/* Mobile overflow menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-9 h-9 sm:hidden flex items-center justify-center rounded-xl text-nature-muted border border-nature-border transition-all"
        >
          {mobileMenuOpen ? <X size={16} /> : <MoreHorizontal size={16} />}
        </button>

        {/* === Desktop-only buttons === */}

        {/* Guide Mode */}
        <button
          onClick={() => setTourMode(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest text-orange-400 bg-orange-400/10 border border-orange-400/30 hover:bg-orange-400/20 transition-all uppercase"
        >
          <Play size={12} fill="currentColor" />
          Guide
        </button>

        {/* 3D Toggle (desktop) */}
        <button
          onClick={onToggle3D}
          className={`hidden sm:flex p-1.5 rounded-xl transition-all border ${
            is3D
              ? 'border-green-soft text-green-soft bg-green-soft/10'
              : 'border-nature-border text-nature-muted hover:border-green-soft/50 hover:text-nature-text'
          }`}
          title={is3D ? 'Switch to 2D' : 'Switch to 3D'}
        >
          <Box size={14} />
        </button>

        {/* About (desktop) */}
        <button
          onClick={() => setAboutOpen(true)}
          className="hidden sm:flex p-1.5 rounded-xl text-nature-muted hover:text-white border border-nature-border hover:border-green-soft/50 transition-all"
          title="About & Methodology"
        >
          <Info size={14} />
        </button>

        {/* Reset (desktop) */}
        <button
          className="hidden sm:flex p-1.5 rounded-xl text-nature-muted hover:text-nature-text border border-nature-border hover:border-green-soft/50 transition-all"
          title="Refresh Platform"
          onClick={() => window.location.reload()}
        >
          <RotateCcw size={13} />
        </button>
      </motion.header>

      {/* === Mobile overflow menu (bottom sheet) === */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/40 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-[56] sm:hidden"
            >
              <div className="mx-3 mb-3 glass panel-shadow rounded-3xl overflow-hidden border border-white/10">
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="p-4 space-y-2">
                  <MobileMenuItem
                    icon={<Box size={20} />}
                    label={is3D ? '2D View' : '3D View'}
                    active={is3D}
                    onClick={() => { onToggle3D(); setMobileMenuOpen(false) }}
                  />
                  <MobileMenuItem
                    icon={<Play size={20} />}
                    label="Guided Tour"
                    onClick={() => { setTourMode(true); setMobileMenuOpen(false) }}
                  />
                  <MobileMenuItem
                    icon={<Info size={20} />}
                    label="About & Methodology"
                    onClick={() => { setAboutOpen(true); setMobileMenuOpen(false) }}
                  />
                  <MobileMenuItem
                    icon={<RotateCcw size={20} />}
                    label="Refresh"
                    onClick={() => window.location.reload()}
                  />
                </div>

                {/* Safe area */}
                <div className="h-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileMenuItem({ icon, label, onClick, active = false }: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] ${
        active
          ? 'bg-green-soft/10 border-green-soft/30 text-green-soft'
          : 'bg-white/5 border-white/5 text-nature-text'
      }`}
    >
      <div className={`p-2 rounded-xl ${active ? 'bg-green-soft/20' : 'bg-white/10'}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  )
}
