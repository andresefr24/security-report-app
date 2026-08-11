---
title: Propuesta — Estructura real del informe (feedback del stakeholder)
type: proposal
updated: 2026-08-11
validated: false
tags: [informe, propuesta, revisión, Q2]
---

# Propuesta de cambios — Estructura real del informe

> **Para revisión de Andrés antes de escribir código.** Recoge el feedback del stakeholder (que por fin nos pasó **8 informes reales** de referencia) y las decisiones ya acordadas con Josune. No se toca código hasta el OK. Rama: `feat/informe-estructura-real`.

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

## 5. Impacto por capa

### Dominio (`domain/informe/`)
- **`Informe`**: sustituir `contenido` + `fotos[]` + `incumplimientos[]` por:
  - `resumenSemana?: string`
  - `situacion?: string`
  - `actividades: Actividad[]` — `Actividad = { id, descripcion, fotos: Foto[] }`
- **`Foto`**: ya tiene `descripcion?` → se reutiliza como el **comentario** de la foto.
- **Firmas**: `FirmaInforme` pasa a roles `coordinador` | `recibido`. Se **elimina** `firmantes.ts` (`firmantesRequeridos`) y el campo `subcontrata`/`refId` ligado a incumplimientos.
- **Completitud** (`completitud.ts`): finalizar exige **situación rellena + al menos una actividad (con descripción) + firma del coordinador**. (Antes: contenido + firma.)

### Datos de la obra (`domain/proyecto/`)
- Añadir a `Proyecto` (aparecen en la cabecera y son estables por obra): **`contratista?`**, **`receptorNombre?`**, **`receptorEmpresa?`**.
- La `Identificación / Nº de informe` y `Tipo: INFORMATIVO` se generan/plantillan en el PDF (no hace falta capturarlos a mano; propongo un nº basado en la fecha).

### Wizard (`ui/pages/informe/`)
- De **5 pasos a 3**: **Datos de la visita → Situación y actividades → Firmas**.
  - Se elimina el paso **Incumplimientos** y el paso **Contenido**; el paso **Fotos** desaparece como paso suelto (las fotos viven dentro de cada actividad).
  - Nuevo paso **"Situación y actividades"**: campo de situación + resumen, y una lista de actividades (añadir/quitar), cada una con su descripción y sus fotos (con comentario).
- **Fotos** (`PasoFotos` → dentro de actividad): quitar `capture="environment"` para permitir **galería**; añadir el **input de comentario** por foto.

### PDF (`infrastructure/pdf/`)
- **Maquetar como los informes reales**: cabecera en tabla (obra, promotor, contratista, identificación, fecha, emisor, receptor), secciones con título en mayúsculas ("SITUACIÓN DE LA ACTUACIÓN", "DESCRIPCIÓN DE LA ACTIVIDAD"), **2 fotos por fila**, comentario en negrita debajo de cada foto, y pie con la firma del coordinador (+ IRSST) y el "Recibido por".
- `construir-documento.ts` (la función pura y testeada) se reescribe para el nuevo modelo; el adaptador pdfmake gana el layout de 2 columnas.

## 6. Lo que se ELIMINA (para que conste)

- El **paso "Incumplimientos"** del wizard.
- El campo **`contenido`** del informe (lo sustituyen situación + actividades).
- **`firmantes.ts` / `firmantesRequeridos`** y toda la regla "subcontrata con incumplimiento tiene que firmar" — no aparece en ningún informe real; solo firma el coordinador (+ opcional "Recibido por").
- Los tests asociados a lo anterior.

## 7. Lo que NO cambia

Perfil, promotores, alta de obra (salvo los 3 campos nuevos de cabecera), la mecánica de generar PDF con pdfmake y compartir (Web Share + descarga), el offline, la navegación y el despliegue en Vercel. Los puertos y la arquitectura hexagonal se mantienen.

## 8. Plan de trabajo (cuando Andrés apruebe)

1. **KB**: actualizar `docs/entity-informe.md` con la estructura confirmada y guardar los informes de referencia.
2. **Fáciles**: fotos de galería + comentarios en fotos.
3. **Dominio**: nuevo modelo (situación + actividades con fotos), completitud, quitar incumplimientos/firmantes, firmas nuevas → con tests.
4. **Datos de obra**: contratista + receptor.
5. **Wizard**: reestructurar a 3 pasos.
6. **PDF**: maquetar igual que los informes reales (2 fotos por fila, comentarios, cabecera).
7. **e2e**: actualizar el recorrido completo al nuevo flujo.

## 9. Notas y riesgos

- **Es un cambio grande sobre M3/M4 (ya en `main`).** Reescribe el modelo del informe y el wizard. Al ser F1 **local-only** y sin datos reales todavía, **no hay migración** que preocupe: los borradores viejos en un dispositivo de pruebas se pueden descartar.
- **Fidelidad visual**: el objetivo es que el PDF se parezca al real. La tipografía IBM Plex Serif sigue pendiente (nice-to-have); el maquetado (estructura, 2 fotos por fila, cabecera) sí entra aquí.
- **Alcance de la cabecera**: `contratista`/`receptor` se añaden a la obra. Si Andrés prefiere capturarlos por informe (cambian de una semana a otra), es un ajuste menor.

---

**¿Visto bueno, Andrés?** En cuanto lo apruebes, arrancamos por la KB y vamos pieza a pieza como siempre.
