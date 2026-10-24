import * as Phaser from 'phaser';
import { SLOTS, loadSaveFile, type SaveStore, type SlotId } from '../core/save';
import type { World } from '../core/types';
import { credits } from '../content/credits';
import { gameAudio } from './GameAudio';
import { canFullscreen, toggleFullscreen } from './phone';
import { TEXT_SPEEDS, settings, stepVolume, type TextSpeed } from './storage';
import { button, font, modal, UI } from './ui';

const DEPTH = 2500; // above the room, panels, and coin; below the end card

const SLOT_NAMES: Record<SlotId, string> = { auto: 'Autosave', slot1: 'Slot 1', slot2: 'Slot 2', slot3: 'Slot 3' };

/** What a slot holds, for listing it. */
function describeSlot(world: World, store: SaveStore, slot: SlotId): { label: string; loadable: boolean; empty: boolean } {
  const raw = store.read(slot);
  if (raw === null) return { label: `${SLOT_NAMES[slot]}: Empty`, loadable: false, empty: true };
  const result = loadSaveFile(world, raw);
  if (!result.ok) return { label: `${SLOT_NAMES[slot]}: From an older version, can't load`, loadable: false, empty: false };
  const room = world.rooms[result.state.roomId]?.name ?? result.state.roomId;
  const when = new Date(result.savedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return { label: `${SLOT_NAMES[slot]}: ${room} · ${when}`, loadable: true, empty: false };
}

/**
 * The slot list. In "load" mode, filled compatible slots can be picked. In "save" mode, the manual
 * slots can be picked (Autosave can't), and filled ones ask before overwriting.
 */
export function showSlotList(
  scene: Phaser.Scene,
  mode: 'save' | 'load',
  world: World,
  store: SaveStore,
  onPick: (slot: SlotId) => void,
  onClose: () => void,
): void {
  const box = modal(scene, DEPTH, 760, 470, mode === 'save' ? 'Save to…' : 'Load…');
  const { width, height } = scene.scale;
  const close = () => {
    box.destroy();
    onClose();
  };

  SLOTS.forEach((slot, i) => {
    const info = describeSlot(world, store, slot);
    const enabled = mode === 'load' ? info.loadable : slot !== 'auto';
    const pick = () => {
      if (mode === 'save' && !info.empty) {
        return confirm(scene, `Overwrite ${SLOT_NAMES[slot]}?`, () => {
          box.destroy();
          onPick(slot);
        });
      }
      box.destroy();
      onPick(slot);
    };
    box.add(button(scene, width / 2, height / 2 - 130 + i * 72, info.label, pick, enabled));
  });
  box.add(button(scene, width / 2, height / 2 + 175, 'Back', close));
}

/** A yes/no question on top of everything. */
export function confirm(scene: Phaser.Scene, question: string, onYes: () => void): void {
  const box = modal(scene, DEPTH + 100, 520, 240, question);
  const { width, height } = scene.scale;
  box.add(button(scene, width / 2 - 90, height / 2 + 40, 'Yes', () => {
    box.destroy();
    onYes();
  }));
  box.add(button(scene, width / 2 + 90, height / 2 + 40, 'No', () => box.destroy()));
}

/** Settings: text speed and sound. Each change applies immediately and is remembered. */
export function showSettings(scene: Phaser.Scene, onClose: () => void): void {
  const box = modal(scene, DEPTH, 640, 520, 'Settings');
  const { width, height } = scene.scale;
  const reopen = () => {
    box.destroy();
    showSettings(scene, onClose);
  };
  const heading = (y: number, text: string) =>
    box.add(scene.add.text(width / 2 - 250, y, text, { ...font(scene, 24), color: UI.muted }).setOrigin(0, 0.5));

  // Picking a speed reopens the panel so the ● moves to the new choice.
  heading(height / 2 - 150, 'Text speed');
  (Object.keys(TEXT_SPEEDS) as TextSpeed[]).forEach((speed, i) => {
    const label = `${settings.textSpeed === speed ? '● ' : ''}${speed[0]!.toUpperCase()}${speed.slice(1)}`;
    box.add(button(scene, width / 2 + (i - 1) * 170, height / 2 - 100, label, () => {
      settings.textSpeed = speed;
      reopen();
    }));
  });

  // Volumes: − and + in steps of 10.
  const audio = gameAudio(scene);
  const volume = (y: number, name: string, get: () => number, set: (v: number) => void) => {
    heading(y, name);
    box.add(scene.add.text(width / 2 + 120, y, `${get()}`, { ...font(scene, 24), color: '#ffffff' }).setOrigin(0.5));
    const change = (direction: 1 | -1) => () => {
      set(stepVolume(get(), direction));
      audio.applyVolumes();
      reopen();
    };
    box.add(button(scene, width / 2 + 40, y, '−', change(-1), get() > 0));
    box.add(button(scene, width / 2 + 200, y, '+', change(1), get() < 100));
  };
  volume(height / 2 - 30, 'Music', () => settings.musicVolume, (v) => (settings.musicVolume = v));
  volume(height / 2 + 40, 'Effects', () => settings.effectsVolume, (v) => (settings.effectsVolume = v));
  heading(height / 2 + 110, 'Sound (M)');
  box.add(button(scene, width / 2 + 120, height / 2 + 110, settings.muted ? 'Muted' : 'On', () => {
    audio.toggleMute();
    reopen();
  }));

  box.add(button(scene, width / 2, height / 2 + 195, 'Back', () => {
    box.destroy();
    onClose();
  }));
}

/**
 * The title screen's Credits: who made what (a summary of CREDITS.md). The panel is sized to its
 * text, which grows when the game is shrunk (slice 31): then it wraps wider so it still fits.
 */
export function showCredits(scene: Phaser.Scene, onClose: () => void): void {
  const { width, height } = scene.scale;
  const lines = [
    credits.art,
    '',
    credits.music.by,
    credits.music.tracks.map((t) => `"${t}"`).join(', ') + '.',
    '',
    credits.sounds,
    '',
    credits.made,
  ];
  const style = font(scene, 20);
  const wrap = parseInt(style.fontSize, 10) > 20 ? width - 140 : 820;
  const text = scene.add
    .text(width / 2, 0, lines.join('\n'), { ...style, color: UI.text, align: 'center', wordWrap: { width: wrap }, lineSpacing: 6 })
    .setOrigin(0.5, 0);
  const panelHeight = Math.min(height - 20, text.height + 190);
  const top = height / 2 - panelHeight / 2;
  const box = modal(scene, DEPTH, wrap + 80, panelHeight, 'Credits');
  box.add(text.setY(top + 75));
  box.add(button(scene, width / 2, top + panelHeight - 45, 'Back', () => {
    box.destroy();
    onClose();
  }));
}

export interface GameMenuActions {
  save: () => void;
  load: () => void;
  quitToTitle: () => void;
  /** "Show everything clickable": its current setting, and a toggle that returns the new one. */
  revealClickable: { on: boolean; toggle: () => boolean };
}

/** The ☰ menu during play. */
export function showGameMenu(scene: Phaser.Scene, actions: GameMenuActions, onClose: () => void): void {
  const { revealClickable } = actions;
  const items: [string, () => void][] = [
    ['Save', actions.save],
    ['Load', actions.load],
    ['Settings', () => showSettings(scene, () => showGameMenu(scene, actions, onClose))],
    [`Show clickable things: ${revealClickable.on ? 'On' : 'Off'}`, () => {
      const on = revealClickable.toggle();
      showGameMenu(scene, { ...actions, revealClickable: { ...revealClickable, on } }, onClose);
    }],
    // Only where the browser allows it (slice 32). Switching takes a moment, so the menu closes.
    ...(canFullscreen(scene)
      ? [[scene.scale.isFullscreen ? 'Exit fullscreen' : 'Fullscreen', () => {
          toggleFullscreen(scene);
          onClose();
        }] as [string, () => void]]
      : []),
    ['Quit to title', actions.quitToTitle],
    ['Close', onClose],
  ];
  const step = 72;
  const panelHeight = 108 + items.length * step;
  const box = modal(scene, DEPTH, 460, panelHeight, 'Menu');
  const { width, height } = scene.scale;
  items.forEach(([label, run], i) =>
    box.add(button(scene, width / 2, height / 2 - panelHeight / 2 + 114 + i * step, label, () => {
      box.destroy();
      run();
    })),
  );
}
