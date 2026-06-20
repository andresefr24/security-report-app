---
title: README
type: strategic
updated: 2026-06-20
validated: true
tags: [meta]
---

# security-report-app — docs

Single source of truth for the **Informe de visita a obra** product (working name). A knowledge base for product, domain, and decision context — authored as markdown, versioned in git, read by Cowork and (manually) synced to Claude.ai project knowledge when context feels stale.

This is the project vault: the `docs/` folder of the `security-report-app` repo. See [[CONVENTIONS]] before editing.

## Start here

- [[active-context]] — what we know, what's decided, what's next. Read this first every session.
- [[product-overview]] — what the product is, who it's for, the scope of phase 1.
- [[domain-model]] — the four core entities and how they relate. The conceptual heart of the KB.

## Domain

- [[entity-coordinador]] — the only operator of the system.
- [[entity-promotor]] — the client / work owner, principal recipient.
- [[entity-proyecto]] — the construction work (obra) the reports hang off.
- [[entity-informe]] — the daily site-visit report itself.
- [[flows]] — registration of a new obra + the daily fill/sign/send flow.
- [[legal-context]] — RD 1627/1997, professional registries, data-ownership and RGPD constraints.

## Strategic & process

- [[roadmap]] — phased plan: F1 local PWA → F2 distribution & cloud repo → F3 actas / libro de incidencias.
- [[working-preferences]] — how Andrés works, communication contract, validation discipline.
- [[decisions]] — architecture and product decisions log, with the reasoning behind each.
- [[gotchas]] — technical traps discovered and how to sidestep them. Read before touching the affected area.
- [[stakeholder-questions]] — open questions awaiting the stakeholder's answer (field sets, fecha-vs-mes, etc.).
- [[reference-siac]] — SIAC (Canal de Isabel II), the reference product + its business model and competitors.
- [[tech-research]] — OpenAI API (transcription, structured outputs, key safety) and PWA→native packaging path.
- [[tech-plan-f1]] — implementation plan for Phase 1 (increments 1.1 and 1.2) on React + TS, hexagonal.
- [[design-system]] — design system normative (shadcn tokens, typography, nav, components, states). Source pieces in `../design/`.
- [[skill-candidates]] — repetitive-work patterns flagged for possible skill-ization. Gated by the rule of three.

## Validation status

Domain and legal files start `validated: false` — they are distilled from the requirements meeting plus public web research, **not yet confirmed by the stakeholder** (the coordinator). They get promoted to `validated: true` once checked against his real example report and the SIAC form. See each file's frontmatter.

## Three surfaces touch this vault

**Cowork** (the desktop Claude app) reads and edits these MDs directly. **Claude.ai chat** reads from project knowledge — sync manually when desktop chat misses recent context. **The repo** is the home; this `docs/` folder ships with the code.
