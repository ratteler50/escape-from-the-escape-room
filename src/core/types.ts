import type { Point, Polygon, Rect } from './geometry';

export type RoomId = string;
export type HotspotId = string;
export type ItemId = string;
export type FlagId = string;
export type CharacterId = string;
export type DialogueId = string;
export type NodeId = string;
export type OptionId = string;
export type SoundId = string;
export type TrackId = string;
export type EntryId = string;

/** Set by the `win` effect. */
export const WON: FlagId = 'won';

/** The sound the core plays when an item use or combination has nothing written for it. */
export const FAIL_SOUND: SoundId = 'fail';

/** Who says a line when a `say` effect has no `speaker`. */
export const PLAYER: CharacterId = 'dana';

/** The verbs on the verb coin, in the order the coin shows them. */
export const VERBS = ['look', 'take', 'talk', 'use'] as const;
export type Verb = (typeof VERBS)[number];

/** A test against game state. A list of conditions holds only if every one of them holds. */
export type Condition = { flag: FlagId } | { notFlag: FlagId } | { has: ItemId } | { lacks: ItemId };

/** Output from the core: what happened, in order. The engine applies state changes; the view plays them. */
export type Effect =
  | { type: 'say'; text: string; speaker?: CharacterId }
  | { type: 'addItem'; itemId: ItemId }
  | { type: 'removeItem'; itemId: ItemId }
  | { type: 'setFlag'; flag: FlagId }
  | { type: 'startDialogue'; dialogueId: DialogueId }
  | { type: 'endDialogue' }
  /** The game is won. Sets the `won` flag; the view shows the end card. */
  | { type: 'win' }
  /** Move to another room, arriving at one of its named entry points. */
  | { type: 'goToRoom'; roomId: RoomId; entry: EntryId }
  // Cutscene steps. Presentation only: the core passes them through and state doesn't change.
  /** A character (Dana, or one drawn as a hotspot) walks to a point, given as their feet position. */
  | { type: 'walk'; character: CharacterId; to: Point }
  | { type: 'pause'; ms: number }
  | { type: 'face'; character: CharacterId; direction: 'left' | 'right' }
  /** A sound effect, by its name in `World.audio.sounds`. Doesn't wait for the sound to finish. */
  | { type: 'sound'; sound: SoundId };

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
  /** The hotspot only exists while these hold. Omit to always exist. */
  when?: Condition[];
  /** If this hotspot is a character, their lines are drawn above it. */
  character?: CharacterId;
  /** Which of the character's sprites to draw (default `standing`). Presentation only. */
  pose?: Exclude<Pose, 'standing'>;
  /** Shown when the cursor hovers over the hotspot. */
  name: string;
  /** Clickable area. Also where the placeholder shape is drawn until real art arrives. */
  bounds: Rect;
  /** Where the player walks to before interacting. Must be inside the room's walkable area. */
  interactionPoint: Point;
  verbs: HotspotVerbs;
  /** What happens when a specific inventory item is used on this hotspot. Same rules as verb responses. */
  itemUses?: Partial<Record<ItemId, Response[]>>;
  /** Said when an item with no `itemUses` entry is used here. Otherwise a generic line is used. */
  itemFallback?: string;
}

/** Two items that can be combined, in either order. */
export interface Combination {
  items: readonly [ItemId, ItemId];
  responses: Response[];
}

export interface Item {
  id: ItemId;
  name: string;
  /** The inventory icon, a path under `public/`: square, transparent, at 2× its on-screen size. Presentation only. */
  icon?: string;
  look: string;
  /** Something Dana can do with the item itself (read, eat, memorise). A third button on its coin. */
  action?: VerbSpec & { label: string };
}

export interface Character {
  id: CharacterId;
  name: string;
  /** CSS colour for this character's speech. */
  color: string;
  /** Drawn bobbing gently up and down (a ghost). Presentation only. */
  floats?: boolean;
  /** Painted sprites by pose (M4). Presentation only: the core never reads them. */
  sprites?: CharacterSprites;
}

export type Pose = 'standing' | 'seated' | 'human';

/**
 * Sprite images, paths under `public/`, facing right, with transparent backgrounds. Stored at twice
 * their on-screen size (so they stay sharp when the game is scaled up); drawn with their feet at the
 * bottom-centre of the character's hotspot, or at Dana's position.
 */
export type CharacterSprites = { standing: string } & Partial<Record<Exclude<Pose, 'standing'>, string>>;

/** One of Dana's lines in a conversation. */
export interface DialogueOption {
  /** Unique within its dialogue. */
  id: OptionId;
  /** What Dana says when it's picked. */
  text: string;
  /** Only offered while these hold. */
  when?: Condition[];
  /** Gone for good once picked. */
  once?: boolean;
  /** Played after Dana says `text`: the reply, plus any state changes. */
  effects?: Effect[];
  /** Where the conversation goes next. */
  next: NodeId | 'end';
}

export interface DialogueNode {
  options: DialogueOption[];
}

export interface Dialogue {
  id: DialogueId;
  start: NodeId;
  /** Played when the conversation starts: first matching response, or nothing if none match. */
  greeting?: Response[];
  nodes: Readonly<Record<NodeId, DialogueNode>>;
}

export interface Room {
  id: RoomId;
  name: string;
  /** Where Dana appears when they arrive, by how they arrived (e.g. "fromGiftShop"). On the floor. */
  entries: Readonly<Record<EntryId, Point>>;
  walkable: Polygon;
  hotspots: readonly Hotspot[];
  /** Painted art for the room (M4). Presentation only: the core never reads it. */
  art?: RoomArt;
  /** The music that plays here, by its name in `World.audio.music`. Without one, whatever is playing carries on. */
  music?: TrackId;
}

export interface RoomArt {
  /** The background painting, a path under `public/` (e.g. "assets/rooms/lair.webp"), 1280×720. */
  background: string;
  /** Patches of edited painting drawn over the background while their conditions hold. */
  overlays?: readonly RoomOverlay[];
}

/** A changed piece of a room's painting (Gary missing an arm), drawn at its spot on the background. */
export interface RoomOverlay {
  /** A path under `public/`, at the background's scale (1 image pixel = 1 logical pixel). */
  image: string;
  /** Where the image's top-left corner goes. */
  at: Point;
  /** Drawn only while these hold. Omit to always draw. */
  when?: Condition[];
}

/** All game content. Static: never changes during play. */
export interface World {
  rooms: Readonly<Record<RoomId, Room>>;
  items: Readonly<Record<ItemId, Item>>;
  combinations: readonly Combination[];
  characters: Readonly<Record<CharacterId, Character>>;
  dialogues: Readonly<Record<DialogueId, Dialogue>>;
  /**
   * Generic lines for when nothing specific is written. `{item}`, `{target}`, `{a}` and `{b}` are
   * replaced with names. The engine picks one deterministically, so the same attempt always gets
   * the same line.
   */
  fallbacks: {
    useItemOn: readonly string[];
    combine: readonly string[];
  };
  /** Sound effects and music (M4). Presentation only. */
  audio?: WorldAudio;
  /** Shown one at a time while the game loads (Dana quoting the Handbook). Presentation only. */
  loadingLines?: readonly string[];
}

/** Audio files are paths under `public/` (MP3s). */
export interface WorldAudio {
  sounds: Readonly<Record<SoundId, string>>;
  music: Readonly<Record<TrackId, string>>;
  /** The title screen's track. */
  title: TrackId;
}

/** Everything that changes during play. Plain data so it can be saved later. */
export interface GameState {
  roomId: RoomId;
  player: Point;
  inventory: readonly ItemId[];
  flags: Readonly<Record<FlagId, boolean>>;
  /** The conversation in progress, if any. */
  conversation: { dialogueId: DialogueId; nodeId: NodeId } | null;
  /** One-shot dialogue options already picked, as "dialogueId.optionId". */
  spentOptions: readonly string[];
}

/** Input to the core: what the player asked to do. */
export type Command =
  | { type: 'verb'; verb: Verb; hotspotId: HotspotId }
  | { type: 'lookItem'; itemId: ItemId }
  | { type: 'itemAction'; itemId: ItemId }
  | { type: 'useItemOn'; itemId: ItemId; hotspotId: HotspotId }
  | { type: 'combine'; itemIds: readonly [ItemId, ItemId] }
  | { type: 'chooseOption'; optionId: OptionId };

/** A verb as the coin should show it. */
export interface VerbOption {
  verb: Verb;
  label: string;
}

export interface CommandResult {
  state: GameState;
  effects: Effect[];
}
