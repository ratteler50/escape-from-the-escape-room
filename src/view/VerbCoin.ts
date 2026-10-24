import * as Phaser from 'phaser';
import { gameAudio } from './GameAudio';
import { MIN_LABEL } from './textSize';
import { font, UI } from './ui';
import type { Point } from '../core/geometry';

/** One button on the coin. `id` is what `onPick` receives. */
export interface CoinOption<Id extends string> {
  id: Id;
  icon: string;
  label: string;
}

const BUTTON_RADIUS = 38; // 76px across: still a fingertip-sized target when scaled down on a phone
/** Buttons sit in a gently curved row, this far apart, each with its label under it (slice 33). */
const SPACING = 132;
/** How far above the clicked point the row sits, and how much the outer buttons drop. */
const ROW = { above: 96, curve: 12 };
const LABEL_GAP = 6;
const DEPTH = 2000;

/**
 * A curved row of buttons over a point: verbs on a hotspot, or Look / Use with… on an item. Each
 * button shows its label (slice 33: a phone has no hover, so labels can't wait for one). Owns a
 * full-screen blocker underneath it, so while the coin is open, clicks elsewhere only close it and
 * nothing behind it reacts to the pointer.
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

    // Keep the whole row, labels included, on screen.
    const halfWidth = ((options.length - 1) / 2) * SPACING + SPACING / 2;
    const center = {
      x: Phaser.Math.Clamp(at.x, halfWidth, width - halfWidth),
      y: Phaser.Math.Clamp(at.y, ROW.above + BUTTON_RADIUS + 8, height - 60),
    };
    const labelStyle = {
      ...font(this.scene, 18, { min: MIN_LABEL }),
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: SPACING - 12 },
    };

    const buttons = options.map((option, i) => {
      const offset = i - (options.length - 1) / 2;
      const x = center.x + offset * SPACING;
      const y = center.y - ROW.above + offset * offset * ROW.curve;

      const disc = this.scene.add
        .circle(x, y, BUTTON_RADIUS, UI.inset)
        .setStrokeStyle(3, UI.border)
        .setDepth(DEPTH + 1)
        .setInteractive({ useHandCursor: true });
      const icon = this.scene.add.text(x, y, option.icon, { fontSize: '34px' }).setOrigin(0.5).setDepth(DEPTH + 2);
      const label = this.scene.add
        .text(x, y + BUTTON_RADIUS + LABEL_GAP, option.label, labelStyle)
        .setOrigin(0.5, 0)
        .setDepth(DEPTH + 2);

      disc.on('pointerover', () => disc.setFillStyle(UI.insetHover));
      disc.on('pointerout', () => disc.setFillStyle(UI.inset));
      disc.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.close();
        onPick(option.id);
      });
      return { disc, icon, label };
    });

    // The hotspot's name goes under the row, below the lowest label.
    const lowest = Math.max(...buttons.map(({ label }) => label.y + label.height));
    const caption = this.scene.add
      .text(center.x, Math.max(lowest + 8, center.y), title, {
        ...font(this.scene, 22),
        color: '#ffe28a',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH + 2);

    // [blocker, caption, disc, icon, label, disc, icon, label, …]: the end-to-end tests find a button
    // by its icon, just after its disc.
    this.objects = [blocker, caption, ...buttons.flatMap(({ disc, icon, label }) => [disc, icon, label])];
  }

  close(): void {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
  }
}
