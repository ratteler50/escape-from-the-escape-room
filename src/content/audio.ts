import type { WorldAudio } from '../core/types';

// Every sound and track, by name. Sources and licenses: CREDITS.md; picks: docs/audio/.
// Content plays a sound with `sound('bones')`; the view plays the UI ones (click, coin, select,
// pickup, door) itself, and the core plays `fail` when an item use has nothing written for it.
export const audio: WorldAudio = {
  sounds: {
    click: 'assets/audio/sfx/click.mp3',
    coin: 'assets/audio/sfx/coin.mp3',
    select: 'assets/audio/sfx/select.mp3',
    pickup: 'assets/audio/sfx/pickup.mp3',
    fail: 'assets/audio/sfx/fail.mp3',
    door: 'assets/audio/sfx/door.mp3',
    bones: 'assets/audio/sfx/bones.mp3',
    squelch: 'assets/audio/sfx/squelch.mp3',
    keys: 'assets/audio/sfx/keys.mp3',
    latch: 'assets/audio/sfx/latch.mp3',
    keypad: 'assets/audio/sfx/keypad.mp3',
    unlock: 'assets/audio/sfx/unlock.mp3',
    arise: 'assets/audio/sfx/arise.mp3',
    till: 'assets/audio/sfx/till.mp3',
    rumble: 'assets/audio/sfx/rumble.mp3',
    finale: 'assets/audio/sfx/finale.mp3',
  },
  music: {
    title: 'assets/audio/music/title.mp3',
    lair: 'assets/audio/music/lair.mp3',
    giftShop: 'assets/audio/music/gift-shop.mp3',
    breakRoom: 'assets/audio/music/break-room.mp3',
  },
  title: 'title',
};
