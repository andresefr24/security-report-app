// Regla de negocio: ¿está el informe listo para cerrarse (finalizar)?
//
// Devuelve QUÉ FALTA, en español llano, para que la pantalla lo muestre tal cual.
// Lista vacía = se puede finalizar.
//
// Qué se exige y por qué:
//  - Al menos una actividad con su descripción: un informe sin ninguna actividad
//    descrita no cuenta nada de la visita, y las actividades son el cuerpo del
//    informe en el modelo v2.
//  - Firma del coordinador: es su prueba de presencia, lo que da valor legal al
//    documento.
//
// Qué NO se exige, a propósito:
//  - La SITUACIÓN general. Ojo, esto se apartó de lo escrito en D9 y en
//    entity-informe (que la exigían) después de leer los 8 informes reales: solo
//    la usan los informes de visita puntual; en los semanales —los más frecuentes—
//    no existe ese campo, y lo que allí se llama "situación" es la UBICACIÓN de
//    cada actividad, que ya viaja dentro de ella. Exigirla obligaría al
//    coordinador a rellenar un hueco que su formato real no tiene. Ver el porqué
//    completo en docs/maqueta-informe-real.md §7 y docs/propuesta-informe-estructura-real.md §4b.
//  - La firma de quien recibe el informe: puede no haber nadie para firmar ese
//    día, y eso no puede impedir que el coordinador cierre su informe.
//  - Las fotos ni sus comentarios. Lo normal es que haya fotos (son la forma de
//    evidenciar la visita), pero puede haber visitas sin nada que fotografiar.

import { type DatosInforme } from "@/domain/informe/informe";
import { tieneTexto } from "@/domain/shared/validacion";

export function loQueFaltaParaFinalizar(informe: DatosInforme): string[] {
  const falta: string[] = [];

  const actividadesDescritas = (informe.actividades ?? []).filter((actividad) =>
    tieneTexto(actividad.descripcion),
  );
  if (actividadesDescritas.length === 0) {
    falta.push("Falta describir al menos una actividad.");
  }

  const firmaDelCoordinador = (informe.firmas ?? []).some((f) => f.rol === "coordinador");
  if (!firmaDelCoordinador) {
    falta.push("Falta la firma del coordinador.");
  }

  return falta;
}
