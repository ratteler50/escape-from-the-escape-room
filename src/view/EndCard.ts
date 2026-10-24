import * as Phaser from 'phaser';
import { font } from './ui';
import { MIN_LABEL } from './textSize';
import { credits } from '../content/credits';
import { screens } from '../content/screens';
import { keyArt } from './assets';
import { gameAudio } from './GameAudio';

const DEPTH = 3000;

/**
 * The "THE END?" card shown when the game is won. Covers everything and swallows input, so
 * the room can't be played behind it. Play again is the only way on.
 */
export function showEndCard(scene: Phaser.Scene, onPlayAgain: () => void): void {
  const { width, height } = scene.scale;
  const card = scene.add.container(0, 0).setDepth(DEPTH).setAlpha(0);

  // The painted finale (slice 26): "THE END?" goes on the shop's blank banner, the rest along the
  // floor at the bottom. Without art, the original text card.
  const painting = keyArt(scene, 'end');
  const backdrop = painting
    ? scene.add.image(0, 0, painting).setOrigin(0, 0).setDisplaySize(width, height).setInteractive()
    : scene.add.rectangle(0, 0, width, height, 0x0d0a14, 0.94).setOrigin(0, 0).setInteractive();
  backdrop.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
    event.stopPropagation();
  });
  const outlined = { stroke: '#000000', strokeThickness: 5 };
  const title = painting
    ? undefined
    : scene.add.text(width / 2, height / 2 - 110, 'Escape From the Escape Room', { ...font(scene, 44, { heading: true }), color: '#ffe28a' }).setOrigin(0.5);
  const subtitle = painting
    ? scene.add.text(642, 122, 'THE END?', { ...font(scene, 44, { heading: true }), color: '#ffe28a', ...outlined }).setOrigin(0.5)
    : scene.add.text(width / 2, height / 2 - 40, 'THE END?', { ...font(scene, 30, { heading: true }), color: '#c9b6ff' }).setOrigin(0.5);
  const blurb = scene.add
    .text(width / 2, painting ? 598 : height / 2 + 20, screens.endBlurb, {
      ...font(scene, 22),
      color: '#ffffff',
      ...(painting ? outlined : {}),
    })
    .setOrigin(0.5);

  const button = scene.add
    .text(width / 2, painting ? 652 : height / 2 + 110, '  Play again  ', {
      ...font(scene, 26),
      color: '#15111f',
      backgroundColor: '#ffe28a',
      padding: { x: 16, y: 12 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
  button.on('pointerover', () => button.setBackgroundColor('#fff2c4'));
  button.on('pointerout', () => button.setBackgroundColor('#ffe28a'));
  button.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
    event.stopPropagation();
    gameAudio(scene).play('click');
    onPlayAgain();
  });

  // CC BY music has to be credited where players can see it (CREDITS.md has the full lines).
  const credit = scene.add
    .text(width / 2, height - (painting ? 18 : 40), credits.musicShort, {
      ...font(scene, 16, { min: MIN_LABEL }),
      color: painting ? '#ffffff' : '#8f84a8',
      ...(painting ? { stroke: '#000000', strokeThickness: 4 } : {}),
    })
    .setOrigin(0.5);

  card.add([backdrop, ...(title ? [title] : []), subtitle, blurb, button, credit]);
  scene.tweens.add({ targets: card, alpha: 1, duration: 800 });
}
