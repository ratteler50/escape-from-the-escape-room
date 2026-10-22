import type { DialogueOption, Hotspot, Item } from '../core/types';
import { line, say, says, setFlag, sound, walk } from './dsl';
import { reginald } from './reginald';

// The M3 payoff (docs/slices/16-finale.md): Kyle sells the mug, the script is satisfied, the curse
// lifts. Kyle and Mordecai are named by id rather than imported: kyle.ts imports this file, and
// mordecai.ts imports kyle.ts.
const K = (text: string) => line('kyle', text);
const M = (text: string) => line('mordecai', text);
const R = (text: string) => line(reginald.id, text);

export const mug: Item = {
  id: 'mug',
  name: '"I ESCAPED" Mug',
  icon: 'assets/icons/mug.webp',
  // DRAFT:
  look: `"I ESCAPED THE LICH'S LAIR." The first one ever sold. It's still warm from the shelf lights.`,
};

/** Reginald for the finale only: appears at the Lair door once the curse lifts, then walks in. */
export const reginaldFinaleHotspot: Hotspot = {
  id: 'reginaldFinale',
  name: 'Reginald',
  character: reginald.id,
  when: [{ flag: 'curseLifted' }],
  // In the Lair doorway; the finale walks his feet to (878, 470), in front of the gap between cardboard
  // Reginald and STAFF ONLY, clear of Kyle, the till and the bargain bin. No flag may be set after that walk,
  // or the hotspot redraw would put him back here.
  pose: 'human',
  bounds: { x: 68, y: 175, width: 70, height: 265 },
  interactionPoint: { x: 110, y: 475 },
  verbs: {
    // DRAFT:
    look: says('Reginald, human again, still in full lich make-up. It has never looked less convincing.'),
  },
};

/** Kyle's three answers to "can I buy a mug?" once Dana is off duty (the on-duty refusal is in kyle.ts). */
export const mugSaleOptions: DialogueOption[] = [
  {
    id: 'mugNoCash',
    text: 'I\'m off duty now. One "I ESCAPED" mug, please?',
    when: [{ flag: 'offDuty' }, { lacks: 'exactChange' }],
    effects: [
      // DRAFT:
      K("Twelve ninety-nine. Cash only, card machine's down."),
      // DRAFT:
      K('Exact change. Head office empties the till every hour.'),
      // DRAFT:
      say('Exact change. Every last cent. Of course.'),
    ],
    next: 'hub',
  },
  {
    id: 'sale',
    text: 'One "I ESCAPED" mug, please. As a customer. With exact change.',
    when: [{ flag: 'offDuty' }, { has: 'exactChange' }],
    effects: [
      // DRAFT:
      K('Lanyard.'),
      // DRAFT:
      say('Off duty. Clocked out. See? Pocket.'),
      // DRAFT:
      K('...Fine.'),
      // DRAFT:
      say('Twelve dollars and ninety-nine cents. Exact. I counted it three times.'),
      { type: 'removeItem', itemId: 'exactChange' },
      sound('till'),
      // DRAFT:
      K('Receipt?'),
      // DRAFT:
      say('Yes please. I want proof.'),
      { type: 'addItem', itemId: mug.id },
      // DRAFT:
      say(`I ESCAPED THE LICH'S LAIR. Technically I haven't. But the mug says I have, and the curse is very literal.`),
      // Reginald appears in the Lair doorway (reginaldFinaleHotspot).
      setFlag('curseLifted'),
      sound('rumble'),
      { type: 'pause', ms: 600 },
      // DRAFT:
      say('A rumble. The lights flicker. Somewhere, a jar stops whispering.'),
      // DRAFT:
      R('Nooooo!'),
      walk(reginald.id, 878, 470),
      // DRAFT:
      R("It's gone, darling. All of it. I'm human. I have a PULSE. Do you know what a pulse does to a performance?"),
      // DRAFT:
      R("Actors' union, section twelve: wrongful loss of the role of a lifetime. I am filing a grievance."),
      // DRAFT:
      say("Gary stays one-armed, I'm afraid. His arm is gummed to a floor grate in the Lair."),
      // DRAFT:
      R('And the anti-theft cable snapped when the curse broke. Somebody take this. It keeps looking at me.'),
      // DRAFT:
      say('He drops the phylactery into a cardboard box.'),
      // DRAFT:
      K('Spooky jar. A dollar. Bargain bin.'),
      // DRAFT:
      M('ONE DOLLAR?! That jar contains my SOUL!'),
      // DRAFT:
      K('Final sale.'),
      { type: 'pause', ms: 800 },
      // DRAFT:
      say(`From the bargain bin, very faintly, something whispers: "...one dollar... we'll see about that..."`),
      { type: 'win' },
    ],
    next: 'end',
  },
];
