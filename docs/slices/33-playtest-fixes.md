# Slice 33 — Play-test fixes: clearer puzzles and verbs

**Status:** awaiting approval · **Milestone:** M6, play-test polish (one slice, after the game was
complete)

## Why

The developer's play-tests of the finished game (2026-10-24) found five snags, then a few more on the gum and the mug, and asked for a pass
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
6. **Memorising** (step 4) and **reading the lanyard** are item actions, on the ⚙ of an item's coin:
   the least discoverable place in the game (covered by 2). After memorising, nothing says what to
   do with the line.
7. **Paying** (step 27). Only the dialogue option buys the mug; using the money on Kyle, the obvious
   move for many players, doesn't (developer).
8. **Knocking** (a play-tester, Mel). The coffin's look says KNOCK, and there's no way to knock. The
   look also describes a gold star and a sign that aren't in the painting, and leaves out the brass
   knocker and the price sticker that are.
9. **Closing** (a play-tester, Mel). Once the fridge is open it can't close, and 👆 still offers
   "Open". The same goes for the locker and the display case.

## Spec

1. **The gum is a goal from the start** (developer's idea, plus a bridge to the cue).
   - While Reginald is on the throne, the throne's look says there's a wad of bright pink gum under the
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
3. **The cue is someone else's line** (settled in a grilling session, 2026-10-24).
   - The script is set out as a script: `MORTAL: Rise, foul creature, and face me!` / `LICH:
     ARISE!`, with Reginald's red-pen margin note beside the cue: "THEY NEVER SAY IT." That's why
     he's stuck on the throne, and it says the line has to be said *to him*.
   - The speaker is MORTAL (Reginald's word for everyone), not GUEST: "guest" only matters in the
     finale (Kyle won't sell to staff), so the cue never raises the question of whether Dana counts.
   - The script's look becomes two lines: page one (the cue, the margin note, and a nudge: if Dana
     learned that line by heart, they could give him his cue), then the last page (the guest escapes
     through the gift shop with a souvenir: the finale's rule).
   - Memorising stays the script's action; afterwards Dana says next time they talk to Reginald,
     they'll give him his cue. The dialogue option stays word for word.
4. **The coffin, opened up.**
   - **Look** matches the painting: stood on end like a door, a brass knocker "someone" screwed on,
     a gold star (R. VANTABLACK-THORNE, DRESSING ROOM), and the sticker "LOT 9: COFFIN (LIGHTLY
     USED), $20" (the estate-sale lots, like the throne's and the phylactery's).
   - **Art:** a gold star sticker on the lid (plain, or with a squiggle for text), drawn by the
     agent into `lair.webp` in the flat style of the painted "$" tag; a ChatGPT edit of a crop if it
     looks pasted on. An **open coffin** from ChatGPT (prompt pack, a crop of the coffin as
     reference): open with the script, then the same image without it; cut into an open overlay and
     a script patch shown only while the script is inside. The hairspray clearly visible, apart from
     the script.
   - 💬 **Knock**: Reginald answers wherever he is ("Who knocks at the dressing room of the Lich
     Lord? …Oh, the trainee. Go ahead, darling. Anything but the hairspray."). On an open coffin, a
     knock-knock joke (being workshopped).
   - 👆 **Open / Close**: opening knocks first if Dana hasn't, then shows the inside and describes
     it (mirror, UNDEAD HOLD hairspray, a photo of Reginald signed by Reginald, the script).
   - **The script** is its own hotspot inside the open coffin: Look and ✋ Take the script (no longer
     taken by Open). Back in the coffin after memorising, taking it again: "I know it by heart. It
     can stay home."
   - **The hairspray** is its own hotspot: Look ("UNDEAD HOLD. 'For hair that never dies.'"), ✋ Take
     refused by Reginald ("The HAIRSPRAY, darling! Anything but!"), 👆 Spritz.
5. **Things that open also close.** The coffin, fridge, locker and display case: 👆 toggles Open and
   Close, through a new **clear-flag** effect in the core (test-first). Each one's overlay shows only
   while open (the fridge's yogurt patch too), with open and closed look lines and a line on closing
   (the fridge: "The note inside says CLOSE THE DOOR. I'm a team player."). The display case closes
   only once the scroll is back (its closed art shows the scroll), and its "I've left the lid up"
   line is rewritten. Doors don't close: STAFF ONLY only opens by Mordecai's favour, so closing it
   could strand Dana, and the others are only for going through.
6. **Squint at the lanyard** (the developer's idea). Looking at the lanyard says there's small print
   under TRAINEE that Dana would have to squint at, and **unlocks** the lanyard's action "Squint at the
   small print", which reads the number. The off-duty lanyard works the same. This needs a small
   core change, test-first: an item's look can be a full set of responses (conditions, effects,
   flags), as a hotspot's look already is, instead of one fixed line.
7. **The cent leaves the description.** The vending machine's look has a version for after the cent
   is taken.
8. **Paying with the money.** Using the Exact Change on Kyle buys the mug: the same sale as the
   dialogue option, the finale included. Too early, it gets the matching answer: still on duty,
   "Lanyard."; the pay packet alone (one cent short), Kyle's exact-change line. The dialogue option
   stays.
9. **Records.** Build notes, `docs/drafts.md` regenerated if anything is marked, and the M6 row in
   `docs/design.md`.

Out of scope: new puzzles, new rooms, a hint system.

Considered and left as it is: **reading the Handbook for help** at step 16. After Mordecai's
request, Read gives a random section rather than Section 14, but the step already has three hints
(Mordecai's repeat option, the till, the Handbook on the bargain bin), and a play-tester used the
Handbook on Kyle without trouble (developer, 2026-10-24).

## Approvals you'll be asked for

1. The new verb coin (screenshots at laptop and phone size, with labels).
2. The star on the coffin (a before/after crop).
3. The open-coffin images (prompt pack first; you generate, the agent cuts).
4. The knock-knock joke (being workshopped).
5. Developer play-test.

## Acceptance checks

- `npm test` (content validation and always-winnable stay green), typecheck, build, both Playwright
  projects. `src/view/icons.ts` changes, so the E2E harness follows it automatically.
- Unit tests: an item's look can set a flag and vary with conditions (core, test-first); the lanyard
  action is offered only after looking; the stand-up option only after seeing the gum; Exact Change on
  Kyle wins the game (the always-winnable search may then find a shorter route: that's fine); the
  vending machine and throne lines vary as specified; clear-flag (core, test-first); each container
  opens and closes, the display case only after the scroll is back; nothing can be closed into a dead
  end (the always-winnable test); the coffin's knock-then-open.
- Agent play-test: the coin with labels at both sizes; the gum, cue, lanyard, cent and paying
  lines in place; the coffin opening, knocking and closing; every container closing.
- Developer play-test.

## Notes

- Branch `slice-33-playtest-fixes`, from `main`.
- If 🔗 doesn't read well in the screenshots, alternatives for "Use with…": ➡️, 🎯.
