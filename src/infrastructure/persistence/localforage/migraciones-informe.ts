// Los escalones del INFORME: cómo subir una ficha guardada hasta la forma de hoy.
//
// Mismo criterio que en la obra: el orden manda y los escalones pasados no se
// tocan nunca. Ver migraciones-proyecto.ts y docs/nota-migracion-datos.md.

import { type Escalon, type Guardado } from "@/infrastructure/persistence/migracion";

/**
 * v0 → v1 · Solo el sello.
 *
 * El modelo v2 del informe (situación y actividades) entró en `main` el 14 de
 * agosto y los coordinadores generaron su primer informe el 16, así que lo que
 * hay en sus dispositivos YA tiene la forma de hoy: no hay nada que transformar.
 *
 * El escalón existe igualmente para que la cadena arranque desde algo y las
 * fichas queden selladas; el primero que transforme de verdad será el de la
 * Fase B, cuando la actividad pase a ser una observación con estado.
 */
const soloSellar: Escalon = (guardado) => guardado;

/**
 * v1 → v2 · La actividad pasa a ser una observación.
 *
 * Es el primer escalón que transforma de verdad, y el que justifica todo el
 * trabajo de versionado: los coordinadores ya tienen informes guardados con
 * `actividades`, y sin esto zod los descartaría enteros al releerlos.
 *
 * Qué hace:
 *  - `actividades` pasa a llamarse `observaciones`.
 *  - El `tipo` invisible que nunca llegó a usarse se convierte en `estado`: lo
 *    que estuviera marcado como incidencia pasa a "medida requerida", que es su
 *    equivalente en el catálogo nuevo. Lo demás se queda sin estado, y será el
 *    coordinador quien lo elija la próxima vez que edite.
 *
 * El `titulo` se queda vacío a propósito: no hay de dónde sacarlo sin
 * inventárselo, y el texto que escribieron sigue entero en `descripcion`. No se
 * pierde nada.
 */
const laActividadPasaAObservacion: Escalon = (guardado) => {
  const { actividades, ...resto } = guardado as Guardado & { actividades?: unknown[] };
  if (!Array.isArray(actividades)) return resto;

  const observaciones = actividades.map((actividad) => {
    const { tipo, ...restoActividad } = actividad as Guardado & { tipo?: string };
    return tipo === "incidencia"
      ? { ...restoActividad, estado: "medida-requerida" }
      : restoActividad;
  });

  return { ...resto, observaciones };
};

export const ESCALONES_INFORME: Escalon[] = [soloSellar, laActividadPasaAObservacion];
