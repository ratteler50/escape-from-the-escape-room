# Prompt pack: Lair prop overlays (slice 19, step 3; the display case in slice 25)

Three things in the Lair change during play, and the painting can't show them: Gary's arm, the
grate, and the display case. Each overlay is a
small patch of the painting, edited, that the game draws on top while the change holds.

You edit an **enlarged crop** of the painting, not the whole room, so ChatGPT has detail to work with
and nothing else in the room can drift. The agent shrinks the result back and blends its edges.
Attach the crop, ask for an **edit** (same size and framing), and save the result under the name
given. If ChatGPT redraws the whole crop (different colours, lighting or angle), try again with "do
not redraw; change only what I describe".

---

## 1. Gary without his arm → attach `art-inbox/CROP-gary.png`, save as `art-inbox/gary-armless.png`

Shown once Dana takes Gary's arm (`tookGaryArm`).

> Edit this exact image. Keep everything identical: framing, size, painting style, colours,
> lighting, the spotlight beam, the wall, the stand and the rest of the skeleton. Change only one
> thing: remove the skeleton's arm on the RIGHT side of the image, the whole arm from the shoulder
> down to the fingertips. Paint the wall and spotlight beam behind where the arm was, so it looks
> like the arm was never there. The shoulder ends in a clean, round bone joint.

## 2. The grate with Gary's arm gummed to it → attach `art-inbox/CROP-grate.png`, save as `art-inbox/grate-arm.png`

Shown once Dana has fished the key out (`gotCaseKey`): the gum let go of the key and stuck to the
grate instead.

> Edit this exact image. Keep everything identical: framing, size, painting style, colours, the
> warm candle lighting, the stone floor and the metal grate. Add only one thing: a cartoon
> skeleton's arm (white bone, the same style as a classroom skeleton's arm: upper arm, forearm,
> bony hand) lying diagonally across the grate, with its fingertips stuck to the bars by a big
> blob of bright pink chewing gum. The hand is open, as if waving. Give it a soft shadow on the
> grate so it sits in the scene.

## 3. The display case (slice 25)

The case has three states: closed with the scroll's end peeking out from under the bone (the
start), open with no scroll (`caseOpen`), and open with the scroll back (`doorUnlocked`). Two edits
of the **same** crop make them: the lid open (3a) and the scroll under the bone (3b). The game
draws the scroll patch on top of the lid patch, so the two never need to be painted together.

### 3a. The lid open → attach `art-inbox/CROP-case.png`, save as `art-inbox/case-open.png`

> Edit this exact image. Keep everything identical: framing, size, painting style, colours,
> lighting, the purple wall, the cork board and its pinned card at the top right, the dark fixture
> at the top left, the wooden pedestal, the purple velvet cushion, and the white bone lying on the
> cushion. Change only one thing: the glass display case's LID (its glass top) is open. It is
> hinged along the BACK edge and propped up, tilted back at a steep angle, so it stands up above
> the case behind the bone, like a museum case left open. Draw the lid the same way the rest of the
> case's glass is drawn: thin pale-cyan edges with a faint white glint, mostly see-through, so the
> wall shows through it. The front and side glass panels stay exactly where they are. Nothing
> inside the case except the bone on its cushion.

If the tilted lid doesn't read once it's shrunk into the room, try the front panel instead: replace
the sentences about the lid with "the FRONT glass panel of the case is swung open toward the viewer
on a hinge at its right-hand edge, at a steep angle, so it is narrow."

### 3b. The scroll under the bone → attach `art-inbox/CROP-case.png` first, then `art-inbox/ICON-scroll.png`; save as `art-inbox/case-scroll.png`

Start a new chat for this one, so it edits the original crop and not 3a's result.

> Edit the FIRST image. Keep everything identical: framing, size, painting style, colours,
> lighting, the closed glass case, the wall, the cork board, the pedestal, the purple velvet
> cushion, and the white bone exactly where it lies. Add only one thing: a rolled-up parchment
> scroll tucked UNDER the bone, lying on the cushion, with one end sticking out from under the
> bone toward the front of the case so it's easy to see. It looks like the scroll in the SECOND
> image: cream parchment, rolled, tied with a red ribbon in a bow, painted in the same soft style
> as the bone, not as a flat icon. Give it a little shadow on the cushion. The bone stays on top
> of it.

---

**After you approve them** (shown in place in the game), the agent scales them back to the
painting's size, crops each to the changed area, feathers the edges, and converts to WebP.
