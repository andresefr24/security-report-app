// Construye la "receta" del documento PDF: qué secciones lleva y con qué texto.
//
// Es una función PURA: recibe los datos y devuelve un objeto que describe el
// documento. No sabe de pdfmake ni del navegador, así que se puede testear del
// todo (que el nº de registro IRSST aparece, que van las fotos y las firmas…).
// El adaptador se limita a pasarle esta receta a pdfmake.
//
// NOTA (provisional, Q2): el maquetado exacto —qué secciones y en qué orden—
// depende de la plantilla real del stakeholder. Lo definitivo del M4 es la
// mecánica (generar en cliente, embeber fotos y firmas, compartir). Cambiar el
// orden o añadir una sección es editar este archivo.

import { type DatosDelPdf } from "@/domain/ports/pdf-port";
import { type RolFirmante } from "@/domain/informe/informe";

/** Cómo se nombra cada rol en el documento (en español llano). */
const ETIQUETAS_ROL: Record<RolFirmante, string> = {
  coordinador: "Coordinador de seguridad y salud",
  contratista: "Por la contrata",
  subcontrata: "Por la subcontrata",
};

/** Una parte del documento. La receta es una lista de estas. */
export type BloqueDocumento =
  | { tipo: "titulo"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "parrafo"; texto: string }
  | { tipo: "dato"; etiqueta: string; valor: string }
  | { tipo: "imagen"; imagen: string; pie?: string }
  | { tipo: "firma"; imagen: string; nombre: string; rolEtiqueta: string };

export interface DocumentoInforme {
  /** Va en las propiedades del PDF y en el nombre del archivo. */
  titulo: string;
  bloques: BloqueDocumento[];
}

/** "2026-07-01T09:30" -> "1 de julio de 2026, 9:30". */
function fechaLegible(fechaHora: string): string {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  return fecha.toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
}

export function construirDocumento({
  informe,
  proyecto,
  promotor,
  coordinador,
}: DatosDelPdf): DocumentoInforme {
  const bloques: BloqueDocumento[] = [];

  bloques.push({ tipo: "titulo", texto: "Informe de visita a obra" });

  // --- La obra ---
  bloques.push({ tipo: "subtitulo", texto: "Obra" });
  bloques.push({ tipo: "dato", etiqueta: "Código de obra", valor: proyecto.codigoObra });
  if (proyecto.descripcion) {
    bloques.push({ tipo: "dato", etiqueta: "Descripción", valor: proyecto.descripcion });
  }
  bloques.push({
    tipo: "dato",
    etiqueta: "Promotor",
    valor: promotor?.nombreRazonSocial ?? "No consta",
  });
  bloques.push({
    tipo: "dato",
    etiqueta: "Fecha y hora de la visita",
    valor: fechaLegible(informe.fechaHora),
  });

  // --- El coordinador (su registro es lo que da validez legal) ---
  bloques.push({ tipo: "subtitulo", texto: "Coordinador de seguridad y salud" });
  bloques.push({ tipo: "dato", etiqueta: "Nombre", valor: coordinador.nombreCompleto });
  bloques.push({
    tipo: "dato",
    etiqueta: "Nº de registro de la CAM (IRSST)",
    valor: coordinador.numeroRegistroIrsst,
  });
  if (coordinador.profesion) {
    bloques.push({ tipo: "dato", etiqueta: "Profesión", valor: coordinador.profesion });
  }
  if (coordinador.contacto?.empresa) {
    bloques.push({ tipo: "dato", etiqueta: "Empresa", valor: coordinador.contacto.empresa });
  }

  // --- Quién atiende la visita ---
  const personas = informe.personasAtienden ?? [];
  if (personas.length > 0) {
    bloques.push({ tipo: "subtitulo", texto: "Personas que atienden la visita" });
    for (const persona of personas) {
      bloques.push({
        tipo: "parrafo",
        texto: persona.cargo ? `${persona.nombre} — ${persona.cargo}` : persona.nombre,
      });
    }
  }

  // --- El cuerpo del informe ---
  bloques.push({ tipo: "subtitulo", texto: "Desarrollo de la visita" });
  bloques.push({ tipo: "parrafo", texto: informe.contenido ?? "" });

  // --- Incumplimientos ---
  const incumplimientos = informe.incumplimientos ?? [];
  if (incumplimientos.length > 0) {
    bloques.push({ tipo: "subtitulo", texto: "Incumplimientos detectados" });
    for (const incumplimiento of incumplimientos) {
      bloques.push({
        tipo: "parrafo",
        texto: `${incumplimiento.subcontrata}: ${incumplimiento.descripcion}`,
      });
    }
  }

  // --- Fotos ---
  const fotos = informe.fotos ?? [];
  if (fotos.length > 0) {
    bloques.push({ tipo: "subtitulo", texto: "Fotografías" });
    for (const foto of fotos) {
      bloques.push({ tipo: "imagen", imagen: foto.imagen, pie: foto.descripcion });
    }
  }

  // --- Firmas ---
  const firmas = informe.firmas ?? [];
  if (firmas.length > 0) {
    bloques.push({ tipo: "subtitulo", texto: "Firmas" });
    for (const firma of firmas) {
      bloques.push({
        tipo: "firma",
        imagen: firma.firma,
        nombre: firma.subcontrata ? `${firma.nombre} (${firma.subcontrata})` : firma.nombre,
        rolEtiqueta: ETIQUETAS_ROL[firma.rol],
      });
    }
  }

  return {
    titulo: `Informe ${proyecto.codigoObra} — ${fechaLegible(informe.fechaHora)}`,
    bloques,
  };
}
