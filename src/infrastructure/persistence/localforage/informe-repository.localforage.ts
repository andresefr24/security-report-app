// Adaptador localForage del InformeRepository.
//
// Cada informe se guarda bajo su id en la caja `informes`. Mismo patrón que los
// demás: re-valida al leer y descarta lo corrupto. Ojo con la cuota: los
// informes llevan fotos y firmas en base64, que ocupan; se vigila en el M5.

import localforage from "localforage";
import { crearInforme, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type Id } from "@/domain/shared/id";
import { type Result } from "@/domain/shared/result";
import { migrar, sellar, type Guardado } from "@/infrastructure/persistence/migracion";
import { ESCALONES_INFORME } from "@/infrastructure/persistence/localforage/migraciones-informe";
import { cuarentena } from "@/infrastructure/persistence/cuarentena";

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
    if (guardado === null) return null;

    const resultado = this.revalidar(guardado);
    if (resultado.ok) return resultado.valor;

    await cuarentena.apartar("informe", id, guardado, resultado.errores);
    return null;
  }

  async listarPorProyecto(proyectoId: Id): Promise<Informe[]> {
    const informes: Informe[] = [];
    const ilegibles: { clave: string; guardado: Guardado; motivos: string[] }[] = [];

    await this.caja.iterate<Guardado, void>((guardado, clave) => {
      const resultado = this.revalidar(guardado);
      if (resultado.ok) {
        if (resultado.valor.proyectoId === proyectoId) informes.push(resultado.valor);
      } else {
        ilegibles.push({ clave, guardado, motivos: resultado.errores });
      }
    });

    // Apartar es asíncrono y `iterate` no espera promesas, así que se recogen
    // durante el recorrido y se apartan después, ya fuera del bucle.
    await Promise.all(
      ilegibles.map((f) => cuarentena.apartar("informe", f.clave, f.guardado, f.motivos)),
    );

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
  private revalidar(guardado: Guardado): Result<Informe> {
    // El doble paso por `unknown` es a propósito: lo que sale del disco es CRUDO
    // (puede ser cualquier cosa), y quien decide si vale es zod, dentro de
    // crearInforme. Fingir aquí que ya es un DatosInforme sería mentir.
    const alDia = migrar(guardado, ESCALONES_INFORME) as unknown as DatosInforme;
    return crearInforme(alDia);
  }
}
