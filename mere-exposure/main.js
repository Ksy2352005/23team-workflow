// Seen Again: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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
const TOP = '#eef1f4', NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#0b1438';
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

// —— motion helpers: one stage, bold single visuals handing over to each other ——
function KF(t, keys) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i]; if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, ss((t - t0) / Math.max(1e-6, t1 - t0))); } } return keys[keys.length - 1][1]; }
const life = (t, a, b, fi = .35, fo = .3) => Math.min(ss(seg(t, a, a + fi)), 1 - ss(seg(t, b - fo, b)));   // 0..1: in from a, out by b
function enter(c, x, y, k, kind, f) {   // a section comes in and goes out with a bold, eased move
  if (k <= 0) return; c.save(); c.globalAlpha *= Math.min(1, k * 1.4); c.translate(x, y);
  if (kind === 'up') c.translate(0, (1 - k) * 160); if (kind === 'left') c.translate((1 - k) * -260, 0); if (kind === 'right') c.translate((1 - k) * 260, 0);
  const sc = kind === 'pop' ? lerp(.6, 1, k) : kind === 'zoom' ? lerp(1.5, 1, k) : 1; c.scale(sc, sc); c.translate(-x, -y); f(); c.restore();
}
function badge(c, kind, x, y, r, k = 1) {
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); const g = r * .55;
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, NAVY); if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (typeof kind === 'number') { c.save(); c.font = `700 ${g * 1.6}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(String(kind), x, y + g * .08); c.restore(); } });
}
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
// —— the brand: MIRA, a gold wave in a circle ——
function logo(c, x, y, r, o = {}) {   // o.grey 0..1 (unknown: grey, blurred), o.name 0..1 (the name underneath)
  const gr = o.grey || 0; c.save(); if (gr > 0) c.filter = `grayscale(${gr}) blur(${gr * r * .08 * K}px)`;
  ell(c, x + r * .05, y + r * .08, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, GOLD); ell(c, x, y, r * .86, r * .86, '#f2c95e');
  c.strokeStyle = CREAM; c.lineWidth = r * .14; c.lineCap = 'round'; for (const d of [-.32, .02, .36]) { c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(x - r * .55 + u * r * 1.1, y + d * r + Math.sin(u * Math.PI * 2) * r * .12); } c.stroke(); }
  c.restore();
  if (o.name > 0) { c.save(); c.globalAlpha *= Math.min(1, o.name); c.font = `700 ${r * .62}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = CREAM; c.fillText('MIRA', x, y + r * 1.5 + (1 - Math.min(1, o.name)) * 30); c.restore(); }
}
function ring(c, x, y, r, p, w = 14) { c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(246,239,220,.15)'; c.lineWidth = w; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); if (p > 0) { c.strokeStyle = GOLD; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke(); } c.restore(); }
function eyeIcon(c, x, y, s, open = 1, inner) { c.save(); c.fillStyle = CREAM; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); if (open > .2) { c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.clip(); ell(c, x, y, 40 * s, 40 * s, NAVY); inner && inner(); } c.restore(); }
function bell(c, x, y, s, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = GOLD; c.beginPath(); c.moveTo(-26 * s, 18 * s); c.quadraticCurveTo(-24 * s, -30 * s, 0, -32 * s); c.quadraticCurveTo(24 * s, -30 * s, 26 * s, 18 * s); c.closePath(); c.fill(); c.fillRect(-32 * s, 14 * s, 64 * s, 8 * s); ell(c, 0, 26 * s, 7 * s, 7 * s, GOLD2); ell(c, 0, -34 * s, 5 * s, 5 * s, GOLD2); c.restore(); }
function bottle(c, x, y, s) { c.fillStyle = '#5d7fc4'; c.beginPath(); c.roundRect(x - 34 * s, y - 150 * s, 68 * s, 150 * s, 18 * s); c.fill(); c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(x - 22 * s, y - 182 * s, 44 * s, 36 * s, 8 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 24 * s, y - 136 * s, 10 * s, 110 * s); }
function cart(c, x, y, s, shake = 0) { c.save(); c.translate(x + Math.sin(shake * 40) * 8 * shake, y); c.strokeStyle = CREAM; c.lineWidth = 10 * s; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-90 * s, -70 * s); c.lineTo(-62 * s, -70 * s); c.lineTo(-40 * s, 30 * s); c.lineTo(60 * s, 30 * s); c.lineTo(80 * s, -40 * s); c.lineTo(-52 * s, -40 * s); c.stroke(); ell(c, -30 * s, 56 * s, 13 * s, 13 * s, CREAM); ell(c, 50 * s, 56 * s, 13 * s, 13 * s, CREAM); c.restore(); }
// a feed post in the phone; brand posts carry the logo
function post(c, x, y, w, i, brand, t, o = {}) {
  const h = w * 1.18; c.fillStyle = '#fbf6ea'; c.beginPath(); c.roundRect(x - w / 2, y, w, h, 16); c.fill();
  ell(c, x - w / 2 + 34, y + 32, 18, 18, brand ? GOLD : ['#8f98b0', '#c4566a', '#7fbf8a', '#5d7fc4'][i % 4]); c.fillStyle = 'rgba(28,36,80,.35)'; c.fillRect(x - w / 2 + 62, y + 24, brand ? 70 : 90 + (i % 3) * 20, 14);
  c.fillStyle = brand ? '#1f2c62' : ['#d9ccab', '#c9d6b0', '#e6c3b8', '#b8c6e6'][i % 4]; c.fillRect(x - w / 2 + 14, y + 62, w - 28, w - 28);
  if (brand) logo(c, x, y + 62 + (w - 28) / 2, w * .24, { grey: o.grey || 0 }); else { ell(c, x - w * .1, y + 62 + w * .3, w * .14, w * .14, 'rgba(255,255,255,.5)'); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x - w / 2 + 14, y + 62 + w - 28); c.lineTo(x, y + 62 + w * .4); c.lineTo(x + w / 2 - 14, y + 62 + w - 28); c.fill(); }
  heart(c, x - w / 2 + 34, y + h - 30, 12, 1, brand ? '#c4566a' : 'rgba(28,36,80,.4)');
}
function phone(c, x, y, w, h, f) { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 12, y - h / 2 + 16, w, h, 56); c.fill(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 56); c.fill(); c.fillStyle = '#efe6d2'; c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 42); c.fill(); c.save(); c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 42); c.clip(); f(); c.restore(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - 60, y - h / 2 + 26, 120, 26, 13); c.fill(); }
function face(c, x, y, r, P, k = 1) { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => { ell(c, x + 4, y + 6, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); c.save(); c.beginPath(); c.arc(x, y, r * .82, 0, 7); c.clip(); drawMascot(c, { ...P, x, y: y + r * 1.7, s: r / 66, f: 0, shadow: false }); c.restore(); }); }
const AUD = [['blue2', 'bob'], ['blue1', null], ['blue3', 'pony'], ['blue2', null], ['blue3', 'long']];
const ME = o => ({ id: 'me', skin: 'blue3', fem: 'pony', s: 1.7, smile: .8, ...o });

// —— the light world (after the 23 Team reference film): a soft light room, teal bokeh at three depths, a thin teal line the camera travels along; glossy soft-3D objects in the centre, each one transforming into the next ——
const BG = '#eef1f4', TEAL = '#3ed6c4', TEAL2 = '#1fb3a3', TEALD = '#128a7e', INK = '#14215e', BLU = '#3b6fe0', BLU2 = '#2a4fbf', CORAL = '#ef6b5b';
const HX = 540, HY = 1250, MOVE = .6;
const ANCH = [[0, 0], [620, 900], [-60, 1800], [580, 2700], [0, 3600], [600, 4500], [40, 5400], [560, 6300]];
const SCN = () => { const H = HIT; return [-9, H.unk - .3, H.need - .3, H.mind - .3, H.term - .3, H.chart - .3, H.regular - .3, H.audience - .3]; };
function camAt(t) { const s = SCN(); let i = 0; while (i + 1 < s.length && t >= s[i + 1]) i++; const p = i > 0 ? ss(clamp((t - s[i]) / MOVE)) : 1, A = ANCH[Math.max(0, i - 1)], B = ANCH[i], drift = [Math.sin(t * .5) * 18, Math.cos(t * .4) * 14 + (t - Math.max(0, s[i])) * 6];
  return { x: lerp(A[0], B[0], p) + drift[0], y: lerp(A[1], B[1], p) + drift[1], i, p, moving: i > 0 && p < 1 }; }
const W2S = (cam, x, y, par = 1) => [HX + (x - cam.x) * par, HY + (y - cam.y) * par];
function lineWorld() { const pts = []; ANCH.forEach(([x, y], i) => { const side = i % 2 ? -1 : 1; pts.push([x + side * 330, y - 380], [x + side * 290, y + 420]); }); return pts; }
function world(c, t, cam) {   // the light room, the bokeh, the travelling line with its nodes
  c.fillStyle = BG; c.fillRect(0, 0, 1080, 1920); const g = c.createRadialGradient(540, 1250, 60, 540, 1250, 900); g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 700, 1080, 1220);
  for (const [n, par, r0, al] of [[16, .35, 110, .07], [12, .7, 70, .09]]) for (let i = 0; i < n; i++) { const wx = hash(i * 2.7 + par) * 2600 - 700, wy = hash(i * 5.3 + par) * 7600 - 400, [sx, sy] = W2S(cam, wx, wy, par), r = r0 * (.6 + hash(i) * .8); if (sy < 600 || sy > 2100) continue; const gg = c.createRadialGradient(sx, sy, 0, sx, sy, r); gg.addColorStop(0, `rgba(62,214,196,${al})`); gg.addColorStop(1, 'rgba(62,214,196,0)'); c.fillStyle = gg; c.fillRect(sx - r, sy - r, 2 * r, 2 * r); }
  const P = lineWorld().map(([x, y]) => W2S(cam, x, y)); c.save(); c.strokeStyle = 'rgba(31,179,163,.75)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(...P[0]);
  for (let i = 1; i < P.length - 1; i++) { const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2; c.quadraticCurveTo(P[i][0], P[i][1], mx, my); } c.stroke();
  P.forEach(([x, y], i) => { if (i % 2) { c.fillStyle = BG; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.strokeStyle = TEAL2; c.lineWidth = 4; c.stroke(); } }); c.restore();
}
function fgBokeh(c, cam) { for (let i = 0; i < 6; i++) { const wx = hash(i * 9.1) * 2400 - 600, wy = hash(i * 4.7) * 7600, [sx, sy] = W2S(cam, wx, wy, 1.6), r = 140 + hash(i * 3.3) * 120; if (sy < 700 || sy > 2200) continue; const gg = c.createRadialGradient(sx, sy, 0, sx, sy, r); gg.addColorStop(0, 'rgba(62,214,196,.10)'); gg.addColorStop(1, 'rgba(62,214,196,0)'); c.fillStyle = gg; c.fillRect(sx - r, sy - r, 2 * r, 2 * r); } }
// —— glossy pieces ——
function soft(c, f, blur = 40, oy = 18, a = .16) { c.save(); c.shadowColor = `rgba(20,40,90,${a})`; c.shadowBlur = blur * K; c.shadowOffsetY = oy * K; f(); c.restore(); }
function gcard(c, x, y, w, h, r = 28) { soft(c, () => { const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f1f4f8'); c.fillStyle = g; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, r); c.fill(); }); }
function gcoin(c, x, y, r, col = 'teal') { soft(c, () => { const g = c.createRadialGradient(x - r * .35, y - r * .45, r * .1, x, y, r); if (col === 'teal') { g.addColorStop(0, '#7ff0e2'); g.addColorStop(.6, TEAL); g.addColorStop(1, TEAL2); } else if (col === 'grey') { g.addColorStop(0, '#f4f6f9'); g.addColorStop(.6, '#d5dae3'); g.addColorStop(1, '#b7bfcc'); } else { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e6eaf0'); } c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }, r * .5, r * .18); }
function mira(c, x, y, r, o = {}) {   // MIRA: a glossy teal coin with three white waves
  const gr = o.grey || 0; c.save(); if (gr > 0) c.filter = `grayscale(${gr}) blur(${gr * r * .07 * K}px)`; gcoin(c, x, y, r, 'teal'); c.strokeStyle = '#ffffff'; c.lineWidth = r * .13; c.lineCap = 'round'; for (const d of [-.3, .02, .34]) { c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(x - r * .52 + u * r * 1.04, y + d * r + Math.sin(u * Math.PI * 2) * r * .11); } c.stroke(); } c.restore();
  if (o.name > 0) { c.save(); c.globalAlpha *= Math.min(1, o.name); c.font = `700 ${r * .5}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = INK; c.fillText('MIRA', x, y + r * 1.42 + (1 - Math.min(1, o.name)) * 26); c.restore(); }
}
function gbadge(c, x, y, r, k, icon, kind = 'teal') { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { gcoin(c, x, y, r, kind); const col = kind === 'teal' ? INK : INK; c.save(); c.translate(x, y);
  if (icon === 'eye') { c.fillStyle = col; c.beginPath(); c.moveTo(-r * .55, 0); c.quadraticCurveTo(0, -r * .5, r * .55, 0); c.quadraticCurveTo(0, r * .5, -r * .55, 0); c.fill(); ell(c, 0, 0, r * .2, r * .2, kind === 'teal' ? TEAL : '#fff'); }
  if (icon === 'q') { c.font = `700 ${r * 1.05}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText('?', 0, r * .06); }
  if (icon === 'mark') { c.fillStyle = CORAL; c.beginPath(); c.moveTo(-r * .3, -r * .45); c.lineTo(r * .3, -r * .45); c.lineTo(r * .3, r * .45); c.lineTo(0, r * .2); c.lineTo(-r * .3, r * .45); c.closePath(); c.fill(); }
  if (icon === 'bell') { c.fillStyle = col; c.beginPath(); c.moveTo(-r * .4, r * .25); c.quadraticCurveTo(-r * .38, -r * .45, 0, -r * .48); c.quadraticCurveTo(r * .38, -r * .45, r * .4, r * .25); c.closePath(); c.fill(); c.fillRect(-r * .48, r * .2, r * .96, r * .12); ell(c, 0, r * .42, r * .1, r * .1, col); }
  if (icon === 'cart') { c.strokeStyle = col; c.lineWidth = r * .1; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-r * .5, -r * .35); c.lineTo(-r * .32, -r * .35); c.lineTo(-r * .2, r * .2); c.lineTo(r * .36, r * .2); c.lineTo(r * .46, -r * .2); c.lineTo(-r * .28, -r * .2); c.stroke(); ell(c, -r * .14, r * .38, r * .08, r * .08, col); ell(c, r * .3, r * .38, r * .08, r * .08, col); }
  if (icon === 'heart') heart(c, 0, r * .05, r * .42, 1, CORAL);
  if (icon === 'star') star(c, 0, 0, r * .48, 1, TEAL2);
  if (typeof icon === 'number') { c.font = `700 ${r * .9}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(String(icon), 0, r * .05); }
  c.restore(); }); }
function xmark(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { gcoin(c, x, y, r, 'white'); c.strokeStyle = CORAL; c.lineWidth = r * .16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y - r * .3); c.lineTo(x + r * .3, y + r * .3); c.moveTo(x + r * .3, y - r * .3); c.lineTo(x - r * .3, y + r * .3); c.stroke(); }); }
function pawn(c, x, y, s, col = 'grey', k = 1) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { const g = c.createLinearGradient(x - 30 * s, 0, x + 30 * s, 0); if (col === 'grey') { g.addColorStop(0, '#dfe3ea'); g.addColorStop(1, '#aab2c0'); } else { g.addColorStop(0, '#6fa0ff'); g.addColorStop(1, BLU2); } soft(c, () => { c.fillStyle = g; c.beginPath(); c.ellipse(x, y + 20 * s, 34 * s, 30 * s, 0, Math.PI, 0); c.lineTo(x + 34 * s, y + 40 * s); c.lineTo(x - 34 * s, y + 40 * s); c.closePath(); c.fill(); c.beginPath(); c.arc(x, y - 22 * s, 20 * s, 0, 7); c.fill(); }, 16, 8, .14); if (col !== 'grey') { ell(c, x - 7 * s, y - 24 * s, 2.6 * s, 3.2 * s, INK); ell(c, x + 7 * s, y - 24 * s, 2.6 * s, 3.2 * s, INK); c.strokeStyle = INK; c.lineWidth = 2 * s; c.beginPath(); c.arc(x, y - 18 * s, 6 * s, .3, Math.PI - .3); c.stroke(); } }); }
function feedPost(c, x, y, w, brand) { const h = w * 1.05; c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(x - w / 2, y, w, h, 18); c.fill(); ell(c, x - w / 2 + 26, y + 24, 9, 9, brand ? TEAL : '#c5cbd6'); c.fillStyle = '#d5dae3'; c.fillRect(x - w / 2 + 44, y + 19, 90, 10); const g = c.createLinearGradient(0, y + 46, 0, y + 46 + w * .7); g.addColorStop(0, brand ? '#bdf3ec' : '#e3e7ee'); g.addColorStop(1, brand ? '#7fe3d6' : '#cfd5df'); c.fillStyle = g; c.beginPath(); c.roundRect(x - w / 2 + 12, y + 46, w - 24, w * .7, 12); c.fill();
  if (brand) mira(c, x, y + 46 + w * .35, w * .17); else { c.fillStyle = 'rgba(20,33,94,.25)'; c.beginPath(); c.moveTo(x - w / 2 + 12, y + 46 + w * .7); c.lineTo(x - w * .1, y + 46 + w * .32); c.lineTo(x + w * .15, y + 46 + w * .52); c.lineTo(x + w / 2 - 12, y + 46 + w * .7); c.fill(); } c.fillStyle = '#e1e5ec'; c.fillRect(x - w / 2 + 14, y + 60 + w * .7, w * .6, 9); c.fillRect(x - w / 2 + 14, y + 76 + w * .7, w * .4, 9); }
function bottleG(c, x, y, s, solid) { if (!solid) { c.save(); c.setLineDash([16, 12]); c.strokeStyle = TEAL2; c.lineWidth = 6; c.beginPath(); c.roundRect(x - 52 * s, y - 220 * s, 104 * s, 220 * s, 30 * s); c.stroke(); c.restore(); return; } soft(c, () => { const g = c.createLinearGradient(x - 52 * s, 0, x + 52 * s, 0); g.addColorStop(0, '#8fb2ff'); g.addColorStop(1, BLU2); c.fillStyle = g; c.beginPath(); c.roundRect(x - 52 * s, y - 220 * s, 104 * s, 220 * s, 30 * s); c.fill(); }); c.fillStyle = INK; c.beginPath(); c.roundRect(x - 32 * s, y - 266 * s, 64 * s, 52 * s, 12 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 36 * s, y - 196 * s, 12 * s, 160 * s); }

const HER = o => ({ id: 'me', skin: 'blue3', fem: 'pony', s: 1.5, smile: .9, ...o });
let MB = null;   // the motion-blur buffer
const SHOT = {
  flow(c, t) {
    const H = HIT, cam = camAt(t), prevCam = camAt(t - 1 / 24), vx = cam.x - prevCam.x, vy = cam.y - prevCam.y, speed = Math.hypot(vx, vy);
    const x = actx; x.setTransform(K, 0, 0, K, 0, 0); x.clearRect(0, 0, 1080, 1920);
    world(x, t, cam);
    scene(x, t, cam);
    fgBokeh(x, cam);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(bufA, 0, 0);
    if (speed > 4) { const n = 6, L = Math.min(90, speed * 1.3) * K, ux = -vx / speed, uy = -vy / speed; for (let i = 1; i < n; i++) { c.globalAlpha = 1 / (i + 1); c.drawImage(bufA, ux * L * i / n, uy * L * i / n); } c.globalAlpha = 1; }
    c.restore(); c.setTransform(K, 0, 0, K, 0, 0);
  },
};
function scene(c, t, cam) {
  const H = HIT, S = SCN(), at = i => S[i], m = i => ss(clamp((t - S[i]) / MOVE));   // m(i): the change into scene i (0..1)
  const tilt = cam.moving ? Math.sin(cam.p * Math.PI) * .06 * (cam.i % 2 ? 1 : -1) : 0;
  c.save(); c.translate(HX, HY); c.rotate(tilt); c.scale(1.15, 1.15); c.translate(-HX, -HY);
  // 1 · the phone, its feed; MIRA keeps showing up (+1); the empty cart → it turns into the post card
  const a1 = m(1), a2 = m(2), a3 = m(3), a4 = m(4), a5 = m(5), a6 = m(6), a7 = m(7);
  if (a2 < 1) {
    const w = lerp(440, 520, a1), h = lerp(800, 600, a1), fr = lerp(1, 0, a1);
    c.save(); c.globalAlpha = 1 - a2;
    if (fr > 0) soft(c, () => { c.fillStyle = INK; c.beginPath(); c.roundRect(HX - w / 2, HY - h / 2, w, h, lerp(64, 28, a1)); c.fill(); }, 50, 24, .22);
    const inset = 18 * fr; c.fillStyle = a1 > .5 ? '#ffffff' : '#e9edf2'; c.beginPath(); c.roundRect(HX - w / 2 + inset, HY - h / 2 + inset, w - 2 * inset, h - 2 * inset, lerp(46, 28, a1)); if (fr < 1) soft(c, () => c.fill()); else c.fill();
    if (a1 < .5) { c.save(); c.beginPath(); c.roundRect(HX - w / 2 + inset, HY - h / 2 + inset, w - 2 * inset, h - 2 * inset, 46); c.clip(); c.globalAlpha *= 1 - a1 * 2; const sc = KF(t, [[0, 0], [H.seen, 330], [H.insta, 680], [H.never, 1000], [H.unk, 1060]]); for (let i = 0; i < 8; i++) { const brand = i === 2 || i === 4 || i === 6, y = HY - 360 + i * 420 - sc; if (y > HY + 420 || y < HY - 900) continue; feedPost(c, HX, y, 360, brand); } c.restore(); c.fillStyle = INK; c.beginPath(); c.roundRect(HX - 60, HY - h / 2 + 28, 120, 24, 12); c.fill();
      [H.seen, H.insta].forEach((tt, i) => gbadge(c, HX - 250, HY - 300 + i * 120, 46, E(t, tt, .3, .5) * (1 - ss(seg(t, tt + 1.4, tt + 1.7))), 'eye'));
      xmark(c, HX + 250, HY + 300, 54, E(t, H.never, .3, .5)); gbadge(c, HX + 250, HY + 180, 50, E(t, H.never - .15, .3, .5), 'cart', 'white'); }
    // the post card: the ring of exposures, the logo from grey to colour, the eye count, the question, the bookmark; it flips on each new exposure; then it becomes the coin
    if (a1 > .4) { c.globalAlpha *= clamp((a1 - .4) / .4) * (1 - ss(seg(t, H.name - .3, H.name)));
      const flips = ss(seg(t, H.few, H.name - .3)) * Math.PI * 6, sx = Math.cos(flips), rp = KF(t, [[H.unk + .2, .15], [H.second, .15], [H.second + .5, .45], [H.few, .45], [H.name - .3, 1]]);
      c.save(); c.strokeStyle = 'rgba(31,179,163,.18)'; c.lineWidth = 16; c.beginPath(); c.arc(HX, HY, 400, 0, 7); c.stroke(); c.strokeStyle = TEAL; c.lineCap = 'round'; c.beginPath(); c.arc(HX, HY, 400, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rp); c.stroke(); c.restore();
      c.save(); c.translate(HX, HY); c.scale(Math.max(.03, Math.abs(sx)), 1); c.translate(-HX, -HY); c.fillStyle = '#e1e5ec'; c.fillRect(HX - 220, HY - 270, 140, 12); ell(c, HX - 236, HY - 264, 9, 9, TEAL);
        const gq = c.createLinearGradient(0, HY - 230, 0, HY + 160); gq.addColorStop(0, '#d8f8f3'); gq.addColorStop(1, '#8de8dc'); c.fillStyle = gq; c.beginPath(); c.roundRect(HX - 226, HY - 230, 452, 380, 18); c.fill();
        mira(c, HX, HY - 40, 120, { grey: KF(t, [[H.unk, 1], [H.second, 1], [H.second + .6, .45], [H.few, .45], [H.few + .9, 0]]) });
        c.fillStyle = '#e1e5ec'; c.fillRect(HX - 226, HY + 186, 300, 12); c.fillRect(HX - 226, HY + 212, 200, 12); c.restore();
      const cnt = t < H.second ? 1 : t < H.few ? 2 : Math.min(5, 2 + Math.floor(ss(seg(t, H.few, H.name - .3)) * 3.99)); gbadge(c, HX - 310, HY - 330, 52, E(t, H.unk + .3, .3, .5), cnt);
      gbadge(c, HX - 310, HY - 220, 34, E(t, H.unk + .4, .3, .5), 'eye', 'white');
      gbadge(c, HX + 310, HY - 330, 52, E(t, H.q, .3, .55) * (1 - ss(seg(t, H.second, H.second + .3))), 'q', 'white');
      gbadge(c, HX + 310, HY - 330, 52, E(t, H.memo, .3, .55), 'mark', 'white'); }
    c.restore(); }
  // 2 · the coin: MIRA, its name, the bell (the card folds into it)
  const coinIn = ss(seg(t, H.name - .3, H.name + .15)), coinOut = m(2);
  if (coinIn > 0 && coinOut < 1) { c.save(); c.globalAlpha = coinIn * (1 - coinOut); const r = lerp(260, 200, coinIn); mira(c, HX, HY - 40, r * (1 - .3 * coinOut), { name: E(t, H.name + .1, .35, .45) * (1 - coinOut) });
    if (t > H.bell) { gbadge(c, HX + 250, HY + 180, 60, E(t, H.bell, .3, .5), 'bell'); for (let q = 0; q < 2; q++) { c.strokeStyle = `rgba(31,179,163,${.7 * Math.max(0, 1 - (t - H.bell) / 1.4)})`; c.lineWidth = 6; c.beginPath(); c.arc(HX + 250, HY + 180, 80 + q * 26, -.6, .6); c.stroke(); } } c.restore(); }
  // 3 · the need: the coin becomes a product card, she stands beside it; the bottle's outline, then solid; MIRA's tag lands on it
  if (a2 > 0 && a3 < 1) { c.save(); c.globalAlpha = Math.min(1, a2 * 1.4) * (1 - a3); const w = lerp(200, 400, a2), h = lerp(200, 520, a2); gcard(c, HX + 120, HY, w, h, lerp(100, 30, a2));
    if (a2 > .6) { bottleG(c, HX + 120, HY + 170, 1.2, t > H.product); const ok = E(t, H.offers, .3, .55); if (ok > 0) mira(c, HX + 120, HY + 30, 40 * Math.min(1.12, ok)); if (t > H.product) glow(c, HX + 120, HY + 40, 160, .25 * Math.max(0, 1 - (t - H.product) / 1.2)); }
    mascot(c, HER({ x: lerp(HX - 230, HX - 260, a2), y: HY + 470, f: .45, alpha: 1, smile: .9, blink: blinkAt(t, 3), look: .2 })); c.restore(); }
  // 4 · first to mind: the card splits into a row of brand coins; MIRA rises, ringed in teal
  if (a3 > 0 && a4 < 1) { c.save(); c.globalAlpha = Math.min(1, a3 * 1.4) * (1 - a4); const f1 = ss(seg(t, H.first - .4, H.first + .3));
    [0, 1, 2, 3, 4].forEach(i => { const tx = HX + (i - 2) * 170, x = lerp(HX + 120, tx, a3), isM = i === 3; let y = HY - 60, r = 66; if (isM) { y = lerp(y, HY - 330, f1); r = lerp(66, 110, f1); } c.save(); if (!isM) c.globalAlpha *= lerp(1, .45, f1); if (isM) { mira(c, lerp(x, HX, f1), y, r); if (f1 > 0) { c.strokeStyle = TEAL; c.lineWidth = 8; c.beginPath(); c.arc(lerp(x, HX, f1), y, r + 22 * f1, 0, 7 * f1); c.stroke(); } } else gcoin(c, x, y, r, 'grey'); c.restore(); if (!isM) gbadge(c, x + 46, y - 60, 22, E(t, H.mind + .3 + i * .08, .3, .5) * (1 - f1), 'q', 'white'); });
    mascot(c, HER({ x: HX, y: HY + 480, f: 0, smile: f1 > .5 ? 1 : .8, blink: blinkAt(t, 3), look: -.3 })); if (f1 >= 1) spark(c, HX, HY - 330, t, H.first + .3, 6, 170, 16); c.restore(); }
  // 5 · the Mere Exposure Effect: the coins merge into a teal eye badge; copies orbit it
  if (a4 > 0 && a5 < 1) { c.save(); c.globalAlpha = Math.min(1, a4 * 1.4) * (1 - a5); const r = lerp(110, 190, a4); c.strokeStyle = 'rgba(62,214,196,.35)'; c.lineWidth = 6; c.beginPath(); c.arc(HX, HY - 60, r + 70, 0, 7); c.stroke(); gbadge(c, HX, lerp(HY - 330, HY - 60, a4), r, 1, 'eye');
    for (let q = 0; q < 7; q++) { const an = q / 7 * Math.PI * 2 + (t - H.term) * .9, rr = 340 * ss(seg(t, H.mere - .2 + q * .05, H.mere + .4 + q * .05)); if (rr > 1) mira(c, HX + Math.cos(an) * rr, HY - 60 + Math.sin(an) * rr * .75, 40); } c.restore(); }
  // 6 · the chart card: exposures land, familiarity climbs (eye badge), liking follows (heart badge)
  if (a5 > 0 && a7 < 1) { c.save(); c.globalAlpha = Math.min(1, a5 * 1.4) * (1 - a7); const w = lerp(380, 640, a5), h = lerp(380, 520, a5); gcard(c, HX, HY, w, h, lerp(190, 32, a5));
    if (a5 > .6 && a6 < .5) { c.save(); c.globalAlpha *= 1 - a6 * 2; const x0 = HX - 260, x1 = HX + 260, y0 = HY + 180, y1 = HY - 190; c.strokeStyle = '#c9cfda'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y1); c.lineTo(x0, y0); c.lineTo(x1, y0); c.stroke();
      H.again.forEach((tt, i) => { const kk = E(t, tt, .3, .45); if (kk > 0) mira(c, x0 + 80 + i * 120, y0 + 50, 26 * Math.min(1.12, kk)); });
      const line = (p, col, lift) => { if (p <= 0) return null; c.save(); c.strokeStyle = col; c.lineWidth = 12; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); const n = 30; let ex = 0, ey = 0; for (let i = 0; i <= n * p; i++) { const u = i / n; ex = x0 + 20 + u * (x1 - x0 - 40); ey = y0 - 20 - (1 - Math.exp(-u * 2.4)) / (1 - Math.exp(-2.4)) * (y0 - y1 - 40) * lift; i ? c.lineTo(ex, ey) : c.moveTo(ex, ey); } c.stroke(); c.restore(); return [ex, ey]; };
      const e1 = line(ss(seg(t, H.grow, H.grow + 1.0)), TEAL, 1); if (e1) gbadge(c, e1[0] + 10, e1[1] - 60, 40, E(t, H.grow + 1.0, .3, .5), 'eye');
      const e2 = line(ss(seg(t, H.like, H.like + 1.0)), CORAL, .6); if (e2) gbadge(c, e2[0] + 10, e2[1] - 54, 38, E(t, H.like + 1.0, .3, .5), 'heart', 'white'); c.restore(); }
    // 7 · the chart becomes the week: seven day cells; MIRA lands on them in rhythm
    if (a6 > 0 && a7 < 1) { c.save(); c.globalAlpha *= Math.min(1, a6 * 1.6) * (1 - a7); c.fillStyle = TEAL2; c.beginPath(); c.roundRect(HX - w / 2 + 30, HY - h / 2 + 30, w - 60, 40, 12); c.fill(); for (let d = 0; d < 7; d++) { const cx = HX - 255 + d * 85, cy = HY + 40; c.fillStyle = '#eef1f4'; c.beginPath(); c.roundRect(cx - 36, cy - 100, 72, 200, 14); c.fill(); if (d % 2 === 0 || d === 5) { const kk = E(t, H.rhythm + d * .1, .3, .45); if (kk > 0) mira(c, cx, cy, 30 * Math.min(1.12, kk)); } } c.restore(); }
    c.restore(); }
  // 8 · the audience: a crowd of people; lines run from MIRA to some of them and they light up
  if (a7 > 0) { const top = [HX, HY - 400]; c.save(); c.globalAlpha = Math.min(1, a7 * 1.4); gbadge(c, top[0], top[1], 80, a7, 'eye'); mira(c, top[0], top[1], 70 * a7);
    const lit = [[0, 1], [1, 3], [2, 0], [2, 4], [3, 2], [1, 1]];
    for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) { const px = HX - 280 + q * 140, py = HY - 60 + r * 200, isLit = lit.findIndex(([a, b]) => a === q && b === r), lk = isLit >= 0 ? ss(seg(t, H.audience + .3 + isLit * .12, H.audience + .6 + isLit * .12)) : 0;
      if (lk > 0) { c.save(); c.strokeStyle = TEAL2; c.lineWidth = 4; c.globalAlpha *= lk; c.beginPath(); c.moveTo(top[0], top[1] + 70); c.quadraticCurveTo(px, top[1] + 120, lerp(top[0], px, lk), lerp(top[1] + 70, py - 60, lk)); c.stroke(); c.restore(); }
      pawn(c, px, py, 1.25, lk > .5 ? 'blue' : 'grey', E(t, S[7] + .1 + (r * 5 + q) * .025, .3, .45)); if (lk >= 1 && t > H.end) heart(c, px + 26, py - 52, 12, Math.min(1, (t - H.end) * 3), CORAL); }
    c.restore(); }
  c.restore();
}

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['többször','Instagramon','soha','először','ismeretlen','Másodszor','logóját','ismerősen','szükséged','első','Mere','Exposure','Effectnek','újra','ismerősség','szimpátiánkat','rendszeresen','célközönsége']);
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
  c.fillStyle = TOP; c.fillRect(0, 0, 1080, 660); const g = c.createLinearGradient(0, 660, 0, 760); g.addColorStop(0, TOP); g.addColorStop(1, 'rgba(238,241,244,0)'); c.fillStyle = g; c.fillRect(0, 660, 1080, 100);
  const p = PAGES.find(p => t >= p.t0 && t < p.t1); if (!p) return;
  const out = ss(seg(t, p.t1 - .12, p.t1)), now = p.words.filter(w => t >= w.t - .02).pop();
  c.save(); c.globalAlpha = 1 - out; c.translate(0, -30 * out); c.font = CAPFONT; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  p.words.forEach(w => { const k = E(t, w.t - .06, .28, .45); if (k <= 0) return; const a = Math.min(1, k * 2.2), y = CAP.y + w.line * CAP.lh + (1 - Math.min(1, k)) * 34, sc = .75 + .25 * k, cx = CAP.x + w.x + w.wd / 2;
    const hot = w === now, col = hot || w.key ? '#12a393' : '#14215e';   // this film is light: navy words, the spoken and key words in teal
    c.save(); c.globalAlpha = a * (1 - out); c.translate(cx, y); c.scale(sc, sc); c.translate(-cx, -y);
    c.shadowColor = 'rgba(20,40,90,.12)'; c.shadowBlur = 6; c.shadowOffsetY = 2; c.fillStyle = col; c.fillText(w.w, CAP.x + w.x, y); c.shadowColor = 'transparent';
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
function vignette(c) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H * .5, H * .3, W / 2, H * .5, H * .8); g.addColorStop(0, 'rgba(120,135,165,0)'); g.addColorStop(1, 'rgba(120,135,165,.18)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
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
