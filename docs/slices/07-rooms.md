# Slice 7 — Rooms (and a stub Gift Shop)

**Status:** built, agent play-tested · awaiting PR and developer play-test · **Milestone:** M2 · **Branch:** `slice-7-rooms` · **Runs alongside:** slice 8 (deploy), in its own session

## Why

The game is three rooms; so far it's one. Save/load and cutscenes both need to know about rooms,
so this comes first in M2. A stub Gift Shop proves the system without writing M3's content.

## Spec

### Player-facing

1. Once the Lair door is unlocked, its ⚙ becomes **"Go through"** (still labelled "Escape!" the first
   time, for the moment). Using it: Dana's line, a short fade, and they're in the **Gift Shop**,
   standing by the door they came through.
2. **Stub Gift Shop** (placeholder art like the Lair):
   - a door back to the Lair (⚙ "Go through" → back in the Lair, by its door);
   - a few look-only hotspots with jokes (the mug rack, the till, a cardboard Reginald standee);
   - a front door marked **"CLOSED FOR REFURBISHMENT"**: ⚙ using it gives the
     **"To be continued…"** card. The Lair door no longer wins.
3. Inventory, flags, and conversation history carry across rooms. Going back to the Lair finds it
   as you left it.

### Under the hood

4. **Rooms get named entry points** (`entries: { fromGiftShop: {x, y}, ... }`), each on the floor.
5. New effect **`goToRoom { roomId, entry }`**: the core switches `state.roomId` and puts Dana at
   that entry point. Only the current room's hotspots can be used.
6. An exit may take an item away, but only with a line saying why (content rule in `CLAUDE.md`).
   Nothing in this slice does; the mechanism is just ordinary effects before `goToRoom`.
7. **The always-winnable test works across rooms**: the room is part of a state's identity, and
   every room must be reachable.
8. **Split `RoomScene`** into smaller pieces so later slices (and parallel sessions) touch separate
   files: the room's drawing and hotspots, the speech queue, and Dana's sprite. `RoomScene` stays
   the coordinator that turns clicks into commands and plays effects.

Out of scope: save/load (slice 9); walking animations through doors (slice 10, cutscenes); real
Gift Shop puzzles (M3).

## Acceptance checks

- `npm test` passes, including:
  - core: `goToRoom` changes room and places Dana at the entry; hotspots in other rooms can't be
    used; inventory and flags survive the trip;
  - content validation: entry points are on their room's floor; every `goToRoom` names a real room
    and entry;
  - always-winnable: no dead ends across both rooms, both rooms reachable, the walkthrough now ends
    in the Gift Shop;
  - every earlier test stays green, unchanged except where the win moved.
- `npm run typecheck` and `npm run build` pass; CI green on the PR.
- Agent play-test: Lair → Gift Shop → back to the Lair (state intact) → Gift Shop → front door →
  "To be continued…" card → Play again.
- Developer play-test on the trackpad.

## Plan

1. Refactor first, no behaviour change: split `RoomScene` into `RoomView` (background, floor,
   hotspots), `Speech` (the effect/line queue and skip), and `PlayerSprite`. Play-test that nothing
   changed.
2. Core, test-first: room entries, `goToRoom`, cross-room behaviour.
3. Content: Lair door → Gift Shop; stub Gift Shop; win moved. Validation for entries and
   `goToRoom`.
4. Always-winnable across rooms.
5. View: switching rooms (fade, redraw, place Dana).
6. Play-test, docs (glossary: entry point, exit), ask to push and open the PR.

## Notes / out-of-scope ideas

- Refactor: `RoomScene` (357 lines) → `RoomScene` coordinator (≈260) + `RoomView` (room and
  hotspots), `PlayerSprite` (Dana, walking), `Speech` (one line at a time, click-to-skip blocker).
  The effect queue stays in `RoomScene` because it dispatches every effect type. Regression
  play-tested before adding rooms.
- `Room.entries` is required, so the compiler flags any room without entry points. The Lair has a
  `start` entry, which `initialState` now uses instead of a hard-coded position.
- Spec deviation: the Lair door's label is "Go through" every time (labels can't be conditional).
  The first trip plays "Freedom! Or at least... retail." and sets `visitedGiftShop`; later trips are
  silent.
- Always-winnable: the room is part of a state's identity; 784 states explored; shortest solution
  is 12 steps ending at the Gift Shop's front door. New check "every room is reachable", proven to
  fail with a temporary unreachable room.
- The app put the parallel deploy session's worktree inside this repo (`.claude/worktrees/`);
  ignored in `.gitignore`.
- Play-test: the Lair chain up to the unlocked door was driven through `dispatch` (real-click tested
  in slices 5–6); the Lair → Gift Shop → Lair → Gift Shop → front door → card → Play again route was
  real clicks. Dana arrives at the right entry each time; state and Reginald's position persist.
- Gift Shop label "Door to the Lich's Lair" ran off-screen; renamed "Lair Door".
- Later: Dana walking out through doors (slice 10, cutscenes); real Gift Shop content (M3).
