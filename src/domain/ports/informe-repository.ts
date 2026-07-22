// Puerto InformeRepository — el contrato de persistencia de los informes.
//
// Como los de promotor y obra: hay muchos informes. Se guardan a menudo (el
// wizard autoguarda por paso), así que `guardar` sirve tanto para crear como
// para actualizar el borrador. `listarPorProyecto` da los informes de una obra.

import { type Informe } from "@/domain/informe/informe";
import { type Id } from "@/domain/shared/id";

export interface InformeRepository {
  /** Crea o actualiza el informe (mismo id = reemplaza). Es el autoguardado. */
  guardar(informe: Informe): Promise<void>;

  /** Devuelve el informe con ese id, o `null` si no existe. */
  obtenerPorId(id: Id): Promise<Informe | null>;

  /** Devuelve los informes de una obra. */
  listarPorProyecto(proyectoId: Id): Promise<Informe[]>;
}
