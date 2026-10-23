import type { Character } from '../core/types';

const STANDING = 'assets/characters/dana.webp';

/**
 * Dana, the player. Their walk is slice 27's prototype: cutout `parts` for now are a stand-in cut
 * from the standing sprite (legs only, from the hips; the arms stay put) until the parts sheet
 * arrives (docs/art/prompts-walk.md). Coordinates are in the 145×400 sprite's pixels, feet at
 * (72.5, 400).
 */
export const dana: Character = {
  id: 'dana',
  name: 'Dana',
  color: '#ffe28a',
  sprites: { standing: STANDING },
  walk: {
    parts: {
      sheet: STANDING,
      parts: [
        { id: 'farLeg', role: 'thigh', side: 'far', crop: { x: 0, y: 200, width: 60, height: 200 }, pivot: { x: 40, y: 175 }, at: { x: -32.5, y: -225 } },
        { id: 'nearLeg', role: 'thigh', side: 'near', crop: { x: 58, y: 200, width: 87, height: 200 }, pivot: { x: 85, y: 175 }, at: { x: 12.5, y: -225 } },
        { id: 'body', role: 'body', crop: { x: 0, y: 0, width: 145, height: 238 }, pivot: { x: 72.5, y: 400 }, at: { x: 0, y: 0 } },
      ],
    },
  },
};
