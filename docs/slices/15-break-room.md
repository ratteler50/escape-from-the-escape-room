# Slice 15 — The Break Room: clocking out and exact change

**Status:** built, agent play-tested · awaiting PR and developer play-test · **Milestone:** M3 · **Runs:** parallel session, alongside slice 14 · **Branch:** `slice-15-break-room`

## Why

The Break Room holds three of M3's four puzzles (see `docs/design.md`, M3 plan): Dana must clock out
to become a guest, and scrape together exactly $12.99 for the mug. No new character: object puzzles,
office comedy, and Reginald heard over the intercom.

## Spec

1. **A new room `breakRoom`**: fridge, time clock, a row of lockers, vending machine, staff
   noticeboard, intercom, and a door back to the Gift Shop (look-only for now). Entry point
   `fromGiftShop` on the floor by that door.
2. **Staff Lanyard**: Dana now **starts the game with it** (`initialState`). Look: TRAINEE, and
   an employee number. Item action "Check the number" teaches the number (sets a flag), so what
   opens the locker is what Dana *knows*, like the script and the cue.
3. **Time card**: the fridge has a passive-aggressive note ("WHOEVER KEEPS USING MY YOGURT AS A
   PAPERWEIGHT: STOP"). Opening the fridge and moving the yogurt reveals Dana's **Time Card**.
   **Use it on the Time Clock** → Dana is **off duty** (flag): legally a guest. The card stays in the
   inventory.
4. **Pay packet**: Dana's locker has a combination lock; it opens once Dana knows the employee
   number → **Pay Packet**, which holds $12.98. Its look line notices it's one cent short of a mug.
5. **One cent**: the vending machine's coin return, pressed once → **One Cent**.
6. **Combine Pay Packet + One Cent → Exact Change ($12.99)**.
7. **Reginald on the intercom**: talking to the intercom gets a few lines of Reginald "directing"
   from the Lair (he has no hotspot here, so his lines show over Dana with his name tag). Keep it to
   one-shot lines or a small dialogue; no new systems.
8. Office comedy on the noticeboard, fridge, and vending machine: every hotspot has a look line.
9. **Layout reference**: `docs/art/break-room-layout.svg` at the exact hotspot coordinates, clear
   silhouettes, empty wall space (decision 0005).

The Break Room is **not reachable yet** in normal play: slice 14 opens the STAFF ONLY door in
parallel, and slice 16 joins the rooms with exits both ways. So the always-winnable test from the
start state doesn't reach this room in this slice; the new test below covers it.

## Files this slice owns

New `src/content/breakRoom.ts` (room, items, combination, intercom lines) and
`src/content/breakRoom.test.ts`; `src/content/world.ts` (registering the room and items, Dana's
starting lanyard: a small merge with slice 14 expected); `docs/art/break-room-layout.svg`; this
file. **Not** `src/content/giftShop.ts`, `src/core/`, `src/view/`, or `docs/design.md`.

## Acceptance checks

- `npm test`, typecheck, build, Playwright: all green. The existing play-through still wins (the
  lanyard in the inventory mustn't break it).
- `breakRoom.test.ts`: exploring from a state where Dana stands in the Break Room reaches both
  "off duty" and holding Exact Change, and no state there is a dead end for either.
- Agent play-test in the browser, entering the Break Room through the dev hook (set the state's
  room): all three puzzles, the combination, the intercom.
- Developer play-test, the same way, until slice 16 wires the door.

## Notes

- Lines are drafts (`// DRAFT:`). Dana is earnest and quotes the Handbook; nothing may imply magic
  existed before tonight. Reginald's intercom lines stay in his voice (see `reginald.ts`).
- **Built as specced.** Flags: `knowsEmployeeNumber` (lanyard action), `fridgeOpen` and
  `tookTimeCard` (⚙ Open, then ✋ Move the yogurt), `offDuty` (Time Card on Time Clock), `lockerOpen`,
  `gotCent`. The employee number is 007 ("licensed to clock in"). Reginald's intercom is a small
  dialogue (`intercom`) with two options that unlock on `offDuty` and on holding Exact Change.
- **Clocking out tucks the lanyard into Dana's pocket** (said, not an effect: the item stays). Slice
  16 can lean on that when Kyle checks for a lanyard.
- **Always-winnable test:** it now skips the Break Room and its four items in its "reach every room"
  and "obtain every item" checks (`NOT_YET_REACHABLE` in `winnable.test.ts`). **Slice 16 empties
  that list** once the doors are wired.
- **`breakRoom.test.ts`** gives each goal (off duty; Exact Change; both) its own copy of the world
  with an invisible hotspot that wins once the goal holds, so `explore()`'s existing dead-end check
  answers "can every reachable state still get there?" without changing `explore.ts`.
- **Agent play-test** (browser pane, real clicks, Dana placed in the room through `window.__game`):
  coin return, fridge then yogurt, Time Card on Time Clock, Check the number, locker, combine One
  Cent + Pay Packet, intercom dialogue with both conditional options. No console errors. The starting
  lanyard leaves the Playwright play-through green.
- **Developer play-test, until slice 16:** on the title screen, in the console:
  `__game.scene.stop('TitleScene'); __game.scene.start('RoomScene', { ...__game.scene.getScene('TitleScene').data_, state: { ...__game.scene.getScene('TitleScene').data_.newGame, roomId: 'breakRoom', player: { x: 200, y: 470 } } })`
