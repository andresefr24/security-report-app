import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite. Por ahora solo activamos el plugin de React;
// en piezas siguientes añadiremos aquí la PWA y los alias de rutas.
export default defineConfig({
  plugins: [react()],
})
