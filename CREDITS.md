# Credits

Every asset the game ships, with where it came from and the license that lets it be used. The game
is public on GitHub Pages, so every license here must allow public web use. A test
(`src/content/assets.test.ts`) fails if a file under `public/assets/` has no row.

Generated art lists the tool and the prompt (or the doc that holds it). Library assets list the
author, license and a link.

| File | What | Source / tool | Author | License | Link or prompt |
|------|------|---------------|--------|---------|----------------|
| `assets/rooms/lair.webp` | The Lich's Lair background | Canva image generation (image-to-image), exported 1280×720, WebP via cwebp | Generated for this project | AI-generated for this game; subject to Canva's terms for generated content | Prompt and references: `docs/art/lair.md` |
| `assets/characters/dana.webp` | Dana, standing (cut from the model sheet) | ChatGPT image generation; background removed and sized by the agent, WebP via cwebp | Generated for this project | AI-generated for this game; subject to OpenAI's terms for generated content | Prompts: `docs/art/prompts-characters.md` |
| `assets/characters/reginald.webp` | Reginald, standing on his mark | ChatGPT image generation; background removed and sized by the agent, WebP via cwebp | Generated for this project | AI-generated for this game; subject to OpenAI's terms for generated content | Prompts: `docs/art/prompts-sprites.md` |
| `assets/characters/reginald-seated.webp` | Reginald, seated on the throne (cut from the model sheet) | ChatGPT image generation; background removed and sized by the agent, WebP via cwebp | Generated for this project | AI-generated for this game; subject to OpenAI's terms for generated content | Prompts: `docs/art/prompts-characters.md` |
| `assets/characters/reginald-human.webp` | Reginald, human again (the finale) | ChatGPT image generation; background removed and sized by the agent, WebP via cwebp | Generated for this project | AI-generated for this game; subject to OpenAI's terms for generated content | Prompts: `docs/art/prompts-sprites.md` |
| `assets/overlays/lair-gary-armless.webp` | Lair overlay: Gary without his arm | ChatGPT image edit of a crop of the Lair background; blended in with `scripts/make-overlay.py`, WebP via cwebp | Generated for this project | AI-generated for this game; subject to OpenAI's terms for generated content | Prompt: `docs/art/prompts-overlays.md` |
| `assets/overlays/lair-grate-arm.webp` | Lair overlay: Gary's arm gummed to the grate | ChatGPT image edit of a crop of the Lair background; blended in with `scripts/make-overlay.py`, WebP via cwebp | Generated for this project | AI-generated for this game; subject to OpenAI's terms for generated content | Prompt: `docs/art/prompts-overlays.md` |
| `assets/audio/sfx/click.mp3` | Button click | Interface Sounds: `click_002.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/coin.mp3` | Verb coin opens | Interface Sounds: `open_001.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/select.mp3` | Picking up an inventory item to use | Interface Sounds: `select_002.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/pickup.mp3` | An item goes into the inventory | RPG Audio: `handleSmallLeather.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/fail.mp3` | An item use that doesn't work | Interface Sounds: `error_004.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/door.mp3` | Changing rooms | RPG Audio: `doorOpen_1.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/bones.mp3` | Taking Gary's arm | RPG Audio: `chop.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/squelch.mp3` | Gumming the arm | Sci-fi Sounds: `slime_000.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/keys.mp3` | Fishing the key out of the grate | RPG Audio: `handleCoins.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/latch.mp3` | Opening the display case | RPG Audio: `metalLatch.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/keypad.mp3` | Entering the code (four ticks) | Interface Sounds: `tick_002.ogg`, repeated; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/unlock.mp3` | The Lair door unlocks | Impact Sounds: `impactMetal_heavy_000.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/till.mp3` | Buying the mug | RPG Audio: `handleCoins2.ogg` + Impact Sounds: `impactBell_heavy_000.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/rumble.mp3` | The curse lifts | Sci-fi Sounds: `lowFrequency_explosion_000.ogg`; trimmed and normalised, MP3 via ffmpeg | Kenney (kenney.nl) | CC0 | https://kenney.nl/assets |
| `assets/audio/sfx/arise.mp3` | Reginald's "ARISE!" sting | "Toccata and Fugue in D Minor" (J. S. Bach), opening 8 s, faded; MP3 via ffmpeg | Kevin MacLeod (incompetech.com) | CC BY 4.0 | "Toccata and Fugue in D Minor" Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/ |
| `assets/audio/music/title.mp3` | Title screen music | "Netherworld Shanty", re-encoded at 96 kbps | Kevin MacLeod (incompetech.com) | CC BY 4.0 | "Netherworld Shanty" Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/ |
| `assets/audio/music/lair.mp3` | The Lair's music | "Graveyard Shift", re-encoded at 96 kbps | Kevin MacLeod (incompetech.com) | CC BY 4.0 | "Graveyard Shift" Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/ |
