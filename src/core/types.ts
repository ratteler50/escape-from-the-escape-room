import type { Point, Polygon, Rect } from './geometry';

export type RoomId = string;
export type HotspotId = string;

export interface Hotspot {
  id: HotspotId;
  /** Shown when the cursor hovers over the hotspot. */
  name: string;
  /** Clickable area. Also where the placeholder shape is drawn until real art arrives. */
  bounds: Rect;
  /** Where the player walks to before interacting. Must be inside the room's walkable area. */
  interactionPoint: Point;
  /** What the player character says on right-click. */
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
}

/** Everything that changes during play. Plain data so it can be saved later. */
export interface GameState {
  roomId: RoomId;
  player: Point;
}

/** Input to the core: what the player asked to do. */
export type Command = { type: 'look'; hotspotId: HotspotId };

/** Output from the core: what the view should play, in order. */
export type Effect = { type: 'say'; text: string };

export interface CommandResult {
  state: GameState;
  effects: Effect[];
}
