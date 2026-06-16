---
title: Entity — Coordinador
type: strategic
updated: 2026-06-16
validated: false
tags: [domain, entity]
---

# Entity — Coordinador

> `validated: false` — confirm fields against the stakeholder's real report signature block and the SIAC profile screen.

The **Coordinador de Seguridad y Salud en fase de ejecución**: the only operator of the system. He runs site visits, authors [[entity-informe|informes]], registers [[entity-proyecto|obras]], and manages their distribution lists. His professional registry data is what gives the reports legal weight as proof of presence.

## Role and legal basis

Defined by RD 1627/1997 (art. 9, obligations during execution). Distinct from the coordinator *en fase de proyecto*. Obliged by law to maintain active presence on every obra he coordinates; the daily [[entity-informe|informe de visita]] is how he evidences that presence (the *ley de infracciones del orden social* requires demonstrable presence). See [[legal-context]].

## Attributes

| Field | Notes |
|---|---|
| Nombre y apellidos | — |
| Profesión / titulación | e.g. ingeniero técnico de obras públicas (homologated title). |
| Nº de registro de coordinador (CAM) | **The legally load-bearing one.** Comunidad de Madrid, IRSST. Example: 3306. Goes on every report signature. See [[#registry]]. |
| Nº de colegiado | Colegio profesional (e.g. colegio de ingenieros). **Not** the number that goes on the report — distinguish from the registry number. |
| Datos de contacto / empresa | e.g. the firm "TPS Ingeniería" from which reports are emailed. |
| Firma | Captured on-device (see [[entity-informe#signatures]]). |

## Registry — the key distinction {#registry}

There are two different professional numbers and the product must not confuse them:

- **Colegiado number** — from the professional college (colegio de ingenieros). Obtained at title homologation. Identifies him as an engineer.
- **CAM coordinator registry number** — from the Instituto Regional de Seguridad y Salud en el Trabajo (IRSST) of the Comunidad de Madrid. **This is the number printed on the report signature.** Each autonomous community has its own registry; to act as coordinator in Madrid he had to register there (submitting homologated title, máster de PRL, the 200-hour coordinator course). The promotor requires this registration to designate and pay him.

**OPEN:** confirm the exact label/format the stakeholder uses on his reports, and whether the colegiado number also appears anywhere. See [[legal-context#registries]].

## Lifecycle in the product

A single coordinator profile is set up once (phase 1, one user per device). On first use he fills his profile including the registry number and captures his signature. Thereafter that data auto-populates each report. There is no multi-user account model in phase 1 — see [[product-overview#scope-of-phase-1-deliberately-narrow]].

## Open questions {#open}

- Exact signature-block fields and their order on his real reports.
- Whether the same person can hold registrations in multiple communities and the product should store more than one (he mentioned a Canarias registration history).
