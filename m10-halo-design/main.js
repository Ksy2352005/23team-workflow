// M10 Halo-hatás a designban (the halo effect): a 23 Team neon motion reel after reference video 10, beat by beat on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, scramble, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 42.2, DUR = 44.7, X = 540, Y = 955;
function cube(c, x, y, s, open = 0) { const a = 80 * s, b = 46 * s, h = 92 * s; const top = [[x, y - h / 2 - b], [x + a, y - h / 2], [x, y - h / 2 + b], [x - a, y - h / 2]];
  P(c, [[x - a, y - h / 2], [x - a, y + h / 2], [x, y + h / 2 + b], [x + a, y + h / 2], [x + a, y - h / 2]]); P(c, [[x, y - h / 2 + b], [x, y + h / 2 + b]]);
  if (open <= 0) P(c, top, true); else { P(c, [top[3], top[2], top[1]]); const o = open * 1.9; for (const [p0, p1, d] of [[top[3], top[2], -1], [top[2], top[1], 1]]) P(c, [p0, [p0[0] + d * Math.sin(o) * 10 * s, p0[1] - Math.sin(o) * 70 * s], [p1[0] + d * Math.sin(o) * 10 * s, p1[1] - Math.sin(o) * 70 * s], p1]); } }
function thumb(c, x, y, s, down) { c.save(); c.translate(x, y); if (down) c.rotate(Math.PI); c.scale(s, s); c.beginPath(); c.roundRect(-30, -10, 60, 60, 10); c.stroke(); c.beginPath(); c.moveTo(-14, -10); c.lineTo(-6, -52); c.quadraticCurveTo(6, -62, 12, -48); c.lineTo(8, -10); c.stroke(); c.beginPath(); c.roundRect(-48, -6, 16, 54, 6); c.stroke(); c.restore(); }
function spiky(c, x, y, r, t) { c.beginPath(); for (let k = 0; k <= 90; k++) { const a = k / 90 * Math.PI * 2, rr = r * (1 + .14 * Math.sin(a * 17 + t * 4) * hash(k)); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.stroke(); }
function doc(c, x, y, s, lines = 1) { c.beginPath(); c.roundRect(x - 80 * s, y - 110 * s, 160 * s, 220 * s, 8 * s); c.stroke(); for (let k = 0; k < 7; k++) { const w = (k % 3 === 2 ? 70 : 110) * s * clamp(lines * 7 - k); if (w > 0) P(c, [[x - 55 * s, y - 75 * s + k * 26 * s], [x - 55 * s + w, y - 75 * s + k * 26 * s]]); } }
function browser(c, x, y, s) { c.beginPath(); c.roundRect(x - 160 * s, y - 120 * s, 320 * s, 240 * s, 12 * s); c.stroke(); P(c, [[x - 160 * s, y - 80 * s], [x + 160 * s, y - 80 * s]]); circle(c, x - 136 * s, y - 100 * s, 7 * s); c.beginPath(); c.roundRect(x - 110 * s, y - 108 * s, 250 * s, 16 * s, 8 * s); c.stroke(); P(c, [[x - 120 * s, y + 80 * s], [x + 60 * s, y + 80 * s]]); P(c, [[x - 120 * s, y + 100 * s], [x + 20 * s, y + 100 * s]]); }
function eye(c, x, y, w, open, px, py) { const h = w * .42 * open; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x, y - h * 2, x + w, y); c.quadraticCurveTo(x, y + h * 2, x - w, y); c.stroke(); if (open > .3) circle(c, x + px, y + py, w * .2); }
function spark4(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); }
const scenes = []; const sc = (t0, f) => scenes.push([t0, f]);
// A: this simple principle decides if your marketing is good or bad: a ring; a spotlight swings from a thumb up to a thumb down
sc(0, (c, t) => { const r = E(t, .05, .45, .35), shr = ss(seg(t, T(4), T(6))), lamp = ss(seg(t, T(8) - .3, T(8) + .1)), sw = lerp(-1, 1, ss(seg(t, T(10) - .1, T(11) + .1)));
  neon(c, () => circle(c, X, Y, lerp(70, 34, shr) * Math.min(1.05, r)), { w: 5, glow: lerp(40, 22, shr) });
  if (lamp > 0) { const ang = Math.PI + sw * .15, len = 420, lx = X - 30, ly = Y; const tx = X + Math.cos(ang + Math.PI) * 0; c.save(); c.globalAlpha = .4 * lamp; const dir = sw < 0 ? -1 : 1; const g = c.createLinearGradient(X, Y, X + dir * 380, Y); g.addColorStop(0, 'rgba(235,242,255,.9)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, Y); c.lineTo(X + dir * 380, Y - 130); c.lineTo(X + dir * 380, Y + 130); c.closePath(); c.fill(); c.restore();
    neon(c, () => thumb(c, X - 260, Y, 1.5, false), { w: 4, alpha: lamp * (sw < 0 ? 1 : .35) }); neon(c, () => thumb(c, X + 260, Y, 1.5, true), { w: 4, alpha: lamp * (sw > 0 ? 1 : .35) }); } });
// B: if your brand looks average, people assume it is: a ring opens into a box; a speech bubble with a plain square
sc(T(12) - .2, (c, t) => { const bx = ss(seg(t, T(14), T(15) + .3)), op = ss(seg(t, T(15), T(15) + .5)) * (1 - ss(seg(t, T(18), T(18) + .5))), bub = E(t, T(20), .35, .5);
  if (bx < 1) neon(c, () => circle(c, X, Y, 60 * (1 - bx) + 10), { w: 4.5, alpha: 1 - bx });
  if (bx > 0) neon(c, () => cube(c, X, Y + 40, 1.9 * bx, op), { w: 4.5 });
  if (bub > 0) neon(c, () => { const s = Math.min(1.1, bub), bx0 = X + 190, by0 = Y - 170; c.beginPath(); c.roundRect(bx0 - 80 * s, by0 - 60 * s, 160 * s, 110 * s, 30 * s); c.stroke(); P(c, [[bx0 - 50 * s, by0 + 50 * s], [bx0 - 80 * s, by0 + 90 * s], [bx0 - 20 * s, by0 + 50 * s]]); c.strokeRect(bx0 - 25 * s, by0 - 30 * s, 50 * s, 50 * s); }, { w: 4 }); });
// C: this is called the halo effect: the words type in under a glowing halo ring
sc(T(24) - .2, (c, t) => { const h = E(t, T(26) - .3, .45, .4); if (h > 0) neon(c, () => { c.beginPath(); c.ellipse(X, Y - 130, 170 * Math.min(1.05, h), 40 * Math.min(1.05, h), 0, 0, 7); c.stroke(); }, { w: 6, glow: 40 });
  txt(c, scramble('HALO-HATÁS', t, T(26) - .2, .7), X, Y + 20, 92, { glow: 26 }); });
// D: one strong impression, good or bad, sways everything after it: a spiky ring round a core; a bright orb; then a trail of orbs swirling after the first
sc(T(27) - .2, (c, t) => { const sp = E(t, T(28) - .1, .45, .35) * (1 - ss(seg(t, T(31) - .2, T(31) + .2))), good = E(t, T(31), .3, .5), bad = E(t, T(33), .3, .5), trail = seg(t, T(35) - .2, T(38) + .4);
  if (sp > 0) neon(c, () => { spiky(c, X, Y, 200 * Math.min(1.05, sp), t); spiky(c, X, Y, 150 * Math.min(1.05, sp), -t); circle(c, X, Y, 56); }, { w: 3, glow: 30 });
  if (trail <= 0) { if (good > 0) glowDot(c, X + 110, Y + 40, 42 * Math.min(1.08, good), 1); if (bad > 0) neon(c, () => circle(c, X - 110, Y - 30, 42 * Math.min(1.08, bad)), { w: 4.5 }); }
  else for (let k = 0; k < 8; k++) { const a = -t * 2.6 + k * .42, r = lerp(110, 180, ss(trail)), x = X + Math.cos(a) * r, y = Y + Math.sin(a) * r * .8; if (k === 0) glowDot(c, x, y, 40, 1); else neon(c, () => circle(c, x, y, 40 - k * 2), { w: 3.5, alpha: 1 - k * .1 }); } });
// E: if the design is weak, your offer looks weak too: a big ring with a core; it crumbles into falling shards; a document with fading lines
sc(T(39) - .2, (c, t) => { const rg = E(t, T(42) - .2, .45, .35), crack = seg(t, T(43) - .1, T(44) + .6), dk = E(t, T(46) - .1, .4, .45);
  if (crack < 1) { if (crack <= 0) neon(c, () => { circle(c, X, Y, 210 * Math.min(1.05, rg)); circle(c, X, Y, 40); }, { w: 7, glow: 40 }); else for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, fall = Math.max(0, crack * 2 - hash(k)) ; const x = X + Math.cos(a) * 210 + (hash(k + 2) - .5) * 80 * fall, y = Y + Math.sin(a) * 210 + 600 * fall * fall; neon(c, () => P(c, [[x, y], [x + Math.cos(a + 1.6) * 24, y + Math.sin(a + 1.6) * 24]]), { w: 5, alpha: 1 - fall }); } }
  if (dk > 0) neon(c, () => doc(c, X, Y, 1.6 * Math.min(1.05, dk), 1 - .6 * ss(seg(t, T(46) + .4, T(47) + .4))), { w: 4.5, alpha: 1 - .45 * ss(seg(t, T(46) + .4, T(47) + .4)) }); });
// F: if your website looks outdated, your product does too: a browser window flickers with broken lines; a box appears inside it; it flickers too
sc(T(48) - .2, (c, t) => { const w = E(t, T(52) - .2, .45, .35), bx = E(t, T(54) - .1, .4, .45), old = ss(seg(t, T(56) - .1, T(56) + .3)), fl = (Math.sin(t * 23) > .6 ? .5 : 1);
  neon(c, () => browser(c, X, Y, 1.7 * Math.min(1.05, w)), { w: 4.5, alpha: t > T(50) ? fl : 1 });
  if (t > T(50) && bx <= 0) neon(c, () => { for (let k = 0; k < 5; k++) { const x = X - 200 + hash(k + Math.floor(t * 6)) * 400, y = Y - 80 + hash(k + 9 + Math.floor(t * 6)) * 200; P(c, [[x, y], [x + 20, y]]); } }, { w: 4 });
  if (bx > 0) neon(c, () => cube(c, X, Y + 10, .9 * Math.min(1.05, bx)), { w: 4, alpha: old > 0 ? (Math.sin(t * 19) > .3 ? .4 : 1) : 1 }); });
// G: our brain links these impressions; it generalises and carries the information over: two circles, then three, spread evenly; a light runs along a dotted line from one to the next
sc(T(58) - .2, (c, t) => { const n2 = E(t, T(59) - .1, .4, .45), n3 = E(t, T(61), .4, .45), spread = ease3(seg(t, T(65) - .2, T(65) + .4)), run = seg(t, T(67) - .1, T(69) + .8);
  const xs = [lerp(X - 60, X - 220, spread), lerp(X + 60, X, spread), lerp(X + 190, X + 220, spread)];
  xs.forEach((x, k) => { const a = k < 2 ? n2 : n3; if (a > 0) neon(c, () => circle(c, x, Y, 46 * Math.min(1.05, a)), { w: 4.5 }); });
  if (run > 0) { c.save(); c.setLineDash([12, 14]); neon(c, () => { P(c, [[xs[0] + 46, Y], [xs[1] - 46, Y]]); P(c, [[xs[1] + 46, Y], [xs[2] - 46, Y]]); }, { w: 3, alpha: ss(run * 4) }); c.restore(); const u = run % 1, x = lerp(xs[0], xs[2], ease3(u)); glowDot(c, x, Y, 18, 1); c.save(); c.globalAlpha = .5; const g = c.createRadialGradient(x, Y, 0, x, Y, 200); g.addColorStop(0, 'rgba(235,242,255,.5)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.fillRect(x - 200, Y - 200, 400, 400); c.restore(); } });
// H: if you want to look premium, make everything premium: a line opens into an eye; the pupil looks around; it lights; sparkles
sc(T(70) - .2, (c, t) => { const op = ease3(seg(t, T(71) - .1, T(71) + .5)), lit = ss(seg(t, T(76) - .2, T(76) + .3)), px = 90 * Math.sin(t * 1.8) * (1 - lit), py = 30 * Math.cos(t * 2.3) * (1 - lit);
  neon(c, () => { if (op <= 0) P(c, [[X - 230, Y], [X + 230, Y]]); else eye(c, X, Y, 230, op, px, py); }, { w: 5, glow: 30 });
  if (lit > 0) { glowDot(c, X + px, Y + py, 44 * lit, 1); c.save(); c.fillStyle = WHITE; c.shadowColor = 'rgba(220,230,255,1)'; c.shadowBlur = 30; spark4(c, X + 80, Y - 70, 34 * E(t, T(76), .3, .5)); spark4(c, X - 120, Y + 50, 20 * E(t, T(76) + .15, .3, .5)); c.restore(); } });
// I: because customers judge your product by how they perceive your brand, not by reality: the eye closes to a ring; squares orbit it; then they tilt out of line
sc(T(77) - .2, (c, t) => { const rg = E(t, T(77), .4, .4), sq = E(t, T(92) - .3, .45, .4), tilt = ss(seg(t, T(95) - .2, T(95) + .5));
  neon(c, () => circle(c, X, Y, 70 * Math.min(1.05, rg)), { w: 5, glow: 30 });
  if (sq > 0) neon(c, () => { for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + t * .3, r = 190 * Math.min(1.05, sq) + tilt * 30 * Math.sin(k * 3), x = X + Math.cos(a) * r, y = Y + Math.sin(a) * r; c.save(); c.translate(x, y); c.rotate(a + tilt * (hash(k) - .5) * 1.4); c.strokeRect(-18, -18, 36, 36); c.restore(); } }, { w: 3.5 }); });
start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 } });
