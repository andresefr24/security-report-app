---
title: Decisions
type: rolling
updated: 2026-06-20
validated: true
tags: [decision, architecture]
---

# Decisions

Append-only log of architecture and product decisions, newest first. Each entry: the decision, the reasoning, and the trade-off accepted.

## D8 — Gate de revisión por stakeholders antes de ejecutar; prototipos en GitHub Pages {#d8-prototype-review-gate}

**Date:** 2026-06-20. **Status:** decided (publicación en marcha vía Claude Code).

Antes de escribir código (M0 del [[tech-plan-f1]]) hay un **gate de revisión de los prototipos con los stakeholders** (auditoría dual: stakeholder + Miren, [[working-preferences#validation-discipline-project-specific]]). Para que pedir revisiones sea sin fricción, los prototipos viven en el repo bajo **`/prototypes`** y se publican en **GitHub Pages** con auto-descubrimiento: un GitHub Action regenera un `manifest.json` en cada push y una portada lo lista. URL: `https://andresefr24.github.io/security-report-app/`. El montaje lo ejecuta Claude Code (prompt en la carpeta del proyecto: `prompt-claude-code-prototypes.md`); paso manual único = activar Pages con *Source: GitHub Actions*.

**Reasoning:** validar la forma antes de construir es barato y evita reescrituras; tener prototipos en repo + Pages reduce cada ronda de revisión a "suelta un archivo y empuja". **Trade-off:** un Action y una carpeta extra que mantener; aceptado por el ahorro recurrente.

## D7 — Design system de Claude design adoptado; dos reconciliaciones {#d7-design-system-adopted}

**Date:** 2026-06-20. **Status:** decided.

Adoptamos la entrega de diseño de Claude design para F1 ([[design-system]]; piezas en `security-report-app/design/`): shadcn/ui + tokens, navegación tab bar + maestro-detalle, editor en wizard de 5 pasos, y el flujo voz→IA→auditoría con la persona en control. Dos reconciliaciones decididas al revisar el handoff:

- **Lenguaje ubicuo:** la UI dice **«obra»** pero el agregado de dominio sigue siendo **`Proyecto`** — NO se renombra. Se acepta la divergencia término-UI / nombre-de-código.
- **Transcripción/IA:** se mantiene **D4 (OpenAI en servidor, online-only)**. El copy del diseño que decía «se transcribe en el dispositivo» se corrige; se añade nota de privacidad ([[legal-context#privacidad-ia]]).

**Reasoning:** el diseño es coherente con el vault y cierra las preguntas de diseño abiertas; renombrar Proyecto→Obra tendría coste sin valor claro en F1. **Trade-off:** divergencia ubicua que hay que tener presente al leer código vs UI.

## D6 — F1 built in two increments, skeleton-first {#d6-f1-increments}

**Date:** 2026-06-20. **Status:** decided.

F1 (the MVP) is built in two **build increments** — not roadmap phases:

- **1.1 — esqueleto sin IA:** perfil → alta de promotor → alta de obra → informe rellenado a mano → PDF → compartir. End-to-end, sin voz ni IA.
- **1.2 — voz + IA:** se añade encima; sustituye el paso "Redactar contenido" por nota de voz → transcripción → composición con IA → auditoría humana.

Ambos incrementos se entregan dentro de la **Fase 1**; NO son fases del roadmap (F1/F2/F3). La nomenclatura anterior "Capa 1 / Capa 2" = estos incrementos; preferir "incremento 1.1 / 1.2".

**Reasoning:** la IA enchufa en una única costura del flujo ("Contenido redactado") y está bloqueada por la plantilla real (Q2), así que construir el esqueleto primero de-riesga y desbloquea progreso. **Trade-off:** un editor manual que 1.2 sustituye en parte; aceptado por barato. Ver [[flows#relleno-del-informe]], [[roadmap#phase-1-local-pwa-current]].

## D5 — Promotor as a first-class entity, registered before projects {#d5-promotor-first-class}

**Date:** 2026-06-20. **Status:** decided (phase 1).

The promotor is a standalone managed entity. The coordinator registers promotores first, then creates proyectos *belonging to* a promotor. A proyecto references its promotor by id; promotor data is no longer captured inline inside the alta de obra.

**Reasoning:** one promotor owns many obras, so registering it once and reusing it is cleaner and matches reality. **Trade-off:** the flow gains an "alta de promotor" step before alta de obra. Supersedes the earlier nested-promotor model in [[domain-model]] and [[entity-promotor]]. Recipients/distribution list stay nested under the proyecto.

## D4 — Architecture: hexagonal + repository, client-side PDF, share-based delivery {#d4-architecture}

**Date:** 2026-06-20. **Status:** decided (phase 1).

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

## D3 — Project vault lives in `security-report-app/docs` {#d3-kb-structure}

**Date:** 2026-06-16. **Status:** decided.

The project vault is the `docs/` folder of the `security-report-app` repo (flat layout, frontmatter schema, wikilinks, README + CONVENTIONS, skill-candidates discipline). It ships with the code rather than living as a separate external vault.

**Reasoning:** the conventions are proven across Andrés's Cowork projects, and keeping the KB inside the repo means context travels with the code. One adaptation: an `entity-` filename prefix for the four-entity domain set. **Trade-off:** the entity files are slightly denser than a single domain-model doc, accepted because modeling each entity well is the core ask.
