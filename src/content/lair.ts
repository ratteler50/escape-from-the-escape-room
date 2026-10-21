import type { Combination, Item, Room } from '../core/types';
import { say, says } from './dsl';

export const garyArm: Item = {
  id: 'garyArm',
  name: "Gary's Arm",
  // DRAFT:
  look: "Gary's left arm. Surprisingly light. He's been skipping arm day for decades.",
};

export const gum: Item = {
  id: 'gum',
  name: 'Pre-Owned Gum',
  // DRAFT:
  look: 'A wad of gum from under the Spooky Seat. Still tacky. In both senses.',
};

export const stickyArm: Item = {
  id: 'stickyArm',
  name: 'Sticky Arm',
  // DRAFT:
  look: "Gary's arm, now with a gum fingertip. I've invented a tool. Or a crime.",
};

export const caseKey: Item = {
  id: 'caseKey',
  name: 'Display Case Key',
  // DRAFT:
  look: 'A tiny key on a skull keyring. The keyring says DISPLAY CASE. Head office labels everything except the puzzles.',
};

export const lairItems = [garyArm, gum, stickyArm, caseKey];

export const lairCombinations: Combination[] = [
  {
    items: [garyArm.id, gum.id],
    responses: [
      {
        effects: [
          // DRAFT:
          say("I press the gum onto Gary's fingertip. It's disgusting. It's perfect."),
          { type: 'removeItem', itemId: garyArm.id },
          { type: 'removeItem', itemId: gum.id },
          { type: 'addItem', itemId: stickyArm.id },
        ],
      },
    ],
  },
];

// Layout: the back wall fills the top of the screen, the floor is a trapezoid from y=420 down to
// y=620. Below the floor is the inventory bar.
export const lair: Room = {
  id: 'lair',
  name: "The Lich's Lair",
  walkable: [
    { x: 160, y: 420 },
    { x: 1120, y: 420 },
    { x: 1220, y: 620 },
    { x: 60, y: 620 },
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
      itemUses: {
        // DRAFT:
        [caseKey.id]: [{ effects: [say("Wrong key. It's for the display case. It literally says so on it.")] }],
      },
      // DRAFT:
      itemFallback: 'The door remains locked. It is unmoved by my offerings.',
    },
    {
      id: 'throne',
      name: 'Throne',
      bounds: { x: 540, y: 160, width: 200, height: 260 },
      interactionPoint: { x: 640, y: 460 },
      verbs: {
        // DRAFT:
        look: says('A towering throne of bone. The price sticker on the armrest says "SPOOKY SEAT, $49.99".'),
        // TEMPORARY (slice 3): ungated. Slice 4 gates this behind Reginald leaving the throne.
        take: {
          label: 'Check under the cushion',
          when: [{ notFlag: 'tookGum' }],
          responses: [
            {
              effects: [
                // DRAFT:
                say('Under the cushion: one wad of pre-owned gum. Handbook Section 3: "Lost property must be logged." Consider it logged.'),
                { type: 'addItem', itemId: gum.id },
                { type: 'setFlag', flag: 'tookGum' },
              ],
            },
          ],
        },
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
      itemUses: {
        // DRAFT:
        [garyArm.id]: [{ effects: [say("I offer Gary his arm back. He doesn't want it. He's moved on.")] }],
        // DRAFT:
        [stickyArm.id]: [{ effects: [say("I am NOT giving it back to him like this.")] }],
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
    {
      id: 'grate',
      name: 'Floor Grate',
      bounds: { x: 380, y: 530, width: 130, height: 50 },
      interactionPoint: { x: 445, y: 515 },
      verbs: {
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'gotCaseKey' }], effects: [say('Just a grate now. A pamphlet down there says "So You\'ve Been Cursed: A Guide for Staff".')] },
            // DRAFT:
            { effects: [say('A floor grate. Something small and shiny glints down there, just out of reach. Of course.')] },
          ],
        },
      },
      itemUses: {
        [stickyArm.id]: [
          {
            when: [{ notFlag: 'gotCaseKey' }],
            effects: [
              // DRAFT:
              say('I lower the Sticky Arm through the bars... gently... got it! A key. Gary would be proud. Gary is never proud.'),
              { type: 'addItem', itemId: caseKey.id },
              { type: 'setFlag', flag: 'gotCaseKey' },
            ],
          },
          // DRAFT:
          { effects: [say("There's nothing else down there worth getting gum on.")] },
        ],
        // DRAFT:
        [garyArm.id]: [{ effects: [say("Gary's fingers brush the key, but it won't stay put. If only they were... stickier.")] }],
      },
      // DRAFT:
      itemFallback: "That won't fit through the grate. Most things won't. That's rather the point of a grate.",
    },
  ],
};
