import * as Phaser from 'phaser';
import type { Item, ItemId } from '../core/types';

const SLOT_SIZE = 76; // fingertip-sized, like the coin buttons
const SLOT_GAP = 10;
const DEPTH = 1000;

export interface InventoryBarHandlers {
  onClick: (itemId: ItemId, pointer: Phaser.Input.Pointer) => void;
  /** Called with the hovered item, or undefined when the pointer leaves a slot. */
  onHover: (itemId: ItemId | undefined) => void;
  /** A click on the bar but not on a slot. */
  onEmptyClick: () => void;
}

/**
 * The strip of item slots along the bottom of the screen. Placeholder art: a box with the item's
 * name. Knows nothing about rules: it shows the items it's given and reports clicks.
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
      const x = 16 + i * (SLOT_SIZE + SLOT_GAP);
      const y = this.top + (this.scene.scale.height - this.top - SLOT_SIZE) / 2;
      const held = item.id === heldId;

      const box = this.scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, held ? 0x5a4a8a : 0x2c2540)
        .setOrigin(0, 0)
        .setStrokeStyle(held ? 4 : 2, held ? 0xffe28a : 0x6b5b8c)
        .setDepth(DEPTH + 1)
        .setInteractive({ useHandCursor: true });
      const label = this.scene.add
        .text(x + SLOT_SIZE / 2, y + SLOT_SIZE / 2, item.name, {
          fontSize: '14px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: SLOT_SIZE - 8 },
        })
        .setOrigin(0.5)
        .setDepth(DEPTH + 2);

      box.on('pointerover', () => {
        this.hovering = true;
        this.handlers.onHover(item.id);
      });
      box.on('pointerout', () => {
        this.hovering = false;
        this.handlers.onHover(undefined);
      });
      box.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.handlers.onClick(item.id, pointer);
      });
      return [box, label];
    });
  }
}
