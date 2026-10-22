import type { GameState, World } from '../core/types';
import { breakRoom, breakRoomCombinations, breakRoomItems, intercomDialogue, lanyard } from './breakRoom';
import { giftShop, giftShopItems } from './giftShop';
import { kyle, kyleDialogue } from './kyle';
import { lair, lairCombinations, lairItems } from './lair';
import { mordecai, mordecaiDialogue } from './mordecai';
import { reginald, reginaldDialogue } from './reginald';

export const world: World = {
  rooms: {
    [lair.id]: lair,
    [giftShop.id]: giftShop,
    [breakRoom.id]: breakRoom,
  },
  items: Object.fromEntries([...lairItems, ...giftShopItems, ...breakRoomItems].map((item) => [item.id, item])),
  combinations: [...lairCombinations, ...breakRoomCombinations],
  characters: {
    dana: { id: 'dana', name: 'Dana', color: '#ffe28a' },
    [reginald.id]: reginald,
    [kyle.id]: kyle,
    [mordecai.id]: mordecai,
  },
  dialogues: {
    [reginaldDialogue.id]: reginaldDialogue,
    [kyleDialogue.id]: kyleDialogue,
    [mordecaiDialogue.id]: mordecaiDialogue,
    [intercomDialogue.id]: intercomDialogue,
  },
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
