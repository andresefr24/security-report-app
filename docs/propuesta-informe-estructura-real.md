---
title: Propuesta — Estructura real del informe (feedback del stakeholder)
type: proposal
updated: 2026-08-12
validated: true
tags: [informe, propuesta, aprobada, Q2, d9]
---

# Propuesta de cambios — Estructura real del informe

> ✅ **Aprobada por Andrés el 2026-08-11** y formalizada en [[decisions#d9-informe-v2]]. La propuesta se aceptó casi entera, con **4 afinados** (recogidos abajo, §4b) y con las fases de ejecución pactadas con Josune el 2026-08-12 (§8).
>
> **Este documento es el registro de cómo se llegó hasta aquí.** La **fuente viva** del modelo es [[entity-informe]]; el mapa de ejecución, [[informe-v2-radiografia]]. Si algo aquí choca con esos dos, mandan ellos. Recoge el feedback del stakeholder (que por fin nos pasó **8 informes reales** de referencia). Rama: `feat/informe-estructura-real`.

## 1. Contexto

El informe era el punto `validated: false` más importante ([[stakeholder-questions#q2-campos-informe]]). Ya tenemos **los informes reales** (formato TPF/Getinsa "02_03 G13a-SSFE"), así que podemos cerrar Q2. El stakeholder ha probado la app y ha dado feedback; además pide que el PDF **se parezca visualmente** a sus informes actuales.

El coordinador de los informes reales es **Nicolás J. Morales Padrón, IRSST 3306** — exactamente el nº de registro que ya modelamos en el M1. Buena señal: la entidad `Coordinador` encaja.

## 2. El feedback (qué pide el stakeholder)

1. **Subir fotos de la galería**, no solo hechas al momento con la cámara.
2. **Comentarios en las fotos** (un texto debajo de cada una).
3. **Estructura situación → actividades → fotos**: cada informe tiene **una situación** y **una o varias actividades** (añadidas libremente), y **las fotos cuelgan de cada actividad**.
4. **Las incidencias/incumplimientos se reportan dentro de las actividades** (como texto), **no en un paso aparte**.
5. **PDF con 2 fotos por fila** para que ocupe menos hojas.
6. **El PDF debe parecerse visualmente a los informes reales** (cabecera en tabla, secciones con títulos en mayúsculas, comentarios en negrita bajo las fotos).

## 3. El modelo nuevo del informe

```
INFORME
├─ Cabecera (obra, promotor, contratista, fecha, emisor=coordinador, receptor)
├─ Resumen de la semana (texto, opcional)   ← el "Semana del X al Y…"
├─ Situación (texto)                          ← "SITUACIÓN DE LA ACTUACIÓN: …"
├─ Actividades[] (1..N, libres):
│    ├─ Descripción (texto)                   ← "DESCRIPCIÓN DE LA ACTIVIDAD: …"
│    └─ Fotos[] → cada una con su comentario debajo
└─ Firmas:
     ├─ Coordinador (obligatoria)
     └─ "Recibido por" (opcional: nombre + firma)
```

La unidad que se repite es **actividad**. Una actividad puede ser trabajo normal ("limpieza de calzada con barredora") o una incidencia ("uso de extensión eléctrica no apta IP-20"): en ambos casos es **texto + fotos**, tal como aparecen en los informes reales.

## 4. Decisiones acordadas con Josune

| # | Decisión |
|---|---|
| 1 | Se **elimina el paso "Incumplimientos"**; las incidencias van como una actividad más. |
| 2 | Firmas: **solo coordinador (obligatoria) + "Recibido por" opcional**. Se **elimina** la regla "subcontrata con incumplimiento firma" (no existe en los informes reales). |
| 3 | El "calendario de la semana" se modela como un **campo de texto "resumen" simple y opcional** arriba. |
| 4 | Cada actividad lleva **solo descripción** (texto) + fotos, tal cual los informes reales (sin título aparte). |
| 5 | Los **campos de cabecera nuevos** (contratista, receptor) **se añaden en esta vuelta**, porque el objetivo es que el PDF sea visualmente igual al real. |

## 4b. Los 4 afinados de Andrés (aprobación, D9)

| # | Afinado | Por qué |
|---|---|---|
| 1 | Cada actividad gana **`tipo?: normal \| incidencia`**, opcional e **invisible en la UI**. | Se mantiene "una incidencia es una actividad más", pero no se tira la señal estructurada: mañana se podrán contar/analizar sin rehacer el modelo. |
| 2 | **`receptor` ("recibido por") vive en el Informe**, no en la obra. En la obra solo **`contratista`**. | El receptor cambia en cada visita; el contratista es estable. Meter un dato volátil en una entidad estable se paga después. Corrige la decisión 5 de arriba. |
| 3 | El PDF se genera desde una **plantilla/config parametrizable**, no con la maqueta incrustada. | Calcamos el informe real, pero sin casarnos con un solo organismo. |
| 4 | La **persistencia "tipo backend" es un hito aparte y POSTERIOR** al cambio de modelo. | Son 4 costuras (capa DTO/mapper, `MediaStore` de imágenes por id, read-models de lista, contrato explícito con `schemaVersion`). No se mezclan dos cambios grandes a la vez. |

### Decisiones de ejecución tomadas con Josune (2026-08-12)

- **Las fotos siguen guardándose _inline_** en el informe durante este rework (`Foto.imagen` en dataURL, como hoy); solo se renombra `descripcion` → `comentario`. El salto a `imagenId` + almacén de medios llega **entero** en el hito de persistencia. Hacer medio `MediaStore` ahora sería lo peor de las dos opciones. *(Nota: [[entity-informe]] ya describe el estado final con `imagenId`; durante estas fases la implementación va un paso por detrás, a propósito.)*
- **La ubicación es un campo de la actividad, y `situacion` pasa a opcional.** Al leer los informes reales ([[maqueta-informe-real]]) se ve que cada bloque abre con `SITUACIÓN DE LA ACTUACIÓN: <ubicación>` y que ese bloque **se repite**: lo que llamábamos "la situación del informe" es en realidad **dónde ocurre cada actividad**. Por tanto: `Actividad` gana **`ubicacion?`**, el informe conserva **`situacion?`** pero **opcional** (la usa el formato B, "estado general de la obra"; el formato A no la tiene), y **finalizar pasa a exigir ≥1 actividad con descripción + firma del coordinador**, sin la situación. ⚠️ Esto **relaja la regla escrita en [[decisions#d9-informe-v2|D9]] y en [[entity-informe]]** (que exigían situación rellena): **pendiente de comunicárselo a Andrés** antes de la fase 3.
- **Los 8 informes reales NO entran en el repositorio**: contienen nombres, empresas y firmas de personas reales. Se quedan en el equipo de Josune y en el repo solo vive la **ficha de maqueta** (§5b), que describe la estructura visual sin datos personales.

## 5. Impacto por capa

### Dominio (`domain/informe/`)
- **`Informe`**: sustituir `contenido` + `fotos[]` + `incumplimientos[]` por:
  - `resumenSemana?: string`
  - `situacion?: string`
  - `actividades: Actividad[]` — `Actividad = { id, descripcion, tipo?, fotos: Foto[] }` *(afinado 1)*
  - `receptor?` — el "recibido por" de esa visita *(afinado 2)*
- **`Foto`**: ya tiene `descripcion?` → se renombra a **`comentario?`** y sigue siendo **opcional** (nunca bloquea finalizar). La imagen sigue **inline** en esta vuelta.
- **Firmas**: `FirmaInforme` pasa a roles `coordinador` | `recibido`. Se **elimina** `firmantes.ts` (`firmantesRequeridos`) y el campo `subcontrata`/`refId` ligado a incumplimientos.
- **Completitud** (`completitud.ts`): finalizar exige **situación rellena + al menos una actividad (con descripción) + firma del coordinador**. (Antes: contenido + firma.)

### Datos de la obra (`domain/proyecto/`)
- Añadir a `Proyecto` solo lo estable por obra: **`contratista?`**. El **receptor va en el Informe** (afinado 2), no aquí.
- La `Identificación / Nº de informe` y `Tipo: INFORMATIVO` se generan/plantillan en el PDF (no hace falta capturarlos a mano; propongo un nº basado en la fecha).

### Wizard (`ui/pages/informe/`)
- De **5 pasos a 3**: **Datos de la visita → Situación y actividades → Firmas**.
  - Se elimina el paso **Incumplimientos** y el paso **Contenido**; el paso **Fotos** desaparece como paso suelto (las fotos viven dentro de cada actividad).
  - Nuevo paso **"Situación y actividades"**: campo de situación + resumen, y una lista de actividades (añadir/quitar), cada una con su descripción y sus fotos (con comentario).
- **Fotos** (`PasoFotos` → dentro de actividad): quitar `capture="environment"` para permitir **galería**; añadir el **input de comentario** por foto.

### PDF (`infrastructure/pdf/`)
- **Maquetar como los informes reales**: cabecera en tabla (obra, promotor, contratista, identificación, fecha, emisor, receptor), secciones con título en mayúsculas ("SITUACIÓN DE LA ACTUACIÓN", "DESCRIPCIÓN DE LA ACTIVIDAD"), **2 fotos por fila**, comentario en negrita debajo de cada foto, y pie con la firma del coordinador (+ IRSST) y el "Recibido por".
- `construir-documento.ts` (la función pura y testeada) se reescribe para el nuevo modelo; el adaptador pdfmake gana el layout de 2 columnas.
- Los rótulos y el orden de las secciones salen de una **plantilla/config** (afinado 3), no escritos a fuego dentro de la función. La maqueta concreta a calcar está en §5b.

## 5b. Ficha de maqueta del PDF real

Los informes de referencia no viven en el repo (§4b). Su estructura visual —la que hay que calcar en el PDF— se documenta aparte, sin datos personales, en **[[maqueta-informe-real]]**. Esa ficha es la entrada de la fase 6.

## 6. Lo que se ELIMINA (para que conste)

- El **paso "Incumplimientos"** del wizard.
- El campo **`contenido`** del informe (lo sustituyen situación + actividades).
- **`firmantes.ts` / `firmantesRequeridos`** y toda la regla "subcontrata con incumplimiento tiene que firmar" — no aparece en ningún informe real; solo firma el coordinador (+ opcional "Recibido por").
- Los tests asociados a lo anterior.

## 7. Lo que NO cambia

Perfil, promotores, alta de obra (salvo los 3 campos nuevos de cabecera), la mecánica de generar PDF con pdfmake y compartir (Web Share + descarga), el offline, la navegación y el despliegue en Vercel. Los puertos y la arquitectura hexagonal se mantienen.

## 8. Fases de ejecución (pactadas el 2026-08-12)

Una PR pequeña por fase, en este orden. No se arranca una fase sin que Josune vea la anterior.

| # | Fase | Qué toca | Estado |
|---|---|---|---|
| 1 | **KB y referencia** | Este documento al día + la ficha de maqueta ([[maqueta-informe-real]]). Sin código de app. | ✅ `6dcc6a5` |
| 2 | **Lo fácil de fotos** | Permitir galería (quitar `capture="environment"`) + comentario por foto. | ✅ `5d4c9b6` |
| 3 | **Dominio** | Modelo v2 en `Informe`, fuera `contenido`/`incumplimientos`, borrar `firmantes.ts`, reescribir `completitud.ts` y sus tests. | ✅ `d458f04` |
| 4 | **Datos de la obra** | `contratista?` en `Proyecto` y en el alta de obra. | ✅ `5df1565` |
| 5 | **Asistente** | De 5 pasos a 3 (Datos → Situación y actividades → Firmas). Las fotos pasan a vivir dentro de cada actividad. | ✅ `f23ff34` |
| 6 | **PDF** | Plantilla parametrizable (`plantilla-informe.ts`) calcando [[maqueta-informe-real]]: cabecera en tabla, rótulos en mayúsculas, 2 fotos por fila, recuadro de firmas. | ✅ `b68f37f` |
| 7 | **Flujo completo** | e2e y test de flujo por el camino nuevo. | ✅ `50c438c` |

Rework **terminado** el 2026-08-12: 202 tests de unidad/componente y el e2e en verde.

Después, como hito propio: la **persistencia "tipo backend"** (afinado 4).

## 10. Lo que queda anotado para más adelante

- **Logotipos en la cabecera del PDF.** La celda está reservada y vacía; faltan los archivos de imagen.
- **El formato B (visita puntual, `G13-SSFE`).** Es otra constante de plantilla, con su párrafo legal fijo y sus rótulos (OPS, nota positiva, pendiente de visita anterior). Ver [[maqueta-informe-real]] §4.
- **Anotar las fotos** (los círculos y flechas rojas que el coordinador dibuja a mano hoy). Fuera de F1.
- **Los tipos de actividad reales** son más de dos: el `tipo` del modelo se quedó en `normal|incidencia` como dice D9, e invisible en pantalla.
- **IBM Plex Serif** en el PDF, que sigue pendiente desde el M4.

## 9. Notas y riesgos

- **Es un cambio grande sobre M3/M4 (ya en `main`).** Reescribe el modelo del informe y el wizard. Al ser F1 **local-only** y sin datos reales todavía, **no hay migración** que preocupe: los borradores viejos en un dispositivo de pruebas se pueden descartar.
- **Fidelidad visual**: el objetivo es que el PDF se parezca al real. La tipografía IBM Plex Serif sigue pendiente (nice-to-have); el maquetado (estructura, 2 fotos por fila, cabecera) sí entra aquí.
- ~~**Alcance de la cabecera**: `contratista`/`receptor` se añaden a la obra.~~ → Resuelto por el afinado 2: contratista en la obra, receptor en el informe.

---

**Aprobada** ([[decisions#d9-informe-v2]]). Ejecución en marcha por las fases de §8.
