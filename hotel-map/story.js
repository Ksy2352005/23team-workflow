// The Map in the Lobby: timing. The voice is the supplied Hungarian voiceover at 1.20x (pitch kept), 87.6 s, with a few pauses shortened.
export const STORY = 87.8, DUR = 90.0;
export const VO = 'refs/voiceover-hu-x1.20-tight.mp3';
// [start, shot, transition into it]
export const SHOTS = [[0, 'arrive', 'cut'], [7.82, 'list', 'whip'], [15.31, 'mapup', 'punch'], [22.08, 'pin', 'whip'], [29.86, 'fill', 'clock'], [35.43, 'buzz', 'punch'], [43.48, 'neighbour', 'whip'], [49.52, 'bar', 'whip'], [52.53, 'magnet', 'punch'], [60.86, 'trust', 'whip'], [70.8, 'smart', 'punch'], [78.36, 'ending', 'whip']];
// the beats, on the words of the voice
export const HIT = {
  into: 2.4, guests: [3.31, 3.52, 3.74], asks: [4.04, 4.45, 4.9], quote: 5.5, nope: 6.94,
  unroll: 10.42, icons: [12.1, 12.29, 12.48], toss: 13.54, spark: 14.44,
  map: 15.98, tacks: [17.14, 17.34], ghosts: 19.89, poofs: [21.21, 21.29, 21.42],
  enter: 22.15, drop: 24.09, write: [26.49, 27.33], heart: 27.61, leave: [28.81, 29.76],
  rain: [30.1, 30.42, 30.74, 31.06, 31.38, 31.7, 32.03, 32.35, 32.67, 32.99, 33.31, 33.63, 33.95], local: 33.57, wow: 34.39,
  bang: 36.41, lift: 38.15, walkers: [38.54, 39.23, 39.93], glow2: 42.69,
  exit: 44.83, walk: [45.17, 47.27], enter2: 47.34, look: 48.05,
  slide: 50.47, take: 51.15, clink: 51.65,
  path: [54.14, 57.14], arrive: [59.09, 59.48], pull: 59.89,
  note: 62.11, like: [65.11, 65.61, 62.54], ad: 67.03, tip: 69.81,
  wink: 72.89, star: 73.29, olds: [75.41, 75.67, 75.92], arcs: [76.37, 76.67, 76.97], news: [77.27, 77.52, 77.73],
  inout: [78.7, 79.56, 80.61], rise: [81.8, 83.9], part: 84.3, come: [85.74, 86.17], glow: 86.9,
  whips: [7.82, 22.08, 43.48, 49.52, 60.86, 78.36], punches: [15.31, 35.43, 52.53, 70.8], clocks: [29.86],
};
