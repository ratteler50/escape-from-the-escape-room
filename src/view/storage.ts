import type { SaveStore, SlotId } from '../core/save';

// Browser storage. localStorage can be unavailable or throw (private windows, blocked site data),
// so every access is guarded: the game still runs, it just can't remember anything.

const SAVE_PREFIX = 'escape-from-the-escape-room:save:';
const SETTINGS_KEY = 'escape-from-the-escape-room:settings';

export class LocalStorageSaveStore implements SaveStore {
  read(slot: SlotId): string | null {
    try {
      return localStorage.getItem(SAVE_PREFIX + slot);
    } catch {
      return null;
    }
  }

  write(slot: SlotId, json: string): void {
    try {
      localStorage.setItem(SAVE_PREFIX + slot, json);
    } catch {
      // Out of space or storage blocked: the save is lost, but play goes on.
    }
  }
}

export const TEXT_SPEEDS = { slow: 1.6, normal: 1, fast: 0.6 } as const;
export type TextSpeed = keyof typeof TEXT_SPEEDS;

/** Player preferences. Not part of a save: they belong to the player, not the playthrough. */
export const settings = {
  get textSpeed(): TextSpeed {
    const saved = read().textSpeed;
    return typeof saved === 'string' && saved in TEXT_SPEEDS ? (saved as TextSpeed) : 'normal';
  },
  set textSpeed(speed: TextSpeed) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...read(), textSpeed: speed }));
    } catch {
      // Not remembered, but still applies for this visit via the caller.
    }
  },
};

function read(): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
