import type { Dialogue, Hotspot } from '../core/types';
import { say, says, setFlag, startDialogue } from './dsl';
import { K, M, mordecai } from './cast';
import { priceGun } from './kyle';
import type { ContentPack } from './pack';
import { handbook } from './handbook';



// He hovers over the Bargain Bin until he floats off through STAFF ONLY (giftShop.ts).
export const mordecaiHotspot: Hotspot = {
  id: 'mordecai',
  name: 'Mordecai',
  character: mordecai.id,
  when: [{ notFlag: 'staffDoorOpen' }],
  bounds: { x: 581, y: 116, width: 119, height: 201 },
  interactionPoint: { x: 620, y: 480 },
  verbs: {
    look: says("A see-through old man in a dressing gown, hovering over the bargain bin and glaring at it. The Handbook's index goes straight from 'Gherkins' to 'Gift vouchers'."),
    talk: {
      label: 'Address the apparition',
      responses: [{ effects: [startDialogue('mordecai')] }],
    },
  },
  itemUses: {
    [handbook.id]: [{ effects: [M('A rule book? Child, I wrote SPELL books. Moderately powerful ones.')] }],
    priceGun: [
      {
        effects: [
          M('You would PRICE me? I am Mordecai the Moderately Powerful!'),
          M('...Out of interest. What would you have put?'),
          say("I'd rather not say."),
        ],
      },
    ],
  },
};

// Back by the bargain bin, admiring his teapot, once Dana has been through STAFF ONLY (giftShop.ts).
// He has to be here for the finale (finale.ts).
export const mordecaiBackHotspot: Hotspot = {
  id: 'mordecaiBack',
  name: 'Mordecai',
  character: mordecai.id,
  when: [{ flag: 'mordecaiByBin' }],
  bounds: { x: 581, y: 116, width: 119, height: 201 },
  interactionPoint: { x: 620, y: 480 },
  verbs: {
    look: says('Mordecai, back over the bargain bin, gazing at his PRICELESS teapot like it might propose.'),
    talk: {
      label: 'Address the apparition',
      responses: [
        {
          when: [{ flag: 'triedFrontDoor' }],
          effects: [
            M('Priceless. Say it with me, child. PRICELESS.'),
            say('Priceless. Also, the front door won\'t let me leave.'),
            M("Nor me, and I walk through walls. Read the script's ending, child. It wants something from you."),
          ],
        },
        {
          effects: [
            M('Priceless. Say it with me, child. PRICELESS.'),
            say('Priceless.'),
            M('Now go and finish whatever wretched errand keeps you here. I have admiring to do.'),
          ],
        },
      ],
    },
  },
  itemUses: {
    [handbook.id]: [{ effects: [M('Put that away. I am admiring.')] }],
    priceGun: [{ effects: [M('Not. One. More. Sticker.')] }],
  },
};

export const mordecaiDialogue: Dialogue = {
  id: 'mordecai',
  start: 'hub',
  greeting: [
    {
      effects: [
        M('BEHOLD! Mordecai the Moderately Powerful!'),
        K('Store closes at nine.'),
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
          once: true,
          effects: [
            M('A wizard, child. Retired. Then deceased. Moderately powerful in both.'),
            M('Your head office bought my entire estate. Lot by lot. Including, it seems, me.'),
          ],
          next: 'hub',
        },
        {
          id: 'whatsGoingOn',
          text: "Do you know what's going on tonight? The lich next door is real, and so, I think, are you.",
          once: true,
          effects: [
            M('My phylactery. The vessel of my very soul. Your head office bought it as a "spooky jar". Three dollars fifty.'),
            M('Tonight it woke, and it was cross, and so was I. It has bound this whole shabby place to the escape room\'s script.'),
            say('Handbook Section 1: nobody has ever beaten the escape room. It says that like it\'s a selling point.'),
          ],
          next: 'hub',
        },
        {
          id: 'teapot',
          text: 'You seem upset. Is there anything I can do?',
          once: true,
          effects: [
            M('Upset? My GOOD TEAPOT is in your bargain bin. Two dollars. Next to an eraser shaped like a smaller eraser.'),
            K('Bargain bin is final sale.'),
            M('I cannot lift so much as a sticker. I can only float through walls, which is less useful than it sounds.'),
            M('Re-price it. PROPERLY. Do that, and I shall open any door in this building for you.'),
            setFlag('heardTeapotComplaint'),
            say("Re-pricing is done with a price gun. Kyle has the price gun. There's a Handbook section about borrowing equipment. I'll have to look it up."),
          ],
          next: 'hub',
        },
        // Asked again, he points Dana at the next step: the Handbook (slice 30), then the teapot.
        {
          id: 'teapotAgain',
          text: 'About your teapot...',
          when: [{ flag: 'heardTeapotComplaint' }, { lacks: priceGun.id }],
          effects: [M('TWO. DOLLARS.'), M('The one at the till has the pricing contraption. That little book of yours must say how to borrow it.')],
          next: 'hub',
        },
        {
          id: 'teapotAgainArmed',
          text: 'About your teapot...',
          when: [{ flag: 'heardTeapotComplaint' }, { has: priceGun.id }],
          effects: [M('You HAVE the contraption. Point it at the TEAPOT.')],
          next: 'hub',
        },
        {
          // Slice 33: a nudge towards the script's ending. A hint, so it repeats (chat is one-off, hints aren't).
          id: 'triedDoor',
          text: "The front door won't let me leave.",
          when: [{ flag: 'triedFrontDoor' }],
          effects: [M('Nor me, child, and I can walk through WALLS. This curse follows the script to the letter.'), M("Read its ending. I'd wager it wants something from you.")],
          next: 'hub',
        },
        {
          id: 'bye',
          text: "I'll leave you to your... haunting.",
          effects: [M('Mind the merchandise on your way out. Most of it is mine.')],
          next: 'end',
        },
      ],
    },
  },
};

export const mordecaiPack: ContentPack = { dialogues: [mordecaiDialogue] };
