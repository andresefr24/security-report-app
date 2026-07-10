// Caso de uso ConfigurarPerfil — la acción "el coordinador rellena/edita su perfil".
//
// Vive en application/: orquesta, no tiene reglas propias (esas están en el
// dominio) ni sabe de localForage (eso es infraestructura). Recibe el PUERTO por
// constructor (inyección de dependencias): en producción le llega el adaptador de
// localForage; en los tests, un fake en memoria. El caso de uso no nota la
// diferencia.

import {
  crearCoordinador,
  type Coordinador,
  type DatosCoordinador,
} from "@/domain/coordinador/coordinador";
import { type CoordinadorRepository } from "@/domain/ports/coordinador-repository";
import { type Result } from "@/domain/shared/result";

export class ConfigurarPerfil {
  constructor(private readonly repositorio: CoordinadorRepository) {}

  /**
   * Valida los datos con el dominio y, solo si son válidos, guarda el perfil.
   * Devuelve el Result para que la pantalla muestre los errores o confirme el
   * guardado. Si los datos no valen, NO toca el repositorio.
   */
  async ejecutar(datos: DatosCoordinador): Promise<Result<Coordinador>> {
    const resultado = crearCoordinador(datos);
    if (!resultado.ok) {
      return resultado;
    }

    await this.repositorio.guardar(resultado.valor);
    return resultado;
  }

  /**
   * Devuelve el perfil ya guardado, o null si aún no hay ninguno. La pantalla lo
   * usa al abrirse para rellenar el formulario (o dejarlo vacío la primera vez).
   */
  async cargar(): Promise<Coordinador | null> {
    return this.repositorio.obtener();
  }
}
