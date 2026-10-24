# Slice 13 — M3 design, art-style decision, premise fixes

**Status:** built, agent play-tested · awaiting developer play-test · **Milestone:** M3

## Why

M3's design was settled in a grilling session (2026-10-21) and needs to live in the repo before
the content slices start. Two other things were waiting for the next PR: the art-style decision from
the prototype, and a concept pass that found lines breaking the premise.

## Spec

1. **`docs/design.md`**: an M3 section with the cast (Kyle, Mordecai), the goal, the puzzle
   dependency chart, the finale, and the slice plan (13–17).
2. **`docs/decisions/0005-art-style.md`**: style A (hand-painted cartoon), the
   image-to-image-from-layout-reference method, the three style rules, and a pointer to the
   prototype's notes (now `docs/prototypes/lair-art-style.md`). No prototype code comes into `main`.
3. **Premise fixes** (Escape-O-Rama is mundane; tonight's curse is the only magic):
   - floor grate pamphlet: no longer a "So You've Been Cursed" staff guide;
   - Customer Reviews: no reviewer trapped since 2019;
   - Reginald: head office has no category for curses.
4. **The phylactery** in the Lair, which the story depended on but the game never had: a
   look-only prop on a plinth by the throne, cable-locked by head office. Take and Use are refused
   with lines. It whispers.

Out of scope: any Gift Shop or Break Room content (slices 14–15).

## Acceptance checks

- `npm test`, typecheck, build, and the Playwright end-to-end tests pass (CI on the PR).
- Content validation passes with the phylactery added; the always-winnable test is unchanged.
- Agent play-test: the phylactery's verbs and lines in the browser; the three rewritten lines.

## Notes

- Phylactery bounds sit between Reginald's spotlight mark (x 380–450) and the throne (x 540–740).
  The art prototype's layout sketch predates it; add it before M4 art.
- Concept pass also fixed Dana's pronouns (they/them, per the Premise) in an older design-doc
  paragraph and one test message.
- Play-tested in the production preview: the phylactery's Look, "Pocket it", and "Listen closely"
  lines; Dana walks to (500, 460). All 216 unit tests and the 3 Playwright tests pass locally.
