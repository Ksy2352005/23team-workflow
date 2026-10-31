// The Map in the Lobby: timing. The voice is the supplied Hungarian voiceover at 1.80x (pitch kept), 59.8 s.
export const STORY = 60.0, DUR = 62.2;
export const VO = 'refs/voiceover-hu-x1.80.mp3';
// [start, shot, transition into it]
export const SHOTS = [[0, 'arrive', 'cut'], [5.6, 'list', 'whip'], [10.6, 'mapup', 'punch'], [15.1, 'pin', 'whip'], [20.8, 'fill', 'clock'], [24.8, 'buzz', 'punch'], [30.3, 'neighbour', 'whip'], [34.3, 'bar', 'whip'], [36.3, 'magnet', 'punch'], [41.9, 'trust', 'whip'], [48.5, 'smart', 'punch'], [53.6, 'ending', 'whip']];
// the beats, on the words of the voice
export const HIT = {
  into: 1.6, guests: [2.2, 2.35, 2.5], asks: [2.7, 2.95, 3.2], quote: 3.84, nope: 4.82,
  unroll: 7.36, icons: [8.48, 8.6, 8.72], toss: 9.46, spark: 10.02,
  map: 11.06, tacks: [11.84, 11.96], ghosts: 13.82, poofs: [14.58, 14.7, 14.82],
  enter: 15.12, drop: 16.82, write: [18.42, 19.0], heart: 19.16, leave: [19.96, 20.6],
  rain: [20.95, 21.16, 21.37, 21.58, 21.79, 22.00, 22.21, 22.42, 22.63, 22.84, 23.05, 23.26, 23.47], local: 23.3, wow: 24.0,
  bang: 25.38, lift: 26.54, walkers: [26.8, 27.25, 27.7], glow2: 29.56,
  exit: 31.2, walk: [31.4, 32.8], enter2: 32.85, look: 33.34,
  slide: 35.0, take: 35.4, clink: 35.72,
  path: [37.4, 39.4], arrive: [40.68, 40.95], pull: 41.24,
  note: 42.72, like: [44.72, 45.04, 43.0], ad: 46.0, tip: 47.84,
  wink: 49.9, star: 50.16, olds: [51.6, 51.75, 51.9], arcs: [52.2, 52.4, 52.6], news: [52.78, 52.95, 53.1],
  inout: [53.8, 54.5, 55.2], rise: [56.0, 57.4], part: 57.64, come: [58.6, 58.9], glow: 59.4,
  whips: [5.6, 15.1, 30.3, 34.3, 41.9, 53.6], punches: [10.6, 24.8, 36.3, 48.5], clocks: [20.8],
};
