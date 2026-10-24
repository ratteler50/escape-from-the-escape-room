import { describe, expect, it } from 'vitest';
import type { Condition, GameState, World } from '../core/types';
import { breakRoom } from './breakRoom';
import { handle } from '../core/engine';
import { describeCommand, explore, firstWin, shortestSolution } from './explore';
import { initialState, world } from './world';

// The Break Room's three puzzles, explored from the inside: from the moment Dana first walks in, on
// the shortest solution (slice 33; it used to start from the game's opening inventory and flags, a
// state the wired-up game can't reach, and a bigger Lair pushed that past the explorer's cap).
//
// explore() judges dead ends by the `won` flag, so each goal gets a copy of the world with one
// extra, invisible-until-reached hotspot whose look wins. "Can win" then means "can reach the goal".
const start: GameState = (() => {
  let state = initialState;
  for (const command of shortestSolution(world, initialState)) {
    state = handle(world, state, command).state;
    if (state.roomId === breakRoom.id) return state;
  }
  throw new Error('The shortest solution never reaches the Break Room');
})();

function withGoal(goal: Condition[]): World {
  const room = {
    ...breakRoom,
    hotspots: [
      ...breakRoom.hotspots,
      {
        id: 'testGoal',
        name: 'Goal',
        when: goal,
        bounds: { x: 0, y: 0, width: 1, height: 1 },
        interactionPoint: breakRoom.entries.fromGiftShop!,
        verbs: { look: { responses: [{ effects: [{ type: 'win' as const }] }] } },
      },
    ],
  };
  return { ...world, rooms: { ...world.rooms, [room.id]: room } };
}

const numbered = (steps: string[]) => steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n');

const goals: Record<string, Condition[]> = {
  'off duty': [{ flag: 'danaOffDuty' }],
  'holding Exact Change': [{ has: 'exactChange' }],
  'off duty and holding Exact Change': [{ flag: 'danaOffDuty' }, { has: 'exactChange' }],
};

describe('the Break Room', () => {
  for (const [name, goal] of Object.entries(goals)) {
    describe(`reaching "${name}"`, () => {
      const w = withGoal(goal);
      const result = explore(w, start);

      it('never throws on a command the UI could offer', () => {
        const first = result.errors[0];
        expect(
          result.errors.length,
          first &&
            `"${describeCommand(w, result.explored.get(first.key)!.state, first.command)}" threw: ${first.message}\n` +
              `Reached by:\n${numbered(result.pathTo(first.key))}`,
        ).toBe(0);
      });

      it('is possible', () => {
        expect(firstWin(result), `Nothing reachable in the Break Room is ${name}`).toBeDefined();
      });

      it('has no dead ends on the way', () => {
        const dead = [...result.explored.keys()].filter((k) => !result.canWin.has(k));
        expect(
          dead.length,
          dead[0] && `${dead.length} state(s) can no longer reach "${name}". The shortest way into one:\n${numbered(result.pathTo(dead[0]))}`,
        ).toBe(0);
      });
    });
  }

  it('swaps the Staff Lanyard for the Off-Duty Lanyard when Dana clocks out, and never shows both', () => {
    const result = explore(withGoal(goals['off duty and holding Exact Change']!), start);
    const wrong = [...result.explored.entries()].find(([, { state }]) => {
      const has = (id: string) => state.inventory.includes(id);
      return state.flags.danaOffDuty ? has('lanyard') || !has('offDutyLanyard') : has('offDutyLanyard') || !has('lanyard');
    });
    expect(wrong && `Wrong lanyard after:\n${numbered(result.pathTo(wrong[0]))}`).toBeUndefined();
  });

  it('prints the shortest way to both', () => {
    const result = explore(withGoal(goals['off duty and holding Exact Change']!), start);
    const steps = result.pathTo(firstWin(result)!);
    console.log(`Break Room, shortest way to off duty with exact change (${steps.length} steps):\n${numbered(steps)}`);
    expect(steps.at(-1)).toBe('look Goal');
  });
});
