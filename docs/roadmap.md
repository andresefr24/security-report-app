---
title: Roadmap
type: rolling
updated: 2026-06-20
validated: true
tags: [product, planning]
---

# Roadmap

Phased plan. Each phase is gated; later phases depend on validation, feedback, or legal advice as noted. Timeline is deliberately unstated — the stakeholder framed effort as proportional to time invested, and there's an exploration cost in the AI-assisted filling that we can't estimate until we've tried it.

## Phase 1 — Local PWA (current)

The narrow, achievable core. See [[product-overview]].

**Built in two increments** (not roadmap phases): **1.1** esqueleto sin IA (perfil → promotor → obra → informe manual → PDF → compartir) and **1.2** voz + IA encima. See [[decisions#d6-f1-increments]].

**Gate antes de construir:** revisión de los prototipos de diseño con los stakeholders (auditoría dual), publicados en GitHub Pages. See [[decisions#d8-prototype-review-gate]].

- Alta de una obra ([[entity-proyecto]]) with its promotor data and distribution list — see [[flows#alta-de-obra]].
- Daily informe ([[entity-informe]]) filled with AI assistance, photos attached — see [[flows#relleno-del-informe]].
- On-device signature capture (finger on tablet/phone) for the coordinator and whoever attends the visit.
- Email send to the distribution list; coordinator keeps his own copy.
- Storage: device async storage only. No backend.

**Exit criteria:** the stakeholder can replace his manual flow for one obra end-to-end, with output good enough that he'd send it to the promotor.

## Phase 1.5 — AI tuning loop

Not a feature wave, a discipline. Stakeholder and Miren use the tool independently and audit each other's reports. We iterate the AI prompting/context with their observations until the filled reports are reliably correct. Needs: OpenAI credentials, the reference report, and example "do / don't" cases for the model.

## Phase 2 — Distribution and persistence (gated on legal advice)

- Cloud repository / multi-obra historical archive (the coordinator must retain reports for years as legal evidence).
- Multi-device sync.
- Possibly serving the promotor directly (depends on the customer-identity decision, [[decisions#d2-customer-tension-open]]).
- **Blocked until** the RGPD / data-ownership / image-custody consultation is done. See [[legal-context#open-questions]].

## Phase 3 — Adjacent documents

- Actas de reuniones de coordinación.
- Anotaciones en el libro de incidencias.

These extend the coordinator's documentary chain beyond the daily visit report. Lower priority; only after F1/F2 prove value.

## Frequency note

Reports are daily on intensive works, weekly on lighter ones (e.g. the centro cívico deportivo Los Molinos, Getafe — once a week). A monthly summary report is assembled from the daily/weekly ones — a candidate F2/F3 feature.
