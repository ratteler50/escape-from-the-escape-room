import { describe, expect, it } from 'vitest';
import { availableVerbs, handle } from './engine';
import type { GameState, World } from './types';

const say = (text: string) => ({ type: 'say', text }) as const;

const world: World = {
  items: {
    bulb: { id: 'bulb', name: 'Light Bulb', look: 'A bulb. Bright idea.' },
    battery: { id: 'battery', name: 'Battery', look: 'Positively charged.' },
    torch: { id: 'torch', name: 'Torch', look: 'Let there be light.' },
  },
  combinations: [
    {
      items: ['bulb', 'battery'],
      responses: [
        {
          effects: [
            say('A torch!'),
            { type: 'removeItem', itemId: 'bulb' },
            { type: 'removeItem', itemId: 'battery' },
            { type: 'addItem', itemId: 'torch' },
          ],
        },
      ],
    },
  ],
  fallbacks: {
    useItemOn: ['No {item} on the {target}.', 'The {item} and the {target}? Never.'],
    combine: ['{a} and {b} do not mix.'],
  },
  rooms: {
    testRoom: {
      id: 'testRoom',
      name: 'Test Room',
      walkable: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      hotspots: [
        {
          id: 'lamp',
          name: 'Lamp',
          bounds: { x: 10, y: 10, width: 20, height: 40 },
          interactionPoint: { x: 20, y: 60 },
          verbs: {
            look: {
              responses: [
                { when: [{ flag: 'tookBulb' }], effects: [say('A lamp with no bulb. A sad lamp.')] },
                { effects: [say('It is a lamp. It lamps.')] },
              ],
            },
            take: {
              label: 'Unscrew the bulb',
              when: [{ notFlag: 'tookBulb' }],
              responses: [{ effects: [say('Got it.'), { type: 'addItem', itemId: 'bulb' }, { type: 'setFlag', flag: 'tookBulb' }] }],
            },
            talk: { responses: [{ effects: [say('The lamp is not chatty.')] }] },
          },
          itemUses: {
            bulb: [{ effects: [say('Screwed back in.'), { type: 'removeItem', itemId: 'bulb' }] }],
          },
        },
        {
          id: 'rug',
          name: 'Rug',
          bounds: { x: 40, y: 70, width: 40, height: 20 },
          interactionPoint: { x: 60, y: 80 },
          verbs: { look: { responses: [{ effects: [say('It really ties the room together.')] }] } },
          itemFallback: 'The rug rejects your offering.',
        },
      ],
    },
  },
};

const start: GameState = { roomId: 'testRoom', player: { x: 50, y: 50 }, inventory: [], flags: {} };

describe('availableVerbs', () => {
  it('lists declared verbs in coin order, with joke labels or default names', () => {
    expect(availableVerbs(world, start, 'lamp')).toEqual([
      { verb: 'look', label: 'Look' },
      { verb: 'take', label: 'Unscrew the bulb' },
      { verb: 'talk', label: 'Talk' },
    ]);
  });

  it('leaves out verbs whose conditions do not hold', () => {
    const tookBulb = { ...start, flags: { tookBulb: true } };
    expect(availableVerbs(world, tookBulb, 'lamp').map((v) => v.verb)).toEqual(['look', 'talk']);
  });

  it('returns just look for a look-only hotspot', () => {
    expect(availableVerbs(world, start, 'rug')).toEqual([{ verb: 'look', label: 'Look' }]);
  });
});

describe('handle: verb', () => {
  it('look says the hotspot look line and leaves state alone', () => {
    const result = handle(world, start, { type: 'verb', verb: 'look', hotspotId: 'rug' });
    expect(result.effects).toEqual([say('It really ties the room together.')]);
    expect(result.state).toEqual(start);
  });

  it('take adds the item, sets the flag, and returns every effect for the view', () => {
    const result = handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(result.effects).toEqual([
      say('Got it.'),
      { type: 'addItem', itemId: 'bulb' },
      { type: 'setFlag', flag: 'tookBulb' },
    ]);
    expect(result.state.inventory).toEqual(['bulb']);
    expect(result.state.flags).toEqual({ tookBulb: true });
  });

  it('does not mutate the state it was given', () => {
    handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(start).toEqual({ roomId: 'testRoom', player: { x: 50, y: 50 }, inventory: [], flags: {} });
  });

  it('after taking, take is gone and look uses the conditional response', () => {
    const { state } = handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(availableVerbs(world, state, 'lamp').map((v) => v.verb)).not.toContain('take');
    const look = handle(world, state, { type: 'verb', verb: 'look', hotspotId: 'lamp' });
    expect(look.effects).toEqual([say('A lamp with no bulb. A sad lamp.')]);
  });

  it('throws for a verb that is not currently available', () => {
    const { state } = handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(() => handle(world, state, { type: 'verb', verb: 'take', hotspotId: 'lamp' })).toThrow(/take.*lamp/);
    expect(() => handle(world, start, { type: 'verb', verb: 'use', hotspotId: 'rug' })).toThrow(/use.*rug/);
  });

  it('throws for a hotspot that is not in the current room', () => {
    expect(() => handle(world, start, { type: 'verb', verb: 'look', hotspotId: 'nope' })).toThrow(/nope/);
  });
});

describe('handle: items', () => {
  const holding = (...inventory: string[]): GameState => ({ ...start, inventory });

  it('lookItem says the item look line without changing state', () => {
    const state = holding('bulb');
    const result = handle(world, state, { type: 'lookItem', itemId: 'bulb' });
    expect(result.effects).toEqual([say('A bulb. Bright idea.')]);
    expect(result.state).toEqual(state);
  });

  it('useItemOn runs the matching item use', () => {
    const result = handle(world, holding('bulb'), { type: 'useItemOn', itemId: 'bulb', hotspotId: 'lamp' });
    expect(result.effects).toEqual([say('Screwed back in.'), { type: 'removeItem', itemId: 'bulb' }]);
    expect(result.state.inventory).toEqual([]);
  });

  it("useItemOn falls back to the hotspot's own line", () => {
    const result = handle(world, holding('bulb'), { type: 'useItemOn', itemId: 'bulb', hotspotId: 'rug' });
    expect(result.effects).toEqual([say('The rug rejects your offering.')]);
  });

  it('useItemOn falls back to a generic line with names filled in, the same one every time', () => {
    const command = { type: 'useItemOn', itemId: 'battery', hotspotId: 'lamp' } as const;
    const first = handle(world, holding('battery'), command).effects;
    expect(['No Battery on the Lamp.', 'The Battery and the Lamp? Never.']).toContain((first[0] as { text: string }).text);
    expect(handle(world, holding('battery'), command).effects).toEqual(first);
  });

  it('combine works in either order, removing the parts and adding the result', () => {
    for (const itemIds of [['bulb', 'battery'], ['battery', 'bulb']] as const) {
      const result = handle(world, holding('bulb', 'battery'), { type: 'combine', itemIds });
      expect(result.state.inventory).toEqual(['torch']);
      expect(result.effects[0]).toEqual(say('A torch!'));
    }
  });

  it('combine falls back to a generic line for an unlisted pair', () => {
    const result = handle(world, holding('torch', 'bulb'), { type: 'combine', itemIds: ['torch', 'bulb'] });
    expect(result.effects).toEqual([say('Torch and Light Bulb do not mix.')]);
    expect(result.state.inventory).toEqual(['torch', 'bulb']);
  });

  it('throws when using, looking at, or combining an item that is not held', () => {
    expect(() => handle(world, start, { type: 'lookItem', itemId: 'bulb' })).toThrow(/bulb/);
    expect(() => handle(world, start, { type: 'useItemOn', itemId: 'bulb', hotspotId: 'lamp' })).toThrow(/bulb/);
    expect(() => handle(world, holding('bulb'), { type: 'combine', itemIds: ['bulb', 'battery'] })).toThrow(/battery/);
  });

  it('throws when combining an item with itself', () => {
    expect(() => handle(world, holding('bulb'), { type: 'combine', itemIds: ['bulb', 'bulb'] })).toThrow(/itself/);
  });
});
