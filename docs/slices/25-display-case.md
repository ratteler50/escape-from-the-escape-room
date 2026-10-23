# Slice 25 — The display case shows its state

**Status:** approved 2026-10-22, building · **Milestone:** M4 · after slice 24 (story fixes), now merged

## Why

Opening the Lair's display case is the payoff of the first puzzle chain (arm, gum, grate, key), and
nothing on screen changes. Slice 19 decided the case needed no overlay: the painted bone stays put,
and slice 18 had already moved the scroll *under* the bone so the painting (which shows no scroll)
stays true. That was right about the scroll and wrong about the moment: the player uses the key,
hears the latch, and the case looks exactly as locked as before. The look line also promises a
scroll the player can't see. The developer asked to revisit it during slice 23.

What the painting shows (`public/assets/rooms/lair.webp`, around x 757–856, y 285–346): a glass box
with thin pale-cyan edges on a wooden pedestal, a purple velvet cushion inside, a white cartoon bone
lying on it. No lock, no cards, no scroll visible. The cork board's frame sits just above and to the
right.

## The three states

| Moment | Shows | Overlays drawn |
|---|---|---|
| Start (`caseOpen` not set) | lid closed, the scroll's end peeking out from under the bone | scroll |
| Key used (`caseOpen`) | lid open, no scroll | lid |
| After the door (`doorUnlocked`) | lid open, the scroll's end back under the bone | lid, then scroll |

Not shown: the key in the lock (a few pixels at room scale; the look line carries it) and the bone
leaving (it never does: Dana won't steal set dressing).

## Spec

1. **The lid overlay**, shown from `caseOpen` to the end of the game (the lid never closes). The
   glass top is hinged along its back edge and propped up, tilted back, standing above the case
   behind the bone. Bone and cushion unchanged.
2. **The scroll overlay:** the end of a rolled cream parchment scroll with a red ribbon (matching its
   inventory icon) sticking out from under the bone toward the front of the cushion, seen through
   the front glass. The lid edit doesn't touch the cushion, so one patch works with the lid closed
   and open. It's listed twice, because a `when` list means "all of these" and can't say "or":
   - while the case is closed: `when: [{ notFlag: 'caseOpen' }]`;
   - once Dana puts it back: `when: [{ flag: 'doorUnlocked' }]`.
   Listed after the lid entry so it draws on top. If the lid patch's feathered edge turns out to
   reach the cushion, the scroll patch is cut from an edit of the lid edit instead (as the fridge's
   card-gone patch was), and only the `doorUnlocked` entry uses it; the closed one keeps its own.
3. **Content:** three entries on the Lair's `art.overlays`, positions from `scripts/make-overlay.py`:
   ```ts
   { image: 'assets/overlays/lair-case-open.webp', at: …, when: [{ flag: 'caseOpen' }] },
   { image: 'assets/overlays/lair-case-scroll.webp', at: …, when: [{ notFlag: 'caseOpen' }] },
   { image: 'assets/overlays/lair-case-scroll.webp', at: …, when: [{ flag: 'doorUnlocked' }] },
   ```
4. **Crop for the edits:** the agent cuts `art-inbox/CROP-case.png` from the painting: x 728–888,
   y 216–376 (160×160, square), enlarged to 1024×1024. The extra room above the case is for the
   raised lid; it takes in the bottom-left corner of the cork board's frame, which the prompts keep.
   Both edits start from this same crop.
5. **The prompts**, in `docs/art/prompts-overlays.md` as sections 3a and 3b (the copy there is the
   one to use; below is the draft), same rules as 1 and 2: attach the crop, ask for an edit at the
   same size and framing; if ChatGPT redraws the whole crop, retry with "do not redraw; change only
   what I describe". Attach the scroll's inventory icon too for 3b, so the two match.

   **3a. The lid open** → attach `art-inbox/CROP-case.png`, save as `art-inbox/case-open.png`:

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

   **3b. The scroll under the bone** → attach `art-inbox/CROP-case.png` and the scroll icon
   (`art-inbox/ICON-scroll.png`, cut by the agent), save as `art-inbox/case-scroll.png`:

   > Edit the FIRST image. Keep everything identical: framing, size, painting style, colours,
   > lighting, the closed glass case, the wall, the cork board's frame, the pedestal, the purple
   > velvet cushion, and the white bone exactly where it lies. Add only one thing: a rolled-up
   > parchment scroll tucked UNDER the bone, lying on the cushion, with one end sticking out from
   > under the bone toward the front of the case so it's easy to see. It looks like the scroll in
   > the SECOND image: cream parchment, rolled, tied with a red ribbon in a bow, painted in the same
   > soft style as the bone. Give it a little shadow on the cushion. The bone stays on top of it.
6. **Look lines** to match (all `// DRAFT:`; you punch them up):
   - Closed: unchanged ("Tucked underneath it: an Ancient Riddle Scroll" is now painted).
   - Open, before the door: "The lid's propped open, key still in the lock. Just the bone now. Its
     card says 'BONE (DECORATIVE)'. The scroll's card says 'ANCIENT RIDDLE (REPRODUCTION)', and
     points at nothing."
   - After the door: "The scroll's tucked back under the bone. Its little card says 'ANCIENT RIDDLE
     (REPRODUCTION)'. It has never been more wrong. I've left the lid up. The Handbook covers
     opening things, not closing them."
   - Open (locked or open) and the key lines: unchanged.
7. **Records:** two `CREDITS.md` rows (as for the other Lair overlays, prompt
   `docs/art/prompts-overlays.md`); the pack's intro says the case's states too; slice 19's "display
   case needs none" left as history, with a pointer here; `docs/drafts.md` regenerated; the M4 table
   in `docs/design.md` gains this slice and key art and polish moves to 26.

Out of scope: a skull lock or key painted on the case, the label cards the look lines mention, any
other Lair art.

## Files this slice owns

`src/content/lair.ts` (the overlay entries and the display case's look lines);
`public/assets/overlays/lair-case-open.webp`, `lair-case-scroll.webp`;
`docs/art/prompts-overlays.md`; two `CREDITS.md` rows; `docs/drafts.md` (regenerated);
`docs/design.md` (the M4 table).

## Approvals you'll be asked for

1. This spec.
2. Generating `case-open.png` and `case-scroll.png` yourself in ChatGPT from the prompts above.
3. Both overlays shown in place in the game (screenshots of all three states), before they're
   committed.

## Acceptance checks

- `npm test` (content validation: the overlay files exist and `caseOpen` and `doorUnlocked` are real
  flags; drafts up to date; always-winnable; asset budget), typecheck, build, Playwright green.
- Agent play-test (headless screenshots if the pane can't render): the scroll's end visible in the
  closed case at the start; using the key opens the lid and the scroll's end goes; it comes back
  after the door unlocks, with the lid still open; the same after a reload from the autosave; the new
  look lines; `?art=off` draws the box and no overlays.
- Developer play-test.

## Notes

- Number: slice 24 (story fixes) took the old 24, and its design doc renumbers key art and polish to
  25. This slice takes 25 and pushes key art to 26.
- Build after slice 24 merges: both edit `src/content/lair.ts` (different lines) and `docs/drafts.md`.
- Considered and kept from the first draft: the scroll was optional, at an estimated two extra edits.
  One patch serving both states brought it down to one, so it's in (developer, 2026-10-22).
