# Slice 21 — Item icons and the inventory tray

**Status:** built, agent and developer play-tested · **Milestone:** M4

## Why

The inventory is still grey boxes with item names in them, the last placeholder in the Lair. With
icons and a styled bar the Lair is polished end to end (art, characters, overlays, audio,
inventory) before the Gift Shop and Break Room copy the whole pipeline (M4 plan, `docs/design.md`;
icons added 2026-10-22). Decisions from the slice 21 grilling (2026-10-22).

## Spec

1. **Icons for all 13 items**, from one sheet so they match. Doing every item now, not only the
   Lair's, means slices 22–23 have no icon work, and the Gift Shop and Break Room paintings can be
   made to match the icons (the mug on the rack, the time card) instead of the other way round:

   | Item | Icon (matching its look line) |
   |------|------|
   | Staff Lanyard | a bright lanyard with a badge reading TRAINEE |
   | Gary's Arm | a cartoon skeleton arm, upper arm to fingers |
   | Pre-Owned Gum | a wad of bright pink chewing gum |
   | Sticky Arm | Gary's arm with a pink blob of gum on one fingertip (matches the grate overlay) |
   | Display Case Key | a tiny key on a skull keyring with a tag reading DISPLAY CASE |
   | Ancient Riddle Scroll | a rolled parchment scroll, slightly unrolled, tied with a ribbon |
   | Reginald's Script | a dog-eared stapled script with "ACT ONE" on the cover |
   | Price Gun | a chunky handheld price-tag gun |
   | Time Card | a punch card with a TRAINEE name line |
   | Pay Packet | a small brown pay envelope |
   | One Cent | a single copper coin |
   | Exact Change | a small neat stack of notes and coins |
   | "I ESCAPED" Mug | a souvenir mug reading I ESCAPED THE LICH'S LAIR |

   (The exact descriptions follow each item's look line; the prompt pack has the final wording.)
   Flat colour, bold outlines, like the characters (decision 0005): things you hold, not part of the
   painted room.
2. **The inventory tray:** a tacky branded **Escape-O-Rama** plastic tray: franchise purple, the
   cartoon skull logo from Dana's polo, cheap moulded slots, a sticker reading "STAFF PROPERTY – DO
   NOT REMOVE". It's on-theme everywhere (the whole place is one cheap franchise). Flat with
   outlines, like the icons: it's interface, under the room, not in it.
3. **Making them:** two ChatGPT images from a prompt pack (`docs/art/prompts-inventory.md`, Dana's
   sheet attached for style):
   - the **icon sheet**, all 13 in a grid on a plain background;
   - the **tray sheet**: a tray background that can stretch across the screen, and one moulded slot
     frame.
   **You approve each sheet** (regenerations welcome). The agent cuts the pieces out with
   `scripts/cut-sprite.py`, stored at 2× like the sprites.
4. **Content:** an item can name an `icon` (presentation only; the core ignores it). Content
   validation checks every icon file exists; every file gets a `CREDITS.md` row.
5. **The inventory bar:**
   - the tray across the bottom, with the slot frame repeated by code. Slots start at the left as
     now; the logo and sticker sit at the **right** end, moved there by the agent from the generated
     tray (decided at the tray review: Dana never holds more than 4 items, so the right end is
     always empty and the branding fills it);
   - a slot shows its icon alone, about 60 px; the name appears on hover in the caption, as now,
     and in "Use … with …";
   - hovering a slot grows it slightly (1.1×); the held item's slot glows yellow;
   - while an item is held, a ~40 px copy of its icon floats beside the pointer, offset down and
     right so the pointer's tip stays exact for small hotspots;
   - `?art=off` keeps the plain boxes with names.
6. **M4 plan:** when the Gift Shop and Break Room are painted (slices 22–23), the icon sheet is
   attached as a reference so painted props match their icons.
7. **Playwright:** `e2e/game.ts` finds inventory slots by the item's name in the slot's text label,
   which icons remove. It finds them by item id instead, so the tests don't depend on how a slot
   looks.

Out of scope: the ☰ button, captions and dialogue panel (slice 24), animated icons.

## Approvals you'll be asked for

1. The icon sheet and the tray sheet.
2. Both in place in the game (screenshots), before they're committed.

## Acceptance checks

- Unit tests: validation fails for a missing icon file; assets tests (credits, budget) pass.
- `npm test`, typecheck, build, Playwright all green.
- Agent play-test: the tray and icons in each room, hover names and the grow, the held item's glow
  and the icon following the pointer with its "Use … with …" caption, a full inventory late in the
  game, `?art=off`.
- Developer play-test.

## Notes

- Branch `slice-21-lair-item-icons`, from `main` once PR #20 (audio) has merged.

## Build notes

- **Icons:** the first icon sheet's 12, plus the Sticky Arm from a second sheet (its gum was too
  small to tell it from Gary's Arm at 60 px; the second sheet redrew everything, and the developer
  preferred the first's other icons). A piece of the Exact Change icon's note was placed behind the
  pay packet's window so it reads as money. `scripts/cut-icons.py` cuts a sheet into square icons;
  see-through enclosed gaps (keyring, lanyard loop, mug handle, the arm's fingers) are opt-in per
  icon, since the pay packet's grey window looks the same as background.
- **Tray:** the developer moved the logo and sticker to the right end (Dana holds at most 4 items,
  from the explorer, so that end is always empty) and the skull to the mug's logo, in ChatGPT; the
  agent then removed the dark disc under the skull (mirroring the plain left end over the right),
  and used the first tray's sticker, which the disc hadn't clipped. `scripts/make-tray.py`
  stretches the tray's plain middle to 2560 × 180 and cuts the slot.
- **Playwright** finds inventory slots by item id (`setData('itemId')`).
- **Agent play-test** (headless screenshots): the tray in the Lair and the Break Room, hover grow and
  name, the held Sticky Arm at the pointer with "Use Sticky Arm with Floor Grate", the held slot's
  yellow outline, `?art=off` boxes. A grey hairline along the tray's top edge (sheet background
  left by the resize) was found and cleared.
