import * as Phaser from 'phaser';
import { SLOTS, loadSaveFile, type SaveStore, type SlotId } from '../core/save';
import type { World } from '../core/types';
import { TEXT_SPEEDS, settings, type TextSpeed } from './storage';
import { button, modal } from './ui';

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

/** Settings: for now, just text speed. Applies immediately and is remembered. */
export function showSettings(scene: Phaser.Scene, onClose: () => void): void {
  const box = modal(scene, DEPTH, 640, 340, 'Settings');
  const { width, height } = scene.scale;
  box.add(scene.add.text(width / 2, height / 2 - 60, 'Text speed', { fontSize: '24px', color: '#c9b6ff' }).setOrigin(0.5));

  // Picking a speed reopens the panel so the ● moves to the new choice.
  (Object.keys(TEXT_SPEEDS) as TextSpeed[]).forEach((speed, i) => {
    const label = `${settings.textSpeed === speed ? '● ' : ''}${speed[0]!.toUpperCase()}${speed.slice(1)}`;
    box.add(button(scene, width / 2 + (i - 1) * 170, height / 2 + 10, label, () => {
      settings.textSpeed = speed;
      box.destroy();
      showSettings(scene, onClose);
    }));
  });
  box.add(button(scene, width / 2, height / 2 + 110, 'Back', () => {
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
  const box = modal(scene, DEPTH, 460, 540, 'Menu');
  const { width, height } = scene.scale;
  const item = (i: number, label: string, run: () => void) =>
    box.add(button(scene, width / 2, height / 2 - 156 + i * 72, label, () => {
      box.destroy();
      run();
    }));
  item(0, 'Save', actions.save);
  item(1, 'Load', actions.load);
  item(2, 'Settings', () => showSettings(scene, () => showGameMenu(scene, actions, onClose)));
  const { revealClickable } = actions;
  item(3, `Show clickable things: ${revealClickable.on ? 'On' : 'Off'}`, () => {
    const on = revealClickable.toggle();
    showGameMenu(scene, { ...actions, revealClickable: { ...revealClickable, on } }, onClose);
  });
  item(4, 'Quit to title', actions.quitToTitle);
  item(5, 'Close', onClose);
}
