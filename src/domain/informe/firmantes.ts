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
  /** Para las subcontratas, cuál. El coordinador no lo necesita. */
  subcontrata?: string;
}

export function firmantesRequeridos(informe: DatosInforme): FirmanteRequerido[] {
  const requeridos: FirmanteRequerido[] = [{ rol: "coordinador" }];

  const yaAnadidas = new Set<string>();
  for (const incumplimiento of informe.incumplimientos ?? []) {
    const subcontrata = incumplimiento.subcontrata.trim();
    if (subcontrata && !yaAnadidas.has(subcontrata)) {
      yaAnadidas.add(subcontrata);
      requeridos.push({ rol: "subcontrata", subcontrata });
    }
  }

  return requeridos;
}
