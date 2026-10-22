import type { CharacterId, Effect, VerbSpec } from '../core/types';

// Small helpers so content reads like a script rather than a data dump.

export const say = (text: string): Effect => ({ type: 'say', text });

/** A verb that always just says one line. */
export const says = (text: string, label?: string): VerbSpec => ({
  ...(label !== undefined && { label }),
  responses: [{ effects: [say(text)] }],
});

/** A line said by someone other than Dana. */
export const line = (speaker: CharacterId, text: string): Effect => ({ type: 'say', text, speaker });

export const setFlag = (flag: string): Effect => ({ type: 'setFlag', flag });

/** Cutscene step: someone walks so their feet end at (x, y). Presentation only. */
export const walk = (character: CharacterId, x: number, y: number): Effect => ({ type: 'walk', character, to: { x, y } });
