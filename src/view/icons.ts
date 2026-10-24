import type { Verb } from '../core/types';

// The icons on the verb coins. No Phaser here: the end-to-end tests import this to find what to click.

// ✋ take: put it in your pocket, or try to. 👆 use: operate it (open, press, sit, go through), and on
// an item's coin its own action (read, memorise). Slice 33 replaced ⚙, which read as "settings".
export const VERB_ICONS: Record<Verb, string> = { look: '👁', take: '✋', talk: '💬', use: '👆' };

/** An item's coin: pick the item up to use it on something, or with another item. */
export const USE_WITH_ICON = '🔗';
