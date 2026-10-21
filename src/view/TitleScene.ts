import * as Phaser from 'phaser';
import { loadSaveFile, mostRecentSlot, type SaveStore, type SlotId } from '../core/save';
import type { GameState, World } from '../core/types';
import { showSlotList } from './menus';
import { button } from './ui';

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
    const { width, height } = this.scale;
    const { world, newGame, store } = this.data_;
    this.add.rectangle(0, 0, width, height, 0x0d0a14).setOrigin(0, 0);
    this.add.text(width / 2, height / 2 - 170, 'Escape From the Escape Room', { fontSize: '52px', color: '#ffe28a' }).setOrigin(0.5);
    // DRAFT:
    this.add.text(width / 2, height / 2 - 105, 'A trainee. A lich. A misprint.', { fontSize: '24px', color: '#c9b6ff' }).setOrigin(0.5);

    const latest = mostRecentSlot(world, store);
    button(this, width / 2, height / 2, 'Continue', () => this.play(latest!), latest !== null);
    button(this, width / 2, height / 2 + 80, 'New game', () => this.scene.start('RoomScene', { ...this.data_, state: newGame }));
    button(this, width / 2, height / 2 + 160, 'Load', () =>
      showSlotList(this, 'load', world, store, (slot) => this.play(slot), () => {}),
    );
  }

  private play(slot: SlotId): void {
    const result = loadSaveFile(this.data_.world, this.data_.store.read(slot) ?? '');
    if (result.ok) this.scene.start('RoomScene', { ...this.data_, state: result.state });
  }
}
