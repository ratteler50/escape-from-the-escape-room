import * as Phaser from 'phaser';
import { initialState, world } from './content/world';
import { LoadingScene } from './view/LoadingScene';
import { MusicLoaderScene } from './view/MusicLoaderScene';
import { watchOrientation } from './view/phone';
import { RoomScene } from './view/RoomScene';
import { LocalStorageSaveStore } from './view/storage';
import { TitleScene, type GameData } from './view/TitleScene';

declare global {
  interface Window {
    __game?: Phaser.Game;
  }
}

function start(): void {
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
  game.scene.add('TitleScene', TitleScene, false);
  game.scene.add('MusicLoaderScene', MusicLoaderScene, false);
  // The loading screen starts the title screen (and the background music loader) once it's done.
  game.scene.add('LoadingScene', LoadingScene, true, data);
  // On a phone held upright, a "turn it sideways" screen covers the game and pauses it (slice 32).
  watchOrientation(game);

  // Hook so automated play-tests can inspect the running game: on in dev builds, and in production
  // builds when the URL has an `?e2e` flag (the Playwright tests use it; see docs/slices/11-e2e.md).
  if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('e2e')) window.__game = game;
}

// Phaser draws each piece of text onto its own canvas once, so the font (index.html's @font-face)
// must be loaded before the first screen is drawn, or that text would stay in the fallback font. If
// it can't load, the game starts anyway, in the fallback.
Promise.all([document.fonts.load('bold 20px Nunito'), document.fonts.load('900 20px Nunito')])
  .catch(() => undefined)
  .finally(start);
