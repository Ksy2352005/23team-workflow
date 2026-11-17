// Story 25, Hibavadászok (The Company That Paid Customers to Find Faults): timing. The voice is ElevenLabs "David" (Hungarian, eleven_v3) at 1.15x, pitch kept, 58.6 s;
// the call to action (line 1) was spoken in the same request (tools/motion-kit/voice_with_cta.py) and is placed on the end card by mix.py.
// A sneaker maker pays outside runners to report every fault, fixes the shoe, and launches it with real confidence.
import { WORDS } from './captions.js';
const T = i => WORDS[i][1];
export const STORY = 59.1, DUR = 63.8;   // end card: the call to action (line 1, same voice) 1.3 s in, then 1.5 s of the logo alone
export const TS = 1;
export const VO = 'refs/voiceover-hu-x1.15.wav';
export const SHOTS = [[0, 'lab', 'cut'], [T(17) - .2, 'staff', 'soft'], [T(27) - .2, 'question', 'soft'], [T(33) - .2, 'outsiders', 'whip'], [T(47) - .2, 'invite', 'soft'],
  [T(55) - .2, 'paid', 'whip'], [T(69) - .2, 'real', 'soft'], [T(86) - .3, 'weeks', 'clock'], [T(100) - .2, 'redesign', 'soft'], [T(111) - .3, 'launch', 'whip'], [T(126) - .2, 'lesson', 'soft']];
export const HIT = {
  newshoe: T(4), tests: T(12), good: T(14), tried: T(19), perfect: T(25), mgr: T(28), ask: T(32), what: T(33), others: T(36), nothing: T(43), company: T(46),
  invite: T(48), pro: T(51), amateur: T(53), odd: T(58), paid: T(61), faults: T(65), report: T(66), found: T(68), nopraise: T(70), real: T(74), honest: T(80), problems: T(83),
  weeks: T(87), parts: T(96), uncomfy: T(99), designers: T(101), changed: T(102), newver: T(106), again: T(108), sent: T(110), launched: T(115), confident: T(119), reality: T(125),
  boss: T(127), trust: T(132), praise: T(139), notenough: T(136), ready: T(143), faults2: T(148), listen: T(150),
  whips: [T(17) - .2, T(27) - .2, T(33) - .2, T(47) - .2, T(55) - .2, T(69) - .2, T(86) - .3, T(100) - .2, T(111) - .3, T(126) - .2],
  kicks: [T(14), T(25), T(32), T(51), T(61), T(68), T(74), T(99), T(106), T(119), T(150)],
};
