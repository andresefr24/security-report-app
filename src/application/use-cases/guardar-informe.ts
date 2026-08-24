// Caso de uso GuardarInforme — el autoguardado del wizard.
//
// Cada paso, al completarse, manda el informe entero (con lo nuevo) para
// persistirlo. Valida con crearInforme y guarda. Como el informe es un borrador,
// se guarda aunque esté incompleto: esa es justo la gracia (no perder trabajo).
//
// Si el disco falla, se devuelve como un fallo normal en vez de dejar que la
// excepción se pierda: el asistente lo pinta y el coordinador se entera.

import { crearInforme, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { fallo, type Result } from "@/domain/shared/result";

export class GuardarInforme {
  constructor(private readonly informes: InformeRepository) {}

  async ejecutar(datos: DatosInforme): Promise<Result<Informe>> {
    const resultado = crearInforme(datos);
    if (!resultado.ok) {
      return resultado;
    }

    try {
      await this.informes.guardar(resultado.valor);
    } catch (error) {
      // Guardar puede fallar de verdad: un informe con varias fotos ocupa
      // megas y el dispositivo puede quedarse sin espacio. Hasta ahora la
      // excepción se perdía por el camino, el asistente no avanzaba y no salía
      // ningún aviso: el coordinador veía que "no pasa nada" y perdía el
      // trabajo. Mejor decirlo.
      console.error("No se pudo guardar el informe:", error);
      return fallo([
        "No se pudo guardar el informe. Puede que no quede espacio en el dispositivo; " +
          "prueba a borrar algún borrador viejo o alguna foto.",
      ]);
    }
    return resultado;
  }
}
