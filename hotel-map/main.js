// The Map in the Lobby: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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
    if (kind === 'bell') { c.fillStyle = GOLD; c.beginPath(); c.moveTo(x - g * .7, y + g * .4); c.quadraticCurveTo(x - g * .6, y - g * .8, x, y - g * .8); c.quadraticCurveTo(x + g * .6, y - g * .8, x + g * .7, y + g * .4); c.closePath(); c.fill(); ell(c, x, y + g * .55, g * .18, g * .18, GOLD2); } });
}
function clockFace(c, x, y, r, a) {   // a wall clock; a = the hour hand in hours
  ell(c, x + 8, y + 10, r, r, 'rgba(0,0,20,.35)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .08; c.beginPath(); c.arc(x, y, r * .92, 0, 7); c.stroke();
  for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2 - Math.PI / 2; ell(c, x + Math.cos(an) * r * .76, y + Math.sin(an) * r * .76, i % 3 ? r * .03 : r * .06, i % 3 ? r * .03 : r * .06, NAVY); }
  const ha = (a % 12) / 12 * Math.PI * 2 - Math.PI / 2, ma = ((a * 12) % 12) / 12 * Math.PI * 2 - Math.PI / 2; c.strokeStyle = NAVY; c.lineCap = 'round'; c.lineWidth = r * .08; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ha) * r * .45, y + Math.sin(ha) * r * .45); c.stroke(); c.lineWidth = r * .05; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ma) * r * .68, y + Math.sin(ma) * r * .68); c.stroke(); ell(c, x, y, r * .07, r * .07, GOLD2);
}
// —— map pieces ——
function pinMark(c, x, y, r, k = 1, col = '#c4566a') {   // a map pin; (x, y) = its point
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .2, y + r * .1, r * .5, r * .18, 'rgba(0,0,20,.3)'); c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x - r * .72, y - r * 1.4); c.arc(x, y - r * 1.75, r, Math.PI * .8, Math.PI * .2); c.closePath(); c.fill(); ell(c, x, y - r * 1.75, r * .4, r * .4, CREAM); });
}
function noteCard(c, x, y, w, k = 1, icon = 'heart', write = 1, rot = -.06) {   // a short recommendation: a little card with a line of writing and a mark
  if (k <= 0) return; const h = w * .72; scaled(c, x, y, k, () => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(-w / 2 + 5, -h / 2 + 6, w, h); c.fillStyle = '#fff8e6'; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = GOLD; c.fillRect(-w / 2, -h / 2, w, h * .12);
    c.strokeStyle = 'rgba(28,36,80,.55)'; c.lineWidth = w * .03; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = clamp(write * 3 - i), y0 = -h * .12 + i * h * .2; if (u > 0) { c.beginPath(); c.moveTo(-w * .38, y0); for (let j = 0; j <= 8 * u; j++) c.lineTo(-w * .38 + j / 8 * w * .5, y0 + Math.sin(j * 2.1 + i) * w * .015); c.stroke(); } }
    if (write >= 1) { if (icon === 'heart') heart(c, w * .3, h * .05, w * .1, 1, '#c4566a'); if (icon === 'star') star(c, w * .3, h * .05, w * .12, 1); if (icon === 'cup') { c.fillStyle = WOOD; c.fillRect(w * .22, -h * .02, w * .14, w * .14); c.strokeStyle = WOOD; c.lineWidth = w * .03; c.beginPath(); c.arc(w * .37, h * .07, w * .04, -1.4, 1.4); c.stroke(); } }
    c.restore(); });
}
function landmark(c, kind, x, y, s, col) {   // the famous sights, as simple shapes; y = the ground
  c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round';
  if (kind === 'tower') { c.beginPath(); c.moveTo(x - 46 * s, y); c.quadraticCurveTo(x - 14 * s, y - 120 * s, x - 6 * s, y - 230 * s); c.lineTo(x, y - 270 * s); c.lineTo(x + 6 * s, y - 230 * s); c.quadraticCurveTo(x + 14 * s, y - 120 * s, x + 46 * s, y); c.lineTo(x + 24 * s, y); c.quadraticCurveTo(x, y - 50 * s, x - 24 * s, y); c.closePath(); c.fill(); c.fillRect(x - 30 * s, y - 92 * s, 60 * s, 10 * s); }
  if (kind === 'dome') { c.fillRect(x - 90 * s, y - 90 * s, 180 * s, 90 * s); c.beginPath(); c.arc(x, y - 90 * s, 62 * s, Math.PI, 0); c.fill(); c.fillRect(x - 5 * s, y - 180 * s, 10 * s, 32 * s); for (const d of [-1, 1]) { c.fillRect(x + d * 110 * s - 14 * s, y - 120 * s, 28 * s, 120 * s); c.beginPath(); c.moveTo(x + d * 110 * s - 16 * s, y - 120 * s); c.lineTo(x + d * 110 * s, y - 150 * s); c.lineTo(x + d * 110 * s + 16 * s, y - 120 * s); c.fill(); } }
  if (kind === 'bridge') { c.lineWidth = 12 * s; c.beginPath(); c.moveTo(x - 130 * s, y - 60 * s); c.lineTo(x + 130 * s, y - 60 * s); c.stroke(); for (const d of [-1, 1]) c.fillRect(x + d * 70 * s - 12 * s, y - 130 * s, 24 * s, 130 * s); c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x - 130 * s, y - 60 * s); c.quadraticCurveTo(x - 70 * s, y - 150 * s, x - 70 * s, y - 130 * s); c.quadraticCurveTo(x, y - 40 * s, x + 70 * s, y - 130 * s); c.quadraticCurveTo(x + 70 * s, y - 150 * s, x + 130 * s, y - 60 * s); c.stroke(); }
  if (kind === 'wheel') { c.lineWidth = 7 * s; c.beginPath(); c.arc(x, y - 110 * s, 80 * s, 0, 7); c.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x, y - 110 * s); c.lineTo(x + Math.cos(a) * 80 * s, y - 110 * s + Math.sin(a) * 80 * s); c.stroke(); ell(c, x + Math.cos(a) * 80 * s, y - 110 * s + Math.sin(a) * 80 * s, 9 * s, 9 * s, col); } c.lineWidth = 8 * s; c.beginPath(); c.moveTo(x - 50 * s, y); c.lineTo(x, y - 110 * s); c.lineTo(x + 50 * s, y); c.stroke(); }
}
// the big map of the city: river, streets, parks; pins in the map's own 0..1 coordinates
const STREETS = [[.05, .2, .95, .28], [.05, .55, .95, .48], [.1, .85, .9, .9], [.22, .04, .3, .96], [.55, .04, .5, .96], [.8, .04, .76, .96], [.05, .4, .4, .7], [.6, .1, .95, .4]];
const PARKS = [[.62, .58, .14, .12], [.1, .62, .12, .1], [.34, .1, .12, .09]];
const PINS = (() => { const out = [], used = [[.5, .92]]; let i = 0;
  while (out.length < 26 && i < 500) { const u = .08 + hash(i * 3.1 + 1) * .84, v = .1 + hash(i * 7.3 + 2) * .76; i++;
    if (Math.abs(v - (.62 - .3 * u + .12 * Math.sin(u * 7))) < .07) continue;
    if (used.some(([a, b]) => Math.hypot((a - u) * 1.3, b - v) < .095)) continue;
    used.push([u, v]); out.push({ u, v, t: 30.1 + out.length * 0.160, col: [GOLD2, '#c4566a', '#c4566a', '#5d7fc4'][out.length % 4], note: out.length % 4 === 1 ? ['heart', 'cup', 'star'][out.length % 3] : null }); }
  return out; })();
const MYPIN = { u: .5, v: .92, col: '#c4566a' };
function bigMap(c, R, u = 1, o = {}) {   // R = { x, y, w, h }; u = how far it has unrolled from the top
  if (u <= 0) return; const { x, y, w, h } = R, hh = h * Math.min(1, u);
  if (o.glow) glow(c, x + w / 2, y + h / 2, Math.max(w, h) * .75, .45 * o.glow);
  c.save(); c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(x - 10, y - 4, w + 32, hh + 26);
  c.beginPath(); c.rect(x - 16, y - 16, w + 32, hh + 16); c.clip();
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - 16, y - 16, w + 32, h + 32, 10); c.fill();
  c.fillStyle = '#f3e8cc'; c.fillRect(x, y, w, h);
  c.fillStyle = '#e6d6ae'; for (const [a, b, pw, ph] of [[.08, .08, .1, .08], [.4, .3, .1, .1], [.84, .62, .1, .12], [.28, .74, .14, .1], [.66, .2, .1, .08]]) c.fillRect(x + a * w, y + b * h, pw * w, ph * h);
  c.fillStyle = '#c9d6b0'; for (const [a, b, pw, ph] of PARKS) { c.beginPath(); c.roundRect(x + a * w, y + b * h, pw * w, ph * h, 12); c.fill(); }
  c.strokeStyle = 'rgba(28,36,80,.22)'; c.lineCap = 'round'; for (const [a, b, a2, b2] of STREETS) { c.lineWidth = Math.max(4, w * .012); c.beginPath(); c.moveTo(x + a * w, y + b * h); c.lineTo(x + a2 * w, y + b2 * h); c.stroke(); }
  c.strokeStyle = '#7f9fd8'; c.lineWidth = w * .05; c.beginPath(); for (let i = 0; i <= 30; i++) { const uu = i / 30; c.lineTo(x + uu * w, y + (.62 - .3 * uu + .12 * Math.sin(uu * 7)) * h); } c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = w * .008; c.stroke();
  (o.draw || []).forEach(f => f());
  const pr = o.pr || w * .022; (o.pins || []).forEach(p => { const k = p.k ?? 1; if (k <= 0) return; const px = x + p.u * w, py = y + p.v * h - (p.drop || 0);
    if (p.note) noteCard(c, px + pr * 2.6, py - pr * 2.2, pr * 3.2, k, p.note, 1, .08); pinMark(c, px, py, pr, Math.min(1.1, k), p.col); });
  c.restore();
  if (u < 1) { c.fillStyle = '#6e4a2c'; c.beginPath(); c.roundRect(x - 26, y + hh - 14, w + 52, 30, 14); c.fill(); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x - 20, y + hh - 8, w + 40, 6); }
}
function suitcase(c, x, y, s = 1, col = '#c4566a') {   // y = the floor
  ell(c, x, y, 48 * s, 8 * s, 'rgba(0,0,20,.3)'); c.strokeStyle = '#3a3f55'; c.lineWidth = 7 * s; c.beginPath(); c.roundRect(x - 20 * s, y - 150 * s, 40 * s, 40 * s, 8 * s); c.stroke();
  c.fillStyle = col; c.beginPath(); c.roundRect(x - 46 * s, y - 120 * s, 92 * s, 112 * s, 14 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; for (const d of [-22, 0, 22]) c.fillRect(x + d * s - 3 * s, y - 116 * s, 6 * s, 104 * s);
  ell(c, x - 28 * s, y - 4 * s, 8 * s, 8 * s, '#2a2f45'); ell(c, x + 28 * s, y - 4 * s, 8 * s, 8 * s, '#2a2f45');
}
function face(c, x, y, r, who, k = 1) {   // a guest's face in a gold ring
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + 4, y + 6, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke();
    c.save(); c.beginPath(); c.arc(x, y, r * .82, 0, 7); c.clip(); drawMascot(c, { ...cust(who, { x, y: y + r * 1.7, s: r / 66, smile: 1, f: 0 }), shadow: false }); c.restore(); });
}
// —— the places ——
function lobby(c, t, o = {}) {   // the hotel lobby: the wall is the caption area's blue; cream panelling, a warm wooden floor
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  for (let k = -3; k < 14; k++) { const x0 = k * 130; c.fillStyle = '#e9dcc0'; c.fillRect(x0, 1390, 128, 250); c.strokeStyle = 'rgba(138,93,56,.35)'; c.lineWidth = 4; c.strokeRect(x0 + 16, 1414, 96, 200); }
  c.fillStyle = WOOD; c.fillRect(-400, 1380, 1880, 14);
  c.fillStyle = '#5a3a22'; c.fillRect(-400, 1640, 1880, 600); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 1670; y < 2200; y += 40) { c.beginPath(); c.moveTo(-400, y); c.lineTo(1480, y); c.stroke(); }
}
function desk(c, x, y) {   // the reception desk; y = its top
  c.fillStyle = '#6e4a2c'; c.fillRect(x - 280, y, 560, 1790 - y); c.fillStyle = 'rgba(0,0,0,.18)'; for (const d of [-140, 0, 140]) c.fillRect(x + d - 4, y + 140, 8, 1790 - y - 160);
  c.fillStyle = WOOD; c.fillRect(x - 300, y - 26, 600, 30); c.fillStyle = GOLD; c.beginPath(); c.roundRect(x - 140, y + 40, 280, 64, 10); c.fill();
  c.save(); c.font = '700 34px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('RECEPCIÓ', x, y + 73); c.restore();
  ell(c, x + 210, y - 28, 30, 6, '#8f98b0'); c.fillStyle = GOLD; c.beginPath(); c.arc(x + 210, y - 30, 24, Math.PI, 0); c.fill(); ell(c, x + 210, y - 58, 6, 6, GOLD2);
}
function hotelHouse(c, x0, y0, w, h, o = {}) {   // a hotel front: floors of windows, a sign, the door, and (ours) the lobby window with the map glowing in it
  const col = o.col || '#e9dcc0', x1 = x0 + w, y1 = y0 + h, lit = o.lit ?? 1;
  c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(x0 + 12, y0 + 12, w, h); c.fillStyle = col; c.fillRect(x0, y0, w, h); c.fillStyle = o.trim || WOOD; c.fillRect(x0 - 14, y0 - 20, w + 28, 26);
  const cols = Math.max(2, Math.round(w / 120)), gap = w / cols;
  for (let r = 0; r < 3; r++) for (let k = 0; k < cols; k++) { const wx = x0 + k * gap + gap * .25, wy = y0 + 110 + r * 120, on = hash(r * 9 + k * 3 + (o.seed || 0)) < .65;
    c.fillStyle = on && lit > 0 ? `rgba(255,214,140,${.55 + .4 * lit})` : '#2a2f6a'; c.fillRect(wx, wy, gap * .5, 76); c.fillStyle = o.trim || WOOD; c.fillRect(wx - 6, wy + 76, gap * .5 + 12, 8); }
  c.fillStyle = o.signBg || WOOD; c.beginPath(); c.roundRect(x0 + w / 2 - 150, y0 + 22, 300, 70, 12); c.fill(); c.save(); c.font = '700 44px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = o.signCol || GOLD; c.fillText(o.name || 'HOTEL', x0 + w / 2, y0 + 58); c.restore();
  const dx = o.door ?? (x0 + w * .35), dw = 120;
  const dop = o.doorOpen || 0, pw = (dw - 20) * (1 - .82 * dop); c.fillStyle = '#3a2416'; c.fillRect(dx - dw / 2, y1 - 210, dw, 210); c.fillStyle = `rgba(255,214,140,${Math.min(.95, .3 + .4 * (o.doorGlow || 0) + .6 * dop)})`; c.fillRect(dx - dw / 2 + 10, y1 - 200, dw - 20, 200); if (dop > 0) glow(c, dx, y1 - 90, 150, .5 * dop);
  c.fillStyle = '#6e4a2c'; c.fillRect(dx - dw / 2 + 10, y1 - 200, pw, 200); c.fillStyle = `rgba(255,214,140,${.35 + .4 * (o.doorGlow || 0)})`; c.fillRect(dx - dw / 2 + 10 + pw * .18, y1 - 186, pw * .64, 70); ell(c, dx - dw / 2 + 10 + pw * .85, y1 - 96, 6 * (1 - .5 * dop), 6, GOLD); c.fillStyle = o.awning || '#c4566a'; c.beginPath(); c.moveTo(dx - 90, y1 - 230); c.lineTo(dx + 90, y1 - 230); c.lineTo(dx + 76, y1 - 196); c.lineTo(dx - 76, y1 - 196); c.closePath(); c.fill();
  if (o.map) { const mx = dx + 110, mw = x1 - mx - 30; c.fillStyle = '#2a2f6a'; c.fillRect(mx, y1 - 200, mw, 170); glow(c, mx + mw / 2, y1 - 115, 170, .35 + .4 * (o.mapGlow || 0)); bigMap(c, { x: mx + 16, y: y1 - 180, w: mw - 32, h: 120 }, 1, { pins: PINS.slice(0, 12), pr: 5 }); c.fillStyle = o.trim || WOOD; c.fillRect(mx - 8, y1 - 30, mw + 16, 10); }
}
function street(c, t, o = {}) {   // the city: night sky in the caption blue, stars, a skyline of famous sights, the pavement
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  for (let i = 0; i < 40; i++) { const sx = -100 + hash(i * 2.3) * 1280, sy = 800 + hash(i * 5.1) * 420, tw = .4 + .6 * Math.abs(Math.sin(t * 1.5 + i)); ell(c, sx, sy, 2.4, 2.4, `rgba(246,239,220,${.5 * tw})`); }
  const sk = '#24306e'; landmark(c, 'tower', 130, 1380, 1.6, sk); landmark(c, 'dome', 930, 1380, 1.3, sk); landmark(c, 'wheel', 560, 1380, 1.4, sk);
  c.fillStyle = '#1e2864'; for (const [bx, bw, bh] of [[-200, 260, 160], [40, 180, 230], [700, 200, 200], [880, 260, 140], [1060, 300, 220]]) c.fillRect(bx, 1380 - bh, bw, bh + 340);
  c.fillStyle = '#2a3054'; c.fillRect(-400, 1700, 1880, 500); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let r = 0; r < 7; r++) for (let x = -400 + (r % 2) * 40; x < 1480; x += 90) { c.beginPath(); c.roundRect(x, 1716 + r * 34, 80, 26, 8); c.stroke(); }
}
// —— the people ——
const OWNER = o => ({ id: 'owner', skin: 'owner', bowtie: 1, s: 2.0, smile: .8, ...o });   // the hotel's owner, in a bow tie
const CUST = [['blue2', 'long'], ['blue1', null], ['blue3', 'bun'], ['blue2', 'bob'], ['blue1', 'beret'], ['blue3', 'glasses'], ['blue2', 'hat'], ['blue1', 'pony']];
const cust = (i, o) => ({ id: 'g' + i, skin: CUST[i % 8][0], fem: CUST[i % 8][1], s: 2.0, smile: .6, ...o });
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
const walkX = (t, a, b, x0, x1) => { const u = seg(t, a, b); return [lerp(x0, x1, ss(u)), u > 0 && u < 1 ? 1 : 0, u * (b - a) * 7]; };

// —— the shots ——
const MAP = { x: 220, y: 930, w: 640, h: 520 };
const pinsAt = (t, extra = []) => [{ ...MYPIN, k: t > HIT.drop ? 1 : 0 }, ...PINS.map(p => { const k = E(t, p.t, .3, .5); return { ...p, k: Math.min(1, k * 1.5), drop: (1 - ss(seg(t, p.t, p.t + .2))) * 50 }; }), ...extra];
const SHOT = {
  arrive(c, t) {   // a small hotel in a city tourists love: the night street, then in through the door: guest after guest asks at the desk the same thing: where can we go that the tourists don't?
    const into = ss(seg(t, HIT.into - .2, HIT.into + .35)), glide = ss(seg(t, 0, HIT.into + .2));
    const front = lerpBox([0, 780, 1080, 1860], [80, 880, 1000, 1820], glide), z = Math.min(980 / (front[2] - front[0]), 1100 / (front[3] - front[1])), wx = 540 + (410 - (front[0] + front[2]) / 2) * z, wy = 1310 + (1595 - (front[1] + front[3]) / 2) * z;
    if (into < 1) stage(c, front, 0, () => { street(c, t); hotelHouse(c, 200, 1000, 680, 700, { door: 410, map: true, doorGlow: glide });
      [[0, 140, 330, 'hat'], [1, 940, 760]].forEach(([i, a, b], j) => { const [x, walk, phi] = walkX(t, 0, 1.6, a, b); mascot(c, cust(6 + j, { x, y: 1810, s: 1.5, f: b > a ? .6 : -.6, walk, phi, smile: 1 })); }); });
    if (into > 0) { c.save(); c.beginPath(); c.arc(wx, wy, 1500 * into, 0, 7); c.clip();
      stage(c, [0, 780, 1080, 1800], seg(t, 2.4, 7.82), () => { lobby(c, t);
        const think = ss(seg(t, 7.05, 7.66)); mascot(c, OWNER({ x: 760, y: 1690, f: -.45, blink: blinkAt(t, 1), look: -.2, smile: lerp(.8, .4, think), chin: think > .5 ? 'R' : undefined })); desk(c, 740, 1500);
        const q = ss(seg(t, HIT.quote - .15, HIT.quote + .2));
        [500, 300, 100].forEach((x, i) => { const k = E(t, HIT.guests[i], .3, .5); if (k <= 0) return; c.save(); c.globalAlpha = Math.min(1, k * 2); mascot(c, cust(i, { x, y: 1790, s: 1.6, f: .45, blink: blinkAt(t, 3 + i), smile: .5, squash: wob(t, HIT.asks[i], .3, 16, .04) })); c.restore();
          const b = E(t, HIT.asks[i], .3, .5) * (1 - q); if (b > 0) bubble(c, x, 1250, 128, 106, b, x + 10, 1385, () => text(c, '?', x, 1253, 76, NAVY)); });
        const bq = E(t, HIT.quote, .35, .45); if (bq > 0) bubble(c, 300, 1100, 470, 210, bq, 300, 1360, () => { pinMark(c, 150, 1150, 30); text(c, '?', 215, 1100, 84, NAVY);
          [[330, 0], [395, 1], [460, 2]].forEach(([hx, i]) => { ell(c, hx, 1080, 26, 26, '#2f4bb0'); c.fillStyle = '#2f4bb0'; c.beginPath(); c.roundRect(hx - 24, 1108, 48, 48, 14); c.fill(); c.fillStyle = '#3a3f55'; c.fillRect(hx - 14, 1118, 28, 18); ell(c, hx, 1127, 6, 6, '#8fb0ff'); });
          cross(c, 395, 1115, 74, ss(seg(t, HIT.nope - .1, HIT.nope + .35))); }); }); c.restore();
      if (into < 1) { c.save(); c.strokeStyle = GOLD; c.globalAlpha = 1 - into; c.lineWidth = 10; c.beginPath(); c.arc(wx, wy, 1500 * into, 0, 7); c.stroke(); c.restore(); } }
  },
  list(c, t) {   // instead of putting together another list of famous sights: the list unrolls, full of them; he rolls it up, tosses it: something quite different
    const un = ss(seg(t, HIT.unroll, HIT.unroll + .9)) * (1 - ss(seg(t, HIT.toss - .25, HIT.toss))), fly = seg(t, HIT.toss, HIT.toss + .5), sp2 = E(t, HIT.spark, .3, .5);
    bg(c);
    stage(c, [80, 880, 1000, 1800], seg(t, 7.82, 15.31), () => {
      const P = OWNER({ x: 330, y: 1790, s: 2.3, f: .3, blink: blinkAt(t, 1), smile: t > HIT.toss ? 1 : .6, look: t < HIT.toss ? .2 : 0, handR: t < HIT.toss + .05 ? [470, 1400] : reach([470, 1400], [470, 1280], ss(seg(t, HIT.toss, HIT.toss + .25))) });
      mascot(c, P);
      if (t < HIT.toss + .02) scaled(c, 650, 1400, 1.3, () => { const L = 320 * un; c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(530, 1410, 260, L); c.fillStyle = '#fff8e6'; c.fillRect(520, 1400, 260, L);
        c.save(); c.beginPath(); c.rect(520, 1400, 260, L); c.clip();
        ['tower', 'dome', 'bridge', 'wheel'].forEach((kd, i) => { const ry = 1460 + i * 72, k = E(t, HIT.icons[Math.min(2, i)] + i * .06, .3, .5); scaled(c, 570, ry, Math.min(1, k), () => landmark(c, kd, 570, ry + 22, .2, NAVY)); c.fillStyle = 'rgba(28,36,80,.35)'; c.fillRect(620, ry - 12, 120 * Math.min(1, k), 10); for (let s2 = 0; s2 < 3; s2++) star(c, 630 + s2 * 22, ry + 12, 8, Math.min(1, k)); });
        c.restore(); c.fillStyle = '#6e4a2c'; c.beginPath(); c.roundRect(506, 1386, 288, 28, 14); c.fill(); if (un > .05) { c.beginPath(); c.roundRect(506, 1386 + L, 288, 26, 13); c.fill(); } });
      if (fly > 0 && fly < 1) { const bx = lerp(540, 860, fly), by = lerp(1400, 1060, fly) - Math.sin(fly * Math.PI) * 140; ell(c, bx, by, 40, 36, '#fff8e6'); c.strokeStyle = 'rgba(28,36,80,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 22, by - 8); c.lineTo(bx + 10, by + 12); c.moveTo(bx - 8, by - 24); c.lineTo(bx + 18, by - 6); c.stroke(); }
      poof(c, 860, 1060, seg(t, HIT.toss + .5, HIT.toss + 1.0), 70);
      if (sp2 > 0) { glow(c, 520, 1140, 160, .4 * Math.min(1, sp2)); star(c, 520, 1140, 40, sp2); for (let k = 0; k < 3; k++) star(c, 520 + [-90, 80, 30][k], 1140 + [40, 50, -80][k], 14, Math.max(0, Math.sin(clamp((t - HIT.spark - k * .08) / .8) * Math.PI))); } });
  },
  mapup(c, t) {   // he hung a huge map in the lobby; but not one famous sight on it: their ghosts float onto the map and puff away
    const u = ss(seg(t, HIT.map, HIT.map + .8));
    stage(c, [20, 780, 1060, 1800], 0, () => { lobby(c, t);
      bigMap(c, MAP, u, { draw: [() => { [['tower', 340, 1200], ['dome', 560, 1150], ['bridge', 740, 1300]].forEach(([kd, x, y], i) => { const k = E(t, HIT.ghosts + i * .08, .3, .5), pf = seg(t, HIT.poofs[i], HIT.poofs[i] + .4); if (k <= 0) return; if (pf < .2) { c.save(); c.globalAlpha = .6 * (1 - pf * 5); scaled(c, x, y, Math.min(1, k), () => landmark(c, kd, x, y, .5, GOLD2)); c.restore(); } poof(c, x, y - 50, pf, 60); }); }] });
      const tack = HIT.tacks.filter(x => t > x).length;
      for (const [i, px, py] of [[0, 220, 930], [1, 860, 930]]) if (tack > i) ell(c, px, py, 12, 12, '#c4566a');
      mascot(c, OWNER({ x: 950, y: 1780, s: 1.8, f: -.4, blink: blinkAt(t, 1), smile: 1, handL: t > HIT.tacks[0] - .3 && t < HIT.tacks[1] + .4 ? [860, 1450] : undefined })); });
  },
  pin(c, t) {   // every guest, before leaving, could mark their favourite place and write a short recommendation for the next guest
    const [x, walk, phi] = walkX(t, HIT.enter, HIT.enter + .8, 200, 420), lv = seg(t, ...HIT.leave), drop = E(t, HIT.drop, .3, .45), wr = seg(t, ...HIT.write), hr = E(t, HIT.heart, .3, .5);
    stage(c, [120, 880, 960, 1800], 0, () => { lobby(c, t);
      bigMap(c, MAP, 1, { pins: [{ ...MYPIN, k: drop, drop: (1 - ss(seg(t, HIT.drop, HIT.drop + .2))) * 60 }], draw: [() => { if (t > HIT.write[0] - .1) noteCard(c, 660, 1340, 150, E(t, HIT.write[0] - .1, .3, .5), 'heart', wr >= 1 && hr > 0 ? 1 : wr * .99, .06); if (hr > 0) heart(c, 705, 1345, 18, 0); }] });
      const out = lv > 0, gx = out ? lerp(420, 210, ss(lv)) : x, al = out ? 1 - ss(seg(lv, .6, 1)) : Math.min(1, (t - HIT.enter + .1) / .3);
      const reachK = ss(seg(t, HIT.drop - .4, HIT.drop - .1)) * (1 - ss(seg(t, HIT.write[1], HIT.write[1] + .3))), writeK = ss(seg(t, HIT.write[0] - .3, HIT.write[0]));
      c.save(); c.globalAlpha = clamp(al); suitcase(c, gx - 80, 1795, 1, '#c4566a');
      const P = cust(2, { x: gx, y: 1790, f: out ? -.6 : .35, walk: out ? (lv < 1 ? 1 : 0) : walk, phi: out ? lv * 6 : phi, smile: 1, blink: blinkAt(t, 9) });
      if (!out && reachK > 0) P.handR = reach([480, 1650], [540, 1430], reachK); if (!out && writeK > 0 && t < HIT.write[1] + .2) P.handR = [560 + Math.sin(t * 18) * 8, 1440];
      P.handL = [gx - 72, 1650]; mascot(c, P); c.restore(); });
  },
  fill(c, t) {   // within a few months the map was full of places even some locals didn't know: pins rain onto it, the wall clock spins; a local stops, amazed
    const [lx, walk, phi] = walkX(t, HIT.local - .6, HIT.local + .2, 1060, 930), wow = E(t, HIT.wow, .3, .5);
    stage(c, [20, 780, 1060, 1800], 0, () => { lobby(c, t); clockFace(c, 960, 1040, 62, 9 + (t - 29.86) * 9);
      bigMap(c, MAP, 1, { pins: pinsAt(t) });
      if (t > HIT.local - .6) { const P = cust(4, { x: lx, y: 1790, s: 1.9, f: -.5, walk, phi, smile: wow > .3 ? 0 : .6, o: wow > .3 ? 1 : 0, look: -.3, blink: blinkAt(t, 4) }); c.save(); c.globalAlpha = clamp((t - HIT.local + .6) / .3); mascot(c, P); c.restore(); if (wow > 0) badge(c, 'ex', 1000, 1250, 34, wow); } });
  },
  buzz(c, t) {   // then something interesting happened: the new guests came down to the lobby just to see the map: the lift opens, they gather round it
    const bang = E(t, HIT.bang, .3, .5), op = ss(seg(t, HIT.lift, HIT.lift + .5)) * (1 - ss(seg(t, 41.85, 42.6)));
    stage(c, [0, 780, 1080, 1800], 0, () => { lobby(c, t);
      const R2 = { x: 80, y: 930, w: 560, h: 440 }; bigMap(c, R2, 1, { pins: pinsAt(99), pr: 11, glow: Math.max(Math.min(1, bang) * Math.max(0, 1 - (t - HIT.bang) / 1.4), ss(seg(t, HIT.glow2 - .3, HIT.glow2 + .3))) });
      if (bang > 0) { badge(c, 'ex', 640, 920, 44, bang * (1 - ss(seg(t, 37.67, 38.1)))); for (let k = 0; k < 4; k++) star(c, [90, 640, 90, 640][k], [940, 1060, 1360, 1360][k], 16, Math.max(0, Math.sin(clamp((t - HIT.bang - k * .1) / .9) * Math.PI))); }
      c.fillStyle = GOLD2; c.fillRect(740, 1120, 280, 520); c.fillStyle = '#f0d9a8'; c.fillRect(756, 1136, 248, 504); glow(c, 880, 1400, 200, .3 * op);
      c.fillStyle = '#3a3f6a'; c.fillRect(756, 1136, 124 * (1 - op), 504); c.fillRect(880 + 124 * op, 1136, 124 * (1 - op), 504); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(876, 1136, 8, 504 * (1 - op));
      ell(c, 880, 1080, 26, 26, GOLD); c.fillStyle = NAVY; c.beginPath(); c.moveTo(868, 1088); c.lineTo(880, 1068); c.lineTo(892, 1088); c.fill(); if (t > HIT.lift) badge(c, 'bell', 1000, 1050, 30, E(t, HIT.lift, .3, .5) * (1 - ss(seg(t, 39.78, 40.21))));
      [[150, 3], [360, 5], [570, 7]].forEach(([tx, who], i) => { const a = HIT.walkers[i], u = seg(t, a, a + 1.4); if (u <= 0) return; const x = lerp(880, tx, ss(u)), arrived = u >= 1, al = Math.min(1, u * 5);
        c.save(); c.globalAlpha = al; mascot(c, cust(who, { x, y: 1790, s: 1.75, f: arrived ? 0 : -.6, back: arrived ? 1 : 0, walk: arrived ? 0 : 1, phi: u * 9, smile: 1, blink: blinkAt(t, who) })); c.restore(); }); });
  },
  neighbour(c, t) {   // even travellers staying at another hotel came in, just to see the map
    const [x, walk, phi] = walkX(t, ...HIT.walk, 265, 640), al = clamp((t - HIT.exit) / .3) * (1 - ss(seg(t, HIT.enter2, HIT.enter2 + .3))), look = E(t, HIT.look, .3, .5);
    stage(c, [0, 780, 1080, 1860], 0, () => { street(c, t);
      hotelHouse(c, 30, 990, 470, 710, { col: '#b9bccb', trim: '#6b6f86', signBg: '#6b6f86', signCol: CREAM, door: 265, awning: '#6b6f86', seed: 4, lit: .3, doorOpen: ss(seg(t, HIT.exit - .4, HIT.exit - .1)) * (1 - ss(seg(t, HIT.exit + .4, HIT.exit + .75))) });
      hotelHouse(c, 530, 990, 520, 710, { door: 640, map: true, mapGlow: Math.min(1, look), doorGlow: Math.max(Math.sin(clamp((t - HIT.enter2 + .2) / .8) * Math.PI), 0), doorOpen: ss(seg(t, HIT.enter2 - .55, HIT.enter2 - .25)) * (1 - ss(seg(t, HIT.enter2 + .35, HIT.enter2 + .7))) });
      if (look > 0) for (let k = 0; k < 3; k++) star(c, 880 + [-60, 50, 0][k], 1470 + [0, 10, -40][k], 12, Math.max(0, Math.sin(clamp((t - HIT.look - k * .1) / .9) * Math.PI)));
      if (al > 0) { c.save(); c.globalAlpha = al; mascot(c, cust(5, { x, y: 1800, s: 1.6, f: .6, walk, phi, smile: 1, blink: blinkAt(t, 5) })); c.restore(); } });
  },
  bar(c, t) {   // and meanwhile they ordered something at the hotel bar
    const sl = ss(seg(t, HIT.slide, HIT.take)), tk = t > HIT.take, coin = E(t, HIT.clink, .3, .5);
    stage(c, [40, 860, 1040, 1800], 0, () => { c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
      bigMap(c, { x: 100, y: 1020, w: 240, h: 180 }, 1, { pins: pinsAt(99).slice(0, 14), pr: 5, glow: .5 });
      c.fillStyle = WOOD; for (const sy of [1100, 1240]) c.fillRect(440, sy, 560, 14);
      for (let i = 0; i < 9; i++) { const bx = 470 + (i % 5) * 110 + (i > 4 ? 55 : 0), by = i > 4 ? 1240 : 1100, col = ['#c4566a', '#5d7fc4', GOLD2, '#8fb3a6', '#e9dcc0'][i % 5]; c.fillStyle = col; c.beginPath(); c.roundRect(bx - 16, by - 80, 32, 80, 8); c.fill(); c.fillRect(bx - 6, by - 108, 12, 30); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(bx - 10, by - 70, 6, 50); }
      mascot(c, OWNER({ x: 700, y: 1700, f: -.4, blink: blinkAt(t, 1), smile: 1, handL: t < HIT.take + .1 ? reach([640, 1560], [620, 1490], ss(seg(t, HIT.slide - .3, HIT.slide))) : undefined }));
      c.fillStyle = '#6e4a2c'; c.fillRect(120, 1520, 880, 270); c.fillStyle = WOOD; c.fillRect(100, 1496, 920, 30); c.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 5; k++) c.fillRect(200 + k * 180, 1560, 8, 210);
      const P = cust(5, { x: 300, y: 1790, f: .5, smile: 1, blink: blinkAt(t, 5) }); if (tk) P.handR = [455, 1540]; mascot(c, P);
      const gx = tk ? 470 : lerp(620, 470, sl), gy = tk ? 1560 : 1496; c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(gx - 34, gy - 86); c.lineTo(gx + 34, gy - 86); c.lineTo(gx, gy - 44); c.closePath(); c.fill(); c.fillStyle = '#e8664f'; c.beginPath(); c.moveTo(gx - 26, gy - 80); c.lineTo(gx + 26, gy - 80); c.lineTo(gx, gy - 50); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(gx - 3, gy - 46, 6, 40); ell(c, gx, gy - 4, 20, 5, 'rgba(255,255,255,.75)'); ell(c, gx + 24, gy - 86, 10, 10, GOLD);
      if (coin > 0) { const cy = 1470 - 50 * Math.min(1, coin); ell(c, 560, cy, 18, 18, GOLD); ell(c, 560, cy, 12, 12, GOLD2); star(c, 600, cy - 30, 12, Math.max(0, Math.sin(clamp((t - HIT.clink) / .7) * Math.PI))); } });
  },
  magnet(c, t) {   // the map that was only meant to help guests know the city drew in new visitors all by itself: a route walks from pin to pin; then people come in from both sides and gold rings pulse out from it
    const R3 = { x: 150, y: 900, w: 780, h: 560 }, path = seg(t, ...HIT.path), pull = E(t, HIT.pull, .3, .5), route = [3, 9, 1, 14, 6, 20], pins = pinsAt(99);
    stage(c, [40, 800, 1040, 1800], 0, () => { lobby(c, t);
      for (let k = 0; k < 3; k++) { const w = ((t - HIT.pull) * .9 + k / 3) % 1; if (t > HIT.pull - .1) { c.save(); c.strokeStyle = GOLD; c.globalAlpha = .45 * (1 - w) * Math.min(1, pull); c.lineWidth = 6; c.beginPath(); c.roundRect(R3.x - 30 - w * 90, R3.y - 30 - w * 70, R3.w + 60 + w * 180, R3.h + 60 + w * 140, 30); c.stroke(); c.restore(); } }
      bigMap(c, R3, 1, { pins, pr: 14, glow: .4 * Math.min(1, pull), draw: [() => { if (path <= 0) return; const pts = route.map(i => [R3.x + PINS[i].u * R3.w, R3.y + PINS[i].v * R3.h]), n = (pts.length - 1) * path; c.save(); c.strokeStyle = GOLD2; c.lineWidth = 7; c.setLineDash([16, 14]); c.lineCap = 'round'; c.beginPath(); c.moveTo(...pts[0]); for (let i = 1; i <= Math.ceil(n); i++) { const f = Math.min(1, n - (i - 1)); c.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); } c.stroke(); c.restore();
        const i0 = Math.min(pts.length - 2, Math.floor(n)), f0 = n - i0; if (path < 1) face(c, lerp(pts[i0][0], pts[i0 + 1][0], f0), lerp(pts[i0][1], pts[i0 + 1][1], f0) - 40, 30, 2); }] });
      [[120, 300, 0], [-1, 0, 0], [980, 780, 1], [-1, 0, 1]].forEach(([a, b, i], j) => { if (a < 0) return; const st = HIT.arrive[i]; const [x, walk, phi] = walkX(t, st, st + 1.0, a, b); if (t < st) return; c.save(); c.globalAlpha = clamp((t - st) / .3); mascot(c, cust([1, 6][i], { x, y: 1790, s: 1.7, f: a < b ? .5 : -.5, walk, phi, smile: 1, blink: blinkAt(t, i + 2) })); c.restore(); }); });
  },
  trust(c, t) {   // we trust people like us more than a business's advert: a balance: a fellow guest's note on one side, an advert on the other; the note wins
    const nt = E(t, HIT.note, .3, .5), lk = HIT.like.map(x => E(t, x, .3, .5)), ad = E(t, HIT.ad, .3, .5), tip = ss(seg(t, HIT.tip - .2, HIT.tip + .5));
    const a = .16 * Math.min(1, nt) + .1 * tip + wob(t, HIT.ad + .2, .3, 12, .025) + wob(t, HIT.tip + .5, .3, 12, .03), L = 320, py = 1060;
    bg(c);
    stage(c, [40, 860, 1040, 1780], 0, () => {
      c.fillStyle = WOOD; c.beginPath(); c.moveTo(440, 1720); c.lineTo(640, 1720); c.lineTo(590, 1660); c.lineTo(490, 1660); c.closePath(); c.fill(); c.fillRect(526, py, 28, 620);
      const ends = [-1, 1].map(d => [540 + d * L * Math.cos(a), py - d * L * Math.sin(a)]);
      c.strokeStyle = GOLD2; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(...ends[0]); c.lineTo(...ends[1]); c.stroke(); ell(c, 540, py, 26, 26, GOLD);
      ends.forEach(([ex, ey], s2) => { const dy = ey + 250; c.strokeStyle = 'rgba(246,239,220,.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(ex - 130, dy); c.lineTo(ex, ey); c.lineTo(ex + 130, dy); c.stroke();
        if (s2 === 0) { face(c, ex - 98, dy - 46, 40, 0, lk[0]); face(c, ex + 98, dy - 46, 40, 3, lk[1]); noteCard(c, ex, dy - 66, 130, nt, 'heart', 1, -.05); if (lk[2] > 0) check(c, ex, dy - 190, 34, lk[2]); }
        else if (ad > 0) { c.save(); c.globalAlpha = 1 - .45 * tip; scaled(c, ex, dy - 6, Math.min(1, ad), () => { c.fillStyle = '#c4566a'; c.beginPath(); c.roundRect(ex - 110, dy - 150, 220, 136, 14); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(ex - 98, dy - 138, 196, 112, 10); c.fill(); c.save(); c.font = '700 40px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c4566a'; c.fillText('AKCIÓ!', ex, dy - 100); c.restore(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(ex - 60, dy - 62); c.lineTo(ex - 30, dy - 70); c.lineTo(ex - 30, dy - 38); c.lineTo(ex - 60, dy - 46); c.closePath(); c.fill(); c.beginPath(); c.moveTo(ex - 30, dy - 70); c.lineTo(ex + 20, dy - 86); c.lineTo(ex + 20, dy - 22); c.lineTo(ex - 30, dy - 38); c.fill(); for (let k = 0; k < 3; k++) { c.strokeStyle = NAVY; c.lineWidth = 4; c.beginPath(); c.arc(ex + 26, dy - 54, 18 + k * 14, -.6, .6); c.stroke(); } }); c.restore(); }
        c.fillStyle = GOLD2; c.beginPath(); c.ellipse(ex, dy, 150, 26, 0, 0, Math.PI); c.fill(); ell(c, ex, dy, 150, 12, GOLD); }); });
  },
  smart(c, t) {   // but the owner did something smarter still: he got his past guests to bring in new ones: past guests' faces, gold threads, new guests' faces
    const wink = t > HIT.wink && t < HIT.wink + .35, st = E(t, HIT.star, .3, .5), gest = ss(seg(t, 73.94, 74.84));
    bg(c);
    stage(c, [60, 860, 1020, 1780], 0, () => {
      mascot(c, OWNER({ x: 290, y: 1770, s: 2.2, f: .35, smile: 1, blink: wink ? 1 : blinkAt(t, 1), handR: gest > 0 ? reach([360, 1620], [470, 1440], gest) : undefined }));
      if (st > 0) { glow(c, 420, 1150, 120, .4 * Math.min(1, st)); star(c, 420, 1150, 34, st); }
      [1000, 1200, 1400].forEach((y, i) => { const o = E(t, HIT.olds[i], .3, .5), n = E(t, HIT.news[i], .3, .5), ar = ss(seg(t, HIT.arcs[i], HIT.arcs[i] + .5));
        if (ar > 0) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 6; c.setLineDash([14, 12]); c.lineCap = 'round'; c.beginPath(); const x0 = 670, x1 = 670 + 200 * ar; c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y - 70 * ar, x1, y); c.stroke(); c.restore(); if (ar < 1) heart(c, x0 + 200 * ar, y - 36 * Math.sin(ar * Math.PI), 14, 1); }
        face(c, 610, y, 58, [0, 2, 3][i], o); if (o > 0) pinMark(c, 655, y - 30, 14, Math.min(1, o));
        face(c, 930, y, 58, [5, 6, 7][i], n); }); });
  },
  ending(c, t) {   // so the guests no longer just used the hotel: the door opens for each guest coming and going; without noticing, they became part of something: one by one their faces rise from the lobby window into the sky and link up, a constellation above the hotel; it draws new people in
    const rise = HIT.rise, part = ss(seg(t, HIT.part - .3, HIT.part + .6)), gl = ss(seg(t, HIT.glow - .3, HIT.glow + .5));
    const W = [[HIT.inout[0], 390, 130, 1, 'out'], [HIT.inout[1], 960, 405, 2, 'in'], [HIT.inout[2], 110, 375, 3, 'in'], [HIT.come[0], 60, 375, 4, 'in'], [HIT.come[1], 1020, 660, 5, 'stop']], WD = 1.2;
    let dop = 0; for (const [st, , , , kind] of W) { if (kind === 'out') dop = Math.max(dop, ss(seg(t, st - .4, st - .1)) * (1 - ss(seg(t, st + .4, st + .75)))); if (kind === 'in') dop = Math.max(dop, ss(seg(t, st + WD - .55, st + WD - .25)) * (1 - ss(seg(t, st + WD + .15, st + WD + .5)))); }
    const SP = [[140, 900], [285, 820], [430, 880], [580, 805], [735, 875], [880, 815], [960, 935]], arrive = SP.map((p, i) => rise[0] + i * (rise[1] - rise[0]) / SP.length + .9);
    stage(c, [0, 780, 1080, 1860], 0, () => { street(c, t);
      c.save(); c.strokeStyle = GOLD; c.lineWidth = 5; c.lineCap = 'round'; for (let i = 1; i < SP.length; i++) { const f = ss(seg(t, arrive[i] - .05, arrive[i] + .35)); if (f <= 0) continue; c.globalAlpha = .8; c.beginPath(); c.moveTo(...SP[i - 1]); c.lineTo(lerp(SP[i - 1][0], SP[i][0], f), lerp(SP[i - 1][1], SP[i][1], f)); c.stroke(); }
      if (part > 0) { c.globalAlpha = .8 * part; c.setLineDash([10, 12]); c.beginPath(); c.moveTo(580, 805); c.lineTo(580, lerp(805, 1020, part)); c.stroke(); } c.restore();
      hotelHouse(c, 260, 1050, 560, 650, { door: 390, map: true, mapGlow: Math.max(gl, .4), doorGlow: Math.max(gl, .3), doorOpen: dop });
      SP.forEach(([x, y], i) => { const a = arrive[i] - .9, u = ss(seg(t, a, a + .9)); if (u <= 0) return; const fx = lerp(645, x, u), fy = lerp(1585, y, u) - Math.sin(u * Math.PI) * 60;
        if (u < 1) { c.save(); c.strokeStyle = 'rgba(236,189,74,.35)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); const u0 = Math.max(0, u - .25); c.moveTo(lerp(645, x, u0), lerp(1585, y, u0) - Math.sin(u0 * Math.PI) * 60); c.lineTo(fx, fy); c.stroke(); c.restore(); }
        const tw = .3 + .15 * Math.sin(t * 3 + i) + .3 * part + .2 * gl; glow(c, fx, fy, 80, tw * Math.min(1, u * 2)); face(c, fx, fy, 38, i, Math.min(1, .5 + u)); });
      W.forEach(([st, a, b, who, kind]) => { const u = seg(t, st, st + WD); if (u <= 0 || (u >= 1 && kind !== 'stop')) return; const al = kind === 'out' ? Math.min(clamp(u / .25), clamp((1 - u) / .2)) : kind === 'in' ? Math.min(clamp(u / .2), clamp((1 - u) / .15)) : clamp(u / .2);
        c.save(); c.globalAlpha = al; mascot(c, cust(who, { x: lerp(a, b, ss(u)), y: 1810, s: 1.5, f: u >= 1 ? -.2 : b > a ? .6 : -.6, walk: u < 1 ? 1 : 0, phi: u * 8, smile: 1, look: u >= 1 ? -.4 : 0, blink: blinkAt(t, who) })); c.restore(); });
      if (gl > 0) glow(c, 390, 1600, 260, .4 * gl); });
  },
};

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['ugyanazt','Hová','turisták','egészen','hatalmas','térképet','egyetlen','kedvenc','ajánlást','lakója','érdekes','kifejezetten','másik','bárjában','önmagában','megbízunk','hasonlóak','reklámjában','okosabb','korábbi','részévé','odavonzott']);
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
for (let k = 0; k < 5; k++) EV.push({ t: +(HIT.walk[0] + k * (HIT.walk[1] - HIT.walk[0]) / 5).toFixed(3), type: 'step', pan: lerp(-.5, -.1, k / 5) });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
