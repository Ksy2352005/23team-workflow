// Story 20, The Product Comparison: timing. The voice is ElevenLabs "David" (Hungarian, eleven_v3) at 1.15x, pitch kept, 68.2 s.
// A small vacuum maker stops shouting claims like the big rivals and simply shows both machines on the same rug.
import { WORDS } from './captions.js';
const T = i => WORDS[i][1];
export const STORY = 68.9, DUR = 71.1;
export const TS = 1;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
export const SHOTS = [[0, 'intro', 'cut'], [3.3, 'rivals', 'soft'], [11.5, 'copy', 'soft'], [16.5, 'ignore', 'whip'], [21.6, 'idea', 'soft'], [24.2, 'pair', 'soft'], [31.9, 'test', 'whip'], [41.0, 'simple', 'soft'], [50.4, 'viral', 'whip'], [57.6, 'lesson', 'soft']];
export const HIT = {
  unveil: T(8), boards: T(11), money: T(13), claims: [T(25), T(27), T(30)], decide1: T(36), draft: T(41),
  notice: T(46), noone: T(51), idea: T(61), instead: T(63), pair: T(68), ours: T(75), known: T(80),
  rug: T(86), run: T(87), result: T(95), eyes: T(100), music: T(115), actor: T(118), promise: T(121), two: T(124), compare: T(129),
  views: T(132), heard: T(140), saw: T(147), important: T(155), tell: T(159), why: T(162), enough: T(166), see: T(175),
  whips: [3.3, 11.5, 16.5, 21.6, 24.2, 31.9, 41.0, 50.4, 57.6],
  kicks: [T(8), T(30), T(51), T(61), T(68), T(95), T(129), T(132), T(147), T(175)],
};
