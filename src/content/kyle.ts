import type { Dialogue, Hotspot, Item } from '../core/types';
import { K, kyle } from './cast';
import { addItem, say, says, setFlag, startDialogue } from './dsl';
import { mugSaleOptions } from './finale';
import type { ContentPack } from './pack';
import { handbook } from './handbook';



export const priceGun: Item = {
  id: 'priceGun',
  name: 'Price Gun',
  icon: 'assets/icons/price-gun.webp',
  look: `Kyle's price gun. Someone has written "KYLE'S DEPARTMENT" down the handle in glitter pen. The labels say whatever I make them say.`,
};

export const kyleHotspot: Hotspot = {
  id: 'kyle',
  name: 'Kyle',
  character: kyle.id,
  bounds: { x: 348, y: 219, width: 105, height: 115 },
  interactionPoint: { x: 440, y: 480 },
  verbs: {
    look: says("Kyle, according to the name tag. Behind the till, earbuds in, phone out. They haven't looked up since the lich started screaming."),
    talk: {
      label: 'Wave politely',
      responses: [{ effects: [startDialogue('kyle')] }],
    },
  },
  itemUses: {
    // Slice 30: once Mordecai wants his teapot re-priced, the Handbook is how Dana borrows the Price
    // Gun: the revised Section 14, stapled over the one they memorised.
    [handbook.id]: [
      { when: [{ has: priceGun.id }], effects: [K("You've already got it. It's got my name on it.")] },
      { when: [{ flag: 'teapotRepriced' }], effects: [K('Not my department.')] },
      {
        when: [{ flag: 'heardTeapotComplaint' }],
        effects: [
          say('Section 14: no borrowing equipment from other departments. Everyone knows that.'),
          say(`But there's an insert stapled over it: REVISED. "Staff may borrow equipment for re-pricing." I haven't learned the new one yet!`),
          K('...'),
          K('Re-pricing is my department. Technically.'),
          K("Bring it back. It's got my name on it."),
          addItem(priceGun.id),
          say("I've been issued equipment. I'd like to thank the Handbook."),
        ],
      },
      { effects: [K('Not my department.'), K("Mine's propping the stockroom door open.")] },
    ],
    priceGun: [{ effects: [K("Don't.")] }],
  },
};

export const kyleDialogue: Dialogue = {
  id: 'kyle',
  start: 'hub',
  greeting: [{ effects: [K('Mm.')] }],
  nodes: {
    hub: {
      options: [
        {
          id: 'who',
          text: "Hi! I'm Dana, the new trainee. I don't think we've met?",
          effects: [
            K('Kyle. Gift shop.'),
            K("Third summer. Don't learn my name, nobody does."),
          ],
          next: 'hub',
        },
        {
          id: 'whatsGoingOn',
          text: "Kyle, the lich in there is real. Something is very wrong tonight. What's going on?",
          effects: [
            K('New show feature, probably. Head office never tells us anything.'),
            K('They changed the bag charge last month. We found out from a customer.'),
          ],
          next: 'hub',
        },
        {
          id: 'buyMug',
          text: 'Can I buy an "I ESCAPED" mug?',
          when: [{ notFlag: 'danaOffDuty' }],
          once: true,
          effects: [
            K('Lanyard.'),
            say('...Sorry?'),
            K("You're wearing a lanyard. Staff can't buy merch. It's on the till."),
            say("I've never wanted to be a customer so badly in my life."),
            // Slice 16 needs this: Dana has to stop being staff before Kyle will sell.
            setFlag('kyleRefusedStaffSale'),
          ],
          next: 'hub',
        },
        {
          id: 'mugAgain',
          text: 'About that mug...',
          when: [{ flag: 'kyleRefusedStaffSale' }, { notFlag: 'danaOffDuty' }],
          effects: [K('Lanyard.')],
          next: 'hub',
        },
        ...mugSaleOptions,
        {
          id: 'ghost',
          text: 'Kyle. There is a ghost by the bargain bin.',
          effects: [
            K('Sick projection. Is that new?'),
            say("I think he's real."),
            K('Huh. Good resolution.'),
          ],
          next: 'hub',
        },
        {
          id: 'bye',
          text: "I'll let you get back to... that.",
          effects: [K('Mm.')],
          next: 'end',
        },
      ],
    },
  },
};

export const kylePack: ContentPack = {
  items: [priceGun],
  dialogues: [kyleDialogue],
  combinations: [{ items: [handbook.id, priceGun.id], responses: [{ effects: [say('I could price the Handbook. Section 14.1: no re-pricing for personal gain. The Handbook polices itself.')] }] }],
};
