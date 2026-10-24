import type { Combination, Effect, Item, Room } from '../core/types';
import { addItem, clearFlag, goTo, removeItem, say, says, setFlag, sound, walk } from './dsl';
import { R } from './cast';
import { reginaldOnMark, reginaldOnThrone, script } from './reginald';
import type { ContentPack } from './pack';
import { handbook } from './handbook';

export const garyArm: Item = {
  id: 'garyArm',
  name: "Gary's Arm",
  icon: 'assets/icons/gary-arm.webp',
  look: "Gary's left arm. Surprisingly light. He's been skipping arm day for decades.",
};

export const gum: Item = {
  id: 'gum',
  name: 'Pre-Owned Gum',
  icon: 'assets/icons/gum.webp',
  look: 'A wad of gum from under the Spooky Seat. Still tacky. In both senses.',
};

export const stickyArm: Item = {
  id: 'stickyArm',
  name: 'Sticky Arm',
  icon: 'assets/icons/sticky-arm.webp',
  look: "Gary's arm, now with a gum fingertip. I've invented a tool. Or a crime.",
};

export const caseKey: Item = {
  id: 'caseKey',
  name: 'Display Case Key',
  icon: 'assets/icons/case-key.webp',
  look: 'A tiny key on a skull keyring. The keyring says DISPLAY CASE. Head office labels everything except the puzzles.',
};

export const riddleScroll: Item = {
  id: 'riddleScroll',
  name: 'Ancient Riddle Scroll',
  icon: 'assets/icons/riddle-scroll.webp',
  // Slice 33: reading it is what lets the keypad's own verb enter the code.
  look: [
    {
      effects: [
        say('It reads: "THE ANSWER IS: {CODE}". Head office used a template and never filled in the blank. Of COURSE. But the curse made the script real exactly as printed. Blanks and all?'),
        setFlag('readScroll'),
      ],
    },
  ],
};

/** The scroll's code entered on the keypad: by using the scroll on it, or Enter a code while holding it. */
const enterTheCode: Effect[] = [
  say('"THE ANSWER IS: {CODE}." The curly brackets just mark the blank that nobody filled in. What\'s printed in the blank is the word CODE.'),
  say('The curse bound the script exactly as printed. So the answer isn\'t a code. It\'s the word CODE. C. O. D. E. ENTER.'),
  sound('keypad'),
  setFlag('lairDoorUnlocked'),
  sound('unlock'),
  say("CLUNK. The door unlocks. I've beaten head office at their own game. By reading."),
  say('Handbook Section 3: lost property must be returned. I tuck the scroll back under its bone.'),
  removeItem(riddleScroll.id),
];

const combinations: Combination[] = [
  {
    items: [garyArm.id, gum.id],
    responses: [
      {
        effects: [
          sound('squelch'),
          say("I press the gum onto Gary's fingertip. It's disgusting. It's perfect."),
          removeItem(garyArm.id),
          removeItem(gum.id),
          addItem(stickyArm.id),
        ],
      },
    ],
  },
];

// The painting (docs/art/lair.md) sets the layout: hotspot bounds and the walkable floor are fitted
// to what's painted. The floor runs edge to edge from y=445 down to y=620; below it is the inventory bar.
export const lair: Room = {
  id: 'lair',
  name: "The Lich's Lair",
  // Generated from docs/art/lair-layout.svg; bounds were then nudged to match the painting.
  music: 'lair',
  art: {
    background: 'assets/rooms/lair.webp',
    // Patches of the painting for what changes in play (docs/art/prompts-overlays.md).
    overlays: [
      // The gold star on Reginald's coffin (slice 33): drawn by the agent, always shown.
      { image: 'assets/overlays/lair-coffin-star.webp', at: { x: 64, y: 252 } },
      // The coffin open (docs/art/prompts-coffin.md), and the script on its shelf while it's there.
      { image: 'assets/overlays/lair-coffin-open.webp', at: { x: 10, y: 161 }, when: [{ flag: 'coffinOpen' }] },
      { image: 'assets/overlays/lair-coffin-script.webp', at: { x: 42, y: 329 }, when: [{ flag: 'coffinOpen' }, { lacks: 'script' }] },
      { image: 'assets/overlays/lair-gary-armless.webp', at: { x: 235, y: 211 }, when: [{ flag: 'tookGaryArm' }] },
      { image: 'assets/overlays/lair-grate-arm.webp', at: { x: 318, y: 507 }, when: [{ flag: 'gotCaseKey' }] },
      { image: 'assets/overlays/lair-case-open.webp', at: { x: 750, y: 243 }, when: [{ flag: 'caseOpen' }] },
      // One scroll patch, listed twice: while the case is closed, and once Dana puts it back.
      // After the lid so it draws on top.
      { image: 'assets/overlays/lair-case-scroll.webp', at: { x: 797, y: 318 }, when: [{ notFlag: 'caseOpen' }] },
      { image: 'assets/overlays/lair-case-scroll.webp', at: { x: 797, y: 318 }, when: [{ flag: 'lairDoorUnlocked' }] },
    ],
  },
  entries: {
    start: { x: 640, y: 560 },
    fromGiftShop: { x: 1060, y: 470 },
  },
  walkable: [
    { x: 60, y: 445 },
    { x: 1235, y: 445 },
    { x: 1270, y: 620 },
    { x: 10, y: 620 },
  ],
  hotspots: [
    {
      id: 'door',
      name: 'Door',
      bounds: { x: 1075, y: 112, width: 158, height: 330 },
      interactionPoint: { x: 1150, y: 462 },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'lairDoorUnlocked' }], effects: [say('Unlocked! Beyond it: the Gift Shop. I can already hear the mugs.')] },
            { effects: [say(`A heavy oak door. Well, heavy oak-effect laminate. Handbook Section 9: "Doors must never be locked during business hours." It is locked. I'll be writing this up.`)] },
          ],
        },
        talk: says("Hello? Door? I'd like to speak to your manager. ... Its manager is also a door.", 'Negotiate'),
        use: {
          label: 'Go through',
          when: [{ flag: 'lairDoorUnlocked' }],
          responses: [
            {
              when: [{ notFlag: 'visitedGiftShop' }],
              effects: [
                say('Freedom! Or at least... retail.'),
                walk('dana', 1110, 425),
                setFlag('visitedGiftShop'),
                goTo('giftShop', 'fromLair'),
              ],
            },
            { effects: [walk('dana', 1110, 425), goTo('giftShop', 'fromLair')] },
          ],
        },
      },
      itemUses: {
        [handbook.id]: [{ when: [{ flag: 'lairDoorUnlocked' }], effects: [say("It's unlocked now, as Section 9 intended. The Handbook and I have been vindicated.")] }, { effects: [say('I hold the Handbook up to the door, open at Section 9: "Doors must never be locked during business hours." The door does not read.')] }],
        [caseKey.id]: [{ effects: [say("Wrong key. It's for the display case. It literally says so on it.")] }],
      },
      itemFallback: 'The door remains locked. It is unmoved by my offerings.',
    },
    {
      id: 'throne',
      name: 'Throne',
      bounds: { x: 515, y: 80, width: 222, height: 360 },
      interactionPoint: { x: 626, y: 465 },
      itemUses: {
        [handbook.id]: [{ effects: [say('Section 7.1: "The Spooky Seat is for liches only." I show the page to the throne. The throne already knew.')] }],
      },
      verbs: {
        look: {
          responses: [
            {
              when: [{ notFlag: 'reginaldLeftThrone' }],
              effects: [
                say("Reginald is sitting on it. Sitting is a strong word. He's lounging, dramatically. And under the armrest, right by his elbow: a wad of bright pink gum."),
                setFlag('sawGum'),
              ],
            },
            { when: [{ flag: 'tookGum' }], effects: [say('A towering throne of bone. The estate-sale sticker on the armrest says "LOT 12: SPOOKY SEAT (BONE-EFFECT), $49.99".')] },
            {
              effects: [
                say('A towering throne of bone, unguarded at last. "LOT 12: SPOOKY SEAT (BONE-EFFECT), $49.99." And under the armrest: a wad of bright pink gum.'),
                setFlag('sawGum'),
              ],
            },
          ],
        },
        take: {
          label: 'Take the gum',
          when: [{ flag: 'sawGum' }, { notFlag: 'tookGum' }],
          responses: [
            {
              when: [{ notFlag: 'reginaldLeftThrone' }],
              effects: [R('Hands off the Spooky Seat, darling! Nobody touches the throne mid-performance.'), say("I'll need him off that throne first.")],
            },
            {
              effects: [
                say(`I peel the gum off the armrest, like from under a school desk. Handbook Section 3: "Lost property must be returned and logged." Logged. I'll return it when I find out whose it is.`),
                addItem(gum.id),
                setFlag('tookGum'),
              ],
            },
          ],
        },
        use: says(`Handbook Section 7.1: "The Spooky Seat is for liches only." I am not a lich. I'm barely a trainee.`, 'Sit (forbidden)'),
      },
    },
    {
      // The one real prop: the source of tonight's curse (docs/design.md, Premise). Look-only until
      // the finale (slice 16), when it ends up in the Gift Shop's bargain bin.
      id: 'phylactery',
      name: 'Phylactery',
      bounds: { x: 428, y: 276, width: 58, height: 146 },
      interactionPoint: { x: 470, y: 472 },
      itemUses: {
        [handbook.id]: [{ effects: [say('I read it Section 3, on lost property. It whispers back about a teapot. We are not having the same conversation.')] }],
      },
      verbs: {
        look: says(`A glowing skull-shaped jar on a plinth. The estate-sale sticker says "LOT 47: SPOOKY JAR (ASSORTED), $3.50". It's whispering. Props don't whisper. I'd remember that from training.`),
        take: says("Cable-locked to the plinth. Head office's anti-theft cable: they trust the lich with it, but not the staff.", 'Pocket it'),
        talk: says(`"...my teapot... my good teapot... two dollars..." I don't know what that means. I don't like that I don't know what that means.`, 'Listen closely'),
      },
    },
    {
      // Reginald's dressing room (slice 33: it opens, closes and takes a knock). Knocking first is
      // only good manners: opening knocks for Dana if they haven't.
      id: 'coffin',
      name: 'Coffin',
      bounds: { x: 10, y: 175, width: 128, height: 262 },
      interactionPoint: { x: 200, y: 470 },
      itemUses: {
        [handbook.id]: [{ effects: [say("I could leave the Handbook in his dressing room as a gift. He'd think it was a script. He'd give it notes.")] }],
      },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'coffinOpen' }, { lacks: script.id }], effects: [say(`His dressing room: a mirror ringed with bulbs, a headshot of Reginald signed by Reginald, a can of UNDEAD HOLD hairspray, and his script on its little shelf.`)] },
            { when: [{ flag: 'coffinOpen' }], effects: [say(`His dressing room: a mirror ringed with bulbs, a headshot of Reginald signed by Reginald, a can of UNDEAD HOLD hairspray, and an empty shelf where the script lives.`)] },
            { effects: [say(`Reginald's coffin, stood on end like a door. Someone has screwed a brass knocker onto it. Someone. A gold star on the lid: R. VANTABLACK-THORNE, DRESSING ROOM. The estate-sale sticker: "LOT 9: COFFIN (LIGHTLY USED), $20."`)] },
          ],
        },
        talk: {
          label: 'Knock',
          responses: [
            {
              when: [{ flag: 'coffinOpen' }],
              effects: [say('Knock knock.'), R("Who's there?"), say('Dana.'), R('Dana who?'), say("...I didn't plan this far.")],
            },
            { when: [{ flag: 'knockedOnCoffin' }], effects: [R('Still yes, darling. Go ahead. Anything but the hairspray.')] },
            {
              effects: [
                say('Knock, knock.'),
                R('Who knocks at the dressing room of the Lich Lord? ...Oh, the trainee. Go ahead, darling. Anything but the hairspray.'),
                setFlag('knockedOnCoffin'),
              ],
            },
          ],
        },
        use: {
          label: [{ when: [{ flag: 'coffinOpen' }], text: 'Close' }, { text: 'Open' }],
          responses: [
            { when: [{ flag: 'coffinOpen' }], effects: [clearFlag('coffinOpen'), say("I close the lid. Gently. It's his dressing room.")] },
            {
              when: [{ flag: 'knockedOnCoffin' }],
              effects: [setFlag('coffinOpen'), say('The lid swings open. His dressing room, in a coffin. A mirror, a headshot, hairspray, and a little shelf for the script.')],
            },
            {
              effects: [
                say('I knock first. Manners.'),
                R('Who knocks at the dressing room of the Lich Lord? ...Oh, the trainee. Go ahead, darling. Anything but the hairspray.'),
                setFlag('knockedOnCoffin'),
                setFlag('coffinOpen'),
                say('The lid swings open. His dressing room, in a coffin. A mirror, a headshot, hairspray, and a little shelf for the script.'),
              ],
            },
          ],
        },
      },
    },
    {
      // Inside the open coffin, while the script is on its shelf: before Dana takes it, and once it's
      // back after memorising. Bounds fitted to the painted script (lair-coffin-script.webp).
      id: 'coffinScript',
      name: "Reginald's Script",
      when: [{ flag: 'coffinOpen' }, { lacks: script.id }],
      bounds: { x: 46, y: 333, width: 45, height: 43 },
      interactionPoint: { x: 200, y: 470 },
      itemUses: {
        [handbook.id]: [{ effects: [say('Two rule books, side by side on the shelf. The Handbook has more rules. The script has more feelings.')] }],
      },
      verbs: {
        look: {
          responses: [
            {
              // The script lives here after memorising, so this is where the finale's clue can be read again.
              when: [{ flag: 'learnedCue' }],
              effects: [
                say('His script, back on its shelf. MORTAL: "Rise, foul creature, and face me!" LICH: "ARISE!" I know the mortal\'s line by heart now.'),
                say('The last page: "FINALE: The guest escapes THROUGH THE GIFT SHOP and purchases a souvenir. CURTAIN." Head office has underlined "souvenir" twice.'),
              ],
            },
            { effects: [say('A dog-eared script on a little shelf. One line is underlined three times. Something red is scribbled in the margin.')] },
          ],
        },
        take: {
          label: 'Take the script',
          responses: [
            { when: [{ flag: 'learnedCue' }], effects: [say('I know it by heart. It can stay home.')] },
            {
              effects: [
                addItem(script.id),
                say("I take the script. Handbook Section 3 says I'll give it back. I will. After reading it."),
              ],
            },
          ],
        },
      },
    },
    {
      // Inside the open coffin. He named it, so players will try it. Bounds fitted to the painted can.
      id: 'hairspray',
      name: 'Hairspray',
      when: [{ flag: 'coffinOpen' }],
      bounds: { x: 98, y: 328, width: 16, height: 44 },
      interactionPoint: { x: 200, y: 470 },
      itemUses: {
        [handbook.id]: [{ effects: [say("The Handbook's section on aerosols just says \"No.\" I respect its clarity.")] }],
      },
      verbs: {
        look: says('UNDEAD HOLD. "For hair that never dies." The can is older than me.'),
        take: {
          label: 'Take',
          responses: [{ effects: [R('The HAIRSPRAY, darling! Anything but!'), say('He did say.')] }],
        },
        use: {
          label: 'Spritz',
          responses: [{ effects: [say('One spritz. My fringe will now survive the apocalypse.'), R("That was a WEEK's supply.")] }],
        },
      },
    },
    reginaldOnThrone,
    reginaldOnMark,
    {
      id: 'gary',
      name: 'Gary',
      bounds: { x: 166, y: 156, width: 98, height: 290 },
      interactionPoint: { x: 220, y: 475 },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'tookGaryArm' }], effects: [say("Gary, now with 50% fewer arms. He's taking it very well.")] },
            { effects: [say("Gary the skeleton. His name tag says he's been Employee of the Month eleven times. I've never even been Employee of the Shift.")] },
          ],
        },
        take: {
          label: 'Borrow a limb',
          when: [{ notFlag: 'tookGaryArm' }],
          responses: [
            {
              effects: [
                sound('bones'),
                say("Sorry, Gary. I'll bring it back. Probably. Handbook Section 4.2 says nothing about skeletons."),
                addItem(garyArm.id),
                setFlag('tookGaryArm'),
              ],
            },
          ],
        },
        talk: says("Hi, Gary. ... Gary says nothing. Gary has always been a wonderful listener.", 'Make small talk'),
      },
      itemUses: {
        [handbook.id]: [{ effects: [say("I offer Gary the Handbook. Eleven times Employee of the Month: he doesn't need it. He IS it.")] }],
        [garyArm.id]: [{ effects: [say("I offer Gary his arm back. He doesn't want it. He's moved on.")] }],
        [stickyArm.id]: [{ effects: [say("I am NOT giving it back to him like this.")] }],
      },
    },
    {
      id: 'reviews',
      name: 'Customer Reviews',
      bounds: { x: 815, y: 137, width: 180, height: 140 },
      interactionPoint: { x: 890, y: 450 },
      itemUses: {
        [handbook.id]: [{ effects: [say('Section 11: employees may not review their own workplace. It says nothing about reviewing the Handbook. Two stars. Too long, not enough liches.')] }],
      },
      verbs: {
        look: says('"One star. Could not escape." "One star. Still here." "Five stars! Very immersive!" That last one\'s from Reginald\'s mum.'),
        use: says(`"Two stars. Staff were polite but the lich was hammy." Handbook Section 11: employees may not review their own workplace. I'll sign it "Gary".`, 'Leave a review'),
      },
    },
    {
      id: 'displayCase',
      name: 'Display Case',
      bounds: { x: 752, y: 284, width: 112, height: 152 },
      interactionPoint: { x: 808, y: 470 },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'lairDoorUnlocked' }, { flag: 'caseOpen' }], effects: [say("The scroll's tucked back under the bone. Its little card says 'ANCIENT RIDDLE (REPRODUCTION)'. It has never been more wrong.")] },
            { when: [{ flag: 'lairDoorUnlocked' }], effects: [say('Closed again, key in the lock, the scroll back under its bone. As if nothing happened. Something happened.')] },
            { when: [{ flag: 'caseOpen' }], effects: [say("The lid's propped open, key still in the lock. Just the bone now. Its card says 'BONE (DECORATIVE)'. The scroll's card says 'ANCIENT RIDDLE (REPRODUCTION)', and points at nothing.")] },
            { effects: [say("An ornate display case. Inside, on velvet: a bone, labelled 'BONE (DECORATIVE)'. Tucked underneath it: an Ancient Riddle Scroll. The lock is tiny and skull-shaped.")] },
          ],
        },
        use: {
          // Slice 33: it closes once the scroll is back (the closed case's art shows the scroll).
          label: [{ when: [{ flag: 'caseOpen' }], text: 'Close' }, { text: 'Open' }],
          responses: [
            { when: [{ flag: 'caseOpen' }, { flag: 'lairDoorUnlocked' }], effects: [clearFlag('caseOpen'), say('I close the lid. Key in the lock, scroll under its bone. Ready for the next guest. If there ever is one.')] },
            { when: [{ flag: 'caseOpen' }], effects: [say("It can stay open until I've finished with the scroll.")] },
            { when: [{ flag: 'lairDoorUnlocked' }], effects: [setFlag('caseOpen'), say('The key is still in the lock. Click. Open again.')] },
            { effects: [say("Locked. The keyhole is shaped like a tiny skull. Head office loves a theme.")] },
          ],
        },
      },
      itemUses: {
        [handbook.id]: [{ effects: [say(`The Handbook's section on display cases just says "See Section 3." Section 3 is lost property. This book is a maze.`)] }],
        [caseKey.id]: [
          {
            when: [{ notFlag: 'caseOpen' }],
            effects: [
              sound('latch'),
              say("Click. The case opens. I slide the Ancient Riddle Scroll out from under the bone and leave the key in the lock, like a responsible trainee."),
              removeItem(caseKey.id),
              addItem(riddleScroll.id),
              setFlag('caseOpen'),
            ],
          },
          { effects: [say("It's already open. I'm not locking it again just to have something to do.")] },
        ],
      },
    },
    {
      id: 'keypad',
      name: 'Keypad',
      bounds: { x: 1000, y: 205, width: 44, height: 52 },
      interactionPoint: { x: 1020, y: 465 },
      verbs: {
        look: says('Eight brass buttons with letters on them, like an old phone (ABC, DEF, all the way to WXYZ), and one marked ENTER. No numbers at all. Someone has labelled it NUMBER PAD anyway. A brass plate: "ENTER CODE TO ESCAPE." Below it, smaller: "NO REFUNDS."'),
        use: {
          // Slice 33: once Dana has read the scroll, the keypad's own verb enters it.
          label: [{ when: [{ flag: 'readScroll' }, { notFlag: 'lairDoorUnlocked' }], text: 'Enter CODE' }, { text: 'Enter a code' }],
          responses: [
            { when: [{ flag: 'lairDoorUnlocked' }], effects: [say("Already done. C-O-D-E, ENTER. I'll never forget it. I'll try.")] },
            // Slice 33: a play-tester expected the keypad itself to work once they had the scroll.
            { when: [{ flag: 'readScroll' }], effects: enterTheCode },
            { when: [{ has: riddleScroll.id }], effects: [say("I've got the scroll with the answer on it. I should read what it says first.")] },
            { effects: [say("L-I-C-H, ENTER. Bzzt. D-O-O-M, ENTER. Bzzt. G-A-R-Y, ENTER. Bzzt, and Gary looks hurt. I need the actual code.")] },
          ],
        },
      },
      itemUses: {
        [handbook.id]: [{ effects: [say('The index says "Codes, door: see Appendix C." There is no Appendix C. There is barely an Appendix B.')] }],
        [riddleScroll.id]: [
          {
            when: [{ notFlag: 'lairDoorUnlocked' }],
            effects: enterTheCode,
          },
          { effects: [say("The door's already unlocked. I'm not typing CODE again. It felt silly enough the first time.")] },
        ],
      },
    },
    {
      id: 'grate',
      name: 'Floor Grate',
      bounds: { x: 312, y: 512, width: 204, height: 72 },
      interactionPoint: { x: 414, y: 498 },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'gotCaseKey' }], effects: [say('Gary\'s arm, gummed to the grate, waving at nobody. A pamphlet down there: "Emergency Procedures for Staff". Fire, flood, fainting guest. Nothing about liches. I checked twice.')] },
            { effects: [say('A floor grate. Something small and shiny glints down there, just out of reach. I\'d need a longer arm. Or a spare one.')] },
          ],
        },
      },
      itemUses: {
        [handbook.id]: [{ effects: [say("I am not dropping the Handbook down a grate. I know it by heart, but it's the principle.")] }],
        [stickyArm.id]: [
          {
            when: [{ notFlag: 'gotCaseKey' }],
            effects: [
              sound('keys'),
              say('I lower the Sticky Arm through the bars... gently... got it! A key. Gary would be proud. Gary is never proud.'),
              addItem(caseKey.id),
              say("The gum lets go of the key and grabs the grate instead. Gary's arm is staying there. I'm told that's what gum does."),
              removeItem(stickyArm.id),
              setFlag('gotCaseKey'),
            ],
          },
          { effects: [say("There's nothing else down there worth getting gum on.")] },
        ],
        [garyArm.id]: [{ effects: [say("Gary's fingers brush the key, but it won't stay put. If only they were... stickier.")] }],
        // Slice 33: the gum's half of the hint (the arm has the other).
        [gum.id]: [{ effects: [say("Sticky enough to grab the key, but my fingers won't reach it. The gum needs to be on the end of something long.")] }],
      },
      itemFallback: "That won't fit through the grate. Most things won't. That's rather the point of a grate.",
    },
  ],
};

export const lairPack: ContentPack = {
  rooms: [lair],
  items: [garyArm, gum, stickyArm, caseKey, riddleScroll],
  combinations,
};
