import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',        // автоматически обновляет приложение
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Afilliate',                    // полное название
        short_name: 'Финансы',                      // короткое название (под иконкой)
        description: 'Описание твоего приложения',
        theme_color: '#000000',                     // цвет темы
        background_color: '#000000',
        display: 'standalone',                      // ← Вот это главное! Убирает браузерный интерфейс
        scope: '/',
        start_url: '/',
        orientation: 'portrait',                    // или 'any'
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})