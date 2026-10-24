import * as Phaser from 'phaser';
import { loadSaveFile, mostRecentSlot, type SaveStore, type SlotId } from '../core/save';
import type { GameState, World } from '../core/types';
import { screens } from '../content/screens';
import { keyArt } from './assets';
import { gameAudio } from './GameAudio';
import { showCredits, showSettings, showSlotList } from './menus';
import { button, font } from './ui';

/** What every scene is started with. `newGame` is the state "New game" and "Play again" start from. */
export interface GameData {
  world: World;
  newGame: GameState;
  store: SaveStore;
}

/** The title screen: Continue, New game, Load. */
export class TitleScene extends Phaser.Scene {
  private data_!: GameData;

  constructor() {
    super('TitleScene');
  }

  init(data: GameData): void {
    this.data_ = data;
  }

  create(): void {
    // Its text is drawn once, at a size for how big the game is on screen (slice 31): redraw it when
    // that changes (a window dragged smaller, a phone turned).
    const resize = () => this.scene.restart(this.data_);
    this.scale.once(Phaser.Scale.Events.RESIZE, resize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, resize));
    const { width, height } = this.scale;
    const { world, newGame, store } = this.data_;
    // The painted title: the logo in the dark wall between Kyle and Reginald's raised hand, the
    // buttons below it over the throne, clear of Dana. Without art, the original text-only screen.
    const painting = keyArt(this, 'title');
    const logo = keyArt(this, 'logo');
    const x = painting ? 560 : width / 2;
    if (painting) this.add.image(0, 0, painting).setOrigin(0, 0).setDisplaySize(width, height);
    else this.add.rectangle(0, 0, width, height, 0x0d0a14).setOrigin(0, 0);
    // A little left of the buttons, to clear Reginald's raised hand.
    if (logo) this.add.image(x - 20, 128, logo).setScale(0.48);
    else this.add.text(x, height / 2 - 170, 'Escape From the Escape Room', { ...font(this, 52, { heading: true }), color: '#ffe28a' }).setOrigin(0.5);
    this.add
      .text(x, logo ? 268 : height / 2 - 105, screens.tagline, { ...font(this, 24), color: '#e7d2f7', stroke: '#000000', strokeThickness: 4 })
      .setOrigin(0.5);

    const top = painting ? 335 : height / 2;
    const step = painting ? 68 : 80;
    const latest = mostRecentSlot(world, store);
    button(this, x, top, 'Continue', () => this.play(latest!), latest !== null);
    button(this, x, top + step, 'New game', () => this.scene.start('RoomScene', { ...this.data_, state: newGame }));
    button(this, x, top + step * 2, 'Load', () =>
      showSlotList(this, 'load', world, store, (slot) => this.play(slot), () => {}),
    );
    button(this, x - 100, top + step * 3, 'Settings', () => showSettings(this, () => {}));
    button(this, x + 100, top + step * 3, 'Credits', () => showCredits(this, () => {}));

    // Starts on the player's first click: browsers keep sound off until then.
    if (world.audio) gameAudio(this).playMusic(world.audio.title);
    this.input.keyboard?.on('keydown-M', () => gameAudio(this).toggleMute());
  }

  private play(slot: SlotId): void {
    const result = loadSaveFile(this.data_.world, this.data_.store.read(slot) ?? '');
    if (result.ok) this.scene.start('RoomScene', { ...this.data_, state: result.state });
  }
}
