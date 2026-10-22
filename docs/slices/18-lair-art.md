# Slice 18 — The art system and the Lair background

**Status:** awaiting approval · **Milestone:** M4 (first slice)

## Why

M4 swaps placeholder rectangles for real art and adds audio (plan in `docs/design.md`, M4 plan,
written by this slice). This slice proves the art half on one room: the Lair gets its painted
background, hotspots become invisible areas over the painting, and the asset rules (credits, size
budget) are in place before anything else is added.

## Spec

1. **`docs/design.md`:** the M4 plan from the planning session (2026-10-22): order, art pipeline,
   characters, overlays, hover feedback, audio, credits, budget, the slice table (18–23). The M4 row
   in the milestone table stops saying "optional".
2. **Room art in the view.** A room may name a background image. When it does:
   - the image is drawn instead of the wall-and-floor shapes;
   - hotspots that aren't characters become **invisible** clickable areas (characters stay
     placeholder rectangles until slice 19);
   - hovering one shows the hand cursor, its name, and a **soft glow** around its area;
   - **"show everything clickable"**: holding **H**, or a toggle in the ☰ menu (so touch players have
     it too), outlines every hotspot;
   - **`?art=off`** in the URL draws the old placeholder rectangles everywhere (debugging,
     screenshots).
   Rooms without art (Gift Shop, Break Room until slices 21–22) look exactly as they do now.
3. **The Lair background**, through the Canva pipeline (design doc, M4 plan):
   - update the layout sketch (`docs/art/lair-layout.svg`, new, at exact hotspot coordinates): add
     the phylactery's plinth, and a **spotlight rig aimed at Gary** with Reginald's mark taped on the
     floor where the light should be;
   - generate with the A2 recipe (branch `prototype/lair-art-style`), giving the approved A2 image as
     a second reference so the look carries over; **you approve the image** before it goes further;
   - save it in a Canva design in the "Escape-O-Rama assets" folder (**your approval**, once), export a
     1280×720 PNG, convert to WebP, commit as `public/assets/rooms/lair.webp`;
   - nudge hotspot bounds and redraw the walkable floor polygon to match the painting; record the
     prompt in `docs/art/lair.md`.
4. **Content:** Reginald's on-his-mark look line changes to match the spotlight lighting up Gary
   (e.g. "…waiting in the dark while his spotlight lovingly illuminates Gary."). The spotlight is
   painted, not a hotspot (keep it simple); if it needs a look line, add a look-only hotspot.
5. **`CREDITS.md`** at the repo root: one entry per asset (file, source/tool, author, license, link or
   prompt). A test fails if any file under `public/assets/` has no entry, naming it.
6. **Asset budget:** a test fails if `public/assets/` is over **15 MB**, listing the biggest files.

Out of scope: character sprites and prop overlays (slice 19), audio (slice 20), other rooms (21–22).

## Approvals you'll be asked for in this slice

1. The generated Lair background (look and alignment), before anything is saved.
2. One Canva save (the "Escape-O-Rama assets" folder and the Lair design).
3. Downloading the exported PNG from Canva (one file, ~1–2 MB before WebP).

## Acceptance checks

- `npm test`, typecheck, build, Playwright all green (Playwright still finds hotspots by id; the
  console-error test catches a missing image).
- Unit tests: credits coverage and the budget (each shown to fail once on purpose).
- Agent play-test in the browser: the painted Lair; hover glow and names; H and the menu toggle;
  `?art=off`; every Lair hotspot still clickable where the painting shows it; the Gift Shop unchanged.
- Developer play-test.

## Notes

- Built stacked on `slice-17-polish` while PR #15 finishes CI; rebased onto `main` with
  `git rebase --onto` once it merges, before opening the PR.
