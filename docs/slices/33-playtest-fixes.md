# Slice 33 — Play-test fixes: clearer puzzles and verbs

**Status:** awaiting approval · **Milestone:** M6, play-test polish (one slice, after the game was
complete)

## Why

The developer's play-tests of the finished game (2026-10-24) found five snags, and asked for a pass
over every puzzle for steps that might be less obvious. The pass walked the shortest solution's 27
steps (`src/content/explore.ts`) and asked, for each: what in the game tells the player to try this?
Most steps are well signposted (slice 30 added hints for the Gift Shop). The findings, including the
developer's five, are below.

## Findings

1. **The gum** (step 7). It's "take" on the throne, labelled "Check under the armrest", offered only
   once Reginald has left. Nothing says it's there: the throne's look mentions the armrest's
   sticker, and Dana only says the Spooky Seat is unguarded. So moving Reginald is never a goal, only
   something that happens to unlock it.
2. **Hand and gear.** The coin's labels ("Borrow a limb", "Press coin return") only appear when the
   pointer hovers over a button, and **on a phone nothing hovers**, so players see icons only. The
   icons then have to carry the meaning, and they don't: ⚙ reads as "settings, don't touch", and an
   item's coin uses ✋ for "Use with…" and ⚙ for its own action (Read, Memorise), while a hotspot's
   coin uses ✋ for taking. In content the rule is already consistent (✋ take = put something in
   your pocket, or try to; ⚙ use = operate it: open, press, sit, go through), but nothing shows it.
3. **The cue** (steps 4–6). The script calls "Rise, foul creature, and face me!" *his cue*. In
   theatre a cue is someone else's line that sets you off; to everyone else, "his line" means
   Reginald says it, so there's no reason for Dana to.
4. **The employee number** (step 3). The lanyard's look mentions tiny print, but the number takes a
   separate item action ("Check the number") that nothing points to.
5. **The cent** (step 22). The vending machine's look still says something copper is in the coin
   return after Dana has taken it.
6. **Reading the Handbook for help** (step 16). After Mordecai's request, Dana says "There's a
   Handbook section about borrowing equipment. I'll have to look it up." Reading the Handbook then
   gives a random section. The natural move doesn't help.
7. **Memorising** (step 4) and **reading the lanyard** are item actions, on the ⚙ of an item's coin:
   the least discoverable place in the game (covered by 2). After memorising, nothing says what to
   do with the line.
8. **Paying** (step 27). Only the dialogue option buys the mug; using the money on Kyle, the obvious
   move for many players, doesn't (developer).

## Spec

1. **The gum is a goal from the start** (developer's idea, plus a bridge to the cue).
   - While Reginald is on the throne, the throne's look says there's a grey wad of gum under the
     armrest, right by his elbow, and sets a flag (Dana has seen it).
   - Trying to take it while he's seated: Reginald stops Dana ("Hands off the Spooky Seat, darling!
     Nobody touches the throne mid-performance.").
   - Once Dana has seen the gum, Reginald's conversation offers "Could you stand up for a moment?":
     a lich doesn't stand, he *rises*, on his *cue*. That points from the gum to the script.
   - Once he's left: the look still mentions the gum, Dana's last line after the cue mentions it,
     and the take is labelled "Take the gum".
2. **Verbs say what they do.**
   - **Labels always show**, under each button of the coin, small, on every device. (Hovering still
     highlights.)
   - **Icons:** ✋ **Take** (put it in your pocket, or try), 👆 **Use** (operate it: open, press, sit,
     go through; replaces ⚙), 👁 Look, 💬 Talk. On an item's coin: 👁 Look, 👆 its own action (Read,
     Memorise…), and 🔗 **Use with…** (instead of ✋).
   - **Audit:** every take and use in the content checked against that rule; the labels that hide
     what happens are renamed ("Press coin return" → "Take the cent", "Move the yogurt" → "Take my
     time card", "Check under the armrest" → "Take the gum"). Once labels always show, a ✋ button
     saying "Press" contradicts its icon; moving the coin return to 👆 instead would cost the
     vending machine's "Buy a snack". The cent is already sitting in the return, so taking it is
     what the player does (developer, 2026-10-24).
3. **The cue is the guest's line.** The script and the coffin say it plainly: the **guest** says
   "Rise, foul creature, and face me!", and the lich answers "ARISE!". Dana adds that if they learned
   the guest's line, they could give him his cue. After memorising, Dana says the next step out
   loud: next time they talk to Reginald, they'll give him his cue. Memorising stays the item action.
4. **Squint at the lanyard** (the developer's idea). Looking at the lanyard says there's small print
   under TRAINEE that Dana would have to squint at, and **unlocks** the lanyard's action "Squint at the
   small print", which reads the number. The off-duty lanyard works the same. This needs a small
   core change, test-first: an item's look can be a full set of responses (conditions, effects,
   flags), as a hotspot's look already is, instead of one fixed line.
5. **The cent leaves the description.** The vending machine's look has a version for after the cent
   is taken.
6. **Reading the Handbook helps.** After Mordecai's request and until Dana has the price gun, Read
   opens at Section 14 (no borrowing from other departments) and Dana notices the page is thicker than
   it should be: it's Kyle's department, so Kyle should see it. The joke of finding the revised insert
   while showing Kyle stays.
7. **Paying with the money.** Using the Exact Change on Kyle buys the mug: the same sale as the
   dialogue option, the finale included. Too early, it gets the matching answer: still on duty,
   "Lanyard."; the pay packet alone (one cent short), Kyle's exact-change line. The dialogue option
   stays.
8. **Records.** Build notes, `docs/drafts.md` regenerated if anything is marked, and the M6 row in
   `docs/design.md`.

Out of scope: new puzzles, new art, a hint system.

## Approvals you'll be asked for

1. The new verb coin (screenshots at laptop and phone size, with labels).
2. Developer play-test.

## Acceptance checks

- `npm test` (content validation and always-winnable stay green), typecheck, build, both Playwright
  projects. `src/view/icons.ts` changes, so the E2E harness follows it automatically.
- Unit tests: an item's look can set a flag and vary with conditions (core, test-first); the lanyard
  action is offered only after looking; the stand-up option only after seeing the gum; Exact Change on
  Kyle wins the game (the always-winnable search may then find a shorter route: that's fine); the vending machine, throne and Handbook lines vary as
  specified.
- Agent play-test: the coin with labels at both sizes; the gum, cue, lanyard, cent and Handbook
  lines in place.
- Developer play-test.

## Notes

- Branch `slice-33-playtest-fixes`, from `main`.
- If 🔗 doesn't read well in the screenshots, alternatives for "Use with…": ➡️, 🎯.
