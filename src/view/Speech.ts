import * as Phaser from 'phaser';
import type { Point } from '../core/geometry';

const DEPTH = 900;
const BLOCKER_DEPTH = 1800;

/**
 * Shows one line of speech at a time, above whoever is speaking. While a line is showing, a
 * full-screen blocker turns any click into "skip to the next line" and stops everything else.
 */
export class Speech {
  private text: Phaser.GameObjects.Text | undefined;
  private timer: Phaser.Time.TimerEvent | undefined;
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

  get current(): string | undefined {
    return this.text?.text;
  }

  /** Blocks input to the room (clicks skip lines). On while effects are playing, off when idle. */
  setBlocking(on: boolean): void {
    if (on) this.blocker.setVisible(true).setInteractive();
    else this.blocker.disableInteractive().setVisible(false);
  }

  /** Shows `line` above `anchor` until its reading time passes or the player clicks. */
  say(line: string, color: string, anchor: Point, onDone: () => void): void {
    this.text?.destroy();
    this.text = this.scene.add
      .text(0, 0, line, {
        fontSize: '22px',
        color,
        align: 'center',
        wordWrap: { width: 520 },
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH);
    // Keep the whole line on screen even when the speaker is near an edge.
    const halfWidth = this.text.width / 2;
    this.text.setPosition(
      Phaser.Math.Clamp(anchor.x, halfWidth + 10, this.scene.scale.width - halfWidth - 10),
      Math.max(anchor.y, this.text.height + 10),
    );

    let done = false;
    this.finish = () => {
      if (done) return;
      done = true;
      this.timer?.remove();
      this.text?.destroy();
      this.text = undefined;
      this.finish = undefined;
      onDone();
    };
    const readingTime = 1500 + line.length * 50;
    this.timer = this.scene.time.delayedCall(readingTime, () => this.finish?.());
  }

  /** Ends the current line now, if there is one. */
  skip(): void {
    this.finish?.();
  }
}
