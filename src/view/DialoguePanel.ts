import * as Phaser from 'phaser';
import { gameAudio } from './GameAudio';
import { UI } from './ui';
import type { DialogueOption, OptionId } from '../core/types';

const LINE_HEIGHT = 40; // tall enough to hit comfortably on a trackpad or a phone
const PADDING = 14;
const MIN_HEIGHT = 90; // at least as tall as the inventory bar it covers
const DEPTH = 1600;
const COLORS = { background: UI.panel, text: UI.muted, hover: UI.accent };

/**
 * Dana's dialogue options, listed along the bottom of the screen during a conversation. Covers the
 * inventory bar, and swallows clicks on the room so the player can only pick an option.
 */
export class DialoguePanel {
  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  get isOpen(): boolean {
    return this.objects.length > 0;
  }

  show(options: readonly DialogueOption[], onPick: (id: OptionId) => void): void {
    this.hide();
    const { width, height } = this.scene.scale;
    const panelHeight = Math.max(MIN_HEIGHT, options.length * LINE_HEIGHT + PADDING * 2);
    const top = height - panelHeight;

    // Nearly transparent rather than invisible: Phaser skips input on objects that don't render.
    const blocker = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.001)
      .setOrigin(0, 0)
      .setDepth(DEPTH)
      .setInteractive();
    blocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });
    const background = this.scene.add.rectangle(0, top, width, panelHeight, COLORS.background).setOrigin(0, 0).setDepth(DEPTH + 1);

    const rows = options.map((option, i) => {
      const text = this.scene.add
        .text(24, top + PADDING + i * LINE_HEIGHT + LINE_HEIGHT / 2, option.text, { fontSize: '22px', color: COLORS.text })
        .setOrigin(0, 0.5)
        .setDepth(DEPTH + 2)
        .setInteractive({ useHandCursor: true });
      text.on('pointerover', () => text.setColor(COLORS.hover));
      text.on('pointerout', () => text.setColor(COLORS.text));
      text.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        gameAudio(this.scene).play('click');
        this.hide();
        onPick(option.id);
      });
      return text;
    });

    this.objects = [blocker, background, ...rows];
  }

  hide(): void {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
  }
}
