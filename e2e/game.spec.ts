import { expect, test, type Page } from '@playwright/test';
import { shortestSolution } from '../src/content/explore';
import { initialState, world } from '../src/content/world';
import { click, open, settle, status, waitFor } from './game';
import { playThrough } from './play';

// Browser tests of the production build with real clicks (docs/slices/11-e2e.md). Each test gets a
// fresh browser context, so storage (saves, settings) starts empty.

const solution = shortestSolution(world, initialState);

async function newGame(page: Page): Promise<void> {
  await click(page, { kind: 'button', scene: 'TitleScene', label: 'New game' });
  await settle(page, 'the first room');
}

test('plays the shortest solution through to "THE END?"', async ({ page }) => {
  await open(page);
  await newGame(page);
  await playThrough(page, world, initialState, solution);
  const end = await status(page);
  expect(end.endCard, 'the "THE END?" card is showing').toBe(true);
});

test('loads with no console errors', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(`console error: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`uncaught: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`));

  await open(page);
  await newGame(page);
  expect(problems).toEqual([]);
});

test('autosave survives a reload: Continue resumes the same game', async ({ page }) => {
  await open(page);
  await newGame(page);
  // Open the coffin, take Gary's arm, memorise the script: two items' worth of changes and a flag.
  const before = await playThrough(page, world, initialState, solution.slice(0, 3));
  const saved = (await settle(page, 'the autosave after the last step')).state;
  expect(saved?.inventory.length, 'something in the inventory to round-trip').toBeGreaterThan(0);
  expect(Object.values(before.flags).some(Boolean), 'a flag to round-trip').toBe(true);

  await page.reload();
  await waitFor(page, 'the title screen after the reload', (s) => s.scene === 'TitleScene');
  await click(page, { kind: 'button', scene: 'TitleScene', label: 'Continue' });
  const resumed = await settle(page, 'the continued game');
  expect(resumed.state).toEqual(saved);
});
