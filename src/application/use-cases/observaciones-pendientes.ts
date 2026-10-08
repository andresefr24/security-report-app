// Caso de uso ObservacionesPendientes — "qué quedó sin resolver la última visita".
//
// Existe porque las obras no se arreglan de un día para otro: lo que se señala
// un lunes sigue ahí el lunes siguiente, y en sus informes de verdad lo vuelven
// a escribir con su antigüedad ("señalada en el informe de visita de fecha
// 17/08/2026 (hace 8 días)"). Hasta ahora había que teclearlo todo otra vez.
//
// Es SOLO LECTURA y no copia nada: devuelve lo que quedó abierto para que el
// coordinador ELIJA en pantalla qué sigue pendiente. Nunca se arrastra solo, y
// esto no es un detalle de comodidad: un informe firmado afirma lo que el
// coordinador vio ESE día. Si la app arrastrara sola una observación, estaría
// firmando por él algo que quizá ya estaba resuelto.
//
// De dónde salen: del ÚLTIMO INFORME FINALIZADO de la obra. No de los
// borradores, que no son evidencia de nada, ni de todo el historial: cuando una
// observación se arrastra, viaja de informe en informe, así que el último
// finalizado ya lleva todo lo que sigue abierto.

import {
  type Informe,
  type Observacion,
  type OrigenObservacion,
  type EstadoObservacion,
} from "@/domain/informe/informe";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type Id } from "@/domain/shared/id";

/**
 * Los estados que significan "hay algo que atender".
 *
 * Fuera quedan las SUBSANADAS (están cerradas) y las que no llevan ningún
 * estado: una observación sin marcar no afirma que haya nada pendiente —"Visita
 * sin incidencias reseñables" es una de ellas— y ensuciaría la lista.
 */
const ESTADOS_ABIERTOS: EstadoObservacion[] = ["medida-requerida", "observacion-preventiva"];

/** Una observación que sigue abierta, con la visita en la que se señaló. */
export interface ObservacionPendiente {
  observacion: Observacion;
  /** Dónde y cuándo se señaló POR PRIMERA VEZ (no la visita anterior). */
  origen: OrigenObservacion;
}

export class ObservacionesPendientes {
  constructor(private readonly informes: InformeRepository) {}

  async ejecutar(proyectoId: Id): Promise<ObservacionPendiente[]> {
    const informes = await this.informes.listarPorProyecto(proyectoId);
    const ultimo = elUltimoCerrado(informes);
    if (!ultimo) return [];

    return (ultimo.observaciones ?? [])
      .filter((observacion) => sigueAbierta(observacion))
      .map((observacion) => ({
        observacion,
        // Si ya venía arrastrada, se CONSERVA su origen: lo que cuenta es
        // cuándo se vio por primera vez, no cuándo se copió por última.
        origen: observacion.vieneDe ?? { informeId: ultimo.id, fecha: ultimo.fechaHora },
      }));
  }
}

/** El informe cerrado más reciente de la obra, o null si aún no hay ninguno. */
function elUltimoCerrado(informes: Informe[]): Informe | null {
  const cerrados = informes.filter((informe) => informe.estado === "finalizado");
  if (cerrados.length === 0) return null;

  // El repositorio ya los ordena, pero esto no depende de ello: es una regla de
  // negocio ("el último") y se decide aquí.
  return cerrados.reduce((masReciente, informe) =>
    informe.fechaHora > masReciente.fechaHora ? informe : masReciente,
  );
}

function sigueAbierta(observacion: Observacion): boolean {
  return observacion.estado !== undefined && ESTADOS_ABIERTOS.includes(observacion.estado);
}
