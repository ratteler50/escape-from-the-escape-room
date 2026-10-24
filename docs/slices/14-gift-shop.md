# Slice 14 — The Gift Shop: Kyle, Mordecai, and the STAFF ONLY door

**Status:** done, merged in [#13](https://github.com/ratteler50/escape-from-the-escape-room/pull/13), 2026-10-22 · **Milestone:** M3

## Why

The Gift Shop is a stub from M2. This slice fills it with M3's first puzzle and two of its four
characters (see `docs/milestones.md`, M3 plan): Kyle, the oblivious cashier, and Mordecai, the ghost who
opens the STAFF ONLY door in exchange for a favour.

## Spec

1. **Kyle** (they/them; character id `kyle`) behind the till: earbuds in, phone out, as few words as
   possible. A dialogue tree:
   - who are you / what's going on: it's a new show feature head office forgot to mention;
   - "Can I buy a mug?": no, Dana's wearing a staff lanyard; staff can't buy merchandise. One-shot
     setup for slice 16;
   - asked about the ghost: "sick projection, is that new?";
   - **the price gun**: only once Dana has heard Mordecai's teapot complaint; Dana quotes Employee
     Handbook §14 ("staff may borrow equipment for re-pricing") and Kyle hands over the **Price Gun**
     because that is, technically, their department.
2. **Mordecai the Moderately Powerful** (character id `mordecai`), floating near the bargain bin.
   **Floating** is new: a `floats` flag on the character makes the view bob its hotspot gently up and
   down (presentation only; cutscene walks still work). A dialogue tree:
   - who are you: the wizard whose estate head office bought; woken tonight;
   - what's going on: his phylactery, sold as a $3.50 "spooky jar";
   - **the teapot**: his good teapot is in the bargain bin at $2. Sets the flag that unlocks Kyle's
     price-gun option. He can't touch anything, but he can float through walls: re-price it
     properly and he'll help.
   - Kyle can't hear him, or doesn't care: a line or two where Kyle talks over him.
3. **Bargain Bin** hotspot with the teapot. **Use the Price Gun on it** → the teapot is now
   "PRICELESS" → Mordecai, mollified, floats through the **STAFF ONLY** door (cutscene `walk`) and
   it's **open**. The Price Gun stays in the inventory, with joke lines when used on other things
   (Kyle: "Don't.").
4. **STAFF ONLY door**: locked look line; Use with the trainee badge or anything else gets refusals.
   Once open, its look line says so, but it has **no "Go through" yet**: slice 16 joins it to the
   Break Room, which slice 15 builds in parallel.
5. Existing stub hotspots (mug rack, till, cardboard Reginald, Lair door) are kept and their lines
   tidied to the M3 premise. The till belongs to Kyle now.
6. **The front door stays as it is**, including its "To be continued…" win: it's the only win until
   slice 16, and the always-winnable test needs one. Slice 16 turns it into the false exit.
7. **Layout reference** for the art pass: `docs/art/gift-shop-layout.svg`, drawn at the exact hotspot
   coordinates with clear silhouettes and empty wall space (decision 0005).
8. `docs/design.md`: the M3 slice table moves the front-door false exit and the room-to-room wiring
   into slice 16.

## Files this slice owns

`src/content/giftShop.ts`; new `src/content/kyle.ts` and `src/content/mordecai.ts` (characters,
hotspots, dialogues); `src/core/types.ts` (the `floats` field only); `src/view/RoomView.ts` (the
float animation); `src/content/world.ts` (registering characters, dialogues, items: a small merge
with slice 15 expected); `docs/art/gift-shop-layout.svg`; `docs/design.md`; this file.
**Not** `src/content/breakRoom.ts` or anything else slice 15 owns.

## Acceptance checks

- `npm test` (content validation, always-winnable, engine), typecheck, build, Playwright: all green.
- A unit test walks the chain: Mordecai's teapot line → Kyle's price-gun option appears → Price Gun →
  use on bin → STAFF ONLY open. Kyle's option doesn't appear before Mordecai's complaint.
- Agent play-test in the browser: both dialogue trees, Mordecai bobbing, the price-gun cutscene, the
  door opening; Lair ↔ Gift Shop still works; the front door still wins.
- Developer play-test.

## Notes

- Lines are drafts (`// DRAFT:`) for the developer to punch up. Kyle is deadpan, never mean; Mordecai
  is grandiose and petty. Nothing may imply magic existed before tonight.
- **For slice 16:** the STAFF ONLY door is two hotspots with opposite conditions, like Reginald:
  `staffDoor` (locked) and `staffDoorOpen` (flag `staffDoorOpen`). Add "Go through" to
  `staffDoorOpen`. Other flags: `heardTeapot` (unlocks Kyle's §14 option), `teapotRepriced`, and
  `kyleWontSellToStaff` (set by "Can I buy a mug?", for the purchase). Mordecai's hotspot is gone
  once the door opens; the finale will need him back.
- The trainee badge isn't an item, so "Badge in" is the door's Use verb. Any item on the locked door
  gets its `itemFallback` (the reader wants a proper staff badge), which will include slice 15's
  Staff Lanyard. Kyle says "Bring it back" about the Price Gun; nothing takes it back yet.
- Layout: hotspots moved left to make room (mug rack, till, bin, standee) so no hover label
  overlaps another hotspot; the Lair door and front door keep their bounds. `RoomScene` changed by
  one argument: `RoomView` now takes `world.characters` to know who floats.
- Only one-shot options that change state are `once` (the mug, the price gun, the teapot); the
  chatty ones repeat. Every independent one-shot option doubles the always-winnable state space
  (now 2128 states, was 784), and slice 15 multiplies on top of this.
- Play-tested in the dev build (port 5175) with real clicks: Lair door → Gift Shop; Kyle's tree
  before Mordecai (no §14 option), the mug refusal and "About that mug…", the ghost; Mordecai's
  greeting with Kyle talking over him, the phylactery and teapot lines; Kyle's §14 option appears
  and hands over the Price Gun; Price Gun on Kyle ("Don't."); Price Gun on the Bargain Bin: lines,
  Mordecai stops bobbing, floats to STAFF ONLY and vanishes, door open; open door has Look only;
  bin's PRICELESS look line; Continue from an autosave mid-conversation; the front door still wins.
  Mordecai bobs 8 px over a 2.4 s period. No console errors. `npm test` (285), typecheck, build,
  and the 3 Playwright tests pass.
