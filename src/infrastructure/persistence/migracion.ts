// Versionado y migración de lo que hay guardado en el dispositivo.
//
// POR QUÉ EXISTE ESTO (docs/nota-migracion-datos.md): los adaptadores re-validan
// contra el esquema de HOY lo que leen del disco. Mientras no hubo datos reales
// eso era gratis; desde que Nicolás y Miren usan la app, cambiar la forma de una
// ficha puede hacer que un dato que ELLOS escribieron aparezca en blanco, porque
// zod no reconoce el nombre viejo y lo descarta sin decir nada.
//
// La regla, entonces, es: al leer se MIGRA primero y se valida después, para que
// zod solo vea la forma actual.
//
// Cómo funciona, en una frase: cada ficha lleva un sello (`schemaVersion`) que
// dice de qué época es; los ESCALONES son funciones puras que la suben de una
// versión a la siguiente, y se aplican en cadena hasta dejarla en la de hoy.
//
// Es migración PEREZOSA: se migra al leer cada ficha, no de golpe al arrancar la
// app. Con un puñado de informes por coordinador no hace falta más, y así todo
// queda dentro del adaptador, invisible para el dominio y para las pantallas.

/** Una ficha tal y como está en disco: aún sin validar, quizá con su sello. */
export type Guardado = Record<string, unknown> & { schemaVersion?: number };

/**
 * Un escalón sube la ficha UNA versión. Su posición en el array manda: el
 * primero lleva de la v0 a la v1, el segundo de la v1 a la v2, y así.
 *
 * Tiene que ser una función PURA y pequeña: recibe la ficha y devuelve la ficha
 * transformada, sin tocar nada de fuera. Así se puede probar sola.
 */
export type Escalon = (guardado: Guardado) => Guardado;

/**
 * Lo que se guardó antes de que existiera el sello vale como versión 0. Es la
 * línea base: todo lo que hay hoy en los móviles de los coordinadores.
 */
export const SIN_SELLO = 0;

/** De qué época es una ficha. Sin sello, es de la línea base. */
export function versionDe(guardado: Guardado): number {
  return typeof guardado.schemaVersion === "number" ? guardado.schemaVersion : SIN_SELLO;
}

/** La versión de hoy: tantas como escalones haya definidos. */
export function versionActual(escalones: Escalon[]): number {
  return escalones.length;
}

/**
 * Sube la ficha hasta la versión de hoy y la deja sellada.
 *
 * La migración la dispara la VERSIÓN, nunca la validación: preguntamos "¿de qué
 * época es?" y de ahí sabemos qué escalones le faltan. Mirar si "cumple el
 * contrato nuevo" no valdría, porque una ficha vieja podría colar por casualidad.
 *
 * Si la ficha viene de una versión más NUEVA que la nuestra (un dispositivo con
 * la app más actualizada), no se toca: no sabemos deshacer el futuro, así que se
 * devuelve tal cual y que decida la validación.
 */
export function migrar(guardado: Guardado, escalones: Escalon[]): Guardado {
  const desde = versionDe(guardado);
  if (desde >= escalones.length) return guardado;

  let ficha = guardado;
  for (let version = desde; version < escalones.length; version++) {
    ficha = escalones[version](ficha);
  }
  return { ...ficha, schemaVersion: escalones.length };
}

/**
 * Pone el sello de la versión de hoy a lo que se va a guardar. Todo lo que sale
 * de la app hacia el disco pasa por aquí, para que nunca se escriba sin sellar.
 */
export function sellar<T extends object>(datos: T, escalones: Escalon[]): T & Guardado {
  return { ...datos, schemaVersion: versionActual(escalones) };
}
