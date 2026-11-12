// M08 Az „utána” érzés (sell the after): a 23 Team neon motion reel after reference video 8, beat by beat on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 40.1, DUR = 42.6, X = 540, Y = 955;
// an isometric wire cube centred on (x, y); open 0..1 swings its top flaps open
function cube(c, x, y, s, open = 0) { const a = 80 * s, b = 46 * s, h = 92 * s; const top = [[x, y - h / 2 - b], [x + a, y - h / 2], [x, y - h / 2 + b], [x - a, y - h / 2]];
  P(c, [[x - a, y - h / 2], [x - a, y + h / 2], [x, y + h / 2 + b], [x + a, y + h / 2], [x + a, y - h / 2]]); P(c, [[x, y - h / 2 + b], [x, y + h / 2 + b]]);
  if (open <= 0) P(c, top, true); else { P(c, [top[3], top[2], top[1]]); const o = open * 1.9; for (const [p0, p1, d] of [[top[3], top[2], -1], [top[2], top[1], 1]]) { const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; P(c, [p0, [p0[0] + d * Math.sin(o) * 10 * s, p0[1] - Math.sin(o) * 70 * s], [p1[0] + d * Math.sin(o) * 10 * s, p1[1] - Math.sin(o) * 70 * s], p1]); } } }
function globe(c, x, y, r, rot) { circle(c, x, y, r); for (let k = -2; k <= 2; k++) { const yy = y + k * r * .38, w = Math.sqrt(1 - Math.pow(k * .38, 2)) * r; c.beginPath(); c.ellipse(x, yy, w, w * .12, 0, 0, 7); c.stroke(); } for (let k = 0; k < 4; k++) { const ph = ((rot + k / 4) % 1) * Math.PI; const w = Math.cos(ph) * r; c.beginPath(); c.ellipse(x, y, Math.abs(w), r, 0, 0, 7); c.stroke(); } }
function cloud(c, x, y, s) { c.beginPath(); c.moveTo(x - 120 * s, y + 30 * s); c.bezierCurveTo(x - 170 * s, y + 30 * s, x - 170 * s, y - 40 * s, x - 110 * s, y - 40 * s); c.bezierCurveTo(x - 100 * s, y - 100 * s, x - 20 * s, y - 100 * s, x, y - 60 * s); c.bezierCurveTo(x + 30 * s, y - 110 * s, x + 120 * s, y - 90 * s, x + 110 * s, y - 30 * s); c.bezierCurveTo(x + 170 * s, y - 30 * s, x + 170 * s, y + 30 * s, x + 120 * s, y + 30 * s); c.closePath(); }
function shirt(c, x, y, s) { P(c, [[x - 20 * s, y - 40 * s], [x - 50 * s, y - 28 * s], [x - 64 * s, y], [x - 44 * s, y + 8 * s], [x - 38 * s, y - 6 * s], [x - 38 * s, y + 46 * s], [x + 38 * s, y + 46 * s], [x + 38 * s, y - 6 * s], [x + 44 * s, y + 8 * s], [x + 64 * s, y], [x + 50 * s, y - 28 * s], [x + 20 * s, y - 40 * s], [x, y - 26 * s], [x - 20 * s, y - 40 * s]]); }
function card(c, x, y, s) { c.beginPath(); c.roundRect(x - 120 * s, y - 72 * s, 240 * s, 144 * s, 16 * s); c.stroke(); P(c, [[x - 120 * s, y - 30 * s], [x + 120 * s, y - 30 * s]]); P(c, [[x - 120 * s, y - 14 * s], [x + 120 * s, y - 14 * s]]); }
function strong(c, x, y, s, flex) { const up = flex; circle(c, x, y - 70 * s, 34 * s);   // a torso with both arms raised and flexed
  P(c, [[x - 60 * s, y - 20 * s], [x - 52 * s, y + 80 * s], [x + 52 * s, y + 80 * s], [x + 60 * s, y - 20 * s]]);
  for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 60 * s, y - 20 * s); c.quadraticCurveTo(x + d * 130 * s, y - 10 * s, x + d * 120 * s, y - 60 * s - 30 * s * up); c.quadraticCurveTo(x + d * 110 * s, y - 110 * s - 20 * s * up, x + d * 80 * s, y - 100 * s - 10 * s * up); c.stroke(); c.beginPath(); c.arc(x + d * 108 * s, y - 50 * s - 20 * s * up, 22 * s * (1 + .3 * up), 0, 7); c.stroke(); } }
function lipstick(c, x, y, s) { c.beginPath(); c.roundRect(x - 26 * s, y - 20 * s, 52 * s, 100 * s, 6 * s); c.stroke(); c.beginPath(); c.roundRect(x - 20 * s, y - 70 * s, 40 * s, 50 * s, 4 * s); c.stroke(); P(c, [[x - 14 * s, y - 70 * s], [x - 14 * s, y - 120 * s], [x + 14 * s, y - 140 * s], [x + 14 * s, y - 70 * s]]); }
function starP(c, x, y, r) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.stroke(); }
function heartP(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.3, y, x - r * .8, y - r, x, y - r * .35); c.bezierCurveTo(x + r * .8, y - r, x + r * 1.3, y, x, y + r * .9); c.stroke(); }
function people(c, x, y, s) { for (const [dx, dy, k] of [[-58, 10, .9], [58, 10, .9], [0, -6, 1]]) { const px = x + dx * s, py = y + dy * s, q = k * s; circle(c, px, py - 34 * q, 22 * q); c.beginPath(); c.arc(px, py + 34 * q, 44 * q, Math.PI, 0); c.stroke(); } }
function coin(c, x, y, r, rot) { const w = Math.abs(Math.cos(rot)) * r + 2; c.beginPath(); c.ellipse(x, y, w, r, 0, 0, 7); c.stroke(); if (w > r * .5) txt(c, 'Ft', x, y + 2, r * .8, { font: 'Inter', weight: 600, glow: 8 }); }
const scenes = []; const sc = (t0, f) => scenes.push([t0, f]);
// A: this is why your marketing doesn't work: four comet arcs of dots spin; a wire globe; it swells as "people" come
sc(0, (c, t) => { const g = ss(seg(t, T(5) - .3, T(5) + .2)), sw = E(t, T(9), .4, .4);
  if (g < 1) for (let k = 0; k < 4; k++) for (let j = 0; j < 7; j++) { const a = k * Math.PI / 2 + t * 2.2 - j * .1, r = lerp(90, 230, ss(seg(t, 0, 1.2))) * (1 - g); glowDot(c, X + Math.cos(a) * r, Y + Math.sin(a) * r, 9 - j, (1 - j / 8) * (1 - g)); }
  if (g > 0) neon(c, () => globe(c, X, Y, 200 * g * (1 + .2 * Math.min(1.1, sw)), t * .15), { w: 4, glow: 26 + 20 * Math.min(1, sw) }); });
// B: people don't want your product: a wire cube; its flaps open on a glowing core; then it shuts
sc(T(10) - .2, (c, t) => { const a = E(t, T(10) - .1, .4, .35), op = ss(seg(t, T(12) - .1, T(12) + .4)) * (1 - ss(seg(t, T(13), T(13) + .4)));
  if (op > 0) glowDot(c, X, Y - 40, 46 * op, op); neon(c, () => cube(c, X, Y, 2.0 * Math.min(1.05, a), op), { w: 4.5 }); });
// C: but a better version of themselves, which they picture after buying: a dot rises out of the box; ripples; a cloud with a new shirt fills in
sc(T(14) - .2, (c, t) => { const box = 1 - ss(seg(t, T(16), T(16) + .4)), rise = ease3(seg(t, T(14), T(16) + .2)), cl = ss(seg(t, T(21) - .2, T(21) + .5)), fill = ss(seg(t, T(22), T(22) + .5));
  if (box > 0) neon(c, () => cube(c, X, Y + 160, 1.6, 1), { w: 4, alpha: box });
  const dy = lerp(Y + 120, Y - 40, rise); if (cl < 1) { glowDot(c, X, dy, 26, 1 - cl); const rp = seg(t, T(17), T(17) + 1.2); if (rp > 0 && rp < 1) neon(c, () => { for (let k = 0; k < 3; k++) { const u = clamp(rp * 1.5 - k * .2); if (u > 0 && u < 1) { c.globalAlpha = 1 - u; c.beginPath(); c.arc(X, dy, 40 + u * 90, Math.PI * .6, Math.PI * 1.4); c.stroke(); } } }, { w: 4 }); }
  if (cl > 0) { if (fill > 0) { c.save(); c.globalAlpha = .35 * fill; cloud(c, X, Y, 1.6 * cl); c.fillStyle = WHITE; c.fill(); c.restore(); } neon(c, () => { cloud(c, X, Y, 1.6 * cl); c.stroke(); shirt(c, X, Y - 10, 1.0 * cl); }, { w: 4.5 }); } });
// D: they don't buy the gym membership; they buy who they become: a dot over a membership card; it fades; a strong figure flexes in light
sc(T(23) - .2, (c, t) => { const cd = E(t, T(25), .35, .45) * (1 - ss(seg(t, T(29), T(29) + .4))), st = E(t, T(31) - .1, .4, .4), out = ss(seg(t, T(35) + .1, T(35) + .4));
  glowDot(c, X, Y - 190, 18, 1 - st * .9); if (cd > 0) neon(c, () => card(c, X, Y + 40, 1.6 * Math.min(1.05, cd)), { w: 4.5 });
  if (st > 0) neon(c, () => strong(c, X, Y + 30, 1.7 * Math.min(1.05, st), .5 + .5 * Math.sin(t * 5)), { w: 5, glow: 34, alpha: 1 - out }); if (out > 0) glowDot(c, X, Y, 22, out); });
// E: they don't buy the lipstick; they buy the confidence and the compliments: a lipstick; stars stack up; hearts burst
sc(T(36) - .2, (c, t) => { const lp = E(t, T(38) - .1, .4, .4), out = ss(seg(t, T(43) - .2, T(43) + .3));
  neon(c, () => lipstick(c, X - 150, Y + 40, 1.6 * Math.min(1.05, lp)), { w: 4.5, alpha: 1 - out }); glowDot(c, X + lerp(140, 140, 0), Y + 80, 18, 1);
  for (let k = 0; k < 3; k++) { const a = E(t, T(43) + k * .2, .3, .5); if (a > 0) neon(c, () => starP(c, X - 120, Y - 150 + k * 140, 52 * Math.min(1.1, a)), { w: 4.5 }); }
  const hb = seg(t, T(46) - .1, T(46) + 1.4); if (hb > 0) for (let k = 0; k < 16; k++) { const a = hash(k) * Math.PI * 2, d = ease3(clamp(hb * 1.4 - hash(k + 4) * .3)) * (120 + hash(k + 2) * 260); if (d <= 0) continue; neon(c, () => heartP(c, X + 140 + Math.cos(a) * d * .9, Y + 80 + Math.sin(a) * d * .8, 16 + hash(k + 7) * 14), { w: 3, alpha: 1 - ss(seg(hb, .7, 1)) }); } });
// F: stop listing the benefits; show them what life after can be: a checklist; a lens glides over it; it fades; a dot draws a winding road into the future
sc(T(50) - .2, (c, t) => { const lst = E(t, T(52) - .1, .4, .4) * (1 - ss(seg(t, T(55) - .1, T(55) + .3))), lens = seg(t, T(52), T(55) - .1), road = seg(t, T(57), T(65) + .2);
  if (lst > 0) { neon(c, () => { for (let k = 0; k < 4; k++) { const y = Y - 170 + k * 110, w = 300 * clamp(lst * 1.3 - k * .1); c.strokeRect(X - 230, y - 26, 52, 52); P(c, [[X - 150, y], [X - 150 + w, y]]); } }, { w: 4, alpha: Math.min(1, lst) });
    if (lens > 0 && lens < 1) { const ly = Y - 170 + 330 * ease3(lens), lx = X - 120 + 90 * Math.sin(lens * 5); neon(c, () => circle(c, lx, ly, 100), { w: 3, glow: 30 }); } }
  const pts = []; for (let k = 0; k <= 60; k++) { const u = k / 60; pts.push([X - 40 + 160 * Math.sin(u * 5.5) * u + 120 * u, Y - 300 + u * 640]); }
  glowDot(c, pts[0][0], pts[0][1], 20, 1);
  if (road > 0) { const n = Math.max(1, Math.floor(road * 60)); c.save(); c.setLineDash([34, 30]); neon(c, () => P(c, pts.slice(0, n + 1)), { w: 15, glow: 24 }); c.restore(); } });
// G: the strongest marketing isn't about your brand, but the change your customer longs for: a dot; an arc sweeps; a small box; three people rise over it, glowing
sc(T(66) - .2, (c, t) => { const arc = seg(t, T(67), T(69) + .3), bx = E(t, T(71) - .1, .4, .4), pp = E(t, T(76) - .1, .4, .45), gl = ss(seg(t, T(80) - .2, T(80) + .3));
  if (bx <= 0) { glowDot(c, X + 30, Y - 60, 16, 1); if (arc > 0) neon(c, () => { c.beginPath(); c.arc(X, Y, 180, Math.PI * .2, Math.PI * .2 + Math.PI * .9 * ease3(arc)); c.stroke(); }, { w: 5 }); }
  if (bx > 0) neon(c, () => cube(c, X, Y + 140 - 60 * (1 - Math.min(1, pp)), lerp(.8, 1.3, ss(seg(t, T(73), T(73) + .5))) * Math.min(1.05, bx), 0), { w: 4.5 });
  if (pp > 0) neon(c, () => people(c, X, Y - 120, 1.7 * Math.min(1.08, pp)), { w: 4.5, glow: 22 + 22 * gl }); });
// H: sell the "after", not the product itself: coins spin in beside the box; then the box dissolves into question marks
sc(T(81) - .2, (c, t) => { const cn = E(t, T(82), .4, .45), gone = ss(seg(t, T(86), T(88) + .3));
  for (let k = 0; k < 3; k++) { const a = E(t, T(82) + k * .15, .4, .45); if (a > 0) neon(c, () => coin(c, X - 230 + [0, 140, 60][k], Y - 140 + [0, 40, 160][k], 60 * Math.min(1.05, a), .35 * Math.sin(t * 2.5 + k)), { w: 4 }); }
  neon(c, () => cube(c, X + 160, Y + 60, 1.3 * (1 - gone)), { w: 4.5, alpha: 1 - gone });
  if (gone > 0) for (let k = 0; k < 3; k++) txt(c, '?', X + 130 + k * 40, Y + 40 - 40 * gone - (k % 2) * 30, 70 * gone, { font: 'Inter', weight: 400, glow: 14 }); });
start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 } });
