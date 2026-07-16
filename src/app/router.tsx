import { createBrowserRouter } from 'react-router-dom'
import { InicioPage } from '@/ui/pages/InicioPage'
import { PerfilPage } from '@/ui/pages/PerfilPage'
import { casosDeUso } from '@/app/composition-root'

// Enrutado de la app (composition root). Cada ruta -> una pantalla de ui/pages.
// A cada pantalla le pasamos los casos de uso ya cableados (composition-root.ts).
// '/' sigue siendo la pantalla de prueba de marca del M0; la navegación real
// (tab bar) llega en hitos posteriores.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <InicioPage />,
  },
  {
    path: '/perfil',
    element: <PerfilPage configurarPerfil={casosDeUso.configurarPerfil} />,
  },
])
