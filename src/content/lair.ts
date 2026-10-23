import type { Combination, Item, Room } from '../core/types';
import { addItem, goTo, removeItem, say, says, setFlag, sound, walk } from './dsl';
import { reginaldOnMark, reginaldOnThrone, script } from './reginald';
import type { ContentPack } from './pack';

export const garyArm: Item = {
  id: 'garyArm',
  name: "Gary's Arm",
  icon: 'assets/icons/gary-arm.webp',
  // DRAFT:
  look: "Gary's left arm. Surprisingly light. He's been skipping arm day for decades.",
};

export const gum: Item = {
  id: 'gum',
  name: 'Pre-Owned Gum',
  icon: 'assets/icons/gum.webp',
  // DRAFT:
  look: 'A wad of gum from under the Spooky Seat. Still tacky. In both senses.',
};

export const stickyArm: Item = {
  id: 'stickyArm',
  name: 'Sticky Arm',
  icon: 'assets/icons/sticky-arm.webp',
  // DRAFT:
  look: "Gary's arm, now with a gum fingertip. I've invented a tool. Or a crime.",
};

export const caseKey: Item = {
  id: 'caseKey',
  name: 'Display Case Key',
  icon: 'assets/icons/case-key.webp',
  // DRAFT:
  look: 'A tiny key on a skull keyring. The keyring says DISPLAY CASE. Head office labels everything except the puzzles.',
};

export const riddleScroll: Item = {
  id: 'riddleScroll',
  name: 'Ancient Riddle Scroll',
  icon: 'assets/icons/riddle-scroll.webp',
  // DRAFT:
  look: 'It reads: "THE ANSWER IS: {CODE}". Head office used a template and never filled in the blank. Of COURSE. Then again, the curse made the whole script real, exactly as printed. Does that include the blanks?',
};

const combinations: Combination[] = [
  {
    items: [garyArm.id, gum.id],
    responses: [
      {
        effects: [
          sound('squelch'),
          // DRAFT:
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
            // DRAFT:
            { when: [{ flag: 'lairDoorUnlocked' }], effects: [say('Unlocked! Beyond it: the Gift Shop. I can already hear the mugs.')] },
            // DRAFT:
            { effects: [say('A heavy oak door. Well, heavy oak-effect laminate. Section 9 of the Handbook says it should never be locked during business hours. It is locked.')] },
          ],
        },
        // DRAFT:
        talk: says("Hello? Door? I'd like to speak to your manager. ... Its manager is also a door.", 'Negotiate'),
        use: {
          label: 'Go through',
          when: [{ flag: 'lairDoorUnlocked' }],
          responses: [
            {
              when: [{ notFlag: 'visitedGiftShop' }],
              effects: [
                // DRAFT:
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
        // DRAFT:
        [caseKey.id]: [{ effects: [say("Wrong key. It's for the display case. It literally says so on it.")] }],
      },
      // DRAFT:
      itemFallback: 'The door remains locked. It is unmoved by my offerings.',
    },
    {
      id: 'throne',
      name: 'Throne',
      bounds: { x: 515, y: 80, width: 222, height: 360 },
      interactionPoint: { x: 626, y: 465 },
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
          label: 'Check under the armrest',
          when: [{ flag: 'reginaldLeftThrone' }, { notFlag: 'tookGum' }],
          responses: [
            {
              effects: [
                // DRAFT:
                say('Under the armrest: one wad of pre-owned gum, stuck there like under a school desk. Handbook Section 3: "Lost property must be logged." Consider it logged.'),
                addItem(gum.id),
                setFlag('tookGum'),
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
      bounds: { x: 428, y: 276, width: 58, height: 146 },
      interactionPoint: { x: 470, y: 472 },
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
      bounds: { x: 10, y: 175, width: 128, height: 262 },
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
                addItem(script.id),
                setFlag('tookScript'),
              ],
            },
            // DRAFT:
            { when: [{ flag: 'learnedCue' }], effects: [say("His script's back where it belongs. I know the cue by heart now: \"Rise, foul creature, and face me!\"")] },
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
      bounds: { x: 166, y: 156, width: 98, height: 290 },
      interactionPoint: { x: 220, y: 475 },
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
                sound('bones'),
                // DRAFT:
                say("Sorry, Gary. I'll bring it back. Probably. Handbook Section 4.2 says nothing about skeletons."),
                addItem(garyArm.id),
                setFlag('tookGaryArm'),
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
      bounds: { x: 815, y: 137, width: 180, height: 140 },
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
      bounds: { x: 752, y: 284, width: 112, height: 152 },
      interactionPoint: { x: 808, y: 470 },
      verbs: {
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'lairDoorUnlocked' }], effects: [say("The scroll's tucked back under the bone. Its little card says 'ANCIENT RIDDLE (REPRODUCTION)'. It has never been more wrong. I've left the lid up. The Handbook covers opening things, not closing them.")] },
            // DRAFT:
            { when: [{ flag: 'caseOpen' }], effects: [say("The lid's propped open, key still in the lock. Just the bone now. Its card says 'BONE (DECORATIVE)'. The scroll's card says 'ANCIENT RIDDLE (REPRODUCTION)', and points at nothing.")] },
            // DRAFT:
            { effects: [say("An ornate display case. Inside, on velvet: a bone, labelled 'BONE (DECORATIVE)'. Tucked underneath it: an Ancient Riddle Scroll. The lock is tiny and skull-shaped.")] },
          ],
        },
        use: {
          label: 'Open',
          responses: [
            // DRAFT:
            { when: [{ flag: 'caseOpen' }], effects: [say("It's open. All that's left is the decorative bone, and I'm not stealing set dressing on my first day.")] },
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
              sound('latch'),
              // DRAFT:
              say("Click. The case opens. I slide the Ancient Riddle Scroll out from under the bone and leave the key in the lock, like a responsible trainee."),
              removeItem(caseKey.id),
              addItem(riddleScroll.id),
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
      bounds: { x: 1000, y: 205, width: 44, height: 52 },
      interactionPoint: { x: 1020, y: 465 },
      verbs: {
        // DRAFT:
        look: says('Eight brass buttons with letters on them, like an old phone (ABC, DEF, all the way to WXYZ), and one that says ENTER. No numbers at all. Someone has labelled it NUMBER PAD. A brass plate: "ENTER CODE TO ESCAPE". Below it, smaller: "NO REFUNDS".'),
        use: {
          label: 'Enter a code',
          responses: [
            // DRAFT:
            { when: [{ flag: 'lairDoorUnlocked' }], effects: [say("Already done. C-O-D-E, ENTER. I'll never forget it. I'll try.")] },
            // DRAFT:
            { effects: [say("L-I-C-H, ENTER. Bzzt. D-O-O-M, ENTER. Bzzt. G-A-R-Y, ENTER. Bzzt, and Gary looks hurt. I need the actual code.")] },
          ],
        },
      },
      itemUses: {
        [riddleScroll.id]: [
          {
            when: [{ notFlag: 'lairDoorUnlocked' }],
            effects: [
              // DRAFT:
              say('"THE ANSWER IS: {CODE}." The curly brackets just mark the blank that nobody filled in. What\'s printed in the blank is the word CODE.'),
              // DRAFT:
              say('The curse bound the script exactly as printed. So the answer isn\'t a code. It\'s the word CODE. C. O. D. E. ENTER.'),
              sound('keypad'),
              setFlag('lairDoorUnlocked'),
              sound('unlock'),
              // DRAFT:
              say("CLUNK. The door unlocks. I've beaten head office at their own game. By reading."),
              // DRAFT:
              say('Handbook Section 3: lost property must be returned. I tuck the scroll back under its bone.'),
              removeItem(riddleScroll.id),
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
      bounds: { x: 312, y: 512, width: 204, height: 72 },
      interactionPoint: { x: 414, y: 498 },
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
              sound('keys'),
              // DRAFT:
              say('I lower the Sticky Arm through the bars... gently... got it! A key. Gary would be proud. Gary is never proud.'),
              addItem(caseKey.id),
              // DRAFT:
              say("The gum lets go of the key and grabs the grate instead. Gary's arm is staying there. I'm told that's what gum does."),
              removeItem(stickyArm.id),
              setFlag('gotCaseKey'),
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

export const lairPack: ContentPack = {
  rooms: [lair],
  items: [garyArm, gum, stickyArm, caseKey, riddleScroll],
  combinations,
};
