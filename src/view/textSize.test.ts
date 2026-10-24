import { describe, expect, it } from 'vitest';
import { MIN_LABEL, MIN_TEXT, balancedWidth, readableSize } from './textSize';

describe('readable text size', () => {
  it('leaves text alone at full size or bigger', () => {
    expect(readableSize(22, 1)).toBe(22);
    expect(readableSize(22, 1.5)).toBe(22);
  });

  it('grows text so it shows at least 14 px on screen when the game is shrunk', () => {
    // A phone held sideways shows the game at about 0.54x: 22 px would show at 12 px.
    expect(readableSize(22, 0.54)).toBe(26);
    expect(readableSize(22, 0.54) * 0.54).toBeGreaterThanOrEqual(MIN_TEXT);
    // Text already big enough stays as it is.
    expect(readableSize(44, 0.54)).toBe(44);
  });

  it('uses a smaller floor for small labels', () => {
    expect(readableSize(16, 0.54, MIN_LABEL) * 0.54).toBeGreaterThanOrEqual(MIN_LABEL);
    expect(readableSize(16, 0.54, MIN_LABEL)).toBeLessThan(readableSize(16, 0.54));
  });

  it('ignores a scale it cannot use', () => {
    expect(readableSize(22, 0)).toBe(22);
    expect(readableSize(22, Number.NaN)).toBe(22);
  });
});

describe('balanced wrapping', () => {
  // A stand-in for the font: every character 10 px wide, wrapping on spaces.
  const wrap = (text: string, width: number): string[] => {
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (next.length * 10 > width && line) {
          lines.push(line);
          line = word;
        } else line = next;
      }
      lines.push(line);
    }
    return lines;
  };

  it('narrows the width so the last line is not a single short word', () => {
    const text = 'Reginald Vantablack-Thorne. Classically trained.';
    expect(wrap(text, 400).at(-1)).toBe('trained.');
    const width = balancedWidth(text, 400, wrap);
    expect(wrap(text, width).length).toBe(2);
    expect(wrap(text, width).at(-1)!.split(' ').length).toBeGreaterThan(1);
  });

  it('keeps the full width when the lines are already fine', () => {
    expect(balancedWidth('Not my department.', 400, wrap)).toBe(400);
  });

  it('keeps deliberate line breaks', () => {
    const text = 'Dread Sovereign of the—\nfine.';
    expect(wrap(text, balancedWidth(text, 400, wrap))).toEqual(['Dread Sovereign of the—', 'fine.']);
  });
});
