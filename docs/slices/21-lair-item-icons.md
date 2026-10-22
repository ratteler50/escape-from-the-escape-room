# Slice 21 — Item icons for the Lair

**Status:** awaiting approval · **Milestone:** M4

## Why

The inventory is still grey boxes with item names in them, the last placeholder in the Lair. With
icons the Lair is polished end to end (art, characters, overlays, audio, items) before the Gift
Shop and Break Room copy the whole pipeline (M4 plan, `docs/design.md`; icons added 2026-10-22).

## Spec

1. **The icons:** everything you can carry in the Lair, plus the lanyard you start with:

   | Item | Icon (matching its look line) |
   |------|------|
   | Staff Lanyard | a bright lanyard with a badge reading TRAINEE |
   | Gary's Arm | a cartoon skeleton arm, upper arm to fingers |
   | Pre-Owned Gum | a wad of bright pink chewing gum |
   | Sticky Arm | Gary's arm with a pink blob of gum on one fingertip (matches the grate overlay) |
   | Display Case Key | a tiny key on a skull keyring with a tag reading DISPLAY CASE |
   | Ancient Riddle Scroll | a rolled parchment scroll, slightly unrolled, tied with a ribbon |
   | Reginald's Script | a dog-eared stapled script with "ACT ONE" on the cover |

   Same style as the characters: flat colour, bold outlines (decision 0005), so items read as
   "things you hold", not part of the painted room.
2. **Making them:** one ChatGPT image with all seven in a grid on a plain background (prompt pack
   `docs/art/prompts-icons.md`, Dana's sheet attached for style), so they match each other. **You
   approve the sheet** (regenerations welcome). The agent cuts each icon out with
   `scripts/cut-sprite.py`, square and centred, stored at 2× (128 px) like the sprites.
3. **Content:** an item can name an `icon` (presentation only; the core ignores it). Content
   validation checks every icon file exists; each gets a `CREDITS.md` row.
4. **The inventory bar:**
   - a slot with an icon shows the icon instead of the name (the name still appears on hover, as
     now, and in "Use … with …");
   - the held item's slot keeps its highlight, and a small copy of the icon **follows the pointer**
     while an item is held (the classic adventure-game "item on the cursor");
   - items without an icon (the Gift Shop's and Break Room's, until slices 22–23) and `?art=off`
     keep the text boxes.
5. **Playwright:** `e2e/game.ts` finds inventory slots by the item's name in the slot's text label,
   which icons remove. It finds them by item id instead, so the tests don't depend on how a slot
   looks.

Out of scope: icons for the Gift Shop and Break Room items (slices 22–23), animated icons, a
bigger inventory bar.

## Approvals you'll be asked for

1. The icon sheet.
2. The icons in place in the game (screenshots), before they're committed.

## Acceptance checks

- Unit tests: validation fails for a missing icon file; assets tests (credits, budget) pass.
- `npm test`, typecheck, build, Playwright all green.
- Agent play-test: the Lair's inventory with icons, hover names, the held item following the
  pointer and its "Use … with …" caption, a Gift Shop item still a text box beside Lair icons,
  `?art=off`.
- Developer play-test.

## Notes

- Branch `slice-21-lair-item-icons`, from `main` once PR #20 (audio) has merged.
