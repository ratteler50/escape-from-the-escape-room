import * as Phaser from 'phaser';
import { clampToPolygon, distance, type Point, type Polygon } from '../core/geometry';

const WALK_SPEED = 300; // logical pixels per second
const SIZE = { width: 50, height: 120 };

/** Dana on screen: a placeholder rectangle that walks in straight lines. */
export class PlayerSprite {
  private readonly container: Phaser.GameObjects.Container;
  private walkTween: Phaser.Tweens.Tween | undefined;

  constructor(
    private readonly scene: Phaser.Scene,
    at: Point,
  ) {
    // The container's origin is Dana's feet, so its position is her spot on the floor.
    const body = scene.add.rectangle(0, 0, SIZE.width, SIZE.height, 0x3fa7d6).setOrigin(0.5, 1);
    const label = scene.add.text(0, -SIZE.height / 2, 'DANA', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.container = scene.add.container(at.x, at.y, [body, label]).setDepth(500);
  }

  get position(): Point {
    return { x: this.container.x, y: this.container.y };
  }

  get isWalking(): boolean {
    return this.walkTween !== undefined;
  }

  /** Where Dana's lines go. */
  get headAnchor(): Point {
    return { x: this.container.x, y: this.container.y - SIZE.height - 12 };
  }

  /** Jump straight to a point, cancelling any walk (e.g. arriving in a new room). */
  placeAt(at: Point): void {
    this.stop();
    this.container.setPosition(at.x, at.y);
  }

  /**
   * Walk in a straight line to `target`, clamped to the walkable area, then call `onArrive` with
   * where she ended up. A new walk cancels the old one, and its `onArrive` never fires.
   */
  walkTo(target: Point, walkable: Polygon, onArrive: (at: Point) => void): void {
    this.stop();
    const to = clampToPolygon(target, walkable);
    this.walkTween = this.scene.tweens.add({
      targets: this.container,
      x: to.x,
      y: to.y,
      duration: (distance(this.position, to) / WALK_SPEED) * 1000,
      onComplete: () => {
        this.walkTween = undefined;
        onArrive(to);
      },
    });
  }

  private stop(): void {
    this.walkTween?.stop();
    this.walkTween = undefined;
  }
}
