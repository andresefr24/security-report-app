// Adaptador localForage del InformeRepository.
//
// Cada informe se guarda bajo su id en la caja `informes`. Mismo patrón que los
// demás: re-valida al leer y descarta lo corrupto. Ojo con la cuota: los
// informes llevan fotos y firmas en base64, que ocupan; se vigila en el M5.

import localforage from "localforage";
import { crearInforme, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type Id } from "@/domain/shared/id";
import { migrar, sellar, type Guardado } from "@/infrastructure/persistence/migracion";
import { ESCALONES_INFORME } from "@/infrastructure/persistence/localforage/migraciones-informe";

export class LocalForageInformeRepository implements InformeRepository {
  private readonly caja: LocalForage;

  constructor() {
    this.caja = localforage.createInstance({
      name: "informes-seguridad",
      storeName: "informes",
    });
  }

  async guardar(informe: Informe): Promise<void> {
    // Todo lo que sale hacia el disco va sellado con la versión de hoy.
    await this.caja.setItem(informe.id, sellar(informe, ESCALONES_INFORME));
  }

  async obtenerPorId(id: Id): Promise<Informe | null> {
    const guardado = await this.caja.getItem<Guardado>(id);
    return guardado === null ? null : this.revalidar(guardado);
  }

  async listarPorProyecto(proyectoId: Id): Promise<Informe[]> {
    const informes: Informe[] = [];
    await this.caja.iterate<Guardado, void>((guardado) => {
      const informe = this.revalidar(guardado);
      if (informe && informe.proyectoId === proyectoId) informes.push(informe);
    });
    // Más recientes primero: la fecha/hora es texto AAAA-MM-DDTHH:mm y ordena bien.
    return informes.sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
  }

  async borrar(id: Id): Promise<void> {
    await this.caja.removeItem(id);
  }

  /**
   * MIGRAR y DESPUÉS validar, nunca al revés: así zod solo ve la forma de hoy y
   * jamás descarta un campo por venir con un nombre viejo. Los escalones están
   * en migraciones-informe.ts. Ver docs/nota-migracion-datos.md.
   */
  private revalidar(guardado: Guardado): Informe | null {
    // El doble paso por `unknown` es a propósito: lo que sale del disco es CRUDO
    // (puede ser cualquier cosa), y quien decide si vale es zod, dentro de
    // crearInforme. Fingir aquí que ya es un DatosInforme sería mentir.
    const alDia = migrar(guardado, ESCALONES_INFORME) as unknown as DatosInforme;
    const resultado = crearInforme(alDia);
    return resultado.ok ? resultado.valor : null;
  }
}
