import * as Phaser from 'phaser';
import { gameAudio } from './GameAudio';
import { UI } from './ui';
import type { Point } from '../core/geometry';

/** One button on the coin. `id` is what `onPick` receives. */
export interface CoinOption<Id extends string> {
  id: Id;
  icon: string;
  label: string;
}

const BUTTON_RADIUS = 38; // 76px across: still a fingertip-sized target when scaled down on a phone
const RING_RADIUS = 86;
const ARC_STEP_DEGREES = 62;
const DEPTH = 2000;

/**
 * A ring of buttons around a point: verbs on a hotspot, or Look / Use with… on an item. Owns a full-screen blocker underneath it, so while the
 * coin is open, clicks elsewhere only close it and nothing behind it reacts to the pointer.
 */
export class VerbCoin {
  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    scene.input.keyboard?.on('keydown-ESC', () => this.close());
  }

  get isOpen(): boolean {
    return this.objects.length > 0;
  }

  open<Id extends string>(at: Point, title: string, options: readonly CoinOption<Id>[], onPick: (id: Id) => void): void {
    this.close();
    gameAudio(this.scene).play('coin');
    const { width, height } = this.scene.scale;

    const blocker = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.25)
      .setOrigin(0, 0)
      .setDepth(DEPTH)
      .setInteractive();
    blocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.close();
    });

    // Buttons sit on an arc above the centre; keep the whole coin on screen.
    const margin = RING_RADIUS + BUTTON_RADIUS + 8;
    const center = {
      x: Phaser.Math.Clamp(at.x, margin, width - margin),
      y: Phaser.Math.Clamp(at.y, margin, height - 60),
    };

    const caption = this.scene.add
      .text(center.x, center.y + 20, title, {
        fontSize: '22px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH + 2);

    const buttons = options.map((option, i) => {
      const angle = Phaser.Math.DegToRad(-90 + (i - (options.length - 1) / 2) * ARC_STEP_DEGREES);
      const x = center.x + Math.cos(angle) * RING_RADIUS;
      const y = center.y + Math.sin(angle) * RING_RADIUS;

      const disc = this.scene.add
        .circle(x, y, BUTTON_RADIUS, UI.inset)
        .setStrokeStyle(3, UI.border)
        .setDepth(DEPTH + 1)
        .setInteractive({ useHandCursor: true });
      const icon = this.scene.add.text(x, y, option.icon, { fontSize: '34px' }).setOrigin(0.5).setDepth(DEPTH + 2);

      disc.on('pointerover', () => {
        disc.setFillStyle(UI.insetHover);
        caption.setText(option.label);
      });
      disc.on('pointerout', () => {
        disc.setFillStyle(UI.inset);
        caption.setText(title);
      });
      disc.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.close();
        onPick(option.id);
      });
      return [disc, icon];
    });

    this.objects = [blocker, caption, ...buttons.flat()];
  }

  close(): void {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
  }
}
