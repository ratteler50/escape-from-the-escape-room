import type { Room } from '../core/types';
import { say, says, walk } from './dsl';

// STUB (M2): proves room transitions. M3 replaces this with the real Gift Shop and its puzzles.
export const giftShop: Room = {
  id: 'giftShop',
  name: 'Gift Shop',
  entries: {
    fromLair: { x: 200, y: 470 },
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
      bounds: { x: 290, y: 190, width: 190, height: 190 },
      interactionPoint: { x: 385, y: 460 },
      verbs: {
        // DRAFT:
        look: says(`Mugs: "I ESCAPED THE LICH'S LAIR", $12.99. Nobody has ever been eligible to buy one. Until today.`),
      },
    },
    {
      id: 'till',
      name: 'Till',
      bounds: { x: 560, y: 290, width: 150, height: 130 },
      interactionPoint: { x: 635, y: 460 },
      verbs: {
        // DRAFT:
        look: says('The till. The receipt roll is a scroll. Head office really committed to the theme.'),
      },
    },
    {
      id: 'standee',
      name: 'Cardboard Reginald',
      bounds: { x: 790, y: 180, width: 80, height: 240 },
      interactionPoint: { x: 830, y: 460 },
      verbs: {
        // DRAFT:
        look: says("A life-size cardboard Reginald. Somehow less wooden than the real one."),
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
          responses: [
            {
              effects: [
                // DRAFT:
                say("Handbook Section 1, Rule 1: always let the customers win. Today, I'm the customer."),
                walk('dana', 1110, 425),
                { type: 'win' },
              ],
            },
          ],
        },
      },
    },
  ],
};
