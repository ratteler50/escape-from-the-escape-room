# Slice 9 — Save/load, title screen, menu, text speed

**Status:** done, merged in [#7](https://github.com/ratteler50/escape-from-the-escape-room/pull/7), 2026-10-21 · **Milestone:** M2

## Why

Progress currently vanishes on reload, and the deployed game makes that obvious to anyone you send
the link to. This slice also adds the menu and settings shell that later polish slots into.

## Spec

### Player-facing

1. **Title screen** on load: the game's name, and
   - **Continue**: loads the most recent save, auto or manual. Greyed out if there's none.
   - **New game**: starts from the beginning. If saves exist, it doesn't touch them.
   - **Load**: the slot list (below).
2. **☰ menu button** in the top-right corner during play. It opens a panel with **Save**, **Load**,
   **Settings**, **Quit to title**, and **Close**. The button is ignored while lines are playing or
   Dana is walking; the panel blocks the room while it's open.
3. **Slots:** **Autosave** plus **Slot 1–3**. Each shows the room name and when it was saved
   ("Lich's Lair · 21 Oct, 23:40"), or "Empty".
   - **Save** writes to a manual slot; overwriting a filled slot asks "Overwrite?" first. You can't
     save into the Autosave slot.
   - **Load** loads any filled slot (including Autosave).
   - A save that's **incompatible** with the current game version shows "From an older version, can't
     load" and is greyed out.
4. **Autosave** happens whenever the game comes to rest after a command (no lines left, not walking).
   It doesn't autosave a won game: Continue after winning takes you to your last save before the end.
5. **Saving works mid-conversation**, and loading such a save drops you back into the conversation
   with its options showing.
6. **Settings → Text speed: Slow / Normal / Fast.** It changes how long a line stays up before it
   moves on by itself (×1.6 / ×1 / ×0.6). Clicking still skips. It's remembered across visits, and it
   isn't part of a save.
7. **Quit to title** returns to the title screen (progress is already autosaved).

### Under the hood

8. **Core `save.ts`** (pure, no browser):
   - `SaveFile = { format: 1, savedAt, state }`;
   - `toSaveFile(state, now)` and `loadSaveFile(world, json)` → `{ ok: true, state }` or
     `{ ok: false, reason }`;
   - **validation against the current content**: the room exists and Dana's position is on its floor,
     every inventory item exists, flags are booleans, a conversation's dialogue and node exist.
     Anything else is "incompatible", never a crash.
9. **Storage is behind an interface** (`SaveStore`: list, read, write) so the core logic is tested
   with an in-memory store; the browser uses `localStorage`. Corrupt JSON in a slot counts as
   incompatible.
10. **Scenes:** a new `TitleScene`, and `RoomScene` starts from whatever state it's given (new game
    or loaded). Menu, slot list, and confirm are view components in their own files.

Out of scope: deleting saves, save thumbnails, cloud saves, more than 3 manual slots, other settings
(the polish slice may add some).

## Acceptance checks

- `npm test` passes, including:
  - core: save/load round trip of a mid-game state and a mid-conversation state; each incompatibility
    is reported, not thrown (unknown room, unknown item, missing dialogue node, off-floor position,
    wrong format, corrupt JSON); the most recent save is picked for Continue;
  - every earlier test stays green.
- `npm run typecheck` and `npm run build` pass; CI green.
- Agent play-test (dev server):
  - title → New game → play a bit → autosave → reload → Continue resumes exactly;
  - save to Slot 2 mid-conversation → Quit to title → Load Slot 2 → back in the conversation;
  - overwrite prompt; Autosave not offered for Save; a hand-corrupted slot shows as incompatible;
  - text speed Fast and Slow visibly change line timing, and survive a reload.
- Developer play-test on the trackpad, including on the live site after merge.

## Plan

1. Core, test-first: `save.ts` (format, validation, most-recent), `SaveStore` interface + in-memory
   store.
2. View: `localStorage` store, `Settings` (text speed), `Speech` reads the speed.
3. View: `TitleScene`; `RoomScene` takes a starting state; autosave at rest.
4. View: ☰ button, menu panel, slot list, confirm dialog.
5. Play-test, docs (glossary: save file, slot, autosave), ask to push and open the PR.

## Notes / out-of-scope ideas

- Core: `save.ts` (format 1, `loadSaveFile` with content validation, `mostRecentSlot`), `SaveStore`
  interface + `InMemorySaveStore`; 12 tests, built on real content (a mid-conversation save from
  actual commands). Corrupt JSON, wrong format, malformed state, unknown room/item, off-floor
  position, and missing dialogue/node are all reported as reasons, never thrown.
- View: `storage.ts` (`LocalStorageSaveStore`, `settings.textSpeed`, all `localStorage` access
  guarded), `ui.ts` (modal + button), `menus.ts` (slot list, confirm, settings, game menu),
  `TitleScene` (owns `GameData`: world, new-game state, store). `RoomScene` takes its starting state;
  Play again uses the new-game state, not the loaded one.
- The ☰ button sits above the dialogue panel (so you can save mid-conversation) but below the
  line-skip blocker (so it's ignored while lines play); it also ignores clicks while Dana walks.
- Play-tested (real clicks for every menu, title, and slot interaction): New game → autosave →
  reload → Continue; save to Slot 2 mid-conversation; overwrite prompt (No); Autosave greyed out
  for Save; a planted incompatible Slot 3 greyed out with "From an older version, can't load";
  Quit to title → Load Slot 2 → conversation options back; text speed Fast measured (1980 ms for a
  36-character line = (1500 + 36×50) × 0.6) and still applied after a reload; winning doesn't
  autosave.
- Walking on the floor alone doesn't autosave (only commands do), so Continue may put Dana a few
  steps from where they stood. Fine for now.
- Later: slice 11's Playwright test covers the save round trip in CI.
- Developer feedback: text speed is hard to notice, because lines appear all at once and clicking
  skips the timer. Slice 12 adds a typewriter effect driven by the same setting.
