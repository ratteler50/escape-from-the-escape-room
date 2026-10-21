import type { GameState, World } from '../core/types';
import { lair } from './lair';

export const world: World = {
  rooms: {
    [lair.id]: lair,
  },
};

export const initialState: GameState = {
  roomId: lair.id,
  player: { x: 640, y: 600 },
};
