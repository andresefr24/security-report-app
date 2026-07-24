// Caso de uso GenerarPdfDelInforme — "convierte este informe en su PDF".
//
// Es el caso de uso con más dependencias del proyecto, y con motivo: el documento
// reúne cuatro cosas que viven en sitios distintos (el informe, su obra, el
// promotor de esa obra y el perfil del coordinador). Aquí se juntan y se le pasan
// al PdfPort.
//
// Regla importante: sin perfil del coordinador NO se genera. El nº de registro
// IRSST es lo que da validez legal al documento; un PDF sin él no sirve.

import { type Informe } from "@/domain/informe/informe";
import { type Proyecto } from "@/domain/proyecto/proyecto";
import { type InformeRepository } from "@/domain/ports/informe-repository";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { type CoordinadorRepository } from "@/domain/ports/coordinador-repository";
import { type PdfPort } from "@/domain/ports/pdf-port";
import { fallo, exito, type Result } from "@/domain/shared/result";
import { type Id } from "@/domain/shared/id";

/**
 * Mensaje de "falta el perfil". Se exporta para que la pantalla pueda reconocer
 * ESTE fallo concreto y ofrecer un botón que lleve al perfil, en vez de dejar al
 * coordinador en un callejón sin salida.
 */
export const FALTA_EL_PERFIL = "Rellena tu perfil antes de generar el informe.";

export interface PdfGenerado {
  pdf: Blob;
  /** Nombre con el que se compartirá o descargará el archivo. */
  nombreArchivo: string;
  informe: Informe;
  /** La obra, para que la pantalla de entrega muestre sus destinatarios. */
  proyecto: Proyecto;
}

/**
 * Nombre de archivo a partir de la obra y la fecha, quitando lo que no vale en
 * un nombre de archivo (barras, dos puntos…): "Informe OB-001 - 2026-07-01.pdf".
 */
function nombreDeArchivo(codigoObra: string, fechaHora: string): string {
  const soloFecha = fechaHora.slice(0, 10);
  const limpio = `Informe ${codigoObra} - ${soloFecha}`.replace(/[\\/:*?"<>|]/g, "-");
  return `${limpio}.pdf`;
}

export class GenerarPdfDelInforme {
  constructor(
    private readonly informes: InformeRepository,
    private readonly proyectos: ProyectoRepository,
    private readonly promotores: PromotorRepository,
    private readonly coordinadores: CoordinadorRepository,
    private readonly pdf: PdfPort,
  ) {}

  async ejecutar(informeId: Id): Promise<Result<PdfGenerado>> {
    const informe = await this.informes.obtenerPorId(informeId);
    if (!informe) {
      return fallo(["Este informe ya no existe."]);
    }

    const proyecto = await this.proyectos.obtenerPorId(informe.proyectoId);
    if (!proyecto) {
      return fallo(["La obra de este informe ya no existe."]);
    }

    const coordinador = await this.coordinadores.obtener();
    if (!coordinador) {
      return fallo([FALTA_EL_PERFIL]);
    }

    // El promotor puede faltar (si se borró): el PDF lo indica en vez de mentir.
    const promotor = await this.promotores.obtenerPorId(proyecto.promotorId);

    const pdf = await this.pdf.generar({ informe, proyecto, promotor, coordinador });

    return exito({
      pdf,
      nombreArchivo: nombreDeArchivo(proyecto.codigoObra, informe.fechaHora),
      informe,
      proyecto,
    });
  }
}
