import type { GameState, World } from '../core/types';
import { audio } from './audio';
import { breakRoomPack, lanyard } from './breakRoom';
import { castPack } from './cast';
import { finalePack } from './finale';
import { giftShopPack } from './giftShop';
import { kylePack } from './kyle';
import { lair, lairPack } from './lair';
import { loadingLines } from './loading';
import { mordecaiPack } from './mordecai';
import { mergePacks } from './pack';
import { reginaldPack } from './reginald';

// Every content file's pack. A new room or character adds its pack here (docs/adding-content.md).
const packs = [castPack, lairPack, reginaldPack, giftShopPack, kylePack, mordecaiPack, finalePack, breakRoomPack];

export const world: World = {
  ...mergePacks(packs),
  audio,
  loadingLines,
  fallbacks: {
    // DRAFT: no "the" before {item} or {target}: names like "Gary's Arm" and "Gary" don't take one.
    useItemOn: [
      '{item} on {target}? Bold. Wrong, but bold.',
      'I try {item} on {target}. {target} is unimpressed.',
      'Handbook Section 12: "Do not improvise with props." I think {item} on {target} counts.',
    ],
    combine: [
      "{a} and {b}? I'm a trainee, not a wizard.",
      "I hold {a} next to {b}. Nothing. They won't even make eye contact.",
    ],
  },
};

export const initialState: GameState = {
  roomId: lair.id,
  player: lair.entries.start!,
  // Dana's lanyard: TRAINEE, and the employee number that opens their locker (slice 15).
  inventory: [lanyard.id],
  flags: {},
  conversation: null,
  spentOptions: [],
};
