import { expect, type Page } from '@playwright/test';
import type { GameState } from '../src/core/types';

// Drives the running game the way a player would: finds things through the `window.__game` hook,
// then moves the real mouse there and clicks. The tests only ever *read* from the game.
//
// The game draws everything on one canvas, so there are no DOM elements to find. Instead the
// page-side half of this file (installed into the page by `open`) looks up Phaser game objects. It
// reads private fields of the view (RoomScene, RoomView, InventoryBar, VerbCoin, DialoguePanel,
// Speech, PlayerSprite): when the view changes, this is the file to update.

/** Something on screen the test can click. */
export type Target =
  | { kind: 'hotspot'; id: string }
  | { kind: 'item'; name: string }
  | { kind: 'coin'; icon: string }
  | { kind: 'option'; text: string }
  | { kind: 'button'; scene: string; label: string }
  | { kind: 'skip' };

/** What the test needs to know about the game between clicks. */
export interface Status {
  scene: string | undefined;
  busy: boolean;
  walking: boolean;
  line: string | undefined;
  endCard: boolean;
  state: GameState | undefined;
}

const GAME = { width: 1280, height: 720 };

/** Page-side helpers. Self-contained: Playwright serialises this function into the page. */
function installHelpers(): void {
  const game = () => (window as any).__game;
  const room = (): any => game()?.scene.getScene('RoomScene');
  const activeScene = (): string | undefined => game()?.scene.getScenes(true)[0]?.scene.key;
  const isText = (o: any, text: string) => o?.type === 'Text' && o.text === text;

  function find(target: any): any {
    const r = room();
    switch (target.kind) {
      case 'hotspot':
        return r.roomView.drawn.find((d: any) => d.hotspot.id === target.id)?.objects[0];
      case 'item': {
        // Slots are [box, label, box, label, …]; the box is the clickable part.
        const slots = r.inventory.slots;
        const i = slots.findIndex((o: any) => isText(o, target.name));
        return i > 0 ? slots[i - 1] : undefined;
      }
      case 'coin': {
        // [blocker, caption, disc, icon, disc, icon, …]
        const objects = r.coin.objects;
        const i = objects.findIndex((o: any, n: number) => n >= 2 && isText(o, target.icon));
        return i > 0 ? objects[i - 1] : undefined;
      }
      case 'option':
        return r.dialogue.objects.find((o: any) => isText(o, target.text));
      case 'button':
        return game()
          .scene.getScene(target.scene)
          ?.children.list.find((o: any) => isText(o, target.label) && o.input?.enabled);
      case 'skip':
        return r.speech.blocker;
    }
  }

  /** Points to try inside the target, centre first, in game coordinates. */
  function points(target: any): { x: number; y: number }[] | undefined {
    const object = find(target);
    if (!object?.active) return undefined;
    const b = object.getBounds();
    const inset = (t: number, from: number, size: number) => from + size * t;
    const grid = [0.5, 0.25, 0.75, 0.1, 0.9];
    return grid.flatMap((ty) => grid.map((tx) => ({ x: inset(tx, b.x, b.width), y: inset(ty, b.y, b.height) })));
  }

  /** Is the target the top-most interactive object under the pointer, in its scene? */
  function isOver(target: any): boolean {
    const object = find(target);
    const input = object?.scene?.input;
    return !!object && input?._over[input.manager.activePointer.id]?.[0] === object;
  }

  /** A place to click to skip a line: on screen, but on no hotspot, so a late click can only walk. */
  function skipPoint(): { x: number; y: number } {
    const hotspots = room().roomView.drawn.map((d: any) => d.hotspot.bounds);
    for (let x = 80; x < 1200; x += 40) {
      const y = 120;
      if (!hotspots.some((b: any) => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height)) return { x, y };
    }
    return { x: 640, y: 120 };
  }

  function status(): unknown {
    const r = room();
    const roomActive = activeScene() === 'RoomScene';
    return {
      scene: activeScene(),
      busy: roomActive && r.busy,
      walking: roomActive && r.player.isWalking,
      line: roomActive ? r.speech.current : undefined,
      endCard: roomActive && r.children.list.some((o: any) => o.type === 'Container' && o.alpha === 1 && o.list.some((c: any) => isText(c, 'To be continued…'))),
      state: roomActive ? r.state : undefined,
    };
  }

  (window as any).__e2e = { points, isOver, skipPoint, status };
}

/** Opens the game with the hook on, waiting until Phaser is running. */
export async function open(page: Page): Promise<void> {
  await page.addInitScript(installHelpers);
  await page.goto('/?e2e');
  await waitFor(page, 'the title screen', (s) => s.scene === 'TitleScene');
}

export async function status(page: Page): Promise<Status> {
  return page.evaluate(() => (window as unknown as { __e2e: { status(): Status } }).__e2e.status());
}

/** Waits until the game's status matches, with a message saying what it was waiting for. */
export async function waitFor(page: Page, what: string, until: (s: Status) => boolean, timeout = 15_000): Promise<Status> {
  let last: Status | undefined;
  await expect
    .poll(
      async () => {
        last = await page.evaluate(() => (window as unknown as { __e2e?: { status(): Status } }).__e2e?.status()).catch(() => undefined);
        return !!last && until(last);
      },
      { message: `Waiting for ${what}`, timeout, intervals: [50] },
    )
    .toBe(true);
  return last!;
}

/** Lets the game draw one frame: the polling interval, not a wait for anything in particular. */
function nextFrame(page: Page): Promise<unknown> {
  return page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
}

/** Game coordinates → page coordinates, from where the canvas is on screen. */
async function toPage(page: Page, at: { x: number; y: number }): Promise<{ x: number; y: number }> {
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('No canvas on the page');
  return { x: box.x + (at.x * box.width) / GAME.width, y: box.y + (at.y * box.height) / GAME.height };
}

/**
 * Clicks a target like a player: waits for it to be on screen, moves the mouse onto it, checks the
 * game says the pointer is over it (Phaser can miss a click without a pointer move), then presses.
 */
export async function click(page: Page, target: Target, what = JSON.stringify(target)): Promise<void> {
  let candidates: { x: number; y: number }[] | undefined;
  await expect
    .poll(async () => (candidates = await page.evaluate((t) => (window as any).__e2e.points(t), target)), {
      message: `Waiting for ${what} to be on screen`,
      timeout: 10_000,
      intervals: [50],
    })
    .toBeTruthy();

  for (const at of candidates!) {
    const p = await toPage(page, at);
    await page.mouse.move(p.x, p.y);
    const over = await expect
      .poll(() => page.evaluate((t) => (window as any).__e2e.isOver(t), target), { timeout: 500, intervals: [16] })
      .toBe(true)
      .then(() => true, () => false);
    if (over) {
      await page.mouse.down();
      await page.mouse.up();
      return;
    }
  }
  throw new Error(`The pointer never got over ${what}: something else is covering it`);
}

/**
 * Waits until the game is at rest (no effects playing, Dana standing still) and `until` holds,
 * clicking to skip lines on the way, like an impatient player. The end card counts as at rest.
 */
export async function settle(page: Page, what: string, until: (s: Status) => boolean = () => true, timeout = 30_000): Promise<Status> {
  const deadline = Date.now() + timeout;
  for (;;) {
    const s = await status(page);
    const atRest = s.scene === 'RoomScene' && ((!s.busy && !s.walking) || s.endCard);
    if (atRest && until(s)) return s;
    if (Date.now() > deadline) throw new Error(`Timed out waiting for ${what}. Last status: ${JSON.stringify({ ...s, state: undefined })}`);
    if (s.line !== undefined) {
      const at = await toPage(page, await page.evaluate(() => (window as any).__e2e.skipPoint()));
      await page.mouse.move(at.x, at.y);
      const over = await page.evaluate(() => (window as any).__e2e.isOver({ kind: 'skip' }));
      if (over) {
        await page.mouse.down();
        await page.mouse.up();
      }
    }
    await nextFrame(page);
  }
}
