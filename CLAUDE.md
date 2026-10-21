# Escape From the Escape Room

A comedic point-and-click adventure (browser, TypeScript + Phaser 4). It is also a learning project:
the developer is practising agentic development. They have 11 years of backend experience (Java,
Python) and no game-dev experience — explain game-dev and Phaser concepts, not language basics.

Read before working: `docs/design.md` (game + milestones), `docs/glossary.md` (use these terms),
`docs/decisions/` (why things are the way they are), and the current slice in `docs/slices/`.

## Architecture rules

- `src/core/` is headless: **never import Phaser** (or anything DOM) there. State, content types,
  rules engine. Takes commands, returns effects.
- `src/view/` is Phaser: renders state, plays effects, turns input into commands. **No puzzle logic
  in the view.**
- `src/content/` holds rooms, items, rules, dialogue as typed TS data. Content changes must keep the
  content-validation and always-winnable tests green.
- Logical resolution 1280×720. Placeholder art (shapes + labels) until M4; keep art swappable.

## Workflow

Each slice: spec in `docs/slices/NN-name.md` → plan → developer approves → implement
(test-first for core logic) → agent play-tests in the browser pane → developer play-tests → commit.

- Don't start a slice without an approved spec. Don't start a milestone until the last one is playable.
- Keep changes scoped to the current slice. Note out-of-scope ideas in the slice doc instead.
- Some slices leave a small, clearly marked piece for the developer to write. Don't fill it in.
- Commit after each slice with a message describing the behaviour added.

## Commands

(Filled in by slice 1.)

## Content rules

- PG, absurdist, never mean-spirited. No deaths, no dead ends.
- Every hotspot and item has a look line. Dana is earnest and quotes the Employee Handbook.
- Agent drafts dialogue; the developer punches it up. Mark drafted jokes you're unsure of with
  `// DRAFT:` so they're easy to find.
