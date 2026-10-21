import * as Phaser from 'phaser';
import { initialState, world } from './content/world';
import { RoomScene } from './view/RoomScene';

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

game.scene.add('RoomScene', RoomScene, true, { world, state: initialState });

// Dev-only hook so automated play-tests can inspect the running game.
declare global {
  interface Window {
    __game?: Phaser.Game;
  }
}
if (import.meta.env.DEV) window.__game = game;
