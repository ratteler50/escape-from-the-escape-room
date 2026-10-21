# 0002 — Headless core separate from the Phaser view

**Status:** accepted · 2026-10-21

## Context

Puzzle logic is where bugs hide (wrong flag, unreachable item, dead end). Testing it through a
rendered game is slow and flaky, for humans and agents alike.

## Decision

Split the code into:

- **Core** (`src/core/`): pure TypeScript with **no Phaser imports**. Owns game state, content
  types, and the rules engine. Takes commands, returns effects. Fully unit-tested, runs headless.
- **View** (`src/view/`): Phaser. Renders state, plays effects (walk, speak, animate), and turns
  input into commands. Contains no puzzle logic.

Same idea as keeping domain logic out of controllers in a backend service.

## Consequences

- Puzzle logic, content validity, and winnability are testable in milliseconds.
- The view stays thin; swapping art or even the rendering library doesn't touch puzzle logic.
- A lint/test check enforces that nothing in `src/core/` imports Phaser.
