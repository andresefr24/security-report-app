// Id — identificador de las entidades que tienen muchos ejemplares.
//
// El Coordinador no lo necesita (solo hay un perfil), pero de Promotor y Proyecto
// hay muchos y hay que poder referenciarlos: un Proyecto guarda el `promotorId`
// de su Promotor, nunca una copia de sus datos (decisions#d5, tasks M2).

export type Id = string;

/**
 * Genera un identificador único.
 *
 * OJO: `crypto.randomUUID()` solo existe en **contextos seguros** (https o
 * localhost). Al probar la app desde el móvil por `http://<ip-de-la-mac>` NO
 * está disponible, y sin respaldo dar de alta un promotor reventaría en el
 * iPhone. Como estos ids son locales, no necesitan fuerza criptográfica: un
 * respaldo con la hora + azar es de sobra.
 */
export function nuevoId(): Id {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
