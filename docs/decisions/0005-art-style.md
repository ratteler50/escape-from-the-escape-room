# 0005 — Art style: hand-painted cartoon

**Status:** accepted · 2026-10-21 · applies at M4 (art pass)

## Context

Art has been placeholder shapes since slice 1, by design (M4 is the art pass). Before writing M3's
rooms, a throwaway prototype settled the look, so new rooms can be laid out with it in mind. The
prototype compared three AI-generated Lair backgrounds behind the real hotspots: a hand-painted
cartoon (A), a flat vector cartoon (B), and storybook papercraft (C).

## Decision

**Style A: hand-painted 1990s cartoon**, closest to *The Curse of Monkey Island*: painterly
backgrounds, saturated colour, warm torchlight against cool purple shadows.

Three rules, from comparing A with the games the project takes after:

1. **Push the caricature.** Crooked proportions, leaning walls, wobbly lines, playful rather than
   spooky. Plain A reads as a realistic fantasy dungeon; the comedy needs the exaggeration that
   Curse of Monkey Island and Day of the Tentacle have.
2. **Characters differ from backgrounds on purpose:** flat colour with hard outlines over painted
   rooms, as Curse of Monkey Island did. They pop, and outlined characters are far easier to keep
   consistent across AI generations than painterly ones.
3. **Readability over detail:** clear silhouettes and uncluttered empty wall areas, so interactive
   objects stand out instead of turning into pixel-hunting.

**Method: image-to-image from a layout reference.** Draw a flat sketch of each room at its exact
hotspot coordinates and generate from it. In the prototype every prop landed on or near its hotspot;
text-only prompts can't do that. Fix small misses by moving hotspot bounds to the art.

Backgrounds exclude characters and anything that changes with game state (Gary's arm, the open
display case); those are separate sprites.

## Alternatives

- **B, flat vector cartoon** (closest to Detective Grimoire): clean, but came out muddy.
- **C, storybook papercraft** (closest to Return to Monkey Island, Broken Age): charming, but further
  from the classic LucasArts look the project is after.

## Consequences

- The prompt recipe (current best: "A2") and the comparison live on branch
  `prototype/lair-art-style` in `docs/prototypes/lair-art-style.md`. That branch is reference only
  and never merges.
- Each new room gets a layout reference sketch when it's designed (M3).
- Prompt wording alone gave only mild caricature; M4 may need a hand-drawn crooked layout sketch.
- Canva's tools here return only 200px previews; full-size images need a manual download or another
  generator.
- The prototype's Lair sketch predates the phylactery (slice 13); update it before generating.
