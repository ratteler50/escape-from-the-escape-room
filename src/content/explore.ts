import { availableItemAction, availableOptions, availableVerbs, handle, visibleHotspots } from '../core/engine';
import { WON, type Command, type GameState, type World } from '../core/types';
import { deadFlags, flagReads, PRESENTATION, type FlagReads } from './reduce';

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
  /** Where flags are read, for flags that stop mattering once a milestone is set (slice 35). */
  reads?: FlagReads;
}

/**
 * Two states that differ only in ways puzzles can't see (position, inventory order, any `flavour`
 * bits, and flags a milestone has made dead) are the same. Exploration passes `flavour`; the
 * end-to-end tests compare exactly.
 */
export function stateKey(s: GameState, flavour?: Flavour): string {
  const dead = flavour?.reads ? deadFlags(flavour.reads, s.flags) : undefined;
  return JSON.stringify({
    room: s.roomId,
    inventory: [...s.inventory].sort(),
    flags: Object.keys(s.flags)
      .filter((f) => s.flags[f] && !flavour?.flags.has(f) && !dead?.has(f))
      .sort(),
    conversation: s.conversation,
    spent: s.spentOptions.filter((o) => !flavour?.spentOptions.has(o)).sort(),
  });
}

/**
 * Finds the bits a state can carry that never affect what the player can do, so exploration can
 * merge states that differ only in them. Without this, every independent one-off line of dialogue
 * doubles the number of states (slice 16 hit the cap that way). Two kinds:
 * - flags that no condition anywhere reads (set, never checked), counting as unread (reduce.ts): a
 *   condition that only picks between responses which only present (lines, sounds, walks), or that
 *   also only set that same flag (a say-once latch, slice 35); a condition that only offers a dialogue
 *   option which talks and returns to the same menu; and a verb label's (it only picks a wording);
 * - spent `once` dialogue options whose effects are pure presentation (lines, pauses, walks, sounds) plus,
 *   at most, setting such unread flags, and that lead back to the node they're in. Having heard a
 *   line can't open or close any path.
 * Options with real effects (items, read flags, room changes) or that lead elsewhere (another node,
 * the end of the conversation) stay distinct: merging those could hide a dead end, e.g. a once-only
 * way into a node, or the only way out of a conversation.
 */
export function flavourBits(w: World, options: { slice35?: boolean } = {}): Flavour {
  const presentation = PRESENTATION;
  // Every read that can change what Dana can do (reduce.ts): line pickers, talk-only options and labels
  // don't count, nor do say-once latches (slice 35).
  const reads = flagReads(w, options);
  const read = new Set([...reads.sites.keys(), WON]);

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
  // Without slice 35's rules, no flag dies after a milestone either.
  return options.slice35 === false ? { flags, spentOptions } : { flags, spentOptions, reads };
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

/**
 * Whether a step from key `a` to key `b` is side-effect free, but for these flags: nothing differs but
 * the room and those flags (walking through a door that sets nothing; flipping a toggle).
 */
function quietStep(a: string, b: string, flags: ReadonlySet<string>): boolean {
  const [ka, kb] = [JSON.parse(a), JSON.parse(b)] as { room: string; flags: string[] }[];
  const rest = (k: { room: string; flags: string[] }) => JSON.stringify({ ...k, room: null, flags: null });
  if (rest(ka!) !== rest(kb!)) return false;
  return [...ka!.flags.filter((f) => !kb!.flags.includes(f)), ...kb!.flags.filter((f) => !ka!.flags.includes(f))].every((f) => flags.has(f));
}

type Route = { command: Command; before: GameState }[];
/** A step from a state: the command, and where it leads (or why it can't be taken). */
type Step = { command: Command; next: GameState; key: string } | { command: Command; error: Error };
/** Every step the UI could offer from a state, worked out once per state and shared (slice 35). */
type Steps = (s: GameState) => readonly Step[];

/** A cache of every state's steps, by key: the search, the toggle checks and routes all share it. */
function stepsOf(w: World, flavour: Flavour): Steps {
  const cache = new Map<string, Step[]>();
  return (s) => {
    const key = stateKey(s, flavour);
    let steps = cache.get(key);
    if (!steps) {
      steps = possibleCommands(w, s).map((command): Step => {
        try {
          const next = handle(w, s, command).state;
          return { command, next, key: stateKey(next, flavour) };
        } catch (e) {
          return { command, error: e as Error };
        }
      });
      cache.set(key, steps);
    }
    return steps;
  };
}

/** The states reachable from `s` by side-effect-free steps (changing only the room and these flags), by key. */
function quietReach(s: GameState, flags: ReadonlySet<string>, flavour: Flavour, steps: Steps): Map<string, { state: GameState; via: Route }> {
  const found = new Map([[stateKey(s, flavour), { state: s, via: [] as Route }]]);
  const queue = [...found.values()];
  for (let i = 0; i < queue.length; i++) {
    const { state, via } = queue[i]!;
    if (state.conversation || state.flags[WON]) continue;
    const here = stateKey(state, flavour);
    for (const step of steps(state)) {
      if ('error' in step || found.has(step.key) || !quietStep(here, step.key, flags)) continue;
      const entry = { state: step.next, via: [...via, { command: step.command, before: state }] };
      found.set(step.key, entry);
      queue.push(entry);
    }
  }
  return found;
}

/**
 * The flags Dana can flip, and flip back, from this state using only side-effect-free steps: walking
 * through doors that set nothing, and the flip itself (slice 35: the coffin, the fridge, the locker
 * once the pay packet is out, the case once the scroll is back; from any room Dana can walk back to
 * them from). States that differ only in such flags can reach each other at will, so the search
 * treats them as one. A room Dana can't get back to, or a way back that sets something, rules it out.
 * Only flags the content both sets and clears are candidates.
 */
export function freeToggles(w: World, s: GameState, flavour: Flavour, steps: Steps = stepsOf(w, flavour)): Set<string> {
  const free = new Set<string>();
  if (s.conversation || s.flags[WON]) return free;
  const here = stateKey(s, flavour);
  for (const flag of flavour.reads?.toggleable ?? []) {
    if (flavour.flags.has(flag)) continue;
    const flipped = stateKey({ ...s, flags: { ...s.flags, [flag]: !s.flags[flag] } }, flavour);
    if (flipped === here) continue;
    const there = quietReach(s, new Set([flag]), flavour, steps).get(flipped);
    if (there && quietReach(there.state, new Set([flag]), flavour, steps).has(here)) free.add(flag);
  }
  return free;
}

interface Edge {
  key: string;
  command: Command;
  /** The state the command was taken from: one of the states the key stands for (free toggles). */
  from: GameState;
  /** The state it led to (which of the next key's settings: the coffin open or closed). */
  to: GameState;
}

/**
 * `reduce: false` searches without slice 35's rules (latches, labels, dead flags, free toggles): the
 * explorer as it was, for the cross-check that both agree on what can still win.
 */
export function explore(w: World, start: GameState, options: { reduce?: boolean } = {}) {
  const reduce = options.reduce ?? true;
  // `parents`: every edge in from the breadth-first layer before (all shortest ways in), so a route
  // can pick the one that lands where its next step starts (slice 35). `parent` is the first.
  const explored = new Map<string, Explored & { parent: Edge | null; parents: Edge[]; depth: number }>();
  const reverseEdges = new Map<string, Set<string>>();
  const errors: { key: string; command: Command; message: string }[] = [];
  const flavour = flavourBits(w, { slice35: reduce });
  const steps = stepsOf(w, flavour);
  const freeMemo = new Map<string, Set<string>>();
  const freeIn = (s: GameState): Set<string> => {
    const base = stateKey(s, flavour);
    if (!freeMemo.has(base)) freeMemo.set(base, reduce ? freeToggles(w, s, flavour, steps) : new Set());
    return freeMemo.get(base)!;
  };
  /** A state's key, ignoring its free toggles: open and closed coffin are one state. */
  const keyOf = (s: GameState): string => {
    const free = freeIn(s);
    if (free.size === 0) return stateKey(s, flavour);
    return stateKey({ ...s, flags: Object.fromEntries(Object.entries(s.flags).filter(([f]) => !free.has(f))) }, flavour);
  };
  /**
   * Every state a key stands for: this one, with its free toggles set every way (each reachable from
   * the others by side-effect-free steps, freeToggles). Exploring from all of them keeps every future,
   * e.g. what's only offered while the coffin is open.
   */
  const members = (rep: GameState, key: string): GameState[] => {
    let found = [rep];
    for (const flag of freeIn(rep)) found = found.flatMap((m) => [m, { ...m, flags: { ...m.flags, [flag]: !m.flags[flag] } }]);
    return found.filter((m) => keyOf(m) === key);
  };

  const startKey = keyOf(start);
  explored.set(startKey, { state: start, parent: null, parents: [], depth: 0 });
  const queue = [startKey];

  while (queue.length > 0 && explored.size <= STATE_CAP) {
    const key = queue.shift()!;
    const { state, depth } = explored.get(key)!;
    for (const from of members(state, key)) {
      for (const step of steps(from)) {
        if ('error' in step) {
          errors.push({ key, command: step.command, message: step.error.message });
          continue;
        }
        const nextKey = keyOf(step.next);
        if (nextKey === key) continue;
        if (!reverseEdges.has(nextKey)) reverseEdges.set(nextKey, new Set());
        reverseEdges.get(nextKey)!.add(key);
        const edge = { key, command: step.command, from, to: step.next };
        const known = explored.get(nextKey);
        if (!known) {
          explored.set(nextKey, { state: step.next, parent: edge, parents: [edge], depth: depth + 1 });
          queue.push(nextKey);
        } else if (known.depth === depth + 1) {
          known.parents.push(edge);
        }
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

  /**
   * The steps from the start to this state, each with the state it's taken from, playable as they
   * are: where the search took a step from another state of the same key (the coffin open, not
   * closed), the side-effect-free steps that get there are put in first (slice 35).
   */
  const route = (key: string): Route => {
    // Backwards from the end: of the shortest ways into each key, prefer one that lands exactly where
    // the next step is taken from (the coffin already open), so no flip needs putting in. Opening the
    // coffin and knocking on it reach the same merged state; only Open lands with it open.
    const edges: Edge[] = [];
    let need: string | undefined;
    for (let e = explored.get(key)!; e.parents.length > 0; ) {
      const edge = e.parents.find((p) => need !== undefined && stateKey(p.to, flavour) === need) ?? e.parents[0]!;
      edges.unshift(edge);
      need = stateKey(edge.from, flavour);
      e = explored.get(edge.key)!;
    }
    const out: Route = [];
    let current = start;
    for (const edge of edges) {
      const target = stateKey(edge.from, flavour);
      if (stateKey(current, flavour) !== target) {
        const found = quietReach(current, freeIn(current), flavour, steps).get(target);
        if (!found) throw new Error(`No side-effect-free way to the state a step was taken from: ${target}`);
        out.push(...found.via);
        current = found.state;
      }
      out.push({ command: edge.command, before: current });
      const step = steps(current).find((s) => JSON.stringify(s.command) === JSON.stringify(edge.command));
      if (!step || 'error' in step) throw new Error(`A step on the route can't be taken: ${JSON.stringify(edge.command)}`);
      current = step.next;
    }
    return out;
  };

  /** The shortest list of steps from the start to this state, readable. */
  const pathTo = (key: string): string[] => route(key).map(({ command, before }) => describeCommand(w, before, command));

  /** The commands of the shortest path from the start to this state. */
  const commandsTo = (key: string): Command[] => route(key).map(({ command }) => command);

  /** Every flag found to be a free toggle in some explored state (slice 35's listing test). */
  const toggles = new Set([...freeMemo.values()].flatMap((free) => [...free]));
  return { explored, canWin, errors, pathTo, commandsTo, keyOf, toggles, capped: explored.size > STATE_CAP };
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
