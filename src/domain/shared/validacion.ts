// Piezas de validación compartidas por los esquemas del dominio.
//
// Viven aquí para que la regla exista UNA sola vez: el formato de correo y el
// "texto no vacío" los usan Coordinador, Promotor y (más adelante) Proyecto. Si
// mañana cambia el criterio de correo, se cambia en este archivo y punto.
//
// Sobre zod en el dominio: es la única dependencia externa permitida, a
// propósito. Ver el README de domain/ y tech-plan-f1.md §2.

import { z } from "zod";

/** ¿Es una cadena con contenido real (no vacía ni solo espacios)? */
export const tieneTexto = (valor: string | undefined): boolean =>
  typeof valor === "string" && valor.trim().length > 0;

// Validación ligera de correo: suficiente para avisar de erratas evidentes.
// No pretende cubrir el RFC entero; el dominio no debería obsesionarse con esto.
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Texto obligatorio, con su mensaje en español. Rechaza "" y "   " (solo
 * espacios). Valida sin transformar: no recorta el valor que se guarda.
 */
export const textoObligatorio = (mensaje: string) => z.string().refine(tieneTexto, mensaje);

/** Correo opcional: si se rellena, debe tener formato válido. */
export const correoOpcional = z
  .string()
  .optional()
  .refine(
    (v) => !tieneTexto(v) || FORMATO_CORREO.test(v!.trim()),
    "El correo no tiene un formato válido.",
  );
