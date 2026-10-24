# Escape From the Escape Room — Design

The game as it is now: its premise and cast, its rules, how it's played, and every puzzle. Kept
current: a slice that changes any of this updates it. How the game was planned and built, milestone
by milestone, is in `docs/milestones.md`; why things are built the way they are is in
`docs/decisions/`.

A comedic point-and-click adventure in the LucasArts / Detective Grimoire tradition, built as a
learning project for agentic design and implementation.

## Premise

Dana Pickwick, 19, is on their third weekend shift at **Escape-O-Rama**, a tacky fantasy-themed
escape room franchise. Their lanyard says TRAINEE. They have memorised the Employee Handbook and
nothing useful.

To cut costs, head office bought the room props from a dead wizard's estate sale. One "prop" — the
phylactery on a plinth by the Lich's Lair throne — is real. **Tonight** it woke up and bound the
room's puzzle script with genuine magic: the only way out is to actually **beat the escape room**.
Nobody ever has, because head office designed the puzzles and they are unsolvable as written.

**Escape-O-Rama is otherwise completely mundane.** Before tonight there was no magic anywhere: no
ghosts on the payroll, no curse procedures, nobody trapped. The comedy is ordinary retail life
colliding with one real curse. Content must not imply magic was normal before tonight.

The running theme: **the official solution never works; the improvised one does.**

### Tone

PG, absurdist, wordplay, light fourth-wall poking. Never mean-spirited, never grimdark.

### Cast

- **Dana Pickwick** — protagonist. Earnest, polite to absurdity (including to the undead), quotes
  the Employee Handbook constantly ("Section 4.2: Never touch the guests. It says nothing about
  liches.").
- **Reginald Vantablack-Thorne** — classically trained actor (once understudied a Hamlet) who plays
  the lich for minimum wage. The curse made him a *real* lich, and he regards this as a promotion.
  Refuses to break character, quotes his union contract. Obstacle and reluctant helper.
- **Gary** — a prop skeleton. Reginald considers him a member of the cast.
- **Kyle** — the Gift Shop cashier: a queer nonbinary femme (they/them), third summer at
  Escape-O-Rama, earbuds in, phone out, as few words as possible. "That's not my department." "I
  just work here." Assumes everything tonight (the lich, the ghost, the locked doors) is a new show
  feature head office forgot to mention. Follows till rules to the letter, because thinking is not
  in the job description. The straight man to the curse.
- **Mordecai the Moderately Powerful** — the dead wizard whose estate head office bought. The
  curse woke his ghost tonight; he floats around the Gift Shop, outraged that his possessions are
  "spooky décor" at markdown prices. Can't touch anything, can float through walls. Kyle thinks he's
  a hologram and talks over his monologues.

### The Employee Handbook

Dana quotes it constantly, and carries it (slice 29). Each section means one thing everywhere. All of
them, with the comment Dana makes reading each one out, are in **`docs/handbook.md`**, generated from
the one list in `src/content/handbookSections.ts`: add a new section there before quoting it
(`src/content/handbook.test.ts` fails on a section that isn't listed).

Reginald's **actors' union contract** is separate: section nine, the show does not stop until the
final cue; section twelve, wrongful loss of a role.

## Design rules

- **No deaths, no dead ends.** The game is always winnable from any reachable state. Enforced by an
  automated test over every reachable state (`src/content/winnable.test.ts`).
- Every hotspot and item has a funny look line, and every hotspot a line for the Employee Handbook.
  Comedy lives mostly in descriptions and dialogue.
- An item is never lost in a way that blocks progress; one may be taken away only with a line
  saying why.
- Content must not imply magic was normal before tonight (see Premise).

## Interaction

- **Verb coin** (decision 0004): click the floor to walk. Click a hotspot to open a small ring of
  verb icons beside it, showing only the verbs currently available there. Pick one; Dana walks over
  and does it. A hotspot with exactly one available verb skips the coin and does that verb directly.
- **Verbs:** 👁 Look, ✋ Take, 💬 Talk, ⚙ Use. A hotspot may give a verb a joke label ("Borrow a
  limb"); icons stay standard.
- **Items:** click an item in the inventory bar for its coin: Look, "Use with…" (then click a
  hotspot to use it there, or another item to combine them), and its own action if it has one
  (Read, Memorise). Using an item on a target is not a coin verb.
- **Accelerators:** right-click a hotspot or item = Look; hold H to see everything clickable (also a
  ☰ menu toggle); M mutes. Optional, never required.
- **No hidden gestures:** nothing may depend on right-click, hover, or the keyboard alone, so
  trackpads and touchscreens work. Hover labels are a nicety.
- **Visible walking character.** Straight-line movement clamped to a walkable polygon per room.
- **Branching dialogue trees:** conditional options, one-shot options, options that set flags.
- **Screens:** logical resolution 1280×720, scaled to fit. Text grows when the game is shrunk, to
  stay readable (slice 31). On a phone: played sideways, with fingertip-sized touch areas, fullscreen
  where allowed, and an installable home-screen app (slice 32).

## Rooms and puzzles

Three rooms in a line: **the Lich's Lair** ↔ **the Gift Shop** ↔ **the Break Room**. Dana starts in
the Lair with the Employee Handbook. The goal: the escape room's script ends when a guest escapes
**through the gift shop with a souvenir**, so Dana must leave the Lair, become a customer, and buy
the "I ESCAPED THE LICH'S LAIR" mug.

The always-winnable test prints the shortest solution (28 steps, `src/content/winnable.test.ts`);
this chart is what depends on what. Chart a new puzzle here before writing it.

### Puzzle dependency chart

```mermaid
graph TD
  START([Start in the Lair, with the Handbook and the lanyard]) --> COFFIN[Open the coffin, his dressing room:<br/>Dana knocks first, 'Go ahead, darling']
  COFFIN --> SCRIPT[/Reginald's Script, from its shelf/]
  SCRIPT -.->|hint| READ[Read it: MORTAL: 'Rise, foul creature...'<br/>LICH: 'ARISE!'. Margin: THEY NEVER SAY IT]
  SCRIPT --> MEMO[Memorise the line;<br/>the script goes back on its shelf]
  READ -.->|hint| MEMO
  START -.->|hint| THRONE[Look at the throne: pink gum<br/>under the armrest, by his elbow]
  THRONE -.->|hint| GUARD[Take it: 'Hands off the Spooky Seat!'<br/>Ask him to stand: 'a lich RISES, on his CUE']
  GUARD -.->|hint| CUE
  MEMO --> CUE{Talk to Reginald:<br/>give him his cue}
  CUE --> ARISE[He rises and takes his mark, in the dark;<br/>the throne and its gum are unguarded]
  ARISE --> GUM[/Pre-Owned Gum, from under the armrest/]
  START --> GARY[Borrow Gary's arm]
  GARY --> ARM[/Gary's Arm/]
  ARM --> STICKY((Combine))
  GUM --> STICKY
  STICKY --> STICKYARM[/Sticky Arm/]
  STICKYARM --> GRATE[Fish in the floor grate]
  GRATE --> KEY[/Display Case Key/]
  KEY --> CASE[Unlock the display case]
  CASE --> SCROLL[/Ancient Riddle Scroll:<br/>'THE ANSWER IS: CODE'/]
  SCROLL --> KEYPAD[Use it on the keypad: C-O-D-E<br/>or read it, then the keypad's 'Enter CODE']
  KEYPAD --> SHOP([The Gift Shop])
  SHOP -.->|hint| KYLE[Ask Kyle for a mug: 'Lanyard.'<br/>Staff can't buy merch]
  SHOP --> MORD{Talk to Mordecai:<br/>his teapot is in the bargain bin at $2}
  MORD --> BORROW{Handbook on Kyle:<br/>the revised Section 14 lets staff<br/>borrow equipment for re-pricing}
  BORROW --> GUN[/Price Gun/]
  GUN --> REPRICE[Price Gun on the bargain bin:<br/>the teapot is PRICELESS]
  REPRICE --> STAFF[Mordecai opens STAFF ONLY]
  STAFF --> BREAK([The Break Room])
  BREAK --> FRIDGE[Open the fridge,<br/>take the time card from under the yogurt]
  FRIDGE --> CLOCK[Time card on the time clock:<br/>OFF DUTY, the badge flipped]
  BREAK --> PRINT[Look at the lanyard: small print]
  PRINT --> NUMBER[Squint at it: 007]
  NUMBER --> LOCKER[Open the locker:<br/>Pay Packet, $12.98]
  BREAK --> VEND[Take the cent from<br/>the vending machine's coin return]
  LOCKER --> CASH((Combine))
  VEND --> CASH
  CASH --> EXACT[/Exact Change, $12.99/]
  KYLE -.->|hint| BUY
  CLOCK --> BUY{Buy the mug from Kyle, off duty,<br/>with exact change: ask, or hand it over}
  EXACT --> BUY
  BUY --> FINALE([The finale])
```

Solid arrows: needs. Dotted: a hint that points the way.

### The Lich's Lair

1. **The cue.** The coffin is Reginald's "dressing room", with a knocker and a gold star; opening it,
   Dana knocks first and he says go ahead. On its shelf, his dog-eared script, set out as a script:
   the cue is the MORTAL's line, "Rise, foul creature, and face me!", and the margin says THEY NEVER
   SAY IT. **Memorising** it (an item action) teaches Dana the line and they return the script, so
   what unlocks the dialogue option is what they *know*, not what they hold. Given the cue, he
   performs "ARISE!" and leaves the throne for his spotlight mark, which lights Gary instead.
2. **The sticky arm.** Gary's arm can be taken at any time (Reginald protests if he sees it). Pink
   gum is stuck under the throne's armrest, by Reginald's elbow: he won't let Dana near it while
   he's seated, and a lich doesn't stand, he *rises*, on his cue. Once he's risen, take it. Combine
   arm and gum.
3. **The floor grate.** The display case key fell through the grate. Fish it out with the sticky
   arm (which stays gummed to the grate).
4. **The misprinted riddle.** The display case holds the Ancient Riddle Scroll: *"THE ANSWER IS:
   {CODE}"*, head office's template, never filled in. The curse bound the script exactly as
   printed, so the code is literally **C-O-D-E** on the keypad's phone-style letter keys.

Look-only: the phylactery (whispering, cable-locked to its plinth) and the Customer Reviews board.
The coffin, the display case (once the scroll is back), and in the Break Room the fridge and locker
open and close again.

### The Gift Shop

1. **Mordecai's favour.** The ghost wants his teapot re-priced properly; in return he'll open any
   door. Re-pricing needs Kyle's price gun, and Section 14 forbids borrowing from other departments,
   until Dana shows Kyle the Handbook and finds the **revised** Section 14 stapled over it. Price
   gun on the bargain bin: PRICELESS. Mordecai floats through STAFF ONLY and opens it.
2. **The false exit.** The front door stands open, but the curse steps Dana back in: the script's
   guest buys a souvenir on the way out.
3. **The mug.** Kyle won't sell to staff ("Lanyard."), and takes only exact change: ask for it, or
   hand over the money.

### The Break Room

Three puzzles in any order:

1. **Clocking out.** The time card is in the fridge, under a yogurt used as a paperweight. Time card
   on the time clock: OFF DUTY, and Dana flips the badge. Legally a customer.
2. **The locker.** The combination is Dana's employee number. Looking at the lanyard finds small
   print under TRAINEE; squinting at it reads 007. Inside: the pay packet, $12.98.
3. **The cent.** One cent in the vending machine's coin return: take it. Combined with the pay packet:
   exact change, $12.99.

Reginald is heard here over the intercom, "directing".

### The finale

Off duty, with exact change, Dana buys the mug from Kyle. The script is satisfied and the curse
lifts. Reginald walks in from the Lair, human again, devastated to lose the role of a lifetime, and
files a union grievance. Gary stays one-armed. Reginald drops the phylactery into a box; Kyle prices
it at $1 for the bargain bin; Mordecai is appalled. Last line: the phylactery whispering from the
bargain bin. Then the end card, THE END?

## Technical approach

See `docs/decisions/` for the reasoning behind each choice.

- Browser, **TypeScript (strict) + Phaser 4**, Vite, Vitest, npm.
- **Headless core** (pure TS, no Phaser imports): state, content, rules engine. Fully unit-tested.
- **Phaser view**: renders state, plays animation and text, turns input into core commands.
- **Content as typed TypeScript data modules**, plus a content-validation test (every referenced id
  exists) and an always-winnable test.
