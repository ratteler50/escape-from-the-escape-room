import type { Character, Dialogue, Hotspot, HotspotVerbs, Item, Response } from '../core/types';
import { line, say, setFlag } from './dsl';

export const reginald: Character = { id: 'reginald', name: 'Reginald', color: '#b9f5a0' };

export const script: Item = {
  id: 'script',
  name: "Reginald's Script",
  // DRAFT:
  look: 'Act One, Scene One. His cue: "Rise, foul creature, and face me!" The margins say PAUSE FOR APPLAUSE eleven times.',
  action: {
    label: 'Memorise',
    responses: [
      {
        effects: [
          // DRAFT:
          say('"Rise, foul creature, and face me." Rise, foul creature... and face me. Got it. Word perfect.'),
          // DRAFT:
          say('Handbook Section 3: lost property must be returned. I pop the script back in his coffin.'),
          { type: 'removeItem', itemId: 'script' },
          setFlag('knowsCue'),
        ],
      },
    ],
  },
};

const R = (text: string) => line(reginald.id, text);

// Reginald is two hotspots, on the throne and on his spotlight mark, with opposite conditions.
// They share their verbs and item uses so he behaves the same wherever he is.
const verbs: HotspotVerbs = {
  look: {
    responses: [
      // DRAFT:
      { when: [{ flag: 'reginaldLeftThrone' }], effects: [say('Reginald, standing on his spotlight mark, waiting for a spotlight that was never installed.')] },
      // DRAFT:
      { effects: [say("Reginald Vantablack-Thorne, the Lich Lord. Actually undead now. He's never looked happier.")] },
    ],
  },
  talk: {
    label: 'Address His Undeadness',
    responses: [{ effects: [{ type: 'startDialogue', dialogueId: 'reginald' }] }],
  },
};

const itemUses: Partial<Record<string, Response[]>> = {
  // DRAFT:
  garyArm: [{ effects: [R("Put that back! Gary is a member of the cast!"), say('Gary seems fine with it.')] }],
  // DRAFT:
  script: [{ effects: [R('My script! ...Keep it, darling. Learn it! Nobody learns their lines any more.')] }],
  riddleScroll: [
    {
      effects: [
        // DRAFT:
        R('A MISPRINT? In MY lair? Do you know how many nights I have stood here while guests read THAT?'),
        // DRAFT:
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
  bounds: { x: 600, y: 210, width: 80, height: 190 },
  interactionPoint: { x: 640, y: 460 },
  verbs,
  itemUses,
};

export const reginaldOnMark: Hotspot = {
  id: 'reginaldOnMark',
  name: 'Reginald',
  character: reginald.id,
  when: [{ flag: 'reginaldLeftThrone' }],
  bounds: { x: 380, y: 220, width: 70, height: 200 },
  interactionPoint: { x: 415, y: 470 },
  verbs,
  itemUses,
};

export const reginaldDialogue: Dialogue = {
  id: 'reginald',
  start: 'hub',
  greeting: [
    {
      when: [{ has: 'garyArm' }, { notFlag: 'reginaldSawArm' }],
      // DRAFT:
      effects: [R("Is that... GARY'S ARM? Gary is a member of the cast! ...Well. The show must go on."), setFlag('reginaldSawArm')],
    },
    // DRAFT:
    { when: [{ flag: 'reginaldLeftThrone' }], effects: [R('Ah, my audience returns! Come to bask in the afterglow?')] },
    {
      when: [{ has: script.id }],
      effects: [
        // DRAFT:
        R('WHO DARES DISTURB THE LICH LORD? ...Oh. The trainee.'),
        // DRAFT:
        say("I've got his script right here. If only I knew his cue by heart."),
      ],
    },
    // DRAFT:
    { effects: [R('WHO DARES DISTURB THE LICH LORD? ...Oh. The trainee.')] },
  ],
  nodes: {
    hub: {
      options: [
        {
          id: 'who',
          text: 'Who are you?',
          once: true,
          effects: [
            // DRAFT:
            R('I am Mortevayne, Dread Sovereign of the— fine. Reginald Vantablack-Thorne. Classically trained.'),
            // DRAFT:
            R('I once understudied a Hamlet. He never got sick. Not once. Forty-two performances.'),
          ],
          next: 'hub',
        },
        {
          id: 'whatsGoingOn',
          text: "What's going on? Why can't we leave?",
          once: true,
          effects: [
            // DRAFT:
            R('The curse, darling! That phylactery made everything real. I am a genuine lich now.'),
            // DRAFT:
            R('Head office calls it a "cursed incident". I call it a promotion.'),
          ],
          next: 'hub',
        },
        {
          id: 'letMeOut',
          text: 'Can you let me out?',
          once: true,
          effects: [
            // DRAFT:
            R('Break character? Mid-performance? Actors\' union rules, section nine: the show does not stop until the final cue.'),
            setFlag('askedReginaldToLetOut'),
          ],
          next: 'hub',
        },
        {
          id: 'letMeOutAgain',
          text: 'Please can you let me out?',
          when: [{ flag: 'askedReginaldToLetOut' }],
          // DRAFT:
          effects: [R('Section nine, darling.')],
          next: 'hub',
        },
        {
          id: 'handbook',
          text: "Handbook Section 4.2 says you're not allowed to touch the guests.",
          once: true,
          // DRAFT:
          effects: [R('I do not take notes from management. I take notes from the muse.'), say('The muse is not in the Handbook.')],
          next: 'hub',
        },
        {
          id: 'cue',
          text: 'Rise, foul creature, and face me!',
          when: [{ flag: 'knowsCue' }, { notFlag: 'reginaldLeftThrone' }],
          effects: [
            // DRAFT:
            R('...!'),
            // DRAFT:
            R('ARISE! ARIIIISE! Yes! Find your light, Reginald!'),
            setFlag('reginaldLeftThrone'),
            // DRAFT:
            say("He's swept off to his spotlight mark. Which means the Spooky Seat is unguarded."),
          ],
          next: 'end',
        },
        {
          id: 'bye',
          text: "I'll leave you to your... lair.",
          // DRAFT:
          effects: [R('Farewell, mortal! Mind the fourth wall on your way out.')],
          next: 'end',
        },
      ],
    },
  },
};
