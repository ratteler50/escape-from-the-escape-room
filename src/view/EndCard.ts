import * as Phaser from 'phaser';

const DEPTH = 3000;

/**
 * The "To be continued…" card shown when the game is won. Covers everything and swallows input, so
 * the room can't be played behind it. Play again is the only way on.
 */
export function showEndCard(scene: Phaser.Scene, onPlayAgain: () => void): void {
  const { width, height } = scene.scale;
  const card = scene.add.container(0, 0).setDepth(DEPTH).setAlpha(0);

  const backdrop = scene.add.rectangle(0, 0, width, height, 0x0d0a14, 0.94).setOrigin(0, 0).setInteractive();
  backdrop.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
    event.stopPropagation();
  });
  const title = scene.add
    .text(width / 2, height / 2 - 110, 'Escape From the Escape Room', { fontSize: '44px', color: '#ffe28a' })
    .setOrigin(0.5);
  const subtitle = scene.add
    .text(width / 2, height / 2 - 40, 'To be continued…', { fontSize: '30px', color: '#c9b6ff' })
    .setOrigin(0.5);
  const blurb = scene.add
    // DRAFT:
    .text(width / 2, height / 2 + 20, "Dana escaped the Lich's Lair. The Gift Shop awaits.", { fontSize: '22px', color: '#ffffff' })
    .setOrigin(0.5);

  const button = scene.add
    .text(width / 2, height / 2 + 110, '  Play again  ', {
      fontSize: '26px',
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
    onPlayAgain();
  });

  card.add([backdrop, title, subtitle, blurb, button]);
  scene.tweens.add({ targets: card, alpha: 1, duration: 800 });
}
