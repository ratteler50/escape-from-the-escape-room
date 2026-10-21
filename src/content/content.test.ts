import { describe, expect, it } from 'vitest';
import { pointInPolygon, type Point, type Polygon } from '../core/geometry';
import { initialState, world } from './world';

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;

// Failure messages here are written to be fixable from the message alone: name the bad value and
// say what a good one looks like. Agents (and tired humans) often read nothing else.

const fmt = (p: Point) => `(${p.x}, ${p.y})`;

function describeArea(polygon: Polygon): string {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  return (
    `it spans x ${Math.min(...xs)}–${Math.max(...xs)}, y ${Math.min(...ys)}–${Math.max(...ys)} ` +
    `(edges may slant, so check the corners: ${polygon.map(fmt).join(' ')})`
  );
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
    });
  }

  for (const [key, room] of rooms) {
    describe(`room "${key}"`, () => {
      it('is keyed by its own id', () => {
        expect(room.id, `world.rooms["${key}"] holds a room whose id is "${room.id}"; make them match`).toBe(key);
      });

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

          it('has a look verb', () => {
            expect(hotspot.verbs.look, `${hotspot.id} has no look verb; every hotspot needs a look line (it's where the jokes live)`).toBeDefined();
          });

          for (const [verb, spec] of Object.entries(hotspot.verbs)) {
            it(`verb "${verb}" is well-formed`, () => {
              const where = `${hotspot.id}.verbs.${verb}`;
              if (spec.label !== undefined) {
                expect(spec.label.trim(), `${where}.label is empty; remove it to use the default verb name`).not.toBe('');
              }
              expect(spec.responses.length, `${where} has no responses; add at least one`).toBeGreaterThan(0);
              expect(
                spec.responses.at(-1)?.when,
                `${where}: the last response has a "when", so some states have no response and the game would ` +
                  `throw. Make the last response unconditional (drop its "when") as the fallback`,
              ).toBeUndefined();

              for (const [i, response] of spec.responses.entries()) {
                for (const effect of response.effects) {
                  if (effect.type === 'say') {
                    expect(effect.text.trim(), `${where}.responses[${i}] says an empty line`).not.toBe('');
                  }
                  if (effect.type === 'addItem') {
                    expect(
                      world.items[effect.itemId],
                      `${where}.responses[${i}] adds item "${effect.itemId}", which isn't in world.items ` +
                        `(known: ${Object.keys(world.items).join(', ') || 'none'}). Define it and register it in world.ts`,
                    ).toBeDefined();
                  }
                }
              }
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
