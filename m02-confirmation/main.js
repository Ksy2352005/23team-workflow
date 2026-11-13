// M02 Megerősítés (confirmation): a 23 Team neon motion reel after reference video 2, built on the locked M01 template (one continuous take, bloom, safe zone).
// Big glowing shapes that grow and morph into each other; every motion is written out as a sound cue.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, scramble, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID, K } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 38.8, DUR = 41.3, X = 540, Y = 1160;
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
const M = {
  sats: [.25, 1.3], links: [1.3, 2.1], eclipse: [T(6) - .1, T(7) + .2], chains: [T(8) - .25, T(8) + .35],
  lightup: [T(9) - .15, T(10) + .3], eyeOpen: [T(10), T(11) + .35], blink: [T(14) - .1, T(14) + .3], beam: [T(17) - .15, T(17) + .3], sweep: [T(17) + .1, T(21) + .5], dots: [T(19), T(21)],
  gather: [T(22) - .3, T(23) + .1], petals: [T(24) - .1, T(25) + .4], align: [T(29) - .25, T(29) + .4], rays: [T(35) - .15, T(35) + .9],
  rise: [T(36) - .3, T(37) + .2], figure: [T(37), T(38) + .3], leaf: [T(38) - .1, T(39) + .4], world: [T(44) - .3, T(45) + .3], cone: [T(46) - .2, T(47) + .4],
  arms: [T(50) - .1, T(51) + .2], gem: [T(51) - .1, T(52) + .1], pulse: [T(53) - .1, T(54) + .3], taste: [T(56) - .2, T(57) + .5],
  mirrorIn: [T(59) - .3, T(60) + .1], reflectIn: [T(60) + .1, T(62)], stepOut: [T(63) - .3, T(63) + .4], orbit: [T(64) - .2, T(65) + .5],
  merge: [T(66) - .35, T(66) + .3], lid: [T(69) - .3, T(69) + .3], eyeOpen2: [T(70) - .2, T(72) + .1], drop: [T(75) - .1, T(75) + .4], pull: [T(76) - .3, T(78) + .2],
  tunnel: [T(79) - .3, T(81) + .2], settle: [T(82) - .2, T(83) + .4] };
const m = (t, k) => seg(t, M[k][0], M[k][1]);
function chainX(c, r, u) { for (const d of [-1, 1]) { const n = Math.floor(14 * u); for (let k = 0; k < n; k++) { const q = k / 13 - .5, x = q * r * 1.6, y = d * q * r * 1.6; c.save(); c.translate(x, y); c.rotate(d * Math.PI / 4 + (k % 2) * Math.PI / 2); c.beginPath(); c.ellipse(0, 0, r * .08, r * .045, 0, 0, 7); c.stroke(); c.restore(); } } }
function eye(c, x, y, w, open) { const h = w * .42 * open; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y - h * 2, x + w, y); c.quadraticCurveTo(x, y + h * 2, x - w, y); c.stroke(); }
function petal(c, r) { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-r * .9, -r * .15, -r * .55, -r * .8, 0, -r * 1.25); c.bezierCurveTo(r * .55, -r * .8, r * .9, -r * .15, 0, 0); c.stroke(); }
function figure(c, x, y, s, arms) { const hy = y - 330 * s; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6; c.lineTo(x + Math.cos(a) * 62 * s, hy + Math.sin(a) * 62 * s); } c.closePath(); c.stroke(); circle(c, x, hy, 30 * s);
  P(c, [[x - 70 * s, y - 250 * s], [x + 70 * s, y - 250 * s], [x + 50 * s, y - 160 * s], [x - 50 * s, y - 160 * s]], true); P(c, [[x - 40 * s, y - 140 * s], [x + 40 * s, y - 140 * s], [x + 30 * s, y - 110 * s], [x - 30 * s, y - 110 * s]], true); P(c, [[x - 20 * s, y - 110 * s], [x - 45 * s, y + 30 * s]]); P(c, [[x + 20 * s, y - 110 * s], [x + 45 * s, y + 30 * s]]);
  for (const d of [-1, 1]) { const ex = x + d * lerp(110, 70, arms) * s, ey = lerp(y - 140 * s, y - 330 * s, arms); P(c, [[x + d * 70 * s, y - 250 * s], [lerp(x + d * 120 * s, x + d * 120 * s, arms), lerp(y - 190 * s, y - 300 * s, arms)], [ex, ey]]); } }
function leafShape(c, x, y, s, a) { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-60 * s, -60 * s, 0, -150 * s); c.quadraticCurveTo(60 * s, -60 * s, 0, 0); c.stroke(); P(c, [[0, 0], [0, -130 * s]]); for (let k = 1; k < 4; k++) { P(c, [[0, -k * 32 * s], [-20 * s, -k * 32 * s - 18 * s]]); P(c, [[0, -k * 32 * s], [20 * s, -k * 32 * s - 18 * s]]); } c.restore(); }
function diamond(c, x, y, r) { P(c, [[x - r, y - r * .3], [x - r * .5, y - r * .8], [x + r * .5, y - r * .8], [x + r, y - r * .3], [x, y + r], [x - r, y - r * .3]]); P(c, [[x - r, y - r * .3], [x + r, y - r * .3]]); P(c, [[x - r * .5, y - r * .8], [x - r * .2, y - r * .3], [x, y + r]]); P(c, [[x + r * .5, y - r * .8], [x + r * .2, y - r * .3], [x, y + r]]); }
function eclipse(c, x, y, r) { c.save(); const g = c.createRadialGradient(x, y, r * .9, x, y, r * 1.45); g.addColorStop(0, 'rgba(230,238,255,.9)'); g.addColorStop(1, 'rgba(230,238,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 1.45, 0, 7); c.fill(); c.fillStyle = WHITE; c.beginPath(); c.arc(x, y, r * 1.02, 0, 7); c.fill(); c.restore(); c.save(); c.fillStyle = '#020a2a'; c.beginPath(); c.arc(x, y, r * .93, 0, 7); c.fill(); c.restore(); }
const DOTC = ['#ecbd4a', '#7fb2ea', '#c4566a', '#5fb89a', '#b48cff', '#ffd889', '#f08a5d'];
function scene(c, t) {
  // 1. what I'll tell you is a little-known psychological trick: an orb; four rings swing out and link to it; it turns into a dark eclipse; chains cross over it
  const ec = ease3(m(t, 'eclipse')), lu = ease3(m(t, 'lightup'));
  if (lu < 1) { const sa = back(m(t, 'sats')), lk = m(t, 'links');
    if (ec < 1) { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 - Math.PI / 2 + t * .3, d = 320 * sa, x = X + Math.cos(a) * d, y = Y + Math.sin(a) * d; if (sa > .01) { neon(c, () => { c.beginPath(); c.ellipse(x, y, 54, 32, a, 0, 7); c.stroke(); }, { w: 5, glow: 28, alpha: 1 - ec }); if (lk > 0) { c.save(); c.setLineDash([6, 12]); neon(c, () => { c.beginPath(); c.moveTo(X, Y); c.quadraticCurveTo(X + Math.cos(a + .5) * d * .5, Y + Math.sin(a + .5) * d * .5, lerp(X, x, ease3(lk)), lerp(Y, y, ease3(lk))); c.stroke(); }, { w: 3, alpha: 1 - ec }); c.restore(); } } } glowDot(c, X, Y, 64 * (1 - ec * .2), 1 - ec); }
    if (ec > 0) { c.save(); c.globalAlpha = ec * (1 - lu); eclipse(c, X, Y, lerp(70, 190, ec)); const ch = m(t, 'chains'); if (ch > 0) { c.save(); c.translate(X, Y); neon(c, () => chainX(c, 180, ease3(ch)), { w: 5, glow: 22 }); c.restore(); } c.restore(); } }
  // 2. use it in business and in life, to build trust and deep connections: light sweeps the eclipse open into a big eye; it blinks; a beam swings out of the pupil and lights a ring of dots
  const ga = ease3(m(t, 'gather'));
  if (lu > 0 && ga < 1) { const op = ease3(m(t, 'eyeOpen')), bl = m(t, 'blink'), bk = 1 - Math.sin(clamp(bl) * Math.PI) * .95, bm = ease3(m(t, 'beam')), sw = m(t, 'sweep');
    c.save(); c.globalAlpha = 1 - ga;
    if (op < 1) { c.save(); c.globalAlpha *= 1 - op; const g = c.createRadialGradient(X - 60 + 160 * lu, Y - 40, 10, X, Y, 300); g.addColorStop(0, 'rgba(235,242,255,.95)'); g.addColorStop(1, 'rgba(120,140,190,.2)'); c.fillStyle = g; c.beginPath(); c.arc(X, Y, lerp(190, 300, lu), 0, 7); c.fill(); c.restore(); }
    if (op > 0) { neon(c, () => eye(c, X, Y, 330 * op, bk), { w: 7, glow: 36 }); c.save(); c.beginPath(); c.ellipse(X, Y, 330, 140 * bk * op + 1, 0, 0, 7); c.clip(); const ig = c.createRadialGradient(X - 30, Y - 30, 10, X, Y, 130); ig.addColorStop(0, '#dfe6f6'); ig.addColorStop(1, '#5b6894'); c.fillStyle = ig; c.beginPath(); c.arc(X, Y, 130, 0, 7); c.fill(); c.restore(); }
    glowDot(c, X, Y, 46, 1);
    if (bm > 0) { const ba = -Math.PI * .3 + sw * Math.PI * 2.2; c.save(); c.globalAlpha *= bm; const g = c.createRadialGradient(X, Y, 20, X, Y, 360); g.addColorStop(0, 'rgba(240,244,255,.95)'); g.addColorStop(1, 'rgba(240,244,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, 360, ba - .18, ba + .18); c.closePath(); c.fill(); c.restore();
      const dt = m(t, 'dots'); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 - Math.PI / 2, on = clamp((dt * 18 - k) / 1.5); if (on <= 0) continue; glowDot(c, X + Math.cos(a) * 340, Y + Math.sin(a) * 340, 12 * Math.min(1, on), 1); } }
    c.restore(); }
  // 3. people love what confirms what they already believe: the dots gather into the orb; two pointed shapes swing in, crooked, then click into perfect alignment round it; rays burst out
  const ri = ease3(m(t, 'rise'));
  if (ga > 0 && ri < 1) { c.save(); c.globalAlpha = 1 - ss(seg(t, M.rise[0], M.rise[0] + .4)) * .0; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 - Math.PI / 2, d = 340 * (1 - ga); if (ga < 1) glowDot(c, X + Math.cos(a) * d, Y + Math.sin(a) * d, 12, 1 - ga); }
    const pe = back(m(t, 'petals')), al = back(m(t, 'align')); glowDot(c, X, lerp(Y, Y - 520, ri), 56, 1);
    if (pe > .01 && ri < .5) { for (const d of [-1, 1]) { c.save(); c.translate(X + (1 - al) * d * 70, Y + (1 - al) * -d * 30); c.rotate(d < 0 ? Math.PI : 0); c.rotate((1 - al) * d * .7); neon(c, () => petal(c, 230 * pe), { w: 7, glow: 34, alpha: 1 - ri * 2 }); c.restore(); } }
    const ry = m(t, 'rays'); if (ry > 0 && ry < 1) neon(c, () => { for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, r0 = 300 + 40 * ease3(ry), r1 = r0 + 150 * Math.sin(ry * Math.PI); P(c, [[X + Math.cos(a) * r0, Y + Math.sin(a) * r0], [X + Math.cos(a) * r1, Y + Math.sin(a) * r1]]); } }, { w: 6, glow: 30, alpha: 1 - ss(seg(ry, .6, 1)) }); c.restore(); }
  // 4. if you sell eco-friendly products, tell them they help protect the planet: the orb rises and becomes a figure's head; a leaf grows; the world's ring spreads at its feet; a cone of light shines down on it
  const ar = ease3(m(t, 'arms')), mi = ease3(m(t, 'mirrorIn'));
  if (ri > 0 && mi < 1) { const fg = ease3(m(t, 'figure')), lf = back(m(t, 'leaf')), wo = ease3(m(t, 'world')), co = ease3(m(t, 'cone')), fy = Y + 380, oy = lerp(Y - 520, fy - 330 * 1.5 - 120, fg) * (1 - ar) + (fy - 140 * 1.5) * ar; c.save(); c.globalAlpha = 1 - mi;
    if (co > 0) { c.save(); c.globalAlpha *= co * (1 - ar); const g = c.createLinearGradient(0, oy, 0, fy); g.addColorStop(0, 'rgba(240,244,255,.75)'); g.addColorStop(1, 'rgba(240,244,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, oy); c.lineTo(X + 230, fy - 40); c.lineTo(X - 230, fy - 40); c.closePath(); c.fill(); c.restore(); }
    if (wo > 0) neon(c, () => { c.beginPath(); c.ellipse(X, fy + 20, 380 * wo, 70 * wo, 0, 0, 7); c.stroke(); }, { w: 5, glow: 30 });
    if (fg > 0) neon(c, () => figure(c, X, fy, 1.5, ar), { w: 6, glow: 28, alpha: fg });
    if (lf > .01) neon(c, () => { leafShape(c, X - 270, fy + 10, 1.5 * lf, -.35); leafShape(c, X + 270, fy + 10, 1.2 * lf, .45); }, { w: 5, glow: 28, alpha: 1 - ar });
    // 5. if you sell luxury, confirm their fine taste: the arms lift, a diamond floats down into the hands; a pulse; a ring of light opens round the orb
    const gm = ease3(m(t, 'gem')); if (gm > 0) neon(c, () => diamond(c, X, lerp(Y - 600, oy - 140, gm), 70), { w: 6, glow: 36 });
    const pu = m(t, 'pulse'); if (pu > 0 && pu < 1) neon(c, () => circle(c, X, oy, 50 + ease3(pu) * 160), { w: 5, alpha: 1 - pu });
    const ta = back(m(t, 'taste')); if (ta > .01) neon(c, () => circle(c, X, oy, 240 * ta), { w: 6, glow: 40 });
    glowDot(c, X, oy, 44, 1); c.restore(); }
  // 6. if you reflect their beliefs, you build trust at once: a tall mirror appears; the orb's reflection forms in it, steps out to meet the orb; the two circle inside shared orbit rings
  const mg = ease3(m(t, 'merge'));
  if (mi > 0 && mg < 1) { const ri2 = ease3(m(t, 'reflectIn')), so = ease3(m(t, 'stepOut')), ob = ease3(m(t, 'orbit')), mx = X + 150, oX = lerp(X - 200, X - 70, so), rX = lerp(mx + 120, X + 70, so); c.save(); c.globalAlpha = 1 - mg;
    neon(c, () => c.strokeRect(mx - 10, Y - 260 * mi, 260, 520 * mi), { w: 6, glow: 34, alpha: 1 - so });
    glowDot(c, oX, Y + 120 * (1 - so), 56, 1); if (ri2 > 0) neon(c, () => circle(c, rX, Y + 120 * (1 - so), 56 * ri2), { w: 6, glow: 30 });
    if (ob > 0) { const sp = (t - M.orbit[0]) * 1.6; neon(c, () => { c.beginPath(); c.ellipse(X, Y, 380 * ob, 110 * ob, .0, sp, sp + Math.PI * 1.7); c.stroke(); c.beginPath(); c.ellipse(X, Y, 280 * ob, 80 * ob, 0, -sp, -sp + Math.PI * 1.5); c.stroke(); }, { w: 5, glow: 30 }); } c.restore(); }
  // 7. so here's the key: stand for what they stand for, and they'll connect with you: the pair merges into an eclipse; an eyelid arcs over it and the eye opens; the pupil drops as an orb; colourful dots are drawn in and settle round it
  const tu = ease3(m(t, 'tunnel'));
  if (mg > 0 && tu < 1) { const ld = ease3(m(t, 'lid')), e2 = ease3(m(t, 'eyeOpen2')), dr = ease3(m(t, 'drop')), pl = ease3(m(t, 'pull')); c.save(); c.globalAlpha = 1 - tu;
    if (dr < 1) { c.save(); c.globalAlpha *= 1 - dr; eclipse(c, X, Y, lerp(100, 120, mg)); if (ld > 0) neon(c, () => { if (e2 <= 0) { c.beginPath(); c.arc(X, Y + 60, 210, Math.PI * 1.15, Math.PI * 1.15 + Math.PI * .7 * ld); c.stroke(); } else eye(c, X, Y, 330 * e2, e2); }, { w: 7, glow: 36 }); c.restore(); }
    const oy = lerp(Y, Y + 60, dr); if (dr > 0) glowDot(c, X, oy, 60, 1);
    if (pl > 0) DOTC.forEach((col, k) => { const a = k / 7 * Math.PI * 2 + t * .7, r = lerp(400, 170 + 30 * Math.sin(t * 3 + k), pl); c.save(); c.globalAlpha *= Math.min(1, pl * 3); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 30; c.beginPath(); c.arc(X + Math.cos(a) * r, oy + Math.sin(a) * r, 26, 0, 7); c.fill(); c.restore(); }); c.restore(); }
  // 8. simply because it feels good: the orb sits in a rounded frame; frame after frame zooms out of it as a tunnel of light; it all settles into one warm glow
  if (tu > 0) { const st = ease3(m(t, 'settle')); glowDot(c, X, Y + 60 * (1 - tu), lerp(60, 90, st), 1); if (st > 0) { c.save(); c.globalAlpha = .5 * st; const g = c.createRadialGradient(X, Y, 0, X, Y, 520); g.addColorStop(0, 'rgba(255,236,190,.6)'); g.addColorStop(1, 'rgba(255,236,190,0)'); c.fillStyle = g; c.fillRect(0, Y - 520, 1080, 1040); c.restore(); }
    c.save(); neon(c, () => { for (let k = 0; k < 7; k++) { const q = ((tu * 1.2 + (t - M.tunnel[0]) * .5 + k / 7) % 1), w = 90 + q * q * 430, h = w * 1.5; c.globalAlpha = Math.sin(q * Math.PI) * (1 - st); c.beginPath(); c.roundRect(X - w / 2, Y + 60 - h / 2, w, h, 26); c.stroke(); } }, { w: 5, glow: 30 }); c.restore();
    for (let k = 0; k < 10; k++) { const x = k < 5 ? 130 + k * 26 : 950 - (k - 5) * 26; c.save(); c.globalAlpha = .35 * Math.sin(clamp(tu) * Math.PI) * (1 - st); c.fillStyle = WHITE; c.fillRect(x, 850, 2, 900); c.restore(); } }
}
// the bloom: the take is drawn off-screen, then laid down twice: a wide soft glow and the crisp picture
function take(c, t) { oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height); oc.setTransform(K, 0, 0, K, 0, 0); oc.translate(540, 1160); oc.scale(.92, .92); oc.translate(-540, -1160); scene(oc, t);   // 8% smaller, centred: Instagram trims the sides on tall phones
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .55; c.filter = `blur(${26 * K}px)`; c.drawImage(off, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.drawImage(off, 0, 0); c.restore(); }
await start({ scenes: [[0, take]], words: WORDS, story: STORY, dur: DUR, stage: false, caption: { font: '600 46px "Inter"', mode: 'fade', y: 470 } });
// the sound cues: every motion's start and end, so mix.py lands each sound on its frame
window.EV = Object.entries(M).flatMap(([k, [a, b]]) => [{ t: +a.toFixed(3), type: k, end: +b.toFixed(3) }]).sort((p, q) => p.t - q.t);
