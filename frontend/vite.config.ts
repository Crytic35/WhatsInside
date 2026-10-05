import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In local development, proxy /api/* to the FastAPI backend.
    // This means the frontend calls /api/... (no absolute host),
    // which works in production too (Vercel routes /api/* to the serverless fn).
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

