import * as Phaser from 'phaser';
import type { Point } from '../core/geometry';
import { TEXT_SPEEDS, settings } from './storage';
import { MIN_LABEL, balancedWidth } from './textSize';
import { charsShown, typingTime } from './typewriter';
import { font } from './ui';

const DEPTH = 900;
const BLOCKER_DEPTH = 1800;
/** Speech is drawn at 22 px (grown when the game is shrunk) and wraps at 520 px at that size. */
const SIZE = { text: 22, name: 16, wrap: 520 };
/** The dark band each line sits on (slice 31): readable over any part of a painting. */
const BAND = { color: 0x140a1e, alpha: 0.8, padX: 16, padY: 8, radius: 12, margin: 10 };

/**
 * Shows one line of speech at a time, above whoever is speaking, typing it out at the text speed.
 * While a line is showing, a full-screen blocker turns any click into "complete the line" (if it's
 * still typing) or "next line", and stops everything else.
 */
export class Speech {
  /** The band, the speaker's name and one text object per wrapped line. */
  private objects: Phaser.GameObjects.GameObject[] = [];
  private line: string | undefined;
  private typing: Phaser.Time.TimerEvent | undefined;
  private timer: Phaser.Time.TimerEvent | undefined;
  /** Shows the whole line now and starts the reading timer. */
  private complete: (() => void) | undefined;
  /** Removes the line and moves on. */
  private finish: (() => void) | undefined;
  private readonly blocker: Phaser.GameObjects.Rectangle;

  constructor(private readonly scene: Phaser.Scene) {
    // Nearly transparent rather than invisible: Phaser skips input on objects that don't render.
    this.blocker = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.001)
      .setOrigin(0, 0)
      .setDepth(BLOCKER_DEPTH)
      .setVisible(false);
    this.blocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.skip();
    });
  }

  /** The whole line being shown (even while it's still typing out). */
  get current(): string | undefined {
    return this.line;
  }

  get isTyping(): boolean {
    return this.typing !== undefined;
  }

  /** Blocks input to the room (clicks skip lines). On while effects are playing, off when idle. */
  setBlocking(on: boolean): void {
    if (on) this.blocker.setVisible(true).setInteractive();
    else this.blocker.disableInteractive().setVisible(false);
  }

  /**
   * Types `line` out above `anchor` on a dark band, then leaves it up for its reading time or until
   * a click. `name` puts the speaker's name on the band (everyone but Dana). Deliberate line breaks
   * (`\n`) in the line are kept.
   */
  say(line: string, color: string, anchor: Point, onDone: () => void, name?: string): void {
    this.clear();
    this.line = line;
    const { scene } = this;
    const style = { ...font(scene, SIZE.text), color };

    // Wrap once, at a width that avoids a lone last word, and keep that layout while it types.
    const measure = scene.add.text(0, 0, '', style).setVisible(false);
    const grown = parseInt(style.fontSize, 10) / SIZE.text;
    const wrapAt = (text: string, width: number) => measure.setWordWrapWidth(width).getWrappedText(text);
    const maxWidth = Math.min(SIZE.wrap * grown, scene.scale.width - 2 * (BAND.margin + BAND.padX));
    const lines = wrapAt(line, balancedWidth(line, maxWidth, wrapAt));
    measure.destroy();

    // One left-aligned text per line, so letters don't shift as the line types out (the font isn't
    // monospaced). Each is sized with its full text, then emptied.
    const rows = lines.map((l) => scene.add.text(0, 0, l, style).setDepth(DEPTH + 1));
    const lineHeight = rows[0]?.height ?? 0;
    const tag = name ? scene.add.text(0, 0, name.toUpperCase(), { ...font(scene, SIZE.name, { min: MIN_LABEL }), color }).setOrigin(0.5, 0).setDepth(DEPTH + 1) : undefined;
    const tagHeight = tag ? tag.height : 0;
    const bandWidth = Math.max(...rows.map((r) => r.width), tag?.width ?? 0) + 2 * BAND.padX;
    const bandHeight = tagHeight + rows.length * lineHeight + 2 * BAND.padY;
    const left = Phaser.Math.Clamp(anchor.x - bandWidth / 2, BAND.margin, scene.scale.width - bandWidth - BAND.margin);
    const top = Math.max(anchor.y - bandHeight, BAND.margin);
    const band = scene.add.graphics().setDepth(DEPTH);
    band.fillStyle(BAND.color, BAND.alpha).fillRoundedRect(left, top, bandWidth, bandHeight, BAND.radius);
    tag?.setPosition(left + bandWidth / 2, top + BAND.padY);
    rows.forEach((r, i) => r.setPosition(left + (bandWidth - r.width) / 2, top + BAND.padY + tagHeight + i * lineHeight));
    this.objects = [band, ...(tag ? [tag] : []), ...rows];

    const total = lines.reduce((n, l) => n + l.length, 0);
    const show = (n: number) => {
      let remaining = n;
      rows.forEach((r, i) => {
        r.setText(lines[i]!.slice(0, Math.max(0, remaining)));
        remaining -= lines[i]!.length;
      });
    };
    const speed = settings.textSpeed;
    const started = scene.time.now;
    show(0);
    this.typing = scene.time.addEvent({
      delay: 25,
      loop: true,
      callback: () => {
        const n = charsShown(scene.time.now - started, speed, total);
        show(n);
        if (n >= total) this.complete?.();
      },
    });

    let done = false;
    this.finish = () => {
      if (done) return;
      done = true;
      this.clear();
      onDone();
    };
    this.complete = () => {
      this.typing?.remove();
      this.typing = undefined;
      this.complete = undefined;
      show(total);
      // The reading time (from the text speed) starts once the whole line is visible.
      const reading = (1500 + line.length * 50) * TEXT_SPEEDS[speed] - typingTime(total, speed);
      this.timer = scene.time.delayedCall(Math.max(1200, reading), () => this.finish?.());
    };
  }

  /** A click: completes a line that's still typing; otherwise moves on to the next. */
  skip(): void {
    if (this.complete) this.complete();
    else this.finish?.();
  }

  /** Ends the current line at once, typed or not (Skip ⏭). */
  finishNow(): void {
    this.finish?.();
  }

  private clear(): void {
    this.typing?.remove();
    this.timer?.remove();
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
    this.typing = this.timer = this.line = this.complete = undefined;
    this.finish = undefined;
  }
}
