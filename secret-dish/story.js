// The Chef's Secret Favourite: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper).
export const STORY = 53.2, DUR = 55.4;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom, clock = a clock-hand wipe for "one evening")
export const SHOTS = [[0, 'hero', 'cut'], [1.9, 'nobody', 'punch'], [3.6, 'chef', 'whip'], [6.3, 'same', 'whip'], [10.7, 'evening', 'clock'], [15.7, 'menu', 'punch'],
  [18.1, 'write', 'punch'], [20.7, 'nextday', 'whip'], [23.3, 'ask', 'punch'], [25.85, 'smile', 'punch'], [28.2, 'tease', 'whip'], [31.45, 'ticket', 'whip'],
  [33.5, 'yum', 'punch'], [34.85, 'friends', 'whip'], [37.55, 'rush', 'punch'], [39.4, 'tables', 'whip'], [41.2, 'recipe', 'whip'], [43.85, 'curious', 'punch'], [48.25, 'curiosity', 'whip']];
export const HIT = {
  lift: .5, tickets: [1.95, 2.3, 2.65, 3.0], days: [4.4, 5.0, 5.6],
  chops: [3.75, 3.87, 3.99, 4.11, 4.23, 4.35], fan: 4.5, puree: 4.95, sauce: [5.15, 5.45], berries: 5.5, herb: 5.75, done: 6.0,
  lands: [6.96, 7.32, 7.98, 8.54], heroIn: 9.2, heroOut: 10.05,
  lamp: 10.95, chin: 12.3, nod: 12.8, pen: 13.55, lower: 14.5,
  penIn: 16.9, write: [18.26, 19.85], star: 20.0,
  glint: 21.65, hand: 22.05, bubble: 23.45, q: [23.98, 24.82],
  smile: 26.46, lean: 27.4, wink: 27.92, tray: 28.35, crack: 29.9, close: 30.65,
  fly: 31.6, clip: 32.36, joy: 32.6, bite: 33.75, mmm: 34.05,
  door: 34.95, rush: [37.65, 37.9, 38.12, 38.32, 38.5, 38.66, 38.8, 38.93], glow: 39.52,
  stamps: [39.5, 39.6, 39.7, 39.8, 39.9, 40.0, 40.1, 40.2, 40.3, 40.4, 40.5, 40.6], pin: 41.35, twin: 41.94, eq: 42.74,
  qs: [44.5, 44.9, 45.3, 45.65], chefUp: 46.0, shh: 46.3, wink2: 47.0,
  crack2: 48.6, qsteam: 49.0, reach: 51.0, open: 52.15,
  whips: [3.6, 6.3, 20.7, 28.2, 31.45, 34.85, 39.4, 41.2, 48.25], punches: [1.9, 15.7, 18.1, 23.3, 25.85, 33.5, 37.55, 43.85],
};
