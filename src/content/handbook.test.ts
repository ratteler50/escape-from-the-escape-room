import { describe, expect, it } from 'vitest';
import { handbook, handbookReadings } from './handbook';
import { handbookSections } from './handbookSections';
import { initialState, world } from './world';

// The Employee Handbook (slice 29): Dana starts with it, can read it, and every hotspot has a line for it.

/** Every string in the content, with where it is. */
function strings(node: unknown, path: string, out: [string, string][] = [], seen = new Set<object>()): [string, string][] {
  if (typeof node === 'string') out.push([node, path]);
  else if (node && typeof node === 'object' && !seen.has(node)) {
    seen.add(node);
    for (const [key, value] of Object.entries(node)) strings(value, `${path}.${key}`, out, seen);
  }
  return out;
}

describe('the Employee Handbook', () => {
  it('is in the starting inventory', () => {
    expect(initialState.inventory).toContain(handbook.id);
  });

  it('has a few different sections to read', () => {
    expect(handbookReadings.length).toBeGreaterThanOrEqual(5);
    expect(new Set(handbookReadings).size, 'two readings are the same').toBe(handbookReadings.length);
  });

  it('has a line for every hotspot', () => {
    const missing = Object.values(world.rooms).flatMap((room) =>
      room.hotspots.filter((h) => !h.itemUses?.[handbook.id]).map((h) => `${room.id}.${h.id}`),
    );
    expect(missing, `Give these hotspots an itemUses entry for the Handbook ([handbook.id]: [...])`).toEqual([]);
  });

  it('is quoted only by sections in the master list (docs/design.md)', () => {
    const bad = strings(world, 'world').flatMap(([text, where]) =>
      [...text.matchAll(/\bSection ([\d.]*\d)/g)].filter((m) => !handbookSections.has(m[1]!)).map((m) => `Section ${m[1]} at ${where}`),
    );
    expect(bad, `Add the section to the Handbook table in docs/design.md, or quote one that's there: ${[...handbookSections].join(', ')}`).toEqual([]);
  });
});
