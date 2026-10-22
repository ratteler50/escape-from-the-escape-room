import type { Character, Dialogue, Hotspot } from '../core/types';
import { line, say, says, setFlag } from './dsl';
import { kyle } from './kyle';

export const mordecai: Character = { id: 'mordecai', name: 'Mordecai', color: '#a8e0f7', floats: true };

const M = (text: string) => line(mordecai.id, text);
const K = (text: string) => line(kyle.id, text);

// He hovers over the Bargain Bin until he floats off through STAFF ONLY (giftShop.ts).
export const mordecaiHotspot: Hotspot = {
  id: 'mordecai',
  name: 'Mordecai',
  character: mordecai.id,
  when: [{ notFlag: 'staffDoorOpen' }],
  bounds: { x: 575, y: 120, width: 80, height: 180 },
  interactionPoint: { x: 600, y: 460 },
  verbs: {
    // DRAFT:
    look: says("A see-through old man in a dressing gown, hovering over the bargain bin and glaring at it. Not in the Handbook. I checked twice."),
    talk: {
      label: 'Address the apparition',
      responses: [{ effects: [{ type: 'startDialogue', dialogueId: 'mordecai' }] }],
    },
  },
  itemUses: {
    priceGun: [
      {
        effects: [
          // DRAFT:
          M('You would PRICE me? I am Mordecai the Moderately Powerful!'),
          // DRAFT:
          M('...Out of interest. What would you have put?'),
          // DRAFT:
          say("I'd rather not say."),
        ],
      },
    ],
  },
};

export const mordecaiDialogue: Dialogue = {
  id: 'mordecai',
  start: 'hub',
  greeting: [
    {
      effects: [
        // DRAFT:
        M('BEHOLD! Mordecai the Moderately Powerful!'),
        // DRAFT:
        K('Store closes at nine.'),
        // DRAFT:
        M('I was BEHOLDING.'),
      ],
    },
  ],
  nodes: {
    hub: {
      options: [
        {
          id: 'who',
          text: 'Hello! Sorry. Who are you, sir?',
          effects: [
            // DRAFT:
            M('A wizard, child. Retired. Then deceased. Moderately powerful in both.'),
            // DRAFT:
            M('Your head office bought my entire estate. Lot by lot. Including, it seems, me.'),
          ],
          next: 'hub',
        },
        {
          id: 'whatsGoingOn',
          text: 'Do you know why none of the doors will open?',
          effects: [
            // DRAFT:
            M('My phylactery. The vessel of my very soul. Your head office sold it as a "spooky jar". Three dollars fifty.'),
            // DRAFT:
            M('Tonight it woke, and it was cross, and so was I. It has bound this whole shabby place to the escape room\'s script.'),
            // DRAFT:
            say('Handbook Section 2: nobody has ever beaten the escape room. It says that like it\'s a selling point.'),
          ],
          next: 'hub',
        },
        {
          id: 'teapot',
          text: 'You seem upset. Is there anything I can do?',
          once: true,
          effects: [
            // DRAFT:
            M('Upset? My GOOD TEAPOT is in your bargain bin. Two dollars. Next to an eraser shaped like a smaller eraser.'),
            // DRAFT:
            K('Bargain bin is final sale.'),
            // DRAFT:
            M('I cannot lift so much as a sticker. I can only float through walls, which is less useful than it sounds.'),
            // DRAFT:
            M('Re-price it. PROPERLY. Do that, and I shall open any door in this building for you.'),
            setFlag('heardTeapot'),
            // DRAFT:
            say("Re-pricing is done with a price gun. Kyle has the price gun. I'll need a Handbook section."),
          ],
          next: 'hub',
        },
        {
          id: 'teapotAgain',
          text: 'About your teapot...',
          when: [{ flag: 'heardTeapot' }],
          // DRAFT:
          effects: [M('TWO. DOLLARS.')],
          next: 'hub',
        },
        {
          id: 'bye',
          text: "I'll leave you to your... haunting.",
          // DRAFT:
          effects: [M('Mind the merchandise on your way out. Most of it is mine.')],
          next: 'end',
        },
      ],
    },
  },
};
