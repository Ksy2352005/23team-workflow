// The Flower Shop: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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

// —— little badges: cream with a gold ring and a navy (or gold) glyph ——
function badge(c, kind, x, y, r, k = 1, o = {}) {
  if (k <= 0) return; scaled(c, x, y, k, () => {
    if (o.glow) glow(c, x, y, r * 2.4, .5 * o.glow);
    ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke();
    const g = r * .55; c.strokeStyle = NAVY; c.fillStyle = NAVY; c.lineWidth = r * .1; c.lineCap = 'round';
    if (kind === 'smile') { ell(c, x - g * .35, y - g * .25, g * .1, g * .14, NAVY); ell(c, x + g * .35, y - g * .25, g * .1, g * .14, NAVY); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.beginPath(); c.arc(x, y + g * .05, g * .5, .3, Math.PI - .3); c.stroke(); }
    if (kind === 'heart') heart(c, x, y, g * .9, 1, '#d94a6a');
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, GOLD2);
    if (kind === 'star') star(c, x, y, g, 1, GOLD);
    if (kind === 'sun') { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; c.strokeStyle = GOLD; c.beginPath(); c.moveTo(x + Math.cos(a) * g * .55, y + Math.sin(a) * g * .55); c.lineTo(x + Math.cos(a) * g * .9, y + Math.sin(a) * g * .9); c.stroke(); } ell(c, x, y, g * .4, g * .4, GOLD); }
    if (kind === 'gift') { c.fillStyle = '#d94a6a'; c.fillRect(x - g * .7, y - g * .3, g * 1.4, g); c.fillStyle = GOLD; c.fillRect(x - g * .12, y - g * .3, g * .24, g); c.fillRect(x - g * .8, y - g * .45, g * 1.6, g * .25); ell(c, x - g * .25, y - g * .6, g * .25, g * .15, GOLD, -.4); ell(c, x + g * .25, y - g * .6, g * .25, g * .15, GOLD, .4); }
    if (kind === 'thanks') { c.fillStyle = NAVY; c.beginPath(); c.roundRect(x - g * .7, y - g * .5, g * 1.4, g, g * .15); c.fill(); c.strokeStyle = CREAM; c.lineWidth = r * .06; c.beginPath(); c.moveTo(x - g * .7, y - g * .5); c.lineTo(x, y + g * .05); c.lineTo(x + g * .7, y - g * .5); c.stroke(); }
    if (kind === 'bulb') { ell(c, x, y - g * .15, g * .55, g * .6, GOLD); c.fillStyle = '#8f98b0'; c.fillRect(x - g * .25, y + g * .4, g * .5, g * .35); }
    if (kind === 'flower') flower(c, x, y, g * .9, 'daisy');
    if (kind === 'price') { c.fillStyle = NAVY; c.save(); c.translate(x, y); c.rotate(-.3); c.beginPath(); c.moveTo(-g * .8, -g * .4); c.lineTo(g * .5, -g * .4); c.lineTo(g * .9, 0); c.lineTo(g * .5, g * .4); c.lineTo(-g * .8, g * .4); c.closePath(); c.fill(); ell(c, g * .45, 0, g * .1, g * .1, CREAM); text(c, 'Ft', -g * .2, g * .02, g * .6, CREAM); c.restore(); }
  });
}

// —— the flowers: cream roses, gold tulips and sunflowers, a few soft pink ones; bouquets wrapped in kraft paper with a gold ribbon ——
const FCOL = { rose: ['#f3e6c4', '#d9c79f'], pink: ['#e7a0b2', '#c9788e'], tulip: ['#ecbd4a', '#c99a3a'], daisy: ['#fbf6ea', '#e0d6bd'], sun: ['#ecbd4a', '#b8862a'] };
function flower(c, x, y, r, kind = 'rose') {
  const [a, b] = FCOL[kind] || FCOL.rose;
  if (kind === 'daisy' || kind === 'sun') { for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; ell(c, x + Math.cos(an) * r * .55, y + Math.sin(an) * r * .55, r * .42, r * .17, i % 2 ? a : b, an); } ell(c, x, y, r * .32, r * .32, kind === 'sun' ? '#6b4423' : GOLD); return; }
  if (kind === 'tulip') { ell(c, x, y, r * .55, r * .7, b); c.fillStyle = a; c.beginPath(); c.moveTo(x - r * .55, y - r * .1); c.lineTo(x - r * .3, y - r * .75); c.lineTo(x, y - r * .3); c.lineTo(x + r * .3, y - r * .75); c.lineTo(x + r * .55, y - r * .1); c.quadraticCurveTo(x, y + r * .9, x - r * .55, y - r * .1); c.fill(); return; }
  ell(c, x, y, r, r * .92, b); ell(c, x - r * .08, y - r * .05, r * .8, r * .72, a); c.strokeStyle = b; c.lineWidth = r * .1; c.lineCap = 'round';
  c.beginPath(); for (let i = 0; i <= 24; i++) { const an = i / 24 * Math.PI * 4, rr = r * (.08 + .5 * i / 24); c.lineTo(x - r * .06 + Math.cos(an) * rr, y - r * .05 + Math.sin(an) * rr * .9); } c.stroke();
}
const MIX = [['daisy', -.62, -.72, .8], ['sun', .62, -.74, .85], ['tulip', -.3, -1.0, .9], ['rose', .32, -1.02, 1], ['pink', 0, -1.22, 1], ['rose', -.35, -.78, 1], ['pink', .36, -.8, .95], ['tulip', .02, -.86, .9], ['daisy', -.08, -1.1, .75]];
function bouquet(c, x, y, s, o = {}) {   // y = the bottom of the paper cone
  const H = 260 * s, W2 = 120 * s;
  c.strokeStyle = '#3f7d4f'; c.lineWidth = 7 * s; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * 6 * s, y - H * .2); c.lineTo(x + i * 34 * s, y - H * 1.0); c.stroke(); }
  for (const [lx, ly, a] of [[-.8, -.68, -.9], [.8, -.7, .9], [-.5, -.95, -.5], [.55, -.97, .5]]) ell(c, x + lx * W2, y + ly * H, 40 * s, 15 * s, '#4f9a5c', a);
  (o.mix || MIX).forEach(([k, dx, dy, rs]) => flower(c, x + dx * W2 * 1.2, y + dy * H, 46 * s * rs, k));
  const g = c.createLinearGradient(x - W2, 0, x + W2, 0); g.addColorStop(0, '#e9dcc0'); g.addColorStop(.5, '#f6efdc'); g.addColorStop(1, '#cdbf9c');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - W2, y - H * .55); c.lineTo(x + W2, y - H * .55); c.lineTo(x + 26 * s, y); c.lineTo(x - 26 * s, y); c.closePath(); c.fill();
  c.fillStyle = 'rgba(160,120,60,.25)'; c.beginPath(); c.moveTo(x - W2, y - H * .55); c.lineTo(x - W2 * .2, y - H * .55); c.lineTo(x - 10 * s, y); c.lineTo(x - 26 * s, y); c.fill();
  c.fillStyle = GOLD; c.fillRect(x - 40 * s, y - H * .3, 80 * s, 12 * s); ell(c, x - 26 * s, y - H * .3, 26 * s, 13 * s, GOLD, -.4); ell(c, x + 26 * s, y - H * .3, 26 * s, 13 * s, GOLD, .4); ell(c, x, y - H * .3 + 6 * s, 10 * s, 10 * s, GOLD2);
  if (o.tag) tagCard(c, x + W2 * 1.05, y - H * .28, s, o.tag, o.tagK ?? 1, o.tagGlow || 0);
}
function tagCard(c, x, y, s, kind, k = 1, gl = 0) {   // a little card on a gold string with a hand-drawn mark (a smile, a heart...)
  if (k <= 0) return; c.strokeStyle = GOLD2; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x - 50 * s, y); c.quadraticCurveTo(x - 20 * s, y - 10 * s, x, y + 6 * s); c.stroke();
  scaled(c, x + 40 * s, y + 40 * s, k, () => { if (gl) glow(c, x + 40 * s, y + 40 * s, 120 * s, .5 * gl); c.save(); c.translate(x + 40 * s, y + 40 * s); c.rotate(.12); c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(-38 * s, -44 * s, 84 * s, 96 * s);
    c.fillStyle = CREAM; c.fillRect(-42 * s, -48 * s, 84 * s, 96 * s); c.strokeStyle = GOLD2; c.lineWidth = 3 * s; c.strokeRect(-36 * s, -42 * s, 72 * s, 84 * s);
    if (kind === 'smile') { ell(c, -12 * s, -10 * s, 4 * s, 6 * s, NAVY); ell(c, 12 * s, -10 * s, 4 * s, 6 * s, NAVY); c.strokeStyle = GOLD2; c.lineWidth = 5 * s; c.lineCap = 'round'; c.beginPath(); c.arc(0, 2 * s, 20 * s, .3, Math.PI - .3); c.stroke(); }
    else if (kind === 'heart') heart(c, 0, 0, 20 * s, 1, '#d94a6a'); else if (kind === 'blank') {} else badge(c, kind, 0, 0, 30 * s);
    c.restore(); });
}

// —— the shop from the street: a navy front, a striped awning, the gold sign, a big window full of bouquets, a door with a bell ——
function shopFront(c, t, o = {}) {
  const n = o.night ?? 0;
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  c.fillStyle = n ? '#0d1440' : '#1a2563'; c.fillRect(60, 760, 960, 960);
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(300, 790, 480, 100, 16); c.fill(); c.strokeStyle = CREAM; c.lineWidth = 6; c.beginPath(); c.roundRect(312, 802, 456, 76, 10); c.stroke(); text(c, 'VIRÁG', 540, 842, 66, GOLD);
  for (let s2 = 0; s2 < 12; s2++) { const x0 = 80 + s2 * 77; c.fillStyle = s2 % 2 ? '#26368c' : '#efe4c8'; c.fillRect(x0, 910, 77, 80); c.beginPath(); c.arc(x0 + 38.5, 990, 38.5, 0, Math.PI); c.fill(); }
  // the window
  c.fillStyle = CREAM; c.fillRect(110, 1060, 560, 470); const wg = c.createLinearGradient(0, 1080, 0, 1510); wg.addColorStop(0, '#3a52a8'); wg.addColorStop(1, '#22307a'); c.fillStyle = wg; c.fillRect(126, 1076, 528, 438); glow(c, 390, 1300, 360, .35 + .25 * (o.lit || 0));
  c.fillStyle = WOOD; c.fillRect(126, 1440, 528, 22);
  (o.bouquets ?? [[220, 1440], [390, 1440], [560, 1440]]).forEach(([bx, by, k = 1, tag, tk, tg], i) => { if (k > 0) scaled(c, bx, by, Math.min(1, k), () => bouquet(c, bx, by, .55, { tag, tagK: tk, tagGlow: tg })); });
  c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(150, 1076); c.lineTo(250, 1076); c.lineTo(160, 1514); c.lineTo(126, 1514); c.fill();
  // the door, and its bell
  c.fillStyle = CREAM; c.fillRect(720, 1060, 250, 600); c.fillStyle = '#121a4e'; c.fillRect(736, 1076, 218, 584); if (o.door) { c.fillStyle = 'rgba(255,225,160,.35)'; c.fillRect(736, 1076, 218 * o.door, 584); }
  c.fillStyle = WOOD; c.fillRect(736 + 218 * (o.door || 0), 1076, 218 * (1 - (o.door || 0)), 584); ell(c, 736 + 218 * (1 - (o.door || 0)) - 26 + 218 * (o.door || 0), 1380, 10, 10, GOLD);
  const sw = o.bellT !== undefined && t > o.bellT ? Math.sin((t - o.bellT) * 14) * .4 * Math.exp(-(t - o.bellT) * 2) : 0; c.save(); c.translate(845, 1040); c.rotate(sw); ell(c, 0, 16, 16, 20, GOLD); c.restore();
  // the pavement
  c.fillStyle = '#2a3474'; c.fillRect(-800, 1720, 2680, 400); c.fillStyle = '#c9b791'; c.fillRect(-800, 1716, 2680, 8); c.strokeStyle = 'rgba(233,220,192,.1)'; c.lineWidth = 3; for (let x = -800; x < 1900; x += 140) { c.beginPath(); c.moveTo(x, 1724); c.lineTo(x - 60, 2100); c.stroke(); }
}
// —— inside: shelves of buckets, a wooden counter, the door with its bell on the left ——
function shopInside(c, t, o = {}) {
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  c.fillStyle = '#1a2563'; c.fillRect(-200, 760, 1480, 820); c.fillStyle = 'rgba(255,255,255,.035)'; for (let x = -200; x < 1280; x += 70) c.fillRect(x, 760, 30, 820);
  for (const sy of [1000, 1220]) { c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(500, sy + 16, 560, 14); c.fillStyle = WOOD; c.beginPath(); c.roundRect(490, sy, 560, 20, 8); c.fill(); }
  [[560, 1000, 'rose'], [690, 1000, 'tulip'], [820, 1000, 'pink'], [950, 1000, 'sun'], [560, 1220, 'daisy'], [690, 1220, 'rose'], [820, 1220, 'tulip'], [950, 1220, 'daisy']].forEach(([bx, by, k]) => {
    c.fillStyle = '#8f98b0'; c.beginPath(); c.moveTo(bx - 40, by - 70); c.lineTo(bx + 40, by - 70); c.lineTo(bx + 32, by); c.lineTo(bx - 32, by); c.fill();
    c.strokeStyle = '#3f7d4f'; c.lineWidth = 5; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(bx + i * 10, by - 70); c.lineTo(bx + i * 22, by - 120); c.stroke(); } for (const [dx, dy] of [[-22, -130], [22, -132], [0, -150]]) flower(c, bx + dx, by + dy, 24, k); });
  if (o.door !== false) { c.fillStyle = CREAM; c.fillRect(90, 900, 260, 680); c.fillStyle = '#2d4596'; c.fillRect(106, 916, 228, 664); glow(c, 220, 1250, 260, .25 * (o.doorLight || 0)); c.fillStyle = WOOD; c.fillRect(106 + 228 * (o.door || 0), 916, 228 * (1 - (o.door || 0)), 664);
    const sw = o.bellT !== undefined && t > o.bellT ? Math.sin((t - o.bellT) * 14) * .4 * Math.exp(-(t - o.bellT) * 2) : 0; c.save(); c.translate(220, 880); c.rotate(sw); ell(c, 0, 16, 16, 20, GOLD); c.restore(); }
  c.fillStyle = '#5a3a22'; c.fillRect(-200, 1580, 1480, 600); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 1610; y < 2100; y += 40) { c.beginPath(); c.moveTo(-200, y); c.lineTo(1280, y); c.stroke(); }
}
function counter(c, x0, x1, top) { c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(x0 + 10, top + 14, x1 - x0, 20); c.fillStyle = WOOD; c.beginPath(); c.roundRect(x0 - 16, top - 12, x1 - x0 + 32, 26, 10); c.fill(); c.fillStyle = CREAM; c.fillRect(x0, top + 14, x1 - x0, 300); c.fillStyle = '#26368c'; c.fillRect(x0, top + 60, x1 - x0, 36); c.fillStyle = GOLD; c.fillRect(x0, top + 56, x1 - x0, 4); c.fillRect(x0, top + 96, x1 - x0, 4); }

// —— the people ——
const FLORIST = o => ({ id: 'florist', skin: 'owner', tache: 1, s: 2.2, smile: .7, ...o });
const GIRL = o => ({ id: 'girl', skin: 'blue2', fem: 'pony', s: 1.3, smile: .7, ...o });
const PASSER = [['blue1', null], ['blue3', 'long'], ['blue2', 'bob'], ['blue1', 'hat'], ['blue3', null]];

// —— the shots ——
const SHOT = {
  shop(c, t) {   // a man had a little flower shop
    stage(c, [60, 760, 1020, 1760], seg(t, 0, 2.7), () => { shopFront(c, t, { lit: ss(seg(t, HIT.open, HIT.open + .8)) });
      mascot(c, FLORIST({ x: 845, y: 1700, s: 2.0, f: -.2, alpha: clamp((t - HIT.open) / .4), smile: .8, blink: blinkAt(t, 1) })); });
  },
  market(c, t) {   // every day he bought fresh flowers: he carries a crate of them, the sun coming up
    const u = seg(t, ...HIT.crate);
    const g = c.createLinearGradient(0, 760, 0, 1700); g.addColorStop(0, TOP); g.addColorStop(1, '#3a4f9e'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
    stage(c, [80, 820, 1000, 1760], 0, () => {
      glow(c, 800, 1120, 400, .5 * ss(u)); ell(c, 800, 1180 - 120 * ss(u), 70, 70, '#ffe08a');
      c.fillStyle = '#2a3474'; c.fillRect(-200, 1600, 1480, 400); c.fillStyle = '#c9b791'; c.fillRect(-200, 1596, 1480, 8);
      const P = FLORIST({ x: lerp(250, 760, ss(u)), y: 1700, f: .7, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 7, smile: .9, blink: blinkAt(t, 1) }), Hh = Hs(P.s);
      P.handL = [P.x - .05 * Hh, P.y - .45 * Hh]; P.handR = [P.x + .3 * Hh, P.y - .45 * Hh]; mascot(c, P);
      const cx = P.x + .14 * Hh, cy = P.y - .42 * Hh; c.fillStyle = WOOD; c.fillRect(cx - 110, cy - 20, 220, 90); c.strokeStyle = '#5a3a22'; c.lineWidth = 5; c.strokeRect(cx - 110, cy - 20, 220, 90); c.beginPath(); c.moveTo(cx - 110, cy + 25); c.lineTo(cx + 110, cy + 25); c.stroke();
      [['rose', -70], ['tulip', -25], ['pink', 20], ['sun', 65], ['daisy', 0]].forEach(([k, dx], i) => flower(c, cx + dx, cy - 40 - (i === 4 ? 30 : 0), 30, k)); });
  },
  arrange(c, t) {   // he arranged them carefully: from above, the stems gather into a bouquet, a ribbon is tied
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [180, 780, 900, 1720], seg(t, 4.9, 6.35), () => {
      c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(180, 800, 720, 900, 30); c.fill(); c.strokeStyle = 'rgba(70,40,15,.3)'; c.lineWidth = 3; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(200, 830 + k * 62); c.lineTo(880, 840 + k * 62); c.stroke(); }
      const kinds = ['rose', 'tulip', 'pink', 'sun', 'daisy'], pos = [[-70, -40], [60, -60], [0, -110], [-110, 40], [100, 30]];
      HIT.stems.forEach((ts, i) => { const k = ss(seg(t, ts - .25, ts + .05)); if (k <= 0) return; const [dx, dy] = pos[i], x = lerp(dx < 0 ? 240 : 840, 540 + dx, k), y = lerp(1600, 1150 + dy, k);
        c.strokeStyle = '#3f7d4f'; c.lineWidth = 9; c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(x, 540, .8), y + 360); c.stroke(); ell(c, x + 30, y + 120, 34, 13, '#4f9a5c', .7); flower(c, x, y, 62, kinds[i]); });
      const rb = E(t, HIT.ribbon, .3, .5); if (rb > 0) scaled(c, 540, 1460, rb, () => { c.fillStyle = GOLD; c.fillRect(490, 1448, 100, 22); ell(c, 505, 1450, 40, 20, GOLD, -.4); ell(c, 575, 1450, 40, 20, GOLD, .4); ell(c, 540, 1458, 14, 14, GOLD2); }); });
  },
  window(c, t) {   // and put them in the shop window
    stage(c, [100, 1050, 680, 1540], 0, () => { shopFront(c, t, { bouquets: [[220, 1440, E(t, HIT.place[0], .3, .45)], [390, 1440, E(t, HIT.place[1], .3, .45)], [560, 1440, E(t, HIT.place[2], .3, .45)]], lit: ss(seg(t, HIT.place[2], HIT.place[2] + .5)) }); });
  },
  passby(c, t) {   // yet people mostly just walked past the shop
    stage(c, [60, 760, 1020, 1800], 0, () => {
      shopFront(c, t);
      c.save(); c.beginPath(); c.rect(126, 1076, 528, 364); c.clip(); drawMascot(c, { ...FLORIST({ x: 390, y: 1560, s: 1.4, f: .2, smile: .2, sad: .5, look: .2, blink: blinkAt(t, 1) }), shadow: false }); c.restore();
      HIT.passers.forEach((tp, i) => { const u = seg(t, tp, tp + 2.0); if (u <= 0 || u >= 1) return; const dir = 1, x = dir > 0 ? lerp(160, 920, u) : lerp(920, 160, u), [skin, fem] = PASSER[i];
        mascot(c, { id: 'p' + i, skin, fem, s: 2.0, x, y: 1820, f: .85 * dir, walk: 1, phi: u * Math.PI * 9, smile: .3, alpha: Math.min(clamp(u / .12), clamp((1 - u) / .12)), blink: blinkAt(t, 9 + i) }); }); });
  },
  girl(c, t) {   // one day a little girl came in, and asked
    const u = seg(t, ...HIT.girlwalk), dr = Math.sin(seg(t, HIT.bell - .2, HIT.girlwalk[0] + .8) * Math.PI);
    stage(c, [80, 860, 1060, 1720], 0, () => {
      shopInside(c, t, { door: dr, doorLight: dr, bellT: HIT.bell });
      mascot(c, FLORIST({ x: 840, y: 1690, f: -.3, smile: .7, blink: blinkAt(t, 1) })); counter(c, 620, 1060, 1440);
      mascot(c, GIRL({ x: lerp(220, 470, u), alpha: clamp((t - HIT.bell) / .3), y: 1700, f: .7, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 7, blink: blinkAt(t, 2) })); });
  },
  ask(c, t) {   // "What occasion are these flowers for?"
    const b = E(t, HIT.ask, .35, .45);
    stage(c, [200, 800, 1040, 1720], 0, () => {
      shopInside(c, t, { door: false }); mascot(c, FLORIST({ x: 840, y: 1690, f: -.3, smile: .7, look: .3, blink: blinkAt(t, 1) })); counter(c, 620, 1060, 1440);
      mascot(c, GIRL({ x: 470, y: 1700, f: .4, look: -.4, smile: .6, blink: blinkAt(t, 2) }));
      bubble(c, 420, 1040, 300, 200, b, 450, 1340, () => { bouquet(c, 360, 1110, .38); badge(c, 'q', 490, 1030, 56); }); });
  },
  answer(c, t) {   // "No special occasion. They're just flowers."
    const sh = t > HIT.shrug ? Math.sin(clamp((t - HIT.shrug) / .6) * Math.PI) : 0, b = E(t, 18.6, .35, .45), pl = E(t, HIT.plain, .3, .5);
    stage(c, [200, 800, 1040, 1720], 0, () => {
      shopInside(c, t, { door: false });
      mascot(c, FLORIST({ x: 840, y: 1690, f: -.3, smile: .5, armL: .4 + 1.2 * sh, armR: .4 + 1.2 * sh, squash: -.03 * sh, blink: blinkAt(t, 1) })); counter(c, 620, 1060, 1440);
      mascot(c, GIRL({ x: 470, y: 1700, f: .4, look: -.4, smile: .4, blink: blinkAt(t, 2) }));
      bubble(c, 820, 1010, 260, 200, b, 820, 1200, () => { flower(c, 790, 1010, 60, 'daisy'); c.fillStyle = NAVY; c.fillRect(860, 1000, 50, 12); if (pl > 0) { c.fillStyle = 'rgba(246,239,220,.5)'; } }); });
  },
  think(c, t) {   // the girl thought about it
    const ch = ss(seg(t, HIT.chin - .3, HIT.chin)), bl = E(t, HIT.bulb, .35, .5);
    stage(c, [260, 820, 820, 1720], seg(t, 23.8, 26.85), () => {
      shopInside(c, t, { door: false });
      const G = GIRL({ s: 2.3, x: 540, y: 1720, f: 0, smile: bl > .5 ? .9 : .4, look: -.4 * ch, blink: blinkAt(t, 2) }); if (ch > .5) G.chin = 'R'; mascot(c, G);
      if (bl > 0) { glow(c, 700, 980, 160, .5 * Math.min(1, bl)); badge(c, 'bulb', 700, 980, 70, bl); } });
  },
  idea(c, t) {   // "Then why don't you write that they could make someone's day better?"
    const b = E(t, HIT.idea, .35, .45), br = ss(seg(t, HIT.bright - .3, HIT.bright + .4));
    stage(c, [180, 760, 1040, 1720], 0, () => {
      shopInside(c, t, { door: false }); mascot(c, FLORIST({ x: 840, y: 1690, f: -.3, smile: .7, look: .3, blink: blinkAt(t, 1) })); counter(c, 620, 1060, 1440);
      mascot(c, GIRL({ x: 470, y: 1700, f: .4, look: -.4, smile: 1, blink: blinkAt(t, 2) }));
      bubble(c, 480, 960, 560, 360, b, 470, 1340, () => { bouquet(c, 340, 1100, .5, { tag: 'blank', tagK: 1 });
        const sx = 620, sy = 960; drawMascot(c, { id: 'day', skin: 'blue3', s: .95, x: sx, y: sy + 130, f: -.3, smile: lerp(0, 1, br), sad: lerp(.6, 0, br), shadow: false }); if (br > 0) { glow(c, sx, sy - 10, 120, .5 * br); badge(c, 'sun', sx + 60, sy - 70, 30, br); } }); });
  },
  smile(c, t) {   // the man smiled
    const sm = ss(seg(t, HIT.smile - .2, HIT.smile + .3));
    stage(c, [300, 860, 780, 1720], seg(t, 31.3, 33.2), () => { shopInside(c, t, { door: false }); mascot(c, FLORIST({ s: 2.6, x: 540, y: 1720, f: 0, smile: lerp(.4, 1, sm), squash: wob(t, HIT.smile, .3, 14, .03), blink: blinkAt(t, 1) })); });
  },
  write(c, t) {   // the next day, he wrote next to one bouquet...
    const wk = seg(t, ...HIT.write);
    stage(c, [200, 1050, 920, 1660], seg(t, 33.2, 36.25), () => {
      c.fillStyle = WOOD; c.fillRect(-200, 1500, 1480, 400); c.fillStyle = CREAM; c.fillRect(-200, 1490, 1480, 16);
      bouquet(c, 420, 1500, 1.1);
      c.save(); c.translate(720, 1340); c.rotate(.08); c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(-140, -170, 290, 330); c.fillStyle = CREAM; c.fillRect(-150, -180, 290, 330); c.strokeStyle = GOLD2; c.lineWidth = 6; c.strokeRect(-132, -162, 254, 294);
      c.strokeStyle = 'rgba(34,48,122,.7)'; c.lineWidth = 7; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const lw = clamp(wk * 3 - i); if (lw <= 0) continue; c.beginPath(); for (let k = 0; k <= 20 * lw; k++) c.lineTo(-100 + k * 10, -90 + i * 60 + Math.sin(k * 1.4 + i) * 6); c.stroke(); }
      c.restore();
      if (wk > 0 && wk < 1) { const lw = (wk * 3) % 1, li = Math.floor(wk * 3), px = 720 - 100 + lw * 200, py = 1340 - 90 + li * 60; c.save(); c.translate(px + 20, py - 20); c.rotate(.6); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-10, -120, 20, 130, 8); c.fill(); c.fillStyle = GOLD; c.fillRect(-10, -120, 20, 24); c.restore(); } });
  },
  card1(c, t) {   // "For someone who needs a smile today."
    const k = E(t, HIT.card1, .35, .45), m = ss(seg(t, HIT.mosoly, HIT.mosoly + .4));
    stage(c, [180, 950, 860, 1660], seg(t, 36.25, 39.7), () => { c.fillStyle = WOOD; c.fillRect(-200, 1600, 1480, 400); c.fillStyle = CREAM; c.fillRect(-200, 1590, 1480, 16);
      bouquet(c, 460, 1600, 1.45, { tag: 'smile', tagK: k, tagGlow: m }); });
  },
  card2(c, t) {   // ...and next to another: "To say something you can't put into words."
    const k = E(t, HIT.card2, .35, .45), h = ss(seg(t, HIT.heart, HIT.heart + .4));
    stage(c, [180, 950, 860, 1660], seg(t, 39.7, 44.85), () => { c.fillStyle = WOOD; c.fillRect(-200, 1600, 1480, 400); c.fillStyle = CREAM; c.fillRect(-200, 1590, 1480, 16);
      bouquet(c, 460, 1600, 1.45, { mix: [['pink', -.3, -.55, 1], ['rose', .32, -.6, .9], ['pink', 0, -.8, .95], ['daisy', -.55, -.25, .8], ['rose', .55, -.28, .85], ['pink', .05, -.35, .9]], tag: 'heart', tagK: k, tagGlow: h }); });
  },
  change(c, t) {   // and something interesting happened: the cards glow in the window
    const g = ss(seg(t, HIT.glowup - .3, HIT.glowup + .5));
    stage(c, [60, 760, 1020, 1760], seg(t, 44.85, 47.15), () => { shopFront(c, t, { lit: g, bouquets: [[220, 1440, 1, 'smile', 1, g], [390, 1440, 1, 'heart', 1, g], [560, 1440, 1, 'star', 1, g]] }); });
  },
  enter(c, t) {   // people no longer came in only to buy flowers
    const who = [[47.4, 'blue1', null], [48.4, 'blue3', 'long'], [49.4, 'blue2', 'bob']];
    stage(c, [80, 860, 1060, 1720], 0, () => {
      shopInside(c, t, { door: Math.max(...who.map(([t0]) => Math.sin(clamp((t - t0 + .2) / 1) * Math.PI))), doorLight: 1, bellT: who.filter(([t0]) => t > t0 + .2).map(([t0]) => t0 + .2).pop() });
      mascot(c, FLORIST({ x: 880, y: 1690, f: -.3, smile: 1, blink: blinkAt(t, 1) })); counter(c, 720, 1060, 1440);
      who.forEach(([t0, skin, fem], i) => { const u = seg(t, t0, t0 + 1.2); if (t < t0) return; mascot(c, { id: 'e' + i, skin, fem, s: 1.9, x: lerp(220, [640, 500, 360][i], ss(u)), y: 1720 - i * 6, f: u < 1 ? .7 : .3, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, smile: .8, alpha: clamp((t - t0) / .3), blink: blinkAt(t, 20 + i) }); }); });
  },
  gift(c, t) {   // ...but because they were looking for something to give someone: imagined, the bouquet handed over, and a face lights up
    const g = ss(seg(t, HIT.gift - .3, HIT.gift + .4)), j = E(t, HIT.joy, .35, .5);
    const bgc = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); bgc.addColorStop(0, '#2d4596'); bgc.addColorStop(.8, TOP); bgc.addColorStop(1, TOP); c.fillStyle = bgc; c.fillRect(0, 0, 1080, 1920);
    stage(c, [180, 900, 900, 1720], 0, () => {
      const A = { id: 'giver', skin: 'blue1', s: 2.2, x: 330, y: 1700, f: .5, smile: .9, blink: blinkAt(t, 21) }, B = { id: 'getter', skin: 'blue2', fem: 'long', s: 2.1, x: 760, y: 1700, f: -.5, smile: lerp(.4, 1, j > .3 ? 1 : 0), blink: j > .3 && j < 1.1 ? 1 : blinkAt(t, 22) };
      const hx = lerp(470, 600, g), hy = 1500; A.handR = [hx, hy]; if (g > .8) B.handL = [hx + 20, hy]; mascot(c, A); mascot(c, B);
      bouquet(c, hx + 10, hy + 40, .6, { tag: 'heart', tagK: 1 }); heart(c, 760, 1060, 50, j, '#d94a6a'); }); dreamHaze(c);
  },
  same(c, t) {   // the flowers were exactly the same as the day before
    const r = E(t, 56.3, .35, .45), eq = E(t, HIT.eq, .3, .5);
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [120, 1150, 960, 1600], 0, () => { c.fillStyle = WOOD; c.fillRect(-200, 1560, 1480, 300); c.fillStyle = CREAM; c.fillRect(-200, 1550, 1480, 14);
      bouquet(c, 300, 1560, 1.05); if (r > 0) scaled(c, 780, 1560, Math.min(1, r), () => bouquet(c, 780, 1560, 1.05, { tag: 'smile', tagK: 1 }));
      if (eq > 0) scaled(c, 540, 1300, eq, () => { c.fillStyle = GOLD; c.beginPath(); c.roundRect(495, 1270, 90, 22, 11); c.roundRect(495, 1320, 90, 22, 11); c.fill(); }); });
  },
  meaning(c, t) {   // but now every one of them meant something
    const kinds = ['smile', 'heart', 'star', 'thanks', 'gift'];
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [50, 1250, 1030, 1600], 0, () => { c.fillStyle = WOOD; c.fillRect(-200, 1560, 1480, 300); c.fillStyle = CREAM; c.fillRect(-200, 1550, 1480, 14);
      kinds.forEach((kd, i) => bouquet(c, 140 + i * 190, 1560, .62, { tag: kd, tagK: E(t, HIT.tags[i], .3, .5) })); });
  },
  whyq(c, t) {   // do you know why that happened?
    const q = E(t, HIT.q, .35, .5);
    const bgc = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); bgc.addColorStop(0, '#26368c'); bgc.addColorStop(.8, TOP); bgc.addColorStop(1, TOP); c.fillStyle = bgc; c.fillRect(0, 0, 1080, 1920);
    stage(c, [240, 780, 840, 1700], seg(t, 63.1, 65.5), () => { bouquet(c, 540, 1680, 1.3, { tag: 'heart', tagK: 1 }); if (q > 0) { glow(c, 540, 960, 200, .4 * Math.min(1, q)); scaled(c, 540, 960, q, () => { c.save(); c.font = '230px "Montserrat"'; c.font = '700 230px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.strokeStyle = GOLD; c.lineWidth = 14; c.strokeText('?', 540, 960); c.fillStyle = CREAM; c.fillText('?', 540, 960); c.restore(); }); } });
  },
  product(c, t) {   // people don't always buy the product itself: the price tag fades, crossed out
    const p = E(t, HIT.price, .35, .45), x = ss(seg(t, HIT.cross - .2, HIT.cross + .3));
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [200, 1000, 880, 1700], 0, () => { bouquet(c, 460, 1680, 1.3);
      if (p > 0) { c.save(); c.globalAlpha = 1 - .5 * x; badge(c, 'price', 720, 1180, 80, p); c.restore(); cross(c, 720, 1180, 80, x); } });
  },
  heartbuy(c, t) {   // sometimes they buy the meaning the product holds for them: the card's heart grows and glows
    const h = E(t, HIT.heartbig, .45, .4), g = ss(seg(t, HIT.heartbig, HIT.heartbig + .8));
    const bgc = c.createRadialGradient(540, 1250, 100, 540, 1250, 1000); bgc.addColorStop(0, '#2d4596'); bgc.addColorStop(.8, TOP); bgc.addColorStop(1, TOP); c.fillStyle = bgc; c.fillRect(0, 0, 1080, 1920);
    stage(c, [200, 900, 880, 1700], 0, () => { c.save(); c.globalAlpha = 1 - .35 * g; bouquet(c, 460, 1680, 1.3, { tag: 'heart', tagK: 1 }); c.restore();
      if (h > 0) { glow(c, 560, 1060, 300, .5 * g); heart(c, 560, 1060, 130, h, '#d94a6a'); } });
  },
  unchanged(c, t) {   // you don't need to change your product to make it worth more: the same bouquet, a check
    const ck = E(t, HIT.check, .35, .5);
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [200, 860, 880, 1700], seg(t, 73.9, 78.85), () => { c.fillStyle = WOOD; c.fillRect(-200, 1640, 1480, 300); c.fillStyle = CREAM; c.fillRect(-200, 1630, 1480, 14);
      bouquet(c, 460, 1640, 1.3, { tag: 'smile', tagK: 1, tagGlow: ck }); check(c, 760, 960, 70, ck); });
  },
  see(c, t) {   // it's enough to help customers see why it's worth buying: at night the window glows, and people stop to read the cards
    const lit = .8 + .2 * Math.sin(t * 2);
    stage(c, [60, 760, 1020, 1880], 0, () => {
      shopFront(c, t, { night: 1, lit, bouquets: [[220, 1440, 1, 'smile', 1, lit], [390, 1440, 1, 'heart', 1, lit], [560, 1440, 1, 'star', 1, lit]] });
      HIT.look.forEach((tl, i) => { const k = clamp((t - tl + .4) / .4); if (k <= 0) return; const [skin, fem] = PASSER[i + 1];
        mascot(c, { id: 'l' + i, skin, fem, s: 1.9, x: [200, 400, 590][i], y: 1830, f: 0, back: true, alpha: k }); });
      if (t > HIT.why) glow(c, 390, 1300, 420, .3 * ss(seg(t, HIT.why, HIT.why + .6))); });
  },
};
function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.22)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); }

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['virágboltja', 'kirakatba', 'alkalomra', 'szebbé', 'mosolyra', 'szavakkal', 'érdekes', 'ajándékba', 'ugyanolyanok', 'jelentése', 'jelentést', 'értékesebbé', 'meglátni']);
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
const WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55;
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
  } else if (kind === 'dream' && dt < DREAM && i > 0) {   // into (or out of) an imagined scene: a soft, warm, blurred dissolve
    const e = ss(dt / DREAM), b = Math.sin(e * Math.PI);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${b * 18 * K}px) brightness(${1 + .25 * b})`; c.globalAlpha = 1; c.drawImage(bufA, 0, 0); c.globalAlpha = e; c.drawImage(bufB, 0, 0); c.restore();
  } else if (kind === 'punch' && dt < PUNCH && i > 0) {
    const e = 1 - Math.pow(1 - dt / PUNCH, 3), s = lerp(1.22, 1, e);
    paintShot(bctx, i, t); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.filter = `blur(${(1 - e) * 10 * K}px)`; c.drawImage(bufB, 0, 0); c.restore();
  } else paintShot(c, i, t);
  vignette(c);
  captions(c, t);
  const fade = ss(seg(t, STORY - .7, STORY)); if (fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits and the footsteps
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
for (let k = 1; k < 7; k++) EV.push({ t: +(HIT.crate[0] + k * (HIT.crate[1] - HIT.crate[0]) / 7).toFixed(3), type: 'step', who: 'florist', pan: lerp(-.5, .4, k / 7) });
HIT.passers.forEach((tp, i) => { for (let k = 1; k < 8; k++) EV.push({ t: +(tp + k * 2.2 / 8).toFixed(3), type: 'step', who: 'passer', pan: (i % 2 ? 1 : -1) * lerp(-.7, .7, k / 8) }); });
for (let k = 1; k < 5; k++) EV.push({ t: +(HIT.girlwalk[0] + k * (HIT.girlwalk[1] - HIT.girlwalk[0]) / 5).toFixed(3), type: 'step', who: 'girl', pan: lerp(-.6, -.2, k / 5) });
[47.4, 48.4, 49.4].forEach(t0 => { for (let k = 1; k < 4; k++) EV.push({ t: +(t0 + k * 1.2 / 4).toFixed(3), type: 'step', who: 'guest', pan: lerp(-.6, 0, k / 4) }); });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
