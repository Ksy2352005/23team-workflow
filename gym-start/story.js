// The First Step: timing. The voice is the supplied Hungarian voiceover at 1.15x (pitch kept), 69.2 s.
export const STORY = 69.3, DUR = 71.5;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
// [start, shot, transition into it]
export const SHOTS = [[0, 'street', 'cut'], [9.7, 'gym1', 'whip'], [21.4, 'gym2', 'whip'], [29.7, 'talk', 'punch'], [35.6, 'plan', 'whip'], [47.5, 'psych', 'punch'], [51.2, 'weigh', 'whip'], [60.4, 'got', 'punch'], [63.2, 'final', 'whip']];
// the beats, on the words of the voice
export const HIT = {
  clone: [1.08, 1.7], icons: [2.9, 3.94, 5.32], walkers: [5.7, 6.0, 6.3, 6.6, 6.9], push: 8.55, her: 8.65,
  enter: 10.32, talk: 12.38, b1: 13.22, b2: 13.98, b3: 15.6, flood: [16.1, 16.3, 16.5, 16.7, 16.9], leave: 18.22, stop: 19.0, tangle: 19.42, out: 20.5,
  enter2: 22.16, fan: 24.8, fold: 26.12, one: 27.36, q: 28.2,
  ask: 30.0, fit: 32.4, where: 34.24,
  morph: 36.18, coachIn: 37.4, s1: 39.9, s2: 41.0, s3: 43.1, step: 45.2, brave: 46.52,
  head: 49.52, mkt: 50.28,
  offer: 53.48, gauge: [56.28, 57.2], stepf: 58.6,
  got: 61.22,
  card: 64.8, show: 67.08, go: 68.0,
  whips: [9.7, 21.4, 35.6, 51.2, 63.2], punches: [29.7, 47.5, 60.4],
};
