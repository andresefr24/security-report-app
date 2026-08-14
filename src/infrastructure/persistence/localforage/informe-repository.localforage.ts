// Adaptador localForage del InformeRepository.
//
// Cada informe se guarda bajo su id en la caja `informes`. Mismo patrón que los
// demás: re-valida al leer y descarta lo corrupto. Ojo con la cuota: los
// informes llevan fotos y firmas en base64, que ocupan; se vigila en el M5.

import localforage from "localforage";
import { crearInforme, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type Id } from "@/domain/shared/id";

export class LocalForageInformeRepository implements InformeRepository {
  private readonly caja: LocalForage;

  constructor() {
    this.caja = localforage.createInstance({
      name: "informes-seguridad",
      storeName: "informes",
    });
  }

  async guardar(informe: Informe): Promise<void> {
    await this.caja.setItem(informe.id, informe);
  }

  async obtenerPorId(id: Id): Promise<Informe | null> {
    const guardado = await this.caja.getItem<DatosInforme>(id);
    return guardado === null ? null : this.revalidar(guardado);
  }

  async listarPorProyecto(proyectoId: Id): Promise<Informe[]> {
    const informes: Informe[] = [];
    await this.caja.iterate<DatosInforme, void>((guardado) => {
      const informe = this.revalidar(guardado);
      if (informe && informe.proyectoId === proyectoId) informes.push(informe);
    });
    // Más recientes primero: la fecha/hora es texto AAAA-MM-DDTHH:mm y ordena bien.
    return informes.sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
  }

  async borrar(id: Id): Promise<void> {
    await this.caja.removeItem(id);
  }

  /** Re-valida lo leído: si está corrupto, devuelve null en vez de colarlo. */
  private revalidar(guardado: DatosInforme): Informe | null {
    const resultado = crearInforme(guardado);
    return resultado.ok ? resultado.valor : null;
  }
}
