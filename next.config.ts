import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow Mapbox and other external image/media sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn-icons-png.flaticon.com' },
      { protocol: 'https', hostname: 'api.mapbox.com' },
    ],
  },
  // Removed webpack alias to support Turbopack default
}

export default nextConfig
