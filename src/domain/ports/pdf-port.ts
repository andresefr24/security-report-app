// Puerto PdfPort — el contrato de generación del PDF del informe.
//
// El dominio dice QUÉ necesita (convertir un informe en un PDF), no CÓMO. Hoy lo
// implementa un adaptador con pdfmake que genera el archivo en el propio
// navegador; si mañana se generase en un servidor, solo cambiaría el adaptador.
//
// Recibe las tres piezas que aparecen en el documento: el informe, la obra a la
// que pertenece y el coordinador que lo firma (su nº de registro IRSST es lo que
// da validez legal al documento).

import { type Informe } from "@/domain/informe/informe";
import { type Proyecto } from "@/domain/proyecto/proyecto";
import { type Promotor } from "@/domain/promotor/promotor";
import { type Coordinador } from "@/domain/coordinador/coordinador";

export interface DatosDelPdf {
  informe: Informe;
  proyecto: Proyecto;
  /** Puede faltar si el promotor se borró; el PDF lo indica en vez de mentir. */
  promotor: Promotor | null;
  coordinador: Coordinador;
}

export interface PdfPort {
  /** Genera el PDF del informe y lo devuelve como archivo. */
  generar(datos: DatosDelPdf): Promise<Blob>;
}
