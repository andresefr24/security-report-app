import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { solicitarPersistencia } from '@/app/persistencia'
import './globals.css'

// Al arrancar, pedimos almacenamiento persistente para que iOS no borre los
// datos por inactividad (gotcha G3). Es silencioso y no bloquea el arranque.
void solicitarPersistencia()

// Punto de entrada de la app: React "toma" el <div id="root"> del index.html
// y pinta dentro nuestro componente <App />.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
