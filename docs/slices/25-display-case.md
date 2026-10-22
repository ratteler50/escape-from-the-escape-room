# Slice 25 — The display case shows it's open

**Status:** spec, waiting for approval · **Milestone:** M4 · after slice 24 (story fixes) merges

## Why

Opening the Lair's display case is the payoff of the first puzzle chain (arm, gum, grate, key), and
nothing on screen changes. Slice 19 decided the case needed no overlay: the painted bone stays put,
and slice 18 had already moved the scroll *under* the bone so the painting (which shows no scroll)
stays true. That was right about the scroll and wrong about the moment: the player uses the key,
hears the latch, and the case looks exactly as locked as before. The developer asked to revisit it
during slice 23.

What the painting shows (`public/assets/rooms/lair.webp`, around x 757–856, y 285–346): a glass box
with thin pale-cyan edges on a wooden pedestal, a purple velvet cushion inside, a white cartoon bone
lying on it. No lock, no cards, no scroll visible. The cork board's frame sits just above and to the
right.

## Options considered

| State | Overlay? | Why |
|---|---|---|
| **Lid open** (`caseOpen`) | **Yes (proposed)** | The one change a player expects to see when a key turns. Big enough to read at room scale; glass edges are already a strong cyan line in the painting. |
| Bone gone | No | Dana refuses to take it ("I'm not stealing set dressing"), and it's what makes the case read as a display case. |
| Scroll gone | No | The scroll was never visible (tucked under the bone), so there is nothing to remove. See the optional extra below. |
| Scroll back (`doorUnlocked`) | No | Dana tucks it back under the bone, out of sight. The lid stays open, so the overlay keeps showing. |
| Key in the lock | No | Dana leaves it in the lock, but at room scale a tiny skull key would be a few pixels. The look line carries it. |

**Optional extra (not proposed):** paint the end of the scroll peeking out from under the bone
while it's in the case (closed, and again after `doorUnlocked`), so "scroll gone" becomes visible
too. That's two more edits (a closed-lid one and an open-lid one) and two overlay entries with
`notFlag`/`flag` conditions. Say if you want it; otherwise it goes in the notes for later.

## Spec

1. **One overlay: the lid open**, shown once `caseOpen` is set and for the rest of the game (the
   scroll comes back after the door, the lid never closes). The glass top is hinged along its back
   edge and propped up, tilted back, standing above the case behind the bone. Bone and cushion
   unchanged.
   - Content: a third entry on the Lair's `art.overlays`:
     `{ image: 'assets/overlays/lair-case-open.webp', at: …, when: [{ flag: 'caseOpen' }] }`
     (position from `scripts/make-overlay.py`).
2. **Crop for the edit:** the agent cuts `art-inbox/CROP-case.png` from the painting: x 728–888,
   y 216–376 (160×160, square), enlarged to 1024×1024. The extra room above the case is for the
   raised lid; it takes in the bottom-left corner of the cork board's frame, which the prompt keeps.
3. **The prompt** (added to `docs/art/prompts-overlays.md` as section 3, same rules as 1 and 2: attach
   the crop, ask for an edit at the same size and framing; if ChatGPT redraws the whole crop, retry
   with "do not redraw; change only what I describe"). Attach `art-inbox/CROP-case.png`, save as
   `art-inbox/case-open.png`:

   > Edit this exact image. Keep everything identical: framing, size, painting style, colours,
   > lighting, the purple wall, the corner of the cork board's wooden frame at the top, the wooden
   > pedestal, the purple velvet cushion, and the white bone lying on the cushion. Change only one
   > thing: the glass display case's LID (its glass top) is open. It is hinged along the BACK edge
   > and propped up, tilted back at a steep angle, so it stands up above the case behind the bone,
   > like a museum case left open. Draw the lid the same way the rest of the case's glass is drawn:
   > thin pale-cyan edges with a faint white glint, mostly see-through, so the wall shows through it.
   > The front and side glass panels stay exactly where they are. Nothing inside the case except the
   > bone on its cushion.

   Fallback if a tilted glass lid doesn't read at room scale (checked in place): the FRONT glass
   panel swung open toward the viewer on a right-hand hinge, at a steep angle. Same prompt, that
   sentence swapped.
4. **Look lines** to match (all `// DRAFT:`; you punch them up):
   - Open, before the door: "The lid's propped open, key still in the lock. Just the bone now. Its
     card says 'BONE (DECORATIVE)'. The scroll's card says 'ANCIENT RIDDLE (REPRODUCTION)', and
     points at nothing."
   - After the door: "The scroll's tucked back under the bone. Its little card says 'ANCIENT RIDDLE
     (REPRODUCTION)'. It has never been more wrong. I've left the lid up. The Handbook covers
     opening things, not closing them."
   - Closed look, Open (locked or open) and the key lines: unchanged.
5. **Records:** a `CREDITS.md` row (as for the other Lair overlays, prompt
   `docs/art/prompts-overlays.md`); `docs/art/prompts-overlays.md` intro says "three things"; slice
   19's "display case needs none" left as history, with a pointer here; `docs/drafts.md`
   regenerated; the M4 table in `docs/design.md` gains this slice and key art and polish moves to 26.

Out of scope: the optional scroll-peeking overlay (above), a skull lock or key painted on the case,
any other Lair art.

## Files this slice owns

`src/content/lair.ts` (the overlay entry and the display case's look lines);
`public/assets/overlays/lair-case-open.webp`; `docs/art/prompts-overlays.md`; one `CREDITS.md` row;
`docs/drafts.md` (regenerated); `docs/design.md` (the M4 table).

## Approvals you'll be asked for

1. This spec (and the optional scroll-peeking extra: in or out).
2. Generating `case-open.png` yourself in ChatGPT from the prompt above.
3. The overlay shown in place in the game (screenshots before and after opening), before it's
   committed.

## Acceptance checks

- `npm test` (content validation: the overlay file exists and `caseOpen` is a real flag; drafts up to
  date; always-winnable; asset budget), typecheck, build, Playwright green.
- Agent play-test (headless screenshots if the pane can't render): the case closed at the start;
  using the key opens the lid at the latch; it stays open after the door unlocks and after a reload
  from the autosave; the new look lines; `?art=off` draws the box and no overlay.
- Developer play-test.

## Notes

- Number: slice 24 (story fixes) took the old 24, and its design doc renumbers key art and polish to
  25. This slice takes 25 and pushes key art to 26. If you'd rather fold the display case into the key
  art and polish slice instead, this spec becomes a section of that one.
- Build after slice 24 merges: both edit `src/content/lair.ts` (different lines) and `docs/drafts.md`.
