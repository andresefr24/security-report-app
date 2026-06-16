---
title: Product overview
type: strategic
updated: 2026-06-16
validated: true
tags: [product, vision]
---

# Informe de visita a obra (working name)

## What

A tool that lets a **Coordinador de Seguridad y Salud en fase de ejecución** produce the daily site-visit report (*informe de visita a obra*) that the law obliges him to keep, fill it with AI assistance, attach photos, capture signatures on-device, and email it to the distribution list of work stakeholders. Phase 1 is a **PWA that stores everything locally on the device** (async storage) — no backend, no cloud database, no custody of third-party data.

## Why

The coordinator is legally required (RD 1627/1997) to maintain active presence on every work he coordinates, and the site-visit report is the evidence of that presence. Today the flow is manual and clumsy: photos go iPhone → WhatsApp (to shrink them) → Android; the report is written, emailed to himself, then forwarded to the distribution list; a monthly report is later assembled from ~20 daily visits. The product collapses that into one assisted flow. The reference product that proves the shape works is **SIAC** (Canal de Isabel II) — see [[reference-siac]].

## Who

The single operator is the **coordinator** (see [[entity-coordinador]]). Everyone else is a recipient, not a user: the **promotor** (work owner, principal addressee, does not sign), plus the dirección facultativa, técnicos de PRL, the main contractor's site managers, and any subcontractor flagged with non-compliance that day (see [[entity-promotor]], [[entity-proyecto]]). Pilot users: Andrés's stakeholder and Miriam, who will dogf, use the tool separately, and audit each other's output.

## Scope of phase 1 (deliberately narrow)

- Local-only PWA: data lives in the device's async storage. No server, no shared repository, no multi-device sync.
- The tool **fills and emits** the report; the coordinator keeps his own copy via email. We do not become custodians of sensitive third-party data.
- AI-assisted filling is exploratory and expected to need real trial-and-error tuning.
- Out of scope for F1: cloud repository, multi-obra historical archive, actas de reunión, libro de incidencias. These are later phases — see [[roadmap]] — and the cloud repository is gated on legal advice (see [[legal-context]]).

## Why this is sensitive (and why F1 avoids it)

Reports are legal evidence in accident investigations and trials, and they carry sensitive commercial data of third parties, including images. Document ownership is the promotor's, though the coordinator must retain a copy as proof of presence. Holding that data centrally would put us in the path of RGPD and custody liability — so phase 1 keeps the data on the coordinator's own device and out of our hands. The custody question is revisited only with legal advice. See [[legal-context]] and [[decisions#d1-local-only-pwa]].

## The open business question

Is this fundamentally a tool **for the coordinator** or a service **for the promotor**? Legally the project belongs to the promotor and the law obliges *him* to appoint a coordinator — yet SIAC is framed as "assistance to the coordinator," and phase 1 serves the coordinator. This tension defines the eventual monetizable hook and is deliberately left open for future stakeholder interactions. See [[decisions#d2-customer-tension-open]].

## Stack

Not yet decided beyond "PWA with local async storage." To be defined when implementation starts; the OpenAI account for AI-assisted filling already exists (~23 $/mo, in Miriam's name, used by the stakeholder).
