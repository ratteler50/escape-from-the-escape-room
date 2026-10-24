import type { Dialogue, Hotspot, Item } from '../core/types';
import { K, kyle } from './cast';
import { addItem, say, says, setFlag, startDialogue } from './dsl';
import { exactChange, oneCent, payPacket } from './breakRoom';
import { mugSale, mugSaleOptions } from './finale';
import type { ContentPack } from './pack';
import { handbook } from './handbook';



export const priceGun: Item = {
  id: 'priceGun',
  name: 'Price Gun',
  icon: 'assets/icons/price-gun.webp',
  look: `Kyle's price gun. Someone has written "KYLE'S DEPARTMENT" down the handle in glitter pen. The labels say whatever I make them say.`,
};

/** Kyle won't sell to anyone in a lanyard (the dialogue says the same, kyle.ts' buyMug). */
const staffCantBuy = [K('Lanyard.'), K("Staff can't buy merch. It's on the till."), setFlag('kyleRefusedStaffSale')];

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
          setFlag('learnedRevisedSection14'),
          say("I've been issued equipment. I'd like to thank the Handbook."),
        ],
      },
      { effects: [K('Not my department.'), K("Mine's propping the stockroom door open.")] },
    ],
    priceGun: [{ effects: [K("Don't.")] }],
    // Slice 33: paying with the money works as well as asking. Too early, the matching answer.
    [exactChange.id]: [
      { when: [{ flag: 'danaOffDuty' }], effects: [say('One "I ESCAPED" mug, please. As a customer. With exact change.'), ...mugSale] },
      { effects: staffCantBuy },
    ],
    [payPacket.id]: [
      { when: [{ flag: 'danaOffDuty' }], effects: [K('Twelve ninety-nine. Exact change. Head office empties the till every hour.'), say('Twelve ninety-eight. One cent short. Of course.')] },
      { effects: staffCantBuy },
    ],
    [oneCent.id]: [{ effects: [K('One cent.'), K('Mugs are twelve ninety-nine.')] }],
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
          once: true,
          effects: [
            K('Kyle. Gift shop.'),
            K("Third summer. Don't learn my name, nobody does."),
          ],
          next: 'hub',
        },
        {
          id: 'whatsGoingOn',
          text: "Kyle, the lich in there is real. Something is very wrong tonight. What's going on?",
          once: true,
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
            // Only unlocks "About that mug...": the sale itself needs Dana off duty, with exact change.
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
          once: true,
          effects: [
            K('Sick projection. Is that new?'),
            say("I think he's real."),
            K('Huh. Good resolution.'),
          ],
          next: 'hub',
        },
        {
          // Slice 33: a nudge towards the souvenir.
          id: 'triedDoor',
          text: "Kyle, the front door won't let me out.",
          when: [{ flag: 'triedFrontDoor' }],
          once: true,
          effects: [K('Huh.'), K('Have you tried buying something?'), say('...Why would that help?'), K('Usually does.')],
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
