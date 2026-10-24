import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateHandbook } from '../../scripts/handbook';
import { handle } from '../core/engine';
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

  it("reads the old Section 14 until Dana finds the revised insert on Kyle, then the revised one (slice 30)", () => {
    const readLines = (flags: Record<string, boolean>) => {
      const [effect] = handle(world, { ...initialState, flags }, { type: 'itemAction', itemId: handbook.id }).effects;
      return effect?.type === 'sayOneOf' ? effect.texts.filter((t) => /^Section 14[:,]/.test(t)) : [];
    };
    expect(readLines({})).toEqual([expect.stringContaining("I don't have time for inserts")]);
    expect(readLines({ learnedRevisedSection14: true })).toEqual([expect.stringContaining('Staff may borrow equipment for re-pricing')]);
  });

  it('has a line for every hotspot', () => {
    const missing = Object.values(world.rooms).flatMap((room) =>
      room.hotspots.filter((h) => !h.itemUses?.[handbook.id]).map((h) => `${room.id}.${h.id}`),
    );
    expect(missing, `Give these hotspots an itemUses entry for the Handbook ([handbook.id]: [...])`).toEqual([]);
  });

  it('is quoted only by sections in the one list (handbookSections.ts)', () => {
    const bad = strings(world, 'world').flatMap(([text, where]) =>
      [...text.matchAll(/\bSection ([\d.]*\d)/g)].filter((m) => !handbookSections.has(m[1]!)).map((m) => `Section ${m[1]} at ${where}`),
    );
    expect(bad, `Add the section to src/content/handbookSections.ts (then \`npm run handbook\`), or quote one that's there: ${[...handbookSections].join(', ')}`).toEqual([]);
  });
});

// docs/handbook.md lists every section with Dana's comment, generated from handbookSections.ts.
it('docs/handbook.md is up to date with the sections', () => {
  const onDisk = readFileSync(join(import.meta.dirname, '..', '..', 'docs', 'handbook.md'), 'utf8');
  expect(onDisk === generateHandbook(), 'docs/handbook.md is out of date: run `npm run handbook` and commit it').toBe(true);
});
