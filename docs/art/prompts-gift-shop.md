# Prompt pack: the Gift Shop (slice 22)

Generate these in **ChatGPT** (image generation), each in its **own new chat** so earlier images
don't bleed into the next. Save each result into `art-inbox/` (git-ignored, in the main checkout)
under the file name given. Regenerate as often as you like; the agent takes it from there.

Section 1 (the room) and section 2 (the two model sheets) don't depend on each other: run them in
any order, or side by side.

---

## 1. The background → save as `art-inbox/gift-shop.png`

**Attach, in this order:**
1. `art-inbox/LAYOUT-gift-shop.png`: the layout sketch (`docs/art/gift-shop-layout.svg`), every
   prop at its hotspot's exact position. The empty wall behind the counter and above the red bin is
   on purpose: Kyle and Mordecai are drawn there by the game. It's padded to ChatGPT's 3:2 with
   67 px of extra wall above and floor below (1280×854), which the agent crops back off.
2. `art-inbox/REFERENCE-lair-background.png`: the painted Lair, for the painting style, so the
   two rooms belong to one game.
3. `art-inbox/icon-sheet-money.png`: the item icons, so the painted mugs match the mug icon.

**Size:** landscape (1536×1024). The agent scales it to 1280 wide and crops the padding off the
top and bottom, leaving 1280×720.

> Video game background, hand-painted 1990s cartoon point-and-click adventure style: match the
> painting style, brushwork, line quality and cartoon proportions of the SECOND attached image
> exactly (crooked, exaggerated shapes, wobbly lines, nothing perfectly straight, playful and goofy),
> so it looks like the next room of the same game. But the lighting is the opposite of that
> candlelit dungeon: flat, harsh, slightly green-white fluorescent light from buzzing strip lights
> on the ceiling, bright and evenly lit, a little sickly, no warm candlelight, no deep shadows.
> Clear silhouettes and uncluttered empty wall areas so the interactive objects stand out.
>
> Scene: the tacky gift shop of a cheap fantasy escape-room franchise called Escape-O-Rama, where
> the lich-themed attraction lets out. Walls painted loud franchise purple, a shiny cream-and-grey
> checkerboard linoleum floor with reflections of the strip lights. Lich merchandise everywhere,
> small and pushed to the edges: plush skeletons, skull keyrings, a poster of a hammy lich in a
> crown. Follow the FIRST attached image's layout exactly, keeping every object in the same position
> and size:
>
> - far left: an arched wooden dungeon door (the way back into the lich's lair), and above it a green
>   sign reading EXIT THROUGH THE GIFT SHOP;
> - next to it a freestanding wooden display rack on thin legs, three shelves of identical purple
>   souvenir mugs with a cartoon skull, like the mug in the THIRD attached image;
> - a purple shop counter with a cash register at its right end only; the wall behind the middle of
>   the counter is empty (someone will stand there);
> - a red wire bargain bin full of junk (snow globes, odds and ends), with a pretty, old-fashioned
>   white porcelain teapot sitting on top in the middle, a small yellow price sticker on its side;
>   the wall above the bin is empty;
> - a life-size flat cardboard cutout of a hammy skeletal lich in a black and crimson robe and a
>   gold crown, on a cardboard easel foot;
> - a grey metal door with a sign reading STAFF ONLY, and a small black badge reader with a red light
>   on the wall just right of it;
> - far right: the shop's glass front door, standing slightly ajar, dark night outside, a paper sign
>   taped to the glass reading CLOSED FOR REFURBISHMENT;
> - high on the middle of the wall a purple and gold banner reading ESCAPE-O-RAMA with a round cartoon
>   skull logo.
>
> The floor fills the lower part of the image and is completely clear: no objects, rugs or stands on
> it. No people, no characters, no ghosts, no UI. No text other than the four signs listed.

**If it drifts:** the most common problems are props moved or resized (try "keep every object
exactly where it is in the first image"), warm lighting creeping in (repeat the fluorescent
lighting sentence), or something standing on the floor or behind the counter.

---

## 2. Model sheets

Flat colour with bold outlines, like Dana and Reginald (decision 0005): characters stand out from the
painted rooms. **Attach to both:** `art-inbox/dana-sheet.png` and `art-inbox/reginald-sheet-2.webp`
(for style only: same game, same line work). **Size:** landscape (1536×1024).

### 2a. Kyle → save as `art-inbox/kyle-sheet.png`

The sprite is **waist-up behind the till**, so the sheet's third pose is that exact pose; the agent
cuts it straight out if it works.

> Character model sheet for a 2D cartoon point-and-click adventure game. Match the art style of the
> attached character sheets exactly (flat colour with simple two-tone cel shading, bold clean dark
> outlines, exaggerated playful cartoon proportions, slightly oversized head and hands): this
> character is a co-worker of the two in the attached sheets, from the same game. Do not copy those
> characters.
>
> Character: Kyle, 20s, the gift shop cashier at a tacky fantasy escape-room franchise, a queer
> nonbinary femme person. Third summer in the job; maximum indifference, deeply bored, half-lidded
> eyes, completely unimpressed by everything. Long hair with a dyed pastel-pink streak, tucked
> behind one ear; winged eyeliner, chipped dark nail polish, a few enamel pins (a rainbow, a little
> frog) on the polo's collar. White wired earbuds in both ears, a phone in a glittery case always in hand.
> Wears the same purple staff polo shirt with the small cartoon skull logo as the attached
> characters, untucked, with black jeans and chunky platform sneakers.
>
> Show the same character three times side by side, same scale: full body standing front view
> scrolling the phone; full body standing three-quarter view facing right, looking up from the phone
> with a flat, unimpressed stare; and a **waist-up** front view, cut off straight at the waist,
> leaning slightly forward on both elbows as if on a counter (draw no counter), looking down at the
> phone held in both hands. Plain flat light-grey background, no scenery, no shadows on the ground,
> no other characters, no text.

### 2b. Mordecai the Moderately Powerful → save as `art-inbox/mordecai-sheet.png`

He's drawn **solid** here, with a clear outline: the game makes him see-through, and a solid figure
cuts out cleanly.

> Character model sheet for a 2D cartoon point-and-click adventure game. Match the art style of the
> attached character sheets exactly (flat colour with simple two-tone cel shading, bold clean dark
> outlines, exaggerated playful cartoon proportions): this character is from the same game. Do not
> copy those characters.
>
> Character: Mordecai the Moderately Powerful, the ghost of a retired, deceased wizard, small and
> elderly, furious that his belongings are being sold off as spooky decor at markdown prices.
> Pompous, indignant, theatrical outrage, bristling eyebrows, a huge wispy white beard, a battered
> pointy wizard hat. He wears a faded plaid dressing gown over his wizard robes and fluffy slippers.
> He is a ghost: his whole body is pale icy blue and white with a soft cyan tint, every part drawn
> SOLID and opaque with a bold dark outline (no transparency, no glow effects); below the knees
> his robe trails off into a curling wispy ghost tail instead of legs, one slipper still dangling
> from it.
>
> Show him three times side by side, same scale, all floating: front view, arms folded, glaring;
> three-quarter view facing left, chin up, outraged; and a tall, narrow pose facing left, pointing
> down sharply at something below him with one hand and shaking a small fist with the other, mouth
> open mid-rant. Plain flat light-grey background, no scenery, no shadows, no other characters, no
> text.

---

## 3. Overlays

As for the Lair (`prompts-overlays.md`): you edit an **enlarged crop** of the approved painting, so
ChatGPT has detail to work with and nothing else in the room can drift; the agent shrinks the result
back with `scripts/make-overlay.py`, keeps only what changed, and feathers the edges. Each in its own
new chat: attach the crop, ask for an **edit** at the same size, and save under the name given. If
ChatGPT redraws the whole crop (different colours, lighting or angle), try again with "do not
redraw; change only what I describe".

### 3a. STAFF ONLY, open → attach `art-inbox/CROP-staff-door.png`, save as `art-inbox/staff-door-open.png`

Portrait (1024×1536). Shown once Mordecai has opened it (`staffDoorOpen`).

> Edit this exact image. Keep everything identical: framing, size, painting style, colours, the
> flat fluorescent lighting, the purple wall, the grey metal door frame, the badge reader with its
> red light, and the floor. Change only one thing: the grey door now stands wide open, swung away
> from us into the room beyond, so we see it edge-on at an angle against the left side of its
> frame, its STAFF ONLY sign still on it. Through the open doorway: a narrow, dingy staff corridor
> with scuffed beige walls and a worn grey floor, lit by one flickering strip light, a little
> darker than the shop. Nothing in the corridor except a cheap plastic chair near the far end.

### 3d. The Lair door, open (slice 27) → attach `art-inbox/CROP-lair-door.png` then `art-inbox/REFERENCE-lair-background.png`, save as `art-inbox/lair-door-open.png`

Portrait (1024×1536). The crop is the painting's region x 0–210, y 135–450, enlarged. Shown from the
moment the curse lifts (`curseLifted`), so the door is open when human Reginald walks out of the
Lair in the finale.

> Edit the FIRST image only; the second image is just a reference for what lies through the door.
> Keep everything in the first image identical: framing, size, painting style, colours, the
> lighting, the purple wall, the purple stone arch, the sign at the top, the shelf at the right
> edge, and the floor. Change only one thing: the wooden door now stands wide open, swung inward
> away from us on its left-hand hinges, so we see it edge-on at an angle against the left side of
> the arch, with its black iron straps and ring handle still on it. Through the open doorway: a
> glimpse of the room in the second image (the Lich's Lair: its purple stone walls, candlelight,
> the golden spotlight's glow), seen from the doorway, dimmer than the shop. Only a glimpse: a
> slice of wall and floor and warm light, no characters, nothing that fills the doorway.

### 3b. The teapot's PRICELESS sticker → attach `art-inbox/CROP-teapot.png`, save as `art-inbox/teapot-priceless.png`

Landscape (1536×1024). Shown once Dana re-prices it (`teapotRepriced`). The teapot is only about 70 px
wide in the game, so the sticker must be **big and bold** to read at all; its words won't be legible
at that size, and that's fine.

> Edit this exact image. Keep everything identical: framing, size, painting style, colours, the
> lighting, the purple wall, the red wire bin and everything in it, and the teapot's shape,
> colour and gold emblem. Change only one thing: replace the small yellow square price sticker on
> the right side of the teapot's belly with a much bigger, slightly crooked, bright red starburst
> price sticker with a white border, reading PRICELESS in bold white capitals, slapped on at an
> angle over the right half of the teapot's belly. Same painted style as the rest of the image.

### 3c. The front door's sign (a fix to the background) → attach `art-inbox/CROP-front-door.png`, save as `art-inbox/front-door-sign.png`

Square (1024×1024). Not an overlay: a play-test note. A CLOSED FOR REFURBISHMENT notice facing into
a shop with a cashier on duty doesn't hold up, so the notice becomes the shop's hanging two-sided
OPEN/CLOSED sign, showing the staff side, CLOSED (customers outside see OPEN). The agent patches
the result into the background itself.

> Edit this exact image. Keep everything identical: framing, size, painting style, colours, the
> night outside, the street lamps and trees, the green door frame and the push bar. Change only one
> thing: replace the taped paper notice with a classic hanging shop sign: a small rectangular
> two-sided card with a rounded border, hanging from a little suction-cup hook by a short string,
> slightly crooked, white with a red border, reading CLOSED in big bold red capitals, nothing
> else. It's a bit smaller than the notice was, so the glass and the night show more around it.
> Same painted style as the rest of the image.

### 3d. The sign over the Lair door (a fix to the background) → attach `art-inbox/CROP-lair-sign.png`, save as `art-inbox/lair-sign.png`

Landscape (1536×1024). Not an overlay: a play-test note. EXIT THROUGH THE GIFT SHOP is a sign
inside an attraction, pointing visitors to the way out; from the shop, the door back is the
attraction's entrance, so its sign names the attraction. The agent patches the result into the
background itself.

> Edit this exact image. Keep everything identical: framing, size, painting style, the purple
> wall, the stone arch below and the ceiling edge at the top. Change only one thing: replace the
> green sign with a tacky theme-park attraction sign in the same place and about the same size: a
> black board with a crooked, cheap-looking purple frame, the words THE LICH'S LAIR in big, bold,
> drippy lime-green horror-movie lettering, and ENTER IF YOU DARE in small white capitals under
> them, a little cartoon skull at each end. Same painted style as the rest of the image.

---

**After you approve them:** the agent crops and scales the background to 1280×720 and fits the
hotspots and the floor to it; it cuts the sprites out of the sheets and shows them in place in the
game, at their sizes (Dana is 200 px, Reginald 265), before anything is committed; the overlays
likewise, shown at the moment they appear.
