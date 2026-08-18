// Barra de navegación — las secciones del design-system.
//
// Obras · Promotores · Perfil. Siempre visible en las pantallas de
// sección (no en los flujos profundos como el wizard o la entrega), para que el
// coordinador pueda saltar de una sección a otra a una mano. Etiquetas grandes y
// SIEMPRE visibles (no solo iconos): a usuarios mayores no se les ocultan las
// funciones ([[design-system]] · [[working-preferences#design-constraints]]).
//
// Responsiva (design-system): en MÓVIL es una barra inferior al alcance del
// pulgar; en TABLET/ESCRITORIO (md+) pasa a barra LATERAL izquierda fija. El
// contenido de las secciones se reajusta en layout-con-nav.tsx. La disposición
// maestro-detalle dentro de cada sección (lista + detalle en la misma pantalla)
// es un cambio mayor por pantalla y queda fuera de este pulido.

import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Seccion {
  a: string;
  etiqueta: string;
  /** El icono recibe la clase para heredar tamaño y color. */
  icono: (clase: string) => React.ReactNode;
}

// Iconos SVG inline (sin dependencias): trazo simple, heredan color con
// `currentColor` y tamaño con la clase que se les pasa.
const SECCIONES: Seccion[] = [
  {
    a: "/obras",
    etiqueta: "Obras",
    icono: (c) => (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    a: "/promotores",
    etiqueta: "Promotores",
    icono: (c) => (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    a: "/perfil",
    etiqueta: "Perfil",
    icono: (c) => (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function TabBar() {
  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        "fixed z-10 border-border bg-background",
        // Móvil: barra inferior de ancho completo.
        "inset-x-0 bottom-0 border-t",
        // Escritorio/tablet: barra lateral izquierda fija.
        "md:inset-y-0 md:right-auto md:w-56 md:border-r md:border-t-0",
      )}
    >
      {/* Título de la app, solo en la lateral de escritorio. */}
      <p className="hidden px-4 pb-2 pt-6 text-[20px] font-bold text-foreground md:block">
        Informes de seguridad
      </p>
      <ul className="mx-auto flex max-w-2xl md:mx-0 md:max-w-none md:flex-col md:gap-1 md:px-3">
        {SECCIONES.map((seccion) => (
          <li key={seccion.a} className="flex-1 md:flex-none">
            <NavLink
              to={seccion.a}
              end={seccion.a === "/obras"}
              className={({ isActive }) => {
                const activa = isActive;
                return cn(
                  // Móvil: columna centrada. Escritorio: fila alineada a la izquierda.
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-[15px] font-semibold",
                  "md:min-h-0 md:flex-row md:justify-start md:gap-3 md:rounded-md md:px-4 md:py-3 md:text-[17px]",
                  activa ? "text-primary md:bg-secondary" : "text-muted-foreground",
                );
              }}
            >
              {seccion.icono("h-6 w-6 shrink-0")}
              {seccion.etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
