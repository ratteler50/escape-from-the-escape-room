import * as Phaser from 'phaser';
import { handle, currentRoom } from '../core/engine';
import { clampToPolygon, distance, type Point } from '../core/geometry';
import type { Command, Effect, GameState, Hotspot, Room, World } from '../core/types';

const WALK_SPEED = 300; // logical pixels per second
const PLAYER_SIZE = { width: 50, height: 120 };
const COLORS = {
  wall: 0x2b2238,
  floor: 0x3d3328,
  floorOutline: 0x5c4d3c,
  hotspot: 0x6b5b8c,
  player: 0x3fa7d6,
  text: '#ffffff',
  speech: '#ffe28a',
};

/**
 * Draws the current room from content and turns clicks into core commands.
 * Holds no puzzle logic: everything the player "learns" comes back from the core as effects.
 */
export class RoomScene extends Phaser.Scene {
  private world!: World;
  private state!: GameState;
  private room!: Room;

  private player!: Phaser.GameObjects.Container;
  private hoverLabel!: Phaser.GameObjects.Text;
  private speech: Phaser.GameObjects.Text | undefined;
  private speechTimer: Phaser.Time.TimerEvent | undefined;
  private walkTween: Phaser.Tweens.Tween | undefined;

  constructor() {
    super('RoomScene');
  }

  init(data: { world: World; state: GameState }): void {
    this.world = data.world;
    this.state = data.state;
    this.room = currentRoom(this.world, this.state);
  }

  create(): void {
    this.input.mouse?.disableContextMenu();
    this.drawRoom();
    this.room.hotspots.forEach((hotspot) => this.createHotspot(hotspot));
    this.player = this.createPlayer(this.state.player);
    this.hoverLabel = this.add.text(0, 0, '', { fontSize: '22px', color: COLORS.text }).setDepth(1000).setVisible(false);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.hoverLabel.setPosition(pointer.worldX + 16, pointer.worldY - 28);
    });
    // Clicks that land on a hotspot are handled by the hotspot itself, which stops propagation.
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) this.walkTo({ x: pointer.worldX, y: pointer.worldY });
    });
  }

  private drawRoom(): void {
    const floor = this.room.walkable.map((p) => new Phaser.Math.Vector2(p.x, p.y));
    const g = this.add.graphics();
    g.fillStyle(COLORS.wall).fillRect(0, 0, this.scale.width, this.scale.height);
    g.fillStyle(COLORS.floor).fillPoints(floor, true);
    g.lineStyle(2, COLORS.floorOutline).strokePoints(floor, true);
  }

  private createHotspot(hotspot: Hotspot): void {
    const { x, y, width, height } = hotspot.bounds;
    // Placeholder art: a labelled rectangle. Real art will replace this in M4.
    const shape = this.add.rectangle(x, y, width, height, COLORS.hotspot).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    this.add.text(x + width / 2, y + height / 2, hotspot.name, { fontSize: '18px', color: COLORS.text }).setOrigin(0.5);

    shape.on('pointerover', () => this.hoverLabel.setText(hotspot.name).setVisible(true));
    shape.on('pointerout', () => this.hoverLabel.setVisible(false));
    shape.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        if (pointer.rightButtonDown()) {
          this.walkTo(hotspot.interactionPoint, () => this.dispatch({ type: 'look', hotspotId: hotspot.id }));
        } else {
          // Left-click interact arrives in a later slice; for now just walk over.
          this.walkTo(hotspot.interactionPoint);
        }
      },
    );
  }

  private createPlayer(at: Point): Phaser.GameObjects.Container {
    // The container's origin is the player's feet, so its position is their spot on the floor.
    const body = this.add.rectangle(0, 0, PLAYER_SIZE.width, PLAYER_SIZE.height, COLORS.player).setOrigin(0.5, 1);
    const label = this.add.text(0, -PLAYER_SIZE.height / 2, 'DANA', { fontSize: '16px', color: COLORS.text }).setOrigin(0.5);
    return this.add.container(at.x, at.y, [body, label]).setDepth(500);
  }

  /** Walk in a straight line to `target` (clamped to the walkable area), then run `onArrive`. */
  private walkTo(target: Point, onArrive?: () => void): void {
    this.walkTween?.stop();
    const from = { x: this.player.x, y: this.player.y };
    const to = clampToPolygon(target, this.room.walkable);

    this.walkTween = this.tweens.add({
      targets: this.player,
      x: to.x,
      y: to.y,
      duration: (distance(from, to) / WALK_SPEED) * 1000,
      onUpdate: () => this.speech?.setPosition(this.player.x, this.speechY()),
      onComplete: () => {
        this.walkTween = undefined;
        this.state = { ...this.state, player: to };
        onArrive?.();
      },
    });
  }

  private dispatch(command: Command): void {
    const result = handle(this.world, this.state, command);
    this.state = result.state;
    result.effects.forEach((effect) => this.play(effect));
  }

  private play(effect: Effect): void {
    switch (effect.type) {
      case 'say':
        this.say(effect.text);
        break;
    }
  }

  private say(text: string): void {
    this.speech?.destroy();
    this.speechTimer?.remove();
    this.speech = this.add
      .text(this.player.x, this.speechY(), text, {
        fontSize: '22px',
        color: COLORS.speech,
        align: 'center',
        wordWrap: { width: 520 },
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(900);
    // Keep the whole line on screen even when the player stands near an edge.
    const halfWidth = this.speech.width / 2;
    this.speech.setX(Phaser.Math.Clamp(this.player.x, halfWidth + 10, this.scale.width - halfWidth - 10));

    const readingTime = 1500 + text.length * 50;
    this.speechTimer = this.time.delayedCall(readingTime, () => {
      this.speech?.destroy();
      this.speech = undefined;
    });
  }

  private speechY(): number {
    return this.player.y - PLAYER_SIZE.height - 12;
  }
}
