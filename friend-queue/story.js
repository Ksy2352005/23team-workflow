// The Queue: timing. The voice is the supplied Hungarian voiceover at 1.15x (pitch kept), 86.3 s.
export const STORY = 86.4, DUR = 88.6;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
// [start, shot, transition into it]
export const SHOTS = [[0, 'street', 'cut'], [8.2, 'idea', 'whip'], [13.5, 'call', 'whip'], [24.1, 'morning', 'whip'], [29.0, 'man', 'whip'], [38.9, 'decide', 'punch'], [44.5, 'more', 'whip'], [48.4, 'owner', 'whip'], [53.0, 'nobody', 'whip'], [60.4, 'think', 'punch'], [66.9, 'why', 'punch'], [69.6, 'social', 'whip'], [79.0, 'final', 'whip']];
// the beats, on the words of the voice
export const HIT = {
  tired: 1.36, passers: [3.0, 3.45, 3.9, 4.35], rival: 6.1,
  think: 8.9, spark: 9.88, board: 11.06, plan: [11.54, 11.76, 12.18],
  phone: 13.68, friends: [14.22, 14.36, 14.5], planB: 16.28, gather: 17.14, wait: 19.68, agree: [22.34, 22.55, 22.8],
  stand: 25.44, chat: 27.32, chats: [27.32, 27.9, 28.4],
  manWalk: [30.48, 32.4], empty: 35.2, queueGlow: 37.06,
  look: [40.3, 41.6], go: [42.3, 43.62],
  joiners: [45.94, 46.5],
  happy: 49.78, wink: 52.28,
  qs: 57.06, reveal: 58.36,
  stars: 63.24, plate: 64.44, worth: 66.06,
  qform: [67.4, 68.6],
  crowd: 70.5, follow: 72.48, count: 74.92, good: 78.02,
  products: 79.3, howMany: 82.8, pick: [84.68, 85.5],
  whips: [8.2, 13.5, 24.1, 29.0, 44.5, 48.4, 53.0, 69.6, 79.0], punches: [38.9, 60.4, 66.9],
};
