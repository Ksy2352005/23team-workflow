// Name It: shot times and sound cues, on the voiceover at 1.10× (refs/voiceover-hu-x1.10.mp3, word times from Whisper; the captions' words are in captions.js).
export const STORY = 74.5, DUR = 76.7;   // the story, then the locked 23 end card on dark blue
export const VO = 'refs/voiceover-hu-x1.10.mp3';
// shots: start, name, and the way in (cut, whip = a fast slide with motion blur, punch = a snap zoom, clock = a clock-hand wipe for "the next day", dream = a soft dissolve into the world inside a scoop)
export const SHOTS = [[0, 'kiosk', 'cut'], [4.5, 'labels', 'punch'], [7.8, 'sign', 'whip'], [14.6, 'girl', 'whip'], [17.2, 'taste', 'punch'], [20.3, 'name1', 'dream'],
  [22.5, 'nextday', 'clock'], [27.25, 'name2', 'dream'], [29.0, 'menu', 'whip'], [35.4, 'queue', 'whip'], [39.6, 'create', 'punch'], [43.9, 'wall', 'whip'],
  [51.5, 'spark', 'punch'], [53.9, 'build', 'whip'], [62.3, 'sell', 'whip'], [68.9, 'together', 'punch']];
export const HIT = {
  decide: 1.52, idea: 2.7, label: 5.88, labelx: 7.0, write: [8.3, 9.9], first: 10.36, tag: 13.42, girl: [14.8, 16.2],
  spoon: 17.6, yum: 18.1, bubble: 19.4, name1: 20.54, man: [22.9, 24.2], spoon2: 24.7, name2: 27.4, names: [20.54, 27.4, 32.76, 33.96], q: [35.6, 36.4, 37.2, 38.0],
  picks: [40.5, 40.8, 41.1, 41.4], mix: 42.0, pen: 42.6, cards: [44.5, 45.2, 45.9, 46.6, 47.3, 48.0], notice: 45.12, story: 49.14, spark: 52.76,
  hands: [55.18, 56.44], thread: 58.22, stars: [59.96, 60.3, 60.64], trade: 64.18, coin: 65.84, cross: 67.3, chalk: 69.82, writes: [70.66, 72.4], glow: 73.36,
  whips: [7.8, 14.6, 29.0, 35.4, 43.9, 53.9, 62.3], punches: [4.5, 17.2, 39.6, 51.5, 68.9], clocks: [22.5], dreams: [20.3, 27.25],
};
