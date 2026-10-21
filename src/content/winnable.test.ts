import { describe, expect, it } from 'vitest';
import { availableOptions, availableVerbs, handle, visibleHotspots } from '../core/engine';
import { WON, type Command, type GameState, type World } from '../core/types';
import { initialState, world } from './world';

// Enforces the design rule "no deaths, no dead ends" (docs/design.md): explores every game state the
// player can reach by trying every command the UI could offer, then checks the win is still
// reachable from each one. Player position is ignored; it never affects puzzles.

const STATE_CAP = 50_000;

interface Explored {
  state: GameState;
  /** How we first got here: the previous state's key and the command, for printing paths. */
  parent: { key: string; command: Command } | null;
}

/** Two states that differ only in ways puzzles can't see (position, inventory order) are the same. */
function stateKey(s: GameState): string {
  return JSON.stringify({
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
  // Combining is order-independent (engine test), so one order per pair is enough.
  s.inventory.forEach((a, i) => s.inventory.slice(i + 1).forEach((b) => commands.push({ type: 'combine', itemIds: [a, b] })));
  return commands;
}

function describeCommand(w: World, s: GameState, c: Command): string {
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
  }
}

function explore(w: World, start: GameState) {
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

  return { explored, canWin, errors, pathTo, capped: explored.size > STATE_CAP };
}

describe('always winnable', () => {
  const result = explore(world, initialState);
  const numbered = (steps: string[]) => steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n');

  it('stays under the state cap', () => {
    expect(
      result.capped,
      `More than ${STATE_CAP} reachable states: some content is multiplying states (e.g. a repeatable ` +
        `option that adds an item every time). Fix that, or raise STATE_CAP if the game really is that big`,
    ).toBe(false);
  });

  it('never throws on a command the UI could offer', () => {
    const first = result.errors[0];
    expect(
      result.errors.length,
      first &&
        `"${describeCommand(world, result.explored.get(first.key)!.state, first.command)}" threw: ${first.message}\n` +
          `Reached by:\n${numbered(result.pathTo(first.key))}`,
    ).toBe(0);
  });

  it('can be won', () => {
    expect(result.canWin.size, 'No reachable state has the "won" flag: nothing in the content triggers a win effect').toBeGreaterThan(0);
  });

  it('has no dead ends: the win is reachable from every reachable state', () => {
    const dead = [...result.explored.keys()].filter((k) => !result.canWin.has(k));
    expect(
      dead.length,
      dead[0] &&
        `${dead.length} reachable state(s) can no longer win. The shortest way into one:\n${numbered(result.pathTo(dead[0]))}\n` +
          `Its inventory and flags: ${dead[0]}`,
    ).toBe(0);
  });

  it('lets the player obtain every item', () => {
    const obtained = new Set([...result.explored.values()].flatMap((e) => e.state.inventory));
    const missing = Object.keys(world.items).filter((id) => !obtained.has(id));
    expect(missing, `These items can never be obtained: ${missing.join(', ')}. Add a way to get them, or remove them`).toEqual([]);
  });

  it('prints the shortest solution as a walkthrough', () => {
    // Breadth-first search reaches states in order of distance, so the first winning state found is
    // the closest; pathTo follows the parents that discovered it.
    const firstWin = [...result.explored].find(([, e]) => e.state.flags[WON])![0];
    const steps = result.pathTo(firstWin);
    console.log(`Shortest solution (${steps.length} steps, ${result.explored.size} states explored):\n${numbered(steps)}`);
    expect(steps.length).toBeGreaterThan(0);
  });
});
