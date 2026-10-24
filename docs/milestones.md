# Milestones

How the game was planned and built, milestone by milestone: each plan as it was decided, oldest
first, with the slices that delivered it and their pull requests. This is a record, not a
description of the game: for the game as it is now, see `docs/design.md`. Each slice's own spec and
build notes are in `docs/slices/`.

## Goals

1. **Primary:** learn to reliably steer an agent to build features the developer understands.
2. **Secondary:** a short, genuinely funny game that is playable start to finish.

The game is the vehicle; scope stays honest because of goal 1.

## Scope

Three screens: **Lich's Lair**, **Gift Shop**, **Break Room**. A milestone is not started until
the previous one is playable. M4 was first planned as the last milestone (2026-10-23), and grew
three slices that day (28, a text pass and code cleanup; 29, hover polish and the Handbook as an
item; 30, a Handbook puzzle for Section 14). **M5, mobile and readability,** was added after it
(2026-10-24): the game mostly worked on a phone already, but its text didn't. With M5 the game was
complete (2026-10-24); **M6** is fixes from play-testing the finished game.

| Milestone | Content |
|-----------|---------|
| **M1 — vertical slice** ✅ playable (slices 1–6) | The Lair, fully playable start to finish: walking, hotspots, look text, inventory, one combination, one dialogue tree, a win state ("To be continued"). Ugly but complete. |
| **M2 — systems complete** ✅ (slices 7–12) | Room transitions (with a stub Gift Shop), deploy to GitHub Pages, save/load, cutscenes, browser end-to-end tests, polish. |
| **M3 — content** ✅ complete (slices 13–17) | Gift Shop and Break Room, full puzzle chain, ending. |
| **M4 — art and audio** ✅ complete (slices 18–30) | Painted backgrounds, character sprites, prop overlays, item icons, music and sound effects, a walk animation; then a text consistency pass and a content-code cleanup, hover polish, the Handbook as an item, and a Handbook puzzle for Section 14. No voice. |
| **M5 — mobile and readability** ✅ complete (slices 31–32) | One readable font, speech on dark bands, text that grows when the game is shrunk, deliberate line breaks for comic beats; then playable on a phone held sideways. |
| **M6 — play-test polish** (slice 33) | Clearer puzzles and verbs, from play-tests of the finished game. |

Art was placeholder shapes until M4, with the code keeping art swappable; M4 replaced them.

## M1 plan: the Lich's Lair

**Goal:** open the Lair door to the Gift Shop. The door has a keypad (eight phone-style letter keys
and ENTER, since slice 24); head office's official riddle is supposed to provide the code.

| Slice | Content | Merged |
|-------|---------|--------|
| 1 | Walking skeleton: a room, walking, hotspots, look lines | committed directly (before CI) |
| 2 | The verb coin and Take (decision 0004) | committed directly (before CI) |
| 3 | Inventory: use items on things, combine items | committed directly (before CI) |
| 4 | CI on GitHub | [#1](https://github.com/ratteler50/escape-from-the-escape-room/pull/1) |
| 5 | Reginald and dialogue trees | [#3](https://github.com/ratteler50/escape-from-the-escape-room/pull/3) |
| 6 | Finish the Lair (M1 playable) | [#4](https://github.com/ratteler50/escape-from-the-escape-room/pull/4) |

### M1 puzzle dependency chart

```mermaid
graph TD
  START([Start: Dana has Employee Handbook]) --> COFFIN[Search the coffin<br/>= Reginald's 'dressing room']
  COFFIN --> SCRIPT[/Item: Reginald's Script/]
  SCRIPT --> MEMO[Memorise the script<br/>Dana learns the cue, returns the script]
  MEMO --> CUE{Dialogue: feed Reginald<br/>his cue line}
  CUE --> ARISE[He performs 'ARISE!',<br/>leaves throne for his spotlight mark]
  ARISE --> GUM[/Item: Pre-Owned Gum<br/>from under the throne/]
  START --> GARY[Take Gary the skeleton's arm]
  GARY --> ARM[/Item: Gary's Arm/]
  ARM --> COMBINE((Combine))
  GUM --> COMBINE
  COMBINE --> STICKY[/Item: Sticky Arm/]
  STICKY --> GRATE[Fish in the floor grate]
  GRATE --> KEY[/Item: Display Case Key/]
  KEY --> CASE[Unlock the display case]
  CASE --> SCROLL[/Item: Ancient Riddle Scroll/]
  SCROLL --> KEYPAD[Use scroll on keypad]
  KEYPAD --> WIN([Door opens → 'To be continued'])
```

### Puzzles

1. **The cue line.** The coffin is Reginald's "dressing room"; inside is his dog-eared script.
   **Memorising** it (an item action) teaches Dana the cue and they return the script, so what
   unlocks the dialogue option is what they *know*, not what they hold. Feeding him the cue: he
   performs "ARISE!" and leaves the throne for his spotlight mark. If they talk to him holding the
   unread script, they muse that they'd need the cue by heart.
2. **The sticky arm.** Gary's arm can be taken at any time (Reginald protests if he sees it). Under
   the vacated throne: pre-owned chewing gum. Combine arm + gum.
3. **The floor grate.** The display case key fell through the grate. Fish it out with the sticky arm.
4. **The misprinted riddle.** The display case holds the Ancient Riddle Scroll, which reads
   *"THE ANSWER IS: {CODE}"*: head office's template, never filled in. The curse bound itself to
   the script *as printed*, so the code is literally **C-O-D-E** (slice 24; it used to read
   "[INSERT CODE HERE BEFORE PRINTING]"). Use the scroll on the keypad; the door opens.
   Showing the scroll to Reginald gets an outraged-on-behalf-of-the-craft reaction line.

### Reginald's dialogue tree

Four to six options: who are you; what's going on; can you let me out (he won't break character);
Handbook Section 4.2; plus the cue line, available only after reading the script. Some options are
one-shot, others repeatable.

### Look-only hotspots (hooks for later, as planned)

The phylactery (whispers; bolted down with corporate anti-theft cable; added in slice 13), the
intercom "hint button", the fog machine, the Customer Reviews board.

The fog machine and a Lair intercom were never built; the intercom went to the Break Room (slice 15).

## M2 plan

Decided in the M2 planning session (2026-10-21).

**Rooms.** Inventory, flags, and conversation history are global. Moving rooms is a `goToRoom
{ roomId, entry }` effect; each room has named entry points. Exits are hotspots with ⚙ "Go through".
An exit may take an item away, but only with a line explaining why (the always-winnable test guards
it). M2 adds a **stub Gift Shop**: placeholder screen, a few look-only hotspots, the door back to the
Lair, and a "CLOSED FOR REFURBISHMENT" front door that now carries the "To be continued…" win.

**Save/load.** Autosave whenever the game is at rest, plus **3 manual slots**. A ☰ menu button
(Save, Load, Settings, Quit to title); a title screen (Continue, New game, Load). Saving is allowed
whenever nothing is playing, including mid-conversation. Saves carry a format version and are
validated against current content on load; incompatible saves show a message instead of crashing.

**Cutscenes.** More effect types played by the existing speech queue: `walk`, `pause`, `face`. They
are presentation only: the core passes them through, game state stays flag-based. Reginald walks to
his mark; Dana walks out through exits. A parallel-actions effect can be added later if needed.

**Deploy.** GitHub Pages from the private repo: the game is public at a URL, the code isn't. (The
repo itself went public on 2026-10-23, with the MIT license, PR #29.)

**Browser tests.** Playwright against the production build: one full play-through following the
always-winnable test's shortest solution with real clicks, no console errors on load, and a save
round-trip. The dev hook is enabled in production by a `?e2e` URL flag.

**Polish.** Hover-label overlap fixes, text speed setting, hotspot highlight on hover, skip a whole
sequence, speaker name tags, cursor feedback over exits vs. things, and a **typewriter effect** for
lines (letters appear one by one at the text speed; the first click completes the line, the next
advances), so the text speed setting is visible rather than only changing auto-advance timing.

| Slice | Content | Merged |
|-------|---------|------|
| 7 | Rooms + stub Gift Shop; split `RoomScene` into smaller components | [#5](https://github.com/ratteler50/escape-from-the-escape-room/pull/5) |
| 8 | Deploy to GitHub Pages | [#6](https://github.com/ratteler50/escape-from-the-escape-room/pull/6) |
| 9 | Save/load, title screen, ☰ menu, text speed setting | [#7](https://github.com/ratteler50/escape-from-the-escape-room/pull/7) |
| 10 | Cutscenes + skip a whole sequence | [#8](https://github.com/ratteler50/escape-from-the-escape-room/pull/8) |
| 11 | Playwright end-to-end tests in CI | [#9](https://github.com/ratteler50/escape-from-the-escape-room/pull/9) |
| 12 | Polish: hover labels, highlight, name tags, cursor, typewriter text | [#10](https://github.com/ratteler50/escape-from-the-escape-room/pull/10) |

## M3 plan

Decided in the M3 planning session (2026-10-21).

**Goal: exit through the gift shop.** The escape room's script ends when a **guest** escapes and
buys a souvenir. Dana must buy the "I ESCAPED THE LICH'S LAIR" mug ($12.99), but they're **staff**:
Kyle won't sell merchandise to anyone wearing a lanyard. They have to clock out to legally become a
customer, and find the money. The front door is a false exit: "EXIT THROUGH THE GIFT SHOP. I haven't
bought anything. The curse is very literal."

**Rooms.** Lair ↔ Gift Shop ↔ Break Room, in a line. The Break Room is behind a STAFF ONLY door that
a trainee badge doesn't open. No new character in the Break Room: object puzzles plus office comedy
(fridge notes, lockers, vending machine), with Reginald heard over the intercom.

**Reginald** stays in the Lair during M3, heard on the intercom, and walks into the Gift Shop for
the finale (cutscene system). **Dialogue:** regular trees for Kyle and Mordecai; no mini-game.

### M3 puzzle dependency chart

```mermaid
graph TD
  ARRIVE([Dana enters the Gift Shop]) --> KYLE{Talk to Kyle:<br/>'Can't sell to staff'}
  ARRIVE --> MORD{Talk to Mordecai:<br/>furious his teapot is in the<br/>bargain bin at $2}
  MORD --> ASKGUN{Handbook on Kyle, after Mordecai:<br/>the revised §14 stapled over the old one,<br/>'staff may borrow equipment for re-pricing'}
  ASKGUN --> GUN[/Item: Price Gun/]
  GUN --> REPRICE[Use Price Gun on Bargain Bin<br/>→ teapot now 'PRICELESS']
  REPRICE --> STAFF[Mordecai floats through<br/>STAFF ONLY and opens it]
  STAFF --> BREAK([Break Room])
  BREAK --> FRIDGE[Fridge note: 'STOP using my yogurt<br/>as a paperweight' → Time Card under it]
  FRIDGE --> CLOCK[Use Time Card on Time Clock<br/>→ Dana is OFF DUTY: a guest]
  BREAK --> LANYARD[Look at Staff Lanyard<br/>→ employee number]
  LANYARD --> LOCKER[Locker combo = employee number<br/>→ Pay Packet: $12.98]
  BREAK --> VEND[Vending machine coin return<br/>→ One Cent]
  LOCKER --> COMBINE((Combine))
  VEND --> COMBINE
  COMBINE --> CASH[/Item: $12.99, exact/]
  CLOCK --> BUY{Buy the mug from Kyle}
  CASH --> BUY
  BUY --> FINALE([Finale])
```

Four puzzles: Mordecai's favour (via Kyle's price gun) opens STAFF ONLY; the time card and clocking
out; lanyard → locker → pay packet; the cent for exact change. The Break Room's three branches run
in parallel.

### Finale

Buying the mug satisfies the script and the curse lifts. Reginald walks in from the Lair and turns
back into a human actor: devastated to lose the role of a lifetime, he announces a union grievance.
Gary stays one-armed. Reginald knocks the phylactery into a box; Kyle prices it at $1 for the
bargain bin; Mordecai is appalled. Last shot: the phylactery whispering from the bargain bin.

### Art readiness

Each new room gets a layout reference sketch at its exact hotspot coordinates, with clear
silhouettes and empty wall space, ready for the art recipe in decision 0005.

| Slice | Content | Merged |
|-------|---------|------|
| 13 | This plan, decision 0005 (art style), premise fixes, the phylactery in the Lair | [#11](https://github.com/ratteler50/escape-from-the-escape-room/pull/11) |
| 14 | Gift Shop: Kyle, Mordecai, price gun, bargain bin, STAFF ONLY opens (no way through yet) | [#13](https://github.com/ratteler50/escape-from-the-escape-room/pull/13) |
| 15 | Break Room: fridge, time clock, lockers, vending machine, Reginald's intercom | [#12](https://github.com/ratteler50/escape-from-the-escape-room/pull/12) |
| 16 | Room-to-room wiring (STAFF ONLY ↔ Break Room), the front-door false exit, buying the mug, and the finale cutscene | [#14](https://github.com/ratteler50/escape-from-the-escape-room/pull/14) |
| 17 | Polish, plus the always-winnable test over the whole game | [#15](https://github.com/ratteler50/escape-from-the-escape-room/pull/15) |

Slices 14 and 15 own separate room files; both touch `world.ts` to register content, a small merge.

## M4 plan

Decided in the M4 planning session (2026-10-22). Style: decision 0005 (hand-painted cartoon, recipe
"A2" in `docs/prototypes/lair-art-style.md`).

**Order.** Prove the whole pipeline on the Lair (art, characters, overlays, audio, item icons:
slices 18–21), so the Lair is polished end to end, then repeat it for the Gift Shop and Break Room in
parallel (22–23), then key art and polish (24). Item icons were added on 2026-10-22: the first plan
left the inventory as text boxes. Slice 21 makes every item's icon at once, from one sheet, and a
styled inventory tray, so the Lair looks finished before the next room starts; the later rooms'
paintings take the icon sheet as a reference so props match their icons.

**Art pipeline.** A layout sketch at exact hotspot coordinates (`docs/art/`) plus a style reference
→ image generation → crop and scale to exact size → WebP in `public/assets/`. The Lair background
was made with Canva (folder "Escape-O-Rama assets"). From slice 19 on, the developer generates in
**ChatGPT** from prompt packs the agent writes (`docs/art/prompts-*.md`), and saves the results to
`art-inbox/` (git-ignored); the agent does everything after that. Canva's free plan allows only 20 AI
generations a month, which M4 can't fit (2026-10-22). The developer approves each image before it's
committed.

**Characters.** Flat colour with hard outlines over the painted rooms. One model sheet per character
(front and three-quarter, approved first), used as the reference for everything after. One standing
pose each, mirrored for direction; walking is a code-driven bounce and lean; a talking pose is a
stretch goal. One exception: **Reginald also gets a seated pose**, lounging on the throne until he
takes his mark (decided 2026-10-22). Sprites come with a transparent
background, or a flat chroma-green one keyed out locally with `ffmpeg`; WebP with alpha.

**Props that change.** Edit the room's background image for each changed state (same scene, one
change), crop the changed region, show it as an overlay by flag. Gary stays painted in, with an
overlay for the missing arm.

**Hotspots over art.** Invisible areas; hover shows the cursor, the name and a soft glow; holding H
or a ☰ menu toggle outlines everything clickable. `?art=off` brings back placeholder rectangles.

**Audio.** Music: CC0 or CC-BY library tracks, shortlisted by the agent (it can't hear), picked by the
developer by ear: a title track, one loop per room, a finale sting. Sound effects: 12–15, CC0 only
(Kenney, Freesound CC0). Music and effects volume plus mute in Settings, saved; music starts on the
title screen's first click; crossfades between rooms.

**Rules.** The game is public on GitHub Pages, so every asset's license must allow public web use.
`CREDITS.md` lists every asset (tool and prompt for generated art); a test checks coverage. Assets
are plain files in the repo with a **15 MB** budget, enforced by a test.

| Slice | Content | Merged |
|-------|---------|------|
| 18 | Art system (room backgrounds, invisible hotspots, glow, show-clickable, `?art=off`); Lair background with the phylactery and a spotlight aimed at Gary; `CREDITS.md`; budget | [#16](https://github.com/ratteler50/escape-from-the-escape-room/pull/16) |
| 19 | Dana and Reginald model sheets and sprites (Reginald standing and seated); sprite rendering, mirroring, bounce-walk; Lair prop overlays | [#17](https://github.com/ratteler50/escape-from-the-escape-room/pull/17) |
| 20 | Audio system; Lair music; the sound-effects set | [#20](https://github.com/ratteler50/escape-from-the-escape-room/pull/20) |
| 21 | Item icons for all 13 items (one sheet); the branded Escape-O-Rama inventory tray; icon on the held item | [#21](https://github.com/ratteler50/escape-from-the-escape-room/pull/21) |
| 22 | Gift Shop: background (icon sheet attached, so painted props match), Kyle and Mordecai sprites, overlays, music, finale sting | [#22](https://github.com/ratteler50/escape-from-the-escape-room/pull/22) |
| 23 | Break Room: background (icon sheet attached), overlays, music (the finale sting moved to 22: the finale is in the Gift Shop) | [#23](https://github.com/ratteler50/escape-from-the-escape-room/pull/23) |
| 24 | Story fixes: the phone-letter keypad, the {CODE} scroll, the script's last page plants the ending's rule (text only) | [#25](https://github.com/ratteler50/escape-from-the-escape-room/pull/25) |
| 25 | The Lair's display case shows its state: lid open, the scroll's end under the bone (two overlays) | [#26](https://github.com/ratteler50/escape-from-the-escape-room/pull/26) |
| 26 | Title and end-card key art, a painted logo, background music loading, interface to match the tray, a Credits panel | [#28](https://github.com/ratteler50/escape-from-the-escape-room/pull/28) |
| 27 | Walk animation: prototype a Dana walk cycle two ways (ChatGPT frames, parts animated in code) first; then Reginald and Kyle, or stop and record why | [#31](https://github.com/ratteler50/escape-from-the-escape-room/pull/31), [#32](https://github.com/ratteler50/escape-from-the-escape-room/pull/32) |
| 28 | Text and structure: content-code cleanup so new rooms, dialogue and puzzles are easier to add (28a); every player-facing line checked for consistency and the jokes finished, no DRAFTs left (28b) | [#33](https://github.com/ratteler50/escape-from-the-escape-room/pull/33), [#34](https://github.com/ratteler50/escape-from-the-escape-room/pull/34), [#35](https://github.com/ratteler50/escape-from-the-escape-room/pull/35), [#36](https://github.com/ratteler50/escape-from-the-escape-room/pull/36) |
| 29 | Hover polish (label only over props, a fitted glow on characters); the Employee Handbook as an item Dana can read | [#37](https://github.com/ratteler50/escape-from-the-escape-room/pull/37) |
| 30 | Section 14 becomes a Handbook puzzle: use the Handbook on Kyle to borrow the price gun, with hints; M4 done | [#38](https://github.com/ratteler50/escape-from-the-escape-room/pull/38) |

### Notes for later (from play-tests, 2026-10-22)

Ideas from the M4 play-tests. All four were done: the first two in PR #22, the walk animation in
slice 27, the phylactery in the bargain bin in the finale (slice 22).

- **The front door's "CLOSED FOR REFURBISHMENT" sign doesn't hold up** (fixed in PR #22: a hanging OPEN/CLOSED sign). It faces into the shop,
  not out, and a closed shop wouldn't have a cashier on duty. Possible fix: a hanging OPEN/CLOSED
  sign showing CLOSED on the inside, because that's the side staff see while the shop is open. It
  explains the cashier, and Dana can be pedantic about it.
- **Dialogue still says the doors won't open** (fixed in PR #22). Kyle's option "the lich is real and the doors won't
  open" (`kyle.ts`) no longer fits a front door that stands open: the point is that Dana *can't
  leave* (the curse sends them back). Reword it, and check other lines for the same assumption.
- **A walk animation** for Dana (and Reginald and Kyle when they walk), instead of the code-driven
  hop and lean: scheduled as slice 27, prototype first (image generators drift between frames).
- **The phylactery in the bargain bin** for the finale's last shot (from slice 22's spec).

## M5 plan

Decided in the M5 planning session (2026-10-24). The game is drawn at 1280×720 and shrunk to fit,
so its text shrinks with it: on a phone held sideways (about 0.54×) the 22 px speech shows at about
12 px and names at 9 px; upright (about 0.30×) at 7 px. Courier, the default font, breaks up at
that size, and coloured text with a black outline gets muddy over the paintings.

**Font.** **Nunito** everywhere, bold for text and black for headings (picked from Fredoka, Baloo 2
and Nunito in mock-ups at phone size: the easiest to read; the cartoon personality comes from the
art and the painted logo). Bundled in `public/assets/fonts/` under the SIL Open Font License and
credited, never loaded from Google. Applies with `?art=off` too.

**Speech.** Over the speaker's head on a dark, slightly see-through band with rounded corners; the
speaker's name on it in their colour, the line in their colour. Each band sized to its text,
avoiding one-word last lines. (TV-style subtitles at the bottom were considered: they lose who's
talking and clash with the dialogue options panel.)

**Size.** When the game is shrunk, text grows to keep about **14 px** on screen (12 px for small
labels); at full size nothing changes. Speech bands get taller; the dialogue options panel grows,
and scrolls when a conversation has many options.

**Comic beats.** Line breaks can be written into a line, and the game keeps them whatever the font
(the developer noticed Courier happened to break "Dread Sovereign of the—" before "fine."). A pass
over the dialogue adds them at interruptions and pauses before punchlines, marked for review.

**Mobile.** Upright phones get a "turn your phone sideways" screen (no text size fixes 0.30×).
Small hotspots (the keypad: about 24 px on a phone) get bigger touch areas without changing the art.
A fullscreen option on Android; "Add to Home Screen" (a web-app manifest) for iPhone, where Safari
doesn't allow fullscreen. A Playwright run at a phone-sized landscape viewport with touch, and a
developer play-test on a real phone.

| Slice | Content | Merged |
|-------|---------|------|
| 31 | Readability: Nunito, speech bands, text that grows when shrunk, comic line breaks | [#40](https://github.com/ratteler50/escape-from-the-escape-room/pull/40) |
| 32 | Mobile: portrait screen, touch areas, fullscreen and home screen, phone Playwright run | [#41](https://github.com/ratteler50/escape-from-the-escape-room/pull/41) |

## After M5

**M6 — play-test polish** (slice 33): fixes from the developer's play-tests of the finished game.
See `docs/slices/33-playtest-fixes.md`.
