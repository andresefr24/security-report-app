#!/usr/bin/env node
// Genera prototypes/manifest.json escaneando prototypes/*.html (excepto index.html).
// Las etiquetas/descripciones se toman de prototypes/labels.json si existe;
// si no, se derivan del nombre de archivo.
//
// Uso: node scripts/build-manifest.mjs

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const protoDir = join(__dirname, '..', 'prototypes');
const labelsPath = join(protoDir, 'labels.json');
const manifestPath = join(protoDir, 'manifest.json');

// slug -> "Slug Bonito": sustituye guiones por espacios y capitaliza cada palabra.
function deriveLabel(slug) {
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

async function loadLabels() {
  if (!existsSync(labelsPath)) return {};
  try {
    return JSON.parse(await readFile(labelsPath, 'utf8'));
  } catch (err) {
    console.warn(`Aviso: no se pudo leer labels.json (${err.message}). Se ignora.`);
    return {};
  }
}

async function main() {
  const labels = await loadLabels();

  const entries = (await readdir(protoDir))
    .filter((f) => f.toLowerCase().endsWith('.html') && f.toLowerCase() !== 'index.html' && !f.toLowerCase().endsWith('.dc.html'))
    .sort();

  const manifest = entries.map((file) => {
    const slug = file.replace(/\.html$/i, '');
    const meta = labels[slug] || {};
    return {
      file,
      label: meta.label ?? deriveLabel(slug),
      description: meta.description ?? '',
      featured: meta.featured === true,
      order: typeof meta.order === 'number' ? meta.order : 100,
    };
  });

  // Orden estable: featured primero, luego por 'order', luego alfabético por label.
  manifest.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return a.label.localeCompare(b.label, 'es');
  });

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`manifest.json generado con ${manifest.length} prototipo(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
