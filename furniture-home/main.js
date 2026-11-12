// Story 19, A bolt, ami otthont épített (The Store That Built a Home): a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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

// —— the furniture: every piece stands on y (the floor), centred on x, at scale s ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', WOOD2 = '#a6744a', WOOD3 = '#6e4a2c', INKC = '#151018';
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function shade(c, x, y, w, h) { c.fillStyle = 'rgba(0,0,20,.16)'; c.fillRect(x, y, w, h); }
function sofa(c, x, y, s = 1, o = {}) { const w = 380 * s, g = o.grey || 0; c.save(); if (g) c.filter = `saturate(${1 - g}) brightness(${1 - .35 * g})`;
  rrect(c, x - w / 2 + 30 * s, y - 22 * s, 16 * s, 22 * s, 4 * s, WOOD3); rrect(c, x + w / 2 - 46 * s, y - 22 * s, 16 * s, 22 * s, 4 * s, WOOD3);
  rrect(c, x - w / 2 + 30 * s, y - 205 * s, w - 60 * s, 130 * s, 26 * s, SAND2);   // the back
  rrect(c, x - w / 2 + 40 * s, y - 196 * s, (w - 80 * s) / 2 - 4 * s, 110 * s, 22 * s, SAND); rrect(c, x + 4 * s, y - 196 * s, (w - 80 * s) / 2 - 4 * s, 110 * s, 22 * s, SAND);   // back cushions
  rrect(c, x - w / 2 + 20 * s, y - 92 * s, w - 40 * s, 72 * s, 18 * s, SAND3);   // the base
  rrect(c, x - w / 2 + 44 * s, y - 104 * s, (w - 88 * s) / 2 - 3 * s, 40 * s, 14 * s, SAND); rrect(c, x + 3 * s, y - 104 * s, (w - 88 * s) / 2 - 3 * s, 40 * s, 14 * s, SAND);   // seat cushions
  for (const d of [-1, 1]) { rrect(c, x + d * (w / 2 - 26 * s) - 26 * s, y - 150 * s, 52 * s, 132 * s, 24 * s, SAND2); rrect(c, x + d * (w / 2 - 26 * s) - 26 * s, y - 150 * s, 52 * s, 30 * s, 15 * s, SAND); }
  if (o.pillow) { c.save(); c.translate(x - w / 2 + 92 * s, y - 128 * s); c.rotate(-.18); rrect(c, -34 * s, -32 * s, 68 * s, 64 * s, 16 * s, GOLD2); c.restore(); }
  c.restore(); }
function table(c, x, y, s = 1) { rrect(c, x - 110 * s, y - 92 * s, 220 * s, 20 * s, 8 * s, WOOD2); rrect(c, x - 110 * s, y - 76 * s, 220 * s, 6 * s, 3 * s, WOOD3); for (const d of [-1, 1]) rrect(c, x + d * 82 * s - 8 * s, y - 72 * s, 16 * s, 72 * s, 5 * s, WOOD); }
function chair(c, x, y, s = 1) { rrect(c, x - 60 * s, y - 230 * s, 16 * s, 230 * s, 6 * s, WOOD3); rrect(c, x - 60 * s, y - 228 * s, 100 * s, 22 * s, 8 * s, WOOD); rrect(c, x - 60 * s, y - 182 * s, 100 * s, 16 * s, 6 * s, WOOD);
  rrect(c, x - 66 * s, y - 112 * s, 132 * s, 20 * s, 8 * s, WOOD2); rrect(c, x + 44 * s, y - 96 * s, 14 * s, 96 * s, 5 * s, WOOD); rrect(c, x - 52 * s, y - 96 * s, 14 * s, 96 * s, 5 * s, WOOD3); }
function lamp(c, x, y, s = 1, on = 0) { ell(c, x, y - 6 * s, 50 * s, 12 * s, WOOD3); rrect(c, x - 5 * s, y - 300 * s, 10 * s, 296 * s, 5 * s, SAND2);
  if (on > 0) { glow(c, x, y - 300 * s, 260 * s, .75 * on); c.save(); c.globalAlpha = .22 * on; const g = c.createLinearGradient(0, y - 290 * s, 0, y); g.addColorStop(0, 'rgba(255,220,140,1)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 50 * s, y - 290 * s); c.lineTo(x + 50 * s, y - 290 * s); c.lineTo(x + 170 * s, y); c.lineTo(x - 170 * s, y); c.closePath(); c.fill(); c.restore(); }
  c.fillStyle = on > .5 ? '#ffd889' : GOLD; c.beginPath(); c.moveTo(x - 40 * s, y - 375 * s); c.lineTo(x + 40 * s, y - 375 * s); c.lineTo(x + 66 * s, y - 290 * s); c.lineTo(x - 66 * s, y - 290 * s); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,20,.12)'; c.fillRect(x - 66 * s, y - 296 * s, 132 * s, 6 * s); }
function rug(c, x, y, w) { c.save(); c.fillStyle = '#c38a3c'; c.beginPath(); c.ellipse(x, y, w / 2, w * .085, 0, 0, 7); c.fill(); c.strokeStyle = SAND; c.lineWidth = Math.max(1.5, w * .01); c.beginPath(); c.ellipse(x, y, w * .465, Math.max(.5, w * .07), 0, 0, 7); c.stroke(); c.restore(); }
function bed(c, x, y, s = 1) { const w = 420 * s; rrect(c, x - w / 2, y - 250 * s, 40 * s, 250 * s, 10 * s, WOOD3); rrect(c, x - w / 2 + 6 * s, y - 250 * s, w * .1, 18 * s, 8 * s, WOOD2);
  rrect(c, x - w / 2 + 30 * s, y - 120 * s, w - 40 * s, 64 * s, 14 * s, SAND); rrect(c, x - w / 2 + 26 * s, y - 60 * s, w - 30 * s, 34 * s, 8 * s, WOOD); rrect(c, x + w / 2 - 28 * s, y - 30 * s, 16 * s, 30 * s, 4 * s, WOOD3); rrect(c, x - w / 2 + 34 * s, y - 30 * s, 16 * s, 30 * s, 4 * s, WOOD3);
  rrect(c, x - w / 2 + 50 * s, y - 158 * s, 100 * s, 46 * s, 20 * s, '#ffffff'); rrect(c, x - w / 2 + 130 * s, y - 132 * s, w - 150 * s, 80 * s, 18 * s, '#3d5cc8'); rrect(c, x - w / 2 + 130 * s, y - 132 * s, 40 * s, 80 * s, 14 * s, '#5272dd'); rrect(c, x + w / 2 - 50 * s, y - 150 * s, 36 * s, 124 * s, 10 * s, WOOD3); }
function nightstand(c, x, y, s = 1, on = 0) { rrect(c, x - 60 * s, y - 120 * s, 120 * s, 114 * s, 10 * s, WOOD); rrect(c, x - 50 * s, y - 106 * s, 100 * s, 40 * s, 6 * s, WOOD2); rrect(c, x - 50 * s, y - 60 * s, 100 * s, 40 * s, 6 * s, WOOD2); ell(c, x, y - 86 * s, 6 * s, 6 * s, GOLD); ell(c, x, y - 40 * s, 6 * s, 6 * s, GOLD);
  rrect(c, x - 4 * s, y - 190 * s, 8 * s, 70 * s, 4 * s, SAND2); ell(c, x, y - 122 * s, 24 * s, 6 * s, WOOD3); if (on > 0) glow(c, x, y - 200 * s, 140 * s, .6 * on); c.fillStyle = on > .5 ? '#ffd889' : GOLD; c.beginPath(); c.moveTo(x - 24 * s, y - 232 * s); c.lineTo(x + 24 * s, y - 232 * s); c.lineTo(x + 38 * s, y - 186 * s); c.lineTo(x - 38 * s, y - 186 * s); c.closePath(); c.fill(); }
function wardrobe(c, x, y, s = 1) { rrect(c, x - 120 * s, y - 440 * s, 240 * s, 424 * s, 12 * s, WOOD3); rrect(c, x - 108 * s, y - 428 * s, 104 * s, 400 * s, 8 * s, WOOD); rrect(c, x + 4 * s, y - 428 * s, 104 * s, 400 * s, 8 * s, WOOD); rrect(c, x - 96 * s, y - 412 * s, 80 * s, 368 * s, 6 * s, WOOD2); rrect(c, x + 16 * s, y - 412 * s, 80 * s, 368 * s, 6 * s, WOOD2);
  rrect(c, x - 22 * s, y - 250 * s, 8 * s, 50 * s, 4 * s, GOLD); rrect(c, x + 14 * s, y - 250 * s, 8 * s, 50 * s, 4 * s, GOLD); rrect(c, x - 110 * s, y - 18 * s, 18 * s, 18 * s, 3 * s, WOOD3); rrect(c, x + 92 * s, y - 18 * s, 18 * s, 18 * s, 3 * s, WOOD3); }
function books(c, x, y, s = 1) { [['#c4566a', 64, 0], ['#3d5cc8', 56, 4], [GOLD2, 60, -3]].forEach(([col, w, dx], k) => { rrect(c, x - w / 2 * s + dx * s, y - (k + 1) * 16 * s, w * s, 15 * s, 3 * s, col); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(x + (w / 2 - 8 + dx) * s, y - (k + 1) * 16 * s + 3 * s, 4 * s, 9 * s); }); }
function plant(c, x, y, s = 1) { c.fillStyle = '#3fa45f'; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .42; c.save(); c.translate(x, y - 46 * s); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -36 * s, 12 * s, 36 * s, 0, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = SAND; c.beginPath(); c.moveTo(x - 28 * s, y - 52 * s); c.lineTo(x + 28 * s, y - 52 * s); c.lineTo(x + 20 * s, y); c.lineTo(x - 20 * s, y); c.closePath(); c.fill(); c.fillStyle = GOLD2; c.fillRect(x - 27 * s, y - 52 * s, 54 * s, 8 * s); }
function frame(c, x, y, w, h) { rrect(c, x - w / 2, y - h / 2, w, h, 6, WOOD2); rrect(c, x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 3, '#9fc7f0'); c.save(); c.beginPath(); c.rect(x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24); c.clip(); c.fillStyle = '#3d5cc8'; c.beginPath(); c.moveTo(x - w / 2, y + h / 2); c.lineTo(x - w * .1, y - h * .05); c.lineTo(x + w * .12, y + h * .18); c.lineTo(x + w * .3, y + h * .02); c.lineTo(x + w / 2, y + h / 2); c.fill(); ell(c, x + w * .22, y - h * .2, h * .1, h * .1, GOLD); c.restore(); }
function windowW(c, x, y, w, h, k = 1) { rrect(c, x - w / 2 - 12, y - h / 2 - 12, w + 24, h + 24, 10, SAND); const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#7fb2ea'); g.addColorStop(1, '#bcd9f5'); c.fillStyle = g; c.fillRect(x - w / 2, y - h / 2, w, h);
  c.fillStyle = 'rgba(255,255,255,.5)'; ell(c, x - w * .2, y - h * .2, w * .14, h * .06, 'rgba(255,255,255,.6)'); c.fillStyle = SAND; c.fillRect(x - 6, y - h / 2, 12, h); c.fillRect(x - w / 2, y - 6, w, 12); rrect(c, x - w / 2 - 22, y + h / 2 + 8, w + 44, 16, 6, SAND2); }
function tag(c, x, y, k = 1, str = 'Ft') { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => { c.strokeStyle = SAND2; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 46); c.lineTo(x, y - 18); c.stroke(); c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - 50 + 4, y - 18 + 6, 100, 54, 10); c.fill(); rrect(c, x - 50, y - 18, 100, 54, 10, SAND); ell(c, x - 34, y + 9, 6, 6, GOLD2); text(c, str, x + 10, y + 11, 32, NAVY); }); }
function room(c, x0, x1, k = 1, o = {}) {   // a room set: a back wall with a skirting board and a floor in front; k raises the wall from the floor
  if (k <= 0) return; const top = 1060, h = (F - top) * ease(k); c.save(); c.beginPath(); c.rect(x0, F - h, x1 - x0, h); c.clip();
  const g = c.createLinearGradient(0, top, 0, F); g.addColorStop(0, o.warm ? '#3b4f9e' : '#2b3f8e'); g.addColorStop(1, o.warm ? '#2f4290' : '#22357f'); c.fillStyle = g; c.fillRect(x0, top, x1 - x0, F - top);
  c.fillStyle = 'rgba(255,255,255,.04)'; for (let xx = x0 + 40; xx < x1; xx += 80) c.fillRect(xx, top, 2, F - top); c.fillStyle = SAND2; c.fillRect(x0, F - 28, x1 - x0, 28); c.restore(); }
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function floor(c) { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, '#0d1d5c'); fl.addColorStop(1, '#071341'); c.fillStyle = fl; c.fillRect(0, F, 1080, 220); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(0, F, 1080, 4); }
function plinth(c, x, w, k = 1) { c.save(); c.globalAlpha = k; ell(c, x, F + 10, w / 2, 20, '#1b2a70'); c.restore(); }
function spotCone(c, x, w, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; const g = c.createLinearGradient(0, 900, 0, F); g.addColorStop(0, 'rgba(255,236,190,.0)'); g.addColorStop(1, 'rgba(255,236,190,.22)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 30, 900); c.lineTo(x + 30, 900); c.lineTo(x + w / 2, F + 10); c.lineTo(x - w / 2, F + 10); c.closePath(); c.fill(); c.restore(); ell(c, x, F + 10, w / 2, 22, `rgba(255,236,190,${.18 * a})`); }
function bulbIcon(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, r * 3, .7); ell(c, x, y, r, r, '#ffd889'); rrect(c, x - r * .45, y + r * .8, r * .9, r * .5, r * .15, SAND2); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y + r * .2); c.lineTo(x, y - r * .25); c.lineTo(x + r * .3, y + r * .2); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); c.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); c.stroke(); } }); }
function house(c, x, y, w, k, o = {}) {   // a home sign: a cream house outline (the viewer's own home), its inside lit or empty
  if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => { const h = w * .8; c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 14, w, h, 26); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 26, CREAM);
    c.fillStyle = o.lit ? '#ffe7b0' : '#22357f'; c.beginPath(); c.moveTo(x, y - h * .36); c.lineTo(x + w * .3, y - h * .08); c.lineTo(x + w * .3, y + h * .34); c.lineTo(x - w * .3, y + h * .34); c.lineTo(x - w * .3, y - h * .08); c.closePath(); c.fill();
    c.strokeStyle = NAVY; c.lineWidth = w * .035; c.lineJoin = 'round'; c.stroke(); if (o.inner) o.inner(); }); }
// the people: the owner is white with a moustache; the customers are blue
function owner(c, t, x, y, s, o = {}) { mascot(c, { id: 'own', skin: 'owner', tache: true, s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi || 0, handL: o.handL, handR: o.handR, armL: o.armL, armR: o.armR, squash: o.squash || 0 }); }
const CUST = [{ skin: 'blue2', fem: 'pony' }, { skin: 'blue1' }, { skin: 'blue3', fem: 'glasses' }];
function cust(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'c' + k, ...CUST[k], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, sit: o.sit || 0, handL: o.handL, handR: o.handR, squash: o.squash || 0 }); }
const walkX = (t, a, b, x0, x1) => { const u = seg(t, a, b); return { x: lerp(x0, x1, u), walk: u > 0 && u < 1 ? 1 : 0 }; };
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
// the showroom: a dark shop floor, each piece on its own plinth under its own light, apart from the rest
function showroom(c, t, P, o = {}) { for (const p of P) { const k = p.k ?? 1; if (k <= 0) continue; plinth(c, p.x, p.w || 260, Math.min(1, k)); spotCone(c, p.x, (p.w || 260) * 1.1, (o.light ?? .8) * Math.min(1, k) * (p.lit ?? 1)); pop(c, p.x, F, k, () => p.draw(c, p.x, F)); if (p.tag !== undefined) tag(c, p.x + (p.tx || 0), p.ty || 1230, p.tag); } }
function eyeBadge(c, x, y, k) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, 56, 56, 'rgba(0,0,20,.3)'); ell(c, x, y, 56, 56, CREAM); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 40, y); c.quadraticCurveTo(x, y - 36, x + 40, y); c.quadraticCurveTo(x, y + 36, x - 40, y); c.fill(); ell(c, x, y, 15, 15, CREAM); ell(c, x, y, 7, 7, GOLD); }); }
function sold(c, x, y, k) { pop(c, x, y, k, () => { c.save(); c.translate(x, y); c.rotate(-.12); rrect(c, -86, -30, 172, 60, 12, GOLD); c.strokeStyle = GOLD2; c.lineWidth = 4; c.beginPath(); c.roundRect(-78, -22, 156, 44, 8); c.stroke(); text(c, 'ELADVA', 0, 3, 32, NAVY); c.restore(); }); }
function livingRoom(c, t, k = {}) {   // the living room set; k: how far each piece has popped in (sofa, table, rug, lamp, books, deco, frame, warm)
  const g = n => k[n] ?? 1; room(c, 90, 990, g('wall'), { warm: (k.warm || 0) > .5 }); if (g('win') > 0) pop(c, 330, 1250, g('win'), () => windowW(c, 330, 1250, 220, 200)); if ((k.frame ?? 0) > 0) pop(c, 760, 1210, k.frame, () => frame(c, 760, 1210, 150, 112));
  if (g('rug') > 0) pop(c, 540, F + 30, g('rug'), () => rug(c, 540, F + 30, 640));
  if (g('lamp') > 0) pop(c, 900, F, g('lamp'), () => lamp(c, 900, F, 1.15, k.on || 0));
  if (g('sofa') > 0) pop(c, 520, F - 40, g('sofa'), () => sofa(c, 520, F - 40, 1.25, { pillow: (k.deco || 0) > 0, grey: k.grey || 0 }));
  if ((k.deco || 0) > 0) { pop(c, 980 - 820, F, k.deco, () => plant(c, 160, F, 1.6)); }
  if (g('table') > 0) pop(c, 560, F + 40, g('table'), () => table(c, 560, F + 40, 1.25));
  if ((k.books || 0) > 0) pop(c, 500, F + 40 - 115, k.books, () => books(c, 500, F + 40 - 115, 1.2));
  if ((k.deco || 0) > 0) pop(c, 640, F + 40 - 115, k.deco, () => { c.fillStyle = SAND; c.beginPath(); c.ellipse(640, F - 75 - 30, 22, 30, 0, 0, 7); c.fill(); c.fillStyle = '#c4566a'; for (let i = 0; i < 3; i++) ell(c, 628 + i * 12, F - 75 - 74 - (i % 2) * 10, 12, 12, i === 1 ? GOLD : '#c4566a'); });
  if ((k.warm || 0) > 0) { glow(c, 540, 1350, 700, .28 * k.warm); }
}

const SHOT = {
  shop(c, t) {   // the furniture shop: for months nothing sells; the furniture stands dim and dusty while a big calendar tears off month after month; the owner is sad. Then he lights each piece and tidies it
    const H = HIT; bg(c, '#163A8C'); const push = 1 + .03 * ss(seg(t, 0, 8)); c.save(); c.translate(540, 1500); c.scale(push, push); c.translate(-540, -1500); floor(c);
    const MON = ['JAN', 'FEB', 'MÁRC', 'ÁPR', 'MÁJ', 'JÚN', 'JÚL'], n = H.months.filter(m => t > m).length, dust = ss(seg(t, H.months[0], H.months[H.months.length - 1] + .3)) * (1 - ss(seg(t, H.tidy[0] - .2, H.tidy[3] + .4)));
    // the big wall calendar: a page tears off and falls for every month that passes; it moves up to the corner when he starts arranging
    const away = ss(seg(t, H.items[0] - .4, H.items[0] + .2)), cx = lerp(540, 150, away), cy = lerp(1070, 1010, away), cs = lerp(1, .5, away);
    pop(c, cx, cy, E(t, .05, .35, .4), () => { c.save(); c.translate(cx, cy); c.scale(cs, cs);
      c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(-105, -115, 220, 240, 16); c.fill(); rrect(c, -110, -120, 220, 240, 16, CREAM); rrect(c, -110, -120, 220, 64, 16, '#c4566a'); c.fillStyle = '#c4566a'; c.fillRect(-110, -80, 220, 24);
      for (const d of [-60, 60]) { rrect(c, d - 8, -138, 16, 34, 8, '#8a95b8'); }
      text(c, MON[Math.min(n, MON.length - 1)], 0, -84, 40, CREAM); text(c, String(1 + n * 3 % 28), 0, 26, 104, NAVY);
      H.months.forEach((m, i) => { const u = seg(t, m, m + .7); if (u > 0 && u < 1) { c.save(); c.globalAlpha = 1 - u * u; c.translate(60 * u + (i % 2 ? -1 : 1) * 40 * u, -40 + 300 * u * u); c.rotate((i % 2 ? -1 : 1) * u * 1.6); rrect(c, -110, -60, 220, 180, 10, CREAM); text(c, MON[i], 0, -20, 34, '#c4566a'); c.restore(); } });
      c.restore(); });
    // the furniture: there all along, dim and dusty; each piece's light switches on as it is named, then he tidies it and the dust clears
    const lit = H.items.map(a => ss(seg(t, a - .1, a + .25))), G = (i, f) => { const g = (1 - lit[i]) * .8 + .2 * dust * (1 - lit[i]); c.save(); if (g > .01) c.filter = `saturate(${1 - g}) brightness(${1 - .45 * g})`; f(); c.restore(); };
    const P = [{ x: 350, w: 300, k: 1, lit: .15 + .85 * lit[0], draw: (c, x, y) => G(0, () => sofa(c, x, y, .72)), tag: 1, ty: 1310 },
      { x: 575, w: 200, k: 1, lit: .15 + .85 * lit[1], draw: (c, x, y) => G(1, () => table(c, x, y, .8)), tag: 1, ty: 1440 },
      { x: 750, w: 160, k: 1, lit: .15 + .85 * lit[2], draw: (c, x, y) => G(2, () => chair(c, x, y, .9)), tag: 1, ty: 1330 },
      { x: 920, w: 150, k: 1, lit: .15 + .85 * lit[3], draw: (c, x, y) => G(3, () => lamp(c, x, y, .85)), tag: 1, ty: 1230 }];
    P.forEach((p, i) => { p.k += wob(t, H.tidy[i], .4, 22, .5); }); showroom(c, t, P);
    P.forEach((p, i) => { if (dust > 0) { c.save(); c.globalAlpha = .6 * dust; c.strokeStyle = 'rgba(220,226,240,.8)'; c.lineWidth = 2; const x0 = p.x - p.w / 2 + 6, y0 = 1180 + (i % 2) * 60; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 30, y0 + 20, x0 + 60, y0); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 18, y0 + 34, x0, y0 + 64); c.moveTo(x0, y0); c.lineTo(x0 + 46, y0 + 46); c.moveTo(x0 + 22, y0 + 10); c.quadraticCurveTo(x0 + 22, y0 + 26, x0 + 8, y0 + 30); c.stroke(); for (let k = 0; k < 6; k++) ell(c, p.x - p.w / 2 + hash(k + i * 7) * p.w, F - 20 - hash(k + i) * 120, 2.5, 2.5, 'rgba(220,226,240,.7)'); c.restore(); } });
    H.tidy.forEach((at, i) => spark(c, P[i].x, 1520, t, at, 5, 90, 12));
    // the owner: sad and slumped while the months pass; a faint hope as he lights and tidies the pieces
    const hope = ss(seg(t, H.items[0], H.tidy[3] + .4)), ok = E(t, H.owner - .2, .35, .45);
    if (ok > 0) scaled(c, 170, F, Math.min(1, ok), () => owner(c, t, 170, F, 1.55, { f: .35, look: lerp(-.5, .3, hope), smile: lerp(.05, .45, hope), sad: lerp(.95, .35, hope) }));
    c.restore();
  },
  browse(c, t) {   // two customers come in, look at the sofa, ask the price, and walk out without buying; the owner's smile drops
    const H = HIT; bg(c, '#163A8C'); floor(c);
    showroom(c, t, [{ x: 400, w: 380, draw: (c, x, y) => sofa(c, x, y, 1.0), tag: 1, ty: 1260, tx: 120 }, { x: 140, w: 150, draw: (c, x, y) => lamp(c, x, y, .9) }]);
    // the door, on the right
    const open = Math.max(ss(seg(t, H.enter - .8, H.enter - .4)) * (1 - ss(seg(t, H.enter + .4, H.enter + .8))), ss(seg(t, H.leave + .3, H.leave + .6)) * (1 - ss(seg(t, H.leave + 1.4, H.leave + 1.8))));
    rrect(c, 900, 1150, 200, 550, 0, '#e9dcc0'); rrect(c, 916, 1166, 168, 534, 0, '#16205a'); glow(c, 1000, 1420, 150, .2 + .3 * open); c.fillStyle = 'rgba(159,199,240,.8)'; c.fillRect(916 + 168 * .8 * open, 1166, 168 * (1 - .8 * open), 534);
    // the owner at the left, by the lamp
    owner(c, t, 250, F, 1.5, { f: .4, look: .3, smile: lerp(.95, .15, ss(seg(t, H.leave, H.sad + .3))), sad: .6 * ss(seg(t, H.leave + .3, H.sad + .4)) });
    // the two customers: in, look, ask, out
    for (let k = 0; k < 2; k++) { const inn = seg(t, H.enter - .5 + k * .3, H.enter + 1.0 + k * .3), out = seg(t, H.leave + .1 + k * .15, H.leave + 1.5 + k * .15), stop = [620, 790][k];
      if (inn <= 0) continue; const x = out > 0 ? lerp(stop, 1180, ss(out)) : lerp(1150, stop, ss(inn)), walking = (inn > 0 && inn < 1) || (out > 0 && out < 1);
      c.save(); c.beginPath(); c.rect(0, 0, 1084, 1920); c.clip(); cust(c, t, k, x, F, 1.45, { f: out > 0 ? .45 : -.45, walk: walking ? 1 : 0, look: out > 0 ? .3 : -.3, smile: out > 0 ? .5 : .85 }); c.restore(); }
    // the bubbles: "how much?" and the answer
    const q = E(t, H.ask, .3, .5) * (1 - ss(seg(t, H.answer + .4, H.answer + .7))); if (q > 0) bubble(c, 690, 1180, 150, 110, Math.min(1.1, q), 640, 1300, () => text(c, 'Ft?', 690, 1182, 54, NAVY));
    const a = E(t, H.answer, .3, .5) * (1 - ss(seg(t, H.leave + .2, H.leave + .5))); if (a > 0) bubble(c, 340, 1150, 160, 100, Math.min(1.1, a), 290, 1270, () => tag(c, 340, 1150, 1));
    if (t > H.leave + .6) { const k = E(t, H.sad, .3, .5); badge(c, 'x', 540, 1100, 58, k); }
  },
  imagine(c, t) {   // the owner gets it: people can't picture these pieces in their own home. A customer by a lone sofa; the sofa tries to fit into their home and doesn't
    const H = HIT; bg(c, '#163A8C'); floor(c);
    owner(c, t, 230, F, 1.75, { f: .35, look: lerp(.2, -.3, ss(seg(t, H.idea - .4, H.idea))), smile: lerp(.5, 1, ss(seg(t, H.idea, H.idea + .3))), squash: wob(t, H.idea, .4, 18, .6) });
    bulbIcon(c, 230, 1050, 46, E(t, H.idea, .3, .5) * (1 - ss(seg(t, H.ghost - .4, H.ghost))));
    // the customer and the lone sofa
    plinth(c, 640, 320, 1); spotCone(c, 640, 330, .7); sofa(c, 640, F, .8); cust(c, t, 0, 900, F, 1.5, { f: -.45, look: -.4, smile: lerp(.8, .3, ss(seg(t, H.q, H.q + .4))), sad: .3 * ss(seg(t, H.q, H.q + .4)) });
    // their home: a house sign; a ghost of the sofa floats up and tries to go in; a question; it fades
    const hk = E(t, H.ghost - .5, .35, .45); house(c, 740, 1100, 250, hk, { inner: () => { const u = seg(t, H.ghost, H.q); if (u > 0) { c.save(); c.globalAlpha = .55 * (1 - ss(seg(t, H.nohome, H.nohome + .4))); c.setLineDash([10, 8]); c.translate(740, 1100 + 70); c.scale(.32, .32); c.translate(-740, -(1100 + 70)); sofa(c, 740 + 40 * Math.sin(t * 6) * (1 - u), 1170, 1); c.restore(); } } });
    badge(c, 'q', 870, 1000, 46, E(t, H.q, .3, .5));
  },
  decide(c, t) {   // he decides to change it all: the pieces stand apart, each alone under its light; then walls rise and they gather into one room, a real home
    const H = HIT; bg(c, '#163A8C'); floor(c);
    const g = ease(seg(t, H.group, H.group + 1.2)), wall = seg(t, H.walls - .2, H.walls + .8), lit = i => .25 + .75 * ss(seg(t, H.apart[i] - .1, H.apart[i] + .2));
    room(c, 140, 940, wall); if (wall > .6) { pop(c, 340, 1250, E(t, H.walls + .4, .3, .45), () => windowW(c, 340, 1250, 190, 170)); pop(c, 770, 1210, E(t, H.walls + .6, .3, .45), () => frame(c, 770, 1210, 140, 104)); }
    if (g > 0) pop(c, 540, F + 30, g, () => rug(c, 540, F + 30, 600));
    const A = [[170, 280], [410, 600], [640, 900], [800, 230]], B = [[540, 560], [560, 560], [860, 860], [250, 260]];   // apart x → together x
    const sh = ss(seg(t, H.shuffle - .2, H.shuffle + .5)) * (1 - ss(seg(t, H.apart[0] - .5, H.apart[0] - .2)));
    const xs = A.map((a, i) => lerp(a[0], B[i][0], g) + 14 * Math.sin(t * 20 + i) * sh);
    const P = [{ x: xs[1], w: 260, draw: (c, x, y) => sofa(c, x, y - 30 * g, lerp(.7, 1.05, g), { pillow: g > .9 }), lit: lit(1) },
      { x: xs[2], w: 130, draw: (c, x, y) => lamp(c, x, y, lerp(.8, 1, g), g > .9 ? 1 : 0), lit: lit(2) },
      { x: xs[3], w: 150, draw: (c, x, y) => chair(c, x, y, lerp(.8, .95, g)), lit: lit(3) },
      { x: xs[0], w: 190, draw: (c, x, y) => table(c, x, y + 30 * g, lerp(.75, 1.05, g)), lit: lit(0) }];
    if (g < 1) for (const p of P) { plinth(c, p.x, p.w, 1 - g); spotCone(c, p.x, p.w * 1.1, .8 * p.lit * (1 - g)); }
    for (const p of P) { c.save(); if (g < .5) c.globalAlpha = lerp(1, p.lit, 1 - wall); p.draw(c, p.x, F); c.restore(); }
    owner(c, t, 945, F, 1.45, { f: -.4, look: -.3, smile: 1 }); check(c, 945, 1190, 44, E(t, H.decide, .45, .2) * (1 - ss(seg(t, H.shuffle + .6, H.shuffle + 1))));
    house(c, 540, 1000, 200, E(t, H.home, .35, .5), { lit: true, inner: () => heart(c, 540, 1010, 36, 1, '#c4566a') });
  },
  living(c, t) {   // a living room: a sofa, a table, a rug and a lamp pop into place
    const H = HIT; bg(c, '#163A8C'); floor(c); const p = 1 + .04 * ss(seg(t, 29.1, 32.8)); c.save(); c.translate(540, 1500); c.scale(p, p); c.translate(-540, -1500);
    livingRoom(c, t, { wall: 1, win: E(t, 29.2, .35, .45), sofa: E(t, H.sofa - .1, .35, .45), table: E(t, H.table - .1, .35, .45), rug: E(t, H.rug - .1, .35, .45), lamp: E(t, H.lamp - .1, .35, .45), on: ss(seg(t, H.lamp + .2, H.lamp + .5)), books: 0, deco: 0 });
    c.restore();
  },
  bedroom(c, t) {   // a bedroom: a bed, a nightstand and a wardrobe
    const H = HIT; bg(c, '#163A8C'); floor(c); const p = 1 + .04 * ss(seg(t, 32.8, 36.2)); c.save(); c.translate(540, 1500); c.scale(p, p); c.translate(-540, -1500);
    room(c, 90, 990, 1); pop(c, 430, 1220, E(t, 32.9, .35, .45), () => frame(c, 430, 1220, 200, 120));
    pop(c, 780, F, E(t, H.robe - .1, .35, .45), () => wardrobe(c, 820, F, 1.15));
    pop(c, 430, F, E(t, H.bed - .1, .35, .45), () => bed(c, 430, F, 1.25));
    pop(c, 170, F, E(t, H.stand - .1, .35, .45), () => nightstand(c, 170, F, 1.1, ss(seg(t, H.stand + .3, H.stand + .6))));
    c.restore();
  },
  decor(c, t) {   // books and a vase on the table, a plant, a picture on the wall; the lamp glows and the room turns warm and real
    const H = HIT; bg(c, '#163A8C'); floor(c); const p = 1 + .05 * ss(seg(t, 36.2, 41.2)); c.save(); c.translate(560, 1560); c.scale(p, p); c.translate(-560, -1560);
    livingRoom(c, t, { books: E(t, H.books - .1, .35, .45), deco: E(t, H.deco - .1, .35, .45), frame: E(t, H.frame - .1, .35, .45), on: ss(seg(t, H.warm - .2, H.warm + .4)), warm: ss(seg(t, H.warm - .2, H.warm + .6)) });
    if (t > H.warm) spark(c, 540, 1380, t, H.warm, 7, 330, 16);
    c.restore();
  },
  enter(c, t) {   // a customer walks in and doesn't just see a sofa: she sees a home; she sits down, smiles, and buys
    const H = HIT; bg(c, '#163A8C'); floor(c);
    const wide = ease(seg(t, H.wide - .2, H.wide + .8)), z = lerp(1.35, 1, wide), cx = lerp(520, 540, wide), cy = lerp(1560, 1450, wide);
    c.save(); c.translate(540, 1450); c.scale(z, z); c.translate(-cx, -cy);
    livingRoom(c, t, { books: 1, deco: 1, frame: 1, on: 1, warm: .6 + .4 * wide });
    if (t > H.see - .2 && t < H.wide + .4) glow(c, 520, 1560, 260, .4 * Math.sin(clamp(seg(t, H.see - .2, H.wide + .4)) * Math.PI));
    // she walks in from the right, stops by the sofa, then sits down on it
    const w = walkX(t, H.door, H.door + 1.7, 1250, 760), sitU = ss(seg(t, H.sit - .2, H.sit + .3)), seatY = F - 40 - 104 * 1.25;
    const x = lerp(w.x, 470, sitU), y = lerp(F, seatY + 92, sitU);
    if (t > H.door) cust(c, t, 0, x, y, 1.45, { f: sitU > .5 ? 0 : -.45, walk: w.walk, sit: sitU > .5 ? 1 : 0, look: sitU > .5 ? 0 : -.3, smile: 1, squash: wob(t, H.sit + .3, .3, 20, .6) });
    heart(c, 470, 1230, 44, E(t, H.heart, .3, .5) * (1 - ss(seg(t, 48.8, 49.2))));
    sold(c, 760, 1350, E(t, H.buy, .3, .5));
    c.restore();
  },
  sales(c, t) {   // soon the shop sees people buy more: the sales climb, and one receipt prints a sofa, a lamp, a table and a rug together
    const H = HIT; bg(c, '#163A8C'); floor(c);
    // the chart on the wall
    const ck = E(t, 49.3, .35, .45); pop(c, 300, 1180, ck, () => { rrect(c, 120, 1020, 360, 300, 24, CREAM); const up = ss(seg(t, H.more - .3, H.more + .6)); [.3, .42, .5, .75, 1].forEach((v, i) => { const h = 200 * v * (i < 3 ? 1 : lerp(.45, 1, up)); rrect(c, 160 + i * 62, 1290 - h, 44, h, 8, i > 2 ? GOLD : '#3d5cc8'); });
      if (up > 0) { c.strokeStyle = '#c4566a'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(170, 1220); c.lineTo(lerp(170, 440, up), lerp(1220, 1060, up)); c.stroke(); } });
    eyeBadge(c, 640, 1060, E(t, H.notice, .3, .5) * (1 - ss(seg(t, H.more - .3, H.more))));
    // the counter and the register, the owner behind it
    owner(c, t, 905, 1560, 1.35, { f: -.3, look: -.3, smile: 1 });
    rrect(c, 520, 1480, 520, 220, 18, WOOD); rrect(c, 520, 1480, 520, 26, 12, WOOD2); rrect(c, 600, 1380, 170, 110, 14, '#2b3f8e'); rrect(c, 620, 1396, 130, 40, 6, '#9fc7f0'); text(c, 'Ft', 685, 1418, 32, NAVY);
    // the receipt: it rises from the register, one item at a time
    const n = H.receipt.filter(r => t > r - .05).length, L = 40 + H.receipt.reduce((m, r) => m + 70 * ease(seg(t, r - .05, r + .3)), 0);
    if (t > H.receipt[0] - .3) { c.save(); rrect(c, 615, 1380 - L, 140, L, 6, '#ffffff'); c.beginPath(); c.rect(615, 1380 - L, 140, L); c.clip();
      const icons = [(x, y) => sofa(c, x, y, .21), (x, y) => lamp(c, x, y + 10, .2), (x, y) => table(c, x, y, .32), (x, y) => rug(c, x, y - 12, 90)];
      H.receipt.forEach((r, i) => { if (t < r - .05) return; const y = 1380 - L + 28 + (n - 1 - i) * 70 + 42; icons[i](656, y); c.fillStyle = SAND3; c.fillRect(708, y - 30, 34, 6); c.fillRect(708, y - 16, 24, 6); }); c.restore();
      H.receipt.forEach((r, i) => spark(c, 685, 1380 - L + 40, t, r, 4, 80, 10)); }
    // a happy customer with her arms full
    cust(c, t, 2, 300, F, 1.45, { f: .4, look: .3, smile: 1 }); cust(c, t, 1, 140, F, 1.4, { f: .4, look: .2, smile: 1 });
  },
  lesson(c, t) {   // the lesson: a product alone is hard to value; a lone sofa, dull, under one light, and a question over it
    const H = HIT; bg(c, '#163A8C'); floor(c); const g = ss(seg(t, H.lone, H.alone + .3));
    plinth(c, 540, 460, 1); spotCone(c, 540, 480, lerp(.8, .5, g)); sofa(c, 540, F, 1.15, { grey: .6 * g });
    owner(c, t, 900, F, 1.5, { f: -.4, look: -.4, smile: .6 });
    badge(c, 'q', 540, 1240, 60, E(t, H.qq, .3, .5));
  },
  finale(c, t) {   // but in a real setting: the room builds round the same sofa, and a customer sits in it, at home
    const H = HIT; bg(c, '#163A8C'); floor(c); const b = H.build;
    const wk = ss(seg(t, 62.3, b[0] + .4)), seatY = F - 40 - 104 * 1.25, w = walkX(t, H.walkin - .4, H.walkin + 1.3, 1250, 720), sitU = ss(seg(t, H.sit2 - .3, H.sit2 + .2));
    livingRoom(c, t, { wall: wk, win: E(t, b[0], .35, .45), rug: E(t, b[1], .35, .45), lamp: E(t, b[2], .35, .45), on: ss(seg(t, b[2] + .3, b[2] + .6)), table: E(t, b[3], .35, .45), books: E(t, b[3] + .2, .3, .45), deco: E(t, b[4], .35, .45), frame: E(t, b[4] + .2, .35, .45), warm: ss(seg(t, b[4], b[4] + .8)), grey: .6 * (1 - ss(seg(t, b[0] - .3, b[0] + .3))) });
    if (t > H.walkin - .4) { const x = lerp(w.x, 470, sitU), y = lerp(F, seatY + 92, sitU); cust(c, t, 1, x, y, 1.45, { f: sitU > .5 ? 0 : -.45, walk: w.walk, sit: sitU > .5 ? 1 : 0, look: 0, smile: 1 }); }
    heart(c, 470, 1220, 44, E(t, H.end, .3, .5)); if (t > H.end) { glow(c, 540, 1400, 520, .25 * ss(seg(t, H.end, H.end + .5))); spark(c, 540, 1400, t, H.end, 8, 380, 18); }
  },
};
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.18, 1.18); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['bútorbolt','elképzelni','átrendezi','otthonra','nappalit','hálószobát','valódibbnak','otthona','egyszerre','értékét','valódi','magukat']);
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
