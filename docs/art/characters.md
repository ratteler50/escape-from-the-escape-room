# Character art

Sprites are flat colour with bold outlines (decision 0005), generated in ChatGPT from the prompt
packs here, from an approved model sheet per character.

| Character | Sheet | Sprites (`public/assets/characters/`) | On screen |
|-----------|-------|----------------------------------------|-----------|
| Dana | `prompts-characters.md` §1 | `dana.webp`: cut from the sheet's three-quarter view; `dana-walk.webp`: walk sheet (`prompts-walk.md` A), far leg shaded by `scripts/shade-far-leg.py` | 200 px |
| Reginald | `prompts-characters.md` §2, recoloured in §2b (black and crimson, so he reads against the purple Lair) | `reginald.webp` (standing, `prompts-sprites.md` §1), `reginald-seated.webp` (cut from the sheet), `reginald-human.webp` (finale, `prompts-sprites.md` §2); walk sheets `reginald-walk.webp` and `reginald-human-walk.webp` (`prompts-walk.md` C, D) | 265 px standing, 230 px seated (Gary's height) |

## Making a sprite

1. Generate on a plain, flat background (ChatGPT's grey is fine) and save to `art-inbox/`.
2. Cut it out, trimmed and at **twice** its on-screen height (sprites are stored at 2×):

   ```bash
   python3 -m venv /tmp/art-venv && /tmp/art-venv/bin/pip install pillow numpy scipy
   /tmp/art-venv/bin/python scripts/cut-sprite.py art-inbox/sheet.png X Y W H HEIGHT out.png
   cwebp -q 88 -alpha_q 100 out.png -o public/assets/characters/name.webp
   ```

   `X Y W H` picks the pose out of a sheet (the whole image for a single pose). The background is
   removed by flood fill from the edges, so light colours inside the figure (sneakers, a skull)
   survive; a plain colour key ate them.
3. Point the character's `sprites` at it, add a `CREDITS.md` row, and size the hotspot's bounds to
   the sprite's body: the sprite is drawn with its feet at the bounds' bottom-centre.

## Making a walk sheet (slice 27)

One generated image with seven poses in a row: standing, then a two-step cycle. The agent cuts the
poses apart (each blob stays with the pose that owns most of it, so a reaching hand isn't sliced
off), scales them together, puts each pose's feet on its cell's floor and centres its torso, so the
body holds still while the legs move. The sheet's first pose is also the character's standing
sprite whenever they could walk, so stopping doesn't pop. Generators draw the same leg leading both
steps; shade the far leg in code rather than regenerating (it didn't help, five times).
