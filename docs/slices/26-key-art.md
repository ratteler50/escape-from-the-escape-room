# Slice 26 — Key art, loading, polish

**Status:** built, agent play-tested · awaiting developer play-test · **Milestone:** M4 (slice 27, the walk animation, closes it)

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

## Build notes (code half)

- **Music stays at 96 kbps:** in a blind A/B of the title track's first minute, the developer
  preferred A (96 kbps) over B (64 kbps). The background loading makes the size matter far less.
- **Loading:** `LoadingScene` (first) loads all the art, the effects and the title track behind a
  tray-purple bar with Dana's Handbook lines (`src/content/loading.ts`; a test checks they only
  quote sections in the master list). `MusicLoaderScene` then loads the room tracks one at a time
  in room order (Lair first) while the game is played. Until a room's track arrives, the music
  already playing carries on (the title track, typically), then crossfades.
- **Play-test with slowed assets** (each image 150 ms, each effect 300 ms, each track 8–12 s): the
  title appeared after ~10 s; in the Lair the title music played for ~8 s, then the Lair's arrived
  and took over. A first version left the Lair silent until its track arrived, and loaded all three
  tracks at once (so the Lair's, needed first, finished last); both fixed.
- **Interface:** one theme in `ui.ts` (colours sampled from the tray) used by menus, buttons, the
  verb coin, the dialogue panel, the hover caption (now on a purple label) and the loading bar.
  `?art=off` keeps the old dark look.
- **Credits panel** on the title (Settings and Credits side by side): from `src/content/credits.ts`;
  a test checks it names every Kevin MacLeod track in `CREDITS.md`.
- **Key art** is being reviewed and fixed in its own session (Kyle and Dana came out swapped; the
  end card's Mordecai had two tails); the logo is approved.

## Build notes (key art and wrap-up)

- **Key art** reviewed and fixed in its own session (`docs/art/prompts-key-art.md`, "Outcome"):
  the logo first time; the title by an edit (Kyle and Dana had come out swapped); the end card by a
  revised prompt (Mordecai had two tails), finished by the agent: a PRICELESS starburst painted on
  the teapot, and the ESCAPE-O-RAMA banner's lettering painted out so the code writes THE END? on it
  (the developer chose that over removing the banner, after three mock-ups). Merged from
  `slice-26-key-art-files`.
- **Title:** the painting, the logo (drawn at half its stored size) in the dark wall, nudged left of
  the buttons so it clears Reginald's raised hand; the buttons over the throne, clear of Dana.
- **End card:** THE END? on the banner; the closing line, Play again and the music credit along the
  floor, outlined to read over the tiles.
- **README:** title and Lair screenshots (`docs/screenshots/`), a feature list, the H and M keys.
- **Assets:** 9.96 MB of the 15 MB budget; the first load is about 3.4 MB of it.
- Tests: 435 unit tests; Playwright (play-through to the painted end card, console errors, autosave)
  green.
- **Not done:** recording the first load on the deployed site, which can only happen after merge.
