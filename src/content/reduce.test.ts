import { describe, expect, it } from 'vitest';
import { handle } from '../core/engine';
import type { Effect, GameState, Hotspot, HotspotVerbs, VerbSpec, World } from '../core/types';
import { explore, flavourBits, freeToggles, shortestSolution, stateKey } from './explore';
import { deadFlags, flagReads } from './reduce';
import { initialState, world } from './world';

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

  it('never treats a milestone as dead because of itself (the jammed door the cross-check caught)', () => {
    // `jammed` is only read as "not jammed": once set, that read can never pass, which is exactly
    // why its value matters.
    const talk = { responses: [{ effects: [say('Oops.'), setFlag('jammed')] }] };
    const take = { when: [{ notFlag: 'jammed' }], responses: [{ effects: [say('Through.'), setFlag('opened')] }] };
    expect(deadFlags(read({ talk, take }), { jammed: true, unlocked: true }).has('jammed')).toBe(false);
  });

  it('never drops a flag that rules out another, so two flags cannot cancel each other out', () => {
    // A read of both, each ruled out by the other once set: dropping both would make "both set"
    // look like "neither set", and the condition can only pass in the second.
    const talk = { responses: [{ effects: [say('One.'), setFlag('one')] }] };
    const look = { responses: [{ effects: [say('Two.'), setFlag('two')] }] };
    const take = { when: [{ notFlag: 'one' }, { notFlag: 'two' }], responses: [{ effects: [say('Neither yet.'), setFlag('opened')] }] };
    const dead = deadFlags(flagReads(withHotspot({ ...unlock, talk, look, take })), { one: true, two: true });
    expect(dead.has('one') || dead.has('two')).toBe(false);
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

describe('free toggles', () => {
  // A box in the Lair, with the coin inside to take only while it's open.
  const open = (extra: Effect[] = []) => [say('Creak.'), setFlag('boxOpen'), ...extra];
  const close = [say('Clunk.'), { type: 'clearFlag', flag: 'boxOpen' } as Effect];
  const takeCoin = { when: [{ flag: 'boxOpen' }, { lacks: 'coin' }], responses: [{ effects: [say('A coin.'), { type: 'addItem', itemId: 'coin' } as Effect] }] };
  const box = (use: VerbSpec) => {
    const w = withHotspot({ use, take: takeCoin });
    return { ...w, items: { ...w.items, coin: { id: 'coin', name: 'Coin', look: 'A coin.' } } };
  };
  const inLair: GameState = { ...initialState };
  const opened: GameState = { ...initialState, flags: { boxOpen: true } };

  it('finds a flag one step flips either way, with nothing else changing, in either setting', () => {
    const w = box({ responses: [{ when: [{ flag: 'boxOpen' }], effects: close }, { effects: open() }] });
    expect(freeToggles(w, inLair, flavourBits(w))).toEqual(new Set(['boxOpen']));
    expect(freeToggles(w, opened, flavourBits(w))).toEqual(new Set(['boxOpen']));
  });

  it('keeps a "toggle" that opens but can never close', () => {
    const w = box({ responses: [{ when: [{ flag: 'boxOpen' }], effects: [say('Stuck open.')] }, { effects: open() }] });
    expect(freeToggles(w, inLair, flavourBits(w)).size).toBe(0);
    expect(freeToggles(w, opened, flavourBits(w)).size).toBe(0);
  });

  it('keeps a toggle whose opening also hands over an item, until that is done', () => {
    const w = box({
      responses: [
        { when: [{ flag: 'boxOpen' }], effects: close },
        { when: [{ flag: 'gotKey' }], effects: open() },
        { effects: open([{ type: 'addItem', itemId: 'coin' }, setFlag('gotKey')]) },
      ],
    });
    expect(freeToggles(w, inLair, flavourBits(w)).size, 'the first opening gives the coin').toBe(0);
    expect(freeToggles(w, { ...inLair, flags: { gotKey: true } }, flavourBits(w))).toEqual(new Set(['boxOpen']));
  });

  // In the Gift Shop, with the Lair solved: Dana can walk back to the box and flip it.
  const inShop: GameState = { ...initialState, roomId: 'giftShop', flags: { lairDoorUnlocked: true, visitedGiftShop: true } };
  const toggling = { responses: [{ when: [{ flag: 'boxOpen' }], effects: close }, { effects: open() }] };
  /** The box world, with the Gift Shop's door back into the Lair changed. */
  const withLairDoor = (w: World, use: VerbSpec): World => {
    const shop = w.rooms.giftShop!;
    const hotspots = shop.hotspots.map((h) => (h.id === 'lairDoor' ? { ...h, verbs: { ...h.verbs, use } } : h));
    return { ...w, rooms: { ...w.rooms, giftShop: { ...shop, hotspots } } };
  };

  it('counts a toggle as free out of its room, when Dana can walk back, flip it and return', () => {
    const w = box(toggling);
    // (With the Lair solved, the display case is one too: the scroll is back, so it opens and closes.)
    expect(freeToggles(w, inShop, flavourBits(w))).toContain('boxOpen');
  });

  it('keeps a toggle in a room Dana can never return to', () => {
    const w = withLairDoor(box(toggling), { when: [{ flag: 'neverSet' }], responses: [{ effects: [say('Locked.')] }] });
    expect(freeToggles(w, inShop, flavourBits(w)).size).toBe(0);
  });

  it('keeps a toggle whose only way back sets something along the way', () => {
    const goBack: Effect[] = [say('Creak.'), setFlag('creaked'), { type: 'goToRoom', roomId: 'lair', entry: 'fromGiftShop' }];
    const w = withLairDoor(box(toggling), { label: 'Go through', responses: [{ effects: goBack }] });
    // `creaked` must matter, or it would be flavour and the trip would count as side-effect free.
    const lair = w.rooms.lair!;
    const reader = { ...lair.hotspots.at(-1)!, id: 'creakReader', verbs: { look: { responses: [{ effects: [say('Hm.')] }] }, talk: { when: [{ flag: 'creaked' }], responses: [{ effects: [say('It creaked.'), setFlag('heardCreak')] }] } } };
    const w2 = { ...w, rooms: { ...w.rooms, lair: { ...lair, hotspots: [...lair.hotspots, reader] } } };
    expect(freeToggles(w2, inShop, flavourBits(w2)).size).toBe(0);
  });

  it('still explores what a toggle offers out of its room, when something there reads it', () => {
    // A note in the Gift Shop that can only be taken while the box (in the Lair) is open.
    const w = box(toggling);
    const shop = w.rooms.giftShop!;
    const note: Hotspot = {
      id: 'note',
      name: 'Note',
      bounds: { x: 0, y: 0, width: 1, height: 1 },
      interactionPoint: shop.entries.fromLair!,
      verbs: { look: { responses: [{ effects: [say('A note.')] }] }, take: { when: [{ flag: 'boxOpen' }, { lacks: 'note' }], responses: [{ effects: [say('Got it.'), { type: 'addItem', itemId: 'note' }] }] } },
    };
    const w2: World = {
      ...w,
      items: { ...w.items, note: { id: 'note', name: 'Note', look: 'A note.' } },
      rooms: { ...w.rooms, giftShop: { ...shop, hotspots: [...shop.hotspots, note] } },
    };
    const result = explore(w2, initialState);
    expect([...result.explored.values()].some((e) => e.state.roomId === 'giftShop' && e.state.inventory.includes('note'))).toBe(true);
  });

  it('merges open and closed in the search, and still finds what only the open box offers', () => {
    const w = box({ responses: [{ when: [{ flag: 'boxOpen' }], effects: close }, { effects: open() }] });
    const result = explore(w, initialState);
    const flavour = flavourBits(w);
    // Room states before the end: mid-conversation, the box can't be flipped without leaving, which
    // isn't side-effect free; once won, nothing can be done at all.
    const keysIgnoringBox = [...result.explored.values()]
      .filter((e) => !e.state.conversation && !e.state.flags.won)
      .map((e) => stateKey({ ...e.state, flags: { ...e.state.flags, boxOpen: false } }, flavour));
    expect(new Set(keysIgnoringBox).size, 'no two explored room states differ only in the box').toBe(keysIgnoringBox.length);
    expect([...result.explored.values()].some((e) => e.state.inventory.includes('coin')), 'the coin is still reached').toBe(true);
  });
});

describe('the reduced search agrees with the explorer as it was', () => {
  /** Every state the old search found maps to one the new search explored, with the same verdict. */
  const disagreements = (w: World) => {
    const before = explore(w, initialState, { reduce: false });
    const after = explore(w, initialState);
    expect(before.capped || after.capped, 'both searches finish under the cap').toBe(false);
    const problems: string[] = [];
    for (const [key, { state }] of before.explored) {
      const reduced = after.keyOf(state);
      if (!after.explored.has(reduced)) problems.push(`not explored: ${reduced}`);
      else if (after.canWin.has(reduced) !== before.canWin.has(key)) problems.push(`can win: before ${before.canWin.has(key)}, after ${after.canWin.has(reduced)}: ${key}`);
    }
    return { problems, before, after };
  };

  it('on the real game', () => {
    const { problems, before, after } = disagreements(world);
    expect(problems.slice(0, 3)).toEqual([]);
    expect(after.explored.size).toBeLessThan(before.explored.size);
  });

  it('on a toy game with a dead end that only an open box leads to', () => {
    // With the box open, Dana can jam the Lair door for good: a dead end the search must still find.
    const lair = world.rooms.lair!;
    const jam: Hotspot = {
      id: 'testThing',
      name: 'Box',
      bounds: { x: 0, y: 0, width: 1, height: 1 },
      interactionPoint: lair.entries.start!,
      verbs: {
        look: { responses: [{ effects: [say('A box.')] }] },
        use: { responses: [{ when: [{ flag: 'boxOpen' }], effects: [say('Clunk.'), { type: 'clearFlag', flag: 'boxOpen' }] }, { effects: [say('Creak.'), setFlag('boxOpen')] }] },
        talk: { label: 'Jam the door with it', when: [{ flag: 'boxOpen' }], responses: [{ effects: [say('Oops.'), setFlag('jammed')] }] },
      },
    };
    const hotspots = lair.hotspots.map((h) => (h.id === 'door' ? { ...h, verbs: { ...h.verbs, use: { ...h.verbs.use!, when: [...(h.verbs.use!.when ?? []), { notFlag: 'jammed' }] } } } : h));
    const w: World = { ...world, rooms: { ...world.rooms, lair: { ...lair, hotspots: [...hotspots, jam] } } };
    const { problems, after } = disagreements(w);
    expect(problems.slice(0, 3)).toEqual([]);
    expect([...after.explored.keys()].some((k) => !after.canWin.has(k)), 'the reduced search still finds the dead end').toBe(true);
  });
});

describe('the shortest solution', () => {
  it('replays through the engine, every step allowed, to a win (slice 35: steps into merged states included)', () => {
    let state = initialState;
    for (const [i, command] of shortestSolution(world, initialState).entries()) {
      expect(() => (state = handle(world, state, command).state), `step ${i + 1}: ${JSON.stringify(command)}`).not.toThrow();
    }
    expect(state.flags.won).toBe(true);
  });
});
