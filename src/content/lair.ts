import type { Room } from '../core/types';

// Layout: the back wall fills the top of the screen, the floor is a trapezoid from y=420 down.
export const lair: Room = {
  id: 'lair',
  name: "The Lich's Lair",
  walkable: [
    { x: 160, y: 420 },
    { x: 1120, y: 420 },
    { x: 1260, y: 700 },
    { x: 20, y: 700 },
  ],
  hotspots: [
    {
      id: 'door',
      name: 'Door',
      bounds: { x: 1040, y: 140, width: 150, height: 280 },
      interactionPoint: { x: 1080, y: 450 },
      // DRAFT:
      look: 'A heavy oak door. Well, heavy oak-effect laminate. Section 9 of the Handbook says it should never be locked during business hours. It is locked.',
    },
    {
      id: 'throne',
      name: 'Throne',
      bounds: { x: 540, y: 160, width: 200, height: 260 },
      interactionPoint: { x: 640, y: 460 },
      // DRAFT:
      look: 'A towering throne of bone. The price sticker on the armrest says "SPOOKY SEAT, $49.99".',
    },
    {
      id: 'gary',
      name: 'Gary',
      bounds: { x: 200, y: 180, width: 90, height: 240 },
      interactionPoint: { x: 260, y: 460 },
      // DRAFT:
      look: "Gary the skeleton. His name tag says he's been Employee of the Month eleven times. I've never even been Employee of the Shift.",
    },
    {
      id: 'reviews',
      name: 'Customer Reviews',
      bounds: { x: 800, y: 200, width: 180, height: 130 },
      interactionPoint: { x: 890, y: 450 },
      // DRAFT:
      look: '"One star. Could not escape." "One star. Still here." "Five stars! Very immersive. Please send help." That last one is dated 2019.',
    },
  ],
};
