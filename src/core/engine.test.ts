import { describe, expect, it } from 'vitest';
import { availableVerbs, handle } from './engine';
import type { GameState, World } from './types';

const say = (text: string) => ({ type: 'say', text }) as const;

const world: World = {
  items: {
    bulb: { id: 'bulb', name: 'Light Bulb', look: 'A bulb. Bright idea.' },
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
        },
        {
          id: 'rug',
          name: 'Rug',
          bounds: { x: 40, y: 70, width: 40, height: 20 },
          interactionPoint: { x: 60, y: 80 },
          verbs: { look: { responses: [{ effects: [say('It really ties the room together.')] }] } },
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
