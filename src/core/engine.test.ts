import { describe, expect, it } from 'vitest';
import { availableItemAction, availableOptions, availableVerbs, handle, visibleHotspots } from './engine';
import type { GameState, World } from './types';

const say = (text: string) => ({ type: 'say', text }) as const;
const polly = (text: string) => ({ type: 'say', text, speaker: 'parrot' }) as const;

const world: World = {
  items: {
    bulb: { id: 'bulb', name: 'Light Bulb', look: 'A bulb. Bright idea.' },
    battery: { id: 'battery', name: 'Battery', look: 'Positively charged.' },
    torch: { id: 'torch', name: 'Torch', look: 'Let there be light.' },
    note: {
      id: 'note',
      name: 'Note',
      look: 'A note with a password on it.',
      action: {
        label: 'Memorise',
        when: [{ notFlag: 'smudged' }],
        responses: [{ effects: [say('Swordfish. Got it.'), { type: 'removeItem', itemId: 'note' }, { type: 'setFlag', flag: 'knowsPassword' }] }],
      },
    },
  },
  combinations: [
    {
      items: ['bulb', 'battery'],
      responses: [
        {
          effects: [
            say('A torch!'),
            { type: 'removeItem', itemId: 'bulb' },
            { type: 'removeItem', itemId: 'battery' },
            { type: 'addItem', itemId: 'torch' },
          ],
        },
      ],
    },
  ],
  characters: {
    dana: { id: 'dana', name: 'Dana', color: '#ffffff' },
    parrot: { id: 'parrot', name: 'Polly', color: '#00ff00' },
  },
  dialogues: {
    parrot: {
      id: 'parrot',
      start: 'hub',
      greeting: [
        { when: [{ has: 'bulb' }], effects: [polly('Shiny!')] },
        { effects: [polly('Squawk.')] },
      ],
      nodes: {
        hub: {
          options: [
            { id: 'name', text: "What's your name?", once: true, effects: [polly('Polly.')], next: 'hub' },
            {
              id: 'gift',
              text: 'Want a torch?',
              when: [{ has: 'torch' }],
              effects: [polly('Yes!'), { type: 'removeItem', itemId: 'torch' }, { type: 'setFlag', flag: 'gaveTorch' }],
              next: 'end',
            },
            { id: 'secret', text: 'Tell me a secret.', next: 'secret' },
            { id: 'bye', text: 'Bye.', effects: [polly('Bye.')], next: 'end' },
          ],
        },
        secret: { options: [{ id: 'back', text: 'Never mind.', next: 'hub' }] },
      },
    },
  },
  fallbacks: {
    useItemOn: ['No {item} on the {target}.', 'The {item} and the {target}? Never.'],
    combine: ['{a} and {b} do not mix.'],
  },
  rooms: {
    testRoom: {
      id: 'testRoom',
      name: 'Test Room',
      entries: { fromCellar: { x: 90, y: 90 } },
      walkable: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      hotspots: [
        {
          id: 'lamp',
          name: 'Lamp',
          bounds: { x: 10, y: 10, width: 20, height: 40 },
          interactionPoint: { x: 20, y: 60 },
          verbs: {
            look: {
              responses: [
                { when: [{ flag: 'tookBulb' }], effects: [say('A lamp with no bulb. A sad lamp.')] },
                { effects: [say('It is a lamp. It lamps.')] },
              ],
            },
            take: {
              label: 'Unscrew the bulb',
              when: [{ notFlag: 'tookBulb' }],
              responses: [{ effects: [say('Got it.'), { type: 'addItem', itemId: 'bulb' }, { type: 'setFlag', flag: 'tookBulb' }] }],
            },
            talk: { responses: [{ effects: [say('The lamp is not chatty.')] }] },
          },
          itemUses: {
            bulb: [{ effects: [say('Screwed back in.'), { type: 'removeItem', itemId: 'bulb' }] }],
          },
        },
        {
          id: 'rug',
          name: 'Rug',
          bounds: { x: 40, y: 70, width: 40, height: 20 },
          interactionPoint: { x: 60, y: 80 },
          verbs: { look: { responses: [{ effects: [say('It really ties the room together.')] }] } },
          itemFallback: 'The rug rejects your offering.',
        },
        {
          id: 'parrot',
          name: 'Parrot',
          character: 'parrot',
          bounds: { x: 70, y: 10, width: 20, height: 20 },
          interactionPoint: { x: 80, y: 40 },
          verbs: {
            look: { responses: [{ effects: [say('A parrot.')] }] },
            talk: { responses: [{ effects: [{ type: 'startDialogue', dialogueId: 'parrot' }] }] },
          },
        },
        {
          id: 'ghost',
          name: 'Ghost',
          when: [{ flag: 'summoned' }],
          bounds: { x: 40, y: 10, width: 20, height: 20 },
          interactionPoint: { x: 50, y: 40 },
          verbs: { look: { responses: [{ effects: [say('Boo.')] }] } },
        },
        {
          id: 'trapdoor',
          name: 'Trapdoor',
          bounds: { x: 80, y: 80, width: 10, height: 10 },
          interactionPoint: { x: 85, y: 85 },
          verbs: {
            look: { responses: [{ effects: [say('Down we go?')] }] },
            use: { label: 'Go through', responses: [{ effects: [say('Down I go.'), { type: 'goToRoom', roomId: 'cellar', entry: 'fromTestRoom' }] }] },
          },
        },
      ],
    },
  },
};

const cellar = {
  id: 'cellar',
  name: 'Cellar',
  entries: { fromTestRoom: { x: 10, y: 10 } },
  walkable: [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 50 },
    { x: 0, y: 50 },
  ],
  hotspots: [
    {
      id: 'ladder',
      name: 'Ladder',
      bounds: { x: 0, y: 0, width: 10, height: 10 },
      interactionPoint: { x: 5, y: 15 },
      verbs: {
        look: { responses: [{ effects: [say('Up we go?')] }] },
        use: { label: 'Go through', responses: [{ effects: [{ type: 'goToRoom' as const, roomId: 'testRoom', entry: 'fromCellar' }] }] },
      },
    },
  ],
};
(world.rooms as Record<string, unknown>)['cellar'] = cellar;

const start: GameState = {
  roomId: 'testRoom',
  player: { x: 50, y: 50 },
  inventory: [],
  flags: {},
  conversation: null,
  spentOptions: [],
};

describe('availableVerbs', () => {
  it('lists declared verbs in coin order, with joke labels or default names', () => {
    expect(availableVerbs(world, start, 'lamp')).toEqual([
      { verb: 'look', label: 'Look' },
      { verb: 'take', label: 'Unscrew the bulb' },
      { verb: 'talk', label: 'Talk' },
    ]);
  });

  it('leaves out verbs whose conditions do not hold', () => {
    const tookBulb = { ...start, flags: { tookBulb: true } };
    expect(availableVerbs(world, tookBulb, 'lamp').map((v) => v.verb)).toEqual(['look', 'talk']);
  });

  it('returns just look for a look-only hotspot', () => {
    expect(availableVerbs(world, start, 'rug')).toEqual([{ verb: 'look', label: 'Look' }]);
  });
});

describe('handle: verb', () => {
  it('look says the hotspot look line and leaves state alone', () => {
    const result = handle(world, start, { type: 'verb', verb: 'look', hotspotId: 'rug' });
    expect(result.effects).toEqual([say('It really ties the room together.')]);
    expect(result.state).toEqual(start);
  });

  it('take adds the item, sets the flag, and returns every effect for the view', () => {
    const result = handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(result.effects).toEqual([
      say('Got it.'),
      { type: 'addItem', itemId: 'bulb' },
      { type: 'setFlag', flag: 'tookBulb' },
    ]);
    expect(result.state.inventory).toEqual(['bulb']);
    expect(result.state.flags).toEqual({ tookBulb: true });
  });

  it('does not mutate the state it was given', () => {
    handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(start).toEqual({ roomId: 'testRoom', player: { x: 50, y: 50 }, inventory: [], flags: {}, conversation: null, spentOptions: [] });
  });

  it('after taking, take is gone and look uses the conditional response', () => {
    const { state } = handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(availableVerbs(world, state, 'lamp').map((v) => v.verb)).not.toContain('take');
    const look = handle(world, state, { type: 'verb', verb: 'look', hotspotId: 'lamp' });
    expect(look.effects).toEqual([say('A lamp with no bulb. A sad lamp.')]);
  });

  it('throws for a verb that is not currently available', () => {
    const { state } = handle(world, start, { type: 'verb', verb: 'take', hotspotId: 'lamp' });
    expect(() => handle(world, state, { type: 'verb', verb: 'take', hotspotId: 'lamp' })).toThrow(/take.*lamp/);
    expect(() => handle(world, start, { type: 'verb', verb: 'use', hotspotId: 'rug' })).toThrow(/use.*rug/);
  });

  it('throws for a hotspot that is not in the current room', () => {
    expect(() => handle(world, start, { type: 'verb', verb: 'look', hotspotId: 'nope' })).toThrow(/nope/);
  });
});

describe('handle: items', () => {
  const holding = (...inventory: string[]): GameState => ({ ...start, inventory });

  it('lookItem says the item look line without changing state', () => {
    const state = holding('bulb');
    const result = handle(world, state, { type: 'lookItem', itemId: 'bulb' });
    expect(result.effects).toEqual([say('A bulb. Bright idea.')]);
    expect(result.state).toEqual(state);
  });

  it('useItemOn runs the matching item use', () => {
    const result = handle(world, holding('bulb'), { type: 'useItemOn', itemId: 'bulb', hotspotId: 'lamp' });
    expect(result.effects).toEqual([say('Screwed back in.'), { type: 'removeItem', itemId: 'bulb' }]);
    expect(result.state.inventory).toEqual([]);
  });

  it("useItemOn falls back to the hotspot's own line", () => {
    const result = handle(world, holding('bulb'), { type: 'useItemOn', itemId: 'bulb', hotspotId: 'rug' });
    expect(result.effects).toEqual([say('The rug rejects your offering.')]);
  });

  it('useItemOn falls back to a generic line with names filled in, the same one every time', () => {
    const command = { type: 'useItemOn', itemId: 'battery', hotspotId: 'lamp' } as const;
    const first = handle(world, holding('battery'), command).effects;
    expect(['No Battery on the Lamp.', 'The Battery and the Lamp? Never.']).toContain((first[0] as { text: string }).text);
    expect(handle(world, holding('battery'), command).effects).toEqual(first);
  });

  it('combine works in either order, removing the parts and adding the result', () => {
    for (const itemIds of [['bulb', 'battery'], ['battery', 'bulb']] as const) {
      const result = handle(world, holding('bulb', 'battery'), { type: 'combine', itemIds });
      expect(result.state.inventory).toEqual(['torch']);
      expect(result.effects[0]).toEqual(say('A torch!'));
    }
  });

  it('combine falls back to a generic line for an unlisted pair', () => {
    const result = handle(world, holding('torch', 'bulb'), { type: 'combine', itemIds: ['torch', 'bulb'] });
    expect(result.effects).toEqual([say('Torch and Light Bulb do not mix.')]);
    expect(result.state.inventory).toEqual(['torch', 'bulb']);
  });

  it('throws when using, looking at, or combining an item that is not held', () => {
    expect(() => handle(world, start, { type: 'lookItem', itemId: 'bulb' })).toThrow(/bulb/);
    expect(() => handle(world, start, { type: 'useItemOn', itemId: 'bulb', hotspotId: 'lamp' })).toThrow(/bulb/);
    expect(() => handle(world, holding('bulb'), { type: 'combine', itemIds: ['bulb', 'battery'] })).toThrow(/battery/);
  });

  it('throws when combining an item with itself', () => {
    expect(() => handle(world, holding('bulb'), { type: 'combine', itemIds: ['bulb', 'bulb'] })).toThrow(/itself/);
  });
});

describe('hotspot visibility', () => {
  it('leaves out hotspots whose conditions do not hold', () => {
    expect(visibleHotspots(world, start).map((h) => h.id)).toEqual(['lamp', 'rug', 'parrot', 'trapdoor']);
    const summoned = { ...start, flags: { summoned: true } };
    expect(visibleHotspots(world, summoned).map((h) => h.id)).toContain('ghost');
  });

  it('refuses verbs and items on a hidden hotspot', () => {
    expect(() => availableVerbs(world, start, 'ghost')).toThrow(/ghost/);
    expect(() => handle(world, start, { type: 'verb', verb: 'look', hotspotId: 'ghost' })).toThrow(/ghost/);
    const holding = { ...start, inventory: ['bulb'] };
    expect(() => handle(world, holding, { type: 'useItemOn', itemId: 'bulb', hotspotId: 'ghost' })).toThrow(/ghost/);
  });
});

describe('conversations', () => {
  const talk = (state: GameState) => handle(world, state, { type: 'verb', verb: 'talk', hotspotId: 'parrot' });
  const choose = (state: GameState, optionId: string) => handle(world, state, { type: 'chooseOption', optionId });
  const optionIds = (state: GameState) => availableOptions(world, state).map((o) => o.id);

  it('talking starts the conversation at the start node and plays the greeting', () => {
    const { state, effects } = talk(start);
    expect(state.conversation).toEqual({ dialogueId: 'parrot', nodeId: 'hub' });
    expect(effects).toEqual([{ type: 'startDialogue', dialogueId: 'parrot' }, polly('Squawk.')]);
  });

  it('the greeting uses the first response whose conditions hold', () => {
    const { effects } = talk({ ...start, inventory: ['bulb'] });
    expect(effects.at(-1)).toEqual(polly('Shiny!'));
  });

  it('offers only options whose conditions hold', () => {
    const { state } = talk(start);
    expect(optionIds(state)).toEqual(['name', 'secret', 'bye']);
    const { state: withTorch } = talk({ ...start, inventory: ['torch'] });
    expect(optionIds(withTorch)).toEqual(['name', 'gift', 'secret', 'bye']);
  });

  it('choosing an option: Dana says it, then its effects play, then it moves to the next node', () => {
    const { state } = talk(start);
    const result = choose(state, 'secret');
    expect(result.effects).toEqual([say('Tell me a secret.')]);
    expect(result.state.conversation).toEqual({ dialogueId: 'parrot', nodeId: 'secret' });
    expect(optionIds(result.state)).toEqual(['back']);
    expect(choose(result.state, 'back').state.conversation?.nodeId).toBe('hub');
  });

  it('a one-shot option disappears once picked', () => {
    const { state } = talk(start);
    const after = choose(state, 'name');
    expect(after.effects).toEqual([say("What's your name?"), polly('Polly.')]);
    expect(optionIds(after.state)).toEqual(['secret', 'bye']);
    expect(optionIds(talk(choose(after.state, 'bye').state).state)).not.toContain('name');
  });

  it('option effects change state, and "end" ends the conversation', () => {
    const { state } = talk({ ...start, inventory: ['torch'] });
    const result = choose(state, 'gift');
    expect(result.state.inventory).toEqual([]);
    expect(result.state.flags).toEqual({ gaveTorch: true });
    expect(result.state.conversation).toBeNull();
    expect(result.effects.at(-1)).toEqual({ type: 'endDialogue' });
  });

  it('throws for an option that is not available, or when not in a conversation', () => {
    const { state } = talk(start);
    expect(() => choose(state, 'gift')).toThrow(/gift/);
    expect(() => choose(start, 'bye')).toThrow(/conversation/);
    expect(() => availableOptions(world, start)).toThrow(/conversation/);
  });

  it('refuses room commands while a conversation is in progress', () => {
    const { state } = talk(start);
    expect(() => handle(world, state, { type: 'verb', verb: 'look', hotspotId: 'rug' })).toThrow(/conversation/);
  });
});

describe('win', () => {
  it('a win effect sets the won flag and is passed to the view', () => {
    const winning: World = {
      ...world,
      rooms: {
        testRoom: {
          ...world.rooms.testRoom!,
          hotspots: [
            {
              id: 'exit',
              name: 'Exit',
              bounds: { x: 0, y: 0, width: 10, height: 10 },
              interactionPoint: { x: 5, y: 50 },
              verbs: { look: { responses: [{ effects: [say('Freedom.'), { type: 'win' }] }] } },
            },
          ],
        },
      },
    };
    const result = handle(winning, start, { type: 'verb', verb: 'look', hotspotId: 'exit' });
    expect(result.state.flags).toEqual({ won: true });
    expect(result.effects.at(-1)).toEqual({ type: 'win' });
  });
});

describe('item actions', () => {
  const holdingNote = { ...start, inventory: ['note'] };

  it("offers an item's action with its label while its conditions hold", () => {
    expect(availableItemAction(world, holdingNote, 'note')).toEqual({ label: 'Memorise' });
    expect(availableItemAction(world, { ...holdingNote, flags: { smudged: true } }, 'note')).toBeNull();
    expect(availableItemAction(world, { ...start, inventory: ['bulb'] }, 'bulb')).toBeNull();
  });

  it('runs the action: says, removes the item, sets a flag', () => {
    const result = handle(world, holdingNote, { type: 'itemAction', itemId: 'note' });
    expect(result.effects[0]).toEqual(say('Swordfish. Got it.'));
    expect(result.state.inventory).toEqual([]);
    expect(result.state.flags).toEqual({ knowsPassword: true });
  });

  it('throws for an item with no available action, or one not held', () => {
    expect(() => handle(world, { ...start, inventory: ['bulb'] }, { type: 'itemAction', itemId: 'bulb' })).toThrow(/bulb/);
    expect(() => handle(world, start, { type: 'itemAction', itemId: 'note' })).toThrow(/note/);
  });
});

describe('rooms', () => {
  const goDown = (state: GameState) => handle(world, state, { type: 'verb', verb: 'use', hotspotId: 'trapdoor' });

  it('goToRoom moves to the room and puts Dana at the entry point', () => {
    const { state, effects } = goDown(start);
    expect(state.roomId).toBe('cellar');
    expect(state.player).toEqual({ x: 10, y: 10 });
    expect(effects.at(-1)).toEqual({ type: 'goToRoom', roomId: 'cellar', entry: 'fromTestRoom' });
  });

  it("only the current room's hotspots can be used", () => {
    const { state } = goDown(start);
    expect(() => handle(world, state, { type: 'verb', verb: 'look', hotspotId: 'lamp' })).toThrow(/lamp/);
    expect(availableVerbs(world, state, 'ladder').map((v) => v.verb)).toEqual(['look', 'use']);
  });

  it('inventory and flags survive the trip there and back', () => {
    const carrying = { ...start, inventory: ['bulb'], flags: { tookBulb: true } };
    const { state: down } = goDown(carrying);
    const { state: back } = handle(world, down, { type: 'verb', verb: 'use', hotspotId: 'ladder' });
    expect(back.roomId).toBe('testRoom');
    expect(back.player).toEqual({ x: 90, y: 90 });
    expect(back.inventory).toEqual(['bulb']);
    expect(back.flags).toEqual({ tookBulb: true });
  });

  it('throws for an unknown room or entry', () => {
    const broken: World = {
      ...world,
      combinations: [{ items: ['bulb', 'torch'], responses: [{ effects: [{ type: 'goToRoom', roomId: 'cellar', entry: 'nowhere' }] }] }],
    };
    const holding = { ...start, inventory: ['bulb', 'torch'] };
    expect(() => handle(broken, holding, { type: 'combine', itemIds: ['bulb', 'torch'] })).toThrow(/nowhere/);
  });
});
