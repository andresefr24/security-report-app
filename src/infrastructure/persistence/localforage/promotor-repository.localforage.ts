// Adaptador localForage del PromotorRepository.
//
// Implementa el puerto del dominio guardando en IndexedDB. A diferencia del
// coordinador (una clave fija, perfil único), aquí cada promotor se guarda bajo
// SU id dentro de la caja `promotores`, para poder buscarlo y listarlos todos.

import localforage from "localforage";
import {
  crearPromotor,
  type DatosPromotor,
  type Promotor,
} from "@/domain/promotor/promotor";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { type Id } from "@/domain/shared/id";

export class LocalForagePromotorRepository implements PromotorRepository {
  private readonly caja: LocalForage;

  constructor() {
    this.caja = localforage.createInstance({
      name: "informes-seguridad",
      storeName: "promotores",
    });
  }

  async guardar(promotor: Promotor): Promise<void> {
    // La clave es el id: guardar con el mismo id reemplaza (editar).
    await this.caja.setItem(promotor.id, promotor);
  }

  async obtenerPorId(id: Id): Promise<Promotor | null> {
    const guardado = await this.caja.getItem<DatosPromotor>(id);
    return guardado === null ? null : this.revalidar(guardado);
  }

  async listar(): Promise<Promotor[]> {
    const promotores: Promotor[] = [];
    // iterate recorre toda la caja; descartamos lo que no supere la validación.
    await this.caja.iterate<DatosPromotor, void>((guardado) => {
      const promotor = this.revalidar(guardado);
      if (promotor) promotores.push(promotor);
    });
    // Orden estable y útil para la pantalla: alfabético por razón social.
    return promotores.sort((a, b) =>
      a.nombreRazonSocial.localeCompare(b.nombreRazonSocial, "es"),
    );
  }

  /**
   * Re-valida lo leído antes de devolverlo al dominio: si los datos guardados
   * estuvieran corruptos o fueran de una versión vieja, devolvemos null en vez
   * de colar un Promotor inválido hacia dentro.
   */
  private revalidar(guardado: DatosPromotor): Promotor | null {
    const resultado = crearPromotor(guardado);
    return resultado.ok ? resultado.valor : null;
  }
}
