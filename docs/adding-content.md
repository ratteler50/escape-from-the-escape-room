# Adding content

How to add a room, a character, a dialogue tree or a puzzle, and which test tells you what you
missed. Terms are from `docs/glossary.md`. Content is typed TypeScript in `src/content/` (decision
0003); the core never needs to change for new content.

## The shape of content

- **One file per room or character** (`lair.ts`, `kyle.ts`). Each exports one **content pack**
  (`ContentPack`, `src/content/pack.ts`): the rooms, items, combinations and dialogues it defines.
  `world.ts` merges the packs listed in `packs`; a duplicate id throws at startup.
- **Characters live in `cast.ts`**, with one helper each for their lines (`R`, `K`, `M`). Room and
  dialogue files import characters from `cast.ts`, never from each other's files, so there are no
  import cycles.
- **Effects are written with the DSL** (`dsl.ts`): `say`, `line`, `says`, `setFlag`, `addItem`,
  `removeItem`, `goTo`, `startDialogue`, `endDialogue`, `win`, `walk`, `pause`, `face`, `sound`. Don't
  write `{ type: … }` objects by hand.
- **Ids are plain strings** checked by the content tests, not the compiler. Where a file can import
  the thing, use its `.id` (`priceGun.id`); a room id in a `goTo` or a dialogue id in the file that
  defines it stays a string literal.
- **Flags** follow the glossary's convention: something that happened is a past-tense phrase
  (`tookGaryArm`, `learnedCue`); a lasting state is a subject and an adjective (`caseOpen`,
  `danaOffDuty`). There is no flag list: a flag exists once some effect sets it.
- **Text:** every hotspot and item has a look line; Dana quotes only Handbook sections in the table
  in `docs/design.md` (add new ones there). Mark a line `// DRAFT:` only to ask the developer about
  it; `npm run drafts` lists them in `docs/drafts.md`.

## A new room

1. **Layout first.** A layout sketch at exact hotspot coordinates in `docs/art/` (decision 0005), so
   the painting can be generated to fit.
2. **`src/content/<room>.ts`:** a `Room` with `id`, `name`, `entries` (named arrival points, on the
   floor), `walkable` (the floor polygon), `hotspots`, and optionally `music` and `art`. Export its
   pack: `export const <room>Pack: ContentPack = { rooms: [<room>], items: [...] }`.
3. **Register it:** add the pack to `packs` in `src/content/world.ts`, and the file to `FILES` in
   `scripts/drafts.ts` (its heading in `docs/drafts.md`).
4. **Connect it:** an exit hotspot in a neighbouring room, with a `use` verb labelled "Go through"
   whose effects end in `goTo('<room>', '<entry>')`, and an exit back. The exit cursor follows from
   the `goTo`.
5. **Art and audio (optional):** the background in `public/assets/rooms/`, overlays in
   `public/assets/overlays/`, a track in `audio.ts`. Every file goes in `CREDITS.md`.
6. **Test its puzzle chain** in `src/content/<room>.test.ts`, like `giftShop.test.ts`: start from a
   hand-built state in the room and run commands through `handle`.

## A new character

1. **`cast.ts`:** a `Character` (`id`, `name`, speech `color`, optional `sprites` and `walks`), a
   line helper, and the character added to `castPack`.
2. **A hotspot** with `character: <id>` in a room, so their lines are drawn above them. A character
   with no hotspot (Reginald on the intercom) speaks over Dana, with a name tag.
3. **Sprites** (optional) in `public/assets/characters/`, credited in `CREDITS.md`;
   `docs/art/characters.md` records them.

## A new dialogue tree

1. A `Dialogue` (`id`, `start` node, optional `greeting`, `nodes`) in the character's file, added to
   that file's pack under `dialogues`.
2. Start it from the character's hotspot: `talk: { responses: [{ effects: [startDialogue('<id>')] }] }`.
3. Each option: unique `id`, Dana's `text`, optional `when` and `once`, `effects` (the reply, written
   with the character's line helper), and `next` (a node id or `'end'`). Every node needs a way out.
4. Options someone else's file adds (Kyle's mug sale comes from `finale.ts`) are exported as a list
   and spread into the node.

## A new puzzle

1. **Chart it** in `docs/design.md`'s puzzle dependency chart before writing it.
2. **New items:** an `Item` with `id`, `name`, `look` and an `icon` (`public/assets/icons/`), in the
   defining file's pack. Optional `action` for something Dana does with it alone.
3. **Hook it up** with responses: a hotspot verb, an `itemUses` entry (an item used on a hotspot), a
   `Combination` (two items) or a dialogue option. The first response whose `when` holds wins, and
   the last has no `when`.
4. **Gate it with flags:** `setFlag('…')` when something happens, `{ flag: '…' }` /
   `{ notFlag: '…' }` in a `when` to test it.
5. **Never strand the player:** an item may only be taken away with a line saying why, and every
   reachable state must still be able to win.

## The tests that tell you what's missing

Run `npm test` after each step; failure messages say what to fix.

| Test | Catches |
|------|---------|
| `src/content/content.test.ts` | Unknown items, characters, dialogues, rooms, entries or sounds; empty lines; a last response with a `when`; entries and interaction points off the floor; hotspots off screen; **a condition testing a flag nothing sets, or a flag set and never read** |
| `src/content/pack.test.ts` | Two packs defining the same id |
| `src/content/winnable.test.ts` | Dead ends, unreachable rooms or items, commands that throw, the state cap; prints the shortest solution |
| `src/content/assets.test.ts` | Missing art or audio files, uncredited assets, an item without an icon, the 15 MB budget |
| `src/content/loading.test.ts` | Loading lines quoting a Handbook section that isn't in the design doc's table |
| `src/content/drafts.test.ts` | `docs/drafts.md` out of date: run `npm run drafts` |
| `e2e/game.spec.ts` (`npm run test:e2e`) | The shortest solution doesn't play through with real clicks; console errors on load. Its music checks name the first and last rooms' tracks, so update them if those change |
