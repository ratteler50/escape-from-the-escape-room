import * as Phaser from 'phaser';
import type { World } from '../core/types';
import { INVENTORY_ART } from './InventoryBar';
import { ART_ENABLED, artKey, roomArtKey } from './RoomView';
import { walkSheetKey } from './Walker';

/** The title and end card's art (slice 26): paintings at 1280×720, the logo cut out at 2× size. */
export const KEY_ART = { title: 'assets/key-art/title.webp', logo: 'assets/key-art/logo.webp', end: 'assets/key-art/end.webp' } as const;

/** A key art texture key, if art is on and it's loaded (otherwise the screens draw their old look). */
export function keyArt(scene: Phaser.Scene, which: keyof typeof KEY_ART): string | undefined {
  const key = artKey(KEY_ART[which]);
  return ART_ENABLED && scene.textures.exists(key) ? key : undefined;
}

/**
 * Queues every image the game draws (paintings, overlays, sprites, icons, the tray, key art) on a scene's
 * loader. Images are small (well under 1 MB in all), so they all load up front, behind the loading
 * screen, and changing rooms never waits.
 */
export function queueArt(scene: Phaser.Scene, world: World): void {
  const load = (key: string, path: string) => {
    if (!scene.textures.exists(key)) scene.load.image(key, path);
  };
  for (const room of Object.values(world.rooms)) {
    if (!room.art) continue;
    load(roomArtKey(room), room.art.background);
    for (const overlay of room.art.overlays ?? []) load(artKey(overlay.image), overlay.image);
  }
  for (const character of Object.values(world.characters)) {
    for (const path of Object.values(character.sprites ?? {})) load(artKey(path), path);
    for (const walk of Object.values(character.walks ?? {})) {
      if (!scene.textures.exists(walkSheetKey(walk.sheet))) {
        scene.load.spritesheet(walkSheetKey(walk.sheet), walk.sheet, { frameWidth: walk.frameWidth, frameHeight: walk.frameHeight });
      }
    }
  }
  for (const item of Object.values(world.items)) if (item.icon) load(artKey(item.icon), item.icon);
  for (const path of Object.values(INVENTORY_ART)) load(artKey(path), path);
  for (const path of Object.values(KEY_ART)) load(artKey(path), path);
}
