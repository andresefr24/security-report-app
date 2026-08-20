// Caso de uso BorrarInforme — tirar un borrador que no sirve.
//
// Hace falta porque los borradores se crean solos al pulsar "Nuevo informe": si
// el coordinador abre uno por error, se le queda ahí para siempre ocupando la
// lista de la obra.
//
// SE BORRA CUALQUIERA, también los finalizados. La primera versión solo dejaba
// borrar borradores, para proteger la evidencia de la visita... y montó una
// trampa sin salida: un informe cerrado no se podía quitar, y como la obra no se
// puede borrar con informes dentro, la obra tampoco. Los datos son suyos y están
// en su dispositivo; la app no puede dejarles encerrados.
//
// La protección se mueve a donde sirve: la pantalla avisa de que un informe
// cerrado es la evidencia de una visita y pide confirmarlo aparte.

import { type InformeRepository } from "@/domain/ports/informe-repository";
import { exito, fallo, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

export class BorrarInforme {
  constructor(private readonly informes: InformeRepository) {}

  async ejecutar(id: Id): Promise<Result<void>> {
    const informe = await this.informes.obtenerPorId(id);
    if (!informe) {
      return fallo(["Este informe ya no existe."]);
    }

    await this.informes.borrar(id);
    return exito(undefined);
  }
}
