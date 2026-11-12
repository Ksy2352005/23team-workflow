// Story 24, The Store That Let Customers Stop Choosing: timing. The voice is ElevenLabs "David" (Hungarian, eleven_v3) at 1.15x, pitch kept, 44.9 s.
// An online bookshop swaps endless browsing for a short quiz and one hand-picked book a month.
import { WORDS } from './captions.js';
const T = i => WORDS[i][1];
export const STORY = 45.5, DUR = 47.7;
export const TS = 1;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
export const SHOTS = [[0, 'browse', 'cut'], [5.5, 'toomany', 'soft'], [9.7, 'service', 'soft'], [12.0, 'quiz', 'whip'], [20.2, 'monthly', 'soft'], [24.4, 'nomore', 'whip'], [28.9, 'surprise', 'soft'], [37.0, 'lesson', 'soft']];
export const HIT = {
  hours: T(7), none: T(15), think: T(20), many: T(25), hard: T(28), start: T(31), newsvc: T(33), questions: T(39), genre: T(43), fav: T(49), mood: T(54),
  month: T(60), pick: T(61), send: T(66), address: T(68), hundreds: T(77), interest: T(83), got: T(87), never: T(91), anyway: T(95), fav2: T(98),
  realise: T(102), more: T(108), someone: T(113), simpler: T(115),
  whips: [5.5, 9.7, 12.0, 20.2, 24.4, 28.9, 37.0],
  kicks: [T(15), T(28), T(33), T(61), T(77), T(87), T(98), T(115)],
};
