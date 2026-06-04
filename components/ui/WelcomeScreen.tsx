'use client'

import { motion } from 'framer-motion'
import { Map, Camera, BookOpen, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

export default function WelcomeScreen() {
  const setShowWelcome = useAppStore(s => s.setShowWelcome)
  const setCameraOpen = useAppStore(s => s.setCameraOpen)
  const setActiveView = useAppStore(s => s.setActiveView)

  const handleAction = (action: 'map' | 'camera' | 'stories') => {
    setShowWelcome(false)
    if (action === 'map') {
      setActiveView('map')
      // Trigger geolocation fly-to
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          useAppStore.setState({ userLocation: [pos.coords.longitude, pos.coords.latitude] })
        })
      }
    } else if (action === 'camera') {
      setActiveView('map')
      setCameraOpen(true)
    } else if (action === 'stories') {
      setActiveView('stories')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-forest-950/40 backdrop-blur-md"
    >
      {/* Background Graphic Accent */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-green-soft/10 to-transparent pointer-events-none" />
      
      <div className="relative w-full max-w-sm flex flex-col items-center gap-8 text-center">
        {/* Branding */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-green-soft flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(92,219,128,0.3)]">
            <Map className="text-forest-950" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
            Lost Woods <br />
            <span className="text-green-soft">Explorer</span>
          </h1>
          <p className="text-nature-muted mt-3 text-sm font-medium tracking-wide">
            Your immersive guide to the National Park’s <br /> 
            across West Sussex.
          </p>
        </motion.div>

        {/* Action Tiles */}
        <div className="w-full grid gap-4">
          <WelcomeTile
            icon={<Map className="text-green-soft" />}
            title="Explore Map"
            description="View trails & live wildlife data"
            onClick={() => handleAction('map')}
            delay={0.4}
          />
          <WelcomeTile
            icon={<Camera className="text-orange-400" />}
            title="Identify a Species"
            description="Photo ID with Gemini AI"
            onClick={() => handleAction('camera')}
            delay={0.5}
            highlight
          />
          <WelcomeTile
            icon={<BookOpen className="text-blue-400" />}
            title="Read Stories"
            description="Ecological deep-dives"
            onClick={() => handleAction('stories')}
            delay={0.6}
          />
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] uppercase tracking-[0.3em] text-nature-muted mt-4"
        >
          v2.0 · Professional GIS Edition
        </motion.p>
      </div>
    </motion.div>
  )
}

function WelcomeTile({ 
  icon, 
  title, 
  description, 
  onClick, 
  delay,
  highlight = false 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  onClick: () => void;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      onClick={onClick}
      className={`group w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
        highlight 
          ? 'bg-green-soft/10 border-green-soft/30 hover:bg-green-soft/20' 
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className={`p-3 rounded-xl bg-forest-950/50 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-[15px] font-bold text-white leading-tight">{title}</h3>
        <p className="text-[11px] text-nature-muted mt-0.5">{description}</p>
      </div>
      <ChevronRight size={18} className="text-nature-muted group-hover:translate-x-1 transition-transform" />
    </motion.button>
  )
}
