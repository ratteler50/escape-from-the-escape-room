# Slice 26 — Key art, loading, polish

**Status:** awaiting approval · **Milestone:** M4 (slice 27, the walk animation, closes it)

## Why

Every room is painted, scored and has its icons, but the game still opens on dark text and ends on
dark text. It also downloads 9.5 MB with no sign of progress, so on a slow connection the title is a
black page for a while. Nearly all of that is music: the four tracks are 8.4 MB, the effects 0.4 MB,
all the art 0.6 MB. This slice gives the game a front and back cover, makes the first load quick,
matches the last plain bits of interface to the Escape-O-Rama tray, and credits everyone where
players can see it. Decisions from the slice 26 grilling (2026-10-22).

## Spec

1. **Title screen key art.** One ChatGPT painting (same style as the rooms; the character sheets,
   icon sheet and Lair attached): Dana in front, earnest, lanyard on; Reginald looming behind in
   full ham pose; Gary, Kyle and Mordecai smaller; the Escape-O-Rama sign glowing over the Lair
   door. Room at the top for the logo and in the middle for the buttons. **You approve it.**
2. **A painted logo:** "Escape From the Escape Room" as tacky franchise lettering (chunky, purple,
   the skull logo), its own image on a plain background, cut out and placed by code over the title
   painting. The buttons stay code-drawn. **You approve it.**
3. **End card art:** the finale's last shot, painted: the Gift Shop, Dana holding the "I ESCAPED"
   mug, human Reginald mid-grievance, Kyle unbothered, Mordecai appalled, and the phylactery in the
   bargain bin with a $1 sticker, faintly glowing (this covers the "phylactery in the bargain bin"
   note without a new game flag). "THE END?" and the music credit stay code-drawn over it.
   **You approve it.**
4. **Loading.** A short loading screen loads what's needed to play: the art, the sound effects and
   the title track (about 3.4 MB). It shows the skull logo and a progress bar in the tray's purple,
   with a rotating Employee Handbook line if it lasts long enough to read one (lines marked
   `// DRAFT:`). The three room tracks download **in the background** once the title is up; a room
   whose track hasn't arrived yet fades its music in when it does. Gameplay never waits for music.
5. **Music at 64 kbps**, if it passes your ears: the title track re-encoded first for you to compare
   with today's 96 kbps; the rest only if it sounds the same (about 8.4 MB down to about 5.6 MB).
6. **Interface to match the tray.** Code only, no new images: the ☰ button, the menus, the
   dialogue options panel, the hover caption and **the verb coin** get the tray's purple plastic
   look (colours, rounded corners, a darker inset, the yellow accent on hover). `?art=off` keeps
   today's look.
7. **A Credits panel** from a button on the title screen: who made what (ChatGPT for the art, Kevin
   MacLeod's music under CC BY 4.0 with the required credit lines, Kenney's CC0 effects), summarised
   from `CREDITS.md`. The end card keeps its music line.
8. **Size check.** Record the first load (size and time) on the deployed site in the slice notes;
   stay well under the 15 MB budget.
9. **Docs.** The README gets a screenshot of the painted Lair and an updated feature list. The
   design doc's "Notes for later" becomes a short list of candidates for whatever comes after M4.
   M4 itself closes with slice 27.

Out of scope: the walk animation (slice 27), voice, new content, planning what comes after M4 (a
separate session once M4 has been played).

## Approvals you'll be asked for

1. The title painting, the logo and the end card painting. 2. The 64 kbps title track, by ear.
3. The loading screen, restyled interface and Credits panel in screenshots. 4. Developer play-test.

## Acceptance checks

- `npm test`, typecheck, build, Playwright green (the e2e harness finds buttons and options by their
  text; update `e2e/game.ts` if the panels' or the coin's structure changes).
- Unit tests: the music that loads in the background is still listed and credited; the loading
  screen's Handbook lines quote only sections in the Handbook master list.
- Agent play-test (headless screenshots): loading screen to title, Credits, a full play-through to
  the end card, a room entered before its track has loaded (music fades in late), `?art=off`.
- First-load size and time on the deployed site, recorded in the slice notes.

## Notes

- Branch `slice-26-key-art`, from `main` (slices 22–25 merged).
