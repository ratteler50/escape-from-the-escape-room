import { describe, expect, it } from 'vitest';
import { availableOptions, handle, visibleHotspots } from '../core/engine';
import { WON, type Command, type Effect, type GameState, type Response } from '../core/types';
import { world } from './world';

// Slice 16 (docs/slices/16-finale.md): the rooms are joined, Kyle sells the mug only to an off-duty
// Dana with exact change, the front door is a false exit, and the sale plays the finale and wins.

const inGiftShop: GameState = {
  roomId: 'giftShop',
  player: { x: 435, y: 460 },
  inventory: ['lanyard'],
  flags: {},
  conversation: null,
  spentOptions: [],
};

const run = (state: GameState, ...commands: Command[]): GameState => commands.reduce((s, c) => handle(world, s, c).state, state);
const talk = (hotspotId: string): Command => ({ type: 'verb', verb: 'talk', hotspotId });
const use = (hotspotId: string): Command => ({ type: 'verb', verb: 'use', hotspotId });
const choose = (optionId: string): Command => ({ type: 'chooseOption', optionId });
const optionIds = (state: GameState) => availableOptions(world, state).map((o) => o.id);
const hotspotIds = (state: GameState) => visibleHotspots(world, state).map((h) => h.id);

const offDuty: GameState = { ...inGiftShop, flags: { offDuty: true } };

describe("Kyle's mug sale", () => {
  it('refuses staff: on duty, Dana only gets "Lanyard."', () => {
    const atKyle = run(inGiftShop, talk('kyle'));
    expect(optionIds(atKyle)).toContain('buyMug');
    expect(optionIds(atKyle)).not.toContain('sale');
    const refused = run(atKyle, choose('buyMug'));
    expect(refused.inventory).not.toContain('mug');
    expect(optionIds(refused)).toContain('mugAgain');
  });

  it('refuses an off-duty Dana without exact change, even with the pay packet', () => {
    const atKyle = run({ ...offDuty, inventory: ['lanyard', 'payPacket'] }, talk('kyle'));
    expect(optionIds(atKyle)).toEqual(expect.arrayContaining(['mugNoCash']));
    expect(optionIds(atKyle)).not.toContain('sale');
    expect(optionIds(atKyle), 'the staff refusal no longer applies').not.toContain('mugAgain');
    const refused = run(atKyle, choose('mugNoCash'));
    expect(refused.inventory).toEqual(['lanyard', 'payPacket']);
  });

  it('sells an off-duty Dana with exact change the mug, plays the finale, and wins', () => {
    const atKyle = run({ ...offDuty, inventory: ['lanyard', 'exactChange'] }, talk('kyle'));
    expect(optionIds(atKyle)).toContain('sale');
    expect(optionIds(atKyle)).not.toContain('mugNoCash');

    const result = handle(world, atKyle, choose('sale'));
    expect(result.state.inventory).toContain('mug');
    expect(result.state.inventory).not.toContain('exactChange');
    expect(result.state.flags[WON]).toBe(true);
    expect(result.state.conversation).toBeNull();
    expect(result.effects, 'Reginald walks in for the finale').toContainEqual(expect.objectContaining({ type: 'walk', character: 'reginald' }));
    // The engine closes the conversation after the option's own effects; the win is the last of those.
    expect(result.effects.filter((e) => e.type !== 'endDialogue').at(-1)).toEqual({ type: 'win' });
  });
});

describe('the false exit', () => {
  it('never wins through the front door', () => {
    const door = world.rooms.giftShop!.hotspots.find((h) => h.id === 'frontDoor')!;
    const responses: Response[] = [
      ...Object.values(door.verbs).flatMap((v) => v?.responses ?? []),
      ...Object.values(door.itemUses ?? {}).flatMap((r) => r ?? []),
    ];
    const effects: Effect[] = responses.flatMap((r) => r.effects);
    expect(effects.some((e) => e.type === 'win')).toBe(false);
  });
});

describe('the joined rooms', () => {
  it('goes through the open STAFF ONLY door into the Break Room, and back', () => {
    const open: GameState = { ...inGiftShop, player: { x: 954, y: 470 }, flags: { staffDoorOpen: true } };
    const inBreakRoom = run(open, use('staffDoorOpen'));
    expect(inBreakRoom.roomId).toBe('breakRoom');

    const back = run(inBreakRoom, use('giftShopDoor'));
    expect(back.roomId).toBe('giftShop');
    expect(back.player).toEqual(world.rooms.giftShop!.entries.fromBreakRoom);
  });

  it('brings Mordecai back to the bargain bin once Dana has been through STAFF ONLY', () => {
    const open: GameState = { ...inGiftShop, flags: { staffDoorOpen: true } };
    expect(hotspotIds(open)).not.toContain('mordecaiBack');
    const back = run(open, use('staffDoorOpen'), use('giftShopDoor'));
    expect(hotspotIds(back)).toContain('mordecaiBack');
  });
});
