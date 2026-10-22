import type { Item, Room } from '../core/types';
import { line, say, says, setFlag, walk } from './dsl';
import { kyle, kyleHotspot, priceGun } from './kyle';
import { mordecai, mordecaiBackHotspot, mordecaiHotspot } from './mordecai';
import { mug, reginaldFinaleHotspot } from './finale';

export const giftShopItems: Item[] = [priceGun, mug];

const K = (text: string) => line(kyle.id, text);
const M = (text: string) => line(mordecai.id, text);

// Layout (docs/art/gift-shop-layout.svg): the back wall fills the top of the screen, the floor is a
// trapezoid from y=420 down to y=620. Left to right: the Lair door, the mug rack, Kyle behind the
// till, Mordecai over the bargain bin, cardboard Reginald, STAFF ONLY, the front door.
export const giftShop: Room = {
  id: 'giftShop',
  name: 'Gift Shop',
  entries: {
    fromLair: { x: 200, y: 470 },
    fromBreakRoom: { x: 930, y: 470 },
  },
  walkable: [
    { x: 160, y: 420 },
    { x: 1120, y: 420 },
    { x: 1220, y: 620 },
    { x: 60, y: 620 },
  ],
  hotspots: [
    {
      id: 'lairDoor',
      name: 'Lair Door',
      bounds: { x: 40, y: 140, width: 140, height: 280 },
      interactionPoint: { x: 200, y: 460 },
      verbs: {
        // DRAFT:
        look: says('The door back to the Lair. The sign over it says EXIT THROUGH THE GIFT SHOP. I did it backwards.'),
        use: {
          label: 'Go through',
          responses: [{ effects: [walk('dana', 175, 425), { type: 'goToRoom', roomId: 'lair', entry: 'fromGiftShop' }] }],
        },
      },
    },
    {
      id: 'mugRack',
      name: 'Mug Rack',
      bounds: { x: 205, y: 190, width: 120, height: 190 },
      interactionPoint: { x: 265, y: 460 },
      verbs: {
        // DRAFT:
        look: says(`Mugs: "I ESCAPED THE LICH'S LAIR", $12.99. Nobody has ever escaped, so nobody has ever bought one. Kyle dusts them anyway.`),
      },
      itemUses: {
        // DRAFT:
        priceGun: [{ effects: [say("I could mark a mug down to a cent. Handbook Section 14.1: no re-pricing for personal gain. I hate that I know that.")] }],
      },
    },
    {
      id: 'till',
      name: 'Till',
      bounds: { x: 365, y: 300, width: 140, height: 120 },
      interactionPoint: { x: 435, y: 460 },
      verbs: {
        // DRAFT:
        look: says("Kyle's till. The receipt roll is printed to look like a scroll. Head office really committed to the theme."),
        // DRAFT:
        use: { label: 'Ring something up', responses: [{ effects: [K("That's my department.")] }] },
      },
      itemUses: {
        // DRAFT:
        priceGun: [{ effects: [K("Don't.")] }],
      },
    },
    kyleHotspot,
    {
      id: 'bargainBin',
      name: 'Bargain Bin',
      bounds: { x: 545, y: 330, width: 140, height: 90 },
      interactionPoint: { x: 615, y: 460 },
      verbs: {
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'teapotRepriced' }], effects: [say('The teapot\'s sticker now says PRICELESS. The rest of the bin looks jealous.')] },
            // DRAFT:
            { effects: [say('The bargain bin: three lich snow globes, an eraser shaped like a smaller eraser, and a rather nice teapot. $2.')] },
          ],
        },
        // DRAFT:
        take: says('Bargain bin stock is final sale, and I am staff. Two rules, one teapot.', 'Rummage'),
      },
      itemUses: {
        priceGun: [
          {
            when: [{ flag: 'teapotRepriced' }],
            // DRAFT:
            effects: [say("It's already priceless. You can't go higher than priceless. I asked the Handbook.")],
          },
          {
            effects: [
              // DRAFT:
              say('Ka-chunk. One new sticker: PRICELESS.'),
              // DRAFT:
              M('Priceless. PRICELESS! At last, someone in this establishment with taste.'),
              // DRAFT:
              K("We can't sell that now."),
              // DRAFT:
              M('GOOD. And a deal is a deal, child. Watch this.'),
              // Through the STAFF ONLY door: his feet at the bottom of the doorway.
              walk(mordecai.id, 930, 400),
              setFlag('teapotRepriced'),
              setFlag('staffDoorOpen'),
              // DRAFT:
              say('A clunk from the other side. The STAFF ONLY door swings open.'),
              // DRAFT:
              K('Huh. Is that new?'),
            ],
          },
        ],
      },
    },
    mordecaiHotspot,
    mordecaiBackHotspot,
    {
      id: 'standee',
      name: 'Cardboard Reginald',
      bounds: { x: 725, y: 180, width: 70, height: 240 },
      interactionPoint: { x: 760, y: 460 },
      verbs: {
        // DRAFT:
        look: says('A life-size cardboard Reginald. Somehow less wooden than the real one.'),
      },
      itemUses: {
        // DRAFT:
        priceGun: [{ effects: [say("Cardboard Reginald, $1. No. He'd find out. He'd be devastated.")] }],
      },
    },
    {
      id: 'staffDoor',
      name: 'STAFF ONLY',
      when: [{ notFlag: 'staffDoorOpen' }],
      bounds: { x: 870, y: 150, width: 120, height: 270 },
      interactionPoint: { x: 930, y: 455 },
      verbs: {
        // DRAFT:
        look: says('STAFF ONLY. A badge reader with a little red light, and a sign: TRAINEES, PLEASE ASK A SUPERVISOR. There is no supervisor.'),
        use: {
          label: 'Badge in',
          // DRAFT:
          responses: [{ effects: [say('I hold up my trainee badge. The reader blinks red. It knows.')] }],
        },
      },
      itemUses: {
        // DRAFT:
        priceGun: [{ effects: [say('I label the door $4.99. Still locked, but now it\'s affordable.')] }],
      },
      // DRAFT:
      itemFallback: "The badge reader blinks red. It only wants a proper staff badge, and that wasn't one.",
    },
    {
      id: 'staffDoorOpen',
      name: 'STAFF ONLY',
      when: [{ flag: 'staffDoorOpen' }],
      bounds: { x: 870, y: 150, width: 120, height: 270 },
      interactionPoint: { x: 930, y: 455 },
      verbs: {
        // DRAFT:
        look: says('STAFF ONLY, wide open. Mordecai unlocked it from the other side. Beyond it: a corridor that smells of burnt coffee.'),
        use: {
          label: 'Go through',
          responses: [
            {
              effects: [
                walk('dana', 930, 425),
                { type: 'goToRoom', roomId: 'breakRoom', entry: 'fromGiftShop' },
                // Set after leaving, so Mordecai doesn't pop back to the bin mid-cutscene
                // (setFlag redraws hotspots from the final state).
                setFlag('mordecaiBack'),
              ],
            },
          ],
        },
      },
    },
    {
      id: 'frontDoor',
      name: 'Front Door',
      bounds: { x: 1040, y: 140, width: 150, height: 280 },
      interactionPoint: { x: 1080, y: 450 },
      verbs: {
        // DRAFT:
        look: says('"CLOSED FOR REFURBISHMENT." The refurbishment is listed as "ongoing since 2019". The door is ajar anyway.'),
        use: {
          label: 'Escape!',
          // The false exit: the script only ends once a guest has bought a souvenir (the mug sale).
          responses: [
            {
              effects: [
                // DRAFT:
                say('EXIT THROUGH THE GIFT SHOP. I haven\'t bought anything.'),
                // DRAFT:
                say('I push. The door pushes back. The curse is very literal.'),
              ],
            },
          ],
        },
      },
      itemUses: {
        // DRAFT:
        priceGun: [{ effects: [say("I label the front door FREE. It's still closed for refurbishment.")] }],
      },
    },
    reginaldFinaleHotspot,
  ],
};
