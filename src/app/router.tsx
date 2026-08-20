import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LayoutConNav } from '@/ui/components/layout-con-nav'
import { PerfilPage } from '@/ui/pages/PerfilPage'
import { PromotoresPage } from '@/ui/pages/PromotoresPage'
import { PromotorFormPage } from '@/ui/pages/PromotorFormPage'
import { ObrasPage } from '@/ui/pages/ObrasPage'
import { ObraFormPage } from '@/ui/pages/ObraFormPage'
import { CrearInformePage } from '@/ui/pages/informe/CrearInformePage'
import { InformeWizardPage } from '@/ui/pages/informe/InformeWizardPage'
import { EntregarInformePage } from '@/ui/pages/informe/EntregarInformePage'
import { casosDeUso, sharePort } from '@/app/composition-root'
import { OPCIONES_ROUTER } from '@/app/opciones-router'

// Enrutado de la app (composition root). Cada ruta -> una pantalla de ui/pages.
// A cada pantalla le pasamos los casos de uso ya cableados (composition-root.ts).
//
// Dos grupos de rutas:
//  - SECCIONES (Obras, Promotores, Perfil): anidadas bajo LayoutConNav, que les
//    pone la barra de navegación inferior para saltar entre secciones.
//  - FLUJOS profundos (altas, wizard, entrega): a pantalla completa, sin barra.
export const router = createBrowserRouter([
  {
    // La app abre en Obras (la pantalla de trabajo principal).
    path: '/',
    element: <Navigate to="/obras" replace />,
  },
  {
    // Layout con barra de navegación: envuelve las tres secciones.
    element: <LayoutConNav />,
    children: [
      {
        path: '/obras',
        element: (
          <ObrasPage
            listarProyectos={casosDeUso.listarProyectos}
            listarInformes={casosDeUso.listarInformes}
            borrarInforme={casosDeUso.borrarInforme}
            borrarProyecto={casosDeUso.borrarProyecto}
          />
        ),
      },
      {
        path: '/promotores',
        element: <PromotoresPage listarPromotores={casosDeUso.listarPromotores} />,
      },
      {
        path: '/perfil',
        element: <PerfilPage configurarPerfil={casosDeUso.configurarPerfil} />,
      },
    ],
  },
  // React Router v6 ordena por especificidad (un segmento fijo como 'nuevo' gana
  // al dinámico ':id'), así que el orden en que se declaren da igual.
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
    path: '/obras/nueva',
    element: (
      <ObraFormPage
        crearProyecto={casosDeUso.crearProyecto}
        listarPromotores={casosDeUso.listarPromotores}
      />
    ),
  },
  {
    path: '/obras/:obraId/informes/nuevo',
    element: <CrearInformePage crearBorradorInforme={casosDeUso.crearBorradorInforme} />,
  },
  {
    path: '/informes/:id',
    element: (
      <InformeWizardPage
        obtenerInforme={casosDeUso.obtenerInforme}
        guardarInforme={casosDeUso.guardarInforme}
      />
    ),
  },
  {
    path: '/informes/:id/entregar',
    element: (
      <EntregarInformePage
        finalizarInforme={casosDeUso.finalizarInforme}
        generarPdfDelInforme={casosDeUso.generarPdfDelInforme}
        compartir={sharePort}
      />
    ),
  },
], OPCIONES_ROUTER)
