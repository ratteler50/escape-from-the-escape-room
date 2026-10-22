# Prompt pack: the Break Room (slice 23)

The developer runs these in ChatGPT and saves the results into `art-inbox/` under the names given;
the agent sizes, fits and wires them in. Step 1 is the background. The overlays (step 2) are
edits of crops of the approved painting, so their crops and prompts are added once it's approved.

---

## 1. The background → save as `art-inbox/break-room-1.png` (and `-2`, `-3` for retries)

Use a **new ChatGPT chat**, ask for **landscape (1536×1024)**, and attach three images, in this
order:

1. `art-inbox/LAYOUT-break-room.png`: the layout. It is the room at its exact hotspot
   positions (`docs/art/break-room-layout.svg`), letterboxed to 1536×1024: the agent crops the
   middle back out, so props must stay exactly where they are drawn.
2. `art-inbox/REFERENCE-lair-background.png`: the Lair, for the painting style.
3. `art-inbox/icon-sheet-money.png`: the item icons, so the painted time cards match the Time Card
   icon.

> Video game background, hand-painted 1990s cartoon point-and-click adventure style: lush painterly
> brushwork, rich saturated colours, crooked, exaggerated cartoon proportions, leaning walls, wobbly
> lines, nothing perfectly straight, playful and goofy rather than gloomy; clear silhouettes and
> uncluttered empty wall areas so interactive objects stand out from the background. Match the
> painting style and brushwork of the SECOND reference image exactly (it is another room in the
> same game), but this room has its own palette and light: a cramped, grim little staff break room
> in the back of a cheap escape-room franchise, lit by a single buzzing fluorescent tube on the
> ceiling, casting a slightly sickly yellow-green light; tired beige walls with a scuffed darker
> skirting band, a damp stain or two, a grey-blue linoleum floor with a few scuff marks.
>
> Follow the FIRST reference image's layout exactly, keeping every object in the same position and
> size. The image is wider and taller than the room: paint more plain wall and ceiling above, and
> more empty linoleum floor below, but keep every object exactly where it is drawn. Left to right:
> a plain brown wooden door with a sign reading STAFF ONLY and a brass knob; a cork noticeboard with
> a few pinned paper notices; a grey metal punch clock with a round clock face and a card slot on
> top, a blank white sign above it, and beside it a small wall rack holding three paper time cards
> like the time card in the THIRD reference image; a tall, old, slightly dented white fridge, shut,
> freezer on top, covered in curling sticky notes and paper notes held by magnets, one big angry
> note in the middle underlined many times; a red vending machine with SNAX-O-RAMA across the top,
> a glass front with empty spiral rows and a single purple bag of crisps stuck at an angle halfway
> down, a coin slot, a button, and a small coin-return flap with one copper coin glinting in it; a
> row of three dented blue metal staff lockers with vents, the middle one with a small label reading
> TRAINEE and a round combination dial, the right one with a gold star sticker; then a single
> wooden coat peg on the wall where a fourth locker would be, with nothing hanging on it; on the far
> right a grey wall intercom with a speaker grille and a red TALK button. All the notices and notes
> are illegible scribbles. No people, no characters, no other readable text, no UI.

**Retries:** if it moves or resizes things, say "keep every object exactly where it is in the first
image; only change the painting style". If it's too dark and gloomy, "brighter and more cartoonish,
like the second image".

---

**After you approve it** (shown in the game with the clickable areas outlined), the agent scales it
to 1280×720 (cropping the middle 1536×864 first if it came back letterboxed), converts it to WebP,
and fits the hotspots and the floor to what's painted. The record of what was used goes in
`docs/art/break-room.md`.

## 1b. Fix: the cent in the coin return → attach `art-inbox/CROP-vending.png`, save as `art-inbox/vending-fixed.png`

`break-room-1` painted the cent lying in the big snack bin at the bottom, where a bag of crisps
would drop, not in the coin return. This is an **edit** of an enlarged crop of the vending machine
(portrait, 1024×1536), blended back into the painting, so the rest of the room stays as approved.

> Edit this exact image. Keep everything identical: framing, size, painting style, colours,
> lighting, the machine, the glass, the spirals and the purple bag of crisps. Change only two
> things: 1) the big dark delivery bin at the bottom is now completely empty: remove the copper
> coin from it and paint the inside of the bin dark and empty. 2) The small square opening on the
> right-hand panel, below the button, becomes a little coin-return cup with a small metal flap
> tilted half-open, and one single shiny copper cent peeking out from under the flap, catching the
> light.
