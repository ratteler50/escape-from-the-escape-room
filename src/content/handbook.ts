import type { Item } from '../core/types';
import { sayOneOf } from './dsl';
import type { ContentPack } from './pack';

// The Escape-O-Rama Employee Handbook (slice 29): Dana has it from the start and never loses it. No
// puzzle uses it. Every hotspot has a line for it (in its own file, under `itemUses`), and Reading
// it quotes a section at random. Sections are the ones in docs/design.md's table; handbook.test.ts
// checks every "Section N" in the game against it.

/** What Dana reads out, one at a time, picked at random. */
export const handbookReadings: readonly string[] = [
  'Section 1: "Nobody has ever beaten the escape room." It\'s in bold. Head office is very proud of it.',
  'Section 2: "Know your number." Mine is printed on my lanyard, in a font size head office calls "discreet".',
  'Section 3: "Lost property must be returned and logged." The log is a sticky note on page 31. It says UMBRELLA (BLACK). It has said that since 2019.',
  'Section 4.2: "Never touch the guests." There\'s a footnote. The footnote is a drawing of a sad face.',
  'Section 5: "No card, no clock." Followed by three pages on what counts as a card. Library cards do not.',
  'Section 6: "Respect your colleagues\' dairy." Underlined twice, in someone else\'s pen.',
  'Section 7.1: "The Spooky Seat is for liches only." Added last year. I have questions about last year.',
  'Section 8: "Found money under five cents belongs to the finder." The most generous page in the book.',
  'Section 9: "Doors must never be locked during business hours." Someone has added OR ELSE in pencil. It\'s the most threatening thing in the book.',
  'Section 10: "Always require exact change." There\'s a little drawing of a till, frowning at a twenty.',
  'Section 12: "Do not improvise with props." Someone has written TOO LATE in the margin, signed "R."',
  "Section 13: intentionally left blank. Head office is superstitious. They'll never admit it.",
  'Section 16: "Staff must never be scarier than the attractions." There\'s a photo of Reginald next to it, crossed out.',
  'Section 18: "In an emergency, consult the Handbook." I am consulting it. It is telling me to consult it.',
];

export const handbook: Item = {
  id: 'handbook',
  name: 'Employee Handbook',
  icon: 'assets/icons/handbook.webp',
  look: "The Escape-O-Rama Employee Handbook. Four hundred pages, bound in leather-effect vinyl. I've read it cover to cover. Twice. For fun.",
  action: {
    label: 'Read',
    responses: [{ effects: [sayOneOf(handbookReadings)] }],
  },
};

export const handbookPack: ContentPack = { items: [handbook] };
