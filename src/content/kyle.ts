import type { Character, Dialogue, Hotspot, Item } from '../core/types';
import { line, say, says, setFlag } from './dsl';

export const kyle: Character = { id: 'kyle', name: 'Kyle', color: '#f7a8d8' };

const K = (text: string) => line(kyle.id, text);

export const priceGun: Item = {
  id: 'priceGun',
  name: 'Price Gun',
  // DRAFT:
  look: `Kyle's price gun. Someone has written "KYLE'S DEPARTMENT" down the handle in glitter pen. The labels say whatever I make them say.`,
};

export const kyleHotspot: Hotspot = {
  id: 'kyle',
  name: 'Kyle',
  character: kyle.id,
  bounds: { x: 395, y: 150, width: 80, height: 145 },
  interactionPoint: { x: 455, y: 460 },
  verbs: {
    // DRAFT:
    look: says("Kyle, behind the till. Earbuds in, phone out. Third summer here. They haven't looked up since the lich started screaming."),
    talk: {
      label: 'Wave politely',
      responses: [{ effects: [{ type: 'startDialogue', dialogueId: 'kyle' }] }],
    },
  },
  itemUses: {
    // DRAFT:
    priceGun: [{ effects: [K("Don't.")] }],
  },
};

export const kyleDialogue: Dialogue = {
  id: 'kyle',
  start: 'hub',
  // DRAFT:
  greeting: [{ effects: [K('Mm.')] }],
  nodes: {
    hub: {
      options: [
        {
          id: 'who',
          text: "Hi! I'm Dana, the new trainee. I don't think we've met?",
          effects: [
            // DRAFT:
            K('Kyle. Gift shop.'),
            // DRAFT:
            K("Third summer. Don't learn my name, nobody does."),
          ],
          next: 'hub',
        },
        {
          id: 'whatsGoingOn',
          text: "Kyle, the lich is real and the doors won't open. What's going on?",
          effects: [
            // DRAFT:
            K('New show feature, probably. Head office never tells us anything.'),
            // DRAFT:
            K('They changed the bag charge last month. We found out from a customer.'),
          ],
          next: 'hub',
        },
        {
          id: 'buyMug',
          text: 'Can I buy an "I ESCAPED" mug?',
          once: true,
          effects: [
            // DRAFT:
            K('Lanyard.'),
            say('...Sorry?'),
            // DRAFT:
            K("You're wearing a lanyard. Staff can't buy merch. It's on the till."),
            // DRAFT:
            say("I've never wanted to be a customer so badly in my life."),
            // Slice 16 needs this: Dana has to stop being staff before Kyle will sell.
            setFlag('kyleWontSellToStaff'),
          ],
          next: 'hub',
        },
        {
          id: 'mugAgain',
          text: 'About that mug...',
          when: [{ flag: 'kyleWontSellToStaff' }],
          // DRAFT:
          effects: [K('Lanyard.')],
          next: 'hub',
        },
        {
          id: 'ghost',
          text: 'Kyle. There is a ghost by the bargain bin.',
          effects: [
            // DRAFT:
            K('Sick projection. Is that new?'),
            say("I think he's real."),
            // DRAFT:
            K('Huh. Good resolution.'),
          ],
          next: 'hub',
        },
        {
          id: 'priceGun',
          text: 'Employee Handbook, Section 14: "Staff may borrow equipment for re-pricing."',
          when: [{ flag: 'heardTeapot' }],
          once: true,
          effects: [
            // DRAFT:
            K('...'),
            // DRAFT:
            K("Re-pricing is my department. Technically."),
            // DRAFT:
            K("Bring it back. It's got my name on it."),
            { type: 'addItem', itemId: priceGun.id },
            // DRAFT:
            say("I've been issued equipment. I'd like to thank the Handbook."),
          ],
          next: 'hub',
        },
        {
          id: 'bye',
          text: "I'll let you get back to... that.",
          // DRAFT:
          effects: [K('Mm.')],
          next: 'end',
        },
      ],
    },
  },
};
