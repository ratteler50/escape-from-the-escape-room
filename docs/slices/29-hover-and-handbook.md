# Slice 29 — Hover polish and the Handbook

**Status:** spec approved by the developer (2026-10-23), not built · **Milestone:** M4, its last slice
(added after slice 28, 2026-10-23)

## Why

Two things from the developer's play-test of slice 28:

- **The hover rectangle looks unfinished.** Over a painting, a hovered hotspot gets a faint yellow
  fill and a hard 3 px rectangle (`RoomView.style`). Hotspot bounds are boxes; the art isn't.
- **Dana has no Handbook.** They quote it constantly, the title art shows them holding it, and the
  original M1 chart starts with "Dana has Employee Handbook", but the game never gave it to them.
  This slice adds it as a plain item. A hint-book version ("Consult" points at your next step) is a
  possible later step, decided after the developer plays this one.

Decisions from the slice 29 questions (2026-10-23).

## Spec

### Hover

1. **Props over a painting:** hovering shows the name label and the cursor only, with no fill and
   no rectangle.
2. **Characters over a painting** (Reginald, Kyle, Mordecai): hovering gives the character's sprite
   a soft yellow glow that follows its outline (Phaser 4's glow filter on the sprite). Room overlays
   are rectangular patches of painting, so they get no glow.
3. **Unchanged:** "Show everything clickable" (H / ☰) keeps its rectangle outlines; `?art=off`
   placeholder shapes keep their fill, label and hover outline.

### The Handbook

4. **A new item, `handbook`, "Employee Handbook",** in Dana's starting inventory next to the
   lanyard, defined with its lines in a new `src/content/handbook.ts` pack. It has a look line, and it's never used up or taken away.
5. **⚙ Read** (an item action): Dana reads out one section, picked at random from about eight
   lines in Dana's voice, never the same line twice in a row. Each quotes a section in
   `docs/design.md`'s Handbook table, checked by a test like the loading lines'. The loading screen
   keeps its own lines.
6. **Random is a presentation-only effect:** a new `sayOneOf` effect carrying the lines (and an
   optional speaker). The core passes it through without changing state, like `sound`; the view
   picks a line and plays it as a `say`. Puzzles never depend on it, so the always-winnable test and
   e2e are unaffected. The picking is a small tested function (with an injectable random source).
   Content validation checks every `sayOneOf` has at least two non-empty lines; `explore.ts` treats
   it as presentation.
7. **Using it on things: a custom line for every hotspot.** About 28 lines (hotspots that share
   reactions, like the two Reginald hotspots, share one), plus a variant where a hotspot's state
   changes what Dana would say (STAFF ONLY open or closed, Mordecai before and after the teapot,
   the front door). For example, Reginald: "I do not take notes from management."; Kyle: "That's
   not my department." Lines quote the section that fits, and new sections go in
   `docs/design.md`'s Handbook table. **Combinations** with other items only where a joke is obvious
   (Reginald's Script, the Price Gun, the lanyards); the rest get the generic combine lines. All of
   it is say-only: no puzzle uses the Handbook, and the always-winnable test is unaffected.
8. **Icon:** a prompt in `docs/art/prompts-inventory.md` with the icon sheet attached (style) and a
   crop of the book Dana holds on the title painting (so the icon matches it). The developer
   generates it in ChatGPT and saves it to `art-inbox/`; the agent cuts it to the icon size and
   credits it in `CREDITS.md`. The title painting doesn't change.
9. **Saves:** `SAVE_FORMAT` goes to 3, so a save from before this slice shows the incompatible
   message instead of loading without the Handbook.
10. **Tests that change:** the starting inventory (`explore.test.ts`: a winning game ends holding
    the lanyard, the mug and now the Handbook), and anything else that names the starting
    inventory.

### Records

11. `docs/design.md`: slice 29 in the M4 table, M4 complete after it, and the M1 chart's
    "Dana has Employee Handbook" is now true. `docs/glossary.md` gets **sayOneOf** (presentation
    only).

## Play-testing

- **Agent:** all tests and e2e green. In the browser pane: hover a prop (label only), hover each
  character (fitted glow), H shows rectangles, `?art=off` unchanged. Read the Handbook several
  times (varied lines, no immediate repeats), and use it on Reginald, Kyle and something else.
- **Developer:** the same on a trackpad, and whether the Handbook earns its inventory slot or should
  become the hint book.

## Notes for later

- **The hint book:** "Consult" quotes the section that points at the player's next step, by
  progress. Needs a state → hint table and a test that every reachable state gets a sensible hint.
- **Fitted glow on painted props:** needs a cut-out mask per prop from each painting. Not worth it.

## Build notes

(Filled in while building.)
