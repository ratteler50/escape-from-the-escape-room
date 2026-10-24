# Slice 5 — Reginald and dialogue trees

**Status:** done, merged in [#3](https://github.com/ratteler50/escape-from-the-escape-room/pull/3), 2026-10-21 · **Milestone:** M1

## Why

M1's first puzzle is a conversation: feed Reginald his cue line so he leaves the throne. That needs
a dialogue system (conditional options, one-shot options, options that change game state) and a
second character who can speak. It also needs two things later slices lean on: lines that play in
sequence instead of overwriting each other, and hotspots that appear or move with game state.

## Spec

### Reginald

1. **Reginald** sits on the throne as his own hotspot (placeholder: a coloured rectangle labelled
   "REGINALD", like Dana). Verbs: 👁 Look, 💬 Talk ("Address His Undeadness").
2. After his big "ARISE!" moment he stands on his **spotlight mark** between Gary and the throne,
   and stays there. Same verbs, different look line.
3. If Dana holds **Gary's Arm**, Reginald notices: a conditional dialogue line ("Gary is a member of
   the cast!") the first time you talk to him with it.

### The coffin and the script

4. New **coffin** hotspot ("Reginald's dressing room"). ⚙ "Open": Dana finds **Reginald's Script**
   (item) and skims it, learning the cue: *"Rise, foul creature, and face me!"* Look at the script
   repeats the gist.
5. **The gum is now gated**: the throne's ✋ "Check under the cushion" only appears once Reginald has
   left the throne. (Undoes slice 3's temporary shortcut.)

### Dialogue trees

6. Talking to Reginald opens a **conversation**. The inventory bar is replaced by a list of
   **dialogue options** (Dana's lines). Picking one: Dana says it, Reginald answers, and the list
   comes back, possibly changed.
7. **Options can be:**
   - **conditional**: only shown when conditions hold (e.g. the cue line needs the script);
   - **one-shot**: gone once picked;
   - **effectful**: set flags, add items, or end the conversation.
   There is always a way out ("I'll leave you to your... lair.").
8. Reginald's tree (lines are drafts):
   - "Who are you?" → his CV, with the Hamlet understudy story. One-shot.
   - "What's going on?" → the curse, as he understands it (he thinks it's a promotion). One-shot.
   - "Can you let me out?" → he won't break character; union rules. Repeatable, with a short answer
     after the first time.
   - "Handbook Section 4.2 says…" → he's unimpressed by management. One-shot.
   - **Cue line** (only with the script): *"Rise, foul creature, and face me!"* → "ARISE!", he leaves
     the throne for his mark, the conversation ends. Sets `reginaldLeftThrone`.
   - Goodbye.
   After he's left the throne, his tree changes: the cue line is gone and he's basking in his own
   performance.

### Speech

9. **Lines play in sequence.** A response with several lines (Dana, then Reginald, then Dana) plays
   them one at a time, each above its speaker, in that speaker's colour. **Clicking anywhere skips
   to the next line.** While lines are playing, clicks only skip; they don't walk or open coins.

Out of scope: the display case, scroll, keypad, win state, always-winnable test (slice 6);
Reginald walking animation (he just appears on his mark); voice; save/load.

## Design (for review)

- **Characters** are content: `world.characters` with a name and a speech colour. `say` gains an
  optional `speaker` (default Dana). The view finds where to draw a speaker's lines from the
  hotspot linked to that character.
- **Conversation state lives in the core's `GameState`**: `conversation?: { dialogueId, nodeId }`
  plus the set of one-shot options already used. Like verbs, the view asks the core what to show
  (`availableOptions(world, state)`) and sends `chooseOption`; the core returns the lines and the
  next node. Keeping it in game state means save/load (M2) can resume mid-conversation for free.
- **Dialogue content**: `world.dialogues[id] = { start, nodes }`; a node has optional entry lines
  and a list of options; an option has Dana's text, optional `when`, `once`, `effects`, and `next`
  (another node, or `end`). Effects gain `startDialogue` and `endDialogue`.
- **Hotspots gain an optional `when`**: a hotspot only exists while its conditions hold. Reginald on
  the throne and Reginald on his mark are two hotspots with opposite conditions, sharing one verbs
  object. The view redraws hotspots when flags change.
- **Speech queue** in the view: effects are played in order, `say` effects wait for their line to
  finish (or a click) before the next effect plays.

## Acceptance checks

- `npm test` passes, including:
  - core: starting a conversation, choosing options, conditional and one-shot options, effects from
    options, ending; choosing an option that isn't available throws;
  - core: hotspot `when`: hidden hotspots aren't clickable through the core (verbs/items throw);
  - content validation: every dialogue `next` points to a real node; every option has text; **every
    node has an always-available way out or onward** (an option with no `when` and no `once`), so
    you can't get stuck in a conversation; every `speaker` is a known character; hotspots with
    `when` still have interaction points on the floor;
  - the slice 1–3 tests stay green.
- `npm run typecheck` and `npm run build` pass; **CI green on the PR**.
- Agent play-test: the full chain now runs from a fresh start: coffin → script → talk → cue →
  Reginald moves → gum → sticky arm → grate → key. Also: one-shot options disappear, Gary's-arm
  line, click-to-skip, can't walk while lines play, Goodbye works.
- Developer play-test on the trackpad.

## Plan

1. Fix slice 4's doc status (still says "PR open").
2. Core types: characters, `speaker` on `say`, dialogues, conversation state, hotspot `when`,
   `startDialogue`/`endDialogue` effects, `chooseOption` command.
3. Core, test-first: conversations, `availableOptions`, hotspot visibility.
4. Content: Reginald (two hotspots), coffin, script, dialogue tree, gum gating; validation tests.
5. View: speech queue with click-to-skip and per-speaker colours; dialogue option list replacing
   the inventory bar; hotspot redraw on state change.
6. Play-test, fix, update docs (glossary: character, conversation, dialogue option, node).
7. Ask to push and open the PR.

## Notes / out-of-scope ideas

- Effects now go through `run()` in the engine, which expands `startDialogue` into the greeting, so a
  command can return more effects than its content listed. Node-level greetings were left out
  (YAGNI): only the dialogue as a whole has one, so returning to the hub doesn't repeat it.
- "Repeatable with a shorter answer the second time" is two options: a one-shot that sets a flag,
  and a conditional repeatable one. No new mechanism needed.
- Content dialogue helpers: `line(speaker, text)` and `setFlag(flag)` in `dsl.ts`; Reginald and his
  dialogue live in `content/reginald.ts`.
- New content rule, proven to fire: every node needs an option with no `when` and no `once`.
- View: the effect queue is presentation pacing only. The core's state is final the moment a
  command returns; `setFlag` redraws hotspots at its point in the queue, so Reginald moves between
  "ARISE!" and Dana's next line.
- Hotspot labels moved to the top edge so a character in front of a hotspot doesn't hide its name.
- **Play-test harness, explained:** synthetic clicks that jump to a new position without a pointer
  move can be ignored by Phaser (it tracks what's under the pointer from movement). Hovering before
  clicking fixed every case; this is likely the unexplained misfire from slice 3. Real mice and
  trackpads always move first. Also: when no line is showing, a "skip" click on the wall is a walk
  command and cancels a walk-then-act in progress; that's correct game behaviour, so automated runs
  skip lines through the dev hook instead.
- The browser pane's screenshot frame switched between 800×450 and 800×600 during the run; positions
  are computed from the game's own objects rather than from screenshots.
- Later: Reginald walking to his mark instead of appearing there (cutscene system, M2); a speaker
  name tag on lines; skipping a whole conversation's lines at once.
