---
title: Entity — Informe de visita
type: strategic
updated: 2026-08-11
validated: true
tags: [domain, entity]
---

# Entity — Informe de visita

> `validated: true` — modelo **v2** confirmado con los **8 informes reales** del stakeholder (formato TPF/Getinsa "G13a-SSFE") y aprobado en [[decisions#d9-informe-v2]]. Sustituye al modelo provisional anterior (contenido + incumplimientos). Radiografía de ejecución: [[informe-v2-radiografia]].

El **informe de visita a obra** es la unidad de trabajo del producto: el documento (semanal o por visita) con el que el coordinador deja constancia de su presencia y de lo revisado. Es evidencia legal. Lo escribe y firma el coordinador; los demás solo lo reciben.

## Estructura (modelo v2)

Cabecera + cuerpo de situación y actividades + firmas:

- **Cabecera:** obra ([[entity-proyecto]]), promotor, **contratista**, identificación/nº (se plantilla en el PDF), fecha/hora, emisor (coordinador, con su nº IRSST) y **receptor** ("recibido por").
- **`resumenSemana?`** (opcional): el "Semana del X al Y…".
- **`situacion`**: estado general de la actuación.
- **`actividades[]`** (1..N, se añaden libremente): la unidad que se repite. `Actividad = { id, descripcion, tipo?, fotos: Foto[] }`.
  - `tipo?` (opcional, invisible por defecto): `normal | incidencia`. Una incidencia **no es un caso especial**: es una actividad más; el `tipo` solo permite marcarla para contarla/analizarla en el futuro sin complicar la pantalla.
  - `Foto = { id, imagenId, comentario? }`. El **comentario es opcional**. La imagen se guarda **aparte** (almacén de medios) y se referencia por id — no dentro del documento del informe.
- **Firmas:** `coordinador` (**obligatoria**) + `recibido` (**opcional**). El promotor no firma.

## Reglas {#recipients-and-signatures} {#signatures}

- **Finalizar exige:** situación rellena + al menos una actividad con descripción + firma del coordinador. (El comentario de foto y el receptor nunca bloquean.)
- **`receptor` en el Informe** (cambia por visita); **`contratista` en la Obra** (estable) — [[entity-proyecto]].
- **Se elimina** la regla "la subcontrata con incumplimiento firma" y el paso "Incumplimientos": no aparecen en los informes reales.
- El **nº IRSST del coordinador** va en el bloque de firma (prueba legal) — [[entity-coordinador#registry]].

## PDF

Calca visualmente los informes reales (cabecera en tabla, títulos en mayúsculas, **2 fotos por fila**, comentario en negrita bajo cada foto, firma del coordinador + "recibido por" al pie), pero se genera desde una **plantilla/config parametrizable**, no una maqueta incrustada. Ver [[decisions#d9-informe-v2]], [[design-system]].

## Ciclo de vida {#ai-assisted-filling}

Crear borrador (solo obra + fecha) → rellenar (situación + actividades, autoguardado) → firmar → generar PDF → compartir (Web Share / descarga). En F1 la copia durable es el PDF emitido, no la app ([[decisions#d1-local-only-pwa]]). El resumen mensual y la voz+IA (que rellenará situación/actividades) llegan después.

## Huecos menores {#open}

- ¿La firma necesita geolocalización + sello de tiempo para valer como evidencia? Los 8 informes reales no lo muestran; tentativamente **no** — confirmar en [[stakeholder-questions#q5-geo]].
- ¿Nº de informe secuencial por obra o derivado de la fecha? Propuesta: derivado de la fecha, se plantilla en el PDF.
