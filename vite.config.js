import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  test: {
    setupFiles: ['./tests/setup.js'],
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/config/firebase.js', 'src/main.jsx'],
    },
  },
})