import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { world } from './world';

// The asset rules from the M4 plan (docs/design.md): the game is public, so every asset needs a
// license that allows it and an entry in CREDITS.md; assets stay under a size budget.

const ROOT = join(import.meta.dirname, '..', '..');
const PUBLIC = join(ROOT, 'public');
const ASSETS = join(PUBLIC, 'assets');
const ASSET_BUDGET_BYTES = 15 * 1024 * 1024;

/** Every file under public/assets, as a path relative to public/ ("assets/rooms/lair.webp"). */
function assetFiles(): { path: string; bytes: number }[] {
  if (!existsSync(ASSETS)) return [];
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  return walk(ASSETS)
    .filter((f) => !f.endsWith('.DS_Store'))
    .map((f) => ({ path: relative(PUBLIC, f).split('\\').join('/'), bytes: statSync(f).size }));
}

describe('assets', () => {
  it('credits every asset in CREDITS.md', () => {
    const credits = existsSync(join(ROOT, 'CREDITS.md')) ? readFileSync(join(ROOT, 'CREDITS.md'), 'utf8') : '';
    const missing = assetFiles()
      .map((f) => f.path)
      .filter((path) => !credits.includes(`\`${path}\``));
    expect(missing, `These assets have no CREDITS.md entry (add a row naming the file in backticks, with its source and license): ${missing.join(', ')}`).toEqual([]);
  });

  it('stays under the size budget', () => {
    const files = assetFiles();
    const total = files.reduce((n, f) => n + f.bytes, 0);
    const biggest = [...files]
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 5)
      .map((f) => `${f.path} ${(f.bytes / 1024).toFixed(0)} KB`);
    expect(
      total,
      `public/assets is ${(total / 1024 / 1024).toFixed(1)} MB, over the ${ASSET_BUDGET_BYTES / 1024 / 1024} MB budget. Biggest: ${biggest.join(', ')}`,
    ).toBeLessThanOrEqual(ASSET_BUDGET_BYTES);
  });

  it("has every room's painting on disk", () => {
    const missing = Object.values(world.rooms).flatMap((room) =>
      room.art && !existsSync(join(PUBLIC, room.art.background)) ? [`${room.id}: public/${room.art.background}`] : [],
    );
    expect(missing, `Room art points at files that don't exist: ${missing.join(', ')}`).toEqual([]);
  });

  it('gives every item an icon', () => {
    const missing = Object.values(world.items).filter((item) => !item.icon).map((item) => item.id);
    expect(missing, `These items have no icon (slice 21 made one for every item): ${missing.join(', ')}`).toEqual([]);
  });

  it('has every room overlay, character sprite, item icon, sound and track on disk', () => {
    const paths = [
      ...Object.values(world.rooms).flatMap((room) => (room.art?.overlays ?? []).map((o) => [`${room.id} overlay`, o.image])),
      ...Object.values(world.characters).flatMap((c) => Object.entries(c.sprites ?? {}).map(([pose, path]) => [`${c.id} ${pose}`, path])),
      ...Object.values(world.items).flatMap((item) => (item.icon ? [[`${item.id} icon`, item.icon]] : [])),
      ...Object.entries(world.audio?.sounds ?? {}).map(([id, path]) => [`sound ${id}`, path]),
      ...Object.entries(world.audio?.music ?? {}).map(([id, path]) => [`music ${id}`, path]),
    ];
    const missing = paths.filter(([, path]) => !existsSync(join(PUBLIC, path!))).map(([what, path]) => `${what}: public/${path}`);
    expect(missing, `Art points at files that don't exist: ${missing.join(', ')}`).toEqual([]);
  });
});
