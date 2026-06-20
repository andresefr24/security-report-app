---
title: Decisions
type: rolling
updated: 2026-06-16
validated: true
tags: [decision, architecture]
---

# Decisions

Append-only log of architecture and product decisions, newest first. Each entry: the decision, the reasoning, and the trade-off accepted.

## D5 — Promotor as a first-class entity, registered before projects {#d5-promotor-first-class}

**Date:** 2026-06-16. **Status:** decided (phase 1).

The promotor is a standalone managed entity. The coordinator registers promotores first, then creates proyectos *belonging to* a promotor. A proyecto references its promotor by id; promotor data is no longer captured inline inside the alta de obra.

**Reasoning:** one promotor owns many obras, so registering it once and reusing it is cleaner and matches reality. **Trade-off:** the flow gains an "alta de promotor" step before alta de obra. Supersedes the earlier nested-promotor model in [[domain-model]] and [[entity-promotor]]. Recipients/distribution list stay nested under the proyecto.

## D4 — Architecture: hexagonal + repository, client-side PDF, share-based delivery {#d4-architecture}

**Date:** 2026-06-16. **Status:** decided (phase 1).

The app follows DDD / Clean / Hexagonal architecture with the repository pattern. Concrete F1 consequences:

- **Ports isolate the three volatile concerns** — persistence, AI, delivery — so the F2 backend swap is an adapter change, not a domain change. The repository pattern is what makes today's local async storage and tomorrow's cloud interchangeable.
- **Output is a PDF** (report filled + photos + signatures) **generated client-side** (e.g. pdf-make / jsPDF). The PDF is the deliverable; the KB's "email is the durable copy" is reinterpreted — the coordinator shares the PDF himself.
- **Delivery via Web Share API** (primary, mobile) **and/or download + manual attach** as fallback. No programmatic email send in F1; `mailto:` cannot attach files. The distribution list now pre-fills recipients, it does not send on its own.
- **AI engine is the OpenAI API**, called directly from the client. Transcription (voice notes → text) and report filling are **online-only**. The API key lives in the client — accepted for F1 because users are internal alpha testers who own the key. A proxy / key protection is deferred to F2.

**Reasoning:** keeps F1 backendless (consistent with [[decisions#d1-local-only-pwa]]) while leaving clean seams for F2. **Trade-off:** key exposure and online-only AI are acceptable only under the internal-alpha assumption; both must be revisited before any external user. Persistence layer is IndexedDB via localForage. Design system + prototypes come from Claude design (separate design track).

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
