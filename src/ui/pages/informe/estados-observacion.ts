// Cómo se llama y de qué color va cada estado de una observación EN PANTALLA.
//
// El coordinador elige el estado con un botón; el texto y el color los pone la
// app, nunca se teclean (es lo que pidieron: "que solo existan esos tres").
//
// El documento tiene su propia versión de esto, con colores en hexadecimal, en
// la plantilla del PDF: es parte del formato, y la infraestructura no puede
// depender de la interfaz.

import { type EstadoObservacion } from "@/domain/informe/informe";

export interface PintaDelEstado {
  /** Cómo se lee en pantalla y en el documento. */
  etiqueta: string;
  /** Clases de Tailwind para el botón en la app. */
  clases: string;
}

export const ESTADOS: { valor: EstadoObservacion; pinta: PintaDelEstado }[] = [
  {
    valor: "medida-requerida",
    pinta: {
      etiqueta: "MEDIDA REQUERIDA",
      clases: "border-warning bg-warning/10 text-warning",
    },
  },
  {
    valor: "observacion-preventiva",
    pinta: {
      etiqueta: "OBSERVACIÓN PREVENTIVA",
      clases: "border-warning bg-warning/10 text-warning",
    },
  },
  {
    valor: "subsanado",
    pinta: {
      etiqueta: "SUBSANADO",
      clases: "border-success bg-success/10 text-success",
    },
  },
];

/** La pinta de un estado, o undefined si la observación no tiene ninguno. */
export function pintaDe(estado: EstadoObservacion | undefined): PintaDelEstado | undefined {
  return ESTADOS.find((e) => e.valor === estado)?.pinta;
}
