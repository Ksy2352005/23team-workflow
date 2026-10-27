// The Named Cup: shot times and sound cues, on the voiceover at 1.25× (refs/voiceover-hu-x1.25.mp3, word times from Whisper).
export const STORY = 39.3, DUR = 41.5;   // the story, then the locked 23 end card on dark blue
export const NAME = 'Bence';             // the boy's name, written on his cup
export const SHOTS = [[0, 'intro', 'cut'], [3.4, 'plain', 'punch'], [6.8, 'row', 'whip'], [9.6, 'ask', 'whip'], [14.3, 'think', 'punch'], [17.9, 'write', 'whip'],
  [22.3, 'smile', 'punch'], [23.6, 'same', 'whip'], [28.5, 'special', 'punch'], [32.1, 'buy', 'whip'], [34.6, 'detail', 'punch']];
export const HIT = {
  bell: .1, look: 1.6, glint: 2.3, shrug: 3.85, tag: 5.5, passers: [7.0, 7.75, 8.5],
  whips: [6.8, 9.6, 17.9, 23.6, 32.1], punches: [3.4, 14.3, 22.3, 28.5, 34.6],
  seller: 10.0, bubble: 12.3, cloud: 14.6, nod: 16.75, clock: 18.05, write: [19.0, 20.6], hands: 20.7, shine: 21.42,
  smile: 22.6, giggle: 23.15, pulse: 24.22, dims: [26.4, 26.8, 27.2, 27.6, 28.0], rise: 28.7, heart: 30.72, coin: 32.95, ching: 33.3,
  lens: 34.9, reveal: 35.7, others: 36.9,
};
