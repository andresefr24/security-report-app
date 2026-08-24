// Cómo se llama y de qué color va cada estado de una observación EN PANTALLA.
//
// El coordinador elige el estado con un botón; el texto y el color los pone la
// app, nunca se teclean (es lo que pidieron: "que solo existan esos tres").
//
// La clasificación de colores la fijaron Nicolás y Miren: la OPS en rojo, la
// medida requerida en amarillo y lo subsanado en verde. Van con el fondo del
// color y la letra encima, blanca sobre el rojo y el verde y negra sobre el
// amarillo, que con letra blanca no se leería.
//
// Los colores van escritos aquí y no salen de los tokens del design-system
// porque son los del INFORME, no los de la interfaz: el amarillo de una etiqueta
// de estado no tiene por qué ser el mismo que el de un aviso de la app.
//
// El documento tiene su propia versión de esto, con los mismos colores en
// hexadecimal, en la plantilla del PDF: es parte del formato, y la
// infraestructura no puede depender de la interfaz.

import { type EstadoObservacion } from "@/domain/informe/informe";

export interface PintaDelEstado {
  /** Cómo se lee en pantalla y en el documento. */
  etiqueta: string;
  /**
   * El botón cuando ESTÁ elegido: relleno del color, como saldrá en el informe.
   * Letra blanca sobre el rojo y el verde, negra sobre el amarillo.
   */
  clasesElegido: string;
  /**
   * El botón cuando NO está elegido: fondo blanco, borde y letra del color.
   *
   * La primera versión los apagaba con transparencia y no había quien los
   * leyera. Con presbicia eso no vale: los tres se leen igual de bien, y lo que
   * distingue al elegido es el relleno.
   */
  clasesSuelto: string;
}

export const ESTADOS: { valor: EstadoObservacion; pinta: PintaDelEstado }[] = [
  {
    valor: "observacion-preventiva",
    pinta: {
      etiqueta: "Observación Preventiva de Seguridad (OPS)",
      clasesElegido: "border-[#8f1e18] bg-[#b3261e] !text-white hover:bg-[#8f1e18]",
      clasesSuelto: "border-[#b3261e] bg-white !text-[#b3261e] hover:bg-[#fdeceb]",
    },
  },
  {
    valor: "medida-requerida",
    pinta: {
      etiqueta: "Medida requerida",
      clasesElegido: "border-[#c99400] bg-[#f5c518] !text-black hover:bg-[#e6a700]",
      // El amarillo como letra sobre blanco no se leería: se usa su tono oscuro.
      clasesSuelto: "border-[#e6a700] bg-white !text-[#8a5a00] hover:bg-[#fdf6dd]",
    },
  },
  {
    valor: "subsanado",
    pinta: {
      etiqueta: "Subsanado",
      clasesElegido: "border-[#155224] bg-[#1c6b30] !text-white hover:bg-[#155224]",
      clasesSuelto: "border-[#1c6b30] bg-white !text-[#1c6b30] hover:bg-[#e8f3ea]",
    },
  },
];

/** La pinta de un estado, o undefined si la observación no tiene ninguno. */
export function pintaDe(estado: EstadoObservacion | undefined): PintaDelEstado | undefined {
  return ESTADOS.find((e) => e.valor === estado)?.pinta;
}
