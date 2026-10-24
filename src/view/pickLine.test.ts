import { describe, expect, it } from 'vitest';
import { pickLine } from './pickLine';

describe('pickLine', () => {
  it('picks by the random number', () => {
    expect(pickLine(4, undefined, () => 0)).toBe(0);
    expect(pickLine(4, undefined, () => 0.99)).toBe(3);
  });

  it('never repeats the last pick when there is a choice', () => {
    for (const r of [0, 0.3, 0.6, 0.99]) {
      for (let last = 0; last < 3; last++) expect(pickLine(3, last, () => r)).not.toBe(last);
    }
  });

  it('still reaches every other line after a repeat is skipped', () => {
    const picks = new Set([0, 0.34, 0.67, 0.99].map((r) => pickLine(4, 1, () => r)));
    expect([...picks].sort()).toEqual([0, 2, 3]);
  });

  it('returns the only line when there is one', () => {
    expect(pickLine(1, 0, () => 0.5)).toBe(0);
  });
});
