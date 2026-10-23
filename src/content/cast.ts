import type { Character } from '../core/types';
import { line } from './dsl';
import type { ContentPack } from './pack';

// Everyone who speaks, and a short helper for each one's lines. Room and dialogue files import their
// characters from here, never from each other, so content files have no import cycles.

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

export const reginald: Character = {
  id: 'reginald',
  name: 'Reginald',
  color: '#b9f5a0',
  sprites: {
    standing: 'assets/characters/reginald.webp',
    seated: 'assets/characters/reginald-seated.webp',
    human: 'assets/characters/reginald-human.webp',
  },
  // Slice 27: ChatGPT walk sheets (docs/art/prompts-walk.md), cut and aligned like Dana's.
  walks: {
    standing: { sheet: 'assets/characters/reginald-walk.webp', frameWidth: 323, frameHeight: 534, frames: 6, fps: 10 },
    human: { sheet: 'assets/characters/reginald-human-walk.webp', frameWidth: 310, frameHeight: 543, frames: 6, fps: 10 },
  },
};

export const kyle: Character = {
  id: 'kyle',
  name: 'Kyle',
  color: '#f7a8d8',
  // Waist-up: drawn with the sprite's bottom edge on the painted counter top, so Kyle stands behind it.
  sprites: { standing: 'assets/characters/kyle.webp' },
};

export const mordecai: Character = {
  id: 'mordecai',
  name: 'Mordecai',
  color: '#a8e0f7',
  floats: true,
  // Rising out of his teapot's spout like a genie, pointing down at it (drawn see-through by the
  // view). His hotspots' bounds put the tip of his tail on the painted spout.
  sprites: { standing: 'assets/characters/mordecai.webp' },
};

/** A line said by Reginald. */
export const R = (text: string) => line(reginald.id, text);
/** A line said by Kyle. */
export const K = (text: string) => line(kyle.id, text);
/** A line said by Mordecai. */
export const M = (text: string) => line(mordecai.id, text);

export const castPack: ContentPack = { characters: [dana, reginald, kyle, mordecai] };
