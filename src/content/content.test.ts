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
          it('has a name and a look line', () => {
            expect(hotspot.name.trim(), `${hotspot.id} has an empty name; it's what the hover label shows`).not.toBe('');
            expect(hotspot.look.trim(), `${hotspot.id} has an empty look line; every hotspot needs a joke`).not.toBe('');
          });

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
