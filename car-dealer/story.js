// Two Salesmen: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper; the captions' words are in captions.js).
export const STORY = 89.0, DUR = 91.2;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom, dream = a soft dissolve into or out of an imagined scene)
export const SHOTS = [[0, 'twins', 'cut'], [3.92, 'sold', 'punch'], [7.3, 'why', 'whip'], [9.1, 'enter', 'whip'], [13.35, 'expert', 'punch'], [16.1, 'features', 'punch'],
  [19.0, 'tenmin', 'whip'], [23.0, 'leave', 'punch'], [25.95, 'meet', 'whip'], [28.9, 'instead', 'punch'], [31.4, 'question', 'punch'], [35.4, 'story', 'whip'],
  [39.05, 'tiny', 'dream'], [41.3, 'safety', 'dream'], [44.2, 'flip', 'whip'], [47.2, 'nomore', 'punch'], [50.9, 'stars', 'whip'], [53.2, 'seats', 'punch'],
  [55.3, 'family', 'dream'], [59.4, 'deal', 'dream'], [63.5, 'mind', 'whip'], [69.1, 'piece', 'punch'], [73.4, 'compare', 'whip'], [80.6, 'what', 'whip'], [85.2, 'whyneed', 'dream']];
export const HIT = {
  car1: .25, car2: .62, eq: 1.8, stamp: 4.55, bubbles: 5.32, doors: 7.9,
  walk: [9.3, 11.3], suv: 11.9, s1: 13.6, point: 14.64, feats: [16.28, 16.94, 17.72], clock: [19.16, 21.9],
  rain: [19.4, 19.65, 19.9, 20.15, 20.4, 20.65, 20.9, 21.15, 21.4, 21.65, 21.9, 22.15], thanks: 23.8, away: [24.66, 25.9],
  wave: 26.6, s2: 27.26, brochure: 29.74, putaway: 30.88, ask: 31.84, miert: 33.44, qpulse: 34.36,
  baby: 37.2, kid2: 38.0, heart: 38.44, squeeze: 39.78, pop: 40.66, shield: 41.78, shine: 42.42,
  turn: 45.54, poofs: [47.9, 48.2, 49.14, 49.68], stars: [51.36, 51.6, 51.84, 52.08, 52.32], seats: [53.28, 54.12], seatok: 54.64,
  fam: [55.5, 55.9, 56.5, 57.3], famheart: 58.52, shake: 60.84, keys: 61.38, sold2: 62.06,
  cards: [65.72, 66.1, 66.5, 66.94, 67.4, 67.8, 68.2], gold: 69.8, click: 71.7, glowup: 72.1,
  left: 73.66, right: 77.18, understood: 77.94, what: [83.78, 84.0, 84.2, 84.4], inside: 85.68, drive: 86.58, love: 87.08,
  whips: [7.3, 9.1, 19.0, 25.95, 35.4, 44.2, 50.9, 63.5, 73.4, 80.6], punches: [3.92, 13.35, 16.1, 23.0, 28.9, 31.4, 47.2, 53.2, 69.1], dreams: [39.05, 41.3, 55.3, 59.4, 85.2],
};
