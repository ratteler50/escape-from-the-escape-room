import { describe, expect, it } from 'vitest';
import { handbookSections as sections } from './handbookSections';
import { world } from './world';

// The loading screen's lines quote the Employee Handbook, so they may only quote sections in its
// master list (docs/design.md, "The Employee Handbook"), where each section means one thing.

describe('the loading screen lines', () => {
  it('has a few', () => {
    expect(world.loadingLines?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  for (const line of world.loadingLines ?? []) {
    it(`quotes a real Handbook section: "${line}"`, () => {
      const quoted = /^Handbook Section ([\d.]+):/.exec(line)?.[1];
      expect(quoted, 'each line starts "Handbook Section N:"').toBeDefined();
      expect([...sections], `section ${quoted} isn't in the Handbook master list in docs/design.md`).toContain(quoted);
    });
  }
});
