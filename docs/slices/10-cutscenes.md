# Slice 10 — Cutscenes

**Status:** built, agent play-tested · awaiting PR and developer play-test · **Milestone:** M2 (Phase C) · **Branch:** `slice-10-cutscenes` · **Runs alongside:** slice 11 (Playwright), in its own session

## Why

Things currently teleport: Reginald jumps to his mark, Dana vanishes through doors. A few
presentation-only effects make scenes play out, and "skip the whole scene" keeps them from becoming
a chore on a replay.

## Spec

### Player-facing

1. **Reginald walks to his spotlight mark** after "ARISE!" instead of appearing there.
2. **Dana walks into the doorway** before each room change (Lair door, Gift Shop door), then the
   fade.
3. **Dana faces the way they walk.** The placeholder gets a small marker showing which way they're
   facing, so `face` is visible before real art.
4. **Skip the whole scene:** while a sequence is playing, a **"Skip ⏭"** button appears
   (bottom-right, fingertip-sized), and **Escape** does the same. Skipping finishes every remaining
   step at once: lines vanish, walks jump to their end, pauses end. Anything that matters still
   happens: items change, rooms change, the win card shows. Clicking still skips one line at a time.

### Under the hood

5. New effects, **presentation only** (the core passes them through and game state doesn't change,
   so saves and the always-winnable test are unaffected):
   - `walk { character, to: {x, y} }`: Dana, or a character drawn as a hotspot, walks to a point
     (feet position) at walking speed;
   - `pause { ms }`: wait;
   - `face { character, direction: 'left' | 'right' }`.
6. Walking a non-Dana character moves its drawn hotspot. When the flag change redraws hotspots, the
   content's position takes over, so Reginald's walk ends exactly where `reginaldOnMark` is drawn.
7. **Content validation:** every `walk`/`face` names a known character; `pause` is between 0 and
   5000 ms; walk targets are on screen.

Out of scope: parallel actions (two characters moving at once; possible later as one more effect),
camera moves, real animation frames (M4).

## Acceptance checks

- `npm test` passes, including:
  - core: `walk`, `pause`, `face` pass through without changing state;
  - content validation for the new effects;
  - the always-winnable test is unchanged in its result (same states, same solution).
- `npm run typecheck` and `npm run build` pass; CI green.
- Agent play-test: Reginald walks to his mark; Dana walks out through both doors; Dana's facing
  marker flips with direction; Skip ⏭ and Escape finish a sequence with the right end state
  (inventory, room, Reginald's position, the win card); the button only shows while a sequence plays.
- Developer play-test on the trackpad.

## Plan

1. Core, test-first: the three effect types, passed through.
2. View: an effect player for `walk` / `pause` / `face` in the queue; `PlayerSprite` facing marker;
   moving a character's drawn hotspot.
3. Skip: Skip ⏭ button + Escape; fast-forward the queue.
4. Content: Reginald's walk in the cue scene; Dana's doorway walks; validation.
5. Play-test, docs, ask to push and open the PR.

Files: `src/core/*`, `src/content/*` (not `winnable.test.ts`), `src/view/*` (not `src/main.ts`),
because slice 11 owns `src/main.ts`, the `explore()` extraction, and the e2e files.

## Notes / out-of-scope ideas

- Core: `walk`, `pause`, `face` added to `Effect`; `apply()` treats them like `say` (no state
  change). The always-winnable test result is identical (784 states, 12-step solution).
- Content helper `walk(character, x, y)` in `dsl.ts`. Reginald walks to his mark's feet (415, 420),
  then `setFlag` redraws him there as `reginaldOnMark`, so the hand-off is seamless. Dana walks into
  the doorway before each `goToRoom` and before the win.
- View: `PlayerSprite` has a facing marker (yellow triangle at head height), faces automatically
  when walking, and `finishWalk()` lands a walk instantly. `RoomView.walkCharacter` slides a
  character's drawn hotspot and returns a finisher. `RoomScene` tracks the current step's
  `finishStep`; Skip sets `skipping`, finishes the step, and the rest of the queue plays instantly:
  lines and pauses are dropped, walks land, rooms change without the fade, and the win card still
  shows. The Skip ⏭ button sits above the line-skip blocker and is shown only while busy; Escape
  skips when busy and puts away a held item otherwise.
- Play-tested: Reginald's walk sampled mid-way (x 600 → 483 → mark); Escape mid-door-scene lands in
  the Gift Shop at the entry, not busy, button hidden; facing flips left on a leftward floor walk;
  the Skip ⏭ button during the win scene lands Dana in the doorway and shows the card.
- Play-test gotcha: the page reloaded mid-test. The dev server on 5174 is no longer the one this
  session started (that was stopped); it's another Vite instance on the same checkout. Re-staged
  and repeated the checks.
- `face` for non-Dana characters does nothing visible yet (placeholder art has no facing); real art
  in M4.
