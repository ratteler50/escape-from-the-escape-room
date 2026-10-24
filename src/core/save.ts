import { onPolygon } from './geometry';
import type { GameState, World } from './types';

/**
 * Bump when the shape of GameState changes in a way old saves can't satisfy, or flags are renamed
 * (2: slice 28), or the starting inventory changes (3: slice 29, the Handbook).
 */
export const SAVE_FORMAT = 3;

export const SLOTS = ['auto', 'slot1', 'slot2', 'slot3'] as const;
export type SlotId = (typeof SLOTS)[number];

export interface SaveFile {
  format: number;
  /** ISO timestamp. */
  savedAt: string;
  state: GameState;
}

export type LoadResult = { ok: true; state: GameState; savedAt: string } | { ok: false; reason: string };

/**
 * Where save files live. The browser uses localStorage; tests use the in-memory one. Values are the
 * raw JSON strings, so a corrupt slot is still readable (and reported as incompatible).
 */
export interface SaveStore {
  read(slot: SlotId): string | null;
  write(slot: SlotId, json: string): void;
}

export class InMemorySaveStore implements SaveStore {
  private readonly slots = new Map<SlotId, string>();
  read(slot: SlotId): string | null {
    return this.slots.get(slot) ?? null;
  }
  write(slot: SlotId, json: string): void {
    this.slots.set(slot, json);
  }
}

export function toSaveFile(state: GameState, now: string): SaveFile {
  return { format: SAVE_FORMAT, savedAt: now, state };
}

/**
 * Parses and checks a save against the current content. Content changes between versions (renamed
 * items, removed dialogue nodes), so anything that no longer fits is reported, never thrown.
 */
export function loadSaveFile(world: World, json: string): LoadResult {
  let file: unknown;
  try {
    file = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'The save is corrupt (not valid JSON).' };
  }
  if (!isRecord(file) || typeof file.savedAt !== 'string') return { ok: false, reason: 'The save is corrupt (missing fields).' };
  if (file.format !== SAVE_FORMAT) return { ok: false, reason: `The save is from another version of the game (format ${String(file.format)}).` };
  if (!isGameState(file.state)) return { ok: false, reason: 'The save is malformed.' };

  const problem = incompatibility(world, file.state);
  return problem ? { ok: false, reason: problem } : { ok: true, state: file.state, savedAt: file.savedAt };
}

/** The slot to Continue from: the most recently saved one that loads. Null if none do. */
export function mostRecentSlot(world: World, store: SaveStore): SlotId | null {
  let best: { slot: SlotId; savedAt: string } | null = null;
  for (const slot of SLOTS) {
    const raw = store.read(slot);
    const result = raw === null ? null : loadSaveFile(world, raw);
    if (result?.ok && (!best || result.savedAt > best.savedAt)) best = { slot, savedAt: result.savedAt };
  }
  return best?.slot ?? null;
}

function incompatibility(world: World, state: GameState): string | null {
  const room = world.rooms[state.roomId];
  if (!room) return `The save is in room "${state.roomId}", which no longer exists.`;
  if (!onPolygon(state.player, room.walkable)) return 'The save has Dana standing off the floor (the room changed).';
  const missing = state.inventory.find((id) => !world.items[id]);
  if (missing) return `The save holds item "${missing}", which no longer exists.`;
  if (state.conversation) {
    const dialogue = world.dialogues[state.conversation.dialogueId];
    if (!dialogue) return `The save is mid-conversation in "${state.conversation.dialogueId}", which no longer exists.`;
    if (!dialogue.nodes[state.conversation.nodeId]) return `The save is at dialogue node "${state.conversation.nodeId}", which no longer exists.`;
  }
  return null;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === 'string');
}

/** Shape check only; content checks happen in `incompatibility`. */
function isGameState(x: unknown): x is GameState {
  if (!isRecord(x)) return false;
  const { roomId, player, inventory, flags, conversation, spentOptions } = x;
  return (
    typeof roomId === 'string' &&
    isRecord(player) &&
    typeof player.x === 'number' &&
    typeof player.y === 'number' &&
    isStringArray(inventory) &&
    isRecord(flags) &&
    Object.values(flags).every((v) => typeof v === 'boolean') &&
    (conversation === null ||
      (isRecord(conversation) && typeof conversation.dialogueId === 'string' && typeof conversation.nodeId === 'string')) &&
    isStringArray(spentOptions)
  );
}
