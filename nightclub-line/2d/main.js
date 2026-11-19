// The nightclub film in 2.5D (user 2026-11-18: "between 2D and 3D", "exactly like the example", "a more blue world, mascots visible").
// Each shot: a soft 3D plate rendered from that shot's camera (../3d/plate.py, cameras copied from the reference) and our 2D mascots
// standing in it at the 3D film's positions (projected through the saved camera). ?lang=fa shows Persian captions (for checking).
import { toon } from './toon.js';
import { WORDS } from './captions.js';
const W = innerWidth, H = innerHeight, K = W / 1080;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, u) => a + (b - a) * u;
const T = i => WORDS[i][1], END = 66.3, LANG = new URLSearchParams(location.search).get('lang') || 'hu';
const R = d => d * Math.PI / 180, sin = Math.sin, abs = Math.abs;
const talk = (t, a, b, closed = 'smile') => (a <= t && t <= b) ? ((t * 7.5) % 1 < .55 ? 'open' : closed) : closed;

// —— the cast (as in the 3D film) ——
const OWN = { skin: 'owner', hair: { type: 'bowl', col: '#4a2a1c' }, tache: true, bow: '#d8333a', bowDots: true, buttons: true };
const DOOR = { skin: 'blue1', wear: '#1c2560', jacket: true, hat: { type: 'cap', col: '#1c2560' }, tie: '#0e0e1a', bulk: 1.45, eyes: 'lids', mouth: 'flat' };
const STR = [
  { skin: 'blue2', wear: '#e0b030', hat: { type: 'beanie', col: '#c23b3b', col2: '#f4f1e6' }, freckles: true, mouth: 'smile' },
  { skin: 'blue3', wear: '#8a5a3a', hat: { type: 'fedora', col: '#5a3a2a' }, tie: '#c23b3b', beard: true, eyes: 'lids', brows: 'angry', mouth: 'smirk' },
  { skin: 'blue1', wear: '#6a4aa8', pat: 'check', pat2: '#e8e0f0', glasses: '#e8577a', brows: 'worried', mouth: 'frown' },
  { skin: 'blue2', wear: '#2a9a7a', hat: { type: 'beret', col: '#d23a6a' }, blush: true, eyes: 'happy', mouth: 'smile' },
  { skin: 'blue3', wear: '#d0702e', hair: { type: 'pony', col: '#6e4630' }, mouth: 'flat' },
  { skin: 'blue1', wear: '#c23b3b', pat: 'stripe', pat2: '#f4f1e6', hat: { type: 'beanie', col: '#2ED3C6', col2: '#f4f1e6' }, brows: 'raised', mouth: 'smile' },
  { skin: 'blue2', wear: '#e8e0f0', scarf: '#f2c14e', eyes: 'lids', mouth: 'flat' },
  { skin: 'blue3', wear: '#e8705a', hair: { type: 'bob', col: '#4a2c1e' }, eyes: 'wide', mouth: 'o' }];
const LITE = ['#e0b030', '#8a5a3a', '#6a4aa8', '#2a9a7a', '#d0702e', '#c23b3b', '#9ad0c2', '#e8705a', '#b06ad0', '#f4f1e6', '#5fb89a', '#ff6fa8'];
const SH = [1.55, 1.63, 1.71];
function str(i, lite) {
  if (!lite) return { H: SH[(i * 7) % 3], ...STR[i % 8] };
  const p = { H: 1.5 + .06 * ((i * 7) % 3), skin: ['blue1', 'blue2', 'blue3'][i % 3], wear: LITE[i % 12], eyes: ['dot', 'dot', 'happy', 'lids'][i % 4], mouth: ['smile', 'flat', 'smile', 'smirk'][i % 4] };
  if (i % 3 === 0) p.hat = { type: 'beanie', col: LITE[(i + 5) % 12] }; else if (i % 5 === 1) p.hair = { type: 'bob', col: ['#4a2c1e', '#c23b3b', '#e0b030'][i % 3] }; else if (i % 7 === 2) p.hat = { type: 'fedora', col: '#3a2418' };
  return p;
}
const MAN = { H: 1.68, skin: 'blue2', wear: '#4a3a8a', bow: '#f2c14e', tie: null };
const LADY = { H: 1.58, skin: 'blue1', wear: '#2a9a7a', hair: { type: 'bob', col: '#c23b3b' }, pearls: true, blush: true };
const HATMAN = { H: 1.7, skin: 'blue3', wear: '#7a5a3a', hat: { type: 'fedora', col: '#3a2418' }, tie: '#c23b3b', eyes: 'lids', brows: 'flat', mouth: 'flat' };
const face = r => -sin(r);   // a 3D turn (radians about Z) as the 2D facing

// —— shots ——
const SHOTS = [];
// o: { push (zoom gained over the shot), pan: [x0, x1] in plate pixels (wide plates), panY, cast(t, put), over(c, t, P) }
const shot = (name, t0, o = {}) => SHOTS.push({ name, t0, ...o });

shot('opened', 0, { push: .06, cast(t, put) {
  const laughing = t >= T(3) - .1, k = sin(t * (laughing ? 16 : 5)), rub = sin(t * (laughing ? 12 : 6));
  put([0, -1.5, .08], 1.7, { ...OWN, eyes: laughing ? 'happy' : 'dot', mouth: laughing ? 'laugh' : 'smile', sq: laughing ? .03 + .025 * k : .01 * k, tilt: .04 * sin(t * 4), handL: [-.05 + .02 * rub, -.32], handR: [.05 + .02 * rub, -.31] });
}, zoomAt: [T(3), .18] });
shot('pays', T(4) - .05, { push: .08, cast(t, put) {
  const g = ss(seg(t, T(5), T(6) + .3));
  put([5.4, -1.2, .08], 1.7, { ...OWN, f: .35, eyes: 'dot', brows: 'raised', mouth: 'smile', cash: 'R', handR: [lerp(.2, .3, g), lerp(-.32, -.45, g)], handL: [-.18, -.3] });
  put([6.5, -1.1, .05], 1.55, { ...str(0), f: -.35, mouth: g > .7 ? 'grin' : 'smile', handL: [lerp(-.2, -.3, g), lerp(-.3, -.42, g)] });
} });
shot('line', T(8) - .05, { push: .05, cast(t, put) {
  for (let i = 0; i < 16; i++) put([2.0 + i * .85, -.6, .05], i > 5 ? str(i, true).H : SH[(i * 7) % 3], { ...str(i, i > 5), f: -.5 + .25 * sin(t * .8 + i), tilt: .06 * sin(t * .8 + i) });
} });
shot('notin', T(11) - .05, { push: .06, cast(t, put) { put([-1.7, -1.0, .08], 1.95, { ...DOOR, f: -.1, folded: true, tilt: .05 * sin(t * 4), brows: 'flat', mouth: 'frown' }); } });
shot('opening', T(15) - .05, { panY: [.78, .22], cast(t, put) {
  put([-1.75, -1.05, .08], 1.95, { ...DOOR, folded: true });
  put([.3, -1.6, .08], 1.7, { ...OWN, mouth: 'grin', eyes: 'happy', handR: [.3, -.48 - .05 * sin(t * 5)] });
  for (let i = 0; i < 8; i++) put([2.0 + i * .85, -.6, .05], str(i, true).H, { ...str(i, true), f: -.4 });
} });
shot('band', T(20) - .05, { push: .08, cast(t, put) {
  const hit = abs(sin(t * 10));
  put([-1.1, 13.0, 1.0], 1.5, { skin: 'blue2', wear: '#ffffff', bow: '#d23a3a', tache: true, eyes: 'happy', mouth: 'o', f: .3, tilt: .1 * sin(t * 4), handL: [.18, -.55], handR: [.1, -.56], id: 'trumpet' });
  put([0, 13.6, 1.0], 1.5, { skin: 'blue3', wear: '#7a5cff', hat: { type: 'beanie', col: '#f2c14e' }, eyes: 'lids', mouth: 'grin', handL: [-.25, -.42 - .06 * hit], handR: [.25, -.42 - .06 * (1 - hit)], bob: .01 * hit, id: 'drums' });
  put([1.1, 13.0, 1.0], 1.5, { skin: 'blue1', wear: '#f2c14e', hat: { type: 'fedora', col: '#151018' }, eyes: 'happy', mouth: 'smile', f: -.3, tilt: .1 * sin(t * 6), handL: [-.2, -.5], handR: [.05, -.35 - .04 * sin(t * 14)], id: 'guitar' });
} });
shot('bar', T(22) - .05, { push: .05, cast(t, put, X) {
  put([-10.9, 4.0, .55], 1.6, { clip: X([-9.4, 4.0, 1.26])[1], skin: 'blue3', wear: '#f4f1e6', bow: '#151018', tache: true, glasses: '#f2c14e', mouth: 'flat', handL: [-.1, -.55], handR: [.05 * sin(t * 9), -.56], id: 'glass' });
} });
shot('seats', T(24) - .05, { push: .12 });
shot('empty', T(29) - .05, { push: .1 });
shot('spent', T(34) - .05, { push: .06, cast(t, put) {
  const sh = t > T(36);
  put([0, -1.0, .02], 1.7, { ...OWN, mouth: sh ? 'teeth' : 'frown', eyes: sh ? 'wide' : 'dot', brows: 'worried', handL: [-.12, sh ? -.62 : -.35], handR: [.12, sh ? -.62 : -.35], tilt: sh ? .04 * sin(t * 20) : 0 });
} });
shot('backdoor', T(40) - .05, { push: .08, cast(t, put) {
  const u = seg(t, T(40) + .1, T(44)), mv = u > 0 && u < 1;
  put([lerp(-12, -11.2, u), lerp(-.3, -1.8, u), .08], 1.7, { ...OWN, f: .45, eyes: 'lids', mouth: 'smirk', walk: mv ? 1 : 0, phi: t * 9 });
} });
shot('returns', T(45) - .05, { pan: [1, 0], cast(t, put) {
  const u = seg(t, T(45), T(50)), mv = u > 0 && u < 1;
  put([lerp(13, 8.5, u), -2.0, .08], 1.7, { ...OWN, f: -1, eyes: 'happy', mouth: 'grin', walk: mv ? 1 : 0, phi: t * 9 });
  for (let i = 0; i < 10; i++) put([lerp(14.2, 9.7, u) + i * .9, -2.0, .05], str(i, i > 4).H || SH[(i * 7) % 3], { ...str(i, i > 4), f: -1, walk: mv ? 1 : 0, phi: t * 9 + i });
} });
shot('rope', T(50) - .05, { push: .07, cast(t, put) {
  const g = ss(seg(t, T(51), T(53)));
  put([2.4, -1.9, .08], 1.7, { ...OWN, f: -.3, mouth: 'smile', handR: [lerp(.2, -.05, g), lerp(-.3, -.58, g)] });
  put([3.3, -.6, .05], 1.63, { ...str(1) });
} });
shot('lineup', T(54) - .05, { pan: [0, 1], cast(t, put) {
  const u = seg(t, T(54), T(60)), mv = u > 0 && u < 1;
  put([lerp(2.0, 7.0, u), -1.8, .08], 1.7, { ...OWN, f: 1, brows: 'raised', mouth: 'smile', walk: mv ? 1 : 0, phi: t * 9 });
  for (let i = 0; i < 14; i++) put([2.0 + i * .85, -.6, .05], str(i, i > 5).H, { ...str(i, i > 5), f: -.2, tilt: .06 * sin(t + i) });
} });
shot('donttalk', T(60) - .05, { push: .06, cast(t, put) {
  for (let i = 0; i < 5; i++) put([2.0 + i * .85, -.6, .05], str(i, true).H, { ...str(i, true) });
  put([3.0, -1.4, .08], 1.7, { ...OWN, brows: 'angry', mouth: talk(t, T(60), T(63) - .1, 'flat'), handR: [.2, -.72 - .03 * sin(t * 8)], tilt: .05 * sin(t * 5) });
} });
shot('wait', T(63) - .05, { pan: [0, 1], cast(t, put) {
  const hh = [{ handL: [-.05, -.45], handR: [.12, -.42] }, {}, { handR: [.08, -.56] }, {}, { handL: [-.25, -.3] }, {}];
  for (let i = 0; i < 6; i++) put([2.0 + i * .85, -.6, .05], SH[(i * 7) % 3], { ...str(i), ...hh[i], f: .4 * sin(t * .9 + i * 2), tilt: .08 * sin(t * 1.3 + i), mouth: i === 3 ? 'o' : str(i).mouth });
} });
shot('turns', T(68) - .05, { push: .06, cast(t, put) {
  const u = ss(seg(t, T(69), T(71)));
  put([-1.75, -1.05, .08], 1.95, { ...DOOR, f: .25, folded: true });
  put([-.4, -1.5, .08], 1.7, { ...OWN, f: lerp(0, -.8, u), eyes: 'dot', mouth: 'smirk' });
} });
shot('sendaway', T(72) - .05, { push: .05, cast(t, put) {
  put([-.4, -1.5, .08], 1.7, { ...OWN, f: -.55, eyes: 'lids', brows: 'angry', mouth: talk(t, T(72), T(77) + .2, 'smirk'), handL: [-.38, -.5 - .03 * sin(t * 6)] });
} });
shot('window', T(78) - .05, { push: .1, cast(t, put) {
  const u = ss(seg(t, T(78), T(80) + .3));
  put([.66, -.85, .08], 1.95, { ...DOOR, back: true, lean: -.1 * u, handL: [-.2, -.78], handR: [.2, -.78] });
} });
shot('emptyroom', T(83) - .05, { push: .08 });
shot('300', T(86) - .05, { push: .05, cast(t, put) {
  put([-1.7, -1.0, .08], 1.95, { ...DOOR, eyes: 'wide', brows: 'raised', mouth: talk(t, T(86), T(88) + .3, 'teeth') === 'open' ? 'open' : 'teeth', handL: [-.32, -.55], handR: [.32, -.55], tilt: .03 * sin(t * 12) });
} });
shot('whyno', T(89) - .05, { push: .05, cast(t, put) {
  put([-1.75, -1.05, .08], 1.95, { ...DOOR, f: .25, eyes: 'dot', brows: 'worried', mouth: talk(t, T(89), T(91) + .3, 'frown'), handL: [-.4, -.4], handR: [.4, -.4], tilt: .1 });
  put([-.4, -1.5, .08], 1.7, { ...OWN, f: -.7, eyes: 'lids', mouth: 'smirk', tilt: -.08 });
} });
shot('couple', T(92) - .05, { pan: [1, 0], cast(t, put) {
  const u = seg(t, T(92), T(98) - .2), mv = u > 0 && u < 1;
  put([lerp(7.0, 2.4, u), -2.3, .08], 1.68, { ...MAN, f: -1, mouth: 'smile', walk: mv ? 1 : 0, phi: t * 8 });
  put([lerp(7.8, 3.2, u), -2.3, .08], 1.58, { ...LADY, f: -1, mouth: 'smile', walk: mv ? 1 : 0, phi: t * 8 + 1 });
} });
shot('folds', T(98) - .05, { push: .07, cast(t, put) {
  const u = ss(seg(t, T(99), T(102)));
  put([.4, -2.0, .08], 1.68, { ...MAN, f: -.8, mouth: 'smile' }); put([1.2, -2.0, .08], 1.58, { ...LADY, f: -.8, mouth: 'smile' });
  put([-1.7, -1.0, .08], 1.95, { ...DOOR, f: .3, folded: u > .9, handL: [lerp(-.3, -.08, u), lerp(-.3, -.45, u)], handR: [lerp(.3, .08, u), lerp(-.3, -.45, u)], tilt: .08 * u, brows: 'flat' });
} });
shot('nottonight', T(103) - .05, { push: .06, cast(t, put) { put([-1.7, -1.0, .08], 1.95, { ...DOOR, folded: true, brows: 'flat', mouth: talk(t, T(103), T(105) + .3, 'flat'), tilt: .05 * sin(t * 3) }); } });
shot('nohome', T(106) - .05, { push: .06, cast(t, put) {
  const sh = t < T(108) + .2;
  for (const [x, p] of [[.4, MAN], [1.25, LADY]]) put([x, -2.1, .08], p.H, { ...p, mouth: sh ? 'open' : 'flat', eyes: sh ? 'wide' : 'lids', brows: sh ? 'raised' : 'angry', tilt: sh ? .05 * sin(t * 10) : 0 });
} });
shot('backofline', T(110) - .05, { pan: [0, 1], cast(t, put) {
  const u = seg(t, T(110), T(114) - .2), mv = u > 0 && u < 1;
  for (let i = 0; i < 9; i++) put([2.0 + i * .85, -.6, .05], str(i, i > 3).H, { ...str(i, i > 3), f: .2 });
  put([lerp(2.0, 9.6, u), lerp(-1.9, -1.0, u), .08], 1.68, { ...MAN, f: 1, eyes: 'lids', brows: 'angry', mouth: 'flat', walk: mv ? 1 : 0, phi: t * 9 });
  put([lerp(1.2, 8.8, u), lerp(-1.9, -1.0, u), .08], 1.58, { ...LADY, f: 1, eyes: 'lids', brows: 'angry', mouth: 'flat', walk: mv ? 1 : 0, phi: t * 9 + 1 });
} });
shot('taxi', T(114) - .05, { push: .05, cast(t, put) {
  const u = ss(seg(t, T(115), T(118)));
  put([10.2, lerp(-4.7, -3.6, u), .08], 1.7, { ...HATMAN, walk: u > 0 && u < 1 ? 1 : 0, phi: t * 8 });
} });
shot('joins', T(119) - .05, { push: .06, cast(t, put) {
  const u = seg(t, T(119), T(121)), look = ss(seg(t, T(122), T(123)));
  put([6.7, -.6, .05], str(6, true).H, { ...str(6, true) });
  put([8.0, -.7, .08], 1.68, { ...MAN, f: .5 * look, mouth: 'smile' }); put([8.8, -.7, .08], 1.58, { ...LADY, f: .45 * look, mouth: 'smile' });
  put([lerp(10.8, 9.6, u), lerp(-1.8, -.7, u), .08], 1.7, { ...HATMAN, f: u < 1 ? -.8 : .3 * sin(t), walk: u > 0 && u < 1 ? 1 : 0, phi: t * 8 });
} });
shot('eleven', T(128) - .05, { push: .06, cast(t, put) {
  for (let i = 0; i < 40; i++) put([2.0 + i * .78, -.6, .05], str(i, true).H, { ...str(i, true), f: ((i * 37) % 30 - 15) / 20, tilt: .05 * sin(t + i) });
} });
shot('midnight', T(135) - .05, { push: .1, cast(t, put) {
  for (let i = 0; i < 40; i++) put([2.0 + i * .78, -.6, .05], 1.55, { ...str(i, true), simple: true });
  for (let i = 0; i < 30; i++) put([34.9, .6 + i * .78, .05], 1.55, { ...str(40 + i, true), simple: true });
} });
shot('money', T(144) - .05, { push: .07, cast(t, put) {
  const w = sin(t * 9);
  put([-1.7, -1.0, .08], 1.95, { ...DOOR, folded: true, eyes: 'wide', brows: 'raised', f: .3 * sin(t * 2.5) });
  put([-2.3, -1.75, .05], 1.63, { ...str(1), f: .8, cash: 'R', handR: [.3, -.6 - .05 * w] });
  put([-1.1, -1.75, .05], 1.55, { ...str(3), f: -.8, cash: 'L', handL: [-.3, -.6 + .05 * w] });
} });
shot('nods', T(151) - .05, { push: .05, cast(t, put) {
  const nod = sin(seg(t, T(152), T(154)) * Math.PI * 2);
  put([0, -1.5, .08], 1.7, { ...OWN, eyes: 'lids', mouth: 'smirk', sq: .03 * nod, tilt: 0 });
} });
shot('ropeup', T(154) - .05, { push: .06, cast(t, put) {
  const u = ss(seg(t, T(155), T(157)));
  put([.9, -1.9, .08], 1.95, { ...DOOR, f: .35, eyes: 'dot', mouth: 'smirk', handL: [-.2, lerp(-.38, -.6, u)], id: 'ropehand' });
}, over(c, t, X) {   // the rope, its hooked end lifted off the post by the doorman
  const u = ss(seg(t, T(155), T(157))), a = [lerp(1.5, 1.9, u), lerp(-1.25, -1.6, u), lerp(.95, 1.35, u)], b = [3.0, -1.25, .95], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2 - .3];
  const [A, M, B] = [a, m, b].map(X); c.save(); for (const [w, col] of [[22, '#1a1220'], [16, '#d01a30']]) { c.lineWidth = w * (A[2] || 1); c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo(2 * M[0] - (A[0] + B[0]) / 2, 2 * M[1] - (A[1] + B[1]) / 2, B[0], B[1]); c.stroke(); } c.restore();
} });
shot('cheer', T(158) - .05, { push: .07, cast(t, put) {
  let k = 0;
  for (let r = 1; r < 9; r++) for (let cc = 0; cc < 16; cc++) {
    if (!((r * 16 + cc) % 2 === 0 || r < 5)) continue;
    const x = -7.0 + cc * .92 + (cc >= 8 ? .5 : -.5), j = abs(sin(t * 7 + k * .7)), p = str(k, true);
    put([x, 8.2 - r * 1.0 - .3, .05], p.H, { ...p, eyes: 'happy', mouth: k % 2 ? 'laugh' : 'grin', handL: [-.2, -.85 - .1 * j], handR: [.2, -.85 - .1 * (1 - j)], bob: .04 * j }); k++;
  }
} });
shot('pays40', T(165) - .05, { push: .06, cast(t, put) {
  const w = abs(sin((t - T(165)) * 3.5));
  put([-12, -1.0, .08], 1.7, { ...OWN, f: .6, eyes: 'happy', mouth: 'grin', cash: 'R', handR: [.25, -.4 - .1 * w], handL: [-.2, -.35] });
  for (let i = 0; i < 4; i++) put([-10.6 + i * .8, -1.3, .05], SH[(i * 7) % 3], { ...str(i), f: -.9, mouth: i ? str(i).mouth : 'grin', handL: i ? undefined : [-.22, -.4 - .1 * w] });
} });
shot('sendshome', T(172) - .05, { push: .03, cast(t, put) {
  const u = seg(t, T(172), T(175) + .6);
  for (let i = 0; i < 8; i++) put([lerp(-12.6, -17.6, u) - i * .7, -1.6 - (i % 2) * .5, .05], str(i, i > 2).H, { ...str(i, i > 2), back: true, walk: u < 1 ? 1 : 0, phi: t * 9 + i });
} });
shot('never', T(175) - .05, { push: .08, cast(t, put) {
  put([-12, -.6, .08], 1.7, { ...OWN, eyes: 'happy', mouth: 'smirk', handL: [-.1, -.36], handR: [.1, -.36], tilt: .08 * sin(t * 2) });
} });
shot('nobody', T(180) - .05, { zoomFrom: 1.7 });
shot('want', T(188) - .05, { push: .05, cast(t, put, X) {
  const clip = X([0, 4.47, 1.1])[1];
  const ppl = [[-.95, MAN, 'smile'], [-.32, LADY, 'grin'], [.32, str(3), 'grin'], [.95, { H: 1.55, skin: 'blue3', wear: '#f4f1e6', pearls: true, hat: { type: 'beret', col: '#c23b3b' } }, 'laugh']];
  ppl.forEach(([x, p, mo], i) => put([x, 4.9, .3], p.H || 1.6, { ...p, eyes: 'happy', mouth: mo, handL: [-.2, -.4], handR: [.2, -.4], tilt: .08 * sin(t * 2 + i), bob: .01 * abs(sin(t * 8 + i)), clip }));
} });
shot('cannot', T(197) - .05, { push: .1, cast(t, put) { put([-1.7, -1.0, .08], 1.95, { ...DOOR, folded: true, eyes: 'lids', brows: 'flat', mouth: 'smirk' }); } });

// —— props held in the band and bar shots (drawn on the character's screen position) ——
function prop(c, id, x, y, h) {
  const ln = (w, col, pts) => { c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); };
  const disc = (cx, cy, rx, ry, fill) => { c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fillStyle = fill; c.fill(); c.lineWidth = h * .014; c.strokeStyle = '#1a1220'; c.stroke(); };
  if (id === 'drums') { disc(x, y - h * .22, h * .26, h * .2, '#d8333a'); disc(x, y - h * .22, h * .17, h * .13, '#f4f1e6'); disc(x - h * .3, y - h * .42, h * .14, h * .05, '#f4f1e6'); disc(x + h * .32, y - h * .62, h * .17, h * .04, '#e8c35a'); ln(h * .012, '#1a1220', [[x + h * .32, y - h * .62], [x + h * .32, y - h * .1]]); }
  if (id === 'trumpet') { ln(h * .04, '#1a1220', [[x + h * .1, y - h * .55], [x + h * .45, y - h * .58]]); ln(h * .028, '#e8c35a', [[x + h * .1, y - h * .55], [x + h * .45, y - h * .58]]); disc(x + h * .48, y - h * .58, h * .05, h * .1, '#e8c35a'); }
  if (id === 'guitar') { c.save(); c.translate(x - h * .02, y - h * .38); c.rotate(-.5); ln(h * .03, '#3a2418', [[0, 0], [h * .42, 0]]); disc(-h * .04, 0, h * .14, h * .11, '#e8705a'); disc(-h * .04, 0, h * .035, h * .035, '#1a1220'); c.restore(); }
  if (id === 'glass') { c.save(); c.translate(x + h * .02, y - h * .6); c.beginPath(); c.moveTo(-h * .04, -h * .06); c.lineTo(h * .04, -h * .06); c.lineTo(h * .03, h * .05); c.lineTo(-h * .03, h * .05); c.closePath(); c.fillStyle = 'rgba(220,240,255,.7)'; c.fill(); c.lineWidth = h * .01; c.strokeStyle = '#1a1220'; c.stroke(); c.restore(); }
}

// —— camera, projection and drawing ——
const plates = {};
function viewOf(s, t) {
  const P = plates[s.name], cam = P.cam, i = SHOTS.indexOf(s), t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : END, u = seg(t, s.t0, t1);
  let z = Math.max(1920 / cam.h, 1080 / cam.w), ox = cam.w / 2, oy = cam.h / 2;
  if (s.push) z *= 1 + s.push * ss(u);
  if (s.zoomFrom) z *= lerp(s.zoomFrom, 1, ss(u));
  if (s.zoomAt && t >= s.zoomAt[0]) { z *= 1 + s.zoomAt[1]; oy -= cam.h * .07; }
  if (s.pan) { const a = 540 / z, b = cam.w - 540 / z; ox = lerp(lerp(a, b, s.pan[0]), lerp(a, b, s.pan[1]), u); }
  if (s.panY) { const half = 960 / z; oy = lerp(lerp(half, cam.h - half, s.panY[0]), lerp(half, cam.h - half, s.panY[1]), ss(u)); }
  return { z, ox, oy };
}
function project(cam, p) {
  const m = cam.m, x = p[0], y = p[1], zz = p[2];
  const X = m[0][0] * x + m[0][1] * y + m[0][2] * zz + m[0][3], Y = m[1][0] * x + m[1][1] * y + m[1][2] * zz + m[1][3], Z = m[2][0] * x + m[2][1] * y + m[2][2] * zz + m[2][3];
  const f = cam.lens / cam.sensor * cam.h, d = Math.max(.05, -Z); return [cam.w / 2 + f * X / d, cam.h / 2 - f * Y / d, d];
}
function drawShot(c, s, t) {
  const P = plates[s.name]; if (!P) return; const cam = P.cam, v = viewOf(s, t);
  const X = p => { const [px, py, d] = project(cam, p); return [(px - v.ox) * v.z + 540, (py - v.oy) * v.z + 960, d]; };
  c.save(); c.filter = `blur(${1.6 * K}px)`; c.drawImage(P.img, -v.ox * v.z + 540, -v.oy * v.z + 960, cam.w * v.z, cam.h * v.z); c.restore();
  const list = [];
  if (s.cast) s.cast(t, (pos, Hm, props) => { const a = X(pos), b = X([pos[0], pos[1], pos[2] + Hm]); list.push({ x: a[0], y: a[1], h: a[1] - b[1], d: a[2], props }); }, X);
  list.sort((p, q) => q.d - p.d);
  for (const it of list) {
    if (it.x < -400 || it.x > 1480 || it.h < 3) continue;
    const p = { ...it.props, x: it.x, y: it.y, h: it.h * .94 }; delete p.H;
    if (p.simple) { c.fillStyle = p.wear; c.beginPath(); c.arc(p.x, p.y - p.h * .4, p.h * .17, 0, 7); c.fill(); c.fillStyle = '#4f7bf0'; c.beginPath(); c.arc(p.x, p.y - p.h * .78, p.h * .2, 0, 7); c.fill(); continue; }
    toon(c, p); if (p.id) prop(c, p.id, p.x, p.y, p.h);
  }
  if (s.over) s.over(c, t, X);
  const g = c.createRadialGradient(540, 960, 600, 540, 960, 1300); g.addColorStop(0, 'rgba(4,6,24,0)'); g.addColorStop(1, 'rgba(4,6,24,.5)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
}

// —— captions: Hungarian like the reference (big white words, dark outline, three at a time, the spoken word turquoise); Persian: the whole line, for checking ——
const CHUNKS = (() => { const out = []; let cur = []; WORDS.forEach((w, i) => { cur.push(i); if (cur.length === 3 || /[.,!?…”]$/.test(w[0])) { out.push(cur); cur = []; } }); if (cur.length) out.push(cur); return out; })();
function capHU(c, t) {
  const n = CHUNKS.findIndex((k, j) => t >= T(k[0]) - .02 && (j + 1 >= CHUNKS.length || t < T(CHUNKS[j + 1][0]) - .02)); if (n < 0) return; const ch = CHUNKS[n];
  if (t > WORDS[ch[ch.length - 1]][2] + 1.2) return;
  c.save(); c.font = '700 80px "Montserrat"'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const words = ch.map(i => WORDS[i][0]), sp = c.measureText(' ').width, wid = words.map(w => c.measureText(w).width), tot = wid.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const sc = Math.min(1, 900 / tot), y = 1180, pop = sc * (1 + .08 * (1 - ss(seg(t, T(ch[0]) - .02, T(ch[0]) + .1))));
  c.translate(540, y); c.scale(pop, pop); c.translate(-540, -y); let x = 540 - tot / 2;
  ch.forEach((i, k) => { const on = t >= WORDS[i][1] - .02; c.lineWidth = 16; c.strokeStyle = '#0c0a1a'; c.strokeText(words[k], x, y); c.fillStyle = on && t < WORDS[i][2] + .05 ? '#2ED3C6' : '#ffffff'; c.fillText(words[k], x, y); x += wid[k] + sp; });
  c.restore();
}
const FA = ['یک کلوب شبانه باز کرد و به ۴۰ نفر پول داد که بیرون بایستند و داخل نروند.', 'امشب افتتاحیه است.', 'داخل، گروه موسیقی، بار و ۳۰۰ صندلی مخملی منتظر مهمان‌ها هستند… اما روی هیچ‌کدام کسی ننشسته.', 'آخرین فورینتش را هم خرج این کرده.', 'برای همین از در پشتی بیرون می‌رود و از جلو با ۴۰ غریبه و یک طناب قرمز برمی‌گردد.', 'آن‌ها را کنار دیوار به صف می‌کند.', '«با هیچ‌کس حرف نزنید. فقط وانمود کنید که منتظرید.»', 'بعد رو به دربان می‌کند.', '«هر کس الان بیاید، ردش کن.»', 'دربان از پنجره به سالن خالی نگاه می‌کند.', '«ما ۳۰۰ جا داریم. چرا باید نه بگویم؟»', 'یک زوج با بهترین لباس‌هایشان جلو می‌آیند.', 'دربان دست‌به‌سینه می‌ایستد. «امشب نه.»', 'ولی به خانه نمی‌روند. ته صف می‌ایستند.', 'مردی از تاکسی پیاده می‌شود و در صف می‌ایستد. حتی نمی‌پرسد منتظر چه هستند.', 'تا ساعت یازده صف به سر کوچه می‌رسد.', 'تا نیمه‌شب صف مثل مار دور تمام بلوک پیچیده و مردم به دربان پول پیشنهاد می‌دهند.', 'فقط آن موقع سر تکان می‌دهد و طناب را بالا می‌برند.', 'داخل طوری هورا می‌کشند که انگار چیزی برده‌اند.', 'چهل غریبه را دم در پشتی پول می‌دهد و به خانه می‌فرستد.', 'دیگر هیچ‌وقت به آن‌ها نیازی ندارد.', 'می‌دانی، هیچ‌کس نمی‌خواهد در یک سالن خالی بنشیند.', 'آن جایی را می‌خواهند که همین الان به آن‌ها گفتند نمی‌توانند داشته باشند.'];
const FA_AT = [0, 15, 20, 34, 40, 54, 60, 68, 72, 78, 86, 92, 98, 106, 114, 128, 135, 151, 158, 165, 175, 180, 188];
function capFA(c, t) {
  let n = -1; FA_AT.forEach((w, i) => { if (t >= T(w) - .05) n = i; }); if (n < 0) return;
  c.save(); c.font = '700 58px "Vazirmatn"'; c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const words = FA[n].split(' '), rows = []; let cur = '';
  for (const w of words) { const s = cur ? cur + ' ' + w : w; if (c.measureText(s).width > 900 && cur) { rows.push(cur); cur = w; } else cur = s; } rows.push(cur);
  rows.forEach((r, i) => { const y = 1180 + (i - (rows.length - 1) / 2) * 82; c.lineWidth = 14; c.strokeStyle = '#0c0a1a'; c.strokeText(r, 540, y); c.fillStyle = '#ffffff'; c.fillText(r, 540, y); });
  c.restore();
}

(async () => {
  await Promise.all([document.fonts.load('700 80px "Montserrat"', 'ÁÉŐŰáéőű'), document.fonts.load('700 58px "Vazirmatn"', 'سلام')]);
  await Promise.all(SHOTS.map(async s => {
    try { const cam = await (await fetch(`plates/${s.name}.json`)).json(), img = new Image(); img.src = `plates/${s.name}.png`; await img.decode(); plates[s.name] = { cam, img }; }
    catch (e) { plates[s.name] = null; }   // a plate not rendered yet: that shot stays dark (previews while the plates render)
  }));
  const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  window.DUR = +(new URLSearchParams(location.search).get('dur') || END);
  window.render = t => { const c = ctx; c.setTransform(K, 0, 0, K, 0, 0); c.fillStyle = '#05081a'; c.fillRect(0, 0, 1080, 1920);
    let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0) i++; drawShot(c, SHOTS[i], t); (LANG === 'fa' ? capFA : capHU)(c, t); };
  window.render(0); window.READY = true;
})();
