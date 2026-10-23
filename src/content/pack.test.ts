import { describe, expect, it } from 'vitest';
import type { Item, Room } from '../core/types';
import { mergePacks } from './pack';

const room = (id: string): Room => ({ id, name: id, entries: {}, walkable: [], hotspots: [] });
const item = (id: string): Item => ({ id, name: id, look: `A ${id}.` });

describe('mergePacks', () => {
  it('keys everything by id and keeps combinations in order', () => {
    const merged = mergePacks([
      { rooms: [room('a')], items: [item('x')], combinations: [{ items: ['x', 'y'], responses: [{ effects: [] }] }] },
      { rooms: [room('b')], items: [item('y')] },
    ]);
    expect(Object.keys(merged.rooms)).toEqual(['a', 'b']);
    expect(Object.keys(merged.items)).toEqual(['x', 'y']);
    expect(merged.combinations).toHaveLength(1);
    expect(merged.characters).toEqual({});
    expect(merged.dialogues).toEqual({});
  });

  it('throws on a duplicate id, naming it', () => {
    expect(() => mergePacks([{ items: [item('x')] }, { items: [item('x')] }])).toThrow(/items.*"x"/);
  });
});
