import type { Point, Polygon, Rect } from './geometry';

export type RoomId = string;
export type HotspotId = string;
export type ItemId = string;
export type FlagId = string;

/** The verbs on the verb coin, in the order the coin shows them. */
export const VERBS = ['look', 'take', 'talk', 'use'] as const;
export type Verb = (typeof VERBS)[number];

/** A test against game state. A list of conditions holds only if every one of them holds. */
export type Condition = { flag: FlagId } | { notFlag: FlagId } | { has: ItemId } | { lacks: ItemId };

/** Output from the core: what happened, in order. The engine applies state changes; the view plays them. */
export type Effect =
  | { type: 'say'; text: string }
  | { type: 'addItem'; itemId: ItemId }
  | { type: 'setFlag'; flag: FlagId };

/** One possible outcome of a verb. The first response whose conditions hold is used. */
export interface Response {
  when?: Condition[];
  effects: Effect[];
}

export interface VerbSpec {
  /** Replaces the verb's name on the coin, for jokes ("Borrow a limb"). */
  label?: string;
  /** The verb is only offered while these hold. Omit to always offer it. */
  when?: Condition[];
  /** Checked in order. The last one should have no `when`, so there is always a fallback. */
  responses: Response[];
}

/** Every hotspot can be looked at; the other verbs are optional. */
export type HotspotVerbs = { look: VerbSpec } & Partial<Record<Exclude<Verb, 'look'>, VerbSpec>>;

export interface Hotspot {
  id: HotspotId;
  /** Shown when the cursor hovers over the hotspot. */
  name: string;
  /** Clickable area. Also where the placeholder shape is drawn until real art arrives. */
  bounds: Rect;
  /** Where the player walks to before interacting. Must be inside the room's walkable area. */
  interactionPoint: Point;
  verbs: HotspotVerbs;
}

export interface Item {
  id: ItemId;
  name: string;
  look: string;
}

export interface Room {
  id: RoomId;
  name: string;
  walkable: Polygon;
  hotspots: readonly Hotspot[];
}

/** All game content. Static: never changes during play. */
export interface World {
  rooms: Readonly<Record<RoomId, Room>>;
  items: Readonly<Record<ItemId, Item>>;
}

/** Everything that changes during play. Plain data so it can be saved later. */
export interface GameState {
  roomId: RoomId;
  player: Point;
  inventory: readonly ItemId[];
  flags: Readonly<Record<FlagId, boolean>>;
}

/** Input to the core: what the player asked to do. */
export type Command = { type: 'verb'; verb: Verb; hotspotId: HotspotId };

/** A verb as the coin should show it. */
export interface VerbOption {
  verb: Verb;
  label: string;
}

export interface CommandResult {
  state: GameState;
  effects: Effect[];
}
