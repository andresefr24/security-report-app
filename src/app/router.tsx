import { createBrowserRouter } from 'react-router-dom'
import { InicioPage } from '@/ui/pages/InicioPage'

// Enrutado de la app (composition root). Cada ruta -> una pantalla de ui/pages.
// Por ahora solo la ruta de inicio; en M1+ añadiremos perfil, obras, etc.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <InicioPage />,
  },
])
