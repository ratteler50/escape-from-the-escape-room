# Slice 22 — The painted Gift Shop

**Status:** awaiting approval · **Milestone:** M4 · runs **in parallel** with slice 23

## Why

The Lair is finished (slices 18–21); the Gift Shop is still placeholder rectangles. This slice runs
the whole Lair pipeline on it: painting, characters, overlays, music. The finale happens here, so
its sting does too (moved from slice 23 so the two parallel slices don't share files).

## Spec

1. **Layout sketch** `docs/art/gift-shop-layout.svg` at exact hotspot coordinates: Lair door, mug
   rack, till (Kyle behind it), bargain bin (Mordecai's teapot), cardboard Reginald, STAFF ONLY,
   front door ("EXIT THROUGH THE GIFT SHOP"), and the finale's mark for Reginald (833, 425).
2. **Background:** ChatGPT, from a prompt pack (`docs/art/prompts-gift-shop.md`). Attached: the
   Lair painting (style and palette, so the rooms belong together), the layout sketch, and the icon
   sheet (so the painted mugs and price gun match their icons). Tacky franchise gift shop: harsh
   strip lights after the candlelit Lair, purple Escape-O-Rama branding, lich merch everywhere.
   **You approve it.** 1280×720 WebP; hotspot bounds and the walkable floor fitted to the painting.
3. **Characters** (flat colour, bold outlines, like Dana and Reginald):
   - **Kyle** (they/them, earbuds, phone, Escape-O-Rama polo, maximum indifference): model sheet,
     then a **waist-up** sprite placed so it stands behind the painted till;
   - **Mordecai the Moderately Powerful** (ghost wizard, outraged, translucent): model sheet, then a
     floating sprite, drawn slightly see-through, using the existing bob.
   **You approve the sheets, then the sprites in place.**
4. **Overlays:** STAFF ONLY open (`staffDoorOpen`); the teapot's PRICELESS sticker in the bargain
   bin (`teapotRepriced`).
5. **Music:** you pick the Gift Shop's track from the three kept for later rooms (Sneaky Snitch,
   Scheming Weasel, Investigations; `docs/audio/music.md`). Crossfades from the Lair as Dana enters.
6. **The finale sting** when the curse lifts: a short shortlist from Kevin MacLeod (CC BY), picked
   by ear; it ducks the music while it plays.
7. **Records:** `CREDITS.md`, prompts in `docs/art/`, validation and asset tests as for the Lair.

Out of scope: a phylactery-in-the-box overlay for the finale's last shot (the finale can't set a
flag after Reginald's walk; noted for slice 24), the ☰ button and panels (24).

## Files this slice owns (parallel with 23)

`src/content/giftShop.ts`, `kyle.ts`, `mordecai.ts`, `finale.ts`; `public/assets/rooms/gift-shop.webp`,
`characters/kyle*`, `characters/mordecai*`, `overlays/gift-shop-*`, `audio/music/gift-shop.mp3`,
`audio/sfx/finale.mp3`; `docs/art/gift-shop*`, `docs/art/prompts-gift-shop.md`.
Shared, append-only: `CREDITS.md` rows, one line each in `src/content/audio.ts`, `docs/audio/music.md`;
`docs/drafts.md` is regenerated. Whichever slice merges second rebases and regenerates the drafts.

## Approvals you'll be asked for

1. The background. 2. Kyle's and Mordecai's model sheets. 3. Sprites and overlays in place.
4. The music track and the finale sting. 5. One download batch.

## Acceptance checks

- `npm test`, typecheck, build, Playwright green (the play-through crosses the Gift Shop twice and
  ends in it).
- Agent play-test (headless screenshots): every Gift Shop hotspot clickable where painted, Kyle
  behind the till, Mordecai floating, STAFF ONLY opening, the teapot sticker, the finale with human
  Reginald walking to his mark, the music crossfade and the sting, `?art=off`.
- Developer play-test.

## Notes

- Branch `slice-22-gift-shop-art`, in its own worktree under `.claude/worktrees/`.
