---
title: Entity — Informe de visita
type: strategic
updated: 2026-06-16
validated: false
tags: [domain, entity]
---

# Entity — Informe de visita

> `validated: false` — **the single most important file to validate.** No official model of the acta/informe de visita exists (colegios publish blank templates); the field set depends entirely on the stakeholder's real report. Confirm before building the form.

The **informe de visita a obra**: the daily (or weekly) report the coordinator produces per visit. The unit of work the product exists to create. It documents that the coordinator checked the contractors' compliance with the Plan de Seguridad y Salud, records orders/incidents/non-compliances, and serves as legal evidence of presence.

## What it documents (purpose)

Per colegio guidance and RD 1627/1997, the visit verifies that the contractors' own control of the planned preventive measures is working — collective protections, access control, machinery, and that concurrent firms don't create interfering risks. The report should lean preventive (review of the contractor's verification means) rather than purely reactive (listing spotted deficiencies), and it identifies the people who accompanied the coordinator and received instructions.

## Attributes (provisional)

| Field | Notes |
|---|---|
| Obra | Link to [[entity-proyecto]]. |
| Fecha y hora de la visita | SIAC adds GPS geolocation + timestamp; consider capturing location in-app. See [[reference-siac]]. |
| Coordinador | Author; signature block carries the CAM registry number ([[entity-coordinador#registry]]). |
| Observaciones / cumplimientos | Free text, AI-assisted. The body of the report. |
| Incumplimientos detectados | Per affected firm; triggers subcontractor inclusion + signature. |
| Órdenes / instrucciones impartidas | What the coordinator directed, and to whom. |
| Personas que atienden la visita | Who accompanied him and received instructions. |
| Fotos | Attached, size-reduced on capture. See [[#photos]]. |
| Firmas | See [[#recipients-and-signatures]]. |

**OPEN:** exact sections and field order — depends on the stakeholder's template and the SIAC form. See [[#open]].

## AI-assisted filling

The differentiator: the coordinator describes the visit (chat or guided form) and the AI composes the report in the expected format. Expected to need real trial-and-error tuning and good context (the organism's format, plus do/don't examples). Validated by dual independent audit — see [[working-preferences#validation-discipline-project-specific]]. OpenAI account already exists.

## Recipients and signatures {#recipients-and-signatures} {#signatures}

- **Recipients:** the obra's [[entity-proyecto#distribution-list|distribution list]]. Sent by email on finalize; the coordinator keeps his own copy. (Today he emails it to himself, then forwards — the product collapses that.)
- **Who signs:** the **coordinator** always, and **whoever attends the visit** for the main contractor (jefe de obra / jefe de producción / encargado). **Subcontractors sign only when flagged for non-compliance** that day. The **promotor never signs** — he only receives.
- **How:** finger-drawn signature captured on the device's touchscreen (tablet preferred, phone works), like signing for a parcel delivery.

## Photos {#photos}

Photos are attached to the report and reduced in size on capture — replacing today's manual iPhone → WhatsApp → Android shrink trick. Note images count as sensitive data for the future legal/RGPD review ([[legal-context#open-questions]]).

## Lifecycle and retention

Created per visit → filled (AI-assisted) → signed → emailed to the distribution list. The coordinator must retain reports for years as legal evidence; in phase 1 the durable copy is the emailed file, not the app (no historical archive — see [[decisions#d1-local-only-pwa]]). A monthly summary is later assembled from the daily/weekly reports (future feature, [[roadmap]]).

## Open questions {#open}

- The real section/field list and layout — top priority to confirm.
- Whether geolocation/timestamp (SIAC-style) should be captured and shown.
- Whether the report needs a sequential number per obra.
