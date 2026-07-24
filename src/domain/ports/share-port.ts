// Puerto SharePort — el contrato para entregar el PDF al coordinador.
//
// Ojo a lo que NO hace: no envía correos. `mailto:` no puede adjuntar archivos
// (gotchas#g2), así que en F1 el informe se entrega compartiéndolo desde el
// dispositivo (WhatsApp, correo, lo que el coordinador use) o descargándolo y
// adjuntándolo a mano. Los destinatarios de la obra sirven para tenerlos a mano,
// no para enviar automáticamente.

export type ResultadoCompartir =
  /** Se compartió correctamente. */
  | { tipo: "compartido" }
  /** El usuario cerró el diálogo sin compartir. No es un error. */
  | { tipo: "cancelado" }
  /** No se pudo compartir, así que se descargó el archivo. */
  | { tipo: "descargado" };

export interface SharePort {
  /**
   * ¿Puede este dispositivo compartir este archivo? En iOS el soporte no es
   * uniforme, así que hay que preguntarlo ANTES de ofrecer el botón de compartir
   * (gotchas#g2). Si devuelve false, la pantalla ofrece descargar.
   */
  sePuedeCompartir(pdf: Blob, nombreArchivo: string): boolean;

  /** Comparte el PDF; si no se puede, lo descarga. */
  compartir(pdf: Blob, nombreArchivo: string): Promise<ResultadoCompartir>;

  /** Descarga el PDF directamente, sin pasar por compartir. */
  descargar(pdf: Blob, nombreArchivo: string): void;
}
