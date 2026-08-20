// Esquema de validación del Proyecto (la obra) — las reglas, una sola vez.
//
// Reutiliza las piezas compartidas de domain/shared/validacion.ts. La UI
// reutilizará este esquema en vez de reescribir las reglas.
//
// NOTA (validated: false): el conjunto de campos del "formulario de obra nueva"
// no está confirmado (stakeholder-questions#q3). Obligatorios solo los tres que
// sostienen el resto: código, promotor y frecuencia. Ver docs/entity-proyecto.md.

import { z } from "zod";
import { textoObligatorio } from "@/domain/shared/validacion";

/** Cada cuánto visita el coordinador la obra. Marca la cadencia de los informes. */
export const FRECUENCIAS_VISITA = ["diaria", "semanal"] as const;

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
   * Dónde está la obra (la dirección). En los informes reales encabeza el
   * documento, y los coordinadores la llamaban "situación de la obra": es un
   * dato de la OBRA, estable, no algo que se teclee en cada informe.
   */
  ubicacion: z.string().optional(),
  /**
   * La empresa contratista de la obra. Va en la cabecera de todos los informes
   * reales, y vive AQUÍ (y no en el informe) porque es estable: no cambia de una
   * visita a otra. Ver decisions#d9-informe-v2, afinado 2.
   */
  contratista: z.string().optional(),
  // Fechas como texto AAAA-MM-DD: es lo que da un <input type="date"> y evita
  // líos de zonas horarias. Provisional.
  cifContratista: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  /** Cuánto dura la obra: texto libre, tal y como lo dicen ellos ("18 meses"). */
  plazoEjecucion: z.string().optional(),
  // Los dos importes son texto libre. En F1 solo se imprimen en el PDF; si algún
  // día hay que sumarlos, se cambiarían a número.
  presupuestoEjecucion: z.string().optional(),
  /** El del material del Estudio de Seguridad y Salud, que va aparte. */
  presupuestoEss: z.string().optional(),
  frecuenciaVisita: z.enum(FRECUENCIAS_VISITA, {
    message: "Indique la frecuencia de visita.",
  }),
  /**
   * A quién se le manda el informe, en un solo texto con los correos separados
   * por ";". Antes era una lista de destinatarios con su rol, y los
   * coordinadores lo pidieron así: es lo que hacen de verdad, copiar el texto
   * entero y pegarlo en el "Para:" del correo.
   */
  correos: z.string().optional(),
});
