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
  // The whole game since slice 16: 29 steps over three rooms plus the finale's walks and pauses.
  // About 45s locally, but CI runners are up to ~8x slower (6+ minutes), so this one test gets a
  // budget of its own. A stuck step still fails with its own name (play.ts: ~30s per ordinary step).
  test.setTimeout(15 * 60_000);
  await open(page);
  await newGame(page);
  await playThrough(page, world, initialState, solution);
  const end = await status(page);
  expect(end.endCard, 'the "THE END?" card is showing').toBe(true);
  // Every story sound on the way (the agent can't hear them, so check they were asked for), and the
  // Gift Shop's music playing: the game ends there.
  const story = ['bones', 'squelch', 'keys', 'latch', 'keypad', 'unlock', 'arise', 'till', 'rumble', 'finale'];
  const ui = ['click', 'coin', 'select', 'pickup', 'door'];
  expect([...story, ...ui].filter((sound) => !end.audio.requested[sound]), 'sounds never played').toEqual([]);
  expect(end.audio.track).toBe('giftShop');
});

test('loads with no console errors', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(`console error: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`uncaught: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`));

  await open(page);
  await newGame(page);
  // The click on New game unlocked audio; the Lair's music fades in.
  await waitFor(page, "the Lair's music", (s) => s.audio.track === 'lair');
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

test('the open coffin shows the script only while it is on the shelf (slice 33)', async ({ page }) => {
  await open(page);
  await newGame(page);
  // What the room draws: the script's clickable area, and the painted script patch.
  const shelf = () =>
    page.evaluate(() => {
      const view = (window as any).__game.scene.getScene('RoomScene').roomView;
      return {
        hotspot: view.drawn.some((d: any) => d.hotspot.id === 'coffinScript'),
        painted: view.overlays.some((o: any) => o.texture.key.includes('lair-coffin-script')),
      };
    });
  const opened = await playThrough(page, world, initialState, [{ type: 'verb', verb: 'use', hotspotId: 'coffin' }]);
  expect(await shelf()).toEqual({ hotspot: true, painted: true });
  const taken = await playThrough(page, world, opened, [{ type: 'verb', verb: 'take', hotspotId: 'coffinScript' }]);
  expect(await shelf(), 'taken: the shelf is empty').toEqual({ hotspot: false, painted: false });
  await playThrough(page, world, taken, [{ type: 'itemAction', itemId: 'script' }]);
  expect(await shelf(), 'memorised: the script is back on the shelf').toEqual({ hotspot: true, painted: true });
});
