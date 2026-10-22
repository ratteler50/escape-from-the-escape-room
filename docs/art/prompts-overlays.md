# Prompt pack: Lair prop overlays (slice 19, step 3)

Two things in the Lair change during play, and the painting can't show them. Each overlay is a
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

---

**After you approve them** (shown in place in the game), the agent scales them back to the
painting's size, crops each to the changed area, feathers the edges, and converts to WebP.
