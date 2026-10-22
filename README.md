# Escape From the Escape Room

A comedic point-and-click adventure in the spirit of Monkey Island, Day of the Tentacle, and
Detective Grimoire, built in the browser with TypeScript and Phaser 4.

Dana Pickwick, trainee at the Escape-O-Rama franchise, is trapped in the "Lich's Lair" room by a
very real curse, alongside Reginald, a ham actor who is now an actual lich. The only way out is to
beat an escape room that head office designed to be unbeatable.

It's also a learning project: built slice by slice with an AI coding agent, to practise agentic
design and implementation.

## Running it

Play the latest version at https://ratteler50.github.io/escape-from-the-escape-room/
(deployed from `main` on every merge).

To run it locally:

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit, content-validation, and architecture tests
npm run typecheck
npm run build
```

## How to play

Click the floor to walk. Click something to open the verb coin (👁 Look, ✋ Take, 💬 Talk, ⚙ Use).
Click an item in the inventory bar and choose "Use with…" to use it on something or combine it with
another item. During conversations, pick Dana's lines from the list; click to skip a line.

The goal: escape. The curse is very literal about how.

Stuck? Spoiler-light hints, one room at a time:

- **The Lich's Lair:** Reginald won't budge until somebody gives him his cue, and actors keep their
  scripts somewhere close. Something shiny is out of reach; Gary has arms to spare. And read what
  head office printed very, very literally.
- **The Gift Shop:** the ghost wants something done about the bargain bin. Kyle has the right tool,
  and the Employee Handbook has the right section.
- **The Break Room:** a customer can't be on the clock, and a mug costs exactly what it costs. Check
  the fridge, the vending machine, and your own lanyard.

## Where things are

- `docs/design.md`: the game, its puzzles, and the milestones
- `docs/decisions/`: why things are built the way they are
- `docs/slices/`: one spec per slice of work, with notes from building it
- `docs/glossary.md`: shared vocabulary
- `CLAUDE.md`: conventions for the agent
- `src/core/`: headless game logic (no Phaser), `src/content/`: the game's data,
  `src/view/`: the Phaser layer
