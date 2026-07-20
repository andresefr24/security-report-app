// Puerto PromotorRepository — el contrato de persistencia de los promotores.
//
// Diferencia con CoordinadorRepository: del coordinador hay UN perfil, así que
// bastaba guardar/obtener. De promotores hay MUCHOS, así que el contrato necesita
// buscarlos por id y listarlos todos.
//
// Como todo puerto: declara QUÉ hace falta, no CÓMO. Lo implementan el adaptador
// de localForage (infrastructure/) y un fake en memoria (tests).

import { type Promotor } from "@/domain/promotor/promotor";
import { type Id } from "@/domain/shared/id";

export interface PromotorRepository {
  /** Da de alta un promotor o actualiza el que ya tenga ese id. */
  guardar(promotor: Promotor): Promise<void>;

  /** Devuelve el promotor con ese id, o `null` si no existe. */
  obtenerPorId(id: Id): Promise<Promotor | null>;

  /**
   * Devuelve todos los promotores registrados. Lo necesitan la pantalla de
   * listado y el selector de promotor del alta de obra.
   */
  listar(): Promise<Promotor[]>;
}
