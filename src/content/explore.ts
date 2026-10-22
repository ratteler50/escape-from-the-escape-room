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

/** Two states that differ only in ways puzzles can't see (position, inventory order) are the same. */
export function stateKey(s: GameState): string {
  return JSON.stringify({
    room: s.roomId,
    inventory: [...s.inventory].sort(),
    flags: Object.keys(s.flags).filter((f) => s.flags[f]).sort(),
    conversation: s.conversation,
    spent: [...s.spentOptions].sort(),
  });
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
  const startKey = stateKey(start);
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
      const nextKey = stateKey(next);
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
