// Story 19, The Store That Built a Home: timing. The voice is ElevenLabs "David" (Hungarian, eleven_v3) at 1.15x, pitch kept, 67.4 s.
// A furniture shop shows its pieces one by one and nobody buys; it builds real rooms instead, and people picture their own home and buy more.
import { WORDS } from './captions.js';
const T = i => WORDS[i][1];
export const STORY = 68.0, DUR = 70.2;
export const TS = 1;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
export const SHOTS = [[0, 'shop', 'cut'], [8.0, 'browse', 'soft'], [13.3, 'imagine', 'soft'], [19.55, 'decide', 'whip'], [29.1, 'living', 'soft'], [32.8, 'bedroom', 'whip'], [36.2, 'decor', 'whip'], [41.2, 'enter', 'soft'], [49.2, 'sales', 'whip'], [56.8, 'lesson', 'soft'], [62.2, 'finale', 'soft']];
// the beats, on the words of the voice
export const HIT = {
  owner: T(1), months: [T(3), T(3) + .35, T(3) + .7], items: [T(9), T(10), T(11), T(13)], tidy: [T(14), T(14) + .35, T(14) + .7, T(14) + 1.05],
  enter: T(23) - .5, ask: T(24), answer: T(26), leave: T(28), sad: T(30),
  idea: T(33), ghost: T(39), q: T(41), nohome: T(47),
  decide: T(50), shuffle: T(53), apart: [T(58), T(59), T(60), T(61)], walls: T(65), group: T(66), home: T(71),
  sofa: T(75), table: T(76), rug: T(77), lamp: T(79), bed: T(81), stand: T(83), robe: T(85),
  books: T(87), deco: T(89), frame: T(91), warm: T(96),
  door: T(101) - .9, see: T(107), wide: T(109), sit: T(111), heart: T(116), buy: T(118),
  notice: T(125), more: T(130), receipt: [T(134), T(135), T(136), T(138)],
  lone: T(140), qq: T(148), alone: T(152),
  build: [T(156), T(156) + .3, T(157), T(157) + .3, T(158)], walkin: T(159), sit2: T(164), end: T(165),
  whips: [8.0, 13.3, 19.55, 29.1, 32.8, 36.2, 41.2, 49.2, 56.8, 62.2],
  kicks: [T(7), T(30), T(33), T(50), T(66), T(96), T(107), T(116), T(130), T(152), T(164)],
};
