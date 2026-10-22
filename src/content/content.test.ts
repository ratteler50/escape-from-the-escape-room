import { describe, expect, it } from 'vitest';
import { isExit } from '../core/engine';
import { pointInPolygon, type Point, type Polygon } from '../core/geometry';
import { PLAYER, type Effect, type Response } from '../core/types';
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
      expect(item.look.trim(), `item ${key} has an empty look line`).not.toBe('');
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

  it('has the player character', () => {
    expect(world.characters[PLAYER], `world.characters needs "${PLAYER}": lines with no speaker are hers`).toBeDefined();
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

          it('has a look verb', () => {
            expect(hotspot.verbs.look, `${hotspot.id} has no look verb; every hotspot needs a look line (it's where the jokes live)`).toBeDefined();
          });

          for (const [verb, spec] of Object.entries(hotspot.verbs)) {
            it(`verb "${verb}" is well-formed`, () => {
              const where = `${hotspot.id}.verbs.${verb}`;
              if (spec.label !== undefined) {
                expect(spec.label.trim(), `${where}.label is empty; remove it to use the default verb name`).not.toBe('');
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
