// Esquema de validación del Coordinador — las reglas base viven aquí, una sola vez.
//
// zod es la ÚNICA dependencia externa que permitimos en el dominio, y es A
// PROPÓSITO: centraliza las reglas en un único sitio para que el formulario
// (ui/) las reutilice en vez de duplicarlas, y en el incremento 1.2 el mismo
// esquema generará el JSON Schema de la IA (Structured Outputs). Ver
// tech-plan-f1.md §2 y la nota en el README de domain/.

import { z } from "zod";
import { correoOpcional, textoObligatorio } from "@/domain/shared/validacion";

/**
 * Reglas base del coordinador. Valida sin transformar (no recorta espacios ni
 * cambia los valores), para conservar el dato tal cual se guarda.
 *
 * IMPORTANTE — dos números distintos, no confundirlos:
 * - `numeroRegistroIrsst`: registro de coordinador de la CAM (IRSST). El que da
 *   validez legal al informe. Obligatorio.
 * - `numeroColegiado`: número del colegio profesional. NO es el del informe.
 *
 * La firma es OPCIONAL en el dominio. El formulario la hace obligatoria al
 * rellenar el perfil, extendiendo este esquema (ver ui/pages/perfil-campos.ts).
 */
export const esquemaCoordinador = z.object({
  nombreCompleto: textoObligatorio("El nombre y apellidos no pueden estar vacíos."),
  numeroRegistroIrsst: textoObligatorio(
    "El número de registro de la CAM (IRSST) es obligatorio.",
  ),
  profesion: z.string().optional(),
  numeroColegiado: z.string().optional(),
  contacto: z
    .object({
      correo: correoOpcional,
      telefono: z.string().optional(),
      empresa: z.string().optional(),
    })
    .optional(),
  firma: z.string().optional(),
});
