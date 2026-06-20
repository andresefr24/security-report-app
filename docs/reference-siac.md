---
title: Reference — SIAC (Canal de Isabel II)
type: reference
updated: 2026-06-20
validated: false
tags: [reference, market]
expires_on: 2026-12-16
---

# Reference — SIAC (Canal de Isabel II)

> `validated: false` — based on public descriptions + the meeting. Confirm against the actual SIAC screens the stakeholder will share.

**SIAC** — *Sistema Integral de Ayuda al Coordinador* — is the existing app the stakeholder uses (currently in a trial period) and the closest reference for the product's shape. Built for **Canal de Isabel II** (the public water utility of the Madrid region) as **promotor**, to support the coordinators who visit Canal's construction and maintenance works.

## What it does (per public description)

- Mobile-first support and control of the activity of safety & health coordinators across multiple works.
- **GPS geolocation + NFC** to register technicians' presence precisely and confirm attendance on site.
- **Timestamping** linked to each action — knows exactly when work was done.
- End-to-end traceability, paperless, fewer recording errors.

## Why it's the reference, and how our product differs

SIAC proves the workflow (a coordinator filling visit records on a tablet, geolocated, signed) is viable and valued — the stakeholder calls it "chimba" (excellent). Key differences for our phase 1:

- SIAC is **promotor-owned and promotor-scoped** (Canal grants access; data is Canal's). Our phase 1 is **coordinator-owned and local** — no central custody. This is the heart of the customer-identity question, [[decisions#d2-customer-tension-open]].
- Our differentiator is **AI-assisted report composition** ([[entity-informe#ai-assisted-filling]]); SIAC is form-driven.
- SIAC's **geolocation/timestamp** is a feature worth considering for our [[entity-informe]] / [[flows#relleno-del-informe]].

## Business model behind it (web research 2026-06-20 — confirmed)

The buyer is the **promotor, not the coordinator** — a decisive data point for [[decisions#d2-customer-tension-open]]. Two separate contracts make the model legible:

- **The coordination service** (the big, recurring spend): Canal, *as promotor*, periodically tenders the technical-assistance coordination of S+S for its works. Documented: expediente **60-2023** — valor estimado **~5,86 M€ over 4 years, 4 lots**, CPV 71317210-8; later withdrawn and re-tendered as **187-2024**. The party that pays is the promotor (or the consultancy that wins the AT contract and supplies the coordinators).
- **The SIAC software itself** (the small, sticky enabler): a separate *hosting, support & maintenance* contract for the SIAC tool, awarded to **COTESA** (formalized 2022). COTESA is both developer and maintainer.

**Monetization read for us:** two plays — (i) sell the tool to the promotor / contract-holder as a traceability+reporting SaaS (high ticket, long sale, sticky, what COTESA does); (ii) sell to the consultancy/independent coordinator who wants to run these contracts cheaper (low ticket, volume). Our AI-assisted filling fits (ii) to enter and (i) to scale.

## Competitors / analogues in Spain (confirmed)

- **APP Lie — Libro de Incidencias Electrónico** (COAATM): the closest analogue — on-site annotations, geolocated photos, **signature capture**, PDF generation + email, offline, actas e informes. Covers the libro de incidencias of RD 1627/1997.
- **UrbiCAD Smart Coordinadores**: S+S management for coordinators — plan approval, non-conformity reports, actas, photos, digital/handwritten signature, PDF by email/WhatsApp.
- **Control Operacional** (Línea Prevención): web app for preventive-state self-assessment and reports.
- Generic CAE/forms platforms also used in the sector (Kizeo Forms, SeguridadPRL). OBRALIA/Nalanda/CTAIMA mentioned as leads, unconfirmed.

## What to extract once the stakeholder shares it

- The exact field set of SIAC's visit report → validates [[entity-informe]].
- The "formulario de obra nueva" structure → validates [[entity-proyecto#alta-de-obra]].
- The signature/recipient model → validates [[entity-informe#recipients-and-signatures]].

## Source

- [SIAC Canal Isabel II Gestión (APK listing)](https://apkcombo.com/es/siac-canal-isabel-ii-gestion/com.cotesa.siac/); [Canal coordination tender 60-2023](https://contratos-publicos.comunidad.madrid/contrato-publico/servicios-asistencia-tecnica-realizacion-trabajos-coordinacion-materia-seguridad-0); [SIAC tool maintenance contract (COTESA)](https://www.contratos-publicos.comunidad.madrid/contrato-publico/servicio-alojamiento-soporte-mantenimiento-herramienta-siac).
- Competitors: [APP Lie](https://www.cicconstruccion.com/texto-diario/mostrar/2747678/nueva-app-gestion-obra-coordinadores-seguridad-salud), [UrbiCAD](https://www.urbicad.com/mico/smartcoordinadores.htm), [Control Operacional](https://www.lineaprevencion.com/blog/app-control-operacional-digitalizando-la-seguridad-en-las-obras-de-construccion).
