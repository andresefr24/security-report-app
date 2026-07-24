// Caso de uso FinalizarInforme — "cerrar el informe".
//
// Es el paso que el M3 dejó aplazado: hasta ahora todo quedaba en borrador. Aquí
// se comprueba que el informe está completo (regla del dominio) y solo entonces
// pasa a `finalizado`, que es el estado con el que se genera el PDF y se comparte.
//
// Si falta algo, devuelve la lista en español llano para que la pantalla la
// muestre, y NO toca el informe guardado.

import { crearInforme, type Informe } from "@/domain/informe/informe";
import { loQueFaltaParaFinalizar } from "@/domain/informe/completitud";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { fallo, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

export class FinalizarInforme {
  constructor(private readonly informes: InformeRepository) {}

  async ejecutar(id: Id): Promise<Result<Informe>> {
    const informe = await this.informes.obtenerPorId(id);
    if (!informe) {
      return fallo(["Este informe ya no existe."]);
    }

    const falta = loQueFaltaParaFinalizar(informe);
    if (falta.length > 0) {
      return fallo(falta);
    }

    const resultado = crearInforme({ ...informe, estado: "finalizado" });
    if (!resultado.ok) {
      return resultado;
    }

    await this.informes.guardar(resultado.valor);
    return resultado;
  }
}
