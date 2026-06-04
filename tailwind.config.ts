import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#050d07',
          900: '#0a1a0e',
          800: '#0d2212',
          700: '#122b16',
          600: '#1a3d1f',
        },
        green: {
          vivid: '#5cdb80',
          soft:  '#7ec850',
          muted: '#4a7c52',
        },
        nature: {
          text:  '#e8f5e0',
          muted: '#7aa87e',
          fog:   'rgba(10, 26, 14, 0.92)',
          border:'rgba(92, 219, 128, 0.18)',
          glow:  'rgba(92, 219, 128, 0.25)',
        },
        bird:  '#4cde8f',
        fungi: '#c084fc',
        plant: '#22d3ee',
        trail: '#ff8c42',
      },
      fontFamily: {
        sans:     ['Outfit', 'sans-serif'],
        mono:     ['Space Mono', 'monospace'],
        display:  ['Playfair Display', 'serif'],
      },
      boxShadow: {
        panel:    '0 8px 40px rgba(0,0,0,0.6)',
        glow:     '0 0 18px rgba(92,219,128,0.3)',
        'glow-lg':'0 0 40px rgba(92,219,128,0.25)',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease forwards',
        'slide-up':    'slideUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-left':  'slideInLeft 0.4s ease forwards',
        'pulse-glow':  'pulseGlow 3s ease-in-out infinite',
        'spin-slow':   'spin-slow 12s linear infinite',
        'count-up':    'countUp 0.4s ease forwards',
      },
      backdropBlur: { sm: '8px', DEFAULT: '14px', lg: '20px' },
    },
  },
  plugins: [],
}

export default config
