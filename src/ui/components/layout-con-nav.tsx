// Layout de las pantallas de SECCIÓN: pinta la pantalla activa (Outlet) con la
// barra de navegación inferior fija debajo.
//
// Solo lo usan las secciones (Obras, Promotores, Perfil). Los flujos profundos
// (altas, wizard del informe, entrega del PDF) van a pantalla completa SIN barra,
// para no distraer y respetar el patrón lista→detalle del design-system.

import { Outlet } from "react-router-dom";
import { TabBar } from "@/ui/components/tab-bar";

export function LayoutConNav() {
  return (
    <>
      {/*
        Hueco para que la barra fija no tape el contenido:
        - móvil: barra abajo -> padding inferior (pb-24).
        - escritorio: barra lateral izquierda (w-56) -> margen izquierdo (md:pl-56, sin pb).
      */}
      <div className="pb-24 md:pb-0 md:pl-56">
        <Outlet />
      </div>
      <TabBar />
    </>
  );
}
