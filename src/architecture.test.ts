import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Enforces docs/decisions/0002-headless-core.md: the core must run without Phaser or a browser.
const FORBIDDEN_IMPORTS = [/from\s+['"]phaser['"]/, /import\s+['"]phaser['"]/, /from\s+['"]\.\.\/view\//];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

describe('architecture', () => {
  for (const layer of ['core', 'content']) {
    it(`src/${layer} does not import Phaser or the view`, () => {
      const offenders = sourceFiles(join(import.meta.dirname, layer)).filter((file) => {
        const source = readFileSync(file, 'utf8');
        return FORBIDDEN_IMPORTS.some((pattern) => pattern.test(source));
      });
      expect(offenders).toEqual([]);
    });
  }
});
