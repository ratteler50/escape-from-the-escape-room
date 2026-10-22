import * as Phaser from 'phaser';
import type { Point } from '../core/geometry';
import { isExit } from '../core/engine';
import type { CharacterId, Hotspot, Room } from '../core/types';

const COLORS = {
  wall: 0x2b2238,
  floor: 0x3d3328,
  floorOutline: 0x5c4d3c,
  hotspot: 0x6b5b8c,
  character: 0x4f8a5b,
  text: '#ffffff',
  highlight: 0xffe28a,
};

export interface RoomViewHandlers {
  onHover: (hotspot: Hotspot | undefined, pointer: Phaser.Input.Pointer) => void;
  onClick: (hotspot: Hotspot, pointer: Phaser.Input.Pointer) => void;
}

/**
 * Draws a room (wall, floor) and its hotspots as placeholder art, and reports hotspot hovers and
 * clicks. Knows nothing about rules: it draws the hotspots it's given.
 */
export class RoomView {
  private background: Phaser.GameObjects.Graphics | undefined;
  private drawn: { hotspot: Hotspot; objects: Phaser.GameObjects.GameObject[] }[] = [];
  private highlighted: Phaser.GameObjects.Rectangle | undefined;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly handlers: RoomViewHandlers,
  ) {}

  /** Draws a room's background. Call again with another room to switch. */
  showRoom(room: Room): void {
    this.background?.destroy();
    const floor = room.walkable.map((p) => new Phaser.Math.Vector2(p.x, p.y));
    this.background = this.scene.add.graphics().setDepth(0);
    this.background.fillStyle(COLORS.wall).fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    this.background.fillStyle(COLORS.floor).fillPoints(floor, true);
    this.background.lineStyle(2, COLORS.floorOutline).strokePoints(floor, true);
  }

  /** Replaces the drawn hotspots. Hotspots can appear, vanish, or move with game state. */
  showHotspots(hotspots: readonly Hotspot[]): void {
    this.clearHighlight();
    this.drawn.forEach(({ objects }) => objects.forEach((o) => o.destroy()));
    this.drawn = hotspots.map((hotspot) => ({ hotspot, objects: this.draw(hotspot) }));
  }

  /** Where a character's lines go: above the hotspot that is that character, if one is drawn. */
  speakerAnchor(character: CharacterId): Point | undefined {
    const hotspot = this.drawn.find(({ hotspot }) => hotspot.character === character)?.hotspot;
    return hotspot && { x: hotspot.bounds.x + hotspot.bounds.width / 2, y: hotspot.bounds.y - 12 };
  }

  /** Removes the hover outline (pointer left, coin opened, a scene started). */
  clearHighlight(): void {
    this.highlighted?.setStrokeStyle();
    this.highlighted = undefined;
  }

  get hotspotIds(): string[] {
    return this.drawn.map(({ hotspot }) => hotspot.id);
  }

  /**
   * Slides a character's drawn hotspot so its feet (bottom-centre) end at `to`, then calls
   * `onDone`. Returns a function that finishes the walk immediately. Presentation only: the next
   * hotspot redraw puts the character wherever the content says.
   */
  walkCharacter(character: CharacterId, to: Point, speed: number, onDone: () => void): () => void {
    const entry = this.drawn.find(({ hotspot }) => hotspot.character === character);
    if (!entry) {
      onDone();
      return () => {};
    }
    const { bounds } = entry.hotspot;
    const dx = to.x - (bounds.x + bounds.width / 2);
    const dy = to.y - (bounds.y + bounds.height);
    const targets = entry.objects as unknown as { x: number; y: number }[];
    const starts = targets.map((o) => ({ x: o.x, y: o.y }));
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      tween.stop();
      targets.forEach((o, i) => ((o.x = starts[i]!.x + dx), (o.y = starts[i]!.y + dy)));
      onDone();
    };
    const tween = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: (Math.hypot(dx, dy) / speed) * 1000,
      onUpdate: (t) => {
        const k = t.getValue() ?? 0;
        targets.forEach((o, i) => ((o.x = starts[i]!.x + dx * k), (o.y = starts[i]!.y + dy * k)));
      },
      onComplete: finish,
    });
    return finish;
  }

  private draw(hotspot: Hotspot): Phaser.GameObjects.GameObject[] {
    const { x, y, width, height } = hotspot.bounds;
    // Placeholder art: a labelled rectangle. Real art will replace this in M4.
    const color = hotspot.character ? COLORS.character : COLORS.hotspot;
    // Exits get an arrow cursor pointing toward their side of the screen; everything else the hand.
    const cursor = isExit(hotspot) ? (x + width / 2 < this.scene.scale.width / 2 ? 'w-resize' : 'e-resize') : 'pointer';
    const shape = this.scene.add.rectangle(x, y, width, height, color).setOrigin(0, 0).setDepth(10).setInteractive({ cursor });
    // Labels sit at the top edge so a character standing in front of a hotspot doesn't hide its name.
    const label = this.scene.add
      .text(x + width / 2, y + 14, hotspot.character ? hotspot.name.toUpperCase() : hotspot.name, { fontSize: '18px', color: COLORS.text })
      .setOrigin(0.5)
      .setDepth(11);

    shape.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      this.clearHighlight();
      this.highlighted = shape.setStrokeStyle(3, COLORS.highlight);
      this.handlers.onHover(hotspot, pointer);
    });
    shape.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      if (this.highlighted === shape) this.clearHighlight();
      this.handlers.onHover(undefined, pointer);
    });
    shape.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.handlers.onClick(hotspot, pointer);
    });
    return [shape, label];
  }
}
