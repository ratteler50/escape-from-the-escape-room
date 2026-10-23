import type { Verb } from '../core/types';

// The icons on the verb coins. No Phaser here: the end-to-end tests import this to find what to click.

export const VERB_ICONS: Record<Verb, string> = { look: '👁', take: '✋', talk: '💬', use: '⚙' };

/** An item's coin: pick the item up to use it on something. */
export const USE_WITH_ICON = '✋';
