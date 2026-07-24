// Adaptador del PdfPort con pdfmake — genera el PDF en el propio navegador.
//
// Capa FINA a propósito: toda la decisión de qué lleva el documento vive en
// construir-documento.ts (función pura y testeada). Aquí solo se traduce esa
// receta al formato de pdfmake y se devuelve el archivo. Por eso este archivo no
// tiene tests automáticos: se verifica abriendo el PDF de verdad en el navegador
// (pdfmake no funciona en el entorno de pruebas).
//
// NOTA de tipografía: se usa la fuente que trae pdfmake de serie. El
// design-system pide IBM Plex Serif para el PDF, pero empotrar la fuente añade
// peso al paquete y hay que resolver que funcione sin conexión: queda para el M5
// (el hito de pulido y offline). Desviación consciente, anotada en el PR.

import { type Content, type TDocumentDefinitions } from "pdfmake/interfaces";
import { type PdfPort, type DatosDelPdf } from "@/domain/ports/pdf-port";
import { construirDocumento, type BloqueDocumento } from "@/infrastructure/pdf/construir-documento";

// pdfmake pesa lo suyo y solo hace falta al generar un PDF, así que se carga BAJO
// DEMANDA: así el arranque de la app en el móvil no lo arrastra. Queda en su
// propio trozo, que el service worker precachea igual (funciona sin conexión).
// Se carga una sola vez y se reutiliza.
let cargaDePdfMake: Promise<typeof import("pdfmake/build/pdfmake")> | null = null;

function cargarPdfMake(): Promise<typeof import("pdfmake/build/pdfmake")> {
  if (!cargaDePdfMake) {
    cargaDePdfMake = (async () => {
      const [pdfMake, fuentes] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);
      // pdfmake necesita sus fuentes empaquetadas ("sistema de archivos virtual").
      pdfMake.addVirtualFileSystem(fuentes.default);
      return pdfMake;
    })();
  }
  return cargaDePdfMake;
}

/** Traduce un bloque de nuestra receta al formato que entiende pdfmake. */
function aBloqueDePdfmake(bloque: BloqueDocumento): Content {
  switch (bloque.tipo) {
    case "titulo":
      return { text: bloque.texto, fontSize: 20, bold: true, margin: [0, 0, 0, 16] };
    case "subtitulo":
      return { text: bloque.texto, fontSize: 14, bold: true, margin: [0, 16, 0, 8] };
    case "parrafo":
      return { text: bloque.texto, fontSize: 11, margin: [0, 0, 0, 6] };
    case "dato":
      return {
        text: [{ text: `${bloque.etiqueta}: `, bold: true }, { text: bloque.valor }],
        fontSize: 11,
        margin: [0, 0, 0, 4],
      };
    case "imagen":
      return {
        stack: [
          { image: bloque.imagen, fit: [450, 300] },
          ...(bloque.pie ? [{ text: bloque.pie, fontSize: 10, italics: true }] : []),
        ],
        margin: [0, 0, 0, 12],
      };
    case "firma":
      return {
        stack: [
          { image: bloque.imagen, fit: [200, 80] },
          { text: bloque.nombre, fontSize: 11, bold: true },
          { text: bloque.rolEtiqueta, fontSize: 10 },
        ],
        margin: [0, 0, 0, 16],
      };
  }
}

export class PdfMakeAdapter implements PdfPort {
  async generar(datos: DatosDelPdf): Promise<Blob> {
    const documento = construirDocumento(datos);

    const definicion: TDocumentDefinitions = {
      info: { title: documento.titulo },
      pageMargins: [40, 40, 40, 40],
      content: documento.bloques.map(aBloqueDePdfmake),
    };

    const pdfMake = await cargarPdfMake();
    return pdfMake.createPdf(definicion).getBlob();
  }
}
