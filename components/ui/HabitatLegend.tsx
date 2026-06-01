'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'

// Colours matched exactly to MapCore.tsx phi-fill paint expression
const HABITAT_LEGEND = [
  { label: 'Deciduous Woodland',         color: '#2d6a2d', icon: '🌳' },
  { label: 'Lowland Heathland',          color: '#9b59b6', icon: '🌿' },
  { label: 'Grazing Marsh / Wetland',    color: '#2980b9', icon: '💧' },
  { label: 'Calcareous Grassland',       color: '#f1c40f', icon: '🦋' },
  { label: 'Semi-improved Grassland',    color: '#27ae60', icon: '🌾' },
  { label: 'Traditional Orchard',        color: '#e67e22', icon: '🍎' },
  { label: 'Acid Grassland',             color: '#d4ac0d', icon: '🌱' },
  { label: 'Coastal Saltmarsh',          color: '#1abc9c', icon: '🌊' },
  { label: 'Lowland Meadows',            color: '#a8d08d', icon: '🌼' },
  { label: 'Ponds / Water',              color: '#1e88e5', icon: '🐸' },
]

export default function HabitatLegend() {
  const [open, setOpen] = useState(true)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 96,
        left: 16,
        zIndex: 30,
        pointerEvents: 'auto',
        maxWidth: 210,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.35 }}
        style={{
          background: 'rgba(5, 13, 7, 0.94)',
          border: '1px solid rgba(74, 222, 128, 0.28)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 6px 28px rgba(0,0,0,0.55)',
        }}
      >
        {/* ── Header ── */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 13px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderBottom: open ? '1px solid rgba(74,222,128,0.12)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Layers size={11} color="#4ade80" />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#86efac',
            }}>
              Habitat Types
            </span>
          </div>
          {open
            ? <ChevronDown size={11} color="#4ade80" />
            : <ChevronUp   size={11} color="#4ade80" />
          }
        </button>

        {/* ── Table ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
            >
              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '14px 1fr',
                gap: '0 8px',
                padding: '6px 13px 2px',
              }}>
                <span style={{ fontSize: 8.5, color: '#4a7c52', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}></span>
                <span style={{ fontSize: 8.5, color: '#4a7c52', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Habitat</span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(74,222,128,0.1)', margin: '0 13px' }} />

              {/* Rows */}
              <div style={{ padding: '6px 13px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {HABITAT_LEGEND.map(h => (
                  <div
                    key={h.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '14px 1fr',
                      gap: '0 8px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Colour swatch */}
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      backgroundColor: h.color,
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }} />
                    {/* Label */}
                    <span style={{
                      fontSize: 10.5,
                      color: '#d1fae5',
                      lineHeight: 1.3,
                      fontWeight: 400,
                    }}>
                      {h.icon} {h.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Source note */}
              <div style={{
                padding: '5px 13px 9px',
                borderTop: '1px solid rgba(74,222,128,0.1)',
                fontSize: 9,
                color: '#4a7c52',
                lineHeight: 1.4,
              }}>
                Natural England · Priority Habitats Inventory
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
