import type { Character } from '../core/types';

/**
 * Dana, the player. Their walk (slice 27) is a ChatGPT walk sheet (docs/art/prompts-walk.md), aligned
 * so the torso holds still and the feet sit on each cell's floor, with the far leg shaded darker
 * (scripts/shade-far-leg.py): the generators drew the same leg leading both steps.
 */
export const dana: Character = {
  id: 'dana',
  name: 'Dana',
  color: '#ffe28a',
  sprites: { standing: 'assets/characters/dana.webp' },
  walks: {
    standing: { sheet: 'assets/characters/dana-walk.webp', frameWidth: 221, frameHeight: 404, frames: 6, fps: 10 },
  },
};
