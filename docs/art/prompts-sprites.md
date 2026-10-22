# Prompt pack: character sprites (slice 19, step 2)

**Approved sheets (2026-10-22):** `art-inbox/dana-sheet.png` and `art-inbox/reginald-sheet-2.webp`
(the black-and-crimson recolour). Prompts that made them: `prompts-characters.md`.

Two sprites come **straight from the sheets** (the agent cuts them out; nothing to generate):

- **Dana, standing:** the three-quarter view facing right (mirrored in code to face left).
- **Reginald, seated:** the fourth pose.

Two need **new images**. Generate each in a new ChatGPT chat with
`art-inbox/reginald-sheet-2.webp` attached, ask for a **portrait** image (1024×1536), and save to
`art-inbox/` under the name given. If ChatGPT offers a transparent background, take it; otherwise
the plain grey background is fine (the agent keys it out).

---

## 1. Reginald, standing on his mark → save as `art-inbox/reginald-standing.png`

He stands on his mark next to the phylactery's plinth, so this pose must be **narrow**: nothing
sticking out sideways.

> Using the attached character sheet as the exact reference (same character, same face, crown,
> black-and-crimson robe with gold trim, same line work and flat colours with bold outlines), draw
> ONE full-body image of him standing, three-quarter view facing right. A narrow, upright,
> theatrical pose: chin raised proudly, one skeletal hand pressed to his chest, the other arm held
> close to his side. The robe and cape hang straight down and pool a little at his feet; nothing
> sticks out sideways. Whole figure in frame, from crown to boots, centred, with empty space
> around it. Plain flat light-grey background, no shadow, no floor, no other objects, no text.

## 2. Reginald, human again (the finale) → save as `art-inbox/reginald-human.png`

> Using the attached character sheet as the exact reference for his costume (same crown,
> black-and-crimson robe with gold trim and gold skull ornaments, same boots, same line work and
> flat colours with bold outlines), draw ONE full-body image of the same man after the curse has
> lifted: he is a human actor again. A gaunt, middle-aged human face with a big theatrical nose and
> expressive eyebrows, wearing smeared, amateurish white-and-black skull face paint; normal human
> hands, with pale make-up that stops at the wrists. Expression: devastated, deeply wounded
> dignity, one hand raised to his forehead in a tragic swoon. Standing, three-quarter view facing
> right, narrow pose, the robe hanging straight down. Whole figure in frame, from crown to boots,
> centred. Plain flat light-grey background, no shadow, no floor, no other objects, no text.

---

**After you approve them** (shown in place in the game), the agent keys out the backgrounds, sizes
them (Reginald ≈ 265 px standing, ≈ 230 px seated; Dana ≈ 200 px), converts to WebP with alpha, and
wires them in.
