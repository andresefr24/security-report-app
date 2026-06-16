---
title: Legal context
type: reference
updated: 2026-06-16
validated: false
tags: [legal, domain]
---

# Legal context

> `validated: false` — distilled from public sources + the meeting, **not legal advice.** A formal consultation is a required gate before any cloud-repository phase (see [[#open-questions]]).

The regulatory frame the product lives in. Shapes both the domain model and the phase-1 decision not to custody data.

## RD 1627/1997 — the core regulation

"Disposiciones mínimas de seguridad y salud en las obras de construcción." Establishes the figure of the **coordinador de seguridad y salud**, distinct in *fase de proyecto* and *fase de ejecución*. Key points relevant to the product:

- Every construction work with a project must have a coordinador en fase de ejecución; if the project involves more than one technician, also one en fase de proyecto.
- The project contains an *estudio* de seguridad y salud; the contractor writes a *plan* from it; the coordinator approves the plan; only then can the centro de trabajo open and work begin. See [[entity-proyecto#lifecycle]].
- Article 9 covers the coordinator's obligations during execution.

## Presence as a legal duty

The coordinator must maintain active presence on each obra. The daily [[entity-informe|informe de visita]] is the evidence of that presence; in an accident investigation or trial it's the *prueba fehaciente* that the coordinator was there. Failure to evidence presence engages the *ley de infracciones del orden social*. This is why retention matters — and why the coordinator keeps his own copy even though the documents belong to the promotor.

## Data ownership and sensitivity {#data-ownership}

- **Ownership:** the documents belong to the **promotor**. The **coordinator must retain a copy** as his evidence.
- **Sensitivity:** reports carry sensitive commercial data of private third parties, **including images**. Treated as legal evidence.
- **Product consequence:** phase 1 keeps data on the coordinator's device and out of our hands — we don't become custodians. See [[decisions#d1-local-only-pwa]]. Any central repository (phase 2) needs RGPD groundwork first: lawful basis, consent/checkboxes for storing third-party data and images, retention terms.

## Registries {#registries}

Coordinators are registered per autonomous community. In Madrid the registry is the **Instituto Regional de Seguridad y Salud en el Trabajo (IRSST)**, Comunidad de Madrid — the source of the registration number printed on reports (e.g. 3306). This is **distinct from the colegiado number** (professional college). To act in Madrid the coordinator registered at the IRSST (submitting homologated title, máster de PRL, the 200-hour coordinator course); the promotor requires that registration to designate him. See [[entity-coordinador#registry]].

## Reference product

**SIAC** (Canal de Isabel II) is the framing reference — a coordinator-assistance app with geolocation/timestamping. Detail in [[reference-siac]].

## Open questions — require legal advice {#open-questions}

- RGPD basis for storing third-party data and images if/when a central repository is built.
- The consent mechanism (checkboxes) by which private entities agree to us holding their data — not ownership transfer, but storage permission.
- Retention obligations and how long reports must be kept as evidence.
- Whether images carry any additional constraints (people on site, etc.).

**Gate:** none of the above blocks phase 1 (local-only). All of it blocks [[roadmap#phase-2-distribution-and-persistence-gated-on-legal-advice]].

## Sources

- RD 1627/1997 — [BOE consolidated text](https://www.boe.es/buscar/act.php?id=BOE-A-1997-22614); [INSST guía técnica](https://www.insst.es/documents/94886/6185182/g_obras+2012.pdf).
- Acta de visita (no official model) — [Fundación MUSAAT model](https://fundacionmusaat.musaat.es/media/pdf/15-Acta.pdf); [COAATGR documents](https://seguridad.coaatgr.es/wp-content/uploads/2023/09/10-D0CUMENTOS-CSS-C_P.pdf).
- IRSST registry — [Comunidad de Madrid / IRSST](https://www.comunidad.madrid/centros/instituto-regional-seguridad-salud-trabajo).
- SIAC — see [[reference-siac]].
