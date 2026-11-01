// The Map in the Lobby: timing. The voice is the supplied Hungarian voiceover at 1.20x (pitch kept), 89.8 s.
export const STORY = 90.0, DUR = 92.2;
export const VO = 'refs/voiceover-hu-x1.20.mp3';
// [start, shot, transition into it]
export const SHOTS = [[0, 'arrive', 'cut'], [8.42, 'list', 'whip'], [15.91, 'mapup', 'punch'], [23.23, 'pin', 'whip'], [31.21, 'fill', 'clock'], [37.08, 'buzz', 'punch'], [45.43, 'neighbour', 'whip'], [51.47, 'bar', 'whip'], [54.48, 'magnet', 'punch'], [62.81, 'trust', 'whip'], [72.75, 'smart', 'punch'], [80.56, 'ending', 'whip']];
// the beats, on the words of the voice
export const HIT = {
  into: 2.4, guests: [3.31, 3.52, 3.74], asks: [4.04, 4.45, 4.9], quote: 5.8, nope: 7.24,
  unroll: 11.02, icons: [12.7, 12.89, 13.08], toss: 14.14, spark: 15.04,
  map: 16.58, tacks: [17.74, 17.94], ghosts: 20.74, poofs: [22.06, 22.14, 22.27],
  enter: 23.3, drop: 25.24, write: [27.64, 28.48], heart: 28.76, leave: [29.96, 30.91],
  rain: [31.45, 31.77, 32.09, 32.41, 32.73, 33.05, 33.38, 33.70, 34.02, 34.34, 34.66, 34.98, 35.30], local: 34.92, wow: 35.74,
  bang: 38.06, lift: 39.8, walkers: [40.19, 40.88, 41.58], glow2: 44.34,
  exit: 46.78, walk: [47.12, 49.22], enter2: 49.29, look: 50,
  slide: 52.42, take: 53.1, clink: 53.6,
  path: [56.09, 59.09], arrive: [61.04, 61.43], pull: 61.84,
  note: 64.06, like: [67.06, 67.56, 64.49], ad: 68.98, tip: 71.76,
  wink: 74.84, star: 75.24, olds: [77.36, 77.62, 77.87], arcs: [78.32, 78.62, 78.92], news: [79.22, 79.47, 79.68],
  inout: [80.9, 81.76, 82.81], rise: [84, 86.1], part: 86.5, come: [87.94, 88.37], glow: 89.1,
  whips: [8.42, 23.23, 45.43, 51.47, 62.81, 80.56], punches: [15.91, 37.08, 54.48, 72.75], clocks: [31.21],
};
