import {
  VERBS,
  FAIL_SOUND,
  WON,
  type Command,
  type CommandResult,
  type Condition,
  type Dialogue,
  type DialogueOption,
  type Effect,
  type GameState,
  type Hotspot,
  type HotspotId,
  type Item,
  type ItemId,
  type Response,
  type Room,
  type RoomOverlay,
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
  if (command.type !== 'chooseOption' && state.conversation) {
    throw new Error(`Can't "${command.type}" during a conversation; choose a dialogue option instead`);
  }
  switch (command.type) {
    case 'verb': {
      const hotspot = findHotspot(world, state, command.hotspotId);
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

    case 'itemAction': {
      const item = heldItem(world, state, command.itemId);
      if (!availableItemAction(world, state, item.id)) throw new Error(`Item "${item.id}" has no action available right now`);
      return respond(world, state, item.action!.responses, `the action on item "${item.id}"`);
    }

    case 'useItemOn': {
      const item = heldItem(world, state, command.itemId);
      const hotspot = findHotspot(world, state, command.hotspotId);
      const responses = hotspot.itemUses?.[item.id];
      if (responses) return respond(world, state, responses, `item "${item.id}" on "${hotspot.id}"`);

      const text =
        hotspot.itemFallback ??
        pickFallback(world.fallbacks.useItemOn, `${item.id}>${hotspot.id}`, { item: item.name, target: hotspot.name });
      return { state, effects: [{ type: 'sound', sound: FAIL_SOUND }, { type: 'say', text }] };
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
      const text = pickFallback(world.fallbacks.combine, key, { a: a.name, b: b.name });
      return { state, effects: [{ type: 'sound', sound: FAIL_SOUND }, { type: 'say', text }] };
    }

    case 'chooseOption': {
      const conversation = state.conversation;
      if (!conversation) throw new Error('Not in a conversation');
      const option = availableOptions(world, state).find((o) => o.id === command.optionId);
      if (!option) throw new Error(`Option "${command.optionId}" is not available in "${conversation.dialogueId}.${conversation.nodeId}"`);

      let next = state;
      if (option.once) next = { ...next, spentOptions: [...next.spentOptions, spentKey(conversation.dialogueId, option)] };
      const effects: Effect[] = [{ type: 'say', text: option.text }, ...(option.effects ?? [])];
      if (option.next === 'end') effects.push({ type: 'endDialogue' });
      else next = { ...next, conversation: { ...conversation, nodeId: option.next } };
      return run(world, next, effects);
    }
  }
}

/** Dana's options right now: the current node's options whose conditions hold, minus spent one-shots. */
export function availableOptions(world: World, state: GameState): DialogueOption[] {
  const conversation = state.conversation;
  if (!conversation) throw new Error('Not in a conversation');
  const dialogue = findDialogue(world, conversation.dialogueId);
  const node = dialogue.nodes[conversation.nodeId];
  if (!node) throw new Error(`No node "${conversation.nodeId}" in dialogue "${dialogue.id}"`);
  return node.options.filter(
    (o) => holds(state, o.when) && !(o.once && state.spentOptions.includes(spentKey(dialogue.id, o))),
  );
}

/** The held item's own action, if it has one available right now; null otherwise. */
export function availableItemAction(world: World, state: GameState, itemId: ItemId): { label: string } | null {
  const action = heldItem(world, state, itemId).action;
  return action && holds(state, action.when) ? { label: action.label } : null;
}

/** Whether a hotspot can take Dana to another room (any of its verbs can lead to `goToRoom`). */
export function isExit(hotspot: Hotspot): boolean {
  return Object.values(hotspot.verbs).some((spec) =>
    spec?.responses.some((r) => r.effects.some((e) => e.type === 'goToRoom')),
  );
}

/** The current room's hotspots that exist right now. */
export function visibleHotspots(world: World, state: GameState): Hotspot[] {
  return currentRoom(world, state).hotspots.filter((h) => holds(state, h.when));
}

/** A room's painting overlays to draw right now, in content order. */
export function visibleOverlays(room: Room, state: GameState): RoomOverlay[] {
  return (room.art?.overlays ?? []).filter((o) => holds(state, o.when));
}

/** The verbs the coin should offer on a hotspot right now, in coin order. */
export function availableVerbs(world: World, state: GameState, hotspotId: HotspotId): VerbOption[] {
  const hotspot = findHotspot(world, state, hotspotId);
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

function findHotspot(world: World, state: GameState, id: HotspotId): Hotspot {
  const hotspot = visibleHotspots(world, state).find((h) => h.id === id);
  if (!hotspot) throw new Error(`No hotspot "${id}" in room "${state.roomId}" right now`);
  return hotspot;
}

function findDialogue(world: World, id: string): Dialogue {
  const dialogue = world.dialogues[id];
  if (!dialogue) throw new Error(`Unknown dialogue "${id}"`);
  return dialogue;
}

function spentKey(dialogueId: string, option: DialogueOption): string {
  return `${dialogueId}.${option.id}`;
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
  return run(world, state, response.effects);
}

/**
 * Applies effects in order and returns everything that happened. Starting a dialogue also plays its
 * greeting, so the returned list can be longer than the one passed in.
 */
function run(world: World, state: GameState, effects: readonly Effect[]): CommandResult {
  const queue = [...effects];
  const played: Effect[] = [];
  let current = state;
  while (queue.length > 0) {
    const effect = queue.shift()!;
    current = apply(world, current, effect);
    played.push(effect);
    if (effect.type === 'startDialogue') {
      const greeting = findDialogue(world, effect.dialogueId).greeting?.find((r) => holds(current, r.when));
      if (greeting) queue.unshift(...greeting.effects);
    }
  }
  return { state: current, effects: played };
}

function holds(state: GameState, conditions: readonly Condition[] = []): boolean {
  return conditions.every((c) => {
    if ('flag' in c) return state.flags[c.flag] === true;
    if ('notFlag' in c) return state.flags[c.notFlag] !== true;
    if ('has' in c) return state.inventory.includes(c.has);
    return !state.inventory.includes(c.lacks);
  });
}

/** Applies one effect's state change. Effects that only affect presentation (say, sayOneOf, sound…) return state as is. */
function apply(world: World, state: GameState, effect: Effect): GameState {
  switch (effect.type) {
    case 'say':
    case 'sayOneOf':
    case 'walk':
    case 'pause':
    case 'face':
    case 'sound':
      return state;
    case 'addItem':
      if (!world.items[effect.itemId]) throw new Error(`Unknown item "${effect.itemId}"`);
      if (state.inventory.includes(effect.itemId)) return state;
      return { ...state, inventory: [...state.inventory, effect.itemId] };
    case 'removeItem':
      return { ...state, inventory: state.inventory.filter((id) => id !== effect.itemId) };
    case 'setFlag':
      return { ...state, flags: { ...state.flags, [effect.flag]: true } };
    case 'startDialogue': {
      const dialogue = findDialogue(world, effect.dialogueId);
      return { ...state, conversation: { dialogueId: dialogue.id, nodeId: dialogue.start } };
    }
    case 'endDialogue':
      return { ...state, conversation: null };
    case 'win':
      return { ...state, flags: { ...state.flags, [WON]: true } };
    case 'goToRoom': {
      const room = world.rooms[effect.roomId];
      if (!room) throw new Error(`goToRoom: unknown room "${effect.roomId}"`);
      const entry = room.entries[effect.entry];
      if (!entry) throw new Error(`goToRoom: room "${room.id}" has no entry "${effect.entry}" (has: ${Object.keys(room.entries).join(', ')})`);
      return { ...state, roomId: room.id, player: entry };
    }
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
