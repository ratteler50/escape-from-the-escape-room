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
  'Section 21: "Staff may not name the props." Gary\'s name tag is stapled to this page.',
  'Section 27: "Smile at every guest." There\'s a diagram of the correct smile. The diagram is not smiling.',
  'Section 42: "Do not feed the lich." Added after what head office calls "the sandwich incident".',
  'Section 57: "Staff must congratulate any guest who solves a puzzle." Page 57 is in mint condition.',
  'Section 88: "Staff may not understudy the lich." Reginald wrote this section himself. In red pen.',
  'Section 113: "Clues may not be written on the staff." Somebody tried. It was me. It was my first shift.',
  'Section 150: "Lost guests must be found within one business day." There\'s a form for it. Nobody has filled it in. Yet.',
  'Section 204: "All complaints must be sent in writing to head office." Head office\'s address is not in the Handbook.',
  'Section 276: "The Handbook may only be read on break." I\'m on break. Technically. Probably.',
  'Section 311: "Paper cuts from the Handbook are not covered by staff insurance." I got three just reaching page 311.',
  'Section 400: "This Handbook replaces all previous Handbooks." There have been nine. Every one says this.',
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
