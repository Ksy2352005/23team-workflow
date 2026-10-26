// The film's timeline (2D): scenes cut to the Hungarian voiceover, measured from the pauses in refs/voiceover-hu.mp3.
// The owner is always white; every customer is dark blue. Every action touches what it acts on, and nobody walks through tables or people:
// walkers keep to the aisles between the table rows and change depth only in the gaps between tables.
import { clamp, lerp, seg, ss, track, hash } from '/core/lib.js';
import { BASE_H } from './char2d.js';

export const DUR = 58.7;
// cars passing on the street (outside shots only): start time, direction, colour, lane
export const CARS = [{ t0: 2.95, dir: 1, col: '#c0392b', lane: 0 }, { t0: 31.6, dir: -1, col: '#e9dcc0', lane: 1 }, { t0: 35.0, dir: 1, col: '#2f7a8a', lane: 0 },
  { t0: 39.6, dir: -1, col: '#d9a03a', lane: 1 }, { t0: 55.0, dir: 1, col: '#e9dcc0', lane: 0 }, { t0: 57.2, dir: -1, col: '#c0392b', lane: 1 }];
export const CAR_V = 1150;   // world px per second
export const DISSOLVES = [{ at: 2.9, d: .45, blur: 0 }, { at: 42.6, d: .45, blur: 8 }, { at: 54.6, d: .55, blur: 0 }];

const COINS = [.45, 1.0, 1.4, 1.7, 1.95, 2.15];
const CHOPS = [...Array(8)].map((_, k) => +(7.12 + k * .19).toFixed(3));
const wipesOf = (a, b, p) => { const o = []; for (let t = a + p * .25; t < b; t += p / 2) o.push(+t.toFixed(3)); return o; };
const WIPE_D = [8.95, 10.2, .62], WIPE_E = [11.3, 12.25, .62];
const bites = (t0, t1, per, seed) => { const o = []; for (let t = t0 + hash(seed) * per; t < t1; t += per) o.push(+(t + per * .45).toFixed(3)); return o; };
export const HIT = {
  coins: COINS.map(t => t + .05), pages: [.95, 1.25, 1.55, 1.8, 2.05, 2.25], sketch: 2.4,
  keyJingle: 3.05, keyIn: 3.3, lockClick: 4.35, signOn: 4.5,
  alarm: 5.05, alarmOff: 5.62, popUp: 5.32, stretch: 5.95,
  chops: CHOPS, wipes: [...wipesOf(...WIPE_D), ...wipesOf(...WIPE_E)], flip: 12.68,
  calendar1: 13.25, timelapse: 14.0, tear: 16.12, rainIn: 16.4, jarLook: 18.1, sigh: 20.25,
  bell1: 22.75, doorShut1: 25.45,
  standUp: 26.15, handshake: [27.55, 27.85, 28.15], chairPull: 29.15, sit: 29.85, chairPush: 30.05, menuDown: 31.15,
  plateDown1: 33.1, clap1: [33.35, 33.55, 33.75], bang: 34.4, forks: bites(34.2, 36.9, .75, 3),
  handle2: 37.38, bell2: 37.5, handle3: 39.35, bell3: 39.45, handle4: 40.68, bell4: 40.75,
  plateDown2: 45.0, plateDown3: 45.6, clap2: [45.85, 46.05, 46.25], laugh: 46.4, queue: 55.0, bell5: 58.05,
};

// interior depth rows: feet line and scale; the aisles between rows are y ≈ 1515 and 1745
export const ROWS = [[1400, .82], [1620, .92], [1860, 1.02]];
export const sOf = y => lerp(.82, 1.02, (y - 1400) / 460);
export const TABLES = { A: [910, 0], B: [500, 0], C: [280, 1], D: [760, 1], E: [1230, 1], F: [1010, 2] };
export function seatPos(id, i) { const [x, r] = TABLES[id], [y, s] = ROWS[r]; return [x + (i ? 1 : -1) * 108 * s, y - 1, i ? -.8 : .8, s]; }
const topY = id => { const [, r] = TABLES[id], [y, s] = ROWS[r]; return y - .5 * BASE_H * s; };
const spot = (id, i) => { const [x, r] = TABLES[id], s = ROWS[r][1]; return [x + (i ? 1 : -1) * .26 * BASE_H * s, topY(id) + 4, s]; };
const handleIn = op => [lerp(390, 390 - 240 * Math.cos(op * 1.3), .85), 1250];
const handleEx = op => [lerp(640, 640 + 170 * Math.cos(op * 1.25), .86), 1590];

const V = keys => track(keys);
function blinkAt(t, seed) { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; }
const idle = (t, seed, o = {}) => ({ bob: Math.sin(t * 2.2 + seed) * .006, blink: blinkAt(t, seed), ...o });
// walk along a path of points at an even pace (eased at both ends)
function route(t, t0, t1, pts, inside = true, stride = 58) {
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  const u = seg(t, t0, t1), e = ss(u) * tot, moving = t > t0 && t < t1;
  let acc = 0, i = 0; while (i < L.length - 1 && acc + L[i] < e) acc += L[i++];
  const k = L[i] ? (e - acc) / L[i] : 1, A = pts[i], B = pts[i + 1], x = lerp(A[0], B[0], clamp(k)), y = lerp(A[1], B[1], clamp(k));
  const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1;
  return { x, y, s: inside ? sOf(y) : 1, f: clamp(dx / d * 1.1, -.95, .95), back: dy < -Math.abs(dx) * .7, phi: e / stride * Math.PI, walk: moving ? Math.min(1, Math.sin(u * Math.PI) * 2.2) : 0 };
}
const walk = (t, t0, t1, A, B, inside = true) => route(t, t0, t1, [A, B], inside);
function diner(t, id, i, skin, seed, mode = 'eat') {
  const [x, y, f, s] = seatPos(id, i), H = BASE_H * s, [px, py] = spot(id, i), mouth = [x + f * .12 * H, y - .13 * H - .66 * H];
  const per = 2.2 + hash(seed) * 1.6, ph = ((t + hash(seed + 1) * per) % per) / per, lift = ph < .5 ? Math.sin(ph / .5 * Math.PI) : 0;
  const hand = [lerp(px, mouth[0], lift), lerp(py - 4, mouth[1], lift)], near = f > 0 ? 'handR' : 'handL';
  const p = { id: id + i, x, y, s, f, sit: 1, skin, ...idle(t, seed), smile: .55 + .45 * Math.max(0, Math.sin(t * .8 + seed)), armL: .25, armR: .25 };
  if (mode === 'eat' || mode === 'drink') p[near] = hand;
  if (mode === 'drink') p.cupAt = lift > .05 ? hand : null;
  if (lift > .6) p.o = .5;
  return p;
}
const plateItem = (id, i, steam = 0) => { const [x, y, s] = spot(id, i); return { k: 'plate', x, y, s: BASE_H * s * .55, steam, d: ROWS[TABLES[id][1]][0] + .5 }; };
const cupItem = (id, i) => { const [x, y, s] = spot(id, i); return { k: 'cup', of: id + i, x: x + (i ? -1 : 1) * .2 * BASE_H * s, y, s: BASE_H * s * .2, d: ROWS[TABLES[id][1]][0] + .6 }; };
const jarOnA = level => ({ k: 'jar', x: 868, y: topY('A') + 2, s: .75, level, d: 1400.7 });
const OW = 'owner';

// —— 1a: night at home. Months of saving: coins into the jar, the calendar flipping, the sketch of the dream ——
function homeSave(t) {
  const drop = COINS.find(c => t > c - .35 && t < c + .12);
  const rest = [585, 1402], mouth = [558, 1316];
  let hand = rest, coin = null;
  if (drop !== undefined) { const u = seg(t, drop - .35, drop); hand = [lerp(rest[0], mouth[0], ss(u)), lerp(rest[1], mouth[1], Math.sin(u * Math.PI / 2))]; if (t < drop) coin = hand; }
  const up = ss(seg(t, 2.25, 2.6));
  const ow = { id: 'owner', skin: OW, x: 612, y: 1500, s: 1, f: lerp(-.85, -.45, up), sit: 1, ...idle(t, 1), handL: up < .5 ? hand : undefined, armL: .3, coinAt: coin,
    look: lerp(.5, -1, up), headUp: .015 * up, smile: lerp(.45, 1, up) };
  return { set: 'home', look: 'night', cam: V([[0, [430, 1265, 1.55]], [2.2, [430, 1240, 1.6]], [2.9, [400, 1010, 2.45]]])(t), chars: [ow], jar: .28 + .6 * seg(t, .3, 2.25), month: 6 * seg(t, .8, 2.3) };
}
// —— 1b: dawn. The real storefront: the key turns, the sign lights, he steps back to look at it ——
function storefront(t) {
  const back = ss(seg(t, 4.5, 4.95));
  const ow = { id: 'owner', skin: OW, x: lerp(752, 772, back), y: lerp(1722, 1738, back), s: 1, f: lerp(.25, .1, back), back: back < .5, ...idle(t, 1), hold: back < .5 ? 'key' : null,
    handR: back < .5 ? [800 + (t > 3.9 ? 4 * ss(seg(t, 3.9, 4.3)) : 0), 1603] : undefined, armL: .1, armR: back < .5 ? undefined : -.5, look: -1 * back, headUp: .01 * back, smile: .4 + .6 * back };
  return { set: 'ex', look: 'dawn', cam: V([[2.9, [930, 1190, 1.25]], [3.6, [850, 1380, 1.3]], [5, [785, 1455, 1.35]]])(t), chars: [ow], inside: [], sign: ss(seg(t, 4.5, 4.85)), signFlick: t > 4.5 && t < 4.85, lanterns: lerp(.5, 1, ss(seg(t, 4.55, 4.8))), interiorLit: .15 };
}
// —— 2a: every morning, early: the alarm, up from under the blanket, a big stretch ——
function bedroom(t) {
  const up = ss(seg(t, 5.3, 5.55)), slap = Math.sin(seg(t, 5.5, 5.75) * Math.PI), st = Math.sin(seg(t, 5.9, 6.6) * Math.PI);
  const ow = { id: 'owner', skin: OW, x: 1207, y: 1347, s: 1, rot: (1 - up) * Math.PI / 2, sit: 1, f: 0, ...idle(t, 1), shadow: false,
    blink: t < 5.32 ? 1 : (t > 6.65 && t < 6.8 ? 1 : blinkAt(t, 1)), o: up * (1 - ss(seg(t, 5.7, 5.9))) * .8, smile: .9 * ss(seg(t, 6.3, 6.6)),
    handR: slap > .05 ? [1300, 1225] : undefined, armR: .2 + 2.6 * st, armL: .2 + 2.6 * st, squash: -.05 * st };
  return { set: 'home', look: 'dawn', cam: V([[5, [1160, 1260, 1.75]], [6.95, [1165, 1255, 1.85]]])(t), chars: [ow], ring: t > 5.05 && t < 5.62 ? 1 : 0, bed: { up }, jar: .88, month: 6 };
}
// —— 2b: he prepares everything himself: chopping a carrot, a pot on the stove ——
function kitchen(t) {
  const n = CHOPS.filter(c => t >= c).length, last = [...CHOPS].reverse().find(c => t >= c - .19) ?? 7.12, ph = clamp((t - (last - .19)) / .19), cut = n / CHOPS.length;
  const cl = 110 * (1 - cut * .7), kx = 660 + cl, ky = lerp(1300, 1362, ph < .6 ? ph / .6 : 1 - (ph - .6) / .4);
  const ow = { id: 'owner', skin: OW, x: 720, y: 1430, s: 1, f: 0, ...idle(t, 1), handL: [655, 1360], handR: [kx, t < 7.05 || t > 8.5 ? 1310 : ky], hold: 'knife', look: .8, smile: .6 };
  return { set: 'kitchen', cam: V([[6.95, [760, 1290, 1.6]], [8.85, [740, 1300, 1.7]]])(t), chars: [ow], cut };
}
// —— 2c: wiping the tables, more than once ——
function wiping(t) {
  let ow, cloth = null;
  const circle = (w, cx, cy) => { const ph = (t - w[0]) / w[2] * Math.PI * 2; return [cx + Math.cos(ph) * 30, cy + Math.sin(ph) * 5]; };
  if (t < 10.25) { const h = circle(WIPE_D, 772, 1525); ow = { x: 760, y: 1518, s: sOf(1518), f: .05, handR: [h[0], h[1] - 4], armL: .15, lean: .08, look: .7 }; cloth = { k: 'cloth', x: h[0], y: h[1], d: 1620.6 }; }
  else if (t < 11.25) { ow = { ...walk(t, 10.25, 11.25, [760, 1518], [1230, 1518]), clothAt: null, armR: .3 }; ow.clothAt = [ow.x + 30, ow.y - .2 * BASE_H * ow.s]; }
  else { const h = circle(WIPE_E, 1242, 1525); ow = { x: 1230, y: 1518, s: sOf(1518), f: .05, handR: [h[0], h[1] - 4], armL: .15, lean: .08, look: .7 }; cloth = { k: 'cloth', x: h[0], y: h[1], d: 1620.6 }; if (t > 12.05) ow.smile = 1; }
  ow = { id: 'owner', skin: OW, ...idle(t, 1), smile: .5, ...ow };
  return { set: 'in', look: 'morning', cam: V([[8.85, [830, 1405, 1.45]], [10.2, [850, 1405, 1.45]], [11.25, [1140, 1405, 1.45]], [12.3, [1150, 1405, 1.48]]])(t), chars: [ow], items: [cloth].filter(Boolean), lamps: .5, plaque: 0, calendar: 1, clock: 7.5 };
}
// —— 2d: before opening, his hand flips the sign to NYITVA ——
function flipSign(t) {
  const reach = Math.sin(seg(t, 12.4, 12.95) * Math.PI);
  const ow = { id: 'owner', skin: OW, x: 350, y: 1410, s: sOf(1410), f: -.6, ...idle(t, 1), handL: reach > .05 ? [292, 1290] : undefined, armL: .2, look: -.2, smile: .8 };
  return { set: 'in', look: 'morning', cam: [290, 1270, 2.5], chars: [ow], plaque: ss(seg(t, 12.6, 12.85)), lamps: .5, calendar: 1, clock: 7.9 };
}

// —— 3: day one. The calendar says 1; time-lapse of an empty day ——
function day1(t) {
  if (t < 14.0) return { set: 'in', look: 'morning', cam: V([[13.2, [68, 662, 4.2]], [14.0, [68, 664, 4.4]]])(t), chars: [], calendar: 1, plaque: 1, lamps: .5, clock: 9 };
  const spots = [[14.0, 14.5, { x: 230, y: 1420, f: -.3, back: true }], [14.55, 15.05, { x: 1340, y: 1408, f: -.5, chin: 'L' }], [15.1, 15.55, { ...(() => { const [x, y] = seatPos('A', 1); return { x, y }; })(), f: -.8, sit: 1, chin: 'L', sad: .6 }], [15.6, 16.0, { x: 700, y: 1520, f: 0, sad: 1, squash: .04 }]];
  const chars = spots.map(([a, b, p], i) => ({ id: 'owner' + i, skin: OW, s: sOf(p.y), ...idle(t, 1), ...p, vis: t > a - .08 && t < b + .08, alpha: Math.min(ss(seg(t, a - .08, a + .04)), 1 - ss(seg(t, b - .04, b + .08))) }));
  const out = [...Array(6)].map((_, i) => { const a = 14.0 + i * .3, dir = i % 2 ? -1 : 1, x0 = dir > 0 ? 520 : 1260; return { ...walk(t, a, a + .5, [x0, 1332], [x0 + dir * 760, 1332], false), s: .8, skin: ['blue1', 'blue2', 'blue3'][i % 3], dim: .55, vis: t > a && t < a + .5 }; }).filter(p => p.vis);
  return { set: 'in', look: 'morning', blend: { to: 'dusk', u: ss(seg(t, 14.1, 15.9)) }, cam: V([[14.0, [800, 1290, .95]], [16, [800, 1300, .98]]])(t), chars, outside: out, calendar: 1, plaque: 1, lamps: lerp(.45, 1, seg(t, 14.5, 15.9)), clock: lerp(9, 19, seg(t, 14.0, 16.0)) };
}
// —— 4: day two. The page tears to 2; rain; his savings jar is almost empty ——
function day2(t) {
  if (t < 16.9) return { set: 'in', look: 'dusk', cam: [68, 664, 4.4], chars: [], calendar: 2, tear: seg(t, 16.1, 16.85), plaque: 1, lamps: 1, clock: 10 };
  const [sx, sy, , s] = seatPos('A', 1), look = ss(seg(t, 18.0, 18.6)) - ss(seg(t, 19.1, 19.6)), shake = t > 19.6 && t < 20.3 ? Math.sin(seg(t, 19.6, 20.3) * Math.PI * 2) * .25 : 0;
  const ow = { id: 'owner', skin: OW, x: sx, y: sy, s, f: -.75 - .2 * look + shake, sit: 1, ...idle(t, 1), sad: 1, chin: 'L', armL: .3, armR: .3,
    tilt: -.12, look: lerp(.3, .9, look) + .2 * ss(seg(t, 20.2, 20.9)), squash: .06 * Math.sin(seg(t, 20.2, 21) * Math.PI), headDX: -.02,
    blink: t > 17.2 && t < 17.7 ? Math.sin(seg(t, 17.2, 17.7) * Math.PI) : blinkAt(t, 1) };
  return { set: 'in', look: 'night', cam: V([[16.9, [945, 1268, 1.9]], [21, [955, 1275, 2.05]]])(t), chars: [ow], items: [cupItem('A', 1), jarOnA(.08)], rain: 1, drops: 1, lamps: .8, candleLow: true, plaque: 1, calendar: 2 };
}
// —— 5: the door opens ——
function doorOpens(t) {
  const [sx, sy, , s] = seatPos('A', 1), turn = ss(seg(t, 22.7, 23.0));
  const ow = { id: 'owner', skin: OW, x: sx, y: sy, s, f: lerp(-.75, -.95, turn), sit: 1, ...idle(t, 1), sad: 1 - turn, o: turn * (1 - ss(seg(t, 24.6, 25.4))), smile: .4 * ss(seg(t, 25.0, 25.8)), chin: turn < .5 ? 'L' : null, armL: .3, armR: .3, look: turn ? -.2 : .5 };
  const door = ss(seg(t, 22.6, 23.15)) * (1 - ss(seg(t, 24.5, 25.5)));
  const g = walk(t, 23.1, 24.3, [262, 1372], [470, 1462]);
  if (t < 23.1) Object.assign(g, { x: 262, y: 1372, s: sOf(1372), f: .1, handR: handleIn(door) });
  if (t >= 24.3) { const ph = seg(t, 24.35, 25.2); g.f = Math.sin(ph * Math.PI * 2) * .6; if (t > 25.2) g.f = lerp(0, .8, ss(seg(t, 25.2, 25.6))); g.back = false; }
  Object.assign(g, { id: 'guest', skin: 'blue1', vis: t > 22.62, ...idle(t, 2), o: .4 * ss(seg(t, 24.3, 24.6)) * (1 - ss(seg(t, 25.3, 25.7))), smile: .4 * ss(seg(t, 25.4, 25.9)) });
  return { set: 'in', look: 'night', cam: V([[21, [610, 1262, 1.12]], [26.1, [625, 1268, 1.15]]])(t), chars: [ow, g], items: [cupItem('A', 1), jarOnA(.08)], door, rain: 1, drops: .6, lamps: .95, plaque: 1, calendar: 2 };
}
// —— 6: welcomed like a hundred guests: a handshake, the best seat (he pulls it from behind), a menu ——
function welcome(t) {
  const [ox, oy, , os] = seatPos('A', 1), [gx, gy, , gs] = seatPos('A', 0), gStart = [470, 1462], meet = [548, 1462], chairBack = [gx - .15 * BASE_H * gs, gy - .7 * BASE_H * gs];
  const pull = 30 * (ss(seg(t, 29.05, 29.45)) - ss(seg(t, 29.95, 30.35))), holdAt = [802, 1372], behind = [930, 1372];
  let ow;
  if (t < 26.6) { const u = seg(t, 26.1, 26.55); ow = { x: ox, y: oy, s: os, f: -.85, sit: 1 - ss(u), bob: Math.sin(u * Math.PI) * .08, o: 1 - ss(seg(t, 26.2, 26.5)), smile: ss(seg(t, 26.25, 26.55)) }; }
  else if (t < 27.4) ow = { ...route(t, 26.6, 27.4, [[ox, oy + 32], [700, 1462], meet]), smile: 1 };
  else if (t < 28.35) { const sh = Math.sin((t - 27.4) * Math.PI * 2 / .3) * 7 * (t < 28.2 ? 1 : 0); ow = { x: meet[0], y: meet[1], s: sOf(meet[1]), f: -.75, smile: 1, handL: [510, 1390 + sh], armR: .2 }; }
  else if (t < 29.0) ow = { ...route(t, 28.35, 29.0, [meet, [700, 1452], [705, 1385], holdAt]), smile: 1 };
  else if (t < 30.45) ow = { x: holdAt[0], y: holdAt[1], s: sOf(holdAt[1]), f: .2, smile: 1, handL: [chairBack[0] - pull, chairBack[1]], armR: .3 };
  else if (t < 30.95) ow = { ...walk(t, 30.45, 30.95, holdAt, behind), smile: 1 };
  else { const [mx, my] = spot('A', 0), u = ss(seg(t, 30.95, 31.2)); ow = { x: behind[0], y: behind[1], s: sOf(behind[1]), f: -.2, smile: 1, handL: t < 31.35 ? [lerp(behind[0] - 20, mx + 8, u), lerp(1290, my - 2, u)] : undefined, armL: .25 }; }
  ow = { id: 'owner', skin: OW, ...idle(t, 1), ...ow };
  let g;
  if (t < 28.6) { const sh = t >= 27.4 && t < 28.2 ? Math.sin((t - 27.4) * Math.PI * 2 / .3) * 7 : 0; g = { x: gStart[0], y: gStart[1], s: sOf(gStart[1]), f: .75, ...idle(t, 2), o: .35 * (1 - ss(seg(t, 26.9, 27.4))), smile: .65 * ss(seg(t, 27.4, 27.9)), handR: t >= 27.4 && t < 28.2 ? [510, 1390 + sh] : undefined }; }
  else if (t < 29.6) g = { ...route(t, 28.6, 29.6, [gStart, [700, 1458], [gx - pull, gy + 1]]), smile: .65 };
  else { const u = ss(seg(t, 29.6, 30.0)); g = { x: gx - pull, y: gy, s: gs, f: .8, sit: u, ...idle(t, 2), smile: .65 + .3 * ss(seg(t, 31.1, 31.4)) }; }
  Object.assign(g, { id: 'guest', skin: 'blue1' });
  const items = [cupItem('A', 1)];
  if (t > 31.2) { const [mx, my] = spot('A', 0); items.push({ k: 'menu', x: mx + 8, y: my, d: 1400.6 }); }
  else if (t > 30.95 && ow.handL) items.push({ k: 'menu', x: ow.handL[0], y: ow.handL[1] + 2, d: 1373 });
  return { set: 'in', look: 'night', cam: V([[26.1, [700, 1300, 1.3]], [31.5, [820, 1300, 1.4]]])(t), chars: [ow, g], items, pullA0: pull, rain: 1, drops: .6, lamps: lerp(.95, 1.1, ss(seg(t, 26.3, 28))), plaque: 1, calendar: 2 };
}

// —— the window table as seen from the street ——
const WT = 1080, WY = 1640, WS = .78, WH = BASE_H * WS, WTOP = WY - .5 * WH;
function inGuest(t, eatFrom = 99) {
  const g = { id: 'guest', skin: 'blue1', x: WT - 92, y: WY, s: WS, f: .8, sit: 1, ...idle(t, 2), smile: .6, armL: .25, armR: .25 };
  if (t >= eatFrom) { const per = .75, ph = ((t - eatFrom) % per) / per, lift = ph < .55 ? Math.sin(ph / .55 * Math.PI) : 0; g.handR = [lerp(WT - 42, WT - 92 + 20, lift), lerp(WTOP, WY - .79 * WH, lift)]; g.smile = 1; if (lift > .6) g.o = .5; }
  return g;
}
const inOwner = (t, x = WT + 110) => ({ id: 'owner', skin: OW, x, y: WY - 6, s: WS, f: -.6, ...idle(t, 1), smile: 1, armL: .25, armR: .2 });
function crowdSmall(t) { return [[960, 'blue3'], [1230, 'blue2'], [700, 'blue1'], [1170, 'blue1']].map(([x, sk], i) => ({ skin: sk, x, y: 1565, s: .5, f: i % 2 ? -.7 : .7, sit: 1, ...idle(t, 20 + i), smile: .6 + .3 * Math.sin(t + i) })); }
const winPlate = (side, steam = 0) => ({ k: 'plate', x: WT + side * 42, y: WTOP + 3, s: WH * .55, steam, d: WY + .5 });

// —— 7: the owner serves; a passer-by stops, sees the guest eating — "!" ——
function seen(t) {
  const y = { id: 'passer', ...walk(t, 31.5, 33.6, [140, 1722], [1340, 1722], false), skin: 'blue2', ...idle(t, 3) };
  if (t >= 33.6) {
    const wob = Math.sin(seg(t, 33.6, 34.0) * Math.PI * 2) * .05 * (1 - seg(t, 33.6, 34.0));
    Object.assign(y, { f: lerp(.9, -.7, ss(seg(t, 33.8, 34.3))), lean: wob, o: ss(seg(t, 34.3, 34.5)) * (1 - ss(seg(t, 35.4, 35.8))), smile: .7 * ss(seg(t, 35.5, 36.0)), headDX: -.02 * ss(seg(t, 34.6, 35.4)), bang: t > 34.4 && t < 35.6 ? Math.min(1, (t - 34.4) / .25) : 0 });
    if (t > 36.0) Object.assign(y, walk(t, 36.0, 36.9, [1340, 1722], [1000, 1722], false));
  }
  let ow, pl;
  if (t < 32.6) { ow = { ...inOwner(t), ...walk(t, 31.5, 32.6, [1250, WY - 6], [1150, WY - 6], false), s: WS }; pl = { k: 'plate', x: ow.x - 30, y: WY - .62 * WH, s: WH * .55, steam: 1, d: WY + .7 }; ow.handR = [pl.x + 8, pl.y + 2]; }
  else { const u = ss(seg(t, 32.6, 33.1)); ow = { ...inOwner(t, 1150) }; const px = lerp(1120, WT - 42, u), py = lerp(WY - .62 * WH, WTOP + 3, u); pl = { k: 'plate', x: px, y: py, s: WH * .55, steam: 1, d: WY + .7 }; if (t < 33.25) ow.handR = [px + 8, py + 2]; else ow.armR = .2; }
  const g = inGuest(t, 34.2); if (t > 33.3 && t < 33.9) { const c = Math.sin((t - 33.3) * Math.PI * 2 / .2); g.handL = [WT - 70 + c * 3, WY - .62 * WH]; g.handR = [WT - 70 - c * 3, WY - .62 * WH]; g.smile = 1; }
  return { set: 'ex', look: 'night', cam: V([[31.5, [520, 1480, 1.5]], [33.6, [960, 1480, 1.5]], [36.9, [1060, 1485, 1.6]]])(t), chars: [y], inside: [g, ow], inItems: [pl], wet: 1, sign: 1 };
}
function entersToo(t) {
  const op = ss(seg(t, 37.42, 37.8)) * (1 - ss(seg(t, 38.5, 38.9)) * .5), h = handleEx(op);
  const y = { id: 'passer', ...walk(t, 36.9, 37.38, [1000, 1722], [800, 1716], false), skin: 'blue2', ...idle(t, 3), smile: .5 };
  if (t >= 37.3 && t < 37.62) Object.assign(y, { f: -.6, handL: h });
  if (t >= 37.62) { const u = seg(t, 37.62, 38.6); Object.assign(y, { x: lerp(800, 730, u), y: lerp(1716, 1668, u), s: lerp(1, .86, u), back: true, f: -.1, alpha: 1 - ss(seg(t, 38.15, 38.6)), phi: u * 6, walk: u > 0 && u < 1 ? 1 : 0 }); }
  const ow = { ...inOwner(t, 1150), f: lerp(-.6, -1, ss(seg(t, 37.5, 37.8))), o: ss(seg(t, 37.55, 37.75)) * (1 - ss(seg(t, 38.1, 38.4))) };
  return { set: 'ex', look: 'night', cam: V([[36.9, [840, 1480, 1.5]], [38.9, [790, 1470, 1.6]]])(t), chars: [y], inside: [inGuest(t, 36.9), ow], inItems: [winPlate(-1, .6)], exDoor: op, wet: 1, sign: 1 };
}
function andMore(t) {
  let door = 0;
  const enter = (id, t0, t1, from, sk, seed) => { const p = { id, ...walk(t, t0, t1, from, [800, 1716], false), skin: sk, ...idle(t, seed), smile: .45 };
    const op = ss(seg(t, t1 - .02, t1 + .3)) * (1 - ss(seg(t, t1 + .8, t1 + 1.2))); door = Math.max(door, op);
    if (t >= t1 - .08 && t < t1 + .2) Object.assign(p, { f: -.6, handL: handleEx(op) });
    if (t >= t1 + .2) { const u = seg(t, t1 + .2, t1 + 1.0); Object.assign(p, { x: lerp(800, 730, u), y: lerp(1716, 1668, u), s: lerp(1, .86, u), back: true, f: 0, alpha: 1 - ss(seg(t, t1 + .6, t1 + 1.0)), phi: u * 6, walk: u < 1 ? 1 : 0 }); }
    return p; };
  const a = enter('c3', 38.9, 39.38, [430, 1722], 'blue3', 4), b = enter('c4', 38.9, 40.68, [1560, 1730], 'blue1', 6);
  const second = { id: 'passer', skin: 'blue2', x: WT + 92, y: WY, s: WS, f: -.8, sit: 1, ...idle(t, 3), smile: .8 };
  const ow = { ...inOwner(t), ...walk(t, 39.0, 40.0, [1250, WY - 6], [880, WY - 6], false), s: WS, smile: 1 };
  return { set: 'ex', look: 'night', cam: V([[38.9, [930, 1340, .95]], [42.2, [930, 1360, .93]], [42.6, [1080, 1420, 1.6]]])(t), chars: [a, b], inside: [...crowdSmall(t).slice(0, 2), inGuest(t, 38.9), second, ow], inItems: [winPlate(-1, .3), winPlate(1, .8)], exDoor: door, wet: 1, sign: 1 };
}

// —— 10: the full room: he serves table D from behind it, then stops in the front aisle to look around ——
export const FULL = [['A', 0, 'blue1', 2, 'eat'], ['A', 1, 'blue2', 3, 'eat'], ['B', 0, 'blue3', 4, 'drink'], ['B', 1, 'blue1', 6, 'eat'], ['C', 0, 'blue2', 7, 'eat'], ['C', 1, 'blue3', 8, 'drink'], ['D', 0, 'blue1', 11, 'wait'], ['D', 1, 'blue3', 12, 'wait'], ['E', 0, 'blue2', 13, 'eat'], ['E', 1, 'blue1', 14, 'drink'], ['F', 0, 'blue2', 9, 'eat'], ['F', 1, 'blue1', 10, 'drink']];
function crowd(t, laugh = true) {
  return FULL.map(([id, i, sk, seed, mode]) => {
    let m = mode; if (id === 'D') m = t > (i ? HIT.plateDown2 : HIT.plateDown3) + 1.2 ? 'eat' : 'none';
    const p = diner(t, id, i, sk, seed, m);
    if (id === 'D' && t > HIT.clap2[0] - .1 && t < HIT.clap2[2] + .2) { const c = Math.sin((t - HIT.clap2[0]) * Math.PI * 2 / .2), [x, y, f, s] = seatPos(id, i), H = BASE_H * s; p.handL = [x + f * .1 * H + c * 3, y - .58 * H]; p.handR = [x + f * .1 * H - c * 3, y - .58 * H]; p.smile = 1; }
    if (laugh && id === 'B' && i === 1) { const u = seg(t, HIT.laugh, HIT.laugh + 1); if (u > 0 && u < 1) { p.bob = Math.abs(Math.sin(u * Math.PI * 4)) * .05 * (1 - u); p.smile = 1; p.handL = undefined; p.handR = undefined; } }
    return p; });
}
const crowdItems = () => FULL.flatMap(([id, i, , , mode]) => id === 'D' ? [] : [plateItem(id, i), ...(mode === 'drink' ? [cupItem(id, i)] : [])]);
function fullRoom(t) {
  const D = [760, 1516], H = BASE_H * sOf(D[1]), trayY = topY('D') + 2;
  let ow, items = crowdItems();
  const placed = [t > HIT.plateDown2, t > HIT.plateDown3];
  if (t < 44.0) ow = { ...route(t, 42.6, 44.0, [[1330, 1460], [1080, 1512], D]), hold: 'tray', trayItems: ['plate', 'plate'] };
  else if (t < 46.0) {
    ow = { x: D[0], y: D[1], s: sOf(D[1]), f: 0, ...idle(t, 1), smile: 1 };
    const [r1x, r1y] = spot('D', 1), [r0x, r0y] = spot('D', 0), a = seg(t, 44.5, 45.0), b = seg(t, 45.1, 45.6);
    if (t < 45.7) items.push({ k: 'tray', x: D[0], y: trayY, s: H, d: 1620.3, plates: 2 - (a > 0 ? 1 : 0) - (b > 0 ? 1 : 0) });
    if (a > 0 && t < 45.05) { const u = ss(a), px = lerp(D[0] + 20, r1x, u), py = lerp(trayY - 6, r1y, u) - Math.sin(u * Math.PI) * 14; ow.handR = [px, py - 2]; items.push({ k: 'plate', x: px, y: py, s: H * .55, steam: 1, d: 1620.4 }); }
    if (b > 0 && t >= 45.05 && t < 45.65) { const u = ss(b), px = lerp(D[0] - 20, r0x, u), py = lerp(trayY - 6, r0y, u) - Math.sin(u * Math.PI) * 14; ow.handL = [px, py - 2]; items.push({ k: 'plate', x: px, y: py, s: H * .55, steam: 1, d: 1620.4 }); }
    if (t < 44.5) { ow.handL = [D[0] - 40, trayY - 4]; ow.handR = [D[0] + 40, trayY - 4]; }
    if (!ow.handR) ow.armR = .5; if (!ow.handL) ow.armL = .5;
    if (t >= 45.7) { ow.hold = 'tray'; ow.trayItems = []; ow.handL = ow.handR = undefined; }
  } else if (t < 47.6) ow = { ...route(t, 46.0, 47.6, [D, [540, 1522], [540, 1745], [700, 1748]]), hold: 'tray', trayItems: [] };
  else { const u = seg(t, 47.6, 50.85); ow = { x: 700, y: 1748, s: sOf(1748), f: Math.sin(u * Math.PI * 1.5) * .6, ...idle(t, 1), hold: 'tray', trayItems: [] }; }
  if (placed[0]) items.push(plateItem('D', 1, 1)); if (placed[1]) items.push(plateItem('D', 0, 1));
  ow = { id: 'owner', skin: OW, smile: 1, ...ow }; if (ow.hold === 'tray') { ow.armL = -.55; ow.armR = -.55; }
  return { set: 'in', look: 'night', cam: V([[42.6, [760, 1290, .95]], [46, [745, 1310, 1.0]], [50.85, [715, 1390, 1.12]]])(t), chars: [ow, ...crowd(t)], items, lamps: 1.15, plaque: 1, calendar: 2, clock: 20 + (t - 42.6) / 60 };
}
// —— 11: trust. Then outside: a queue has formed; one more joins it; the door opens and the line steps forward ——
function finale(t) {
  if (t < 54.6) {
    const ow = { id: 'owner', skin: OW, x: 700, y: 1748, s: sOf(1748), ...idle(t, 1), hold: 'tray', trayItems: [], armL: -.55, armR: -.55,
      f: .55 * Math.sin(seg(t, 51.2, 53.4) * Math.PI) - .55 * Math.sin(seg(t, 52.3, 53.6) * Math.PI), smile: lerp(.4, 1, ss(seg(t, 53.9, 54.4))), look: -.2 };
    ow.blink = t > 53.5 && t < 54.1 ? 1 : blinkAt(t, 1);
    return { set: 'in', look: 'night', cam: V([[50.85, [715, 1390, 1.12]], [52.5, [705, 1520, 1.55]], [54.6, [702, 1545, 1.75]]])(t), chars: [ow, ...crowd(t, false)], items: [...crowdItems(), plateItem('D', 0), plateItem('D', 1)], lamps: 1.15, plaque: 1, calendar: 2, clock: 20.2 };
  }
  const op = ss(seg(t, 58.0, 58.4)) * .8 * (1 - ss(seg(t, 58.5, 58.7)) * .3);
  const step = ss(seg(t, 58.15, 58.6)) * 120;
  const Q = [870, 990, 1110, 1230].map((x, i) => {
    const p = { id: 'q' + i, skin: ['blue3', 'blue1', 'blue2', 'blue3'][i], x: x - step, y: 1722 + (i % 2) * 10, s: 1, f: -.7, ...idle(t, 30 + i), smile: .5 + .3 * Math.sin(t * 2 + i), look: i === 2 ? -.6 : 0, phi: step / 120 * Math.PI * 1.5, walk: t > 58.15 && t < 58.6 ? 1 : 0 };
    if (i === 0) { if (t > 57.95 && t < 58.2) Object.assign(p, { handL: handleEx(op) }); if (t >= 58.2) Object.assign(p, { x: lerp(870 - step, 735, ss(seg(t, 58.2, 58.7))), back: true, f: -.1, alpha: 1 - ss(seg(t, 58.4, 58.7)) }); }
    if (i === 1) { p.headTurn = .3 * Math.sin(t * 1.5); }
    return p;
  });
  const w = { id: 'last', ...walk(t, 54.9, 56.3, [1800, 1734], [1352, 1734], false), skin: 'blue2', ...idle(t, 13) };
  if (t >= 56.3) Object.assign(w, { f: lerp(-.9, -.3, ss(seg(t, 56.3, 56.6))), look: -1, headUp: .01, smile: ss(seg(t, 56.7, 57.1)), x: 1352 - step });
  if (t >= 58.15) Object.assign(w, { phi: step / 120 * Math.PI * 1.5, walk: t < 58.6 ? 1 : 0, f: -.7, look: 0, headUp: 0 });
  const inside = [...crowdSmall(t), inGuest(t, 54.6), { id: 'passer', skin: 'blue2', x: WT + 92, y: WY, s: WS, f: -.8, sit: 1, ...idle(t, 3), smile: .8 }, inOwner(t, WT + 175)];
  return { set: 'ex', look: 'night', cam: V([[54.6, [1040, 1440, 1.0]], [58.7, [1030, 1410, .9]]])(t), chars: [...Q, w], inside, inItems: [winPlate(-1, .3), winPlate(1, .5)], exDoor: op, wet: 1, sign: 1 };
}

export const SCENES = [[0, homeSave], [2.9, storefront], [5.0, bedroom], [6.95, kitchen], [8.85, wiping], [12.3, flipSign], [13.2, day1], [16.0, day2], [21.0, doorOpens], [26.1, welcome], [31.5, seen], [36.9, entersToo], [38.9, andMore], [42.6, fullRoom], [50.85, finale]];
export function sceneAt(t) { let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1][0]) i++; return SCENES[i][1](Math.min(t, DUR - 1e-3)); }
