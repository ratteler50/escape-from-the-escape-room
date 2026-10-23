# Slice 27 — Walk animation

**Status:** built, agent and developer play-tested · **Milestone:** M4, the last slice of M4 and of the project

## Why

Walking today is one standing sprite moved by code: a 5 px hop every 150 ms and a 3° lean, mirrored
for facing (`PlayerSprite`), and a plain glide for Reginald (`RoomView.walkCharacter`). The
developer asked for a real walk. Image generators drift between frames (faces, outfits, colours,
proportions), so frame-by-frame ChatGPT art may not hold together. This slice prototypes two
techniques on Dana, keeps the better one only if it beats the hop, and then gives it to Reginald.
If neither technique works, the hop stays and the slice records why. The project is complete when
M4 ends (2026-10-23), so a walk that fails here doesn't ship at all; it isn't deferred.
Decisions from the slice 27 grilling (2026-10-23).

## Background: two ways to animate a walk

- **Frame-by-frame (A).** A sprite sheet: several drawn poses side by side in one image. Phaser
  cuts it into frames and plays them in a loop (`anims.create({ frames, frameRate, repeat: -1 })`).
  It looks the most natural, but every pose is drawn separately, so it can drift.
- **Cutout (B).** The figure is split into parts (torso and head, two legs, two arms), each pinned
  at a joint and swung by code tweens, like Spine or DragonBones but hand-written. Every frame uses
  the same pixels, so there's no drift, but it can look stiff or puppet-like.
- **Foot sliding** is the usual flaw of either: if the cycle's stride doesn't match how fast the
  sprite moves across the floor, the feet skate. The stride is tuned to the walk speed.

## Spec

1. **Prototype on Dana only, two techniques:**
   - **A, ChatGPT frames:** one image with the whole cycle in a single row (one image drifts much
     less than one generation per frame), the model sheet and `dana.webp` attached. **6 frames at
     10 fps**: a 0.6 s two-step cycle, 3.3 steps a second, a 90 px stride at today's 300 px/s
     (about right for a 200 px figure). The sheet's first pose is a **standing pose**.
   - **B, cutout in code:** a ChatGPT **parts sheet** (torso and head, each leg, each arm, the
     hidden bits painted in), pivoted at hips and shoulders. Legs swing from the hips, arms swing
     opposite the legs, the torso bobs on each step; no lean. The joints overlap so the polo's hem
     and sleeves hide the seams. The swing period gives the same 90 px stride. If the arms look
     wrong, they hang still and only the legs move (the fallback).
   - Walk speed stays 300 px/s for both.
2. **Drift is the main risk of A, and it's checked before you see anything.** The agent compares
   every frame with the model sheet (height, palette, lanyard, face, shoes) and overlays the frames
   on each other to spot jumps. Small differences (scale, foot alignment, a colour) are fixed by
   the agent; large ones mean a new generation. Each technique gets **at most 3 generation rounds**,
   then it's judged on what it has.
3. **Good enough** means, at 200 px, looping in the real rooms:
   1. Dana is recognisably the same in every frame: no flicker of face, outfit or proportions;
   2. it reads as walking, not sliding or bouncing;
   3. the feet don't visibly skate;
   4. it matches the flat, hard-outline style of the other sprites;
   5. **you prefer it to today's hop.** This one decides; 1–4 are what the agent checks first.
4. **Standing matches walking.** The standing pose comes from the winning technique's own set, so
   stopping doesn't pop: A's first frame, or B's parts at rest. It may replace `dana.webp` (you
   approve it). Dana snaps to standing on arrival, on Skip and on entering a room, with no settling
   frame and never left mid-stride.
5. **Judging.** Both prototypes are built into the game behind a URL switch: `?walk=frames`,
   `?walk=parts`, `?walk=hop` (today's). You play each in the real rooms. The agent also records a
   short side-by-side clip of the three in the Lair (Playwright frames stitched with ffmpeg), kept
   outside the repo (`art-inbox/` or the scratchpad), not in the asset budget. Under A the code hop
   and lean are off (the frames carry their own bounce).
6. **Facing stays mirroring.** Right-facing poses only, flipped for left; walking toward or away
   from the camera uses the side walk, as now.
7. **One walk for everyone.** `PlayerSprite` (Dana) and `RoomView.walkCharacter` (Reginald) share
   one view piece: play the character's walk while moving, show their standing pose when stopped.
   Content gains an optional `walk` on a character's `sprites` (A: sheet, frame count, fps; B: parts
   and pivots). Presentation only; the core ignores it. Mordecai keeps floating.
8. **Then Reginald**, only after you pick a technique for Dana: one set each for **lich** Reginald
   (the walk to his mark) and **human** Reginald (the finale walk), with the same limit of 3 rounds
   per look. Under B his long robe hides most of his legs: robe-hem sway, legs barely showing, the
   cape swinging. Each look stands or falls on its own; a look that fails keeps today's glide with
   the hop added, and the slice notes say why. The seated → standing swap stays instant.
9. **Kyle is out:** he never walks (he stays behind the till), so he gets no walk. The design doc's
   "then Reginald and Kyle" assumed he did.
10. **If neither technique works for Dana:** stop. The hop stays, nothing is made for Reginald, and
    `docs/decisions/0006-walk-animation.md` records what was tried and why it failed, so nobody tries
    again blind. The spec, the prompts and the record are merged; no art is.
11. **Cleanup before the PR:** the losing technique's code, the `?walk=` switch and any prototype
    leftovers are deleted. The PR ships one walk (or none). Only approved art is committed; the
    loser's images stay in `art-inbox/`.
12. **Records:** prompts in a new `docs/art/prompts-walk.md`; `docs/art/characters.md` gets the walk
    sprites; every committed image in `CREDITS.md`; the 15 MB budget holds (a sheet is about
    50–150 KB, with about 5 MB headroom).

Added at the developer's request (2026-10-23): **the Lair door stands open in the finale**, so human
Reginald walks out of an open door, and on the end card to match.

Out of scope: a Kyle walk, toward- and away-from-camera walks, idle and talking animations,
Mordecai, any change to walk speed or paths, the design doc's project-complete note (the main
session's own PR).

## Approvals you'll be asked for

1. Generating the images yourself in ChatGPT from `docs/art/prompts-walk.md`, saving them to
   `art-inbox/` in the main checkout.
2. Dana's frames sheet and parts sheet, each before it's wired in (regenerations allowed, up to 3
   rounds each).
3. **The pick:** A, B or the hop, from the clip and by playing `?walk=` in the game.
4. If a technique wins: lich and human Reginald's sets, shown in place, and a new standing
   `dana.webp` if it changes.
5. Developer play-test.

## Acceptance checks

- `npm test`, typecheck, build, Playwright all green (Playwright clicks the invisible hotspot boxes,
  so walking art shouldn't affect it).
- Unit tests: walk data is valid (frame counts, fps, part pivots) and every walk file exists.
- `?art=off` still draws rectangles.
- Agent play-test: Dana walking both ways in all three rooms; stopping, Skip and room changes always
  end on the standing pose; Reginald's walk to his mark and the finale walk; no visible pop
  between walking and standing.
- Developer play-test.

## Notes

- Workflow: the agent writes the prompts; the developer generates in ChatGPT and approves each image;
  the agent cuts, aligns and wires them in (`scripts/cut-sprite.py`, sprites stored at 2×).

## Build notes

- **The pick (2026-10-23): frames.** Both techniques were built behind `?walk=` and compared in
  frame-stepped clips (the game loop asleep, `game.step` at 30 fps, the tween manager's own clock
  replaced by the same step, so clips run at true speed). The developer found the cutout weird even
  after fixes (flat feet, shorter stride, darker far limbs) and picked the frames. The cutout code,
  its parts sheet and the `?walk=`/`?fps=` switches were removed.
- **One walk piece:** `src/view/Walker.ts` draws a character's sprite in a container whose origin
  is their feet: with a walk sheet, it plays the cycle while walking and shows the sheet's standing
  pose otherwise; without one, the standing sprite hops (slice 19's hop and lean). Facing mirrors the
  container. `PlayerSprite` uses it for Dana; `RoomView.walkCharacter` swaps a walking character's
  sprite for one (Reginald, getting up off the throne to walk as the lich, or human in the finale).
  Mordecai floats and glides, as before.
- **Content:** `walks` on a character, keyed by the pose that walks (`standing`, `human`), so
  Reginald can have one per look. Dana moved to `src/content/dana.ts`.
- **Drift check (Dana's frames):** same shirt colour in all seven poses, shirt area within ±6%, hair
  within ±4%, ground line within 9 px. Cut with the same flood fill as `scripts/cut-sprite.py`,
  scaled together (the standing pose to 400 px, 2×), each pose placed with its feet on the cell floor
  and its shirt centred, so the torso holds still: 7 cells of 221×404.
- **The frames limp:** the sheet drew poses 5–7 as copies of 2–4, so the same leg leads every
  step (the developer spotted it). Later attempts in ChatGPT and Gemini, with a pose guide and a
  costume marker, all led with the same leg, and none was used. The shipped sheet is the first one
  with **the far leg shaded** darker by `scripts/shade-far-leg.py` (the back leg in the first step,
  the front leg in the second), so the legs read as taking turns.
- **Step length:** the drawn steps are short, about 45 on-screen px. At 10 fps a step takes 0.3 s
  while Dana covers 90 px, so the feet slide a little; the developer preferred that to 20 fps (a
  quick shuffle). Walk speed stays 300 px/s.
- **Reginald:** one sheet per look, ChatGPT, first try (prompts C and D). The lich's needed no
  fixes. The human's hanging hand came out skeletal; an edit in the same chat fixed it, and its
  standing pose was drawn about 4% bigger than the walk poses, so it's scaled to their median height.
  His robe hides his legs, so the same-leg problem barely shows. Both stand in their sheet's first
  pose whenever drawn standing (on his mark; in the finale), so he doesn't pop when he stops.
  Mordecai still floats; Kyle never walks.
- **Agent play-test** (headless, frame-stepped): Dana walking both ways; Reginald getting up off the
  throne and walking to his mark; human Reginald walking in from the Lair doorway in the finale;
  no console errors. Playwright plays the whole game through.
- **Assets:** three walk sheets, 152 + 248 + 242 KB; `public/assets` is about 10.6 MB of 15 MB.
- **The Lair door, open** (the developer's request): a ChatGPT edit of an enlarged crop of the Gift
  Shop's door with the Lair painting attached for the glimpse through it (`prompts-gift-shop.md`
  §3d), made into an overlay by `scripts/make-overlay.py`, shown from `curseLifted`. The glimpse
  included the phylactery on its plinth, which Reginald has just carried out, so the agent painted it
  out; the patch also starts below the door's sign, which the edit had redrawn. The same patch,
  fitted to the end card's door (scale 1.005, 6 px left, 1 px up), is baked into `end.webp`.
