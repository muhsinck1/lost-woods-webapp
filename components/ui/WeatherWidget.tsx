'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Thermometer, Wind, Droplets, Eye, Sunrise, Sunset } from 'lucide-react'

// Lost Woods exact centroid — Hurstpierpoint, West Sussex
const LAT = 50.924
const LON = -0.220

const WMO: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear sky',      icon: '☀️' },
  1:  { label: 'Mainly clear',   icon: '🌤️' },
  2:  { label: 'Partly cloudy',  icon: '⛅' },
  3:  { label: 'Overcast',       icon: '☁️' },
  45: { label: 'Foggy',          icon: '🌫️' },
  48: { label: 'Icy fog',        icon: '🌫️' },
  51: { label: 'Light drizzle',  icon: '🌦️' },
  53: { label: 'Drizzle',        icon: '🌦️' },
  61: { label: 'Light rain',     icon: '🌧️' },
  63: { label: 'Rain',           icon: '🌧️' },
  65: { label: 'Heavy rain',     icon: '🌧️' },
  71: { label: 'Light snow',     icon: '🌨️' },
  73: { label: 'Snow',           icon: '❄️' },
  80: { label: 'Showers',        icon: '🌦️' },
  95: { label: 'Thunderstorm',   icon: '⛈️' },
}

function wmo(code: number) {
  return WMO[code] ?? { label: 'Mixed', icon: '🌡️' }
}

interface WeatherData {
  temp: number
  feelsLike: number
  rain: number
  wind: number
  humidity: number
  code: number
  sunrise: string
  sunset: string
  forecast: { day: string; code: number; max: number; min: number; rain: number }[]
}

export default function WeatherWidget() {
  const [data, setData]       = useState<WeatherData | null>(null)
  const [error, setError]     = useState(false)
  const [expanded, setExp]    = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({
      latitude:    String(LAT),
      longitude:   String(LON),
      timezone:    'Europe/London',
      forecast_days: '3',
      current:     ['temperature_2m','apparent_temperature','rain','wind_speed_10m',
                    'weather_code','relative_humidity_2m'].join(','),
      daily:       ['weather_code','temperature_2m_max','temperature_2m_min',
                    'precipitation_sum','sunrise','sunset'].join(','),
    })

    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(r => { if (!r.ok) throw new Error('weather'); return r.json() })
      .then(d => {
        const c = d.current
        const dl = d.daily

        const fmtTime = (iso: string) =>
          new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

        const forecast = (dl.time as string[]).slice(0,3).map((t: string, i: number) => ({
          day:  new Date(t).toLocaleDateString('en-GB', { weekday: 'short' }),
          code: dl.weather_code[i],
          max:  Math.round(dl.temperature_2m_max[i]),
          min:  Math.round(dl.temperature_2m_min[i]),
          rain: Number(dl.precipitation_sum[i]?.toFixed(1)),
        }))

        setData({
          temp:      Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          rain:      Number(c.rain?.toFixed(1) ?? 0),
          wind:      Math.round(c.wind_speed_10m),
          humidity:  c.relative_humidity_2m,
          code:      c.weather_code,
          sunrise:   fmtTime(dl.sunrise[0]),
          sunset:    fmtTime(dl.sunset[0]),
          forecast,
        })
      })
      .catch(() => setError(true))
  }, [])

  if (error) return null

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute', top: 68, right: 16, zIndex: 30,
          background: 'rgba(5,13,7,0.90)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: 12, padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          border: '2px solid rgba(74,222,128,0.3)',
          borderTopColor: '#4ade80',
          animation: 'spin 0.9s linear infinite',
        }} />
        <span style={{ fontSize: 11, color: '#7aa87e' }}>Loading weather…</span>
      </motion.div>
    )
  }

  const { label, icon } = wmo(data.code)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      style={{
        position: 'absolute',
        top: 68,
        right: 16,
        zIndex: 30,
        minWidth: 180,
        background: 'rgba(5, 13, 7, 0.94)',
        border: '1px solid rgba(74, 222, 128, 0.28)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 6px 28px rgba(0,0,0,0.55)',
        pointerEvents: 'auto',
      }}
    >
      {/* ── Summary row ── */}
      <button
        onClick={() => setExp(x => !x)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 8, padding: '9px 13px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(74,222,128,0.12)' : 'none',
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e8f5e0' }}>{data.temp}°C</span>
          <span style={{ fontSize: 10.5, color: '#7aa87e', marginLeft: 6 }}>{label}</span>
        </div>
        {expanded
          ? <ChevronUp   size={11} color="#4ade80" />
          : <ChevronDown size={11} color="#4ade80" />
        }
      </button>

      {/* ── Expanded detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Location */}
            <div style={{
              padding: '6px 13px 0',
              fontSize: 9.5, color: '#4a7c52',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              📍 Lost Woods · {LAT}°N {Math.abs(LON)}°W
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 5, padding: '8px 13px',
            }}>
              {[
                { Icon: Thermometer, label: `Feels ${data.feelsLike}°C` },
                { Icon: Droplets,    label: `${data.humidity}% humidity` },
                { Icon: Wind,        label: `${data.wind} km/h` },
                { Icon: Eye,         label: `${data.rain} mm rain` },
                { Icon: Sunrise,     label: data.sunrise + ' rise' },
                { Icon: Sunset,      label: data.sunset  + ' set' },
              ].map(({ Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon size={10} color="#4ade80" />
                  <span style={{ fontSize: 10.5, color: '#7aa87e' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* 3-day forecast */}
            <div style={{
              borderTop: '1px solid rgba(74,222,128,0.1)',
              padding: '7px 13px 11px',
              display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              <span style={{ fontSize: 8.5, color: '#4a7c52', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                3-Day Forecast
              </span>
              {data.forecast.map(f => (
                <div key={f.day} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ width: 28, fontSize: 10.5, color: '#7aa87e', flexShrink: 0 }}>{f.day}</span>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{wmo(f.code).icon}</span>
                  <span style={{ flex: 1, fontSize: 10.5, color: '#e8f5e0', fontWeight: 500 }}>
                    {f.max}° / {f.min}°
                  </span>
                  <span style={{ fontSize: 10, color: '#38bdf8' }}>{f.rain}mm</span>
                </div>
              ))}
            </div>

            {/* Source note */}
            <div style={{
              borderTop: '1px solid rgba(74,222,128,0.1)',
              padding: '5px 13px 8px',
              fontSize: 9, color: '#4a7c52',
            }}>
              Open-Meteo · open source weather API
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}
