// Caso de uso BorrarInforme — tirar un borrador que no sirve.
//
// Hace falta porque los borradores se crean solos al pulsar "Nuevo informe": si
// el coordinador abre uno por error, se le queda ahí para siempre ocupando la
// lista de la obra.
//
// REGLA: solo se borran los BORRADORES. Un informe finalizado está firmado y es
// evidencia legal de la visita ([[legal-context]]); retirarlo no puede ser un
// toque de más en una lista. Si algún día hace falta, será una decisión aparte y
// con su propio aviso.

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

    if (informe.estado === "finalizado") {
      return fallo(["Un informe cerrado y firmado no se puede borrar."]);
    }

    await this.informes.borrar(id);
    return exito(undefined);
  }
}
