// The Gift Box: timing. The voice is the supplied Hungarian voiceover at 1.15x (pitch kept), 49.2 s.
export const STORY = 49.3, DUR = 51.5;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
// [start, shot, transition into it]
export const SHOTS = [[0, 'same', 'cut'], [4.2, 'bag', 'whip'], [8.05, 'box', 'whip'], [12.95, 'equal', 'punch'], [17.15, 'feel', 'whip'], [21.95, 'xray', 'punch'], [25.05, 'handover', 'whip'], [28.15, 'why', 'punch'], [30.05, 'value', 'whip'], [33.35, 'build', 'whip'], [40.65, 'notchange', 'punch'], [46.35, 'final', 'whip']];
// the beats, on the words of the voice
export const HIT = {
  people: [.1, .3], cal: .64, eq0: 2.3, mugs: [2.82, 2.98],
  bagGive: [5.62, 6.54], bagMeh: 7.08,
  boxGive: [8.8, 9.6], sparkle: 9.82, note: [10.94, 11.9], happy: 12.0,
  merge: [14.24, 14.9], tags: [15.64, 15.84], eq1: 16.2,
  spot: 18.06, hearts: [19.26, 19.52, 19.78, 20.04, 20.3],
  scan: [22.6, 23.7], same2: 23.96,
  toss: 25.6, present: 26.12, ring: 26.96,
  qdraw: [28.62, 29.4], qdot: 29.5,
  alone: 30.24, stars0: 31.8, value: 32.28,
  walls: 34.4, lid: 35.2, star4: 35.34, ribbon: 36.26, bow: 36.55, seal: 36.75, tag: 36.96, star5: 36.96, feel: 38.26, burst: 38.66, shine: 39.74,
  aura: [41.36, 43.22], tools: [43.92, 44.18], x1: 44.7, x2: 45.2, ok: 45.6,
  open: 46.6, orbit: 47.38, ring2: 48.12,
  whips: [4.2, 8.05, 17.15, 25.05, 30.05, 33.35, 46.35], punches: [12.95, 21.95, 28.15, 40.65],
};
