---
title: Conventions
type: strategic
updated: 2026-06-20
validated: true
tags: [meta, schema]
---

# Conventions

Lightweight rules for how this KB is organized. Read before adding or editing files. These are the conventions of the project vault: the `docs/` folder of the `security-report-app` repo.

## Frontmatter schema

Every MD in `docs/` carries this block at the top:

```yaml
---
title: Active context
type: rolling | strategic | reference
updated: 2026-06-16
validated: true
expires_on: 2026-09-15   # optional, omit for rolling docs
tags: [product, status]
---
```

### Field rules

- **title** — human-readable name, sentence case ("Active context", not "active-context").
- **type** — one of three:
  - `rolling` — frequently updated, no expiry. Examples: `active-context`, `roadmap`, `decisions`, `skill-candidates`.
  - `strategic` — stable but revalidated periodically. Examples: `product-overview`, `working-preferences`, the `entity-*` files.
  - `reference` — point-in-time snapshot, may go stale. Example: `reference-siac`.
- **updated** — ISO date (`YYYY-MM-DD`). Bump when body content changes meaningfully, not on every save.
- **validated** — `true` for content confirmed by Andrés or the stakeholder. `false` for content distilled from research or the meeting that a human hasn't yet checked against primary sources. Retrieval should downrank `validated: false` content and flag it as provisional.
- **expires_on** — optional ISO date. When passed, the file needs revisiting.
- **tags** — short, lowercase, no spaces.

## Filename rules

- Lowercase, hyphen-separated. `active-context.md`, not `ActiveContext.md`.
- Domain entities use the `entity-` prefix (`entity-coordinador.md`) — the one deliberate prefix, because the four entities are a cohesive named set worth grouping in search.
- No status suffixes like `-updated`. The frontmatter `updated:` field is canonical.

## Folder layout

Flat at the top. At this size, folders add friction without benefit.

```
docs/
├── README.md
├── CONVENTIONS.md
├── product-overview.md
├── active-context.md
├── roadmap.md
├── working-preferences.md
├── decisions.md
├── skill-candidates.md
├── domain-model.md
├── entity-coordinador.md
├── entity-promotor.md
├── entity-proyecto.md
├── entity-informe.md
├── flows.md
├── legal-context.md
└── reference-siac.md
```

## Wikilinks and tags

- Add wikilinks at write-time, not in refactor passes. When a file mentions an entity or a flow, link it: `[[entity-informe]]`, `[[flows#alta-de-obra]]`.
- Use tags sparingly. Prefer `#decision`, `#open-question`, `#legal` over taxonomic explosion.

## Editing discipline

- Bump `updated:` when the body changes meaningfully. Don't bump for typo fixes.
- Promote `validated: false` → `true` only after checking against a primary source (the stakeholder's real report, the SIAC form, or the BOE text). Note in the body what validated it.
- If a file goes stale, rewrite in place rather than delete. Git keeps history.

## Open-question discipline

Domain modeling at this stage outruns confirmed fact. Mark anything inferred-but-unconfirmed with an explicit **OPEN** callout in the body and, where it's a whole-file concern, `validated: false` in the frontmatter. Never bury an assumption as if it were settled.
