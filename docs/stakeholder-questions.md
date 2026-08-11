---
title: Stakeholder questions
type: rolling
updated: 2026-08-11
validated: true
tags: [open-question, stakeholder]
---

# Stakeholder questions

Preguntas abiertas que necesitan respuesta del stakeholder (coordinador) o de Miren para cerrar modelo y alcance. Se resuelven en las interacciones de validación; al confirmarse, la respuesta se traslada al `entity-*` o decisión que corresponda y se marca aquí como resuelta. Newest concern first.

## Pendientes

### Q1 — Informe por fecha vs informe por mes {#q1-fecha-vs-mes}

El informe mensual, ¿es un **resumen agregado** de los diarios/semanales, o un **documento independiente** con otra estructura y otros campos? ¿Qué contiene exactamente y quién lo firma? La respuesta decide si `[[entity-informe]]` lleva un atributo `tipo` o si son dos entidades. Ver [[active-context#open-questions-blocking-confidence]].

### Q2 — Campos reales del informe de visita {#q2-campos-informe}

✅ **Resuelta (2026-08-11).** Llegaron **8 informes reales** (TPF/Getinsa "G13a-SSFE"). Modelo v2 confirmado en [[entity-informe]] y [[decisions#d9-informe-v2]].

### Q3 — Formulario de obra nueva {#q3-alta-obra}

Set de campos del alta de obra y formato del "código de obra". Ver [[entity-proyecto#open]]. Se resuelve con las pantallas del SIAC y/o la plantilla del stakeholder.

### Q4 — Campos del promotor {#q4-promotor}

Campos exactos del promotor requeridos en la cabecera del informe y en el alta de promotor. Ver [[entity-promotor#open]].

### Q5 — Geolocalización y sello temporal {#q5-geo}

¿El informe debe capturar y mostrar geolocalización + timestamp estilo SIAC? Y en concreto (pregunta del diseño): **¿la firma exige geo + sello de tiempo visibles para valer como evidencia?** Ver [[entity-informe#open]], [[reference-siac]], [[design-system#preguntas-abiertas-del-diseño]].

## Resueltas

- **Q2 — Campos del informe** → resuelta 2026-08-11 con los 8 informes reales → [[entity-informe]] / [[decisions#d9-informe-v2]].
