// Puerto CoordinadorRepository — el contrato de persistencia del perfil.
//
// Un "puerto" es una interfaz que el dominio PIDE pero no implementa. Aquí se
// declara QUÉ hace falta (guardar y recuperar el perfil del coordinador), no CÓMO.
// El "cómo" vive en infrastructure/ (adaptador con localForage) y en los tests
// como un fake en memoria. Si mañana cambiáramos a una API en la nube, solo
// cambiaría el adaptador; este contrato y el dominio no se tocan.

import { type Coordinador } from "@/domain/coordinador/coordinador";

export interface CoordinadorRepository {
  /** Guarda (o reemplaza) el perfil único del coordinador en el dispositivo. */
  guardar(coordinador: Coordinador): Promise<void>;

  /**
   * Devuelve el perfil guardado, o `null` si aún no hay ninguno.
   * La primera vez que se abre la app no hay perfil: ese `null` no es un error,
   * es la señal de que toca mostrar el formulario vacío.
   */
  obtener(): Promise<Coordinador | null>;
}
