import * as Phaser from 'phaser';
import { availableItemAction, availableOptions, availableVerbs, currentRoom, handle, visibleHotspots } from '../core/engine';
import type { Point } from '../core/geometry';
import { loadSaveFile, toSaveFile, type SlotId } from '../core/save';
import { PLAYER, WON, type CharacterId, type Command, type Effect, type GameState, type Hotspot, type ItemId, type Verb, type World } from '../core/types';
import { DialoguePanel } from './DialoguePanel';
import { showEndCard } from './EndCard';
import { InventoryBar } from './InventoryBar';
import { showGameMenu, showSlotList } from './menus';
import { PlayerSprite } from './PlayerSprite';
import { RoomView } from './RoomView';
import { Speech } from './Speech';
import type { GameData } from './TitleScene';
import { button } from './ui';
import { VerbCoin } from './VerbCoin';

const INVENTORY_TOP = 630;
const VERB_ICONS: Record<Verb, string> = { look: '👁', take: '✋', talk: '💬', use: '⚙' };

/**
 * The coordinator: turns clicks into core commands and plays the effects that come back. Drawing
 * lives in the components (RoomView, PlayerSprite, Speech, InventoryBar, VerbCoin, DialoguePanel);
 * puzzle logic lives in the core.
 *
 * View-only state: the held item (picked "Use with…", not used yet) and the effect queue (effects
 * the core returned that are still being played, one line at a time).
 */
export class RoomScene extends Phaser.Scene {
  private world!: World;
  private state!: GameState;
  /** What the game was started with: content, the new-game state, and where saves go. */
  private data_!: GameData;

  private roomView!: RoomView;
  private player!: PlayerSprite;
  private speech!: Speech;
  private caption!: Phaser.GameObjects.Text;
  private inventory!: InventoryBar;
  private coin!: VerbCoin;
  private dialogue!: DialoguePanel;

  private held: ItemId | undefined;
  /** Name of the hotspot or item under the pointer, for the caption. */
  private hovered: string | undefined;
  /** Effects still to play. While playing, clicks only skip lines. */
  private queue: Effect[] = [];
  private busy = false;
  private menuOpen = false;

  constructor() {
    super('RoomScene');
  }

  init(data: GameData & { state: GameState }): void {
    this.data_ = data;
    this.world = data.world;
    this.state = data.state;
    this.menuOpen = false;
    this.held = undefined;
    this.hovered = undefined;
    this.queue = [];
    this.busy = false;
  }

  create(): void {
    this.input.mouse?.disableContextMenu();
    this.caption = this.add.text(0, 0, '', { fontSize: '22px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setDepth(1500).setVisible(false);
    this.roomView = new RoomView(this, {
      onHover: (hotspot, pointer) => {
        this.moveCaption(pointer);
        this.hover(hotspot?.name);
      },
      onClick: (hotspot, pointer) => this.clickHotspot(hotspot, pointer),
    });
    this.roomView.showRoom(currentRoom(this.world, this.state));
    this.refreshHotspots();
    this.player = new PlayerSprite(this, this.state.player);
    this.speech = new Speech(this);
    this.coin = new VerbCoin(this);
    this.dialogue = new DialoguePanel(this);
    this.inventory = new InventoryBar(this, INVENTORY_TOP, {
      onClick: (itemId, pointer) => this.clickItem(itemId, pointer),
      onHover: (itemId) => this.hover(itemId && this.world.items[itemId]?.name),
      onEmptyClick: () => this.putAway(),
    });
    this.refreshInventory();

    // Above the dialogue panel (so you can save mid-conversation), below the line-skip blocker.
    button(this, this.scale.width - 44, 36, '☰', () => this.openMenu()).setDepth(1700);
    // A loaded save may be mid-conversation: put its options back up.
    if (this.state.conversation) this.showDialogueOptions();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.moveCaption(pointer));
    this.input.keyboard?.on('keydown-ESC', () => this.putAway());
    // Clicks on hotspots, items, the bar, panels, and the coin stop propagation, so this is a floor click.
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.held) return this.putAway();
      if (pointer.leftButtonDown()) this.walkTo({ x: pointer.worldX, y: pointer.worldY });
    });
  }

  private refreshHotspots(): void {
    this.roomView.showHotspots(visibleHotspots(this.world, this.state));
    this.hover(undefined);
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
    const action = availableItemAction(this.world, this.state, itemId);
    const options = [
      { id: 'look' as const, icon: VERB_ICONS.look, label: 'Look' },
      { id: 'useWith' as const, icon: '✋', label: 'Use with…' },
      ...(action ? [{ id: 'action' as const, icon: VERB_ICONS.use, label: action.label }] : []),
    ];
    this.coin.open({ x: pointer.worldX, y: pointer.worldY }, name, options, (choice) => {
      if (choice === 'look') this.dispatch({ type: 'lookItem', itemId });
      else if (choice === 'useWith') this.hold(itemId);
      // An item's own action happens in Dana's hands: no walking.
      else this.dispatch({ type: 'itemAction', itemId });
    });
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
      this.caption.setText(this.hovered ?? '').setVisible(this.hovered !== undefined && !this.coin?.isOpen);
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

  private walkThenDispatch(hotspot: Hotspot, command: Command): void {
    this.walkTo(hotspot.interactionPoint, () => this.dispatch(command));
  }

  private walkTo(target: Point, onArrive?: () => void): void {
    this.player.walkTo(target, currentRoom(this.world, this.state).walkable, (at) => {
      this.state = { ...this.state, player: at };
      onArrive?.();
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
    this.speech.setBlocking(true);
    this.hover(undefined);
    switch (effect.type) {
      case 'say':
        return this.say(effect.text, effect.speaker ?? PLAYER);
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
        this.speech.setBlocking(false);
        return showEndCard(this, () => this.scene.restart({ ...this.data_, state: this.data_.newGame }));
      case 'goToRoom':
        return this.changeRoom(effect.roomId, effect.entry);
    }
    this.playNext();
  }

  /** Fade out, redraw the new room with Dana at her entry point, fade back in, carry on. */
  private changeRoom(roomId: string, entry: string): void {
    const camera = this.cameras.main;
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const room = this.world.rooms[roomId]!;
      this.roomView.showRoom(room);
      this.refreshHotspots();
      this.player.placeAt(room.entries[entry]!);
      camera.fadeIn(250);
      this.playNext();
    });
    camera.fadeOut(250);
  }

  /** The queue is empty: hand control back to the player, in the room or in the conversation. */
  private idle(): void {
    this.busy = false;
    this.speech.setBlocking(false);
    if (this.state.conversation) this.showDialogueOptions();
    else this.dialogue.hide();
    // A won game isn't autosaved: Continue should land before the end, not on the end card.
    if (!this.state.flags[WON]) this.saveTo('auto');
  }

  private showDialogueOptions(): void {
    this.dialogue.show(availableOptions(this.world, this.state), (optionId) => this.dispatch({ type: 'chooseOption', optionId }));
  }

  private saveTo(slot: SlotId): void {
    this.data_.store.write(slot, JSON.stringify(toSaveFile(this.state, new Date().toISOString())));
  }

  /** The ☰ menu. Ignored while lines play or Dana walks, so a save is always taken at rest. */
  private openMenu(): void {
    if (this.busy || this.player.isWalking || this.menuOpen) return;
    this.menuOpen = true;
    this.coin.close();
    this.putAway();
    this.hover(undefined);
    const closed = () => (this.menuOpen = false);
    const { world, store } = this.data_;
    showGameMenu(
      this,
      {
        save: () => showSlotList(this, 'save', world, store, (slot) => (this.saveTo(slot), closed()), closed),
        load: () =>
          showSlotList(this, 'load', world, store, (slot) => {
            const result = loadSaveFile(world, store.read(slot) ?? '');
            if (result.ok) this.scene.restart({ ...this.data_, state: result.state });
          }, closed),
        quitToTitle: () => this.scene.start('TitleScene', this.data_),
      },
      closed,
    );
  }

  private say(text: string, speaker: CharacterId): void {
    const anchor = (speaker !== PLAYER && this.roomView.speakerAnchor(speaker)) || this.player.headAnchor;
    const color = this.world.characters[speaker]?.color ?? '#ffffff';
    this.speech.say(text, color, anchor, () => this.playNext());
  }
}
