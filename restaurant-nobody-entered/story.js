// The film's timeline (2D): eleven scenes cut to the Hungarian voiceover, measured from the pauses in refs/voiceover-hu.mp3.
// The owner is always white; every customer is dark blue. Every action touches what it acts on: hands go to handles, cloths, chairs, plates.
import { clamp, lerp, seg, ss, track, hash } from '/core/lib.js';
import { BASE_H } from './char2d.js';

export const DUR = 58.7;
export const T = { s1: 0, s2: 5.0, s3: 13.2, s4: 16.0, s5: 21.0, s6: 26.1, s7: 31.5, s8: 36.9, s9: 38.9, s10: 42.6, s11: 50.85 };
export const DISSOLVES = [{ at: T.s3, d: .5, blur: 0 }, { at: T.s10, d: .45, blur: 8 }, { at: 54.6, d: .55, blur: 0 }];

// wiping: two circles, a closer look, one more circle
const WIPE = [[5.2, 7.1, .95], [7.7, 9.0, 1.1]];
const wipeStrokes = WIPE.flatMap(([a, b, p]) => { const o = []; for (let t = a + p * .25; t < b; t += p / 2) o.push(+t.toFixed(3)); return o; });
const bites = (t0, t1, per, seed) => { const o = []; for (let t = t0 + hash(seed) * per; t < t1; t += per) o.push(+(t + per * .45).toFixed(3)); return o; };
export const HIT = {
  signOn: 4.6, keyJingle: 3.35, keyIn: 3.62, lockClick: 4.75,
  wipes: wipeStrokes, chairTuck: 9.45, handle1: 12.3, doorCreak: 12.4, flip: 12.95,
  polish: [13.6, 14.3, 15.0], bell1: 22.75, doorShut1: 25.45,
  standUp: 26.15, handshake: [27.55, 27.85, 28.15], chairPull: 29.15, sit: 29.85, chairPush: 30.05, menuDown: 31.15,
  plateDown1: 33.1, clap1: [33.35, 33.55, 33.75], forks: bites(34.2, 36.9, .75, 3),
  handle2: 37.38, bell2: 37.5, handle3: 39.35, bell3: 39.45, handle4: 40.68, bell4: 40.75,
  plateDown2: 45.0, plateDown3: 45.6, clap2: [45.85, 46.05, 46.25], laugh: 46.4, bell5: 58.05,
};

// interior depth rows: feet line and scale
export const ROWS = [[1400, .82], [1620, .92], [1860, 1.02]];
export const sOf = y => lerp(.82, 1.02, (y - 1400) / 460);
export const TABLES = { A: [910, 0], B: [500, 0], C: [280, 1], D: [760, 1], E: [1230, 1], F: [1010, 2] };
export function seatPos(id, i) { const [x, r] = TABLES[id], [y, s] = ROWS[r]; return [x + (i ? 1 : -1) * 108 * s, y - 1, i ? -.8 : .8, s]; }
const topY = id => { const [, r] = TABLES[id], [y, s] = ROWS[r]; return y - .5 * BASE_H * s; };
const spot = (id, i) => { const [x, r] = TABLES[id], s = ROWS[r][1]; return [x + (i ? 1 : -1) * .26 * BASE_H * s, topY(id) + 4, s]; };
// door handles (they move with the door)
const handleIn = op => [lerp(390, 390 - 240 * Math.cos(op * 1.3), .85), 1160];
const handleEx = op => [lerp(640, 640 + 170 * Math.cos(op * 1.25), .86), 1495];

const V = keys => track(keys);
function blinkAt(t, seed) { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; }
const idle = (t, seed, o = {}) => ({ bob: Math.sin(t * 2.2 + seed) * .006, blink: blinkAt(t, seed), ...o });
function walk(t, t0, t1, A, B, inside = true, stride = 58) {
  const u = seg(t, t0, t1), e = ss(u), x = lerp(A[0], B[0], e), y = lerp(A[1], B[1], e), moving = t > t0 && t < t1;
  const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1;
  return { x, y, s: inside ? sOf(y) : 1, f: clamp(dx / d * 1.1, -.95, .95), back: dy < -Math.abs(dx) * .7, phi: e * d / stride * Math.PI, walk: moving ? Math.min(1, Math.sin(u * Math.PI) * 2.2) : 0 };
}
// a seated diner: eats (hand from plate to mouth) or drinks (cup to mouth) on a loop
function diner(t, id, i, skin, seed, mode = 'eat', o = {}) {
  const [x, y, f, s] = seatPos(id, i), H = BASE_H * s, [px, py] = spot(id, i), mouth = [x + f * .12 * H, y - .13 * H - .66 * H];
  const per = 2.2 + hash(seed) * 1.6, ph = ((t + hash(seed + 1) * per) % per) / per, lift = ph < .5 ? Math.sin(ph / .5 * Math.PI) : 0;
  const hand = [lerp(px, mouth[0], lift), lerp(py - 4, mouth[1], lift)], near = f > 0 ? 'handR' : 'handL';
  const p = { id: id + i, x, y, s, f, sit: 1, skin, ...idle(t, seed), smile: .55 + .45 * Math.max(0, Math.sin(t * .8 + seed)), armL: .25, armR: .25, ...o };
  if (mode === 'eat' || mode === 'drink') p[near] = hand;
  if (mode === 'drink') p.cupAt = lift > .05 ? hand : null;
  if (lift > .6) p.o = .5;
  return p;
}
const plateItem = (id, i, steam = 0) => { const [x, y, s] = spot(id, i); return { k: 'plate', x, y, s: BASE_H * s * .55, steam, d: ROWS[TABLES[id][1]][0] + .5 }; };
const cupItem = (id, i) => { const [x, y, s] = spot(id, i); return { k: 'cup', of: id + i, x: x + (i ? -1 : 1) * .2 * BASE_H * s, y, s: BASE_H * s * .2, d: ROWS[TABLES[id][1]][0] + .6 }; };
const OW = 'owner';

// —— 1: dawn. The sign is dark; he arrives, looks up at it, unlocks — and it lights ——
const s1cam = V([[0, [940, 1048, 1.75]], [1.4, [935, 1060, 1.7]], [3.2, [800, 1350, 1.32]], [5, [765, 1455, 1.32]]]);
function scene1(t) {
  const ow = { id: 'owner', skin: OW, ...walk(t, .6, 2.5, [1250, 1722], [752, 1722], false), ...idle(t, 1), hold: 'key', smile: .35 };
  if (t >= 2.5 && t < 3.1) Object.assign(ow, { f: .1, look: -1, headUp: .01, smile: .3 + .5 * ss(seg(t, 2.6, 2.9)), armL: -.6, armR: -.6 });
  if (t >= 3.1) { const k = handleEx(0); Object.assign(ow, { f: .25, back: true, armL: .1, handR: [k[0] + 4 + (t > 4.4 ? 3 * ss(seg(t, 4.4, 4.75)) : 0), 1478 + 26 * (1 - ss(seg(t, 3.1, 3.6)))] }); }
  return { set: 'ex', look: 'dawn', cam: s1cam(t), chars: [ow], inside: [], sign: ss(seg(t, 4.6, 4.95)), signFlick: t > 4.6 && t < 4.95, lanterns: lerp(.5, 1, ss(seg(t, 4.65, 4.9))), interiorLit: .15 };
}

// —— 2: morning. Wipes the table, straightens a chair, opens the door, flips the sign to NYITVA ——
const s2cam = V([[5, [500, 1255, 1.7]], [9.9, [470, 1255, 1.7]], [12.2, [300, 1240, 1.6]], [13.2, [285, 1235, 1.6]]]);
function scene2(t) {
  const ow = { id: 'owner', skin: OW, x: 432, y: 1404, s: sOf(1404), f: .85, ...idle(t, 1), smile: .4 };
  const restCloth = { k: 'cloth', x: 486, y: 1316, s: 1, d: 1400.6 };
  let cloth = restCloth, tuck = 0, door = 0;
  if (t < 9.1) {
    const w = WIPE.find(([a, b]) => t >= a && t < b), inspect = t >= 7.1 && t < 7.7;
    const ph = w ? (t - w[0]) / w[2] * Math.PI * 2 : 0, hx = 486 + (w ? Math.cos(ph) * 22 : 0), hy = 1316 + (w ? Math.sin(ph) * 5 : 0);
    Object.assign(ow, { handR: [hx, hy - 4], armL: .15, lean: inspect ? .16 : .1, look: inspect ? 1 : .7, headDX: inspect ? .03 : 0, smile: inspect ? .2 : .4 });
    cloth = { k: 'cloth', x: hx, y: hy, s: 1, d: 1400.6 };
  } else if (t < 10.0) { tuck = ss(seg(t, 9.4, 9.8)); Object.assign(ow, { f: -.7, handL: [lerp(388, 403, tuck), 1282], armR: .2 }); }
  else if (t < 12.1) { Object.assign(ow, walk(t, 10.0, 12.1, [432, 1404], [205, 1392])); tuck = 1; }
  else {
    door = ss(seg(t, 12.32, 13.0)) * .95; tuck = 1;
    const back = ss(seg(t, 12.4, 12.95)), yy = lerp(1392, 1440, back);
    Object.assign(ow, { x: lerp(205, 160, back), y: yy, s: sOf(yy), f: -.2, back: t < 12.9, handL: handleIn(door), smile: .7 });
    if (t > 12.9) Object.assign(ow, { f: .3, back: false, handL: undefined, armL: .3 });
  }
  return { set: 'in', look: 'morning', cam: s2cam(t), chars: [ow], items: [cloth], tuck, door, plaque: ss(seg(t, 12.85, 13.05)), lamps: lerp(.45, 1, ss(seg(t, 5, 9))) };
}

// —— 3: day one. Polishing a glass behind the counter, watching the door ——
function scene3(t) {
  const pol = t < 15.0, ph = (t - 13.2) * 7, gx = 1335 + (pol ? Math.cos(ph) * 6 : 0), gy = 1302;
  const ow = { id: 'owner', skin: OW, x: 1340, y: 1408, s: sOf(1408), f: -.55, ...idle(t, 1), handL: [gx - 12, gy + 6 + (pol ? Math.sin(ph) * 4 : 0)], handR: [gx + 12, gy + 2],
    squash: .05 * Math.sin(seg(t, 15.1, 15.9) * Math.PI), look: -.1 + .3 * ss(seg(t, 15.1, 15.6)), sad: .4 * ss(seg(t, 15.1, 15.8)) };
  const out = [walk(t, 13.2, 16, [520, 1330], [1260, 1330], false), walk(t, 13.2, 16, [1250, 1335], [600, 1335], false)].map((p, i) => ({ ...p, s: .8, skin: i ? 'blue3' : 'blue2', ...idle(t, 4 + i), dim: .55 }));
  return { set: 'in', look: 'dusk', cam: V([[13.2, [800, 1290, .95]], [16, [800, 1300, .98]]])(t), chars: [ow], outside: out, items: [{ k: 'glass', x: gx, y: gy + 8, s: 1, d: 1409 }], plaque: 1, lamps: 1 };
}

// —— 4: day two. Rain; chin on his hand at the window table; a cold coffee ——
function scene4(t) {
  const [sx, sy, , s] = seatPos('A', 1), look = ss(seg(t, 17.9, 18.7)) - ss(seg(t, 19.0, 19.6)), shake = t > 19.6 && t < 20.3 ? Math.sin(seg(t, 19.6, 20.3) * Math.PI * 2) * .25 : 0;
  const [cx, cy] = spot('A', 1);
  const ow = { id: 'owner', skin: OW, x: sx, y: sy, s, f: -.75 - .2 * look + shake, sit: 1, ...idle(t, 1), sad: 1, chin: look < .5 ? 'L' : null, armL: .3,
    handR: [cx - 6 + Math.sin(t * 1.7) * 3, cy - 2], tilt: lerp(-.16, 0, look), look: lerp(.5, -.4, look) + .3 * ss(seg(t, 20.2, 20.9)), squash: .06 * Math.sin(seg(t, 20.2, 21) * Math.PI), headDX: lerp(-.02, 0, look),
    blink: t > 16.8 && t < 17.4 ? Math.sin(seg(t, 16.8, 17.4) * Math.PI) : blinkAt(t, 1) };
  return { set: 'in', look: 'night', cam: V([[16, [985, 1265, 2.15]], [21, [990, 1275, 2.35]]])(t), chars: [ow], items: [cupItem('A', 1)], rain: 1, drops: 1, lamps: .8, candleLow: true, plaque: 1 };
}

// —— 5: the door opens ——
function scene5(t) {
  const [sx, sy, , s] = seatPos('A', 1), turn = ss(seg(t, 22.7, 23.0));
  const ow = { id: 'owner', skin: OW, x: sx, y: sy, s, f: lerp(-.75, -.95, turn), sit: 1, ...idle(t, 1), sad: 1 - turn, o: turn * (1 - ss(seg(t, 24.6, 25.4))), smile: .4 * ss(seg(t, 25.0, 25.8)), chin: turn < .5 ? 'L' : null, armL: .3, look: turn ? -.2 : .5 };
  const door = ss(seg(t, 22.6, 23.15)) * (1 - ss(seg(t, 24.5, 25.5)));
  const g = walk(t, 23.1, 24.3, [262, 1370], [470, 1462]);
  if (t < 23.1) Object.assign(g, { x: 262, y: 1370, s: sOf(1370), f: .1, handR: handleIn(door) });
  if (t >= 24.3) { const ph = seg(t, 24.35, 25.2); g.f = Math.sin(ph * Math.PI * 2) * .6; if (t > 25.2) g.f = lerp(0, .8, ss(seg(t, 25.2, 25.6))); g.back = false; }
  Object.assign(g, { id: 'guest', skin: 'blue1', vis: t > 22.62, ...idle(t, 2), o: .4 * ss(seg(t, 24.3, 24.6)) * (1 - ss(seg(t, 25.3, 25.7))), smile: .4 * ss(seg(t, 25.4, 25.9)) });
  return { set: 'in', look: 'night', cam: V([[21, [610, 1262, 1.12]], [26.1, [625, 1268, 1.15]]])(t), chars: [ow, g], items: [cupItem('A', 1)], door, rain: 1, drops: .6, lamps: .95, plaque: 1 };
}

// —— 6: welcomed like a hundred guests: a handshake, his best seat, a menu ——
function scene6(t) {
  const [ox, oy, , os] = seatPos('A', 1), [gx, gy, , gs] = seatPos('A', 0), gStart = [470, 1462], meet = [548, 1462], chairBack = [gx - .15 * BASE_H * gs, gy - .7 * BASE_H * gs];
  const pull = 30 * (ss(seg(t, 29.05, 29.45)) - ss(seg(t, 29.95, 30.35))), behind = [900, 1372];
  let ow;
  if (t < 26.6) { const u = seg(t, 26.1, 26.55); ow = { x: ox, y: oy, s: os, f: -.85, sit: 1 - ss(u), bob: Math.sin(u * Math.PI) * .08, o: 1 - ss(seg(t, 26.2, 26.5)), smile: ss(seg(t, 26.25, 26.55)) }; }
  else if (t < 27.4) ow = { ...walk(t, 26.6, 27.4, [ox - 10, oy + 30], meet), smile: 1 };
  else if (t < 28.35) { const sh = Math.sin((t - 27.4) * Math.PI * 2 / .3) * 7 * (t < 28.2 ? 1 : 0); ow = { x: meet[0], y: meet[1], s: sOf(meet[1]), f: -.75, smile: 1, handL: [510, 1390 + sh], armR: .2 }; }
  else if (t < 29.0) ow = { ...walk(t, 28.35, 29.0, meet, [gx - 62, gy + 18]), smile: 1, armR: .9 };
  else if (t < 30.45) ow = { x: gx - 62, y: gy + 18, s: sOf(gy + 18), f: .6, smile: 1, handR: [chairBack[0] - pull, chairBack[1]] };
  else if (t < 30.95) ow = { ...walk(t, 30.45, 30.95, [gx - 62, gy + 18], behind), smile: 1 };
  else { const [mx, my] = spot('A', 0), u = ss(seg(t, 30.95, 31.2)); ow = { x: behind[0], y: behind[1], s: sOf(behind[1]), f: -.2, smile: 1, handR: t < 31.35 ? [lerp(behind[0] - 10, mx + 8, u), lerp(1290, my - 2, u)] : undefined, armR: .2 }; }
  ow = { id: 'owner', skin: OW, ...idle(t, 1), ...ow };
  let g;
  if (t < 28.6) { const sh = t >= 27.4 && t < 28.2 ? Math.sin((t - 27.4) * Math.PI * 2 / .3) * 7 : 0; g = { x: gStart[0], y: gStart[1], s: sOf(gStart[1]), f: .75, ...idle(t, 2), o: .35 * (1 - ss(seg(t, 26.9, 27.4))), smile: .65 * ss(seg(t, 27.4, 27.9)), handR: t >= 27.4 && t < 28.2 ? [510, 1390 + sh] : undefined }; }
  else if (t < 29.6) g = { ...walk(t, 28.6, 29.6, gStart, [gx - pull, gy + 1]), smile: .65 };
  else { const u = ss(seg(t, 29.6, 30.0)); g = { x: gx - pull, y: gy, s: gs, f: .8, sit: u, ...idle(t, 2), smile: .65 + .3 * ss(seg(t, 31.1, 31.4)) }; }
  Object.assign(g, { id: 'guest', skin: 'blue1' });
  const items = [cupItem('A', 1)];
  if (t > 31.2) { const [mx, my] = spot('A', 0); items.push({ k: 'menu', x: mx + 8, y: my, s: 1, d: 1400.6 }); }
  else if (t > 30.95 && ow.handR) items.push({ k: 'menu', x: ow.handR[0], y: ow.handR[1] + 2, s: 1, d: 1373 });
  return { set: 'in', look: 'night', cam: V([[26.1, [700, 1300, 1.3]], [31.5, [820, 1300, 1.4]]])(t), chars: [ow, g], items, pullA0: pull, rain: 1, drops: .6, lamps: lerp(.95, 1.1, ss(seg(t, 26.3, 28))), plaque: 1 };
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

// —— 7: the owner serves; a passer-by stops at the window and sees the guest eating ——
function scene7(t) {
  const y = { id: 'passer', ...walk(t, 31.5, 33.6, [140, 1722], [1340, 1722], false), skin: 'blue2', ...idle(t, 3) };
  if (t >= 33.6) {
    const wob = Math.sin(seg(t, 33.6, 34.0) * Math.PI * 2) * .05 * (1 - seg(t, 33.6, 34.0));
    Object.assign(y, { f: lerp(.9, -.7, ss(seg(t, 33.8, 34.4))), lean: wob, o: ss(seg(t, 34.3, 34.6)) * (1 - ss(seg(t, 35.4, 35.8))), smile: .6 * ss(seg(t, 35.5, 36.0)), headDX: -.02 * ss(seg(t, 34.6, 35.4)) });
    if (t > 36.0) Object.assign(y, walk(t, 36.0, 36.9, [1340, 1722], [1000, 1722], false));
  }
  let ow, plate;
  if (t < 32.6) { ow = { ...inOwner(t), ...walk(t, 31.5, 32.6, [1250, WY - 6], [1150, WY - 6], false), s: WS }; plate = { k: 'plate', x: ow.x - 30, y: WY - .62 * WH, s: WH * .55, steam: 1, d: WY + .7 }; ow.handR = [plate.x + 8, plate.y + 2]; }
  else { const u = ss(seg(t, 32.6, 33.1)); ow = { ...inOwner(t, 1150) }; const px = lerp(1120, WT - 42, u), py = lerp(WY - .62 * WH, WTOP + 3, u); plate = { k: 'plate', x: px, y: py, s: WH * .55, steam: 1, d: WY + .7 }; if (t < 33.25) ow.handR = [px + 8, py + 2]; else ow.armR = .2; }
  const g = inGuest(t, 34.2); if (t > 33.3 && t < 33.9) { const c = Math.sin((t - 33.3) * Math.PI * 2 / .2); g.handL = [WT - 70 + c * 3, WY - .62 * WH]; g.handR = [WT - 70 - c * 3, WY - .62 * WH]; g.smile = 1; }
  return { set: 'ex', look: 'night', cam: V([[31.5, [520, 1480, 1.5]], [33.6, [960, 1480, 1.5]], [36.9, [1060, 1485, 1.6]]])(t), chars: [y], inside: [g, ow], inItems: [plate], wet: 1, sign: 1 };
}
// —— 8: he enters too ——
function scene8(t) {
  const op = ss(seg(t, 37.42, 37.8)) * (1 - ss(seg(t, 38.5, 38.9)) * .5), h = handleEx(op);
  const y = { id: 'passer', ...walk(t, 36.9, 37.38, [1000, 1722], [800, 1716], false), skin: 'blue2', ...idle(t, 3), smile: .4 };
  if (t >= 37.3 && t < 37.62) Object.assign(y, { f: -.6, handL: h });
  if (t >= 37.62) { const u = seg(t, 37.62, 38.6); Object.assign(y, { x: lerp(800, 730, u), y: lerp(1716, 1668, u), s: lerp(1, .86, u), back: true, f: -.1, alpha: 1 - ss(seg(t, 38.15, 38.6)), phi: u * 6, walk: u > 0 && u < 1 ? 1 : 0 }); }
  const ow = { ...inOwner(t, 1150), f: lerp(-.6, -1, ss(seg(t, 37.5, 37.8))), o: ss(seg(t, 37.55, 37.75)) * (1 - ss(seg(t, 38.1, 38.4))) };
  return { set: 'ex', look: 'night', cam: V([[36.9, [840, 1480, 1.5]], [38.9, [790, 1470, 1.6]]])(t), chars: [y], inside: [inGuest(t, 36.9), ow], inItems: [winPlate(-1, .6)], exDoor: op, wet: 1, sign: 1 };
}
// —— 9: then another, and another ——
function scene9(t) {
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

// —— 10: the full room: the owner serves table E, then stops to look around ——
export const FULL = [['A', 0, 'blue1', 2, 'eat'], ['A', 1, 'blue2', 3, 'eat'], ['B', 0, 'blue3', 4, 'drink'], ['B', 1, 'blue1', 6, 'eat'], ['C', 0, 'blue2', 7, 'eat'], ['C', 1, 'blue3', 8, 'drink'], ['E', 0, 'blue1', 11, 'wait'], ['E', 1, 'blue3', 12, 'wait'], ['F', 0, 'blue2', 9, 'eat'], ['F', 1, 'blue1', 10, 'drink']];
function crowd(t, laugh = true) {
  return FULL.map(([id, i, sk, seed, mode]) => {
    let m = mode; if (id === 'E') m = t > (i ? HIT.plateDown2 : HIT.plateDown3) + 1.2 ? 'eat' : 'none';
    const p = diner(t, id, i, sk, seed, m);
    if (id === 'E' && t > HIT.clap2[0] - .1 && t < HIT.clap2[2] + .2) { const c = Math.sin((t - HIT.clap2[0]) * Math.PI * 2 / .2), [x, y, f, s] = seatPos(id, i), H = BASE_H * s; p.handL = [x + f * .1 * H + c * 3, y - .58 * H]; p.handR = [x + f * .1 * H - c * 3, y - .58 * H]; p.smile = 1; }
    if (laugh && id === 'B' && i === 1) { const u = seg(t, HIT.laugh, HIT.laugh + 1); if (u > 0 && u < 1) { p.bob = Math.abs(Math.sin(u * Math.PI * 4)) * .05 * (1 - u); p.smile = 1; p.handL = undefined; p.handR = undefined; } }
    return p; });
}
function crowdItems() {
  const it = [];
  for (const [id, i, , , mode] of FULL) { if (id === 'E') continue; it.push(plateItem(id, i)); if (mode === 'drink') it.push(cupItem(id, i)); }
  return it;
}
function scene10(t) {
  const E = [1230, 1588], mid = [720, 1720], H = BASE_H * sOf(E[1]), trayY = E[1] - .5 * H;
  let ow, items = crowdItems();
  const placed = [t > HIT.plateDown2, t > HIT.plateDown3];
  if (t < 44.0) ow = { ...walk(t, 42.6, 44.0, [1330, 1470], E), hold: 'tray', trayItems: ['plate', 'plate'] };
  else if (t < 46.0) {
    ow = { x: E[0], y: E[1], s: sOf(E[1]), f: 0, ...idle(t, 1), smile: 1 };
    const [r1x, r1y] = spot('E', 1), [r0x, r0y] = spot('E', 0), a = seg(t, 44.5, 45.0), b = seg(t, 45.1, 45.6);
    // the tray rests on the table; the right hand sets a plate at E1, then the left hand one at E0
    let onTray = 2 - (a > 0 ? 1 : 0) - (b > 0 ? 1 : 0);
    if (t < 45.7) items.push({ k: 'tray', x: E[0], y: trayY + 2, s: H, d: E[1] + .3, plates: onTray });
    if (a > 0 && t < 45.05) { const u = ss(a), px = lerp(E[0] + 20, r1x, u), py = lerp(trayY - 6, r1y, u) - Math.sin(u * Math.PI) * 14; ow.handR = [px, py - 2]; items.push({ k: 'plate', x: px, y: py, s: H * .55, steam: 1, d: E[1] + .4 }); }
    if (b > 0 && t >= 45.05 && t < 45.65) { const u = ss(b), px = lerp(E[0] - 20, r0x, u), py = lerp(trayY - 6, r0y, u) - Math.sin(u * Math.PI) * 14; ow.handL = [px, py - 2]; items.push({ k: 'plate', x: px, y: py, s: H * .55, steam: 1, d: E[1] + .4 }); }
    if (t < 44.5) { ow.handL = [E[0] - 40, trayY]; ow.handR = [E[0] + 40, trayY]; }
    if (!ow.handR) ow.armR = .5; if (!ow.handL) ow.armL = .5;
    if (t >= 45.7) { ow.hold = 'tray'; ow.trayItems = []; ow.handL = ow.handR = undefined; }
  } else if (t < 47.6) ow = { ...walk(t, 46.0, 47.6, E, mid), hold: 'tray', trayItems: [] };
  else { const u = seg(t, 47.6, 50.85); ow = { x: mid[0], y: mid[1], s: sOf(mid[1]), f: Math.sin(u * Math.PI * 1.5) * .6, ...idle(t, 1), hold: 'tray', trayItems: [] }; }
  if (placed[0]) items.push(plateItem('E', 1, 1)); if (placed[1]) items.push(plateItem('E', 0, 1));
  ow = { id: 'owner', skin: OW, smile: 1, ...ow }; if (ow.hold === 'tray') { ow.armL = -.55; ow.armR = -.55; }
  return { set: 'in', look: 'night', cam: V([[42.6, [760, 1290, .95]], [46, [745, 1310, 1.0]], [50.85, [725, 1380, 1.12]]])(t), chars: [ow, ...crowd(t)], items, lamps: 1.15, plaque: 1 };
}
// —— 11: trust ——
function scene11(t) {
  if (t < 54.6) {
    const ow = { id: 'owner', skin: OW, x: 720, y: 1720, s: sOf(1720), ...idle(t, 1), hold: 'tray', trayItems: [], armL: -.55, armR: -.55,
      f: .55 * Math.sin(seg(t, 51.2, 53.4) * Math.PI) - .55 * Math.sin(seg(t, 52.3, 53.6) * Math.PI), smile: lerp(.35, 1, ss(seg(t, 53.9, 54.4))), look: -.2 };
    ow.blink = t > 53.5 && t < 54.1 ? 1 : blinkAt(t, 1);
    return { set: 'in', look: 'night', cam: V([[50.85, [725, 1380, 1.12]], [52.5, [722, 1500, 1.6]], [54.6, [720, 1530, 1.85]]])(t), chars: [ow, ...crowd(t, false)], items: [...crowdItems(), plateItem('E', 0), plateItem('E', 1)], lamps: 1.15, plaque: 1 };
  }
  // outside again: someone stops at the menu board, looks in at the full window, and goes to the door
  let op = 0;
  const w = { id: 'last', ...walk(t, 54.9, 55.8, [1680, 1730], [1462, 1726], false), skin: 'blue3', ...idle(t, 13) };
  if (t >= 55.8 && t < 56.6) Object.assign(w, { f: -.45, look: .4, headDX: -.01 });
  if (t >= 56.6 && t < 57.0) Object.assign(w, { f: -.75, o: ss(seg(t, 56.6, 56.8)), look: -.1 });
  if (t >= 57.0) Object.assign(w, walk(t, 57.0, 57.95, [1462, 1726], [802, 1718], false), { smile: .7 });
  if (t >= 57.95) { op = ss(seg(t, 58.02, 58.5)) * .7; Object.assign(w, { x: 802, y: 1718, f: -.6, handL: handleEx(op), walk: 0, smile: .8 }); }
  const inside = [...crowdSmall(t), inGuest(t, 54.6), { id: 'passer', skin: 'blue2', x: WT + 92, y: WY, s: WS, f: -.8, sit: 1, ...idle(t, 3), smile: .8 }, inOwner(t, WT + 175)];
  return { set: 'ex', look: 'night', cam: V([[54.6, [960, 1400, .98]], [58.7, [950, 1370, .9]]])(t), chars: [w], inside, inItems: [winPlate(-1, .3), winPlate(1, .5)], exDoor: op, wet: 1, sign: 1 };
}

export const SCENES = [[T.s1, scene1], [T.s2, scene2], [T.s3, scene3], [T.s4, scene4], [T.s5, scene5], [T.s6, scene6], [T.s7, scene7], [T.s8, scene8], [T.s9, scene9], [T.s10, scene10], [T.s11, scene11]];
export function sceneAt(t) { let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1][0]) i++; return SCENES[i][1](Math.min(t, DUR - 1e-3)); }
