// The First Step: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'VIRÁG Ft?'), document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const TOP = '#111a52', NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#0b1438';
const GLOW = (() => { const [c, x] = mk(); c.width = c.height = 256; const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,214,120,1)'); g.addColorStop(.25, 'rgba(255,214,120,.45)'); g.addColorStop(1, 'rgba(255,214,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return c; })();

function sp(tau, d = .4, b = .2) {   // a spring like Motion's { type: 'spring', visualDuration, bounce }
  if (tau <= 0) return 0; const z = Math.max(.05, 1 - b);
  if (z >= .999) { const w = 4.7 / d; return 1 - Math.exp(-w * tau) * (1 + w * tau); }
  const wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau));
}
const E = (t, at, d = .35, b = .35) => t < at ? 0 : sp(t - at, d, b);
const blinkAt = (t, seed) => { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; };
const reach = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const Hs = s => BASE_H * s * 1.08;
const wob = (t, at, d = .5, f = 18, a = .05) => t > at && t < at + d * 3 ? a * Math.sin((t - at) * f) * Math.exp(-(t - at) / d * 2) : 0;

// —— small pieces ——
function glow(c, x, y, r, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(GLOW, x - r, y - r, 2 * r, 2 * r); c.restore(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
function spot(c, x, y, w, a = .35) { const g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, `rgba(0,0,20,${a})`); g.addColorStop(1, 'rgba(0,0,20,0)'); c.save(); c.translate(x, y); c.scale(1, .2); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w, 0, 7); c.fill(); c.restore(); }
function mascot(c, P, k = 1) { spot(c, P.x, P.y + 4, Hs(P.s) * .42); scaled(c, P.x, P.y, k, () => drawMascot(c, { ...P, shadow: false })); }
function text(c, s, x, y, size, col = CREAM, align = 'center') { c.font = `${size}px "Lilita One"`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
function ell(c, x, y, rx, ry, col, rot = 0) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); c.fill(); }
// the stage: the part of the frame under the captions where the story plays; each shot names the box its content needs, and the camera fits that box inside the stage
const STAGE = { x0: 50, x1: 1030, y0: 760, y1: 1860 };   // the story plays under the caption area
const lerpBox = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
function stage(c, box, push, f) { const [x0, y0, x1, y1] = box, z = Math.min((STAGE.x1 - STAGE.x0) / (x1 - x0), (STAGE.y1 - STAGE.y0) / (y1 - y0)) * (.96 + .04 * push);
  c.save(); c.translate((STAGE.x0 + STAGE.x1) / 2, (STAGE.y0 + STAGE.y1) / 2); c.scale(z, z); c.translate(-(x0 + x1) / 2, -(y0 + y1) / 2); f(); c.restore(); }
function cam(c, x, y, z = 1, rot = 0, f) { c.save(); c.translate(540, 960); c.rotate(rot); c.scale(z, z); c.translate(-x, -y); f(); c.restore(); }
function star(c, x, y, r, k = 1, col = GOLD) { scaled(c, x, y, k, () => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }); }
function heart(c, x, y, r, k = 1, col = GOLD) { scaled(c, x, y, k, () => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.3, y, x - r * .8, y - r, x, y - r * .35); c.bezierCurveTo(x + r * .8, y - r, x + r * 1.3, y, x, y + r * .9); c.fill(); }); }
function bubble(c, x, y, w, h, k, tx, ty, draw, col = '#ffffff') { scaled(c, tx, ty, k, () => { c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, Math.min(60, h / 2)); c.fill();
  c.beginPath(); c.moveTo(x - w * .1, y + h / 2 - 4); c.lineTo(tx, ty); c.lineTo(x + w * .08, y + h / 2 - 4); c.fill(); draw && draw(); }); }
function check(c, x, y, r, k) { if (k <= 0) return; c.save(); c.strokeStyle = GOLD; c.lineWidth = r * .2; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, k)); c.stroke();
  c.globalAlpha = Math.min(1, k); c.beginPath(); c.moveTo(x - r * .42, y + r * .02); c.lineTo(x - r * .1, y + r * .34); c.lineTo(x + r * .45, y - r * .3); c.stroke(); c.restore(); }
function cross(c, x, y, r, k) { if (k <= 0) return; c.save(); c.strokeStyle = '#d94a3a'; c.lineCap = 'round'; c.lineWidth = r * .22; const u = Math.min(1, k * 2), v = clamp(k * 2 - 1);
  c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x - r + 2 * r * u, y - r + 2 * r * u); c.stroke(); if (v > 0) { c.beginPath(); c.moveTo(x + r, y - r); c.lineTo(x + r - 2 * r * v, y - r + 2 * r * v); c.stroke(); } c.restore(); }
function poof(c, x, y, k, r = 60) { if (k <= 0 || k >= 1) return; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, d = r * (.4 + k); ell(c, x + Math.cos(a) * d, y + Math.sin(a) * d, r * .3 * (1 - k), r * .3 * (1 - k), `rgba(246,239,220,${.7 * (1 - k)})`); } }

// —— little badges ——
function badge(c, kind, x, y, r, k = 1) {
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); const g = r * .55;
    if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (typeof kind === 'number') { c.save(); c.font = `700 ${g * 1.7}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(String(kind), x, y + g * .08); c.restore(); } });
}
function equals(c, x, y, w, k = 1) { if (k <= 0) return; scaled(c, x, y, k, () => { c.fillStyle = GOLD; c.beginPath(); c.roundRect(x - w / 2, y - w * .32, w, w * .2, w * .1); c.fill(); c.beginPath(); c.roundRect(x - w / 2, y + w * .12, w, w * .2, w * .1); c.fill(); }); }
// —— gym things ——
function dumbbell(c, x, y, s = 1, col = NAVY) { c.fillStyle = col; c.beginPath(); c.roundRect(x - 50 * s, y - 6 * s, 100 * s, 12 * s, 6 * s); c.fill(); for (const d of [-1, 1]) { c.beginPath(); c.roundRect(x + d * 50 * s - 14 * s, y - 28 * s, 28 * s, 56 * s, 8 * s); c.fill(); c.beginPath(); c.roundRect(x + d * 30 * s - 9 * s, y - 20 * s, 18 * s, 40 * s, 6 * s); c.fill(); } }
function treadmill(c, x, y, s = 1, col = NAVY) { c.fillStyle = col; c.beginPath(); c.roundRect(x - 60 * s, y - 14 * s, 120 * s, 18 * s, 9 * s); c.fill(); c.lineWidth = 9 * s; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 46 * s, y - 10 * s); c.lineTo(x + 30 * s, y - 80 * s); c.lineTo(x + 6 * s, y - 80 * s); c.stroke(); c.fillRect(x + 14 * s, y - 92 * s, 34 * s, 14 * s); }
const INKC = '#0b1438';
function tagIcon(c, x, y, s = 1) { c.save(); c.translate(x, y); c.rotate(-.2); c.fillStyle = CREAM; c.beginPath(); c.moveTo(-50 * s, -26 * s); c.lineTo(34 * s, -26 * s); c.lineTo(56 * s, 0); c.lineTo(34 * s, 26 * s); c.lineTo(-50 * s, 26 * s); c.closePath(); c.fill(); ell(c, 34 * s, 0, 6 * s, 6 * s, NAVY); c.font = `700 ${22 * s}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('9 900 Ft', -8 * s, 1 * s); c.restore(); }
function packages(c, x, y, s = 1) { ['ALAP', 'PLUSZ', 'PRÉMIUM'].forEach((n, i) => { const cx = x + (i - 1) * 74 * s, cy = y + Math.abs(i - 1) * 8 * s; c.save(); c.translate(cx, cy); c.rotate((i - 1) * .12); c.fillStyle = ['#8f98b0', GOLD2, '#c4566a'][i]; c.beginPath(); c.roundRect(-34 * s, -44 * s, 68 * s, 88 * s, 8 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; c.font = `700 ${n.length > 5 ? 11 * s : 14 * s}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, 0, -24 * s); for (let k = 0; k < 3; k++) c.fillRect(-20 * s, -4 * s + k * 14 * s, 40 * s, 5 * s); c.restore(); }); }
function target(c, x, y, r, hit = 1, t = 0) {   // a target; an arrow flies in from the upper right and sticks in the bullseye point first, feathers out, with a little wobble
  [[1, '#c4566a'], [.74, CREAM], [.48, '#c4566a'], [.22, GOLD]].forEach(([k, col]) => ell(c, x, y, r * k, r * k, col));
  if (hit <= 0) return; const u = Math.min(1, hit), d = (1 - u) * r * 2.2, wb = u >= 1 ? .12 * Math.sin(t * 30) * Math.exp(-(t % 100) * 0) : 0, ang = -Math.PI / 4 + wb * (hit > 1.0 ? 0 : 1);
  const tx = x + Math.cos(ang) * d, ty = y + Math.sin(ang) * d, L = r * 1.25, ex = tx + Math.cos(ang) * L, ey = ty + Math.sin(ang) * L;
  c.strokeStyle = NAVY; c.lineWidth = r * .09; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx, ty); c.lineTo(ex, ey); c.stroke();
  c.fillStyle = GOLD2; for (const side of [-1, 1]) { const px = -Math.sin(ang) * side, py = Math.cos(ang) * side; c.beginPath(); c.moveTo(ex - Math.cos(ang) * r * .3, ey - Math.sin(ang) * r * .3); c.lineTo(ex + px * r * .22, ey + py * r * .22); c.lineTo(ex + Math.cos(ang) * r * .08 + px * r * .22, ey + Math.sin(ang) * r * .08 + py * r * .22); c.lineTo(ex, ey); c.closePath(); c.fill(); }
  if (u < 1) { c.fillStyle = NAVY; c.beginPath(); c.moveTo(tx - Math.cos(ang) * r * .16, ty - Math.sin(ang) * r * .16); c.lineTo(tx - Math.sin(ang) * r * .08, ty + Math.cos(ang) * r * .08); c.lineTo(tx + Math.sin(ang) * r * .08, ty - Math.cos(ang) * r * .08); c.closePath(); c.fill(); }
}
function kettlebell(c, x, y, s = 1, col = NAVY) { c.strokeStyle = col; c.lineWidth = 12 * s; c.beginPath(); c.arc(x, y - 22 * s, 22 * s, Math.PI, 0); c.stroke(); ell(c, x, y + 12 * s, 36 * s, 32 * s, col); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 20 * s, y + 4 * s, 8 * s, 18 * s); }
function bike(c, x, y, s = 1, col = NAVY) { c.strokeStyle = col; c.lineWidth = 7 * s; c.lineCap = 'round'; c.beginPath(); c.arc(x - 36 * s, y + 18 * s, 22 * s, 0, 7); c.stroke(); c.beginPath(); c.arc(x + 36 * s, y + 18 * s, 22 * s, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x - 36 * s, y + 18 * s); c.lineTo(x - 6 * s, y - 14 * s); c.lineTo(x + 24 * s, y - 14 * s); c.lineTo(x + 36 * s, y + 18 * s); c.moveTo(x - 6 * s, y - 14 * s); c.lineTo(x + 2 * s, y + 18 * s); c.lineTo(x + 24 * s, y - 14 * s); c.moveTo(x - 12 * s, y - 26 * s); c.lineTo(x + 2 * s, y - 26 * s); c.moveTo(x + 24 * s, y - 14 * s); c.lineTo(x + 30 * s, y - 32 * s); c.lineTo(x + 40 * s, y - 32 * s); c.stroke(); }
function yogaMat(c, x, y, s = 1) { c.fillStyle = '#5d7fc4'; c.beginPath(); c.roundRect(x - 50 * s, y + 6 * s, 90 * s, 22 * s, 4 * s); c.fill(); ell(c, x - 50 * s, y - 4 * s, 24 * s, 32 * s, '#4a6bb0'); c.strokeStyle = '#8fb0ff'; c.lineWidth = 4 * s; c.beginPath(); for (let i = 0; i < 18; i++) { const a = i * .7, r = 4 * s + i * 1.1 * s; c.lineTo(x - 50 * s + Math.cos(a) * r * .75, y - 4 * s + Math.sin(a) * r); } c.stroke(); }
function stopwatch(c, x, y, s = 1, t = 0) { ell(c, x, y + 6 * s, 36 * s, 36 * s, NAVY); ell(c, x, y + 6 * s, 28 * s, 28 * s, CREAM); c.fillStyle = NAVY; c.fillRect(x - 8 * s, y - 40 * s, 16 * s, 12 * s); c.fillRect(x + 22 * s, y - 30 * s, 10 * s, 10 * s); c.strokeStyle = '#c4566a'; c.lineWidth = 5 * s; c.lineCap = 'round'; const a = t * 4 - Math.PI / 2; c.beginPath(); c.moveTo(x, y + 6 * s); c.lineTo(x + Math.cos(a) * 22 * s, y + 6 * s + Math.sin(a) * 22 * s); c.stroke(); }
function pulse(c, x, y, s = 1, p = 1) { c.strokeStyle = '#c4566a'; c.lineWidth = 8 * s; c.lineCap = 'round'; c.lineJoin = 'round'; const P = [[-90, 30], [-50, 30], [-35, 0], [-20, 50], [0, -30], [15, 20], [30, 10]]; c.beginPath(); P.forEach(([a, b], i) => { const f = clamp(p * (P.length - 1) - (i - 1)); if (i === 0) c.moveTo(x + a * s, y + b * s); else if (f > 0) { const [a0, b0] = P[i - 1]; c.lineTo(x + lerp(a0, a, f) * s, y + lerp(b0, b, f) * s); } }); c.stroke(); if (p >= 1) heart(c, x + 66 * s, y - 10 * s, 30 * s, 1, '#c4566a'); }
function maze(c, x, y, s = 1, t = 0) { c.strokeStyle = NAVY; c.lineWidth = 7 * s; c.lineCap = 'square'; const r = 56 * s; c.beginPath(); c.moveTo(x - r, y - r + 26 * s); c.lineTo(x - r, y + r); c.lineTo(x + r, y + r); c.lineTo(x + r, y - r); c.lineTo(x - r + 30 * s, y - r); c.moveTo(x - r + 26 * s, y + r); c.lineTo(x - r + 26 * s, y - r + 30 * s); c.moveTo(x - r + 52 * s, y - r + 26 * s); c.lineTo(x + r - 26 * s, y - r + 26 * s); c.lineTo(x + r - 26 * s, y + r - 26 * s); c.moveTo(x, y + r); c.lineTo(x, y - 4 * s); c.stroke(); ell(c, x - r - 16 * s, y - r + 12 * s, 9 * s, 9 * s, '#c4566a'); c.save(); c.font = `700 ${50 * s}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c4566a'; c.fillText('?', x + r + 34 * s, y - r + 6 * s + Math.sin(t * 4) * 4 * s); c.restore(); }
function upArrow(c, x, y, s, col = GOLD) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 40 * s); c.lineTo(x + 30 * s, y - 6 * s); c.lineTo(x + 12 * s, y - 6 * s); c.lineTo(x + 12 * s, y + 34 * s); c.lineTo(x - 12 * s, y + 34 * s); c.lineTo(x - 12 * s, y - 6 * s); c.lineTo(x - 30 * s, y - 6 * s); c.closePath(); c.fill(); }
function fork(c, x, y, s) { c.strokeStyle = NAVY; c.lineWidth = 8 * s; c.lineCap = 'round'; ell(c, x - 70 * s, y + 20 * s, 12 * s, 12 * s, NAVY); for (const d of [-1, 0, 1]) { c.beginPath(); c.moveTo(x - 70 * s, y + 20 * s); c.quadraticCurveTo(x - 20 * s, y + 20 * s + d * 30 * s, x + 20 * s, y + 20 * s + d * 46 * s); c.stroke(); } c.save(); c.font = `700 ${56 * s}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c4566a'; c.fillText('?', x + 64 * s, y + 18 * s); c.restore(); }
function passCard(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(-70 * s + 4, -44 * s + 5, 140 * s, 88 * s, 10 * s); c.fill(); c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(-70 * s, -44 * s, 140 * s, 88 * s, 10 * s); c.fill(); c.fillStyle = GOLD; c.fillRect(-70 * s, -18 * s, 140 * s, 14 * s); c.font = `700 ${20 * s}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = CREAM; c.fillText('BÉRLET', 0, 20 * s); c.restore(); }
function footprint(c, x, y, s, k = 1, col = GOLD) { if (k <= 0) return; c.save(); c.globalAlpha *= Math.min(1, k); ell(c, x, y, 22 * s, 11 * s, col); ell(c, x + 26 * s, y - 2 * s, 8 * s, 7 * s, col); c.restore(); }
function tangle(c, x, y, r, p, t) {   // a tangled scribble of confusion, drawn in as p goes 0..1
  if (p <= 0) return; c.save(); c.strokeStyle = 'rgba(246,239,220,.85)'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); const n = Math.floor(120 * p);
  for (let i = 0; i <= n; i++) { const a = i * .37 + Math.sin(i * .13) * 2, rr = r * (.35 + .65 * Math.abs(Math.sin(i * .21 + 1.3))); const px = x + Math.cos(a) * rr * 1.3 + Math.sin(t * 2 + i * .05) * 3, py = y + Math.sin(a * 1.13) * rr * .8; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); c.restore();
  if (p > .6) for (let k = 0; k < 3; k++) { const a = t * 1.6 + k * 2.1; text(c, '?', x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * .9, 44, GOLD); }
}
function gymFront(c, x0, y0, w, h, o = {}) {   // a gym front: big windows (o.tm, o.rack: the machines appearing in them), a sign, a price tag (o.tag), a door that opens (o.doorOpen), a tally of the beginners who came in (o.count); o.ghost < 1: a gold outline still filling in
  const x1 = x0 + w, y1 = y0 + h, lit = o.lit ?? 1, gh = o.ghost ?? 1;
  c.save(); c.globalAlpha *= gh;
  c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(x0 + 12, y0 + 12, w, h); c.fillStyle = '#e9dcc0'; c.fillRect(x0, y0, w, h); c.fillStyle = WOOD; c.fillRect(x0 - 14, y0 - 20, w + 28, 26);
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(x0 + w / 2 - 130, y0 + 26, 260, 74, 12); c.fill(); if (lit > 0) glow(c, x0 + w / 2, y0 + 62, 180, .3 * lit);
  c.save(); c.font = '700 48px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('GYM', x0 + w / 2, y0 + 64); c.restore();
  const wy = y0 + 130, wh = 230; c.fillStyle = '#f0d9a8'; c.fillRect(x0 + 30, wy, w - 60, wh); glow(c, x0 + w / 2, wy + wh / 2, 200, .15);
  c.save(); c.beginPath(); c.rect(x0 + 30, wy, w - 60, wh); c.clip();
  if (o.tm > 0) scaled(c, x0 + w * .3, wy + wh - 12, Math.min(1.1, o.tm), () => treadmill(c, x0 + w * .3, wy + wh - 12, 1.15, 'rgba(28,36,80,.75)'));
  if (o.rack > 0) scaled(c, x0 + w * .72, wy + wh - 12, Math.min(1.1, o.rack), () => { const rx = x0 + w * .72, ry = wy + wh - 12; c.fillStyle = 'rgba(28,36,80,.75)'; c.fillRect(rx - 60, ry - 120, 10, 120); c.fillRect(rx + 50, ry - 120, 10, 120); for (let k = 0; k < 3; k++) { c.fillRect(rx - 60, ry - 110 + k * 40, 120, 6); dumbbell(c, rx, ry - 116 + k * 40, .42, 'rgba(28,36,80,.75)'); } });
  (o.inside || []).forEach(f => f(wy, wh)); c.restore(); c.fillStyle = WOOD; c.fillRect(x0 + w / 2 - 5, wy, 10, wh); c.fillRect(x0 + 24, wy + wh, w - 48, 10);
  const dx = o.door ?? (x0 + w / 2), dw = 130, dop = o.doorOpen || 0, pw = (dw - 20) * (1 - .82 * dop); c.fillStyle = '#3a2416'; c.fillRect(dx - dw / 2, y1 - 220, dw, 220); c.fillStyle = `rgba(255,214,140,${.35 + .6 * dop})`; c.fillRect(dx - dw / 2 + 10, y1 - 210, dw - 20, 210); if (dop > 0) glow(c, dx, y1 - 100, 150, .5 * dop);
  c.fillStyle = '#6e4a2c'; c.fillRect(dx - dw / 2 + 10, y1 - 210, pw, 210); c.fillStyle = 'rgba(255,214,140,.45)'; c.fillRect(dx - dw / 2 + 10 + pw * .18, y1 - 196, pw * .64, 80); ell(c, dx - dw / 2 + 10 + pw * .85, y1 - 100, 6, 6, GOLD);
  if (o.num) badge(c, o.num, x0 + w - 40, y0 + 62, 30, 1);
  c.restore();
  if (gh < 1) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 6; c.setLineDash([22, 16]); c.lineDashOffset = -(o.t || 0) * 60; c.globalAlpha = 1 - gh * .8; c.strokeRect(x0, y0 - 20, w, h + 20); c.restore(); }
  if (o.tag > 0) { const sw = .25 * Math.sin((o.t || 0) * 6) * Math.exp(-(o.tagAge || 0) * 2.2); c.save(); c.translate(x0 + w - 80, y0 + 100); c.rotate(sw); c.strokeStyle = '#b9a888'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 40); c.stroke(); scaled(c, 0, 40, Math.min(1.1, o.tag), () => { c.save(); c.translate(-2, 70); c.rotate(.2); tagIcon(c, 0, 0, .8); c.restore(); }); c.restore(); }
  (o.count || []).forEach((k, i) => { if (k <= 0) return; const hx = x0 + w / 2 - ((o.count.length - 1) / 2 - i) * 62, hy = y0 - 70; scaled(c, hx, hy + 30, Math.min(1.15, k), () => { glow(c, hx, hy, 50, .25); ell(c, hx, hy, 20, 20, '#3b5bd1'); c.fillStyle = '#3b5bd1'; c.beginPath(); c.roundRect(hx - 18, hy + 20, 36, 26, 12); c.fill(); ell(c, hx - 7, hy - 3, 3, 4, INKC); ell(c, hx + 7, hy - 3, 3, 4, INKC); }); });
}
function street(c, t) {   // the street: the sky in the caption blue, a few stars, the pavement
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  for (let i = 0; i < 30; i++) { const sx = -100 + hash(i * 2.3) * 1280, sy = 800 + hash(i * 5.1) * 300, tw = .4 + .6 * Math.abs(Math.sin(t * 1.5 + i)); ell(c, sx, sy, 2.4, 2.4, `rgba(246,239,220,${.45 * tw})`); }
  c.fillStyle = '#1e2864'; for (const [bx, bw, bh] of [[-300, 300, 360], [1040, 300, 420]]) c.fillRect(bx, 1700 - bh, bw, bh);
  c.fillStyle = '#2a3054'; c.fillRect(-400, 1700, 1880, 500); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let r = 0; r < 7; r++) for (let x = -400 + (r % 2) * 40; x < 1480; x += 90) { c.beginPath(); c.roundRect(x, 1716 + r * 34, 80, 26, 8); c.stroke(); }
}
function gymInside(c, t, o = {}) {   // inside a gym: the wall in the caption blue, a mirror band, machines along the back, a rubber floor
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  c.fillStyle = 'rgba(140,160,220,.12)'; c.fillRect(-400, 1180, 1880, 260); c.fillStyle = 'rgba(255,255,255,.06)'; for (let k = -2; k < 12; k++) { c.beginPath(); c.moveTo(k * 140, 1180); c.lineTo(k * 140 + 60, 1180); c.lineTo(k * 140 - 20, 1440); c.lineTo(k * 140 - 80, 1440); c.closePath(); c.fill(); }
  c.fillStyle = WOOD; c.fillRect(-400, 1440, 1880, 12);
  treadmill(c, 140, 1640, 1.3, '#2b3a80'); treadmill(c, 330, 1640, 1.3, '#2b3a80'); c.fillStyle = '#2b3a80'; c.fillRect(870, 1460, 14, 180); c.fillRect(1010, 1460, 14, 180); for (let k = 0; k < 3; k++) { c.fillRect(870, 1490 + k * 50, 154, 8); dumbbell(c, 947, 1484 + k * 50, .45, '#3c4c98'); }
  if (o.warm) { glow(c, 540, 1300, 420, .18); c.fillStyle = '#3f6b4a'; c.beginPath(); c.ellipse(700, 1560, 40, 70, 0, 0, 7); c.fill(); c.fillStyle = WOOD; c.fillRect(676, 1590, 48, 50); }
  c.fillStyle = '#2a2f45'; c.fillRect(-400, 1640, 1880, 600); c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 3; for (let x = -400; x < 1480; x += 120) { c.beginPath(); c.moveTo(x, 1640); c.lineTo(x - 60, 2200); c.stroke(); }
}
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
const walkX = (t, a, b, x0, x1) => { const u = seg(t, a, b); return [lerp(x0, x1, ss(u)), u > 0 && u < 1 ? 1 : 0, u * (b - a) * 7]; };

// —— the people ——
const WOMAN = o => ({ id: 'woman', skin: 'blue3', fem: 'pony', s: 1.9, smile: .7, ...o });   // the beginner
const SELLER = o => ({ id: 'seller', skin: 'owner', specs: 1, s: 1.9, smile: .9, ...o });   // gym one's salesman, in glasses
const COACH = o => ({ id: 'coach', skin: 'owner', cap: 1, s: 1.9, smile: .9, ...o });   // gym two's coach, in a cap
const PASS = [['blue1', null], ['blue2', 'bob'], ['blue1', null], ['blue2', 'long']];
const passer = (i, o) => ({ id: 'p' + i, skin: PASS[i][0], fem: PASS[i][1], s: 1.3, smile: .8, ...o });

// —— the shots ——
const SHOT = {
  street(c, t) {   // two gyms opened on the same street: the first rises, its twin copies itself out of it; the same machines appear in both windows, the same price tag swings from both; yet the beginners walk into one: a tally grows over each door; then we glide to the first gym as she arrives
    const r1 = E(t, .05, .45, .35), cl = ss(seg(t, ...HIT.clone)), gh = ss(seg(t, HIT.clone[1] - .2, HIT.clone[1] + .3)), tm = E(t, HIT.icons[0], .35, .45), rk = E(t, HIT.icons[1], .35, .45), tg = E(t, HIT.icons[2], .35, .45);
    const W = HIT.walkers.map((st, i) => ({ st, to: [2, 1, 2, 2, 2][i], from: [1020, 60, 60, 1020, 1020][i] })), arr = w => w.st + 1.1;
    const doorOf = g => W.filter(w => w.to === g).reduce((m, w) => Math.max(m, ss(seg(t, arr(w) - .45, arr(w) - .15)) * (1 - ss(seg(t, arr(w) + .2, arr(w) + .55)))), 0);
    const countOf = g => W.filter(w => w.to === g).map(w => E(t, arr(w), .3, .5));
    const push = ss(seg(t, HIT.push, HIT.push + 1.0)), herU = seg(t, HIT.her, HIT.her + 1.0), herDoor = ss(seg(t, HIT.her + .7, HIT.her + 1.0));
    stage(c, lerpBox([0, 820, 1080, 1860], [0, 1060, 640, 1860], push), 0, () => { street(c, t);
      const eqs = [[tm, 1290], [rk, 1410], [tg, 1170]]; eqs.forEach(([k, y]) => equals(c, 540, y, 46, k * (1 - push)));
      if (cl > 0 && push < 1) { c.save(); c.globalAlpha = 1 - push; gymFront(c, lerp(40, 580, ss(cl)), 1090, 460, 610, { num: 2, ghost: gh, t, tm, rack: rk, tag: tg, tagAge: t - HIT.icons[2], doorOpen: doorOf(2), count: countOf(2) }); c.restore(); }
      scaled(c, 270, 1700, Math.min(1, r1), () => gymFront(c, 40, 1090, 460, 610, { num: 1, t, tm, rack: rk, tag: tg, tagAge: t - HIT.icons[2], doorOpen: Math.max(doorOf(1), herDoor), count: countOf(1) }));
      W.forEach((w, i) => { const u = seg(t, w.st, arr(w)); if (u <= 0 || u >= 1) return; const tx = w.to === 1 ? 270 : 810; c.save(); c.globalAlpha = Math.min(clamp(u / .2), clamp((1 - u) / .2)); mascot(c, passer(i % 4, { x: lerp(w.from, tx, ss(u)), y: 1810, f: tx > w.from ? .6 : -.6, walk: 1, phi: u * 9 })); c.restore(); });
      if (herU > 0) { c.save(); c.globalAlpha = Math.min(clamp(herU / .2), 1 - ss(seg(herU, .85, 1))); mascot(c, WOMAN({ x: lerp(80, 250, ss(herU)), y: 1810, s: 1.6, f: .6, walk: herU < 1 ? 1 : 0, phi: herU * 8, blink: blinkAt(t, 3) })); c.restore(); } });
  },
  gym1(c, t) {   // she walks into the first gym; the salesman talks machines, equipment, membership packages: bubbles pile up; she leaves, all in a tangle
    const [x0, walk0, phi0] = walkX(t, HIT.enter, HIT.enter + 1.0, 120, 360), lv = seg(t, HIT.leave, HIT.stop), ot = seg(t, HIT.out, HIT.out + .8), tg = ss(seg(t, HIT.tangle, HIT.tangle + .7)), gone = ss(seg(t, HIT.leave - .3, HIT.leave + .2));
    stage(c, [60, 860, 1020, 1800], 0, () => { gymInside(c, t);
      const talking = t > HIT.talk && t < HIT.leave; mascot(c, SELLER({ x: 790, y: 1790, f: -.45, smile: 1, blink: blinkAt(t, 1), handL: talking ? [700 + Math.sin(t * 7) * 14, 1560 - Math.abs(Math.sin(t * 5)) * 30] : undefined, squash: talking ? .02 * Math.sin(t * 14) : 0 }));
      const leaving = t > HIT.leave, x = leaving ? (ot > 0 ? lerp(240, 150, ss(ot)) : lerp(360, 240, ss(lv))) : x0, al = t < HIT.enter + .3 ? clamp((t - HIT.enter) / .3) : ot > 0 ? 1 - ss(seg(ot, .4, 1)) : 1;
      const worried = ss(seg(t, HIT.b3, HIT.b3 + .6));
      c.save(); c.globalAlpha = al; mascot(c, WOMAN({ x, y: 1790, f: leaving ? -.6 : .45, walk: leaving ? (lv > 0 && lv < 1) || (ot > 0 && ot < 1) ? 1 : 0 : walk0, phi: leaving ? (lv + ot) * 8 : phi0, smile: lerp(.7, 0, worried), sad: .4 * worried, o: t > HIT.flood[0] && !leaving ? .5 : 0, lean: -.05 * worried, blink: blinkAt(t, 3) })); c.restore();
      if (tg > 0) { c.save(); c.globalAlpha = 1 - ss(seg(ot, .4, 1)); tangle(c, x, 1240, 70, tg, t); c.restore(); }
      const GX = [175, 405, 635, 865], B = [[HIT.b1, GX[2], 990, 'tm'], [HIT.b2, GX[1], 990, 'db'], [HIT.b3, GX[3], 990, 'pk'], ...HIT.flood.map((ft, i) => [ft, [GX[0], GX[0], GX[1], GX[2], GX[3]][i], [990, 1180, 1180, 1180, 1180][i], ['kb', 'bike', 'mat', 'tag', 'watch'][i]])];
      B.forEach(([bt, bx, by, kind], i) => { const k = E(t, bt, .3, .45) * (1 - gone); if (k <= 0) return; const w = 200, h = 130; bubble(c, bx, by, w, h, k, bx + (790 - bx) * .2, by + h / 2 + 26, () => { const s = .8; if (kind === 'db') dumbbell(c, bx, by, .9 * s); if (kind === 'tm') treadmill(c, bx, by + 40 * s, .9 * s); if (kind === 'pk') packages(c, bx, by, .85 * s); if (kind === 'tag') tagIcon(c, bx, by, .8 * s); if (kind === 'kb') kettlebell(c, bx, by, 1 * s); if (kind === 'bike') bike(c, bx, by, 1 * s); if (kind === 'mat') yogaMat(c, bx + 6, by, 1 * s); if (kind === 'watch') stopwatch(c, bx, by, 1 * s, t); }); }); });
  },
  gym2(c, t) {   // then the second gym: instead of listing every service, the coach folds the long list away and asks one simple question
    const [x0, walk, phi] = walkX(t, HIT.enter2, HIT.enter2 + 1.0, 120, 360), fan = ss(seg(t, HIT.fan, HIT.fan + .6)), fold = ss(seg(t, HIT.fold, HIT.fold + .5)), one = E(t, HIT.one, .35, .45), qk = E(t, HIT.q, .3, .5);
    stage(c, [60, 860, 1020, 1800], 0, () => { gymInside(c, t, { warm: 1 });
      mascot(c, COACH({ x: 790, y: 1790, f: -.45, smile: 1, blink: blinkAt(t, 1), handL: fold > 0 && fold < 1 ? [700, 1520] : undefined }));
      c.save(); c.globalAlpha = clamp((t - HIT.enter2) / .3); mascot(c, WOMAN({ x: x0, y: 1790, f: .45, walk, phi, smile: .7, blink: blinkAt(t, 3) })); c.restore();
      if (fan > 0 && fold < 1) for (let i = 0; i < 7; i++) { const a = (i - 3) * .2 * fan, cx = 600 + Math.sin(a) * 300 * lerp(1, 0, fold), cy = 1270 - Math.cos(a) * 300 * lerp(1, 0, fold) + 200; c.save(); c.globalAlpha = (1 - fold) * .9; c.translate(cx, cy); c.rotate(a); c.fillStyle = CREAM; c.beginPath(); c.roundRect(-55, -75, 110, 150, 10); c.fill(); c.fillStyle = 'rgba(28,36,80,.3)'; for (let k = 0; k < 4; k++) c.fillRect(-38, -50 + k * 26, 76 - (k % 2) * 20, 10); c.fillStyle = [GOLD, '#c4566a', '#5d7fc4'][i % 3]; c.fillRect(-55, -75, 110, 18); c.restore(); }
      poof(c, 600, 1270, seg(t, HIT.fold + .45, HIT.fold + .95), 80);
      if (one > 0) bubble(c, 580, 1130, 170, 140, one, 700, 1320, () => text(c, '?', 580, 1134, 96, qk > 0 ? GOLD2 : NAVY)); if (qk > 0) spark(c, 580, 1130, t, HIT.q, 5, 120, 14); });
  },
  talk(c, t) {   // "what would you like to achieve?": the coach's question, a target; her answer: fitter, but she doesn't know where to start
    const ak = E(t, HIT.ask, .35, .45), out1 = ss(seg(t, 31.4, 31.75)), fk = E(t, HIT.fit, .35, .45), wk = ss(seg(t, HIT.where - .15, HIT.where + .2));
    bg(c);
    stage(c, [180, 960, 900, 1800], 0, () => {
      mascot(c, WOMAN({ x: 330, y: 1790, s: 2.1, f: .4, smile: t > HIT.where ? .3 : .8, sad: t > HIT.where ? .3 : 0, blink: blinkAt(t, 3) }));
      mascot(c, COACH({ x: 760, y: 1790, s: 2.1, f: -.4, smile: 1, blink: blinkAt(t, 1) }));
      if (ak > 0 && out1 < 1) bubble(c, 650, 1150, 300, 200, ak * (1 - out1), 720, 1340, () => { target(c, 600, 1165, 62, ss(seg(t, HIT.ask + .25, HIT.ask + .55)), t); text(c, '?', 730, 1150, 90, NAVY); });
      if (fk > 0) bubble(c, 400, 1150, 300, 200, fk, 350, 1340, () => { c.save(); c.globalAlpha = 1 - wk; pulse(c, 380, 1150, 1.1, seg(t, HIT.fit, HIT.fit + .7)); c.restore(); if (wk > 0) { c.save(); c.globalAlpha = wk; maze(c, 380, 1150, 1, t); c.restore(); } }); });
  },
  plan(c, t) {   // so they show her a simple beginner's plan: the looming wall turns into three easy steps: the first workout, the first week, what comes next; suddenly stepping in isn't scary: she climbs the first step
    const mo = ss(seg(t, HIT.morph, HIT.morph + 1.3)), ci = E(t, HIT.coachIn, .35, .45), lit = [HIT.s1, HIT.s2, HIT.s3].map(x => E(t, x, .3, .5)), hop = ss(seg(t, HIT.step, HIT.step + .6)), brave = E(t, HIT.brave, .3, .5);
    bg(c);
    stage(c, [60, 880, 1020, 1800], 0, () => {
      const cols = [[300, 520, 1600], [520, 740, 1440], [740, 960, 1280]];
      cols.forEach(([a, b, top], i) => { const tp = lerp(1000, top, ss(seg(mo, i * .15, .7 + i * .15))), dark = 1 - ss(seg(mo, .2, 1));
        c.fillStyle = dark > .5 ? '#151c4a' : '#e9dcc0'; c.globalAlpha = 1; c.fillRect(a, tp, b - a + 1, 1760 - tp); if (dark > 0 && dark <= .5) { c.fillStyle = `rgba(21,28,74,${dark * 2})`; c.fillRect(a, tp, b - a + 1, 1760 - tp); }
        c.fillStyle = dark > .5 ? '#1d2660' : '#f6efdc'; c.fillRect(a, tp, b - a + 1, 18);
        if (lit[i] > 0) { glow(c, (a + b) / 2, tp + 90, 140, .4 * Math.min(1, lit[i])); const cx = (a + b) / 2, cy = Math.min(tp + 100, 1700); scaled(c, cx, cy, Math.min(1.1, lit[i]), () => { if (i === 0) dumbbell(c, cx, cy, .75); if (i === 1) for (let d = 0; d < 7; d++) ell(c, cx - 72 + d * 24, cy, 9, 9, d < 3 ? GOLD2 : 'rgba(28,36,80,.3)'); if (i === 2) { c.strokeStyle = NAVY; c.lineWidth = 8; c.beginPath(); c.moveTo(cx - 20, cy + 40); c.lineTo(cx - 20, cy - 40); c.stroke(); c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(cx - 20, cy - 40); c.lineTo(cx + 40, cy - 24); c.lineTo(cx - 20, cy - 8); c.fill(); } }); badge(c, i + 1, a + 30, tp + 40, 22, Math.min(1, lit[i])); } });
      if (mo < .3) { c.save(); c.globalAlpha = 1 - mo / .3; c.strokeStyle = 'rgba(246,239,220,.3)'; c.lineWidth = 4; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(250, 1100 + k * 120); c.lineTo(285, 1100 + k * 120 + Math.sin(t * 9 + k) * 6); c.stroke(); } c.restore(); }
      if (ci > 0) { c.save(); c.globalAlpha = Math.min(1, ci); mascot(c, COACH({ x: 850, y: 1280, s: 1.6, f: -.45, smile: 1, blink: blinkAt(t, 1), handL: t > HIT.s1 - .3 && t < HIT.s3 + .6 ? [760, 1120] : undefined })); c.restore(); }
      const wx = lerp(170, 410, hop), wy = lerp(1760, 1600, hop) - Math.sin(hop * Math.PI) * 60;
      mascot(c, WOMAN({ x: wx, y: wy, s: 1.7, f: .45, smile: brave > 0 ? 1 : mo < .5 ? .1 : .6, sad: mo < .5 ? .5 : 0, look: -.3, walk: hop > 0 && hop < 1 ? 1 : 0, phi: hop * 6, blink: blinkAt(t, 3) }));
      if (brave > 0) spark(c, 410, 1350, t, HIT.brave, 6, 150, 16); });
  },
  psych(c, t) {   // and here psychology in marketing comes in: a head in profile; inside, a turning gear and a heart; beside it, a chart rising
    const hk = E(t, HIT.head, .35, .45), mk = E(t, HIT.mkt, .35, .45);
    bg(c);
    stage(c, [140, 900, 940, 1760], 0, () => { const x = 470, y = 1300;
      scaled(c, x, y, Math.min(1, hk), () => { c.fillStyle = CREAM; c.beginPath(); c.moveTo(x - 90, y + 300); c.lineTo(x - 90, y + 180); c.bezierCurveTo(x - 210, y + 120, x - 230, y - 150, x - 60, y - 220); c.bezierCurveTo(x + 80, y - 270, x + 200, y - 180, x + 190, y - 60); c.lineTo(x + 240, y + 20); c.lineTo(x + 195, y + 45); c.quadraticCurveTo(x + 212, y + 78, x + 190, y + 100); c.quadraticCurveTo(x + 200, y + 140, x + 160, y + 160); c.quadraticCurveTo(x + 100, y + 182, x + 60, y + 170); c.lineTo(x + 60, y + 300); c.closePath(); c.fill(); ell(c, x + 150, y - 70, 10, 10, NAVY);
        c.save(); c.translate(x - 30, y - 50); c.rotate(t * 1.2); c.fillStyle = GOLD2; for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); c.fillRect(-14, -78, 28, 30); } ell(c, 0, 0, 58, 58, GOLD2); ell(c, 0, 0, 22, 22, CREAM); c.restore(); heart(c, x + 70, y + 40, 40, 1, '#c4566a'); });
      if (mk > 0) scaled(c, 800, 1500, Math.min(1, mk), () => { c.fillStyle = 'rgba(246,239,220,.25)'; c.fillRect(700, 1520, 220, 6); [60, 110, 170].forEach((h, i) => { const g = Math.min(1, clamp((t - HIT.mkt - i * .12) / .4)); c.fillStyle = [CREAM, GOLD2, GOLD][i]; c.fillRect(712 + i * 70, 1520 - h * g, 50, h * g); }); upArrow(c, 900, 1290, .9); }); });
  },
  weigh(c, t) {   // people don't only weigh what a business offers, but how confident they feel to take the next step: the offer; a confidence gauge swings up; she steps forward onto the next footprint
    const of = HIT.offer, gk = ss(seg(t, ...HIT.gauge)), gi = E(t, HIT.gauge[0] - .5, .35, .45), st = ss(seg(t, HIT.stepf, HIT.stepf + .6)), ok = E(t, HIT.stepf + .6, .3, .5);
    bg(c);
    stage(c, [60, 900, 1020, 1800], 0, () => {
      const ck = E(t, 51.5, .35, .45); if (ck > 0) scaled(c, 300, 1110, Math.min(1, ck), () => { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(156, 986, 300, 260, 18); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(150, 980, 300, 260, 18); c.fill();
        [[dumbbell, 230, 1050, .6], [treadmill, 370, 1080, .55]].forEach(([f, x, y, s]) => f(c, x, y, s)); tagIcon(c, 300, 1170, .9); });
      if (t > of) { const k = Math.sin(clamp((t - of) / 1) * Math.PI); glow(c, 300, 1110, 200, .4 * k); }
      if (gi > 0) scaled(c, 760, 1180, Math.min(1, gi), () => { c.lineWidth = 34; c.lineCap = 'butt'; [['#c4566a', Math.PI, Math.PI * 1.33], [GOLD2, Math.PI * 1.33, Math.PI * 1.66], ['#7fbf8a', Math.PI * 1.66, Math.PI * 2]].forEach(([col, a, b]) => { c.strokeStyle = col; c.beginPath(); c.arc(760, 1180, 150, a, b); c.stroke(); });
        const a = Math.PI * (1.08 + .82 * gk) + wob(t, HIT.gauge[1], .3, 14, .06); c.strokeStyle = CREAM; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(760, 1180); c.lineTo(760 + Math.cos(a) * 130, 1180 + Math.sin(a) * 130); c.stroke(); ell(c, 760, 1180, 18, 18, CREAM); });
      for (let k = 0; k < 4; k++) footprint(c, 300 + k * 170, 1790, 1.1, E(t, HIT.stepf - 1.2 + k * .12, .3, .5) * (k === 1 ? 1 : .55), k === 1 ? GOLD : 'rgba(236,189,74,.5)');
      mascot(c, WOMAN({ x: lerp(300, 470, st), y: 1780, s: 1.8, f: .5, smile: lerp(.6, 1, gk), walk: st > 0 && st < 1 ? 1 : 0, phi: st * 6, blink: blinkAt(t, 3) }));
      check(c, 470, 1300, 40, ok); });
  },
  got(c, t) {   // and that's what the second gym understood: its front, a gold check, the coach at the door
    const gk = E(t, HIT.got, .35, .45);
    stage(c, [60, 820, 1020, 1860], 0, () => { street(c, t); gymFront(c, 180, 1000, 720, 700, { num: 2, lit: 1, doorGlow: .4 + .4 * Math.min(1, gk) });
      if (gk > 0) { glow(c, 540, 1350, 420, .35 * Math.min(1, gk)); badge(c, 'ex', 0, 0, 0, 0); check(c, 540, 900, 60, gk); spark(c, 540, 1300, t, HIT.got, 6, 300, 18); }
      mascot(c, COACH({ x: 760, y: 1810, s: 1.7, f: -.3, smile: 1, blink: blinkAt(t, 1) })); });
  },
  final(c, t) {   // the first gym sold her a membership; the second showed her how to start: split: a pass handed over, she stands holding it; a glowing path, she sets off along it
    const cd = ss(seg(t, HIT.card - .2, HIT.card + .5)), sh = ss(seg(t, HIT.show - .2, HIT.show + .3)), [gx, walk, phi] = walkX(t, HIT.go, HIT.go + 1.2, 780, 925);
    bg(c);
    stage(c, [40, 900, 1040, 1800], 0, () => { c.fillStyle = 'rgba(246,239,220,.15)'; c.fillRect(538, 1060, 4, 700); badge(c, 1, 290, 1080, 30, 1); badge(c, 2, 790, 1080, 30, 1);
      mascot(c, SELLER({ x: 420, y: 1780, s: 1.4, f: -.45, smile: .9, blink: blinkAt(t, 1), handL: cd < 1 ? [lerp(360, 250, cd), 1650] : undefined }));
      mascot(c, WOMAN({ x: 150, y: 1780, s: 1.4, f: .45, smile: .4, blink: blinkAt(t, 3), handR: cd >= 1 ? [225, 1650] : undefined })); passCard(c, cd >= 1 ? 235 : lerp(360, 240, cd), 1630, .7, -.1);
      for (let k = 0; k < 4; k++) footprint(c, 760 + k * 70, 1790, .8, E(t, HIT.show + k * .12, .3, .5), GOLD); if (sh > 0) glow(c, 820, 1780, 200, .3 * sh);
      mascot(c, COACH({ x: 590, y: 1780, s: 1.4, f: .45, smile: 1, blink: blinkAt(t, 1), handR: sh > 0 ? reach([630, 1640], [690, 1600], sh) : undefined }));
      mascot(c, WOMAN({ x: gx, y: 1780, s: 1.4, f: .5, walk, phi, smile: 1, blink: blinkAt(t, 5) })); if (t > HIT.go) spark(c, gx, 1500, t, HIT.go + .3, 5, 90, 12); });
  },
};

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['Ugyanolyan','ugyanolyan','ugyanaz','kezdőt','miért','gépekről','felszereltségről','bérletcsomagokról','összezavarodott','egyetlen','egyszerű','elérni','fittebb','kezdje','kezdőknek','első','ijesztőnek','pszichológia','magabiztosnak','következő','bérletet','hogyan']);
const bare = w => w.replace(/[.,:;!?…„”"]/g, '');
const CAP = { x: 130, y: 540, size: 56, lh: 72, maxW: 790, maxLines: 2 }, CAPFONT = `700 ${CAP.size}px "Montserrat"`;   // the caption area, placed for Instagram's preview: Montserrat Bold, two lines at most
const PAGES = (() => {   // group the words into short pages: a new page after a full stop, a question, a colon, or once a page is full
  const m = document.createElement('canvas').getContext('2d'); m.font = CAPFONT; const space = m.measureText(' ').width;
  const pages = []; let cur = [], x = 0, line = 0;
  const flush = () => { if (cur.length) pages.push(cur); cur = []; x = 0; line = 0; };
  WORDS.forEach(([w, t0], i) => { const wd = m.measureText(w).width;
    if (x > 0 && x + space + wd > CAP.maxW) { line++; x = 0; if (line >= CAP.maxLines) flush(); }
    cur.push({ w, t: t0, x: x ? x + space : 0, line, wd, key: KEY.has(bare(w)) }); x = (x ? x + space : 0) + wd;
    const prev = WORDS[i + 1]; if (/[.?!:…”]$/.test(w) || (/,$/.test(w) && cur.length >= 4) || cur.length >= 7 || (prev && prev[1] - t0 > 1.1)) flush(); });
  flush(); return pages.map((p, i) => ({ words: p, t0: p[0].t - .05, t1: pages[i + 1] ? pages[i + 1][0].t - .05 : STORY - .5 }));
})();
function captions(c, t) {
  c.setTransform(K, 0, 0, K, 0, 0);
  // behind the words, plain: the same blue as the top of every scene, fading into the picture
  c.fillStyle = TOP; c.fillRect(0, 0, 1080, 660); const g = c.createLinearGradient(0, 660, 0, 760); g.addColorStop(0, TOP); g.addColorStop(1, 'rgba(17,26,82,0)'); c.fillStyle = g; c.fillRect(0, 660, 1080, 100);
  const p = PAGES.find(p => t >= p.t0 && t < p.t1); if (!p) return;
  const out = ss(seg(t, p.t1 - .12, p.t1)), now = p.words.filter(w => t >= w.t - .02).pop();
  c.save(); c.globalAlpha = 1 - out; c.translate(0, -30 * out); c.font = CAPFONT; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  p.words.forEach(w => { const k = E(t, w.t - .06, .28, .45); if (k <= 0) return; const a = Math.min(1, k * 2.2), y = CAP.y + w.line * CAP.lh + (1 - Math.min(1, k)) * 34, sc = .75 + .25 * k, cx = CAP.x + w.x + w.wd / 2;
    const hot = w === now, col = hot || w.key ? GOLD : CREAM;
    c.save(); c.globalAlpha = a * (1 - out); c.translate(cx, y); c.scale(sc, sc); c.translate(-cx, -y);
    c.shadowColor = 'rgba(0,0,15,.6)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.fillStyle = col; c.fillText(w.w, CAP.x + w.x, y); c.shadowColor = 'transparent';
    c.restore(); });
  c.restore();
}

// —— the locked 23 Team end card (ANIMATION-STYLE.md) ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();
function endCard(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  const u = ss(seg(t, STORY + .15, STORY + 1.05)), w = W * .30, h = w * LOGO.height / LOGO.width, sc = 1.04 - .04 * u;
  c.save(); c.globalAlpha = u * .75; c.filter = u < 1 ? `blur(${(1 - u) * 6 * K}px)` : 'none';
  c.translate(W / 2, H / 2); c.scale(sc, sc); c.drawImage(LOGO_W, -w / 2, -h / 2, w, h); c.restore();
}
function vignette(c) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H * .5, H * .3, W / 2, H * .5, H * .8); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, 'rgba(4,6,30,.4)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
const WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55, PAGE = .6;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'whip' && dt < WHIP && i > 0) {
    const e = ss(dt / WHIP), blur = Math.sin(e * Math.PI) * 26 * K;
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${blur}px)`; c.drawImage(bufA, -W * e, 0); c.drawImage(bufB, W * (1 - e), 0); c.restore();
  } else if (kind === 'clock' && dt < CLOCK && i > 0) {   // a clock hand sweeps round and wipes in the new shot: the next day
    const e = ss(dt / CLOCK), a = -Math.PI / 2 + e * Math.PI * 2, cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t); c.drawImage(bufA, 0, 0);
    c.save(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, -Math.PI / 2, a); c.closePath(); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
    c.save(); c.strokeStyle = GOLD; c.lineCap = 'round'; c.lineWidth = 14 * K; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); c.fillStyle = GOLD; c.beginPath(); c.arc(cx, cy, 22 * K, 0, 7); c.fill(); c.restore();
  } else if (kind === 'page' && dt < PAGE && i > 0) {   // a page turns: the old shot curls over from the right, its cream back showing, a shadow on the new one
    const e = ss(dt / PAGE), xf = W * (1 - e), flap = Math.min(xf, (W - xf) * .55);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t); c.drawImage(bufB, 0, 0);
    const sg = c.createLinearGradient(xf, 0, xf + 90 * K, 0); sg.addColorStop(0, 'rgba(0,0,20,.45)'); sg.addColorStop(1, 'rgba(0,0,20,0)'); c.fillStyle = sg; c.fillRect(xf, 0, 90 * K, H);
    c.save(); c.beginPath(); c.rect(0, 0, xf, H); c.clip(); c.drawImage(bufA, 0, 0); c.restore();
    if (flap > 0) { const g = c.createLinearGradient(xf - flap, 0, xf, 0); g.addColorStop(0, '#e9dcc0'); g.addColorStop(.85, '#f6efdc'); g.addColorStop(1, '#cdbf9c'); c.fillStyle = g; c.fillRect(xf - flap, 0, flap, H); c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(xf - flap - 6 * K, 0, 6 * K, H); }
  } else if (kind === 'dream' && dt < DREAM && i > 0) {   // into (or out of) an imagined scene: a soft, warm, blurred dissolve
    const e = ss(dt / DREAM), b = Math.sin(e * Math.PI);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${b * 18 * K}px) brightness(${1 + .25 * b})`; c.globalAlpha = 1; c.drawImage(bufA, 0, 0); c.globalAlpha = e; c.drawImage(bufB, 0, 0); c.restore();
  } else if (kind === 'punch' && dt < PUNCH && i > 0) {
    const e = 1 - Math.pow(1 - dt / PUNCH, 3), s = lerp(1.22, 1, e);
    paintShot(bctx, i, t); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.filter = `blur(${(1 - e) * 10 * K}px)`; c.drawImage(bufB, 0, 0); c.restore();
  } else paintShot(c, i, t);
  vignette(c);
  const fade = ss(seg(t, STORY - .7, STORY)); if (fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits and the footsteps
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
