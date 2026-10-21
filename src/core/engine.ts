import {
  VERBS,
  type Command,
  type CommandResult,
  type Condition,
  type Effect,
  type GameState,
  type Hotspot,
  type HotspotId,
  type Room,
  type Verb,
  type VerbOption,
  type VerbSpec,
  type World,
} from './types';

const DEFAULT_LABELS: Record<Verb, string> = { look: 'Look', take: 'Take', talk: 'Talk', use: 'Use' };

/**
 * The rules engine. Pure: given the world, the current state, and a command, returns the new
 * state and the effects for the view to play. Never mutates its inputs.
 */
export function handle(world: World, state: GameState, command: Command): CommandResult {
  switch (command.type) {
    case 'verb': {
      const hotspot = findHotspot(currentRoom(world, state), command.hotspotId);
      const spec = hotspot.verbs[command.verb];
      if (!spec || !holds(state, spec.when)) {
        throw new Error(`Verb "${command.verb}" is not available on hotspot "${hotspot.id}"`);
      }
      const response = spec.responses.find((r) => holds(state, r.when));
      if (!response) {
        throw new Error(`No response for "${command.verb}" on "${hotspot.id}" matches the current state`);
      }
      return { state: response.effects.reduce((s, effect) => apply(world, s, effect), state), effects: response.effects };
    }
  }
}

/** The verbs the coin should offer on a hotspot right now, in coin order. */
export function availableVerbs(world: World, state: GameState, hotspotId: HotspotId): VerbOption[] {
  const hotspot = findHotspot(currentRoom(world, state), hotspotId);
  return VERBS.flatMap((verb) => {
    const spec: VerbSpec | undefined = hotspot.verbs[verb];
    if (!spec || !holds(state, spec.when)) return [];
    return [{ verb, label: spec.label ?? DEFAULT_LABELS[verb] }];
  });
}

export function currentRoom(world: World, state: GameState): Room {
  const room = world.rooms[state.roomId];
  if (!room) throw new Error(`Unknown room "${state.roomId}"`);
  return room;
}

function findHotspot(room: Room, id: HotspotId): Hotspot {
  const hotspot = room.hotspots.find((h) => h.id === id);
  if (!hotspot) throw new Error(`No hotspot "${id}" in room "${room.id}"`);
  return hotspot;
}

function holds(state: GameState, conditions: readonly Condition[] = []): boolean {
  return conditions.every((c) => {
    if ('flag' in c) return state.flags[c.flag] === true;
    if ('notFlag' in c) return state.flags[c.notFlag] !== true;
    if ('has' in c) return state.inventory.includes(c.has);
    return !state.inventory.includes(c.lacks);
  });
}

/** Applies one effect's state change. Effects that only affect presentation (say) return state as is. */
function apply(world: World, state: GameState, effect: Effect): GameState {
  switch (effect.type) {
    case 'say':
      return state;
    case 'addItem':
      if (!world.items[effect.itemId]) throw new Error(`Unknown item "${effect.itemId}"`);
      if (state.inventory.includes(effect.itemId)) return state;
      return { ...state, inventory: [...state.inventory, effect.itemId] };
    case 'setFlag':
      return { ...state, flags: { ...state.flags, [effect.flag]: true } };
  }
}
