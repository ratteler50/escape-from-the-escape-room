import type { Page } from '@playwright/test';
import { availableItemAction, availableOptions, availableVerbs, handle } from '../src/core/engine';
import type { Command, GameState, World } from '../src/core/types';
import { describeCommand, stateKey } from '../src/content/explore';
import { USE_WITH_ICON, VERB_ICONS } from '../src/view/icons';
import { click, settle } from './game';

// Turns core commands into the clicks a player would make for them, and checks the game ends up
// where the core says it should.


/** Clicks through one command from state `before`. */
async function perform(page: Page, w: World, before: GameState, command: Command): Promise<void> {
  const item = (id: string) => ({ kind: 'item', id }) as const;
  switch (command.type) {
    case 'verb': {
      await click(page, { kind: 'hotspot', id: command.hotspotId });
      // One verb goes straight through; more open the coin.
      if (availableVerbs(w, before, command.hotspotId).length > 1) await click(page, { kind: 'coin', icon: VERB_ICONS[command.verb] });
      return;
    }
    case 'useItemOn':
      await click(page, item(command.itemId));
      await click(page, { kind: 'coin', icon: USE_WITH_ICON });
      await click(page, { kind: 'hotspot', id: command.hotspotId });
      return;
    case 'combine':
      await click(page, item(command.itemIds[0]));
      await click(page, { kind: 'coin', icon: USE_WITH_ICON });
      await click(page, item(command.itemIds[1]));
      return;
    case 'itemAction':
      if (!availableItemAction(w, before, command.itemId)) throw new Error(`${command.itemId} has no action here`);
      await click(page, item(command.itemId));
      await click(page, { kind: 'coin', icon: VERB_ICONS.use });
      return;
    case 'lookItem':
      await click(page, item(command.itemId));
      await click(page, { kind: 'coin', icon: VERB_ICONS.look });
      return;
    case 'chooseOption': {
      const option = availableOptions(w, before).find((o) => o.id === command.optionId);
      if (!option) throw new Error(`Option ${command.optionId} isn't available`);
      await click(page, { kind: 'option', text: option.text });
      return;
    }
  }
}

/**
 * Plays `commands` from `start` with real clicks. After each one, waits until the game is at rest in
 * the state the core predicts (room, inventory, flags, conversation; position aside), so a failure
 * names the step.
 */
export async function playThrough(page: Page, w: World, start: GameState, commands: readonly Command[]): Promise<GameState> {
  let state = start;
  for (const [i, command] of commands.entries()) {
    const step = `step ${i + 1} (${describeCommand(w, state, command)})`;
    const { state: expected, effects } = handle(w, state, command);
    await perform(page, w, state, command);
    // A step can be a whole cutscene (the finale plays ~35 effects), so its budget grows with the
    // effects it plays. An ordinary step still fails in about 30s if the game is stuck.
    await settle(page, `${step} to finish`, (s) => !!s.state && stateKey(s.state) === stateKey(expected), 30_000 + effects.length * 3_000);
    state = expected;
  }
  return state;
}
