---
title: Entity — Promotor
type: strategic
updated: 2026-06-16
validated: false
tags: [domain, entity]
---

# Entity — Promotor

> `validated: false` — confirm fields against the "formulario de obra nueva" the stakeholder uses.

The **promotor**: the client and owner of the obra. The principal addressee of every [[entity-informe|informe]], and the legal owner of the resulting documents — though the [[entity-coordinador|coordinator]] must retain his own copy as evidence. The promotor **does not sign** and **is not a user** of the system in phase 1; he only receives.

## Role and legal basis

RD 1627/1997 makes the promotor responsible for appointing the coordinator: any obra with a project must have a coordinator en fase de ejecución, and if the project involves more than one technician, a coordinator en fase de proyecto too. Without the coordinator's designation the work cannot start. The promotor is therefore the party the legal obligation ultimately sits with — the root of the open customer-identity question ([[decisions#d2-customer-tension-open]]).

## Attributes

| Field | Notes |
|---|---|
| Nombre / razón social | The owning entity (company or public body — e.g. Canal de Isabel II as promotor in the SIAC case). |
| Datos fiscales / identificación | Captured at alta de obra. |
| Contacto(s) | Email(s) for the distribution list; the promotor is the principal addressee. |
| Relación con la obra | One promotor per [[entity-proyecto]]. |

The promotor's data is supplied by the promotor but **entered by the coordinator** at alta de obra — the coordinator opens the proyecto; the promotor provides the data. See [[flows#alta-de-obra]].

## Ownership and data sensitivity

The documents' legal property is the promotor's; the coordinator retains a copy because it's his proof of presence in any accident investigation or trial. This dual-claim is exactly why phase 1 does **not** custody data centrally — see [[legal-context#data-ownership]] and [[decisions#d1-local-only-pwa]].

## Open questions {#open}

- Exact promotor fields required on the report header / alta de obra.
- Whether, in a future phase, the promotor becomes an actual user (read-only access to reports) — tied to [[decisions#d2-customer-tension-open]].
