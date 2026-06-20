---
title: Working preferences
type: strategic
updated: 2026-06-20
validated: true
tags: [process, communication]
---

# Working preferences

How Andrés works on this project and how Claude should operate. Project-specific notes; general preferences live in Andrés's global config.

## Communication contract

Deliverables and substantive answers follow the fixed report contract: one-line **TL;DR** → **Necesito que decidas** (always present; say "nada requiere tu juicio" if empty) → conceptual body with technical detail folded → **Confianza y huecos**. Default to the conceptual level; offer technical depth rather than dumping it.

Be concise and direct. If a word can be removed without losing meaning, remove it.

## Outward language — plain Spanish, no jargon {#outward-language}

**Rule (always on for anything user-facing).** All copy the user or stakeholders see — UI text, the report PDF, emails, onboarding, error messages, help — is written in plain, human Spanish with **no technical anglicisms**. Say "guardado en el dispositivo" not "async storage", "compartir el PDF" not "Web Share", "aplicación" not "app/PWA". If a Spanish word exists, use it; explain any unavoidable term in everyday language.

**Why:** the two pilot stakeholders are safety-and-health supervisors aged ~63+. Clarity for them is a hard requirement, not a stylistic nicety. This rule governs **outward communication only** — internal KB docs (decisions, entity files) may keep precise technical terms.

## Design constraints (for the Claude design phase) {#design-constraints}

- **Legibility for presbyopia.** Interfaces must be comfortably readable by users with presbyopia (age-related farsightedness): generous base font size, high contrast, large touch targets, no small grey-on-grey text, no dense layouts. Carry this into the design system when we move to Claude design.

## Decision-making

- Order ideas before building. The 2026-06-16 meeting explicitly ended with "no armes nada" — synthesize and propose before constructing. This KB is the result of honoring that.
- Surface decisions and gaps; never hide an assumption as settled fact. Mark inferred domain content `validated: false` until a primary source confirms it (see [[CONVENTIONS#open-question-discipline]]).

## Validation discipline (project-specific)

The AI-assisted filling is validated by **dual independent audit**: the stakeholder and Miren each use the tool on their own and audit the other's output, so they don't bias each other. Claude's job is to fold their observations back into the prompting/context. The same dual audit **gates the design prototypes before any code is written** — see [[decisions#d8-prototype-review-gate]].

## Skill-ization bias

On serious projects, watch for repetitive work worth skill-izing and **flag candidates explicitly**. Bias toward NOT creating: only materialize on the third occurrence or in an explicit review pause. Candidates are parked in [[skill-candidates]], not built on sight.

## Roles on this project

**Andrés — PM.** Leads scope, sequencing and product decisions; co-designs the solution and guides the build. **Josune — fullstack.** Implements F1 (architecture, data layer, AI integration, PDF, UI). The stakeholder and Miren are the domain experts and pilot users who validate by dual independent audit ([[#validation-discipline-project-specific]]). Win-win: a daily-work tool for the pilots, possibly monetizable, and a clean DDD/hexagonal build for the team.
