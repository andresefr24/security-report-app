// Regla de negocio: ¿está el informe listo para cerrarse (finalizar)?
//
// Devuelve QUÉ FALTA, en español llano, para que la pantalla lo muestre tal cual.
// Lista vacía = se puede finalizar.
//
// Qué se exige y por qué:
//  - Contenido escrito: un informe sin cuerpo no es un informe.
//  - Firma del coordinador: es su prueba de presencia, lo que da valor legal al
//    documento.
//
// Qué NO se exige, a propósito:
//  - Las firmas de las subcontratas con incumplimiento. El paso de firmas las
//    sigue pidiendo y avisa si faltan (ver firmantesRequeridos), pero no pueden
//    bloquear el cierre: la subcontrata puede no estar disponible para firmar ese
//    día y el coordinador tiene que poder cerrar su informe igualmente.
//  - Las fotos. Lo normal es que haya (son la forma de evidenciar la visita),
//    pero puede haber visitas sin nada que fotografiar.
//  - Las personas que atienden: puede no haber nadie ese día.

import { type DatosInforme } from "@/domain/informe/informe";
import { tieneTexto } from "@/domain/shared/validacion";

export function loQueFaltaParaFinalizar(informe: DatosInforme): string[] {
  const falta: string[] = [];

  if (!tieneTexto(informe.contenido)) {
    falta.push("Falta escribir el contenido del informe.");
  }

  const firmaDelCoordinador = (informe.firmas ?? []).some((f) => f.rol === "coordinador");
  if (!firmaDelCoordinador) {
    falta.push("Falta la firma del coordinador.");
  }

  return falta;
}
