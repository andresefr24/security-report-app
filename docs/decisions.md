---
title: Decisions
type: rolling
updated: 2026-06-16
validated: true
tags: [decision, architecture]
---

# Decisions

Append-only log of architecture and product decisions, newest first. Each entry: the decision, the reasoning, and the trade-off accepted.

## D1 — Local-only PWA, async storage on device {#d1-local-only-pwa}

**Date:** 2026-06-16. **Status:** decided (phase 1).

Phase 1 is a Progressive Web App that persists all data in the device's async storage. No backend, no cloud database.

**Reasoning:** the reports are legal evidence and carry sensitive third-party commercial data and images. Keeping the data on the coordinator's own device means we never custody it, which sidesteps RGPD and data-custody liability until we've had legal advice. It also makes phase 1 small enough to ship. **Trade-off:** no multi-device sync, no shared repository, no historical archive across devices — all explicitly deferred to [[roadmap#phase-2-distribution-and-persistence-gated-on-legal-advice]]. The coordinator's durable copy in phase 1 is the emailed report, not the app.

## D2 — Customer-identity tension left open {#d2-customer-tension-open}

**Date:** 2026-06-16. **Status:** open, deferred to future stakeholder interactions.

Whether the product is fundamentally for the **coordinator** or for the **promotor** is unresolved. Legally the obra and its documents belong to the promotor, and the law obliges the promotor to appoint a coordinator — but SIAC is framed as assistance to the coordinator, and phase 1 serves the coordinator.

**Reasoning for deferring:** this defines the monetizable hook and shouldn't be guessed; it needs more stakeholder input. Phase 1 doesn't depend on resolving it. **Trade-off:** we design F1 around the coordinator-as-operator model and may have to revisit data model and distribution if F2 pivots toward serving the promotor directly.

## D3 — KB mirrors the mintstash-knowledge vault {#d3-kb-structure}

**Date:** 2026-06-16. **Status:** decided.

The `docs/` KB adopts the structure and conventions of the `mintstash-knowledge` vault (flat layout, frontmatter schema, wikilinks, README + CONVENTIONS, skill-candidates discipline), placed inside the repo rather than as a separate vault.

**Reasoning:** consistency with Andrés's other Cowork projects; the conventions are already proven. One adaptation: an `entity-` filename prefix for the four-entity domain set. **Trade-off:** the entity files are slightly denser than a single domain-model doc, accepted because modeling each entity well is the core ask. (Note: a separate `landbot-knowledge` vault referenced in the request was not found on disk; mintstash was used as the canonical pattern.)
