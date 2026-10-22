import { describe, expect, it } from 'vitest';
import type { World } from '../core/types';
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

  it('keeps a say-only option distinct when it leads somewhere else', () => {
    // A once-only line into another node, and a once-only way out: spent or not changes where the
    // conversation can go, so merging those states could hide a dead end.
    const say = (text: string) => ({ type: 'say' as const, text });
    const w = {
      ...world,
      dialogues: {
        test: {
          id: 'test',
          start: 'hub',
          nodes: {
            hub: {
              options: [
                { id: 'loops', text: 'a', once: true, effects: [say('x')], next: 'hub' },
                { id: 'opensNode', text: 'b', once: true, effects: [say('y')], next: 'secret' },
                { id: 'onlyExit', text: 'c', once: true, effects: [say('z')], next: 'end' },
              ],
            },
            secret: { options: [{ id: 'back', text: 'd', next: 'hub' }] },
          },
        },
      },
    } as unknown as World;
    const bits = flavourBits(w);
    expect(bits.spentOptions).toContain('test.loops');
    expect(bits.spentOptions).not.toContain('test.opensNode');
    expect(bits.spentOptions).not.toContain('test.onlyExit');
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
