# Glossary

Shared vocabulary for the game and the codebase. Use these terms in code, docs, and commits.

| Term | Meaning |
|------|---------|
| **Room** | One screen of the game (Lich's Lair, Gift Shop, Break Room). Has a background, hotspots, and a walkable area. |
| **Entry point** | A named spot on a room's floor where Dana appears when they arrive that way (`room.entries.fromLair`). |
| **Exit** | A hotspot whose ⚙ "Go through" verb runs `goToRoom { roomId, entry }`. |
| **Hotspot** | A clickable region in a room: an object, a character, an exit. Has an id, a name (shown on hover), a look line, and an interaction point. |
| **Interaction point** | Where the player character walks to before interacting with a hotspot. |
| **Walkable area** | A polygon per room that the player character can move within. Clicks outside it are clamped to the nearest point inside. |
| **Verb** | One of Look, Take, Talk, Use. A hotspot declares which verbs it supports. |
| **Verb coin** | The row of verb buttons, each with its label, that opens when you click a hotspot with more than one available verb (a ring until slice 33). Also opens on an item: Look, Use with…, and the item's own action. |
| **Available verbs** | The verbs a hotspot offers right now, decided by the core from each verb's `when` conditions. |
| **Look** | The verb every hotspot has: the player character describes it. Right-click is a shortcut for it. |
| **Response** | One possible outcome of a verb: optional conditions plus a list of effects. The first matching response wins; the last is an unconditional fallback. |
| **Condition** | A test against game state: a flag is or isn't set, an item is or isn't held. |
| **Item** | Something in the inventory. Has an id, name, and look line. |
| **Held item** | The item the player chose "Use with…" on and is about to use. Interface state owned by the view; never saved, never seen by the core. |
| **Item action** | Something Dana does with an item by itself (`item.action`, e.g. Memorise). A third button on the item's coin. |
| **Item use** | What happens when a specific item is used on a specific hotspot (`hotspot.itemUses`). |
| **Combination** | An unordered pair of items plus responses (`world.combinations`); usually removes both and adds a result. |
| **Fallback line** | Said when nothing specific is written: a hotspot's `itemFallback`, or a generic line from `world.fallbacks`. |
| **Flag** | A named boolean in game state recording that something happened or is so. Named by one convention (slice 28): something that happened is a past-tense phrase (`tookGaryArm`, `learnedCue`, `reginaldLeftThrone`); a lasting state is a subject and an adjective (`caseOpen`, `lairDoorUnlocked`, `danaOffDuty`). Content validation checks that every flag a condition tests is set somewhere, and every flag set is read. |
| **Game state** | Everything that changes during play: current room, player position, inventory, flags. Serializable. Lives in the core. |
| **Command** | An input to the core, e.g. `look(hotspot)`, `interact(hotspot)`, `useOn(item, hotspot)`, `combine(a, b)`. |
| **Effect** | An output from the core in response to a command: say a line, add/remove an item, set a flag, start dialogue, change room. The view plays effects; the core never draws. |
| **Rule** | Content that maps a command (plus conditions on state) to effects. |
| **Character** | Someone who speaks: an id, a name, and a speech colour (`world.characters`). Dana is the player character; lines with no speaker are theirs. |
| **Conversation** | A dialogue in progress: `state.conversation` holds which dialogue and which node. Room commands are refused until it ends. |
| **Dialogue tree** | A graph of dialogue nodes for one character (`world.dialogues`), with a start node and an optional greeting. |
| **Node** | One point in a dialogue tree: the list of options Dana can pick there. |
| **Dialogue option** | A line Dana can say in a node. May be conditional (`when`), one-shot (`once`), carry effects (the reply, state changes), and goes to another node or ends the conversation. |
| **Speech queue** | The view plays a command's effects one at a time; each line waits for its reading time or a click. |
| **Win** | The `win` effect: sets the `won` flag and shows the "To be continued…" card. |
| **State space** | Every game state reachable from the start. The always-winnable test (`src/content/winnable.test.ts`) explores it to prove there are no dead ends. |
| **Save file** | `{ format, savedAt, state }` as JSON. Checked against the current content on load; a misfit is "incompatible", never a crash. |
| **Slot** | Where a save lives: `auto` (written whenever the game comes to rest) or `slot1`–`slot3` (manual). |
| **Settings** | Player preferences (text speed), stored apart from saves. |
| **Cutscene step** | A presentation-only effect (`walk`, `pause`, `face`): the core passes it through, the view animates it. |
| **sayOneOf** | A presentation-only effect: one of several lines, picked at random by the view (never the same twice in a row). The core passes it through; puzzles never depend on which line. Reading the Handbook uses it. |
| **Skip** | Skip ⏭ / Escape during a sequence: finish the current step and play the rest instantly, keeping every effect that matters. |
| **Typewriter** | Lines type out at the text speed. The first click completes a line; the next moves on. |
| **Name tag** | The speaker's name above a line, for everyone but Dana. |
| **Highlight** | The outline on the hotspot under the pointer. |
| **Exit cursor** | The arrow cursor over a hotspot the core reports as an exit (`isExit`). |
| **Core** | The headless, Phaser-free TypeScript layer: state, content types, rules engine. |
| **View** | The Phaser layer: renders state, plays effects, converts input into commands. |
| **Content** | The game's data — rooms, hotspots, items, rules, dialogue — as typed TS modules. |
| **Puzzle dependency chart** | A graph of what the player needs to obtain or do before something else becomes possible. Lives in `docs/design.md`. |
| **Slice** | One small, end-to-end unit of work with its own spec in `docs/slices/`. |
| **Milestone** | A playable checkpoint (M1–M4). See `docs/design.md`. |
| **Flavour bits** | Flags no condition reads, and spent once-only dialogue options that only say lines. They can't change what the player can do, so the always-winnable explorer merges states that differ only in them (`explore.ts`). |
