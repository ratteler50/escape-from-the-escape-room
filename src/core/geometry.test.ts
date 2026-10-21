import { describe, expect, it } from 'vitest';
import { clampToPolygon, pointInPolygon, type Polygon } from './geometry';

// A 100×100 square with its top-left corner at (0, 0).
const square: Polygon = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

// A trapezoid wider at the bottom, like a floor seen in perspective.
const floor: Polygon = [
  { x: 200, y: 400 },
  { x: 1080, y: 400 },
  { x: 1240, y: 700 },
  { x: 40, y: 700 },
];

describe('pointInPolygon', () => {
  it('is true for a point inside', () => {
    expect(pointInPolygon({ x: 50, y: 50 }, square)).toBe(true);
  });

  it('is false for a point outside', () => {
    expect(pointInPolygon({ x: 150, y: 50 }, square)).toBe(false);
    expect(pointInPolygon({ x: 50, y: -1 }, square)).toBe(false);
  });

  it('handles non-rectangular polygons', () => {
    expect(pointInPolygon({ x: 640, y: 550 }, floor)).toBe(true);
    // Left of the slanted edge near the top: outside.
    expect(pointInPolygon({ x: 150, y: 420 }, floor)).toBe(false);
  });
});

describe('clampToPolygon', () => {
  it('leaves a point inside unchanged', () => {
    expect(clampToPolygon({ x: 50, y: 50 }, square)).toEqual({ x: 50, y: 50 });
  });

  it('moves a point outside to the nearest edge point', () => {
    expect(clampToPolygon({ x: 150, y: 50 }, square)).toEqual({ x: 100, y: 50 });
    expect(clampToPolygon({ x: 50, y: -30 }, square)).toEqual({ x: 50, y: 0 });
  });

  it('moves a point outside a corner to that corner', () => {
    expect(clampToPolygon({ x: 120, y: 130 }, square)).toEqual({ x: 100, y: 100 });
  });

  it('clamps onto a slanted edge', () => {
    const clamped = clampToPolygon({ x: 640, y: 100 }, floor);
    expect(clamped).toEqual({ x: 640, y: 400 });
  });
});
