/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Configuración de Vite. Activamos React y la PWA (service worker + manifiesto).
// El manifiesto aquí es MÍNIMO (M0); el afinado real —iconos definitivos,
// nombre comercial, caché offline— es trabajo de M5.
export default defineConfig({
  // '@' apunta a src/ (lo usan shadcn/ui y nuestros imports).
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // Al publicar una versión nueva, el service worker se actualiza solo.
      registerType: 'autoUpdate',
      // Permite probar la PWA también con `npm run dev` (no solo en el build).
      devOptions: { enabled: true },
      // El apple-touch-icon (iOS) y demás estáticos de public/ se incluyen solos.
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Informes de seguridad',
        short_name: 'Informes',
        description: 'Informes de coordinación de seguridad en obra.',
        lang: 'es',
        // Se abre como app, sin la barra del navegador.
        display: 'standalone',
        start_url: '/',
        // Azul institucional de marca (design-system).
        theme_color: '#1D4ED8',
        background_color: '#FFFFFF',
        // Iconos PROVISIONALES (M5): azul con "IS", generados por
        // scripts/generar-iconos.mjs. Se cambian cuando haya marca definitiva.
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          // 'any' para el icono normal y 'maskable' para que Android le aplique
          // su forma sin recortar el contenido.
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  // Configuración de tests (Vitest).
  test: {
    // Navegador "de mentira" para poder montar componentes React.
    environment: 'jsdom',
    // Permite usar describe/it/expect sin importarlos en cada archivo.
    globals: true,
    // Carga los matchers de jest-dom (toBeInTheDocument, etc.).
    setupFiles: './src/test/setup.ts',
  },
})
