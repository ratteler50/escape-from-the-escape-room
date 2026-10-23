import type { Character, Combination, Dialogue, Item, Room, World } from '../core/types';

/**
 * What one content file contributes to the world. Each room or character file exports one;
 * `world.ts` merges them (docs/adding-content.md).
 */
export interface ContentPack {
  rooms?: readonly Room[];
  items?: readonly Item[];
  combinations?: readonly Combination[];
  characters?: readonly Character[];
  dialogues?: readonly Dialogue[];
}

type Merged = Pick<World, 'rooms' | 'items' | 'combinations' | 'characters' | 'dialogues'>;

function byId<T extends { id: string }>(kind: string, lists: readonly (readonly T[] | undefined)[]): Record<string, T> {
  const merged: Record<string, T> = {};
  for (const thing of lists.flatMap((list) => list ?? [])) {
    if (merged[thing.id]) throw new Error(`Two content packs define ${kind} "${thing.id}"; ids must be unique`);
    merged[thing.id] = thing;
  }
  return merged;
}

/** Merges content packs into the world's lookup tables. Throws if two packs share an id. */
export function mergePacks(packs: readonly ContentPack[]): Merged {
  return {
    rooms: byId('rooms', packs.map((p) => p.rooms)),
    items: byId('items', packs.map((p) => p.items)),
    combinations: packs.flatMap((p) => p.combinations ?? []),
    characters: byId('characters', packs.map((p) => p.characters)),
    dialogues: byId('dialogues', packs.map((p) => p.dialogues)),
  };
}
