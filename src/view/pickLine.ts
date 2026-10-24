/**
 * Picks which of `count` lines to say, at random but never `last` again when there's a choice, so
 * reading the Handbook twice in a row gives two different sections. `random` returns [0, 1).
 */
export function pickLine(count: number, last: number | undefined, random: () => number = Math.random): number {
  if (count <= 1) return 0;
  // Pick among the other lines, then step over the last one.
  if (last === undefined || last < 0 || last >= count) return Math.floor(random() * count);
  const pick = Math.floor(random() * (count - 1));
  return pick >= last ? pick + 1 : pick;
}
