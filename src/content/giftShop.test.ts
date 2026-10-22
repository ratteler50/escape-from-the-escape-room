import { describe, expect, it } from 'vitest';
import { availableOptions, handle, visibleHotspots } from '../core/engine';
import type { Command, GameState } from '../core/types';
import { world } from './world';

// The Gift Shop's puzzle chain (docs/slices/14-gift-shop.md): Mordecai's teapot complaint unlocks
// Kyle's price-gun option; the Price Gun on the Bargain Bin sends Mordecai through STAFF ONLY.

const arrived: GameState = {
  roomId: 'giftShop',
  player: { x: 200, y: 470 },
  inventory: [],
  flags: {},
  conversation: null,
  spentOptions: [],
};

const run = (state: GameState, ...commands: Command[]): GameState => commands.reduce((s, c) => handle(world, s, c).state, state);
const talk = (hotspotId: string): Command => ({ type: 'verb', verb: 'talk', hotspotId });
const choose = (optionId: string): Command => ({ type: 'chooseOption', optionId });
const optionIds = (state: GameState) => availableOptions(world, state).map((o) => o.id);
const hotspotIds = (state: GameState) => visibleHotspots(world, state).map((h) => h.id);

describe('the Gift Shop chain', () => {
  it("doesn't offer Kyle's price gun before Mordecai has complained about the teapot", () => {
    expect(optionIds(run(arrived, talk('kyle')))).not.toContain('priceGun');
  });

  it("offers Kyle's price gun once Mordecai has complained, and it hands over the Price Gun", () => {
    const heard = run(arrived, talk('mordecai'), choose('teapot'), choose('bye'));
    const atKyle = run(heard, talk('kyle'));
    expect(optionIds(atKyle)).toContain('priceGun');

    const armed = run(atKyle, choose('priceGun'));
    expect(armed.inventory).toContain('priceGun');
    expect(optionIds(armed)).not.toContain('priceGun');
  });

  it('opens STAFF ONLY when the Price Gun re-prices the teapot, and Mordecai floats off through it', () => {
    const armed = run(arrived, talk('mordecai'), choose('teapot'), choose('bye'), talk('kyle'), choose('priceGun'), choose('bye'));
    expect(hotspotIds(armed)).toEqual(expect.arrayContaining(['staffDoor', 'mordecai']));

    const result = handle(world, armed, { type: 'useItemOn', itemId: 'priceGun', hotspotId: 'bargainBin' });
    expect(result.effects).toContainEqual(expect.objectContaining({ type: 'walk', character: 'mordecai' }));
    expect(result.state.flags.staffDoorOpen).toBe(true);
    expect(hotspotIds(result.state)).toContain('staffDoorOpen');
    expect(hotspotIds(result.state)).not.toContain('staffDoor');
    expect(hotspotIds(result.state)).not.toContain('mordecai');
    expect(result.state.inventory, 'the Price Gun stays for jokes').toContain('priceGun');
  });

  it('has no way through the open STAFF ONLY door yet (slice 16 joins the rooms)', () => {
    const open: GameState = { ...arrived, flags: { staffDoorOpen: true } };
    const door = visibleHotspots(world, open).find((h) => h.id === 'staffDoorOpen')!;
    expect(door.verbs.use).toBeUndefined();
  });

  it('floats Mordecai, and nobody else', () => {
    const floating = Object.values(world.characters).filter((c) => c.floats).map((c) => c.id);
    expect(floating).toEqual(['mordecai']);
  });
});
