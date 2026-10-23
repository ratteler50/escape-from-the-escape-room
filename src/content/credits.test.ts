import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { credits } from './credits';

it('names every Kevin MacLeod track in CREDITS.md (CC BY wants players to see the credit)', () => {
  const file = readFileSync(join(import.meta.dirname, '..', '..', 'CREDITS.md'), 'utf8');
  const tracks = [...new Set([...file.matchAll(/"([^"]+)" Kevin MacLeod/g)].map((m) => m[1]!))];
  expect(tracks.length).toBeGreaterThan(0);
  expect([...credits.music.tracks].sort()).toEqual(tracks.sort());
});
