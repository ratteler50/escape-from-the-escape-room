# Slice 34 — Play-test fixes, round two

**Status:** built, awaiting the developer's play-test · **Milestone:** M6, play-test polish

## Why

Another play-through of the game after slice 33 (2026-10-24) found one sizing problem and four
lines or actions that run ahead of what Dana knows, or behind it.

## Findings

1. **Kyle is too big.** Behind the counter, Kyle's head is about one and a half times Dana's, though
   Kyle stands further back. Kyle's sprite is waist-up (230 px tall) and drawn at the same half scale as
   Dana's full-body one (400 px), so a full-body Kyle would be about 420 px.
2. **The Handbook on the front door** says "The Handbook has no section on doors that put you back"
   before Dana has tried the door: the same spoiler the door's look line had in slice 33.
3. **The lanyard on the STAFF ONLY badge reader** gets the generic "Whatever that was, it wasn't a
   staff badge.", and it *is* a staff badge.
4. **"Take the cent"** is offered on the vending machine before Dana knows there's a cent.
5. **The lanyard on the locker** says "the number IS on the lanyard, in the small print. I should
   squint at it.", but doesn't unlock "Squint at the small print". Only looking at the lanyard does.

## Spec

1. **Kyle at the right size.** Kyle is drawn at about two-thirds of their current size, their waist
   still on the counter top, so they read as a little smaller than Dana, as someone further back should.
   The size is a per-character setting (presentation only), not new art. Their clickable area
   shrinks to match. Screenshots at laptop size for approval.
2. **The Handbook on the front door** has two lines, like the door's look: before trying it, Section
   9 is satisfied ("It isn't locked. Gold star, front door."); after, the current line about doors
   that put you back.
3. **The lanyard on the badge reader** gets the badge-in joke: Dana holds up the lanyard, TRAINEE in
   huge letters, and the light stays red. "It knows." The off-duty lanyard can't reach it: STAFF
   ONLY is open by the time Dana clocks out.
4. **"Take the cent"** appears once Dana has looked at the vending machine (its look mentions
   "something small and copper" in the coin return).
5. **The lanyard on the locker** unlocks the squint, as looking at the lanyard does: Dana has just
   said there's small print.
6. **Records.** Build notes; `docs/design.md` if a puzzle description changes (the cent).

Out of scope: the always-winnable explorer's efficiency, being worked out in a separate design
discussion (the next slice).

## Approvals you'll be asked for

1. Kyle's new size (a screenshot of Dana beside the counter, before and after).
2. Developer play-test.

## Acceptance checks

- `npm test` (content validation and always-winnable stay green), typecheck, build, both Playwright
  projects.
- Content tests: the Handbook's front-door line before and after trying it; the badge reader's
  lanyard line; "Take the cent" only after the look; the lanyard on the locker unlocking the squint.
- Agent play-test: Kyle beside Dana at laptop and phone size; each of the four lines in the game.
- Developer play-test.

## Notes

- Branch `slice-34-playtest-fixes-2`, from `main`.

## Build notes (2026-10-24)

- **Kyle's size.** A `Character` can have a `scale` (presentation only): the standing sprite and the
  walk are drawn at the shared sprite scale times it (`RoomView`, `Walker`). Kyle is at **0.75**,
  picked by the developer from screenshots at 0.65, 0.75 and 0.85 (0.65 looked like a child peeking
  over the counter). Their clickable area is refitted around the smaller sprite, its bottom-centre
  still on the counter top; on a phone it now gets a fingertip-sized touch area (the touch-area list
  test gains `giftShop.kyle`). `docs/adding-content.md` mentions `scale`.
- **The four lines**, each with a content test written first:
  - the Handbook on the front door: "It isn't locked. Gold star, front door." until Dana has tried
    it (the flag only picks the line, so the explorer treats it as flavour);
  - the lanyard on the badge reader: "TRAINEE, in huge letters. The light stays red. It knows.";
  - "Take the cent" appears after looking at the vending machine (`lookedAtVending`); the puzzle
    chart and the Break Room notes in `docs/design.md` now include the look;
  - the lanyard (either one) on the locker unlocks "Squint at the small print".
- **States.** `lookedAtVending` gates a verb, so it counts: the game went from about 8,350 to about
  11,230 states. It stops mattering once the cent is taken, a case for the explorer work being
  designed in a separate session.

Agent play-test (headless Chromium at 1280×720 and as a Pixel 7): Kyle beside Dana and talking (the
speech band sits above them), at both sizes; each of the four lines in the game; the cent only after
the look. No console errors.
