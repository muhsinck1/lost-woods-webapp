'use client'

import { useState, useEffect } from 'react'

type GeolocationState = {
  coords: [number, number] | null
  error: string | null
  loading: boolean
}

export function useLocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
  })

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported', loading: false }))
      return
    }
    setState(s => ({ ...s, loading: true }))
    navigator.geolocation.getCurrentPosition(
      pos => {
        setState({
          coords: [pos.coords.longitude, pos.coords.latitude],
          error: null,
          loading: false,
        })
      },
      err => {
        setState({ coords: null, error: err.message, loading: false })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return { ...state, requestLocation } as GeolocationState & { requestLocation: () => void }
}
