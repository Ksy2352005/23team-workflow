// Seen Again: timing. The voice is the supplied Hungarian voiceover at 1.22x (pitch kept), 41.2 s.
// Her story: a skincare brand she keeps seeing on her phone, until it's the first she reaches for.
export const STORY = 41.20, DUR = 43.40;
export const VO = 'refs/voiceover-hu-x1.22.mp3';
export const SHOTS = [[0, 'split', 'cut'], [5.9, 'recog', 'whip'], [15.15, 'mirror', 'whip'], [18.3, 'product', 'punch'], [19.85, 'shop', 'whip'], [23.75, 'eye', 'punch'], [27.4, 'chart', 'whip'], [36.2, 'finale', 'whip']];
// the beats, on the words of the voice
export const HIT = {
  seen: 1.68, insta: 2.62, never: 4.1,
  unk: 6.02, q: 7.6, second: 9.59, memo: 10.31, few: 12.03, name: 13.35, bell: 13.95,
  need: 15.3, empty: 16.35, dry: 17.01, product: 17.63, offers: 18.79,
  mind: 20.06, first: 21.93, take: 22.5,
  term: 23.87, mere: 25.67,
  chart: 27.53, again: [29.23, 29.7, 29.98, 30.66], grow: 31.63, like: 34.72,
  regular: 36.36, rhythm: 38.36, audience: 39.58, end: 40.35,
  whips: [5.9, 15.15, 19.85, 27.4, 36.2], punches: [18.3, 23.75], dives: [], rises: [],
  kicks: [1.68, 2.62, 4.1, 9.59, 10.31, 12.03, 12.63, 13.23, 13.95, 16.35, 18.79, 21.93, 25.67, 29.23, 29.7, 29.98, 30.66, 32.63, 35.72, 39.58],
};
