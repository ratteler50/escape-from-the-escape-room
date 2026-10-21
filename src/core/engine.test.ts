import { describe, expect, it } from 'vitest';
import { handle } from './engine';
import type { GameState, World } from './types';

const world: World = {
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
          look: 'It is a lamp. It lamps.',
        },
      ],
    },
  },
};

const state: GameState = { roomId: 'testRoom', player: { x: 50, y: 50 } };

describe('handle: look', () => {
  it('says the hotspot look line', () => {
    const result = handle(world, state, { type: 'look', hotspotId: 'lamp' });
    expect(result.effects).toEqual([{ type: 'say', text: 'It is a lamp. It lamps.' }]);
  });

  it('does not change state', () => {
    const result = handle(world, state, { type: 'look', hotspotId: 'lamp' });
    expect(result.state).toEqual(state);
  });

  it('throws for a hotspot that is not in the current room', () => {
    expect(() => handle(world, state, { type: 'look', hotspotId: 'nope' })).toThrow(/nope/);
  });
});
