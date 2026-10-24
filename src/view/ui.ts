import * as Phaser from 'phaser';
import { gameAudio } from './GameAudio';
import { ART_ENABLED } from './RoomView';
import { MIN_TEXT, readableSize } from './textSize';

/** The game's font (slice 31): Nunito, bold for text and black for headings, loaded in `main.ts`. */
export const FONT = { family: 'Nunito, "Trebuchet MS", sans-serif', text: 'bold', heading: '900' } as const;

/** How big the game is on screen: 1 at full size, about 0.54 on a phone held sideways. */
export function onScreenScale(scene: Phaser.Scene): number {
  return 1 / scene.scale.displayScale.x;
}

/**
 * The font part of a text style: the game's font at `px`, grown when the game is shrunk so it still
 * shows at least `min` px on screen (14 px for text; pass MIN_LABEL for small labels).
 */
export function font(scene: Phaser.Scene, px: number, options: { heading?: boolean; min?: number } = {}) {
  const size = readableSize(px, onScreenScale(scene), options.min ?? MIN_TEXT);
  return { fontFamily: FONT.family, fontStyle: options.heading ? FONT.heading : FONT.text, fontSize: `${size}px` };
}

// Small building blocks for menus: a modal overlay and a text button. Sized for a fingertip, like
// the verb coin, so menus work on a trackpad or a phone.

/**
 * Interface colours. With art on, the Escape-O-Rama tray's purple plastic (sampled from the tray,
 * slice 26): a surface, a lighter rim, a darker inset for buttons, a near-black edge. With `?art=off`,
 * the original dark placeholder look.
 */
export const UI = ART_ENABLED
  ? {
      panel: 0x602b78,
      border: 0x7a30a0,
      edge: 0x150a1c,
      inset: 0x411959,
      insetHover: 0x5b2a74,
      button: '#411959',
      caption: 'rgba(65, 25, 89, 0.88)',
      text: '#ffffff',
      muted: '#e7d2f7',
      accent: '#ffe28a',
      disabled: '#9a7fb0',
    }
  : {
      panel: 0x15111f,
      border: 0xc9b6ff,
      edge: 0x000000,
      inset: 0x1e1a2b,
      insetHover: 0x3a3355,
      button: '#2c2540',
      caption: undefined,
      text: '#ffffff',
      muted: '#c9b6ff',
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
  // A dark edge around a rim around the surface: the tray's moulded-plastic look (a plain outline
  // without art).
  const edge = scene.add.rectangle(w / 2, h / 2, width + 6, height + 6, UI.edge);
  const panel = scene.add
    .rectangle(w / 2, h / 2, width, height, UI.panel)
    .setStrokeStyle(ART_ENABLED ? 6 : 3, UI.border)
    .setInteractive();
  panel.on('pointerdown', swallow);
  const heading = scene.add.text(w / 2, h / 2 - height / 2 + 36, title, { ...font(scene, 30, { heading: true }), color: UI.accent }).setOrigin(0.5);
  container.add([dim, edge, panel, heading]);
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
      ...font(scene, 24),
      color: enabled ? UI.text : UI.disabled,
      backgroundColor: UI.button,
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
