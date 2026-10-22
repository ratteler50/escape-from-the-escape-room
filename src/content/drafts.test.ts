import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { draftsIn, generateDrafts } from '../../scripts/drafts';

// docs/drafts.md lists every `// DRAFT:` line for the developer to punch up (docs/slices/17-polish.md).
describe('the draft script', () => {
  it('is up to date with the content', () => {
    const onDisk = readFileSync(join(import.meta.dirname, '..', '..', 'docs', 'drafts.md'), 'utf8');
    expect(onDisk === generateDrafts(), 'docs/drafts.md is out of date: run `npm run drafts` and commit it').toBe(true);
  });

  it('finds the line after the marker, and who speaks it', () => {
    const source = [
      '      // DRAFT:',
      "      R('Darling!'),",
      '      // DRAFT:',
      '      look: says("A door. It\'s a door."),',
      '      // DRAFT:',
      "      text: 'Hello?',",
    ].join('\n');
    expect(draftsIn('x.ts', source)).toEqual([
      { file: 'x.ts', line: 2, speaker: 'Reginald', text: 'Darling!' },
      { file: 'x.ts', line: 4, speaker: 'Dana', text: "A door. It's a door." },
      { file: 'x.ts', line: 6, speaker: 'Dana (option)', text: 'Hello?' },
    ]);
  });
});
