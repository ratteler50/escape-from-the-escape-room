import { describe, expect, it } from 'vitest';
import { SOUND_DEFAULTS, readVolume, stepVolume } from './storage';

describe('sound settings', () => {
  it('reads a saved volume, snapped to steps of 10 within 0-100', () => {
    expect(readVolume(40, 70)).toBe(40);
    expect(readVolume(0, 70)).toBe(0);
    expect(readVolume(43, 70)).toBe(40);
    expect(readVolume(250, 70)).toBe(100);
    expect(readVolume(-5, 70)).toBe(0);
  });

  it('falls back to the default for anything that is not a number', () => {
    expect(readVolume(undefined, SOUND_DEFAULTS.musicVolume)).toBe(70);
    expect(readVolume('loud', SOUND_DEFAULTS.effectsVolume)).toBe(80);
    expect(readVolume(Number.NaN, 70)).toBe(70);
    expect(readVolume(null, 70)).toBe(70);
  });

  it('steps up and down by 10 and stops at the ends', () => {
    expect(stepVolume(70, +1)).toBe(80);
    expect(stepVolume(70, -1)).toBe(60);
    expect(stepVolume(100, +1)).toBe(100);
    expect(stepVolume(0, -1)).toBe(0);
  });
});
