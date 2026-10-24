import type { Item } from '../core/types';
import { sayOneOf } from './dsl';
import type { ContentPack } from './pack';

// The Escape-O-Rama Employee Handbook (slice 29): Dana has it from the start and never loses it. No
// puzzle uses it. Every hotspot has a line for it (in its own file, under `itemUses`); Reading it
// quotes a section at random, and the loading screen shows the same sections as plain quotes.
// Sections are the ones in docs/design.md's table; handbook.test.ts checks every "Section N" in the
// game against it.

interface HandbookSection {
  section: string;
  /** The rule, word for word as the Handbook prints it. */
  rule: string;
  /** Dana's comment after reading it out. */
  aside: string;
}

const sections: readonly HandbookSection[] = [
  { section: '1', rule: 'Nobody has ever beaten the escape room.', aside: "It's in bold. Head office is very proud of it." },
  { section: '2', rule: 'Know your number.', aside: 'Mine is printed on my lanyard, in a font size head office calls "discreet".' },
  {
    section: '3',
    rule: 'Lost property must be returned and logged.',
    aside: 'The log is a sticky note on page 31. It says UMBRELLA (BLACK). It has said that since 2019.',
  },
  { section: '4.2', rule: 'Never touch the guests.', aside: "There's a footnote. The footnote is a drawing of a sad face." },
  { section: '5', rule: 'No card, no clock.', aside: 'Followed by three pages on what counts as a card. Library cards do not.' },
  {
    section: '5.3',
    rule: 'Off-duty staff are customers like anyone else.',
    aside: 'There is a whole page on looking off duty. It mostly says "flip your badge".',
  },
  { section: '6', rule: "Respect your colleagues' dairy.", aside: "Underlined twice, in someone else's pen." },
  { section: '7.1', rule: 'The Spooky Seat is for liches only.', aside: 'Added last year. I have questions about last year.' },
  { section: '8', rule: 'Found money under five cents belongs to the finder.', aside: 'The most generous page in the book.' },
  {
    section: '9',
    rule: 'Doors must never be locked during business hours.',
    aside: "Someone has added OR ELSE in pencil. It's the most threatening thing in the book.",
  },
  { section: '10', rule: 'Always require exact change.', aside: "There's a little drawing of a till, frowning at a twenty." },
  {
    section: '11',
    rule: 'Employees may not review their own workplace.',
    aside: 'Someone has stapled a review of the Handbook to this page. One star.',
  },
  { section: '12', rule: 'Do not improvise with props.', aside: 'Someone has written TOO LATE in the margin, signed "R."' },
  { section: '13', rule: 'This section is intentionally left blank.', aside: "Head office is superstitious. They'll never admit it." },
  { section: '14.1', rule: 'Staff may not re-price items for personal gain.', aside: 'Head office has underlined "personal". Twice.' },
  { section: '15', rule: 'Always contribute.', aside: 'The next page is the staff social sign-up sheet. Gary has signed it every month.' },
  { section: '16', rule: 'Staff must never be scarier than the attractions.', aside: "There's a photo of Reginald next to it, crossed out." },
  { section: '18', rule: 'In an emergency, consult the Handbook.', aside: 'I am consulting it. It is telling me to consult it.' },
  { section: '21', rule: 'Staff may not name the props.', aside: "Gary's name tag is stapled to this page." },
  { section: '27', rule: 'Smile at every guest.', aside: "There's a diagram of the correct smile. The diagram is not smiling." },
  { section: '33', rule: 'Staff must wear a name tag at all times.', aside: 'Mine says TRAINEE. Head office ran out of the ones with names.' },
  { section: '42', rule: 'Do not feed the lich.', aside: 'Added after what head office calls "the sandwich incident".' },
  { section: '57', rule: 'Staff must congratulate any guest who solves a puzzle.', aside: 'Page 57 is in mint condition.' },
  { section: '88', rule: 'Staff may not understudy the lich.', aside: 'Reginald wrote this section himself. In red pen.' },
  { section: '113', rule: 'Clues may not be written on the staff.', aside: 'Somebody tried. It was me. It was my first shift.' },
  { section: '150', rule: 'Lost guests must be found within one business day.', aside: "There's a form for it. Nobody has filled it in. Yet." },
  { section: '204', rule: 'All complaints must be sent in writing to head office.', aside: "Head office's address is not in the Handbook." },
  { section: '276', rule: 'The Handbook may only be read on break.', aside: "I'm on break. Technically. Probably." },
  {
    section: '311',
    rule: 'Paper cuts from the Handbook are not covered by staff insurance.',
    aside: 'I got three just reaching page 311.',
  },
  { section: '400', rule: 'This Handbook replaces all previous Handbooks.', aside: 'There have been nine. Every one says this.' },
];

/** What Dana reads out, one at a time, picked at random: the rule, then their comment. */
export const handbookReadings: readonly string[] = sections.map((s) => `Section ${s.section}: "${s.rule}" ${s.aside}`);

/** The loading screen's lines: the rules as printed, no comment. */
export const handbookQuotes: readonly string[] = sections.map((s) => `Handbook Section ${s.section}: ${s.rule}`);

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
