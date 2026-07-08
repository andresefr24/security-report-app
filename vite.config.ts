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
        // Icono PROVISIONAL de M0. Los PNG definitivos (192/512 y maskable)
        // se añaden en M5.
        icons: [
          {
            src: 'icon-placeholder.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
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
