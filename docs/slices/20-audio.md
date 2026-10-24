# Slice 20 — Audio: the system, the Lair's music, the sound effects

**Status:** done, merged in [#20](https://github.com/ratteler50/escape-from-the-escape-room/pull/20), 2026-10-22 · **Milestone:** M4

## Why

The game is silent. M4's audio plan (`docs/milestones.md`, M4 plan) proves audio on the Lair first, like
the art: the system, the title and Lair music, and the whole sound-effects set, so slices 22–23 only
add their rooms' music.

## Spec

1. **Picking the audio** (the agent can't hear):
   - **Music:** the agent shortlists 3–4 candidates each for the **title** and the **Lair**, from
     libraries whose licenses allow a public web game: CC0 (OpenGameArt) or CC-BY (Kevin MacLeod's
     incompetech.com, which has the comic-spooky style). Each with a link to listen, its length, its
     license, and why it fits. **You pick by ear.**
   - **Sound effects:** 15, CC0 only, mostly from Kenney's packs (Interface Sounds, Impact Sounds, RPG
     Audio). The agent picks these (short, generic sounds); you can veto any while play-testing.
   - One batch of downloads (**your approval**, with files, sources and sizes listed).
2. **The sound effects** and when they play:

   | Sound | Plays when |
   |-------|-----------|
   | `click` | any button (menus, title, dialogue options) |
   | `coin` | the verb coin opens |
   | `select` | an inventory item is picked up to use |
   | `pickup` | an item is added to the inventory |
   | `fail` | a generic "that doesn't work" fallback line |
   | `door` | changing rooms |
   | `bones` | taking Gary's arm |
   | `squelch` | gumming the arm |
   | `keys` | fishing the key out of the grate |
   | `latch` | opening the display case |
   | `keypad` | entering the code |
   | `unlock` | the Lair door unlocks |
   | `arise` | Reginald's "ARISE!" (an organ sting) |
   | `till` | buying the mug |
   | `rumble` | the curse lifting |

   The first six are the view's: it plays them for UI actions and for effects it already sees
   (`addItem`, `goToRoom`). The rest are **content**: a new presentation-only effect,
   `{ type: 'sound', sound: 'bones' }`, placed in the content where the moment happens (the core
   passes it through, like `walk` and `pause`). Content validation checks every sound named in
   content exists.
3. **Music:** a room names its music track (`music: 'lair'`); the title screen plays the title track.
   Changing rooms **crossfades** (about 1 s). Rooms without a track yet (Gift Shop, Break Room until
   22–23) keep the current track playing. Tracks loop.
4. **Browsers block sound until the player clicks**, so music starts on the title screen's first click
   (any click, not only a button). Until then, nothing plays and nothing errors.
5. **Settings** (the existing ☰ → Settings panel, and from the title screen): Music volume and
   Effects volume (0–100 in steps of 10, default 70 / 80) and a Mute toggle; **M** toggles mute.
   Saved with the other settings (not part of a save file).
6. **Files and budget:** OGG Vorbis with an MP3 fallback (Safari), converted with `ffmpeg`;
   music at ~96 kbps, effects trimmed and normalised. Everything in `public/assets/audio/`, every
   file in `CREDITS.md` (the coverage test already enforces it). The 15 MB budget still holds
   (estimate: ~5 MB of music, under 1 MB of effects).
7. **CC-BY attribution:** CC-BY music needs credit where players can see it, so the end card gets a
   small "Music: …" line, besides `CREDITS.md`.

Out of scope: Gift Shop and Break Room music (22–23), the finale sting (23), footsteps and ambient
loops, voice.

## Approvals you'll be asked for

1. The title and Lair tracks, from the shortlists.
2. One batch of downloads.
3. Play-testing with sound on (vetoes welcome).

## Acceptance checks

- Unit tests: `sound` effects pass through the core unchanged; content validation rejects an unknown
  sound name and an unknown room track; the settings round-trip (volumes clamp to 0–100, bad saved
  values fall back to the defaults); asset tests find every sound and track file.
- `npm test`, typecheck, build, Playwright all green, with no console errors from audio in headless
  Chromium.
- Agent play-test (it can't hear, so it checks the audio state in the browser: which track is
  playing, volumes, mute, each effect firing at its moment): title → Lair crossfade, effects through
  the whole puzzle chain, mute and volumes saved across a reload.
- Developer play-test, with sound.

## Notes

- Branch `slice-20-audio`, from `main` (slices 18 and 19 are merged).

## Build notes

- **Music** (`docs/audio/music.md`): Netherworld Shanty on the title screen, Graveyard Shift in the
  Lair (the developer swapped from Sneaky Snitch: spookiest first, lighter rooms after). Sneaky
  Snitch, Scheming Weasel and Investigations are kept for the Gift Shop and Break Room.
- **Effects:** 14 from Kenney's CC0 packs (Interface, Impact, RPG Audio, Sci-fi), trimmed and
  normalised to −1 dB peak; `keypad` is four ticks, `till` is coins plus a bell. `arise` is the
  opening 8 s of Kevin MacLeod's recording of Bach's Toccata and Fugue in D Minor (CC BY), faded out.
- **MP3 only, not OGG + MP3:** every browser plays MP3, so one format halves the size (4.9 MB of
  audio: 4.7 MB of music, 0.2 MB of effects; 5.1 MB of assets in all, of the 15 MB budget). The small gap MP3 leaves at a loop point doesn't matter for
  these tracks, which end and start again rather than looping seamlessly.
- **`fail`** is played by the core, not the view: it's the one place that knows an item use had
  nothing written for it (the generic lines and a hotspot's own `itemFallback`).
- **Crossfades** run on the game's clock, not a scene's, so quitting to the title mid-fade can't
  leave a track playing. Effects are skipped during Skip ⏭.
- **Tests:** the Playwright play-through now checks every story and UI sound is asked for and the
  Lair's music is still playing at the end; the console-error test waits for the Lair's music.
- **Agent play-test** (headless, reading the audio state): locked and silent before any click;
  the title track starts on a click on nothing; title → Lair crossfade (0.51 / 0.19 at 400 ms, then
  the Lair alone at 0.70); M mutes and unmutes and is saved; Music − twice gives 0.50, saved, and
  still 0.50 on the title track after a reload.
- **Also in this PR:** the gum is now under the throne's armrest, not a cushion: the painted
  throne has no cushion (spotted in the developer's play-test).
