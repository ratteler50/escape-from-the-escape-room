import type { Item, Room } from '../core/types';
import { line, say, says, setFlag, walk } from './dsl';
import { kyle, kyleHotspot, priceGun } from './kyle';
import { mordecai, mordecaiBackHotspot, mordecaiHotspot } from './mordecai';
import { mug, reginaldFinaleHotspot } from './finale';

export const giftShopItems: Item[] = [priceGun, mug];

const K = (text: string) => line(kyle.id, text);
const M = (text: string) => line(mordecai.id, text);

// The painting (docs/art/prompts-gift-shop.md) sets the layout: hotspot bounds and the walkable floor
// are fitted to what's painted. Left to right along the back wall: the Lair door, the mug rack, Kyle
// behind the till, Mordecai over the bargain bin, cardboard Reginald, STAFF ONLY; the front door is
// on the right-hand wall. The floor runs edge to edge from y=450 down to y=620, rising a little to
// meet the right wall; below it is the inventory bar.
export const giftShop: Room = {
  id: 'giftShop',
  name: 'Gift Shop',
  // Generated from docs/art/gift-shop-layout.svg; bounds were then fitted to the painting.
  music: 'giftShop',
  art: {
    background: 'assets/rooms/gift-shop.webp',
    // Patches of the painting for what changes in play (docs/art/prompts-gift-shop.md, section 3).
    overlays: [
      { image: 'assets/overlays/gift-shop-staff-door-open.webp', at: { x: 860, y: 180 }, when: [{ flag: 'staffDoorOpen' }] },
      { image: 'assets/overlays/gift-shop-teapot-priceless.webp', at: { x: 562, y: 305 }, when: [{ flag: 'teapotRepriced' }] },
    ],
  },
  entries: {
    fromLair: { x: 110, y: 480 },
    fromBreakRoom: { x: 954, y: 475 },
  },
  walkable: [
    { x: 10, y: 455 },
    { x: 1095, y: 452 },
    { x: 1270, y: 480 },
    { x: 1270, y: 620 },
    { x: 10, y: 620 },
  ],
  hotspots: [
    {
      id: 'lairDoor',
      name: 'Lair Door',
      bounds: { x: 8, y: 160, width: 185, height: 280 },
      interactionPoint: { x: 110, y: 475 },
      verbs: {
        // DRAFT:
        look: says("The way back into the Lich's Lair. The sign over it says ENTER IF YOU DARE. I've dared. It's mostly cobwebs and Reginald."),
        use: {
          label: 'Go through',
          responses: [{ effects: [walk('dana', 103, 458), { type: 'goToRoom', roomId: 'lair', entry: 'fromGiftShop' }] }],
        },
      },
    },
    {
      id: 'mugRack',
      name: 'Mug Rack',
      bounds: { x: 200, y: 205, width: 128, height: 237 },
      interactionPoint: { x: 264, y: 475 },
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
      // The counter and the register at its right end.
      bounds: { x: 335, y: 272, width: 186, height: 175 },
      interactionPoint: { x: 428, y: 480 },
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
      // The bin and the teapot sitting on top of it.
      bounds: { x: 548, y: 294, width: 174, height: 151 },
      interactionPoint: { x: 635, y: 480 },
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
              walk(mordecai.id, 954, 420),
              setFlag('teapotRepriced'),
              setFlag('staffDoorOpen'),
              // DRAFT:
              say('A clunk from the other side. The STAFF ONLY door swings open.'),
              // DRAFT:
              K('Huh. Is that new?'),
              // DRAFT:
              say('I hand the price gun back to Kyle. Re-pricing is their department.'),
              // DRAFT:
              K("It's got my name on it."),
              { type: 'removeItem', itemId: 'priceGun' },
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
      bounds: { x: 729, y: 192, width: 141, height: 252 },
      interactionPoint: { x: 800, y: 480 },
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
      // The door and the badge reader on the wall at its right.
      bounds: { x: 887, y: 178, width: 165, height: 257 },
      interactionPoint: { x: 954, y: 470 },
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
      // The door and the badge reader on the wall at its right.
      bounds: { x: 887, y: 178, width: 165, height: 257 },
      interactionPoint: { x: 954, y: 470 },
      verbs: {
        // DRAFT:
        look: says('STAFF ONLY, wide open. Mordecai can\'t touch anything, so I assume he glared at the lock until it gave up. Beyond it: a corridor that smells of burnt coffee.'),
        use: {
          label: 'Go through',
          responses: [
            {
              effects: [
                walk('dana', 954, 458),
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
      // On the right-hand wall, standing open.
      bounds: { x: 1100, y: 122, width: 175, height: 345 },
      interactionPoint: { x: 1150, y: 490 },
      verbs: {
        // DRAFT:
        look: says("Wide open, with a little sign hanging on the glass that says CLOSED. That's the staff side; out in the car park it says OPEN. Handbook Section 9: never locked during business hours. It isn't. It just won't let me through."),
        use: {
          label: 'Escape!',
          // The false exit: the script only ends once a guest has bought a souvenir (the mug sale).
          responses: [
            {
              effects: [
                // DRAFT:
                say('EXIT THROUGH THE GIFT SHOP. I haven\'t bought anything. Not even a mug.'),
                // DRAFT:
                say('I step into the doorway. The doorway steps me straight back into the shop.'),
                // DRAFT:
                say("The door is open. I'm just not allowed through it. Reginald's script ends with the guest escaping through the gift shop, with a souvenir. The curse is very literal."),
              ],
            },
          ],
        },
      },
      itemUses: {
        // DRAFT:
        priceGun: [{ effects: [say('I label the front door FREE. The sign still says CLOSED. To me, specifically.')] }],
      },
    },
    reginaldFinaleHotspot,
  ],
};
