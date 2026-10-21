import {
  VERBS,
  type Command,
  type CommandResult,
  type Condition,
  type Effect,
  type GameState,
  type Hotspot,
  type HotspotId,
  type Item,
  type ItemId,
  type Response,
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
      return respond(world, state, spec.responses, `"${command.verb}" on "${hotspot.id}"`);
    }

    case 'lookItem': {
      const item = heldItem(world, state, command.itemId);
      return { state, effects: [{ type: 'say', text: item.look }] };
    }

    case 'useItemOn': {
      const item = heldItem(world, state, command.itemId);
      const hotspot = findHotspot(currentRoom(world, state), command.hotspotId);
      const responses = hotspot.itemUses?.[item.id];
      if (responses) return respond(world, state, responses, `item "${item.id}" on "${hotspot.id}"`);

      const text =
        hotspot.itemFallback ??
        pickFallback(world.fallbacks.useItemOn, `${item.id}>${hotspot.id}`, { item: item.name, target: hotspot.name });
      return { state, effects: [{ type: 'say', text }] };
    }

    case 'combine': {
      const [a, b] = command.itemIds.map((id) => heldItem(world, state, id)) as [Item, Item];
      if (a.id === b.id) throw new Error(`Can't combine item "${a.id}" with itself`);
      const combination = world.combinations.find(
        ({ items: [x, y] }) => (x === a.id && y === b.id) || (x === b.id && y === a.id),
      );
      if (combination) return respond(world, state, combination.responses, `combining "${a.id}" and "${b.id}"`);

      // Sort so the fallback line doesn't depend on which item was picked first.
      const key = [a.id, b.id].sort().join('+');
      return { state, effects: [{ type: 'say', text: pickFallback(world.fallbacks.combine, key, { a: a.name, b: b.name }) }] };
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

function heldItem(world: World, state: GameState, id: ItemId): Item {
  const item = world.items[id];
  if (!item) throw new Error(`Unknown item "${id}"`);
  if (!state.inventory.includes(id)) throw new Error(`Item "${id}" is not in the inventory`);
  return item;
}

/** Runs the first response whose conditions hold. `what` names the situation for error messages. */
function respond(world: World, state: GameState, responses: readonly Response[], what: string): CommandResult {
  const response = responses.find((r) => holds(state, r.when));
  if (!response) throw new Error(`No response for ${what} matches the current state`);
  return { state: response.effects.reduce((s, effect) => apply(world, s, effect), state), effects: response.effects };
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
    case 'removeItem':
      return { ...state, inventory: state.inventory.filter((id) => id !== effect.itemId) };
    case 'setFlag':
      return { ...state, flags: { ...state.flags, [effect.flag]: true } };
  }
}

/** Deterministic pick: the same key always gets the same line. Fills `{name}` placeholders. */
function pickFallback(pool: readonly string[], key: string, names: Record<string, string>): string {
  if (pool.length === 0) throw new Error('Fallback pool is empty');
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const template = pool[hash % pool.length]!;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => names[name] ?? match);
}
