/** A rectangle in game coordinates (1280×720). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The smallest touch area on a touch screen, in game pixels: about 48 px on a phone held sideways
 * (0.54×), a fingertip (slice 32).
 */
export const TOUCH_MIN = 88;

/**
 * The area a hotspot answers taps on, on a touch screen: its own bounds, grown around their centre
 * to at least `TOUCH_MIN` each way, then cut back wherever that would reach into another hotspot,
 * so a grown area only ever claims empty space. The result always contains the original bounds.
 * Neighbours the hotspot already overlaps (a wall it's painted on) don't count.
 */
export function touchArea(bounds: Rect, others: readonly Rect[], min = TOUCH_MIN): Rect {
  const growX = Math.max(0, min - bounds.width) / 2;
  const growY = Math.max(0, min - bounds.height) / 2;
  let left = bounds.x - growX;
  let right = bounds.x + bounds.width + growX;
  let top = bounds.y - growY;
  let bottom = bounds.y + bounds.height + growY;

  for (const o of others) {
    if (overlaps(o, bounds)) continue;
    const grown = { x: left, y: top, width: right - left, height: bottom - top };
    if (!overlaps(o, grown)) continue;
    // The neighbour is clear of the original bounds along at least one axis; cut on that side.
    if (o.x + o.width <= bounds.x) left = o.x + o.width;
    else if (o.x >= bounds.x + bounds.width) right = o.x;
    else if (o.y + o.height <= bounds.y) top = o.y + o.height;
    else bottom = o.y;
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** True when two rectangles share some area (touching edges don't count). */
function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}
