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

### A, round 3: drawn over a pose guide → save as `art-inbox/dana-walk-frames-3.png`

Round 2 made the same mistake: words don't get ChatGPT to alternate identical legs. Round 3 gives
it the poses as a picture: `art-inbox/LAYOUT-dana-walk-poses.png` (made by
`scripts/walk-pose-guide.py`), seven stick figures with the **near leg and arm orange** and the
**far ones blue**, taking turns. Use a **new chat** (the old one is stuck on its mistake), landscape,
and attach all three: `dana-sheet.png`, `REFERENCE-dana.png`, `LAYOUT-dana-walk-poses.png`.

> The third attached image is a POSE GUIDE for an animation sprite sheet: seven stick figures in
> one row. Draw the character from the first two attached images (same face, hair, purple polo
> with the small skull logo, teal lanyard with the white TRAINEE badge, khaki trousers,
> purple-and-cream sneakers; flat colour, simple two-tone cel shading, bold clean dark outlines)
> SEVEN times, in exactly the seven poses of the guide, in the same order, the same places and the
> same size, all in the three-quarter view facing right of the second image. Follow every limb's
> angle exactly: in the guide, the ORANGE leg and arm are the ones nearer the viewer (drawn in
> front), the BLUE leg and arm are further away (drawn behind, and a shade darker). The legs take
> turns: in poses 2 and 3 the near leg is in front; in poses 5 and 6 the far leg is in front. Do
> NOT draw the stick figures, their colours or any lines from the guide. Plain flat light-grey
> background, no shadow, no floor, no text other than the badge, no numbers.

### A, round 3 in Gemini (Nano Banana) → save as `art-inbox/dana-walk-frames-3.png`

The developer's choice for round 3 (2026-10-23): Gemini's image model, which takes several
reference images and follows a pose guide well. New chat, aspect ratio **16:9** (Gemini has no 21:9), and
attach in this order: `art-inbox/dana-sheet.png`, `art-inbox/REFERENCE-dana.png`,
`art-inbox/LAYOUT-dana-walk-poses.png`.

> Create a 2D game sprite sheet of a walk cycle: the same cartoon character drawn seven times,
> side by side in one horizontal row on a plain flat light-grey background.
>
> The character is the one in image 1 (a model sheet) and image 2 (the exact angle to use): Dana, a
> young trainee with short, tousled dark-brown hair with a purple streak, a purple polo shirt with
> a small white skull logo on the chest, a teal patterned lanyard with a white badge reading
> TRAINEE, khaki trousers and chunky purple-and-cream sneakers. Copy the face, hair, outfit,
> proportions and art style exactly: flat colour, simple two-tone cel shading, bold clean dark
> outlines, like a 1990s LucasArts adventure game. Every drawing is the three-quarter view facing
> right shown in image 2, the same size, standing on the same invisible ground line.
>
> Image 3 is a pose guide: seven stick figures. Draw the character once over each stick figure, in
> the same order and position, matching every limb's angle. In the guide, the ORANGE leg and arm
> are nearer the viewer, so draw them in front; the BLUE leg and arm are further away, so draw them
> behind and a shade darker. The legs take turns, which is the whole point of the sheet: in poses
> 2 and 3 the near (orange) leg steps forward; in poses 5 and 6 the far (blue) leg steps forward
> and the near leg is behind. Pose 1 is standing still, pose 4 and pose 7 are the passing poses
> where one foot lifts past the other.
>
> Do not draw the stick figures, their colours, or any guide lines. No shadows, no floor, no text
> other than the badge, no numbers or labels.

If one pose still has the wrong leg in front, ask for an edit rather than a new sheet, naming the
pose: "In pose 5, the far leg (darker) must be the one stepping forward and the near leg behind;
change only that pose." Credit rows for Gemini art name Gemini (Google) as the tool.

### A, round 4 in Gemini: draw only the second step → save as `art-inbox/dana-walk-step-2.png`

Round 3 (Gemini, over the pose guide) limped too. Past the spec's three rounds, at the developer's
call (2026-10-23). This round asks for half as much: `art-inbox/REFERENCE-dana-step-1.png` is round
1's first step (poses 2–4), which is good, with its **back leg shaded dark** by the agent. Gemini
only draws the second step, with that dark leg forward: a leg it can see, instead of "near" and
"far". The agent then joins the two steps into one cycle (and checks they match). New chat, 16:9,
attach `art-inbox/REFERENCE-dana-step-1.png` and `art-inbox/dana-sheet.png`, in that order.

> Image 1 shows the first step of a walk cycle for a 2D cartoon game: the same character three
> times (contact, down, passing). Notice that one trouser leg and sneaker is shaded DARK (the leg
> further from the viewer) and the other is LIGHT (the nearer leg). In image 1 the LIGHT leg steps
> forward and the DARK leg is behind.
>
> Draw the SECOND step of the same walk: three drawings in one row, in the same style, size, angle
> (three-quarter view facing right), ground line and spacing as image 1, with the legs swapped:
>
> 1. Contact: the DARK leg reaches forward, heel touching the ground; the LIGHT leg is behind, on
>    its toes. The arms swing the opposite way to image 1.
> 2. Down: weight on the forward DARK leg, knee a little bent; the LIGHT leg behind, lifting.
> 3. Passing: the DARK leg straight under the body; the LIGHT leg lifts and passes it, drawn in
>    front of it.
>
> Keep the dark shading on the dark leg exactly as in image 1, so it's obvious which leg is which.
> Same face, hair, purple polo with skull logo, teal lanyard and TRAINEE badge, khaki trousers and
> purple-and-cream sneakers as image 1 and the model sheet in image 2. Plain flat light-grey
> background, no shadow, no floor, no text other than the badge, no numbers.

### A, round 5: a costume marker → save as `art-inbox/dana-walk-frames-5.png`

Round 4 limped too: the generators always put the same leg forward, because Dana's legs look
identical. Round 5 makes them different: **one trouser leg rolled up, showing a bright lime-green
sock**. With a mark it can see, the generator can be told which leg leads. The pose guide
`art-inbox/LAYOUT-dana-walk-marker.png` (`scripts/walk-pose-guide.py OUT marker`) colours that leg
lime green and the other brown. Either tool: Gemini at 16:9 or ChatGPT landscape, in a **new
chat**. Attach, in this order: `art-inbox/dana-sheet.png`, `art-inbox/REFERENCE-dana.png`,
`art-inbox/LAYOUT-dana-walk-marker.png`.

> Create a 2D game sprite sheet of a walk cycle: the same cartoon character drawn seven times,
> side by side in one horizontal row on a plain flat light-grey background.
>
> The character is the one in image 1 (a model sheet) and image 2 (the exact angle to use): Dana, a
> young trainee with short, tousled dark-brown hair with a purple streak, a purple polo shirt with
> a small white skull logo, a teal patterned lanyard with a white badge reading TRAINEE, khaki
> trousers and chunky purple-and-cream sneakers. Flat colour, simple two-tone cel shading, bold
> clean dark outlines. Every drawing is the three-quarter view facing right of image 2, the same
> size, on the same invisible ground line.
>
> ONE COSTUME CHANGE, in all seven drawings: Dana's RIGHT trouser leg (the one nearer the viewer)
> is rolled up to mid-calf, showing a bright LIME-GREEN SOCK above the sneaker. The left trouser
> leg is NOT rolled up and reaches down to the shoe. This marks which leg is which.
>
> Image 3 is a pose guide: seven stick figures. Draw Dana over each one, in the same order and
> place, matching every limb's angle. The GREEN leg in the guide is the rolled-up, green-sock leg;
> the BROWN leg is the plain trouser leg. The legs must take turns:
> - Pose 1: standing still.
> - Poses 2 and 3: the GREEN-SOCK leg is in front (on the right of the drawing); the plain leg is
>   behind (on the left).
> - Pose 4: the plain leg lifts and passes behind the planted green-sock leg.
> - Poses 5 and 6: the PLAIN leg is in front (on the right of the drawing); the green-sock leg is
>   behind (on the left).
> - Pose 7: the green-sock leg lifts and passes in front of the planted plain leg.
>
> Do not draw the stick figures or any guide lines. No shadows, no floor, no text other than the
> badge, no numbers or labels.

Check pose 5 before saving: the green sock must be on the **left** (behind). If it isn't, ask for
an edit of just poses 5 and 6. If this works, Dana keeps the rolled cuff whenever they walk or
stand (the sheet's first pose becomes the standing sprite, so standing and walking match); other
art (key art) doesn't have it, a small difference.

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
