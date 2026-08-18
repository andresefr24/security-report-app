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

import {
  type Column,
  type Content,
  type TDocumentDefinitions,
  type TVirtualFileSystem,
} from "pdfmake/interfaces";
import { type PdfPort, type DatosDelPdf } from "@/domain/ports/pdf-port";
import {
  construirDocumento,
  type BloqueDocumento,
  type FirmaDocumento,
} from "@/infrastructure/pdf/construir-documento";

// pdfmake pesa lo suyo y solo hace falta al generar un PDF, así que se carga BAJO
// DEMANDA: así el arranque de la app en el móvil no lo arrastra. Queda en su
// propio trozo, que el service worker precachea igual (funciona sin conexión).
// Se carga una sola vez y se reutiliza.
type ApiPdfMake = typeof import("pdfmake/build/pdfmake");

/**
 * pdfmake y sus fuentes se publican en formato UMD (el antiguo). Según cómo los
 * empaquete Vite, la API real puede llegar dentro de `default` en vez de en el
 * propio módulo. Nos quedamos con la que exista: sin esto, `addVirtualFileSystem`
 * no está definida y generar el PDF revienta.
 */
function apiReal<T>(modulo: T | { default?: T }): T {
  const conDefault = modulo as { default?: T };
  return conDefault.default ?? (modulo as T);
}

let cargaDePdfMake: Promise<ApiPdfMake> | null = null;

function cargarPdfMake(): Promise<ApiPdfMake> {
  if (!cargaDePdfMake) {
    cargaDePdfMake = (async () => {
      const [moduloPdfMake, moduloFuentes] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);
      const pdfMake = apiReal<ApiPdfMake>(moduloPdfMake);
      const fuentes = apiReal<TVirtualFileSystem>(moduloFuentes);
      // pdfmake necesita sus fuentes empaquetadas ("sistema de archivos virtual").
      pdfMake.addVirtualFileSystem(fuentes);
      return pdfMake;
    })();
  }
  return cargaDePdfMake;
}

/** El ancho útil de una A4 con los márgenes de este documento. */
const ANCHO_UTIL = 515;

/** Traduce un bloque de nuestra receta al formato que entiende pdfmake. */
function aBloqueDePdfmake(bloque: BloqueDocumento): Content {
  switch (bloque.tipo) {
    // La tabla gris de datos: rótulo a la izquierda, valor en negrita.
    case "cabecera":
      return {
        table: {
          widths: [110, "*", 75, 130],
          body: bloque.filas.map((fila) => [
            { text: fila.etiqueta, fontSize: 9 },
            { text: fila.valor, fontSize: 9, bold: true },
            { text: fila.etiqueta2 ?? "", fontSize: 9 },
            { text: fila.valor2 ?? "", fontSize: 9, bold: true },
          ]),
        },
        layout: "noBorders",
        fillColor: "#f2f2f2",
        margin: [0, 0, 0, 8],
      };

    // Un rótulo de sección: mayúsculas, negrita y su recuadro, como el original.
    case "rotulo":
      return {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: bloque.lineas.map((linea) => ({
                  text: linea,
                  fontSize: 11,
                  bold: true,
                  decoration: "underline" as const,
                })),
                margin: [4, 3, 4, 3] as [number, number, number, number],
              },
            ],
          ],
        },
        margin: [0, 10, 0, 6],
      };

    case "parrafo":
      return {
        text: bloque.texto,
        fontSize: 11,
        alignment: "justify",
        margin: [0, 0, 0, 6],
      };

    // Las fotos de una fila, con su comentario en negrita debajo de cada una.
    //
    // El ancho se calcula con las fotos que CABEN en la fila, no con las que hay:
    // así una foto suelta al final ocupa media página como en los informes
    // reales, en vez de estirarse hasta el ancho completo.
    case "filaFotos": {
      const porFila = Math.max(bloque.fotosPorFila, bloque.fotos.length);
      const ancho = (ANCHO_UTIL - (porFila - 1) * 10) / porFila;
      // Si la fila va incompleta, se reparte el hueco a los dos lados para que la
      // foto quede centrada en la página y no pegada al margen izquierdo.
      const hueco = ((porFila - bloque.fotos.length) * (ancho + 10)) / 2;
      const relleno: Column[] = hueco > 0 ? [{ width: hueco, text: "" }] : [];
      const columnas: Column[] = [
        ...relleno,
        ...bloque.fotos.map((foto): Column => ({
          width: ancho,
          stack: [
            { image: foto.imagen, fit: [ancho, ancho * 1.1] },
            {
              text: foto.numero,
              fontSize: 9,
              bold: true,
              alignment: "center" as const,
              margin: [0, 4, 0, 0] as [number, number, number, number],
            },
            ...(foto.comentario
              ? [
                  {
                    text: foto.comentario,
                    fontSize: 9,
                    bold: true,
                    alignment: "center" as const,
                    margin: [0, 2, 0, 0] as [number, number, number, number],
                  },
                ]
              : []),
          ],
        })),
        ...relleno,
      ];

      return { columns: columnas, columnGap: 10, margin: [0, 0, 0, 12] };
    }

    // El recuadro de firmas: coordinador a la izquierda, receptor a la derecha.
    case "firmas": {
      const columna = (firma: FirmaDocumento): Content => ({
        stack: [
          { text: firma.titulo, fontSize: 10 },
          firma.imagen
            ? {
                image: firma.imagen,
                fit: [180, 60],
                alignment: "center" as const,
                margin: [0, 8, 0, 4] as [number, number, number, number],
              }
            : {
                text: " ",
                margin: [0, 20, 0, 0] as [number, number, number, number],
              },
          ...firma.lineas.map((linea) => ({
            text: linea,
            fontSize: 8,
            alignment: "center" as const,
          })),
        ],
        margin: [4, 4, 4, 4] as [number, number, number, number],
      });

      return {
        table: {
          widths: ["*", "*"],
          body: [
            [
              columna(bloque.izquierda),
              bloque.derecha ? columna(bloque.derecha) : { text: "" },
            ],
          ],
        },
        margin: [0, 20, 0, 0],
      };
    }

    case "distribucion":
      return {
        stack: [
          { text: bloque.titulo, fontSize: 10, bold: true, margin: [0, 0, 0, 2] },
          { text: bloque.correos, fontSize: 10 },
        ],
        margin: [0, 16, 0, 0],
      };
  }
}

export class PdfMakeAdapter implements PdfPort {
  async generar(datos: DatosDelPdf): Promise<Blob> {
    const documento = construirDocumento(datos);

    const definicion: TDocumentDefinitions = {
      info: { title: documento.titulo },
      pageMargins: [40, 90, 40, 40],

      // La banda superior se repite en TODAS las páginas, como en el original:
      // logotipos (aún no), título centrado y código de formato a la derecha.
      header: () => ({
        margin: [40, 25, 40, 0],
        table: {
          widths: [110, "*", 110],
          body: [
            [
              { text: "", fontSize: 8 },
              {
                stack: documento.cabeceraPagina.titulo.map((linea) => ({
                  text: linea,
                  fontSize: 13,
                  bold: true,
                  alignment: "center" as const,
                })),
                margin: [0, 4, 0, 4] as [number, number, number, number],
              },
              {
                stack: [
                  ...documento.cabeceraPagina.formato.map((linea) => ({
                    text: linea,
                    fontSize: 8,
                  })),
                  // A la derecha del título, quién emite: lo pidieron para que se
                  // vea de un vistazo de qué coordinador es el informe.
                  {
                    text: documento.emisorCabecera,
                    fontSize: 8,
                    bold: true,
                    margin: [0, 4, 0, 0] as [number, number, number, number],
                  },
                ],
                margin: [4, 4, 0, 4] as [number, number, number, number],
              },
            ],
          ],
        },
      }),

      // El pie solo lleva la paginación: la referencia de calidad que iba a la
      // izquierda la pidieron fuera porque no les dice nada.
      footer: (paginaActual: number, total: number) => ({
        margin: [40, 10, 40, 0],
        text: `${paginaActual} de ${total}`,
        fontSize: 8,
        alignment: "right",
      }),

      content: documento.bloques.map(aBloqueDePdfmake),
    };

    const pdfMake = await cargarPdfMake();
    return pdfMake.createPdf(definicion).getBlob();
  }
}
