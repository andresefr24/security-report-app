// Caso de uso BorrarProyecto — quitar una obra de la lista.
//
// Hace falta porque una obra creada por error se quedaba ahí para siempre,
// ensuciando la pantalla principal.
//
// REGLA: solo se borra una obra que NO tenga informes. Los informes son la
// evidencia de las visitas ([[legal-context]]): borrar la obra y llevárselos por
// delante en el mismo gesto sería demasiado fácil de hacer sin querer. Si de
// verdad quiere deshacerse de todo, primero borra los borradores desde la propia
// obra; y si hay informes cerrados, eso ya es una conversación aparte.

import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { exito, fallo, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

export class BorrarProyecto {
  constructor(
    private readonly proyectos: ProyectoRepository,
    private readonly informes: InformeRepository,
  ) {}

  async ejecutar(id: Id): Promise<Result<void>> {
    const proyecto = await this.proyectos.obtenerPorId(id);
    if (!proyecto) {
      return fallo(["Esta obra ya no existe."]);
    }

    const informes = await this.informes.listarPorProyecto(id);
    if (informes.length > 0) {
      return fallo([
        informes.length === 1
          ? "Esta obra tiene un informe. Bórralo primero si quieres quitar la obra."
          : `Esta obra tiene ${informes.length} informes. Bórralos primero si quieres quitar la obra.`,
      ]);
    }

    await this.proyectos.borrar(id);
    return exito(undefined);
  }
}
