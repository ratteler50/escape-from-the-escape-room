// Text sizing rules for a game drawn at 1280×720 and scaled to fit the screen. Pure, so it's tested
// without Phaser.

/** The smallest size text should show at on screen, in CSS pixels. */
export const MIN_TEXT = 14;
/** The smallest size for small labels (speaker names, hotspot labels). */
export const MIN_LABEL = 12;

/**
 * The font size to draw at, so text designed at `design` px still shows at least `min` px when the
 * game is scaled on screen by `onScreen` (1 = full size; a phone held sideways is about 0.54).
 * At full size or bigger, nothing changes.
 */
export function readableSize(design: number, onScreen: number, min = MIN_TEXT): number {
  if (!(onScreen > 0)) return design;
  return Math.max(design, Math.ceil(min / onScreen));
}

/**
 * The widest wrap width up to `max` at which the text's last line isn't a lone word: narrowing a
 * little moves a word down to keep it company, without adding a line. Deliberate line breaks
 * (`\n`) are kept: only the last paragraph's own wrapping is looked at.
 */
export function balancedWidth(text: string, max: number, wrap: (text: string, width: number) => string[]): number {
  const last = text.split('\n').at(-1) ?? '';
  const lines = (width: number) => wrap(last, width);
  const lonely = (width: number) => {
    const l = lines(width);
    return l.length > 1 && l.at(-1)!.trim().split(/\s+/).length < 2;
  };
  if (!lonely(max)) return max;
  const count = lines(max).length;
  for (let width = max - 10; width >= max / 2; width -= 10) {
    if (lines(width).length > count) break;
    if (!lonely(width)) return width;
  }
  return max;
}
