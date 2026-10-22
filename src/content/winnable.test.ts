import { describe, expect, it } from 'vitest';
import { describeCommand, explore, firstWin, STATE_CAP } from './explore';
import { initialState, world } from './world';

// Enforces the design rule "no deaths, no dead ends" (docs/design.md): explores every game state the
// player can reach (explore.ts), then checks the win is still reachable from each one.

describe('always winnable', () => {
  const result = explore(world, initialState);
  const numbered = (steps: string[]) => steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n');

  it('stays under the state cap', () => {
    expect(
      result.capped,
      `More than ${STATE_CAP} reachable states: some content is multiplying states (e.g. a repeatable ` +
        `option that adds an item every time). Fix that, or raise STATE_CAP if the game really is that big`,
    ).toBe(false);
  });

  it('never throws on a command the UI could offer', () => {
    const first = result.errors[0];
    expect(
      result.errors.length,
      first &&
        `"${describeCommand(world, result.explored.get(first.key)!.state, first.command)}" threw: ${first.message}\n` +
          `Reached by:\n${numbered(result.pathTo(first.key))}`,
    ).toBe(0);
  });

  it('can be won', () => {
    expect(result.canWin.size, 'No reachable state has the "won" flag: nothing in the content triggers a win effect').toBeGreaterThan(0);
  });

  it('has no dead ends: the win is reachable from every reachable state', () => {
    const dead = [...result.explored.keys()].filter((k) => !result.canWin.has(k));
    expect(
      dead.length,
      dead[0] &&
        `${dead.length} reachable state(s) can no longer win. The shortest way into one:\n${numbered(result.pathTo(dead[0]))}\n` +
          `Its inventory and flags: ${dead[0]}`,
    ).toBe(0);
  });

  it('lets the player reach every room', () => {
    const visited = new Set([...result.explored.values()].map((e) => e.state.roomId));
    const missing = Object.keys(world.rooms).filter((id) => !visited.has(id));
    expect(missing, `These rooms can never be reached: ${missing.join(', ')}. Add an exit that leads there`).toEqual([]);
  });

  it('lets the player obtain every item', () => {
    const obtained = new Set([...result.explored.values()].flatMap((e) => e.state.inventory));
    const missing = Object.keys(world.items).filter((id) => !obtained.has(id));
    expect(missing, `These items can never be obtained: ${missing.join(', ')}. Add a way to get them, or remove them`).toEqual([]);
  });

  it('prints the shortest solution as a walkthrough', () => {
    // Breadth-first search reaches states in order of distance, so the first winning state found is
    // the closest; pathTo follows the parents that discovered it.
    const steps = result.pathTo(firstWin(result)!);
    console.log(`Shortest solution (${steps.length} steps, ${result.explored.size} states explored):\n${numbered(steps)}`);
    expect(steps.length).toBeGreaterThan(0);
  });
});
