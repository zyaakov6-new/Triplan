import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' instead of 'autoUpdate' so we can show a banner asking the
      // user to reload. With autoUpdate the new bundle activates only on the
      // next navigation, which means a critical fix might sit unseen for days
      // while a user keeps Triplan open in a tab.
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Triplan',
        short_name: 'Triplan',
        description: 'Your trips, beautifully organized',
        theme_color: '#1A1612',
        background_color: '#F5F0E8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png',           sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',          sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png',sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'mapbox-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'supabase': ['@supabase/supabase-js'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
