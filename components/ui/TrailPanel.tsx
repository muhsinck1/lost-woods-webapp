'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, TrendingUp, Ruler, Clock, Bird, Leaf,
  ChevronUp, ChevronDown, Radio, Square,
  Gauge, Timer, Footprints, MapPin, Navigation,
  Loader2, Flag, LocateFixed,
} from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

// ── Trail GeoJSON paths ──────────────────────────────────────────────
const TRAIL_DATA_PATHS: Record<string, string> = {
  burley: '/data/burlyevillagetrails.geojson',
  emery:  '/data/emerydowncircle.geojson',
  reihan: '/data/reihanfiled.geojson',
}

// ── Types ────────────────────────────────────────────────────────────
interface ElevPoint   { dist: number; elev: number }
interface SpeciesItem {
  name: string
  sciName: string
  imageUrl?: string
  url?: string
  date?: string
  place?: string
  taxonGroup?: string
  qualityGrade?: string
}

// ── Geometry helpers ─────────────────────────────────────────────────
function haversineKm(a: number[], b: number[]): number {
  const R = 6371
  const dLat = ((b[1] - a[1]) * Math.PI) / 180
  const dLon = ((b[0] - a[0]) * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[1] * Math.PI) / 180) *
      Math.cos((b[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function fmtTime(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── SVG elevation path ────────────────────────────────────────────────
function buildElevPath(pts: ElevPoint[], w: number, h: number): string {
  if (pts.length < 2) return ''
  const minE = Math.min(...pts.map(p => p.elev))
  const maxE = Math.max(...pts.map(p => p.elev))
  const maxD = pts[pts.length - 1].dist
  const rangeE = maxE - minE || 1
  const padT = 8; const padB = 6
  const mapped = pts.map(p => {
    const x = (p.dist / maxD) * w
    const y = padT + (1 - (p.elev - minE) / rangeE) * (h - padT - padB)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M ${mapped.join(' L ')}`
}

function progressFrac(pts: ElevPoint[], distKm: number): number {
  if (!pts.length) return 0
  return Math.min(distKm / pts[pts.length - 1].dist, 1)
}

// ── Open-Meteo elevation fetch ───────────────────────────────────────
async function fetchElevProfile(coords: number[][]): Promise<ElevPoint[]> {
  const MAX  = 20
  const step = Math.max(1, Math.floor(coords.length / MAX))
  const pts  = coords.filter((_, i) => i % step === 0).slice(0, MAX)
  const res  = await fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=${pts.map(c => c[1].toFixed(6)).join(',')}&longitude=${pts.map(c => c[0].toFixed(6)).join(',')}`
  )
  if (!res.ok) throw new Error('elevation API error')
  const json  = await res.json()
  const elevs: number[] = json.elevation
  let cum = 0
  return pts.map((c, i) => {
    if (i > 0) cum += haversineKm(pts[i - 1], c)
    return { dist: cum, elev: elevs[i] }
  })
}

// ── Species fetch ─────────────────────────────────────────────────────
async function fetchSpeciesNearTrail(
  kind: string,
  bbox: { minLon: number; maxLon: number; minLat: number; maxLat: number }
): Promise<SpeciesItem[]> {
  try {
    const res  = await fetch(`/data/${kind}.geojson`)
    if (!res.ok) return []
    const json = await res.json()
    const seen = new Set<string>()
    const out: SpeciesItem[] = []
    for (const feat of json.features ?? []) {
      const c = feat.geometry?.coordinates
      if (!c || feat.geometry.type !== 'Point') continue
      const [lon, lat] = c
      if (lon < bbox.minLon || lon > bbox.maxLon || lat < bbox.minLat || lat > bbox.maxLat) continue
      const p = feat.properties ?? {}
      const name = p.common_name || p.name || ''
      if (name && !seen.has(name)) {
        seen.add(name)
        out.push({
          name,
          sciName:      p.scientific_name || '',
          imageUrl:     p.image_url       || undefined,
          url:          p.url             || undefined,
          date:         p.observed_on ? new Date(typeof p.observed_on === 'number' ? p.observed_on : p.observed_on).toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' }) : undefined,
          place:        p.place_guess    || undefined,
          taxonGroup:   kind,
          qualityGrade: p.quality_grade  || undefined,
        })
        if (out.length >= 12) break
      }
    }
    return out
  } catch { return [] }
}

// ── Main component ────────────────────────────────────────────────────
export default function TrailPanel() {
  const activePanel        = useAppStore(s => s.activePanel)
  const setPanel           = useAppStore(s => s.setActivePanel)
  const selectedTrail      = useAppStore(s => s.selectedTrail)
  const liveSession        = useAppStore(s => s.liveSession)
  const startLive          = useAppStore(s => s.startLive)
  const startLiveAtStart   = useAppStore(s => s.startLiveAtStart)
  const stopLive           = useAppStore(s => s.stopLive)
  const setLiveStatus      = useAppStore(s => s.setLiveStatus)
  const setSelectedFeature = useAppStore(s => s.setSelectedFeature)

  // Elevation + species
  const [elevPts,        setElevPts]        = useState<ElevPoint[]>([])
  const [birds,          setBirds]          = useState<SpeciesItem[]>([])
  const [plants,         setPlants]         = useState<SpeciesItem[]>([])
  const [fungi,          setFungi]          = useState<SpeciesItem[]>([])
  const [loadingElev,    setLoadingElev]    = useState(false)
  const [loadingSpec,    setLoadingSpec]    = useState(false)
  const [elevError,      setElevError]      = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)

  // Trail coords for GPS
  const [trailCoords, setTrailCoords] = useState<number[][] | null>(null)

  // Bottom-sheet state — mobile only
  // collapsed = true  → 44vh (map visible above)
  // collapsed = false → 88vh (full detail view)
  const [collapsed,  setCollapsed]  = useState(true)
  // Detect mobile after mount (SSR-safe)
  const [isMobile,   setIsMobile]   = useState(false)
  const touchStartY  = useRef<number>(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const abortRef = useRef<AbortController | null>(null)

  // ── Load elevation + species when trail changes ────────────────────
  useEffect(() => {
    const key = selectedTrail?.trailKey as string | undefined
    if (!key || !TRAIL_DATA_PATHS[key]) return

    setElevPts([]); setBirds([]); setPlants([]); setFungi([]); setTrailCoords(null)
    setElevError(false); setLoadingElev(true); setLoadingSpec(true)
    setShowStartModal(false)
    setCollapsed(true)  // always start collapsed on mobile

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    fetch(TRAIL_DATA_PATHS[key], { signal: abortRef.current.signal })
      .then(r => r.json())
      .then(gj => {
        const coords: number[][] = gj.features?.[0]?.geometry?.coordinates ?? []
        if (!coords.length) { setLoadingElev(false); setLoadingSpec(false); return }

        setTrailCoords(coords)

        const lons = coords.map((c: number[]) => c[0])
        const lats = coords.map((c: number[]) => c[1])
        const bbox = {
          minLon: Math.min(...lons) - 0.014,
          maxLon: Math.max(...lons) + 0.014,
          minLat: Math.min(...lats) - 0.009,
          maxLat: Math.max(...lats) + 0.009,
        }

        fetchElevProfile(coords)
          .then(pts  => { setElevPts(pts); setElevError(false) })
          .catch(()  => setElevError(true))
          .finally(() => setLoadingElev(false))

        Promise.all([
          fetchSpeciesNearTrail('birds',  bbox),
          fetchSpeciesNearTrail('plants', bbox),
          fetchSpeciesNearTrail('fungi',  bbox),
        ]).then(([b, p, f]) => { setBirds(b); setPlants(p); setFungi(f) })
          .finally(() => setLoadingSpec(false))
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setLoadingElev(false); setLoadingSpec(false)
        }
      })

    return () => abortRef.current?.abort()
  }, [selectedTrail?.trailKey])

  // ── PROXIMITY CHECK — fires when status = 'locating' ────────────
  useEffect(() => {
    if (!liveSession || liveSession.status !== 'locating') return
    if (!trailCoords || !trailCoords.length) return

    const trailStart = trailCoords[0] as [number, number]

    if (!navigator?.geolocation) {
      setLiveStatus('tracking', { trailStart }); return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        const dist = haversineKm(userPos, trailStart)
        if (dist <= 0.2) {
          setLiveStatus('tracking', { trailStart })
        } else {
          setLiveStatus('far', { distToStartKm: dist, trailStart })
        }
      },
      () => setLiveStatus('tracking', { trailStart }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    )
  }, [liveSession?.status, trailCoords])

  // ── AUTO-START POLLING when 'far' ────────────────────────────────
  useEffect(() => {
    if (!liveSession || liveSession.status !== 'far') return
    if (!liveSession.trailStart || !navigator?.geolocation) return

    const trailStart = liveSession.trailStart
    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = haversineKm([pos.coords.longitude, pos.coords.latitude], trailStart)
          if (dist <= 0.2) setLiveStatus('tracking', { trailStart })
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
      )
    }, 5000)

    return () => clearInterval(id)
  }, [liveSession?.status])

  // ── Render guard ─────────────────────────────────────────────────
  if (activePanel !== 'trail' || !selectedTrail) return null

  const trail      = selectedTrail
  const trailKey   = trail.trailKey as string | undefined
  const mySession  = liveSession?.trailKey === trailKey ? liveSession : null
  const isTracking = mySession?.status === 'tracking'
  const isLocating = mySession?.status === 'locating'
  const isFar      = mySession?.status === 'far'
  const isLive     = !!mySession

  const hasElev  = elevPts.length >= 2
  const minElev  = hasElev ? Math.min(...elevPts.map(p => p.elev)) : 0
  const maxElev  = hasElev ? Math.max(...elevPts.map(p => p.elev)) : 0
  const totalKm  = hasElev ? elevPts[elevPts.length - 1].dist : 0
  const elevGain = hasElev
    ? elevPts.reduce((acc, p, i) => i > 0 ? acc + Math.max(0, p.elev - elevPts[i - 1].elev) : acc, 0)
    : 0

  const SVG_W    = 288
  const SVG_H    = 68
  const elevPath = buildElevPath(elevPts, SVG_W, SVG_H)
  const scrubFrac = isTracking && mySession ? progressFrac(elevPts, mySession.distKm) : null
  const scrubX    = scrubFrac != null ? scrubFrac * SVG_W : null

  const headerBg = isTracking ? 'bg-sky-950/40'
    : isFar      ? 'bg-amber-950/30'
    : isLocating  ? 'bg-forest-800/60'
    : ''

  // ── Close / minimise handler ─────────────────────────────────────
  function handleClose() {
    if (isLive) stopLive()
    setPanel(null)
  }

  // ── Swipe handlers on the drag handle ────────────────────────────
  function onHandleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function onHandleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartY.current - e.changedTouches[0].clientY
    if (diff > 40) {
      // swiped up → expand
      setCollapsed(false)
    } else if (diff < -40) {
      // swiped down → collapse, or close if already collapsed
      if (!collapsed) {
        setCollapsed(true)
      } else {
        handleClose()
      }
    }
  }

  // Mobile panel height
  const mobileHeight = collapsed ? '44vh' : '88vh'

  return (
    <AnimatePresence>
      <>
        {/*
          NO full-screen backdrop on mobile.
          Map is visible in the top portion of the screen.
          Backdrop only shown on desktop as a subtle overlay when needed.
        */}

        {/* Panel — bottom sheet on mobile, right sidebar on desktop */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 sm:bottom-auto sm:top-20 sm:right-4 sm:left-auto sm:w-80"
        >
          {/*
            Glass panel container.
            Mobile: fixed height (44vh collapsed / 88vh expanded), overflow-hidden to clip content.
            Desktop: auto height, max-height constrained, scrollable.
          */}
          <motion.div
            className="glass panel-shadow rounded-t-3xl sm:rounded-2xl flex flex-col sm:overflow-y-auto sm:scrollbar-hide"
            animate={isMobile ? { height: mobileHeight } : { height: 'auto' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            style={{
              overflow: isMobile ? (collapsed ? 'hidden' : 'auto') : undefined,
              maxHeight: !isMobile ? 'calc(100vh - 96px)' : undefined,
            }}
          >

            {/*
              ── DRAG HANDLE ─────────────────────────────────────────
              Tap to toggle collapsed/expanded.
              Swipe up to expand. Swipe down to collapse or close.
              Only shown on mobile.
            */}
            <div
              className="sm:hidden flex-shrink-0"
              onTouchStart={onHandleTouchStart}
              onTouchEnd={onHandleTouchEnd}
              onClick={() => setCollapsed(c => !c)}
            >
              <div className="flex flex-col items-center pt-3 pb-2 cursor-pointer">
                <div className="w-12 h-1.5 rounded-full bg-white/25 mb-1" />
                <span className="text-[9px] font-semibold tracking-widest uppercase text-white/20">
                  {collapsed ? 'Swipe up for details' : 'Swipe down to minimise'}
                </span>
              </div>
            </div>

            {/* ── HEADER ──────────────────────────────────────────── */}
            <div className={`px-5 pt-3 pb-4 border-b border-white/5 flex-shrink-0 transition-colors duration-500 ${headerBg}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Status badge row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    {isTracking ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse"
                        style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                        <Radio size={9} />Live
                      </span>
                    ) : isFar ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                        <Navigation size={9} />Away
                      </span>
                    ) : isLocating ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }}>
                        <Loader2 size={9} className="animate-spin" />Locating
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(255,140,66,0.15)', color: '#ff8c42' }}>
                        <TrendingUp size={9} />Trail
                      </span>
                    )}
                    <span className="text-[10px] text-nature-muted uppercase tracking-widest font-bold">
                      {trail.difficulty}
                    </span>
                  </div>

                  {/* Trail name */}
                  <h3 className="text-[18px] font-bold text-white leading-snug">{trail.name}</h3>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="flex items-center gap-1 text-[12px] text-nature-muted">
                      <Ruler size={11} />{trail.distance}
                    </span>
                    {trail.duration && (
                      <span className="flex items-center gap-1 text-[12px] text-nature-muted">
                        <Clock size={11} />{trail.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* X close button — ALWAYS visible */}
                <button
                  onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/15 transition-colors text-nature-muted flex-shrink-0"
                  aria-label={isLive ? 'Stop and close' : 'Close'}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── GPS state banners (always visible, flex-shrink-0) ── */}

            {/* LOCATING */}
            <AnimatePresence>
              {isLocating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex-shrink-0"
                >
                  <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3"
                    style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <Loader2 size={18} className="animate-spin text-slate-400 flex-shrink-0" />
                    <div>
                      <div className="text-[12px] font-semibold text-white">Checking your location…</div>
                      <div className="text-[10px] text-nature-muted mt-0.5">Comparing GPS to trail start point</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAR FROM TRAIL */}
            <AnimatePresence>
              {isFar && mySession && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex-shrink-0"
                >
                  <div className="px-5 py-4 border-b border-white/5"
                    style={{ background: 'rgba(45,26,6,0.7)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                        <MapPin size={14} style={{ color: '#fbbf24' }} />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-white">
                          {mySession.distToStartKm < 1
                            ? `${Math.round(mySession.distToStartKm * 1000)} m`
                            : `${mySession.distToStartKm.toFixed(1)} km`} from trail start
                        </div>
                        <div className="text-[10px] text-nature-muted">Auto-tracking starts within 200 m</div>
                      </div>
                    </div>
                    <div className="rounded-lg px-3 py-2 text-[11px] leading-relaxed"
                      style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
                      <span style={{ color: '#fbbf24' }}>●</span>
                      <span className="text-nature-muted ml-1.5">
                        Green marker on map shows trail start. GPS checks every 5 s.
                      </span>
                    </div>
                    <button onClick={() => stopLive()}
                      className="mt-3 w-full py-2 rounded-xl text-[11px] font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TRACKING HUD */}
            <AnimatePresence>
              {isTracking && mySession && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex-shrink-0"
                >
                  <div className="px-5 py-4 border-b border-white/5"
                    style={{ background: 'rgba(8,47,73,0.6)' }}>
                    <div className="grid grid-cols-4 gap-2">
                      <StatCell icon={<Timer size={9} />}       label="TIME" color="#38bdf8" value={fmtTime(mySession.elapsedSecs)} mono />
                      <StatCell icon={<Footprints size={9} />}  label="DIST" color="#38bdf8" value={mySession.distKm.toFixed(2)} unit="km" mono />
                      <StatCell icon={<Clock size={9} />}       label="PACE" color="#38bdf8" value={mySession.paceMinKm} unit="/km" mono />
                      <StatCell icon={<Gauge size={9} />}       label="SPD"  color="#38bdf8" value={mySession.speedKmh.toFixed(1)} unit="km/h" mono />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px]"
                      style={{ color: 'rgba(56,189,248,0.55)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse inline-block" />
                      {mySession.position
                        ? `GPS locked · ${mySession.position[1].toFixed(5)}, ${mySession.position[0].toFixed(5)}`
                        : 'Waiting for GPS signal…'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── ACTION BUTTONS (always visible — core of collapsed view) ── */}
            <div className="px-5 py-4 flex-shrink-0 border-b border-white/5">
              {isTracking ? (
                <button onClick={() => { stopLive(); setShowStartModal(false) }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
                  <Square size={16} fill="currentColor" />
                  Stop Session
                </button>

              ) : isLocating || isFar ? (
                <button disabled
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] opacity-40 cursor-not-allowed"
                  style={{ background: 'rgba(56,189,248,0.08)', border: '1.5px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                  <Loader2 size={16} className="animate-spin" />
                  {isLocating ? 'Locating…' : 'Waiting for arrival…'}
                </button>

              ) : showStartModal ? (
                <div className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: 'rgba(56,189,248,0.25)', background: 'rgba(8,47,73,0.55)' }}>
                  <div className="px-4 pt-4 pb-3 border-b border-white/5">
                    <p className="text-[13px] font-semibold text-white text-center">Where do you want to start?</p>
                  </div>

                  {/* Trail start */}
                  <button
                    onClick={() => {
                      setShowStartModal(false)
                      const start = trailCoords?.[0] as [number, number] | undefined
                      if (start && trailKey) startLiveAtStart(trailKey, start)
                    }}
                    disabled={!trailCoords || !trailKey}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-white/5 active:bg-white/8 disabled:opacity-40 border-b border-white/5"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <Flag size={18} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white">Start from trail start</div>
                      <div className="text-[11px] text-nature-muted mt-0.5">No GPS needed · begins immediately</div>
                    </div>
                  </button>

                  {/* GPS location */}
                  <button
                    onClick={() => { setShowStartModal(false); if (trailKey) startLive(trailKey) }}
                    disabled={!trailKey}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-white/5 active:bg-white/8 disabled:opacity-40"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)' }}>
                      <LocateFixed size={18} style={{ color: '#38bdf8' }} />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white">Use my GPS location</div>
                      <div className="text-[11px] text-nature-muted mt-0.5">Track from where you are now</div>
                    </div>
                  </button>

                  <div className="px-4 py-3 border-t border-white/5">
                    <button onClick={() => setShowStartModal(false)}
                      className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-nature-muted transition-all hover:text-white hover:bg-white/5 active:bg-white/8">
                      Cancel
                    </button>
                  </div>
                </div>

              ) : (
                <button
                  onClick={() => setShowStartModal(true)}
                  disabled={!trailKey}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.06))',
                    border: '1.5px solid rgba(56,189,248,0.4)',
                    color: '#38bdf8',
                  }}>
                  <Radio size={16} />
                  Go Live
                </button>
              )}
            </div>

            {/* ── EXPANDED CONTENT ─────────────────────────────────────────
                On mobile: hidden when collapsed (clipped by overflow:hidden + 44vh)
                On desktop: always visible
            ─────────────────────────────────────────────────────────────── */}

            {/* Elevation Profile */}
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-nature-muted">
                  Elevation Profile
                </span>
                {hasElev && !loadingElev && (
                  <span className="text-[10px] text-nature-muted">{totalKm.toFixed(1)} km</span>
                )}
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black/20 border border-white/5"
                style={{ height: SVG_H + 36 }}>
                {loadingElev && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#7ec850' }} />
                  </div>
                )}
                {elevError && !loadingElev && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] text-nature-muted italic">Elevation data unavailable</span>
                  </div>
                )}
                {hasElev && !loadingElev && (
                  <>
                    <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                      preserveAspectRatio="none" className="absolute top-0 left-0 w-full" aria-hidden="true">
                      <defs>
                        <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#7ec850" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#7ec850" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="elev-done" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0.40" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
                        </linearGradient>
                        {scrubX != null && (
                          <clipPath id="done-clip">
                            <rect x="0" y="0" width={scrubX} height={SVG_H} />
                          </clipPath>
                        )}
                      </defs>
                      <path d={`${elevPath} L ${SVG_W},${SVG_H} L 0,${SVG_H} Z`} fill="url(#elev-fill)" />
                      {scrubX != null && (
                        <path d={`${elevPath} L ${SVG_W},${SVG_H} L 0,${SVG_H} Z`}
                          fill="url(#elev-done)" clipPath="url(#done-clip)" />
                      )}
                      <path d={elevPath} fill="none" stroke="#7ec850"
                        strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                      {scrubX != null && (
                        <>
                          <line x1={scrubX} y1={0} x2={scrubX} y2={SVG_H}
                            stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2,2" />
                          <circle cx={scrubX} cy={SVG_H / 2} r="4"
                            fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
                        </>
                      )}
                    </svg>
                    <div className="absolute bottom-0 inset-x-0 flex items-end justify-between px-3 pb-2">
                      <div className="flex gap-4">
                        <ElevStat label="LOW"  icon={<ChevronDown size={9} className="text-sky-400" />}   value={`${Math.round(minElev)}m`} />
                        <ElevStat label="HIGH" icon={<ChevronUp   size={9} className="text-orange-400" />} value={`${Math.round(maxElev)}m`} />
                        <ElevStat label="GAIN" value={`+${Math.round(elevGain)}m`} green />
                        {isTracking && mySession && totalKm > 0 && (
                          <ElevStat label="DONE" value={`${Math.round((mySession.distKm / totalKm) * 100)}%`}
                            style={{ color: '#38bdf8' }} />
                        )}
                      </div>
                      <span className="text-[9px] text-nature-muted opacity-50">Open-Meteo</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Species sections */}
            <div className="px-5 py-4 space-y-5">
              <SpeciesSection emoji="🐦" label="Birds"  accentColor="#4cde8f"
                icon={<Bird size={12} />} items={birds}  loading={loadingSpec}
                emptyMsg="No bird records matched near this trail"
                onSelect={setSelectedFeature} />
              <div className="h-px bg-white/5" />
              <SpeciesSection emoji="🌿" label="Plants" accentColor="#22d3ee"
                icon={<Leaf size={12} />} items={plants} loading={loadingSpec}
                emptyMsg="No plant records matched near this trail"
                onSelect={setSelectedFeature} />
              <div className="h-px bg-white/5" />
              <SpeciesSection emoji="🍄" label="Fungi"  accentColor="#c084fc"
                icon={<span style={{ fontSize: 12 }}>🍄</span>} items={fungi} loading={loadingSpec}
                emptyMsg="No fungi records matched near this trail"
                onSelect={setSelectedFeature} />

              {trail.note && (
                <div className="p-3 rounded-xl border text-[11px] italic leading-relaxed text-nature-text/80"
                  style={{ background: 'rgba(255,140,66,0.05)', borderColor: 'rgba(255,140,66,0.2)' }}>
                  {trail.note}
                </div>
              )}
            </div>

            {/* iOS safe-area spacer */}
            <div className="h-2 sm:hidden flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </motion.div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────
function StatCell({ icon, label, color, value, unit, mono }: {
  icon: React.ReactNode; label: string; color: string
  value: string; unit?: string; mono?: boolean
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-0.5 text-[9px] mb-1"
        style={{ color: `${color}99` }}>
        {icon}{label}
      </div>
      <div className={`text-[13px] font-bold text-white leading-none${mono ? ' font-mono tabular-nums' : ''}`}>
        {value}
        {unit && <span className="text-[9px] text-nature-muted ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}

function ElevStat({ label, icon, value, green, style: extraStyle }: {
  label: string; icon?: React.ReactNode; value: string; green?: boolean; style?: React.CSSProperties
}) {
  return (
    <div>
      <div className="flex items-center gap-0.5 text-[9px] text-nature-muted mb-0.5">{icon}{label}</div>
      <div className="text-[12px] font-bold leading-none"
        style={extraStyle ?? (green ? { color: '#7ec850' } : { color: '#fff' })}>
        {value}
      </div>
    </div>
  )
}

function SpeciesSection({ emoji, label, accentColor, icon, items, loading, emptyMsg, onSelect }: {
  emoji: string; label: string; accentColor: string; icon: React.ReactNode
  items: SpeciesItem[]; loading: boolean; emptyMsg: string
  onSelect?: (f: any) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-none">{emoji}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-nature-muted">{label}</span>
        </div>
        {!loading && items.length > 0 && (
          <span className="text-[10px] text-nature-muted">{items.length}+ species</span>
        )}
      </div>
      {loading ? (
        <div className="flex flex-wrap gap-1.5">
          {[80, 96, 72, 88].map(w => (
            <div key={w} className="h-6 rounded-lg animate-pulse bg-white/5" style={{ width: w }} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.slice(0, 9).map(sp => (
            <button
              key={sp.name}
              title={sp.sciName || undefined}
              onClick={() => onSelect?.({
                id:                 sp.url ?? sp.name,
                commonName:         sp.name,
                scientificName:     sp.sciName,
                taxonGroup:         sp.taxonGroup ?? label.toLowerCase(),
                recorder:           'iNaturalist',
                date:               sp.date ?? 'Unknown Date',
                habitat:            sp.place ?? 'West Sussex',
                conservationStatus: sp.qualityGrade ?? 'Research Grade',
                gridRef:            '',
                inatUrl:            sp.url,
                imageUrl:           sp.imageUrl,
              })}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-nature-text leading-none transition-all active:scale-95 hover:brightness-110"
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}28`,
                cursor: onSelect ? 'pointer' : 'default',
              }}
            >
              {sp.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[11px] italic text-nature-muted">{emptyMsg}</p>
      )}
    </div>
  )
}
