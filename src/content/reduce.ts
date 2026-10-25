import { WON, type World } from '../core/types';

// Where the content reads each flag, for the always-winnable search (explore.ts): a flag that's never
// read in a way that can change what Dana can do is flavour, and a flag can stop mattering for good
// once a milestone is set (docs/slices/35-explorer-efficiency.md). Static: content only, no states.

/** Effects that only present (a line, a sound, a walk): they never change what Dana can do. */
export const PRESENTATION: ReadonlySet<string> = new Set(['say', 'sayOneOf', 'pause', 'face', 'walk', 'sound']);

/**
 * One place a flag is read, as the milestones that would rule it out for good: the read is dead once
 * every milestone in any one of these sets is set. An empty list: never dead.
 */
export type Site = string[][];

export interface FlagReads {
  /** Flags set somewhere and cleared nowhere: once set, set for good. */
  milestones: ReadonlySet<string>;
  /** Every read that can change what Dana can do, by flag. A flag missing here is never read so. */
  sites: ReadonlyMap<string, readonly Site[]>;
}

type Obj = Record<string, unknown>;
type Cond = { flag?: unknown; notFlag?: unknown; has?: unknown; lacks?: unknown };

const isObj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const onlyKeys = (o: Obj, keys: readonly string[]) => Object.keys(o).every((k) => keys.includes(k));

/** A list of responses: objects with nothing but `when` and `effects` (first match plays). */
const isResponseList = (x: unknown): x is { when?: Cond[]; effects: { type: string; flag?: string }[] }[] =>
  Array.isArray(x) && x.length > 0 && x.every((r) => isObj(r) && onlyKeys(r, ['when', 'effects']) && Array.isArray(r.effects));

/** A verb label with conditions: `{ when, text }`. It only picks a button's wording. */
const isLabel = (o: Obj) => typeof o.text === 'string' && onlyKeys(o, ['when', 'text']);

export function flagReads(w: World): FlagReads {
  // Which flags are ever set, and ever cleared.
  const set = new Set<string>([WON]);
  const cleared = new Set<string>();
  const scan = (x: unknown, seen = new Set<object>()): void => {
    if (!x || typeof x !== 'object' || seen.has(x)) return;
    seen.add(x);
    const o = x as Obj;
    if (o.type === 'setFlag' && typeof o.flag === 'string') set.add(o.flag);
    if (o.type === 'clearFlag' && typeof o.flag === 'string') cleared.add(o.flag);
    Object.values(o).forEach((v) => scan(v, seen));
  };
  scan(w);
  const milestones = new Set([...set].filter((f) => !cleared.has(f)));

  // Dialogue options that only talk and come back to their own menu: offering one changes nothing a
  // player can do (slice 33).
  const talkOnly = new Set<object>();
  for (const dialogue of Object.values(w.dialogues)) {
    for (const [nodeId, node] of Object.entries(dialogue.nodes)) {
      for (const option of node.options) {
        if (option.next === nodeId && (option.effects ?? []).every((e) => PRESENTATION.has(e.type))) talkOnly.add(option);
      }
    }
  }

  const sites = new Map<string, Site[]>();
  const record = (flag: string, site: Site) => {
    if (!sites.has(flag)) sites.set(flag, []);
    sites.get(flag)!.push(site);
  };
  /** A condition list's own way to be ruled out: it requires a milestone NOT to be set. */
  const ownKills = (conds: readonly Cond[]): string[][] =>
    conds.flatMap((c) => (typeof c.notFlag === 'string' && milestones.has(c.notFlag) ? [[c.notFlag]] : []));
  const readsIn = (conds: readonly Cond[]) => conds.flatMap((c) => [c.flag, c.notFlag].filter((f): f is string => typeof f === 'string'));

  const seen = new Set<object>();
  const walk = (x: unknown): void => {
    if (!x || typeof x !== 'object' || seen.has(x)) return;
    seen.add(x);
    if (Array.isArray(x)) {
      if (isResponseList(x)) return responses(x);
      return x.forEach(walk);
    }
    const o = x as Obj;
    if (talkOnly.has(o) || isLabel(o)) return;
    if (Array.isArray(o.when)) {
      const conds = o.when as Cond[];
      for (const flag of readsIn(conds)) record(flag, ownKills(conds));
      for (const [k, v] of Object.entries(o)) if (k !== 'when') walk(v);
      return;
    }
    // A condition outside a `when` (none today): count it, conservatively.
    if (!('type' in o)) for (const flag of readsIn([o as Cond])) record(flag, []);
    Object.values(o).forEach(walk);
  };

  /**
   * First-match responses. A read in a list whose only lasting effect is setting that very flag (or
   * nothing) only picks a line: a say-once latch at most (slice 35), no read at all. Otherwise each
   * read is ruled out by its own `notFlag` milestones, or by an earlier response that's bound to win
   * once its milestones are set.
   */
  const responses = (list: { when?: Cond[]; effects: { type: string; flag?: string }[] }[]) => {
    const lasting = list.flatMap((r) => r.effects.filter((e) => !PRESENTATION.has(e.type)));
    const onlySets = lasting.every((e) => e.type === 'setFlag');
    const setsOnly = new Set(lasting.map((e) => e.flag));
    const linePickerFor = (flag: string) => onlySets && (setsOnly.size === 0 || (setsOnly.size === 1 && setsOnly.has(flag)));
    list.forEach((r, i) => {
      const conds = r.when ?? [];
      // Earlier responses that always win once their milestones are set (no `when`: always).
      const shadows = list
        .slice(0, i)
        .map((e) => e.when ?? [])
        .filter((ws) => ws.every((c) => typeof c.flag === 'string' && milestones.has(c.flag) && Object.keys(c).length === 1))
        .map((ws) => ws.map((c) => c.flag as string));
      for (const flag of readsIn(conds)) if (!linePickerFor(flag)) record(flag, [...ownKills(conds), ...shadows]);
      r.effects.forEach(walk);
    });
  };

  walk(w);
  return { milestones, sites };
}

/** The flags that can no longer change anything, given these flags: every read ruled out for good. */
export function deadFlags(reads: FlagReads, flags: Readonly<Record<string, boolean>>): Set<string> {
  const dead = new Set<string>();
  for (const [flag, sites] of reads.sites) {
    if (sites.every((site) => site.some((kill) => kill.every((m) => flags[m])))) dead.add(flag);
  }
  return dead;
}
