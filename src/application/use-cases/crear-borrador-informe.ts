// Caso de uso CrearBorradorInforme — "el coordinador empieza un informe de visita".
//
// Recibe los dos puertos: comprueba contra el repositorio de obras que la obra
// EXISTE antes de crear el borrador (misma idea que CrearProyecto con el
// promotor). Un informe colgando de una obra inexistente sería un dato roto.

import { crearBorrador, type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { fallo, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

export class CrearBorradorInforme {
  constructor(
    private readonly informes: InformeRepository,
    private readonly proyectos: ProyectoRepository,
  ) {}

  async ejecutar(proyectoId: Id): Promise<Result<Informe>> {
    const obra = await this.proyectos.obtenerPorId(proyectoId);
    if (!obra) {
      return fallo(["La obra de este informe ya no existe."]);
    }

    const resultado = crearBorrador({ proyectoId });
    if (!resultado.ok) {
      return resultado;
    }

    await this.informes.guardar(resultado.valor);
    return resultado;
  }
}
