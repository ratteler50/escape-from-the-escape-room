# Slice 6 — Finish the Lair (M1 complete)

**Status:** built, agent play-tested · awaiting PR and developer play-test · **Milestone:** M1 · **Branch:** `slice-6-finish-lair`

## Why

This is the last M1 puzzle and the payoff joke: head office's riddle is a misprint, and the curse
bound itself to the script *as printed*, so the code is literally **C-O-D-E**. It also adds the
win state, and the test that turns "no dead ends" from a design rule into something CI enforces.

## Spec

### Content

1. **Display case** on a pedestal between the throne and the door. 👁 Look: an ornate case,
   locked, with an Ancient Riddle Scroll inside. ⚙ "Open" while locked: it's locked.
   **Use the Display Case Key on it**: it opens, Dana takes the **Ancient Riddle Scroll**, and the
   key stays in the lock (removed from the inventory; nothing else needs it). Afterwards the case's
   look line changes and ⚙ Open just comments on the empty case.
2. **Ancient Riddle Scroll** (item). Look: *"THE ANSWER IS: [INSERT CODE HERE BEFORE PRINTING]"* and
   Dana's groan at head office.
3. **Rune keypad** beside the door. 👁 Look: four rune buttons, "ENTER CODE TO ESCAPE". ⚙ "Enter a
   code" without the scroll: Dana tries a couple of guesses that fail.
   **Use the scroll on the keypad**: Dana works it out (the curse binds to the script *as printed*;
   the code is literally C-O-D-E), types it, and the door unlocks.
4. **Show the scroll to Reginald**: outrage on behalf of the craft ("A MISPRINT? In MY lair?").
5. **The door**, once unlocked, gets ⚙ "Escape!". Using it: Dana's last line, then the **win**.
6. Typing the code is the puzzle's payoff, so it's one line from Dana, not a keypad mini-game.

### Win

7. New effect **`win`**. The view fades to a **"To be continued…"** card: game title, a short line
   ("Dana escaped the Lich's Lair. The Gift Shop awaits."), and a **Play again** button that
   restarts from the beginning. Input to the room stops once the card is up.

### The always-winnable test

8. A test that **explores every reachable game state** from the start, by trying every command the
   UI could offer in each state: every available verb on every visible hotspot, every held item on
   every visible hotspot, every pair of held items, every available dialogue option. Player position
   is ignored (it never affects puzzles). Then it checks:
   - **the win is reachable from every reachable state** (no dead ends, ever);
   - **every item can be obtained** (no unreachable content);
   - no command the UI could offer throws;
   - the state space stays under a cap (so a content mistake that explodes it fails fast instead of
     hanging CI).
   On failure it prints a **shortest path to the stuck state** (the commands that lead there), so
   the fix is obvious from the message.
9. It also prints the **shortest solution**, the minimum commands from start to win, as a walkthrough
   that's easy to sanity-check.

### Docs

10. Slice 5's status updated (merged as PR #3). Design doc marks M1 as playable. README "How to
    play" gets a spoiler-free nudge for the first puzzle.

Out of scope: a keypad mini-game, room transitions to the Gift Shop (M2), save/load (M2), art.

## Acceptance checks

- `npm test` passes, including:
  - core: `win` effect sets a `won` flag; the keypad and door rules behave as specified;
  - the always-winnable test (and it's **proven to fail**: temporarily make the key disappear when
    used on the door, confirm the test fails with a path to the dead end, then revert);
  - content validation and slices 1–5 tests stay green.
- `npm run typecheck` and `npm run build` pass; CI green on the PR.
- Agent play-test: from a fresh start, the whole Lair to the "To be continued" card; Play again
  restarts cleanly; Reginald's scroll reaction; the keypad's no-scroll guesses.
- Developer play-test on the trackpad, start to finish.

## Plan

1. Fix slice 5's doc status.
2. Core, test-first: `win` effect (`won` flag).
3. Content: display case, scroll, keypad, door's Escape, Reginald's scroll reaction.
4. Always-winnable test (breadth-first search over states; reverse reachability for "can still
   win"); prove it fails on a planted dead end.
5. View: "To be continued" card with Play again.
6. Play-test start to finish, fix, update docs (design: M1 playable; glossary: win, state space).
7. Ask to push and open the PR.

## Notes / out-of-scope ideas

- The always-winnable test explores **608 states** in ~0.1s. Shortest solution: 10 steps, matching
  the puzzle chart in `docs/design.md`: coffin, talk to Reginald, cue line, gum, Gary's arm,
  combine, grate, display case, keypad, door.
- Proven to fail: making the key vanish when used on the door gives "64 reachable state(s) can no
  longer win" with the 8-step path into the dead end and its inventory.
- State key ignores player position and inventory order; dialogue state and spent options count.
  `lookItem` is skipped because it never changes state.
- The keypad is named "Keypad" (not "Rune Keypad") so its label fits its narrow box.
- Play again restarts the scene with its original start data; the core never mutates state, so the
  original initial state is still pristine.
- Play-test: the coffin-to-key chain (already played with real clicks in slice 5) was driven through
  the scene's own `dispatch`; everything new in this slice was played with real clicks.
- Later: a keypad mini-game, the door leading to the Gift Shop (M2 room transitions), save/load.
