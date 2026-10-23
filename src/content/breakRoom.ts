import type { Combination, Dialogue, Item, Room } from '../core/types';
import { addItem, goTo, removeItem, say, says, setFlag, startDialogue, walk } from './dsl';
import { R } from './cast';
import type { ContentPack } from './pack';

// The Break Room (slice 15): three parallel puzzles from the M3 plan (docs/design.md). Clock out
// with the time card from the fridge; open the locker with the number on the lanyard; add the
// vending machine's cent to the pay packet for exact change. Reginald is only heard here, over
// the intercom: he has no hotspot, so his lines show over Dana with his name tag.

// Both lanyards carry the employee number, so either one can be read (a player may clock out first).
const checkTheNumber: Item['action'] = {
  label: 'Check the number',
  responses: [
    { when: [{ flag: 'learnedEmployeeNumber' }], effects: [say("Employee number 007. Still 007. It isn't going to change. I check anyway.")] },
    {
      effects: [
        say('I squint at the small print. Employee number... 007. Licensed to clock in.'),
        say('0-0-7. Handbook Section 2: know your number. Now I do. Two zeroes and a seven. Easy.'),
        setFlag('learnedEmployeeNumber'),
      ],
    },
  ],
};

export const lanyard: Item = {
  id: 'lanyard',
  name: 'Staff Lanyard',
  icon: 'assets/icons/lanyard.webp',
  look: 'My lanyard. TRAINEE in huge letters, my employee number in tiny ones. Head office\'s priorities, in font sizes.',
  action: checkTheNumber,
};

/** The same lanyard, badge flipped round: what Dana holds once they've clocked out (slice 23). */
export const offDutyLanyard: Item = {
  id: 'offDutyLanyard',
  name: 'Off-Duty Lanyard',
  icon: 'assets/icons/lanyard-off-duty.webp',
  look: 'My lanyard, badge flipped round. The back says OFF DUTY. It has never been used before. It still smells new.',
  action: checkTheNumber,
};

export const timeCard: Item = {
  id: 'timeCard',
  name: 'Time Card',
  icon: 'assets/icons/time-card.webp',
  look: '"D. PICKWICK, TRAINEE. IN: 4:00 PM." Slightly chilled, and faintly strawberry-scented.',
};

export const payPacket: Item = {
  id: 'payPacket',
  name: 'Pay Packet',
  icon: 'assets/icons/pay-packet.webp',
  look: 'My pay packet: $12.98. The mug is $12.99. One cent short. Of course it is.',
};

export const oneCent: Item = {
  id: 'oneCent',
  name: 'One Cent',
  icon: 'assets/icons/one-cent.webp',
  look: 'One cent, from the coin return. Worth almost nothing. Unless you are exactly one cent short of something.',
};

export const exactChange: Item = {
  id: 'exactChange',
  name: 'Exact Change',
  icon: 'assets/icons/exact-change.webp',
  look: '$12.99. Exactly. Not a cent over, not a cent under. The till has never seen anything so beautiful.',
};

const combinations: Combination[] = [
  {
    items: [payPacket.id, oneCent.id],
    responses: [
      {
        effects: [
          say('I drop the cent into the pay packet. $12.99. Exact change. Handbook Section 10: "Always offer exact change." Nobody ever has. Until now.'),
          removeItem(payPacket.id),
          removeItem(oneCent.id),
          addItem(exactChange.id),
        ],
      },
    ],
  },
];


/** Reginald, "directing" over the intercom from the Lair. */
export const intercomDialogue: Dialogue = {
  id: 'intercom',
  start: 'hub',
  greeting: [
    { effects: [say('I press TALK.'), R('*crackle* You have reached the Lich Lord. He is IN. He is always in. He cannot leave.')] },
  ],
  nodes: {
    hub: {
      options: [
        {
          id: 'canYouHear',
          text: 'Reginald? Can you hear me?',
          once: true,
          effects: [
            R('Every word, darling. I can hear the whole building from this intercom. The acoustics are wasted on guests.'),
          ],
          next: 'hub',
        },
        {
          id: 'advice',
          text: 'Any advice?',
          once: true,
          effects: [
            R('Motivation! What does your character WANT?'),
            say('To clock out and buy a mug.'),
            R('...Then play it BIG. Nobody ever won an award for buying a mug quietly.'),
          ],
          next: 'hub',
        },
        {
          id: 'offDuty',
          text: "I've clocked out. I'm a guest now.",
          when: [{ flag: 'danaOffDuty' }],
          once: true,
          effects: [
            R('A GUEST? Then I must stay in character. ...Welcome, mortal, to your DOOM. Do visit the gift shop.'),
          ],
          next: 'hub',
        },
        {
          id: 'exactChange',
          text: "I've got exact change!",
          when: [{ has: exactChange.id }],
          once: true,
          effects: [
            R('Exact change. In twenty years of touring I have never seen it. Not once. Not even in Hull.'),
          ],
          next: 'hub',
        },
        {
          id: 'bye',
          text: 'Over and out.',
          effects: [R('Never say "out" in a theatre, darling. Say "exeunt". *click*')],
          next: 'end',
        },
      ],
    },
  },
};

// The painting (docs/art/break-room.md) sets the layout: hotspot bounds and the walkable floor are
// fitted to what's painted. Left to right: the door back to the Gift Shop, noticeboard, time clock,
// fridge, vending machine, lockers, intercom. The floor runs edge to edge from y=470 down to y=620;
// below it is the inventory bar.
export const breakRoom: Room = {
  id: 'breakRoom',
  name: 'Break Room',
  music: 'breakRoom',
  // Generated from docs/art/break-room-layout.svg; bounds were then fitted to the painting.
  art: {
    background: 'assets/rooms/break-room.webp',
    // Patches of the painting for what changes in play (docs/art/prompts-break-room.md). Drawn in
    // order: the yogurt-only patch covers the card in the open fridge.
    overlays: [
      { image: 'assets/overlays/break-room-fridge-open.webp', at: { x: 451, y: 224 }, when: [{ flag: 'fridgeOpen' }] },
      { image: 'assets/overlays/break-room-fridge-yogurt.webp', at: { x: 585, y: 351 }, when: [{ flag: 'tookTimeCard' }] },
      { image: 'assets/overlays/break-room-locker-open.webp', at: { x: 875, y: 146 }, when: [{ flag: 'lockerOpen' }] },
      // The cent is painted in the coin return; once Dana has it, the slot is empty.
      { image: 'assets/overlays/break-room-cent-taken.webp', at: { x: 829, y: 310 }, when: [{ flag: 'gotCent' }] },
    ],
  },
  entries: {
    fromGiftShop: { x: 210, y: 500 },
  },
  walkable: [
    { x: 25, y: 470 },
    { x: 1255, y: 470 },
    { x: 1275, y: 620 },
    { x: 5, y: 620 },
  ],
  hotspots: [
    {
      // Look-only until slice 16 joins the rooms.
      id: 'giftShopDoor',
      name: 'Gift Shop Door',
      bounds: { x: 36, y: 142, width: 156, height: 320 },
      interactionPoint: { x: 205, y: 488 },
      verbs: {
        look: says('The door back to the Gift Shop. This side says STAFF ONLY. The other side also says STAFF ONLY. Very consistent. Very unwelcoming.'),
        use: {
          label: 'Go through',
          responses: [{ effects: [walk('dana', 150, 470), goTo('giftShop', 'fromBreakRoom')] }],
        },
      },
    },
    {
      id: 'noticeboard',
      name: 'Noticeboard',
      bounds: { x: 216, y: 186, width: 178, height: 138 },
      interactionPoint: { x: 305, y: 488 },
      verbs: {
        look: says('"EMPLOYEE OF THE MONTH: GARY." Again. Below it: "WHO KEEPS TAKING THE STAPLER? —Management." And: "It is in the Lair. It is the Stapler of Doom now. —R."'),
        use: says('"STAFF SOCIAL: Bring a dish!" Signed up: Gary (bringing "nothing"), Reginald (bringing "gravitas"). I add "Dana: crisps". Handbook Section 15: always contribute.', 'Sign up'),
      },
    },
    {
      id: 'timeClock',
      name: 'Time Clock',
      bounds: { x: 420, y: 170, width: 102, height: 160 },
      interactionPoint: { x: 468, y: 488 },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'danaOffDuty' }], effects: [say("My card says OUT. I'm officially a guest. I feel lighter. And slightly lost.")] },
            { effects: [say('A punch clock. The sign over it: "STAFF MUST CLOCK OUT BEFORE SHOPPING. NO EXCEPTIONS. NOT EVEN YOU, GARY."')] },
          ],
        },
        use: {
          label: 'Clock out',
          responses: [
            { when: [{ flag: 'danaOffDuty' }], effects: [say("I've already clocked out. Clocking out twice would probably mean I owe them a shift.")] },
            { effects: [say('Handbook Section 5: "No card, no clock." I need my time card. Last seen... going somewhere cold?')] },
          ],
        },
      },
      itemUses: {
        [timeCard.id]: [
          {
            when: [{ notFlag: 'danaOffDuty' }],
            effects: [
              say('KA-CHUNK. "OUT: 8:47 PM." I am off duty. Legally, I am a guest.'),
              say('Handbook Section 5.3: off-duty staff are customers like anyone else. I flip my badge round to the side that says OFF DUTY. Off duty means off duty.'),
              removeItem(lanyard.id),
              addItem(offDutyLanyard.id),
              setFlag('danaOffDuty'),
              say('I file my time card back in the rack, under P. Not under the yogurt.'),
              removeItem(timeCard.id),
            ],
          },
          { effects: [say("Already stamped OUT. If I punch it again I'll be clocked back IN, and I'm not doing that to myself.")] },
        ],
        [lanyard.id]: [{ effects: [say('It wants a time card, not a lanyard. The clock has standards.')] }],
      },
      itemFallback: 'The time clock only accepts time cards. It has rejected better things than this.',
    },
    {
      id: 'fridge',
      name: 'Fridge',
      bounds: { x: 532, y: 166, width: 152, height: 300 },
      // Beside the fridge, not in front of it, so Dana doesn't hide what's inside once it's open.
      interactionPoint: { x: 712, y: 492 },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'tookTimeCard' }], effects: [say('The yogurt, back on duty as a paperweight. Holding down nothing. It looks proud anyway.')] },
            { when: [{ flag: 'fridgeOpen' }], effects: [say('One strawberry yogurt, pinning down a piece of card. The card says PICKWICK. That is MY time card.')] },
            { effects: [say('A fridge covered in notes. The big one: "WHOEVER KEEPS USING MY YOGURT AS A PAPERWEIGHT: STOP." Underlined so hard the pen went through.')] },
          ],
        },
        use: {
          label: 'Open',
          responses: [
            { when: [{ flag: 'fridgeOpen' }], effects: [say("It's open. It hums at me disapprovingly. Another note inside says \"CLOSE THE DOOR.\"")] },
            {
              effects: [
                say('Inside: one strawberry yogurt, sitting on a piece of card like a paperweight. The card says PICKWICK.'),
                say("Somebody's been using their yogurt as a paperweight. On my time card. In the fridge. I have so many questions."),
                setFlag('fridgeOpen'),
              ],
            },
          ],
        },
        take: {
          label: 'Move the yogurt',
          when: [{ flag: 'fridgeOpen' }, { notFlag: 'tookTimeCard' }],
          responses: [
            {
              effects: [
                say('I lift the yogurt, take my time card, and put the yogurt back exactly where it was. Handbook Section 6: respect your colleagues\' dairy.'),
                addItem(timeCard.id),
                setFlag('tookTimeCard'),
              ],
            },
          ],
        },
      },
      itemFallback: "I'm not putting that in the fridge. Somebody would leave a note about it.",
    },
    {
      id: 'vendingMachine',
      name: 'Vending Machine',
      bounds: { x: 702, y: 154, width: 158, height: 312 },
      interactionPoint: { x: 780, y: 492 },
      verbs: {
        look: says('"SNAX-O-RAMA." Fully stocked with one bag of Spooky Crisps, which has been stuck on its spiral since before I was hired. Nobody has the heart to free it. The coin return flap is half-open, and something small and copper is sulking in there.'),
        take: {
          label: 'Press coin return',
          responses: [
            { when: [{ flag: 'gotCent' }], effects: [say('Empty. I check it twice more anyway. Handbook Section 8: be thorough.')] },
            {
              effects: [
                // Before the line, so the coin leaves the slot (an overlay) as Dana takes it.
                setFlag('gotCent'),
                addItem(oneCent.id),
                say('Clink! One cent. Handbook Section 8: "Found money under five cents belongs to the finder." Finally, a section that helps.'),
              ],
            },
          ],
        },
        use: says("The crisps are $1.50, and every cent I've got is spoken for. Hang in there, crisps.", 'Buy a snack'),
      },
      itemUses: {
        [oneCent.id]: [{ effects: [say("I'm not feeding it back. That cent and I have plans.")] }],
        [payPacket.id]: [{ effects: [say('Spend my wages on crisps? The mug is the only thing I need. The crisps can wait. They have been waiting for years.')] }],
        [exactChange.id]: [{ effects: [say('Break exact change? For crisps? Never.')] }],
      },
    },
    {
      id: 'lockers',
      name: 'Lockers',
      bounds: { x: 878, y: 166, width: 248, height: 300 },
      // In front of Reginald's locker, so Dana doesn't hide the inside of theirs once it's open.
      interactionPoint: { x: 1050, y: 492 },
      verbs: {
        look: {
          responses: [
            { when: [{ flag: 'lockerOpen' }], effects: [say("My locker's open. Inside: one spare hairnet. We don't serve food. Head office issued it anyway.")] },
            { effects: [say("A row of staff lockers. Mine says TRAINEE. Reginald's has a gold star. Gary's is just a peg. Mine has a combination lock.")] },
          ],
        },
        use: {
          label: 'Open my locker',
          responses: [
            { when: [{ flag: 'lockerOpen' }], effects: [say("It's already open. The hairnet and I have nothing more to say to each other.")] },
            {
              when: [{ flag: 'learnedEmployeeNumber' }],
              effects: [
                say('The combination is my employee number. 0... 0... 7. Click!'),
                say('Inside: a spare hairnet and my pay packet. Payday! Twelve dollars and ninety-eight cents. The mug is twelve ninety-nine. Head office, you absolute artists.'),
                addItem(payPacket.id),
                setFlag('lockerOpen'),
              ],
            },
            { effects: [say("The combination is my employee number. Which I was told on day one, along with forty other things. Maybe it's written on me somewhere.")] },
          ],
        },
      },
      itemUses: {
        [lanyard.id]: [{ effects: [say("The lock wants a number, not a lanyard. Though the number IS on the lanyard. I should probably read it.")] }],
        [offDutyLanyard.id]: [{ effects: [say('The lock wants a number, not a badge. Though the number IS on the badge, in tiny letters. I should probably read it.')] }],
      },
    },
    {
      id: 'intercom',
      name: 'Intercom',
      bounds: { x: 1156, y: 242, width: 72, height: 94 },
      interactionPoint: { x: 1165, y: 488 },
      verbs: {
        look: says('The staff intercom to the Lair. A label: "FOR EMERGENCIES ONLY." Someone has added: "AND REGINALD\'S NOTES."'),
        talk: {
          label: 'Press TALK',
          responses: [{ effects: [startDialogue(intercomDialogue.id)] }],
        },
      },
    },
  ],
};

export const breakRoomPack: ContentPack = {
  rooms: [breakRoom],
  items: [lanyard, offDutyLanyard, timeCard, payPacket, oneCent, exactChange],
  combinations,
  dialogues: [intercomDialogue],
};
