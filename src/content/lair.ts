import type { Item, Room } from '../core/types';
import { say, says } from './dsl';

export const garyArm: Item = {
  id: 'garyArm',
  name: "Gary's Arm",
  // DRAFT:
  look: "Gary's left arm. Surprisingly light. He's been skipping arm day for decades.",
};

// Layout: the back wall fills the top of the screen, the floor is a trapezoid from y=420 down to
// y=670. The strip below the floor is reserved for the inventory.
export const lair: Room = {
  id: 'lair',
  name: "The Lich's Lair",
  walkable: [
    { x: 160, y: 420 },
    { x: 1120, y: 420 },
    { x: 1245, y: 670 },
    { x: 35, y: 670 },
  ],
  hotspots: [
    {
      id: 'door',
      name: 'Door',
      bounds: { x: 1040, y: 140, width: 150, height: 280 },
      interactionPoint: { x: 1080, y: 450 },
      verbs: {
        // DRAFT:
        look: says('A heavy oak door. Well, heavy oak-effect laminate. Section 9 of the Handbook says it should never be locked during business hours. It is locked.'),
        // DRAFT:
        talk: says("Hello? Door? I'd like to speak to your manager. ... Its manager is also a door.", 'Negotiate'),
      },
    },
    {
      id: 'throne',
      name: 'Throne',
      bounds: { x: 540, y: 160, width: 200, height: 260 },
      interactionPoint: { x: 640, y: 460 },
      verbs: {
        // DRAFT:
        look: says('A towering throne of bone. The price sticker on the armrest says "SPOOKY SEAT, $49.99".'),
        // DRAFT:
        use: says(`Handbook Section 7.1: "The Spooky Seat is for liches only." I am not a lich. I'm barely a trainee.`, 'Sit (forbidden)'),
      },
    },
    {
      id: 'gary',
      name: 'Gary',
      bounds: { x: 200, y: 180, width: 90, height: 240 },
      interactionPoint: { x: 260, y: 460 },
      verbs: {
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'tookGaryArm' }], effects: [say("Gary, now with 50% fewer arms. He's taking it very well.")] },
            // DRAFT:
            { effects: [say("Gary the skeleton. His name tag says he's been Employee of the Month eleven times. I've never even been Employee of the Shift.")] },
          ],
        },
        take: {
          label: 'Borrow a limb',
          when: [{ notFlag: 'tookGaryArm' }],
          responses: [
            {
              effects: [
                // DRAFT:
                say("Sorry, Gary. I'll bring it back. Probably. Handbook Section 4.2 says nothing about skeletons."),
                { type: 'addItem', itemId: garyArm.id },
                { type: 'setFlag', flag: 'tookGaryArm' },
              ],
            },
          ],
        },
        // DRAFT:
        talk: says("Hi, Gary. ... Gary says nothing. Gary has always been a wonderful listener.", 'Make small talk'),
      },
    },
    {
      id: 'reviews',
      name: 'Customer Reviews',
      bounds: { x: 800, y: 200, width: 180, height: 130 },
      interactionPoint: { x: 890, y: 450 },
      verbs: {
        // DRAFT:
        look: says('"One star. Could not escape." "One star. Still here." "Five stars! Very immersive. Please send help." That last one is dated 2019.'),
        // DRAFT:
        use: says(`"Two stars. Staff were polite but the lich was hammy." Handbook Section 11: employees may not review their own workplace. I'll sign it "Gary".`, 'Leave a review'),
      },
    },
  ],
};
