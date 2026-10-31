// The Flower Shop: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper; the captions' words are in captions.js).
export const STORY = 83.9, DUR = 86.1;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom, clock = a clock-hand wipe for "the next day", dream = a soft dissolve into or out of an imagined moment)
export const SHOTS = [[0, 'shop', 'cut'], [2.7, 'market', 'whip'], [4.9, 'arrange', 'punch'], [6.35, 'window', 'punch'], [8.45, 'passby', 'whip'], [12.3, 'girl', 'whip'],
  [15.5, 'ask', 'punch'], [18.2, 'answer', 'punch'], [23.8, 'think', 'whip'], [26.85, 'idea', 'punch'], [31.3, 'smile', 'punch'], [33.2, 'write', 'clock'],
  [36.25, 'card1', 'punch'], [39.7, 'card2', 'whip'], [44.85, 'change', 'whip'], [47.15, 'enter', 'whip'], [51.25, 'gift', 'dream'], [55.8, 'same', 'dream'],
  [59.5, 'meaning', 'punch'], [63.1, 'whyq', 'whip'], [65.5, 'product', 'punch'], [69.3, 'heartbuy', 'punch'], [73.9, 'unchanged', 'whip'], [78.85, 'see', 'whip']];
export const HIT = {
  open: .3, crate: [2.9, 4.6], stems: [5.0, 5.3, 5.6, 5.9, 6.1], ribbon: 6.2, place: [6.6, 7.1, 7.6], passers: [8.6, 9.6, 10.6],
  bell: 12.5, girlwalk: [12.6, 14.0], ask: 15.7, shrug: 20.3, plain: 22.25, chin: 24.5, bulb: 25.7, idea: 27.0, bright: 29.5, smile: 31.88,
  wipe: 33.2, write: [34.2, 35.6], card1: 36.4, mosoly: 38.26, card2: 39.9, heart: 43.0, glowup: 45.6, bells: [47.6, 48.6, 49.6], gift: 53.74, joy: 54.8,
  eq: 57.3, tags: [60.14, 60.45, 60.75, 61.05, 61.56], q: 63.78, price: 67.32, cross: 68.4, heartbig: 70.14, unchanged: 74.86, check: 77.18, look: [79.6, 80.4, 80.96], why: 81.88,
  whips: [2.7, 8.45, 12.3, 23.8, 39.7, 44.85, 47.15, 63.1, 73.9, 78.85], punches: [4.9, 6.35, 15.5, 18.2, 26.85, 31.3, 36.25, 59.5, 65.5, 69.3], dreams: [51.25, 55.8], clocks: [33.2],
};
