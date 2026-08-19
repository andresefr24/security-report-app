// Los escalones del INFORME: cómo subir una ficha guardada hasta la forma de hoy.
//
// Mismo criterio que en la obra: el orden manda y los escalones pasados no se
// tocan nunca. Ver migraciones-proyecto.ts y docs/nota-migracion-datos.md.

import { type Escalon } from "@/infrastructure/persistence/migracion";

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

export const ESCALONES_INFORME: Escalon[] = [soloSellar];
