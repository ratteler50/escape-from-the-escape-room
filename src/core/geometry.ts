export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Vertices in order (either winding). The last vertex connects back to the first. */
export type Polygon = readonly Point[];

export function rectContains(rect: Rect, p: Point): boolean {
  return p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height;
}

/** Ray casting: count how many edges a horizontal ray from `p` crosses. Odd means inside. */
export function pointInPolygon(p: Point, polygon: Polygon): boolean {
  let inside = false;
  for (const [a, b] of edges(polygon)) {
    const crosses = a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** Returns `p` if it is inside the polygon, otherwise the nearest point on its boundary. */
export function clampToPolygon(p: Point, polygon: Polygon): Point {
  if (pointInPolygon(p, polygon)) return p;

  let best: Point = p;
  let bestDistSq = Infinity;
  for (const [a, b] of edges(polygon)) {
    const candidate = closestPointOnSegment(p, a, b);
    const d = distanceSq(p, candidate);
    if (d < bestDistSq) {
      best = candidate;
      bestDistSq = d;
    }
  }
  return best;
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt(distanceSq(a, b));
}

function distanceSq(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function closestPointOnSegment(p: Point, a: Point, b: Point): Point {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lengthSq = abx * abx + aby * aby;
  if (lengthSq === 0) return a;
  // Project p onto the line through a and b, then clamp to the segment.
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lengthSq));
  return { x: a.x + t * abx, y: a.y + t * aby };
}

function* edges(polygon: Polygon): Generator<[Point, Point]> {
  for (let i = 0; i < polygon.length; i++) {
    yield [polygon[i]!, polygon[(i + 1) % polygon.length]!];
  }
}
