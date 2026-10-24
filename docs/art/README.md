# Art

How the game's art is made, and where each piece's record is. The style is decision 0005
(hand-painted rooms, flat-colour characters with bold outlines). Kept current.

## The pipeline

1. **Layout first.** A sketch at exact hotspot coordinates (`<room>-layout.svg`), so the painting
   puts each prop where its clickable area is.
2. **Prompt pack.** The agent writes the prompts and lists the files to attach
   (`prompts-*.md`). It prepares crops and references in `art-inbox/` (git-ignored), named by
   role: `CROP-…` (an enlarged crop of a painting, to edit), `REFERENCE-…` (to match), `ICON-…`.
3. **Generation.** The developer generates in ChatGPT and saves the results to `art-inbox/` under the
   names the pack gives. (The Lair background was made with Canva, before ChatGPT took over.)
4. **The agent does the rest**, with the scripts below: sizes to the game, cuts, blends, converts to
   WebP in `public/assets/`, wires it into the content, and checks it in place.
5. **Approval.** The developer approves each image before it's committed.

**Rules:** every asset is in `CREDITS.md` with its tool and prompt, and assets stay under a 15 MB
budget (both enforced by `src/content/assets.test.ts`). Paintings are 1280×720; sprites and icons are
stored at 2× their on-screen size.

**Changing a painting:** an **overlay** is a patch drawn on top while conditions hold (an open door,
a missing arm), made from an edit of an enlarged crop. A fix that should always show is patched into
the painting itself. Both use `scripts/make-overlay.py`.

## Where each record is

| What | Files |
|------|-------|
| Room backgrounds | `lair.md`, `gift-shop.md`, `break-room.md`, with the layout sketches `*-layout.svg` |
| Characters (model sheets, sprites, walk sheets) | `characters.md`; prompts in `prompts-characters.md`, `prompts-sprites.md`, `prompts-walk.md`, and Kyle's and Mordecai's in `prompts-gift-shop.md` §2 |
| Overlays | `prompts-overlays.md` (the Lair), `prompts-gift-shop.md` §3, `prompts-break-room.md` §2 |
| Item icons and the inventory tray | `prompts-inventory.md` |
| Title, logo and end card | `prompts-key-art.md` |
| The art-style prototype (M3) | `docs/prototypes/lair-art-style.md` |
| Music and sound effects | `docs/audio/music.md`; the effects are Kenney's (CC0), listed in `CREDITS.md` |

## Scripts

All in `scripts/`; each file's first lines say how to run it. They need Python 3 with Pillow,
NumPy and SciPy (not part of `npm install`).

| Script | Does |
|--------|------|
| `make-overlay.py` | Turns an edited, enlarged crop into an overlay: scales it back, keeps only what changed, feathers the edges |
| `cut-sprite.py` | Cuts a character off a flat background and sizes it |
| `cut-icons.py` | Cuts every object off an icon sheet into square icons |
| `make-tray.py` | The inventory tray and slot frame from the tray sheet |
| `shade-far-leg.py` | Shades the far leg in each walk frame, so the legs read as alternating |
