// Caso de uso GuardarInforme — el autoguardado del wizard.
//
// Cada paso, al completarse, manda el informe entero (con lo nuevo) para
// persistirlo. Valida con crearInforme y guarda. Como el informe es un borrador,
// se guarda aunque esté incompleto: esa es justo la gracia (no perder trabajo).

import { crearInforme, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type Result } from "@/domain/shared/result";

export class GuardarInforme {
  constructor(private readonly informes: InformeRepository) {}

  async ejecutar(datos: DatosInforme): Promise<Result<Informe>> {
    const resultado = crearInforme(datos);
    if (!resultado.ok) {
      return resultado;
    }

    await this.informes.guardar(resultado.valor);
    return resultado;
  }
}
