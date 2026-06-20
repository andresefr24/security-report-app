---
title: Active context
type: rolling
updated: 2026-06-20
validated: true
tags: [product, status]
---

# Active context

Last updated: 2026-06-20

## Where we are

Requirements-gathering meeting held 2026-06-16 with the stakeholder (a practising Coordinador de Seguridad y Salud working in the Comunidad de Madrid), distilled into this KB. A follow-up architecture conversation on 2026-06-20 settled the technical shape: see [[decisions#d4-architecture]] and [[decisions#d5-promotor-first-class]]. Still **day one** for code — no code written, no prototype yet — but the F1 architecture and flow are now decided.

## What's decided

- **Build a PWA, local-only for now.** Data persists on device via IndexedDB (localForage). No backend, no cloud DB. See [[decisions#d1-local-only-pwa]].
- **Architecture:** DDD / Clean / Hexagonal + repository pattern; ports for persistence, AI and delivery. See [[decisions#d4-architecture]].
- **Output is a client-generated PDF** (filled report + photos + signatures), delivered via Web Share API and/or download + manual attach. No programmatic email; `mailto:` can't attach. See [[decisions#d4-architecture]].
- **AI engine = OpenAI API**, called from the client. Voice notes → transcription → context → AI-assisted filling, then a coordinator audit phase (manual + agent). Online-only; key in client, accepted for internal alpha. See [[decisions#d4-architecture]], [[flows#relleno-del-informe]].
- **Signatures are in the MVP** (finger-drawn on device). See [[entity-informe#recipients-and-signatures]].
- **Registration is a local profile** — no account, no login, no auth in F1. See [[flows#one-time-coordinator-profile]].
- **Promotor is a first-class entity**, registered before projects. See [[decisions#d5-promotor-first-class]], [[entity-promotor]].
- **Design system + prototypes via Claude design** (separate design track). Must honor: **plain Spanish, no technical anglicisms** in all user-facing copy, and **legibility for presbyopia** (users ~63+) — see [[working-preferences#outward-language]], [[working-preferences#design-constraints]].
- **The "for coordinator vs for promotor" question stays open.** See [[decisions#d2-customer-tension-open]].
- **Validation method:** stakeholder and Miren use the tool separately and audit each other to avoid groupthink.

## Decisions — resolved & pending (2026-06-20)

**Resolved:**
- F1 **skeleton-first en dos incrementos** (1.1 sin IA, 1.2 voz+IA). [[decisions#d6-f1-increments]].
- **Stack:** React + TypeScript, hexagonal. [[tech-plan-f1]].
- **Design system entregado y adoptado** (shadcn, tokens, wizard, nav, voz→IA→auditoría). [[design-system]], [[decisions#d7-design-system-adopted]]. Piezas en `security-report-app/design/`.
- **Lenguaje ubicuo:** UI «obra», dominio `Proyecto` (sin renombrar).
- **Voz/IA:** se mantiene OpenAI en servidor (D4) + nota de privacidad ([[legal-context#privacidad-ia]]).

**Team:** Andrés = PM + co-design/guidance; **Josune = fullstack implementer**. [[working-preferences#roles-on-this-project]].

**Pending:** (a) **F1 distribution** — confirmar PWA "Añadir a pantalla de inicio", empaquetado a F2 ([[tech-research#pwa-nativa]]); (b) si el hallazgo *promotor-pays* de SIAC empieza a mover [[decisions#d2-customer-tension-open]].

## Siguiente paso

1. **Publicar prototipos en GitHub Pages** — Claude Code en marcha montando `/prototypes` + Action de auto-descubrimiento (prompt en `prompt-claude-code-prototypes.md`). Paso manual único: activar Pages con *Source: GitHub Actions*. URL: `https://andresefr24.github.io/security-report-app/`.
2. **Gate de revisión con stakeholders** (auditoría dual) sobre los prototipos, antes de construir — [[decisions#d8-prototype-review-gate]].
3. **Generar los tickets M0–M9** del [[tech-plan-f1]] tras incorporar el feedback de la revisión.

Sigue bloqueado el set de campos del informe por [[stakeholder-questions#q2-campos-informe]] (el editor modular lo absorbe). Los prompts de esta fase (Claude design y Claude Code) están en la carpeta del proyecto, fuera del vault.

## What's next

1. **Stakeholder sends two inputs** (by WhatsApp): (a) today's real informe as a reference example, (b) the link/screens of the SIAC form (Canal de Isabel II). These convert the `validated: false` domain files into confirmed fact and answer [[stakeholder-questions#q2-campos-informe]], [[stakeholder-questions#q3-alta-obra]].
2. **Collect & resolve stakeholder questions** — running list in [[stakeholder-questions]] (Q1 informe fecha-vs-mes is the live design fork).
3. **Sketch the registration + fill flows** as first wireframes once the example arrives — draft already in [[flows]].
4. **Confirm the entity attributes** against the real report; promote domain files to `validated: true`.
5. **Legal consultation** on RGPD, data ownership, and image handling — before any cloud-repository phase, not before F1. See [[legal-context#open-questions]].

## Research captured (2026-06-20)

Market + tech research landed in the vault: [[reference-siac]] (business model + competitors, confirmed), [[tech-research]] (OpenAI + PWA packaging), [[gotchas]] (iOS 7-day eviction, mailto, key-in-client).

## Open questions blocking confidence

- The informe **por fecha vs por mes** disparity — one entity with a `tipo` attribute or two? Live fork. See [[stakeholder-questions#q1-fecha-vs-mes]].
- Exact field set of the *informe de visita* and the *formulario de obra nueva* — depend on the stakeholder's templates / SIAC. See [[stakeholder-questions]].
- The customer-identity tension (above), deliberately deferred.
