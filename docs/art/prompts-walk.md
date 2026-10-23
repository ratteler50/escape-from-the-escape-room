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

### A, round 2: the other leg forward → save as `art-inbox/dana-walk-frames-2.png`

Round 1 drew poses 5–7 as copies of 2–4: the same leg leads every step, so Dana limps. In the
**same chat** as round 1 (so it keeps the same Dana), ask for a corrected sheet:

> Almost perfect, but poses 5, 6 and 7 have the same leg forward as poses 2, 3 and 4, so the walk
> limps. Redraw the whole sheet, keeping everything else exactly the same, with the legs clearly
> alternating. In every pose, the leg and arm FURTHER from the viewer (the character's left) are a
> shade darker and drawn behind the near ones where they overlap, the way cartoon walk cycles do.
> Poses 2–4: the NEAR leg (the character's right, lighter) steps forward; the far arm swings
> forward. Poses 5–7: the FAR leg (darker) steps forward and the near leg is behind; the near arm
> swings forward. Same seven poses in one row, same size, same ground line, same plain light-grey
> background, no numbers.

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
