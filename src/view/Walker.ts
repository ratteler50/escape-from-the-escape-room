import * as Phaser from 'phaser';
import type { WalkFrames } from '../core/types';
import { artKey, SPRITE_SCALE, walkSheetKey } from './textureKeys';

/** Without a walk sheet: a small hop per step and a lean into the walk, on the standing sprite (slice 19). */
const HOP = { height: 5, periodMs: 150, leanDegrees: 3 };

/** The key of a walk's animation. */
const walkAnimKey = (sheet: string) => `walk-anim:${sheet}`;

/**
 * A character's sprite as it walks and stands, in a container whose origin is their feet. Drawn
 * facing right, mirrored to face left. With a walk sheet, it plays the sheet's cycle while walking
 * and shows the sheet's standing pose otherwise; without one, the standing sprite hops. Knows
 * nothing about where they go: the caller moves the root and says when the walk starts and stops.
 */
export class Walker {
  readonly root: Phaser.GameObjects.Container;
  /** The standing pose's height on screen, for speech anchors. */
  readonly height: number;
  private readonly sprite: Phaser.GameObjects.Sprite;
  /** The walk animation's key, when there's a sheet; otherwise the sprite hops. */
  private readonly anim: string | undefined;
  private hop: Phaser.Tweens.Tween | undefined;
  /** The shared sprite scale times this character's size. */
  private readonly scale: number;

  constructor(
    private readonly scene: Phaser.Scene,
    standing: string,
    walk: WalkFrames | undefined,
    /** The character's size relative to the shared sprite scale (Character.scale). */
    size = 1,
  ) {
    this.scale = SPRITE_SCALE * size;
    const sheet = walk && scene.textures.exists(walkSheetKey(walk.sheet)) ? walk : undefined;
    if (sheet) {
      this.anim = walkAnimKey(sheet.sheet);
      if (!scene.anims.exists(this.anim)) {
        scene.anims.create({
          key: this.anim,
          frames: scene.anims.generateFrameNumbers(walkSheetKey(sheet.sheet), { start: 1, end: sheet.frames }),
          frameRate: sheet.fps,
          repeat: -1,
        });
      }
      this.sprite = scene.add.sprite(0, 0, walkSheetKey(sheet.sheet), 0);
    } else {
      this.sprite = scene.add.sprite(0, 0, artKey(standing));
    }
    this.sprite.setOrigin(0.5, 1);
    this.root = scene.add.container(0, 0, [this.sprite]).setScale(this.scale);
    this.height = this.sprite.height * this.scale;
  }

  face(direction: 'left' | 'right'): void {
    this.root.scaleX = (direction === 'left' ? -1 : 1) * this.scale;
  }

  /** Starts the walk cycle (or the hop); the caller moves the root. */
  start(): void {
    this.stop();
    if (this.anim) {
      this.sprite.play(this.anim);
      return;
    }
    // The lean is drawn facing right; mirroring the root mirrors it too.
    this.sprite.setAngle(HOP.leanDegrees);
    this.hop = this.scene.tweens.add({
      targets: this.sprite,
      y: -HOP.height / this.scale,
      duration: HOP.periodMs / 2,
      ease: 'Sine.easeOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /** Back to the standing pose at once: arriving, skipping, or entering a room. */
  stop(): void {
    this.hop?.remove();
    this.hop = undefined;
    if (this.anim) this.sprite.stop().setFrame(0);
    this.sprite.setPosition(0, 0).setAngle(0);
  }
}
