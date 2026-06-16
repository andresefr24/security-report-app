---
title: README
type: strategic
updated: 2026-06-16
validated: true
tags: [meta]
---

# security-report-app — docs

Single source of truth for the **Informe de visita a obra** product (working name). A knowledge base for product, domain, and decision context — authored as markdown, versioned in git, read by Cowork and (manually) synced to Claude.ai project knowledge when context feels stale.

Structure and conventions mirror the `mintstash-knowledge` vault. See [[CONVENTIONS]] before editing.

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
- [[reference-siac]] — SIAC (Canal de Isabel II), the existing product used as reference.
- [[skill-candidates]] — repetitive-work patterns flagged for possible skill-ization. Gated by the rule of three.

## Validation status

Domain and legal files start `validated: false` — they are distilled from the requirements meeting plus public web research, **not yet confirmed by the stakeholder** (the coordinator). They get promoted to `validated: true` once checked against his real example report and the SIAC form. See each file's frontmatter.

## Three surfaces touch this vault

**Cowork** (the desktop Claude app) reads and edits these MDs directly. **Claude.ai chat** reads from project knowledge — sync manually when desktop chat misses recent context. **The repo** is the home; this `docs/` folder ships with the code.
