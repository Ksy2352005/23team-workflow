// The Popcorn Choice, motion-graphics cut: shot times and sound cues, on the voiceover at 1.25× (refs/voiceover-hu-x1.25.mp3, word times from Whisper).
export const STORY = 48.7, DUR = 50.9;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.25.mp3';
// shots: start time, name, and how we get into it (whip = a fast slide with motion blur, punch = a snap zoom, cut)
export const SHOTS = [[0, 'intro', 'cut'], [3.0, 'sizes', 'punch'], [6.5, 'small', 'whip'], [8.75, 'medium', 'whip'], [11.3, 'large', 'whip'], [14.2, 'wanted', 'punch'],
  [17.1, 'sees', 'punch'], [18.2, 'plus', 'whip'], [21.8, 'decide', 'punch'], [25.2, 'overflow', 'punch'], [27.9, 'cashier', 'whip'], [30.15, 'off', 'whip'],
  [32.6, 'question', 'cut'], [35.3, 'strings', 'punch'], [39.7, 'everyone', 'whip'], [43.4, 'podium', 'punch']];
export const HIT = {
  manIn: .05, ticket: .4, bucketIn: 1.3, kernels: [1.9, 2.15, 2.4], sniff: 1.5, mmm: 2.55,
  slams: [4.44, 4.74, 5.0], counts: [7.0, 9.32, 11.9], stamps: [7.38, 9.72, 12.3], whips: [6.5, 8.75, 11.3, 18.2, 27.9, 30.15, 39.7], punches: [3.0, 14.2, 17.1, 21.8, 25.2, 35.3, 43.4],
  check: 15.62, gasp: 17.35, bang: 17.4, arrow: 18.5, chip: 18.72, grow: 20.38, orbit: 22.1, drop: 23.96, burst: 25.5, hehe: 27.35,
  key: 28.4, ching: 29.44, door: 31.6, qdrop: 33.0, strings: 35.5, tug: 36.05, decoy: 36.6, big: 37.44, star: 38.2,
  people: [40.38, 40.74, 41.24, 41.82], buckets: [42.28, 42.4, 42.52, 42.64], rise: [44.6, 44.85, 45.1], point: 46.4, win: 47.58,
};
