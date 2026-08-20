// Puerto ProyectoRepository — el contrato de persistencia de las obras.
//
// Como el de promotores (hay muchas obras), más una consulta propia:
// listarPorPromotor, que hará falta para saber si un promotor tiene obras
// (p. ej. antes de permitir borrarlo) y para ver las obras de un promotor.

import { type Proyecto } from "@/domain/proyecto/proyecto";
import { type Id } from "@/domain/shared/id";

export interface ProyectoRepository {
  /** Crea una obra o actualiza la que ya tenga ese id. */
  guardar(proyecto: Proyecto): Promise<void>;

  /** Devuelve la obra con ese id, o `null` si no existe. */
  obtenerPorId(id: Id): Promise<Proyecto | null>;

  /** Devuelve todas las obras. Lo necesita la pantalla de listado. */
  listar(): Promise<Proyecto[]>;

  /** Devuelve las obras de un promotor concreto. */
  listarPorPromotor(promotorId: Id): Promise<Proyecto[]>;

  /** Borra la obra con ese id. Si no existe, no pasa nada. */
  borrar(id: Id): Promise<void>;
}
