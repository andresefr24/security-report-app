import { createBrowserRouter } from 'react-router-dom'
import { InicioPage } from '@/ui/pages/InicioPage'
import { PerfilPage } from '@/ui/pages/PerfilPage'
import { PromotoresPage } from '@/ui/pages/PromotoresPage'
import { PromotorFormPage } from '@/ui/pages/PromotorFormPage'
import { ObrasPage } from '@/ui/pages/ObrasPage'
import { ObraFormPage } from '@/ui/pages/ObraFormPage'
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
  {
    path: '/promotores',
    element: <PromotoresPage listarPromotores={casosDeUso.listarPromotores} />,
  },
  // 'nuevo' va ANTES que ':id', si no se interpretaría "nuevo" como un id.
  {
    path: '/promotores/nuevo',
    element: (
      <PromotorFormPage
        altaPromotor={casosDeUso.altaPromotor}
        editarPromotor={casosDeUso.editarPromotor}
      />
    ),
  },
  {
    path: '/promotores/:id',
    element: (
      <PromotorFormPage
        altaPromotor={casosDeUso.altaPromotor}
        editarPromotor={casosDeUso.editarPromotor}
      />
    ),
  },
  {
    path: '/obras',
    element: <ObrasPage listarProyectos={casosDeUso.listarProyectos} />,
  },
  {
    path: '/obras/nueva',
    element: (
      <ObraFormPage
        crearProyecto={casosDeUso.crearProyecto}
        listarPromotores={casosDeUso.listarPromotores}
      />
    ),
  },
])
