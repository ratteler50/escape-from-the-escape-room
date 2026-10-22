import * as Phaser from 'phaser';
import { clampToPolygon, distance, type Point, type Polygon } from '../core/geometry';

export const WALK_SPEED = 300; // logical pixels per second
const SIZE = { width: 50, height: 120 };

/** Dana on screen: a placeholder rectangle that walks in straight lines and faces where they go. */
export class PlayerSprite {
  private readonly container: Phaser.GameObjects.Container;
  /** Placeholder for facing until real art: a small triangle at head height. */
  private readonly facingMarker: Phaser.GameObjects.Triangle;
  private walk: { tween: Phaser.Tweens.Tween; to: Point; onArrive: (at: Point) => void } | undefined;

  constructor(
    private readonly scene: Phaser.Scene,
    at: Point,
  ) {
    // The container's origin is Dana's feet, so its position is their spot on the floor.
    const body = scene.add.rectangle(0, 0, SIZE.width, SIZE.height, 0x3fa7d6).setOrigin(0.5, 1);
    const label = scene.add.text(0, -SIZE.height / 2, 'DANA', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.facingMarker = scene.add.triangle(SIZE.width / 2 + 8, -SIZE.height + 22, 0, 0, 12, 8, 0, 16, 0xffe28a);
    this.container = scene.add.container(at.x, at.y, [body, label, this.facingMarker]).setDepth(500);
  }

  get position(): Point {
    return { x: this.container.x, y: this.container.y };
  }

  get isWalking(): boolean {
    return this.walk !== undefined;
  }

  get facing(): 'left' | 'right' {
    return this.facingMarker.scaleX < 0 ? 'left' : 'right';
  }

  /** Where Dana's lines go. */
  get headAnchor(): Point {
    return { x: this.container.x, y: this.container.y - SIZE.height - 12 };
  }

  face(direction: 'left' | 'right'): void {
    const side = direction === 'left' ? -1 : 1;
    this.facingMarker.setScale(side, 1).setX(side * (SIZE.width / 2 + 8));
  }

  /** Jump straight to a point, cancelling any walk (e.g. arriving in a new room). */
  placeAt(at: Point): void {
    this.walk?.tween.stop();
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
    this.walk = undefined;
    walk.onArrive(walk.to);
  }
}
