// Esquema de validación del Promotor — las reglas viven aquí, una sola vez.
//
// Reutiliza las piezas compartidas de domain/shared/validacion.ts (formato de
// correo, texto obligatorio) para no duplicarlas con el Coordinador. La UI
// reutilizará este esquema con .extend() en vez de reescribir las reglas.

import { z } from "zod";
import { correoOpcional, textoObligatorio } from "@/domain/shared/validacion";

/**
 * Reglas base del promotor. Valida sin transformar (conserva el dato tal cual).
 *
 * NOTA (validated: false): los campos aún no están confirmados contra el
 * "formulario de obra nueva" real del stakeholder. Por eso la estructura se
 * mantiene fácil de ampliar. Ver docs/entity-promotor.md.
 *
 * El `id` es opcional al crear: si no viene, lo genera `crearPromotor`. Se puede
 * pasar fijo desde los tests para que sean predecibles.
 */
export const esquemaPromotor = z.object({
  id: z.string().optional(),
  nombreRazonSocial: textoObligatorio("El nombre o razón social no puede estar vacío."),
  // Datos fiscales. Provisional: de momento basta el NIF/CIF.
  nif: z.string().optional(),
  contacto: z
    .object({
      persona: z.string().optional(),
      correo: correoOpcional,
      telefono: z.string().optional(),
    })
    .optional(),
});
