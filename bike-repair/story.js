// Story 21, The Bike Shop That Fixed Instead of Selling: timing. The voice is ElevenLabs "David" (Hungarian, eleven_v3) at 1.15x, pitch kept, 62.0 s.
// A bike shop asks what's wrong with your bike instead of pushing new ones; repair customers come back to buy, and bring friends.
import { WORDS } from './captions.js';
const T = i => WORDS[i][1];
export const STORY = 62.6, DUR = 64.8;
export const TS = 1;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
export const SHOTS = [[0, 'prices', 'cut'], [8.2, 'decide', 'soft'], [11.0, 'pitch', 'soft'], [16.6, 'ask', 'whip'], [19.3, 'fix', 'soft'], [25.4, 'service', 'whip'], [31.8, 'doubt', 'soft'], [36.2, 'later', 'whip'], [39.7, 'back', 'soft'], [49.7, 'lesson', 'soft']];
export const HIT = {
  notice: T(3), want: T(8), newb: T(9), price: T(15), away: T(17), dec: T(23), newest: T(33), first: T(37), ask: T(38), what: T(41),
  part: T(51), service: T(57), again: T(58), repair: T(66), maint: T(68), nothing: T(76), staff: T(82), hurt: T(87), months: T(95), interesting: T(98),
  ret: T(104), acc: T(108), gear: T(109), newbike: T(113), friends: T(118), recommend: T(120), realise: T(125), sale: T(130), notfirst: T(135), help: T(139), reason: T(149), trust: T(158),
  whips: [8.2, 11.0, 16.6, 19.3, 25.4, 31.8, 36.2, 39.7, 49.7],
  kicks: [T(15), T(23), T(37), T(51), T(58), T(66), T(87), T(98), T(113), T(125), T(158)],
};
