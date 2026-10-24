# Slice 24 — Story fixes: the code and the curse's rule

**Status:** done, merged in [#25](https://github.com/ratteler50/escape-from-the-escape-room/pull/25), 2026-10-22 · **Milestone:** M4

## Why

Play-testing turned up three places where the story's logic is fuzzy or contradicts the art:

- **The code.** The scroll reads "THE ANSWER IS: [INSERT CODE HERE BEFORE PRINTING]" and the answer
  is C-O-D-E. The leap from that sentence to the word CODE is unclear.
- **The keypad.** Its look line says "four rune buttons", but the painting shows a 3×3 grid of nine.
  Runes also give no way to type letters.
- **The ending's rule.** Escaping means a guest leaving *through the gift shop with a souvenir*,
  but the player only meets that rule at the end, as signs and a door that sends Dana back. Nothing
  plants it.

All text: no new art, items or flags. (Key art and polish, the old slice 24, becomes slice 25.)

## Spec

1. **The keypad** has nine buttons, as painted: eight letter keys like an old phone's (ABC, DEF,
   GHI, JKL, MNO, PQRS, TUV, WXYZ) and ENTER. No 0, no 1, no CLEAR (a wrong code buzzes and resets,
   as now). New look line, along the lines of: "Eight brass buttons with letters on them, like an
   old phone, and one that says ENTER. No numbers at all. Someone has stuck NUMBER PAD on it anyway."
   (keeping ENTER CODE TO ESCAPE and NO REFUNDS). Dana's wrong guesses (L-I-C-H, D-O-O-M, G-A-R-Y)
   still work: Dana spells them out.
2. **The scroll** reads "THE ANSWER IS: {CODE}": head office's template, never filled in. The curse
   bound the script *as printed*, so the answer is literally the word in the braces. Its look line and
   Dana's keypad lines say so plainly, then C-O-D-E, ENTER, CLUNK.
   - **Optional gag:** before the realisation, Dana dutifully types the whole template, braces and
     all, gets a buzz, and only then reads it literally. Decide when drafting the lines; mark it
     `// DRAFT:` either way.
3. **Planting the rule:** Reginald's script (in the coffin, memorised for his cue) gains its last
   page: "FINALE: The guest escapes through the gift shop and purchases a souvenir. CURTAIN." with a
   head-office aside. The front door's bounce line in the Gift Shop then points back to it ("The
   script said *through the gift shop*, with a souvenir.").
4. **Consistency:** search all content for "rune", "four buttons", the old scroll wording, and lines
   that explain the ending, and fix what contradicts the above. The Handbook master list in
   `docs/design.md` stays as it is unless a new section is quoted.

Out of scope: a keypad close-up with pressable buttons (not wanted: the text carries it), the walk
animation, the phylactery in the bargain bin.

## Acceptance checks

- `npm test` (drafts up to date, always-winnable), typecheck, build, Playwright green.
- Agent play-test: read the script, the scroll and the keypad in order; the lines tell one
  consistent story.
- Developer play-test; the developer punches up the `// DRAFT:` lines.

## Notes

- Branch `slice-24-story-fixes`, from `main` once #22 and #23 have merged (#22 rewrites the
  front door's lines this slice extends).

## Build notes

- **Keypad:** eight letter keys like an old phone, plus ENTER; labelled NUMBER PAD anyway. Wrong
  guesses are now "L-I-C-H, ENTER. Bzzt."
- **Scroll:** "THE ANSWER IS: {CODE}". A brace-key gag was tried and dropped at the developer's
  play-test: the look line said the braces counted, then Dana dropped them, which read as two
  versions of the joke. Now the braces are explained once (they mark the template's blank) and the
  answer is the word in the blank: C-O-D-E, ENTER. The optional "type the whole template" gag is out.
- **Script:** its look line gains the last page ("FINALE: The guest escapes THROUGH THE GIFT SHOP and
  purchases a souvenir. CURTAIN.", "souvenir" underlined twice by head office).
- **Sweep:** no other content mentioned runes or the old scroll; the design doc's M1 section updated.
- **Front door** (after #22 merged): Dana's last bounce line now names the rule from Reginald's
  script: the guest escapes through the gift shop, with a souvenir.
