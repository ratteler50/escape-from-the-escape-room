import * as Phaser from 'phaser';
import { availableOptions, availableVerbs, currentRoom, handle, visibleHotspots } from '../core/engine';
import { clampToPolygon, distance, type Point } from '../core/geometry';
import { PLAYER, type CharacterId, type Command, type Effect, type GameState, type Hotspot, type ItemId, type Room, type Verb, type World } from '../core/types';
import { DialoguePanel } from './DialoguePanel';
import { showEndCard } from './EndCard';
import { InventoryBar } from './InventoryBar';
import { VerbCoin } from './VerbCoin';

const WALK_SPEED = 300; // logical pixels per second
const PLAYER_SIZE = { width: 50, height: 120 };
const INVENTORY_TOP = 630;
const VERB_ICONS: Record<Verb, string> = { look: '👁', take: '✋', talk: '💬', use: '⚙' };
const COLORS = {
  wall: 0x2b2238,
  floor: 0x3d3328,
  floorOutline: 0x5c4d3c,
  hotspot: 0x6b5b8c,
  character: 0x4f8a5b,
  player: 0x3fa7d6,
  text: '#ffffff',
};

/**
 * Draws the current room from content and turns clicks into core commands.
 * Holds no puzzle logic: everything the player "learns" comes back from the core as effects.
 *
 * View-only state: the held item (picked "Use with…", not used yet) and the effect queue (effects
 * the core returned that are still being played, one line at a time).
 */
export class RoomScene extends Phaser.Scene {
  private world!: World;
  private state!: GameState;
  private room!: Room;
  /** What the scene was started with, so Play again can restart from the same place. */
  private startData!: { world: World; state: GameState };

  private player!: Phaser.GameObjects.Container;
  private caption!: Phaser.GameObjects.Text;
  private inventory!: InventoryBar;
  private coin!: VerbCoin;
  private dialogue!: DialoguePanel;
  private walkTween: Phaser.Tweens.Tween | undefined;

  private drawnHotspots: { hotspot: Hotspot; objects: Phaser.GameObjects.GameObject[] }[] = [];
  private held: ItemId | undefined;
  /** Name of the hotspot or item under the pointer, for the caption. */
  private hovered: string | undefined;

  /** Effects still to play. While non-empty or a line is showing, clicks only skip lines. */
  private queue: Effect[] = [];
  private busy = false;
  private skipBlocker!: Phaser.GameObjects.Rectangle;
  private speech: Phaser.GameObjects.Text | undefined;
  private speechTimer: Phaser.Time.TimerEvent | undefined;
  private finishLine: (() => void) | undefined;

  constructor() {
    super('RoomScene');
  }

  init(data: { world: World; state: GameState }): void {
    this.startData = data;
    this.world = data.world;
    this.state = data.state;
    this.room = currentRoom(this.world, this.state);
    this.held = undefined;
    this.hovered = undefined;
    this.queue = [];
    this.busy = false;
    this.drawnHotspots = [];
  }

  create(): void {
    this.input.mouse?.disableContextMenu();
    this.drawRoom();
    this.refreshHotspots();
    this.player = this.createPlayer(this.state.player);
    this.caption = this.add.text(0, 0, '', { fontSize: '22px', color: COLORS.text, stroke: '#000000', strokeThickness: 4 }).setDepth(1500).setVisible(false);
    this.coin = new VerbCoin(this);
    this.dialogue = new DialoguePanel(this);
    this.inventory = new InventoryBar(this, INVENTORY_TOP, {
      onClick: (itemId, pointer) => this.clickItem(itemId, pointer),
      onHover: (itemId) => this.hover(itemId && this.world.items[itemId]?.name),
      onEmptyClick: () => this.putAway(),
    });
    this.refreshInventory();

    // While lines are playing, this covers everything: a click skips the current line, nothing else.
    // Nearly transparent rather than invisible: Phaser skips input on objects that don't render.
    this.skipBlocker = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.001)
      .setOrigin(0, 0)
      .setDepth(1800)
      .setVisible(false);
    this.skipBlocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.finishLine?.();
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.moveCaption(pointer));
    this.input.keyboard?.on('keydown-ESC', () => this.putAway());
    // Clicks on hotspots, items, the bar, panels, and the coin stop propagation, so this is a floor click.
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.held) return this.putAway();
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

  /** Redraws the hotspots that exist right now. Hotspots can appear, vanish, or move with game state. */
  private refreshHotspots(): void {
    this.drawnHotspots.forEach(({ objects }) => objects.forEach((o) => o.destroy()));
    this.drawnHotspots = visibleHotspots(this.world, this.state).map((hotspot) => ({ hotspot, objects: this.createHotspot(hotspot) }));
    if (this.caption) this.hover(undefined);
  }

  private createHotspot(hotspot: Hotspot): Phaser.GameObjects.GameObject[] {
    const { x, y, width, height } = hotspot.bounds;
    // Placeholder art: a labelled rectangle. Real art will replace this in M4.
    const color = hotspot.character ? COLORS.character : COLORS.hotspot;
    const shape = this.add.rectangle(x, y, width, height, color).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    // Labels sit at the top edge so a character standing in front of a hotspot doesn't hide its name.
    const label = this.add
      .text(x + width / 2, y + 14, hotspot.character ? hotspot.name.toUpperCase() : hotspot.name, { fontSize: '18px', color: COLORS.text })
      .setOrigin(0.5);

    shape.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      this.moveCaption(pointer);
      this.hover(hotspot.name);
    });
    shape.on('pointerout', () => this.hover(undefined));
    shape.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.clickHotspot(hotspot, pointer);
    });
    return [shape, label];
  }

  private clickHotspot(hotspot: Hotspot, pointer: Phaser.Input.Pointer): void {
    if (this.held) {
      const itemId = this.held;
      this.putAway();
      if (pointer.rightButtonDown()) return;
      return this.walkThenDispatch(hotspot, { type: 'useItemOn', itemId, hotspotId: hotspot.id });
    }

    this.hover(undefined);
    // Right-click is an optional shortcut for Look; nothing requires it (decision 0004).
    if (pointer.rightButtonDown()) return this.walkThenDispatch(hotspot, { type: 'verb', verb: 'look', hotspotId: hotspot.id });

    const options = availableVerbs(this.world, this.state, hotspot.id);
    const verb = (v: Verb): Command => ({ type: 'verb', verb: v, hotspotId: hotspot.id });
    if (options.length === 1) return this.walkThenDispatch(hotspot, verb(options[0]!.verb));
    this.coin.open(
      { x: pointer.worldX, y: pointer.worldY },
      hotspot.name,
      options.map((o) => ({ id: o.verb, icon: VERB_ICONS[o.verb], label: o.label })),
      (v) => this.walkThenDispatch(hotspot, verb(v)),
    );
  }

  private clickItem(itemId: ItemId, pointer: Phaser.Input.Pointer): void {
    if (this.held) {
      const heldId = this.held;
      this.putAway();
      // Combining happens in Dana's hands: no walking.
      if (heldId !== itemId) this.dispatch({ type: 'combine', itemIds: [heldId, itemId] });
      return;
    }

    this.hover(undefined);
    const name = this.world.items[itemId]?.name ?? itemId;
    if (pointer.rightButtonDown()) return this.dispatch({ type: 'lookItem', itemId });
    this.coin.open(
      { x: pointer.worldX, y: pointer.worldY },
      name,
      [
        { id: 'look', icon: VERB_ICONS.look, label: 'Look' },
        { id: 'useWith', icon: '✋', label: 'Use with…' },
      ],
      (choice) => (choice === 'look' ? this.dispatch({ type: 'lookItem', itemId }) : this.hold(itemId)),
    );
  }

  private hold(itemId: ItemId): void {
    this.held = itemId;
    this.refreshInventory();
    this.updateCaption();
  }

  private putAway(): void {
    if (!this.held) return;
    this.held = undefined;
    this.refreshInventory();
    this.updateCaption();
  }

  private hover(name: string | undefined): void {
    this.hovered = name;
    this.updateCaption();
  }

  private updateCaption(): void {
    const heldName = this.held && (this.world.items[this.held]?.name ?? this.held);
    if (heldName) {
      this.caption.setText(`Use ${heldName} with${this.hovered ? ` ${this.hovered}` : '…'}`).setVisible(true);
    } else {
      this.caption.setText(this.hovered ?? '').setVisible(this.hovered !== undefined && !this.coin.isOpen);
    }
  }

  private moveCaption(pointer: Phaser.Input.Pointer): void {
    // Keep the caption on screen near the right edge.
    const x = Math.min(pointer.worldX + 16, this.scale.width - this.caption.width - 8);
    this.caption.setPosition(x, pointer.worldY - 32);
  }

  private refreshInventory(): void {
    const items = this.state.inventory.flatMap((id) => this.world.items[id] ?? []);
    this.inventory.render(items, this.held);
  }

  private createPlayer(at: Point): Phaser.GameObjects.Container {
    // The container's origin is the player's feet, so its position is their spot on the floor.
    const body = this.add.rectangle(0, 0, PLAYER_SIZE.width, PLAYER_SIZE.height, COLORS.player).setOrigin(0.5, 1);
    const label = this.add.text(0, -PLAYER_SIZE.height / 2, 'DANA', { fontSize: '16px', color: COLORS.text }).setOrigin(0.5);
    return this.add.container(at.x, at.y, [body, label]).setDepth(500);
  }

  private walkThenDispatch(hotspot: Hotspot, command: Command): void {
    this.walkTo(hotspot.interactionPoint, () => this.dispatch(command));
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
    this.queue.push(...result.effects);
    if (!this.busy) this.playNext();
  }

  /**
   * Plays queued effects in order. `say` waits for its line to finish (or a click); everything else
   * plays instantly. The core's state is already final; the queue only paces the presentation.
   */
  private playNext(): void {
    const effect = this.queue.shift();
    if (!effect) return this.idle();

    this.busy = true;
    this.skipBlocker.setVisible(true).setInteractive();
    this.hover(undefined);
    switch (effect.type) {
      case 'say':
        return this.say(effect.text, effect.speaker ?? PLAYER, () => this.playNext());
      case 'addItem':
      case 'removeItem':
        this.refreshInventory();
        break;
      case 'setFlag':
        this.refreshHotspots();
        break;
      case 'startDialogue':
      case 'endDialogue':
        break;
      case 'win':
        // The end card takes over input; the core's state stays as it is (won).
        this.skipBlocker.disableInteractive().setVisible(false);
        return showEndCard(this, () => this.scene.restart(this.startData));
    }
    this.playNext();
  }

  /** The queue is empty: hand control back to the player, in the room or in the conversation. */
  private idle(): void {
    this.busy = false;
    this.skipBlocker.disableInteractive().setVisible(false);
    if (this.state.conversation) {
      this.dialogue.show(availableOptions(this.world, this.state), (optionId) => this.dispatch({ type: 'chooseOption', optionId }));
    } else {
      this.dialogue.hide();
    }
  }

  private say(text: string, speaker: CharacterId, onDone: () => void): void {
    this.speech?.destroy();
    this.speech = this.add
      .text(0, 0, text, {
        fontSize: '22px',
        color: this.world.characters[speaker]?.color ?? COLORS.text,
        align: 'center',
        wordWrap: { width: 520 },
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(900);
    this.positionSpeech(speaker);

    let done = false;
    this.finishLine = () => {
      if (done) return;
      done = true;
      this.speechTimer?.remove();
      this.speech?.destroy();
      this.speech = undefined;
      this.finishLine = undefined;
      onDone();
    };
    const readingTime = 1500 + text.length * 50;
    this.speechTimer = this.time.delayedCall(readingTime, () => this.finishLine?.());
  }

  /** Above the speaker's head (Dana, or the hotspot that is that character), kept fully on screen. */
  private positionSpeech(speaker: CharacterId): void {
    if (!this.speech) return;
    const hotspot = this.drawnHotspots.find(({ hotspot }) => hotspot.character === speaker)?.hotspot;
    const anchor =
      speaker !== PLAYER && hotspot
        ? { x: hotspot.bounds.x + hotspot.bounds.width / 2, y: hotspot.bounds.y - 12 }
        : { x: this.player.x, y: this.player.y - PLAYER_SIZE.height - 12 };
    const halfWidth = this.speech.width / 2;
    this.speech.setPosition(
      Phaser.Math.Clamp(anchor.x, halfWidth + 10, this.scale.width - halfWidth - 10),
      Math.max(anchor.y, this.speech.height + 10),
    );
  }
}
