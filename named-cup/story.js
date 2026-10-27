// The Named Cup: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper).
export const STORY = 44.6, DUR = 46.8;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
export const NAME = 'Bence';             // the boy's name, written on his cup
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom, clock = a clock-hand wipe for "a few minutes later")
export const SHOTS = [[0, 'intro', 'cut'], [1.8, 'pov', 'punch'], [4.0, 'plain', 'punch'], [7.7, 'row', 'whip'], [11.1, 'ask', 'whip'], [16.4, 'think', 'punch'],
  [20.4, 'write', 'clock'], [25.4, 'smile', 'punch'], [26.9, 'same', 'whip'], [32.4, 'special', 'punch'], [36.5, 'buy', 'whip'], [39.3, 'detail', 'punch']];
export const HIT = {
  bell: .1, focus: 1.95, glint: 2.7, shrug: 4.4, tag: 6.3, passers: [8.0, 8.9, 9.7],
  whips: [7.7, 11.1, 26.9, 36.5], punches: [1.8, 4.0, 16.4, 25.4, 32.4, 39.3],
  seller: 11.4, lean: 12.2, bubble: 13.94, swings: [16.9, 17.4, 17.9, 18.35], yes: 19.02,
  wipe: 20.4, write: [21.6, 23.2], hands: 23.3, shine: 24.34, smile: 25.62, giggle: 26.45,
  pulse: 27.52, dims: [29.8, 30.2, 30.6, 31.0, 31.4], rise: 32.65, heart: 34.9, flip: 37.1, coin: 37.5, ching: 37.9,
  lens: 39.6, reveal: 40.5, others: 41.92,
};
