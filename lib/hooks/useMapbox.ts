'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

interface UseMapboxOptions {
  container: React.RefObject<HTMLDivElement | null>
  center: [number, number]
  zoom: number
  pitch?: number
  bearing?: number
}

export function useMapbox({ container, center, zoom, pitch = 0, bearing = 0 }: UseMapboxOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (mapRef.current || !container.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    const map = new mapboxgl.Map({
      container: container.current,
      style: { version: 8, sources: {}, layers: [] },
      center,
      zoom,
      pitch,
      bearing,
      antialias: true,
    })

    mapRef.current = map

    map.on('load', () => setIsReady(true))

    return () => {
      map.remove()
      mapRef.current = null
      setIsReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { map: mapRef.current, isReady, mapRef }
}
