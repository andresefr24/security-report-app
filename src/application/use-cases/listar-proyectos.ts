// Caso de uso ListarProyectos — "el coordinador ve sus obras".
//
// Es un "read model": solo lee. La pantalla necesita mostrar el NOMBRE del
// promotor de cada obra, pero la obra solo guarda su id (decisions#d5). Así que
// este caso de uso resuelve esa unión al leer: junta cada obra con su promotor.
// Eso es justo lo contrario a copiar los datos del promotor dentro de la obra —
// los datos siguen viviendo en un solo sitio, y se juntan solo para mostrarlos.

import { type Proyecto } from "@/domain/proyecto/proyecto";
import { type Promotor } from "@/domain/promotor/promotor";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";

/** Una obra con su promotor ya resuelto, lista para pintar en pantalla. */
export interface ObraConPromotor {
  proyecto: Proyecto;
  /** null si el promotor ya no está (dato huérfano): la pantalla debe avisar. */
  promotor: Promotor | null;
}

export class ListarProyectos {
  constructor(
    private readonly proyectos: ProyectoRepository,
    private readonly promotores: PromotorRepository,
  ) {}

  async ejecutar(): Promise<ObraConPromotor[]> {
    const [obras, promotores] = await Promise.all([
      this.proyectos.listar(),
      this.promotores.listar(),
    ]);

    // Un índice por id para no consultar el repositorio una vez por obra.
    const porId = new Map(promotores.map((promotor) => [promotor.id, promotor]));

    return obras.map((proyecto) => ({
      proyecto,
      promotor: porId.get(proyecto.promotorId) ?? null,
    }));
  }
}
