// The film's timeline: eleven scenes cut to the Hungarian voiceover (measured from the pauses in refs/voiceover-hu.mp3).
// Each scene returns everything for its frame: camera, light state, who is where doing what, props and effects.
import { clamp, lerp, seg, ss, eio, monotone, track, hash } from '/core/lib.js';
import { walkPose } from './mascot.js';
import { TABLES } from './world.js';

export const DUR = 58.7;
export const T = { s1: 0, s2: 5.0, s3: 13.2, s4: 16.0, s5: 21.0, s6: 26.1, s7: 31.5, s8: 36.9, s9: 38.9, s10: 42.6, s11: 50.85 };
// moments the sound follows
export const HIT = {
  keyJingle: 3.4, lockClick: 4.9, wipe1: 5.4, wipe2: 6.3, wipe3: 8.0, chairUp: 9.95, chairDown: 10.45, doorCreak: 12.25,
  bell1: 22.75, guestSteps: 23.1, doorShut1: 25.4, chairPull: 28.7, sit: 29.9, cupClink: 31.2, sip: 33.4,
  ystop: 33.6, bell2: 37.5, bell3: 39.45, bell4: 40.75, trayDown: 45.0, laugh: 46.1, bell5: 58.05,
};
export const DISSOLVES = [{ at: T.s3, d: .5, blur: 0 }, { at: T.s10, d: .45, blur: 6 }];

const K = keys => monotone(keys), V = keys => track(keys);
const P0 = { vis: false };
const seat = (id, i) => TABLES.find(t => t.id === id).seats[i];
function blinkAt(t, seed) { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; }
function idle(t, seed, o = {}) { return { bob: Math.sin(t * 2.2 + seed) * .006, blink: blinkAt(t, seed), ...o }; }
// a walk between two points: position, facing, phase
function walk(t, t0, t1, A, B, stride = .34) {
  const u = seg(t, t0, t1), e = ss(u), x = lerp(A[0], B[0], e), z = lerp(A[1], B[1], e);
  const d = Math.hypot(B[0] - A[0], B[1] - A[1]), moving = t > t0 && t < t1;
  return { x, z, ry: Math.atan2(B[0] - A[0], B[1] - A[1]), moving, phi: e * d / stride * Math.PI, amt: moving ? Math.min(1, Math.sin(u * Math.PI) * 2.2) : 0 };
}
function walker(t, t0, t1, A, B, extra = {}) { const w = walk(t, t0, t1, A, B); return { x: w.x, z: w.z, ry: w.ry, ...(w.moving ? walkPose(w.phi, w.amt) : {}), ...extra }; }
const angTo = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);
const lerpAng = (a, b, u) => { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * u; };
function seated(t, id, i, seed, o = {}) { const [x, z, ry] = seat(id, i); return { x, z, ry, sit: 1, ...idle(t, seed), armL: [.55, .12], armR: [.55, .12], ...o }; }

// —— Scene 1: dawn, the owner at his door with the key ——
const s1cam = V([[0, [2.7, 3.3, 5.8]], [1.6, [2.3, 2.5, 5.1]], [3.2, [1.0, 1.1, 3.6]], [5.0, [.4, .62, 2.85]]]);
const s1tgt = V([[0, [-60, 6, 4.4]], [1.6, [-40, 4.5, 3.6]], [3.2, [-5, 1.5, 1.6]], [5.0, [-1.9, .84, 1.0]]]);
function scene1(t) {
  const step = ss(seg(t, 4.2, 5.0));
  const ow = { x: lerp(-1.95, -2.15, step), z: lerp(1.35, .85, step), ry: lerpAng(1.25, 3.0, ss(seg(t, 4.0, 4.7))), headYaw: .75 * (1 - ss(seg(t, 2.9, 3.4))) , ...idle(t, 1),
    ...(t > 4.2 && t < 5.0 ? walkPose(step * 3 * Math.PI, .5) : {}),
    headPitch: lerp(.38, -.32, ss(seg(t, 2.9, 3.5))) + .12 * Math.sin(seg(t, 3.9, 4.3) * Math.PI) * -1 + lerp(0, .3, ss(seg(t, 4.2, 4.7))),
    armL: [1.05, -.42], armR: [lerp(1.05, 1.45, ss(seg(t, 4.3, 4.9))), lerp(-.42, -.2, ss(seg(t, 4.3, 4.9)))],
    smile: .15 + .2 * ss(seg(t, 3.9, 4.4)), blink: t > 3.55 && t < 3.85 ? Math.sin(seg(t, 3.55, 3.85) * Math.PI) : blinkAt(t, 1),
    bob: Math.sin(seg(t, 1.4, 2.4) * Math.PI) * .02 };
  return { look: 'dawn', cam: { pos: s1cam(t), tgt: s1tgt(t), fov: lerp(54, 46, ss(seg(t, 1, 5))), focus: t < 2.5 ? 30 : lerp(30, 2.9, ss(seg(t, 2.5, 4))), aper: 9 },
    chars: { owner: ow }, props: { key: 'owner' }, tram: seg(t, 0, 5), birds: seg(t, .4, 4.4), mist: t, lanternOn: lerp(.45, 1, ss(seg(t, 3.4, 3.8))), interior: .08, chairsUp: true };
}

// —— Scene 2: morning prep: wipe, wipe again, a chair tucked in, the door opened ——
const s2cam = V([[5, [-.5, .95, -2.95]], [9.1, [-.6, .97, -2.9]], [10.4, [-.9, 1.0, -2.75]], [13.2, [-1.25, 1.02, -2.25]]]);
const s2tgt = V([[5, [-1.15, .66, -1.25]], [9.1, [-1.2, .66, -1.2]], [10.4, [-1.6, .72, -.9]], [13.2, [-2.3, .86, -.15]]]);
function scene2(t) {
  const A = [-1.15, -1.06], tb = [-1.15, -1.6], door = [-2.25, -.5];
  let ow = { ...idle(t, 1) };
  if (t < 9.1) {
    const wipeOn = (t < 7.1) || (t > 7.6), ph = (t < 7.1 ? (t - 5.2) / .95 : (t - 7.7) / 1.1) * Math.PI * 2;
    Object.assign(ow, { x: A[0], z: A[1], ry: Math.PI, lean: t > 7.1 && t < 7.6 ? .48 : .3,
      armL: wipeOn ? [1.2 + Math.sin(ph) * .16, -.1 + Math.cos(ph) * .22] : [1.05, -.15], armR: [.4, .12],
      headPitch: -.32 - (t > 7.1 && t < 7.6 ? .12 : 0), headYaw: wipeOn ? Math.cos(ph) * .1 : 0, smile: .3 });
  } else if (t < 9.9) {
    const u = seg(t, 9.1, 9.9);
    Object.assign(ow, { x: A[0] - .25 * ss(u), z: A[1], ry: lerpAng(Math.PI, Math.PI * 1.35, ss(u)), lean: .2 * Math.sin(u * Math.PI), armL: [.9 * Math.sin(u * Math.PI), .1], armR: [.9 * Math.sin(u * Math.PI), .1], smile: .3 });
  } else if (t < 12.2) Object.assign(ow, walker(t, 9.9, 12.2, [A[0] - .25, A[1]], door), { smile: .3 });
  else { const u = seg(t, 12.2, 12.9); Object.assign(ow, { x: door[0] + .02, z: door[1], ry: lerpAng(angTo([A[0] - .25, A[1]], door), .5, ss(u)), armR: [lerp(.2, .95, Math.sin(seg(t, 12.2, 12.8) * Math.PI)), .2], smile: lerp(.3, .8, ss(seg(t, 12.6, 13.1))), headPitch: .1 }); }
  const tuck = ss(seg(t, 9.3, 9.8)) * .16;
  return { look: 'morning', cam: { pos: s2cam(t), tgt: s2tgt(t), fov: 46, focus: Math.hypot(...s2cam(t).map((v, i) => v - [ow.x, .8, ow.z][i])), aper: 10 },
    chars: { owner: ow }, props: { cloth: t < 9.05 ? 'owner' : 'tableB' }, chairTuck: tuck, door: ss(seg(t, 12.25, 13.0)) * 1.05, interior: lerp(.4, 1, ss(seg(t, 5, 9))), chairsUp: true };
}

// —— Scene 3: day one, the empty room ——
const s3cam = V([[13.2, [2.8, 1.95, -4.6]], [16, [2.62, 1.88, -4.35]]]);
function scene3(t) {
  const me = [.3, -2.0], door = [-2.3, 0];
  const ow = { x: me[0], z: me[1], ry: angTo(me, door) + .15 * Math.sin(seg(t, 13.6, 14.6) * Math.PI), ...idle(t, 1), armL: [.55, -.32], armR: [.55, -.32],
    headYaw: .25 * Math.sin(seg(t, 13.8, 14.8) * Math.PI), squash: .05 * Math.sin(seg(t, 15.0, 15.9) * Math.PI), headPitch: -.12 * ss(seg(t, 15.1, 15.7)), sad: .35 * ss(seg(t, 15, 15.8)) };
  const p1 = walker(t, 13.2, 16, [-4.4, 1.35], [-.4, 1.35], { ...idle(t, 4) }), p2 = walker(t, 13.2, 16, [1.4, 1.75], [5.2, 1.75], { ...idle(t, 6) });
  return { look: 'dusk', cam: { pos: s3cam(t), tgt: [-.9, .55, -.75], fov: 60, focus: 4.2, aper: 7 }, chars: { owner: ow, g2: p1, y2: p2 }, interior: 1 };
}

// —— Scene 4: day two, rain, doubt ——
const s4cam = V([[16, [-.32, .84, -.32]], [21, [.08, .9, -.52]]]);
function scene4(t) {
  const [sx, sz] = seat('A', 1);
  const look = ss(seg(t, 17.9, 18.7)) - ss(seg(t, 19.0, 19.6)), shake = t > 19.6 && t < 20.3 ? Math.sin(seg(t, 19.6, 20.3) * Math.PI * 2) * .18 : 0;
  const ow = { x: sx, z: sz, ry: -Math.PI / 2, sit: 1, ...idle(t, 1), lean: .22 - .1 * look,
    armL: [lerp(2.05, 1.2, look), lerp(-.45, -.2, look)], armR: [.7, .1], headRoll: lerp(.22, 0, look), headPitch: lerp(-.28, .08, look) - .06 * ss(seg(t, 20.2, 20.9)),
    headYaw: .45 * look + shake, sad: 1, squash: .07 * Math.sin(seg(t, 20.2, 21) * Math.PI),
    blink: t > 16.8 && t < 17.4 ? Math.sin(seg(t, 16.8, 17.4) * Math.PI) : blinkAt(t, 1) };
  const c = s4cam(t), head = [sx, .98, sz];
  return { look: 'night', rain: 1, drops: 1, cam: { pos: c, tgt: [sx, .9, sz], fov: 40, focus: Math.hypot(c[0] - head[0], c[1] - head[1], c[2] - head[2]), aper: 13 },
    chars: { owner: ow }, props: { cloth: 'table' }, interior: .82, candleLow: 1, wet: 1 };
}

// —— Scene 5: the door opens ——
function scene5(t) {
  const [sx, sz] = seat('A', 1), turn = ss(seg(t, 22.65, 23.0));
  const ow = { x: sx, z: sz, ry: -Math.PI / 2, sit: 1, ...idle(t, 1), lean: lerp(.18, 0, turn), armL: [lerp(1.6, .6, turn), -.25], armR: [.6, .1],
    headYaw: lerp(0, .35, turn), headPitch: lerp(-.2, .05, turn), sad: 1 - turn, o: turn * (1 - ss(seg(t, 24.5, 25.5))) * .9, smile: .25 * ss(seg(t, 25.0, 26)) };
  const g = walker(t, 23.0, 24.3, [-2.3, 1.0], [-1.95, -.7], { ...idle(t, 2) });
  if (t >= 24.3) { const ph = seg(t, 24.4, 25.4); g.headYaw = Math.sin(ph * Math.PI * 2) * .5; g.ry = lerpAng(g.ry, angTo([-1.95, -.7], [sx, sz]), ss(seg(t, 25.3, 25.8))); }
  g.vis = t > 22.55; g.o = .35 * ss(seg(t, 24.3, 24.8));
  const door = ss(seg(t, 22.55, 23.2)) * 1.15 * (1 - ss(seg(t, 24.4, 25.6)));
  const focus = lerp(.6, 4.0, ss(seg(t, 22.7, 23.3)));
  return { look: 'night', rain: 1, drops: .7, cam: { pos: V([[21, [-.25, 1.0, -2.1]], [26.1, [-.45, 1.0, -1.9]]])(t), tgt: [-2.2, .8, -.2], fov: 42, focus: 2.6, aper: 8 },
    chars: { guest: g }, door, bellAt: HIT.bell1, interior: .95, wet: 1 };
}

// —— Scene 6: welcomed like a hundred guests ——
const s6cam = V([[26.1, [-2.15, 1.02, -2.75]], [28.5, [-1.95, 1.04, -2.85]], [29.6, [-.8, 1.06, -3.3]], [31.5, [.05, 1.08, -3.55]]]);
const s6tgt = V([[26.1, [-.7, .68, -.95]], [28.5, [-1.1, .66, -.95]], [29.6, [.45, .64, -1.2]], [31.5, [.65, .66, -1.15]]]);
function scene6(t) {
  const [ox, oz] = seat('A', 1), [sx, sz] = seat('A', 1), gStart = [-1.5, -.78], meet = [-.75, -1.2], host = [.0, -1.32], via = [.62, -1.5];
  let ow = { ...idle(t, 1) };
  if (t < 26.6) { const u = seg(t, 26.1, 26.55); Object.assign(ow, { x: ox, z: oz, ry: -Math.PI / 2, sit: 1 - ss(u), bob: Math.sin(u * Math.PI) * .07, o: 1 - ss(seg(t, 26.2, 26.5)), smile: ss(seg(t, 26.25, 26.55)), headYaw: .3 }); }
  else if (t < 27.5) Object.assign(ow, walker(t, 26.6, 27.5, [ox - .05, oz - .5], meet), { smile: 1 });
  else if (t < 28.5) { const u = seg(t, 27.5, 28.4), open = Math.sin(Math.min(1, u * 1.4) * Math.PI / 2) * (1 - ss(seg(t, 28.2, 28.5)) * .6);
    Object.assign(ow, { x: meet[0], z: meet[1], ry: angTo(meet, gStart), smile: 1, armL: [.55 * open, .15 + 1.15 * open], armR: [.55 * open, .15 + 1.15 * open], bob: Math.abs(Math.sin(u * Math.PI * 2)) * .03, headPitch: .1 }); }
  else if (t < 29.5) { Object.assign(ow, walker(t, 28.5, 29.1, meet, host), { smile: 1 }); if (t > 29.1) { ow.ry = angTo(host, [sx, sz]); ow.armR = [1.0, -.1]; ow.armL = [.5, .5]; ow.lean = .15; } }
  else if (t < 30.4) Object.assign(ow, { x: host[0], z: host[1], ry: angTo(host, [sx, sz]), ...idle(t, 1), smile: 1, armL: [.9, .6], armR: [.4, .1] });
  else { const u = seg(t, 30.6, 31.4); Object.assign(ow, { x: host[0], z: host[1], ry: angTo(host, [sx, sz]), smile: 1, armL: [.75, -.55], armR: [.75, -.55], lean: .2 * Math.sin(u * Math.PI), headPitch: -.12 * Math.sin(u * Math.PI) }); }
  let g;
  if (t < 29.2) g = { x: gStart[0], z: gStart[1], ry: angTo(gStart, meet), ...idle(t, 2), o: .4 * (1 - ss(seg(t, 27.0, 27.8))), smile: .6 * ss(seg(t, 27.6, 28.3)) };
  else if (t < 29.75) g = walker(t, 29.2, 29.75, gStart, via, { smile: .6 });
  else if (t < 30.15) g = walker(t, 29.75, 30.15, via, [sx + .02, sz - .05], { smile: .6 });
  else { const u = ss(seg(t, 30.15, 30.55)); g = { x: sx, z: sz, ry: lerpAng(angTo(via, [sx, sz]), -Math.PI / 2, u), sit: u, ...idle(t, 2), smile: .6, armL: [.55, .12], armR: [.55, .12] }; }
  const pull = Math.sin(seg(t, 28.9, 30.1) * Math.PI) * .22;
  return { look: 'night', rain: 1, drops: .7, cam: { pos: s6cam(t), tgt: s6tgt(t), fov: 52, focus: 2.3, aper: 8 }, chars: { owner: ow, guest: g }, chairPull: pull, interior: lerp(.95, 1.1, ss(seg(t, 26.3, 28))), wet: 1 };
}

// —— Scene 7: someone stops at the window ——
const s7cam = V([[31.5, [-3.6, .78, 3.7]], [33.6, [-.7, .85, 3.5]], [35, [.35, 1.05, 3.2]], [36.9, [.9, 1.15, 2.85]]]);
const s7tgt = V([[31.5, [-3.0, .62, 1.2]], [33.6, [.15, .72, 1.05]], [35, [.35, .74, -.2]], [36.9, [.42, .74, -.9]]]);
function guestInside(t, sip = []) {
  const g = seated(t, 'A', 1, 2, { smile: .55 });
  for (const [a, b] of sip) { const u = Math.sin(seg(t, a, b) * Math.PI); if (u > 0) { g.armR = [lerp(.55, 1.55, u), lerp(.12, -.35, u)]; g.headPitch = .12 * u; g.cupUp = u; } }
  return g;
}
function scene7(t) {
  const y = walker(t, 31.5, 33.6, [-4.3, 1.28], [.38, 1.18], { ...idle(t, 3) });
  if (t >= 33.6) {
    const wob = Math.sin(seg(t, 33.6, 34.0) * Math.PI * 2) * .06 * (1 - seg(t, 33.6, 34.0));
    y.ry = lerpAng(Math.PI / 2, Math.PI, ss(seg(t, 33.8, 34.4))); y.tilt = wob; y.headYaw = .45 * (1 - ss(seg(t, 33.8, 34.4)));
    y.o = ss(seg(t, 34.3, 34.6)) * (1 - ss(seg(t, 35.8, 36.4))) * .9; y.smile = .5 * ss(seg(t, 35.9, 36.6)); y.lean = .14 * ss(seg(t, 34.8, 35.8));
  } else y.headYaw = -.4 * ss(seg(t, 32.6, 33.4));
  const ow = { x: .62, z: -1.58, ry: angTo([.62, -1.58], seat('A', 1)), ...idle(t, 1), smile: 1, armL: [.25 + .35 * Math.max(0, Math.sin(t * 3.1)), .2], armR: [.2, .12], headYaw: .1 * Math.sin(t * 1.7) };
  const c = s7cam(t);
  return { look: 'night', wet: 1, drops: .35, cam: { pos: c, tgt: s7tgt(t), fov: t < 33.6 ? 42 : lerp(42, 38, ss(seg(t, 33.6, 36.9))), focus: t < 34.5 ? Math.hypot(c[0] - y.x, c[2] - y.z) : lerp(1.9, 3.6, ss(seg(t, 34.5, 35.6))), aper: 11 },
    chars: { owner: ow, guest: guestInside(t, [[32.9, 34.3]]), y1: y }, cups: { A1: true }, interior: 1.1 };
}

// —— Scene 8: he enters too ——
function scene8(t) {
  const y = t < 37.45 ? walker(t, 36.9, 37.45, [-1.25, 1.05], [-2.25, .6], { ...idle(t, 3) }) : walker(t, 37.6, 38.9, [-2.25, .6], [-2.3, -.45], { ...idle(t, 3) });
  if (t >= 37.45 && t < 37.6) { y.x = -2.25; y.z = .6; y.ry = Math.PI; }
  y.armR = t > 37.3 && t < 37.9 ? [1.2, -.15] : y.armR; y.smile = .35;
  const c = V([[36.9, [-1.0, .85, 2.35]], [38.9, [-1.65, .92, 1.6]]])(t);
  return { look: 'night', wet: 1, cam: { pos: c, tgt: [-2.3, .9, 0], fov: 42, focus: Math.hypot(c[0] - y.x, c[2] - y.z), aper: 9 },
    chars: { y1: y, guest: guestInside(t), owner: { x: .62, z: -1.58, ry: -2.4, ...idle(t, 1), smile: 1 } }, door: ss(seg(t, 37.42, 37.8)) * 1.0 * (1 - ss(seg(t, 38.4, 38.9)) * .4), interior: 1.1, cups: { A1: true } };
}

// —— Scene 9: then another, and another ——
const s9cam = V([[38.9, [.25, 2.35, 9.1]], [42.25, [.2, 2.95, 8.45]], [42.6, [.35, 1.6, 3.2]]]);
const s9tgt = V([[38.9, [-.55, 1.45, 0]], [42.25, [-.6, 1.5, 0]], [42.6, [.5, 1.05, -.5]]]);
function scene9(t) {
  const g2 = t < 39.45 ? walker(t, 38.9, 39.45, [-3.05, .95], [-2.3, .55], { ...idle(t, 4), smile: .4 }) : walker(t, 39.5, 40.3, [-2.3, .55], [-2.3, -.6], { ...idle(t, 4), smile: .4 });
  g2.vis = t < 40.3;
  const y2 = t < 40.7 ? walker(t, 38.9, 40.7, [-.15, 1.25], [-2.2, .6], { ...idle(t, 6), smile: .5 }) : walker(t, 40.75, 41.5, [-2.2, .6], [-2.3, -.6], { ...idle(t, 6), smile: .5 });
  y2.vis = t < 41.5;
  const ow = walker(t, 39.2, 40.6, [.62, -1.58], [-1.6, -.9], { ...idle(t, 1), smile: 1 });
  if (t > 40.6) { ow.ry = angTo([-1.6, -.9], [-2.3, -.3]); ow.armL = [.6, 1.0]; ow.armR = [.6, 1.0]; }
  const door = Math.max(ss(seg(t, 39.4, 39.7)) * (1 - ss(seg(t, 40.2, 40.6))), ss(seg(t, 40.7, 41.0)) * (1 - ss(seg(t, 41.5, 42.0)))) * .95;
  return { look: 'night', wet: 1, cam: { pos: s9cam(t), tgt: s9tgt(t), fov: 54, focus: 8.5, aper: 4 },
    chars: { owner: ow, guest: guestInside(t), y1: seated(t, 'A', 0, 3, { smile: .7 }), g2, y2 }, door, interior: 1.15, cups: { A0: true, A1: true } };
}

// —— Scene 10: the full room ——
const s10cam = V([[42.6, [2.95, 2.42, -4.7]], [46, [2.7, 2.3, -4.5]], [50.85, [2.05, 1.95, -4.2]]]);
const s10tgt = V([[42.6, [-.7, .5, -1.1]], [46, [-.3, .55, -1.5]], [50.85, [.45, .7, -2.0]]]);
export const FULL = [['guest', 'A', 1, 2], ['y1', 'A', 0, 3], ['g2', 'B', 0, 4], ['y2', 'B', 1, 6], ['w2', 'C', 0, 7], ['g3', 'C', 1, 8], ['y3', 'D', 0, 9], ['w3', 'D', 1, 10], ['g4', 'E', 0, 11], ['y4', 'E', 1, 12]];
function crowd(t, laughAt = HIT.laugh) {
  const out = {};
  for (const [name, id, i, seed] of FULL) {
    const p = seated(t, id, i, seed, { smile: .45 + .4 * Math.max(0, Math.sin(t * .9 + seed)), headYaw: .28 * Math.sin(t * 1.3 + seed * 2), headPitch: .05 * Math.sin(t * 2.1 + seed) });
    if (name === 'y2') { const u = seg(t, laughAt, laughAt + 1); if (u > 0 && u < 1) { p.bob = Math.abs(Math.sin(u * Math.PI * 4)) * .04 * (1 - u); p.smile = 1; p.headPitch = .15; } }
    out[name] = p;
  }
  return out;
}
function scene10(t) {
  const E = [.45, -2.42], mid = [.6, -1.85];
  let ow;
  if (t < 44.6) ow = walker(t, 42.6, 44.6, [1.25, -4.0], E, { smile: 1 });
  else if (t < 45.9) { const u = seg(t, 44.6, 45.8); ow = { x: E[0], z: E[1], ry: Math.PI, ...idle(t, 1), smile: 1, lean: .3 * Math.sin(u * Math.PI), armL: [lerp(1.1, 1.35, Math.sin(u * Math.PI)), -.4], armR: [lerp(1.1, 1.35, Math.sin(u * Math.PI)), -.4] }; }
  else if (t < 47.6) ow = walker(t, 46.0, 47.6, E, mid, { smile: .9 });
  else { const u = seg(t, 47.6, 50.85); ow = { x: mid[0], z: mid[1], ry: lerpAng(angTo(E, mid), 0, ss(seg(t, 47.6, 48.2))), ...idle(t, 1), headYaw: Math.sin(u * Math.PI * 1.5) * .45, smile: .55 }; }
  if (!(t >= 44.6 && t < 45.9)) { ow.armL = [1.1, -.42]; ow.armR = [1.1, -.42]; }
  const tray = t < 45.0 ? 2 : 0;
  const c = s10cam(t);
  return { look: 'night', wet: 1, cam: { pos: c, tgt: s10tgt(t), fov: 58, focus: Math.hypot(c[0] - ow.x, c[2] - ow.z), aper: 6 },
    chars: { owner: ow, ...crowd(t) }, props: { tray: 'owner', trayCups: tray }, cups: { A0: true, A1: true, B0: true, B1: true, C0: true, C1: true, D0: true, D1: true, E0: t > 45.0, E1: t > 45.0 }, plates: true, interior: 1.15 };
}

// —— Scene 11: trust — close-up, then out through the window to the street ——
const s11cam = V([[50.85, [.6, 1.0, -.74]], [53.3, [.6, 1.01, -.7]], [54.4, [.6, 1.2, -.55]], [55.2, [.6, 1.34, .05]], [56.3, [.55, 1.62, 2.3]], [57.6, [.3, 2.0, 6.0]], [58.7, [.2, 2.15, 7.3]]]);
const s11tgt = V([[50.85, [.6, .84, -1.85]], [53.3, [.6, .84, -1.85]], [55.2, [.6, .9, -1.8]], [57.6, [-.4, 1.4, -.4]], [58.7, [-.5, 1.5, -.2]]]);
function scene11(t) {
  const ow = { x: .6, z: -1.85, ry: 0, ...idle(t, 1), armL: [1.1, -.42], armR: [1.1, -.42],
    headYaw: .5 * Math.sin(seg(t, 51.2, 53.7) * Math.PI) - .45 * Math.sin(seg(t, 52.5, 53.9) * Math.PI) * .9,
    smile: lerp(.25, .8, ss(seg(t, 54.0, 55.6))), blink: t > 54.0 && t < 54.7 ? Math.sin(seg(t, 54.0, 54.7) * Math.PI) * 1 : blinkAt(t, 1), headPitch: .06 * ss(seg(t, 53.9, 54.5)) };
  if (t > 54.0 && t < 54.7) ow.blink = 1;
  const w = t < 56.2 ? walker(t, 54.6, 56.2, [3.6, 1.3], [.95, 1.12], { ...idle(t, 13) }) : { x: .95, z: 1.12, ry: Math.PI, ...idle(t, 13), o: .8 * ss(seg(t, 56.2, 56.5)) * (1 - ss(seg(t, 57.0, 57.3))), smile: .6 * ss(seg(t, 57.1, 57.5)) };
  if (t > 57.2) Object.assign(w, walker(t, 57.25, 58.6, [.95, 1.12], [-1.55, .78], { smile: .6 }));
  w.vis = t > 54.6;
  const c = s11cam(t), outside = c[2] > 0;
  return { look: 'night', wet: 1, cam: { pos: c, tgt: s11tgt(t), fov: lerp(46, 52, ss(seg(t, 53.3, 57.6))), focus: Math.max(.6, Math.hypot(c[0] - ow.x, c[1] - .85, c[2] - ow.z)), aper: lerp(15, 5, ss(seg(t, 53.3, 57))) },
    chars: { owner: ow, ...crowd(t, 999), w4: w }, props: { tray: 'owner', trayCups: 0 }, cups: { A0: true, A1: true, B0: true, B1: true, C0: true, C1: true, D0: true, D1: true, E0: true, E1: true }, plates: true, interior: 1.15, outside };
}

export const SCENES = [
  [T.s1, scene1], [T.s2, scene2], [T.s3, scene3], [T.s4, scene4], [T.s5, scene5], [T.s6, scene6],
  [T.s7, scene7], [T.s8, scene8], [T.s9, scene9], [T.s10, scene10], [T.s11, scene11],
];
export function sceneAt(t) { let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1][0]) i++; return { i, S: SCENES[i][1](Math.min(t, DUR - 1e-3)) }; }
