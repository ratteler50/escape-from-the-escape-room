import type { Combination, Item, Room } from '../core/types';
import { say, says, setFlag, walk } from './dsl';
import { reginaldOnMark, reginaldOnThrone, script } from './reginald';

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

export const riddleScroll: Item = {
  id: 'riddleScroll',
  name: 'Ancient Riddle Scroll',
  // DRAFT:
  look: 'It reads: "THE ANSWER IS: [INSERT CODE HERE BEFORE PRINTING]". Head office. Of COURSE. Then again, the curse made the whole script real. Does that include the typos?',
};

export const lairItems = [garyArm, gum, stickyArm, caseKey, script, riddleScroll];

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
  entries: {
    start: { x: 640, y: 560 },
    fromGiftShop: { x: 1060, y: 470 },
  },
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
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'doorUnlocked' }], effects: [say('Unlocked! Beyond it: the Gift Shop. I can already hear the mugs.')] },
            // DRAFT:
            { effects: [say('A heavy oak door. Well, heavy oak-effect laminate. Section 9 of the Handbook says it should never be locked during business hours. It is locked.')] },
          ],
        },
        // DRAFT:
        talk: says("Hello? Door? I'd like to speak to your manager. ... Its manager is also a door.", 'Negotiate'),
        use: {
          label: 'Go through',
          when: [{ flag: 'doorUnlocked' }],
          responses: [
            {
              when: [{ notFlag: 'visitedGiftShop' }],
              effects: [
                // DRAFT:
                say('Freedom! Or at least... retail.'),
                walk('dana', 1110, 425),
                setFlag('visitedGiftShop'),
                { type: 'goToRoom', roomId: 'giftShop', entry: 'fromLair' },
              ],
            },
            { effects: [walk('dana', 1110, 425), { type: 'goToRoom', roomId: 'giftShop', entry: 'fromLair' }] },
          ],
        },
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
        look: {
          responses: [
            // DRAFT:
            { when: [{ notFlag: 'reginaldLeftThrone' }], effects: [say("Reginald is sitting on it. Sitting is a strong word. He's lounging, dramatically.")] },
            // DRAFT:
            { effects: [say('A towering throne of bone. The estate-sale sticker on the armrest says "LOT 12: SPOOKY SEAT (BONE-EFFECT), $49.99".')] },
          ],
        },
        take: {
          label: 'Check under the cushion',
          when: [{ flag: 'reginaldLeftThrone' }, { notFlag: 'tookGum' }],
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
      // The one real prop: the source of tonight's curse (docs/design.md, Premise). Look-only until
      // the finale (slice 16), when it ends up in the Gift Shop's bargain bin.
      id: 'phylactery',
      name: 'Phylactery',
      bounds: { x: 470, y: 330, width: 60, height: 90 },
      interactionPoint: { x: 500, y: 460 },
      verbs: {
        // DRAFT:
        look: says(`A glowing skull-shaped jar on a plinth. The estate-sale sticker says "LOT 47: SPOOKY JAR (ASSORTED), $3.50". It's whispering. Props don't whisper. I'd remember that from training.`),
        // DRAFT:
        take: says("Cable-locked to the plinth. Head office's anti-theft cable: they trust the lich with it, but not the staff.", 'Pocket it'),
        // DRAFT:
        talk: says(`"...my teapot... my good teapot... two dollars..." I don't know what that means. I don't like that I don't know what that means.`, 'Listen closely'),
      },
    },
    {
      id: 'coffin',
      name: 'Coffin',
      bounds: { x: 30, y: 190, width: 110, height: 230 },
      interactionPoint: { x: 200, y: 470 },
      verbs: {
        // DRAFT:
        look: says('A coffin with a gold star on the lid. "R. VANTABLACK-THORNE: DRESSING ROOM. KNOCK."'),
        use: {
          label: 'Open',
          responses: [
            {
              when: [{ notFlag: 'tookScript' }],
              effects: [
                // DRAFT:
                say('Inside: a mirror, hairspray labelled UNDEAD HOLD, and a dog-eared script. His cue is underlined three times: "Rise, foul creature, and face me!"'),
                { type: 'addItem', itemId: script.id },
                setFlag('tookScript'),
              ],
            },
            // DRAFT:
            { when: [{ flag: 'knowsCue' }], effects: [say("His script's back where it belongs. I know the cue by heart now: \"Rise, foul creature, and face me!\"")] },
            // DRAFT:
            { effects: [say('Just the mirror and the hairspray. And a signed photo of Reginald, signed by Reginald.')] },
          ],
        },
      },
    },
    reginaldOnThrone,
    reginaldOnMark,
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
        look: says('"One star. Could not escape." "One star. Still here." "Five stars! Very immersive!" That last one\'s from Reginald\'s mum.'),
        // DRAFT:
        use: says(`"Two stars. Staff were polite but the lich was hammy." Handbook Section 11: employees may not review their own workplace. I'll sign it "Gary".`, 'Leave a review'),
      },
    },
    {
      id: 'displayCase',
      name: 'Display Case',
      bounds: { x: 750, y: 340, width: 110, height: 80 },
      interactionPoint: { x: 805, y: 460 },
      verbs: {
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'doorUnlocked' }], effects: [say("The scroll's back on its velvet. The little card says 'ANCIENT RIDDLE (REPRODUCTION)'. It has never been more wrong.")] },
            // DRAFT:
            { when: [{ flag: 'caseOpen' }], effects: [say("An empty display case. The little card says 'ANCIENT RIDDLE (REPRODUCTION)'.")] },
            // DRAFT:
            { effects: [say('An ornate display case. Inside, on velvet: an Ancient Riddle Scroll. The lock is tiny and skull-shaped.')] },
          ],
        },
        use: {
          label: 'Open',
          responses: [
            // DRAFT:
            { when: [{ flag: 'caseOpen' }], effects: [say("It's open and it's empty. Like my sense of job security.")] },
            // DRAFT:
            { effects: [say("Locked. The keyhole is shaped like a tiny skull. Head office loves a theme.")] },
          ],
        },
      },
      itemUses: {
        [caseKey.id]: [
          {
            when: [{ notFlag: 'caseOpen' }],
            effects: [
              // DRAFT:
              say("Click. The case opens. I take the Ancient Riddle Scroll and leave the key in the lock, like a responsible trainee."),
              { type: 'removeItem', itemId: caseKey.id },
              { type: 'addItem', itemId: riddleScroll.id },
              setFlag('caseOpen'),
            ],
          },
          // DRAFT:
          { effects: [say("It's already open.")] },
        ],
      },
    },
    {
      id: 'keypad',
      name: 'Keypad',
      bounds: { x: 985, y: 240, width: 50, height: 80 },
      interactionPoint: { x: 1010, y: 450 },
      verbs: {
        // DRAFT:
        look: says('Four rune buttons and a brass plate: "ENTER CODE TO ESCAPE". Below it, smaller: "NO REFUNDS".'),
        use: {
          label: 'Enter a code',
          responses: [
            // DRAFT:
            { when: [{ flag: 'doorUnlocked' }], effects: [say("Already done. C-O-D-E. I'll never forget it. I'll try.")] },
            // DRAFT:
            { effects: [say("L-I-C-H. Nothing. D-O-O-M. Nothing. G-A-R-Y. Nothing, and Gary looks hurt. I need the actual code.")] },
          ],
        },
      },
      itemUses: {
        [riddleScroll.id]: [
          {
            when: [{ notFlag: 'doorUnlocked' }],
            effects: [
              // DRAFT:
              say('"THE ANSWER IS: [INSERT CODE HERE BEFORE PRINTING]." The curse bound itself to the script as printed...'),
              // DRAFT:
              say('...so the code is literally... C. O. D. E.'),
              setFlag('doorUnlocked'),
              // DRAFT:
              say("CLUNK. The door unlocks. I've beaten head office at their own game. By reading."),
              // DRAFT:
              say('Handbook Section 3: lost property must be returned. I return the scroll to its velvet.'),
              { type: 'removeItem', itemId: riddleScroll.id },
            ],
          },
          // DRAFT:
          { effects: [say("The door's already unlocked. I'm not typing CODE again. It felt silly enough the first time.")] },
        ],
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
            { when: [{ flag: 'gotCaseKey' }], effects: [say('Gary\'s arm, gummed to the grate, waving at nobody. A pamphlet down there: "Emergency Procedures for Staff". Fire, flood, fainting guest. Nothing about liches. I checked twice.')] },
            // DRAFT:
            { effects: [say('A floor grate. Something small and shiny glints down there, just out of reach. I\'d need a longer arm. Or a spare one.')] },
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
              // DRAFT:
              say("The gum lets go of the key and grabs the grate instead. Gary's arm is staying there. I'm told that's what gum does."),
              { type: 'removeItem', itemId: stickyArm.id },
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
