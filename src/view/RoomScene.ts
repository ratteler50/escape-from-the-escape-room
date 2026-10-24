import * as Phaser from 'phaser';
import { availableItemAction, availableOptions, availableVerbs, currentRoom, handle, visibleHotspots, visibleOverlays } from '../core/engine';
import type { Point } from '../core/geometry';
import { loadSaveFile, toSaveFile, type SlotId } from '../core/save';
import { PLAYER, WON, type CharacterId, type Command, type Effect, type GameState, type Hotspot, type ItemId, type Verb, type World } from '../core/types';
import { DialoguePanel } from './DialoguePanel';
import { queueArt } from './assets';
import { gameAudio, queueAudio } from './GameAudio';
import { showEndCard } from './EndCard';
import { InventoryBar, iconKey } from './InventoryBar';
import { showGameMenu, showSlotList } from './menus';
import { PlayerSprite, WALK_SPEED } from './PlayerSprite';
import { RoomView } from './RoomView';
import { Speech } from './Speech';
import type { GameData } from './TitleScene';
import { button, fingertip, font, UI } from './ui';
import { VerbCoin } from './VerbCoin';
import { USE_WITH_ICON, VERB_ICONS } from './icons';
import { pickLine } from './pickLine';

const INVENTORY_TOP = 630;
const HELD_ICON_SIZE = 40;

/**
 * The coordinator: turns clicks into core commands and plays the effects that come back. Drawing
 * lives in the components (RoomView, PlayerSprite, Speech, InventoryBar, VerbCoin, DialoguePanel);
 * puzzle logic lives in the core.
 *
 * View-only state: the held item (picked "Use with…", not used yet), the effect queue (effects
 * the core returned that are still being played, one line at a time), and the flags the screen has
 * shown so far (it catches up with the core's flags step by step as the queue plays them).
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
  /** The held item's icon, floating beside the pointer. */
  private heldIcon: Phaser.GameObjects.Image | undefined;
  /** Name of the hotspot or item under the pointer, for the caption. */
  private hovered: string | undefined;
  /** Effects still to play. While playing, clicks only skip lines. */
  private queue: Effect[] = [];
  /**
   * The flags the screen shows: the core's flags as of the last effect played. The core's state is
   * final as soon as a command runs, but a response's flags should change the room (an overlay, a
   * door opening) when the queue reaches them, not all at the first one.
   */
  private shownFlags!: GameState['flags'];
  /** The line each `sayOneOf` said last, so it doesn't say it twice in a row. Keyed by its line list. */
  private readonly lastPicked = new WeakMap<readonly string[], number>();
  private busy = false;
  private menuOpen = false;
  /** Skip ⏭ pressed: play the rest of the queue instantly, keeping every effect that matters. */
  private skipping = false;
  /** Ends whatever step is in progress (a line, a walk, a pause) right now. */
  private finishStep: (() => void) | undefined;
  private skipButton!: Phaser.GameObjects.Text;

  constructor() {
    super('RoomScene');
  }

  init(data: GameData & { state: GameState }): void {
    this.data_ = data;
    this.world = data.world;
    this.state = data.state;
    this.shownFlags = data.state.flags;
    this.menuOpen = false;
    this.skipping = false;
    this.finishStep = undefined;
    this.held = undefined;
    this.hovered = undefined;
    this.queue = [];
    this.busy = false;
  }

  /** Loads all the art up front (paintings, overlays, sprites), so changing rooms never waits. */
  preload(): void {
    // Normally already loaded by the loading screen; this only matters if the scene starts without it.
    // Room music isn't queued here: it loads in the background and fades in when it arrives.
    queueArt(this, this.world);
    queueAudio(this, this.world.audio);
  }

  create(): void {
    this.input.mouse?.disableContextMenu();
    // On a tray-purple label with art on; outlined text over the room without.
    const captionStyle = UI.caption ? { backgroundColor: UI.caption, padding: { x: 10, y: 5 } } : {};
    this.caption = this.add
      .text(0, 0, '', { ...font(this, 22), color: '#ffffff', stroke: '#000000', strokeThickness: 4, ...captionStyle })
      .setDepth(1500)
      .setVisible(false);
    // Text grows when the game is shrunk (slice 31). Most text is redrawn often; the caption lasts,
    // so it follows a resize (a window dragged smaller, a phone turned).
    const resize = () => this.caption.setFontSize(font(this, 22).fontSize);
    this.scale.on(Phaser.Scale.Events.RESIZE, resize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, resize));
    this.roomView = new RoomView(this, {
      onHover: (hotspot, pointer) => {
        this.moveCaption(pointer);
        this.hover(hotspot?.name);
      },
      onClick: (hotspot, pointer) => this.clickHotspot(hotspot, pointer),
    }, this.world.characters);
    this.roomView.showRoom(currentRoom(this.world, this.state));
    this.refreshHotspots();
    gameAudio(this).playMusic(currentRoom(this.world, this.state).music);
    const dana = this.world.characters[PLAYER];
    this.player = new PlayerSprite(this, this.state.player, dana?.sprites?.standing, dana?.walks?.standing);
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
    fingertip(button(this, this.scale.width - 44, 36, '☰', () => this.openMenu())).setDepth(1700);
    // A loaded save may be mid-conversation: put its options back up.
    if (this.state.conversation) this.showDialogueOptions();

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.moveCaption(pointer);
      this.moveHeldIcon(pointer);
    });
    // Above the line-skip blocker, so it can be clicked while a scene plays. Shown only then.
    this.skipButton = button(this, this.scale.width - 90, 590, 'Skip ⏭', () => this.skipScene()).setDepth(1850).setVisible(false);
    this.input.keyboard?.on('keydown-ESC', () => (this.busy ? this.skipScene() : this.putAway()));
    // Hold H to see everything clickable (the ☰ menu has a sticky toggle for touch players).
    this.input.keyboard?.on('keydown-H', () => this.roomView.holdReveal(true));
    this.input.keyboard?.on('keyup-H', () => this.roomView.holdReveal(false));
    this.input.keyboard?.on('keydown-M', () => gameAudio(this).toggleMute());
    // Clicks on hotspots, items, the bar, panels, and the coin stop propagation, so this is a floor click.
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.held) return this.putAway();
      if (pointer.leftButtonDown()) this.walkTo({ x: pointer.worldX, y: pointer.worldY });
    });
  }

  private refreshHotspots(): void {
    const shown = { ...this.state, flags: this.shownFlags };
    this.roomView.showOverlays(visibleOverlays(currentRoom(this.world, shown), shown));
    this.roomView.showHotspots(visibleHotspots(this.world, shown));
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
      { id: 'useWith' as const, icon: USE_WITH_ICON, label: 'Use with…' },
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
    gameAudio(this).play('select');
    this.held = itemId;
    this.heldIcon?.destroy();
    const icon = iconKey(this, this.world.items[itemId]);
    // Offset down and right, so the pointer's tip stays exact for small hotspots.
    this.heldIcon = icon ? this.add.image(0, 0, icon).setDisplaySize(HELD_ICON_SIZE, HELD_ICON_SIZE).setOrigin(0, 0).setDepth(1550) : undefined;
    this.moveHeldIcon(this.input.activePointer);
    this.refreshInventory();
    this.updateCaption();
  }

  private putAway(): void {
    if (!this.held) return;
    this.held = undefined;
    this.heldIcon?.destroy();
    this.heldIcon = undefined;
    this.refreshInventory();
    this.updateCaption();
  }

  private hover(name: string | undefined): void {
    this.hovered = name;
    if (name === undefined) this.roomView.clearHighlight();
    this.updateCaption();
  }

  private updateCaption(): void {
    const heldName = this.held && (this.world.items[this.held]?.name ?? this.held);
    if (heldName) {
      this.caption.setText(`Use ${heldName} with${this.hovered ? ` ${this.hovered}` : '…'}`).setVisible(true);
    } else {
      // Hidden while a line is showing, so it never sits on top of speech.
      this.caption.setText(this.hovered ?? '').setVisible(this.hovered !== undefined && !this.coin?.isOpen && !this.busy);
    }
  }

  private moveHeldIcon(pointer: Phaser.Input.Pointer): void {
    this.heldIcon?.setPosition(pointer.worldX + 14, pointer.worldY + 14);
  }

  private moveCaption(pointer: Phaser.Input.Pointer): void {
    // Keep the caption on screen near the right edge.
    const x = Math.min(pointer.worldX + 16, this.scale.width - this.caption.width - 8);
    this.caption.setPosition(x, Math.max(pointer.worldY - 32, 8));
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
    // An option that ends the conversation hides the options at once, rather than after its replies:
    // they may be a whole cutscene (Reginald's exit, the finale) that the panel would cover.
    if (command.type === 'chooseOption' && !this.state.conversation) this.dialogue.hide();
    this.queue.push(...result.effects);
    if (!this.busy) this.playNext();
  }

  /**
   * Plays queued effects in order. `say` waits for its line to finish (or a click); everything else
   * plays instantly. The core's state is already final; the queue only paces the presentation.
   */
  private playNext(): void {
    this.finishStep = undefined;
    const effect = this.queue.shift();
    if (!effect) return this.idle();

    this.busy = true;
    this.speech.setBlocking(true);
    this.skipButton.setVisible(true);
    this.hover(undefined);
    switch (effect.type) {
      case 'say':
        if (this.skipping) break;
        return this.say(effect.text, effect.speaker ?? PLAYER);
      case 'sayOneOf': {
        if (this.skipping) break;
        const i = pickLine(effect.texts.length, this.lastPicked.get(effect.texts));
        this.lastPicked.set(effect.texts, i);
        return this.say(effect.texts[i]!, effect.speaker ?? PLAYER);
      }
      case 'walk':
        return this.walkInScene(effect.character, effect.to);
      case 'pause': {
        if (this.skipping) break;
        const timer = this.time.delayedCall(effect.ms, () => this.playNext());
        this.finishStep = () => (timer.remove(), this.playNext());
        return;
      }
      case 'face':
        if (effect.character === PLAYER) this.player.face(effect.direction);
        break;
      case 'sound':
        if (!this.skipping) gameAudio(this).play(effect.sound);
        break;
      case 'addItem':
        if (!this.skipping) gameAudio(this).play('pickup');
        this.refreshInventory();
        break;
      case 'removeItem':
        this.refreshInventory();
        break;
      case 'setFlag':
        this.shownFlags = { ...this.shownFlags, [effect.flag]: true };
        this.refreshHotspots();
        break;
      case 'clearFlag': {
        const { [effect.flag]: _cleared, ...flags } = this.shownFlags;
        this.shownFlags = flags;
        this.refreshHotspots();
        break;
      }
      case 'startDialogue':
      case 'endDialogue':
        break;
      case 'win':
        // The end card takes over input; the core's state stays as it is (won).
        this.speech.setBlocking(false);
        this.skipButton.setVisible(false);
        return showEndCard(this, () => this.scene.restart({ ...this.data_, state: this.data_.newGame }));
      case 'goToRoom':
        return this.changeRoom(effect.roomId, effect.entry);
    }
    this.playNext();
  }

  /** Fade out, redraw the new room with Dana at their entry point, fade back in, carry on. */
  private changeRoom(roomId: string, entry: string): void {
    const arrive = () => {
      const room = this.world.rooms[roomId]!;
      gameAudio(this).playMusic(room.music);
      this.roomView.showRoom(room);
      this.refreshHotspots();
      this.player.placeAt(room.entries[entry]!);
    };
    if (this.skipping) {
      arrive();
      return this.playNext();
    }
    gameAudio(this).play('door');
    const camera = this.cameras.main;
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      arrive();
      camera.fadeIn(250);
      this.playNext();
    });
    camera.fadeOut(250);
  }

  /** A cutscene walk: Dana, or a character drawn as a hotspot. Skipping lands it at once. */
  private walkInScene(character: CharacterId, to: Point): void {
    if (character === PLAYER) {
      this.player.walkTo(to, currentRoom(this.world, this.state).walkable, (at) => {
        this.state = { ...this.state, player: at };
        this.playNext();
      });
      this.finishStep = () => this.player.finishWalk();
    } else {
      this.finishStep = this.roomView.walkCharacter(character, to, WALK_SPEED, () => this.playNext());
    }
    if (this.skipping) this.finishStep();
  }

  /** Skip ⏭ / Escape: finish the current step and play the rest of the scene instantly. */
  private skipScene(): void {
    if (!this.busy) return;
    this.skipping = true;
    this.finishStep?.();
  }

  /** The queue is empty: hand control back to the player, in the room or in the conversation. */
  private idle(): void {
    // Catch up with the core (normally the queue already has, flag by flag).
    const behind = Object.keys(this.state.flags).some((f) => this.state.flags[f] !== this.shownFlags[f]);
    this.shownFlags = this.state.flags;
    if (behind) this.refreshHotspots();
    this.busy = false;
    this.skipping = false;
    this.skipButton.setVisible(false);
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
        revealClickable: { on: this.roomView.revealOn, toggle: () => this.roomView.toggleReveal() },
      },
      closed,
    );
  }

  private say(text: string, speaker: CharacterId): void {
    const anchor = (speaker !== PLAYER && this.roomView.speakerAnchor(speaker)) || this.player.headAnchor;
    const color = this.world.characters[speaker]?.color ?? '#ffffff';
    const name = speaker === PLAYER ? undefined : this.world.characters[speaker]?.name;
    this.speech.say(text, color, anchor, () => this.playNext(), name);
    this.finishStep = () => this.speech.finishNow();
  }
}
