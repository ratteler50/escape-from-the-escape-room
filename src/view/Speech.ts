import * as Phaser from 'phaser';
import type { Point } from '../core/geometry';
import { TEXT_SPEEDS, settings } from './storage';
import { charsShown, typingTime } from './typewriter';

const DEPTH = 900;
const BLOCKER_DEPTH = 1800;
const TAG_HEIGHT = 22;

/**
 * Shows one line of speech at a time, above whoever is speaking, typing it out at the text speed.
 * While a line is showing, a full-screen blocker turns any click into "complete the line" (if it's
 * still typing) or "next line", and stops everything else.
 */
export class Speech {
  private text: Phaser.GameObjects.Text | undefined;
  private tag: Phaser.GameObjects.Text | undefined;
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
   * Types `line` out above `anchor`, then leaves it up for its reading time or until a click.
   * `name` adds a small tag above the line (used for everyone but Dana).
   */
  say(line: string, color: string, anchor: Point, onDone: () => void, name?: string): void {
    this.clear();
    this.line = line;
    const text = this.scene.add
      .text(0, 0, line, {
        fontSize: '22px',
        color,
        align: 'center',
        wordWrap: { width: 520 },
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH);
    this.text = text;

    // Lay the full line out once, then keep that layout: untyped characters are shown as spaces
    // (the font is monospaced), so nothing shifts while it types.
    const wrapped = text.getWrappedText(line).join('\n');
    text.setText(wrapped);
    const halfWidth = text.width / 2;
    const top = Math.max(anchor.y - text.height, 10 + (name ? TAG_HEIGHT : 0));
    const x = Phaser.Math.Clamp(anchor.x, halfWidth + 10, this.scene.scale.width - halfWidth - 10);
    text.setPosition(x, top);
    if (name) {
      this.tag = this.scene.add
        .text(x, top - 2, name.toUpperCase(), { fontSize: '16px', color, stroke: '#000000', strokeThickness: 3 })
        .setOrigin(0.5, 1)
        .setDepth(DEPTH);
    }

    const speed = settings.textSpeed;
    const show = (n: number) => text.setText(wrapped.slice(0, n) + wrapped.slice(n).replace(/[^\n]/g, ' '));
    const started = this.scene.time.now;
    show(0);
    this.typing = this.scene.time.addEvent({
      delay: 25,
      loop: true,
      callback: () => {
        const n = charsShown(this.scene.time.now - started, speed, wrapped.length);
        show(n);
        if (n >= wrapped.length) this.complete?.();
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
      show(wrapped.length);
      // The reading time (from the text speed) starts once the whole line is visible.
      const reading = (1500 + line.length * 50) * TEXT_SPEEDS[speed] - typingTime(wrapped.length, speed);
      this.timer = this.scene.time.delayedCall(Math.max(1200, reading), () => this.finish?.());
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
    this.text?.destroy();
    this.tag?.destroy();
    this.typing = this.timer = this.text = this.tag = this.line = this.complete = undefined;
    this.finish = undefined;
  }
}
