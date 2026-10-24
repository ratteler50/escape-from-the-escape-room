import { expect, test, type Page } from '@playwright/test';
import { click, isTouch, open, settle } from './game';

// Phone-only checks (slice 32), in the "phone" project: a Pixel 7 held sideways, with touch.

test.beforeEach(async ({ page }) => {
  await open(page);
  test.skip(!(await isTouch(page)), 'phone project only');
});

const paused = (page: Page) => page.evaluate(() => (window as any).__game.isPaused as boolean);

test('an upright phone gets the sideways screen, and the game pauses until it turns back', async ({ page }) => {
  const sideways = page.locator('#sideways');
  await expect(sideways).toBeHidden();
  const { width, height } = page.viewportSize()!;

  await page.setViewportSize({ width: height, height: width });
  await expect(sideways).toBeVisible();
  await expect(sideways).toContainText('turn your phone sideways');
  await expect.poll(() => paused(page)).toBe(true);

  await page.setViewportSize({ width, height });
  await expect(sideways).toBeHidden();
  await expect.poll(() => paused(page)).toBe(false);
  // Still playable: the title screen's buttons answer taps.
  await click(page, { kind: 'button', scene: 'TitleScene', label: 'New game' });
  await settle(page, 'the first room');
});

test("a tap just beside the Lair's keypad opens it: its touch area is bigger than the art", async ({ page }) => {
  await click(page, { kind: 'button', scene: 'TitleScene', label: 'New game' });
  await settle(page, 'the first room');
  // The keypad's art is 1000–1044 across; its touch area reaches 1066. Tap at 1056, outside the art.
  const box = (await page.locator('canvas').boundingBox())!;
  const at = { x: box.x + (1056 * box.width) / 1280, y: box.y + (231 * box.height) / 720 };
  await page.touchscreen.tap(at.x, at.y);
  await expect
    .poll(() => page.evaluate(() => (window as any).__game.scene.getScene('RoomScene').coin.objects[1]?.text))
    .toBe('Keypad');
});
