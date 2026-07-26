// Genera los iconos PNG de la PWA a partir de los SVG fuente (scripts/*.svg).
//
// Se ejecuta a mano cuando cambian los iconos: `node scripts/generar-iconos.mjs`.
// No forma parte del build. Cuando haya marca definitiva, se cambian los SVG y
// se vuelve a lanzar. Usa sharp (SVG -> PNG), que es dependencia de desarrollo.

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..");
const publico = join(raiz, "public");
const normal = join(aqui, "iconos-fuente.svg");
const maskable = join(aqui, "iconos-fuente-maskable.svg");

// [fuente, tamaño, nombre de salida]
const iconos = [
  [normal, 192, "pwa-192x192.png"],
  [normal, 512, "pwa-512x512.png"],
  [maskable, 512, "maskable-512x512.png"],
  // iOS usa su propio icono (sin transparencia ni bordes raros).
  [normal, 180, "apple-touch-icon.png"],
];

for (const [fuente, tamano, nombre] of iconos) {
  await sharp(fuente).resize(tamano, tamano).png().toFile(join(publico, nombre));
  console.log(`✓ ${nombre} (${tamano}×${tamano})`);
}
