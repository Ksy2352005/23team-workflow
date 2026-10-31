// The Wrapped Books: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, GOLD2);
    if (kind === 'bulb') { ell(c, x, y - g * .15, g * .55, g * .6, GOLD); c.fillStyle = '#8f98b0'; c.fillRect(x - g * .25, y + g * .4, g * .5, g * .35); }
    if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2); });
}
// —— books, covers, parcels ——
const SPINE = ['#26368c', '#1a2563', '#e9dcc0', '#8a5d38', '#3a4a9c', '#c99a3a', '#7a3a3a', '#3f6b5a', '#efe4c8', '#2d4596'];
function spines(c, x0, x1, base, h, seed = 0, dim = 0) {   // a row of book spines standing on a shelf
  let x = x0, i = 0; while (x < x1 - 20) { const w = 26 + hash(i + seed) * 26, hh = h * (.72 + hash(i + seed + 50) * .28); const col = SPINE[Math.floor(hash(i + seed + 9) * SPINE.length)], lean = hash(i + seed + 3) > .92 ? .12 : 0;
    c.save(); c.translate(x + w / 2, base); c.rotate(lean); c.fillStyle = col; c.fillRect(-w / 2, -hh, w, hh); c.fillStyle = 'rgba(236,189,74,.55)'; c.fillRect(-w / 2 + 4, -hh + 14, w - 8, 4); c.fillRect(-w / 2 + 4, -hh * .3, w - 8, 3); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(w / 2 - 5, -hh, 5, hh); c.restore(); x += w + 3; i++; }
  if (dim) { c.fillStyle = `rgba(10,14,40,${dim})`; c.fillRect(x0, base - h, x1 - x0, h); }
}
function shelfUnit(c, x0, x1, top, bottom, rows, seed = 0, dim = 0) {
  c.fillStyle = '#5a3a22'; c.fillRect(x0 - 20, top - 20, x1 - x0 + 40, bottom - top + 40); c.fillStyle = '#1a2160'; c.fillRect(x0, top, x1 - x0, bottom - top);
  const rh = (bottom - top) / rows; for (let r = 0; r < rows; r++) { const base = top + (r + 1) * rh; spines(c, x0 + 6, x1 - 6, base - 14, rh - 30, seed + r * 31, dim); c.fillStyle = WOOD; c.fillRect(x0 - 20, base - 14, x1 - x0 + 40, 18); }
}
function cover(c, x, y, w, kind, glowK = 0) {   // a book seen from the front: 'author' has a famous face on it, 'gold' a shiny bestseller cover, 'plain' an unknown one
  const h = w * 1.4; if (glowK) glow(c, x, y, w * 1.3, .55 * glowK);
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(x - w / 2 + 10, y - h / 2 + 12, w, h);
  if (kind === 'author') { c.fillStyle = '#26368c'; c.fillRect(x - w / 2, y - h / 2, w, h); ell(c, x, y - h * .08, w * .28, w * .28, '#d9ccab'); ell(c, x, y - h * .14, w * .2, w * .2, '#efe4c8'); c.fillStyle = '#efe4c8'; c.beginPath(); c.ellipse(x, y + h * .14, w * .26, w * .18, 0, Math.PI, 0); c.fill();
    c.fillStyle = GOLD; c.fillRect(x - w * .38, y + h * .26, w * .76, h * .07); c.fillStyle = CREAM; c.fillRect(x - w * .3, y + h * .37, w * .6, h * .035); }
  if (kind === 'gold') { const g = c.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); g.addColorStop(0, '#f6d36b'); g.addColorStop(.5, '#d9a332'); g.addColorStop(1, '#f6d36b'); c.fillStyle = g; c.fillRect(x - w / 2, y - h / 2, w, h); star(c, x, y - h * .1, w * .26, 1, CREAM);
    c.fillStyle = NAVY; c.fillRect(x - w * .38, y + h * .2, w * .76, h * .08); c.fillRect(x - w * .28, y + h * .33, w * .56, h * .04); }
  if (kind === 'plain') { c.fillStyle = '#6b6f86'; c.fillRect(x - w / 2, y - h / 2, w, h); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x - w * .3, y - h * .25, w * .6, h * .04); }
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - w / 2, y - h / 2, w * .06, h);
}
// a parcel: a book wrapped in brown paper, tied with string; the label carries a handwritten line and a mark (k reveals the writing)
function parcel(c, x, y, w, o = {}) {
  const h = w * 1.35, rot = o.rot || 0; c.save(); c.translate(x, y); c.rotate(rot);
  if (o.glow) glow(c, 0, 0, w * 1.4, .6 * o.glow);
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(-w / 2 + 10, -h / 2 + 12, w, h);
  const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#d2a878'); g.addColorStop(1, '#b4865a'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
  c.strokeStyle = 'rgba(120,80,40,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-w / 2, -h * .2); c.lineTo(-w * .2, -h / 2); c.moveTo(w / 2, h * .25); c.lineTo(w * .15, h / 2); c.stroke();
  c.strokeStyle = '#efe4c8'; c.lineWidth = w * .03; c.beginPath(); c.moveTo(0, -h / 2); c.lineTo(0, h / 2); c.moveTo(-w / 2, -h * .1); c.lineTo(w / 2, -h * .1); c.stroke();
  ell(c, -w * .1, -h * .1 - w * .02, w * .1, w * .05, '#efe4c8', -.5); ell(c, w * .1, -h * .1 - w * .02, w * .1, w * .05, '#efe4c8', .5); ell(c, 0, -h * .1, w * .03, w * .03, GOLD2);
  if (o.label !== false) { const lw = w * .74, lh = w * .44, ly = h * .2; c.fillStyle = CREAM; c.fillRect(-lw / 2, ly - lh / 2, lw, lh); c.strokeStyle = GOLD2; c.lineWidth = w * .012; c.strokeRect(-lw / 2 + w * .02, ly - lh / 2 + w * .02, lw - w * .04, lh - w * .04);
    if (o.mirror) { c.save(); c.beginPath(); c.rect(-lw / 2 + w * .03, ly - lh / 2 + w * .03, lw - w * .06, lh - w * .06); c.clip(); const mg = c.createLinearGradient(-lw / 2, ly - lh / 2, lw / 2, ly + lh / 2); mg.addColorStop(0, '#c9d3ea'); mg.addColorStop(1, '#8f9cc4'); c.fillStyle = mg; c.globalAlpha = o.mirror; c.fillRect(-lw / 2, ly - lh / 2, lw, lh);
      const ms = lh * 1.9 / (BASE_H * 1.08); drawMascot(c, { ...cust(o.who ?? 1, { x: 0, y: ly + .76 * Hs(ms) + lh * .04, s: ms, f: 0, smile: 1 }), shadow: false }); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-lw * .4, ly - lh / 2); c.lineTo(-lw * .2, ly - lh / 2); c.lineTo(-lw * .45, ly + lh / 2); c.lineTo(-lw * .5, ly + lh / 2); c.fill(); c.restore(); }
    else { const k = o.write ?? 1; c.strokeStyle = 'rgba(34,48,122,.75)'; c.lineWidth = w * .016; c.lineCap = 'round'; for (let i = 0; i < 2; i++) { const lk = clamp(k * 2 - i); if (lk <= 0) continue; c.beginPath(); for (let j = 0; j <= 16 * lk; j++) c.lineTo(-lw * .2 + j * lw * .036, ly - lh * .12 + i * lh * .3 + Math.sin(j * 1.5 + i) * w * .01); c.stroke(); }
      if (o.mark && (o.markK ?? 1) > 0) scaled(c, -lw * .32, ly, o.markK ?? 1, () => mark(c, o.mark, -lw * .32, ly, w * .1, o.crack || 0)); } }
  c.restore();
}
function mark(c, kind, x, y, r, crack = 0) {
  if (kind === 'heart') { heart(c, x, y, r, 1, '#d94a6a'); if (crack > 0) { c.strokeStyle = CREAM; c.lineWidth = r * .16; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - r * .1, y - r * .4); c.lineTo(x + r * .12, y - r * .05); c.lineTo(x - r * .12, y + r * .2); c.lineTo(x + r * .05, y + r * .6 * crack); c.stroke(); } }
  if (kind === 'dawn') { c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); const g = c.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#26368c'); g.addColorStop(1, '#f6b38c'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); ell(c, x, y + r * .5, r * .5, r * .5, GOLD); c.restore(); }
  if (kind === 'owl') { ell(c, x, y, r * .8, r, '#8a5d38'); ell(c, x - r * .3, y - r * .25, r * .3, r * .3, CREAM); ell(c, x + r * .3, y - r * .25, r * .3, r * .3, CREAM); ell(c, x - r * .3, y - r * .25, r * .12, r * .12, NAVY); ell(c, x + r * .3, y - r * .25, r * .12, r * .12, NAVY); c.fillStyle = GOLD; c.beginPath(); c.moveTo(x - r * .1, y); c.lineTo(x + r * .1, y); c.lineTo(x, y + r * .2); c.fill(); }
}
// —— the shop: tall shelves, a rolling ladder, warm lamps, a counter, a window onto the night ——
function shop(c, t, o = {}) {
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  c.fillStyle = '#1a2563'; c.fillRect(-300, 760, 1680, 1000);
  shelfUnit(c, -260, 300, 820, 1560, 5, 3); shelfUnit(c, 780, 1340, 820, 1560, 5, 17);
  if (o.window !== false) { c.fillStyle = '#e9dcc0'; c.fillRect(330, 830, 420, 500); const g = c.createLinearGradient(0, 850, 0, 1310); g.addColorStop(0, '#0b1440'); g.addColorStop(1, '#22357a'); c.fillStyle = g; c.fillRect(346, 846, 388, 468); ell(c, 650, 930, 30, 30, '#f1e7cf'); ell(c, 664, 920, 28, 28, '#0d1645');
    for (let i = 0; i < 8; i++) ell(c, 370 + hash(i + 3) * 340, 870 + hash(i + 11) * 200, 3, 3, 'rgba(246,239,220,.8)'); c.fillStyle = '#0a1236'; for (const [bx, bw, bh] of [[346, 90, 150], [440, 120, 220], [566, 168, 130]]) c.fillRect(bx, 1314 - bh, bw, bh); c.fillStyle = '#e9dcc0'; c.fillRect(532, 846, 14, 468); c.fillRect(346, 1070, 388, 12); }
  for (const lx of [150, 930]) { c.strokeStyle = '#2a2a33'; c.lineWidth = 3; c.beginPath(); c.moveTo(lx, 600); c.lineTo(lx, 780); c.stroke(); c.fillStyle = '#c99a3a'; c.beginPath(); c.moveTo(lx - 60, 830); c.lineTo(lx + 60, 830); c.lineTo(lx + 26, 780); c.lineTo(lx - 26, 780); c.fill(); ell(c, lx, 832, 44, 9, '#ffe7a6'); glow(c, lx, 900, 300, .4); }
  c.strokeStyle = '#8a5d38'; c.lineWidth = 12; c.beginPath(); c.moveTo(260, 780); c.lineTo(340, 1640); c.moveTo(330, 780); c.lineTo(410, 1640); c.stroke(); c.lineWidth = 8; for (let k = 0; k < 8; k++) { const u = (k + 1) / 9; c.beginPath(); c.moveTo(lerp(260, 340, u), lerp(780, 1640, u)); c.lineTo(lerp(330, 410, u), lerp(780, 1640, u)); c.stroke(); }
  c.fillStyle = '#5a3a22'; c.fillRect(-300, 1640, 1680, 600); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 1670; y < 2200; y += 40) { c.beginPath(); c.moveTo(-300, y); c.lineTo(1380, y); c.stroke(); }
  c.fillStyle = '#7a3a3a'; c.beginPath(); c.ellipse(540, 1780, 380, 70, 0, 0, 7); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 6; c.beginPath(); c.ellipse(540, 1780, 340, 56, 0, 0, 7); c.stroke();
}
function table(c, x, y, w) { c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(x - w / 2 + 10, y + 14, w, 20); c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - w / 2 - 14, y - 12, w + 28, 26, 10); c.fill(); c.fillStyle = '#6e4a2c'; c.fillRect(x - w / 2, y + 14, 22, 200); c.fillRect(x + w / 2 - 22, y + 14, 22, 200); }
function specialShelf(c, t, x, y, k = 1, o = {}) {   // the special shelf: gold-trimmed, a little lamp, the parcels standing in a row
  const W2 = 330, n = o.n ?? 5; if (k <= 0) return;
  c.save(); c.globalAlpha = Math.min(1, k * 2);
  c.fillStyle = '#5a3a22'; c.fillRect(x - W2 - 20, y - 380, W2 * 2 + 40, 420); c.fillStyle = '#121a4e'; c.fillRect(x - W2, y - 360, W2 * 2, 360); c.fillStyle = GOLD; c.fillRect(x - W2 - 20, y - 384, W2 * 2 + 40, 8); c.fillRect(x - W2 - 20, y + 36, W2 * 2 + 40, 8);
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - 120, y - 470, 240, 70, 12); c.fill(); c.save(); c.font = '700 54px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('?', x, y - 432); c.restore();
  if ((o.lamp ?? 1) > 0) { glow(c, x, y - 300, 380, .45 * (o.lamp ?? 1)); ell(c, x, y - 360, 60, 12, '#ffe7a6'); }
  const marks = ['heart', 'dawn', 'owl', 'heart', 'dawn'];
  for (let i = 0; i < n; i++) { const px = x - W2 + 70 + i * 128, pk = o.pop ? E(t, o.pop[i] ?? 0, .3, .5) : 1; if (pk > 0) scaled(c, px, y, Math.min(1, pk), () => parcel(c, px, y - 96, 104, { mark: marks[i], glow: o.pick === i ? o.pickGlow : 0, rot: (hash(i + 2) - .5) * .06 })); }
  c.restore();
}

// —— the people ——
const OWNER = o => ({ id: 'owner', skin: 'owner', specs: 1, tache: 1, s: 2.2, smile: .7, ...o });   // the bookseller: glasses and a moustache
const CUST = [['blue2', 'long'], ['blue3', 'bun'], ['blue1', null], ['blue2', 'bob'], ['blue3', 'beret'], ['blue1', 'glasses']];
const cust = (i, o) => ({ id: 'c' + i, skin: CUST[i % 6][0], fem: CUST[i % 6][1], s: 2.0, smile: .6, ...o });
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); g.addColorStop(0, col); g.addColorStop(.8, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }

// —— the shots ——
const SHOT = {
  shop(c, t) {   // the story opens like a book: a closed storybook, its cover swings open and the bookshop pops up out of the pages; then the owner notices: customers grab the books they already know
    const open = ss(seg(t, .1, .9)), pop = sp(Math.max(0, t - .7), .5, .35), push = ss(seg(t, 1.6, 5.4));
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, lerpBox([-60, 760, 1140, 1900], [40, 800, 1040, 1860], push), 0, () => {
      // the open book under the scene: two cream pages and a spine
      c.fillStyle = 'rgba(0,0,20,.4)'; c.fillRect(-40, 1700, 1160, 140); c.fillStyle = '#26368c'; c.fillRect(-60, 1690, 1200, 150); c.fillStyle = CREAM; c.fillRect(-40, 1680, 560, 140); c.fillRect(560, 1680, 560, 140); c.fillStyle = 'rgba(160,120,60,.25)'; c.fillRect(500, 1680, 80, 140);
      c.save(); c.translate(0, 1680); c.scale(1, Math.max(0, pop)); c.translate(0, -1680);   // the scene folds up out of the page
      shop(c, t);
      table(c, 540, 1500, 360); for (const [x, kind, tg] of [[450, 'author', HIT.grabs[0]], [560, 'gold', HIT.grabs[1]]]) { cover(c, x, 1420, 90, kind, .4 + .3 * Math.sin(t * 5)); for (let r = 0; r < 3; r++) { const u = ((t * .8 + r / 3) % 1); c.strokeStyle = `rgba(236,189,74,${.5 * (1 - u)})`; c.lineWidth = 4; c.beginPath(); c.arc(x, 1420, 60 + u * 160, 0, 7); c.stroke(); } }
      cover(c, 660, 1430, 76, 'plain');
      mascot(c, OWNER({ x: 880, y: 1720, f: -.4, look: -.1, headTurn: t > HIT.notice ? -.3 : 0, smile: .5, blink: blinkAt(t, 1) }));
      [[200, 0, HIT.grabs[0], 450], [340, 1, HIT.grabs[1], 560]].forEach(([x0, i, tg, bx]) => { const pull = ss(seg(t, tg - 1.2, tg)), x = lerp(x0, bx - 120, pull * .6), P = cust(i, { x, y: 1760, f: .5, lean: .12 * pull, smile: t > tg ? 1 : .6, blink: blinkAt(t, 10 + i) }); const r = Math.sin(seg(t, tg - .4, tg + .5) * Math.PI); if (r > 0) P.handR = reach([x + 80, 1560], [bx, 1440], r); mascot(c, P);
        const ex = E(t, tg, .3, .5); if (ex > 0 && t < tg + 1.4) badge(c, 'ex', x, 1240, 40, ex); });
      c.restore();
      // the cover, swinging open on its spine
      if (open < 1) { c.save(); c.translate(-60, 0); c.scale(1 - open, 1); c.fillStyle = '#26368c'; c.fillRect(0, 760, 1200, 1080); c.strokeStyle = GOLD; c.lineWidth = 10; c.strokeRect(50, 810, 1100, 980);
        c.font = '700 84px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('A KÖNYVESBOLT', 600, 1240); star(c, 600, 1380, 40); c.restore(); } });   // the title swings with the cover
  },
  known(c, t) {   // the familiar covers pull customers in like magnets: rings pulse from them, the customers lean in and grab
    const a = ss(seg(t, HIT.author - .2, HIT.author + .3)), b = ss(seg(t, HIT.cover - .2, HIT.cover + .3)), ra = ss(seg(t, HIT.author, HIT.author + .5)), rb = ss(seg(t, HIT.cover, HIT.cover + .5));
    bg(c);
    stage(c, [60, 860, 1020, 1800], 0, () => { table(c, 540, 1560, 520);
      for (const [x, k] of [[430, a], [650, b]]) for (let r = 0; r < 3; r++) { const u = ((t * 1.1 + r / 3) % 1); c.strokeStyle = `rgba(236,189,74,${(.25 + .5 * k) * (1 - u)})`; c.lineWidth = 5; c.beginPath(); c.arc(x, 1430, 90 + u * 260, 0, 7); c.stroke(); }
      cover(c, 430, 1430, 150, 'author', a); cover(c, 650, 1430, 150, 'gold', b);
      const L = cust(0, { s: 2.2, x: lerp(120, 200, ra), y: 1790, f: .5, lean: .1 * a, smile: ra > .5 ? 1 : .6, blink: blinkAt(t, 10) }), R = cust(2, { s: 2.2, x: lerp(960, 880, rb), y: 1790, f: -.5, lean: -.1 * b, smile: rb > .5 ? 1 : .6, blink: blinkAt(t, 12) });
      L.handR = reach([L.x + 130, 1560], [400, 1450], ra); R.handL = reach([R.x - 130, 1560], [680, 1450], rb); mascot(c, L); mascot(c, R);
      if (ra > .5) badge(c, 'ex', L.x, 1240, 40, E(t, HIT.author + .3, .3, .5)); if (rb > .5) badge(c, 'ex', R.x, 1240, 40, E(t, HIT.cover + .3, .3, .5)); });
  },
  dusty(c, t) {   // the unknown books hardly ever sold: in a dusty corner, one lonely book slides out hopefully as someone passes... who doesn't look; it sinks back in a puff of dust; a spider comes down
    const hope = ss(seg(t, 9.6, 10.2)) * (1 - ss(seg(t, 11.0, 11.5))), sp = ss(seg(t, HIT.spider - .6, HIT.spider + .4)), pass = seg(t, 9.3, 11.6), puff = seg(t, 11.4, 12.2);
    bg(c, '#1d2868');
    stage(c, [100, 820, 980, 1840], 0, () => { shelfUnit(c, 200, 880, 900, 1640, 3, 77, .45);
      c.fillStyle = '#6b6f86'; c.fillRect(520, 1390 - 230, 50, 230); c.save(); c.translate(545, 1390); c.rotate(-hope * .25); c.translate(-545, -1390); c.fillStyle = '#7d8199'; c.fillRect(520 + hope * 40, 1390 - 230, 50, 230); c.fillStyle = 'rgba(236,189,74,.5)'; c.fillRect(526 + hope * 40, 1180, 38, 4); c.restore();
      for (let i = 0; i < 10; i++) { const u = puff, a = i / 10 * Math.PI * 2; if (u > 0 && u < 1) ell(c, 560 + Math.cos(a) * 60 * (.3 + u), 1290 + Math.sin(a) * 40 * (.3 + u), 16 * (1 - u), 16 * (1 - u), `rgba(246,239,220,${.5 * (1 - u)})`); }
      c.strokeStyle = 'rgba(233,220,192,.35)'; c.lineWidth = 2; for (let r = 1; r < 5; r++) { c.beginPath(); c.arc(880, 900, r * 45, Math.PI * .5, Math.PI); c.stroke(); } for (let k = 0; k < 5; k++) { const a = Math.PI * .5 + k * Math.PI / 8; c.beginPath(); c.moveTo(880, 900); c.lineTo(880 + Math.cos(a) * 200, 900 + Math.sin(a) * 200); c.stroke(); }
      c.strokeStyle = 'rgba(233,220,192,.6)'; c.beginPath(); c.moveTo(300, 900); c.lineTo(300, 900 + 300 * sp); c.stroke(); ell(c, 300, 910 + 300 * sp, 16, 20, '#121a3a'); for (const d of [-1, 1]) for (let k = 0; k < 3; k++) { c.strokeStyle = '#121a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(300, 910 + 300 * sp); c.lineTo(300 + d * 26, 900 + 300 * sp + k * 10); c.stroke(); }
      for (let i = 0; i < 24; i++) { const u = (t * .08 + hash(i)) % 1; ell(c, 220 + hash(i + 5) * 640, 920 + u * 700, 2.5, 2.5, `rgba(246,239,220,${.4 * Math.sin(u * Math.PI)})`); }
      if (pass > 0 && pass < 1) mascot(c, cust(4, { x: lerp(200, 880, pass), y: 1830, s: 2.0, f: .8, walk: 1, phi: pass * 14, smile: .5, alpha: Math.min(clamp(pass / .15), clamp((1 - pass) / .15)) }));
      const n = E(t, HIT.nope, .3, .5); if (n > 0) scaled(c, 720, 1180, n, () => { c.fillStyle = CREAM; c.beginPath(); c.roundRect(650, 1140, 140, 80, 12); c.fill(); text(c, '0', 720, 1182, 60, '#7a3a3a'); }); });
  },
  idea(c, t) {   // so he decided to make a very special shelf: a lightbulb, and the shelf builds itself, plank by plank, the lamp lights
    const bl = E(t, HIT.bulb, .35, .5), sk = seg(t, HIT.planks[0] - .2, HIT.lamp);
    stage(c, [80, 760, 1000, 1800], 0, () => { shop(c, t, { window: false });
      mascot(c, OWNER({ x: 230, y: 1790, s: 2.2, f: .4, smile: bl > .5 ? 1 : .6, look: -.2, blink: blinkAt(t, 1), squash: wob(t, HIT.bulb, .3, 16, .04) }));
      if (bl > 0) { glow(c, 360, 1040, 140, .5 * Math.min(1, bl)); badge(c, 'bulb', 360, 1040, 54, bl); }
      specialShelf(c, t, 690, 1580, sk, { n: 0, lamp: ss(seg(t, HIT.lamp, HIT.lamp + .4)) });
      HIT.planks.forEach((tp, i) => { const k = E(t, tp, .25, .5); if (k <= 0) return; c.fillStyle = WOOD; c.save(); c.translate(690, 1580 - i * 90); c.scale(Math.min(1, k), 1); c.fillRect(-350, -10, 700, 20); c.restore(); }); });
  },
  wrap(c, t) {   // every book wrapped in brown paper: from above, the first is wrapped fold by fold, then a quick stack of parcels piles up
    const ld = E(t, HIT.land, .3, .45), f = HIT.folds.map(x => ss(seg(t, x - .1, x + .2))), bw = E(t, HIT.bow, .35, .5), stackT = [19.7, 20.1, 20.5, 20.9, 21.3];
    bg(c, '#3a2a1c');
    stage(c, [100, 880, 980, 1760], 0, () => { c.fillStyle = WOOD; c.fillRect(-200, 820, 1480, 1000); c.strokeStyle = 'rgba(70,40,15,.3)'; c.lineWidth = 3; for (let k = 0; k < 14; k++) { c.beginPath(); c.moveTo(-200, 860 + k * 70); c.lineTo(1280, 870 + k * 70); c.stroke(); }
      const slide = ss(seg(t, 19.4, 19.9)), px = lerp(540, 300, slide), py = lerp(1300, 1560, slide), sc = lerp(1, .55, slide), W2 = 200 * sc, H2 = 270 * sc;
      c.fillStyle = '#c9a072'; if (slide < 1) c.fillRect(px - W2 - 150 * sc, py - H2 - 130 * sc, (W2 + 150 * sc) * 2, (H2 + 130 * sc) * 2);
      if (ld > 0 && f[3] < 1) scaled(c, px, py, lerp(1.4, 1, Math.min(1, ld)) * sc, () => { c.save(); c.translate(px, py); c.scale(400 / 230, 400 / 230); cover(c, 0, 0, 230, 'author'); c.restore(); });
      const flap = (k, side) => { if (k <= 0 || f[3] >= 1) return; c.fillStyle = side % 2 ? '#c49668' : '#b4865a'; c.save(); c.translate(px, py); c.scale(sc, sc); const w = 200, h = 270; if (side === 0) c.fillRect(-w - 150, -h, (150 + w) * k, h * 2); if (side === 1) c.fillRect(w + 150 - (150 + w) * k, -h, (150 + w) * k, h * 2); if (side === 2) c.fillRect(-w, -h - 130, w * 2, (130 + h) * k); if (side === 3) c.fillRect(-w, h + 130 - (130 + h) * k, w * 2, (130 + h) * k); c.restore(); };
      f.forEach((k, i) => flap(k, i));
      if (f[3] >= 1) parcel(c, px, py, W2 * 2, { label: false });
      stackT.forEach((ts, i) => { const k = E(t, ts, .25, .5); if (k <= 0) return; const sx = 700 + (i % 2) * 40, sy = 1600 - i * 120; scaled(c, sx, sy, Math.min(1, k), () => parcel(c, sx, sy, 220, { label: false, rot: (hash(i) - .5) * .2 })); });
      if (t > HIT.hide) badge(c, 'q', 860, 1000, 50, E(t, HIT.hide, .3, .5)); });
  },
  write(c, t) {   // he wrote just a few sentences on the parcels
    const k = seg(t, ...HIT.write);
    bg(c, '#3a2a1c');
    stage(c, [200, 900, 880, 1700], seg(t, 21.7, 24.5), () => { parcel(c, 540, 1300, 460, { write: k, mark: 'heart', markK: E(t, HIT.write[1], .3, .5) });
      if (k > 0 && k < 1) { const lw = 460 * .74, lx = 540 - lw * .2 + (k * 2 % 1) * lw * .58, ly = 1300 + 460 * 1.35 * .2 - 460 * .44 * .12 + Math.floor(k * 2) * 460 * .44 * .3; c.save(); c.translate(lx + 16, ly - 20); c.rotate(.6); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-11, -150, 22, 160, 8); c.fill(); c.fillStyle = GOLD; c.fillRect(-11, -150, 22, 28); c.restore(); } });
  },
  heart(c, t) {   // "For someone whose heart was recently broken": the heart on the label cracks; a sad woman finds it, and hugs it
    const cr = ss(seg(t, HIT.crack - .2, HIT.crack + .4)), hug = ss(seg(t, 26.9, 27.6));
    bg(c, '#3a2a5a');
    stage(c, [120, 860, 960, 1760], 0, () => { const P = cust(0, { s: 2.6, x: 330, y: 1760, f: .4, sad: lerp(.6, .2, hug), smile: hug > .5 ? .6 : 0, look: .2, blink: blinkAt(t, 3) }), Hh = Hs(P.s);
      const px = lerp(720, P.x + .15 * Hh, hug), py = lerp(1300, P.y - .45 * Hh, hug); if (hug > 0) { P.handR = [px + 60, py + 30]; P.handL = [px - 60, py + 30]; } mascot(c, P);
      parcel(c, px, py, lerp(320, 170, hug), { mark: 'heart', crack: cr, rot: lerp(.05, 0, hug) }); });
  },
  dawn(c, t) {   // "For someone longing for a new beginning": a door opens behind the parcel onto a sunrise
    const dr = ss(seg(t, HIT.door - .3, HIT.door + .5)), sn = ss(seg(t, HIT.sun - .2, HIT.sun + .6));
    bg(c, '#26368c');
    stage(c, [120, 820, 960, 1720], 0, () => { const dx = 540, dy = 1500; c.fillStyle = '#e9dcc0'; c.fillRect(dx - 200, dy - 640, 400, 660); const g = c.createLinearGradient(0, dy - 620, 0, dy); g.addColorStop(0, '#5a6fc0'); g.addColorStop(1, '#f6b38c'); c.fillStyle = g; c.fillRect(dx - 184, dy - 624, 368, 624);
      c.save(); c.beginPath(); c.rect(dx - 184, dy - 624, 368, 624); c.clip(); glow(c, dx, dy - 120, 300, .6 * sn); ell(c, dx, dy - 40 - 120 * sn, 80, 80, '#ffe08a'); c.fillStyle = '#3c5fb4'; c.fillRect(dx - 184, dy - 80, 368, 80); c.restore();
      c.save(); c.translate(dx - 184, dy - 624); c.scale(1 - .85 * dr, 1); c.fillStyle = WOOD; c.fillRect(0, 0, 368, 624); ell(c, 330, 330, 12, 12, GOLD); c.restore();
      if (sn > 0) for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .22; c.strokeStyle = `rgba(255,224,138,${.35 * sn})`; c.lineWidth = 10; c.beginPath(); c.moveTo(dx + Math.cos(a) * 220, dy - 160 + Math.sin(a) * 220); c.lineTo(dx + Math.cos(a) * (300 + 60 * sn), dy - 160 + Math.sin(a) * (300 + 60 * sn)); c.stroke(); }
      parcel(c, dx, 1560, 260, { mark: 'dawn' }); });
  },
  know(c, t) {   // "For someone who thinks they already know everything": a smug know-it-all, nose up; then a surprised "oh"
    const sm = ss(seg(t, HIT.smug - .3, HIT.smug + .2)), oo = t > HIT.oops;
    bg(c, '#26368c');
    stage(c, [140, 860, 940, 1760], 0, () => { const P = cust(2, { s: 2.6, x: 380, y: 1760, f: .3, look: oo ? .2 : -.6 * sm, smile: oo ? 0 : .7, o: oo ? .8 : 0, headUp: oo ? 0 : .02 * sm, squash: wob(t, HIT.oops, .3, 18, .05), blink: oo ? 0 : sm > .5 ? .6 : blinkAt(t, 5) }); mascot(c, P);
      parcel(c, 760, 1400, 260, { mark: 'owl', rot: oo ? Math.sin((t - HIT.oops) * 16) * .1 * Math.exp(-(t - HIT.oops) * 3) : .05 });
      if (oo) badge(c, 'ex', 380, 1060, 48, E(t, HIT.oops, .3, .5)); });
  },
  mystery(c, t) {   // they didn't know which book they were buying, only that it might be what they need: shake, listen, "?"; then the parcel fits the gap in her heart
    const sh = HIT.shake.reduce((a, s) => a + (t > s && t < s + .35 ? Math.sin((t - s) * 40) * .25 : 0), 0), q = E(t, HIT.q, .35, .5), fit = ss(seg(t, HIT.fit - .8, HIT.fit)), fill = ss(seg(t, HIT.fill, HIT.fill + .6));
    bg(c);
    stage(c, [140, 820, 940, 1760], 0, () => { const P = cust(3, { s: 2.5, x: 360, y: 1760, f: .3, smile: fill > .5 ? 1 : .5, headTurn: t < 38.5 ? .4 : 0, blink: blinkAt(t, 6) }), Hh = Hs(P.s);
      const hx = P.x + .3 * Hh, hy = P.y - .62 * Hh; if (fit <= 0) { P.handR = [hx, hy + 40]; } mascot(c, P);
      const gx = 760, gy = 1080; c.save(); c.setLineDash([14, 10]); c.strokeStyle = fill > 0 ? GOLD : 'rgba(246,239,220,.6)'; c.lineWidth = 6; c.beginPath(); const hr = 120; c.moveTo(gx, gy + hr * .9); c.bezierCurveTo(gx - hr * 1.3, gy, gx - hr * .8, gy - hr, gx, gy - hr * .35); c.bezierCurveTo(gx + hr * .8, gy - hr, gx + hr * 1.3, gy, gx, gy + hr * .9); c.stroke(); c.restore();
      if (t > 38.6 && fill <= 0) glow(c, gx, gy, 160, .2 + .1 * Math.sin(t * 4));
      if (fill > 0) { glow(c, gx, gy, 260, .5 * fill); heart(c, gx, gy, hr, fill, GOLD); }
      if (fill < 1) { const px = lerp(hx + 20, gx, fit), py = lerp(hy, gy, fit) - Math.sin(fit * Math.PI) * 160; c.save(); c.globalAlpha = 1 - fill; parcel(c, px, py, lerp(150, 110, fit), { mark: 'heart', rot: sh + fit * .3 }); c.restore(); }
      if (q > 0 && t < HIT.fit - .8) badge(c, 'q', 560, 1180, 48, q); });
  },
  read(c, t) {   // some came back after reading: at home in an armchair, the pages turn and little pieces of the story float up out of the book; she closes it, smiling
    const n = HIT.pages.filter(x => t > x).length, cl = ss(seg(t, HIT.close, HIT.close + .4));
    bg(c, '#3a2a5a');
    stage(c, [140, 820, 940, 1760], 0, () => { glow(c, 760, 1000, 320, .5); c.strokeStyle = '#2a2a33'; c.lineWidth = 4; c.beginPath(); c.moveTo(760, 1000); c.lineTo(760, 1600); c.stroke(); c.fillStyle = '#c99a3a'; c.beginPath(); c.moveTo(680, 1000); c.lineTo(840, 1000); c.lineTo(800, 920); c.lineTo(720, 920); c.fill();
      c.fillStyle = '#7a3a3a'; c.beginPath(); c.roundRect(240, 1180, 440, 560, 80); c.fill(); c.beginPath(); c.roundRect(200, 1440, 520, 300, 60); c.fill();
      const P = cust(3, { s: 2.2, x: 460, y: 1700, sit: 1, f: .1, look: cl > .5 ? 0 : .5, smile: cl > .5 ? 1 : .8, blink: blinkAt(t, 6) }); P.handL = [400, 1430]; P.handR = [520, 1430]; mascot(c, P);
      c.fillStyle = CREAM; c.save(); c.translate(460, 1420); c.scale(1 - .5 * cl, 1); c.fillRect(-110, -70, 220, 120); c.fillStyle = '#26368c'; c.fillRect(-4, -70, 8, 120); c.strokeStyle = 'rgba(28,36,80,.3)'; c.lineWidth = 3; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-90, -46 + k * 24); c.lineTo(-20, -46 + k * 24); c.moveTo(20, -46 + k * 24); c.lineTo(90, -46 + k * 24); c.stroke(); }
      const pg = HIT.pages.find(x => t > x && t < x + .3); if (pg) { const u = (t - pg) / .3; c.fillStyle = '#efe4c8'; c.beginPath(); c.moveTo(0, -70); c.lineTo(110 * Math.cos(u * Math.PI), -70 - 20 * Math.sin(u * Math.PI)); c.lineTo(110 * Math.cos(u * Math.PI), 50 - 20 * Math.sin(u * Math.PI)); c.lineTo(0, 50); c.fill(); }
      c.restore();
      const story = [['heart', 0], ['sun', 1], ['bird', 2], ['star', 3], ['heart', 4], ['sun', 5]];
      if (cl < 1) story.forEach(([k, i]) => { const u = ((t - 43.6) * .35 + i / 6) % 1, x = 460 + Math.sin(u * 6 + i) * 120, y = 1340 - u * 420, a = Math.sin(u * Math.PI) * (1 - cl);
        c.save(); c.globalAlpha = a; if (k === 'heart') heart(c, x, y, 26, 1, '#d94a6a'); if (k === 'star') star(c, x, y, 24); if (k === 'sun') { glow(c, x, y, 50, .4); ell(c, x, y, 18, 18, GOLD); }
        if (k === 'bird') { c.strokeStyle = CREAM; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 24, y); c.quadraticCurveTo(x - 12, y - 14 * Math.sin(t * 10), x, y); c.quadraticCurveTo(x + 12, y - 14 * Math.sin(t * 10), x + 24, y); c.stroke(); } c.restore(); }); });
  },
  back(c, t) {   // ...and came back to see which book fate had in store this time: the bell, she steps up to the special shelf, the parcels lift and shuffle like cards, slow down, one glows and floats down into her hands
    const u = seg(t, HIT.bell - .2, HIT.bell + 1.0), sh = seg(t, 48.8, 51.6), rise = ss(seg(t, 51.6, HIT.fate)), land = ss(seg(t, HIT.fate, HIT.fate + .8));
    bg(c);
    stage(c, [80, 780, 1000, 1840], 0, () => { c.fillStyle = '#1a2563'; c.fillRect(-100, 760, 1280, 900); c.fillStyle = '#5a3a22'; c.fillRect(-100, 1640, 1280, 300);
      // the shelf, empty now: its parcels are in the air
      c.fillStyle = '#5a3a22'; c.fillRect(160, 1180, 760, 420); c.fillStyle = '#121a4e'; c.fillRect(180, 1200, 720, 380); c.fillStyle = GOLD; c.fillRect(160, 1176, 760, 8); glow(c, 540, 1300, 380, .4);
      const P = cust(3, { x: lerp(150, 230, ss(u)), y: 1830, s: 2.1, f: u < 1 ? .6 : .4, walk: u > 0 && u < 1 ? 1 : 0, phi: u * 12, smile: land > .5 ? 1 : .7, look: -.3, alpha: clamp((t - HIT.bell + .2) / .3), blink: blinkAt(t, 6) }), Hh = Hs(P.s);
      const catchAt = [P.x + .3 * Hh, P.y - .45 * Hh]; if (land > 0) { P.handR = [catchAt[0] + 40, catchAt[1]]; P.handL = [catchAt[0] - 30, catchAt[1] + 10]; }
      const later = [];
      const N = 5, speed = 7 * (1 - ss(seg(t, 50.6, 51.6)));
      for (let i = 0; i < N; i++) { const chosen = i === 2, ph = (t - 48.8) * speed * .35 + i / N * Math.PI * 2, lift = ss(seg(t, 48.6, 49.0)), bx = 280 + i * 130;
        let x = lerp(bx, 540 + Math.cos(ph) * 300, lift * (1 - ss(seg(t, 51.0, 51.6)))) , y = lerp(1500, 1180 + Math.sin(ph) * 120, lift * (1 - ss(seg(t, 51.0, 51.6)))) ;
        if (t > 51.6) { x = bx; y = 1500; }
        if (chosen && t > 51.6) { x = lerp(bx, 540, rise); y = lerp(1500, 1040, rise) ; x = lerp(x, catchAt[0], land); y = lerp(y, catchAt[1] - 20, land); }
        if (chosen && rise > 0) { glow(c, x, y, 200, .6 * rise); for (let k = 0; k < 6; k++) { const a = t * 2 + k; ell(c, x + Math.cos(a) * 120, y + Math.sin(a) * 80, 6, 6, `rgba(255,224,138,${.8 * rise * (1 - land)})`); } }
        const draw = () => parcel(c, x, y, chosen ? lerp(110, 140, rise) * lerp(1, .8, land) : 110, { mark: ['heart', 'dawn', 'heart', 'owl', 'dawn'][i], rot: Math.sin(ph) * .2 * (1 - ss(seg(t, 51.0, 51.6))) }); if (chosen && land > .3) later.push(draw); else draw(); }
      mascot(c, P); later.forEach(f => f());   // she stands in front of the shelf; the chosen parcel lands in her hands
      if (land > .5) star(c, catchAt[0], catchAt[1] - 160, 28, E(t, HIT.fate + .4, .3, .5)); });
  },
  covers(c, t) {   // instead of catching their eye with the author's name or the cover: famous covers lit up like neon signs flicker, and switch off one by one, leaving one brown parcel in the light
    const items = [['author', 270, 1080, HIT.flyin[0], 59.2], ['gold', 810, 1080, HIT.flyin[2], 59.6], ['author', 540, 1260, HIT.flyin[1], 60.0], ['gold', 270, 1460, HIT.flyin[2] + .3, 60.3], ['author', 810, 1460, HIT.flyin[1] + .3, 60.66]];
    bg(c, '#16205a');
    stage(c, [80, 900, 1000, 1700], 0, () => {
      items.forEach(([k, x, y, ts, off], i) => { const on = E(t, ts, .3, .45); if (on <= 0) return; const flick = t > off - .5 && t < off ? (Math.sin(t * 60 + i) > 0 ? 1 : .2) : 1, dead = t >= off;
        c.save(); c.globalAlpha = dead ? .18 : 1; scaled(c, x, y, Math.min(1, on), () => { cover(c, x, y, 150, k, dead ? 0 : .6 * flick); c.strokeStyle = dead ? 'rgba(120,120,140,.4)' : `rgba(255,214,120,${.9 * flick})`; c.lineWidth = 6; c.strokeRect(x - 90, y - 120, 180, 240); if (!dead) glow(c, x, y, 160, .35 * flick); }); c.restore(); });
      const pk = ss(seg(t, HIT.fade, HIT.fade + .5)); if (pk > 0) { glow(c, 540, 1260, 300, .5 * pk); c.save(); c.globalAlpha = pk; parcel(c, 540, 1260, 230, { mark: 'heart' }); c.restore(); } });
  },
  mirror(c, t) {   // ...he let customers recognise themselves in the sentences: the label becomes a mirror; then the story folds back into its book, and the book closes
    const mr = ss(seg(t, HIT.mirror - .4, HIT.mirror + .3)), fold = ss(seg(t, 65.6, 66.6)), shut = ss(seg(t, 66.4, 67.1));
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [80, 800, 1000, 1860], 0, () => {
      c.fillStyle = '#26368c'; c.fillRect(-60, 1690, 1200, 150); c.fillStyle = CREAM; c.fillRect(-40, 1680, 560, 140); c.fillRect(560, 1680, 560, 140);
      c.save(); c.translate(0, 1680); c.scale(1, 1 - fold); c.translate(0, -1680);
      shop(c, t, { window: false }); specialShelf(c, t, 690, 1580, 1, { lamp: 1 });
      const P = cust(1, { s: 2.4, x: 300, y: 1760, f: .4, smile: mr > .5 ? 1 : .5, look: -.1, blink: blinkAt(t, 7) }); P.handR = [560, 1440]; P.handL = [520, 1500]; mascot(c, P);
      glow(c, 600, 1340, 220, .4 * mr); parcel(c, 600, 1340, 260, { mirror: mr, who: 1, mark: 'heart' });
      if (mr > .8) heart(c, 300, 1060, 46, E(t, HIT.mirror + .3, .35, .5), '#d94a6a');
      c.restore();
      if (shut > 0) { c.save(); c.translate(1140, 0); c.scale(-shut, 1); c.fillStyle = '#26368c'; c.fillRect(0, 760, 1200, 1080); c.strokeStyle = GOLD; c.lineWidth = 10; c.strokeRect(50, 810, 1100, 980); c.restore();
        c.save(); c.translate(1140, 0); c.scale(shut, 1); c.translate(-1200, 0); c.font = '700 84px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('A KÖNYVESBOLT', 600, 1240); star(c, 600, 1380, 40); c.restore(); } });
  },
};
function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['szerzőjét', 'borítóját', 'ismeretlen', 'különleges', 'barna', 'papírba', 'szívét', 'kezdetre', 'mindent', 'szükségük', 'sors', 'magukra', 'ismerjenek']);
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
for (let k = 1; k < 5; k++) EV.push({ t: +(HIT.bell - .2 + k * 1.4 / 5).toFixed(3), type: 'step', pan: lerp(-.6, -.2, k / 5) });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
