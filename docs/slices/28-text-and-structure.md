# Slice 28 — Text and structure

**Status:** spec approved by the developer (2026-10-23); 28a merged (PR #34); 28b built and agent
play-tested · **Milestone:** M4, the last slice of M4 and of the project

## Why

The game is complete and playable, and its text and code grew room by room over 27 slices. Two
things are left before the project ends:

- **The text** was drafted in pieces. 246 lines still carry `// DRAFT:`. A few facts contradict
  each other between rooms, and a few documents misgender Dana or Kyle (both they/them). The
  developer won't punch up jokes by hand, so the agent finishes them.
- **The content code** works, but adding a room, dialogue tree or puzzle costs more than it should:
  half the effects are hand-written objects, a misspelt flag fails silently, and a new room touches
  `world.ts` in up to five places.

Decisions from the slice 28 grilling (2026-10-23).

## Survey findings

From reading PR #32's branch (what `main` will be once it merges).

**Text**
- 246 `// DRAFT:` lines (`docs/drafts.md`).
- **Pronouns:** the game's text gets Dana and Kyle right. The docs don't: `docs/glossary.md` (Entry
  point, Character), `docs/slices/07-rooms.md`, `10-cutscenes.md` and `12-polish.md` call Dana
  "she", and `27-walk-animation.md` item 9 calls Kyle "he".
- **Contradictions:**
  - "my first day" (`lair.ts`, the open display case) vs. the premise's *third weekend shift*.
  - Kyle's "Store closes at nine" vs. Dana clocking out at 9:47 PM, while Handbook §9 and the open
    front door say the shop is still in business hours.
  - A loading line, "Mine is 007", vs. the Break Room, where Dana only learns the number ("Now I
    do").
- **Repetition:** the 007 "licensed" joke appears three times (two Break Room lines and a loading
  line).
- **Text outside `src/content/`:** the end-card blurb (a DRAFT) and its music credit, which repeats
  `credits.ts` (`EndCard.ts`); the title tagline (`TitleScene.ts`); the loading caption
  (`LoadingScene.ts`).
- **Consistent already:** prices ($12.99 mug, $12.98 pay packet, $2 teapot, $3.50 phylactery) and
  Handbook sections all agree with `docs/design.md`.

**Code**
1. **The DSL is half-built.** `dsl.ts` has `say`, `line`, `says`, `setFlag`, `walk` and `sound`,
   but content still has 25 raw `addItem`/`removeItem` objects, 5 `goToRoom`, 4 `startDialogue`,
   3 `win` and 2 `pause`.
2. **Ids are plain `string`.** Decision 0003 expected the compiler to catch broken references; in
   practice only the content tests do.
3. **A misspelt flag fails silently.** Only overlay conditions are checked against flags that
   something sets (`content.test.ts`, "tests only flags the content sets"). A typo in any other
   `when` (hotspot, verb, response, option, greeting, item action) quietly hides or shows something.
   Nothing reports a flag that is set but never read, either.
4. **Scattered registration.** Each room file exports its room, items and combinations, plus
   separate character and dialogue objects. `world.ts` lists each in its own map, so a new room
   touches up to five places there.
5. **Import cycles.** `kyle.ts` imports `finale.ts`, and `mordecai.ts` imports `kyle.ts`, so
   `finale.ts` names Kyle and Mordecai by hand-typed ids (`line('kyle', …)`).
6. **Flag names mix styles:** `tookGaryArm`, `gotCent`, `knowsCue`, `heardTeapot`, `caseOpen`,
   `offDuty`, `mordecaiBack`. The docs record no convention.
7. **Smaller:**
   - `e2e/play.ts` keeps its own copy of `RoomScene`'s verb icons.
   - Conditions are AND-only, so the Lair's scroll overlay is listed twice to say "or".
   - Each room test hand-builds its starting `GameState`.

The view is clean: it hard-codes no room, character or flag ids.

## Spec

Two PRs from this spec, in order: **28a** (structure) first, then **28b** (text), cut from `main`
after 28a merges. They edit the same content files, so they never run in parallel sessions.

### Rules for both

1. **No change in behaviour beyond the text.** The puzzle graph, which hotspots, verbs, options and
   items exist, and the order of effects stay the same. The always-winnable, content-validation and
   e2e tests stay green and are not weakened. Text is the only thing a player notices.
2. **Saves may break.** The game isn't released. Where flags are renamed, the save format number
   goes up, so an old save shows the existing "incompatible" message.

### 28a — Structure

3. **Finish the DSL.** Add helpers for every effect content writes by hand: `addItem`,
   `removeItem`, `goTo(roomId, entry)`, `startDialogue`, `endDialogue`, `win`, `pause`, `face`.
   Replace every raw effect object in `src/content/` with them. Each gets a one-line doc comment,
   like the existing helpers.
4. **Check every condition's flag.** The content-validation test checks every `flag`/`notFlag` in
   every `when`, not only in overlays: hotspots, verbs, responses, item uses, options, greetings,
   item actions and overlays. Each must be set by some effect (or be `won`). A second check: each
   flag that is set but never read must be listed as deliberately unread (flavour, `explore.ts`), so
   a typo on the setting side shows up too. Failure messages follow the file's rule: fixable from
   the message alone.
5. **One bundle per content file.** Each room or character module exports one `ContentPack`:
   whatever it contributes, from rooms, items, combinations, characters and dialogues. `world.ts`
   merges a list of packs. The merge throws on a duplicate id, and a content test proves it does.
   Adding a room becomes: write the file, add its pack to the list.
6. **Break the import cycles.** Move character definitions (`Character` objects and their speech
   helpers such as `K`, `M`, `R`) into a module nothing else in content imports from beyond types,
   e.g. `src/content/cast.ts`. `finale.ts` then refers to Kyle and Mordecai by their objects' ids,
   with no hand-typed strings.
7. **Rename flags to one convention.**
   - **Something happened:** past-tense verb phrase (`tookGaryArm`, `gotCent`, `learnedCue`,
     `heardTeapotComplaint`).
   - **A lasting state:** subject plus adjective (`caseOpen`, `doorUnlocked`, `danaOffDuty`,
     `mordecaiByBin`).
   - The convention and its examples go in `docs/glossary.md` under **Flag**. Bump the save format.
     Update references in tests, e2e and docs that name flags.
8. **One copy of the verb icons.** `e2e/play.ts` imports the icon table from the view (or both
   import it from a small shared module) instead of keeping its own.
9. **`docs/adding-content.md`:** a short checklist for a new room, character, dialogue tree and
   puzzle. It names the files to touch, the DSL helpers, the flag convention, and which test tells
   you what's missing (content validation, always-winnable, assets and credits, e2e). Linked from
   `CLAUDE.md`. The agent checks it by reading it cold and confirming every step names a real file
   or test.
10. **Out of 28a, noted for later:** typed ids (string-literal unions for rooms, items and flags;
    big and noisy for what the tests already catch), OR conditions, and a shared helper for room
    tests' starting states.

### 28b — Text

11. **Scope: every player-facing line.** Look lines, item text, dialogue trees, greetings, fallback
    lines, cutscenes, loading lines, the end card, the title tagline, the loading caption and the
    Credits panel. Interface labels ("Save", "Quit to title", "Play again") stay in the view, but the
    pass checks them too.
12. **Story text moves into content.** The end-card blurb, the title tagline and the loading caption
    move to a content module (e.g. `src/content/screens.ts`). The end card's music credit comes from
    `credits.ts` instead of its own copy.
13. **Check every line against:**
    - **Tone:** PG, absurdist, never mean (`docs/design.md`).
    - **Voice:** Dana is earnest and quotes the Handbook; Reginald is grand and quotes his union
      contract; Kyle uses as few words as possible; Mordecai is pompous.
    - **Names:** Escape-O-Rama, Reginald Vantablack-Thorne, Mordecai the Moderately Powerful.
    - **Handbook quotes** match the section table.
    - **Pronouns:** Dana and Kyle they/them.
    - **Facts between rooms:** doors, prices, times, what the curse does, and what Dana knows when.
14. **Settled contradictions:**
    - "my first day" → "my third shift".
    - Kyle's "Store closes at nine" stays; the clock-out becomes "OUT: 8:47 PM".
    - The loading screen stops naming 007, so the Break Room is still where Dana learns it.
    - Any other contradiction the pass finds is fixed and listed in this doc's **Build notes**, with
      the fix chosen.
15. **Punch up the jokes, thoroughly.** Rewrite every DRAFT line and every finished line that is
    weak or repeats a joke (the three 007 "licensed" gags become one). Keep lines that already work.
    Then remove every `// DRAFT:` marker. Subagents may draft one room or character each in
    parallel; the agent merges their drafts and checks them against item 13 across the whole game.
16. **How far a rewrite may go.** Within one response or option, lines may be added, cut, split,
    merged or given to another speaker. No new dialogue options, hotspots, items or flags. An idea
    that needs new structure goes in **Notes for later** below.
17. **Line lengths** stay within what the speech bubble and dialogue panel show without overflow.
    The agent checks long lines in the browser pane.
18. **Docs pronouns:** fix the slips listed in the survey, including in old slice docs.
19. **DRAFT tooling stays.** `npm run drafts`, `drafts.test.ts` and `docs/drafts.md` remain, with
    `drafts.md` listing 0 lines. `CLAUDE.md`'s content rule changes: the agent writes finished lines
    and marks `// DRAFT:` only on a line it wants the developer's opinion on.

## Play-testing

- **28a:** all tests green; the agent plays the full game once in the browser pane and checks the
  console is clean. Nothing should look different, so the developer's play-test can be a quick run.
- **28b:** the PR description carries a **review table** of every changed line, old → new, grouped
  by room and character, unchanged lines left out. The developer play-tests, names lines to revert
  or redo, and the agent takes a second pass. The agent screenshots the end card, the title and a
  few of the longest lines.

## Done when

- 28a and 28b are merged; both CI workflows (`ci.yml`, `e2e.yml`) are green on each.
- No `// DRAFT:` lines remain; `docs/drafts.md` lists 0.
- `docs/adding-content.md` exists and every step in it names a real file or test.
- The M4 table in `docs/design.md` shows slice 28 done, and so M4 and the project.

## Notes for later

- The Kyle and Mordecai options about what's going on are offered before Dana has tried the front
  door, so they no longer mention it. Gating them on a "tried the front door" flag would let Dana
  bring it up, but needs a new flag (out of scope for 28b).

## Build notes

### 28a

- **DSL:** `addItem`, `removeItem`, `goTo`, `startDialogue`, `endDialogue`, `win`, `pause` and
  `face` added; no raw effect objects remain in content.
- **Flag checks:** one walk over the whole world collects every condition and every `setFlag`, with
  its path (e.g. `world.dialogues.kyle.nodes.hub.options[7].when[0]`), replacing the overlay-only
  test. Every flag set today is also read, so `DELIBERATELY_UNREAD` (`content.test.ts`) starts
  empty. Checked by planting a typo on each side: both tests failed and named the spot.
- **Packs:** `ContentPack` and `mergePacks` in `src/content/pack.ts` (tested in `pack.test.ts`).
  Each file's pack lists what that file defines, so Reginald's Script now belongs to
  `reginaldPack`, the Price Gun to `kylePack` and the mug to `finalePack`, rather than to the
  room's item list.
- **Cast:** `src/content/cast.ts` holds all four characters and the `R`/`K`/`M` helpers; `dana.ts`
  is gone. Content imports now form no cycles. The finale names Exact Change by import. Room ids in
  `goTo`, dialogue ids in the files that define them, and the Script's own id inside its
  `Memorise` action stay string literals (the content tests check them).
- **Flags renamed:** `offDuty` → `danaOffDuty`, `doorUnlocked` → `lairDoorUnlocked`,
  `knowsCue` → `learnedCue`, `knowsEmployeeNumber` → `learnedEmployeeNumber`, `heardTeapot` →
  `heardTeapotComplaint`, `mordecaiBack` → `mordecaiByBin`, `kyleWontSellToStaff` →
  `kyleRefusedStaffSale`. Hotspot and option ids are unchanged. Older slice docs keep the old names
  as history. `SAVE_FORMAT` is 2.
- **Icons:** `src/view/icons.ts` (no Phaser), imported by `RoomScene` and `e2e/play.ts`.
- **Play-test:** `npm test` (433), typecheck, and `npm run test:e2e` (the shortest solution with
  real clicks, no console errors on load, the save round-trip) all green. In the dev build a
  format-1 autosave leaves Continue disabled, with no error.

### 28b

- **Story text into content:** `src/content/screens.ts` (the title tagline, the loading caption, the
  end-card blurb); the end card's credit is `credits.musicShort`. `scripts/drafts.ts` lists
  `screens.ts`.
- **Facts the text now agrees on:**
  - Dana is on their **third weekend shift**; Kyle is on their third summer.
  - The shop **closes at nine**; Dana clocked in at 4:00 PM and clocks out at **8:47 PM**, so it's
    business hours (Handbook §9, the open front door).
  - Dana learns **007** in the Break Room; the loading screen only knows where it's printed.
  - Handbook §3 is "returned and logged" everywhere.
  - The jar **goes quiet** when the curse lifts, then whispers from the bargain bin (and on the end
    card).
  - Nobody refers to something Dana hasn't seen or been told yet: Kyle's look line, and the
    "what's going on?" options to Kyle and Mordecai.
- **Jokes:** 23 lines changed, listed old → new in the PR. Most finished and DRAFT lines already
  worked and were kept as they are; every `// DRAFT:` marker is gone (`docs/drafts.md` lists 0).
  `CLAUDE.md`'s content rule now says the agent writes finished lines and marks a draft only to ask.
- **Checked, no change needed:** prices, Handbook sections against the design doc's table, names,
  and Dana's and Kyle's they/them in every game line. Interface labels in the view.
- **Docs pronouns:** the glossary (Entry point, Character) and slice docs 06, 07, 09, 10, 12 and 27.
- **Play-test:** `npm test` (433), typecheck and `npm run test:e2e` green. In the dev build: the
  longest line (the keypad) still fits its bubble; the finale plays to the end card, which shows
  the blurb and music credit from content; no console errors.
