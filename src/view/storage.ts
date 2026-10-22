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

/** Volumes are 0-100 in steps of 10. */
export const SOUND_DEFAULTS = { musicVolume: 70, effectsVolume: 80 } as const;
const VOLUME_STEP = 10;

/** A saved volume, snapped to a step within 0-100; anything that isn't a number gets the default. */
export function readVolume(saved: unknown, fallback: number): number {
  if (typeof saved !== 'number' || Number.isNaN(saved)) return fallback;
  return Math.min(100, Math.max(0, Math.floor(saved / VOLUME_STEP) * VOLUME_STEP));
}

/** One step up (+1) or down (-1), stopping at 0 and 100. */
export function stepVolume(volume: number, direction: 1 | -1): number {
  return readVolume(volume + direction * VOLUME_STEP, volume);
}

/** Player preferences. Not part of a save: they belong to the player, not the playthrough. */
export const settings = {
  get textSpeed(): TextSpeed {
    const saved = read().textSpeed;
    return typeof saved === 'string' && saved in TEXT_SPEEDS ? (saved as TextSpeed) : 'normal';
  },
  set textSpeed(speed: TextSpeed) {
    write({ textSpeed: speed });
  },
  get musicVolume(): number {
    return readVolume(read().musicVolume, SOUND_DEFAULTS.musicVolume);
  },
  set musicVolume(volume: number) {
    write({ musicVolume: volume });
  },
  get effectsVolume(): number {
    return readVolume(read().effectsVolume, SOUND_DEFAULTS.effectsVolume);
  },
  set effectsVolume(volume: number) {
    write({ effectsVolume: volume });
  },
  get muted(): boolean {
    return read().muted === true;
  },
  set muted(muted: boolean) {
    write({ muted });
  },
};

function write(changes: Record<string, unknown>): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...read(), ...changes }));
  } catch {
    // Not remembered, but still applies for this visit via the caller.
  }
}

function read(): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
