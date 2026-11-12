// M07 Egy üzenet (one message): a 23 Team neon motion reel after reference video 7, beat by beat on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 34.2, DUR = 36.7, X = 540, Y = 955;
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); c.stroke(); };
function bubble(c, x, y, w, h, flip = 1) { c.save(); c.translate(x, y); c.scale(flip, 1); c.beginPath(); c.moveTo(-w / 2 + 14, -h / 2); c.lineTo(w / 2 - 14, -h / 2); c.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + 14); c.lineTo(w / 2, h / 2 - 14); c.quadraticCurveTo(w / 2, h / 2, w / 2 - 14, h / 2); c.lineTo(-w / 2 + 26, h / 2); c.lineTo(-w / 2 + 4, h / 2 + 18); c.lineTo(-w / 2 + 10, h / 2); c.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - 14); c.lineTo(-w / 2, -h / 2 + 14); c.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + 14, -h / 2); c.stroke(); c.restore(); }
function env(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); rr(c, -40, -27, 80, 54, 6); P(c, [[-38, -24], [0, 6], [38, -24]]); c.restore(); }
function badge(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); for (let k = 0; k <= 48; k++) { const a = k / 48 * Math.PI * 2, r = 36 + (k % 2 ? 0 : 6); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); circle(c, -10, -10, 6); circle(c, 10, 10, 6); P(c, [[12, -14], [-12, 14]]); c.restore(); }
function apple(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, -46); c.bezierCurveTo(-20, -62, -78, -60, -80, -6); c.bezierCurveTo(-82, 46, -44, 84, -22, 84); c.bezierCurveTo(-10, 84, -8, 78, 0, 78); c.bezierCurveTo(8, 78, 10, 84, 22, 84); c.bezierCurveTo(44, 84, 82, 46, 80, -6); c.bezierCurveTo(78, -60, 20, -62, 0, -46); c.stroke(); P(c, [[0, -46], [4, -70]]); c.beginPath(); c.moveTo(6, -66); c.quadraticCurveTo(22, -96, 46, -92); c.quadraticCurveTo(36, -66, 6, -66); c.stroke(); c.restore(); }
function box(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); rr(c, -42, -34, 84, 68, 8); P(c, [[-42, -14], [42, -14]]); rr(c, -14, -34, 28, 30, 3); c.restore(); }
function bulb(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-26, 50); c.quadraticCurveTo(-26, 20, -50, -5); c.arc(0, -25, 56, Math.PI * .87, Math.PI * 2.13); c.quadraticCurveTo(26, 20, 26, 50); c.closePath(); c.stroke(); P(c, [[-22, 64], [22, 64]]); P(c, [[-16, 78], [16, 78]]); c.restore(); }
function cone(c, x, top, bot, w, a) { c.save(); c.globalAlpha *= a; const g = c.createLinearGradient(0, top, 0, bot); g.addColorStop(0, 'rgba(235,240,255,.85)'); g.addColorStop(1, 'rgba(235,240,255,.05)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, top); c.lineTo(x - w, bot); c.ellipse(x, bot, w, w * .2, 0, Math.PI, 0, true); c.closePath(); c.fill(); c.restore(); glowDot(c, x, top, 9, a); neon(c, () => { c.beginPath(); c.ellipse(x, bot, w * 1.25, w * .3, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(x, bot, w * .8, w * .18, 0, 0, 7); c.stroke(); }, { w: 3.5, alpha: a }); }
function letter(c, ch, x, y, r, a, rot = 0) { if (a <= 0) return; c.save(); c.translate(x, y); c.rotate(rot); neon(c, () => circle(c, 0, 0, r), { w: 3.5, alpha: a }); txt(c, ch, 0, 2, r * 1.15, { font: 'Inter', weight: 500, alpha: a, glow: 10 }); c.restore(); }
const scenes = []; const sc = (t0, f) => scenes.push([t0, f]);
// A: most brands make the same mistake: two small rings appear, then a big X
sc(0, (c, t) => { const x = ss(seg(t, T(5) - .15, T(5) + .1)), pair = E(t, T(1), .3, .4) * (1 - x);
  if (pair > 0) neon(c, () => { circle(c, X - 70, Y, 22 * Math.min(1.1, pair)); circle(c, X + 70, Y, 22 * Math.min(1.1, pair)); }, { w: 4 });
  const k = E(t, T(5), .35, .5); if (k > 0) neon(c, () => { const s = 110 * k; P(c, [[X - s, Y - s], [X + s, Y + s]]); P(c, [[X + s, Y - s], [X - s, Y + s]]); }, { w: 26, glow: 30 });
  const d = E(t, T(6), .3, .4); if (d > 0) glowDot(c, X - 260, Y, 18 * Math.min(1.1, d), 1); });
// B: they try to say too much at once: a dot speaks two bubbles, then a whole cloud bursts out, and a ring closes round it
sc(T(8) - .2, (c, t) => { const dx = lerp(-260, 0, ease3(seg(t, T(8) - .2, T(8) + .4))), many = seg(t, T(12) - .1, T(13) + .3), ring = ease3(seg(t, T(13) - .1, T(13) + .6));
  glowDot(c, X + dx, Y + 40, 26, 1);
  const two = [[X + 110, Y - 100, 150, 60, 1], [X + 290, Y - 190, 190, 70, 1]]; two.forEach(([x, y, w, h, f], k) => { const a = E(t, T(9) + k * .3, .3, .45); if (a > 0) neon(c, () => bubble(c, lerp(X + dx, x, ease3(clamp(a))), lerp(Y + 40, y, ease3(clamp(a))), w * Math.min(1.08, a), h * Math.min(1.08, a), f), { w: 4, alpha: 1 - many }); });
  if (many > 0) for (let k = 0; k < 22; k++) { const a = hash(k) * Math.PI * 2, d = 90 + hash(k + 5) * 250, u = E(t, T(12) + hash(k + 2) * .45, .3, .4); if (u <= 0) continue; const x = X + Math.cos(a) * d * ease3(clamp(u)), y = Y + 40 + Math.sin(a) * d * .9 * ease3(clamp(u)); c.save(); c.translate(x, y); c.rotate((hash(k + 8) - .5) * 1.4); neon(c, () => bubble(c, 0, 0, (70 + hash(k + 3) * 70) * Math.min(1.08, u), (34 + hash(k + 4) * 22) * Math.min(1.08, u), hash(k + 6) > .5 ? 1 : -1), { w: 3.5 }); c.restore(); }
  if (ring > 0) neon(c, () => { c.beginPath(); c.arc(X, Y + 40, lerp(700, 380, ring), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); c.stroke(); }, { w: 6, glow: 34 }); });
// C: stop for a moment and focus: a target; the crosshair ticks close in and the rings tighten
sc(T(14) - .2, (c, t) => { const a = E(t, T(14), .4, .35), foc = ease3(seg(t, T(19) - .2, T(19) + .5)), ticks = ease3(seg(t, T(17), T(19))), out = ss(seg(t, T(19) + .9, T(20) - .1));
  neon(c, () => circle(c, X, Y, 250 * Math.min(1.05, a) * lerp(1, .82, foc)), { w: 5, glow: 30, alpha: 1 - out });
  neon(c, () => circle(c, X, Y, lerp(150, 70, foc) * Math.min(1.05, a)), { w: 3.5, alpha: (1 - out) * lerp(.55, 1, foc) });
  if (ticks > 0) neon(c, () => { for (let k = 0; k < 4; k++) { const ang = k * Math.PI / 2 + .35 * (1 - ticks), r1 = lerp(320, 110, ticks), r2 = r1 + 40; P(c, [[X + Math.cos(ang) * r1, Y + Math.sin(ang) * r1], [X + Math.cos(ang) * r2, Y + Math.sin(ang) * r2]]); } }, { w: 5, alpha: ticks * (1 - out) });
  glowDot(c, X, Y, 18 + 6 * foc, a); });
// D: one message, one offer, one clear action: a spotlight lights a letter, then a sale badge, then a single dot; it pulses out in rings
sc(T(20) - .2, (c, t) => { const lit = ss(seg(t, T(20) - .2, T(20) + .2)), off = ss(seg(t, T(26) + .1, T(26) + .4)), rings = seg(t, T(26), T(26) + 1.5), top = Y - 260, bot = Y + 130;
  if (off < 1) { cone(c, X, top, bot, 120 * lit, lit * (1 - off));
    const m = E(t, T(21) - .1, .3, .45) * (1 - ss(seg(t, T(23) - .2, T(23)))), o = E(t, T(23), .3, .45) * (1 - ss(seg(t, T(25) - .2, T(25)))), d = E(t, T(25), .3, .45);
    if (m > 0) neon(c, () => env(c, X, bot - 22, 1.15 * Math.min(1.08, m)), { w: 4 }); if (o > 0) neon(c, () => badge(c, X, bot - 34, 1.1 * Math.min(1.08, o)), { w: 3.5 }); }
  { const d = E(t, T(25), .3, .45); if (d > 0) glowDot(c, X, lerp(bot - 26, Y, ease3(seg(t, T(26) - .1, T(26) + .4))), lerp(30 * Math.min(1.08, d), 26, off), 1); }
  if (rings > 0) { neon(c, () => { for (let k = 0; k < 9; k++) { const u = clamp(rings * 1.5 - k * .06); if (u <= 0) continue; c.globalAlpha = (1 - ss(seg(rings, .7, 1))) * (.4 + .6 * (k % 3 === 0)); circle(c, X, Y, 40 + ease3(u) * (40 + k * 28)); } }, { w: 3, glow: 20 }); } });
// E: think about Apple: an apple drawn in light lines
sc(T(27) - .2, (c, t) => { const d = seg(t, T(28), T(29) + .6), sh = ease3(seg(t, T(31), T(31) + .5)), out = ss(seg(t, T(32) - .4, T(32) - .1)); glowDot(c, X, Y, 26 * (1 - ss(d * 3)), 1);
  if (d > 0) { c.save(); c.setLineDash([1400 * ease3(d), 1400]); neon(c, () => apple(c, X, Y, lerp(2.2, 1.5, sh)), { w: 4.5, glow: 28, alpha: 1 - out }); c.restore(); } });
// F: their ads don't list a hundred features, they highlight one strong benefit: a circle with a line, the line multiplies into a long list; all but one fade
sc(T(32) - .2, (c, t) => { const a = E(t, T(32) - .1, .4, .35), list = ease3(seg(t, T(34), T(36) + .3)), ringOut = ss(seg(t, T(34) - .2, T(34) + .2)), one = ss(seg(t, T(37) - .1, T(38) + .2)), fade = ss(seg(t, T(40), T(41) + .3)), n = 12;
  neon(c, () => circle(c, X, Y, 170 * Math.min(1.05, a)), { w: 3, alpha: (1 - ringOut) * .7 });
  for (let k = 0; k < n; k++) { const y0 = Y, y1 = Y - 290 + k * 53, y = lerp(y0, y1, list), w = lerp(k === 6 ? 140 : 0, 360, list), hero = k === 6; if (w < 2) continue; const al = hero ? 1 : (1 - one * .8) * (1 - fade);
    neon(c, () => P(c, [[X - w / 2, y], [X + w / 2, y]]), { w: hero ? lerp(4, 6, one) : 4, glow: hero ? lerp(18, 40, one) : 14, alpha: al });
    if (hero && one > 0) { c.save(); c.globalAlpha = one; const g = c.createRadialGradient(X, y, 0, X, y, 180); g.addColorStop(0, 'rgba(225,235,255,.35)'); g.addColorStop(1, 'rgba(225,235,255,0)'); c.fillStyle = g; c.fillRect(X - 200, y - 80, 400, 160); c.restore(); } } });
// G: the more options, the more confusion, and confusion kills sales: letters A-E land on the line, then scatter and circle a dimming coin
sc(T(42) - .2, (c, t) => { const line = 1 - ss(seg(t, T(50) - .2, T(50) + .3)), sc1 = ease3(seg(t, T(50) - .3, T(51) + .3)), coin = ss(seg(t, T(51), T(52) + .3)), kill = ss(seg(t, T(56) - .2, T(57) + .6)), rot = (t - T(50)) * .55, L = 'ABCDE';
  neon(c, () => P(c, [[X - 180, Y + 70], [X + 180, Y + 70]]), { w: 6, glow: 36, alpha: line });
  const rows = [[-110, -90], [0, -70], [100, -100], [-80, 0], [70, 0]];
  for (let k = 0; k < 5; k++) { const a = E(t, T(44) + k * .18, .3, .5); if (a <= 0) continue; const ang = k / 5 * Math.PI * 2 + rot, rad = lerp(220, 170, kill), x = X + lerp(rows[k][0], Math.cos(ang) * rad, sc1), y = Y + lerp(rows[k][1] - 40 * (1 - Math.min(1, a)), Math.sin(ang) * rad, sc1); letter(c, L[k], x, y, 38 * Math.min(1.08, a), 1, sc1 * (t - T(50)) * (k % 2 ? 1.4 : -1.2)); }
  if (coin > 0) { const al = coin * lerp(.45, .25, kill), s = lerp(1, .8, kill); c.save(); c.globalAlpha = al; neon(c, () => circle(c, X, Y, 64 * s), { w: 4 }); txt(c, '$', X, Y + 4, 70 * s, { font: 'Inter', weight: 400, glow: 6 }); c.restore();
    if (kill > 0) for (let k = 0; k < 3; k++) { const u = clamp(kill * 1.4 - k * .2); neon(c, () => P(c, [[X - 90 + k * 60, Y - 120 - u * 40], [X - 110 + k * 60, Y - 70 - u * 40]]), { w: 3, alpha: u * (1 - u) * 3 }); } } });
// H: if you want them to remember you, keep it simple: a dim dot; a tunnel of rings rushes outward; one ring stays, then just the dot
sc(T(59) - .2, (c, t) => { const glow = ss(seg(t, T(59), T(62))), tun = seg(t, T(62) - .1, T(65) + .2), one = ss(seg(t, T(65) - .3, T(65) + .3)), last = ss(seg(t, T(66) + .3, T(66) + .8));
  glowDot(c, X, Y, lerp(22, 18, glow), lerp(.3, 1, glow));
  if (tun > 0 && one < 1) neon(c, () => { for (let k = 0; k < 10; k++) { const u = ((tun * 1.3 + k / 10) % 1), r = 40 + Math.pow(u, 2.2) * 1100; c.globalAlpha = clamp(u * 4) * (1 - u) * (1 - one) * 1.4; c.beginPath(); c.ellipse(X, Y + u * 60, r, r * .92, 0, 0, 7); c.stroke(); } }, { w: 5, glow: 34 });
  if (one > 0) neon(c, () => circle(c, X, Y, lerp(420, 260, one)), { w: 5, glow: 40, alpha: one * (1 - last) }); });
// I: one product, one message and one reason to buy: a box, a letter and a bulb joined by one circle
sc(T(67) - .2, (c, t) => { const R = 190, pts = [[-Math.PI / 2, T(68)], [Math.PI / 6, T(70)], [Math.PI * 5 / 6, T(73)]], arc = seg(t, T(70) - .5, T(75) + .3);
  if (arc > 0) neon(c, () => { c.beginPath(); c.arc(X, Y, R, -Math.PI / 2 + .32, -Math.PI / 2 + .32 + (Math.PI * 2 - .64) * ease3(arc)); c.stroke(); }, { w: 4 });
  pts.forEach(([ang, at], k) => { const a = E(t, at - .1, .35, .5); if (a <= 0) return; const x = X + Math.cos(ang) * R, y = Y + Math.sin(ang) * R, s = 1.15 * Math.min(1.08, a); c.save(); c.fillStyle = MID; c.beginPath(); c.arc(x, y, 62, 0, 7); c.fill(); c.restore();
    neon(c, () => (k === 0 ? box : k === 1 ? env : bulb)(c, x, y + (k === 2 ? 4 : 0), k === 2 ? s * .62 : s), { w: 4 }); }); });
start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 } });
