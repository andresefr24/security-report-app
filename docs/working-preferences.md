---
title: Working preferences
type: strategic
updated: 2026-06-16
validated: true
tags: [process, communication]
---

# Working preferences

How Andrés works on this project and how Claude should operate. Project-specific notes; general preferences live in Andrés's global config.

## Communication contract

Deliverables and substantive answers follow the fixed report contract: one-line **TL;DR** → **Necesito que decidas** (always present; say "nada requiere tu juicio" if empty) → conceptual body with technical detail folded → **Confianza y huecos**. Default to the conceptual level; offer technical depth rather than dumping it.

Be concise and direct. If a word can be removed without losing meaning, remove it.

## Decision-making

- Order ideas before building. The 2026-06-16 meeting explicitly ended with "no armes nada" — synthesize and propose before constructing. This KB is the result of honoring that.
- Surface decisions and gaps; never hide an assumption as settled fact. Mark inferred domain content `validated: false` until a primary source confirms it (see [[CONVENTIONS#open-question-discipline]]).

## Validation discipline (project-specific)

The AI-assisted filling is validated by **dual independent audit**: the stakeholder and Miriam each use the tool on their own and audit the other's output, so they don't bias each other. Claude's job is to fold their observations back into the prompting/context.

## Skill-ization bias

On serious projects, watch for repetitive work worth skill-izing and **flag candidates explicitly**. Bias toward NOT creating: only materialize on the third occurrence or in an explicit review pause. Candidates are parked in [[skill-candidates]], not built on sight.

## Roles on this project

Andrés designs the structure and leads the architecture (more experience); the stakeholder and Miriam are the domain experts and pilot users. It's a win-win: a daily-work tool for them, possibly monetizable, and hands-on experience for Andrés in the chosen stack.
