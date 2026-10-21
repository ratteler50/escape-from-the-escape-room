import { describe, expect, it } from 'vitest';
import { initialState, world } from '../content/world';
import { handle } from './engine';
import { InMemorySaveStore, SAVE_FORMAT, loadSaveFile, mostRecentSlot, toSaveFile, type SaveFile } from './save';
import type { GameState } from './types';

const NOW = '2026-10-21T23:40:00.000Z';
const json = (file: unknown) => JSON.stringify(file);

/** A few real steps into the game: script taken, mid-conversation with Reginald. */
function midConversation(): GameState {
  let s = handle(world, initialState, { type: 'verb', verb: 'use', hotspotId: 'coffin' }).state;
  s = handle(world, s, { type: 'verb', verb: 'talk', hotspotId: 'reginald' }).state;
  return handle(world, s, { type: 'chooseOption', optionId: 'who' }).state;
}

describe('save files', () => {
  it('round-trips a mid-game state', () => {
    const state = handle(world, initialState, { type: 'verb', verb: 'take', hotspotId: 'gary' }).state;
    const result = loadSaveFile(world, json(toSaveFile(state, NOW)));
    expect(result).toEqual({ ok: true, state, savedAt: NOW });
  });

  it('round-trips a state in the middle of a conversation', () => {
    const state = midConversation();
    expect(state.conversation).not.toBeNull();
    const result = loadSaveFile(world, json(toSaveFile(state, NOW)));
    expect(result.ok && result.state).toEqual(state);
  });

  it('records the format version and the time', () => {
    expect(toSaveFile(initialState, NOW)).toEqual({ format: SAVE_FORMAT, savedAt: NOW, state: initialState });
  });
});

describe('incompatible saves are reported, never thrown', () => {
  const good = (): SaveFile => toSaveFile(initialState, NOW);
  const withState = (patch: Partial<GameState>) => json({ ...good(), state: { ...initialState, ...patch } });
  const reasonFor = (raw: string) => {
    const result = loadSaveFile(world, raw);
    expect(result.ok).toBe(false);
    return result.ok ? '' : result.reason;
  };

  it('corrupt JSON', () => {
    expect(reasonFor('{not json')).toMatch(/corrupt/i);
  });

  it('a different format version', () => {
    expect(reasonFor(json({ ...good(), format: SAVE_FORMAT + 1 }))).toMatch(/version/i);
  });

  it('an unknown room', () => {
    expect(reasonFor(withState({ roomId: 'ballroom' }))).toMatch(/ballroom/);
  });

  it('Dana standing off the floor', () => {
    expect(reasonFor(withState({ player: { x: 640, y: 100 } }))).toMatch(/floor/i);
  });

  it('an unknown item', () => {
    expect(reasonFor(withState({ inventory: ['banana'] }))).toMatch(/banana/);
  });

  it('a conversation in a dialogue or node that no longer exists', () => {
    expect(reasonFor(withState({ conversation: { dialogueId: 'reginald', nodeId: 'gone' } }))).toMatch(/gone/);
    expect(reasonFor(withState({ conversation: { dialogueId: 'nobody', nodeId: 'hub' } }))).toMatch(/nobody/);
  });

  it('a malformed state', () => {
    expect(reasonFor(json({ ...good(), state: { roomId: 'lair' } }))).toMatch(/malformed/i);
    expect(reasonFor(withState({ flags: { tookGum: 'yes' } as never }))).toMatch(/malformed/i);
  });
});

describe('save store', () => {
  it('reads back what was written, and lists slots with their save times', () => {
    const store = new InMemorySaveStore();
    store.write('slot2', json(toSaveFile(initialState, NOW)));
    expect(store.read('slot2')).toBe(json(toSaveFile(initialState, NOW)));
    expect(store.read('slot1')).toBeNull();
  });

  it('picks the most recent save for Continue, ignoring empty and unreadable slots', () => {
    const store = new InMemorySaveStore();
    store.write('auto', json(toSaveFile(initialState, '2026-10-21T10:00:00.000Z')));
    store.write('slot1', json(toSaveFile(initialState, '2026-10-21T12:00:00.000Z')));
    store.write('slot3', '{corrupt');
    expect(mostRecentSlot(world, store)).toBe('slot1');
    expect(mostRecentSlot(world, new InMemorySaveStore())).toBeNull();
  });
});
