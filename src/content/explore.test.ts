import { describe, expect, it } from 'vitest';
import { WON, type World } from '../core/types';
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
    expect(flavour.spentOptions, 'sets the flag the finale needs').not.toContain('kyle.buyMug');
    expect(flavour.spentOptions, 'sets the flag that lets the Handbook borrow the Price Gun').not.toContain('mordecai.teapot');
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

  it('treats a flag that only picks which line is said as flavour, and one that changes anything else as real (slice 33)', () => {
    const say = (text: string) => ({ type: 'say' as const, text });
    const room = world.rooms.lair!;
    const door = {
      id: 'testDoor',
      name: 'Test door',
      bounds: { x: 0, y: 0, width: 1, height: 1 },
      interactionPoint: room.entries.start!,
      verbs: {
        // Only picks the line: flavour.
        look: { responses: [{ when: [{ flag: 'tried' }], effects: [say('Locked, as I found out.')] }, { effects: [say('A door.')] }] },
        // Picks between lines, but one response also sets a flag: real.
        talk: { responses: [{ when: [{ flag: 'knocked' }], effects: [say('Hello again.')] }, { effects: [say('Hello?'), { type: 'setFlag' as const, flag: 'answered' }] }] },
        // Gates a verb: real, even though the verb only talks.
        take: { when: [{ flag: 'gate' }], responses: [{ effects: [say('Nope.')] }] },
        use: { responses: [{ effects: [say('It rattles.'), { type: 'setFlag' as const, flag: 'tried' }, { type: 'setFlag' as const, flag: 'knocked' }, { type: 'setFlag' as const, flag: 'gate' }] }] },
      },
    };
    const w: World = { ...world, rooms: { ...world.rooms, lair: { ...room, hotspots: [...room.hotspots, door] } } };
    const bits = flavourBits(w);
    expect(bits.flags).toContain('tried');
    expect(bits.flags).not.toContain('knocked');
    expect(bits.flags).not.toContain('gate');
  });

  it("never treats a flag that decides which dialogue options appear as flavour, even if they only talk", () => {
    const say = (text: string) => ({ type: 'say' as const, text });
    const w = {
      ...world,
      dialogues: {
        ...world.dialogues,
        test: {
          id: 'test',
          start: 'hub',
          greeting: [{ effects: [say('Hi.'), { type: 'setFlag', flag: 'knowsSecret' }] }],
          nodes: {
            hub: {
              options: [
                { id: 'secret', text: 'a', when: [{ flag: 'knowsSecret' }], effects: [say('x')], next: 'hub' },
                { id: 'bye', text: 'b', effects: [say('y')], next: 'end' },
              ],
            },
          },
        },
      },
    } as unknown as World;
    expect(flavourBits(w).flags).not.toContain('knowsSecret');
  });

  it('never treats a flag that a condition reads as flavour', () => {
    for (const flag of ['heardTeapotComplaint', 'danaOffDuty', 'staffDoorOpen', 'won']) expect(flavour.flags).not.toContain(flag);
  });

  it('ends every winning game holding only the Handbook, the lanyard (flipped to OFF DUTY) and the mug: used-up items leave', () => {
    const KEEPERS = ['handbook', 'offDutyLanyard', 'mug'];
    const result = explore(world, initialState);
    const leftovers = new Set(
      [...result.explored.values()].filter((e) => e.state.flags[WON]).flatMap((e) => e.state.inventory.filter((id) => !KEEPERS.includes(id))),
    );
    expect(
      [...leftovers],
      `These items can still be in the inventory at the end: remove each after its last use, with a line (docs/slices/17-polish.md)`,
    ).toEqual([]);
  });

  it('keeps the whole game well under the state cap, and the shortest solution ends with the sale', () => {
    const result = explore(world, initialState);
    expect(result.capped).toBe(false);
    const solution = shortestSolution(world, initialState);
    // Slice 33: handing Kyle the Exact Change buys the mug too, one step shorter than asking.
    expect([
      { type: 'chooseOption', optionId: 'sale' },
      { type: 'useItemOn', itemId: 'exactChange', hotspotId: 'kyle' },
    ]).toContainEqual(solution.at(-1));
  });
});
