# Slice 23 — The painted Break Room

**Status:** built and agent play-tested; developer play-test next · **Milestone:** M4 · runs **in parallel** with slice 22

## Why

The Break Room is the last placeholder room. Same pipeline as the Lair, minus characters: nobody
lives here (Reginald is only a voice on the intercom), so it's the painting, its overlays and its
music.

## Spec

1. **Layout sketch** `docs/art/break-room-layout.svg` at exact hotspot coordinates: Gift Shop door,
   noticeboard, time clock, fridge, vending machine, lockers, intercom.
2. **Background:** ChatGPT, from a prompt pack (`docs/art/prompts-break-room.md`). Attached: the
   Lair painting (style and palette), the layout sketch, and the icon sheet (so the painted time
   card and pay packet match their icons). A grim little staff room: humming fridge covered in
   passive-aggressive notes, a vending machine, dented lockers, a punch clock, a crackly intercom.
   **You approve it.** 1280×720 WebP; hotspot bounds and the walkable floor fitted to the painting.
3. **Overlays** (edits of enlarged crops, as for the Lair):
   - the fridge open, a strawberry yogurt pinning down a time card (`fridgeOpen`);
   - the fridge open, just the yogurt (`tookTimeCard`);
   - Dana's locker open, one spare hairnet inside (`lockerOpen`);
   - ~~the time card in the clock's slot, stamped OUT (`offDuty`)~~: replaced while building (see
     below) by the **Off-Duty Lanyard**: clocking out swaps the Staff Lanyard for the same lanyard
     with its badge flipped round to OFF DUTY, with its own icon.
4. **Music:** you pick the Break Room's track from the three kept for later rooms (whichever slice
   22 doesn't take, or the same one; `docs/audio/music.md`).
5. **Records:** `CREDITS.md`, prompts in `docs/art/`, validation and asset tests as for the Lair.

Out of scope: characters (none live here), the finale sting (slice 22: the finale is in the Gift
Shop), the ☰ button and panels (24).

## Files this slice owns (parallel with 22)

`src/content/breakRoom.ts`; `public/assets/rooms/break-room.webp`, `overlays/break-room-*`,
`audio/music/break-room.mp3`; `docs/art/break-room*`, `docs/art/prompts-break-room.md`.
Shared, append-only: `CREDITS.md` rows, one line each in `src/content/audio.ts`, `docs/audio/music.md`;
`docs/drafts.md` is regenerated. Whichever slice merges second rebases and regenerates the drafts.

## Approvals you'll be asked for

1. The background. 2. The overlays in place. 3. The music track. 4. One download batch.

## Acceptance checks

- `npm test`, typecheck, build, Playwright green.
- Agent play-test (headless screenshots): every Break Room hotspot clickable where painted, each
  overlay at its moment (fridge, time card taken, locker, clocking out), the music crossfade from
  the Gift Shop, `?art=off`.
- Developer play-test.

## Notes

- Branch `slice-23-break-room-art`, in its own worktree under `.claude/worktrees/`.
- **Changed while building (developer, 2026-10-22):** no clock overlay. Dana's line says they file
  the card back in the rack, and the painted rack's cards are too small to show OUT, so clocking out
  shows in the inventory instead: the lanyard (Kyle's reason for not selling to staff) flips to OFF
  DUTY. Content, not just art, but all in this slice's files (`breakRoom.ts`, a new icon).
- **Out of scope, for later:** the Lair's display case shows no change when opened (slice 19 decided
  it needed no overlay); the developer wants to revisit that.

## Build notes

- **Layout sketch:** the slice-15 sketch was at the right coordinates but had id labels, red
  interaction dots, a dashed floor outline and an "inventory bar" box, which a painter copies. Redrawn
  like the Lair's: props only, plus what the look lines mention (the clock's sign and card rack, the
  stuck crisps, the cent, Reginald's star, Gary's peg instead of a fourth locker), the floor carried
  on under the tray. Rendered letterboxed to 1536×1024 for ChatGPT.
- **Background** (`docs/art/break-room.md`): first attempt approved. ChatGPT returned 16:9
  (1672×941), so it scaled straight to 1280×720. Props sat about 40 px lower than sketched; bounds,
  interaction points, the entry and the floor (edge to edge, y=470–620) were fitted to the painting
  by drawing them over it. The cent was painted in the snack bin: an edit of a vending-machine crop
  moved it into the coin return, blended in permanently with `scripts/make-overlay.py`. 108 KB.
- **Overlays** (approved in place): the fridge open with the yogurt on the time card (240×256 px),
  the card gone (69×40 px), Dana's locker open with its hairnet (185×333 px). The card-gone patch is
  cut from an edit of the open-fridge edit and drawn on top of it, so the two always line up.
- **No clock overlay** (see Notes): clocking out swaps the Staff Lanyard for the **Off-Duty
  Lanyard** (badge flipped to OFF DUTY; icon an edit of the lanyard from the first icon sheet, cut
  with `scripts/cut-icons.py`). Both lanyards share "Check the number". Every win now ends holding
  the Off-Duty Lanyard and the mug (`explore.test.ts`); a new Break Room test checks Dana never holds
  both lanyards, or the wrong one.
- **Interaction points:** Dana stood in front of what just opened (the yogurt, the hairnet), so the
  fridge's moved beside it (712) and the lockers' in front of Reginald's locker (1050).
- **Music:** Sneaky Snitch (the developer's pick), re-encoded from 320 to 96 kbps: 1.6 MB. The end
  card's "Music: Kevin MacLeod" line already covers it. The Playwright play-through now ends with the
  Break Room's music still playing (the Gift Shop has none until slice 22).
- **Tests:** 421 unit tests; Playwright (play-through, console errors, autosave) green.
- **Agent play-test** (headless): every hotspot outlined over its painted prop (holding H), hover
  glow and names; each overlay at its moment and the Off-Duty Lanyard in the tray; the full game by
  real clicks; the Gift Shop → Break Room crossfade (from the title track, since the Gift Shop has no
  track on this branch: 0.65/0.05 → 0.02/0.68 over ~0.8 s, then the Break Room's alone at 0.70);
  `?art=off` draws the boxes and no overlays.
