import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
