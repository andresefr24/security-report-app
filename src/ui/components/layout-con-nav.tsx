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
      {/* pb-24: hueco para que la barra fija no tape el final del contenido. */}
      <div className="pb-24">
        <Outlet />
      </div>
      <TabBar />
    </>
  );
}
