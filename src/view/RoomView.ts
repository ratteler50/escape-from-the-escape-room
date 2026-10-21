import * as Phaser from 'phaser';
import type { Point } from '../core/geometry';
import type { CharacterId, Hotspot, Room } from '../core/types';

const COLORS = {
  wall: 0x2b2238,
  floor: 0x3d3328,
  floorOutline: 0x5c4d3c,
  hotspot: 0x6b5b8c,
  character: 0x4f8a5b,
  text: '#ffffff',
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
    this.drawn.forEach(({ objects }) => objects.forEach((o) => o.destroy()));
    this.drawn = hotspots.map((hotspot) => ({ hotspot, objects: this.draw(hotspot) }));
  }

  /** Where a character's lines go: above the hotspot that is that character, if one is drawn. */
  speakerAnchor(character: CharacterId): Point | undefined {
    const hotspot = this.drawn.find(({ hotspot }) => hotspot.character === character)?.hotspot;
    return hotspot && { x: hotspot.bounds.x + hotspot.bounds.width / 2, y: hotspot.bounds.y - 12 };
  }

  get hotspotIds(): string[] {
    return this.drawn.map(({ hotspot }) => hotspot.id);
  }

  private draw(hotspot: Hotspot): Phaser.GameObjects.GameObject[] {
    const { x, y, width, height } = hotspot.bounds;
    // Placeholder art: a labelled rectangle. Real art will replace this in M4.
    const color = hotspot.character ? COLORS.character : COLORS.hotspot;
    const shape = this.scene.add.rectangle(x, y, width, height, color).setOrigin(0, 0).setDepth(10).setInteractive({ useHandCursor: true });
    // Labels sit at the top edge so a character standing in front of a hotspot doesn't hide its name.
    const label = this.scene.add
      .text(x + width / 2, y + 14, hotspot.character ? hotspot.name.toUpperCase() : hotspot.name, { fontSize: '18px', color: COLORS.text })
      .setOrigin(0.5)
      .setDepth(11);

    shape.on('pointerover', (pointer: Phaser.Input.Pointer) => this.handlers.onHover(hotspot, pointer));
    shape.on('pointerout', (pointer: Phaser.Input.Pointer) => this.handlers.onHover(undefined, pointer));
    shape.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.handlers.onClick(hotspot, pointer);
    });
    return [shape, label];
  }
}
