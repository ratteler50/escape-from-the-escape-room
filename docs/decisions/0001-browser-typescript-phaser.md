# 0001 — Browser game in TypeScript + Phaser

**Status:** accepted · 2026-10-21

## Context

The project exists to practise agentic development. The agent must be able to write all the code
as text, run it, and verify it by actually playing it.

## Decision

Build for the browser with strict TypeScript and Phaser 4, bundled with Vite, tested with Vitest.

## Alternatives

- **Godot / Unity:** strong adventure-game engines, but much of the work happens in a visual editor
  and in scene files that agents edit poorly. The agent cannot close its own verification loop.
- **Plain HTML/CSS/JS:** viable for point-and-click, but means hand-rolling the scene, animation,
  and input systems Phaser provides.

## Consequences

- The agent can play-test in the built-in browser pane after every slice.
- The game is shareable as a URL.
- Developer learns Phaser concepts (scenes, game objects, tweens, input) instead of an editor.
