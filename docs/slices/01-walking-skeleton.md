# Slice 1 — Walking skeleton

**Status:** awaiting approval · **Milestone:** M1

## Why

Prove every layer end to end (tooling → core → content → view → tests) before any real content
exists. After this slice, every later slice is "add a feature to a working thing".

## Spec

When I run `npm run dev` and open the page:

1. The Lich's Lair renders at 1280×720 logical, scaled to fit the window, as placeholder shapes:
   a background, a visible walkable floor area, the door, the throne, and Gary the skeleton.
2. Dana is a coloured rectangle with a "DANA" label. Left-clicking anywhere makes Dana walk to that
   point in a straight line at constant speed. Clicks outside the walkable polygon are clamped to the
   nearest point inside it.
3. Hovering over the **Gary** hotspot shows its name ("Gary") near the cursor.
4. Right-clicking Gary makes Dana walk to Gary's interaction point, then shows his look line as text
   above Dana for a few seconds.
5. The look line comes from content (`src/content/`), resolved by the core rules engine — the view
   only plays the resulting `say` effect.

Out of scope: inventory, left-click interact on hotspots, dialogue, save/load, real art.

## Acceptance checks

- `npm test` passes, including:
  - core: `look` on a hotspot returns a `say` effect with that hotspot's look line;
  - core: walkable-area clamping (point inside stays put; point outside clamps to nearest edge point);
  - content validation: every hotspot has a name and look line, and ids are unique;
  - architecture: no file under `src/core/` imports `phaser`.
- `npm run typecheck` passes with strict TypeScript.
- Agent play-test in the browser pane: walk, clamp, hover label, right-click look all work.
- Developer play-test: same, plus "does it feel right?"

## Plan

1. Scaffold: `npm create vite` (vanilla-ts), add Phaser 4, Vitest; strict `tsconfig`; npm scripts
   `dev`, `build`, `test`, `typecheck`. Fill in the Commands section of `CLAUDE.md`.
2. Core types: `GameState`, `Command` (`look` only for now), `Effect` (`say` only), `Room`,
   `Hotspot`, `Point`, `Polygon`.
3. Core geometry, test-first: point-in-polygon and clamp-to-polygon.
4. Core rules engine, test-first: `handle(state, command) → { state, effects }` for `look`.
5. Content: the Lair room — walkable polygon, door/throne/Gary hotspots with placeholder look lines.
   Content-validation test.
6. Architecture test: scan `src/core/` for Phaser imports.
7. View: a Phaser `LairScene` that draws the room shapes, Dana, hover labels; handles clicks →
   walk (tween) → core command → plays `say` effects.
8. Play-test in the browser pane; fix issues; commit.

## For you to write

Once the skeleton works, add **one more hotspot** to the Lair yourself — the **Customer Reviews
board** — with a name, position, interaction point, and your own look line. If the content
validation test and the hover/look behaviour work without touching `src/core/` or `src/view/`, the
architecture is doing its job.

## Notes / out-of-scope ideas

(Record anything that comes up during the slice that belongs to a later one.)
