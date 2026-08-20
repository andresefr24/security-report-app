// Caso de uso BorrarProyecto — quitar una obra de la lista.
//
// Hace falta porque una obra creada por error se quedaba ahí para siempre,
// ensuciando la pantalla principal.
//
// La obra se borra CON SUS INFORMES. La primera versión se negaba si tenía
// alguno, para proteger la evidencia de las visitas, pero dejaba al coordinador
// encerrado: no había forma de quitar una obra que ya se hubiera usado.
//
// Quien avisa es la pantalla, que dice cuántos informes se van a borrar con
// ella antes de pedir la confirmación. Aquí solo se cuenta y se hace.

import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { exito, fallo, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

export class BorrarProyecto {
  constructor(
    private readonly proyectos: ProyectoRepository,
    private readonly informes: InformeRepository,
  ) {}

  /** Cuántos informes se van a borrar con la obra. Lo usa el aviso de la pantalla. */
  async cuantosInformes(id: Id): Promise<number> {
    return (await this.informes.listarPorProyecto(id)).length;
  }

  async ejecutar(id: Id): Promise<Result<void>> {
    const proyecto = await this.proyectos.obtenerPorId(id);
    if (!proyecto) {
      return fallo(["Esta obra ya no existe."]);
    }

    // Primero los informes: si algo fallara a mitad, es mejor quedarse con la
    // obra vacía que con informes huérfanos que no se ven desde ninguna parte.
    const informes = await this.informes.listarPorProyecto(id);
    for (const informe of informes) {
      await this.informes.borrar(informe.id);
    }

    await this.proyectos.borrar(id);
    return exito(undefined);
  }
}
