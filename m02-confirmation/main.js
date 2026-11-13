// M02 Megerősítés (confirmation), concrete version (user 2026-11-13): every sentence gets a clear picture of what it says, so the idea reads without Hungarian.
// Locked M01 template: one continuous take, glowing lines, bloom, safe zone (0.92), every motion written out as a sound cue.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, scramble, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID, GOLD, K } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 38.8, DUR = 42.9, X = 540, Y = 1160;   // DUR: the end card holds the spoken call to action (line 1)
const u = (t, a, b) => ss(seg(t, a, b)), ue = (t, a, b) => ease3(seg(t, a, b));
const off = document.createElement('canvas'); off.width = innerWidth; off.height = innerHeight; const oc = off.getContext('2d');
// —— shapes ——
function coin(c, x, y, r) { neon(c, () => circle(c, x, y, r), { w: r * .12, glow: 26 }); txt(c, 'Ft', x, y + r * .06, r * .78, { font: 'Inter', weight: 800, glow: 14 }); }
function selBox(c, x, y, w, h, a) { c.save(); c.setLineDash([12, 10]); neon(c, () => c.strokeRect(x - w / 2, y - h / 2, w, h), { w: 4, alpha: a }); c.restore(); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.save(); c.globalAlpha = a; c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 20; c.fillRect(x + dx * w / 2 - 14, y + dy * h / 2 - 14, 28, 28); c.restore(); } }
function cursor(c, x, y, a = 1, s = 1.4) { c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s); c.fillStyle = WHITE; c.strokeStyle = MID; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 56); c.lineTo(14, 43); c.lineTo(25, 66); c.lineTo(34, 62); c.lineTo(23, 39); c.lineTo(41, 39); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function gear(c, x, y, r, rot) { c.beginPath(); for (let k = 0; k <= 64; k++) { const a = k / 64 * Math.PI * 2 + rot, rr = (Math.floor(k / 4) % 2) ? r : r * 1.17; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.stroke(); circle(c, x, y, r * .74); circle(c, x, y - r * .18, r * .2); c.beginPath(); c.arc(x, y + r * .42, r * .38, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
function orb(c, x, y, r, a = 1) { if (r <= 0 || a <= 0) return; c.save(); c.globalAlpha *= a; const halo = c.createRadialGradient(x, y, r * .9, x, y, r * 2); halo.addColorStop(0, 'rgba(220,230,255,.22)'); halo.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = halo; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  const g = c.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#e6ecfa'); g.addColorStop(.8, '#8f9bbd'); g.addColorStop(1, '#4b5680'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = r * .05; c.beginPath(); c.arc(x, y, r * .7, Math.PI * .15, Math.PI * .55); c.stroke(); c.restore(); }
const rcv = document.createElement('canvas'); rcv.width = innerWidth; rcv.height = innerHeight; const rc = rcv.getContext('2d');
function reflect(c, floor, a, f) {   // a mirror image under the floor, fading out with a soft alpha mask (no band edge)
  const tr = c.getTransform(); rc.setTransform(1, 0, 0, 1, 0, 0); rc.globalCompositeOperation = 'source-over'; rc.clearRect(0, 0, rcv.width, rcv.height); rc.setTransform(tr); rc.translate(0, floor * 2); rc.scale(1, -1);
  f(rc); rc.setTransform(tr); rc.globalCompositeOperation = 'destination-in'; const g = rc.createLinearGradient(0, floor, 0, floor + 380); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); rc.fillStyle = g; rc.fillRect(0, floor, 1080, 1920 - floor); rc.fillStyle = 'rgba(0,0,0,0)'; rc.clearRect(0, 0, 1080, floor);
  rc.globalCompositeOperation = 'source-over'; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha *= a; c.drawImage(rcv, 0, 0); c.restore(); }
function frame(c, x, y, s, inner) { neon(c, () => { c.beginPath(); c.roundRect(x - 120 * s, y - 100 * s, 240 * s, 200 * s, 18 * s); c.stroke(); c.beginPath(); c.roundRect(x - 104 * s, y - 84 * s, 208 * s, 168 * s, 12 * s); c.stroke(); }, { w: 6, glow: 34 }); inner && inner(); }
function wave(c, x, y, w, t, amp) { neon(c, () => { c.beginPath(); for (let k = 0; k <= 60; k++) { const xx = x - w / 2 + k * w / 60, env = Math.sin(k / 60 * Math.PI); c.lineTo(xx, y + Math.sin(k * .9 + t * 14) * amp * env * (.5 + .5 * Math.sin(k * .37 + t * 5))); } c.stroke(); }, { w: 4, glow: 24 }); }
function personFill(c, x, y, s, tie = 0) { c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 40; c.beginPath(); c.arc(x, y - 70 * s, 52 * s, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - 120 * s, y + 90 * s); c.quadraticCurveTo(x - 120 * s, y - 6 * s, x - 40 * s, y - 10 * s); c.lineTo(x + 40 * s, y - 10 * s); c.quadraticCurveTo(x + 120 * s, y - 6 * s, x + 120 * s, y + 90 * s); c.closePath(); c.fill(); c.shadowBlur = 0;
  if (tie > 0) { c.globalAlpha = tie; c.strokeStyle = MID; c.fillStyle = MID; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x - 40 * s, y - 10 * s); c.lineTo(x, y + 40 * s); c.lineTo(x + 40 * s, y - 10 * s); c.stroke(); c.beginPath(); c.moveTo(x - 9 * s, y + 4 * s); c.lineTo(x + 9 * s, y + 4 * s); c.lineTo(x + 13 * s, y + 70 * s); c.lineTo(x, y + 84 * s); c.lineTo(x - 13 * s, y + 70 * s); c.closePath(); c.fill(); } c.restore(); }
function starShape(c, x, y, r, n, inner) { c.beginPath(); for (let k = 0; k < n * 2; k++) { const a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
function brain(c, x, y, s) { c.beginPath(); c.moveTo(x - 70 * s, y + 20 * s); c.bezierCurveTo(x - 100 * s, y - 10 * s, x - 80 * s, y - 70 * s, x - 30 * s, y - 70 * s); c.bezierCurveTo(x - 10 * s, y - 95 * s, x + 50 * s, y - 90 * s, x + 60 * s, y - 55 * s); c.bezierCurveTo(x + 100 * s, y - 45 * s, x + 100 * s, y + 20 * s, x + 60 * s, y + 30 * s); c.bezierCurveTo(x + 40 * s, y + 55 * s, x - 40 * s, y + 55 * s, x - 70 * s, y + 20 * s); c.stroke();
  for (const [a, b, d] of [[-50, -40, 1], [0, -55, -1], [30, -10, 1], [-30, 5, -1]]) { c.beginPath(); c.arc(x + a * s, y + b * s, 18 * s, d > 0 ? 0 : Math.PI, d > 0 ? Math.PI : Math.PI * 2); c.stroke(); } P(c, [[x - 4 * s, y + 40 * s], [x - 10 * s, y + 80 * s]]); }
function face(c, x, y, r, mood) { circle(c, x, y, r); c.beginPath(); const m = clamp(mood, -1, 1); c.moveTo(x - r * .45, y + r * .25 - m * r * .05); c.quadraticCurveTo(x, y + r * .25 + m * r * .45, x + r * .45, y + r * .25 - m * r * .05); c.stroke(); circle(c, x - r * .32, y - r * .2, r * .08, true); circle(c, x + r * .32, y - r * .2, r * .08, true); }
// —— timing of every motion (also written out as sound cues, so each sound lands on its frame) ——
const back = x => { const c1 = 1.70158, c3 = c1 + 1; x = clamp(x); if (x <= 0) return 0; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bounce = x => { x = clamp(x); const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
// —— concrete pictures (user 2026-11-13: the images alone must tell the idea) ——
function lock(c, x, y, s, open) { c.beginPath(); c.roundRect(x - 60 * s, y - 40 * s, 120 * s, 100 * s, 14 * s); c.stroke(); c.beginPath(); c.arc(x, y - 40 * s - 38 * s * open, 40 * s, Math.PI, 0); c.lineTo(x + 40 * s, y - 40 * s - 38 * s * open + 10 * s); c.stroke(); P(c, [[x - 40 * s, y - 40 * s - 38 * s * open], [x - 40 * s, y - 40 * s]]); circle(c, x, y + 4 * s, 12 * s); P(c, [[x, y + 14 * s], [x, y + 34 * s]]); }
function keyS(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); circle(c, -90 * s, 0, 30 * s); circle(c, -90 * s, 0, 10 * s); P(c, [[-60 * s, 0], [80 * s, 0]]); P(c, [[40 * s, 0], [40 * s, 26 * s]]); P(c, [[64 * s, 0], [64 * s, 20 * s]]); c.restore(); }
function shop(c, x, y, s) { c.strokeRect(x - 110 * s, y - 60 * s, 220 * s, 160 * s); c.beginPath(); c.moveTo(x - 130 * s, y - 60 * s); for (let k = 0; k <= 6; k++) { const xx = x - 130 * s + k * 260 * s / 6; c.lineTo(xx, y - 120 * s); c.lineTo(xx, y - 60 * s + (k < 6 ? 22 * s : 0)); c.quadraticCurveTo(xx + 260 * s / 12, y - 40 * s, xx + 260 * s / 6, y - 60 * s); } c.stroke(); P(c, [[x - 130 * s, y - 120 * s], [x + 130 * s, y - 120 * s]]); c.strokeRect(x - 30 * s, y + 10 * s, 60 * s, 90 * s); c.strokeRect(x - 95 * s, y + 5 * s, 45 * s, 40 * s); c.strokeRect(x + 50 * s, y + 5 * s, 45 * s, 40 * s); }
function house(c, x, y, s) { P(c, [[x - 140 * s, y - 20 * s], [x, y - 140 * s], [x + 140 * s, y - 20 * s]]); c.strokeRect(x - 105 * s, y - 40 * s, 210 * s, 140 * s); c.strokeRect(x - 25 * s, y + 20 * s, 50 * s, 80 * s); c.strokeRect(x + 45 * s, y - 10 * s, 40 * s, 40 * s); c.strokeRect(x - 85 * s, y - 10 * s, 40 * s, 40 * s); P(c, [[x + 60 * s, y - 90 * s], [x + 60 * s, y - 130 * s], [x + 90 * s, y - 130 * s], [x + 90 * s, y - 64 * s]]); }
function handshake(c, x, y, s, k = 1) {   // two people, a glowing pair of linked rings between them (connection, trust)
  for (const d of [-1, 1]) { const px = x + d * lerp(330, 230, k) * s; circle(c, px, y - 60 * s, 46 * s); c.beginPath(); c.arc(px, y + 70 * s, 90 * s, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
  const g = 1 - k; c.beginPath(); c.ellipse(x - 40 * s - 60 * s * g, y, 70 * s, 46 * s, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(x + 40 * s + 60 * s * g, y, 70 * s, 46 * s, 0, 0, 7); c.stroke(); }
function head(c, x, y, s) { c.beginPath(); c.moveTo(x + 60 * s, y + 230 * s); c.bezierCurveTo(x + 70 * s, y + 140 * s, x + 150 * s, y + 120 * s, x + 150 * s, y + 20 * s); c.lineTo(x + 175 * s, y - 10 * s); c.lineTo(x + 150 * s, y - 40 * s); c.bezierCurveTo(x + 160 * s, y - 180 * s, x + 40 * s, y - 250 * s, x - 60 * s, y - 230 * s); c.bezierCurveTo(x - 180 * s, y - 210 * s, x - 220 * s, y - 60 * s, x - 150 * s, y + 40 * s); c.bezierCurveTo(x - 110 * s, y + 100 * s, x - 110 * s, y + 160 * s, x - 120 * s, y + 230 * s); c.stroke(); }
function starPath(c, x, y, r) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
function starFill(c, x, y, r, a = 1) { if (a <= 0 || r <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = '#ffd889'; c.shadowColor = 'rgba(255,216,137,1)'; c.shadowBlur = 40; starPath(c, x, y, r); c.fill(); c.restore(); }
function card(c, x, y, s) { c.beginPath(); c.roundRect(x - 130 * s, y - 90 * s, 260 * s, 180 * s, 20 * s); c.stroke(); P(c, [[x - 90 * s, y + 90 * s], [x - 120 * s, y + 130 * s], [x - 50 * s, y + 90 * s]]); for (let k = 0; k < 3; k++) P(c, [[x - 10 * s, y - 40 * s + k * 34 * s], [x + (100 - k * 30) * s, y - 40 * s + k * 34 * s]]); }
function checkDraw(c, x, y, r, u) { if (u <= 0) return; const p = [[x - r, y], [x - r * .3, y + r * .7], [x + r, y - r * .8]]; const L1 = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), L2 = Math.hypot(p[2][0] - p[1][0], p[2][1] - p[1][1]), d = u * (L1 + L2);
  c.beginPath(); c.moveTo(...p[0]); if (d <= L1) c.lineTo(lerp(p[0][0], p[1][0], d / L1), lerp(p[0][1], p[1][1], d / L1)); else { c.lineTo(...p[1]); c.lineTo(lerp(p[1][0], p[2][0], (d - L1) / L2), lerp(p[1][1], p[2][1], (d - L1) / L2)); } c.stroke(); }
function heartPath(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.3, y, x - r * .8, y - r, x, y - r * .35); c.bezierCurveTo(x + r * .8, y - r, x + r * 1.3, y, x, y + r * .9); c.closePath(); }
function bottle(c, x, y, s) { c.beginPath(); c.roundRect(x - 70 * s, y - 120 * s, 140 * s, 240 * s, 24 * s); c.stroke(); c.strokeRect(x - 30 * s, y - 170 * s, 60 * s, 50 * s); c.beginPath(); c.roundRect(x - 34 * s, y - 196 * s, 68 * s, 26 * s, 6 * s); c.stroke(); leaf(c, x, y + 30 * s, s * .7, 0); }
function leaf(c, x, y, s, a) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, 60 * s); c.quadraticCurveTo(-70 * s, 0, 0, -80 * s); c.quadraticCurveTo(70 * s, 0, 0, 60 * s); c.stroke(); P(c, [[0, 60 * s], [0, -60 * s]]); c.restore(); }
function globeS(c, x, y, r, heal) { c.save(); c.globalAlpha *= lerp(.45, 1, heal); circle(c, x, y, r); c.beginPath(); c.ellipse(x, y, r, r * .35, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(x, y, r * .4, r, 0, 0, 7); c.stroke(); c.restore();
  if (heal > 0) { c.save(); c.globalAlpha *= heal * .5; c.fillStyle = '#5fb89a'; for (const [dx, dy, w, h] of [[-.4, -.3, .35, .25], [.25, .1, .4, .3], [-.2, .45, .3, .2]]) { c.beginPath(); c.ellipse(x + dx * r, y + dy * r, w * r, h * r, .3, 0, 7); c.fill(); } c.restore(); } }
function person(c, x, y, s, arm = 0) { circle(c, x, y - 300 * s, 50 * s); P(c, [[x, y - 250 * s], [x, y - 90 * s]]); P(c, [[x, y - 90 * s], [x - 55 * s, y]]); P(c, [[x, y - 90 * s], [x + 55 * s, y]]); P(c, [[x, y - 220 * s], [x - 80 * s, y - 130 * s]]); P(c, [[x, y - 220 * s], [x + lerp(80, 110, arm) * s, y - lerp(130, 250, arm) * s]]); }
function diamond(c, x, y, r) { P(c, [[x - r, y - r * .3], [x - r * .5, y - r * .8], [x + r * .5, y - r * .8], [x + r, y - r * .3], [x, y + r], [x - r, y - r * .3]]); P(c, [[x - r, y - r * .3], [x + r, y - r * .3]]); P(c, [[x - r * .5, y - r * .8], [x - r * .2, y - r * .3], [x, y + r]]); P(c, [[x + r * .5, y - r * .8], [x + r * .2, y - r * .3], [x, y + r]]); }
function rosette(c, x, y, r) { c.save(); c.fillStyle = GOLD; c.shadowColor = 'rgba(236,189,74,1)'; c.shadowBlur = 30; c.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, rr = k % 2 ? r : r * .86; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * r * .3, y + r * .6); c.lineTo(x + d * r * .6, y + r * 1.7); c.lineTo(x + d * r * .3, y + r * 1.45); c.lineTo(x + d * r * .05, y + r * 1.7); c.closePath(); c.fill(); } c.shadowBlur = 0; c.strokeStyle = MID; c.lineWidth = r * .14; checkDraw(c, x, y, r * .45, 1); c.restore(); }
function shield(c, x, y, s) { c.beginPath(); c.moveTo(x, y - 170 * s); c.quadraticCurveTo(x + 90 * s, y - 120 * s, x + 150 * s, y - 130 * s); c.quadraticCurveTo(x + 160 * s, y + 70 * s, x, y + 180 * s); c.quadraticCurveTo(x - 160 * s, y + 70 * s, x - 150 * s, y - 130 * s); c.quadraticCurveTo(x - 90 * s, y - 120 * s, x, y - 170 * s); c.closePath(); }
function flag(c, x, y, s, rise) { P(c, [[x, y], [x, y - 360 * s]]); const fy = y - lerp(60, 340, rise) * s; c.beginPath(); c.moveTo(x, fy); c.quadraticCurveTo(x + 80 * s, fy - 20 * s + 10 * Math.sin(NOWT * 4), x + 160 * s, fy + 10 * s); c.lineTo(x + 160 * s, fy + 110 * s); c.quadraticCurveTo(x + 80 * s, fy + 80 * s, x, fy + 100 * s); c.closePath(); c.stroke(); return [x + 80 * s, fy + 52 * s]; }
let NOWT = 0;
const M = {
  brain: [0, 1.3], lockOn: [T(5) - .2, T(5) + .3], keyIn: [T(7) - .3, T(8) - .1], turn: [T(8) - .1, T(8) + .3], burst: [T(8) + .2, T(8) + 1.0],
  split: [T(9) - .3, T(10) + .2], shop: [T(11) - .3, T(11) + .4], house: [T(14) - .3, T(14) + .4], links: [T(17) - .3, T(17) + .5], shake: [T(18) - .1, T(20) + .2],
  headIn: [T(22) - .3, T(23)], starIn: [T(23), T(24)], cardIn: [T(27) - .4, T(28) + .2], snap: [T(29) - .2, T(29) + .3], check: [T(30), T(31) + .3], heart: [T(35) - .2, T(35) + .4],
  bottle: [T(38) - .3, T(38) + .3], take: [T(41) - .3, T(44)], flow: [T(46) - .2, T(48)], heal: [T(48), T(49) + .6],
  gem: [T(51) - .3, T(51) + .4], badge: [T(53) - .1, T(56) + .1], proud: [T(57), T(58) + .4],
  mirror: [T(59) - .3, T(60)], echo: [T(60), T(62) + .3], shield: [T(63) - .2, T(64)], fill: [T(64), T(65) + .6],
  keyMorph: [T(66) - .3, T(69) + .2], flagL: [T(70) - .2, T(71) + .3], flagR: [T(72) - .2, T(73) + .3], walk: [T(76) - .3, T(78) - .1], join: [T(78) - .1, T(78) + .3],
  bigHeart: [T(79) - .2, T(80) + .3], glow: [T(82) - .2, T(83) + .5] };
const m = (t, k) => seg(t, M[k][0], M[k][1]);
const W8 = { w: 7, glow: 34 };
function scene(c, t) { NOWT = t;
  // 1. a little-known psychology trick: a brain draws in light; a padlock closes on it (little known); a key flies in and turns; the lock springs open and light pours out
  const sp = ease3(m(t, 'split'));
  if (sp < 1) { const bd = ease3(m(t, 'brain')), lk = back(m(t, 'lockOn')), ki = ease3(m(t, 'keyIn')), tu = ease3(m(t, 'turn')), bu = m(t, 'burst'); c.save(); c.globalAlpha = 1 - sp; c.translate(X, Y); c.scale(1 - sp * .6, 1 - sp * .6); c.translate(-X, -Y);
    c.save(); c.setLineDash([2400 * bd, 2400]); neon(c, () => brain(c, X, Y - 40, 3.4), W8); c.restore();
    if (lk > .01) neon(c, () => lock(c, X, Y + 30, 1.2 * lk, tu), { w: 8, glow: 36 });
    if (ki > 0 && bu < .6) neon(c, () => keyS(c, lerp(X + 520, X + 4, ki), Y + 34, 1.5, tu * Math.PI / 2), { w: 8, glow: 36, alpha: 1 - ss(seg(bu, .2, .6)) });
    if (bu > 0 && bu < 1) { glowDot(c, X, Y - 40, 90 * Math.sin(bu * Math.PI), 1); neon(c, () => { for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r0 = 160 + 120 * ease3(bu); P(c, [[X + Math.cos(a) * r0, Y - 40 + Math.sin(a) * r0], [X + Math.cos(a) * (r0 + 120 * Math.sin(bu * Math.PI)), Y - 40 + Math.sin(a) * (r0 + 120 * Math.sin(bu * Math.PI))]]); } }, { w: 6, glow: 30, alpha: 1 - bu }); }
    c.restore(); }
  // 2. use it in business and in private life, to build trust and deep connections: a shop on the left, a home on the right; lines of light run from both to the middle, where two hands meet and shake
  const hi = ease3(m(t, 'headIn'));
  if (sp > 0 && hi < 1) { const sh = back(m(t, 'shop')), ho = back(m(t, 'house')), ln = ease3(m(t, 'links')), hs = ease3(m(t, 'shake')); c.save(); c.globalAlpha = 1 - hi;
    if (sp < 1) { glowDot(c, lerp(X, X - 260, sp), Y - 160, 40 * (1 - sp), 1); glowDot(c, lerp(X, X + 260, sp), Y - 160, 40 * (1 - sp), 1); }
    if (sh > .01) neon(c, () => shop(c, X - 250, Y - 200, 1.05 * sh), W8); if (ho > .01) neon(c, () => house(c, X + 250, Y - 200, 1.05 * ho), W8);
    if (ln > 0) { c.save(); c.setLineDash([10, 14]); neon(c, () => { for (const d of [-1, 1]) { const x0 = X + d * 250, y0 = Y - 60; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0, Y + 140, lerp(x0, X + d * 60, ln), lerp(y0, Y + 180, ln)); c.stroke(); } }, { w: 4, glow: 24 }); c.restore(); }
    if (hs > 0) neon(c, () => handshake(c, X, Y + 260, 1.05 * Math.min(1, hs * 1.5), hs), W8);
    c.restore(); }
  // 3. people love information that confirms what they already believe: a head, a star (their belief) glowing inside it; a message card with the same star flies in, snaps in, the star flares; a check mark; a heart
  const bo = ease3(m(t, 'bottle'));
  if (hi > 0 && bo < 1) { const si = ease3(m(t, 'starIn')), ci = ease3(m(t, 'cardIn')), sn = ease3(m(t, 'snap')), ck = ease3(m(t, 'check')), ht = back(m(t, 'heart')), hx = lerp(X, X - 140, ci) - 700 * bo, hy = Y + 40; c.save(); c.globalAlpha = 1 - bo;
    neon(c, () => head(c, hx, hy, 1.5 * hi), W8); const sx = hx - 10, sy = hy - 110;
    starFill(c, sx, sy, 50 * si * (1 + .5 * Math.sin(sn * Math.PI)), si);
    if (ci > 0 && sn < 1) { const cx = lerp(X + 700, X + 270, ci), cy = Y - 260; const px = lerp(cx, sx, sn), py = lerp(cy, sy, sn), sc = 1.35 * (1 - sn * .8); neon(c, () => card(c, px + 40 * sc, py, sc), { w: 6, glow: 30, alpha: 1 - sn }); starFill(c, lerp(cx - 80, sx, sn), lerp(cy - 20, sy, sn), 34 * (1 - sn * .3), 1 - sn); }
    if (ck > 0) neon(c, () => checkDraw(c, X + 270, Y - 230, 90, ck), { w: 14, glow: 40 });
    if (ht > .01) { c.save(); c.fillStyle = '#c4566a'; c.shadowColor = 'rgba(232,87,122,.9)'; c.shadowBlur = 30; heartPath(c, X + 270, Y + 70, 100 * ht); c.fill(); c.restore(); } c.restore(); }
  // 4. eco products: tell customers they help protect the environment: a bottle with a leaf; a customer takes it; light flows from it into a grey globe, which turns bright and green
  const gm = ease3(m(t, 'gem'));
  if (bo > 0 && gm < 1) { const tk = ease3(m(t, 'take')), fl = m(t, 'flow'), he = ease3(m(t, 'heal')); c.save(); c.globalAlpha = 1 - gm;
    const bx = lerp(X, X - 130, tk), by = Y + 140 - 60 * tk; neon(c, () => bottle(c, bx, by, 1.1 * bo), W8);
    if (tk > 0) neon(c, () => person(c, X - 300, Y + 470, 1.35, tk), { w: 7, glow: 30, alpha: tk });
    const gx = X + 220, gy = Y - 200; if (fl > 0 || he > 0) { neon(c, () => globeS(c, gx, gy, 150, he), W8); if (fl > 0 && fl < 1) { c.save(); c.setLineDash([12, 14]); c.lineDashOffset = -t * 120; neon(c, () => { c.beginPath(); c.moveTo(bx + 60, by - 120); c.quadraticCurveTo(X + 120, Y + 80, lerp(bx + 60, gx - 60, ease3(fl)), lerp(by - 120, gy + 120, ease3(fl))); c.stroke(); }, { w: 5, glow: 30 }); c.restore(); }
      if (he > 0) neon(c, () => { leaf(c, gx - 170, gy + 60, .9 * he, -.6); leaf(c, gx + 170, gy + 40, .8 * he, .6); }, { w: 6, glow: 30 }); }
    c.restore(); }
  // 5. luxury: confirm their excellent taste: the globe becomes a diamond on a podium; a gold badge with a tick lands on the customer's chest; he stands proud
  const mr = ease3(m(t, 'mirror'));
  if (gm > 0 && mr < 1) { const bg = ease3(m(t, 'badge')), pr = ease3(m(t, 'proud')); c.save(); c.globalAlpha = 1 - mr;
    neon(c, () => { diamond(c, X + 210, Y - 180 - 20 * Math.sin(t * 2), 150 * gm); c.strokeRect(X + 60, Y + 20, 300, 170); P(c, [[X + 30, Y + 20], [X + 390, Y + 20]]); }, W8);
    neon(c, () => person(c, X - 220, Y + 470, 1.35, pr), { w: 7, glow: 30 });
    if (bg > 0) rosette(c, lerp(X + 210, X - 220, bg), lerp(Y - 180, Y + 470 - 200 * 1.35, bg), 60 * (1 + .25 * Math.sin(pr * Math.PI))); if (pr > 0) glowDot(c, X - 220, Y + 470 - 300 * 1.35, 36, .3 * pr);
    c.restore(); }
  // 6. reflect their beliefs and you build trust at once: a mirror stands between the customer and the brand; his star belief appears in the mirror; a shield fills with light
  const km = ease3(m(t, 'keyMorph'));
  if (mr > 0 && km < 1) { const ec = ease3(m(t, 'echo')), sd = back(m(t, 'shield')), fi = ease3(m(t, 'fill')); c.save(); c.globalAlpha = 1 - km;
    neon(c, () => person(c, X - 270, Y + 470, 1.35, 0), { w: 7, glow: 30, alpha: 1 - sd * .6 }); starFill(c, X - 270, Y - 100, 50, 1);
    neon(c, () => { c.beginPath(); c.roundRect(X - 40, Y - 330 * mr, 300, 760 * mr, 18); c.stroke(); }, { w: 6, glow: 30, alpha: 1 - sd * .7 });
    if (ec > 0) { starFill(c, lerp(X - 270, X + 110, ec), Y - 100, 50, ec); neon(c, () => person(c, X + 110, Y + 470, 1.35, 0), { w: 6, glow: 26, alpha: .6 * ec * (1 - sd * .6) }); }
    if (sd > .01) { c.save(); c.globalAlpha *= 1; shield(c, X, Y + 40, 1.6 * sd); c.clip(); const fy = Y + 40 + 180 * 1.6 - fi * 360 * 1.6; c.fillStyle = 'rgba(230,238,255,.85)'; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 30; c.fillRect(X - 300, fy, 600, 800); c.restore(); neon(c, () => { shield(c, X, Y + 40, 1.6 * sd); c.stroke(); }, { w: 8, glow: 40 }); }
    c.restore(); }
  // 7. the key: stand for what they stand for and they'll connect with you: the shield becomes a key; then two flags rise, each with the same star; two figures walk together and join hands under them
  const bh = ease3(m(t, 'bigHeart'));
  if (km > 0 && bh < 1) { const fL = ease3(m(t, 'flagL')), fR = ease3(m(t, 'flagR')), wk = ease3(m(t, 'walk')), jn = ease3(m(t, 'join')); c.save(); c.globalAlpha = 1 - bh;
    if (fL <= 0) neon(c, () => keyS(c, X, Y, 2.0 * km, -.3 + km * .3), { w: 9, glow: 40 });
    else { for (const [d, f] of [[-1, fL], [1, fR]]) if (f > 0) { const fx = d < 0 ? X - 410 : X + 200, [sx2, sy2] = flag(c, fx, Y + 470, 1.35, f); neon(c, () => flag(c, fx, Y + 470, 1.35, f), { w: 6, glow: 30 }); starFill(c, sx2, sy2, 48, f); }
      if (wk > 0 || jn > 0) { const lx = lerp(X - 330, X - 90, wk), rx = lerp(X + 330, X + 90, wk); neon(c, () => { person(c, lx, Y + 470, 1.15, jn * .2); person(c, rx, Y + 470, 1.15, jn * .2); if (jn > 0) P(c, [[lx + 90, Y + 470 - 130 * 1.15], [X, Y + 470 - 190 - 30 * jn], [rx - 90, Y + 470 - 130 * 1.15]]); }, { w: 7, glow: 30 }); if (jn > 0) glowDot(c, X, Y + 470 - 190 - 30 * jn, 24 * jn, 1); } }
    c.restore(); }
  // 8. simply because it feels good: the joined hands become one big warm heart
  if (bh > 0) { const gw = ease3(m(t, 'glow')), r = 230 * back(m(t, 'bigHeart')) * (1 + .04 * Math.sin(t * 5)); if (gw > 0) { c.save(); c.globalAlpha = .45 * gw; const g = c.createRadialGradient(X, Y, 0, X, Y, 560); g.addColorStop(0, 'rgba(255,200,190,.7)'); g.addColorStop(1, 'rgba(255,200,190,0)'); c.fillStyle = g; c.fillRect(0, Y - 560, 1080, 1120); c.restore(); }
    c.save(); c.fillStyle = `rgba(196,86,106,${.25 + .6 * gw})`; c.shadowColor = 'rgba(232,120,140,1)'; c.shadowBlur = 50; heartPath(c, X, Y, r); c.fill(); c.restore(); neon(c, () => { heartPath(c, X, Y, r); c.stroke(); }, { w: 8, glow: 40 }); }
}
// the bloom: the take is drawn off-screen, then laid down twice: a wide soft glow and the crisp picture
function take(c, t) { oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height); oc.setTransform(K, 0, 0, K, 0, 0); oc.translate(540, 1160); oc.scale(.92, .92); oc.translate(-540, -1160); scene(oc, t);   // 8% smaller, centred: Instagram trims the sides on tall phones
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55; c.filter = `blur(${26 * K}px)`; c.drawImage(off, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.drawImage(off, 0, 0); c.restore(); }
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
// the sound cues: every motion's start and end, so mix.py lands each sound on its frame
window.EV = Object.entries(M).flatMap(([k, [a, b]]) => [{ t: +a.toFixed(3), type: k, end: +b.toFixed(3) }]).sort((p, q) => p.t - q.t);
