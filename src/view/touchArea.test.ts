import { describe, expect, it } from 'vitest';
import { world } from '../content/world';
import { TOUCH_MIN, touchArea } from './touchArea';

const keypad = { x: 1000, y: 205, width: 44, height: 52 };

describe('the touch-area rule', () => {
  it('grows a small area to the minimum around its centre', () => {
    expect(touchArea(keypad, [])).toEqual({ x: 978, y: 187, width: TOUCH_MIN, height: TOUCH_MIN });
  });

  it('leaves an area that is already big enough alone', () => {
    const door = { x: 1075, y: 112, width: 158, height: 330 };
    expect(touchArea(door, [])).toEqual(door);
  });

  it('grows only the side that is too small', () => {
    const phylactery = { x: 428, y: 276, width: 58, height: 146 };
    expect(touchArea(phylactery, [])).toEqual({ x: 413, y: 276, width: 88, height: 146 });
  });

  it('stops at a neighbour, so it never covers another hotspot', () => {
    // The Customer Reviews board ends at x 995, 5 px left of the keypad.
    const reviews = { x: 815, y: 137, width: 180, height: 140 };
    const grown = touchArea(keypad, [reviews]);
    expect(grown).toEqual({ x: 995, y: 187, width: 71, height: 88 });
    expect(grown.x).toBeGreaterThanOrEqual(reviews.x + reviews.width);
  });

  it('stops at a neighbour above or below too', () => {
    const below = { x: 990, y: 260, width: 60, height: 40 };
    expect(touchArea(keypad, [below])).toEqual({ x: 978, y: 187, width: 88, height: 73 });
  });

  it('ignores the area itself and neighbours it already overlaps', () => {
    const behind = { x: 900, y: 100, width: 300, height: 300 }; // e.g. a wall it sits on
    expect(touchArea(keypad, [keypad, behind])).toEqual({ x: 978, y: 187, width: 88, height: 88 });
  });

  it('always keeps the original area', () => {
    const tight = [
      { x: 990, y: 205, width: 10, height: 52 },
      { x: 1044, y: 205, width: 10, height: 52 },
      { x: 1000, y: 195, width: 44, height: 10 },
      { x: 1000, y: 257, width: 44, height: 10 },
    ];
    expect(touchArea(keypad, tight)).toEqual(keypad);
  });
});

// Which hotspots get a bigger touch area than their art: a list to notice when content changes it.
it('grows the touch areas of the small hotspots, and only those', () => {
  const grown = Object.values(world.rooms).flatMap((room) =>
    room.hotspots
      .filter((h) => {
        const area = touchArea(h.bounds, room.hotspots.filter((o) => o !== h).map((o) => o.bounds));
        return area.width !== h.bounds.width || area.height !== h.bounds.height;
      })
      .map((h) => `${room.id}.${h.id}`),
  );
  expect(grown.sort()).toEqual([
    'breakRoom.intercom',
    'giftShop.reginaldFinale',
    'lair.coffinScript',
    'lair.grate',
    'lair.hairspray',
    'lair.keypad',
    'lair.phylactery',
    'lair.reginald',
    'lair.reginaldOnMark',
  ]);
});
