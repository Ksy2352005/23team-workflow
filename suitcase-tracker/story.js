// Story 23, The Brand That Sold Peace of Mind: timing. The voice is ElevenLabs "David" (Hungarian, eleven_v3) at 1.15x, pitch kept, 50.6 s.
// A suitcase maker builds in a tracker and sells it on one familiar moment: waiting at the baggage belt, then checking the phone.
import { WORDS } from './captions.js';
const T = i => WORDS[i][1];
export const STORY = 51.2, DUR = 53.4;
export const TS = 1;
export const VO = 'refs/voiceover-hu-x1.15.mp3';
export const SHOTS = [[0, 'airport', 'cut'], [5.9, 'hold', 'soft'], [11.3, 'newcase', 'soft'], [15.3, 'track', 'whip'], [20.9, 'adidea', 'soft'], [26.9, 'carousel', 'soft'], [31.2, 'phonecheck', 'soft'], [34.3, 'notmaterial', 'whip'], [41.3, 'lesson', 'soft']];
export const HIT = {
  again: [T(9), T(11)], fear: T(15), cases: T(21), hold: T(24), safe: T(27), decide: T(33), different: T(39), built: T(42), system: T(45), phone: T(50), where: T(52),
  notonly: T(60), familiar: T(69), belt: T(76), notyet: T(83), takeout: T(86), check: T(90), whereis: T(91), material: T(97), wheels: T(100), butabout: T(103), smaller: T(107),
  features: T(121), pay: T(126), rid: T(130), end: T(135),
  whips: [5.9, 11.3, 15.3, 20.9, 26.9, 31.2, 34.3, 41.3],
  kicks: [T(15), T(24), T(39), T(42), T(69), T(83), T(91), T(107), T(130)],
};
