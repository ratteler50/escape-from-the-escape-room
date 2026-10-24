# Prototype: Lair art style (throwaway)

The notes from the M3 art-style prototype, which settled decision 0005. The prototype itself (three
generated Lair backgrounds, the code that showed them behind the real hotspots, and the layout
sketch) lived on branch `prototype/lair-art-style`, deleted when the game was finished
(2026-10-24); these notes are what's kept. The style it chose is the game's: see
`docs/decisions/0005-art-style.md` and the prompt packs in `docs/art/`.

**Question:** what should the game look like once real art arrives (M4)?
**Verdict (2026-10-21):** **A, hand-painted cartoon**, chosen by the developer over a flat vector
cartoon (B) and a storybook papercraft look (C). Judged from 200px previews stretched to 1280×720.

## What worked

- **Image-to-image from a layout reference.** A flat sketch drawn at the exact hotspot coordinates
  kept every prop close to its clickable box in all
  three styles. Text-only prompts wouldn't. Misses were small: A's throne paints taller than its
  hotspot; B's reviews board sits a little high. Fix by nudging hotspot bounds to the art, not the
  other way round.
- **Backgrounds exclude characters.** Reginald and Dana stay separate sprites; props that change
  with game state (Gary's arm, the open display case) will need separate overlay sprites too.

## Gaps found

- Canva's tools in this session return only a 200px preview and a signed thumbnail URL. Full-size
  files (1680×944) need a manual download from Canva, or a different generator.
- The painted floor and the walkable polygon don't match exactly; redraw the polygon to the art.

## Matching the reference games

Compared with the games the developer named, A sits closest to **The Curse of Monkey Island**
(painted backgrounds, warm light, saturated colour) but reads as a realistic fantasy dungeon:
it lacks the caricature (leaning walls, crooked lines) that makes Curse and Day of the Tentacle
funny. B is closest to **Detective Grimoire**; C to **Return to Monkey Island** / **Broken Age**.

Three rules for style A, from that comparison:

1. **Push the caricature** in the style sentence (crooked proportions, leaning walls, wobbly
   lines, playful rather than spooky).
2. **Characters differ from backgrounds on purpose:** flat colour with hard outlines over the
   painted rooms, as Curse of Monkey Island did. They pop, and flat outlined characters are far
   easier to keep consistent across AI generations than painterly ones.
3. **Readability over detail:** ask for clear silhouettes and uncluttered empty wall areas so
   interactive objects stand out (AI otherwise fills every corner, which turns into pixel-hunting).

**A2** applies rules 1 and 3 to the same layout. Result: clearly more readable
(emptier walls, chunkier props) but only mildly more caricatured: lines stay mostly straight. Prompt
wording gets part of the way; for real Day of the Tentacle lean, try a stronger image reference
(e.g. a hand-drawn crooked layout sketch) at M4. Alignment held, except the reviews board drifted
left of its hotspot.

## Prompt recipe (style A2, current best)

Reference image: the layout reference. Aspect ratio: 16:9. Prompt:

> Video game background, hand-painted 1990s cartoon point-and-click adventure style: lush
> painterly brushwork, rich saturated colours, warm torchlight against cool purple shadows;
> crooked, exaggerated cartoon proportions, leaning walls, wobbly lines, nothing perfectly
> straight, playful and goofy rather than spooky; clear silhouettes and uncluttered empty wall
> areas so interactive objects stand out from the background. Scene: a tacky, low-budget "Lich's
> Lair" room inside a cheap escape-room franchise, comedic rather than scary: a few fake cobwebs,
> plastic candles, a price sticker here and there. Follow the reference image's layout exactly,
> keeping every object in the same position and size: [objects left to right]. The floor fills
> the lower part of the image. No people, no characters, no readable text, no UI.

For other rooms, keep everything before "Scene:" (the style) word for word and swap the scene and objects.
