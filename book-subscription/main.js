// Story 24, A havi könyv (The Store That Let Customers Stop Choosing): a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, TS } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'ÚJ ☺!★ Ft?'), document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC')]);
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
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(-400, -400, 1880, 2720); }

// —— the world: books, an online shop on a big screen, a quiz on a phone, a parcel ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', WOOD2 = '#a6744a', WOOD3 = '#6e4a2c', INKC = '#151018', ROSE = '#c4566a', ROSE2 = '#9b3f52', MINT = '#5fb89a', SKY = '#7fb2ea', PLUM = '#8a5cb5';
const BCOL = [ROSE, MINT, GOLD, SKY, PLUM, '#e08a4a', '#3d5cc8', SAND2];
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
function floor(c) { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, '#0d1d5c'); fl.addColorStop(1, '#071341'); c.fillStyle = fl; c.fillRect(-400, F, 1880, 420); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(-400, F, 1880, 4); }
// a book seen from the front, centred on (x, y): a coloured cover with a spine edge, a title bar and a small mark
function book(c, x, y, w, h, col, mark = 0) { c.fillStyle = 'rgba(0,0,20,.25)'; c.beginPath(); c.roundRect(x - w / 2 + 4, y - h / 2 + 6, w, h, 5); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 5, col); c.fillStyle = 'rgba(0,0,20,.18)'; c.fillRect(x - w / 2, y - h / 2, w * .12, h); rrect(c, x - w * .3, y - h * .32, w * .66, h * .12, 3, 'rgba(255,255,255,.75)'); rrect(c, x - w * .3, y - h * .14, w * .45, h * .06, 3, 'rgba(255,255,255,.45)');
  const r = Math.min(w, h) * .16, my = y + h * .2; c.fillStyle = 'rgba(255,255,255,.85)';
  if (mark === 1) star(c, x + w * .05, my, r, 1, 'rgba(255,255,255,.9)'); else if (mark === 2) heart(c, x + w * .05, my, r, 1, 'rgba(255,255,255,.9)'); else if (mark === 3) { c.beginPath(); c.moveTo(x + w * .05, my - r * 1.2); c.lineTo(x + w * .05 + r * .6, my + r * .6); c.lineTo(x + w * .05 - r * .6, my + r * .6); c.closePath(); c.fill(); } else ell(c, x + w * .05, my, r * .8, r * .8, 'rgba(255,255,255,.85)'); }
function grid(c, x0, y0, cols, rows, w, h, gap, scroll = 0, o = {}) { c.save(); c.beginPath(); c.rect(x0 - 4, y0 - 4, cols * (w + gap) + 8, rows * (h + gap) + 8); c.clip(); for (let r = -1; r < rows + 2; r++) for (let k = 0; k < cols; k++) { const yy = y0 + r * (h + gap) - (scroll % (h + gap)), n = r + Math.floor(scroll / (h + gap)) + 50, id = (n * cols + k); book(c, x0 + k * (w + gap) + w / 2, yy + h / 2, w, h, BCOL[Math.floor(hash(id) * 8)], Math.floor(hash(id + 3) * 4)); if (o.dim) { c.fillStyle = `rgba(0,17,63,${o.dim})`; c.fillRect(x0 + k * (w + gap) - 2, yy - 2, w + 4, h + 4); } } c.restore(); }
function screen(c, x, y, w, h, draw) { rrect(c, x - w / 2 - 18, y - h / 2 - 18, w + 36, h + 36, 22, '#1a1f3a'); rrect(c, x - w / 2, y - h / 2, w, h, 10, '#eef2fa'); c.save(); c.beginPath(); c.rect(x - w / 2, y - h / 2, w, h); c.clip(); draw(); c.restore(); rrect(c, x - 60, y + h / 2 + 18, 120, 70, 0, '#1a1f3a'); rrect(c, x - 140, y + h / 2 + 84, 280, 18, 9, '#1a1f3a'); }
function phone(c, x, y, w, h, draw) { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 12, w, h, 34); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 34, '#1a1f3a'); rrect(c, x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24, '#eef2fa'); c.save(); c.beginPath(); c.roundRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24); c.clip(); draw(); c.restore(); rrect(c, x - 30, y - h / 2 + 22, 60, 12, 6, '#1a1f3a'); }
function parcel(c, x, y, s, open = 0, inner) { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.ellipse(x, y + 4, 130 * s, 14 * s, 0, 0, 7); c.fill(); if (open > 0 && inner) inner(open); rrect(c, x - 120 * s, y - 130 * s, 240 * s, 130 * s, 8 * s, '#c79a62'); rrect(c, x - 20 * s, y - 130 * s, 40 * s, 130 * s, 0, '#e2c08a'); rrect(c, x - 90 * s, y - 70 * s, 70 * s, 40 * s, 4 * s, '#ffffff');
  for (const d of [-1, 1]) { c.save(); c.translate(x + d * 120 * s, y - 130 * s); c.rotate(d * (-.2 - 2.2 * open) * (open > 0 ? 1 : 0) * -1); c.fillStyle = '#b5884f'; c.fillRect(d > 0 ? -120 * s : 0, -6 * s, 120 * s, 12 * s); c.restore(); } }
function house(c, x, y, s) { rrect(c, x - 110 * s, y - 180 * s, 220 * s, 180 * s, 8 * s, SAND); c.fillStyle = ROSE; c.beginPath(); c.moveTo(x - 140 * s, y - 170 * s); c.lineTo(x, y - 290 * s); c.lineTo(x + 140 * s, y - 170 * s); c.closePath(); c.fill(); rrect(c, x - 30 * s, y - 110 * s, 60 * s, 110 * s, 6 * s, WOOD); ell(c, x + 18 * s, y - 55 * s, 5 * s, 5 * s, GOLD); rrect(c, x - 90 * s, y - 140 * s, 44 * s, 40 * s, 4 * s, SKY); rrect(c, x + 46 * s, y - 140 * s, 44 * s, 40 * s, 4 * s, SKY); }
function clockB(c, x, y, r, k, t) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = NAVY; c.lineWidth = r * .1; c.lineCap = 'round'; const a = t * 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - Math.PI / 2) * r * .65, y + Math.sin(a - Math.PI / 2) * r * .65); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a / 12 - Math.PI / 2) * r * .45, y + Math.sin(a / 12 - Math.PI / 2) * r * .45); c.stroke(); ell(c, x, y, r * .1, r * .1, GOLD); }); }
function cartB(c, x, y, r, k) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = NAVY; c.lineWidth = r * .1; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .55, y - r * .35); c.lineTo(x - r * .38, y - r * .35); c.lineTo(x - r * .2, y + r * .25); c.lineTo(x + r * .45, y + r * .25); c.lineTo(x + r * .55, y - r * .15); c.lineTo(x - r * .3, y - r * .15); c.stroke(); ell(c, x - r * .12, y + r * .45, r * .08, r * .08, NAVY); ell(c, x + r * .38, y + r * .45, r * .08, r * .08, NAVY); }); }
function bulbIcon(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, r * 3, .7); ell(c, x, y, r, r, '#ffd889'); rrect(c, x - r * .45, y + r * .8, r * .9, r * .5, r * .15, SAND2); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y + r * .2); c.lineTo(x, y - r * .25); c.lineTo(x + r * .3, y + r * .2); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); c.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); c.stroke(); } }); }
function calendarBadge(c, x, y, k, n) { pop(c, x, y, k, () => { rrect(c, x - 60, y - 70, 120, 140, 12, CREAM); rrect(c, x - 60, y - 70, 120, 36, 12, ROSE); c.fillStyle = ROSE; c.fillRect(x - 60, y - 48, 120, 14); text(c, String(n), x, y + 18, 58, NAVY); }); }
// the people: the shop owner is white; the readers are blue
function owner(c, t, x, y, s, o = {}) { mascot(c, { id: 'own', skin: 'owner', s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi || 0, handL: o.handL, handR: o.handR, squash: o.squash || 0, tache: true }); }
const CUST = [{ skin: 'blue2', fem: 'glasses' }, { skin: 'blue1' }, { skin: 'blue3', fem: 'pony' }];
function cust(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'c' + k, ...CUST[k % 3], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0, sit: o.sit || 0, rot: o.rot || 0 }); }
function openBook(c, x, y, s, col = PLUM) { c.fillStyle = 'rgba(0,0,20,.25)'; c.beginPath(); c.ellipse(x, y + 8 * s, 90 * s, 10 * s, 0, 0, 7); c.fill(); for (const d of [-1, 1]) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x + d * 92 * s, y - 8 * s); c.lineTo(x + d * 92 * s, y - 70 * s); c.lineTo(x, y - 60 * s); c.closePath(); c.fill(); c.fillStyle = '#fbf6ea'; c.beginPath(); c.moveTo(x, y - 6 * s); c.lineTo(x + d * 84 * s, y - 14 * s); c.lineTo(x + d * 84 * s, y - 72 * s); c.quadraticCurveTo(x + d * 40 * s, y - 78 * s, x, y - 64 * s); c.closePath(); c.fill(); c.fillStyle = SAND3; for (let k = 0; k < 4; k++) c.fillRect(d > 0 ? x + 14 * s : x - 70 * s, y - 56 * s + k * 10 * s, 56 * s, 3 * s); } }

const SHOT = {
  browse(c, t) {   // an online bookshop: a visitor scrolls through hundreds of covers for hours, and buys nothing
    bg(c, '#163A8C'); floor(c); const H = HIT; const sc = Math.max(0, t - .4) * 210;
    screen(c, 600, 1270, 680, 420, () => { rrect(c, 260, 1060, 680, 54, 0, '#22357f'); for (let k = 0; k < 3; k++) rrect(c, 300 + k * 90, 1078, 60, 18, 9, 'rgba(255,255,255,.5)'); grid(c, 290, 1132, 6, 3, 86, 124, 22, sc); });
    cust(c, t, 0, 170, F, 1.5, { f: .4, look: .3 + .1 * Math.sin(t * 3), smile: lerp(.8, .3, ss(seg(t, H.hours, H.none))), handR: [300, 1500 - 20 * Math.sin(t * 6)] });
    clockB(c, 170, 1150, 46, E(t, H.hours - .1, .3, .5) * (1 - ss(seg(t, H.none - .3, H.none))), t);
    cartB(c, 880, 1600, 58, E(t, H.none - .2, .3, .5)); badge(c, 'x', 940, 1550, 30, E(t, H.none + .1, .3, .5));
  },
  toomany(c, t) {   // the owner thinks: too many choices make it hard to decide: books swirl round the reader; she is dizzy; a question
    bg(c, '#163A8C'); floor(c); const H = HIT; const n = ease(seg(t, H.many - .3, H.many + 1.2));
    owner(c, t, 175, F, 1.5, { f: .4, look: .3, smile: .7 }); bulbIcon(c, 175, 1150, 36, E(t, H.think, .3, .5) * (1 - ss(seg(t, H.many - .3, H.many))));
    const cx = 610, cy = 1440; for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2 + t * (.6 + .3 * (k % 3)), r = (215 + (k % 4) * 42) * n; if (n <= 0) continue; c.save(); c.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .62); c.rotate(a * .5); book(c, 0, 0, 64, 92, BCOL[k % 8], k % 4); c.restore(); }
    cust(c, t, 0, cx, F, 1.5, { f: 0, look: Math.sin(t * 5) * .6, smile: .3, sad: .6 * ss(seg(t, H.hard - .3, H.hard)), rot: .05 * Math.sin(t * 4) * ss(seg(t, H.hard - .3, H.hard)) });
    badge(c, 'q', cx, 1090, 48, E(t, H.hard, .3, .5));
  },
  service(c, t) {   // so he starts a new service: a gift box with a book and a ribbon, "ÚJ"
    bg(c, '#163A8C'); floor(c); const H = HIT;
    owner(c, t, 220, F, 1.6, { f: .4, look: .3, smile: 1, squash: wob(t, H.start, .4, 18, .5) });
    const k = E(t, H.start - .2, .35, .45); pop(c, 650, F, k, () => parcel(c, 650, F, 1.3, .7, o => { book(c, 650, F - 130 * 1.3 - 70 * o, 110, 150, PLUM, 1); }));
    if (t > H.start) { spark(c, 650, 1430, t, H.start, 7, 240, 16); pop(c, 860, 1300, E(t, H.newsvc, .3, .5), () => { rrect(c, 790, 1268, 140, 64, 14, GOLD); text(c, 'ÚJ', 860, 1302, 46, NAVY); }); }
  },
  quiz(c, t) {   // a few questions: what genre, your last favourite book, the reading experience you want: three cards on a phone, each answered with a tick
    bg(c, '#163A8C'); floor(c); const H = HIT;
    cust(c, t, 0, 210, F, 1.55, { f: .4, look: .3, smile: .95, handR: [330, 1460] });
    const Q = [[H.genre, () => { [[ROSE, 2], [SKY, 3], [MINT, 1]].forEach(([col, m], i) => { const x = 560 + i * 110; book(c, x, 1250, 70, 96, col, m); if (i === 1 && t > H.genre + .5) { c.strokeStyle = GOLD; c.lineWidth = 6; c.strokeRect(x - 42, 1196, 84, 108); } }); }],
      [H.fav, () => { book(c, 670, 1240, 90, 124, PLUM, 2); heart(c, 760, 1180, 26, E(t, H.fav + .3, .3, .5), ROSE); }],
      [H.mood, () => { [['☺', MINT], ['!', ROSE], ['★', GOLD]].forEach(([s, col], i) => { const x = 560 + i * 110; ell(c, x, 1250, 42, 42, col); text(c, s, x, 1254, 46, '#ffffff'); if (i === 2 && t > H.mood + .5) { c.strokeStyle = NAVY; c.lineWidth = 6; c.beginPath(); c.arc(x, 1250, 52, 0, 7); c.stroke(); } }); }]];
    const step = Q.filter(q => t > q[0] - .5).length - 1;
    pop(c, 670, 1400, E(t, H.questions - .2, .35, .45), () => phone(c, 670, 1400, 420, 640, () => {
      rrect(c, 474, 1094, 392, 60, 0, '#22357f'); for (let k = 0; k < 3; k++) ell(c, 620 + k * 50, 1124, 10, 10, k <= step ? GOLD : 'rgba(255,255,255,.4)');
      if (step >= 0) { const [at, draw] = Q[step], u = ease(seg(t, at - .5, at - .1)); c.save(); c.translate(300 * (1 - u), 0); c.globalAlpha = u; draw(); c.restore(); }
      for (let k = 0; k < 3; k++) { rrect(c, 500, 1380 + k * 64, 340, 48, 24, k === 1 && step >= 0 && t > Q[step][0] + .3 ? MINT : '#dfe6f3'); rrect(c, 524, 1398 + k * 64, 180 - k * 30, 12, 6, SAND3); }
      if (step >= 0 && t > Q[step][0] + .3) check(c, 800, 1468, 18, E(t, Q[step][0] + .3, .4, .2)); }));
  },
  monthly(c, t) {   // every month the shop picks one book for her and posts it: a calendar turns; a light picks one book from the shelf; a parcel flies to her door
    bg(c, '#163A8C'); floor(c); const H = HIT;
    calendarBadge(c, 170, 1180, E(t, 20.4, .3, .45), 1 + Math.floor(clamp(seg(t, H.month, H.month + 1.2)) * 3));
    // the shelf of the shop; a spotlight picks one book
    rrect(c, 300, 1110, 460, 290, 14, '#1f2c70'); for (let r = 0; r < 2; r++) { for (let k = 0; k < 6; k++) { const x = 340 + k * 70, y = 1180 + r * 130, pick = r === 0 && k === 3; book(c, x, y, 54, 100, BCOL[(k + r * 3) % 8], (k + r) % 4); if (pick && t > H.pick) { glow(c, x, y, 110, .6 * ss(seg(t, H.pick, H.pick + .3))); } } rrect(c, 300, 1236 + r * 130, 460, 12, 4, '#4a5cae'); }
    const fly = ease(seg(t, H.send - .2, H.send + .6)); if (t > H.pick && fly < 1) { const x = lerp(550, 600, fly * 0), y = 1180; if (fly <= 0) { c.strokeStyle = GOLD; c.lineWidth = 5; c.strokeRect(550 - 33, y - 56, 66, 112); } }
    house(c, 880, F, 1.0); if (fly > 0) { const x = lerp(550, 860, fly), y = lerp(1180, F - 10, fly) - 220 * Math.sin(fly * Math.PI); parcel(c, x, y, lerp(.3, .55, fly)); }
    if (t > H.address) spark(c, 860, 1600, t, H.address, 5, 120, 12);
  },
  nomore(c, t) {   // no more looking through hundreds of books each time: a wall of covers, crossed out; she relaxes with one book
    bg(c, '#163A8C'); floor(c); const H = HIT; const cut = seg(t, H.hundreds - .2, H.hundreds + .3);
    c.save(); c.globalAlpha = 1 - .5 * ss(seg(t, H.hundreds + .4, H.hundreds + .9)); grid(c, 110, 1060, 9, 4, 72, 104, 14, (t - 24.5) * 60); c.restore();
    cross(c, 540, 1225, 140, cut);
    cust(c, t, 0, 540, F, 1.45, { f: 0, look: .1, smile: lerp(.6, 1, ss(seg(t, H.hundreds + .4, H.hundreds + .8))), handL: [490, 1540], handR: [590, 1540] }); if (t > H.hundreds + .2) openBook(c, 540, 1560, .8, PLUM);
  },
  surprise(c, t) {   // the interesting part: some got a book they'd never have picked themselves, and it became a favourite: she opens the parcel; an odd book; a doubtful face; then hearts
    bg(c, '#163A8C'); floor(c); const H = HIT; const op = ease(seg(t, H.got - .3, H.got + .5)), fav = ss(seg(t, H.fav2 - .3, H.fav2 + .3)), read = ss(seg(t, H.anyway - .2, H.anyway + .4));
    badge(c, 'ex', 540, 1100, 50, E(t, H.interest, .3, .5) * (1 - ss(seg(t, H.got - .5, H.got - .2))));
    if (read < 1) parcel(c, 640, F, 1.1, op, o => { book(c, 640, F - 143 - 90 * o, 110, 150, '#e08a4a', 3); });
    cust(c, t, 1, 330, F, 1.55, { f: .3, look: .3, smile: lerp(.9, lerp(.25, 1, fav), ss(seg(t, H.never - .4, H.never))), sad: .5 * ss(seg(t, H.never - .4, H.never)) * (1 - fav), handR: read > 0 ? [420, 1480] : undefined, handL: read > 0 ? [300, 1480] : undefined });
    if (read > 0) { c.save(); c.globalAlpha = read; openBook(c, 360, 1500, .75, '#e08a4a'); c.restore(); }
    pop(c, 740, 1210, E(t, H.never - .1, .3, .5) * (1 - fav), () => { book(c, 740, 1210, 70, 96, SKY, 2); cross(c, 740, 1210, 40, seg(t, H.never + .2, H.never + .6)); });
    if (fav > 0) { for (let k = 0; k < 6; k++) { const u = seg(t, H.fav2 + k * .2, H.fav2 + 1.2 + k * .2); if (u > 0 && u < 1) heart(c, 300 + (k % 3 - 1) * 90 + Math.sin(u * 6 + k) * 20, 1300 - u * 260, 24, Math.sin(u * Math.PI) * 1.2, k % 2 ? ROSE : GOLD); } star(c, 760, 1200, 46, E(t, H.fav2, .3, .5), GOLD); }
  },
  lesson(c, t) {   // the owner sees it: they don't need more choice, but someone who makes the choice simpler: a fan of choices fades; he hands her one book; a tick
    bg(c, '#163A8C'); floor(c); const H = HIT; const hand = ease(seg(t, H.someone - .2, H.someone + .6));
    owner(c, t, 240, F, 1.6, { f: .35, look: .3, smile: 1, handR: [lerp(330, 470, hand), lerp(1460, 1420, hand)] }); bulbIcon(c, 240, 1130, 40, E(t, H.realise, .3, .5) * (1 - ss(seg(t, H.more - .3, H.more))));
    const fan = E(t, H.more - .3, .35, .45) * (1 - ss(seg(t, H.someone - .4, H.someone))); if (fan > 0) { for (let k = 0; k < 9; k++) { const a = -.9 + k * .225; c.save(); c.translate(720, 1520); c.rotate(a * fan); book(c, 0, -170, 70, 100, BCOL[k % 8], k % 4); c.restore(); } cross(c, 720, 1350, 90, seg(t, H.more + .3, H.more + .7)); }
    if (hand > 0) book(c, lerp(360, 520, hand), lerp(1440, 1400, hand), 90, 124, PLUM, 2);
    cust(c, t, 0, 820, F, 1.5, { f: -.4, look: -.3, smile: lerp(.8, 1, hand), handL: hand > .8 ? [590, 1420] : undefined });
    if (t > H.simpler) { check(c, 540, 1180, 50, E(t, H.simpler, .45, .2)); glow(c, 540, 1420, 480, .25 * ss(seg(t, H.simpler, H.simpler + .5))); spark(c, 540, 1300, t, H.simpler, 8, 340, 18); }
  },
};
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.06, 1.06); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['könyvesbolt','órákig','egyet','túl','dönteni.','szolgáltatást.','kérdésre','műfajt','kedvenc','élményre','hónapban','száz','érdekesebb:','soha','kedvencük','egyszerűbbé']);
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
    const pic = (cx, j, tt) => { NOW = tt; cx.setTransform(K, 0, 0, K, 0, 0); cx.translate(540, 1790); cx.scale(1.06, 1.06); cx.translate(-540, -1790); SHOT[SHOTS[j][1]](cx, tt); };
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
