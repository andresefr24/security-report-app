import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './globals.css'

// Punto de entrada de la app: React "toma" el <div id="root"> del index.html
// y pinta dentro nuestro componente <App />.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
