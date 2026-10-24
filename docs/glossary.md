# Glossary

Shared vocabulary for the game and the codebase. Use these terms in code, docs, and commits. Kept
current.

## The game world

| Term | Meaning |
|------|---------|
| **Room** | One screen of the game (the Lich's Lair, the Gift Shop, the Break Room). Has a background, hotspots, and a walkable area. |
| **Hotspot** | A clickable region in a room: an object, a character, an exit. Has an id, a name (shown on hover), a look line, and an interaction point. May exist only while conditions hold (`when`). |
| **Interaction point** | Where Dana walks to before interacting with a hotspot. |
| **Walkable area** | A polygon per room that Dana can move within. Clicks outside it are clamped to the nearest point inside. |
| **Entry point** | A named spot on a room's floor where Dana appears when they arrive that way (`room.entries.fromLair`). |
| **Exit** | A hotspot whose "Go through" verb runs `goToRoom { roomId, entry }`. The core reports it (`isExit`), and the view gives it an exit cursor. |
| **Item** | Something in the inventory. Has an id, a name, an icon and a look line. |
| **Character** | Someone who speaks: an id, a name, a speech colour, optional sprites (`world.characters`). Dana is the player character; lines with no speaker are theirs. A character is drawn where their hotspot is; one with no hotspot (Reginald on the intercom) speaks over Dana. |
| **The Employee Handbook** | Dana's item and running joke. Its sections are the one list in `src/content/handbookSections.ts` (shown in `docs/handbook.md`), and each means one thing everywhere; a test rejects a section that isn't listed. |
| **Win** | The `win` effect: sets the `won` flag, and the view shows the end card (THE END?). |

## Playing

| Term | Meaning |
|------|---------|
| **Verb** | One of Look, Take, Talk, Use. A hotspot declares which verbs it supports. |
| **Verb coin** | The row of verb buttons, each with its label, that opens when you click a hotspot with more than one available verb (a ring until slice 33). Also opens on an item: Look, Use with…, and the item's own action. |
| **Available verbs** | The verbs a hotspot offers right now, decided by the core from each verb's `when` conditions. |
| **Look** | The verb every hotspot has: Dana describes it. Right-click is a shortcut for it. |
| **Held item** | The item the player chose "Use with…" on and is about to use. Interface state owned by the view; never saved, never seen by the core. |
| **Item action** | Something Dana does with an item by itself (`item.action`, e.g. Memorise, Read). A third button on the item's coin. |
| **Item use** | What happens when a specific item is used on a specific hotspot (`hotspot.itemUses`). |
| **Combination** | An unordered pair of items plus responses (`world.combinations`); usually removes both and adds a result. |
| **Fallback line** | Said when nothing specific is written: a hotspot's `itemFallback`, or a generic line from `world.fallbacks`. |
| **Conversation** | A dialogue in progress: `state.conversation` holds which dialogue and which node. Room commands are refused until it ends. |
| **Dialogue options panel** | Dana's lines to pick from during a conversation, along the bottom of the screen. Scrolls with ▲/▼ (or the wheel) when they don't fit (slice 31). |
| **Speech queue** | The view plays a command's effects one at a time; each line waits for its reading time or a click. |
| **Typewriter** | Lines type out at the text speed. The first click completes a line; the next moves on. |
| **Speech band** | The dark, rounded band each spoken line sits on, over the speaker's head (slice 31). |
| **Name tag** | The speaker's name on the speech band, in their colour, for everyone but Dana. |
| **Skip** | Skip ⏭ / Escape during a sequence: finish the current step and play the rest instantly, keeping every effect that matters. |
| **Hover caption** | The name of the hotspot or item under the pointer, shown by the pointer. |
| **Highlight** | What hovering shows over the art: the hover caption and the cursor, and on a character a glow along their sprite's outline (slice 29; not under the Canvas renderer). Placeholder shapes (`?art=off`) get a yellow outline instead. |
| **Show clickable** | Hold H, or the ☰ menu's toggle: every hotspot's area and name shown at once. |
| **Exit cursor** | The arrow cursor over a hotspot the core reports as an exit. |
| **Sideways screen** | "Turn your phone sideways": covers the game, paused, on a touch device held upright (slice 32). |
| **Touch area** | On a touch device, a small hotspot's tap area, grown to at least 88×88 game pixels without covering a neighbour (`src/view/touchArea.ts`, slice 32). |

## Content and rules

| Term | Meaning |
|------|---------|
| **Content** | The game's data (rooms, hotspots, items, dialogue, rules) as typed TypeScript modules in `src/content/` (decision 0003). |
| **Content pack** | What one content file defines: its rooms, items, combinations and dialogues (`ContentPack`). `world.ts` merges the packs. |
| **Response** | One possible outcome of a verb, item use, combination or greeting: optional conditions plus a list of effects. The first matching response wins; the last is an unconditional fallback. |
| **Condition** | A test against game state: a flag is or isn't set, an item is or isn't held. |
| **Flag** | A named boolean in game state recording that something happened or is so. Named by one convention (slice 28): something that happened is a past-tense phrase (`tookGaryArm`, `learnedCue`, `reginaldLeftThrone`); a lasting state is a subject and an adjective (`caseOpen`, `lairDoorUnlocked`, `danaOffDuty`). Content validation checks that every flag a condition tests is set somewhere, and every flag set is read. |
| **Command** | An input to the core: `verb`, `lookItem`, `itemAction`, `useItemOn`, `combine`, `chooseOption`. |
| **Effect** | An output from the core in response to a command: say a line, add or remove an item, set a flag, start or end a dialogue, change room, play a sound, win. The view plays effects; the core never draws. |
| **Cutscene step** | A presentation-only effect (`walk`, `pause`, `face`): the core passes it through, the view animates it. |
| **sayOneOf** | A presentation-only effect: one of several lines, picked at random by the view (never the same twice in a row). Puzzles never depend on which line. Reading the Handbook uses it. |
| **Dialogue tree** | A graph of dialogue nodes for one character (`world.dialogues`), with a start node and an optional greeting. |
| **Node** | One point in a dialogue tree: the list of options Dana can pick there. |
| **Dialogue option** | A line Dana can say in a node. May be conditional (`when`), one-shot (`once`), carry effects (the reply, state changes), and goes to another node or ends the conversation. |
| **Puzzle dependency chart** | A graph of what the player needs to obtain or do before something else becomes possible. The game's is in `docs/design.md`. |
| **Draft line** | A line marked `// DRAFT:` to ask the developer's opinion; `npm run drafts` lists them in `docs/drafts.md`. |

## State and saving

| Term | Meaning |
|------|---------|
| **Game state** | Everything that changes during play: current room, Dana's position, inventory, flags, the conversation, spent options. Serializable. Lives in the core. |
| **State space** | Every game state reachable from the start. The always-winnable test (`src/content/winnable.test.ts`) explores it to prove there are no dead ends. |
| **Flavour bits** | Flags no condition reads, and spent once-only dialogue options that only say lines. They can't change what the player can do, so the explorer merges states that differ only in them (`explore.ts`). |
| **Save file** | `{ format, savedAt, state }` as JSON. Checked against the current content on load; a misfit is "incompatible", never a crash. |
| **Slot** | Where a save lives: `auto` (written whenever the game comes to rest) or `slot1`–`slot3` (manual). |
| **Settings** | Player preferences, stored apart from saves: text speed, music and effects volume, mute. |

## Art and audio

| Term | Meaning |
|------|---------|
| **Painting** | A room's background art, 1280×720 (`public/assets/rooms/`). Hotspot bounds are fitted to it. |
| **Overlay** | A patch of a painting drawn on top while conditions hold, to show something that changed (Gary's missing arm, an open fridge). |
| **Sprite** | A character's cut-out picture, flat colour with bold outlines, drawn over the painting. |
| **Pose** | Which sprite a character is drawn in: `standing`, `seated` (Reginald on the throne), `human` (Reginald after the curse). |
| **Walk sheet** | A row of walk-cycle frames for a pose (slice 27). |
| **Key art** | The title screen painting, the logo, and the end card painting (slice 26). |
| **Prompt pack** | A doc in `docs/art/` with the prompts for ChatGPT, written by the agent, for the developer to generate from. Results go to `art-inbox/` (git-ignored). |
| **`?art=off`** | A URL flag that draws placeholder shapes instead of the art, for debugging. |

## Code and process

| Term | Meaning |
|------|---------|
| **Core** | The headless, Phaser-free TypeScript layer (`src/core/`): state, content types, rules engine. |
| **View** | The Phaser layer (`src/view/`): renders state, plays effects, converts input into commands. |
| **Slice** | One small, end-to-end unit of work with its own spec and build notes in `docs/slices/`. |
| **Milestone** | A playable checkpoint made of slices (M1–M6). See `docs/milestones.md`. |
