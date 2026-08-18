// Construye la "receta" del documento PDF: qué secciones lleva y con qué texto.
//
// Es una función PURA: recibe los datos y devuelve un objeto que describe el
// documento. No sabe de pdfmake ni del navegador, así que se puede testear del
// todo (que el nº de registro IRSST aparece, que van las fotos y las firmas…).
// El adaptador se limita a pasarle esta receta a pdfmake.
//
// Lo que decide ESTE archivo es la ESTRUCTURA (qué bloques y en qué orden). Cómo
// se llama cada cosa en el formato de TPF/Getinsa lo decide la PLANTILLA
// (plantilla-informe.ts), para no casarnos con un organismo concreto
// (decisions#d9-informe-v2, afinado 3). La maqueta que se calca está descrita en
// docs/maqueta-informe-real.md.

import { type DatosDelPdf } from "@/domain/ports/pdf-port";
import { type Foto } from "@/domain/informe/informe";
import {
  PLANTILLA_SEMANAL,
  type PlantillaInforme,
} from "@/infrastructure/pdf/plantilla-informe";

/** Una fila de la tabla de cabecera: hasta dos parejas etiqueta/valor. */
export interface FilaCabecera {
  etiqueta: string;
  valor: string;
  /** Segunda pareja, para las filas que llevan dos datos (fecha, empresa…). */
  etiqueta2?: string;
  valor2?: string;
}

/** Una foto ya lista para pintar: imagen y su comentario (si lo tiene). */
export interface FotoDocumento {
  imagen: string;
  /** Su número dentro del informe: "Foto 3". */
  numero: string;
  comentario?: string;
}

/** Un bloque de firma: su encabezado, el trazo si lo hay, y las líneas de pie. */
export interface FirmaDocumento {
  titulo: string;
  imagen?: string;
  lineas: string[];
}

/** Una parte del documento. La receta es una lista de estas. */
export type BloqueDocumento =
  /** La tabla gris de datos de la cabecera. */
  | { tipo: "cabecera"; filas: FilaCabecera[] }
  /** Un rótulo de sección: en mayúsculas y dentro de su recuadro. */
  | { tipo: "rotulo"; lineas: string[] }
  | { tipo: "parrafo"; texto: string }
  /** Una fila de fotos (tantas como diga la plantilla) con su comentario debajo. */
  | { tipo: "filaFotos"; fotos: FotoDocumento[]; fotosPorFila: number }
  /** El recuadro de firmas al pie: coordinador a la izquierda, receptor a la derecha. */
  | { tipo: "firmas"; izquierda: FirmaDocumento; derecha?: FirmaDocumento }
  /** La lista de distribución: a quién se le envía. */
  | { tipo: "distribucion"; titulo: string; destinatarios: string[] };

export interface DocumentoInforme {
  /** Va en las propiedades del PDF y en el nombre del archivo. */
  titulo: string;
  /** La banda superior, que se repite en todas las páginas. */
  cabeceraPagina: { titulo: string[]; formato: string[] };
  /** El texto de la derecha del título: "ING. CSS " + la empresa del perfil. */
  emisorCabecera: string;
  bloques: BloqueDocumento[];
}

/** "2026-07-01T09:30" -> "1 de julio de 2026, 9:30". */
function fechaLegible(fechaHora: string): string {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  return fecha.toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
}

/** "2026-07-01T09:30" -> "01/07/2026", como en la cabecera de los informes reales. */
function fechaCorta(fechaHora: string): string {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  return fecha.toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * El nº de documento. Se deriva de la fecha en vez de pedírselo al coordinador:
 * los informes reales usan unas veces un código de calidad y otras un correlativo
 * por fecha, y teclearlo a mano en cada visita solo da errores.
 */
function identificacion(fechaHora: string): string {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  const dosDigitos = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}${dosDigitos(fecha.getMonth() + 1)}${dosDigitos(fecha.getDate())}`;
}

/**
 * Reparte las fotos en filas de `porFila` y les pone su número.
 *
 * La numeración es CORRELATIVA EN TODO EL INFORME (Foto 1, 2, 3…), no por
 * actividad: los coordinadores se referían a "la foto 3" hablando del documento
 * entero, y sin número no había forma de señalar una.
 */
function enFilas(
  fotos: Foto[],
  porFila: number,
  etiqueta: string,
  numeroInicial: number,
): FotoDocumento[][] {
  const filas: FotoDocumento[][] = [];
  for (let i = 0; i < fotos.length; i += porFila) {
    filas.push(
      fotos.slice(i, i + porFila).map((f, j) => ({
        imagen: f.imagen,
        numero: `${etiqueta} ${numeroInicial + i + j}`,
        comentario: f.comentario,
      })),
    );
  }
  return filas;
}

export function construirDocumento(
  { informe, proyecto, promotor, coordinador }: DatosDelPdf,
  plantilla: PlantillaInforme = PLANTILLA_SEMANAL,
): DocumentoInforme {
  const bloques: BloqueDocumento[] = [];
  const { etiquetas, rotulos } = plantilla;

  // --- La tabla de cabecera ---
  bloques.push({
    tipo: "cabecera",
    filas: [
      {
        etiqueta: etiquetas.obra,
        valor: proyecto.descripcion
          ? `${proyecto.codigoObra} — ${proyecto.descripcion}`
          : proyecto.codigoObra,
      },
      { etiqueta: etiquetas.ubicacion, valor: proyecto.ubicacion ?? "" },
      { etiqueta: etiquetas.promotor, valor: promotor?.nombreRazonSocial ?? "No consta" },
      {
        etiqueta: etiquetas.contratista,
        valor: proyecto.contratista ?? "",
        etiqueta2: proyecto.cifContratista ? etiquetas.cifContratista : undefined,
        valor2: proyecto.cifContratista,
      },
      {
        etiqueta: etiquetas.plazoEjecucion,
        valor: proyecto.plazoEjecucion ?? "",
        etiqueta2: proyecto.fechaInicio ? etiquetas.fechaInicio : undefined,
        valor2: proyecto.fechaInicio,
      },
      {
        etiqueta: etiquetas.presupuestoEjecucion,
        valor: proyecto.presupuestoEjecucion ?? "",
        etiqueta2: proyecto.presupuestoEss ? etiquetas.presupuestoEss : undefined,
        valor2: proyecto.presupuestoEss,
      },
      {
        etiqueta: etiquetas.identificacion,
        valor: identificacion(informe.fechaHora),
        etiqueta2: etiquetas.fecha,
        valor2: fechaCorta(informe.fechaHora),
      },
      { etiqueta: etiquetas.tipoDocumento, valor: plantilla.tipoDocumento },
      {
        etiqueta: etiquetas.emisor,
        // El emisor sale SIEMPRE del perfil, nunca fijado en la plantilla: en los
        // informes reales firman tres coordinadores distintos.
        valor: coordinador.nombreCompleto,
        etiqueta2: etiquetas.empresaEmisor,
        valor2: coordinador.contacto?.empresa ?? "",
      },
      {
        etiqueta: etiquetas.receptor,
        valor: informe.receptor?.nombre ?? "",
        etiqueta2: etiquetas.empresaReceptor,
        valor2: informe.receptor?.empresa ?? "",
      },
    ],
  });

  bloques.push({ tipo: "parrafo", texto: plantilla.avisoAlcance });

  // --- El calendario de la semana ---
  if (informe.resumenSemana) {
    bloques.push({ tipo: "rotulo", lineas: [rotulos.calendario] });
    bloques.push({ tipo: "parrafo", texto: informe.resumenSemana });
  }

  // --- La situación general (solo la usan los informes de visita puntual) ---
  if (informe.situacion) {
    bloques.push({ tipo: "rotulo", lineas: [`${rotulos.situacion}:`] });
    bloques.push({ tipo: "parrafo", texto: informe.situacion });
  }

  // --- Las actividades: el cuerpo del informe ---
  // Las fotos se numeran seguidas a lo largo de todo el informe.
  let numeroDeFoto = 1;
  for (const actividad of informe.actividades ?? []) {
    const lineas: string[] = [];
    if (actividad.ubicacion) {
      lineas.push(`${rotulos.ubicacionActividad}: ${actividad.ubicacion}`);
    }
    if (actividad.descripcion) {
      lineas.push(`${rotulos.descripcionActividad}: ${actividad.descripcion}`);
    }
    if (lineas.length > 0) bloques.push({ tipo: "rotulo", lineas });

    const fotos = actividad.fotos ?? [];
    for (const fila of enFilas(
      fotos,
      plantilla.fotosPorFila,
      plantilla.etiquetaFoto,
      numeroDeFoto,
    )) {
      bloques.push({ tipo: "filaFotos", fotos: fila, fotosPorFila: plantilla.fotosPorFila });
    }
    numeroDeFoto += fotos.length;
  }

  // --- El recuadro de firmas ---
  const firmaCoordinador = (informe.firmas ?? []).find((f) => f.rol === "coordinador");
  const firmaRecibido = (informe.firmas ?? []).find((f) => f.rol === "recibido");
  const registro = `${plantilla.firmas.cargoCoordinador} - ${plantilla.firmas.etiquetaRegistro} ${coordinador.numeroRegistroIrsst}`;

  bloques.push({
    tipo: "firmas",
    izquierda: {
      titulo: plantilla.firmas.tituloCoordinador,
      imagen: firmaCoordinador?.firma,
      lineas: [
        `Fdo. ${firmaCoordinador?.nombre ?? coordinador.nombreCompleto}`,
        registro,
        coordinador.contacto?.empresa ?? "",
      ].filter(Boolean),
    },
    derecha: {
      titulo: plantilla.firmas.tituloRecibido,
      imagen: firmaRecibido?.firma,
      lineas: [
        firmaRecibido?.nombre ?? informe.receptor?.nombre
          ? `Fdo: ${firmaRecibido?.nombre ?? informe.receptor?.nombre}`
          : "",
        informe.receptor?.empresa ?? "",
      ].filter(Boolean),
    },
  });

  // --- A quién se le envía ---
  const destinatarios = proyecto.listaDistribucion ?? [];
  if (destinatarios.length > 0) {
    bloques.push({
      tipo: "distribucion",
      titulo: rotulos.distribucion,
      destinatarios: destinatarios.map((d) =>
        d.nombre ? `${d.nombre} — ${d.correo}` : d.correo,
      ),
    });
  }

  return {
    titulo: `Informe ${proyecto.codigoObra} — ${fechaLegible(informe.fechaHora)}`,
    cabeceraPagina: { titulo: plantilla.titulo, formato: plantilla.formato },
    emisorCabecera: `${plantilla.prefijoEmisorCabecera}${coordinador.contacto?.empresa ?? ""}`.trim(),
    bloques,
  };
}
