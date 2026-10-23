import * as Phaser from 'phaser';
import type { World } from '../core/types';
import { INVENTORY_ART } from './InventoryBar';
import { artKey, roomArtKey } from './RoomView';

/**
 * Queues every image the game draws (paintings, overlays, sprites, icons, the tray) on a scene's
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
  }
  for (const item of Object.values(world.items)) if (item.icon) load(artKey(item.icon), item.icon);
  for (const path of Object.values(INVENTORY_ART)) load(artKey(path), path);
}
