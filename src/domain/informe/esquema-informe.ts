// Esquema de validación del Informe (borrador) — las reglas, una sola vez.
//
// A diferencia de las otras entidades, el informe se guarda INCOMPLETO: es un
// borrador que se rellena paso a paso (autoguardado del wizard). Por eso casi
// todo es opcional; lo único imprescindible para existir es a qué obra pertenece.
// La comprobación de "está completo para firmar" vive en completitud.ts, no aquí.
//
// EL MODELO — nació con los 8 informes reales del stakeholder
// (docs/decisions.md#d9-informe-v2) y lo afinaron Nicolás y Miren usándolo. El
// informe es: cabecera + resumen de la semana + una o varias OBSERVACIONES (cada
// una con su título, su estado, su ubicación, su explicación y sus fotos) +
// firmas. Ver docs/entity-informe.md y docs/maqueta-informe-real.md.

import { z } from "zod";
import { textoObligatorio } from "@/domain/shared/validacion";

/** Un informe empieza como borrador y pasa a finalizado cuando se firma y cierra. */
export const ESTADOS_INFORME = ["borrador", "finalizado"] as const;

/**
 * Quién firma un informe: el coordinador —su prueba de presencia, y lo que da
 * valor legal al documento— y quien lo recibe en obra.
 *
 * El rol "recibido" se quitó una vuelta y volvió: se había ido porque nadie
 * firmaba ahí, pero ahora se puede firmar a mano O subir una foto de la firma,
 * que es como la consiguen de verdad. El promotor y la subcontrata no firman.
 * Ver docs/entity-informe#signatures.
 */
export const ROLES_FIRMANTE = ["coordinador", "recibido"] as const;

/**
 * En qué estado está una observación. Sustituye al `tipo` invisible que dejó D9
 * (afinado 1): la idea era la misma —no perder la señal estructurada— pero los
 * coordinadores pidieron verla, con colores, y con estos tres valores, que son
 * los que usan en sus informes de verdad.
 *
 * El coordinador elige uno con un botón; la etiqueta y el color del PDF los
 * pone la app, nunca se teclean.
 */
export const ESTADOS_OBSERVACION = [
  "medida-requerida",
  "observacion-preventiva",
  "subsanado",
] as const;

/** Una foto adjunta: imagen reducida (dataURL) con un id para poder borrarla. */
export const esquemaFoto = z.object({
  id: z.string(),
  imagen: textoObligatorio("La foto no puede estar vacía."),
  /** El texto que acompaña a la foto bajo ella en el PDF. Siempre opcional. */
  comentario: z.string().optional(),
});

/**
 * Una observación: la pieza que se repite dentro del informe. Es el bloque que
 * en el documento encabeza como "OBSERVACIÓN 1 · <título>", con su etiqueta de
 * estado al lado, su ubicación y sus fotos.
 *
 * El TÍTULO es el titular corto ("Grupo electrógeno sin medios de extinción
 * cercanos"); la DESCRIPCIÓN es el texto largo, que puede no hacer falta cuando
 * el comentario de la foto ya lo cuenta todo.
 *
 * Los dos son opcionales AQUÍ (el borrador se guarda a medias, y una observación
 * recién añadida está vacía); completitud.ts es quien exige al menos una con
 * título para poder finalizar.
 */
export const esquemaObservacion = z.object({
  id: z.string(),
  /** El titular corto que encabeza el bloque en el PDF. */
  titulo: z.string().optional(),
  /** Dónde ocurre: "(M-300) PK 31+400 – ZONA 4 - ESTE". */
  ubicacion: z.string().optional(),
  descripcion: z.string().optional(),
  estado: z.enum(ESTADOS_OBSERVACION).optional(),
  /**
   * Marca esta observación como el seguimiento de la anterior: comparte su
   * número en el documento. Sirve para lo que hacen de verdad — apuntan una
   * medida requerida, se la arreglan durante la visita, y añaden la misma
   * observación otra vez como subsanada.
   */
  continuaAnterior: z.boolean().optional(),
  fotos: z.array(esquemaFoto).optional(),
});

/**
 * Una firma recogida en el dispositivo: en qué papel firma, la imagen de la
 * firma y, si lo escriben, el nombre.
 *
 * El NOMBRE es opcional: muchas firmas se leen solas, y obligarlo era una
 * barrera para algo que se hace de pie en mitad de una obra. Lo que no puede
 * faltar es la imagen: sin trazo no hay firma.
 */
/**
 * Una firma del informe. TODO es opcional menos el rol.
 *
 * El trazo era obligatorio y se soltó a propósito: en obra pasa mucho que quien
 * recibe el informe da su nombre y no firma en el momento ("ya lo firmo luego"),
 * y ese nombre se estaba PERDIENDO sin avisar. Ahora vale con el nombre solo.
 *
 * Que la del COORDINADOR sí lleve trazo se exige donde toca, al cerrar el
 * informe (completitud.ts), no aquí: un borrador a medias tiene que poder
 * guardarse.
 */
export const esquemaFirmaInforme = z.object({
  nombre: z.string().optional(),
  rol: z.enum(ROLES_FIRMANTE, { message: "Indique el rol de quien firma." }),
  firma: z.string().optional(),
});

export const esquemaInforme = z.object({
  id: z.string().optional(),
  // Lo único imprescindible: de qué obra es el informe.
  proyectoId: textoObligatorio("El informe debe pertenecer a una obra."),
  // Se pone sola al crear el borrador (momento de la visita); editable en el paso 1.
  fechaHora: z.string().optional(),
  estado: z.enum(ESTADOS_INFORME).optional(),

  // El cuerpo del informe v2, todo opcional en el borrador:
  /** El "Semana del X al Y…" que encabeza los informes semanales. */
  resumenSemana: z.string().optional(),
  /** Estado general de la obra. Opcional: los informes semanales no lo usan. */
  situacion: z.string().optional(),
  observaciones: z.array(esquemaObservacion).optional(),
  firmas: z.array(esquemaFirmaInforme).optional(),
});
