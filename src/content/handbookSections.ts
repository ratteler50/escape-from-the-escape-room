import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// For tests: the Employee Handbook's sections, from the master list in docs/design.md ("The Employee
// Handbook"), where each section means one thing. Reads the file, so only tests may import it.
const design = readFileSync(join(import.meta.dirname, '..', '..', 'docs', 'design.md'), 'utf8');
const table = design.slice(design.indexOf('### The Employee Handbook'));

export const handbookSections: ReadonlySet<string> = new Set(
  [...table.slice(0, table.indexOf('\n## ')).matchAll(/^\| ([\d. /]+) \|/gm)].flatMap((m) => m[1]!.split('/').map((s) => s.trim())),
);
