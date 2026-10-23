# Prompt pack: key art (slice 26)

Three images, each in its **own new ChatGPT chat**, all **wide 16:9 landscape**. Save each into
`art-inbox/` under the name given; regenerate as often as you like.

The references are in `art-inbox/`:

- `REFERENCE-lair-background.png`: the painted Lair, for the style and palette of the scenes;
- `REFERENCE-cast.png`: every character as they appear in the game (Dana, Reginald, human
  Reginald, Kyle, Mordecai, Gary), so the faces and outfits stay on model;
- `kyle-sheet.webp`: Kyle's full model sheet (the cast lineup only shows them waist-up);
- `REFERENCE-gift-shop.png`: the painted Gift Shop, for the end card.

Characters are flat colour with bold outlines; backgrounds are painted, as in the game.

---

## 1. Title screen → save as `art-inbox/title-art.png`

Attach `REFERENCE-lair-background.png`, `REFERENCE-cast.png` and `kyle-sheet.webp`.

> Key art for the title screen of a comedic point-and-click adventure game, wide 16:9. Use the
> first attached image for the style of the background (a hand-painted cartoon room, warm candlelight,
> purple stone) and the second and third for the characters, who must look exactly like they do
> there: flat colour with bold dark outlines, standing out against the painted background.
>
> Scene: the Lich's Lair of a cheap franchise escape room. In front, just right of centre: Dana, a
> 19-year-old trainee in a purple staff polo and a TRAINEE lanyard, earnest, holding up a
> dog-eared rulebook as if it will help. Looming behind Dana and filling the right side: Reginald,
> the lich (skeletal face, glowing green eyes, crooked gold crown, black-and-crimson robe), in a
> grand ham-actor pose, arms raised. On the left, smaller: Gary the prop skeleton on his stand in a
> spotlight; Kyle, the bored cashier, leaning in a doorway looking at their phone; and Mordecai,
> the furious translucent blue ghost wizard, floating and pointing at something off-screen. Above
> the far door, a glowing purple sign with a cartoon skull.
>
> Keep the top third of the image fairly empty and dark (a title will go there), and the centre
> below it uncluttered enough for three buttons. No text anywhere in the image.

## 2. Logo → save as `art-inbox/logo.png`

New chat; attach `REFERENCE-mug-logo.png` (the franchise's skull logo).

> A game logo reading "ESCAPE FROM THE ESCAPE ROOM", on a plain flat light-grey background with
> plenty of space around it, wide. Tacky theme-park franchise lettering: chunky, bulbous,
> slightly wobbly cartoon letters in glossy purple with a cream outline and a bold dark outline, a
> little spooky dripping on a few letters, as if it's on the sign of a cheap haunted attraction.
> "ESCAPE" large on the top line; "FROM THE" small in the middle; "ESCAPE ROOM" large on the
> bottom line. The cartoon skull from the attached mug sits beside the words. Flat colour with
> bold outlines, no background scenery, no shadow on the background.

## 3. End card → save as `art-inbox/end-art.png`

Attach `REFERENCE-gift-shop.png`, `REFERENCE-cast.png` and `kyle-sheet.webp`.

> The final scene of a comedic point-and-click adventure game, wide 16:9. Use the first attached
> image for the setting and its painted style (a tacky franchise gift shop under harsh strip lights,
> purple branding, lich merchandise everywhere), and the second and third for the characters, who
> must look exactly like they do there: flat colour with bold dark outlines.
>
> In front, centre: Dana, the trainee, now OFF DUTY, beaming and holding up a purple souvenir mug
> reading I ESCAPED with both hands. Beside Dana: Reginald, human again (a gaunt actor in smeared
> skull face paint, still in the black-and-crimson robe and crooked crown), waving a sheet of paper
> and mid-complaint. Behind the counter: Kyle, utterly unbothered, earbuds in, looking at their
> phone. Above, Mordecai the translucent blue ghost wizard, appalled, hands on his face, staring at
> the bargain bin. In the bargain bin at the front: a glowing green jar with a tiny skull inside (the
> lich's phylactery) wearing a $1 price sticker, faintly glowing, as if it's plotting something.
>
> Keep the top quarter fairly empty (a title will go there) and a strip along the bottom clear (for
> a button and a credit line). No text in the image other than the mug and the $1 sticker.

---

## Review of the first pass (2026-10-23)

The logo is approved as it is. Both paintings drew **Dana and Kyle swapped**: the figure in front
has Kyle's long dark hair, pink streak, earbuds, black trousers and skull chain, and the figure at
the back (doorway, counter) has Dana's short hair, khakis and lanyard. Both wear the purple polo, and
the prompts named them by role ("the trainee", "the cashier") with only Kyle's full sheet attached,
so the model gave the front spot to the best-referenced figure. The fixes below attach
`dana-sheet.png` too and describe each character by what they look like.

Title, other mismatches:

- Dana's open book sits at about x 690–810, y 400–480 in game coordinates, under the button column
  (about x 530–750, y 360–620): the buttons would hide the joke. Dana needs to sit further right.
- Dana's expression is Kyle's sideways deadpan, not earnest (the swap fixes it).
- Fine as it is: dark, empty top third (Reginald's crown and hand reach into it only at the right,
  clear of the logo); Gary on his stand in the spotlight; Mordecai with one tail; no text.

End card, other mismatches:

- **Mordecai has two tails** (one trailing down, one curling up to the right).
- The bargain bin fills the bottom centre right down to the edge, where Play again and the music
  credit go; the button would cover the phylactery, which is the punchline.
- The top quarter isn't empty in the middle: Reginald's crown reaches up to about y 130 (game
  coordinates), right under "THE END?". Mordecai's hat is up there too, but off to the right.
- Dana isn't shown off duty: the game ends with Dana's lanyard flipped to OFF DUTY.
- The Lich's Lair and STAFF ONLY signs are text, but they're painted in the Gift Shop itself, so
  they stay.

Fixed as: the title by an edit in its own chat (the composition is right), the end card by a
revised prompt in a new chat (the composition isn't).

## 1b. Title fix → save as `art-inbox/title-art-2.png`

In the **same chat** as the title painting, attach `dana-sheet.png` and `kyle-sheet.webp`.

> Keep this exact painting: the room, the lighting, Reginald, Mordecai, Gary, the composition and
> the dark empty top third. Change only the two people in purple polos, who are the wrong way round:
>
> 1. The figure in front holding the book must be **Dana** (first attached sheet): short, messy
>    brown hair with a hint of purple, a freckled, open, earnest face, a purple polo with a teal
>    skull lanyard and a white TRAINEE badge, **khaki trousers**, scuffed cream-and-purple
>    sneakers. No earbuds, no pink hair, no chain, no black trousers. Dana holds the dog-eared
>    rulebook up and open towards Reginald with both hands, looking up at him, determined and
>    hopeful. Move Dana a little further right, so Dana and the book are entirely right of the
>    middle of the picture and the middle stays clear floor.
> 2. The figure leaning in the left doorway must be **Kyle** (second attached sheet): long, wavy,
>    dark hair with a pink streak, white wired earbuds, a purple polo with pins and no lanyard,
>    black trousers with a skull chain, chunky platform sneakers, a phone in a sparkly purple case,
>    bored, half-lidded eyes.
>
> No text anywhere in the image.

## 3b. End card, revised → save as `art-inbox/end-art-2.png`

**New chat**; attach `REFERENCE-gift-shop.png`, `dana-sheet.png`, `kyle-sheet.webp`,
`REFERENCE-cast.png` and `lanyard-off-duty.png`.

> The final scene of a comedic point-and-click adventure game, wide 16:9. Use the first attached
> image for the setting and its painted style (a tacky franchise gift shop under harsh strip lights,
> purple walls, checkered floor), seen from a little further back so there is plenty of floor in
> front of the characters. The characters must look exactly like the attached sheets: flat colour
> with bold dark outlines.
>
> Layout: everything important sits in the **middle band** of the picture. The **top quarter** is
> only wall and ceiling lights (no heads, hats or crowns in it), and the **bottom fifth** is only
> empty checkered floor (no feet, bin or props in it).
>
> Left of centre: **Dana** (second attached sheet: short, messy brown hair, freckles, purple polo,
> khaki trousers, cream-and-purple sneakers, no earbuds, no pink hair), beaming, holding up a
> purple souvenir mug reading I ESCAPED with both hands. Dana's lanyard (last attached image) now
> reads OFF DUTY.
>
> Right of centre: **Reginald**, human again (a gaunt actor in smeared white-and-black skull face
> paint, still in the black-and-crimson robe and crooked gold crown, as in the fourth image),
> waving a sheet of paper and mid-complaint.
>
> Far left, small, behind the counter by the mug shelf: **Kyle** (third attached sheet: long, wavy
> dark hair with a pink streak, white wired earbuds, purple polo with pins, no lanyard), utterly
> unbothered, looking at their phone.
>
> Between Dana and Reginald, on the floor at their feet: a small red wire bargain bin of lich
> merchandise. On top of it, a glowing green jar with a tiny skull inside (the lich's phylactery)
> wearing a $1 price sticker, faintly glowing, as if it's plotting something.
>
> Upper right, below the ceiling: **Mordecai**, the translucent blue ghost wizard (fourth image),
> appalled, hands on his face, staring down at the jar. Mordecai has **one** wispy ghost tail
> instead of legs, and no other tail.
>
> No text in the image other than the mug, the OFF DUTY badge, the $1 sticker and the shop's own
> signs.

## 3c. End card sign fix → save as `art-inbox/end-art-3.png`

`end-art-2.png` is right apart from the sign over the Lair door, which ChatGPT changed to "EXIT
THROUGH THE GIFT SHOP". It was copied from `gift-shop.webp`, an earlier draft of the room that was
attached by mistake; the Gift Shop in the game (and `REFERENCE-gift-shop.png`) has "The Lich's Lair"
sign there. In the **same chat** as `end-art-2.png`, attach `REFERENCE-gift-shop.png`.

> Keep this exact painting: every character, their poses, the bargain bin, the lights, the
> composition and the empty floor at the bottom. Change only the green sign above the arched wooden
> door on the left: make it the sign from the attached image, a black sign with dripping green
> letters reading THE LICH'S LAIR and small white letters reading ENTER IF YOU DARE, with two little
> skulls. Same size and place as the current sign.

## 3d. End card teapot fix (not used: see "Outcome")

`end-art-3.png` has the right sign back, but the teapot in the bargain bin is missing its PRICELESS
sticker: Dana reprices it with the price gun on the way to the ending (the `teapotRepriced` flag),
so by the end card it's priceless. The edit also takes out the ESCAPE-O-RAMA banner that came back
with the reference, because it fills the top centre where "THE END?" is drawn (drop that sentence
to keep the banner and let the code put the text over it). In the **same chat** as `end-art-3.png`:

> Keep this exact painting: every character, their poses, the signs, the bargain bin and the
> composition. Two changes only: put a small, bright price sticker reading PRICELESS on the side of
> the white teapot in the bargain bin, so it's clearly readable; and remove the ESCAPE-O-RAMA
> banner from the back wall, leaving plain purple wall there.

## Outcome (2026-10-23)

Approved: the logo (first pass), the title from 1b (`title-art-2.png`) and the end card from 3c,
finished by the agent instead of 3d. The agent painted the PRICELESS sticker onto the teapot (a red
starburst like the one in the game's Gift Shop overlay). The developer kept the ESCAPE-O-RAMA banner
after comparing three mock-ups (banner kept, banner removed, banner reading THE END?), so the agent
painted its lettering out, and the code writes "THE END?" on the blank banner. Files:
`public/assets/key-art/title.webp`, `logo.webp` (1100×498, transparent), `end.webp`.

---

**After you approve them**, the agent sizes the paintings to 1280×720, cuts the logo out, and puts
all three into the game for a screenshot check.
