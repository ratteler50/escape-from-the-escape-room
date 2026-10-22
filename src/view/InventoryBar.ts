import * as Phaser from 'phaser';
import type { Item, ItemId } from '../core/types';
import { ART_ENABLED, artKey } from './RoomView';

const SLOT_SIZE = 76; // fingertip-sized, like the coin buttons
const SLOT_GAP = 10;
const ICON_SIZE = 62;
const HOVER_SCALE = 1.1;
const DEPTH = 1000;

/** The texture an item's icon is loaded under, if art is on and it has one loaded. */
export function iconKey(scene: Phaser.Scene, item: Item | undefined): string | undefined {
  if (!ART_ENABLED || !item?.icon) return undefined;
  const key = artKey(item.icon);
  return scene.textures.exists(key) ? key : undefined;
}

export interface InventoryBarHandlers {
  onClick: (itemId: ItemId, pointer: Phaser.Input.Pointer) => void;
  /** Called with the hovered item, or undefined when the pointer leaves a slot. */
  onHover: (itemId: ItemId | undefined) => void;
  /** A click on the bar but not on a slot. */
  onEmptyClick: () => void;
}

/**
 * The strip of item slots along the bottom of the screen. Each slot shows its item's icon (the name
 * is the hover caption), or, without one or with `?art=off`, the name in a box. Knows nothing about
 * rules: it shows the items it's given and reports clicks.
 */
export class InventoryBar {
  private slots: Phaser.GameObjects.GameObject[] = [];
  private hovering = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly top: number,
    private readonly handlers: InventoryBarHandlers,
  ) {
    const { width, height } = scene.scale;
    const background = scene.add
      .rectangle(0, top, width, height - top, 0x15111f)
      .setOrigin(0, 0)
      .setDepth(DEPTH)
      .setInteractive();
    background.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.handlers.onEmptyClick();
    });
  }

  render(items: readonly Item[], heldId: ItemId | undefined): void {
    // Destroyed slots never get a pointerout, so end any hover ourselves.
    if (this.hovering) {
      this.hovering = false;
      this.handlers.onHover(undefined);
    }
    this.slots.forEach((o) => o.destroy());
    this.slots = items.flatMap((item, i) => {
      // Positions are slot centres, so the hover grow scales about the middle.
      const x = 16 + i * (SLOT_SIZE + SLOT_GAP) + SLOT_SIZE / 2;
      const y = this.top + (this.scene.scale.height - this.top) / 2;
      const held = item.id === heldId;
      const icon = iconKey(this.scene, item);

      const box = this.scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, held ? 0x5a4a8a : 0x2c2540)
        .setStrokeStyle(held ? 4 : 2, held ? 0xffe28a : 0x6b5b8c)
        .setDepth(DEPTH + 1)
        .setInteractive({ useHandCursor: true })
        // How the e2e tests find a slot, whatever it looks like.
        .setData('itemId', item.id);
      const content = icon
        ? this.scene.add.image(x, y, icon).setDisplaySize(ICON_SIZE, ICON_SIZE)
        : this.scene.add.text(x, y, item.name, {
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: SLOT_SIZE - 8 },
          }).setOrigin(0.5);
      content.setDepth(DEPTH + 2);
      const restScale = { box: box.scaleX, content: content.scaleX };
      const grow = (factor: number) => {
        box.setScale(restScale.box * factor);
        content.setScale(restScale.content * factor);
      };

      box.on('pointerover', () => {
        this.hovering = true;
        grow(HOVER_SCALE);
        this.handlers.onHover(item.id);
      });
      box.on('pointerout', () => {
        this.hovering = false;
        grow(1);
        this.handlers.onHover(undefined);
      });
      box.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.handlers.onClick(item.id, pointer);
      });
      return [box, content];
    });
  }
}
