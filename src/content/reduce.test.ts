import { describe, expect, it } from 'vitest';
import type { Effect, Hotspot, HotspotVerbs, World } from '../core/types';
import { flavourBits } from './explore';
import { deadFlags, flagReads } from './reduce';
import { world } from './world';

// Slice 35: the always-winnable search merges states that differ only in flags that can no longer
// change what Dana can do (docs/slices/35-explorer-efficiency.md). These pin each rule down on toy
// worlds: one case it must reduce, and look-alikes it must leave alone.

const say = (text: string): Effect => ({ type: 'say', text });
const setFlag = (flag: string): Effect => ({ type: 'setFlag', flag });

/** The real world, with one extra hotspot in the Lair. */
function withHotspot(verbs: Partial<HotspotVerbs>): World {
  const room = world.rooms.lair!;
  const hotspot: Hotspot = {
    id: 'testThing',
    name: 'Test thing',
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    interactionPoint: room.entries.start!,
    verbs: { look: { responses: [{ effects: [say('A thing.')] }] }, ...verbs },
  };
  return { ...world, rooms: { ...world.rooms, lair: { ...room, hotspots: [...room.hotspots, hotspot] } } };
}

describe('say-once latches', () => {
  it('treat a flag that only stops its own line repeating as flavour', () => {
    const w = withHotspot({
      talk: { responses: [{ when: [{ notFlag: 'rang' }], effects: [say('Ding!'), setFlag('rang')] }, { effects: [say("It's rung out.")] }] },
    });
    expect(flavourBits(w).flags).toContain('rang');
  });

  it('keep a "latch" that something else reads', () => {
    const w = withHotspot({
      talk: { responses: [{ when: [{ notFlag: 'rang' }], effects: [say('Ding!'), setFlag('rang')] }, { effects: [say("It's rung out.")] }] },
      // The same flag also decides whether a verb is offered: it changes what Dana can do.
      take: { when: [{ flag: 'rang' }], responses: [{ effects: [say('Got the clapper.')] }] },
    });
    expect(flavourBits(w).flags).not.toContain('rang');
  });

  it('keep a flag that picks between responses that set other flags', () => {
    const w = withHotspot({
      talk: { responses: [{ when: [{ notFlag: 'rang' }], effects: [say('Ding!'), setFlag('rang'), setFlag('opened')] }, { effects: [say('Hm.')] }] },
      take: { when: [{ flag: 'opened' }], responses: [{ effects: [say('Open.')] }] },
    });
    expect(flavourBits(w).flags).not.toContain('rang');
  });
});

describe('verb labels', () => {
  // A label only changes a button's wording, never whether the verb is offered or what it does.
  it('treat a flag read only by a label as flavour', () => {
    const w = withHotspot({
      use: {
        label: [{ when: [{ flag: 'polished' }], text: 'Admire' }, { text: 'Polish' }],
        responses: [{ effects: [say('Shiny.'), setFlag('polished')] }],
      },
    });
    expect(flavourBits(w).flags).toContain('polished');
  });
});

describe('dead after a milestone', () => {
  // `unlocked` is a milestone: set by using the thing, cleared nowhere. `readIt` is set by taking it.
  const unlock = { use: { responses: [{ effects: [say('Click.'), setFlag('unlocked')] }] } };
  const read = (ws: Partial<HotspotVerbs>) => flagReads(withHotspot({ ...unlock, ...ws }));
  const dead = (ws: Partial<HotspotVerbs>, flags: Record<string, boolean>) => deadFlags(read(ws), flags).has('readIt');
  const takeSetsReadIt = { responses: [{ effects: [say('Read it.'), setFlag('readIt')] }] };

  it('treats a flag read only behind a response that always wins once a milestone is set as dead after it', () => {
    const talk = {
      responses: [
        { when: [{ flag: 'unlocked' }], effects: [say('Already open.')] },
        { when: [{ flag: 'readIt' }], effects: [say('Opening it.'), setFlag('opened')] },
        { effects: [say('No idea how.')] },
      ],
    };
    expect(read({ talk, take: takeSetsReadIt }).milestones).toContain('unlocked');
    expect(dead({ talk, take: takeSetsReadIt }, {})).toBe(false);
    expect(dead({ talk, take: takeSetsReadIt }, { unlocked: true })).toBe(true);
  });

  it('treats a flag read only alongside "not that milestone" as dead after it', () => {
    const talk = { when: [{ flag: 'readIt' }, { notFlag: 'unlocked' }], responses: [{ effects: [say('Hm.'), setFlag('opened')] }] };
    expect(dead({ talk, take: takeSetsReadIt }, {})).toBe(false);
    expect(dead({ talk, take: takeSetsReadIt }, { unlocked: true })).toBe(true);
  });

  it('keeps a flag whose "milestone" is cleared somewhere', () => {
    const talk = { when: [{ flag: 'readIt' }, { notFlag: 'unlocked' }], responses: [{ effects: [say('Hm.'), setFlag('opened')] }] };
    const take = { responses: [{ effects: [say('Locked again.'), setFlag('readIt'), { type: 'clearFlag', flag: 'unlocked' } as Effect] }] };
    expect(read({ talk, take }).milestones).not.toContain('unlocked');
    expect(dead({ talk, take }, { unlocked: true })).toBe(false);
  });

  it('keeps a flag that is also read somewhere the milestone does not rule out', () => {
    const talk = { when: [{ flag: 'readIt' }, { notFlag: 'unlocked' }], responses: [{ effects: [say('Hm.'), setFlag('opened')] }] };
    const take = { when: [{ flag: 'readIt' }], responses: [{ effects: [say('Again.'), setFlag('readIt'), setFlag('opened')] }] };
    expect(dead({ talk, take }, { unlocked: true })).toBe(false);
  });

  it('does not count an earlier response on a flag that can be cleared again', () => {
    const talk = {
      responses: [
        { when: [{ flag: 'lit' }], effects: [say('Too bright to read.')] },
        { when: [{ flag: 'readIt' }], effects: [say('Opening it.'), setFlag('opened')] },
        { effects: [say('No idea how.')] },
      ],
    };
    const take = { responses: [{ effects: [say('Read it.'), setFlag('readIt'), setFlag('lit')] }] };
    const look = { responses: [{ effects: [say('Lights off.'), { type: 'clearFlag', flag: 'lit' } as Effect] }] };
    expect(dead({ talk, take, look }, { lit: true, unlocked: true })).toBe(false);
  });

  it('does not count an earlier response that depends on an item: items come and go', () => {
    const talk = {
      responses: [
        { when: [{ has: 'handbook' }], effects: [say('Reading the Handbook.')] },
        { when: [{ flag: 'readIt' }], effects: [say('Opening it.'), setFlag('opened')] },
        { effects: [say('No idea how.')] },
      ],
    };
    expect(dead({ talk, take: takeSetsReadIt }, { unlocked: true })).toBe(false);
  });
});
