// Esquema de validación del Coordinador — las reglas base viven aquí, una sola vez.
//
// zod es la ÚNICA dependencia externa que permitimos en el dominio, y es A
// PROPÓSITO: centraliza las reglas en un único sitio para que el formulario
// (ui/) las reutilice en vez de duplicarlas, y en el incremento 1.2 el mismo
// esquema generará el JSON Schema de la IA (Structured Outputs). Ver
// tech-plan-f1.md §2 y la nota en el README de domain/.

import { z } from "zod";

// Validación ligera de correo: suficiente para avisar de erratas evidentes.
// No pretende cubrir el RFC entero; el dominio no debería obsesionarse con esto.
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ¿Es una cadena con contenido real (no vacía ni solo espacios)?
const tieneTexto = (valor: string | undefined): boolean =>
  typeof valor === "string" && valor.trim().length > 0;

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
  nombreCompleto: z
    .string()
    .refine(tieneTexto, "El nombre y apellidos no pueden estar vacíos."),
  numeroRegistroIrsst: z
    .string()
    .refine(tieneTexto, "El número de registro de la CAM (IRSST) es obligatorio."),
  profesion: z.string().optional(),
  numeroColegiado: z.string().optional(),
  contacto: z
    .object({
      correo: z
        .string()
        .optional()
        .refine(
          (v) => !tieneTexto(v) || FORMATO_CORREO.test(v!.trim()),
          "El correo no tiene un formato válido.",
        ),
      telefono: z.string().optional(),
      empresa: z.string().optional(),
    })
    .optional(),
  firma: z.string().optional(),
});
