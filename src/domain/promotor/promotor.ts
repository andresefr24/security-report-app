// Entidad Promotor — el cliente y dueño de la obra.
//
// Es quien encarga la obra y el destinatario principal de cada informe. NO firma
// y NO es usuario del sistema en la fase 1: solo recibe.
//
// Entidad de primer nivel (decisions#d5): el coordinador da de alta promotores
// ANTES de crear ninguna obra, y un promotor tiene muchas obras. La obra lo
// referencia por `id`, nunca copiando sus datos.
//
// Reglas puras: la única dependencia externa es zod (ver README de domain/).

import { exito, fallo, type Result } from "@/domain/shared/result";
import { idONuevo, type Id } from "@/domain/shared/id";
import { esquemaPromotor } from "@/domain/promotor/esquema-promotor";

/** Persona de contacto del promotor. Provisional: de momento, una sola. */
export interface ContactoPromotor {
  persona?: string;
  correo?: string;
  telefono?: string;
}

/**
 * Forma de los datos de un promotor.
 *
 * El `id` es opcional aquí: al dar de alta uno nuevo no se pasa y lo genera
 * `crearPromotor`; al editar uno existente se pasa el suyo.
 */
export interface DatosPromotor {
  id?: Id;
  /** Empresa u organismo dueño de la obra (ej. "Canal de Isabel II"). */
  nombreRazonSocial: string;
  /** Datos fiscales. Provisional: NIF/CIF. */
  nif?: string;
  contacto?: ContactoPromotor;
}

/**
 * Un Promotor ya validado. Solo se obtiene a través de `crearPromotor`, así que
 * si tienes uno en la mano, sus invariantes se cumplen y su `id` existe.
 */
export interface Promotor extends Omit<DatosPromotor, "id"> {
  readonly id: Id;
  readonly _valido: true;
}

/**
 * Puerta de entrada del agregado: valida con el esquema y, si todo pasa, devuelve
 * un Promotor válido con su id (generado si no venía). Si algo falla, devuelve la
 * lista de mensajes en español para que la UI los muestre bajo cada campo.
 */
export function crearPromotor(datos: DatosPromotor): Result<Promotor> {
  const analisis = esquemaPromotor.safeParse(datos);
  if (!analisis.success) {
    return fallo(analisis.error.issues.map((problema) => problema.message));
  }

  return exito({
    ...analisis.data,
    id: idONuevo(analisis.data.id),
    _valido: true,
  });
}
