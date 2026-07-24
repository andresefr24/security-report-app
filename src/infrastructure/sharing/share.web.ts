// Adaptador del SharePort con la Web Share API, y descarga como alternativa.
//
// Reglas que vienen de gotchas#g2:
//  - Nunca `mailto:` con adjunto: el estándar no lo permite.
//  - En iOS hay que comprobar `navigator.canShare({files})` ANTES de ofrecer
//    compartir; el soporte varía entre versiones. Si no se puede, se descarga.
//  - Que el usuario cierre el diálogo de compartir NO es un error: es una
//    decisión suya (el navegador lanza AbortError). Se distingue de un fallo real.

import {
  type SharePort,
  type ResultadoCompartir,
} from "@/domain/ports/share-port";

export class WebShareAdapter implements SharePort {
  sePuedeCompartir(pdf: Blob, nombreArchivo: string): boolean {
    if (typeof navigator.canShare !== "function" || typeof navigator.share !== "function") {
      return false;
    }
    return navigator.canShare({ files: [this.comoArchivo(pdf, nombreArchivo)] });
  }

  async compartir(pdf: Blob, nombreArchivo: string): Promise<ResultadoCompartir> {
    if (!this.sePuedeCompartir(pdf, nombreArchivo)) {
      this.descargar(pdf, nombreArchivo);
      return { tipo: "descargado" };
    }

    try {
      await navigator.share({ files: [this.comoArchivo(pdf, nombreArchivo)] });
      return { tipo: "compartido" };
    } catch (error) {
      // El usuario cerró el diálogo: no ha fallado nada, no hacemos nada más.
      if (error instanceof DOMException && error.name === "AbortError") {
        return { tipo: "cancelado" };
      }
      // Falló de verdad: le damos el archivo igualmente.
      this.descargar(pdf, nombreArchivo);
      return { tipo: "descargado" };
    }
  }

  descargar(pdf: Blob, nombreArchivo: string): void {
    // Truco estándar: un enlace temporal que se pulsa solo.
    const url = URL.createObjectURL(pdf);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    // Liberamos la memoria del objeto temporal.
    URL.revokeObjectURL(url);
  }

  private comoArchivo(pdf: Blob, nombreArchivo: string): File {
    return new File([pdf], nombreArchivo, { type: "application/pdf" });
  }
}
