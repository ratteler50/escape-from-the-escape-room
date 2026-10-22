import { describe, expect, it } from 'vitest';
import { TYPING_SPEEDS, charsShown, typingTime } from './typewriter';

describe('typewriter timing', () => {
  it('shows nothing at the start and everything once enough time has passed', () => {
    expect(charsShown(0, 'normal', 20)).toBe(0);
    expect(charsShown(10_000, 'normal', 20)).toBe(20);
  });

  it('types at the speed for the setting', () => {
    expect(charsShown(1000, 'slow', 500)).toBe(TYPING_SPEEDS.slow);
    expect(charsShown(1000, 'normal', 500)).toBe(TYPING_SPEEDS.normal);
    expect(charsShown(1000, 'fast', 500)).toBe(TYPING_SPEEDS.fast);
  });

  it('slow < normal < fast', () => {
    expect(TYPING_SPEEDS.slow).toBeLessThan(TYPING_SPEEDS.normal);
    expect(TYPING_SPEEDS.normal).toBeLessThan(TYPING_SPEEDS.fast);
  });

  it('typing time is how long a whole line takes to appear', () => {
    expect(typingTime(90, 'normal')).toBe(2000);
    expect(charsShown(typingTime(37, 'fast'), 'fast', 37)).toBe(37);
  });
});
