import type { Combination, Dialogue, Item, Room } from '../core/types';
import { line, say, says, setFlag, walk } from './dsl';
import { reginald } from './reginald';

// The Break Room (slice 15): three parallel puzzles from the M3 plan (docs/design.md). Clock out
// with the time card from the fridge; open the locker with the number on the lanyard; add the
// vending machine's cent to the pay packet for exact change. Reginald is only heard here, over
// the intercom: he has no hotspot, so his lines show over Dana with his name tag.

export const lanyard: Item = {
  id: 'lanyard',
  name: 'Staff Lanyard',
  icon: 'assets/icons/lanyard.webp',
  // DRAFT:
  look: 'My lanyard. TRAINEE in huge letters, my employee number in tiny ones. Head office\'s priorities, in font sizes.',
  action: {
    label: 'Check the number',
    responses: [
      // DRAFT:
      { when: [{ flag: 'knowsEmployeeNumber' }], effects: [say('Employee number 007. Still 007. Still licensed to clock in.')] },
      {
        effects: [
          // DRAFT:
          say('I squint at the small print. Employee number... 007. Licensed to clock in.'),
          // DRAFT:
          say("0-0-7. Handbook Section 2: know your number. Now I do. I'll never forget it."),
          setFlag('knowsEmployeeNumber'),
        ],
      },
    ],
  },
};

export const timeCard: Item = {
  id: 'timeCard',
  name: 'Time Card',
  icon: 'assets/icons/time-card.webp',
  // DRAFT:
  look: '"D. PICKWICK, TRAINEE. IN: 4:00 PM." Slightly chilled, and faintly strawberry-scented.',
};

export const payPacket: Item = {
  id: 'payPacket',
  name: 'Pay Packet',
  icon: 'assets/icons/pay-packet.webp',
  // DRAFT:
  look: "My pay packet: $12.98. The mug is $12.99. Head office has paid me exactly one cent less than a mug. I'd admire it if it weren't me.",
};

export const oneCent: Item = {
  id: 'oneCent',
  name: 'One Cent',
  icon: 'assets/icons/one-cent.webp',
  // DRAFT:
  look: 'One cent, from the coin return. Worth almost nothing. Unless you are exactly one cent short of something.',
};

export const exactChange: Item = {
  id: 'exactChange',
  name: 'Exact Change',
  icon: 'assets/icons/exact-change.webp',
  // DRAFT:
  look: '$12.99. Exactly. Not a cent over, not a cent under. The till has never seen anything so beautiful.',
};

export const breakRoomItems = [lanyard, timeCard, payPacket, oneCent, exactChange];

export const breakRoomCombinations: Combination[] = [
  {
    items: [payPacket.id, oneCent.id],
    responses: [
      {
        effects: [
          // DRAFT:
          say('I drop the cent into the pay packet. $12.99. Exact change. Handbook Section 10: "Always offer exact change." Nobody ever has. Until now.'),
          { type: 'removeItem', itemId: payPacket.id },
          { type: 'removeItem', itemId: oneCent.id },
          { type: 'addItem', itemId: exactChange.id },
        ],
      },
    ],
  },
];

const R = (text: string) => line(reginald.id, text);

/** Reginald, "directing" over the intercom from the Lair. */
export const intercomDialogue: Dialogue = {
  id: 'intercom',
  start: 'hub',
  greeting: [
    // DRAFT:
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
            // DRAFT:
            R('Every word, darling. I can hear the whole building from this intercom. The acoustics are wasted on guests.'),
          ],
          next: 'hub',
        },
        {
          id: 'advice',
          text: 'Any advice?',
          once: true,
          effects: [
            // DRAFT:
            R('Motivation! What does your character WANT?'),
            // DRAFT:
            say('To clock out and buy a mug.'),
            // DRAFT:
            R('...Then play it BIG. Nobody ever won an award for buying a mug quietly.'),
          ],
          next: 'hub',
        },
        {
          id: 'offDuty',
          text: "I've clocked out. I'm a guest now.",
          when: [{ flag: 'offDuty' }],
          once: true,
          effects: [
            // DRAFT:
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
            // DRAFT:
            R('Exact change. In twenty years of touring I have never seen it. Not once. Not even in Hull.'),
          ],
          next: 'hub',
        },
        {
          id: 'bye',
          text: 'Over and out.',
          // DRAFT:
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
  // Generated from docs/art/break-room-layout.svg; bounds were then fitted to the painting.
  art: {
    background: 'assets/rooms/break-room.webp',
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
        // DRAFT:
        look: says('The door back to the Gift Shop. This side says STAFF ONLY. The other side also says STAFF ONLY. Very consistent. Very unwelcoming.'),
        use: {
          label: 'Go through',
          responses: [{ effects: [walk('dana', 150, 470), { type: 'goToRoom', roomId: 'giftShop', entry: 'fromBreakRoom' }] }],
        },
      },
    },
    {
      id: 'noticeboard',
      name: 'Noticeboard',
      bounds: { x: 216, y: 186, width: 178, height: 138 },
      interactionPoint: { x: 305, y: 488 },
      verbs: {
        // DRAFT:
        look: says('"EMPLOYEE OF THE MONTH: GARY." Again. Below it: "WHO KEEPS TAKING THE STAPLER? —Management." And: "It is in the Lair. It is the Stapler of Doom now. —R."'),
        // DRAFT:
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
            // DRAFT:
            { when: [{ flag: 'offDuty' }], effects: [say("My card says OUT. I'm officially a guest. I feel lighter. And slightly lost.")] },
            // DRAFT:
            { effects: [say('A punch clock. The sign over it: "STAFF MUST CLOCK OUT BEFORE SHOPPING. NO EXCEPTIONS. NOT EVEN YOU, GARY."')] },
          ],
        },
        use: {
          label: 'Clock out',
          responses: [
            // DRAFT:
            { when: [{ flag: 'offDuty' }], effects: [say("I've already clocked out. Clocking out twice would probably mean I owe them a shift.")] },
            // DRAFT:
            { effects: [say('Handbook Section 5: "No card, no clock." I need my time card. Last seen... going somewhere cold?')] },
          ],
        },
      },
      itemUses: {
        [timeCard.id]: [
          {
            when: [{ notFlag: 'offDuty' }],
            effects: [
              // DRAFT:
              say('KA-CHUNK. "OUT: 9:47 PM." I am off duty. Legally, I am a guest.'),
              // DRAFT:
              say('Handbook Section 5.3: off-duty staff are customers like anyone else. I tuck my lanyard into my pocket. Off duty means off duty.'),
              setFlag('offDuty'),
              // DRAFT:
              say('I file my time card back in the rack, under P. Not under the yogurt.'),
              { type: 'removeItem', itemId: timeCard.id },
            ],
          },
          // DRAFT:
          { effects: [say("Already stamped OUT. If I punch it again I'll be clocked back IN, and I'm not doing that to myself.")] },
        ],
        // DRAFT:
        [lanyard.id]: [{ effects: [say('It wants a time card, not a lanyard. The clock has standards.')] }],
      },
      // DRAFT:
      itemFallback: 'The time clock only accepts time cards. It has rejected better things than this.',
    },
    {
      id: 'fridge',
      name: 'Fridge',
      bounds: { x: 532, y: 166, width: 152, height: 300 },
      interactionPoint: { x: 608, y: 492 },
      verbs: {
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'tookTimeCard' }], effects: [say('The yogurt, back on duty as a paperweight. Holding down nothing. It looks proud anyway.')] },
            // DRAFT:
            { when: [{ flag: 'fridgeOpen' }], effects: [say('One strawberry yogurt, pinning down a piece of card. The card says PICKWICK. That is MY time card.')] },
            // DRAFT:
            { effects: [say('A fridge covered in notes. The big one: "WHOEVER KEEPS USING MY YOGURT AS A PAPERWEIGHT: STOP." Underlined so hard the pen went through.')] },
          ],
        },
        use: {
          label: 'Open',
          responses: [
            // DRAFT:
            { when: [{ flag: 'fridgeOpen' }], effects: [say("It's open. It hums at me disapprovingly. Another note inside says \"CLOSE THE DOOR.\"")] },
            {
              effects: [
                // DRAFT:
                say('Inside: one strawberry yogurt, sitting on a piece of card like a paperweight. The card says PICKWICK.'),
                // DRAFT:
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
                // DRAFT:
                say('I lift the yogurt, take my time card, and put the yogurt back exactly where it was. Handbook Section 6: respect your colleagues\' dairy.'),
                { type: 'addItem', itemId: timeCard.id },
                setFlag('tookTimeCard'),
              ],
            },
          ],
        },
      },
      // DRAFT:
      itemFallback: "I'm not putting that in the fridge. Somebody would leave a note about it.",
    },
    {
      id: 'vendingMachine',
      name: 'Vending Machine',
      bounds: { x: 702, y: 154, width: 158, height: 312 },
      interactionPoint: { x: 780, y: 492 },
      verbs: {
        // DRAFT:
        look: says('"SNAX-O-RAMA." Fully stocked with one bag of Spooky Crisps, which has been stuck on its spiral since before I was hired. Nobody has the heart to free it. The coin return flap is half-open, and something small and copper is sulking in there.'),
        take: {
          label: 'Press coin return',
          responses: [
            // DRAFT:
            { when: [{ flag: 'gotCent' }], effects: [say('Empty. I check it twice more anyway. Handbook Section 8: be thorough.')] },
            {
              effects: [
                // DRAFT:
                say('Clink! One cent. Handbook Section 8: "Found money under five cents belongs to the finder." Finally, a section that helps.'),
                { type: 'addItem', itemId: oneCent.id },
                setFlag('gotCent'),
              ],
            },
          ],
        },
        // DRAFT:
        use: says("The crisps are $1.50, and every cent I've got is spoken for. Hang in there, crisps.", 'Buy a snack'),
      },
      itemUses: {
        // DRAFT:
        [oneCent.id]: [{ effects: [say("I'm not feeding it back. That cent and I have plans.")] }],
        // DRAFT:
        [payPacket.id]: [{ effects: [say('Spend my wages on crisps? The mug is the only thing I need. The crisps can wait. They have been waiting for years.')] }],
        // DRAFT:
        [exactChange.id]: [{ effects: [say('Break exact change? For crisps? Never.')] }],
      },
    },
    {
      id: 'lockers',
      name: 'Lockers',
      bounds: { x: 878, y: 166, width: 248, height: 300 },
      interactionPoint: { x: 985, y: 492 },
      verbs: {
        look: {
          responses: [
            // DRAFT:
            { when: [{ flag: 'lockerOpen' }], effects: [say("My locker's open. Inside: one spare hairnet. We don't serve food. Head office issued it anyway.")] },
            // DRAFT:
            { effects: [say("A row of staff lockers. Mine says TRAINEE. Reginald's has a gold star. Gary's is just a peg. Mine has a combination lock.")] },
          ],
        },
        use: {
          label: 'Open my locker',
          responses: [
            // DRAFT:
            { when: [{ flag: 'lockerOpen' }], effects: [say("It's already open. The hairnet and I have nothing more to say to each other.")] },
            {
              when: [{ flag: 'knowsEmployeeNumber' }],
              effects: [
                // DRAFT:
                say('The combination is my employee number. 0... 0... 7. Click!'),
                // DRAFT:
                say('Inside: a spare hairnet and my pay packet. Payday! Twelve dollars and ninety-eight cents. The mug is twelve ninety-nine. Head office, you absolute artists.'),
                { type: 'addItem', itemId: payPacket.id },
                setFlag('lockerOpen'),
              ],
            },
            // DRAFT:
            { effects: [say("The combination is my employee number. Which I was told on day one, along with forty other things. Maybe it's written on me somewhere.")] },
          ],
        },
      },
      itemUses: {
        // DRAFT:
        [lanyard.id]: [{ effects: [say("The lock wants a number, not a lanyard. Though the number IS on the lanyard. I should probably read it.")] }],
      },
    },
    {
      id: 'intercom',
      name: 'Intercom',
      bounds: { x: 1156, y: 242, width: 72, height: 94 },
      interactionPoint: { x: 1165, y: 488 },
      verbs: {
        // DRAFT:
        look: says('The staff intercom to the Lair. A label: "FOR EMERGENCIES ONLY." Someone has added: "AND REGINALD\'S NOTES."'),
        talk: {
          label: 'Press TALK',
          responses: [{ effects: [{ type: 'startDialogue', dialogueId: intercomDialogue.id }] }],
        },
      },
    },
  ],
};
