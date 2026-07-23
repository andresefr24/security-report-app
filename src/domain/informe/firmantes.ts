// Regla de negocio: quién TIENE que firmar un informe.
//
// El coordinador firma siempre. Y cada subcontrata a la que se le haya anotado un
// incumplimiento ese día pasa a tener que firmar (una vez, aunque tenga varios
// incumplimientos). El promotor no firma nunca. Ver docs/entity-informe#signatures.
//
// Vive en el dominio (no en la pantalla) para que la regla esté en un solo sitio,
// sea testeable, y el paso de firmas solo la consulte.

import { type DatosInforme, type RolFirmante } from "@/domain/informe/informe";

export interface FirmanteRequerido {
  rol: RolFirmante;
  /** Para las subcontratas, cuál (para mostrar). El coordinador no lo necesita. */
  subcontrata?: string;
  /**
   * Para las subcontratas, el id del incumplimiento que la trajo: ancla estable
   * de su firma, así renombrar la subcontrata no pierde la firma ya recogida.
   */
  incumplimientoId?: string;
}

export function firmantesRequeridos(informe: DatosInforme): FirmanteRequerido[] {
  const requeridos: FirmanteRequerido[] = [{ rol: "coordinador" }];

  const yaAnadidas = new Set<string>();
  for (const incumplimiento of informe.incumplimientos ?? []) {
    const subcontrata = incumplimiento.subcontrata.trim();
    // Una firma por subcontrata: nos quedamos con el primer incumplimiento suyo.
    //
    // CASO LÍMITE CONOCIDO (revisión del M3, sin arreglar a propósito): si una
    // subcontrata tiene dos incumplimientos y se borra justo el primero, el ancla
    // pasa al segundo y su firma ya recogida podría perderse. Es poco probable;
    // si aparece, la solución sería un id propio de subcontrata en el informe.
    if (subcontrata && !yaAnadidas.has(subcontrata)) {
      yaAnadidas.add(subcontrata);
      requeridos.push({ rol: "subcontrata", subcontrata, incumplimientoId: incumplimiento.id });
    }
  }

  return requeridos;
}
