// Reduce una foto al capturarla y la devuelve como dataURL para guardarla en el
// informe. Reemplaza el apaño manual de hoy (iPhone → WhatsApp → Android) y evita
// reventar la cuota de IndexedDB, que se vigila en el M5.
//
// Objetivo: ~1 MB y 1600px de lado mayor. Calidad de sobra para documentar una
// obra sin engordar el almacenamiento. Aislado aquí para poder mockearlo en los
// tests (la compresión real no funciona en el navegador de mentira de jsdom).

import imageCompression from "browser-image-compression";

const OPCIONES = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
};

export async function comprimirFoto(archivo: File): Promise<string> {
  const comprimida = await imageCompression(archivo, OPCIONES);
  return imageCompression.getDataUrlFromFile(comprimida);
}
