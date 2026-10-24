# 0003 — Content as typed TypeScript modules

**Status:** accepted · 2026-10-21

## Context

Rooms, hotspots, items, rules, and dialogue need a home. Options were TypeScript data modules,
JSON/YAML with a schema, or a custom scripting language (SCUMM/Ink style).

## Decision

Content lives in typed TypeScript modules under `src/content/`. Ids are typed so the compiler
catches most broken references. Backed by two tests:

- **Content validation:** every referenced item, flag, hotspot, and dialogue node exists.
- **Always winnable:** a search over game states proves the win state is reachable from every
  reachable state (no dead ends).

## Alternatives

- **JSON/YAML + schema:** friendlier to non-coders, but adds a parsing layer and loses
  compile-time checks. Not needed for a solo developer.
- **Custom script language:** powerful, but a project in itself.

## Consequences

- Types act as guardrails for the agent: a typo in an item id fails the build.
- Content edits are code edits, reviewed and committed like any other change.

## Update (2026-10-24)

Ids ended up as plain `string` aliases (`ItemId`, `FlagId`, … in `src/core/types.ts`), not types
the compiler can check, so a typo in an id fails the content-validation test (`npm test`), not the
build. Where a file can import the thing, content uses its `.id` (`priceGun.id`), which the compiler
does check. `docs/adding-content.md` describes the practice.
