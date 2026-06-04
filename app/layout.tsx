import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lost Woods Explorer — Nature, Trails & Biodiversity',
  description: 'Explore the Lost Woods area of West Sussex through an immersive interactive map. Discover eco trails, biodiversity hotspots, priority habitats, and wildlife species.',
  keywords: 'Lost Woods, West Sussex, biodiversity, eco trails, nature exploration, wildlife, Sussex, Hurstpierpoint, Henfield',
  openGraph: {
    title: 'Lost Woods Explorer',
    description: 'An immersive nature exploration platform for the Lost Woods area of West Sussex',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1a0e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full overflow-hidden bg-forest-950 text-nature-text antialiased">
        {children}
      </body>
    </html>
  )
}
