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
import { type Result } from "@/domain/shared/result";
import { migrar, sellar, type Guardado } from "@/infrastructure/persistence/migracion";
import { ESCALONES_PROYECTO } from "@/infrastructure/persistence/localforage/migraciones-proyecto";
import { cuarentena } from "@/infrastructure/persistence/cuarentena";

export class LocalForageProyectoRepository implements ProyectoRepository {
  private readonly caja: LocalForage;

  constructor() {
    this.caja = localforage.createInstance({
      name: "informes-seguridad",
      storeName: "proyectos",
    });
  }

  async guardar(proyecto: Proyecto): Promise<void> {
    // Todo lo que sale hacia el disco va sellado con la versión de hoy.
    await this.caja.setItem(proyecto.id, sellar(proyecto, ESCALONES_PROYECTO));
  }

  async obtenerPorId(id: Id): Promise<Proyecto | null> {
    const guardado = await this.caja.getItem<Guardado>(id);
    if (guardado === null) return null;

    const resultado = this.revalidar(guardado);
    if (resultado.ok) return resultado.valor;

    await cuarentena.apartar("obra", id, guardado, resultado.errores);
    return null;
  }

  async listar(): Promise<Proyecto[]> {
    const proyectos: Proyecto[] = [];
    const ilegibles: { clave: string; guardado: Guardado; motivos: string[] }[] = [];

    await this.caja.iterate<Guardado, void>((guardado, clave) => {
      const resultado = this.revalidar(guardado);
      if (resultado.ok) proyectos.push(resultado.valor);
      else ilegibles.push({ clave, guardado, motivos: resultado.errores });
    });

    // Apartar es asíncrono y `iterate` no espera promesas, así que se recogen
    // durante el recorrido y se apartan después, ya fuera del bucle.
    await Promise.all(
      ilegibles.map((f) => cuarentena.apartar("obra", f.clave, f.guardado, f.motivos)),
    );

    // Orden estable y útil para la pantalla: por código de obra.
    return proyectos.sort((a, b) => a.codigoObra.localeCompare(b.codigoObra, "es"));
  }

  async listarPorPromotor(promotorId: Id): Promise<Proyecto[]> {
    const todas = await this.listar();
    return todas.filter((proyecto) => proyecto.promotorId === promotorId);
  }

  /**
   * MIGRAR y DESPUÉS validar, nunca al revés: así zod solo ve la forma de hoy y
   * jamás descarta un campo por venir con un nombre viejo. Los escalones están
   * en migraciones-proyecto.ts. Ver docs/nota-migracion-datos.md.
   */
  private revalidar(guardado: Guardado): Result<Proyecto> {
    // El doble paso por `unknown` es a propósito: lo que sale del disco es CRUDO
    // (puede ser cualquier cosa), y quien decide si vale es zod, dentro de
    // crearProyecto. Fingir aquí que ya es un DatosProyecto sería mentir.
    const alDia = migrar(guardado, ESCALONES_PROYECTO) as unknown as DatosProyecto;
    return crearProyecto(alDia);
  }
}
