# Slice 12 — Polish (M2 complete)

**Status:** built, agent play-tested · awaiting PR and developer play-test · **Milestone:** M2 (Phase D) · **Branch:** `slice-12-polish`

## Why

The systems are done; this slice smooths the rough edges noted in slices 1–11, and makes the text
speed setting visible (developer feedback on slice 9). After it, M2 is complete.

## Spec

1. **Typewriter text.** Lines type out letter by letter. Speed follows the text speed setting:
   Slow ≈ 25, Normal ≈ 45, Fast ≈ 80 characters per second. **The first click completes the line;
   the next click moves on.** The auto-advance timer starts once the line is fully typed. Skip ⏭
   still ends the whole scene at once.
2. **Speaker name tags.** Lines from anyone but Dana get a small name above them in their colour
   ("REGINALD"). Dana's lines don't: they're the player, as in the LucasArts games.
3. **Hotspot highlight on hover.** The hovered hotspot gets a bright outline, so you can see what's
   clickable and where its edges are. Off when the pointer leaves, the coin opens, or a scene plays.
4. **Hover-label fixes.**
   - The caption hides while a line is showing (no more caption on top of speech).
   - It stays fully on screen at every edge, including the top.
   - It never sticks after a redraw (room change, hotspot appearing, inventory change).
5. **Cursor feedback.** Over an **exit** (a hotspot that can take you to another room) the cursor
   becomes a directional arrow pointing toward the side of the screen the exit is on; over anything
   else it's the hand, as now. Whether a hotspot is an exit is worked out by the core from content
   (any of its verbs can lead to `goToRoom`), not hard-coded in the view.
6. **Housekeeping:**
   - `CLAUDE.md` gets the Phase C lesson: switch on a new required check only after the PR that adds
     its workflow has merged, or every other open PR waits forever for it.
   - Design doc marks M2 complete.

Out of scope: real art and sound (M4), new settings beyond text speed, mobile-specific layout.

## Acceptance checks

- `npm test` passes, including:
  - core: `isExit` (true for both doors, false for everything else, including the front door, which
    wins rather than changing room);
  - typewriter timing as a pure function: characters shown after *t* ms at each speed;
  - every earlier test stays green.
- `npm run test:e2e` passes locally (the full play-through still finishes with typing and double
  clicks per line).
- `npm run typecheck` and `npm run build` pass; **both required checks green** on the PR.
- Agent play-test: typing at all three speeds; first click completes, second advances; name tag on
  Reginald's lines and not on Dana's; outline on hover, gone on leave, coin, and scenes; caption
  hidden during speech and kept on screen at the edges; arrow cursor over both doors, hand
  elsewhere.
- Developer play-test on the trackpad.

## Plan

1. Core, test-first: `isExit`; typewriter timing helper (pure, in the view's own module, unit tested).
2. View: typewriter + name tags in `Speech`; highlight in `RoomView`; caption rules in `RoomScene`;
   exit cursor.
3. Docs: `CLAUDE.md` required-check rule; design doc M2 complete; slice notes; glossary.
4. Play-test, run e2e locally, ask to push and open the PR.

## Notes / out-of-scope ideas

- Typewriter: `typewriter.ts` holds the pure timing (unit tested). `Speech` lays the full line out
  once and shows untyped characters as spaces. The default font is monospaced, so centred, wrapped
  text never shifts while it types. The reading timer starts when the line is complete
  (reading time from the text speed minus the typing time, at least 1.2 s). `skip()` completes, then
  moves on; `finishNow()` ends at once for Skip ⏭.
- Play-tested: 0.5 s into a 104-character line at Normal, 18 visible characters (45 cps ✓); one
  click completed it with the reading timer started (4.9 s), a second click moved on; REGINALD tag in
  his colour, none on Dana's lines; outline on hover moves between hotspots and clears on the floor
  and while a line plays; caption hidden while speaking; cursors: Lair door `e-resize`, Gift Shop
  Lair Door `w-resize`, front door and everything else `pointer`. No console errors.
- `npm run test:e2e` passes locally (play-through 18.0 s with typing). Its settle loop already clicks
  repeatedly while a line shows, which fits "first click completes, second advances".
- `isExit` is derived from content (any verb can lead to `goToRoom`), with a content test pinning the
  exits to exactly the two doors.
