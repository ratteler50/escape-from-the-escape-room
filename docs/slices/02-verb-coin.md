# Slice 2 — Verb coin and Take

**Status:** awaiting approval · **Milestone:** M1 · **Decision:** `docs/decisions/0004-verb-coin.md`

## Why

Right-click is awkward on trackpads and missing on touch. Replace it with a verb coin, and make the
first verb that changes game state (Take) work, so the core has to handle real state changes:
inventory, flags, and verbs that come and go.

## Spec

1. **Coin.** Clicking a hotspot opens a ring of verb icons (👁 Look, ✋ Take, 💬 Talk, ⚙ Use)
   centred on the click, showing only that hotspot's currently available verbs, clamped on screen.
   Buttons are at least 72 logical px. Hovering or tapping a button shows its label (default verb
   name, or the hotspot's joke label).
2. Choosing a verb closes the coin; Dana walks to the interaction point, then performs it.
3. Clicking anywhere else, or pressing Escape, closes the coin and does nothing else (no walk).
   While the coin is open, hotspots behind it don't react to hover.
4. **Single-verb shortcut.** A hotspot with exactly one available verb skips the coin.
5. **Right-click** on a hotspot still does Look directly (accelerator).
6. **Take Gary's arm.** Gary offers Look and ✋ "Borrow a limb". Taking it: Dana says a line, *Gary's
   Arm* goes into the inventory, and Gary's Take disappears (so Gary becomes look-only, so clicking
   him looks directly). Gary's look line changes after the arm is gone.
7. **Talk and Use** work as plain verbs that say a line (e.g. ⚙ "Sit (forbidden)" on the throne,
   💬 on Gary). Dialogue trees and item-on-target come in later slices.
8. **Inventory strip.** A bare-bones text strip along the bottom lists inventory item names. Not
   interactive yet; replaced by the real inventory UI later.

Out of scope: dialogue trees, using items on things, combining, inventory UI, save/load.

## Acceptance checks

- `npm test` passes, including:
  - core: `availableVerbs` returns the declared verbs whose conditions hold;
  - core: Take on Gary adds `garyArm` to inventory, sets a flag, says the line, and afterwards
    Take is no longer available and Look returns the post-take line;
  - core: a verb that isn't currently available throws (the view should never offer it);
  - content validation: every hotspot has Look; every item referenced by a rule exists; every item
    has a name and look line;
  - architecture guard still green.
- `npm run typecheck` and `npm run build` pass.
- Agent play-test (1280×720 viewport): coin opens with the right verbs, dismisses without walking,
  single-verb shortcut, right-click Look, taking the arm updates the strip and Gary's verbs.
- Developer play-test **on the trackpad**.

## Plan

1. Core types: `Verb`, `ItemId`, `Item`, `Condition` (flag set / not set, has / lacks item), and a
   hotspot's `verbs` map: per verb an optional joke `label`, an optional availability `when`, and an
   ordered list of `responses` (each with an optional `when` and a list of effects; first match wins).
   `GameState` gains `inventory` and `flags`. `World` gains `items`.
2. Effects gain `addItem` and `setFlag`. The engine applies state-changing effects to produce the new
   state and still returns them so the view can react (e.g. refresh the strip).
3. Core, test-first: `availableVerbs(world, state, hotspotId)` and a `verb` command replacing `look`.
4. Migrate Lair content to the verbs format; add Gary's arm, the throne's Use, Gary's Talk. Extend
   content validation.
5. View: `VerbCoin` component (separate file from `RoomScene`), single-verb shortcut, dismissal,
   right-click accelerator, inventory strip.
6. Play-test in the browser pane, fix, update docs, hand over for developer play-test.

## For you to write

Give the **door** a 💬 Talk verb with a joke label and your own line, and give the
**Customer Reviews board** (from slice 1's exercise, migrated to the new format) a ⚙ Use verb
("Leave a review"?). Again: only `src/content/` should need to change.

## Notes / out-of-scope ideas

(Record anything that comes up during the slice that belongs to a later one.)
