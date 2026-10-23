# Prompt pack: Dana's walk (slice 27)

Two images, one per technique (`docs/slices/27-walk-animation.md`). Generate each in a **new
ChatGPT chat**, so neither sees the other, and save it to `art-inbox/` under the name given. Ask
for **landscape** (1536×1024). If ChatGPT offers a transparent background, take it; otherwise the
plain grey is fine (the agent cuts it out).

**Attach to both:**

- `art-inbox/dana-sheet.png`: the approved model sheet;
- `art-inbox/REFERENCE-dana.png`: Dana's sprite as it is in the game today (the three-quarter view,
  cut out). The walk is drawn from **this** angle, so standing and walking match.

**Drift is the risk** (image generators change faces, outfits and proportions from pose to pose).
Before you judge it, look along the row: same face, same hair, same purple polo with the skull,
same lanyard and TRAINEE badge, same khakis and purple-and-cream sneakers, same height. If one pose
is clearly someone else, regenerate (up to 3 rounds per image), or keep it and tell the agent which
pose is off: small differences (size, a colour, where the feet are) the agent fixes.

---

## A. Walk cycle, frame by frame → save as `art-inbox/dana-walk-frames.png`

> Using the two attached images as the exact reference for this character (same face, hair, purple
> polo shirt with the small skull logo, teal lanyard with the white TRAINEE badge, khaki trousers,
> purple-and-cream sneakers; same proportions, same line work: flat colour, simple two-tone cel
> shading, bold clean dark outlines), draw an animation sprite sheet: SEVEN full-body drawings of
> the same character in ONE horizontal row, evenly spaced, all exactly the same size and scale,
> every pose standing on the same invisible ground line. All seven are in the same three-quarter
> view facing right as the second attached image.
>
> 1. Standing still, relaxed, arms at the sides (exactly like the second attached image).
> 2. Walk, contact: the front (right) leg reaching forward, heel touching the ground; the back leg
>    behind, on its toes; the left arm swung forward, the right arm back.
> 3. Walk, down: weight on the front leg, knee bent a little, body at its lowest.
> 4. Walk, passing: the back leg lifting and passing the standing leg, body at its highest, arms
>    passing the sides.
> 5. Walk, contact: as pose 2 but with the legs and arms swapped (the left leg forward).
> 6. Walk, down: as pose 3 with the legs swapped.
> 7. Walk, passing: as pose 4 with the legs swapped.
>
> An eager, slightly bouncy walk, small steps, upright posture, a hopeful expression in every pose.
> Same expression and face in all seven. Nothing overlapping between drawings; generous space
> between them. Plain flat light-grey background, no shadow, no floor line, no text other than the
> badge, no numbers.

**Used in the game,** with the far leg shaded darker by the agent (`scripts/shade-far-leg.py`): the
sheet leads with the same leg in both steps. Further attempts to fix that in the generators (asking
for alternation, a pose guide, Gemini, a costume marker) all made the same mistake, so they aren't
kept here.

## B. Paper-doll parts → save as `art-inbox/dana-walk-parts.png`

For the cutout technique: the same Dana, taken apart so code can swing the pieces. The agent pins
each piece at its joint; the overlaps hide the seams.

> Using the two attached images as the exact reference for this character (same face, hair, purple
> polo shirt with the small skull logo, teal lanyard with the white TRAINEE badge, khaki trousers,
> purple-and-cream sneakers; same proportions, same line work: flat colour, simple two-tone cel
> shading, bold clean dark outlines), draw the character as separate PAPER-DOLL PUPPET PIECES for
> cut-out animation, in the same three-quarter view facing right as the second attached image, all
> at exactly the same scale as that image, laid out separately on the page with clear space between
> every piece (nothing touching or overlapping):
>
> 1. Head and torso in one piece: hair, face, neck, the polo shirt with the lanyard and badge, down
>    to the belt and the top of the hips, with NO arms (the short sleeves are on the arm pieces) and
>    NO legs. Draw the shoulders and the hips complete and rounded, as if the limbs were attached
>    behind them.
> 2. Near arm (nearest the viewer): the short polo sleeve, the arm and the
>    hand, hanging straight down, the top of the sleeve rounded.
> 3. Far arm: the same, slightly darker, as it is further away.
> 4. Near thigh: the khaki trouser leg from the hip to just below the knee, straight, the top
>    rounded.
> 5. Near lower leg: the khaki trouser leg from just above the knee down, with the sneaker, standing
>    flat.
> 6. Far thigh: as 4, slightly darker.
> 7. Far lower leg: as 5, slightly darker.
>
> Plain flat light-grey background, no shadow, no text other than the badge, no numbers, no
> guides or joint markers.

---

**Note:** facing right in three-quarter view, the near side is the character's *right* (the
first version of this prompt said left; the generated pieces came out the same either way, and the
agent pins the screen-left limbs as the near ones).

**After you approve them**, the agent cuts the frames or pieces out, sizes them to Dana's 200 px
(stored at 2×), lines up the feet, checks the frames against the model sheet, and wires both into
the game behind `?walk=frames` and `?walk=parts` for you to compare with `?walk=hop`.

---

# Reginald's walks (after the pick: frames, 2026-10-23)

Two sheets, one per look that walks: the **lich** (to his spotlight mark, in the Lair) and the
**human** (into the Gift Shop, in the finale). Same recipe as Dana's round 1, which made the best
drawing: ChatGPT, **landscape** (1536×1024), a **new chat for each**. His robe hides his legs, so
only the boots show the steps; if the same boot leads both steps, the agent shades the far boot and
hem darker, as for Dana. Look along the row for drift before saving (crown, robe trim, gold skull
clasps, face), regenerating up to 3 times.

## C. Lich Reginald's walk → save as `art-inbox/reginald-walk-frames.png`

Attach `art-inbox/reginald-sheet-2.webp` (the approved black-and-crimson sheet) and
`art-inbox/REFERENCE-reginald.png` (his standing sprite: the angle to use).

> Using the two attached images as the exact reference for this character (same skeletal face with
> glowing green eyes and a hammy grin, the golden crown slightly askew, the black robe with crimson
> lining, gold trim and gold skull clasps, the too-long tattered cape, skeletal hands, the boots;
> same proportions; same line work: flat colour, simple two-tone cel shading, bold clean dark
> outlines), draw an animation sprite sheet: SEVEN full-body drawings of the same character in ONE
> horizontal row, evenly spaced, all exactly the same size and scale, every pose standing on the
> same invisible ground line, all in the three-quarter view facing right of the second image.
>
> 1. Standing still, exactly like the second attached image.
> 2–7. A grand, theatrical stage walk, two full steps: chin high, chest out, one skeletal hand
>    pressed to his chest, the other arm swinging wide; long strides under the robe, so only the
>    boot tips show at the hem, the robe and cape swaying behind him. Pose 2: the right boot
>    steps forward. Pose 3: weight on it, lowest. Pose 4: passing, highest, the robe swinging.
>    Poses 5–7: the same three with the LEFT boot stepping forward instead.
>
> Same face and expression in all seven. Nothing overlapping between drawings; generous space
> between them. Plain flat light-grey background, no shadow, no floor line, no text, no numbers.

## D. Human Reginald's walk (the finale) → save as `art-inbox/reginald-human-walk-frames.png`

Attach `art-inbox/reginald-sheet-2.webp` and `art-inbox/REFERENCE-reginald-human.png` (his finale
sprite: the angle and the look to use).

> Using the two attached images as the exact reference for this character's costume (the golden
> crown, the black robe with crimson lining, gold trim and gold skull clasps, the too-long tattered
> cape, the boots) and the second image for his face and hands (a gaunt, middle-aged HUMAN man
> with a big theatrical nose and expressive eyebrows, in smeared white-and-black skull face paint;
> human hands), same line work: flat colour, simple two-tone cel shading, bold clean dark outlines.
> Draw an animation sprite sheet: SEVEN full-body drawings of him in ONE horizontal row, evenly
> spaced, all exactly the same size and scale, every pose on the same invisible ground line, all in
> the three-quarter view facing right of the second image.
>
> 1. Standing still, exactly like the second attached image (one hand raised to his forehead in a
>    tragic swoon).
> 2–7. A devastated, melodramatic walk, two full steps: the back of one hand pressed to his
>    forehead throughout, the other arm hanging limp and swinging; heavy, dragging steps under the
>    robe, so only the boot tips show at the hem. Pose 2: the right boot steps forward. Pose 3:
>    weight on it, slumped lowest. Pose 4: passing. Poses 5–7: the same three with the LEFT boot
>    stepping forward instead.
>
> Same face and expression in all seven. Nothing overlapping between drawings; generous space
> between them. Plain flat light-grey background, no shadow, no floor line, no text, no numbers.
