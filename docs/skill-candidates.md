---
title: Skill candidates
type: rolling
updated: 2026-06-20
validated: true
tags: [process, skills]
---

# Skill candidates — security-report-app

Tracks candidate patterns for skill-ization identified during work but not yet materialized. Bias is toward NOT creating: a candidate is materialized only on its third independent occurrence (the rule of three) or in an explicit pre-phase review with clear ROI.

## How to use this file

- When a candidate is identified, add a row with date, pattern, where it surfaced, evidence count, and a decision.
- Do not skill-ize on first observation. Let the pattern accumulate.
- Remove a row when it's materialized (link the skill), explicitly rejected (note why), or has gone stale.

## Active candidates

| Date observed | Pattern | Where surfaced | Evidence count | Decision |
|---|---|---|---|---|
| 2026-06-16 | Requirements-meeting → structured KB distillation for a new project | This session: transcript + Granola notes → ordered ideas → entity model + flows + decisions | 1 | **Defer.** Already largely covered by the existing `vault-conversation-distill` / `ingest` skills. Re-evaluate only if a distinct, repeatable shape emerges that those skills don't fit. |
| 2026-06-16 | AI-prompt-tuning loop for form-filling (capture do/don't examples, fold audit feedback into context) | Anticipated for [[roadmap#phase-1-5-ai-tuning-loop]] | 0 (anticipated) | **Wait.** No occurrences yet. Revisit once the tuning loop runs a few times and the shape stabilizes. |
| 2026-06-20 | Publicar una entrega de prototipos para revisión de stakeholders (carpeta `/prototypes` en repo + GitHub Pages con auto-descubrimiento vía Action/manifest) | Esta sesión: prototipos `.dc.html` → prompt a Claude Code para montar Pages | 1 | **Defer (sesgo a no crear).** Útil y repetible, pero primera vez. Si reaparece una 3ª vez, materializar como skill que genere la estructura `/prototypes` + workflow. |

## Process notes

**Adding a candidate:** "⚠️ Skill candidate: [pattern]. Where: [context]. Add to skill-candidates with evidence count. Don't materialize unless third occurrence."

**Promoting:** "Candidate [name] hit the threshold. Move to materialized. Create skill at [path] with [scope]. Document the decision here."
