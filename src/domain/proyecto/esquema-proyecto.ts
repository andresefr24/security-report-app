// Esquema de validación del Proyecto (la obra) — las reglas, una sola vez.
//
// Reutiliza las piezas compartidas de domain/shared/validacion.ts. La UI
// reutilizará este esquema en vez de reescribir las reglas.
//
// NOTA (validated: false): el conjunto de campos del "formulario de obra nueva"
// no está confirmado (stakeholder-questions#q3). Obligatorios solo los tres que
// sostienen el resto: código, promotor y frecuencia. Ver docs/entity-proyecto.md.

import { z } from "zod";
import { correoObligatorio, textoObligatorio } from "@/domain/shared/validacion";

/** Cada cuánto visita el coordinador la obra. Marca la cadencia de los informes. */
export const FRECUENCIAS_VISITA = ["diaria", "semanal"] as const;

/**
 * Roles de la lista de distribución. La subcontrata solo entra en un informe
 * concreto cuando ese día se le marca un incumplimiento (ver entity-informe).
 */
export const ROLES_DESTINATARIO = [
  "promotor",
  "direccion-facultativa",
  "tecnico-prl",
  "contratista",
  "subcontrata",
] as const;

/** Un destinatario de los informes de esta obra: su correo y su papel. */
export const esquemaDestinatario = z.object({
  nombre: z.string().optional(),
  correo: correoObligatorio,
  rol: z.enum(ROLES_DESTINATARIO, { message: "Indique el rol del destinatario." }),
});

export const esquemaProyecto = z.object({
  id: z.string().optional(),
  codigoObra: textoObligatorio("El código de obra es obligatorio."),
  /**
   * Referencia al promotor POR ID (decisions#d5). Nunca se copian sus datos: si
   * el promotor cambia de correo, no queremos copias desactualizadas por ahí.
   */
  promotorId: textoObligatorio("Seleccione el promotor de la obra."),
  descripcion: z.string().optional(),
  /**
   * La empresa contratista de la obra. Va en la cabecera de todos los informes
   * reales, y vive AQUÍ (y no en el informe) porque es estable: no cambia de una
   * visita a otra. Ver decisions#d9-informe-v2, afinado 2.
   */
  contratista: z.string().optional(),
  // Fechas como texto AAAA-MM-DD: es lo que da un <input type="date"> y evita
  // líos de zonas horarias. Provisional.
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  // Provisional: texto libre. En F1 solo se imprime en el PDF; si algún día hay
  // que sumar importes, se cambiaría a número.
  presupuesto: z.string().optional(),
  frecuenciaVisita: z.enum(FRECUENCIAS_VISITA, {
    message: "Indique la frecuencia de visita.",
  }),
  // Puede crearse la obra sin destinatarios e irlos añadiendo después; pero los
  // que haya tienen que estar bien (correo válido y rol).
  listaDistribucion: z.array(esquemaDestinatario).optional(),
});
