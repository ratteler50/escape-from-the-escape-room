import * as Phaser from 'phaser';
import { gameAudio } from './GameAudio';

// Small building blocks for menus: a modal overlay and a text button. Sized for a fingertip, like
// the verb coin, so menus work on a trackpad or a phone.

export const UI = {
  panel: 0x15111f,
  border: 0xc9b6ff,
  text: '#ffffff',
  accent: '#ffe28a',
  disabled: '#6b6380',
};

type PointerHandler = (p: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) => void;
const swallow: PointerHandler = (_p, _x, _y, e) => e.stopPropagation();

/**
 * A full-screen modal: dims and blocks everything below `depth`, with a centred panel. Destroy the
 * returned container to close it.
 */
export function modal(scene: Phaser.Scene, depth: number, width: number, height: number, title: string): Phaser.GameObjects.Container {
  const { width: w, height: h } = scene.scale;
  const container = scene.add.container(0, 0).setDepth(depth);
  const dim = scene.add.rectangle(0, 0, w, h, 0x000000, 0.6).setOrigin(0, 0).setInteractive();
  dim.on('pointerdown', swallow);
  const panel = scene.add
    .rectangle(w / 2, h / 2, width, height, UI.panel)
    .setStrokeStyle(3, UI.border)
    .setInteractive();
  panel.on('pointerdown', swallow);
  const heading = scene.add.text(w / 2, h / 2 - height / 2 + 36, title, { fontSize: '30px', color: UI.accent }).setOrigin(0.5);
  container.add([dim, panel, heading]);
  return container;
}

/** A clickable line of text. Disabled buttons are greyed out and ignore clicks. */
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  enabled = true,
): Phaser.GameObjects.Text {
  const text = scene.add
    .text(x, y, label, {
      fontSize: '24px',
      color: enabled ? UI.text : UI.disabled,
      backgroundColor: '#2c2540',
      padding: { x: 18, y: 12 },
      align: 'center',
    })
    .setOrigin(0.5);
  if (!enabled) return text;
  text.setInteractive({ useHandCursor: true });
  text.on('pointerover', () => text.setColor(UI.accent));
  text.on('pointerout', () => text.setColor(UI.text));
  text.on('pointerdown', ((_p, _x, _y, e) => {
    e.stopPropagation();
    gameAudio(scene).play('click');
    onClick();
  }) satisfies PointerHandler);
  return text;
}
