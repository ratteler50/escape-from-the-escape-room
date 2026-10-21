# 0004 — Verb coin instead of right-click to look

**Status:** accepted · 2026-10-21 · supersedes the "context clicks" interaction in the original design

## Context

Slice 1 used left-click to walk and right-click to look. Play-testing on a trackpad showed
right-click is awkward (two-finger tap or ctrl-click), and it doesn't exist on touchscreens. Look
can't be a second-class action: most of the comedy lives in look lines.

## Decision

- Clicking a hotspot opens a **verb coin**: a ring of icons for the verbs currently available on that
  hotspot (Look, Take, Talk, Use). Clicking one walks Dana over and performs it.
- A hotspot with exactly one available verb skips the coin.
- Right-click = Look stays as an optional accelerator.
- **The core decides which verbs are available** (`availableVerbs(state, hotspot)`), because
  availability changes with game state (no Take on Gary once his arm is gone). The view only draws
  what the core returns.
- Hotspots may override a verb's label for jokes; icons stay standard.

## Alternatives

- **One smart click** (Broken Age): fewest clicks, but no way to choose "just look".
- **Click-to-look, then an interact button:** tedious after the first read.
- **SCUMM verb bar:** most clicks, most screen space, mostly filler verbs.

## Consequences

- Two clicks per action instead of one; mitigated by the single-verb shortcut and right-click.
- Works on mouse, trackpad, and touch with no hidden gestures.
- Verb availability is part of game logic, so it's unit-testable and visible to the
  always-winnable test.
