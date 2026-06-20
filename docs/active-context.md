---
title: Active context
type: rolling
updated: 2026-06-16
validated: true
tags: [product, status]
---

# Active context

Last updated: 2026-06-16

## Where we are

Requirements-gathering meeting held 2026-06-16 with the stakeholder (a practising Coordinador de Seguridad y Salud working in the Comunidad de Madrid), distilled into this KB. A follow-up architecture conversation (also 2026-06-16) settled the technical shape: see [[decisions#d4-architecture]] and [[decisions#d5-promotor-first-class]]. Still **day one** for code — no code written, no prototype yet — but the F1 architecture and flow are now decided.

## What's decided

- **Build a PWA, local-only for now.** Data persists on device via IndexedDB (localForage). No backend, no cloud DB. See [[decisions#d1-local-only-pwa]].
- **Architecture:** DDD / Clean / Hexagonal + repository pattern; ports for persistence, AI and delivery. See [[decisions#d4-architecture]].
- **Output is a client-generated PDF** (filled report + photos + signatures), delivered via Web Share API and/or download + manual attach. No programmatic email; `mailto:` can't attach. See [[decisions#d4-architecture]].
- **AI engine = OpenAI API**, called from the client. Voice notes → transcription → context → AI-assisted filling, then a coordinator audit phase (manual + agent). Online-only; key in client, accepted for internal alpha. See [[decisions#d4-architecture]], [[flows#relleno-del-informe]].
- **Signatures are in the MVP** (finger-drawn on device). See [[entity-informe#recipients-and-signatures]].
- **Registration is a local profile** — no account, no login, no auth in F1. See [[flows#one-time-coordinator-profile]].
- **Promotor is a first-class entity**, registered before projects. See [[decisions#d5-promotor-first-class]], [[entity-promotor]].
- **Design system + prototypes via Claude design** (separate design track).
- **The "for coordinator vs for promotor" question stays open.** See [[decisions#d2-customer-tension-open]].
- **Validation method:** stakeholder and Miriam use the tool separately and audit each other to avoid groupthink.

## What's next

1. **Stakeholder sends two inputs** (by WhatsApp): (a) today's real informe as a reference example, (b) the link/screens of the SIAC form (Canal de Isabel II). These convert the `validated: false` domain files into confirmed fact and answer [[stakeholder-questions#q2-campos-informe]], [[stakeholder-questions#q3-alta-obra]].
2. **Collect & resolve stakeholder questions** — new running list in [[stakeholder-questions]] (Q1 informe fecha-vs-mes is the live design fork).
3. **Sketch the registration + fill flows** as first wireframes once the example arrives — draft already in [[flows]].
4. **Confirm the entity attributes** against the real report; promote domain files to `validated: true`.
5. **Legal consultation** on RGPD, data ownership, and image handling — before any cloud-repository phase, not before F1. See [[legal-context#open-questions]].

## Open questions blocking confidence

- The informe **por fecha vs por mes** disparity — one entity with a `tipo` attribute or two? Live fork. See [[stakeholder-questions#q1-fecha-vs-mes]].
- Exact field set of the *informe de visita* and the *formulario de obra nueva* — depend on the stakeholder's templates / SIAC. See [[stakeholder-questions]].
- The customer-identity tension (above), deliberately deferred.
