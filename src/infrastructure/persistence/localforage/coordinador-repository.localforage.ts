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
    // localForage guarda el objeto tal cual, incluida la firma (texto dataURL).
    await this.caja.setItem(CLAVE_PERFIL, coordinador);
  }

  async obtener(): Promise<Coordinador | null> {
    const guardado = await this.caja.getItem<DatosCoordinador>(CLAVE_PERFIL);
    if (guardado === null) {
      // Primera apertura: aún no hay perfil. No es un error.
      return null;
    }

    // Re-validamos lo leído antes de devolverlo hacia el dominio. Si los datos
    // guardados estuvieran corruptos o fueran de una versión vieja, no colamos un
    // Coordinador inválido: devolvemos null (= "no hay perfil válido").
    const resultado = crearCoordinador(guardado);
    return resultado.ok ? resultado.valor : null;
  }
}
