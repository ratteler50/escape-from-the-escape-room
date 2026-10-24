import { availableItemAction, availableOptions, availableVerbs, handle, visibleHotspots } from '../core/engine';
import { WON, type Command, type GameState, type World } from '../core/types';

// Explores every game state the player can reach by trying every command the UI could offer, and
// works out which of them can still win. Used by the always-winnable test (no deaths, no dead ends,
// docs/design.md) and by the end-to-end play-through, which clicks through the shortest solution.
// Player position is ignored; it never affects puzzles.

export const STATE_CAP = 50_000;

interface Explored {
  state: GameState;
  /** How we first got here: the previous state's key and the command, for printing paths. */
  parent: { key: string; command: Command } | null;
}

/** Flags and spent dialogue options that can't change what the player can do. */
export interface Flavour {
  flags: ReadonlySet<string>;
  spentOptions: ReadonlySet<string>;
}

/**
 * Two states that differ only in ways puzzles can't see (position, inventory order, and any
 * `flavour` bits) are the same. Exploration passes `flavour`; the end-to-end tests compare exactly.
 */
export function stateKey(s: GameState, flavour?: Flavour): string {
  return JSON.stringify({
    room: s.roomId,
    inventory: [...s.inventory].sort(),
    flags: Object.keys(s.flags)
      .filter((f) => s.flags[f] && !flavour?.flags.has(f))
      .sort(),
    conversation: s.conversation,
    spent: s.spentOptions.filter((o) => !flavour?.spentOptions.has(o)).sort(),
  });
}

/**
 * Finds the bits a state can carry that never affect what the player can do, so exploration can
 * merge states that differ only in them. Without this, every independent one-off line of dialogue
 * doubles the number of states (slice 16 hit the cap that way). Two kinds:
 * - flags that no condition anywhere reads (set, never checked), counting as unread a condition that
 *   only picks between responses which only present (lines, sounds, walks): which line Dana says
 *   can't change what they can do (slice 33, the front door's look before and after trying it), and
 *   a condition that only offers a dialogue option which talks and returns to the same menu;
 * - spent `once` dialogue options whose effects are pure presentation (lines, pauses, walks, sounds) plus,
 *   at most, setting such unread flags, and that lead back to the node they're in. Having heard a
 *   line can't open or close any path.
 * Options with real effects (items, read flags, room changes) or that lead elsewhere (another node,
 * the end of the conversation) stay distinct: merging those could hide a dead end, e.g. a once-only
 * way into a node, or the only way out of a conversation.
 */
export function flavourBits(w: World): Flavour {
  const presentation = new Set(['say', 'sayOneOf', 'pause', 'face', 'walk', 'sound']);
  // Responses only: objects with nothing but `when` and `effects` (dialogue options have effects too,
  // but their conditions decide what Dana can say, so they always count).
  const isPresentationOnly = (list: unknown[]): boolean =>
    list.length > 0 &&
    list.every((r) => {
      if (!r || typeof r !== 'object' || Object.keys(r).some((k) => k !== 'when' && k !== 'effects')) return false;
      const effects = (r as { effects?: unknown }).effects;
      return Array.isArray(effects) && effects.every((e) => presentation.has((e as { type?: string }).type ?? ''));
    });
  // Dialogue options that only talk and come back to the menu they're in: whether one is offered
  // changes nothing a player can do, so its condition doesn't count as a read either (slice 33).
  const talkOnly = new Set<object>();
  for (const dialogue of Object.values(w.dialogues)) {
    for (const [nodeId, node] of Object.entries(dialogue.nodes)) {
      for (const option of node.options) {
        if (option.next === nodeId && (option.effects ?? []).every((e) => presentation.has(e.type))) talkOnly.add(option);
      }
    }
  }
  const read = new Set<string>();
  const seen = new Set<object>();
  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    if (talkOnly.has(node)) return;
    // Responses that only present: their conditions only pick a line, so they don't count as reads.
    if (Array.isArray(node) && isPresentationOnly(node)) {
      node.forEach((r) => ((r as { effects: unknown[] }).effects ?? []).forEach(visit));
      return;
    }
    // Conditions are the only objects with a `flag`/`notFlag` and no `type` (setFlag effects have one).
    const o = node as Record<string, unknown>;
    if (!('type' in o)) {
      if (typeof o.flag === 'string') read.add(o.flag);
      if (typeof o.notFlag === 'string') read.add(o.notFlag);
    }
    Object.values(o).forEach(visit);
  };
  visit(w);
  read.add(WON);

  const isFlavourFlag = (flag: string) => !read.has(flag);
  const flags = new Set<string>();
  const spentOptions = new Set<string>();
  for (const dialogue of Object.values(w.dialogues)) {
    for (const [nodeId, node] of Object.entries(dialogue.nodes)) {
      for (const option of node.options) {
        const effects = option.effects ?? [];
        effects.forEach((e) => e.type === 'setFlag' && isFlavourFlag(e.flag) && flags.add(e.flag));
        const pure = effects.every((e) => presentation.has(e.type) || (e.type === 'setFlag' && isFlavourFlag(e.flag)));
        if (option.once && pure && option.next === nodeId) spentOptions.add(`${dialogue.id}.${option.id}`);
      }
    }
  }
  // Flags set anywhere else (verbs, item uses, combinations) and never read are flavour too.
  const collectSetFlags = (node: unknown, inner = new Set<object>()): void => {
    if (!node || typeof node !== 'object' || inner.has(node)) return;
    inner.add(node);
    const o = node as Record<string, unknown>;
    if (o.type === 'setFlag' && typeof o.flag === 'string' && isFlavourFlag(o.flag)) flags.add(o.flag);
    Object.values(o).forEach((v) => collectSetFlags(v, inner));
  };
  collectSetFlags(w);
  return { flags, spentOptions };
}

/** Every command the UI could offer in this state. */
function possibleCommands(w: World, s: GameState): Command[] {
  if (s.flags[WON]) return [];
  if (s.conversation) return availableOptions(w, s).map((o) => ({ type: 'chooseOption', optionId: o.id }));

  const hotspots = visibleHotspots(w, s);
  const commands: Command[] = [];
  for (const h of hotspots) {
    for (const { verb } of availableVerbs(w, s, h.id)) commands.push({ type: 'verb', verb, hotspotId: h.id });
    for (const itemId of s.inventory) commands.push({ type: 'useItemOn', itemId, hotspotId: h.id });
  }
  for (const itemId of s.inventory) {
    // Looking can change state too (slice 33: the lanyard's small print).
    if (typeof w.items[itemId]?.look !== 'string') commands.push({ type: 'lookItem', itemId });
    if (availableItemAction(w, s, itemId)) commands.push({ type: 'itemAction', itemId });
  }
  // Combining is order-independent (engine test), so one order per pair is enough.
  s.inventory.forEach((a, i) => s.inventory.slice(i + 1).forEach((b) => commands.push({ type: 'combine', itemIds: [a, b] })));
  return commands;
}

export function describeCommand(w: World, s: GameState, c: Command): string {
  const hotspot = (id: string) => visibleHotspots(w, s).find((h) => h.id === id)?.name ?? id;
  const item = (id: string) => w.items[id]?.name ?? id;
  switch (c.type) {
    case 'verb':
      return `${c.verb} ${hotspot(c.hotspotId)}`;
    case 'useItemOn':
      return `use ${item(c.itemId)} on ${hotspot(c.hotspotId)}`;
    case 'combine':
      return `combine ${item(c.itemIds[0])} + ${item(c.itemIds[1])}`;
    case 'chooseOption': {
      const option = availableOptions(w, s).find((o) => o.id === c.optionId);
      return `say "${option?.text ?? c.optionId}"`;
    }
    case 'lookItem':
      return `look at ${item(c.itemId)}`;
    case 'itemAction':
      return `${w.items[c.itemId]?.action?.label.toLowerCase() ?? 'use'} ${item(c.itemId)}`;
  }
}

export function explore(w: World, start: GameState) {
  const explored = new Map<string, Explored>();
  const reverseEdges = new Map<string, Set<string>>();
  const errors: { key: string; command: Command; message: string }[] = [];
  const flavour = flavourBits(w);
  const startKey = stateKey(start, flavour);
  explored.set(startKey, { state: start, parent: null });
  const queue = [startKey];

  while (queue.length > 0 && explored.size <= STATE_CAP) {
    const key = queue.shift()!;
    const { state } = explored.get(key)!;
    for (const command of possibleCommands(w, state)) {
      let next: GameState;
      try {
        next = handle(w, state, command).state;
      } catch (e) {
        errors.push({ key, command, message: (e as Error).message });
        continue;
      }
      const nextKey = stateKey(next, flavour);
      if (!reverseEdges.has(nextKey)) reverseEdges.set(nextKey, new Set());
      reverseEdges.get(nextKey)!.add(key);
      if (!explored.has(nextKey)) {
        explored.set(nextKey, { state: next, parent: { key, command } });
        queue.push(nextKey);
      }
    }
  }

  // Walk backwards from every winning state: whatever we reach can still win.
  const canWin = new Set([...explored].filter(([, e]) => e.state.flags[WON]).map(([k]) => k));
  const back = [...canWin];
  while (back.length > 0) {
    for (const prev of reverseEdges.get(back.shift()!) ?? []) {
      if (!canWin.has(prev)) {
        canWin.add(prev);
        back.push(prev);
      }
    }
  }

  /** The shortest list of steps from the start to this state, readable. */
  const pathTo = (key: string): string[] => {
    const steps: string[] = [];
    for (let e = explored.get(key)!; e.parent; e = explored.get(e.parent.key)!) {
      steps.unshift(describeCommand(w, explored.get(e.parent.key)!.state, e.parent.command));
    }
    return steps;
  };

  /** The commands of the shortest path from the start to this state. */
  const commandsTo = (key: string): Command[] => {
    const commands: Command[] = [];
    for (let e = explored.get(key)!; e.parent; e = explored.get(e.parent.key)!) commands.unshift(e.parent.command);
    return commands;
  };

  return { explored, canWin, errors, pathTo, commandsTo, capped: explored.size > STATE_CAP };
}

/** The first winning state breadth-first search reaches, which is the closest one, or undefined. */
export function firstWin(result: ReturnType<typeof explore>): string | undefined {
  return [...result.explored].find(([, e]) => e.state.flags[WON])?.[0];
}

/** The commands of the shortest way from `start` to a win. Throws if the game can't be won. */
export function shortestSolution(w: World, start: GameState): Command[] {
  const result = explore(w, start);
  const win = firstWin(result);
  if (!win) throw new Error('No reachable state has the "won" flag');
  return result.commandsTo(win);
}
