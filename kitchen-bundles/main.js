// Story 22, A kész csomagok (The Store That Sold Products in Unexpected Bundles): a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, TS } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'ELADVA Ft?'), document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const TOP = '#00113F', NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#00113F';
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
let NOW = 0; const KICK = () => (HIT.kicks || []).reduce((m, k) => NOW < k ? m : Math.max(m, Math.exp(-(NOW - k) * 6) * Math.sin(Math.min(1, (NOW - k) / .08) * Math.PI / 2)), 0);   // a quick punch-in of the camera on the key beats
function stage(c, box, push, f) { const [x0, y0, x1, y1] = box, z = Math.min((STAGE.x1 - STAGE.x0) / (x1 - x0), (STAGE.y1 - STAGE.y0) / (y1 - y0)) * (.96 + .04 * push) * (1 + .035 * KICK());
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

// —— small helpers ——
const KF = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i]; if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, ss((t - t0) / Math.max(1e-6, t1 - t0))); } } return keys[keys.length - 1][1]; };
function badge(c, kind, x, y, r, k = 1) {
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); const g = r * .55;
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, NAVY); if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (kind === 'x') { c.strokeStyle = '#c4566a'; c.lineWidth = g * .3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - g * .5, y - g * .5); c.lineTo(x + g * .5, y + g * .5); c.moveTo(x + g * .5, y - g * .5); c.lineTo(x - g * .5, y + g * .5); c.stroke(); }
    if (kind === 'bell') { c.fillStyle = GOLD2; c.beginPath(); c.moveTo(x - g * .7, y + g * .4); c.quadraticCurveTo(x - g * .6, y - g * .8, x, y - g * .8); c.quadraticCurveTo(x + g * .6, y - g * .8, x + g * .7, y + g * .4); c.closePath(); c.fill(); ell(c, x, y + g * .55, g * .18, g * .18, GOLD2); }
    if (kind === 'pin') { c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(x - g * .45, y - g * .7); c.lineTo(x + g * .45, y - g * .7); c.lineTo(x + g * .45, y + g * .7); c.lineTo(x, y + g * .35); c.lineTo(x - g * .45, y + g * .7); c.closePath(); c.fill(); } });
}
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }

// —— the world: kitchen tools, shelves, kit boxes ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', WOOD2 = '#a6744a', WOOD3 = '#6e4a2c', INKC = '#151018', ROSE = '#c4566a', ROSE2 = '#9b3f52', STEEL = '#aab3cf', STEEL2 = '#7d87a8', MINT = '#5fb89a';
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
function floor(c) { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, '#0d1d5c'); fl.addColorStop(1, '#071341'); c.fillStyle = fl; c.fillRect(0, F, 1080, 220); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(0, F, 1080, 4); }
function grey(c, g, f) { if (g > 0) { c.save(); c.filter = `saturate(${1 - g}) brightness(${1 - .4 * g})`; f(); c.restore(); } else f(); }
// the tools: each stands on y (its bottom), centred on x, at scale s
function pan(c, x, y, s) { rrect(c, x + 60 * s, y - 34 * s, 110 * s, 16 * s, 8 * s, '#1a1f3a'); c.fillStyle = '#2b2f48'; c.beginPath(); c.ellipse(x, y - 26 * s, 76 * s, 18 * s, 0, 0, 7); c.fill(); rrect(c, x - 76 * s, y - 28 * s, 152 * s, 28 * s, 10 * s, '#2b2f48'); c.fillStyle = '#41466a'; c.beginPath(); c.ellipse(x, y - 28 * s, 68 * s, 13 * s, 0, 0, 7); c.fill(); }
function pot(c, x, y, s) { rrect(c, x - 70 * s, y - 100 * s, 140 * s, 100 * s, 16 * s, ROSE); rrect(c, x - 78 * s, y - 108 * s, 156 * s, 16 * s, 8 * s, ROSE2); rrect(c, x - 98 * s, y - 86 * s, 24 * s, 14 * s, 6 * s, '#1a1f3a'); rrect(c, x + 74 * s, y - 86 * s, 24 * s, 14 * s, 6 * s, '#1a1f3a'); rrect(c, x - 12 * s, y - 124 * s, 24 * s, 16 * s, 6 * s, '#1a1f3a'); }
function whisk(c, x, y, s, rot = 0) { c.save(); c.translate(x, y - 90 * s); c.rotate(rot); rrect(c, -9 * s, 20 * s, 18 * s, 70 * s, 8 * s, WOOD2); c.strokeStyle = STEEL; c.lineWidth = 4 * s; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-4 * s, 22 * s); c.bezierCurveTo(k * 22 * s, 0, k * 26 * s, -70 * s, 0, -84 * s); c.stroke(); } c.restore(); }
function cakeTin(c, x, y, s) { rrect(c, x - 80 * s, y - 56 * s, 160 * s, 56 * s, 6 * s, STEEL); c.fillStyle = STEEL2; c.beginPath(); c.ellipse(x, y - 56 * s, 80 * s, 16 * s, 0, 0, 7); c.fill(); c.fillStyle = '#5f6990'; c.beginPath(); c.ellipse(x, y - 56 * s, 70 * s, 12 * s, 0, 0, 7); c.fill(); rrect(c, x + 74 * s, y - 40 * s, 14 * s, 26 * s, 4 * s, STEEL2); }
function pipingBag(c, x, y, s) { c.save(); c.translate(x, y - 70 * s); c.rotate(.5); c.fillStyle = SAND; c.beginPath(); c.moveTo(-40 * s, -60 * s); c.lineTo(40 * s, -60 * s); c.lineTo(8 * s, 50 * s); c.lineTo(-8 * s, 50 * s); c.closePath(); c.fill(); c.fillStyle = ROSE; c.beginPath(); c.moveTo(-28 * s, -20 * s); c.lineTo(28 * s, -20 * s); c.lineTo(8 * s, 50 * s); c.lineTo(-8 * s, 50 * s); c.closePath(); c.fill(); c.fillStyle = STEEL; c.beginPath(); c.moveTo(-9 * s, 48 * s); c.lineTo(9 * s, 48 * s); c.lineTo(0, 74 * s); c.closePath(); c.fill(); c.restore(); }
function bowl(c, x, y, s, col = MINT) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 86 * s, y - 70 * s); c.lineTo(x + 86 * s, y - 70 * s); c.quadraticCurveTo(x + 80 * s, y, x, y); c.quadraticCurveTo(x - 80 * s, y, x - 86 * s, y - 70 * s); c.fill(); c.fillStyle = 'rgba(0,0,20,.2)'; c.beginPath(); c.ellipse(x, y - 70 * s, 86 * s, 14 * s, 0, 0, 7); c.fill(); }
function cup(c, x, y, s) { c.fillStyle = 'rgba(200,225,250,.85)'; c.beginPath(); c.moveTo(x - 40 * s, y - 90 * s); c.lineTo(x + 40 * s, y - 90 * s); c.lineTo(x + 32 * s, y); c.lineTo(x - 32 * s, y); c.closePath(); c.fill(); c.strokeStyle = 'rgba(200,225,250,.85)'; c.lineWidth = 8 * s; c.beginPath(); c.arc(x + 44 * s, y - 50 * s, 20 * s, -1.4, 1.4); c.stroke(); c.fillStyle = ROSE; for (let k = 1; k < 4; k++) c.fillRect(x - 30 * s, y - k * 22 * s, 18 * s, 3 * s); }
function spoon(c, x, y, s) { c.save(); c.translate(x, y); c.rotate(-.4); rrect(c, -6 * s, -120 * s, 12 * s, 90 * s, 6 * s, WOOD2); c.fillStyle = WOOD2; c.beginPath(); c.ellipse(0, -140 * s, 20 * s, 30 * s, 0, 0, 7); c.fill(); c.restore(); }
function ramekin(c, x, y, s) { rrect(c, x - 40 * s, y - 44 * s, 80 * s, 44 * s, 8 * s, CREAM); c.fillStyle = '#d9a332'; c.beginPath(); c.ellipse(x, y - 44 * s, 36 * s, 9 * s, 0, 0, 7); c.fill(); for (let k = 0; k < 4; k++) c.fillRect(x - 32 * s + k * 20 * s, y - 36 * s, 3 * s, 32 * s); }
function cutter(c, x, y, s) { c.strokeStyle = STEEL; c.lineWidth = 9 * s; c.beginPath(); const r = 40 * s, cy = y - 50 * s; c.moveTo(x, cy + r * .9); c.bezierCurveTo(x - r * 1.3, cy, x - r * .8, cy - r, x, cy - r * .35); c.bezierCurveTo(x + r * .8, cy - r, x + r * 1.3, cy, x, cy + r * .9); c.stroke(); }
function candles(c, x, y, s) { for (let k = -1; k <= 1; k++) { rrect(c, x + k * 24 * s - 6 * s, y - 70 * s, 12 * s, 70 * s, 4 * s, k ? '#7fb2ea' : ROSE); ell(c, x + k * 24 * s, y - 82 * s, 6 * s, 10 * s, GOLD); } }
function cake(c, x, y, s) { rrect(c, x - 110 * s, y - 120 * s, 220 * s, 120 * s, 16 * s, '#f3d7c9'); rrect(c, x - 110 * s, y - 70 * s, 220 * s, 20 * s, 0, ROSE); c.fillStyle = CREAM; c.beginPath(); c.moveTo(x - 112 * s, y - 112 * s); for (let k = 0; k <= 8; k++) c.quadraticCurveTo(x - 112 * s + (k - .5) * 28 * s, y - 80 * s, x - 112 * s + k * 28 * s, y - 112 * s); c.lineTo(x + 112 * s, y - 128 * s); c.lineTo(x - 112 * s, y - 128 * s); c.closePath(); c.fill(); candles(c, x, y - 124 * s, s * .9); }
const TOOLS = { pan, pot, whisk, cakeTin, pipingBag, bowl, cup, spoon, ramekin, cutter, candles };
// a kit box: a cream box with a coloured band and a label icon; open 0..1 lifts the lid; items drawn inside rise up out of it
function box(c, x, y, s, o = {}) { const w = 300 * s, h = 190 * s, open = o.open || 0, col = o.col || GOLD;
  c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.ellipse(x, y + 4, w * .56, 16 * s, 0, 0, 7); c.fill();
  if (open > 0) { rrect(c, x - w / 2 + 4 * s, y - h - h * .75 * open, w - 8 * s, h * .75 * open + 10 * s, 12 * s, SAND3); }   // the lid, standing open behind
  if (o.items && open > 0) { o.items.forEach(([k, dx, sc], i) => { const u = ease(clamp(open * 1.6 - i * .15)); TOOLS[k](c, x + dx * s, lerp(y - h * .3, y - h + 8 * s, u), sc * s); }); }
  rrect(c, x - w / 2, y - h, w, h, 14 * s, SAND); rrect(c, x - w / 2, y - h * .62, w, 40 * s, 0, col); rrect(c, x - 22 * s, y - h, 44 * s, h, 0, col);
  if (o.label) { ell(c, x, y - h * .42, 34 * s, 34 * s, CREAM); o.label(c, x, y - h * .42, s); }
  if (open < .02) { rrect(c, x - w / 2 - 6 * s, y - h - 26 * s, w + 12 * s, 26 * s, 8 * s, SAND2); rrect(c, x - 22 * s, y - h - 26 * s, 44 * s, 26 * s, 0, col); }
  if (o.bow && open < .3) { c.fillStyle = col; for (const d of [-1, 1]) { c.beginPath(); c.ellipse(x + d * 34 * s, y - h - 40 * s, 34 * s, 20 * s, d * .5, 0, 7); c.fill(); } ell(c, x, y - h - 36 * s, 14 * s, 14 * s, GOLD2); } }
function hatIcon(c, x, y, s) { c.fillStyle = '#ffffff'; for (const d of [-14, 0, 14]) ell(c, x + d * s, y - 8 * s, 13 * s, 13 * s, '#ffffff'); rrect(c, x - 16 * s, y - 2 * s, 32 * s, 18 * s, 3 * s, '#ffffff'); c.strokeStyle = NAVY; c.lineWidth = 2 * s; c.strokeRect(x - 16 * s, y + 8 * s, 32 * s, 8 * s); }
function cakeIcon(c, x, y, s) { scaled(c, x, y + 18 * s, .26, () => cake(c, x, y + 18 * s, 1)); }
function heartIcon(c, x, y, s) { heart(c, x, y + 2 * s, 20 * s, 1, ROSE); }
const KITS = [{ col: MINT, label: hatIcon, items: [['bowl', -70, .7], ['whisk', 20, .9], ['cup', 90, .7], ['spoon', -10, .8]] },
  { col: ROSE, label: cakeIcon, items: [['cakeTin', -50, .8], ['candles', 80, 1], ['pipingBag', 30, .8]] },
  { col: GOLD, label: heartIcon, items: [['ramekin', -80, .9], ['cutter', 10, .9], ['whisk', 90, .8]] }];
function shelf(c, x0, x1, ys, goods) { rrect(c, x0, ys[0] - 190, x1 - x0, F - ys[0] + 190, 14, '#1f2c70'); ys.forEach((y, i) => { goods && goods(i, y); rrect(c, x0, y, x1 - x0, 16, 4, '#4a5cae'); rrect(c, x0, y + 16, x1 - x0, 10, 0, '#34449a'); }); }
function dust(c, x, y, w, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(220,225,240,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - w / 2, y - 120); c.quadraticCurveTo(x - w / 4, y - 80, x, y - 110); c.moveTo(x - w / 2, y - 120); c.quadraticCurveTo(x - w / 2 + 30, y - 70, x - w / 2 + 6, y - 40); c.moveTo(x - w / 2, y - 120); c.lineTo(x - w / 2 + 40, y - 70); c.stroke(); for (let k = 0; k < 10; k++) ell(c, x - w / 2 + hash(k) * w, y - 10 - hash(k + 4) * 60, 3, 3, 'rgba(220,225,240,.6)'); c.restore(); }
function bulbIcon(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, r * 3, .7); ell(c, x, y, r, r, '#ffd889'); rrect(c, x - r * .45, y + r * .8, r * .9, r * .5, r * .15, SAND2); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y + r * .2); c.lineTo(x, y - r * .25); c.lineTo(x + r * .3, y + r * .2); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); c.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); c.stroke(); } }); }
function calendarBadge(c, x, y, k, n) { pop(c, x, y, k, () => { rrect(c, x - 60, y - 70, 120, 140, 12, CREAM); rrect(c, x - 60, y - 70, 120, 36, 12, ROSE); c.fillStyle = ROSE; c.fillRect(x - 60, y - 48, 120, 14); text(c, String(n), x, y + 18, 58, NAVY); }); }
function eyeB(c, x, y, r, k) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - r * .72, y); c.quadraticCurveTo(x, y - r * .66, x + r * .72, y); c.quadraticCurveTo(x, y + r * .66, x - r * .72, y); c.fill(); ell(c, x, y, r * .27, r * .27, CREAM); ell(c, x, y, r * .13, r * .13, GOLD); }); }
function owner(c, t, x, y, s, o = {}) { mascot(c, { id: 'own', skin: 'owner', s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi || 0, handL: o.handL, handR: o.handR, squash: o.squash || 0, bowtie: true }); }
const CUST = [{ skin: 'blue2', fem: 'pony' }, { skin: 'blue1' }, { skin: 'blue3', fem: 'glasses' }, { skin: 'blue1', tache: true }];
function cust(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'c' + k, ...CUST[k % 4], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0 }); }
const walkU = (t, a, b) => { const u = seg(t, a, b); return { u, walk: u > 0 && u < 1 ? 1 : 0 }; };
// the big shelf of the shop: pans and pots sell; the tins, whisks and piping bags at the top stay
function bigShelf(c, t, o = {}) { const g = o.grey || 0, gone = o.gone || 0, hl = o.hl || [0, 0, 0];
  shelf(c, 330, 1010, [1250, 1470, F - 20], (i, y) => {
    if (i === 0) [['cakeTin', 425, 0], ['whisk', 565, 1], ['pipingBag', 690, 2], ['cakeTin', 830, 0], ['whisk', 950, 1]].forEach(([k, x, j]) => { if (gone > hash(x) ) return; const lit = hl[j]; grey(c, g * (1 - lit), () => TOOLS[k](c, x, y, k === 'whisk' ? 1.15 : .95)); if (lit > 0) glow(c, x, y - 50, 120, .45 * lit); });
    if (i === 1) [['pot', 450], ['pan', 670], ['pot', 880]].forEach(([k, x]) => TOOLS[k](c, x, y, 1.0));
    if (i === 2) [['pan', 440], ['bowl', 670], ['pan', 890]].forEach(([k, x]) => TOOLS[k](c, x, y, 1.0)); });
  dust(c, 670, 1250, 600, o.dust || 0); }

const SHOT = {
  store(c, t) {   // a kitchen shop full of products; some sell badly: the top shelf goes grey
    bg(c, '#163A8C'); floor(c); const H = HIT;
    bigShelf(c, t, { grey: ss(seg(t, H.bad - .2, H.bad + .4)) });
    owner(c, t, 170, F, 1.55, { f: .4, look: .3, smile: lerp(1, .5, ss(seg(t, H.bad, H.bad + .4))) });
    badge(c, 'x', 670, 1050, 48, E(t, H.bad + .1, .3, .5));
  },
  dusty(c, t) {   // the cake tins, the small whisks and the decorating tools: each lights up in turn; months go by; dust and cobwebs
    bg(c, '#163A8C'); floor(c); const H = HIT; const z = 1.35; c.save(); c.translate(670, 1250); c.scale(z, z); c.translate(-670, -1330);
    const hl = H.items.map((a, i) => ss(seg(t, a - .1, a + .2)) * (1 - ss(seg(t, (H.items[i + 1] || H.months) - .1, (H.items[i + 1] || H.months) + .2))));
    bigShelf(c, t, { grey: .8, hl, dust: ss(seg(t, H.months, H.months + 1.0)) }); c.restore();
    calendarBadge(c, 180, 1150, E(t, H.months - .2, .3, .5), 3 + Math.floor(clamp(seg(t, H.months, H.months + 1)) * 5));
  },
  onething(c, t) {   // customers come in for one thing: she walks straight to the pans, takes one, and leaves; the rest of the shop she never looks at
    bg(c, '#163A8C'); floor(c); const H = HIT;
    const dim = ss(seg(t, H.rarely - .2, H.rarely + .4)); bigShelf(c, t, { grey: .8 });
    if (dim > 0) { c.save(); c.globalAlpha = .3 * dim; c.fillStyle = '#00113F'; c.fillRect(330, 1060, 680, 640); c.restore(); }
    const inn = walkU(t, 10.2, H.specific), take = t > H.specific + .3, out = walkU(t, H.come + .1, H.come + 1.6);
    const x = out.u > 0 ? lerp(560, -150, ss(out.u)) : lerp(-150, 560, ss(inn.u));
    const hand = take ? [x + (out.u > 0 ? -60 : 60), 1500] : (t > H.specific - .3 ? [640, 1440] : undefined);
    cust(c, t, 0, x, F, 1.45, { f: out.u > 0 ? -.45 : .45, walk: inn.walk || out.walk, look: out.u > 0 ? -.3 : .3, smile: .9, handR: out.u > 0 ? undefined : hand, handL: out.u > 0 ? hand : undefined });
    if (take) pan(c, hand[0], hand[1] + 40, .6);
    pop(c, 640, 1340, E(t, H.specific, .3, .5) * (1 - ss(seg(t, H.specific + .4, H.specific + .7))), () => { ell(c, 640, 1340, 40, 40, CREAM); check(c, 640, 1340, 30, 1); });
    owner(c, t, 160, F, 1.45, { f: .4, look: .3, smile: .6 }); badge(c, 'ex', 160, 1200, 40, E(t, H.notice, .3, .5) * (1 - ss(seg(t, 13, 13.3))));
    eyeB(c, 670, 1150, 54, E(t, H.rarely, .3, .5)); cross(c, 670, 1150, 36, seg(t, H.rarely + .2, H.rarely + .6));
  },
  decide(c, t) {   // so he decides: not one by one, but ready-made kits: the tools fly off the shelf into an open box, which closes with a bow
    bg(c, '#163A8C'); floor(c); const H = HIT;
    owner(c, t, 190, F, 1.6, { f: .4, look: .3, smile: 1, squash: wob(t, H.dec, .4, 18, .5) }); bulbIcon(c, 190, 1150, 44, E(t, H.dec, .3, .5) * (1 - ss(seg(t, H.kits, H.kits + .3))));
    // the tools, one by one, apart; then each flies into the box
    const items = [['cakeTin', 450, 1330, 1.1], ['whisk', 630, 1340, 1.4], ['pipingBag', 790, 1330, 1.2], ['bowl', 950, 1340, .9]];
    const bk = E(t, H.kits - .3, .35, .45), close = ss(seg(t, H.assemble, H.assemble + .5));
    items.forEach(([k, x, y, sc], i) => { const a = E(t, 16.8 + i * .12, .3, .45), u = ease(seg(t, H.apart + .3 + i * .2, H.apart + .9 + i * .2)); if (a <= 0 || u >= 1) return; const px = lerp(x, 680, u), py = lerp(y, 1560, u) - 180 * Math.sin(u * Math.PI); pop(c, px, py, a * (1 - .5 * u), () => TOOLS[k](c, px, py, sc)); });
    if (t < H.apart + 1.3) items.forEach(([, x, y], i) => cross(c, x, y - 60, 30, seg(t, H.apart - .1, H.apart + .2) * (1 - ss(seg(t, H.apart + .3 + i * .2, H.apart + .5 + i * .2)))));
    pop(c, 680, 1660, bk, () => box(c, 680, 1660, 1.1, { open: 1 - close, col: ROSE, bow: true }));
    if (t > H.assemble + .4) spark(c, 680, 1480, t, H.assemble + .4, 7, 220, 16);
  },
  bundles(c, t) {   // a kit for beginners, a kit for birthday cakes, a kit for dessert lovers: three boxes; each opens and shows what is inside
    bg(c, '#163A8C'); floor(c); const H = HIT;
    KITS.forEach((k, i) => { const x = [210, 540, 870][i], a = E(t, H.kit[i] - .3, .35, .45), open = ss(seg(t, H.kitOpen[i] - .2, H.kitOpen[i] + .6)); pop(c, x, F - 40, a, () => box(c, x, F - 40, .92, { open, col: k.col, label: k.label, items: k.items })); });
    for (let i = 0; i < 3; i++) if (t > H.kitOpen[i] + .3) spark(c, [210, 540, 870][i], 1360, t, H.kitOpen[i] + .3, 5, 120, 12);
  },
  match(c, t) {   // in every kit, things that belong together, all you need to start: the birthday kit's tools join up, and a cake appears
    bg(c, '#163A8C'); floor(c); const H = HIT; const k = KITS[1];
    const join = ease(seg(t, H.fit - .2, H.fit + .6)), make = ss(seg(t, H.start - .3, H.start + .4));
    box(c, 540, F - 30, 1.25, { open: 1, col: k.col, label: k.label });
    const P = [[300, 1330, 'cakeTin', .9], [540, 1220, 'pipingBag', 1], [780, 1330, 'candles', 1.1]];
    P.forEach(([x, y, n, sc], i) => { const a = E(t, 31.8 + i * .2, .35, .45); const px = lerp(x, 540 + (i - 1) * 120, join * .0 + 0), py = y; if (a > 0) pop(c, px, py, a * (1 - make), () => TOOLS[n](c, px, py, sc)); });
    if (join > 0 && make < 1) { c.save(); c.globalAlpha = 1 - make; c.setLineDash([10, 12]); c.strokeStyle = GOLD; c.lineWidth = 6; c.beginPath(); c.moveTo(340, 1290); c.lineTo(lerp(340, 520, join), lerp(1290, 1180, join)); c.moveTo(560, 1180); c.lineTo(lerp(560, 740, join), lerp(1180, 1290, join)); c.stroke(); c.restore(); }
    if (join > .9) for (const x of [430, 650]) pop(c, x, 1235, E(t, H.fit + .5, .3, .5) * (1 - make), () => { ell(c, x, 1235, 22, 22, GOLD); });
    pop(c, 540, 1400, make * 1.2, () => cake(c, 540, 1400, 1.1)); if (t > H.start + .2) spark(c, 540, 1300, t, H.start + .2, 8, 240, 16);
    cust(c, t, 2, 920, F, 1.4, { f: -.4, look: -.3, smile: lerp(.8, 1, make) });
  },
  easy(c, t) {   // no more hunting for each tool one by one: on the left, a shopper with a list searches shelf after shelf; on the right, she just takes one box
    bg(c, '#163A8C'); floor(c); const H = HIT; const sw = ss(seg(t, H.simply - .3, H.simply + .2));
    // left: the hunt
    c.save(); c.globalAlpha = 1 - .6 * sw; shelf(c, 60, 500, [1300, 1500, F - 20], (i, y) => { [['whisk', 150], ['cup', 280], ['spoon', 410]].forEach(([n, x], j) => { const k = (i + j) % 3; TOOLS[[n, 'cakeTin', 'bowl'][k]](c, x + (k === 1 ? 0 : 0), y, .6); }); });
    const look = t < H.simply ? 120 + 260 * (.5 + .5 * Math.sin((t - 37) * 2.4)) : 300; cust(c, t, 1, look, F + 50, 1.3, { f: .2, look: Math.sin(t * 3) * .5, smile: .3, sad: .4 });
    pop(c, 280, 1150, E(t, H.one - .2, .3, .5), () => { rrect(c, 210, 1080, 140, 160, 10, '#ffffff'); for (let k = 0; k < 4; k++) { rrect(c, 230, 1105 + k * 34, 18, 18, 4, k < 1 ? GOLD : SAND2); rrect(c, 260, 1110 + k * 34, 70, 8, 4, SAND3); } });
    cross(c, 280, 1160, 80, seg(t, H.simply - .3, H.simply + .1)); c.restore();
    // right: one box
    const bk = E(t, H.simply - .2, .35, .45); pop(c, 780, F - 40, bk, () => box(c, 780, F - 40, .85, { col: KITS[0].col, label: KITS[0].label, bow: true }));
    if (t > H.bought) { const u = ease(seg(t, H.bought, H.bought + .4)); cust(c, t, 0, 940, F, 1.4, { f: -.4, look: -.3, smile: 1, handL: [lerp(900, 880, u), lerp(1500, 1560, u)] }); check(c, 780, 1300, 40, E(t, H.bought + .2, .45, .2)); } else cust(c, t, 0, 960, F, 1.4, { f: -.4, look: -.3, smile: .9 });
  },
  sold(c, t) {   // and the shop sold the things almost nobody had noticed before: the dusty top shelf empties, boxes go out the door, the sales climb
    bg(c, '#163A8C'); floor(c); const H = HIT;
    bigShelf(c, t, { grey: .5 * (1 - ss(seg(t, H.sell - .5, H.sell))), gone: seg(t, H.sell, H.sell + 1.6), dust: 1 - ss(seg(t, H.sell - .5, H.sell + .2)) });
    for (let k = 0; k < 3; k++) { const w = walkU(t, H.sell - .2 + k * .7, H.sell + 1.8 + k * .7); if (w.u <= 0 || w.u >= 1) continue; const x = lerp(560, -160, w.u); cust(c, t, k, x, F, 1.35, { f: -.45, walk: 1, look: -.3, smile: 1, handL: [x - 70, 1520] }); scaled(c, x - 70, 1600, .4, () => box(c, x - 70, 1600, 1, { col: KITS[k].col, label: KITS[k].label })); }
    owner(c, t, 180, F, 1.5, { f: .4, look: .3, smile: 1 });
    pop(c, 670, 1080, E(t, H.nobody, .3, .5), () => { rrect(c, 560, 1010, 220, 140, 18, CREAM); const up = ss(seg(t, H.nobody, H.nobody + .6)); [.3, .5, .8].forEach((v, i) => { const h = 100 * v * lerp(.5, 1, up); rrect(c, 590 + i * 60, 1130 - h, 40, h, 6, i === 2 ? GOLD : '#3d5cc8'); }); });
  },
  lesson(c, t) {   // the owner sees it: sometimes it isn't that they don't want it; they just don't know yet what to use it for. A lone cake tin; a question; it becomes a birthday cake
    bg(c, '#163A8C'); floor(c); const H = HIT; const turn = ss(seg(t, H.use - .3, H.use + .4));
    owner(c, t, 190, F, 1.6, { f: .4, look: .3, smile: 1 }); bulbIcon(c, 190, 1150, 42, E(t, H.realise, .3, .5) * (1 - ss(seg(t, H.problem - .2, H.problem))));
    rrect(c, 420, 1640, 400, 60, 12, SAND2);
    if (turn < 1) pop(c, 620, 1640, 1 - turn, () => cakeTin(c, 620, 1640, 1.6));
    pop(c, 620, 1640, turn * 1.05, () => cake(c, 620, 1640, 1.25)); if (t > H.use + .2) spark(c, 620, 1400, t, H.use + .2, 8, 260, 18);
    pop(c, 620, 1240, E(t, H.notwant - .2, .3, .5) * (1 - ss(seg(t, H.butknow - .2, H.butknow))), () => { ell(c, 620, 1240, 52, 52, CREAM); heart(c, 620, 1244, 26, 1, ROSE); cross(c, 620, 1240, 34, seg(t, H.notwant + .1, H.notwant + .5)); });
    badge(c, 'q', 620, 1240, 52, E(t, H.butknow, .3, .5) * (1 - turn));
    cust(c, t, 0, 930, F, 1.45, { f: -.4, look: -.3, smile: lerp(.6, 1, turn) });
  },
};
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.18, 1.18); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['rosszul','hónapokig','konkrét','csomagokat','kezdenek','születésnapi','desszerteket','összeillő','egyenként','csomagot','senki','tudja,','használhatná']);
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
  c.fillStyle = TOP; c.fillRect(0, 0, 1080, 660); const g = c.createLinearGradient(0, 660, 0, 760); g.addColorStop(0, TOP); g.addColorStop(1, 'rgba(0,17,63,0)'); c.fillStyle = g; c.fillRect(0, 660, 1080, 100);
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
const PH = [540, 1300];
const SOFT = .7, DIVE = .6, WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55, PAGE = .6;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'soft' && dt < SOFT && i > 0) {
    const e = ss(dt / SOFT), b = Math.sin(e * Math.PI);
    const pic = (cx, j, tt) => { NOW = tt; cx.setTransform(K, 0, 0, K, 0, 0); cx.translate(540, 1790); cx.scale(1.18, 1.18); cx.translate(-540, -1790); SHOT[SHOTS[j][1]](cx, tt); };
    pic(actx, i - 1, t0 - 1 / 48); pic(bctx, i, t);
    const at = (buf, s, a, bl) => { c.save(); c.globalAlpha = a; if (bl > .3) c.filter = `blur(${bl * K}px)`; c.translate(W / 2, H * .68); c.scale(s, s); c.translate(-W / 2, -H * .68); c.drawImage(buf, 0, 0); c.restore(); };
    at(bufA, 1 + .06 * e, 1, 7 * b); at(bufB, .95 + .05 * e, e, 7 * b);
    c.setTransform(K, 0, 0, K, 0, 0); captions(c, t);   // the words stay crisp on top while the picture dissolves
  } else if ((kind === 'dive' || kind === 'rise') && dt < DIVE && i > 0) {
    const e = ss(dt / DIVE), px = PH[0] * K, py = PH[1] * K, dive = kind === 'dive';
    const pic = (cx, j, tt) => { cx.setTransform(K, 0, 0, K, 0, 0); NOW = tt; SHOT[SHOTS[j][1]](cx, tt); };
    pic(actx, i - 1, t0 - 1 / 48); pic(bctx, i, t);
    const zoomAt = (buf, s, a, blur) => { c.save(); c.globalAlpha = a; if (blur > .2) c.filter = `blur(${blur * K}px)`; c.translate(px, py); c.scale(s, s); c.translate(-px, -py); c.drawImage(buf, 0, 0); c.restore(); };
    if (dive) { zoomAt(bufA, lerp(1, 5, e * e), 1 - ss(clamp((e - .35) / .45)), 10 * Math.sin(e * Math.PI)); zoomAt(bufB, lerp(.18, 1, e), ss(clamp((e - .2) / .5)), 8 * (1 - e)); }
    else { zoomAt(bufB, lerp(5, 1, 1 - (1 - e) * (1 - e)), ss(clamp(e / .5)), 10 * (1 - e)); zoomAt(bufA, lerp(1, .18, e), 1 - ss(clamp((e - .25) / .5)), 6 * e); }
    c.setTransform(K, 0, 0, K, 0, 0); captions(c, t);
  } else if (kind === 'whip' && dt < WHIP && i > 0) {
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
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t: +(t * TS).toFixed(3), type });   // the sound follows the real clock
window.DUR = +(DUR * TS).toFixed(2);
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t / TS);   // the picture runs on the timeline's clock
window.render(0);
window.READY = true;
