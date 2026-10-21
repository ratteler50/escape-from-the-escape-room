import type { GameState, World } from '../core/types';
import { garyArm, lair } from './lair';

export const world: World = {
  rooms: {
    [lair.id]: lair,
  },
  items: {
    [garyArm.id]: garyArm,
  },
};

export const initialState: GameState = {
  roomId: lair.id,
  player: { x: 640, y: 600 },
  inventory: [],
  flags: {},
};
