// Result — cómo el dominio informa de éxito o de error sin lanzar excepciones.
//
// En vez de "reventar" con un throw cuando los datos no valen, una función del
// dominio devuelve un Result: o bien { ok: true, valor } o bien
// { ok: false, errores }. Quien llama (un caso de uso, un formulario) decide qué
// hacer con ello. Esto hace la lógica más fácil de testear y de mostrar en la UI.

export type Result<T> =
  | { ok: true; valor: T }
  | { ok: false; errores: string[] };

/** Envuelve un valor válido. */
export function exito<T>(valor: T): Result<T> {
  return { ok: true, valor };
}

/** Envuelve uno o varios mensajes de error. */
export function fallo<T>(errores: string[]): Result<T> {
  return { ok: false, errores };
}
