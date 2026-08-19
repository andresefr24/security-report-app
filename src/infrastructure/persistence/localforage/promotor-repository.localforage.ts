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
import { type Result } from "@/domain/shared/result";
import { migrar, sellar, type Guardado } from "@/infrastructure/persistence/migracion";
import { ESCALONES_PROMOTOR } from "@/infrastructure/persistence/localforage/migraciones-promotor";
import { cuarentena } from "@/infrastructure/persistence/cuarentena";

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
    await this.caja.setItem(promotor.id, sellar(promotor, ESCALONES_PROMOTOR));
  }

  async obtenerPorId(id: Id): Promise<Promotor | null> {
    const guardado = await this.caja.getItem<Guardado>(id);
    if (guardado === null) return null;

    const resultado = this.revalidar(guardado);
    if (resultado.ok) return resultado.valor;

    await cuarentena.apartar("promotor", id, guardado, resultado.errores);
    return null;
  }

  async listar(): Promise<Promotor[]> {
    const promotores: Promotor[] = [];
    const ilegibles: { clave: string; guardado: Guardado; motivos: string[] }[] = [];

    await this.caja.iterate<Guardado, void>((guardado, clave) => {
      const resultado = this.revalidar(guardado);
      if (resultado.ok) promotores.push(resultado.valor);
      else ilegibles.push({ clave, guardado, motivos: resultado.errores });
    });

    // `iterate` no espera promesas: se apartan después, fuera del bucle.
    await Promise.all(
      ilegibles.map((f) => cuarentena.apartar("promotor", f.clave, f.guardado, f.motivos)),
    );
    // Orden estable y útil para la pantalla: alfabético por razón social.
    return promotores.sort((a, b) =>
      a.nombreRazonSocial.localeCompare(b.nombreRazonSocial, "es"),
    );
  }

  /**
   * MIGRAR y DESPUÉS validar, como en los demás adaptadores. El promotor no ha
   * cambiado de forma todavía, pero pasa por el mismo embudo para no dejar dos
   * regímenes conviviendo. Ver docs/nota-migracion-datos.md.
   */
  private revalidar(guardado: Guardado): Result<Promotor> {
    const alDia = migrar(guardado, ESCALONES_PROMOTOR) as unknown as DatosPromotor;
    return crearPromotor(alDia);
  }
}
