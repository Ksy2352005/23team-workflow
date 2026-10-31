// The Bread Clock: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper; the captions' words are in captions.js).
export const STORY = 59.4, DUR = 61.6;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom, clock = a clock-hand wipe)
export const SHOTS = [[0, 'dawn', 'cut'], [3.85, 'leftover', 'whip'], [8.6, 'decide', 'punch'], [14.3, 'meter', 'whip'], [21.3, 'special', 'punch'], [23.7, 'clockface', 'clock'],
  [31.8, 'meals', 'whip'], [38.2, 'instead', 'whip'], [47.0, 'arrive', 'punch'], [52.6, 'ending', 'whip']];
export const HIT = {
  into: 1.3, pour: [1.66, 1.9, 2.1, 2.3, 2.5, 2.7, 2.9, 3.1], sunarc: [4.1, 7.3], buys: [4.8, 5.9], sad: 7.4, bulb: 10.16, flip: 11.34, flipped: 12.32,
  orders: [15.2, 16.24, 17.86, 18.58, 19.18], full: 19.62, fire: 20.12, special: 22.58, tokens: [26.96, 27.58, 28.0], hands: [28.48, 29.42], ding: 30.7,
  morning: 32.48, noon: 35.46, night: 36.82, stale: 39.48, cross: 41.82, pins: [43.46, 43.78, 44.42, 44.9, 45.2], plan: 49.86, walk: [50.3, 51.5], ding2: 51.5, hand: 51.88,
  bin: 54.94, back: [56.15, 56.95, 57.75], glow: 58.34,
  whips: [3.85, 14.3, 31.8, 38.2, 52.6], punches: [8.6, 21.3, 47.0], clocks: [23.7],
};
