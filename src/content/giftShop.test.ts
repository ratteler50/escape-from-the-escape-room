import { describe, expect, it } from 'vitest';
import { availableOptions, handle, visibleHotspots } from '../core/engine';
import type { Command, GameState } from '../core/types';
import { world } from './world';

// The Gift Shop's puzzle chain (docs/slices/14-gift-shop.md, 30-section-14-puzzle.md): after
// Mordecai's teapot complaint, the Employee Handbook used on Kyle (the revised Section 14) borrows
// the Price Gun; the Price Gun on the Bargain Bin sends Mordecai through STAFF ONLY.

const arrived: GameState = {
  roomId: 'giftShop',
  player: { x: 200, y: 470 },
  inventory: ['handbook'],
  flags: {},
  conversation: null,
  spentOptions: [],
};

const run = (state: GameState, ...commands: Command[]): GameState => commands.reduce((s, c) => handle(world, s, c).state, state);
const talk = (hotspotId: string): Command => ({ type: 'verb', verb: 'talk', hotspotId });
const handbookOn = (hotspotId: string): Command => ({ type: 'useItemOn', itemId: 'handbook', hotspotId });
const said = (state: GameState, command: Command) =>
  handle(world, state, command).effects.flatMap((e) => (e.type === 'say' ? [e.text] : [])).join(' ');
const complained = (state: GameState) => run(state, talk('mordecai'), choose('teapot'), choose('bye'));
const choose = (optionId: string): Command => ({ type: 'chooseOption', optionId });
const optionIds = (state: GameState) => availableOptions(world, state).map((o) => o.id);
const hotspotIds = (state: GameState) => visibleHotspots(world, state).map((h) => h.id);

describe('the Gift Shop chain', () => {
  it('no longer offers Section 14 in Kyle\'s dialogue', () => {
    expect(optionIds(run(complained(arrived), talk('kyle')))).not.toContain('priceGun');
  });

  it("brushes off the Handbook before Mordecai's complaint, with no Price Gun", () => {
    const after = run(arrived, handbookOn('kyle'));
    expect(after.inventory).not.toContain('priceGun');
    expect(said(arrived, handbookOn('kyle'))).not.toContain('REVISED');
  });

  it('lends the Price Gun once Mordecai has complained: Dana finds the revised Section 14', () => {
    const heard = complained(arrived);
    expect(said(heard, handbookOn('kyle'))).toContain('REVISED');
    const armed = run(heard, handbookOn('kyle'));
    expect(armed.inventory).toContain('priceGun');
    expect(said(armed, handbookOn('kyle')), 'no second gun').toContain("You've already got it");
    expect(run(armed, handbookOn('kyle')).inventory.filter((id) => id === 'priceGun')).toHaveLength(1);
  });

  it("doesn't lend it again once it's been handed back", () => {
    const armed = run(complained(arrived), handbookOn('kyle'));
    const done = run(armed, { type: 'useItemOn', itemId: 'priceGun', hotspotId: 'bargainBin' });
    expect(done.inventory).not.toContain('priceGun');
    expect(run(done, handbookOn('kyle')).inventory).not.toContain('priceGun');
  });

  it('hints at the Handbook once Mordecai has complained: the till and the bargain bin', () => {
    const heard = complained(arrived);
    const ringUp: Command = { type: 'verb', verb: 'use', hotspotId: 'till' };
    expect(said(arrived, ringUp)).not.toContain('Handbook');
    expect(said(heard, ringUp)).toContain('Handbook');
    expect(said(heard, handbookOn('bargainBin'))).toContain('borrowing equipment');
  });

  it('opens STAFF ONLY when the Price Gun re-prices the teapot, and Mordecai floats off through it', () => {
    const armed = run(complained(arrived), handbookOn('kyle'));
    expect(hotspotIds(armed)).toEqual(expect.arrayContaining(['staffDoor', 'mordecai']));

    const result = handle(world, armed, { type: 'useItemOn', itemId: 'priceGun', hotspotId: 'bargainBin' });
    expect(result.effects).toContainEqual(expect.objectContaining({ type: 'walk', character: 'mordecai' }));
    expect(result.state.flags.staffDoorOpen).toBe(true);
    expect(hotspotIds(result.state)).toContain('staffDoorOpen');
    expect(hotspotIds(result.state)).not.toContain('staffDoor');
    expect(hotspotIds(result.state)).not.toContain('mordecai');
    expect(result.state.inventory, 'the Price Gun goes back to Kyle once its job is done (slice 17)').not.toContain('priceGun');
  });

  it('floats Mordecai, and nobody else', () => {
    const floating = Object.values(world.characters).filter((c) => c.floats).map((c) => c.id);
    expect(floating).toEqual(['mordecai']);
  });
});
