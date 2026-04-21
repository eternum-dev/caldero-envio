/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#121110',
          container_low: '#1d1b1a',
          container: '#211f1e',
          container_high: '#363433',
          container_highest: '#403d3c',
          brightest: '#504a47',
        },
        primary: {
          DEFAULT: '#6F4E37',
          container: '#503828',
          fixed_dim: '#8B7355',
        },
        secondary: '#FFBF00',
        tertiary: '#F5F5DC',
        on_surface: '#e6e1df',
        on_surface_variant: '#d4c3ba',
        surface_tint: 'rgba(111, 78, 55, 0.05)',
        error_container: '#8B0000',
        outline_variant: 'rgba(80, 69, 62, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: {
          sm: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
          md: ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
          lg: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        },
        label: {
          md: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        },
      },
      borderRadius: {
        md: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        floating: '0 24px 48px rgba(0, 0, 0, 0.5)',
        glass: '20px 20px 48px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #6F4E37 0%, #503828 100%)',
      },
    },
  },
  plugins: [],
}