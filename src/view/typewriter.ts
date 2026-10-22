import type { TextSpeed } from './storage';

// Pure timing for typed-out lines, kept apart from Phaser so it can be unit tested.

/** Characters per second for each text speed setting. */
export const TYPING_SPEEDS: Record<TextSpeed, number> = { slow: 25, normal: 45, fast: 80 };

/** How many characters of a `length`-character line are visible `elapsedMs` after it started. */
export function charsShown(elapsedMs: number, speed: TextSpeed, length: number): number {
  return Math.min(length, Math.floor((elapsedMs * TYPING_SPEEDS[speed]) / 1000));
}

/** How long a `length`-character line takes to type out completely, in ms. */
export function typingTime(length: number, speed: TextSpeed): number {
  return Math.ceil((length * 1000) / TYPING_SPEEDS[speed]);
}
