// Esquema de validación del Informe (borrador) — las reglas, una sola vez.
//
// A diferencia de las otras entidades, el informe se guarda INCOMPLETO: es un
// borrador que se rellena paso a paso (autoguardado del wizard). Por eso casi
// todo es opcional; lo único imprescindible para existir es a qué obra pertenece.
// La comprobación de "está completo para firmar" vive en completitud.ts, no aquí.
//
// MODELO v2 (validated: true) — confirmado con los 8 informes reales del
// stakeholder y aprobado en docs/decisions.md#d9-informe-v2. El informe es:
// cabecera + resumen de la semana + una o varias ACTIVIDADES (cada una con su
// ubicación, su descripción y sus fotos) + firmas. Ver docs/entity-informe.md y
// docs/maqueta-informe-real.md.

import { z } from "zod";
import { textoObligatorio } from "@/domain/shared/validacion";

/** Un informe empieza como borrador y pasa a finalizado cuando se firma y cierra. */
export const ESTADOS_INFORME = ["borrador", "finalizado"] as const;

/**
 * Quién firma un informe: el coordinador (obligatoria, es su prueba de presencia)
 * y quien lo recibe en obra (opcional). El promotor no firma, y la subcontrata
 * tampoco: la regla "la subcontrata con incumplimiento firma" se eliminó en el
 * modelo v2 porque no aparece en ninguno de los 8 informes reales.
 * Ver docs/entity-informe#signatures.
 */
export const ROLES_FIRMANTE = ["coordinador", "recibido"] as const;

/**
 * De qué tipo es una actividad. Invisible en la pantalla a propósito (hoy nadie
 * lo rellena): existe para no perder la señal estructurada de cara al futuro —
 * poder contar incidencias sin rehacer el modelo. D9, afinado 1.
 */
export const TIPOS_ACTIVIDAD = ["normal", "incidencia"] as const;

/** Una foto adjunta: imagen reducida (dataURL) con un id para poder borrarla. */
export const esquemaFoto = z.object({
  id: z.string(),
  imagen: textoObligatorio("La foto no puede estar vacía."),
  /** El texto que acompaña a la foto bajo ella en el PDF. Siempre opcional. */
  comentario: z.string().optional(),
});

/**
 * Una actividad: la pieza que se repite dentro del informe. En los informes
 * reales es el bloque "SITUACIÓN DE LA ACTUACIÓN: <dónde>" + "DESCRIPCIÓN DE LA
 * ACTIVIDAD: <qué>" seguido de sus fotos.
 *
 * `descripcion` es opcional AQUÍ (el borrador se guarda a medias, y una actividad
 * recién añadida está vacía) pero completitud.ts exige al menos una con texto
 * para poder finalizar.
 */
export const esquemaActividad = z.object({
  id: z.string(),
  /** Dónde ocurre: "(M-300) PK 31+400 – ZONA 4 - ESTE". */
  ubicacion: z.string().optional(),
  descripcion: z.string().optional(),
  tipo: z.enum(TIPOS_ACTIVIDAD).optional(),
  fotos: z.array(esquemaFoto).optional(),
});

/**
 * Quien recibe el informe en obra. Vive en el INFORME y no en la obra porque
 * cambia en cada visita (D9, afinado 2). Todo opcional: nunca bloquea el cierre.
 */
export const esquemaReceptor = z.object({
  nombre: z.string().optional(),
  empresa: z.string().optional(),
});

/** Una firma recogida en el dispositivo: quién firma, en qué papel y el trazo. */
export const esquemaFirmaInforme = z.object({
  nombre: textoObligatorio("Indique quién firma."),
  rol: z.enum(ROLES_FIRMANTE, { message: "Indique el rol de quien firma." }),
  firma: textoObligatorio("Falta el trazo de la firma."),
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
  actividades: z.array(esquemaActividad).optional(),
  receptor: esquemaReceptor.optional(),
  firmas: z.array(esquemaFirmaInforme).optional(),
});
