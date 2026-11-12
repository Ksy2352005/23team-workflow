// M11 Veszteségkerülés (loss aversion): a 23 Team neon motion reel after reference video 11, beat by beat on the Hungarian voice.
import { WORDS } from './captions.js';
import { start, neon, P, circle, glowDot, txt, E, ss, seg, clamp, lerp, hash, ease3, WHITE, MID } from './kit.js';
const T = i => WORDS[i][1];
const STORY = 32.4, DUR = 34.9, X = 540, Y = 955;
function squares(c, x, y, s, rot) { for (let k = 0; k < 3; k++) { const r = (60 + k * 130) * s; c.save(); c.translate(x, y); c.rotate(rot * (k % 2 ? -1 : 1) * (1 + k * .3)); c.strokeRect(-r, -r, 2 * r, 2 * r); c.restore(); } }
function face(c, x, y, r, mood) { circle(c, x, y, r); c.beginPath(); if (mood > 0) c.arc(x, y + r * .02, r * .42, .35, Math.PI - .35); else { c.moveTo(x - r * .4, y + r * .3); for (let k = 1; k <= 4; k++) c.lineTo(x - r * .4 + k * r * .2, y + r * .3 + (k % 2 ? -r * .14 : 0)); } c.stroke(); }
function bubbleT(c, x, y, w, h, tx, ty, s, label) { c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, h / 2); c.stroke(); P(c, [[x - w * .15, y + h / 2], [tx, ty], [x + w * .05, y + h / 2]]); txt(c, label, x, y + 2, h * .42, { font: 'Inter', weight: 700, glow: 10 }); }
function brain(c, x, y, s) { c.beginPath(); c.moveTo(x - 70 * s, y + 20 * s); c.bezierCurveTo(x - 100 * s, y - 10 * s, x - 80 * s, y - 70 * s, x - 30 * s, y - 70 * s); c.bezierCurveTo(x - 10 * s, y - 95 * s, x + 50 * s, y - 90 * s, x + 60 * s, y - 55 * s); c.bezierCurveTo(x + 100 * s, y - 45 * s, x + 100 * s, y + 20 * s, x + 60 * s, y + 30 * s); c.bezierCurveTo(x + 40 * s, y + 55 * s, x - 40 * s, y + 55 * s, x - 70 * s, y + 20 * s); c.stroke();
  for (const [a, b, d] of [[-50, -40, 1], [0, -55, -1], [30, -10, 1], [-30, 5, -1]]) { c.beginPath(); c.arc(x + a * s, y + b * s, 18 * s, d > 0 ? 0 : Math.PI, d > 0 ? Math.PI : Math.PI * 2); c.stroke(); } P(c, [[x, y - 80 * s], [x - 4 * s, y + 40 * s]]); }
function cursor(c, x, y, a = 1) { c.save(); c.globalAlpha *= a; c.fillStyle = WHITE; c.strokeStyle = MID; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 56); c.lineTo(x + 14, y + 43); c.lineTo(x + 25, y + 66); c.lineTo(x + 34, y + 62); c.lineTo(x + 23, y + 39); c.lineTo(x + 41, y + 39); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function sign(c, x, y, r, plus) { circle(c, x, y, r); P(c, [[x - r * .5, y], [x + r * .5, y]]); if (plus) P(c, [[x, y - r * .5], [x, y + r * .5]]); }
const scenes = []; const sc = (t0, f) => scenes.push([t0, f]);
// A: as an entrepreneur you have to understand: nested squares turn and close in to a ring; a dot
sc(0, (c, t) => { const shr = ss(seg(t, T(2), T(3) + .3)), dot = ss(seg(t, T(5) - .2, T(5) + .2));
  if (shr < 1) neon(c, () => squares(c, X, Y, lerp(1.3, .2, shr), t * .5), { w: 4, alpha: 1 - shr });
  if (shr > 0 && dot < 1) neon(c, () => circle(c, X, Y, 60), { w: 4.5, alpha: shr * (1 - dot) }); if (dot > 0) glowDot(c, X, lerp(Y, Y - 220, ease3(dot)), 26, 1); });
// B: people don't want to win something, but to avoid losing: a frame; a line climbs with dots; then it zigzags down and the frame tilts; marks drop
sc(T(6) - .2, (c, t) => { const fr = E(t, T(7) - .1, .45, .35), up = seg(t, T(7), T(9) + .3), down = seg(t, T(11) - .1, T(13) + .3), tilt = ss(seg(t, T(13), T(13) + .5));
  c.save(); c.translate(X, Y); c.rotate(.18 * tilt); c.translate(-X, -Y);
  neon(c, () => c.strokeRect(X - 200 * Math.min(1.05, fr), Y - 200 * Math.min(1.05, fr), 400 * Math.min(1.05, fr), 400 * Math.min(1.05, fr)), { w: 5, glow: 30 });
  const U = [[X - 140, Y + 120], [X - 60, Y + 30], [X + 20, Y + 60], [X + 140, Y - 110]], D = [[X - 140, Y - 100], [X - 70, Y - 10], [X - 10, Y - 70], [X + 60, Y + 30], [X + 140, Y - 20]];
  const pts = down > 0 ? D.map((p, i) => [lerp(U[Math.min(i, 3)][0], p[0], ease3(down)), lerp(U[Math.min(i, 3)][1], p[1], ease3(down))]) : U; const n = down > 0 ? pts.length : Math.max(1, Math.ceil(up * U.length));
  if (up > 0) { neon(c, () => P(c, pts.slice(0, n)), { w: 4.5 }); pts.slice(0, n).forEach(([x, y]) => glowDot(c, x, y, 9, 1)); }
  if (tilt > 0) for (let k = 0; k < 3; k++) { const u = seg(t, T(13) + .1 + k * .15, T(13) + 1 + k * .15); if (u > 0 && u < 1) neon(c, () => P(c, [[X - 60 + k * 60, Y - 150 + 60 * u], [X - 60 + k * 60, Y - 120 + 60 * u]]), { w: 5, alpha: 1 - u }); }
  c.restore(); });
// C: losing thirty thousand forints hurts twice as much as the same gain pleases: a sad face with "−30e Ft"; it grows to twice the size; a small happy face with a small "+30e Ft"
sc(T(14) - .2, (c, t) => { const sad = E(t, T(14), .4, .45), b1 = E(t, T(16) - .1, .35, .5), big = ease3(seg(t, T(17), T(18) + .3)), hap = E(t, T(21) - .2, .4, .45), b2 = E(t, T(23) - .1, .35, .5);
  const sx = lerp(X, X - 150, big), sr = lerp(70, 140, big) * Math.min(1.05, sad);
  neon(c, () => face(c, sx, Y + 30, sr, -1), { w: 4.5, glow: 28 }); if (b1 > 0) neon(c, () => bubbleT(c, sx + sr * .8, Y + 30 - sr - 70, lerp(150, 230, big) * Math.min(1.08, b1), lerp(56, 84, big), sx + sr * .4, Y + 30 - sr * .7, 1, '−30e Ft'), { w: 3.5 });
  if (hap > 0) { neon(c, () => face(c, X + 230, Y + 90, 66 * Math.min(1.05, hap), 1), { w: 4 }); if (b2 > 0) neon(c, () => bubbleT(c, X + 300, Y - 30, 120 * Math.min(1.08, b2), 44, X + 260, Y + 30, 1, '+30e Ft'), { w: 3 }); } });
// D: this is no theory, it's simply how our brain works: a dot drops onto a little seesaw; then a brain in a beam of light
sc(T(25) - .2, (c, t) => { const drop = seg(t, T(25), T(26) + .2), see = ss(seg(t, T(26) + .1, T(26) + .4)), br = E(t, T(28) + .1, .45, .4), out = ss(seg(t, T(28) - .2, T(28) + .2));
  if (out < 1) { c.save(); c.globalAlpha = 1 - out; const y = lerp(Y - 260, Y + 20, Math.min(1, drop * drop * 1.2)); glowDot(c, X - 70, y, 20, 1); neon(c, () => { c.save(); c.translate(X, Y + 50); c.rotate(-.25 + .4 * see); P(c, [[-160, 0], [160, 0]]); c.restore(); P(c, [[X - 30, Y + 110], [X, Y + 50], [X + 30, Y + 110]]); }, { w: 4 }); c.restore(); }
  if (br > 0) { c.save(); c.globalAlpha = Math.min(1, br); const g = c.createLinearGradient(0, Y + 220, 0, Y - 160); g.addColorStop(0, 'rgba(235,242,255,.6)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, Y + 220); c.lineTo(X + 200, Y - 160); c.lineTo(X - 200, Y - 160); c.closePath(); c.fill(); c.restore(); glowDot(c, X, Y + 220, 16, Math.min(1, br)); neon(c, () => brain(c, X, Y - 30, 1.6 * Math.min(1.05, br)), { w: 4 }); } });
// E: if your business only shows what people can get, you leave out half the equation: a beam sweeps a ring into being; half of it fills with pluses; a line splits it; the other half stays empty
sc(T(33) - .2, (c, t) => { const sw = seg(t, T(34), T(38)), rg = ss(seg(t, T(37), T(38) + .2)), plus = seg(t, T(41) - .2, T(43) + .3), split = ss(seg(t, T(45) - .2, T(45) + .3)), gap = ss(seg(t, T(46), T(46) + .5)), R = 210, r = 90;
  if (rg < 1) { const a = -Math.PI * .8 + sw * Math.PI * 2; glowDot(c, X, Y, 22, 1 - rg); c.save(); c.globalAlpha = .4 * (1 - rg); const g = c.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, 'rgba(235,242,255,.8)'); g.addColorStop(1, 'rgba(235,242,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, R, a - .3, a + .3); c.fill(); c.restore(); neon(c, () => { c.beginPath(); c.arc(X, Y, R, -Math.PI * .8, a); c.stroke(); }, { w: 4, alpha: 1 - rg }); }
  if (rg > 0) { const lx = gap * -40; neon(c, () => { c.beginPath(); c.arc(X, Y, R, -Math.PI / 2, Math.PI / 2); c.arc(X, Y, r, Math.PI / 2, -Math.PI / 2, true); c.closePath(); c.stroke(); c.save(); c.translate(lx, 0); c.globalAlpha = 1 - .55 * gap; c.beginPath(); c.arc(X, Y, R, Math.PI / 2, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(X, Y, r, Math.PI / 2, Math.PI * 1.5); c.stroke(); c.restore(); }, { w: 4.5, alpha: rg });
    if (plus > 0) { c.save(); c.globalAlpha = .18 * ss(plus * 2); c.fillStyle = WHITE; c.beginPath(); c.arc(X, Y, R, -Math.PI / 2, Math.PI / 2); c.arc(X, Y, r, Math.PI / 2, -Math.PI / 2, true); c.fill(); c.restore(); for (let k = 0; k < 5; k++) { const a = E(t, T(41) + k * .12, .3, .5); if (a > 0) { const ang = -Math.PI / 2 + (k + .5) / 5 * Math.PI; neon(c, () => sign(c, X + Math.cos(ang) * 150, Y + Math.sin(ang) * 150, 16 * Math.min(1.1, a), true), { w: 3 }); } } }
    if (split > 0) neon(c, () => P(c, [[X, Y - 320 * split], [X, Y + 320 * split]]), { w: 3, alpha: 1 - ss(seg(t, T(47), T(47) + .5)) }); } });
// F: show them what they're already losing by not acting: the empty half fills with minuses; an X closes in the middle
sc(T(48) - .2, (c, t) => { const R = 210, r = 90, minus = seg(t, T(52) - .2, T(54) + .3), x = seg(t, T(57) - .1, T(58) + .2);
  neon(c, () => { circle(c, X, Y, R); circle(c, X, Y, r); P(c, [[X, Y - R], [X, Y - r]]); P(c, [[X, Y + r], [X, Y + R]]); }, { w: 4.5 });
  c.save(); c.globalAlpha = .18; c.fillStyle = WHITE; c.beginPath(); c.arc(X, Y, R, -Math.PI / 2, Math.PI / 2); c.arc(X, Y, r, Math.PI / 2, -Math.PI / 2, true); c.fill(); c.restore();
  for (let k = 0; k < 5; k++) { const ang = -Math.PI / 2 + (k + .5) / 5 * Math.PI; neon(c, () => sign(c, X + Math.cos(ang) * 150, Y + Math.sin(ang) * 150, 16, true), { w: 3 }); }
  for (let k = 0; k < 5; k++) { const a = E(t, T(52) + k * .14, .3, .5); if (a > 0) { const ang = Math.PI / 2 + (k + .5) / 5 * Math.PI; neon(c, () => sign(c, X + Math.cos(ang) * 150, Y + Math.sin(ang) * 150, 16 * Math.min(1.1, a), false), { w: 3 }); } }
  if (x > 0) neon(c, () => { const s = 44 * ease3(x); P(c, [[X - s, Y - s], [X + s, Y + s]]); P(c, [[X + s, Y - s], [X - s, Y + s]]); }, { w: 6, glow: 30 }); });
// G: because what they lose by standing still is marketing's least used tool: a small ring; a long line swings from it; a cursor glides in and clicks; rings ripple out; nested squares close it
sc(T(59) - .2, (c, t) => { const ln = seg(t, T(60), T(66) + .4), cur = seg(t, T(69) - .3, T(70) + .2), rip = seg(t, T(70) + .1, T(71) + .8), sq = ss(seg(t, T(71) + .3, T(71) + .9));
  neon(c, () => circle(c, X, Y, 40), { w: 4.5 });
  if (ln > 0 && cur <= 0) { const a = Math.PI / 2 - .5 + .35 * Math.sin(ln * 9); neon(c, () => P(c, [[X + Math.cos(a) * 40, Y + Math.sin(a) * 40], [X + Math.cos(a) * 520 * ease3(Math.min(1, ln * 3)), Y + Math.sin(a) * 520 * ease3(Math.min(1, ln * 3))]]), { w: 3, alpha: 1 - ss(seg(t, T(68), T(69))) }); }
  if (cur > 0 && cur < 1) cursor(c, lerp(X + 280, X + 6, ease3(cur * 1.4)), lerp(Y + 360, Y + 6, ease3(cur * 1.4)), 1 - ss(seg(cur, .85, 1)));
  if (rip > 0) neon(c, () => { for (let k = 0; k < 3; k++) { const u = clamp(rip * 1.3 - k * .15); if (u > 0) { c.globalAlpha = 1 - .5 * u; circle(c, X, Y, 40 + u * (50 + k * 40)); } } }, { w: 4, glow: 30 });
  if (sq > 0) neon(c, () => squares(c, X, Y, lerp(.2, .9, sq), t * .3), { w: 3.5, alpha: sq }); });
start({ scenes, words: WORDS, story: STORY, dur: DUR, caption: { font: '600 42px "Inter"', mode: 'fade', y: 470 } });
