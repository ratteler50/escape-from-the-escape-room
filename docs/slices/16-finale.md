# Slice 16 — Join the rooms, buy the mug, the finale

**Status:** built, agent play-tested · awaiting developer play-test · **Milestone:** M3

## Why

Slices 14 and 15 built the Gift Shop and the Break Room separately. This slice joins them and pays
M3 off: Dana buys the mug as a guest, the escape room's script is satisfied, the curse lifts, and
the game gets a real ending instead of "To be continued…" (see `docs/design.md`, M3 plan and
Finale).

## Spec

1. **Join the rooms.**
   - The open STAFF ONLY door gets ⚙ "Go through": Dana walks into it, then arrives in the Break
     Room at its `fromGiftShop` entry.
   - The Break Room's Gift Shop door gets ⚙ "Go through" back, arriving at a new Gift Shop entry
     `fromBreakRoom` on the floor in front of the STAFF ONLY door.
   - Remove `NOT_YET_REACHABLE` from `src/content/winnable.test.ts`: every room and item must now be
     reachable from the start state.
2. **Mordecai comes back.** After opening the door from the other side, he floats back to hover by
   the Bargain Bin, admiring the "PRICELESS" teapot, with new look and talk lines. He must be in the
   Gift Shop for the finale.
3. **Buying the mug** (Kyle's dialogue), with the till's rules as the obstacle, in this order:
   - still on duty: "Lanyard." (the existing refusal);
   - off duty but no exact change: "$12.99. Cash only. Card machine's down. Exact change: head office
     empties the till every hour." Dana's Pay Packet alone ($12.98) is noticed as a cent short;
   - **off duty with Exact Change**: Dana pockets the lanyard ("Off duty. See? Pocket."), hands over
     the Exact Change (removed, with a line), and receives the **"I ESCAPED THE LICH'S LAIR" Mug**.
     That starts the finale.
4. **The false exit.** The front door's "To be continued…" win goes. Before the purchase, using it
   gets: "EXIT THROUGH THE GIFT SHOP. I haven't bought anything. The curse is very literal."
5. **The finale** (a cutscene with the existing effects: `say`, `walk`, `face`, `pause`):
   - the mug in hand satisfies the script: a rumble, the lights flicker, the curse lifts;
   - **Reginald** walks in through the Lair door (a Gift Shop hotspot for him that only exists
     during the finale), human again, carrying the phylactery: the anti-theft cable came loose when
     the curse broke. He is devastated: the role of a lifetime, gone; he announces a union grievance;
   - Gary stays one-armed (a line);
   - Reginald drops the phylactery in a box; **Kyle** prices it at $1 for the bargain bin without
     looking up; **Mordecai** is appalled;
   - last beat: the phylactery whispers from the bargain bin;
   - then the **win**, with a real ending card: **"THE END?"** in place of "To be continued…".
     Update the Playwright helper (`e2e/game.ts`) that detects the end card by its text.
6. **Intercom:** once the curse lifts, Reginald's intercom has nothing new to say (the game has ended).
   No other Break Room changes.

## Acceptance checks

- `npm test`, typecheck, build, and Playwright all green. The always-winnable test now covers the
  whole game with no exceptions, and its printed shortest solution ends with buying the mug.
- If the bigger game pushes exploration past `STATE_CAP`, find out which content multiplies states
  before raising the cap, and record why in the slice notes.
- The Playwright play-through follows the new shortest solution through all three rooms to "THE END?".
- Unit tests: Kyle's three sale outcomes (on duty, off duty without exact change, the sale); the
  front door never wins; the finale sets the win.
- Agent play-test in the browser: a full play-through from a new game, with both door transitions,
  Mordecai's return, every sale refusal, and the finale.
- Developer play-test.

## Notes

- Lines are drafts (`// DRAFT:`). Reginald human again keeps his voice from `reginald.ts`; Kyle stays
  deadpan; nothing may imply magic existed before tonight.
- Slice 17 (polish) follows; anything cosmetic found here goes in these notes for it.

## Build notes

- **State cap.** Joining the rooms pushed exploration past `STATE_CAP` (50,000) without ever reaching
  the win. Measuring showed about ten independent "flavour" bits each doubling the state count:
  once-only lines that only say things (Reginald's "who are you", the intercom), and flags nobody
  reads. `explore.ts` now merges states that differ only in those (`flavourBits`): flags no condition
  reads, and spent `once` options whose effects are pure presentation. Options with real effects
  (items, read flags, room changes) stay distinct so a dead end can't hide. The whole game is now
  **1,820 states**, shortest solution 29 steps. `explore.test.ts` pins the rule down. The cap is
  unchanged. Playwright still compares exact state keys.
- **Mordecai's return** is set when Dana first goes through STAFF ONLY, not when the door opens:
  `setFlag` redraws hotspots from the final state, so he'd have popped back to the bin mid-cutscene.
- **Bug fixed: speech anchored to content, not the screen.** A character's lines were placed at the
  hotspot's content position, so after the finale walk Reginald spoke from the doorway. `RoomView`
  now anchors to the drawn shape's live position.
- **Bug fixed: the options stayed up during cutscenes.** An option that ends the conversation now
  hides the options when it's chosen, not after its replies (the finale's 90 seconds; Reginald's
  "ARISE!" exit too).
- Option id `buyMug` stays the first (on-duty) refusal: renaming it would break saves, which record
  spent options by id. The new outcomes are `mugNoCash` and `sale`.
- The finale lives in `finale.ts`; it names Kyle and Mordecai by id string to avoid an import cycle
  (kyle.ts imports it; mordecai.ts imports kyle.ts).
- Play-tested in the production preview: Mordecai back at the bin, the front-door false exit, Kyle's
  off-duty options, the whole finale through "THE END?", no console errors. The Playwright
  play-through clicks the full 29-step solution through all three rooms in about 45 seconds.

## For slice 17 (polish)

- Placeholder crowding in the Gift Shop: the "Cardboard Reginald" label is wider than its hotspot,
  and in the finale Reginald stands over the till and bargain bin, so labels and speech overlap.
- After the win, the queued `endDialogue` effect never plays (the end card takes over). Harmless.
- **CI: the full play-through hit Playwright's 120s per-test limit.** It takes about 45s locally but
  runs several times slower on CI runners (the autosave test: 3.7s locally, 28s on CI). It was slow,
  not stuck: each step's own 30s wait never fired. That one test now has a 10-minute budget; the rest
  keep the default.
