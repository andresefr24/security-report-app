# Prototipos — App de informes de seguridad

Esta carpeta se publica en **GitHub Pages**. La URL de revisión es siempre la misma:

**https://andresefr24.github.io/security-report-app/**

Compártela por WhatsApp con los stakeholders. No cambia aunque añadas o quites prototipos.

## Cómo añadir un prototipo nuevo

1. **Copia su `.html`** a esta carpeta (`prototypes/`). Usa un nombre limpio para URL:
   sin espacios ni acentos, en minúsculas y con guiones (p. ej. `informe-final.html`).
2. *(Opcional)* Añade su etiqueta y descripción en [`labels.json`](./labels.json),
   usando el nombre del archivo sin `.html` como clave. Si no lo haces, la portada
   genera una etiqueta automática a partir del nombre del archivo.
3. **Haz commit y push a `main`.**

Eso es todo. El GitHub Action:

- regenera `manifest.json` escaneando los `.html` de esta carpeta, y
- vuelve a desplegar la portada en GitHub Pages.

El nuevo prototipo aparece solo en la portada. No hay que tocar `index.html`.

## Archivos de esta carpeta

| Archivo | Qué es |
| --- | --- |
| `index.html` | La portada que ven los stakeholders. Lista los prototipos leyendo `manifest.json`. |
| `manifest.json` | Lista de prototipos. **Se regenera sola** en cada push; no lo edites a mano. |
| `labels.json` | Etiquetas y descripciones en español llano (opcional, editable a mano). |
| `*.html` | Los prototipos en sí. Cada uno es una página estática autocontenida. |

## Formato de `labels.json`

Mapa de `slug` (nombre de archivo sin `.html`) a sus metadatos:

```json
{
  "prototipo-1.1-movil": {
    "label": "Prototipo de la app (móvil)",
    "description": "La maqueta principal, pensada para el teléfono.",
    "featured": true,
    "order": 1
  }
}
```

- `label`: nombre que se muestra en el botón.
- `description`: frase corta bajo el nombre.
- `featured`: si es `true`, sale arriba y destacado (pensado para el prototipo principal).
- `order`: número para ordenar (menor = más arriba). Usa números altos para material técnico/secundario.

## Regenerar el manifest a mano (opcional)

No hace falta normalmente, pero si quieres comprobarlo en local:

```bash
node scripts/build-manifest.mjs
```
