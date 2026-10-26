// The film's timeline (2D): eleven scenes cut to the Hungarian voiceover, measured from the pauses in refs/voiceover-hu.mp3.
// The owner is always white; every customer is dark blue.
import { clamp, lerp, seg, ss, track, hash } from '/core/lib.js';

export const DUR = 58.7;
export const T = { s1: 0, s2: 5.0, s3: 13.2, s4: 16.0, s5: 21.0, s6: 26.1, s7: 31.5, s8: 36.9, s9: 38.9, s10: 42.6, s11: 50.85 };
export const HIT = {
  keyJingle: 3.4, lockClick: 4.9, wipe1: 5.4, wipe2: 6.3, wipe3: 8.0, chairUp: 9.95, chairDown: 10.45, doorCreak: 12.25,
  bell1: 22.75, guestSteps: 23.1, doorShut1: 25.4, chairPull: 28.7, sit: 29.9, cupClink: 31.2, sip: 33.4,
  ystop: 33.6, bell2: 37.5, bell3: 39.45, bell4: 40.75, trayDown: 45.0, laugh: 46.1, bell5: 58.05,
};
export const DISSOLVES = [{ at: T.s3, d: .5, blur: 0 }, { at: T.s10, d: .45, blur: 8 }, { at: 54.6, d: .55, blur: 0 }];

// interior depth rows: feet line and scale
export const ROWS = [[1400, .82], [1620, .92], [1860, 1.02]];
export const sOf = y => lerp(.82, 1.02, (y - 1400) / 460);
export const TABLES = { A: [910, 0], B: [500, 0], C: [280, 1], D: [760, 1], E: [1230, 1], F: [1010, 2] };
export function seatPos(id, i) { const [x, r] = TABLES[id], [y, s] = ROWS[r]; return [x + (i ? 1 : -1) * 108 * s, y - 1, i ? -.8 : .8, s]; }

const V = keys => track(keys);
function blinkAt(t, seed) { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; }
const idle = (t, seed, o = {}) => ({ bob: Math.sin(t * 2.2 + seed) * .006, blink: blinkAt(t, seed), ...o });
// a walk from A to B (world x, y): position, facing and phase; scale follows depth when inside
function walk(t, t0, t1, A, B, inside = true, stride = 60) {
  const u = seg(t, t0, t1), e = ss(u), x = lerp(A[0], B[0], e), y = lerp(A[1], B[1], e), moving = t > t0 && t < t1;
  const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1;
  return { x, y, s: inside ? sOf(y) : 1, f: clamp(dx / d * 1.1, -.95, .95), back: dy < -Math.abs(dx) * .7, phi: e * d / stride * Math.PI, walk: moving ? Math.min(1, Math.sin(u * Math.PI) * 2.2) : 0 };
}
function seated(t, id, i, skin, seed, o = {}) { const [x, y, f, s] = seatPos(id, i); return { x, y, s, f, sit: 1, skin, ...idle(t, seed), armL: .25, armR: .25, ...o }; }
const OW = 'owner';

// —— 1: dawn, the owner with his key ——
const s1cam = V([[0, [1000, 60, .95]], [2.0, [930, 640, .95]], [3.6, [780, 1300, 1.2]], [5, [735, 1440, 1.35]]]);
function scene1(t) {
  const turn = ss(seg(t, 4.0, 4.7));
  const ow = { skin: OW, x: lerp(730, 700, turn), y: 1722, s: 1, f: lerp(.35, -.2, turn), back: turn > .5, ...idle(t, 1),
    look: lerp(-1, .3, ss(seg(t, 2.9, 3.4))), headUp: .01 * (1 - ss(seg(t, 2.9, 3.4))), armL: lerp(-.7, .1, turn), armR: lerp(-.7, 1.4, turn),
    smile: .25 + .35 * ss(seg(t, 3.8, 4.3)), hold: 'key', blink: t > 3.55 && t < 3.85 ? Math.sin(seg(t, 3.55, 3.85) * Math.PI) : blinkAt(t, 1) };
  return { set: 'ex', look: 'dawn', cam: s1cam(t), chars: [ow], inside: [], birds: seg(t, .2, 4.6), lanterns: lerp(.5, 1, ss(seg(t, 3.4, 3.8))), interiorLit: .15 };
}

// —— 2: morning prep ——
const s2cam = V([[5, [520, 1240, 1.7]], [9.9, [500, 1245, 1.7]], [12.4, [360, 1230, 1.6]], [13.2, [345, 1225, 1.6]]]);
function scene2(t) {
  let ow = { skin: OW, x: 500, y: 1378, s: .815, f: 0, ...idle(t, 1), smile: .35 };
  if (t < 9.1) {
    const on = t < 7.1 || t > 7.6, ph = (t < 7.1 ? (t - 5.2) / .95 : (t - 7.7) / 1.1) * Math.PI * 2;
    Object.assign(ow, { armR: on ? .55 + Math.sin(ph) * .22 : .45, armL: .2, look: .6, lean: on ? Math.cos(ph) * .04 : 0, headDX: on ? Math.cos(ph) * .015 : 0, hold: 'cloth', f: on ? Math.cos(ph) * .15 : .1 });
  } else if (t < 9.9) { const u = seg(t, 9.1, 9.9); Object.assign(ow, { f: -.6, armL: .3 + .6 * Math.sin(u * Math.PI), lean: -.05 * Math.sin(u * Math.PI) }); }
  else if (t < 12.2) Object.assign(ow, walk(t, 9.9, 12.2, [500, 1378], [300, 1376]), { smile: .35 });
  else Object.assign(ow, { x: 300, y: 1376, s: sOf(1376), f: -.25, back: true, armR: lerp(.2, 1.1, Math.sin(seg(t, 12.2, 12.8) * Math.PI)) });
  return { set: 'in', look: 'morning', cam: s2cam(t), chars: [ow], chairsUp: ['A', 'C', 'D', 'E', 'F'], tuck: ss(seg(t, 9.3, 9.8)), cloth: t >= 9.1 ? 'B' : null, door: ss(seg(t, 12.25, 13.0)) * .95, lamps: lerp(.45, 1, ss(seg(t, 5, 9))) };
}

// —— 3: day one, the empty room ——
function scene3(t) {
  const ow = { skin: OW, x: 640, y: 1640, s: sOf(1640), f: -.45, back: true, ...idle(t, 1), squash: .05 * Math.sin(seg(t, 15.0, 15.9) * Math.PI), headDX: -.01 * Math.sin(seg(t, 13.8, 14.8) * Math.PI) };
  const out = [walk(t, 13.2, 16, [520, 1330], [1260, 1330], false), walk(t, 13.2, 16, [1250, 1335], [600, 1335], false)].map((p, i) => ({ ...p, s: .8, skin: i ? 'blue3' : 'blue2', ...idle(t, 4 + i), dim: .55 }));
  return { set: 'in', look: 'dusk', cam: V([[13.2, [760, 1290, .95]], [16, [760, 1300, .98]]])(t), chars: [ow], outside: out, lamps: 1 };
}

// —— 4: day two, rain, doubt ——
function scene4(t) {
  const [sx, sy, , s] = seatPos('A', 1), look = ss(seg(t, 17.9, 18.7)) - ss(seg(t, 19.0, 19.6)), shake = t > 19.6 && t < 20.3 ? Math.sin(seg(t, 19.6, 20.3) * Math.PI * 2) * .25 : 0;
  const ow = { skin: OW, x: sx, y: sy, s, f: -.75 - .2 * look + shake, sit: 1, ...idle(t, 1), sad: 1, armL: lerp(-2.55, .3, look), armR: .3,
    tilt: lerp(-.18, 0, look), look: lerp(.5, -.3, look) + .3 * ss(seg(t, 20.2, 20.9)), squash: .06 * Math.sin(seg(t, 20.2, 21) * Math.PI), headDX: lerp(-.03, 0, look),
    blink: t > 16.8 && t < 17.4 ? Math.sin(seg(t, 16.8, 17.4) * Math.PI) : blinkAt(t, 1) };
  return { set: 'in', look: 'night', cam: V([[16, [985, 1265, 2.15]], [21, [990, 1275, 2.35]]])(t), chars: [ow], rain: 1, drops: 1, lamps: .8, cloth: 'A', candleLow: true };
}

// —— 5: the door opens ——
function scene5(t) {
  const g = walk(t, 23.0, 24.3, [270, 1372], [540, 1470]);
  if (t >= 24.3) { const ph = seg(t, 24.4, 25.3); g.f = Math.sin(ph * Math.PI * 2) * .6; if (t > 25.3) g.f = lerp(0, .75, ss(seg(t, 25.3, 25.7))); g.back = false; }
  Object.assign(g, { skin: 'blue1', vis: t > 22.6, ...idle(t, 2), o: .45 * ss(seg(t, 24.3, 24.7)) });
  if (t < 23.0) { g.x = 270; g.y = 1372; g.s = sOf(1372); g.f = .1; }
  const door = ss(seg(t, 22.55, 23.2)) * (1 - ss(seg(t, 24.4, 25.6)));
  return { set: 'in', look: 'night', cam: V([[21, [400, 1235, 1.55]], [26.1, [430, 1250, 1.5]]])(t), chars: [g], door, rain: 1, drops: .6, lamps: .95 };
}

// —— 6: welcomed like a hundred guests ——
function scene6(t) {
  const [ox, oy, , os] = seatPos('A', 1), [gx, gy, , gs] = seatPos('A', 0), meet = [700, 1462], host = [1080, 1432], gStart = [540, 1470];
  let ow;
  if (t < 26.6) { const u = seg(t, 26.1, 26.55); ow = { x: ox, y: oy, s: os, f: -.8, sit: 1 - ss(u), bob: Math.sin(u * Math.PI) * .08, o: 1 - ss(seg(t, 26.2, 26.5)), smile: ss(seg(t, 26.25, 26.55)) }; }
  else if (t < 27.5) ow = { ...walk(t, 26.6, 27.5, [ox + 20, oy + 25], meet), smile: 1 };
  else if (t < 28.5) { const u = seg(t, 27.5, 28.4), open = Math.sin(Math.min(1, u * 1.4) * Math.PI / 2) * (1 - ss(seg(t, 28.2, 28.5)) * .6);
    ow = { x: meet[0], y: meet[1], s: sOf(meet[1]), f: -.55, smile: 1, armL: .2 + 1.7 * open, armR: .2 + 1.7 * open, bob: Math.abs(Math.sin(u * Math.PI * 2)) * .025 }; }
  else if (t < 29.2) ow = { ...walk(t, 28.5, 29.2, meet, [gx - 40, gy + 30]), smile: 1 };
  else if (t < 30.4) ow = { x: gx - 40, y: gy + 30, s: sOf(gy + 30), f: .5, smile: 1, armL: .9, armR: .3 };
  else if (t < 31.0) ow = { ...walk(t, 30.4, 31.0, [gx - 40, gy + 30], host), smile: 1 };
  else { const u = seg(t, 31.0, 31.5); ow = { x: host[0], y: host[1], s: sOf(host[1]), f: -.55, smile: 1, armL: -.45, armR: -.45, lean: -.05 * Math.sin(u * Math.PI) }; }
  ow = { skin: OW, ...idle(t, 1), ...ow };
  let g;
  if (t < 29.4) g = { x: gStart[0], y: gStart[1], s: sOf(gStart[1]), f: .7, ...idle(t, 2), o: .4 * (1 - ss(seg(t, 27.0, 27.8))), smile: .6 * ss(seg(t, 27.6, 28.3)) };
  else if (t < 30.15) g = { ...walk(t, 29.4, 30.15, gStart, [gx, gy]), smile: .6 };
  else { const u = ss(seg(t, 30.15, 30.55)); g = { x: gx, y: gy, s: gs, f: .8, sit: u, ...idle(t, 2), smile: .6 }; }
  g.skin = 'blue1';
  return { set: 'in', look: 'night', cam: V([[26.1, [760, 1300, 1.32]], [31.5, [860, 1300, 1.42]]])(t), chars: [ow, g], pull: Math.sin(seg(t, 28.9, 30.1) * Math.PI) * 30, rain: 1, drops: .6, lamps: lerp(.95, 1.1, ss(seg(t, 26.3, 28))), cups: t > 31.2 ? ['A0'] : [] };
}

// —— the window table as seen from the street ——
const WT = 1080, WY = 1640, WS = .78;
function inGuest(t, sip = []) {
  const g = { skin: 'blue1', x: WT - 92, y: WY, s: WS, f: .8, sit: 1, ...idle(t, 2), smile: .55, armL: .25, armR: .25 };
  for (const [a, b] of sip) { const u = Math.sin(seg(t, a, b) * Math.PI); if (u > 0) { g.armR = .25 - 1.9 * u; g.hold = u > .3 ? 'cup' : null; g.look = -.3 * u; } }
  return g;
}
const inOwner = (t, x = WT + 110) => ({ skin: OW, x, y: WY - 6, s: WS, f: -.6, ...idle(t, 1), smile: 1, armL: .25 + .35 * Math.max(0, Math.sin(t * 3.1)), armR: .2 });
function crowdSmall(t) { return [[960, 'blue3'], [1230, 'blue2'], [700, 'blue1'], [1170, 'blue1']].map(([x, sk], i) => ({ skin: sk, x, y: 1565, s: .5, f: i % 2 ? -.7 : .7, sit: 1, ...idle(t, 20 + i), smile: .6 + .3 * Math.sin(t + i) })); }

// —— 7: someone stops at the window ——
function scene7(t) {
  const y = { ...walk(t, 31.5, 33.6, [140, 1722], [1340, 1722], false), skin: 'blue2', ...idle(t, 3) };
  if (t >= 33.6) {
    const wob = Math.sin(seg(t, 33.6, 34.0) * Math.PI * 2) * .05 * (1 - seg(t, 33.6, 34.0));
    Object.assign(y, { f: lerp(.9, -.7, ss(seg(t, 33.8, 34.4))), lean: wob, o: ss(seg(t, 34.3, 34.6)) * (1 - ss(seg(t, 35.4, 35.8))), smile: .5 * ss(seg(t, 35.5, 36.0)), headDX: -.02 * ss(seg(t, 34.6, 35.4)) });
    if (t > 36.0) Object.assign(y, walk(t, 36.0, 36.9, [1340, 1722], [1000, 1722], false));
  }
  return { set: 'ex', look: 'night', cam: V([[31.5, [520, 1480, 1.5]], [33.6, [960, 1480, 1.5]], [36.9, [1060, 1485, 1.6]]])(t), chars: [y], inside: [inGuest(t, [[32.9, 34.3]]), inOwner(t)], wet: 1, cupsIn: 1 };
}
// —— 8: he enters too ——
function scene8(t) {
  const y = { ...walk(t, 36.9, 37.45, [1000, 1722], [760, 1716], false), skin: 'blue2', ...idle(t, 3), smile: .35 };
  if (t >= 37.45) { const u = seg(t, 37.6, 38.6); Object.assign(y, { x: lerp(760, 728, u), y: lerp(1716, 1668, u), s: lerp(1, .86, u), back: true, f: -.1, alpha: 1 - ss(seg(t, 38.1, 38.6)), phi: u * 6, walk: u > 0 && u < 1 ? 1 : 0 }); if (t < 37.9) y.armR = 1.2; }
  return { set: 'ex', look: 'night', cam: V([[36.9, [820, 1480, 1.5]], [38.9, [770, 1470, 1.62]]])(t), chars: [y], inside: [inGuest(t), inOwner(t)], exDoor: ss(seg(t, 37.42, 37.8)) * (1 - ss(seg(t, 38.5, 38.9)) * .5), wet: 1, cupsIn: 1 };
}
// —— 9: then another, and another ——
function scene9(t) {
  const enter = (t0, t1, from, sk, seed) => { const p = { ...walk(t, t0, t1, from, [725, 1716], false), skin: sk, ...idle(t, seed), smile: .4 };
    if (t >= t1) { const u = seg(t, t1 + .05, t1 + .8); Object.assign(p, { x: 725, y: lerp(1716, 1668, u), s: lerp(1, .86, u), back: true, f: 0, alpha: 1 - ss(seg(t, t1 + .45, t1 + .8)), phi: u * 6, walk: u < 1 ? 1 : 0 }); }
    return p; };
  const a = enter(38.9, 39.45, [470, 1722], 'blue3', 4), b = enter(38.9, 40.7, [1560, 1730], 'blue1', 6);
  const door = Math.max(ss(seg(t, 39.4, 39.7)) * (1 - ss(seg(t, 40.2, 40.6))), ss(seg(t, 40.7, 41.0)) * (1 - ss(seg(t, 41.5, 42.0))));
  const second = { skin: 'blue2', x: WT + 92, y: WY, s: WS, f: -.8, sit: 1, ...idle(t, 3), smile: .7 };
  return { set: 'ex', look: 'night', cam: V([[38.9, [930, 1340, .95]], [42.2, [930, 1360, .93]], [42.6, [1080, 1420, 1.6]]])(t), chars: [a, b], inside: [...crowdSmall(t).slice(0, 2), inGuest(t), second], exDoor: door, wet: 1, cupsIn: 2 };
}

// —— 10: the full room ——
export const FULL = [['A', 0, 'blue1', 2], ['A', 1, 'blue2', 3], ['B', 0, 'blue3', 4], ['B', 1, 'blue1', 6], ['C', 0, 'blue2', 7], ['C', 1, 'blue3', 8], ['E', 0, 'blue1', 11], ['E', 1, 'blue3', 12], ['F', 0, 'blue2', 9], ['F', 1, 'blue1', 10]];
function crowd(t, laughAt = HIT.laugh) {
  return FULL.map(([id, i, sk, seed]) => { const p = seated(t, id, i, sk, seed, { smile: .5 + .45 * Math.max(0, Math.sin(t * .9 + seed)) });
    p.f += .25 * Math.sin(t * 1.3 + seed * 2); p.look = .2 * Math.sin(t * 2.1 + seed);
    if (id === 'B' && i === 1) { const u = seg(t, laughAt, laughAt + 1); if (u > 0 && u < 1) { p.bob = Math.abs(Math.sin(u * Math.PI * 4)) * .05 * (1 - u); p.smile = 1; } }
    return p; });
}
const ALLCUPS = ['A0', 'A1', 'B0', 'B1', 'C0', 'C1', 'F0', 'F1'];
function scene10(t) {
  const E = [1230, 1600], mid = [720, 1720];
  let ow;
  if (t < 44.6) ow = { ...walk(t, 42.6, 44.6, [1440, 1520], E), hold: 'tray2' };
  else if (t < 45.9) { const u = seg(t, 44.6, 45.8); ow = { x: E[0], y: E[1], s: sOf(E[1]), f: 0, ...idle(t, 1), armL: .55 + .3 * Math.sin(u * Math.PI), armR: .55 + .3 * Math.sin(u * Math.PI), hold: t < 45.0 ? 'tray2' : 'tray' }; }
  else if (t < 47.6) ow = { ...walk(t, 46.0, 47.6, E, mid), hold: 'tray' };
  else { const u = seg(t, 47.6, 50.85); ow = { x: mid[0], y: mid[1], s: sOf(mid[1]), f: Math.sin(u * Math.PI * 1.5) * .6, ...idle(t, 1), hold: 'tray' }; }
  ow = { skin: OW, smile: .9, ...ow }; if (!(t >= 44.6 && t < 45.9)) { ow.armL = -.55; ow.armR = -.55; }
  return { set: 'in', look: 'night', cam: V([[42.6, [760, 1290, .95]], [46, [745, 1310, 1.0]], [50.85, [725, 1380, 1.12]]])(t), chars: [ow, ...crowd(t)], cups: [...ALLCUPS, ...(t > 45 ? ['E0', 'E1'] : [])], plates: true, lamps: 1.15 };
}
// —— 11: trust ——
function scene11(t) {
  if (t < 54.6) {
    const ow = { skin: OW, x: 720, y: 1720, s: sOf(1720), ...idle(t, 1), hold: 'tray', armL: -.55, armR: -.55,
      f: .55 * Math.sin(seg(t, 51.2, 53.7) * Math.PI) - .55 * Math.sin(seg(t, 52.5, 53.9) * Math.PI), smile: lerp(.35, 1, ss(seg(t, 53.9, 54.5))), look: -.2 };
    ow.blink = t > 53.6 && t < 54.2 ? 1 : blinkAt(t, 1);
    return { set: 'in', look: 'night', cam: V([[50.85, [725, 1380, 1.12]], [52.5, [722, 1500, 1.6]], [54.6, [720, 1530, 1.85]]])(t), chars: [ow, ...crowd(t, 999)], cups: [...ALLCUPS, 'E0', 'E1'], plates: true, lamps: 1.15 };
  }
  const w = { ...walk(t, 54.9, 55.9, [1640, 1728], [1345, 1722], false), skin: 'blue3', ...idle(t, 13) };
  if (t >= 55.9) Object.assign(w, { f: lerp(-.9, -.6, ss(seg(t, 55.9, 56.2))), o: ss(seg(t, 56.1, 56.4)) * (1 - ss(seg(t, 56.8, 57.1))), smile: .6 * ss(seg(t, 56.9, 57.3)) });
  if (t >= 57.0) Object.assign(w, walk(t, 57.0, 58.05, [1345, 1722], [835, 1718], false), { smile: .6 });
  if (t >= 58.05) Object.assign(w, { x: 835, f: -.4, armL: .2 + 1.0 * ss(seg(t, 58.0, 58.3)), walk: 0 });
  const inside = [...crowdSmall(t), inGuest(t), { skin: 'blue2', x: WT + 92, y: WY, s: WS, f: -.8, sit: 1, ...idle(t, 3), smile: .7 }, inOwner(t, WT + 175)];
  return { set: 'ex', look: 'night', cam: V([[54.6, [960, 1400, .98]], [58.7, [950, 1370, .9]]])(t), chars: [w], inside, wet: 1, cupsIn: 2 };
}

export const SCENES = [[T.s1, scene1], [T.s2, scene2], [T.s3, scene3], [T.s4, scene4], [T.s5, scene5], [T.s6, scene6], [T.s7, scene7], [T.s8, scene8], [T.s9, scene9], [T.s10, scene10], [T.s11, scene11]];
export function sceneAt(t) { let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1][0]) i++; return SCENES[i][1](Math.min(t, DUR - 1e-3)); }
