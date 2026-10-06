import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            if (id.includes('/src/pages/admin/')) {
              return 'admin-pages'
            }

            if (id.includes('/src/pages/public/')) {
              return 'public-pages'
            }

            return undefined
          }

          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/react/')
          ) {
            return 'vendor-react'
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }

          if (id.includes('axios')) {
            return 'vendor-axios'
          }

          return 'vendor'
        },
      },
    },
  },
})
