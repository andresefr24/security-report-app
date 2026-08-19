// Los escalones del PROMOTOR: cómo subir una ficha guardada hasta la forma de hoy.
//
// Mismo criterio que en la obra y el informe: el orden manda y los escalones
// pasados no se tocan nunca. Ver docs/nota-migracion-datos.md.

import { type Escalon } from "@/infrastructure/persistence/migracion";

/**
 * v0 → v1 · Solo el sello.
 *
 * El promotor no ha cambiado de forma, así que no hay nada que transformar. El
 * escalón existe igualmente para que TODO lo que se persiste pase por el mismo
 * embudo (sellar, migrar y cuarentena): dejar dos regímenes conviviendo es justo
 * lo que se nos olvidaría el día que este sí cambie.
 */
const soloSellar: Escalon = (guardado) => guardado;

export const ESCALONES_PROMOTOR: Escalon[] = [soloSellar];
