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

/**
 * A two-room toy game, small enough to search in milliseconds: a shed with a box (a coin inside, to
 * take while it's open) and a door to the yard, where a gate lets Dana out with the coin.
 */
function tinyWorld(parts: { box?: VerbSpec; back?: VerbSpec; shed?: Hotspot[]; yard?: Hotspot[]; gate?: VerbSpec } = {}): World {
  const floor = [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 200 }, { x: 0, y: 200 }];
  const at = { x: 100, y: 100 };
  const thing = (id: string, verbs: Partial<HotspotVerbs>): Hotspot => ({
    id,
    name: id,
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    interactionPoint: at,
    verbs: { look: { responses: [{ effects: [say(`A ${id}.`)] }] }, ...verbs },
  });
  const go = (roomId: string, entry: string): VerbSpec => ({ label: 'Go through', responses: [{ effects: [{ type: 'goToRoom', roomId, entry }] }] });
  return {
    items: { coin: { id: 'coin', name: 'Coin', look: 'A coin.' }, note: { id: 'note', name: 'Note', look: 'A note.' } },
    combinations: [],
    characters: { dana: { id: 'dana', name: 'Dana', color: '#ffffff' } },
    dialogues: {},
    fallbacks: { useItemOn: ['No.'], combine: ['No.'] },
    rooms: {
      shed: {
        id: 'shed',
        name: 'Shed',
        entries: { start: at, fromYard: at },
        walkable: floor,
        hotspots: [
          thing('box', {
            use: parts.box ?? toggling,
            take: { when: [{ flag: 'boxOpen' }, { lacks: 'coin' }], responses: [{ effects: [say('A coin.'), { type: 'addItem', itemId: 'coin' }] }] },
          }),
          thing('shedDoor', { use: go('yard', 'fromShed') }),
          ...(parts.shed ?? []),
        ],
      },
      yard: {
        id: 'yard',
        name: 'Yard',
        entries: { fromShed: at },
        walkable: floor,
        hotspots: [
          thing('yardDoor', { use: parts.back ?? go('shed', 'fromYard') }),
          thing('gate', { use: parts.gate ?? { when: [{ has: 'coin' }], responses: [{ effects: [say('Out!'), { type: 'win' }] }] } }),
          ...(parts.yard ?? []),
        ],
      },
    },
  };
}
const tinyStart: GameState = { roomId: 'shed', player: { x: 100, y: 100 }, inventory: [], flags: {}, conversation: null, spentOptions: [] };
const open = (extra: Effect[] = []) => [say('Creak.'), setFlag('boxOpen'), ...extra];
const close = [say('Clunk.'), { type: 'clearFlag', flag: 'boxOpen' } as Effect];
const toggling: VerbSpec = { responses: [{ when: [{ flag: 'boxOpen' }], effects: close }, { effects: open() }] };
const thingIn = (id: string, verbs: Partial<HotspotVerbs>): Hotspot => ({
  id,
  name: id,
  bounds: { x: 0, y: 0, width: 1, height: 1 },
  interactionPoint: { x: 100, y: 100 },
  verbs: { look: { responses: [{ effects: [say(`A ${id}.`)] }] }, ...verbs },
});

describe('free toggles', () => {
  const free = (w: World, s: GameState) => freeToggles(w, s, flavourBits(w));
  const opened: GameState = { ...tinyStart, flags: { boxOpen: true } };
  const inYard: GameState = { ...tinyStart, roomId: 'yard' };

  it('finds a flag one step flips either way, with nothing else changing, in either setting', () => {
    expect(free(tinyWorld(), tinyStart)).toEqual(new Set(['boxOpen']));
    expect(free(tinyWorld(), opened)).toEqual(new Set(['boxOpen']));
  });

  it('keeps a "toggle" that opens but can never close', () => {
    // Never cleared anywhere: not even a candidate.
    const w = tinyWorld({ box: { responses: [{ when: [{ flag: 'boxOpen' }], effects: [say('Stuck open.')] }, { effects: open() }] } });
    expect(free(w, tinyStart).size).toBe(0);
    expect(free(w, opened).size).toBe(0);
  });

  it('keeps a toggle that can close, but not yet (like the display case before the scroll is back)', () => {
    const w = tinyWorld({
      box: {
        responses: [
          { when: [{ flag: 'boxOpen' }, { flag: 'oiled' }], effects: close },
          { when: [{ flag: 'boxOpen' }], effects: [say('Stuck open.')] },
          { effects: open() },
        ],
      },
      yard: [thingIn('oilCan', { use: { responses: [{ effects: [say('Oiled.'), setFlag('oiled')] }] } })],
    });
    expect(free(w, tinyStart).size, 'it opens, but would stick').toBe(0);
    expect(free(w, opened).size).toBe(0);
    expect(free(w, { ...tinyStart, flags: { oiled: true } })).toEqual(new Set(['boxOpen']));
  });

  it('keeps a toggle whose opening also hands over an item, until that is done', () => {
    const w = tinyWorld({
      box: {
        responses: [
          { when: [{ flag: 'boxOpen' }], effects: close },
          { when: [{ flag: 'gotKey' }], effects: open() },
          { effects: open([{ type: 'addItem', itemId: 'note' }, setFlag('gotKey')]) },
        ],
      },
      yard: [thingIn('reader', { talk: { when: [{ flag: 'gotKey' }], responses: [{ effects: [say('Hm.'), setFlag('read')] }] } })],
    });
    expect(free(w, tinyStart).size, 'the first opening gives the note').toBe(0);
    expect(free(w, { ...tinyStart, flags: { gotKey: true } })).toEqual(new Set(['boxOpen']));
  });

  it('counts a toggle as free out of its room, when Dana can walk back, flip it and return', () => {
    expect(free(tinyWorld(), inYard)).toEqual(new Set(['boxOpen']));
  });

  it('keeps a toggle in a room Dana can never return to', () => {
    const w = tinyWorld({ back: { when: [{ flag: 'neverSet' }], responses: [{ effects: [say('Locked.')] }] } });
    expect(free(w, inYard).size).toBe(0);
  });

  it('keeps a toggle whose only way back sets something along the way', () => {
    // `creaked` must matter (something reads it), or it would be flavour and the trip side-effect free.
    const w = tinyWorld({
      back: { responses: [{ effects: [say('Creak.'), setFlag('creaked'), { type: 'goToRoom', roomId: 'shed', entry: 'fromYard' }] }] },
      shed: [thingIn('reader', { talk: { when: [{ flag: 'creaked' }], responses: [{ effects: [say('It creaked.'), setFlag('heardCreak')] }] } })],
    });
    expect(free(w, inYard).size).toBe(0);
  });

  it('still explores what a toggle offers out of its room, when something there reads it', () => {
    // A note in the yard that can only be taken while the box (in the shed) is open.
    const w = tinyWorld({ yard: [thingIn('noteBoard', { take: { when: [{ flag: 'boxOpen' }, { lacks: 'note' }], responses: [{ effects: [say('Got it.'), { type: 'addItem', itemId: 'note' }] }] } })] });
    const result = explore(w, tinyStart);
    expect([...result.explored.values()].some((e) => e.state.roomId === 'yard' && e.state.inventory.includes('note'))).toBe(true);
  });

  it('merges open and closed in the search, and still finds what only the open box offers', () => {
    const w = tinyWorld();
    const result = explore(w, tinyStart);
    const flavour = flavourBits(w);
    // Room states before the end: mid-conversation, the box can't be flipped without leaving, which
    // isn't side-effect free; once won, nothing can be done at all.
    const keysIgnoringBox = [...result.explored.values()]
      .filter((e) => !e.state.conversation && !e.state.flags.won)
      .map((e) => stateKey({ ...e.state, flags: { ...e.state.flags, boxOpen: false } }, flavour));
    expect(new Set(keysIgnoringBox).size, 'no two explored room states differ only in the box').toBe(keysIgnoringBox.length);
    expect([...result.explored.values()].some((e) => e.state.inventory.includes('coin')), 'the coin is still reached').toBe(true);
    expect(result.canWin.size).toBeGreaterThan(0);
  });
});

describe('the reduced search agrees with the explorer as it was', () => {
  /** Every state the old search found maps to one the new search explored, with the same verdict. */
  const disagreements = (w: World, start: GameState) => {
    const before = explore(w, start, { reduce: false });
    const after = explore(w, start);
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
    const { problems, before, after } = disagreements(world, initialState);
    expect(problems.slice(0, 3)).toEqual([]);
    expect(after.explored.size).toBeLessThan(before.explored.size);
  });

  it('on a toy game with a dead end that only an open box leads to', () => {
    // With the box open, Dana can jam the gate for good: a dead end the search must still find.
    const w = tinyWorld({
      shed: [thingIn('jam', { use: { label: 'Jam the gate', when: [{ flag: 'boxOpen' }], responses: [{ effects: [say('Oops.'), setFlag('jammed')] }] } })],
      gate: { when: [{ has: 'coin' }, { notFlag: 'jammed' }], responses: [{ effects: [say('Out!'), { type: 'win' }] }] },
    });
    const { problems, after } = disagreements(w, tinyStart);
    expect(problems.slice(0, 3)).toEqual([]);
    expect([...after.explored.keys()].some((k) => !after.canWin.has(k)), 'the reduced search still finds the dead end').toBe(true);
  });
});

// What the search merges in the real game: a list to notice when content changes it (slice 35).
// A change here isn't wrong by itself: check the new entry against the rule it was found by.
describe('what the search merges in this game', () => {
  const result = explore(world, initialState);

  it('lists the say-once latches', () => {
    const before = flavourBits(world, { slice35: false }).flags;
    expect([...flavourBits(world).flags].filter((f) => !before.has(f)).sort()).toEqual(['reginaldSawArm']);
  });

  it('lists the flags that stop mattering once a milestone is set', () => {
    const reads = flagReads(world);
    const canDie = [...reads.sites].filter(([, sites]) => sites.every((site) => site.length > 0)).map(([flag]) => flag);
    expect(canDie.sort()).toEqual(['heardTeapotComplaint', 'lookedAtVending', 'readScroll', 'sawGum']);
  });

  it('lists the free toggles', () => {
    expect([...result.toggles].sort()).toEqual(['caseOpen', 'coffinOpen', 'fridgeOpen', 'lockerOpen']);
  });

  // An early warning, well before STATE_CAP (50,000): about five times the size once slice 35's
  // rules were in (1,732 states). Tripping it means something now multiplies states: look at what
  // varies (docs/slices/35-explorer-efficiency.md, the options for later), don't just raise it.
  it('stays within the state budget', () => {
    expect(result.explored.size, 'over budget: find out what multiplies the states before raising this').toBeLessThan(9_000);
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
