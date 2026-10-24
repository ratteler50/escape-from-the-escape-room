import { describe, expect, it } from 'vitest';
import { availableVerbs, handle, isExit } from '../core/engine';
import { pointInPolygon, type Point, type Polygon } from '../core/geometry';
import { FAIL_SOUND, PLAYER, WON, type Effect, type GameState, type Pose, type Response } from '../core/types';
import { initialState, world } from './world';

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;

// Failure messages here are written to be fixable from the message alone: name the bad value and
// say what a good one looks like. Agents (and tired humans) often read nothing else.

const fmt = (p: Point) => `(${p.x}, ${p.y})`;
const knownItems = () => Object.keys(world.items).join(', ') || 'none';

function describeArea(polygon: Polygon): string {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  return (
    `it spans x ${Math.min(...xs)}–${Math.max(...xs)}, y ${Math.min(...ys)}–${Math.max(...ys)} ` +
    `(edges may slant, so check the corners: ${polygon.map(fmt).join(' ')})`
  );
}

function expectKnownItem(itemId: string, where: string): void {
  expect(
    world.items[itemId],
    `${where} refers to item "${itemId}", which isn't in world.items (known: ${knownItems()}). ` +
      `Define it and add it to the room's item list`,
  ).toBeDefined();
}

function expectValidEffects(effects: readonly Effect[], where: string): void {
  for (const effect of effects) {
    if (effect.type === 'say') {
      expect(effect.text.trim(), `${where} says an empty line`).not.toBe('');
      const speaker = effect.speaker ?? PLAYER;
      expect(
        world.characters[speaker],
        `${where} has a line spoken by "${speaker}", who isn't in world.characters (known: ${Object.keys(world.characters).join(', ')})`,
      ).toBeDefined();
    }
    if (effect.type === 'sayOneOf') {
      expect(effect.texts.length, `${where} has a sayOneOf with fewer than two lines; use say for one`).toBeGreaterThanOrEqual(2);
      expect(effect.texts.filter((t) => t.trim() === ''), `${where} has a sayOneOf with an empty line`).toEqual([]);
      const speaker = effect.speaker ?? PLAYER;
      expect(world.characters[speaker], `${where} has lines spoken by "${speaker}", who isn't in world.characters`).toBeDefined();
    }
    if (effect.type === 'addItem' || effect.type === 'removeItem') {
      expectKnownItem(effect.itemId, `${where} (${effect.type})`);
    }
    if (effect.type === 'walk' || effect.type === 'face') {
      expect(
        world.characters[effect.character],
        `${where} has "${effect.character}" ${effect.type}, but they aren't in world.characters (known: ${Object.keys(world.characters).join(', ')})`,
      ).toBeDefined();
    }
    if (effect.type === 'walk') {
      const { x, y } = effect.to;
      expect(
        x >= 0 && x <= LOGICAL_WIDTH && y >= 0 && y <= LOGICAL_HEIGHT,
        `${where} walks "${effect.character}" to ${fmt(effect.to)}, which is off the ${LOGICAL_WIDTH}×${LOGICAL_HEIGHT} screen`,
      ).toBe(true);
    }
    if (effect.type === 'sound') {
      expect(
        world.audio?.sounds[effect.sound],
        `${where} plays sound "${effect.sound}", which isn't in world.audio.sounds (known: ${Object.keys(world.audio?.sounds ?? {}).join(', ')})`,
      ).toBeDefined();
    }
    if (effect.type === 'pause') {
      expect(effect.ms >= 0 && effect.ms <= 5000, `${where} pauses for ${effect.ms} ms; keep pauses between 0 and 5000 ms`).toBe(true);
    }
    if (effect.type === 'goToRoom') {
      const room = world.rooms[effect.roomId];
      expect(room, `${where} goes to room "${effect.roomId}", which isn't in world.rooms (known: ${Object.keys(world.rooms).join(', ')})`).toBeDefined();
      expect(
        room?.entries[effect.entry],
        `${where} arrives at entry "${effect.entry}" of "${effect.roomId}", which it doesn't have (has: ${Object.keys(room?.entries ?? {}).join(', ')})`,
      ).toBeDefined();
    }
    if (effect.type === 'startDialogue') {
      expect(
        world.dialogues[effect.dialogueId],
        `${where} starts dialogue "${effect.dialogueId}", which isn't in world.dialogues (known: ${Object.keys(world.dialogues).join(', ')})`,
      ).toBeDefined();
    }
  }
}

/** The shared rules for any list of responses: verbs, item uses, combinations. */
function expectValidResponses(responses: readonly Response[], where: string): void {
  expect(responses.length, `${where} has no responses; add at least one`).toBeGreaterThan(0);
  expect(
    responses.at(-1)?.when,
    `${where}: the last response has a "when", so some states have no response and the game would ` +
      `throw. Make the last response unconditional (drop its "when") as the fallback`,
  ).toBeUndefined();

  for (const [i, response] of responses.entries()) {
    expectValidEffects(response.effects, `${where}.responses[${i}]`);
  }
}

/** Where each flag is tested by a condition, and where each is set, found by walking the whole world. */
function flagUses(): { read: Map<string, string>; set: Map<string, string> } {
  const read = new Map<string, string>();
  const set = new Map<string, string>();
  const seen = new Set<object>();
  const visit = (node: unknown, path: string): void => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    const o = node as Record<string, unknown>;
    // Conditions are the only objects with a `flag`/`notFlag` and no `type` (setFlag effects have one).
    if (o.type === 'setFlag' && typeof o.flag === 'string') {
      if (!set.has(o.flag)) set.set(o.flag, path);
    } else if (!('type' in o)) {
      for (const key of ['flag', 'notFlag']) {
        const flag = o[key];
        if (typeof flag === 'string' && !read.has(flag)) read.set(flag, path);
      }
    }
    for (const [key, value] of Object.entries(o)) visit(value, Array.isArray(o) ? `${path}[${key}]` : `${path}.${key}`);
  };
  visit(world, 'world');
  return { read, set };
}

/**
 * Flags that are set but that no condition reads, on purpose: they only record that something
 * happened. Anything else set and never read is probably a typo on the setting side.
 */
const DELIBERATELY_UNREAD: readonly string[] = [];

function expectOnlyPlaceholders(template: string, allowed: string[], where: string): void {
  const used = [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
  const unknown = used.filter((name) => !allowed.includes(name));
  expect(unknown, `${where} uses unknown placeholder(s) ${unknown.map((n) => `{${n}}`).join(', ')}; allowed: ${allowed.map((n) => `{${n}}`).join(', ')}`).toEqual([]);
}

describe('content validation', () => {
  const rooms = Object.entries(world.rooms);

  it('has the starting room', () => {
    expect(
      world.rooms[initialState.roomId],
      `initialState.roomId is "${initialState.roomId}" but world.rooms only has: ${Object.keys(world.rooms).join(', ')}`,
    ).toBeDefined();
  });

  it('starts the player inside the walkable area', () => {
    const room = world.rooms[initialState.roomId]!;
    expect(
      pointInPolygon(initialState.player, room.walkable),
      `initialState.player ${fmt(initialState.player)} is off the floor of "${room.id}"; ${describeArea(room.walkable)}`,
    ).toBe(true);
  });

  for (const [key, item] of Object.entries(world.items)) {
    it(`item "${key}" is keyed by its id and has a name and look line`, () => {
      expect(item.id, `world.items["${key}"] holds an item whose id is "${item.id}"; make them match`).toBe(key);
      expect(item.name.trim(), `item ${key} has an empty name; the inventory shows it`).not.toBe('');
      if (typeof item.look === 'string') expect(item.look.trim(), `item ${key} has an empty look line`).not.toBe('');
      else {
        // A look with responses (slice 33): the same rules as any verb's, and every one says something.
        expectValidResponses(item.look, `${key}.look`);
        for (const [i, r] of item.look.entries()) {
          expect(r.effects.some((e) => e.type === 'say' || e.type === 'sayOneOf'), `${key}.look response ${i} says nothing`).toBe(true);
        }
      }
      if (item.action) {
        expect(item.action.label.trim(), `item ${key}.action has an empty label; it's the coin button's name`).not.toBe('');
        expectValidResponses(item.action.responses, `${key}.action`);
      }
    });
  }

  describe('combinations', () => {
    for (const [i, combination] of world.combinations.entries()) {
      const [a, b] = combination.items;
      const where = `combinations[${i}] (${a} + ${b})`;
      it(`${where} is well-formed`, () => {
        expectKnownItem(a, where);
        expectKnownItem(b, where);
        expect(a, `${where} combines an item with itself`).not.toBe(b);
        expectValidResponses(combination.responses, where);
      });
    }

    it('lists each pair only once, in either order', () => {
      const pairs = world.combinations.map(({ items }) => [...items].sort().join(' + '));
      const dupes = pairs.filter((pair, i) => pairs.indexOf(pair) !== i);
      expect(dupes, `these pairs appear more than once (order doesn't matter): ${dupes.join(', ')}; merge them`).toEqual([]);
    });
  });

  for (const [key, character] of Object.entries(world.characters)) {
    it(`character "${key}" is keyed by its id and has a name and colour`, () => {
      expect(character.id, `world.characters["${key}"] holds a character whose id is "${character.id}"; make them match`).toBe(key);
      expect(character.name.trim(), `character ${key} has an empty name`).not.toBe('');
      expect(character.color, `character ${key}'s color "${character.color}" isn't a #rrggbb CSS colour`).toMatch(/^#[0-9a-f]{6}$/i);
    });
  }

  it('has audio: the title track and the sound for failed item uses', () => {
    expect(world.audio, 'world.audio is missing').toBeDefined();
    expect(world.audio?.music[world.audio.title], `the title track "${world.audio?.title}" isn't in world.audio.music`).toBeDefined();
    expect(world.audio?.sounds[FAIL_SOUND], `world.audio.sounds needs "${FAIL_SOUND}": the core plays it when an item use fails`).toBeDefined();
  });

  it('has the player character', () => {
    expect(world.characters[PLAYER], `world.characters needs "${PLAYER}": lines with no speaker are Dana's`).toBeDefined();
  });

  for (const [key, dialogue] of Object.entries(world.dialogues)) {
    describe(`dialogue "${key}"`, () => {
      it('is keyed by its id and starts at a real node', () => {
        expect(dialogue.id, `world.dialogues["${key}"] holds a dialogue whose id is "${dialogue.id}"; make them match`).toBe(key);
        expect(dialogue.nodes[dialogue.start], `${key}.start is "${dialogue.start}", which isn't one of its nodes (${Object.keys(dialogue.nodes).join(', ')})`).toBeDefined();
      });

      it('has a well-formed greeting', () => {
        // Unlike verbs, a greeting may have no fallback: then nobody says anything first.
        (dialogue.greeting ?? []).forEach((r, i) => expectValidEffects(r.effects, `${key}.greeting[${i}]`));
      });

      it('has unique option ids', () => {
        const ids = Object.values(dialogue.nodes).flatMap((n) => n.options.map((o) => o.id));
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes, `${key} reuses option ids ${dupes.join(', ')}; one-shot tracking needs them unique per dialogue`).toEqual([]);
      });

      for (const [nodeId, node] of Object.entries(dialogue.nodes)) {
        it(`node "${nodeId}" can always be left`, () => {
          const exits = node.options.filter((o) => o.when === undefined && !o.once);
          expect(
            exits.length,
            `${key}.${nodeId} has no option that is always available (no "when", not "once"), so the player ` +
              `could end up with no options. Add a repeatable way onward or out, like a goodbye`,
          ).toBeGreaterThan(0);
        });

        for (const option of node.options) {
          it(`option "${nodeId}.${option.id}" is well-formed`, () => {
            const where = `${key}.${nodeId}.${option.id}`;
            expect(option.text.trim(), `${where} has no text; it's what Dana says`).not.toBe('');
            if (option.next !== 'end') {
              expect(dialogue.nodes[option.next], `${where}.next is "${option.next}", which isn't a node in ${key} (${Object.keys(dialogue.nodes).join(', ')}) or "end"`).toBeDefined();
            }
            expectValidEffects(option.effects ?? [], where);
          });
        }
      }
    });
  }

  for (const character of Object.values(world.characters)) {
    for (const [pose, walk] of Object.entries(character.walks ?? {})) {
      it(`gives ${character.id}'s ${pose} walk a size, a count and a frame rate, and a sprite to walk from`, () => {
        const bad = (['frameWidth', 'frameHeight', 'frames', 'fps'] as const).filter((k) => !(walk[k] > 0));
        expect(bad, `${character.id}.walks.${pose} needs positive ${bad.join(', ')}`).toEqual([]);
        expect(character.sprites?.[pose as Pose], `${character.id} walks as "${pose}" but has no "${pose}" sprite`).toBeDefined();
      });
    }
  }

  it('marks exactly the doors between rooms as exits (for the cursor)', () => {
    const exits = Object.values(world.rooms).flatMap((r) => r.hotspots.filter(isExit).map((h) => `${r.id}.${h.id}`));
    expect(exits.sort()).toEqual(['breakRoom.giftShopDoor', 'giftShop.lairDoor', 'giftShop.staffDoorOpen', 'lair.door']);
  });

  describe('fallback lines', () => {
    it('has at least one line in each pool, using only known placeholders', () => {
      expect(world.fallbacks.useItemOn.length, 'world.fallbacks.useItemOn is empty').toBeGreaterThan(0);
      expect(world.fallbacks.combine.length, 'world.fallbacks.combine is empty').toBeGreaterThan(0);
      world.fallbacks.useItemOn.forEach((line, i) => expectOnlyPlaceholders(line, ['item', 'target'], `fallbacks.useItemOn[${i}]`));
      world.fallbacks.combine.forEach((line, i) => expectOnlyPlaceholders(line, ['a', 'b'], `fallbacks.combine[${i}]`));
    });
  });

  describe('flags', () => {
    const { read, set } = flagUses();

    it('tests only flags that some effect sets', () => {
      const unknown = [...read].filter(([flag]) => flag !== WON && !set.has(flag));
      expect(
        unknown.map(([flag, where]) => `"${flag}" at ${where}`),
        `These conditions test flags that no effect ever sets, so they can never hold (or always hold, for notFlag). ` +
          `Fix the typo, or add a setFlag effect. Flags that are set: ${[...set.keys()].sort().join(', ')}`,
      ).toEqual([]);
    });

    it('reads every flag it sets, unless the flag is listed as deliberately unread', () => {
      const unread = [...set].filter(([flag]) => !read.has(flag) && !DELIBERATELY_UNREAD.includes(flag));
      expect(
        unread.map(([flag, where]) => `"${flag}" at ${where}`),
        `These flags are set but no condition reads them: a typo on the setting side? If the flag only records ` +
          `that something happened, add it to DELIBERATELY_UNREAD in content.test.ts`,
      ).toEqual([]);
    });

    it('lists only flags that are set and unread as deliberately unread', () => {
      const stale = DELIBERATELY_UNREAD.filter((flag) => !set.has(flag) || read.has(flag));
      expect(stale, `Remove these from DELIBERATELY_UNREAD: each is either never set or is read by a condition`).toEqual([]);
    });
  });

  for (const [key, room] of rooms) {
    describe(`room "${key}"`, () => {
      it('is keyed by its own id', () => {
        expect(room.id, `world.rooms["${key}"] holds a room whose id is "${room.id}"; make them match`).toBe(key);
      });

      for (const [entryId, point] of Object.entries(room.entries)) {
        it(`entry "${entryId}" is on the floor`, () => {
          expect(
            pointInPolygon(point, room.walkable),
            `${room.id}.entries.${entryId} ${fmt(point)} is off the floor, so Dana would arrive somewhere they can't stand; ${describeArea(room.walkable)}`,
          ).toBe(true);
        });
      }

      if (room.music !== undefined) {
        it(`plays a known track ("${room.music}")`, () => {
          expect(world.audio?.music[room.music!], `${room.id}.music is "${room.music}", which isn't in world.audio.music (known: ${Object.keys(world.audio?.music ?? {}).join(', ')})`).toBeDefined();
        });
      }

      it('has unique hotspot ids', () => {
        const ids = room.hotspots.map((h) => h.id);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes, `"${room.id}" has duplicate hotspot ids: ${dupes.join(', ')}; ids must be unique per room`).toEqual([]);
      });

      for (const hotspot of room.hotspots) {
        describe(`hotspot "${hotspot.id}"`, () => {
          it('has a name', () => {
            expect(hotspot.name.trim(), `${hotspot.id} has an empty name; it's what the hover label shows`).not.toBe('');
          });

          if (hotspot.character !== undefined) {
            it('is a known character', () => {
              expect(world.characters[hotspot.character!], `${hotspot.id}.character is "${hotspot.character}", which isn't in world.characters`).toBeDefined();
            });
          }

          if (hotspot.pose !== undefined) {
            it(`has a "${hotspot.pose}" sprite for its pose`, () => {
              const sprites = hotspot.character === undefined ? undefined : world.characters[hotspot.character]?.sprites;
              expect(
                sprites?.[hotspot.pose!],
                `${hotspot.id} has pose "${hotspot.pose}", but ${hotspot.character === undefined ? 'it isn\'t a character' : `character "${hotspot.character}" has no "${hotspot.pose}" sprite`}; add the sprite or drop the pose`,
              ).toBeDefined();
            });
          }

          it('has a look verb', () => {
            expect(hotspot.verbs.look, `${hotspot.id} has no look verb; every hotspot needs a look line (it's where the jokes live)`).toBeDefined();
          });

          for (const [verb, spec] of Object.entries(hotspot.verbs)) {
            it(`verb "${verb}" is well-formed`, () => {
              const where = `${hotspot.id}.verbs.${verb}`;
              if (typeof spec.label === 'string') {
                expect(spec.label.trim(), `${where}.label is empty; remove it to use the default verb name`).not.toBe('');
              } else if (spec.label !== undefined) {
                // Labels with conditions (slice 33): none empty, and the last one always applies.
                for (const l of spec.label) expect(l.text.trim(), `${where}.label has an empty text`).not.toBe('');
                expect(spec.label.at(-1)?.when, `${where}.label's last entry needs no conditions, so there's always a label`).toBeUndefined();
              }
              expectValidResponses(spec.responses, where);
            });
          }

          for (const [itemId, responses] of Object.entries(hotspot.itemUses ?? {})) {
            it(`item use "${itemId}" is well-formed`, () => {
              const where = `${hotspot.id}.itemUses.${itemId}`;
              expectKnownItem(itemId, where);
              expectValidResponses(responses ?? [], where);
            });
          }

          if (hotspot.itemFallback !== undefined) {
            it('has a non-empty item fallback', () => {
              expect(hotspot.itemFallback?.trim(), `${hotspot.id}.itemFallback is empty; remove it to use the generic lines`).not.toBe('');
            });
          }

          it('has an interaction point inside the walkable area', () => {
            expect(
              pointInPolygon(hotspot.interactionPoint, room.walkable),
              `${hotspot.id}.interactionPoint ${fmt(hotspot.interactionPoint)} is off the floor of "${room.id}", ` +
                `so Dana can't stand there. Pick a point on the floor; ${describeArea(room.walkable)}`,
            ).toBe(true);
          });

          it('fits on screen', () => {
            const { x, y, width, height } = hotspot.bounds;
            const overflow = [
              x < 0 && `${-x}px off the left`,
              y < 0 && `${-y}px off the top`,
              x + width > LOGICAL_WIDTH && `${x + width - LOGICAL_WIDTH}px off the right`,
              y + height > LOGICAL_HEIGHT && `${y + height - LOGICAL_HEIGHT}px off the bottom`,
            ].filter(Boolean);
            expect(
              overflow,
              `${hotspot.id}.bounds (x ${x}–${x + width}, y ${y}–${y + height}) runs ${overflow.join(' and ')} ` +
                `of the ${LOGICAL_WIDTH}×${LOGICAL_HEIGHT} screen`,
            ).toEqual([]);
          });
        });
      }
    });
  }
});

describe('comic beats (slice 31)', () => {
  it('keeps deliberate line breaks in the lines the game shows', () => {
    const lines = Object.values(world.dialogues)
      .flatMap((d) => Object.values(d.nodes).flatMap((n) => n.options.flatMap((o) => o.effects ?? [])))
      .flatMap((e) => (e.type === 'say' ? [e.text] : []));
    expect(lines).toContain('I am Mortevayne, Dread Sovereign of the—\nfine. Reginald Vantablack-Thorne. Classically trained.');
  });
});

describe('the gum (slice 33)', () => {
  // Rising, Reginald leaves the gum in plain view, and Dana says so: they can take it without having
  // looked at the throne first.
  it('can be taken after the cue, whether or not Dana looked at the throne', () => {
    let state: GameState = { ...initialState, flags: { ...initialState.flags, learnedCue: true } };
    for (const command of [
      { type: 'verb', verb: 'talk', hotspotId: 'reginald' },
      { type: 'chooseOption', optionId: 'cue' },
    ] as const) {
      state = handle(world, state, command).state;
    }
    expect(availableVerbs(world, state, 'throne').map((v) => v.label)).toContain('Take the gum');
  });
});

describe('the keypad (slice 33)', () => {
  // Once Dana has read the scroll, the keypad's own verb reads "Enter CODE" and plays the same reveal
  // as using the scroll on it (a play-tester expected the keypad to work). Holding it unread, a hint.
  const holding: GameState = { ...initialState, inventory: [...initialState.inventory, 'riddleScroll'] };
  const enter = (state: GameState) => handle(world, state, { type: 'verb', verb: 'use', hotspotId: 'keypad' });
  const keypadLabel = (state: GameState) => availableVerbs(world, state, 'keypad').find((v) => v.verb === 'use')?.label;

  it('after reading the scroll, offers "Enter CODE", which opens the door like the scroll does', () => {
    const read = handle(world, holding, { type: 'lookItem', itemId: 'riddleScroll' }).state;
    expect(keypadLabel(holding)).toBe('Enter a code');
    expect(keypadLabel(read)).toBe('Enter CODE');
    const byVerb = enter(read);
    expect(byVerb.state.flags.lairDoorUnlocked).toBe(true);
    expect(byVerb.state.inventory).not.toContain('riddleScroll');
    expect(byVerb.effects).toEqual(handle(world, read, { type: 'useItemOn', itemId: 'riddleScroll', hotspotId: 'keypad' }).effects);
  });

  it('holding the scroll unread, says to read it first', () => {
    const result = enter(holding);
    expect(result.state.flags.lairDoorUnlocked).toBeUndefined();
    expect(result.effects).toEqual([{ type: 'say', text: expect.stringContaining('read what it says') }]);
  });
});
