import { describe, expect, it } from 'vitest';
import { explore, flavourBits, shortestSolution } from './explore';
import { initialState, world } from './world';

// Exploration merges states that differ only in flavour bits (explore.ts, flavourBits). These pin the
// rule down on real content, so a change to it is a deliberate one.
describe('flavour bits', () => {
  const flavour = flavourBits(world);

  it('treats lines that are only heard once as flavour', () => {
    expect(flavour.spentOptions).toContain('reginald.who');
    expect(flavour.spentOptions).toContain('reginald.whatsGoingOn');
  });

  it('keeps options with real effects distinct', () => {
    expect(flavour.spentOptions, 'gives the Price Gun').not.toContain('kyle.priceGun');
    expect(flavour.spentOptions, 'sets a flag that unlocks Kyle\'s option').not.toContain('mordecai.teapot');
  });

  it('never treats a flag that a condition reads as flavour', () => {
    for (const flag of ['heardTeapot', 'offDuty', 'staffDoorOpen', 'won']) expect(flavour.flags).not.toContain(flag);
  });

  it('keeps the whole game well under the state cap, and the shortest solution ends with the sale', () => {
    const result = explore(world, initialState);
    expect(result.capped).toBe(false);
    const solution = shortestSolution(world, initialState);
    expect(solution.at(-1)).toEqual({ type: 'chooseOption', optionId: 'sale' });
  });
});
