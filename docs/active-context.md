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

Requirements-gathering meeting held 2026-06-16 with the stakeholder (a practising Coordinador de Seguridad y Salud working in the Comunidad de Madrid). The conversation was distilled into this KB. We are at **day one**: ideas ordered, domain modeled from the meeting + public research, no code written, no prototype yet.

## What's decided

- **Build a PWA, local-only for now.** Data persists in the device's async storage. No backend, no cloud DB. See [[decisions#d1-local-only-pwa]].
- **Phase 1 is narrow:** fill + sign + email one report; coordinator keeps his own copy. We do not custody data. See [[product-overview]].
- **Four core entities:** [[entity-coordinador]], [[entity-promotor]], [[entity-proyecto]], [[entity-informe]]. Modeled in [[domain-model]].
- **The "for coordinator vs for promotor" question stays open** for future stakeholder interactions. See [[decisions#d2-customer-tension-open]].
- **Validation method:** stakeholder and Miriam use the tool separately and audit each other to avoid groupthink.

## What's next

1. **Stakeholder sends two inputs** (by WhatsApp): (a) today's real informe as a reference example, (b) the link/screens of the SIAC form (Canal de Isabel II). These convert the `validated: false` domain files into confirmed fact.
2. **Sketch the registration + fill flows** as first wireframes once the example arrives — draft already in [[flows]].
3. **Confirm the entity attributes** against the real report; promote domain files to `validated: true`.
4. **Legal consultation** on RGPD, data ownership, and image handling — required before any cloud-repository phase, not before F1. See [[legal-context#open-questions]].
5. **Get OpenAI credentials** when AI-assisted filling work starts.

## Open questions blocking confidence

- Exact field set of the *informe de visita* (no official model exists; depends on the stakeholder's template). See [[entity-informe#open]].
- Exact field set of the "formulario de obra nueva" / alta de obra. See [[entity-proyecto#open]].
- The customer-identity tension (above), deliberately deferred.
