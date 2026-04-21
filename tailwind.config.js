export default {
  legacyExtractor: false,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        caldera: {
          orange: '#f97316',
          yellow: '#fbbf24',
        }
      }
    },
  },
  plugins: [],
}