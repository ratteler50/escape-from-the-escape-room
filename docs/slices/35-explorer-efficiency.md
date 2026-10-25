# Slice 35 — A leaner always-winnable search

**Status:** built, awaiting developer review · **Milestone:** M6, play-test polish

## Why

The always-winnable test (`src/content/explore.ts`) explores every state the game can reach and
proves each can still be won: no dead ends. Every flag that can vary independently doubles its
work, and slices 33 and 34 added several. The developer wants room for many more flags. Decided in
a grill-me design session (2026-10-24); the measurements and decisions are below.

**Measured on `main` after slice 34:** 11,230 states, searched in about 0.5 s against a cap of
50,000. Half are mid-conversation; the other 5,602 are room states. These flags multiply the room
states without affecting what Dana can still do:

| Flag | ×  | Why it doesn't matter |
|------|----|------------------------|
| `coffinOpen` | 1.99 | one free click either way |
| `reginaldSawArm` | 1.98 | only stops Reginald's "GARY'S ARM?" outburst repeating |
| `readScroll` | 1.94 | only mattered for the keypad; dead once the door is unlocked |
| `caseOpen` | 1.93 | one free click either way, once the scroll is back |
| `fridgeOpen` | 1.79 | one free click either way |
| `lockerOpen` | 1.27 | one free click either way, once the pay packet is out |

Without them: 214 room states (about 450 states in all). Genuine progress stays: reading the
lanyard and looking at the vending machine can happen at any point and do change what Dana can do.

## Spec

The game doesn't change. Three rules teach the explorer to merge states that differ only in flags
that can no longer matter; it **detects** each case from the content (nothing is declared), and a
test lists what it detected so a content change that adds or removes one shows up in review.

1. **Dead after a milestone.** A *milestone* is a flag that's set somewhere and cleared nowhere
   (checked from the content). Once a milestone is set, a condition containing "not that milestone"
   can never pass again, and neither can a response behind an earlier one that now always applies.
   A flag read only in such places is dropped from the state. Today: `readScroll`, once
   `lairDoorUnlocked`.
2. **Free toggles, judged state by state.** In a given state, if the explorer finds a step that only
   flips a flag (and says a line), and from the flipped state a step that flips it back (checked by
   running both), the two states merge. The merged state offers the actions of both settings, and
   several toggles at once merge as their combinations. Today: the coffin and fridge from the start;
   the locker once the pay packet is out; the case once the scroll is back (before that it opens but
   can't close, so it doesn't qualify).
3. **Say-once latches.** A flag whose every reading condition sits on a response that only says
   something (and sets that same flag): it only stops a line repeating. If anything else reads it (a
   verb's availability, an option, a hotspot, a response with real effects), it isn't a latch.
   Today: `reginaldSawArm`.
4. **The shortest solution stays playable.** It feeds the end-to-end play-through. When its route
   leaves a merged state by an action that needs the other setting (taking the script needs the
   coffin open), the flip step is inserted into the route.
5. **A state budget.** A test fails when the game grows past about five times its reduced size (the
   number goes here once measured): an early warning, well before the 50,000 cap, which stays.
6. **Records.** Build notes with before and after counts; `docs/design.md`'s technical section
   describes what the explorer merges and why each rule is safe.

Out of scope, noted for if the budget ever trips:
- **Conversations as single steps:** run each conversation to every way it can end and store only
  the room states before and after, with a separate check that no conversation can trap Dana. That
  halves the count.
- **Speed:** faster state keys, which buy a constant factor.

Also decided and left out: hand-written story invariants ("no price gun after STAFF ONLY opens"),
since they save nothing and need upkeep, and pruning dead flags from the game's own state, since the
playthrough gains nothing.

## Why each rule is safe

The explorer's job is to prove that from every reachable state a win is still reachable. Merging two
states is safe when they can reach exactly the same futures that matter:

- **Dead flags:** after the milestone, no condition the game can still evaluate reads the flag, so
  the two states offer the same actions with the same effects.
- **Free toggles:** the two states reach each other at will (one flip each way, nothing else
  changes), so anything reachable from one is reachable from the other. Offering the actions of both
  keeps every future explored.
- **Latches:** the flag only picks whether a line is said, which changes nothing a player can do
  (the same argument as slice 33's line-picking flavour flags).

## Approvals you'll be asked for

1. Developer review of the before/after numbers and the detected-reductions list.

## Acceptance checks

- `npm test`, typecheck, build, both Playwright projects green.
- Tests first, each checked to fail when its rule is broken:
  - toy worlds that look reducible but aren't: a "milestone" cleared somewhere; a "toggle" whose
    first use also hands over an item, and one that opens but can't close; a "latch" that something
    else reads. None may be reduced.
  - toy worlds that are reducible: each rule merges what it should.
  - on the real game, the full search and the reduced search agree on "every reachable state can
    still win", while the full one fits under its cap. When it no longer does, that cross-check
    moves to a nightly CI run instead of being dropped.
  - the shortest solution replays through the engine, every step allowed.
  - the detected-reductions listing, and the state budget.

## Notes

- Branch `slice-35-explorer-efficiency`, from `main` after slice 34.
- The design discussion's notes: the session notes folder, `explorer-efficiency-design.md`.

## Build notes (2026-10-24)

**Result:** 11,230 states become **1,732** (room states 5,602 → 232), the whole search in about a
second; the full test suite runs in about 5 s (it was about 7 s), because the game's own searches got
smaller. The state budget is 9,000.

| Rules on | States | Room states |
|----------|--------|-------------|
| none (the explorer as it was) | 11,230 | 5,602 |
| + latches, labels, dead flags | 2,956 | 1,468 |
| + free toggles in their own room | 2,302 | 814 |
| + free toggles across rooms | 1,732 | 232 |

**Where it lives.** `src/content/reduce.ts` records where the content reads each flag (and how a
milestone can rule each read out); `explore.ts` uses it for flavour and dead flags, finds free
toggles, and explores each merged state from every setting it stands for. Tests in
`reduce.test.ts`: toy-world look-alikes on a tiny two-room world (a shed with a box, a yard with a
gate), each checked to fail under the mutation it guards; the cross-check; the listing; the budget;
the route replay.

**Changes from the spec, agreed with the developer during the build:**

- **Free toggles across rooms (Q13).** As specified (a flip available in this very state), toggles
  only merged inside their own room. They now merge wherever Dana can flip the flag and flip it
  back by side-effect-free steps: walking through doors that set nothing, and the flip. A room
  Dana can't return to, or a way back that sets something, rules it out. Soundness rests on reaching
  the exact flipped state and back (mutual reachability); the side-effect-free restriction only keeps
  that search small.
- **The cross-check baseline.** A search with no reductions at all hits the 50,000 cap, so the
  cross-check compares against the explorer as it was before this slice (`explore(..., { reduce:
  false })`: the slice 16 and 33 flavour rules, 11,230 states).
- **Labels count as flavour too:** a verb label's conditions only pick its wording.

**What the cross-check caught.** A read was being ruled out by its own flag: a door gated on "not
jammed" made `jammed` look dead once set, merging a jammed dead end with a winnable state (the toy
world's dead-end test). Fixed: a read is never ruled out by its own flag, and a flag that rules out
others is never dropped, so states with the same key agree on everything that decides what's dead.
That also keeps `visitedGiftShop`, which the first version wrongly dropped.

**Detected today** (`reduce.test.ts` lists them): the latch `reginaldSawArm`; flags that die at a
milestone `readScroll`, `sawGum`, `heardTeapotComplaint`, `lookedAtVending` (the last never varies
after the cent anyway); free toggles `coffinOpen`, `fridgeOpen`, `lockerOpen`, `caseOpen`.

**Side effects to know about:**

- The printed route is 30 steps (29 after slice 34): it knocks on the coffin before opening it,
  because opening an unknocked coffin knocks too, which is two flags, not a flip. The route is
  playable as it is: the end-to-end tests play it on both projects.
- **What's left is conversations:** 1,500 of the 1,732 states are mid-conversation. A toggle can't
  be flipped without leaving one, which isn't side-effect free, so they still double there.
  Conversations as single steps (out of scope above) is the next lever if the budget ever trips.

`npm test` (599), typecheck, build, both Playwright projects green.
