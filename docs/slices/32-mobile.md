# Slice 32 — Mobile: sideways screen, touch areas, fullscreen, phone tests

**Status:** built, awaiting the developer's play-test on a real phone · **Milestone:** M5 (last slice)

## Why

Slice 31 made the text readable on a phone held sideways. What's left is everything around it: an
upright phone shrinks the game to about 0.30×, which no text size fixes; a few hotspots are smaller
than a fingertip once shrunk (the Lair keypad is 44×52, about 24 px on a phone); the browser's own
bars take a third of a sideways phone's height; and nothing tests the game on a touch screen.
Decisions from the M5 planning session, in `docs/design.md`, M5 plan.

## Spec

1. **Turn your phone sideways.** On a touch device held upright, the game is covered by a screen
   asking to turn it sideways: the Escape-O-Rama skull and a line from Dana ("Handbook Section 9:
   staff remain upright at all times. Phones don't have to. Please turn yours sideways."). The game
   pauses behind it (music too) and carries on where it was when the phone turns. A narrow desktop
   window isn't a phone: mouse-only devices never see it.
2. **Fingertip-sized touch areas.** On touch devices, any hotspot smaller than **88×88** (about
   48 px on a phone held sideways) gets an invisible touch area grown to at least that size around
   its centre. The real areas always win: a grown area only claims empty space, never part of a
   neighbour (the keypad's grows into the wall, not into the Customer Reviews board). The art and
   the hover glow don't change. A content test keeps the list (see the build notes). The ☰ button gets the same.
   Desktop is unchanged.
3. **Touch behaves like a tap, not a hover.** A tap does what a click does; nothing stays
   highlighted or captioned after it. No browser gestures get in the way: no pinch or double-tap
   zoom, no long-press menu or text selection, no pull-to-refresh. Holding an item and tapping a
   hotspot uses it (already works with a mouse). "Show clickable things" in ☰ is the touch
   version of holding H, as now.
4. **Fullscreen.** Where the browser allows it (Android Chrome, desktop), a **Fullscreen** button
   on the title screen and a Fullscreen on/off item in ☰. On a phone, going fullscreen also locks
   the screen sideways where the browser allows it. Where it isn't allowed (iPhone Safari), the
   option isn't shown.
5. **Home screen.** A web-app manifest and icons so "Add to Home Screen" (iPhone) or "Install app"
   (Android) gives the game its own icon and opens it without the browser's bars, sideways. The
   icon is the Escape-O-Rama skull, cut from the painted logo (no new art to generate). On an
   iPhone in Safari, the title screen shows one small line: "Tip: Share → Add to Home Screen plays
   full screen." Offline play is out of scope (no service worker).
6. **Phone Playwright run.** A second Playwright project at a phone held sideways (Pixel 7
   landscape, touch, Chromium) plays the same shortest solution with **taps**, and checks: the
   sideways screen shows when upright and the game resumes when turned back; the keypad's grown
   area takes a tap just outside the painted keypad. CI runs both projects.
7. **Records.** `CREDITS.md` (the icons), the manifest, build notes with phone screenshots, and the
   M5 milestone marked done in `docs/design.md` once the developer has played it on a real phone.

Out of scope: drag-to-scroll in dialogue options (the arrows stay, decided 2026-10-23), offline
play, an upright layout.

## Approvals you'll be asked for

1. The app icon (at home-screen size, on a light and a dark wallpaper).
2. The sideways screen (a screenshot at phone size).
3. Developer play-test **on a real phone**: during the build over the local network (`npm run dev
   -- --host`, or `.claude/launch.json` → `dev-phone`, then the Mac's address on the phone, same
   Wi-Fi), and "Add to Home Screen" on the
   deployed game after merge, since installing needs the HTTPS site.

## Acceptance checks

- `npm test`, typecheck, build, both Playwright projects green; `e2e/game.ts` taps instead of
  clicking when the device has touch.
- Unit tests: the touch-area rule (a small area grows to 88×88 around its centre; it's clipped so it
  never covers another hotspot; big areas are unchanged), and a content test listing every hotspot
  that gets a grown area.
- The manifest is valid (name, icons 192 and 512, `display: fullscreen`, `orientation: landscape`,
  relative `start_url` so it works under the GitHub Pages path) and every new file is in `CREDITS.md`
  and within the asset budget.
- Agent play-test at a phone-sized touch viewport in the browser pane: upright → sideways screen;
  sideways → tap through a room, the keypad by its grown area, a conversation, ☰ and Fullscreen.
- Developer play-test on a real phone.

## Notes

- Branch `slice-32-mobile`, from `main` after slice 31 (PR #40) merges.

## Build notes (2026-10-24)

- **Touch areas.** `src/view/touchArea.ts` is the rule, unit-tested: grow a hotspot's bounds around
  their centre to at least 88 each way, then cut back at any neighbour it doesn't already overlap,
  so the result always holds the original bounds and only claims empty space. `RoomView` gives a
  hotspot's shape that area as its Phaser **hit area** (the shape the input system tests taps
  against, separate from what's drawn), only on touch devices (`src/view/touch.ts`: the CSS media
  query `pointer: coarse`, so a laptop with a touch screen counts as a mouse device). Seven hotspots
  grow, more than the spec guessed: the Lair keypad, phylactery and floor grate (72 tall), Reginald
  in all three places (56–80 wide), and the Break Room intercom. `fingertip()` in `ui.ts` does the
  same for the ☰ button and the title's Fullscreen button.
- **Sideways screen** (`src/view/phone.ts`, styled in `index.html`): an HTML layer over the canvas
  rather than a Phaser scene, so it's there from the first frame, even while the game loads. It
  pauses the game loop (`game.pause()`) and the sound, and resumes them when the phone turns. Dana's
  line quotes a new **Handbook Section 19** (all attractions are to be enjoyed in landscape), added to
  the master list in `docs/design.md`. The skull is the app icon, tilting sideways on a loop.
- **Gestures.** `index.html`: no zoom (viewport tag), and `touch-action: none`, no text selection,
  no long-press callout, no pull-to-refresh (`overscroll-behavior`) on the page.
- **Fullscreen** where `scale.fullscreen.available` (Phaser's check for the Fullscreen API): a
  button at the title screen's top right and an item in ☰ (it closes the menu, because the switch
  takes a moment). One catch: on a touch screen a browser allows fullscreen only when a finger
  *lifts* (a touch starting isn't a "user gesture"), and the game's buttons act when pressed, so
  `toggleFullscreen` waits for the next pointer-up. On a phone it also locks the screen sideways
  (Android Chrome allows it once fullscreen).
- **Home screen.** `public/manifest.webmanifest` (fullscreen, landscape, relative paths for the
  GitHub Pages folder) and Apple's tags in `index.html`. Icons in `public/assets/app/`: the skull from
  the logo on the panel purple, kept inside the middle 80 % so round and squircle masks don't clip
  it. On an iPhone or iPad in Safari the title shows the Add to Home Screen tip instead of the
  Fullscreen button.
- **Playwright.** A `phone` project (Pixel 7 held sideways, 863×360, touch: the game at 0.5×) runs
  every test, tapping instead of clicking: `e2e/game.ts` asks Phaser's own hit test whether the
  target is on top at the tap point, since a finger doesn't hover first. `e2e/phone.spec.ts` checks
  the sideways screen (and that the game pauses and resumes) and a tap beside the keypad's art. The
  full play-through now runs twice, once per project, so CI's E2E job takes longer.

Agent play-test (headless Chromium as a Pixel 7, and with an iPhone's user agent and no
Fullscreen API): the sideways screen upright; the title with Fullscreen; tapping the floor walks
Dana; a tap beside the keypad opens its verb coin; a tap just outside the ☰ art opens the menu, with
Fullscreen in it; nothing stays highlighted after a tap; the iPhone title shows the tip. No console
errors. Not checked here, because a headless browser can't: real fullscreen, the orientation lock,
installing to the home screen, and how it all feels under a thumb. That's the real-phone play-test.

