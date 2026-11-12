// Story 22, The Store That Sold Products in Unexpected Bundles: timing. The voice is ElevenLabs "David" (Hungarian, eleven_v3) at 1.15x, pitch kept, 56.3 s.
// A kitchen shop's forgotten tools sell once they are packed into kits for beginners, birthday cakes and dessert lovers.
import { WORDS } from './captions.js';
const T = i => WORDS[i][1];
export const STORY = 56.9, DUR = 59.1;
export const TS = 1;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
export const SHOTS = [[0, 'store', 'cut'], [4.4, 'dusty', 'soft'], [9.9, 'onething', 'soft'], [16.6, 'decide', 'whip'], [22.0, 'bundles', 'soft'], [31.6, 'match', 'whip'], [37.0, 'easy', 'soft'], [42.8, 'sold', 'whip'], [48.4, 'lesson', 'soft']];
export const HIT = {
  bad: T(8), items: [T(11), T(14), T(17)], months: T(19), notice: T(25), specific: T(32), come: T(35), rarely: T(37),
  dec: T(45), apart: T(51), kits: T(55), assemble: T(56), kit: [T(59), T(66), T(74)], kitOpen: [T(62), T(69), T(77)],
  fit: T(84), start: T(93), one: T(99), simply: T(103), bought: T(104), sell: T(113), nobody: T(121),
  realise: T(126), problem: T(134), notwant: T(139), butknow: T(145), use: T(147),
  whips: [4.4, 9.9, 16.6, 22.0, 31.6, 37.0, 42.8, 48.4],
  kicks: [T(8), T(19), T(32), T(45), T(56), T(84), T(93), T(104), T(113), T(147)],
};
