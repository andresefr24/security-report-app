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

    // El encabezado de una observación: "OBSERVACIÓN 1" y su título a la
    // izquierda, y a la derecha la etiqueta de estado con su color.
    case "observacion": {
      const izquierda: Content = {
        stack: [
          { text: bloque.encabezado, fontSize: 11, bold: true, color: "#1b3a6b" },
          { text: bloque.titulo, fontSize: 12, bold: true, color: "#1b3a6b" },
        ],
        margin: [6, 6, 6, 6],
      };
      const derecha: Content = bloque.estado
        ? {
            text: bloque.estado.etiqueta,
            fontSize: 9,
            bold: true,
            alignment: "center",
            color: bloque.estado.texto,
            fillColor: bloque.estado.fondo,
            margin: [4, 10, 4, 10],
          }
        : { text: "" };

      const borde = bloque.estado ? bloque.estado.borde : "#cccccc";
      return {
        // `unbreakable` mantiene la cabecera entera en la misma página: sin esto
        // el título se quedaba solo al pie y su contenido pasaba a la siguiente.
        unbreakable: true,
        stack: [
          {
            table: { widths: ["*", 150], body: [[izquierda, derecha]] },
            layout: {
              hLineColor: () => borde,
              vLineColor: () => borde,
              hLineWidth: () => 0.8,
              vLineWidth: () => 0.8,
            },
          },
          ...(bloque.lineas.length > 0
            ? [
                {
                  stack: bloque.lineas.map((linea) => ({
                    text: linea,
                    fontSize: 11,
                    margin: [0, 2, 0, 0] as [number, number, number, number],
                  })),
                  margin: [6, 6, 0, 0] as [number, number, number, number],
                },
              ]
            : []),
        ],
        margin: [0, 14, 0, 8],
      };
    }

    case "parrafo":
      return {
        text: bloque.texto,
        fontSize: 11,
        alignment: "justify",
        margin: [0, 0, 0, 6],
      };

    // Las fotos de una fila, con su número y su comentario debajo.
    //
    // Cuando la fila lleva UNA sola foto, el comentario ocupa todo el ancho de
    // la página en vez de la columna de la foto: si no, quedaba en una tira
    // estrecha de seis o siete renglones.
    case "filaFotos": {
      const porFila = Math.max(bloque.fotosPorFila, bloque.fotos.length);
      const ancho = (ANCHO_UTIL - (porFila - 1) * 10) / porFila;

      const pieDeFoto = (texto: string, negrita: boolean, arriba: number): Content => ({
        text: texto,
        fontSize: 9,
        bold: negrita,
        alignment: "center",
        margin: [0, arriba, 0, 0],
      });

      if (bloque.fotos.length === 1) {
        const [foto] = bloque.fotos;
        return {
          stack: [
            { image: foto.imagen, fit: [ancho, ancho * 1.1], alignment: "center" },
            pieDeFoto(foto.numero, true, 4),
            ...(foto.comentario ? [pieDeFoto(foto.comentario, true, 2)] : []),
          ],
          margin: [0, 0, 0, 12],
        };
      }

      const columnas: Column[] = bloque.fotos.map(
        (foto): Column => ({
          width: ancho,
          stack: [
            { image: foto.imagen, fit: [ancho, ancho * 1.1] },
            pieDeFoto(foto.numero, true, 4),
            ...(foto.comentario ? [pieDeFoto(foto.comentario, true, 2)] : []),
          ],
        }),
      );

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

      // Sin "recibido por", el recuadro es de una sola columna y no se estira a
      // toda la página: un cuadro vacío al lado de la firma quedaba raro.
      const anchos = bloque.derecha ? ["*", "*"] : [280];
      const fila = bloque.derecha
        ? [columna(bloque.izquierda), columna(bloque.derecha)]
        : [columna(bloque.izquierda)];

      return {
        // Igual que la cabecera de la observación: el recuadro de firmas se
        // partía entre dos páginas y quedaba la mitad en cada una.
        unbreakable: true,
        table: { widths: anchos, body: [fila] },
        margin: [0, 20, 0, 0],
      };
    }

    // Un correo por línea: en el documento se leen, no se copian, así que el
    // punto y coma sobra. En la obra sí se escriben todos seguidos.
    case "distribucion":
      return {
        // La lista es corta y siempre cabe: que no se parta y deje un correo
        // suelto al principio de la página siguiente.
        unbreakable: true,
        stack: [
          { text: bloque.titulo, fontSize: 10, bold: true, margin: [0, 0, 0, 4] },
          ...bloque.correos.map((correo) => ({
            text: correo,
            fontSize: 10,
            margin: [0, 0, 0, 2] as [number, number, number, number],
          })),
        ],
        margin: [0, 16, 0, 0],
      };
  }
}

/**
 * Junta en un mismo bloque las parejas que no deben acabar en páginas distintas:
 *
 *  - Cada observación con su PRIMERA fila de fotos. Sin esto, cuando la
 *    observación caía al final de una página su foto saltaba a la siguiente y
 *    había que pasar hoja para ver de qué hablaba el texto. Solo la primera
 *    fila: pegarlas todas dejaría una observación con muchas fotos sin caber en
 *    una página.
 *  - El recuadro de firmas con la lista de correos, que es el pie del
 *    documento y se lee de una vez.
 */
function agrupandoLoQueNoDebeSepararse(bloques: BloqueDocumento[]): Content[] {
  const contenido: Content[] = [];
  for (let i = 0; i < bloques.length; i++) {
    const bloque = bloques[i];
    const siguiente = bloques[i + 1];

    const vanJuntos =
      (bloque.tipo === "observacion" && siguiente?.tipo === "filaFotos") ||
      (bloque.tipo === "firmas" && siguiente?.tipo === "distribucion");

    if (vanJuntos && siguiente) {
      contenido.push({
        unbreakable: true,
        stack: [aBloqueDePdfmake(bloque), aBloqueDePdfmake(siguiente)],
      });
      i++;
      continue;
    }
    contenido.push(aBloqueDePdfmake(bloque));
  }
  return contenido;
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
              documento.cabeceraPagina.logo
                ? {
                    image: documento.cabeceraPagina.logo,
                    fit: [100, 42] as [number, number],
                    alignment: "center" as const,
                    margin: [4, 6, 4, 6] as [number, number, number, number],
                  }
                : { text: "", fontSize: 8 },
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

      content: agrupandoLoQueNoDebeSepararse(documento.bloques),
    };

    const pdfMake = await cargarPdfMake();
    return pdfMake.createPdf(definicion).getBlob();
  }
}
