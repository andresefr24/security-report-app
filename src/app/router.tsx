import { createBrowserRouter, Navigate } from 'react-router-dom'
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
// '/' sigue siendo la pantalla de prueba de marca del M0; la navegación real
// (tab bar) llega en hitos posteriores.
export const router = createBrowserRouter([
  {
    // La app abre en Obras (la pantalla de trabajo principal). La navegación
    // completa —tab bar del design-system— llega en un hito posterior.
    path: '/',
    element: <Navigate to="/obras" replace />,
  },
  {
    path: '/perfil',
    element: <PerfilPage configurarPerfil={casosDeUso.configurarPerfil} />,
  },
  {
    path: '/promotores',
    element: <PromotoresPage listarPromotores={casosDeUso.listarPromotores} />,
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
    path: '/obras',
    element: (
      <ObrasPage
        listarProyectos={casosDeUso.listarProyectos}
        listarInformes={casosDeUso.listarInformes}
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
