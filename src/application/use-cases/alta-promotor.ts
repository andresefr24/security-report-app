// Caso de uso AltaPromotor — "el coordinador registra un promotor nuevo".
//
// El promotor se da de alta ANTES de crear ninguna obra (decisions#d5), y luego
// se reutiliza en todas sus obras. Recibe el puerto por constructor: no sabe si
// por debajo hay localForage o un fake.

import { crearPromotor, type DatosPromotor, type Promotor } from "@/domain/promotor/promotor";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { type Result } from "@/domain/shared/result";

export class AltaPromotor {
  constructor(private readonly repositorio: PromotorRepository) {}

  /**
   * Valida los datos y, solo si son válidos, guarda el promotor nuevo (con su id
   * recién generado). Si no valen, NO toca el repositorio.
   */
  async ejecutar(datos: DatosPromotor): Promise<Result<Promotor>> {
    const resultado = crearPromotor(datos);
    if (!resultado.ok) {
      return resultado;
    }

    await this.repositorio.guardar(resultado.valor);
    return resultado;
  }
}
