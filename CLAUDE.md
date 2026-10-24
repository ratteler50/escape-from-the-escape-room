# Escape From the Escape Room

A comedic point-and-click adventure (browser, TypeScript + Phaser 4). It is also a learning project:
the developer is practising agentic development. They have 11 years of backend experience (Java,
Python) and no game-dev experience — explain game-dev and Phaser concepts, not language basics.

Read before working: `docs/design.md` (the game as it is), `docs/glossary.md` (use these terms),
`docs/decisions/` (why things are the way they are), and the current slice in `docs/slices/`.
`docs/README.md` says which docs are kept current and which are records; `docs/milestones.md` has
the plans and history.

## Architecture rules

- `src/core/` is headless: **never import Phaser** (or anything DOM) there. State, content types,
  rules engine. Takes commands, returns effects.
- `src/view/` is Phaser: renders state, plays effects, turns input into commands. **No puzzle logic
  in the view.**
- `src/content/` holds rooms, items, rules, dialogue as typed TS data. Content changes must keep the
  content-validation and always-winnable tests green. `docs/adding-content.md` is the checklist for a
  new room, character, dialogue tree or puzzle.
- Logical resolution 1280×720. Art is swappable: `?art=off` draws placeholder shapes instead.

## Workflow

Each slice: spec in `docs/slices/NN-name.md` → plan → developer approves → implement
(test-first for core logic) → agent play-tests in the browser pane → developer play-tests → commit.

- Don't start a slice without an approved spec. Don't start a milestone until the last one is playable.
- Keep changes scoped to the current slice. Note out-of-scope ideas in the slice doc instead.
- Developer exercises are paused (developer's request): don't leave pieces for the developer to
  write; implement the whole slice, including any "For you to write" section.
- Commit after each slice with a message describing the behaviour added.
- Keep the current docs current (`docs/README.md`): a change that makes `design.md`, the glossary or
  `adding-content.md` wrong updates it in the same PR. Slice docs and decisions are records: add a
  status line or a dated update, don't rewrite them.

## Git and GitHub

Repo: `ratteler50/escape-from-the-escape-room` (public, MIT for code). `main` only changes through PRs.

- Each slice gets a branch (`slice-N-short-name`) and a pull request. Ask before pushing or opening
  the PR. The developer play-tests, reviews, and merges (squash merge); the agent doesn't merge.
- The PR description links the slice spec and lists what was play-tested
  (`.github/pull_request_template.md`).
- CI runs on every PR: `ci.yml` (typecheck, tests, build) and `e2e.yml` (Playwright). Both are
  required on `main`. A PR is only ready for review once both are green. Node version comes from
  `.nvmrc`.
- Make a new check **required only after the PR that adds its workflow has merged**. Otherwise
  every other open PR waits forever for a check its branch can't produce (learned in M2 Phase C).
- Parallel sessions get worktrees under `.claude/worktrees/` (ignored). Each owns a disjoint set of
  files, named in its brief.

## Commands

- `npm run dev` — dev server at http://localhost:5173 (also `.claude/launch.json` → `dev`)
- `npm test` — all Vitest tests (core, content validation, architecture guard)
- `npm run typecheck` — strict TypeScript, no emit
- `npm run build` — typecheck + production bundle in `dist/`
- `npm run drafts`, `npm run handbook` — regenerate `docs/drafts.md` and `docs/handbook.md` (tests fail
  when they're out of date)
- `npm run test:e2e` — Playwright end-to-end tests: builds, serves with `vite preview`, and plays the
  game in Chromium with real clicks (`e2e/`; CI runs them in `.github/workflows/e2e.yml`). First
  time: `npx playwright install chromium`. `e2e/game.ts` reads view internals to find click
  targets, so update it when the view's structure changes.

Play-testing: in dev builds, and in production builds opened with `?e2e` in the URL, the Phaser game
is on `window.__game`. The game opens on `TitleScene`;
`__game.scene.getScene('RoomScene').state` reads game state once a game is running. Saves live in
`localStorage` under `escape-from-the-escape-room:*`; clear those keys for a fresh start. When driving the browser pane,
set the viewport to 1280×720 so screen coordinates map to logical coordinates by a fixed scale.

## Content rules

- PG, absurdist, never mean-spirited. No deaths, no dead ends.
- Every hotspot and item has a look line. Dana is earnest and quotes the Employee Handbook.
- An item may be taken away (e.g. by a room change) only with a line explaining why.
- The agent writes finished lines, jokes included; the developer reviews them in play-tests. Mark a
  line `// DRAFT:` only to ask the developer's opinion on it (`npm run drafts` lists them).
