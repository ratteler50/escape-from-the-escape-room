# Glossary

Shared vocabulary for the game and the codebase. Use these terms in code, docs, and commits.

| Term | Meaning |
|------|---------|
| **Room** | One screen of the game (Lich's Lair, Gift Shop, Break Room). Has a background, hotspots, and a walkable area. |
| **Hotspot** | A clickable region in a room: an object, a character, an exit. Has an id, a name (shown on hover), a look line, and an interaction point. |
| **Interaction point** | Where the player character walks to before interacting with a hotspot. |
| **Walkable area** | A polygon per room that the player character can move within. Clicks outside it are clamped to the nearest point inside. |
| **Look** | Right-click on a hotspot or item: the player character describes it. Every hotspot has a look line. |
| **Interact** | Left-click on a hotspot: walk to it, then do the context-appropriate action (take, use, talk, open). |
| **Item** | Something in the inventory. Has an id, name, and look line. |
| **Use-on** | Applying an inventory item to a hotspot. |
| **Combine** | Applying one inventory item to another to produce a new item. |
| **Flag** | A named boolean (or small value) in game state recording that something happened, e.g. `readScript`, `reginaldLeftThrone`. |
| **Game state** | Everything that changes during play: current room, player position, inventory, flags. Serializable. Lives in the core. |
| **Command** | An input to the core, e.g. `look(hotspot)`, `interact(hotspot)`, `useOn(item, hotspot)`, `combine(a, b)`. |
| **Effect** | An output from the core in response to a command: say a line, add/remove an item, set a flag, start dialogue, change room. The view plays effects; the core never draws. |
| **Rule** | Content that maps a command (plus conditions on state) to effects. |
| **Dialogue tree** | A graph of dialogue nodes for a conversation. |
| **Dialogue option** | A player choice in a dialogue node. May be conditional (shown only when flags allow), one-shot (removed after use), and may set flags. |
| **Core** | The headless, Phaser-free TypeScript layer: state, content types, rules engine. |
| **View** | The Phaser layer: renders state, plays effects, converts input into commands. |
| **Content** | The game's data — rooms, hotspots, items, rules, dialogue — as typed TS modules. |
| **Puzzle dependency chart** | A graph of what the player needs to obtain or do before something else becomes possible. Lives in `docs/design.md`. |
| **Slice** | One small, end-to-end unit of work with its own spec in `docs/slices/`. |
| **Milestone** | A playable checkpoint (M1–M4). See `docs/design.md`. |
