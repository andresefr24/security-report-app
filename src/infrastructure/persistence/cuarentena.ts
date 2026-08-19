// Cuarentena — dónde acaba lo que no se pudo leer, en vez de la basura.
//
// POR QUÉ (docs/nota-migracion-datos.md): hasta ahora, si una ficha guardada no
// superaba la validación al releerla, el adaptador devolvía `null` y la ficha
// desaparecía de la lista sin más. Con datos de mentira eso valía. Con los datos
// de Nicolás y Miren, no: una ficha de un usuario real que no sabemos leer es un
// BUG NUESTRO que hay que mirar, no basura que tirar.
//
// Así que se aparta: se guarda cruda en su propia caja, con el motivo y la fecha,
// y se avisa por consola. El dato sigue en el dispositivo y se puede recuperar
// cuando entendamos qué pasó. En la industria a esto se le llama "dead letter".
//
// Ojo: apartar NO es arreglar. La pantalla sigue sin poder mostrar esa ficha; lo
// que se evita es perderla en silencio.

import localforage from "localforage";
import { type Guardado } from "@/infrastructure/persistence/migracion";

/** Una ficha que no se pudo leer, tal y como estaba en el disco. */
export interface FichaApartada {
  /** De qué era: "obra", "informe"… Para saber dónde mirar. */
  agregado: string;
  /** Su clave en la caja original. */
  clave: string;
  /** Cuándo se apartó, en ISO. */
  apartadaEl: string;
  /** Por qué no validó, en el español llano que devuelve el dominio. */
  motivos: string[];
  /** La ficha cruda, sin tocar. Es lo que permite recuperarla. */
  cruda: Guardado;
}

export class Cuarentena {
  private readonly caja: LocalForage;

  constructor() {
    this.caja = localforage.createInstance({
      name: "informes-seguridad",
      storeName: "cuarentena",
    });
  }

  /** Aparta una ficha que no se pudo leer. Nunca lanza: no puede romper una lectura. */
  async apartar(
    agregado: string,
    clave: string,
    cruda: Guardado,
    motivos: string[],
  ): Promise<void> {
    const ficha: FichaApartada = {
      agregado,
      clave,
      apartadaEl: new Date().toISOString(),
      motivos,
      cruda,
    };
    try {
      await this.caja.setItem(`${agregado}:${clave}`, ficha);
      console.warn(
        `No se pudo leer ${agregado} "${clave}"; se aparta en cuarentena en vez de descartarla.`,
        motivos,
      );
    } catch (error) {
      // Si ni siquiera se puede apartar (cuota llena, por ejemplo), se avisa y
      // se sigue: una lectura no puede petar por esto.
      console.error("No se pudo apartar la ficha en cuarentena:", error);
    }
  }

  /** Todo lo apartado. De momento solo para diagnóstico. */
  async listar(): Promise<FichaApartada[]> {
    const fichas: FichaApartada[] = [];
    await this.caja.iterate<FichaApartada, void>((ficha) => {
      fichas.push(ficha);
    });
    return fichas;
  }

  /** Vacía la cuarentena. Para las pruebas y para cuando se arregle el problema. */
  async vaciar(): Promise<void> {
    await this.caja.clear();
  }
}

/** La cuarentena que usan los adaptadores. Una sola para toda la app. */
export const cuarentena = new Cuarentena();
