# Slice 26 — Key art, loading, polish: M4 done

**Status:** awaiting approval · **Milestone:** M4 (last slice)

## Why

Every room is painted, voiced with music and has its icons, but the game still opens on dark text
and ends on dark text. It also downloads 9.5 MB of art and audio with no sign of progress: on a slow
connection the title screen is a black page for a while. This slice gives the game a front and back
cover, makes the first load feel deliberate, matches the last plain bits of interface to the
Escape-O-Rama tray, and closes M4.

## Spec

1. **Title screen key art.** One ChatGPT painting (same style as the rooms; the character sheets,
   icon sheet and Lair attached): Dana in the foreground, earnest, lanyard on; Reginald looming
   behind in full ham pose; Gary, Kyle and Mordecai smaller; the Escape-O-Rama sign glowing over the
   Lair door. Space at the top for the title and in the middle for the buttons. **You approve it.**
   The title text and buttons stay code-drawn over it (so they stay sharp and editable).
2. **End card art.** The finale's last shot, painted: the Gift Shop, Dana holding the "I ESCAPED"
   mug, human Reginald mid-grievance, Kyle unbothered, Mordecai appalled, and the phylactery in the
   bargain bin with a $1 sticker, faintly glowing. That covers the "phylactery in the bargain bin"
   note without a new game flag. "THE END?" and the music credit stay code-drawn over it.
   **You approve it.**
3. **Loading screen.** Everything loads up front behind a short loading screen: the Escape-O-Rama
   skull, a progress bar in the tray's purple, and a rotating line from the Employee Handbook while
   it fills ("Handbook Section 1: Smile. Guests can hear a smile."). Room art and audio then load
   from the browser's cache, so changing rooms never waits. Lines marked `// DRAFT:`.
4. **Interface to match the tray.** Code only, no new images: the ☰ button, menus, the dialogue
   options panel and the hover caption use the tray's purple plastic look (colours, rounded corners,
   a darker inset, the yellow accent for hover). `?art=off` keeps today's look.
5. **Size pass.** Measure the first load on the deployed site (GitHub Pages) and record it. If the
   music dominates (it's most of the 9.5 MB), re-encode at a lower bitrate where it doesn't audibly
   hurt (you listen to before/after). Stay under the 15 MB budget with room to spare.
6. **M4 done.** README gets a screenshot of the painted Lair and an updated feature list; the design
   doc marks M4 ✅ and turns "Notes for later" into a short list of candidates for whatever comes
   next (the walk animation stays there: a bigger art job than this slice).

Out of scope: the walk animation (a later slice or milestone), voice, new content.

## Approvals you'll be asked for

1. The title painting. 2. The end card painting. 3. The loading screen and restyled interface in
   screenshots. 4. Any music re-encode (by ear). 5. Developer play-test.

## Acceptance checks

- `npm test`, typecheck, build, Playwright green (the e2e harness finds buttons and options by their
  text, which doesn't change; update `e2e/game.ts` if the panels' structure does).
- Agent play-test (headless screenshots): loading screen to title, a full play-through to the end
  card, `?art=off`.
- First-load size and time on the deployed site, recorded in the slice notes.

## Notes

- Branch `slice-26-key-art`, from `main` (slices 22–25 merged).
