// The Popcorn Choice: the timeline, cut to the Hungarian voiceover (refs/voiceover-hu.mp3, word times from Whisper).
// The man is white; the cashier and every other customer are dark blue (some are women). Hands touch what they act on; nobody walks through the counter or anyone.
import { clamp, lerp, seg, ss, track, hash } from '/core/lib.js';
import { BASE_H } from './char2d.js';
import { L } from './sets.js';

export const STORY = 60.7, DUR = 62.9;   // the story, then the locked 23 end card on dark blue
export const DISSOLVES = [{ at: 21.4, d: .3 }, { at: 37.8, d: .3 }, { at: 43.9, d: .45 }, { at: 49.9, d: .4 }, { at: 53.9, d: .45 }];
export const DISP = { S: [820, 1424, 44], M: [900, 1424, 60], Lg: [995, 1424, 80] };   // the three sizes on the counter: x, base, height
export const PRICES = ['900 Ft', '1650 Ft', '1850 Ft'];
export const HIT = {
  sniff: 2.25, mmm: 3.25, sizes: [5.45, 5.8, 6.15], flips: [8.85, 11.75, 15.0], think: 18.6, gasp: 21.05, arrow: 23.0, chip: 23.3, big: 25.5,
  eyes: [27.8, 28.4, 29.0], choose: 29.6, take: 31.0, fill: 31.4, handOff: 33.4, hehe: 34.35, key: 35.35, ching: 35.5, door: 39.55,
  hush: 40.6, qmark: 42.3, decoy: 45.0, nudge: 45.45, best: 46.75, best2: 47.7, give1: 51.45, give2: 53.6, glow: 58.66,
};

const V = keys => track(keys);
export function sp(tau, d = .4, b = .2) {   // a spring like Motion's { type: 'spring', visualDuration, bounce }
  if (tau <= 0) return 0; const z = Math.max(.05, 1 - b);
  if (z >= .999) { const w = 4.7 / d; return 1 - Math.exp(-w * tau) * (1 + w * tau); }
  const wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau));
}
function blinkAt(t, seed) { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; }
const idle = (t, seed, o = {}) => ({ bob: Math.sin(t * 2.2 + seed) * .006, blink: blinkAt(t, seed), ...o });
function route(t, t0, t1, pts, stride = 46) {
  const Ls = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(d); tot += d; }
  const u = seg(t, t0, t1), e = ss(u) * tot, moving = t > t0 && t < t1;
  let acc = 0, i = 0; while (i < Ls.length - 1 && acc + Ls[i] < e) acc += Ls[i++];
  const k = Ls[i] ? (e - acc) / Ls[i] : 1, A = pts[i], B = pts[i + 1], x = lerp(A[0], B[0], clamp(k)), y = lerp(A[1], B[1], clamp(k));
  const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1;
  const st = t - t1, settle = st > 0 && st < .5 ? Math.sin(st * 20) * Math.exp(-st * 9) * .07 : 0;
  return { x, y, f: clamp(dx / d * 1.1, -.95, .95), back: dy < -Math.abs(dx) * .7, phi: e / stride * Math.PI, walk: moving ? Math.min(1, Math.sin(u * Math.PI) * 2.2) : 0, squash: settle };
}
const reach = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const W = 'owner', B1 = 'blue1', B2 = 'blue2', B3 = 'blue3';
const SPOT = [500, 1615];   // where the man stands at the counter
const man = (t, o = {}) => ({ id: 'man', skin: W, s: 1, x: SPOT[0], y: SPOT[1], f: .55, ...idle(t, 1), smile: .6, ...o });
const cashier = (t, o = {}) => ({ id: 'cashier', skin: B2, fem: 'bun', s: .95, x: 640, y: 1500, f: -.45, ...idle(t, 2), smile: .7, ...o });
const all3 = { S: 1, M: 1, Lg: 1 };
const board0 = { prices: [0, 0, 0] }, board1 = { prices: [1, 1, 1] };

// —— A (0–3.75): he walks into the lobby; the smell of popcorn reaches him; he stops and breathes it in ——
function arrive(t) {
  const m = { ...man(t), ...route(t, .15, 2.0, [[-140, 1700], [470, 1660]], 48) };
  const sn = ss(seg(t, 2.1, 2.5)) * (1 - ss(seg(t, 3.5, 3.75)));
  if (t > 2.0) Object.assign(m, { f: .4, headUp: .03 * sn, look: -.4 * sn, blink: sn > .5 ? 1 : m.blink, smile: .6 + .4 * sn, squash: -.03 * sn });
  return { set: 'lobby', cam: V([[0, [560, 1370, 1.4]], [3.75, [720, 1390, 1.45]]])(t), chars: [m, cashier(t, { f: -.2, look: .3 })], disp: all3, board: board0, wisps: ss(seg(t, 1.6, 2.4)) * (1 - ss(seg(t, 3.3, 3.75))) };
}
// —— B (3.75–8.1): up to the counter; three sizes ——
function order(t) {
  const m = { ...man(t), ...route(t, 3.8, 4.6, [[470, 1660], SPOT], 48), look: -.2 };
  if (t > 4.6) m.f = .55;
  const pops = HIT.sizes.map(c => t > c - .05 ? 1 + .25 * Math.sin(clamp((t - c) / .35) * Math.PI) : 1);
  return { set: 'lobby', cam: V([[3.75, [720, 1390, 1.45]], [5.2, [860, 1400, 1.75]], [8.1, [880, 1395, 1.9]]])(t), chars: [m, cashier(t, { smile: .9, look: .2 })], disp: all3, dispPop: pops, board: board0 };
}
// —— C (8.1–17.5): the menu board, one size at a time, each price going up as the voice says it ——
function prices(t) {
  const pr = HIT.flips.map(c => sp(t - c, .35, .3));
  return { set: 'lobby', cam: V([[8.1, [505, 955, 2.7]], [10.75, [505, 960, 2.8]], [11.05, [750, 960, 2.7]], [13.95, [750, 965, 2.8]], [14.25, [995, 960, 2.7]], [17.5, [995, 965, 2.85]]])(t),
    chars: [man(t, { look: -1, headUp: .03 }), cashier(t)], disp: all3, board: { prices: pr } };
}
// —— D (17.5–21.4): he only meant to get the small one: he points at it and pictures it ——
function small(t) {
  const pt = ss(seg(t, 18.4, 18.8)) * (1 - ss(seg(t, 20.9, 21.3)));
  const m = man(t, { handR: pt > .05 ? reach([540, 1500], DISP.S.slice(0, 2), pt) : undefined, smile: .55 + .3 * pt, look: .2, think: sp(t - HIT.think, .35, .3) * (1 - ss(seg(t, 20.95, 21.3))) });
  return { set: 'lobby', cam: V([[17.5, [610, 1460, 2.0]], [21.4, [620, 1455, 2.15]]])(t), chars: [m, cashier(t, { look: .4 })], disp: all3, board: board1 };
}
// —— E (21.4–27.3): then he sees it: only 200 Ft more than the medium buys the large ——
function seesIt(t) {
  const up = ss(seg(t, 21.0, 21.35)), m = man(t, { look: -1 * up, headUp: .03 * up, o: t < 22.2 ? .7 * up : 0, smile: t > 22.2 ? .9 : .3 });
  return { set: 'lobby', cam: V([[21.4, [530, 1465, 2.6]], [22.3, [530, 1460, 2.65]], [22.75, [870, 965, 2.15]], [25.2, [880, 965, 2.2]], [25.6, [960, 975, 2.45]], [27.3, [960, 975, 2.5]]])(t),
    chars: [m, cashier(t)], disp: all3, board: { ...board1, arrow: ss(seg(t, HIT.arrow, HIT.arrow + .4)), chip: sp(t - HIT.chip, .35, .35), big: t > HIT.big - .05 ? sp(t - HIT.big, .4, .45) : 0 } };
}
// —— F (27.3–31.5): a moment's thought, eyes going between the sizes... the large. She reaches for it ——
function decide(t) {
  const think = t < 29.5, side = HIT.eyes.filter(c => t > c).length % 2 ? 1 : -1, go = ss(seg(t, 29.55, 29.85));
  const m = man(t, think ? { chin: 'R', look: -.8, headTurn: .35 * side, tilt: -.06, smile: .3 } : { armR: 2.4 * go, look: -.6, smile: 1, squash: -.04 * Math.sin(seg(t, 29.55, 29.9) * Math.PI) });
  const c = cashier(t, { ...route(t, 30.3, 30.9, [[640, 1500], [930, 1500]], 40), smile: .9 }); if (t < 30.3) Object.assign(c, { x: 640, y: 1500, f: -.45, walk: 0 }); else if (t > 30.9) c.f = .4;
  let held = null; if (t > HIT.take - .2) { const u = ss(seg(t, HIT.take - .2, HIT.take)); c.handR = reach([975, 1395], [990, 1390], u); held = t > HIT.take ? [c.handR[0] + 4, c.handR[1] + 30] : null; }
  return { set: 'lobby', cam: V([[27.3, [540, 1478, 2.8]], [29.45, [545, 1475, 2.9]], [29.85, [720, 1440, 1.6]], [31.5, [790, 1430, 1.65]]])(t),
    chars: [m, c], disp: { S: 1, M: 1, Lg: held ? 0 : 1 }, held, heldFill: 1, board: board1 };
}
// —— G (31.5–35.1): she fills it right up to overflowing and hands it over; he hugs it ——
function fill(t) {
  const back = route(t, 32.65, 33.15, [[930, 1500], [655, 1500]], 40), c = cashier(t, { smile: .9 });
  if (t < 32.65) Object.assign(c, { x: 930, y: 1500, f: .4 }); else Object.assign(c, back);
  if (t > 33.15) c.f = -.45;
  const fillU = 1 + .55 * ss(seg(t, HIT.fill, 32.5));
  let held = null, manHold = null;
  if (t < 32.65) { c.handR = [1010, 1385]; held = [1014, 1415]; }
  else if (t < HIT.handOff) { const u = ss(seg(t, 33.15, HIT.handOff)); c.handR = reach([c.x + 26, 1400], [588, 1414], u); held = [c.handR[0] + 2, c.handR[1] + 30]; }
  const m = man(t, { smile: .9, look: .1 });
  if (t > HIT.handOff - .25 && t < HIT.handOff) { m.handR = [588, 1414]; }
  if (t >= HIT.handOff) { const u = ss(seg(t, HIT.handOff, HIT.handOff + .35)), at = reach([590, 1444], [m.x + 18, m.y - .08 * BASE_H], u); manHold = at; m.handR = [at[0] + 26, at[1] - 34]; m.handL = [at[0] - 26, at[1] - 34]; m.smile = 1;
    if (t > HIT.hehe) { m.blink = t < HIT.hehe + .5 ? 1 : m.blink; m.squash = .04 * Math.sin((t - HIT.hehe) * 20) * Math.exp(-(t - HIT.hehe) * 3); } }
  return { set: 'lobby', cam: V([[31.5, [800, 1430, 1.65]], [32.6, [870, 1420, 1.75]], [33.2, [640, 1450, 1.8]], [35.1, [600, 1470, 1.95]]])(t),
    chars: [m, c], disp: { S: 1, M: 1, Lg: 0 }, held, heldFill: fillU, manHold, spill: seg(t, HIT.fill + .3, 33.0), board: board1 };
}
// —— H (35.1–37.8): she rings it up, pleased ——
function pleased(t) {
  const key = Math.sin(seg(t, HIT.key - .25, HIT.key + .2) * Math.PI);
  const c = cashier(t, { x: 655, handR: key > .05 ? reach([700, 1400], [742, 1372], key) : undefined, smile: 1, blink: t > 36.0 && t < 36.8 ? 1 : blinkAt(t, 2), look: .3 });
  const m = man(t, { smile: 1, look: .1 }), at = [m.x + 18, m.y - .08 * BASE_H]; m.handR = [at[0] + 26, at[1] - 34]; m.handL = [at[0] - 26, at[1] - 34];
  return { set: 'lobby', cam: V([[35.1, [690, 1355, 2.4]], [37.8, [695, 1350, 2.6]]])(t), chars: [m, c], disp: { S: 1, M: 1, Lg: 1 }, manHold: at, heldFill: 1.55, drawer: ss(seg(t, HIT.ching - .05, HIT.ching + .15)) * (1 - ss(seg(t, 37.0, 37.4))), board: board1 };
}
// —— I (37.8–40.4): and off he goes to the film, happy, the bucket in his arms ——
const EXIT = [SPOT, [700, 1680], [1240, 1680], [1355, 1600]];
function exit(t) {
  const m = { ...man(t, { smile: 1 }), ...route(t, 37.85, 39.9, EXIT, 50) };
  if (t > 39.9) Object.assign(m, { f: lerp(.4, -.25, ss(seg(t, 39.95, 40.3))), walk: 0 });
  const at = [m.x + 18 * Math.sign(m.f || 1), m.y - .08 * BASE_H]; m.handR = [at[0] + 26, at[1] - 34]; m.handL = [at[0] - 26, at[1] - 34];
  return { set: 'lobby', cam: V([[37.8, [720, 1400, 1.45]], [40.4, [1150, 1400, 1.55]]])(t), chars: [m, cashier(t, { look: .3, f: .3 })], disp: all3, manHold: at, heldFill: 1.55, door: ss(seg(t, HIT.door, HIT.door + .4)), board: board1 };
}
// —— J (40.4–43.9): but did he really want the large one? the moment holds, the room dims, a question mark ——
function question(t) {
  const m = man(t, { x: 1355, y: 1600, f: -.25, smile: lerp(1, .2, ss(seg(t, 41.6, 42.3))), look: .2, bang: t > HIT.qmark - .05 ? clamp(t - HIT.qmark + .05) : 0, mark: '?' });
  const at = [m.x - 18, m.y - .08 * BASE_H]; m.handR = [at[0] + 26, at[1] - 34]; m.handL = [at[0] - 26, at[1] - 34];
  return { set: 'lobby', cam: V([[40.4, [1150, 1400, 1.55]], [43.9, [1345, 1450, 2.4]]])(t), chars: [m, cashier(t, { look: .3, f: .3 })], disp: all3, manHold: at, heldFill: 1.55, door: 1, dim: ss(seg(t, 40.6, 41.4)), board: board1 };
}
// —— K (43.9–49.9): or were the prices set so the large looks like the best choice? the medium is put there to make the large look cheap ——
function decoy(t) {
  return { set: 'lobby', cam: V([[43.9, [750, 950, 1.45]], [49.9, [750, 945, 1.55]]])(t), chars: [man(t, { x: 300 }), cashier(t)], disp: all3,
    board: { ...board1, decoy: ss(seg(t, HIT.decoy - .2, HIT.decoy + .3)), nudge: seg(t, 44.9, 46.0), best: t > HIT.best - .05 ? sp(t - HIT.best, .4, .45) : 0, best2: t > HIT.best2 ? sp(t - HIT.best2, .3, .5) : 0, dimS: ss(seg(t, 46.6, 47.2)) } };
}
// —— L (49.9–53.9): nobody needs talking into it: one after another, people choose the large themselves ——
function others(t) {
  const c = cashier(t, { smile: .8, armL: .1, armR: .1 });
  const c1 = { id: 'c1', skin: B1, s: 1, x: SPOT[0], y: SPOT[1], f: .55, ...idle(t, 11), smile: .8 };
  const point1 = Math.sin(seg(t, 50.1, 51.0) * Math.PI); if (point1 > .05) c1.handR = reach([540, 1500], DISP.Lg.slice(0, 2), point1);
  let held = null, hold1 = null;
  if (t > 50.7 && t < HIT.give1) { const u = ss(seg(t, 51.0, HIT.give1)); c.handR = reach([680, 1380], [588, 1414], u); held = [c.handR[0] + 2, c.handR[1] + 30]; }
  if (t >= HIT.give1) { Object.assign(c1, route(t, 51.8, 53.9, [SPOT, [300, 1700], [-150, 1720]], 50)); hold1 = [c1.x - 18, c1.y - .08 * BASE_H]; c1.handR = [hold1[0] + 26, hold1[1] - 34]; c1.handL = [hold1[0] - 26, hold1[1] - 34]; c1.smile = 1; }
  const c2 = { id: 'c2', skin: B3, fem: 'long', s: 1, ...idle(t, 12), ...route(t, 51.6, 52.9, [[-120, 1680], [300, 1660], SPOT], 48), smile: .8 };
  if (t > 52.9) { c2.f = .55; const pt = Math.sin(seg(t, 53.1, 53.9) * Math.PI); if (pt > .05) c2.handR = reach([540, 1500], DISP.Lg.slice(0, 2), pt); }
  const c3 = { id: 'c3', skin: B1, fem: 'hat', s: 1, ...idle(t, 13), ...route(t, 52.2, 53.6, [[-120, 1720], [200, 1700]], 48), smile: .7, look: -.6 };
  return { set: 'lobby', cam: V([[49.9, [690, 1350, 1.45]], [53.9, [700, 1345, 1.5]]])(t), chars: [c, c1, c2, c3], disp: all3, held, heldFill: 1.55, holds: hold1 ? [hold1] : [], board: board1 };
}
// —— M (53.9–60.7): show the options so they choose the dearer one themselves: the board, the large lit up ——
function finale(t) {
  const q = (id, skin, fem, x, y, f, seed) => ({ id, skin, fem, s: 1, x, y, f, ...idle(t, seed), look: -1, headUp: .03, smile: .8 });
  return { set: 'lobby', cam: V([[53.9, [750, 1250, 1.15]], [57.4, [750, 1080, 1.3]], [60.7, [750, 980, 1.45]]])(t),
    chars: [q('d1', B1, null, 420, 1690, .4, 21), q('d2', B3, 'long', 560, 1720, .3, 22), q('d3', B2, 'bob', 900, 1700, -.3, 23), cashier(t, { smile: .9, look: -.2 })], disp: all3,
    board: { ...board1, best: sp(t - HIT.glow, .5, .3) }, fade: ss(seg(t, STORY - .7, STORY)) };
}
const SCENES = [[0, arrive], [3.75, order], [8.1, prices], [17.5, small], [21.4, seesIt], [27.3, decide], [31.5, fill], [35.1, pleased], [37.8, exit], [40.4, question], [43.9, decoy], [49.9, others], [53.9, finale]];
export function sceneAt(t) { t = Math.min(t, STORY - 1e-3); let f = SCENES[0][1]; for (const [a, fn] of SCENES) if (t >= a) f = fn; return f(t); }
