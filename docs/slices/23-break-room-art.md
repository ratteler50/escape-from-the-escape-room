# Slice 23 — The painted Break Room

**Status:** awaiting approval · **Milestone:** M4 · runs **in parallel** with slice 22

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
   - the time card in the clock's slot, stamped OUT (`offDuty`).
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
