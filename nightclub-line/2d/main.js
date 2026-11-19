// The nightclub film in 2.5D (user 2026-11-18: "between 2D and 3D", "exactly like the example", "a more blue world, mascots visible").
// Each shot: a soft 3D plate rendered from that shot's camera (../3d/plate.py, cameras copied from the reference) and our 2D mascots
// standing in it at the 3D film's positions (projected through the saved camera). ?lang=fa shows Persian captions (for checking).
import { toon } from './toon.js';
import { WORDS } from './captions.js';
const W = innerWidth, H = innerHeight, K = W / 1080;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, u) => a + (b - a) * u;
// a pause in the voice after „Beállnak a sor végére.” (user 2026-11-20): the couple walk slower to the back of the line, and the man gets out of the taxi naturally
const GAP_AT = 38.55, GAP = 3.8; WORDS.forEach(w => { if (w[1] >= GAP_AT) { w[1] += GAP; w[2] += GAP; } });
const T = i => WORDS[i][1], END = 66.3 + GAP, LANG = new URLSearchParams(location.search).get('lang') || 'hu';
const R = d => d * Math.PI / 180, sin = Math.sin, abs = Math.abs;
const talk = (t, a, b, closed = 'smile') => (a <= t && t <= b) ? ((t * 7.5) % 1 < .55 ? 'open' : closed) : closed;

// —— the cast (as in the 3D film) ——
const OWN = { skin: 'owner', hair: { type: 'bowl', col: '#4a2a1c' }, tache: true, bow: '#d8333a', bowDots: true, buttons: true };
const DOOR = { skin: 'blue1', wear: '#1c2560', jacket: true, hat: { type: 'cap', col: '#1c2560' }, tie: '#0e0e1a', bulk: 1.85,   // gym-bulky, big biceps (user 2026-11-20)
  eyes: 'lids', mouth: 'flat' };
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
const MAN = { H: 1.68, skin: 'blue2', wear: '#16161f', suit: true, lapel: '#262634', bow: '#e8b93a', hair: { type: 'side', col: '#f2cc62' }, sleeve: '#16161f' };   // the rich couple (user 2026-11-19: more luxury, blonde guy in a suit)
const LADY = { H: 1.58, skin: 'blue1', wear: '#0e7a5c', sparkle: true, hair: { type: 'long', col: '#f2cc62' }, pearls: true, earrings: '#e8c35a', blush: true,   // user 2026-11-20: blonde, red lipstick, fuller lips, make-up
  lips: '#d0142c', lashes: true, shadow: 'rgba(150,90,200,.55)' };
const HATMAN = { H: 1.7, skin: 'blue3', wear: '#b8956a', coat: '#a8845a', lapel: '#9a7650', shirt: '#f4f1e6', tie: '#8a1c24', sleeve: '#b8956a', hat: { type: 'fedora', col: '#2e2018' }, eyes: 'dot', mouth: 'flat' };
const face = r => -sin(r);   // a 3D turn (radians about Z) as the 2D facing

// —— shots ——
const SHOTS = [];
// o: { push (zoom gained over the shot), pan: [x0, x1] in plate pixels (wide plates), panY, cast(t, put), over(c, t, P) }
const shot = (name, t0, o = {}) => SHOTS.push({ name, t0, ...o });

shot('opened', 0, { push: .05, cast(t, put) {   // a proud, happy owner (user 2026-11-19: no strange laugh): a warm smile, a little chuckle on „klubot”
  const glad = t >= T(3) - .1, rub = sin(t * 4);
  put([0, -1.5, .08], 1.7, { ...OWN, eyes: glad ? 'happy' : 'dot', mouth: glad ? 'grin' : 'smile', sq: glad ? .012 * abs(sin(t * 6)) : 0, tilt: .03 * sin(t * 2.2), handL: [-.05 + .012 * rub, -.32], handR: [.05 + .012 * rub, -.31] });
} });
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
  put([-10.4, 4.0, .6], 1.8, { clip: X([-9.45, 4.0, 1.24])[1], skin: 'blue3', wear: '#f4f1e6', vest: '#1a1a26', bow: '#151018', tache: true, hair: { type: 'side', col: '#3a2418' }, sleeve: '#f4f1e6', eyes: 'dot', mouth: 'smile', handL: [.08, -.44], handR: [.16 + .04 * sin(t * 9), -.47], id: 'glass' });
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
  put([3.0, -2.0, .08], 1.7, { ...OWN, brows: 'angry', mouth: talk(t, T(60), T(63) - .1, 'flat'), handR: [.2, -.72 - .03 * sin(t * 8)], tilt: .05 * sin(t * 5) });
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
// the couple walk slowly along the line to its end and step in behind the last person; the camera follows them (user 2026-11-20: slower)
const BACK_U = t => seg(t, T(110) - .1, GAP_AT + 2.0);
const backPath = (u, x0, xf) => u < .72 ? [lerp(x0, xf, ss(u / .72)), -1.9] : [xf, lerp(-1.9, -.62, ss((u - .72) / .28))];
shot('backofline', T(110) - .05, { follow: t => { const u = BACK_U(t), a = backPath(u, 4.6, 9.65), b = backPath(u, 5.3, 10.35); return [(a[0] + b[0]) / 2, -1.2, 1.0]; }, cast(t, put) {
  const u = BACK_U(t), mv = u > 0 && u < 1;
  for (let i = 0; i < 9; i++) put([2.0 + i * .85, -.6, .05], str(i, i > 3).H, { ...str(i, i > 3), f: .2 });
  put([...backPath(u, 4.6, 9.65), .08], 1.68, { ...MAN, f: u < .72 ? 1 : .2, eyes: 'lids', brows: 'angry', mouth: 'flat', back: u > .74 && u < .98, walk: mv ? 1 : 0, phi: t * 6 });
  put([...backPath(u, 5.3, 10.35), .08], 1.58, { ...LADY, f: u < .72 ? 1 : .2, eyes: 'lids', brows: 'angry', mouth: 'flat', back: u > .74 && u < .98, walk: mv ? 1 : 0, phi: t * 6 + 1 });
} });
shot('taxi', GAP_AT + 2.2, { push: .05, over(c, t, X) {   // the rear door swings open, the man climbs out and stands up, then walks off (user 2026-11-20: "all natural")
  const t0 = GAP_AT + 2.2, th = 1.25 * ss(seg(t, t0 + .2, t0 + .8)), Hx = 10.35, Hy = -4.5, DW = 1.1;
  const quad = (pts, fill) => { const q = pts.map(X); c.beginPath(); q.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = fill; c.fill(); c.lineWidth = 2.2; c.strokeStyle = '#1a1220'; c.stroke(); };
  const hole = [[9.25, -4.49, .32], [Hx, -4.49, .32], [Hx, -4.49, 1.45], [9.25, -4.49, 1.45]];
  if (th > .01) quad(hole, '#1a1426');
  const v = ss(seg(t, t0 + .7, t0 + 1.6)), w = ss(seg(t, t0 + 1.6, t0 + 3.1));
  const pos = [lerp(9.8, 9.75, v) + lerp(0, 1.0, w), lerp(-4.62, -4.05, v) + lerp(0, .75, w), .08], inside = v < .6;
  const man = () => { const a = X(pos), b = X([pos[0], pos[1], pos[2] + 1.7]); const P = { ...HATMAN, f: w > 0 ? .7 : .5, x: a[0], y: a[1] + (1 - v) * (a[1] - b[1]) * .32, h: (a[1] - b[1]) * .94, sq: .25 * (1 - v), lean: .25 * (1 - v), walk: w > 0 && w < 1 ? 1 : 0, phi: t * 7 };
    if (inside) { c.save(); const q = hole.map(X); c.beginPath(); q.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.lineTo(q[3][0], q[3][1] - 600); c.lineTo(q[2][0], q[2][1] - 600); c.closePath(); c.clip(); toon(c, P); c.restore(); } else toon(c, P); };
  if (th > .01 && inside) man();
  if (th > .01) { const F = [Hx - DW * Math.cos(th), Hy + DW * Math.sin(th)], at = z => [[Hx, Hy, z[0]], [F[0], F[1], z[0]], [F[0], F[1], z[1]], [Hx, Hy, z[1]]];
    quad(at([.32, .95]), '#f2bf2e'); quad(at([.95, 1.45]), '#f2bf2e'); const g = at([1.0, 1.4]).map((p, k) => k === 0 || k === 3 ? [lerp(Hx, F[0], .1), lerp(Hy, F[1], .1), p[2]] : [lerp(Hx, F[0], .9), lerp(Hy, F[1], .9), p[2]]); quad(g, '#22304e');
    const band = at([.83, .89]); quad(band, '#151018'); }
  if (!inside) man();
} });
shot('joins', T(119) - .05, { push: .06, cast(t, put) {
  const u = seg(t, T(119), T(121)), look = ss(seg(t, T(122), T(123)));
  put([8.8, -.6, .05], str(8, true).H, { ...str(8, true) });
  put([9.65, -.62, .08], 1.68, { ...MAN, f: .5 * look, mouth: 'smile' }); put([10.35, -.62, .08], 1.58, { ...LADY, f: .45 * look, mouth: 'smile' });   // at the end of the line, past the rope's last post
  put([lerp(12.2, 11.05, u), lerp(-1.8, -.62, u), .08], 1.7, { ...HATMAN, f: u < 1 ? -.8 : .3 * sin(t), walk: u > 0 && u < 1 ? 1 : 0, phi: t * 8 });
} });
shot('eleven', T(128) - .05, { push: .06, cast(t, put) {
  for (let i = 0; i < 40; i++) put([2.0 + i * .78, -.6, .05], str(i, true).H, { ...str(i, true), f: ((i * 37) % 30 - 15) / 20, tilt: .05 * sin(t + i) });
} });
shot('midnight', T(135) - .05, { push: .1, cast(t, put) {
  for (let i = 0; i < 40; i++) put([2.0 + i * .78, -.6, .05], 1.55, { ...str(i, true), f: .3 * sin(i) });
  for (let i = 0; i < 30; i++) put([34.9, .6 + i * .78, .05], 1.55, { ...str(40 + i, true), f: .3 * sin(i) });
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
shot('cheer', T(158) - .05, { push: .07, cast(t, put) {   // the dance floor (user 2026-11-20): people dancing and drinking, the band playing on the stage behind
  const hit = abs(sin(t * 10));
  put([-1.1, 13.0, 1.0], 1.5, { skin: 'blue2', wear: '#ffffff', bow: '#d23a3a', tache: true, eyes: 'happy', mouth: 'o', f: .3, tilt: .1 * sin(t * 4), handL: [.18, -.55], handR: [.1, -.56], id: 'trumpet' });
  put([0, 13.6, 1.0], 1.5, { skin: 'blue3', wear: '#7a5cff', hat: { type: 'beanie', col: '#f2c14e' }, eyes: 'lids', mouth: 'grin', handL: [-.25, -.42 - .06 * hit], handR: [.25, -.42 - .06 * (1 - hit)], id: 'drums' });
  put([1.1, 13.0, 1.0], 1.5, { skin: 'blue1', wear: '#f2c14e', hat: { type: 'fedora', col: '#151018' }, eyes: 'happy', mouth: 'smile', f: -.3, tilt: .1 * sin(t * 6), handL: [-.2, -.5], handR: [.05, -.35 - .04 * sin(t * 14)], id: 'guitar' });
  let k = 0;
  for (let r = 0; r < 5; r++) for (let cc = 0; cc < 6 - (r % 2); cc++) {
    const x = -4.2 + cc * 1.65 + (r % 2) * .82 + .25 * sin(k * 2.3), y = 10.4 - r * 1.3 + .2 * sin(k * 1.7), ph = t * 7.5 + k * 1.3, j = abs(sin(ph));
    const p = k === 7 ? LADY : k === 8 ? MAN : str(k + 3, true), drink = k % 3 === 1, up = k % 3 === 0;
    const hands = up ? { handL: [-.26, -.82 - .1 * j], handR: [.26, -.82 - .1 * (1 - j)] } : drink ? { handL: [-.22, -.36 - .05 * j], handR: [.24, -.6 - .04 * j], drink: ['#e85a7a', '#f2c14e', '#2ED3C6'][k % 3] } : { handL: [-.28, -.5 + .12 * sin(ph)], handR: [.28, -.5 - .12 * sin(ph)] };
    put([x + .12 * sin(ph * .5), y, .05], p.H || 1.58, { ...p, ...hands, eyes: 'happy', mouth: ['laugh', 'grin', 'smile', 'open'][k % 4], tilt: .14 * sin(ph * .5), bob: .035 * j, f: .5 * sin(ph * .25 + k) }); k++;
  }
} });
const HAND = [0, 1, 2, 3].map(k => T(165) + .15 + k * .55);   // the owner hands cash to one stranger after another at the back door (user 2026-11-20); a cash sound on each (mix.py)
shot('pays40', T(165) - .05, { push: .06, cast(t, put) {
  const reach = Math.max(...HAND.map(hk => Math.exp(-(((t - hk) / .14) ** 2))));
  put([-12, -1.0, .08], 1.7, { ...OWN, f: .6, eyes: 'happy', mouth: 'grin', cash: 'R', handR: [lerp(.22, .34, reach), lerp(-.4, -.52, reach)], handL: [-.2, -.35] });
  const slot = s => [-11.2 + s * .72, -1.25 - s * .06];
  for (let i = 0; i < 7; i++) {
    const L = i < 4 ? HAND[i] + .12 : 1e9, p = str(i + 1), s = i - HAND.slice(0, Math.min(i, 4)).reduce((a, hk) => a + ss(seg(t, hk + .12, hk + .55)), 0);
    if (t > L) { const v = seg(t, L, L + .7); if (v >= 1) continue; put([lerp(-11.2, -9.0, v), lerp(-1.25, -.5, v), .05], SH[(i * 7) % 3], { ...p, back: true, walk: 1, phi: t * 9 + i, cash: 'L', handL: [-.25, -.5], mouth: 'grin', alpha: 1 - ss(seg(v, .6, 1)) }); continue; }
    const [x, y] = slot(s), got = i < 4 && t > HAND[i] - .05;
    put([x, y, .05], SH[(i * 7) % 3], { ...p, f: -.9, eyes: got ? 'happy' : p.eyes, mouth: got ? 'grin' : p.mouth, walk: abs(s - Math.round(s)) > .05 ? 1 : 0, phi: t * 9 + i, ...(s < .5 ? { handL: [-.26, -.45 - .08 * (got ? 1 : reach)], cash: got ? 'L' : undefined } : {}) });
  }
} });
shot('sendshome', T(172) - .05, { push: .03, cast(t, put) {
  const u = seg(t, T(172), T(175) + .6);
  for (let i = 0; i < 8; i++) put([lerp(-12.6, -17.6, u) - i * .7, -1.6 - (i % 2) * .5, .05], str(i, i > 2).H, { ...str(i, i > 2), back: true, walk: u < 1 ? 1 : 0, phi: t * 9 + i });
} });
shot('never', T(175) - .05, { push: .08, cast(t, put) {
  put([-12, -.6, .08], 1.7, { ...OWN, eyes: 'happy', mouth: 'smirk', handL: [-.1, -.36], handR: [.1, -.36], tilt: .08 * sin(t * 2) });
} });
shot('nobody', T(180) - .05, { zoomFrom: 1.7 });
// the guests in armchairs at a long lounge table, drinking and toasting (user 2026-11-20: "people sitting on the tables drinking", to the end)
const GUESTS = [[-1.15, MAN, 'smile', '#f2c14e'], [-.4, LADY, 'grin', '#e85a7a'], [.38, str(3), 'laugh', '#2ED3C6'], [1.12, { H: 1.55, skin: 'blue3', wear: '#f4f1e6', pearls: true, lashes: true, lips: '#c8102e', hair: { type: 'bob', col: '#3a2418' } }, 'grin', '#f2c14e']];
function lounge(t, put, X, t0, turn) {
  const toast = seg(t, t0 + .5, t0 + 1.0) * (1 - seg(t, t0 + 1.6, t0 + 2.1));
  GUESTS.forEach(([x, p, mo, dc], i) => {
    const sip = (i + Math.floor(t * .8)) % 3 === 0 ? abs(sin(t * 2.2 + i)) : 0, hx = lerp(.22, i < 2 ? .34 : .1, toast), hy = lerp(-.42 - .2 * sip, -.78, toast);
    put([x, 5.15, .32], p.H || 1.6, { ...p, eyes: 'happy', mouth: sip > .7 ? 'o' : mo, f: turn ? (i < 2 ? .5 : -.5) : .25 * sin(t * 1.5 + i * 2), handL: [-.2, -.4], handR: [hx, hy], drink: dc, tilt: .06 * sin(t * 2 + i), bob: .01 * abs(sin(t * 8 + i)), clip: X([x, 4.85, .77])[1] });   // hidden below the table's far edge: seated behind it
  });
}
shot('want', T(188) - .05, { push: .05, cast(t, put, X) { lounge(t, put, X, T(188), false); } });
shot('cannot', T(197) - .05, { push: .06, cast(t, put) {   // the end: the guests standing on the dance floor, dancing with their drinks (user 2026-11-20)
  for (let k = 0; k < 10; k++) { const p = str(k + 20, true), ph = t * 7 + k * 1.7, j = abs(sin(ph)); put([-3.2 + (k % 5) * 1.6 + (k > 4 ? .8 : 0), 10.6 - (k > 4 ? 1.2 : 0), .05], p.H, { ...p, eyes: 'happy', mouth: 'grin', handL: [-.26, -.8 - .1 * j], handR: [.26, -.8 - .1 * (1 - j)], bob: .03 * j, tilt: .12 * sin(ph * .5) }); }
  GUESTS.forEach(([x, p, mo, dc], i) => { const ph = t * 6.5 + i * 1.9, j = abs(sin(ph)); put([x * 1.15 - .3, 7.9 - (i % 2) * .35, .05], p.H || 1.6, { ...p, eyes: 'happy', mouth: mo, f: .4 * sin(ph * .3 + i), handL: [-.26, -.62 + .14 * sin(ph)], handR: [.25, -.62 - .04 * j], drink: dc, bob: .035 * j, tilt: .12 * sin(ph * .5) }); });
} });

// —— props held in the band and bar shots (drawn on the character's screen position) ——
function prop(c, id, x, y, h) {
  const ln = (w, col, pts) => { c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); };
  const disc = (cx, cy, rx, ry, fill) => { c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fillStyle = fill; c.fill(); c.lineWidth = h * .014; c.strokeStyle = '#1a1220'; c.stroke(); };
  if (id === 'drums') { disc(x, y - h * .22, h * .26, h * .2, '#d8333a'); disc(x, y - h * .22, h * .17, h * .13, '#f4f1e6'); disc(x - h * .3, y - h * .42, h * .14, h * .05, '#f4f1e6'); disc(x + h * .32, y - h * .62, h * .17, h * .04, '#e8c35a'); ln(h * .012, '#1a1220', [[x + h * .32, y - h * .62], [x + h * .32, y - h * .1]]); }
  if (id === 'trumpet') { ln(h * .04, '#1a1220', [[x + h * .1, y - h * .55], [x + h * .45, y - h * .58]]); ln(h * .028, '#e8c35a', [[x + h * .1, y - h * .55], [x + h * .45, y - h * .58]]); disc(x + h * .48, y - h * .58, h * .05, h * .1, '#e8c35a'); }
  if (id === 'guitar') { c.save(); c.translate(x - h * .02, y - h * .38); c.rotate(-.5); ln(h * .03, '#3a2418', [[0, 0], [h * .42, 0]]); disc(-h * .04, 0, h * .14, h * .11, '#e8705a'); disc(-h * .04, 0, h * .035, h * .035, '#1a1220'); c.restore(); }
  if (id === 'glass') { c.save(); c.translate(x + h * .2, y - h * .5); c.rotate(.3); c.fillStyle = '#f4f1e6'; c.strokeStyle = '#1a1220'; c.lineWidth = h * .008; c.beginPath(); c.rect(-h * .02, -h * .06, h * .05, h * .12); c.fill(); c.stroke(); c.restore(); c.save(); c.translate(x + h * .12, y - h * .5); c.beginPath(); c.moveTo(-h * .04, -h * .06); c.lineTo(h * .04, -h * .06); c.lineTo(h * .03, h * .05); c.lineTo(-h * .03, h * .05); c.closePath(); c.fillStyle = 'rgba(220,240,255,.7)'; c.fill(); c.lineWidth = h * .01; c.strokeStyle = '#1a1220'; c.stroke(); c.restore(); }
}

function drinkProp(c, p) {   // a cocktail glass held in the right hand
  const h = p.h, bob = (p.bob || 0) * h, gx = p.x + p.handR[0] * h, gy = p.y - bob + p.handR[1] * h, s = h * .09;
  c.save(); c.translate(gx, gy - s * .2); c.lineJoin = 'round'; c.lineWidth = Math.max(1, h * .008); c.strokeStyle = '#1a1220';
  c.fillStyle = 'rgba(220,235,255,.85)'; c.beginPath(); c.moveTo(-s * .55, -s * 1.2); c.lineTo(s * .55, -s * 1.2); c.lineTo(0, -s * .45); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = p.drink; c.beginPath(); c.moveTo(-s * .42, -s * 1.08); c.lineTo(s * .42, -s * 1.08); c.lineTo(0, -s * .52); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0, -s * .45); c.lineTo(0, s * .15); c.moveTo(-s * .25, s * .15); c.lineTo(s * .25, s * .15); c.stroke(); c.restore();
}
// the rope line, drawn here (not in the plates) so the people in the line stand behind it (user 2026-11-20)
const FRONT = new Set(['opened', 'pays', 'line', 'notin', 'opening', 'rope', 'lineup', 'donttalk', 'wait', 'turns', 'sendaway', 'window', '300', 'whyno', 'couple', 'folds', 'nottonight', 'nohome', 'backofline', 'joins', 'eleven', 'money', 'nods', 'ropeup']);
const POSTS = [1.5, 3.0, 4.5, 6.0, 7.5, 9.0], RY = -1.25;
function ropeItems(list, X, skipFirst) {
  const gold = '#e8c35a';
  POSTS.forEach((x, i) => {
    const B = X([x, RY, 0]), Tp = X([x, RY, 1.05]);
    list.push({ d: B[2], draw(c) { const ppm = (B[1] - Tp[1]) / 1.05; if (ppm <= 0) return; const lw = Math.max(1, ppm * .02); c.save(); c.strokeStyle = '#1a1220'; c.lineWidth = lw; c.fillStyle = gold;
      c.beginPath(); c.ellipse(B[0], B[1], ppm * .2, ppm * .06, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.rect(B[0] - ppm * .045, Tp[1], ppm * .09, B[1] - Tp[1]); c.fill(); c.stroke();
      c.beginPath(); c.arc(Tp[0], Tp[1], ppm * .08, 0, 7); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(Tp[0] - ppm * .025, Tp[1] - ppm * .025, ppm * .025, 0, 7); c.fill(); c.restore(); } });
    if (i && !(skipFirst && i === 1)) {
      const a = X([POSTS[i - 1], RY, .95]), mm = X([(POSTS[i - 1] + x) / 2, RY, .62]), b = X([x, RY, .95]), mb = X([(POSTS[i - 1] + x) / 2, RY, 0]);
      list.push({ d: mm[2] - .01, draw(c) { const ppm = (mb[1] - mm[1]) / .62; if (ppm <= 0) return; const cx = 2 * mm[0] - (a[0] + b[0]) / 2, cy = 2 * mm[1] - (a[1] + b[1]) / 2;
        c.save(); c.lineCap = 'round'; for (const [w, col] of [[.1, '#1a1220'], [.07, '#c0182a']]) { c.lineWidth = w * ppm; c.strokeStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(cx, cy, b[0], b[1]); c.stroke(); } c.restore(); } });
    }
  });
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
  if (s.follow) { const a = 540 / z, b = cam.w - 540 / z; ox = clamp(project(cam, s.follow(t))[0], a, b); }
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
  if (FRONT.has(s.name)) ropeItems(list, X, s.name === 'ropeup');
  list.sort((p, q) => q.d - p.d);
  for (const it of list) {
    if (it.draw) { it.draw(c); continue; }
    if (it.x < -400 || it.x > 1480 || it.h < 3) continue;
    const p = { ...it.props, x: it.x, y: it.y, h: it.h * .94 }; delete p.H;
    if (p.simple) { c.fillStyle = p.wear; c.beginPath(); c.arc(p.x, p.y - p.h * .4, p.h * .17, 0, 7); c.fill(); c.fillStyle = '#4f7bf0'; c.beginPath(); c.arc(p.x, p.y - p.h * .78, p.h * .2, 0, 7); c.fill(); continue; }
    toon(c, p); if (p.id) prop(c, p.id, p.x, p.y, p.h); if (p.drink) drinkProp(c, p);
  }
  if (s.over) s.over(c, t, X);
  const g = c.createRadialGradient(540, 960, 600, 540, 960, 1300); g.addColorStop(0, 'rgba(4,6,24,0)'); g.addColorStop(1, 'rgba(4,6,24,.5)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
}

// —— captions: Hungarian like the reference (big white words, dark outline, three at a time, the spoken word turquoise); Persian: the whole line, for checking ——
// word by word (user 2026-11-20): at most 2–3 short words on screen, each appearing as it is spoken, so the captions stay out of the pictures' way
const CHUNKS = (() => { const out = []; let cur = [], len = 0; WORDS.forEach((w, i) => {
  if (cur.length && (cur.length === 3 || len + w[0].length > 15)) { out.push(cur); cur = []; len = 0; }
  cur.push(i); len += w[0].length + 1; if (/[.,!?…”:]$/.test(w[0])) { out.push(cur); cur = []; len = 0; } }); if (cur.length) out.push(cur); return out; })();
function capHU(c, t) {
  const n = CHUNKS.findIndex((k, j) => t >= T(k[0]) - .02 && (j + 1 >= CHUNKS.length || t < T(CHUNKS[j + 1][0]) - .02)); if (n < 0) return; const ch = CHUNKS[n];
  if (t > WORDS[ch[ch.length - 1]][2] + 1.2) return;
  c.save(); c.font = '700 66px "Montserrat"'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const words = ch.map(i => WORDS[i][0]), sp = c.measureText(' ').width, wid = words.map(w => c.measureText(w).width), tot = wid.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const sc = Math.min(1, 900 / tot), y = 1180, pop = sc * (1 + .08 * (1 - ss(seg(t, T(ch[0]) - .02, T(ch[0]) + .1))));
  c.translate(540, y); c.scale(pop, pop); c.translate(-540, -y); let x = 540 - tot / 2;
  ch.forEach((i, k) => { const on = t >= WORDS[i][1] - .02; if (!on) { x += wid[k] + sp; return; } c.lineWidth = 16; c.strokeStyle = '#0c0a1a'; c.strokeText(words[k], x, y); c.fillStyle = on && t < WORDS[i][2] + .05 ? '#2ED3C6' : '#ffffff'; c.fillText(words[k], x, y); x += wid[k] + sp; });
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
