import type { CharacterId, DialogueId, EntryId, Effect, FlagId, ItemId, RoomId, VerbSpec } from '../core/types';

// Small helpers so content reads like a script rather than a data dump. Content writes every effect
// through these (docs/adding-content.md).

export const say = (text: string): Effect => ({ type: 'say', text });

/** A verb that always just says one line. */
export const says = (text: string, label?: string): VerbSpec => ({
  ...(label !== undefined && { label }),
  responses: [{ effects: [say(text)] }],
});

/** A line said by someone other than Dana. */
export const line = (speaker: CharacterId, text: string): Effect => ({ type: 'say', text, speaker });

export const setFlag = (flag: FlagId): Effect => ({ type: 'setFlag', flag });

export const addItem = (itemId: ItemId): Effect => ({ type: 'addItem', itemId });

export const removeItem = (itemId: ItemId): Effect => ({ type: 'removeItem', itemId });

/** Move to another room, arriving at one of its named entry points. */
export const goTo = (roomId: RoomId, entry: EntryId): Effect => ({ type: 'goToRoom', roomId, entry });

export const startDialogue = (dialogueId: DialogueId): Effect => ({ type: 'startDialogue', dialogueId });

export const endDialogue = (): Effect => ({ type: 'endDialogue' });

/** The game is won: sets the `won` flag, and the view shows the end card. */
export const win = (): Effect => ({ type: 'win' });

/** Cutscene step: someone walks so their feet end at (x, y). Presentation only. */
export const walk = (character: CharacterId, x: number, y: number): Effect => ({ type: 'walk', character, to: { x, y } });

/** Cutscene step: wait this long before the next effect. Presentation only. */
export const pause = (ms: number): Effect => ({ type: 'pause', ms });

/** Cutscene step: turn someone to face left or right. Presentation only. */
export const face = (character: CharacterId, direction: 'left' | 'right'): Effect => ({ type: 'face', character, direction });

/** A sound effect, by its name in `audio.ts`. Plays without waiting. */
export const sound = (name: string): Effect => ({ type: 'sound', sound: name });
