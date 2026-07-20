// Caso de uso EditarPromotor — "el coordinador corrige los datos de un promotor".
//
// Se diferencia del alta en una regla real: aquí el promotor TIENE que existir ya.
// Si no comprobáramos su existencia, "editar" con un id inventado acabaría dando
// de alta un promotor por la puerta de atrás.

import { crearPromotor, type DatosPromotor, type Promotor } from "@/domain/promotor/promotor";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { fallo, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

export class EditarPromotor {
  constructor(private readonly repositorio: PromotorRepository) {}

  /** Devuelve el promotor a editar, o null si no existe (para rellenar el formulario). */
  async cargar(id: Id): Promise<Promotor | null> {
    return this.repositorio.obtenerPorId(id);
  }

  /**
   * Actualiza un promotor existente. Falla si no se indica el id o si ese
   * promotor no está registrado.
   */
  async ejecutar(datos: DatosPromotor & { id: Id }): Promise<Result<Promotor>> {
    const existente = await this.repositorio.obtenerPorId(datos.id);
    if (!existente) {
      return fallo(["Ese promotor ya no existe. Puede que se haya borrado."]);
    }

    const resultado = crearPromotor(datos);
    if (!resultado.ok) {
      return resultado;
    }

    await this.repositorio.guardar(resultado.valor);
    return resultado;
  }
}
