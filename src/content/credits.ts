// What the title screen's Credits panel says: a short summary of CREDITS.md (which lists every file).
// Kevin MacLeod's music is CC BY 4.0, which asks for credit where players can see it, so every track
// is named; credits.test.ts checks this list against CREDITS.md.
export const credits = {
  art: 'Art: generated for this game with Canva and ChatGPT, from layouts and prompts in the repo.',
  music: {
    by: 'Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 (creativecommons.org/licenses/by/4.0):',
    tracks: ['Netherworld Shanty', 'Graveyard Shift', 'Local Forecast - Elevator', 'Sneaky Snitch', 'Der Kleber Sting', 'Toccata and Fugue in D Minor'],
  },
  sounds: 'Sound effects: Kenney (kenney.nl), CC0.',
  made: 'Made with Phaser and Claude Code.',
};
