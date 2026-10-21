import type { GameState, World } from '../core/types';
import { lair, lairCombinations, lairItems } from './lair';

export const world: World = {
  rooms: {
    [lair.id]: lair,
  },
  items: Object.fromEntries(lairItems.map((item) => [item.id, item])),
  combinations: [...lairCombinations],
  fallbacks: {
    // DRAFT: no "the" before {item} or {target}: names like "Gary's Arm" and "Gary" don't take one.
    useItemOn: [
      '{item} on {target}? Bold. Wrong, but bold.',
      'I try {item} on {target}. {target} is unimpressed.',
      'Handbook Section 12: "Do not improvise with props." I think {item} on {target} counts.',
    ],
    combine: [
      "{a} and {b}? I'm a trainee, not a wizard.",
      "I hold {a} next to {b}. Nothing. They won't even make eye contact.",
    ],
  },
};

export const initialState: GameState = {
  roomId: lair.id,
  player: { x: 640, y: 560 },
  inventory: [],
  flags: {},
};
