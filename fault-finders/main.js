// Story 25, Hibavadászok (The Company That Paid Customers to Find Faults): a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, TS } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC≠!?0123456789')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const TOP = '#050916', NAVY = '#0f131e', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#050916';
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
function text(c, s, x, y, size, col = CREAM, align = 'center') { c.font = `700 ${Math.round(size * .84)}px "Montserrat"`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
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
function bg(c, col = '#0d2463') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(-400, -400, 1880, 2720); }

// —— the world: a sneaker lab, an office and the street, a running track in the rain, a design desk, a shop window ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', WOOD2 = '#a6744a', ROSE = '#c4566a', ROSE2 = '#9b3f52', MINT = '#5fb89a', SKY = '#7fb2ea', RED = '#d94a3a', CORAL = '#e8705a', CORAL2 = '#c85a46';
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
function floor(c, col1 = '#0a1022', col2 = '#070b18') { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, col1); fl.addColorStop(1, col2); c.fillStyle = fl; c.fillRect(-400, F, 1880, 420); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(-400, F, 1880, 4); }
// the sneaker, side view, toe to the right; (x, y) = the middle of the sole's bottom; o.hot: the heel glows red (uncomfortable), o.fixed: a mint heel pad
function shoe(c, x, y, s, o = {}) { const P = (a, b) => [x + a * s, y + b * s];
  c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.ellipse(x, y + 4 * s, 140 * s, 12 * s, 0, 0, 7); c.fill();
  c.fillStyle = o.col || CORAL; c.beginPath(); c.moveTo(...P(-128, -26)); c.lineTo(...P(-126, -104)); c.quadraticCurveTo(...P(-110, -118), ...P(-84, -110)); c.quadraticCurveTo(...P(-56, -96), ...P(-34, -104));
  c.lineTo(...P(-18, -134)); c.lineTo(...P(4, -128)); c.quadraticCurveTo(...P(60, -86), ...P(104, -66)); c.quadraticCurveTo(...P(136, -54), ...P(134, -26)); c.closePath(); c.fill();
  c.fillStyle = o.col2 || CORAL2; c.beginPath(); c.moveTo(...P(-128, -26)); c.lineTo(...P(-126, -80)); c.quadraticCurveTo(...P(-100, -86), ...P(-80, -64)); c.lineTo(...P(-60, -26)); c.closePath(); c.fill();
  c.strokeStyle = CREAM; c.lineCap = 'round'; c.lineWidth = 9 * s; c.beginPath(); c.moveTo(...P(-70, -36)); c.quadraticCurveTo(...P(0, -50), ...P(70, -82)); c.stroke();
  c.lineWidth = 6 * s; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(...P(4 + k * 22, -118 + k * 14)); c.lineTo(...P(-14 + k * 22, -104 + k * 14)); c.stroke(); }
  rrect(c, x - 136 * s, y - 30 * s, 274 * s, 30 * s, 14 * s, '#f4f1e6'); c.fillStyle = SAND3; for (let k = 0; k < 9; k++) c.fillRect(x - 110 * s + k * 26 * s, y - 8 * s, 12 * s, 5 * s);
  if (o.fixed) { c.fillStyle = MINT; c.beginPath(); c.ellipse(x - 98 * s, y - 70 * s, 26 * s, 34 * s, 0, 0, 7); c.fill(); }
  if (o.hot > 0) { const p = .6 + .4 * Math.sin(NOW * 9); c.save(); c.globalAlpha = o.hot * p; const g = c.createRadialGradient(x - 98 * s, y - 64 * s, 0, x - 98 * s, y - 64 * s, 70 * s); g.addColorStop(0, 'rgba(255,70,50,.95)'); g.addColorStop(1, 'rgba(255,70,50,0)'); c.fillStyle = g; c.fillRect(x - 170 * s, y - 140 * s, 150 * s, 150 * s); c.restore(); } }
function pedestal(c, x, y, w = 300) { rrect(c, x - w / 2, y, w, F - y, 10, '#1b2133'); rrect(c, x - w / 2 - 14, y - 16, w + 28, 22, 8, '#2a3150'); }
function spotlight(c, x, y, w, a = .3) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(x, 760, x, y); g.addColorStop(0, `rgba(255,236,190,${a * .1})`); g.addColorStop(1, `rgba(255,236,190,${a})`); c.fillStyle = g; c.beginPath(); c.moveTo(x - 50, 760); c.lineTo(x + 50, 760); c.lineTo(x + w, y); c.lineTo(x - w, y); c.closePath(); c.fill(); c.restore(); }
function clipboard(c, x, y, n, t, at) { rrect(c, x - 110, y - 150, 220, 300, 14, '#a6744a'); rrect(c, x - 94, y - 132, 188, 268, 8, CREAM); rrect(c, x - 40, y - 164, 80, 34, 8, '#6b7280');
  for (let k = 0; k < n; k++) { const yy = y - 80 + k * 66; rrect(c, x - 20, yy - 7, 90, 14, 7, SAND2); check(c, x - 56, yy, 20, E(t, at + k * .25, .4, .2)); } }
function coinI(c, x, y, r = 26, k = 1) { pop(c, x, y, k, () => { ell(c, x, y + r * .12, r, r, '#b8902e'); ell(c, x, y, r, r, '#e8c35a'); c.strokeStyle = '#b8902e'; c.lineWidth = r * .12; c.beginPath(); c.arc(x, y, r * .62, 0, 7); c.stroke(); }); }
function magnifier(c, x, y, r, rot = -.7) { c.save(); c.translate(x, y); c.rotate(rot); rrect(c, r * .9, -r * .14, r * 1.1, r * .28, r * .12, WOOD2); c.restore(); c.save(); c.strokeStyle = '#d8dde8'; c.lineWidth = r * .18; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.fillStyle = 'rgba(190,225,255,.22)'; c.beginPath(); c.arc(x, y, r * .92, 0, 7); c.fill(); c.restore(); }
function ring2(c, x, y, r, k, col = RED) { if (k <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, k)); c.stroke(); c.restore(); }
function cloud(c, x, y, s, col = '#3a4258') { [[-60, 10, 50], [0, -12, 64], [62, 8, 48], [20, 22, 50], [-30, 26, 44]].forEach(([dx, dy, r]) => ell(c, x + dx * s, y + dy * s, r * s, r * s * .8, col)); }
function rain(c, t, x0, x1, y0, y1, a = 1) { c.save(); c.strokeStyle = `rgba(170,200,255,${.55 * a})`; c.lineWidth = 3; c.lineCap = 'round'; for (let k = 0; k < 60; k++) { const x = x0 + hash(k) * (x1 - x0), sp = 900 + hash(k + 7) * 300, y = y0 + ((hash(k + 3) * (y1 - y0) + t * sp) % (y1 - y0)); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 8, y + 30); c.stroke(); } c.restore(); }
function bib(c, x, y, n, s = 1) { rrect(c, x - 26 * s, y - 20 * s, 52 * s, 40 * s, 6 * s, CREAM); text(c, String(n), x, y + 2 * s, 30 * s, NAVY); }
function medal(c, x, y, s = 1) { c.strokeStyle = ROSE; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x - 16 * s, y - 50 * s); c.lineTo(x, y - 16 * s); c.lineTo(x + 16 * s, y - 50 * s); c.stroke(); ell(c, x, y, 18 * s, 18 * s, GOLD); star(c, x, y, 10 * s, 1, GOLD2); }
function note(c, x, y, w, h, rows, t, at, col = RED) { rrect(c, x - w / 2 + 6, y - h / 2 + 8, w, h, 10, 'rgba(0,0,20,.3)'); rrect(c, x - w / 2, y - h / 2, w, h, 10, CREAM); rrect(c, x - w / 2, y - h / 2, w, 30, 10, SAND2);
  for (let k = 0; k < rows; k++) { const u = E(t, at + k * .35, .3, .45); if (u <= 0) continue; const yy = y - h / 2 + 64 + k * 50; pop(c, x - w / 2 + 34, yy, u, () => { ell(c, x - w / 2 + 34, yy, 16, 16, col); text(c, '!', x - w / 2 + 34, yy + 2, 26, '#ffffff'); }); rrect(c, x - w / 2 + 62, yy - 6, (w - 100) * Math.min(1, u) * (.6 + .4 * hash(k)), 12, 6, SAND3); } }
function office(c, x0, x1, t) { rrect(c, x0, 900, x1 - x0, F - 900, 0, '#141a2c'); for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { const wx = x0 + 40 + k * ((x1 - x0 - 80) / 2), wy = 960 + r * 170; rrect(c, wx, wy, (x1 - x0 - 120) / 2, 120, 8, '#ffd889'); glow(c, wx + 60, wy + 60, 110, .25); }
  rrect(c, x0 + 20, 920, 200, 40, 8, '#252c43'); text(c, 'CÉG', x0 + 120, 941, 30, CREAM); rrect(c, x1 - 16, 900, 16, F - 900, 0, '#2a3150'); }
function street(c, x0, x1, t) { rrect(c, x0, 900, x1 - x0, F - 900, 0, '#0b1124'); c.fillStyle = '#1a2036'; for (let k = 0; k < 3; k++) { const bx = x0 + 30 + k * 150, bh = 300 + 120 * hash(k + 4); rrect(c, bx, F - bh - 200, 120, bh, 6, '#141a2c'); for (let w = 0; w < 4; w++) rrect(c, bx + 20 + (w % 2) * 50, F - bh - 170 + Math.floor(w / 2) * 90, 30, 40, 4, hash(k * 4 + w) > .4 ? '#ffd889' : '#252c43'); }
  rrect(c, x1 - 70, 1120, 10, F - 1120, 4, '#3a4258'); ell(c, x1 - 65, 1110, 26, 16, '#ffd889'); glow(c, x1 - 65, 1130, 160, .35); }
function track(c, t, speed) { c.fillStyle = '#5a2f2a'; c.fillRect(-400, F - 40, 1880, 80); c.strokeStyle = 'rgba(246,239,220,.5)'; c.lineWidth = 4; c.setLineDash([60, 50]); c.lineDashOffset = t * speed; c.beginPath(); c.moveTo(-400, F); c.lineTo(1480, F); c.stroke(); c.setLineDash([]); }
function puddle(c, x, y, w) { ell(c, x, y, w, w * .16, 'rgba(120,160,220,.35)'); ell(c, x - w * .2, y - 2, w * .4, w * .05, 'rgba(220,235,255,.35)'); }
function desk(c, x, w) { rrect(c, x - w / 2, F - 190, w, 22, 6, WOOD2); rrect(c, x - w / 2 + 20, F - 168, 18, 168, 4, '#6e4a2c'); rrect(c, x + w / 2 - 38, F - 168, 18, 168, 4, '#6e4a2c'); }
function shopWindow(c, x, y, w, h) { rrect(c, x - w / 2 - 20, y - h / 2 - 20, w + 40, h + 40, 18, '#2a3150'); rrect(c, x - w / 2, y - h / 2, w, h, 10, '#1b2a4a'); const g = c.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.05)'); c.fillStyle = g; c.fillRect(x - w / 2, y - h / 2, w, h); }
function stamp(c, x, y, s, k, word, col = MINT, rot = -.12) { pop(c, x, y, k, () => { c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.lineWidth = 8 * s; c.beginPath(); c.roundRect(-160 * s, -44 * s, 320 * s, 88 * s, 14 * s); c.stroke(); text(c, word, 0, 2 * s, 54 * s, col); c.restore(); }); }
function shield(c, x, y, r, k) { pop(c, x, y, k, () => { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.moveTo(x + 6, y - r + 8); c.lineTo(x + r * .85 + 6, y - r * .7 + 8); c.quadraticCurveTo(x + r * .85 + 6, y + r * .6 + 8, x + 6, y + r + 8); c.quadraticCurveTo(x - r * .85 + 6, y + r * .6 + 8, x - r * .85 + 6, y - r * .7 + 8); c.closePath(); c.fill();
  c.fillStyle = '#2ED3C6'; c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .85, y - r * .7); c.quadraticCurveTo(x + r * .85, y + r * .6, x, y + r); c.quadraticCurveTo(x - r * .85, y + r * .6, x - r * .85, y - r * .7); c.closePath(); c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = r * .14; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - r * .35, y); c.lineTo(x - r * .05, y + r * .3); c.lineTo(x + r * .4, y - r * .3); c.stroke(); }); }
// the people: the product manager (later the head of the company) is white; the staff wear the company cap; the runners wear numbers
function owner(c, t, x, y, s, o = {}) { mascot(c, { id: 'own', skin: 'owner', s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi || 0, handL: o.handL, handR: o.handR, squash: o.squash || 0, tache: true, hold: o.hold }); }
const PPL = [{ skin: 'blue1', cap: true }, { skin: 'blue3', cap: true }, { skin: 'blue2' }, { skin: 'blue3', fem: 'pony' }, { skin: 'blue1', fem: 'glasses' }, { skin: 'blue2', fem: 'glasses' }];
function guy(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'p' + k, ...PPL[k], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0, rot: o.rot || 0, hold: o.hold, lean: o.lean || 0 }); }
const run = (t, sp = 12) => ({ walk: 1.4, phi: t * sp });

const SHOT = {
  lab(c, t) {   // a sneaker maker, before the launch of its new model: the shoe on a pedestal under a spotlight, "ÚJ"; the internal tests: a clipboard, every line ticked
    bg(c, '#0d2463'); floor(c); const H = HIT;
    spotlight(c, 380, 1430, 230, .35); pedestal(c, 380, 1430, 330);
    pop(c, 380, 1430, E(t, .1, .4, .45), () => { c.save(); c.translate(380, 1430); c.rotate(.04 * Math.sin(t * 2)); c.translate(-380, -1430); shoe(c, 380, 1426, 1.05); c.restore(); });
    pop(c, 530, 1180, E(t, H.newshoe - .1, .3, .5), () => { rrect(c, 460, 1150, 140, 64, 14, GOLD); text(c, 'ÚJ', 530, 1184, 46, NAVY); }); if (t > H.newshoe) spark(c, 380, 1320, t, H.newshoe, 6, 220, 14);
    pop(c, 820, 1350, E(t, H.tests - .2, .35, .45), () => clipboard(c, 820, 1350, 3, t, H.good - .2));
  },
  staff(c, t) {   // the staff tried the shoes (company caps): two of them jog on the spot, thumbs up; five stars: "perfect"
    bg(c, '#0d2463'); floor(c); const H = HIT; const j = ss(seg(t, H.tried - .4, H.tried));
    [[330, 0], [700, 1]].forEach(([x, k]) => { const bounce = Math.abs(Math.sin(t * 9)) * 14 * j; guy(c, t, k, x, F - bounce, 1.5, { f: k ? -.3 : .3, look: k ? -.2 : .2, smile: 1, ...(j > 0 ? run(t, 9) : {}), walk: j * .8, handR: k === 0 ? [x + 80, 1360 + bounce * 0] : undefined }); });
    for (let k = 0; k < 5; k++) star(c, 340 + k * 90, 1080, 34, E(t, H.perfect - .2 + k * .08, .3, .5), GOLD);
    if (t > H.perfect + .3) spark(c, 520, 1080, t, H.perfect + .3, 6, 260, 14);
  },
  question(c, t) {   // the product manager, though, had a question: he looks at the shoe on his desk; a "?"
    bg(c, '#0d2463'); floor(c); const H = HIT; desk(c, 680, 420); shoe(c, 680, F - 190, .9);
    owner(c, t, 300, F, 1.6, { f: .4, look: .4, smile: .5, handR: [380, 1420] });
    badge(c, 'q', 300, 1110, 52, E(t, H.ask - .1, .3, .5));
  },
  outsiders(c, t) {   // "what if people try it who have nothing to do with the company?": inside the company (caps, light) | outside on the street (strangers); he points outside
    bg(c, '#0d2463'); const H = HIT; office(c, -20, 520, t); street(c, 520, 1100, t); floor(c);
    guy(c, t, 0, 140, F, 1.15, { f: .3, smile: .9 }); guy(c, t, 1, 260, F, 1.15, { f: .2, smile: .9 });
    const pt = ease(seg(t, H.others - .3, H.others + .2)); owner(c, t, 420, F, 1.4, { f: .4, look: .5, smile: .7, handR: [lerp(470, 560, pt), lerp(1500, 1360, pt)] });
    [[660, 2], [800, 3], [940, 4]].forEach(([x, k], i) => { const inn = ease(seg(t, H.others - .2 + i * .25, H.others + .6 + i * .25)); guy(c, t, k, lerp(x + 300, x, inn), F, 1.25, { f: -.4, look: -.3, smile: .7, walk: inn < 1 ? 1 : 0, phi: t * 9 + i }); });
    if (t > H.nothing - .3) { const u = ease(seg(t, H.nothing - .3, H.nothing + .3)); c.save(); c.strokeStyle = `rgba(246,239,220,${.8 * u})`; c.lineWidth = 6; c.setLineDash([18, 16]); c.beginPath(); c.moveTo(520, 860); c.lineTo(520, 860 + 840 * u); c.stroke(); c.restore(); }
    badge(c, 'x', 520, 1060, 40, E(t, H.company - .1, .3, .5));
  },
  invite(c, t) {   // so he invited a team of professional and amateur runners: they run in from the right; the pro has a medal and a number, the amateurs numbers
    bg(c, '#0d2463'); floor(c); const H = HIT;
    owner(c, t, 190, F, 1.55, { f: .4, look: .3, smile: 1, handR: [290, 1380 - 30 * Math.sin(t * 6) * ss(seg(t, H.invite, H.invite + .4))] });
    [[520, 2, H.pro - .5, 1.45], [720, 3, H.amateur - .6, 1.3], [900, 4, H.amateur - .4, 1.3]].forEach(([x, k, at, s], i) => { const u = ease(seg(t, at, at + .8)), xx = lerp(x + 520, x, u);
      guy(c, t, k, xx, F, s, { f: -.4, look: -.3, smile: 1, walk: u < 1 ? 1.4 : 0, phi: t * 12 + i }); bib(c, xx, F - Hs(s) * .42, [7, 23, 41][i], s * .8); if (i === 0) medal(c, xx + 8, F - Hs(s) * .3 + 20, s * .9); });
    pop(c, 520, 1150, E(t, H.pro, .3, .5), () => { rrect(c, 430, 1118, 180, 64, 14, GOLD); text(c, 'PROFI', 520, 1152, 40, NAVY); });
    pop(c, 810, 1180, E(t, H.amateur, .3, .5), () => { rrect(c, 700, 1148, 220, 64, 14, CREAM); text(c, 'AMATŐR', 810, 1182, 40, NAVY); });
  },
  paid(c, t) {   // the odd condition: they were paid to report every fault they found: "!"; a runner inspects a shoe with a magnifier; each fault gets a red ring and a coin drops to him
    bg(c, '#0d2463'); floor(c); const H = HIT;
    badge(c, 'ex', 540, 1100, 50, E(t, H.odd, .3, .5) * (1 - ss(seg(t, H.paid - .3, H.paid))));
    owner(c, t, 170, F, 1.45, { f: .4, look: .3, smile: .9, hold: t > H.paid ? 'coin' : undefined, handR: [260, 1400] });
    shoe(c, 560, 1500, 1.35);
    const mg = ease(seg(t, H.faults - .5, H.faults)); magnifier(c, lerp(760, 470, mg), lerp(1600, 1400, mg) + 10 * Math.sin(t * 3), 60);
    guy(c, t, 2, 880, F, 1.45, { f: -.4, look: -.5, smile: .8, handL: [lerp(820, 600, mg), lerp(1500, 1440, mg)] }); bib(c, 880, F - Hs(1.45) * .42, 7, 1.1);
    const FAULTS = [[470, 1420, H.report], [620, 1460, H.found - .2], [660, 1380, H.found + .3]];
    FAULTS.forEach(([x, y, at], k) => { ring2(c, x, y, 34, seg(t, at, at + .35)); const u = ease(seg(t, at + .2, at + .8)); if (u > 0) coinI(c, lerp(260, 900, u), lerp(1300, 1150 + k * 40, u) - 160 * Math.sin(u * Math.PI), 24); });
    if (t > H.paid) for (let k = 0; k < 3; k++) coinI(c, 200 + k * 12, 1140 - k * 18, 26, E(t, H.paid + k * .1, .3, .5));
  },
  real(c, t) {   // not to praise the shoe (five stars crossed out), but to test it for real: running through the rain over puddles, then honestly listing every problem
    const H = HIT; bg(c, '#0d2463'); const rr = ss(seg(t, H.real - .3, H.real + .2)), ls = ss(seg(t, H.honest - .4, H.honest));
    if (rr < 1) { c.save(); c.globalAlpha = 1 - rr; floor(c); for (let k = 0; k < 5; k++) star(c, 340 + k * 100, 1300, 40, E(t, H.nopraise - .6 + k * .06, .3, .5), GOLD); cross(c, 540, 1300, 220, seg(t, H.nopraise, H.nopraise + .5)); c.restore(); }
    if (rr > 0 && ls < 1) { c.save(); c.globalAlpha = rr * (1 - ls); cloud(c, 260, 900, 1.4); cloud(c, 780, 860, 1.2); rain(c, t, -100, 1180, 860, F); track(c, t, 700);
      for (let k = 0; k < 3; k++) puddle(c, ((k * 420 - t * 700) % 1500 + 1600) % 1500 - 200, F + 10, 120);
      [[360, 2, 1.45], [620, 3, 1.3], [840, 4, 1.3]].forEach(([x, k, s], i) => { const b = Math.abs(Math.sin(t * 12 + i)) * 18; guy(c, t, k, x, F - b, s, { f: .4, look: .2, smile: .5, sad: .2, ...run(t + i * .3, 12) }); bib(c, x, F - b - Hs(s) * .42, [7, 23, 41][i], s * .8); }); c.restore(); }
    if (ls > 0) { c.save(); c.globalAlpha = ls; floor(c); guy(c, t, 2, 250, F, 1.5, { f: .4, look: .3, smile: .6, handR: [360, 1420] }); bib(c, 250, F - Hs(1.5) * .42, 7, 1.1); note(c, 680, 1360, 420, 380, 5, t, H.honest + .1); c.restore(); }
  },
  weeks(c, t) {   // after a few weeks: some parts of the shoe are uncomfortable over long runs: a calendar turns; the heel glows red; a runner rubs his foot
    bg(c, '#0d2463'); floor(c); const H = HIT;
    calendarBadge(c, 180, 1110, E(t, H.weeks - .3, .3, .45), 1 + Math.floor(clamp(seg(t, H.weeks, H.weeks + 1.2)) * 3) * 7);
    shoe(c, 600, 1420, 1.6, { hot: ss(seg(t, H.parts - .2, H.parts + .4)) });
    const sore = ss(seg(t, H.uncomfy - .3, H.uncomfy)); guy(c, t, 3, 300, F, 1.4, { f: .3, look: .4, smile: lerp(.6, .1, sore), sad: .7 * sore, rot: .08 * sore, handR: sore > 0 ? [lerp(330, 360, sore), lerp(1560, 1640, sore)] : undefined }); bib(c, 300, F - Hs(1.4) * .42, 23, 1);
    badge(c, 'ex', 460, 1240, 40, E(t, H.uncomfy, .3, .5));
  },
  redesign(c, t) {   // the designers changed it: at a drawing desk the heel is redrawn (a mint pad); the new version, in a box, flies back to the runners; a tick
    bg(c, '#0d2463'); floor(c); const H = HIT; desk(c, 560, 520);
    guy(c, t, 5, 230, F, 1.5, { f: .4, look: .3, smile: .9, handR: [lerp(330, 380, .5 + .5 * Math.sin(t * 8)) , 1500] });
    const fx = ss(seg(t, H.changed - .2, H.changed + .5)); shoe(c, 600, F - 200, 1.2, { fixed: fx > .5, hot: 1 - fx }); if (fx > .5 && fx < 1) poof(c, 480, F - 280, fx, 50);
    pop(c, 760, 1220, E(t, H.newver - .2, .3, .5), () => { rrect(c, 690, 1188, 140, 64, 14, GOLD); text(c, 'ÚJ', 760, 1222, 46, NAVY); });
    const fly = ease(seg(t, H.again - .2, H.sent + .2)); if (fly > 0) { const x = lerp(620, 1000, fly), y = lerp(F - 220, F - 60, fly) - 260 * Math.sin(fly * Math.PI); parcelBox(c, x, y, lerp(.6, .45, fly)); }
    if (t > H.sent) { guy(c, t, 2, 960, F, 1.3, { f: -.4, look: -.3, smile: 1, handL: [880, 1440] }); check(c, 960, 1180, 40, E(t, H.sent + .2, .4, .2)); }
  },
  launch(c, t) {   // when the shoe finally came out, the company could speak with confidence about how it performs for real: a shop window, the shoe, a "TESZTELVE" stamp; the manager proud
    bg(c, '#0d2463'); floor(c); const H = HIT; shopWindow(c, 580, 1290, 620, 520); spotlight(c, 580, 1500, 200, .3 * ss(seg(t, H.launched - .3, H.launched)));
    pop(c, 580, 1480, E(t, H.launched - .3, .4, .45), () => shoe(c, 580, 1480, 1.3, { fixed: true })); if (t > H.launched) spark(c, 580, 1380, t, H.launched, 7, 260, 16);
    stamp(c, 600, 1150, 1, E(t, H.reality - .5, .3, .5), 'TESZTELVE');
    owner(c, t, 150, F, 1.5, { f: .4, look: .3, smile: 1, squash: wob(t, H.confident, .4, 18, .4), handR: [lerp(240, 270, ss(seg(t, H.confident - .2, H.confident + .2))), lerp(1460, 1340, ss(seg(t, H.confident - .2, H.confident + .2)))] });
    [[900, 2], [1000, 4]].forEach(([x, k], i) => guy(c, t, k, x, F, 1.2, { f: -.4, look: -.3, smile: 1 }));
  },
  lesson(c, t) {   // the head of the company: a trusted brand needs more than praise: stars come in (praise), then red "!" notes (faults); he takes both, and they become a turquoise shield with a tick
    bg(c, '#0d2463'); floor(c); const H = HIT; const tr = ss(seg(t, H.trust - .3, H.trust + .2)), fin = ease(seg(t, H.faults2 - .3, H.listen + .3));
    owner(c, t, 270, F, 1.65, { f: .4, look: .3, smile: lerp(.8, 1, fin), handR: [380, 1410], handL: [200, 1420] });
    for (let k = 0; k < 4; k++) { const u = clamp((t - H.boss - .2 - k * .4) / 1.4); if (u <= 0) continue; const x = lerp(1000, 420, ease(u)) + 0 * k, y = 1150 + k * 60 - 120 * Math.sin(u * Math.PI); if (fin < 1) { c.save(); c.globalAlpha = 1 - fin; star(c, lerp(x, 760, fin), lerp(y, 1300, fin), 30, 1, GOLD); c.restore(); } }
    const nf = ss(seg(t, H.ready - .2, H.ready + .3)); for (let k = 0; k < 3; k++) { const u = clamp((t - H.ready - k * .35) / 1.2); if (u <= 0) continue; const x = lerp(1000, 460, ease(u)), y = 1200 + k * 80 - 100 * Math.sin(u * Math.PI); if (fin < 1) { c.save(); c.globalAlpha = (1 - fin) * nf; ell(c, lerp(x, 760, fin), lerp(y, 1300, fin), 24, 24, RED); text(c, '!', lerp(x, 760, fin), lerp(y, 1300, fin) + 2, 34, '#ffffff'); c.restore(); } }
    pop(c, 690, 1150, E(t, H.notenough - .2, .3, .5) * (1 - ss(seg(t, H.ready - .3, H.ready))), () => { star(c, 650, 1150, 40, 1, GOLD); text(c, '≠', 720, 1150, 70, CREAM); shield(c, 800, 1150, 44, 1); });
    shield(c, 760, 1300, 120, E(t, H.listen - .3, .45, .45)); if (t > H.listen) { glow(c, 760, 1300, 360, .3 * ss(seg(t, H.listen, H.listen + .5))); spark(c, 760, 1300, t, H.listen, 8, 250, 18); }
  },
};
function parcelBox(c, x, y, s) { rrect(c, x - 120 * s, y - 130 * s, 240 * s, 130 * s, 8 * s, '#c79a62'); rrect(c, x - 20 * s, y - 130 * s, 40 * s, 130 * s, 0, '#e2c08a'); }
function calendarBadge(c, x, y, k, n) { pop(c, x, y, k, () => { rrect(c, x - 60, y - 70, 120, 140, 12, CREAM); rrect(c, x - 60, y - 70, 120, 36, 12, ROSE); c.fillStyle = ROSE; c.fillRect(x - 60, y - 48, 120, 14); text(c, String(n), x, y + 18, 58, NAVY); }); }
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.06, 1.06); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['sportcipőgyártó','belső','tökéletesnek','kérdése:','semmi','profi','amatőr','fizettek','hibát','dicsérniük','Valódi','problémát,','kényelmetlenek.','tervezők','újra','magabiztosabban','valóságban.','megbízható','dicséretet','hibáidat']);
const bare = w => w.replace(/[.,:;!?…„”"]/g, '');
const CAP = { x: 130, y: 540, size: 50, lh: 64, maxW: 790, maxLines: 2 }, CAPFONT = `700 ${CAP.size}px "Montserrat"`;   // the caption area, placed for Instagram's preview: Montserrat Bold, two lines at most
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
    const hot = w === now, col = hot || w.key ? '#2ED3C6' : CREAM;   // dark story world: turquoise key words
    c.save(); c.globalAlpha = a * (1 - out); c.translate(cx, y); c.scale(sc, sc); c.translate(-cx, -y);
    c.shadowColor = 'rgba(0,0,15,.6)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.fillStyle = col; c.fillText(w.w, CAP.x + w.x, y); c.shadowColor = 'transparent';
    c.restore(); });
  c.restore();
}

// —— the locked 23 Team end card (ANIMATION-STYLE.md) ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#F4F7FF'; x.fillRect(0, 0, c.width, c.height); return c; })();
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
