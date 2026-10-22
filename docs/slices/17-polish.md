# Slice 17 — M3 polish: clues, consistency, the draft script

**Status:** built, agent play-tested · awaiting developer play-test · **Milestone:** M3 (last slice)

## Why

After slice 16 the game is complete from title screen to "THE END?", and the always-winnable test
already covers all of it. What's left before calling M3 done is quality: whether a player who isn't
reading the source can actually solve it, whether the writing is consistent across five slices and
three sessions, and the visual crowding the finale exposed.

## Spec

1. **Clue audit.** For each step of the shortest solution (29 steps, `npm test` prints it), check that
   the game gives the player a reason to try it: a look line, a reaction, a Handbook quote, a
   character's remark. Where a step has no clue, or only one easy to miss, add or sharpen a line.
   Known suspects to check first: the lanyard's "Check the number" item action; that the yogurt
   hides the time card; that the pay packet is a cent short and the vending machine has a coin
   return; that Kyle's price gun needs a Handbook section. Record the audit as a table in this file
   (step, clue, verdict).
2. **Consistency pass** over all content lines (`// DRAFT:` or not):
   - the premise rule: nothing implies magic existed before tonight;
   - Employee Handbook section numbers: each section means one thing everywhere; list them in
     `docs/design.md` as the canonical reference;
   - voices: Dana earnest and they/them; Kyle deadpan, they/them; Reginald theatrical ("darling");
     Mordecai grandiose and petty;
   - typos, and repeated jokes that land twice.
   Fix what's wrong; leave `// DRAFT:` markers in place (they're the developer's to remove).
3. **The draft script.** A generated, readable script of every `// DRAFT:` line, grouped by room and
   speaker with file and line, so the developer can punch them up in one sitting:
   `npm run drafts` writes `docs/drafts.md`; a test fails if `docs/drafts.md` is stale, so it can't
   drift from the content.
4. **Gift Shop staging.** Fix the crowding from slice 16: the "Cardboard Reginald" label fits its
   hotspot; in the finale Reginald stands somewhere clear of Kyle, the till and the bargain bin, so
   names and speech don't overlap. Update `docs/art/gift-shop-layout.svg` if bounds move.
5. **Used-up items leave the inventory**, each with a line (content rule): the **Sticky Arm** stays
   stuck to the grate after fishing out the key (the grate's look line shows it; the finale's Gary
   line changes to match); the **Ancient Riddle Scroll** goes back in the display case after the
   keypad; the **Price Gun** goes back to Kyle after re-pricing the teapot; the **Time Card** goes
   back in the card rack after clocking out. The **Staff Lanyard** and the **Mug** stay. A test checks
   that in every winning state the explorer reaches, the inventory holds only the lanyard and the mug,
   so a new item that's never consumed fails by name.
6. **Docs:** mark M3 ✅ in `docs/design.md`; update the README's "How to play" for the whole game,
   with a spoiler-light hint per room in the style of the existing Lair hint.

Out of scope: a hint system, new puzzles, art and audio (M4), the leftover `endDialogue` after the win
(harmless).

## Acceptance checks

- `npm test`, typecheck, build, Playwright: all green. The always-winnable test is unaffected (clue
  lines are presentation; if any new line carries state, it must keep the game winnable).
- `docs/drafts.md` is current (its test), and the clue-audit table is filled in.
- Agent play-test of the whole game in the browser from New game, without the dev hook, reading
  as a player would: note anywhere it felt unclear, and fix or record it.
- Developer play-test of the whole game.

## Clue audit (done before the build, read-only)

Every step of the 29-step shortest solution, checked for an in-game reason to try it: **23 clear,
6 weak, 0 missing.** The suspected weak spots (lanyard number, yogurt, price gun's Handbook section,
clocking out) turned out well clued. The weak ones, with the fix to make:

| # | Step | What's there now | Fix |
|---|------|------------------|-----|
| 2 | Borrow Gary's arm | Only the verb label; the grate says "just out of reach" | Grate look: "…just out of reach. I'd need a longer arm. Or a spare one." |
| 11 | Scroll on the keypad | The scroll reads as a dud joke; the literal-curse idea only appears after using it | Scroll look: connect the misprint to the curse taking the script literally ("Does that include the typos?") |
| 24 | Vending machine coin return | Only the verb label; the look line is about crisps | Look line: the coin return flap, something small and copper inside |
| 27 | Combine pay packet + cent | "One cent short" only in optional item looks; the locker just says "Payday!" | Locker reveal names the amount: $12.98 against a $12.99 mug |
| 28–29 | Why buy the mug at all | Mainly the front door's refusal, plus the mug rack and intercom | Front door refusal names the mug: "Not even a mug." |

Consistency finding: **Handbook Section 2** means two rules ("know your number" in the Break Room,
"nobody has ever beaten the escape room" with Mordecai). Renumber one, and build the canonical
section list (spec item 2) from the rest: 3 lost property, 4.2 don't touch guests, 5/5.3 clocking
out, 6 colleagues' dairy, 7.1 the Spooky Seat, 8 be thorough, 9 doors unlocked in business hours,
10, 11 no self-reviews, 12 don't improvise with props, 14/14.1 re-pricing, 15 always contribute.

## Notes

- Built stacked on `slice-16-finale` while PR #14 waits for CI; rebased onto `main` with `git rebase --onto` once it merges, before opening the PR.

## Build notes

- **Clue fixes:** all five weak spots got their line (table above); Handbook Section 2 now means
  only "know your number"; the escape-room rule is Section 1. `docs/design.md` has the full list.
- **Consistency pass** (a read-only review of every visible line, then fixes): who bought the
  phylactery, how its cable came loose, how a ghost who can't touch anything opened a door, a
  repeated "checked twice" and a repeated Gary line, Reginald's two union "section nines", a missing
  "!" in the cue, and leftover she/her comments for Dana. Kept on purpose: "One star. Still here."
  (a frustrated customer, not a trapped one), Kyle's two "Is that new?" (their running bit), and
  "less wooden than the real one" (mild, DRAFT, the developer's call).
- **Used-up items:** the Sticky Arm stays gummed to the grate, the scroll goes back on its velvet,
  the price gun goes back to Kyle, the time card goes back in the rack, each with a line. A test
  checks every winning state holds only the lanyard and the mug; it was shown to fail (by name) with
  the time card's removal undone. slice 14's test expecting the price gun to stay was updated.
- **The draft script:** `npm run drafts` → `docs/drafts.md` (227 lines). Runs on Node's built-in
  TypeScript; also picks up any new content file. The freshness test was shown to fail on a stale file.
- **Staging:** labels wrap to their hotspot's width (a single long word like "Phylactery" still
  overflows its narrow plinth; fine for placeholder art); Reginald's finale mark moved to (833, 425).
- **Play-test:** played in the browser from New game with real clicks through step 19 (Mordecai
  re-pricing), reading every line; a mid-game reload of the pane also exercised Continue, which
  restored the exact state. The pane then stopped rendering frames (the app window wasn't in view),
  so the rest was played headless: a temporary Playwright run of the real solution with screenshots
  of the finale, confirming Reginald's new mark and the lanyard + mug inventory at the end. The
  regular Playwright play-through (all 29 steps) passes.
- **Built stacked** on `slice-16-finale` while #14 waited for CI, then rebased onto `main` with
  `git rebase --onto` once it merged (the squash commit's tree matched the branch tip exactly).

