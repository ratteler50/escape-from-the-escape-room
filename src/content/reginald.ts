import type { Dialogue, Hotspot, HotspotVerbs, Item, Response } from '../core/types';
import { reginald, R } from './cast';
import { removeItem, say, setFlag, sound, startDialogue, walk } from './dsl';
import type { ContentPack } from './pack';
import { handbook } from './handbook';


export const script: Item = {
  id: 'script',
  name: "Reginald's Script",
  icon: 'assets/icons/script.webp',
  look: 'Act One, Scene One. His cue: "Rise, foul creature, and face me!" The margins say PAUSE FOR APPLAUSE nine times. The last page: "FINALE: The guest escapes THROUGH THE GIFT SHOP and purchases a souvenir. CURTAIN." Head office has underlined "souvenir" twice.',
  action: {
    label: 'Memorise',
    responses: [
      {
        effects: [
          say('"Rise, foul creature, and face me!" Rise, foul creature... and face me! Got it. Word perfect.'),
          say('Handbook Section 3: lost property must be returned. I pop the script back in his coffin.'),
          removeItem('script'),
          setFlag('learnedCue'),
        ],
      },
    ],
  },
};


// Reginald is two hotspots, on the throne and on his spotlight mark, with opposite conditions.
// They share their verbs and item uses so he behaves the same wherever he is.
const verbs: HotspotVerbs = {
  look: {
    responses: [
      { when: [{ flag: 'reginaldLeftThrone' }], effects: [say('Reginald, standing on his mark in the dark, while his spotlight lovingly illuminates Gary.')] },
      { effects: [say("Reginald Vantablack-Thorne, the Lich Lord. Actually undead now. He's never looked happier.")] },
    ],
  },
  talk: {
    label: 'Address His Undeadness',
    responses: [{ effects: [startDialogue('reginald')] }],
  },
};

const itemUses: Partial<Record<string, Response[]>> = {
  [handbook.id]: [{ effects: [R("Darling, I have a union contract. It's longer than that, and it has a better plot.")] }],
  garyArm: [{ effects: [R("Unhand that limb! Gary has a CONTRACT!"), say('Gary seems fine with it.')] }],
  script: [{ effects: [R('My script!\n...Keep it, darling. Learn it! Nobody learns their lines any more.')] }],
  riddleScroll: [
    {
      effects: [
        R('A MISPRINT? In MY lair? Do you know how many nights I have stood here while guests read THAT?'),
        R('Nobody ever escaped, and they all blamed my performance. I shall be writing to head office. In blood. Well, red pen.'),
      ],
    },
  ],
};

export const reginaldOnThrone: Hotspot = {
  id: 'reginald',
  name: 'Reginald',
  character: reginald.id,
  when: [{ notFlag: 'reginaldLeftThrone' }],
  pose: 'seated',
  // Centred on the painted throne (its box spans x 515-737, centre 626), his body only: the seated
  // sprite (230 px tall) sits with its feet at this box's bottom-centre.
  bounds: { x: 588, y: 220, width: 80, height: 230 },
  interactionPoint: { x: 626, y: 465 },
  verbs,
  itemUses,
};

export const reginaldOnMark: Hotspot = {
  id: 'reginaldOnMark',
  name: 'Reginald',
  character: reginald.id,
  when: [{ flag: 'reginaldLeftThrone' }],
  // Feet on the painted mark (405, 455). Narrow, his body only (the sprite is 265 px tall), so the
  // phylactery's plinth just to his right stays clickable.
  bounds: { x: 377, y: 190, width: 56, height: 265 },
  interactionPoint: { x: 470, y: 488 },
  verbs,
  itemUses,
};

export const reginaldDialogue: Dialogue = {
  id: 'reginald',
  start: 'hub',
  greeting: [
    {
      when: [{ has: 'garyArm' }, { notFlag: 'reginaldSawArm' }],
      effects: [R("Is that... GARY'S ARM? Gary is a member of the cast!\n...Well. The show must go on."), setFlag('reginaldSawArm')],
    },
    { when: [{ flag: 'reginaldLeftThrone' }], effects: [R('Ah, my audience returns! Come to bask in the afterglow?')] },
    {
      when: [{ has: script.id }],
      effects: [
        R('WHO DARES DISTURB THE LICH LORD?\n...Oh. The trainee.'),
        say("I've got his script right here. If only I knew his cue by heart."),
      ],
    },
    { effects: [R('WHO DARES DISTURB THE LICH LORD?\n...Oh. The trainee.')] },
  ],
  nodes: {
    hub: {
      options: [
        {
          id: 'who',
          text: 'Who are you?',
          once: true,
          effects: [
            R('I am Mortevayne, Dread Sovereign of the—\nfine. Reginald Vantablack-Thorne. Classically trained.'),
            R('I once understudied a Hamlet. He never got sick. Not once. Forty-two performances.'),
          ],
          next: 'hub',
        },
        {
          id: 'whatsGoingOn',
          text: "What's going on? Why can't we leave?",
          once: true,
          effects: [
            R('The curse, darling! That phylactery made everything real. I am a genuine lich now.'),
            R('Head office\'s incident form has two boxes: "slip" and "trip". I ticked "other". I call it a promotion.'),
          ],
          next: 'hub',
        },
        {
          id: 'letMeOut',
          text: 'Can you let me out?',
          once: true,
          effects: [
            R('Break character? Mid-performance? Actors\' union rules, section nine: the show does not stop until the final cue.'),
            setFlag('askedReginaldToLetOut'),
          ],
          next: 'hub',
        },
        {
          id: 'letMeOutAgain',
          text: 'Please can you let me out?',
          when: [{ flag: 'askedReginaldToLetOut' }],
          effects: [R('Section nine, darling.')],
          next: 'hub',
        },
        {
          id: 'handbook',
          text: "Handbook Section 4.2 says you're not allowed to touch the guests.",
          once: true,
          effects: [R('I do not take notes from management. I take notes from the muse.'), say('The muse is not in the Handbook.')],
          next: 'hub',
        },
        {
          id: 'cue',
          text: 'Rise, foul creature, and face me!',
          when: [{ flag: 'learnedCue' }, { notFlag: 'reginaldLeftThrone' }],
          effects: [
            R('...!'),
            sound('arise'),
            R('ARISE! ARIIIISE! Yes! Find your light, Reginald!'),
            // To his spotlight mark: the feet of the reginaldOnMark hotspot.
            walk(reginald.id, 405, 455),
            setFlag('reginaldLeftThrone'),
            R('Behold, mortal, as the light finds me and—\n...Gary?'),
            R('I am ON my mark! The light is meant to fall HERE. Instead it is lovingly illuminating a man with no lines, over THERE!'),
            R('Fine. FINE. A true professional holds his mark in the dark. Whoever rigged that is getting a strongly worded note.'),
            say("He's sulking on his mark, in the dark. Which means the Spooky Seat is unguarded."),
          ],
          next: 'end',
        },
        {
          id: 'bye',
          text: "I'll leave you to your... lair.",
          effects: [R('Farewell, mortal! Mind the fourth wall on your way out.')],
          next: 'end',
        },
      ],
    },
  },
};

export const reginaldPack: ContentPack = {
  items: [script],
  dialogues: [reginaldDialogue],
  combinations: [{ items: [handbook.id, script.id], responses: [{ effects: [say('Two rule books. The Handbook says the show stops for emergencies. The script says the show must go on. The curse sided with the script.')] }] }],
};
