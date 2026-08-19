// Adaptador localForage del CoordinadorRepository.
//
// Implementa el puerto del dominio (domain/ports) usando localForage, que guarda
// datos en IndexedDB (el almacén del navegador). Es la primera pieza de
// infrastructure/: aquí SÍ sabemos que existe localForage; el dominio no.
//
// El perfil del coordinador es único en el dispositivo, así que lo guardamos bajo
// una clave fija dentro de su propia "caja".

import localforage from "localforage";
import {
  crearCoordinador,
  type Coordinador,
  type DatosCoordinador,
} from "@/domain/coordinador/coordinador";
import { type CoordinadorRepository } from "@/domain/ports/coordinador-repository";
import { migrar, sellar, type Guardado } from "@/infrastructure/persistence/migracion";
import { ESCALONES_COORDINADOR } from "@/infrastructure/persistence/localforage/migraciones-coordinador";
import { cuarentena } from "@/infrastructure/persistence/cuarentena";

// Clave única: solo hay un perfil, así que siempre se guarda/lee en el mismo sitio.
const CLAVE_PERFIL = "perfil";

export class LocalForageCoordinadorRepository implements CoordinadorRepository {
  private readonly caja: LocalForage;

  constructor() {
    // Una "caja" (store) propia para el coordinador. Si mañana hay más colecciones
    // (promotores, obras…), cada una tendrá la suya y no se pisan.
    this.caja = localforage.createInstance({
      name: "informes-seguridad",
      storeName: "coordinador",
    });
  }

  async guardar(coordinador: Coordinador): Promise<void> {
    // localForage guarda el objeto tal cual, incluida la firma (texto dataURL),
    // sellado con la versión de hoy.
    await this.caja.setItem(CLAVE_PERFIL, sellar(coordinador, ESCALONES_COORDINADOR));
  }

  async obtener(): Promise<Coordinador | null> {
    const guardado = await this.caja.getItem<Guardado>(CLAVE_PERFIL);
    if (guardado === null) {
      // Primera apertura: aún no hay perfil. No es un error.
      return null;
    }

    // Migrar y DESPUÉS validar, como en los demás adaptadores. Si el perfil
    // guardado no vale ni migrándolo, no colamos un Coordinador inválido hacia
    // dentro: se aparta en cuarentena y decimos "no hay perfil válido".
    const alDia = migrar(guardado, ESCALONES_COORDINADOR) as unknown as DatosCoordinador;
    const resultado = crearCoordinador(alDia);
    if (resultado.ok) return resultado.valor;

    await cuarentena.apartar("coordinador", CLAVE_PERFIL, guardado, resultado.errores);
    return null;
  }
}
