// Esquema de validación del Informe (borrador) — las reglas, una sola vez.
//
// A diferencia de las otras entidades, el informe se guarda INCOMPLETO: es un
// borrador que se rellena paso a paso (autoguardado del wizard). Por eso casi
// todo es opcional; lo único imprescindible para existir es a qué obra pertenece.
// La comprobación de "está completo para firmar" se hará al finalizar, no aquí.
//
// NOTA (validated: false): los campos exactos de cada paso dependen del informe
// real del stakeholder (Q2). Cada paso es un bloque independiente para poder
// añadir o reordenar campos sin romper el resto. Ver docs/entity-informe.md.

import { z } from "zod";
import { textoObligatorio } from "@/domain/shared/validacion";

/** Un informe empieza como borrador y pasa a finalizado cuando se firma y cierra. */
export const ESTADOS_INFORME = ["borrador", "finalizado"] as const;

/**
 * Quién puede firmar un informe: el coordinador (siempre), quien atiende la
 * visita por la contrata, y la subcontrata (solo si ese día hubo incumplimiento).
 * El promotor NO firma. Ver docs/entity-informe#signatures.
 */
export const ROLES_FIRMANTE = ["coordinador", "contratista", "subcontrata"] as const;

/** Una foto adjunta: imagen reducida (dataURL) con un id para poder borrarla. */
export const esquemaFoto = z.object({
  id: z.string(),
  imagen: textoObligatorio("La foto no puede estar vacía."),
  descripcion: z.string().optional(),
});

/** Alguien que acompaña al coordinador en la visita y recibe instrucciones. */
export const esquemaPersonaAtiende = z.object({
  nombre: textoObligatorio("Indique el nombre de quien atiende la visita."),
  cargo: z.string().optional(),
});

/** Un incumplimiento detectado, imputado a una subcontrata. */
export const esquemaIncumplimiento = z.object({
  id: z.string(),
  subcontrata: textoObligatorio("Indique la subcontrata afectada."),
  descripcion: textoObligatorio("Describa el incumplimiento."),
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
  // Los 5 pasos del wizard, todos opcionales en el borrador:
  personasAtienden: z.array(esquemaPersonaAtiende).optional(), // paso 1
  fotos: z.array(esquemaFoto).optional(), // paso 2
  contenido: z.string().optional(), // paso 3 (la bisagra de la IA del 1.2)
  incumplimientos: z.array(esquemaIncumplimiento).optional(), // paso 4
  firmas: z.array(esquemaFirmaInforme).optional(), // paso 5
});
