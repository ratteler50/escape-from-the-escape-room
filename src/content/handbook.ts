import type { Item } from '../core/types';
import { sayOneOf } from './dsl';
import type { ContentPack } from './pack';
import { revisedSection14, sections, type HandbookSection } from './handbookSections';

// The Escape-O-Rama Employee Handbook (slice 29): Dana has it from the start and never loses it. No
// puzzle uses it. Every hotspot has a line for it (in its own file, under `itemUses`); Reading it
// quotes a section at random, and the loading screen shows the same sections as plain quotes.
// The sections themselves are the one list in handbookSections.ts.

const reading = (s: HandbookSection) => `Section ${s.section}: "${s.rule}" ${s.aside}`;

/** What Dana reads out, one at a time, picked at random: the rule, then their comment. */
export const handbookReadings: readonly string[] = sections.map(reading);

/** The readings once Dana has found the revised Section 14: it replaces the old one. */
const readingsAfterInsert: readonly string[] = sections.map((s) => reading(s.section === '14' ? revisedSection14 : s));

/** The loading screen's lines: the rules as printed, no comment. */
export const handbookQuotes: readonly string[] = sections.map((s) => `Handbook Section ${s.section}: ${s.rule}`);

export const handbook: Item = {
  id: 'handbook',
  name: 'Employee Handbook',
  icon: 'assets/icons/handbook.webp',
  look: "The Escape-O-Rama Employee Handbook. Four hundred pages, bound in leather-effect vinyl. I've read it cover to cover. Twice. For fun.",
  action: {
    label: 'Read',
    responses: [
      { when: [{ flag: 'learnedRevisedSection14' }], effects: [sayOneOf(readingsAfterInsert)] },
      { effects: [sayOneOf(handbookReadings)] },
    ],
  },
};

export const handbookPack: ContentPack = { items: [handbook] };
