---
title: Reference — SIAC (Canal de Isabel II)
type: reference
updated: 2026-06-16
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

## What to extract once the stakeholder shares it

- The exact field set of SIAC's visit report → validates [[entity-informe]].
- The "formulario de obra nueva" structure → validates [[entity-proyecto#alta-de-obra]].
- The signature/recipient model → validates [[entity-informe#recipients-and-signatures]].

## Source

- [SIAC Canal Isabel II Gestión (APK listing)](https://apkcombo.com/es/siac-canal-isabel-ii-gestion/com.cotesa.siac/); [Canal de Isabel II coordination services tender (Comunidad de Madrid)](https://contratos-publicos.comunidad.madrid/contrato-publico/servicios-asistencia-tecnica-realizacion-trabajos-coordinacion-materia-seguridad-0).
