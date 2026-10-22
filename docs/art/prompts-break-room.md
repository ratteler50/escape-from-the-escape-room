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

---

## 2. Overlays

Three things in the Break Room change during play. As for the Lair (`docs/art/prompts-overlays.md`),
each overlay is an **edit of an enlarged crop** of the approved painting: attach the crop, ask for
an edit at the same size and framing, save under the name given. If ChatGPT redraws the whole crop
(different colours, lighting or angle), try again with "do not redraw; change only what I
describe". The agent shrinks each result back, keeps only what changed, and feathers the edges.

The two fridge overlays stack: the open fridge, then the card gone from it, drawn on top. So 2b is
an edit of 2a's result, and the two line up. Clocking out has no overlay: Dana's lanyard flips to
OFF DUTY in the inventory instead (section 3).

### 2a. The fridge open → attach `art-inbox/CROP-fridge.png` (square), save as `art-inbox/fridge-open.png`

Shown once Dana opens the fridge (`fridgeOpen`).

> Edit this exact image. Keep everything identical: framing, size, painting style, colours,
> lighting, the wall, the punch clock, its sign, the card rack, the floor, the red machine at the
> right edge, and the fridge's top freezer door with its notes. Change only one thing: the fridge's
> big LOWER door is swung wide open toward the viewer on its left-hand hinge. Show the inside of the
> door at a steep angle, so it is narrow and does not cover the punch clock, with a couple of empty
> door shelves and a curled sticky note on it. Inside the fridge, lit by the fridge's cold white
> light: empty wire shelves, and on the middle shelf one strawberry yogurt pot (pink, with a
> strawberry on the label) sitting on top of a paper time card, like a paperweight. The time card
> is cream with a printed grid and IN / OUT columns, like the time card icon in the game; leave its
> corner sticking out from under the yogurt so it's easy to see. Nothing else inside.

### 2b. Just the yogurt → attach your `fridge-open.png`, save as `art-inbox/fridge-yogurt.png`

Shown once Dana has taken the time card (`tookTimeCard`). Use the **same chat** as 2a, or attach
2a's result to a new one.

> Edit this exact image. Keep everything identical, including the yogurt exactly where it is.
> Change only one thing: remove the paper time card from under the yogurt. The yogurt now sits
> directly on the bare wire shelf.

### 2c. Dana's locker open → attach `art-inbox/CROP-locker.png` (portrait), save as `art-inbox/locker-open.png`

Shown once Dana opens their locker (`lockerOpen`). The pay packet comes out at the same moment, so
it isn't painted.

> Edit this exact image. Keep everything identical: framing, size, painting style, colours,
> lighting, the wall, the floor, the left and right lockers, and the gold star. Change only one
> thing: the MIDDLE locker (the one labelled TRAINEE, with the combination lock) is open. Its door
> has swung open toward the viewer on its left-hand hinge, so we see the inside of the door at a
> steep angle, narrow, partly in front of the left locker; the TRAINEE label and the lock stay on
> the door. Inside the locker, in shadow: a bare metal interior, an empty coat hook, a small top
> shelf, and hanging from the hook one single white hairnet, sad and limp. Nothing else inside.

---

## 3. The Off-Duty Lanyard icon → attach `art-inbox/CROP-lanyard.png` (square), save as `art-inbox/lanyard-off-duty.png`

Clocking out swaps the Staff Lanyard for the same lanyard with its badge flipped round. The crop
is the lanyard from the icon sheet its icon was cut from, enlarged.

> Edit this exact image. Keep everything identical: framing, size, art style, the bold outlines,
> the flat colours, the patterned skull strap, the clip and the plain grey background. Change only
> the badge: it is flipped round to show its back, a plain white plastic card reading OFF DUTY in
> the same bold black letters. Also remove the small black shape cut off at the right-hand edge, so
> the background there is plain grey.
