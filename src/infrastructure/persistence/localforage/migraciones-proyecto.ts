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

/**
 * v1 → v2 · La lista de distribución pasa a ser un texto de correos.
 *
 * Antes cada destinatario era una ficha con nombre, correo y rol; los
 * coordinadores pidieron un solo campo con los correos separados por ";", que es
 * lo que hacen de verdad: copiarlo entero y pegarlo en el "Para:".
 *
 * Se conservan los correos que ya tenían escritos; el nombre y el rol se
 * pierden, que es justo lo que querían quitarse de encima.
 */
const losDestinatariosPasanAUnTextoDeCorreos: Escalon = (guardado) => {
  const { listaDistribucion, ...resto } = guardado as Guardado & {
    listaDistribucion?: { correo?: string }[];
  };
  if (!Array.isArray(listaDistribucion)) return resto;

  const correos = listaDistribucion
    .map((destinatario) => destinatario?.correo)
    .filter((correo): correo is string => Boolean(correo))
    .join("; ");

  return correos ? { ...resto, correos: resto.correos ?? correos } : resto;
};

export const ESCALONES_PROYECTO: Escalon[] = [
  separarLosDosPresupuestos,
  losDestinatariosPasanAUnTextoDeCorreos,
];
