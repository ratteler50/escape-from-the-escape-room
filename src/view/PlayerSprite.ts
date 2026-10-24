import * as Phaser from 'phaser';
import { font } from './ui';
import { MIN_LABEL } from './textSize';
import { clampToPolygon, distance, type Point, type Polygon } from '../core/geometry';
import type { WalkFrames } from '../core/types';
import { ART_ENABLED, artKey } from './RoomView';
import { Walker } from './Walker';

export const WALK_SPEED = 300; // logical pixels per second
/** The placeholder rectangle, when there's no sprite (or `?art=off`). */
const SIZE = { width: 50, height: 120 };

/**
 * Dana on screen: their sprite (or a placeholder rectangle) that walks in straight lines and faces
 * where they go.
 */
export class PlayerSprite {
  private readonly container: Phaser.GameObjects.Container;
  /** Dana's painted sprite and walk. Absent when drawn as a placeholder. */
  private readonly walker: Walker | undefined;
  /** The placeholder's facing: a small triangle at head height. */
  private readonly facingMarker: Phaser.GameObjects.Triangle | undefined;
  private readonly height: number;
  private facingDirection: 'left' | 'right' = 'right';
  private walk: { tween: Phaser.Tweens.Tween; to: Point; onArrive: (at: Point) => void } | undefined;

  constructor(
    private readonly scene: Phaser.Scene,
    at: Point,
    spritePath?: string,
    walk?: WalkFrames,
  ) {
    // The container's origin is Dana's feet, so its position is their spot on the floor.
    if (ART_ENABLED && spritePath !== undefined && scene.textures.exists(artKey(spritePath))) {
      this.walker = new Walker(scene, spritePath, walk);
      this.height = this.walker.height;
      this.container = scene.add.container(at.x, at.y, [this.walker.root]).setDepth(500);
      return;
    }
    const body = scene.add.rectangle(0, 0, SIZE.width, SIZE.height, 0x3fa7d6).setOrigin(0.5, 1);
    const label = scene.add.text(0, -SIZE.height / 2, 'DANA', { ...font(scene, 16, { min: MIN_LABEL }), color: '#ffffff' }).setOrigin(0.5);
    this.facingMarker = scene.add.triangle(SIZE.width / 2 + 8, -SIZE.height + 22, 0, 0, 12, 8, 0, 16, 0xffe28a);
    this.height = SIZE.height;
    this.container = scene.add.container(at.x, at.y, [body, label, this.facingMarker]).setDepth(500);
  }

  get position(): Point {
    return { x: this.container.x, y: this.container.y };
  }

  get isWalking(): boolean {
    return this.walk !== undefined;
  }

  get facing(): 'left' | 'right' {
    return this.facingDirection;
  }

  /** Where Dana's lines go. */
  get headAnchor(): Point {
    return { x: this.container.x, y: this.container.y - this.height - 12 };
  }

  face(direction: 'left' | 'right'): void {
    this.facingDirection = direction;
    const side = direction === 'left' ? -1 : 1;
    this.walker?.face(direction);
    this.facingMarker?.setScale(side, 1).setX(side * (SIZE.width / 2 + 8));
  }

  /** Jump straight to a point, cancelling any walk (e.g. arriving in a new room). */
  placeAt(at: Point): void {
    this.walk?.tween.stop();
    this.walker?.stop();
    this.walk = undefined;
    this.container.setPosition(at.x, at.y);
  }

  /**
   * Walk in a straight line to `target`, clamped to the walkable area, then call `onArrive` with
   * where they ended up. A new walk cancels the old one, and its `onArrive` never fires.
   */
  walkTo(target: Point, walkable: Polygon, onArrive: (at: Point) => void): void {
    this.walk?.tween.stop();
    const to = clampToPolygon(target, walkable);
    if (Math.abs(to.x - this.container.x) > 1) this.face(to.x < this.container.x ? 'left' : 'right');
    const tween = this.scene.tweens.add({
      targets: this.container,
      x: to.x,
      y: to.y,
      duration: (distance(this.position, to) / WALK_SPEED) * 1000,
      onComplete: () => this.arrive(),
    });
    this.walker?.start();
    this.walk = { tween, to, onArrive };
  }

  /** Ends the current walk now, at its destination, as if it had finished (used by Skip). */
  finishWalk(): void {
    if (!this.walk) return;
    this.walk.tween.stop();
    this.container.setPosition(this.walk.to.x, this.walk.to.y);
    this.arrive();
  }

  private arrive(): void {
    const walk = this.walk;
    if (!walk) return;
    this.walker?.stop();
    this.walk = undefined;
    walk.onArrive(walk.to);
  }
}
