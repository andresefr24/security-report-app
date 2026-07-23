// Caso de uso ObtenerInforme — "retomar un informe donde lo dejé".
//
// El wizard lo usa al abrir un borrador para rellenar los pasos con lo ya
// guardado. Es solo lectura.

import { type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type Id } from "@/domain/shared/id";

export class ObtenerInforme {
  constructor(private readonly informes: InformeRepository) {}

  async ejecutar(id: Id): Promise<Informe | null> {
    return this.informes.obtenerPorId(id);
  }
}
