import type { Effect, VerbSpec } from '../core/types';

// Small helpers so content reads like a script rather than a data dump.

export const say = (text: string): Effect => ({ type: 'say', text });

/** A verb that always just says one line. */
export const says = (text: string, label?: string): VerbSpec => ({
  ...(label !== undefined && { label }),
  responses: [{ effects: [say(text)] }],
});
