// Caso de uso ListarInformes — "los informes de esta obra".
//
// Es lo que permite RETOMAR un borrador: la pantalla de obras muestra los
// informes de cada obra y desde ahí se entra al que estaba a medias, en vez de
// crear siempre uno nuevo. Es solo lectura.

import { type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type Id } from "@/domain/shared/id";

export class ListarInformes {
  constructor(private readonly informes: InformeRepository) {}

  /** Informes de una obra, del más reciente al más antiguo (los ordena el repositorio). */
  async ejecutar(proyectoId: Id): Promise<Informe[]> {
    return this.informes.listarPorProyecto(proyectoId);
  }
}
