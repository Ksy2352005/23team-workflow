// The Wrapped Books: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper; the captions' words are in captions.js).
export const STORY = 67.8, DUR = 70.0;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom)
export const SHOTS = [[0, 'shop', 'cut'], [5.4, 'known', 'punch'], [8.9, 'dusty', 'whip'], [12.7, 'idea', 'punch'], [16.9, 'wrap', 'whip'], [21.7, 'write', 'punch'],
  [24.5, 'heart', 'punch'], [27.9, 'dawn', 'whip'], [30.9, 'know', 'whip'], [34.6, 'mystery', 'whip'], [43.6, 'read', 'whip'], [47.4, 'back', 'whip'],
  [53.5, 'covers', 'whip'], [61.3, 'mirror', 'punch']];
export const HIT = {
  notice: 1.68, grabs: [3.4, 4.5], author: 6.64, cover: 7.6, spider: 10.9, nope: 11.48, bulb: 13.36, planks: [14.1, 14.44, 14.68, 15.3], lamp: 15.86,
  land: 17.38, folds: [17.84, 18.1, 18.4, 18.74], bow: 19.2, hide: 20.44, write: [22.44, 23.3], crack: 26.1, door: 29.26, sun: 29.86, smug: 32.42, oops: 33.66,
  shake: [35.66, 36.14, 36.62], q: 36.0, fit: 41.22, fill: 41.6, pages: [44.3, 44.9, 45.5, 46.1], close: 47.0, bell: 47.54, hover: 49.1, fate: 52.42,
  flyin: [55.52, 56.52, 57.7], fade: 60.66, mirror: 64.2, pull: 65.4,
  whips: [8.9, 16.9, 27.9, 30.9, 34.6, 43.6, 47.4, 53.5], punches: [5.4, 12.7, 21.7, 24.5, 61.3],
};
