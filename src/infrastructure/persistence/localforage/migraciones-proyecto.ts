// Los escalones de la OBRA: cómo subir una ficha guardada hasta la forma de hoy.
//
// El orden del array es el que manda: el primero lleva de la v0 (lo que se
// guardó antes de que existieran los sellos) a la v1, el siguiente de la v1 a la
// v2, y así. Nunca se reordenan ni se borran escalones pasados: son la historia
// de cómo ha cambiado la ficha, y hay dispositivos parados en cada época.
//
// Cada escalón es una función pura y pequeña, para poder probarla sola.

import { type Escalon, type Guardado } from "@/infrastructure/persistence/migracion";

/**
 * v0 → v1 · Los dos presupuestos.
 *
 * La obra tenía un solo `presupuesto`; al pedir los coordinadores el del Estudio
 * de Seguridad y Salud aparte, el de siempre pasó a llamarse
 * `presupuestoEjecucion`. Sin este escalón, zod no reconocería el nombre viejo
 * al releer y el importe que ellos escribieron aparecería en blanco.
 */
const separarLosDosPresupuestos: Escalon = (guardado) => {
  const { presupuesto, ...resto } = guardado as Guardado & { presupuesto?: string };
  if (presupuesto === undefined) return resto;
  return { ...resto, presupuestoEjecucion: resto.presupuestoEjecucion ?? presupuesto };
};

export const ESCALONES_PROYECTO: Escalon[] = [separarLosDosPresupuestos];
