import * as Phaser from 'phaser';
import { initialState, world } from './content/world';
import { RoomScene } from './view/RoomScene';
import { LocalStorageSaveStore } from './view/storage';
import { TitleScene, type GameData } from './view/TitleScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#111111',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

const data: GameData = { world, newGame: initialState, store: new LocalStorageSaveStore() };
game.scene.add('RoomScene', RoomScene, false);
game.scene.add('TitleScene', TitleScene, true, data);

// Dev-only hook so automated play-tests can inspect the running game.
declare global {
  interface Window {
    __game?: Phaser.Game;
  }
}
if (import.meta.env.DEV) window.__game = game;
