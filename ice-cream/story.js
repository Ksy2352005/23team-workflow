// The Brave Flavour: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper; the captions' words are in captions.js).
export const STORY = 70.9, DUR = 73.1;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom, clock = a clock-hand wipe for "a few days passed")
export const SHOTS = [[0, 'invent', 'cut'], [3.25, 'combo', 'punch'], [7.75, 'offer', 'whip'], [12.3, 'plain', 'punch'], [15.6, 'days', 'clock'], [20.05, 'idea', 'punch'],
  [22.85, 'erase', 'whip'], [25.8, 'question', 'punch'], [30.6, 'crowd', 'whip'], [34.2, 'q1', 'punch'], [37.5, 'q2', 'punch'], [40.55, 'taste', 'whip'],
  [44.55, 'back', 'whip'], [49.3, 'same', 'punch'], [51.25, 'one', 'punch'], [55.25, 'luck', 'whip'], [57.35, 'curious', 'punch'], [63.7, 'features', 'whip'], [67.7, 'spark', 'punch']];
export const HIT = {
  bulb1: 1.28, choc: 5.28, chili: 6.4, swirl: 6.9, nos: [8.6, 10.16, 11.04], ask: 13.58, hand: 14.4, days: [16.6, 17.4, 18.2], sad: 18.8,
  bulb2: 21.18, wipe: [23.48, 24.9], write: [27.12, 29.6], pepper: 29.0, arrive: [30.9, 31.4, 31.9], qs: [32.62, 32.95, 33.3], q1: 36.14, q2: 38.58,
  spoons: [41.74, 42.2, 42.64], wow: 43.0, bell: 46.4, bell2: 47.24, point: 48.3, check: 50.2, turn: 53.56, dice: 55.96, nope: 56.5,
  pass: 57.6, notice: 58.9, tryit: 59.6, ignore: 61.9, unroll: [64.54, 66.32], roll: 66.9, glow: 68.6,
  whips: [7.75, 22.85, 30.6, 40.55, 44.55, 55.25, 63.7], punches: [3.25, 12.3, 20.05, 25.8, 34.2, 37.5, 49.3, 51.25, 57.35, 67.7], clocks: [15.6],
};
