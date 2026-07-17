// Adaptador localForage del ProyectoRepository.
//
// Cada obra se guarda bajo su id en la caja `proyectos`. Mismo patrón que el
// adaptador de promotores: re-valida al leer y descarta lo corrupto.

import localforage from "localforage";
import {
  crearProyecto,
  type DatosProyecto,
  type Proyecto,
} from "@/domain/proyecto/proyecto";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type Id } from "@/domain/shared/id";

export class LocalForageProyectoRepository implements ProyectoRepository {
  private readonly caja: LocalForage;

  constructor() {
    this.caja = localforage.createInstance({
      name: "informes-seguridad",
      storeName: "proyectos",
    });
  }

  async guardar(proyecto: Proyecto): Promise<void> {
    await this.caja.setItem(proyecto.id, proyecto);
  }

  async obtenerPorId(id: Id): Promise<Proyecto | null> {
    const guardado = await this.caja.getItem<DatosProyecto>(id);
    return guardado === null ? null : this.revalidar(guardado);
  }

  async listar(): Promise<Proyecto[]> {
    const proyectos: Proyecto[] = [];
    await this.caja.iterate<DatosProyecto, void>((guardado) => {
      const proyecto = this.revalidar(guardado);
      if (proyecto) proyectos.push(proyecto);
    });
    // Orden estable y útil para la pantalla: por código de obra.
    return proyectos.sort((a, b) => a.codigoObra.localeCompare(b.codigoObra, "es"));
  }

  async listarPorPromotor(promotorId: Id): Promise<Proyecto[]> {
    const todas = await this.listar();
    return todas.filter((proyecto) => proyecto.promotorId === promotorId);
  }

  /** Re-valida lo leído: si está corrupto, devuelve null en vez de colarlo. */
  private revalidar(guardado: DatosProyecto): Proyecto | null {
    const resultado = crearProyecto(guardado);
    return resultado.ok ? resultado.valor : null;
  }
}
