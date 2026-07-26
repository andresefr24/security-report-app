// Barra de navegación inferior — las 4 secciones del design-system.
//
// Obras · Promotores · Nuevo · Perfil. Siempre visible en las pantallas de
// sección (no en los flujos profundos como el wizard o la entrega), para que el
// coordinador pueda saltar de una sección a otra a una mano. Etiquetas grandes y
// SIEMPRE visibles (no solo iconos): a usuarios mayores no se les ocultan las
// funciones ([[design-system]] · [[working-preferences#design-constraints]]).
//
// Nota: en escritorio/tablet el design-system pide una barra lateral maestro-
// detalle; de momento usamos esta barra inferior en todos los tamaños (el uso
// principal es el móvil a pie de obra). La lateral queda como pulido posterior.

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
    a: "/obras/nueva",
    etiqueta: "Nuevo",
    icono: (c) => (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
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
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background"
    >
      <ul className="mx-auto flex max-w-2xl">
        {SECCIONES.map((seccion) => (
          <li key={seccion.a} className="flex-1">
            <NavLink
              to={seccion.a}
              // "Nuevo" apunta a un flujo (nueva obra), no es una sección con
              // estado activo; el resto sí resalta cuando estás en ella.
              end={seccion.a === "/obras"}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-[15px] font-semibold",
                  isActive && seccion.etiqueta !== "Nuevo"
                    ? "text-primary"
                    : "text-muted-foreground",
                )
              }
            >
              {seccion.icono("h-6 w-6")}
              {seccion.etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
