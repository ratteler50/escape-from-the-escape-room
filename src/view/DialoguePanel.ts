import * as Phaser from 'phaser';
import { gameAudio } from './GameAudio';
import { font, UI } from './ui';
import type { DialogueOption, OptionId } from '../core/types';

const LINE_HEIGHT = 40; // at full size: tall enough to hit comfortably on a trackpad or a phone
const PADDING = 14;
const MIN_HEIGHT = 90; // at least as tall as the inventory bar it covers
/** The panel never covers more than this share of the screen; past that, its options scroll. */
const MAX_SHARE = 0.45;
const DEPTH = 1600;
const COLORS = { background: UI.panel, text: UI.muted, hover: UI.accent };

/**
 * Dana's dialogue options, listed along the bottom of the screen during a conversation. Covers the
 * inventory bar, and swallows clicks on the room so the player can only pick an option. When the
 * game is shrunk its text grows (slice 31), so rows grow with it; if they no longer fit, the list
 * scrolls (mouse wheel, or the arrows at its right).
 */
export class DialoguePanel {
  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  get isOpen(): boolean {
    return this.objects.length > 0;
  }

  show(options: readonly DialogueOption[], onPick: (id: OptionId) => void, first = 0): void {
    this.hide();
    const { width, height } = this.scene.scale;
    const style = { ...font(this.scene, 22), color: COLORS.text };
    const lineHeight = Math.max(LINE_HEIGHT, Math.round(parseInt(style.fontSize, 10) * 1.75));
    const fits = Math.max(1, Math.floor((height * MAX_SHARE - PADDING * 2) / lineHeight));
    const scrolls = options.length > fits;
    const start = Phaser.Math.Clamp(first, 0, Math.max(0, options.length - fits));
    const shown = options.slice(start, start + fits);
    const panelHeight = Math.max(MIN_HEIGHT, shown.length * lineHeight + PADDING * 2);
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

    const rows = shown.map((option, i) => {
      const text = this.scene.add
        .text(24, top + PADDING + i * lineHeight + lineHeight / 2, option.text, style)
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
    if (!scrolls) return;

    // Scrolling: redraw from another first option. The arrows sit at the right edge, the wheel works
    // anywhere over the screen while the panel is up.
    const scrollTo = (next: number) => {
      if (next !== start) this.show(options, onPick, next);
    };
    const arrow = (label: string, y: number, enabled: boolean, next: number) => {
      const a = this.scene.add
        .text(width - 40, y, label, { ...style, color: enabled ? UI.accent : UI.disabled })
        .setOrigin(0.5)
        .setDepth(DEPTH + 2);
      if (enabled) {
        a.setInteractive({ useHandCursor: true });
        a.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
          event.stopPropagation();
          scrollTo(next);
        });
      }
      return a;
    };
    const up = arrow('▲', top + PADDING + lineHeight / 2, start > 0, start - 1);
    const down = arrow('▼', height - PADDING - lineHeight / 2, start + fits < options.length, start + 1);
    const wheel = (_p: unknown, _o: unknown, _dx: number, dy: number) => scrollTo(start + Math.sign(dy));
    this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, wheel);
    const unhook = this.scene.add.zone(0, 0, 0, 0);
    unhook.once(Phaser.GameObjects.Events.DESTROY, () => this.scene.input.off(Phaser.Input.Events.POINTER_WHEEL, wheel));
    this.objects.push(up, down, unhook);
  }

  hide(): void {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
  }
}
