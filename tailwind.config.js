/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background tokens
        bg: '#141210',
        surface: '#1e1a16',
        'surface-2': '#27211a',
        'surface-tint': 'rgba(245,175,70,0.08)',
        'gold-bg': 'rgba(245,175,70,0.08)',
        'btn-primary': '#c8893a',
        // Gold (display, text, borders with opacity modifiers)
        gold: {
          DEFAULT: '#F5AF46',
          dim: '#c8893a',
        },
        // Neutral tokens (flat keys for text-ink, border-ink, etc.)
        ink: '#f0e8dc',
        muted: '#9a8878',
        danger: '#c0392b',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'price': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'label': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.1em' }],
      },
      borderRadius: {
        'sm': '8px',
      },
      backgroundImage: {
        'page-warm': 'linear-gradient(180deg, #141210 0%, #1a1714 100%)',
        'shimmer':
          'linear-gradient(90deg, #27211a 0%, #3d3228 40%, #27211a 80%)',
      },
      animation: {
        'price-in': 'priceIn 0.4s ease-out',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },
      opacity: {
        '18': '0.18',
      },
      keyframes: {
        priceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};
