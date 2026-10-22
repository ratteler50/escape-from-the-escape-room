# Slice 22 — The painted Gift Shop

**Status:** built, agent play-tested; developer play-test to come · **Milestone:** M4 · runs **in parallel** with slice 23

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

## Build notes

- **Background:** one ChatGPT generation from the layout sketch (redrawn in the Lair sketch's style,
  its notes group hidden in the copy attached) with the Lair as the style reference; approved as is.
  It came out 16:9, so nothing was cropped. Props drifted 10–80 px, and the front door is on the
  right-hand wall, standing open: bounds, interaction points, the floor polygon (now edge to edge from
  y≈450, rising to meet the right wall), both entries and the doorway walks were fitted to the
  painting. The EXIT THROUGH THE GIFT SHOP sign is over the Lair door, as its look line says.
- **Front door:** painted open, so its look and use lines were redrafted (the doorway steps Dana
  back into the shop; "the curse is very literal" kept).
- **Reginald's finale mark** moved from (833, 425), which fell on the wider cardboard cutout's base,
  to (878, 470), on the floor in front of the gap by STAFF ONLY.
- **Kyle:** the sheet's waist-up pose, cut straight from it, 115 px, its bottom edge on the counter.
- **Mordecai:** the sheet's pointing pose at 225 px, at 80% opacity (`RoomView`, for floating
  characters). The developer chose a genie look: the tip of his tail sits in the teapot's spout, so
  his dangling slipper was trimmed off (unreadable at this size anyway) and the painted sprite
  doesn't bob, which would lift his tail out of the spout; the `?art=off` placeholder still bobs.
- **Overlays:** STAFF ONLY open (`staffDoorOpen`) and the teapot's PRICELESS starburst sticker
  (`teapotRepriced`), each an edit of an enlarged crop. The first corridor beyond the door was
  generic; it was redone in the Break Room's materials (from slice 23's painting) with a glimpse of
  the room at its far end. The sticker is a sale starburst rather than a price-gun label: at the
  teapot's 70 px a real label would be a few pixels and the change easy to miss.
- **Music:** Local Forecast - Elevator (not one of the three kept): cheesy elevator muzak, a
  deliberately jarring drop from the Lair's Graveyard Shift. 2.2 MB at 96 kbps.
- **Finale sting:** Der Kleber Sting ("dun dun DUUUN"), 8 s, on Reginald's "Nooooo!". Picked
  provisionally: the developer wants to judge it in context. Stings duck the music to 25% over
  300 ms and bring it back when they end (`GameAudio`, `STINGS`).
- **Assets:** 8.2 MB of the 15 MB budget.
- **Outside the file list:** `e2e/game.spec.ts` now expects the game to end on the Gift Shop's
  music and the `finale` sound; `src/view/RoomView.ts` draws floating characters see-through and
  doesn't bob a painted one.
- **Agent play-test** (headless, real clicks through the shortest solution, screenshots every second
  or so): every Gift Shop hotspot on top at its painted spot in each state, holding H, the
  Lair → Gift Shop crossfade (0.43 at 600 ms, 0.70 by 1.4 s), the re-pricing with Mordecai floating
  off and STAFF ONLY opening, both overlays, the finale with human Reginald walking to his mark and
  the sting ducking the music (0.70 → 0.17 for its 8 s, then back), the end card, `?art=off`.
- **Noticed for slice 23:** the Break Room's painted door back to the Gift Shop is brown wood; this
  side of it is grey metal.
