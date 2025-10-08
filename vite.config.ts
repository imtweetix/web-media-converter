import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com https://kit-pro.fontawesome.com https://ka-p.fontawesome.com; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self' https://kit-pro.fontawesome.com https://ka-p.fontawesome.com; object-src 'none'; base-uri 'self';"
    }
  },
  preview: {
    port: 3000,
    open: true
  }
})