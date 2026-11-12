// M13 A vásárló a főszereplő (the customer is the hero): a 23 Team neon motion reel after reference video 13, beat by beat on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 30.5, DUR = 33.0, X = 540, Y = 955;
function box(c, x, y, s) { c.strokeRect(x - 110 * s, y - 70 * s, 220 * s, 140 * s); c.strokeRect(x - 40 * s, y - 70 * s, 80 * s, 50 * s); }
function bulb(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-26, 50); c.quadraticCurveTo(-26, 20, -50, -5); c.arc(0, -25, 56, Math.PI * .87, Math.PI * 2.13); c.quadraticCurveTo(26, 20, 26, 50); c.closePath(); c.stroke(); P(c, [[-22, 64], [22, 64]]); c.restore(); }
function target(c, x, y, r) { for (let k = 0; k < 4; k++) circle(c, x, y, r * (1 - k * .24)); }
function hero(c, x, y, s, cape) { circle(c, x, y - 60 * s, 22 * s); P(c, [[x, y - 38 * s], [x, y + 20 * s]]); P(c, [[x - 30 * s, y - 20 * s], [x, y - 30 * s], [x + 30 * s, y - 40 * s]]); P(c, [[x, y + 20 * s], [x - 22 * s, y + 70 * s]]); P(c, [[x, y + 20 * s], [x + 22 * s, y + 70 * s]]); if (cape > 0) { c.beginPath(); c.moveTo(x - 4 * s, y - 34 * s); c.quadraticCurveTo(x - 50 * s * cape, y + 10 * s, x - 70 * s * cape, y + 50 * s + 10 * s * Math.sin(NOWT * 6)); c.lineTo(x - 10 * s, y + 10 * s); c.closePath(); c.stroke(); } }
let NOWT = 0;
const scenes = []; const sc = (t0, f) => scenes.push([t0, f]);
// A: your customers don't care about you: one ring; more rings drift in, then all drift apart and away
sc(0, (c, t) => { const a = E(t, .05, .4, .45), many = seg(t, .5, T(2)), away = ease3(seg(t, T(3) + .3, T(5) + .1));
  neon(c, () => circle(c, X, Y - 80, 40 * Math.min(1.05, a)), { w: 4.5, alpha: 1 - away });
  for (let k = 0; k < 6; k++) { const u = clamp(many * 2 - k * .2); if (u <= 0) continue; const ang = k * 1.05 + .4, d0 = 90 + hash(k) * 120, d = d0 + away * 600; neon(c, () => circle(c, X + Math.cos(ang) * d, Y + Math.sin(ang) * d * .7, (24 + hash(k + 3) * 14) * Math.min(1.05, u)), { w: 4, alpha: 1 - away }); } });
// B: they don't care about your product or your brand: a box drops in; a ribbon sweeps past and carries a tag away
sc(T(5) - .2, (c, t) => { const bx = E(t, T(5) - .05, .4, .45), rib = seg(t, T(12) - .2, T(15) + .6);
  const by = lerp(Y - 300, Y, Math.min(1, bx)); neon(c, () => box(c, X, by, 1.5 * Math.min(1.05, bx)), { w: 4.5 });
  if (rib > 0) { c.save(); c.globalAlpha = Math.sin(rib * Math.PI); c.strokeStyle = 'rgba(235,242,255,.6)'; c.lineWidth = 20; c.lineCap = 'round'; c.beginPath(); for (let k = 0; k <= 30; k++) { const u = k / 30, x = lerp(-200, 1280, u) + (rib - .5) * 600, y = Y - 60 + 120 * Math.sin(u * 4 + rib * 3); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); }
  if (t > T(15) - .3) { const u = ease3(seg(t, T(15) - .3, T(15) + .9)); neon(c, () => { c.save(); c.translate(X + 120 + 600 * u, Y - 90 - 200 * u); c.rotate(u * 3); c.strokeRect(-26, -18, 52, 36); c.restore(); }, { w: 3.5, alpha: 1 - u }); } });
// C: one thing interests them: themselves: a single ring; others gather round it in a hexagon, all facing in
sc(T(16) - .2, (c, t) => { const one = E(t, T(16), .4, .45), ring = seg(t, T(18) - .2, T(21) + .3);
  neon(c, () => circle(c, X, Y, 46 * Math.min(1.05, one)), { w: 5, glow: 30 });
  for (let k = 0; k < 6; k++) { const u = E(t, T(18) + k * .18, .4, .45); if (u <= 0) continue; const a = -Math.PI / 2 + k * Math.PI / 3, r = 220; neon(c, () => circle(c, X + Math.cos(a) * r, Y + Math.sin(a) * r, 36 * Math.min(1.05, u)), { w: 4 }); } });
// D: if you want to sell more, show it's all about them, and how your product changes their life: the ring circle turns to coins; a big lens ring sweeps to one; then an arc wraps round it into a full ring
sc(T(22) - .2, (c, t) => { const coins = ss(seg(t, T(23) - .1, T(25) + .2)), lens = seg(t, T(26), T(31) + .3), out = ss(seg(t, T(32) - .2, T(32) + .2)), arc = seg(t, T(34), T(39) + .2);
  if (out < 1) { c.save(); c.globalAlpha = 1 - out; neon(c, () => circle(c, X, Y, 46), { w: 5 }); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + k * Math.PI / 3, x = X + Math.cos(a) * 220, y = Y + Math.sin(a) * 220, cn = clamp(coins * 2 - (k % 2) * .5); neon(c, () => circle(c, x, y, 36), { w: 4 }); if (cn > 0 && k % 2 === 0) { glowDot(c, x, y, 30, .3 * cn); txt(c, 'Ft', x, y + 2, 26 * cn, { font: 'Inter', weight: 700, glow: 10 }); } }
    if (lens > 0 && lens < 1) { const lx = lerp(X - 120, X + 120, ease3(lens)), r = 300; c.save(); c.globalAlpha = Math.sin(lens * Math.PI); const g = c.createRadialGradient(lx, Y, r * .8, lx, Y, r * 1.2); g.addColorStop(0, 'rgba(235,242,255,0)'); g.addColorStop(.5, 'rgba(235,242,255,.5)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.fillRect(0, Y - 500, 1080, 1000); c.restore(); neon(c, () => circle(c, lx, Y, r), { w: 8, glow: 40, alpha: Math.sin(lens * Math.PI) }); } c.restore(); }
  if (out > 0) { neon(c, () => circle(c, X, Y, 46), { w: 5, alpha: out }); if (arc > 0) { const a = -Math.PI / 2 + Math.PI * 2 * ease3(arc); neon(c, () => { c.beginPath(); c.arc(X, Y, 190, -Math.PI / 2, a); c.stroke(); }, { w: 6, glow: 30 }); if (arc < 1) glowDot(c, X + Math.cos(a) * 190, Y + Math.sin(a) * 190, 14, 1); } } });
// E: help them solve problems, reach goals, or just feel great: a bulb lights in the ring; a target with an arrow thudding in; a burst of sparks round a glowing core
sc(T(40) - .2, (c, t) => { const bl = E(t, T(42) - .2, .45, .4) * (1 - ss(seg(t, T(45) - .3, T(45)))), tg = E(t, T(45) - .1, .45, .4) * (1 - ss(seg(t, T(48) - .2, T(48) + .1))), arrow = ease3(seg(t, T(47) - .2, T(47) + .2)), burst = seg(t, T(50) - .2, T(52) + .6);
  if (bl > 0) { neon(c, () => { circle(c, X, Y, 190 * Math.min(1.05, bl) * (1 - .3 * ss(seg(t, T(42), T(43))))); bulb(c, X, Y + 10, 1.5 * Math.min(1.05, bl)); }, { w: 5, glow: 30 }); if (t > T(44)) glowDot(c, X, Y - 15, 40, .5 * ss(seg(t, T(44), T(44) + .3)) * bl); }
  if (tg > 0) { neon(c, () => target(c, X, Y, 170 * Math.min(1.05, tg)), { w: 6, glow: 30 }); if (arrow > 0) neon(c, () => { const ax = lerp(X + 400, X, arrow), ay = lerp(Y - 400, Y, arrow); P(c, [[ax, ay], [ax + 140, ay - 140]]); P(c, [[ax + 140, ay - 140], [ax + 110, ay - 150]]); P(c, [[ax + 140, ay - 140], [ax + 150, ay - 110]]); }, { w: 6 }); }
  if (burst > 0) { neon(c, () => circle(c, X, Y, 46), { w: 5, glow: 30 }); for (let k = 0; k < 200; k++) { const a = hash(k) * Math.PI * 2, d = ease3(burst) * (60 + hash(k + 9) * 520); glowDot(c, X + Math.cos(a) * d, Y + Math.sin(a) * d, 1.5 + hash(k + 3) * 3, Math.max(0, 1 - burst) * .9); } } });
// F: make your audience the hero of their own story and your brand becomes the place they want to be: a figure walks into a spotlight, a cape forms; a big frame; it settles into a little house
sc(T(53) - .2, (c, t) => { NOWT = t; const walk = ease3(seg(t, T(54), T(56) + .3)), spot = ss(seg(t, T(59) - .2, T(60) + .2)), cape = ss(seg(t, T(60), T(60) + .6)), fr = E(t, T(62) - .1, .45, .35), small = ease3(seg(t, T(65) - .1, T(67) + .4));
  if (fr <= 0) { if (spot > 0) { c.save(); c.globalAlpha = spot; const g = c.createLinearGradient(0, Y - 420, 0, Y + 150); g.addColorStop(0, 'rgba(235,242,255,.9)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, Y - 420); c.lineTo(X + 200, Y + 150); c.lineTo(X - 200, Y + 150); c.closePath(); c.fill(); c.restore(); }
    neon(c, () => hero(c, lerp(X - 300, X, walk), Y + 40, 2.0, cape), { w: 5 }); }
  else neon(c, () => { const s = lerp(1.9, .9, small) * Math.min(1.05, fr); box(c, X, Y, s); }, { w: lerp(8, 5, small), glow: 34 }); });
start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 } });
