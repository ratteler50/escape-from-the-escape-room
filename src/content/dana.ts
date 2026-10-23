import type { Character } from '../core/types';

/**
 * Dana, the player. Their walk is slice 27's prototype, two ways (docs/art/prompts-walk.md):
 * `frames` is ChatGPT's walk sheet, aligned so the torso holds still and the feet sit on each cell's
 * floor; `parts` is the paper-doll sheet, pinned at hips, knees and shoulders. Part coordinates are
 * in the scaled sheet's pixels (Dana stands 400 px tall in it), drawn back to front.
 */
export const dana: Character = {
  id: 'dana',
  name: 'Dana',
  color: '#ffe28a',
  sprites: { standing: 'assets/characters/dana.webp' },
  walk: {
    frames: { sheet: 'assets/characters/dana-walk.webp', frameWidth: 221, frameHeight: 404, frames: 6, fps: 10 },
    parts: {
      sheet: 'assets/characters/dana-parts.webp',
      parts: [
        { id: 'farArm', role: 'arm', side: 'far', crop: { x: 326, y: 50, width: 40, height: 146 }, pivot: { x: 342.1, y: 60.7 }, at: { x: 26.1, y: -299.3 } },
        { id: 'farThigh', role: 'thigh', side: 'far', crop: { x: 297, y: 205, width: 53, height: 127 }, pivot: { x: 326.8, y: 217.9 }, at: { x: 13.6, y: -231.4 } },
        { id: 'farShin', role: 'shin', side: 'far', crop: { x: 372, y: 207, width: 89, height: 146 }, pivot: { x: 392.1, y: 219.6 }, at: { x: -10.7, y: 98.2 }, parent: 'farThigh' },
        { id: 'nearThigh', role: 'thigh', side: 'near', crop: { x: 117, y: 203, width: 53, height: 125 }, pivot: { x: 147.1, y: 216.1 }, at: { x: -13.2, y: -231.4 } },
        { id: 'nearShin', role: 'shin', side: 'near', crop: { x: 198, y: 207, width: 86, height: 146 }, pivot: { x: 218.2, y: 219.6 }, at: { x: -11.4, y: 98.2 }, parent: 'nearThigh' },
        { id: 'body', role: 'body', crop: { x: 117, y: 8, width: 93, height: 186 }, pivot: { x: 166.8, y: 408.2 }, at: { x: 0.0, y: 0.0 } },
        { id: 'nearArm', role: 'arm', side: 'near', crop: { x: 248, y: 47, width: 42, height: 149 }, pivot: { x: 274.3, y: 58.9 }, at: { x: -38.2, y: -299.3 } },
      ],
    },
  },
};
