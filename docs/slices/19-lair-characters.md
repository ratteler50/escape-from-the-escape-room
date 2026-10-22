# Slice 19 — Lair characters and prop overlays

**Status:** built, agent and developer play-tested · **Milestone:** M4

## Why

Slice 18 painted the Lair, but Dana and Reginald are still coloured rectangles, and the painting
can't show what changes during play (Gary's arm, the gummed grate). This slice
finishes the Lair's art so the whole art pipeline is proven on one room before the others copy it.

## Spec

1. **Model sheets first** (M4 plan, decision 0005: flat colour with hard outlines over the painted
   rooms). One sheet each, front and three-quarter view on a plain background, for **your
   approval** before any sprite is made:
   - **Dana Pickwick:** 19, earnest trainee, Escape-O-Rama staff polo and a lanyard reading TRAINEE,
     sensible shoes, eager posture. Gender-neutral styling; Dana is they/them.
   - **Reginald Vantablack-Thorne:** classically trained ham actor turned real lich: a theatrical lich
     costume (tattered robe, crown, a too-long cape), skeletal hands and face now genuinely undead,
     glowing eyes, dramatic posture.
2. **Sprites** from the approved sheets: Dana standing and Reginald seated are cut straight from
   the sheets; the others are generated in ChatGPT with the sheet as the reference image, on a transparent
   or plain background (keyed out with `ffmpeg`). All become WebP with alpha:
   - Dana, standing;
   - Reginald, standing (on his mark), in a narrow pose that leaves the phylactery clickable;
   - Reginald, **seated**, lounging on the throne (M4 plan exception);
   - Reginald, **human again** for the finale: same costume, a human face in smeared skull make-up,
     human hands (finale look line: "still in full lich make-up"). Made now, from the same sheet, so
     it matches; the finale hotspot uses it wherever it's drawn.
   Each sprite's feet sit where the hotspot's bottom-centre is today. Dana grows to ≈ 200 px (at
   120 px, next to a 265 px Reginald and Gary, Dana looked like a child). Reginald
   grows to **Gary's height**: ≈ 265 px standing, ≈ 230 px seated (a mock-up at 200 px made the
   star shorter than his own prop skeleton and lost him on the throne). His hotspot bounds grow to
   fit each sprite (throne, mark, finale); speech anchors follow. His robe is near-black with a
   crimson lining and gold trim, so he reads against the purple walls (recoloured sheet).
3. **Rendering:**
   - Dana's placeholder rectangle becomes their sprite, mirrored for facing (replacing the facing
     triangle); walking adds a small code-driven bounce and lean; standing still is still.
   - A character hotspot draws its character's sprite (standing, or seated when the content says
     so) with the existing invisible clickable box on top, so clicks, the glow, H, and Playwright
     work as now. Speech still anchors above the character.
   - `?art=off` keeps the rectangles.
4. **Prop overlays**, by editing the Lair background (same scene, one change) and cropping the
   changed region, shown when their condition holds:
   - Gary without his left arm (`tookGaryArm`);
   - the grate with Gary's arm gummed to it (`gotCaseKey`).
   The display case needs none: its painted bone stays put and the scroll is tucked underneath it
   (content changed in slice 18 to match the painting).
   Content gets a small `overlays` list on a room's art (image, position, condition); the view
   draws each over the background while its condition holds.
5. **Content shape:** characters name their sprites (`standing`, optional `seated` and `human`); a
   character hotspot may say `pose: 'seated'` (Reginald on the throne) or `pose: 'human'` (the finale). Presentation only; the core ignores it.
6. **Records:** every image in `CREDITS.md`; prompts in `docs/art/characters.md` and
   `docs/art/lair.md`; content validation checks every sprite and overlay file exists; the 15 MB
   budget still holds.

Out of scope: Gift Shop and Break Room characters (Kyle, Mordecai: slice 21), audio (slice 20),
walk cycles and a talking pose.

## Approvals you'll be asked for

1. Dana's and Reginald's model sheets (you can ask for regenerations).
2. The four sprites and two overlays, shown in place in the game (screenshots), before they're
   committed.
3. Generating the images yourself in ChatGPT from the prompt packs in `docs/art/prompts-*.md`,
   saving them to `art-inbox/` (Canva's free plan ran out of generations, 2026-10-22).

## Acceptance checks

- `npm test`, typecheck, build, Playwright all green (Playwright still clicks hotspots by their
  invisible boxes).
- Content validation: sprite and overlay files exist; overlay conditions reference real flags.
- Agent play-test (headless screenshots if the pane can't render): Dana walking and facing both
  ways; Reginald seated on the throne, then standing on his mark after "ARISE!"; each overlay
  appearing at the right moment; `?art=off`.
- Developer play-test.

## Notes

- Built stacked on `slice-18-lair-art` (itself waiting on PR #15); rebased onto `main` before its PR.

## Build notes

- **Pipeline:** Canva's free plan ran out of generations, so the art moved to ChatGPT: the developer
  generates from prompt packs (`docs/art/prompts-*.md`), the agent cuts, sizes and wires it in.
- **Model sheets** approved 2026-10-22. A mock-up in the Lair showed Reginald too small next to Gary
  and his purple robe lost against the purple walls: he was recoloured black and crimson and grew
  to Gary's height (265 px); Dana grew from 120 to 200 px to match.
- **Sprites** approved in place 2026-10-22: Dana and seated Reginald cut straight from the sheets,
  standing and human Reginald generated from the recoloured sheet. Cut with
  `scripts/cut-sprite.py` (flood fill from the edges; a plain colour key ate light colours inside
  the figures). Stored at 2× their on-screen size.
- **Drawing order:** sprites draw in front of every hotspot box (an unpainted room's solid
  placeholders hid human Reginald in the Gift Shop doorway), labels on top.
- **Display case:** no overlays; its painted bone stays and the scroll is tucked under it (slice 18).
- **Overlays** approved 2026-10-22: Gary armless (`tookGaryArm`) and his arm gummed to the grate
  (`gotCaseKey`). Each was an edit of an enlarged crop of the painting; `scripts/make-overlay.py`
  scales it back, keeps only what changed, and feathers the edges (32×137 px and 169×91 px).
