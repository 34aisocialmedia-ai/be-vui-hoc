import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Hashed build output lives in /static so it can be cached forever,
  // separately from the hand-named pictures in public/assets.
  build: { assetsDir: 'static' },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon-48.png', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'assets/images/mascot_rabbit.webp', 'assets/brand/logo-duong-thuy-160.webp'],
      manifest: {
        name: 'Bé Vui Học - Trò chơi mầm non tương tác',
        short_name: 'Bé Vui Học',
        description: 'Trò chơi trực tuyến tương tác cho trẻ mầm non, an toàn và phát triển kỹ năng',
        theme_color: '#287d70',
        background_color: '#faf8f2',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache only the app shell. Pictures are cached the first time a child sees them,
        // instead of downloading every picture on the first visit.
        globPatterns: ['**/*.{js,css,html,ico,svg,json,webmanifest,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/') && /\.(webp|png|jpe?g|svg)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-pictures-v1',
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname === '/audio/manifest.json',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-audio-manifest-v3',
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-co-thuy-audio-v1',
              expiration: {
                maxEntries: 1500,
                maxAgeSeconds: 60 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
