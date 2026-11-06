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

// —— her story: a skincare brand she keeps seeing, until it's the first one she reaches for ——
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
// —— the brand: no name, just a mark: a cream leaf in a gold circle ——
function mark(c, x, y, r, o = {}) { const gr = o.grey || 0; c.save(); if (gr > 0) c.filter = `grayscale(${gr}) blur(${gr * r * .1 * K}px)`; ell(c, x + r * .05, y + r * .08, r, r, 'rgba(0,0,20,.25)'); ell(c, x, y, r, r, GOLD); ell(c, x, y, r * .86, r * .86, '#f2c95e');
  c.fillStyle = CREAM; c.beginPath(); c.moveTo(x - r * .1, y + r * .5); c.bezierCurveTo(x - r * .6, y + r * .1, x - r * .3, y - r * .55, x + r * .35, y - r * .5); c.bezierCurveTo(x + r * .45, y + r * .05, x + r * .15, y + r * .4, x - r * .1, y + r * .5); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = r * .06; c.beginPath(); c.moveTo(x - r * .05, y + r * .4); c.quadraticCurveTo(x + r * .05, y - r * .05, x + r * .28, y - r * .38); c.stroke(); c.restore(); }
// the skincare: a round cream jar with a lid; the brand's has the mark; the unknown ones are plain
function jar(c, x, y, s, o = {}) {   // y = its bottom
  const w = 150 * s, h = 110 * s, lid = o.open ? -1 : 0, body = o.plain ? ['#c9ccd6', '#9aa0b8'][o.plain % 2] : '#f6e3da';
  ell(c, x + 6 * s, y + 2 * s, w * .55, 12 * s, 'rgba(0,0,20,.3)'); if (o.glow) glow(c, x, y - h / 2, w * 1.2, .5 * o.glow);
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#fff6f0'); g.addColorStop(.7, body); g.addColorStop(1, o.plain ? '#868ca6' : '#e4c7bb'); c.fillStyle = g; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, [10 * s, 10 * s, 24 * s, 24 * s]); c.fill();
  if (!o.open) { c.fillStyle = o.plain ? '#6b7088' : GOLD2; c.beginPath(); c.roundRect(x - w / 2 - 6 * s, y - h - 40 * s, w + 12 * s, 46 * s, 14 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - w / 2, y - h - 32 * s, w, 8 * s); }
  else { ell(c, x, y - h, w / 2, 12 * s, o.empty ? '#d8c3b8' : '#fffaf2'); }
  if (!o.plain) mark(c, x, y - h * .5, 30 * s, { grey: o.grey || 0 }); else { c.fillStyle = 'rgba(255,255,255,.4)'; [0, 1].forEach(k => c.fillRect(x - 34 * s, y - h * .62 + k * 22 * s, (68 - k * 24) * s, 8 * s)); }
}
// the floating phone screen next to her, showing the ad
function adScreen(c, x, y, s, k, o = {}) {   // o.grey (blurred ad), o.ring (familiarity 0..1), o.scroll (feed offset)
  if (k <= 0) return; scaled(c, x, y, Math.min(1.08, k), () => { const w = 300 * s, h = 520 * s;
    c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 10, y - h / 2 + 14, w, h, 40 * s); c.fill(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 40 * s); c.fill(); c.fillStyle = '#efe6d2'; c.beginPath(); c.roundRect(x - w / 2 + 12 * s, y - h / 2 + 12 * s, w - 24 * s, h - 24 * s, 30 * s); c.fill();
    c.save(); c.beginPath(); c.roundRect(x - w / 2 + 12 * s, y - h / 2 + 12 * s, w - 24 * s, h - 24 * s, 30 * s); c.clip();
    const pw = w - 52 * s, ph = pw * 1.2; for (let i = -1; i < 4; i++) { const py = y - h / 2 + 50 * s + i * (ph + 20 * s) - ((o.scroll || 0) % (ph + 20 * s)), isAd = o.feed ? (i + Math.floor((o.scroll || 0) / (ph + 20 * s))) % 3 === 1 : i === 0;
      c.fillStyle = '#fbf6ea'; c.beginPath(); c.roundRect(x - pw / 2, py, pw, ph, 14 * s); c.fill(); ell(c, x - pw / 2 + 22 * s, py + 22 * s, 12 * s, 12 * s, isAd ? GOLD : '#9aa0b8'); c.fillStyle = 'rgba(28,36,80,.3)'; c.fillRect(x - pw / 2 + 42 * s, py + 16 * s, 80 * s, 10 * s);
      c.fillStyle = isAd ? '#1f2c62' : ['#d9ccab', '#c9d6b0', '#e6c3b8'][(i + 3) % 3]; c.fillRect(x - pw / 2 + 10 * s, py + 46 * s, pw - 20 * s, pw - 20 * s);
      if (isAd) { c.save(); if (o.grey > 0) c.filter = `grayscale(${o.grey}) blur(${o.grey * 6 * K}px)`; glow(c, x, py + 46 * s + pw / 2, 90 * s, .3); jar(c, x, py + 46 * s + pw * .78, .9 * s); c.restore(); if (o.gold) { c.strokeStyle = GOLD; c.lineWidth = 6; c.beginPath(); c.roundRect(x - pw / 2 - 3, py - 3, pw + 6, ph + 6, 16 * s); c.stroke(); } }
      else { ell(c, x - pw * .12, py + 46 * s + pw * .3, pw * .12, pw * .12, 'rgba(255,255,255,.5)'); } }
    c.restore(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - 40 * s, y - h / 2 + 18 * s, 80 * s, 18 * s, 9 * s); c.fill();
    if (o.ring != null) { c.save(); c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = 'rgba(246,239,220,.18)'; c.beginPath(); c.arc(x, y, h * .62, 0, 7); c.stroke(); c.strokeStyle = GOLD; c.beginPath(); c.arc(x, y, h * .62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * o.ring); c.stroke(); c.restore(); } });
}
function handPhone(c, x, y, s = 1) { c.save(); c.translate(x, y); c.rotate(-.25); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(-16 * s, -30 * s, 32 * s, 60 * s, 8 * s); c.fill(); c.fillStyle = '#8fb0ff'; c.fillRect(-11 * s, -23 * s, 22 * s, 42 * s); c.restore(); }
// —— the places ——
function room(c, t, o = {}) {   // her living room in the evening: wall (caption blue), a window with the night city, a lamp, a sofa
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); c.fillStyle = '#2a3054'; c.fillRect(-400, 1640, 1880, 600);
  c.fillStyle = '#e9dcc0'; c.fillRect(130, 960, 300, 330); c.fillStyle = '#16205a'; c.fillRect(146, 976, 268, 298); for (let i = 0; i < 4; i++) { c.fillStyle = '#24306e'; c.fillRect(150 + i * 66, 1150 - (i % 2) * 60, 56, 130 + (i % 2) * 60); for (let k = 0; k < 4; k++) if (hash(i * 7 + k) > .5) { c.fillStyle = 'rgba(255,214,140,.7)'; c.fillRect(160 + i * 66, 1170 - (i % 2) * 60 + k * 26, 10, 12); } }
  c.fillStyle = CREAM; c.fillRect(278, 976, 6, 298); glow(c, 900, 1150, 260, .35); c.fillStyle = '#8f98b0'; c.fillRect(896, 1170, 8, 470); c.fillStyle = '#f0d9a8'; c.beginPath(); c.moveTo(840, 1170); c.lineTo(960, 1170); c.lineTo(930, 1090); c.lineTo(870, 1090); c.closePath(); c.fill();
  c.fillStyle = '#6b3d5a'; c.beginPath(); c.roundRect(140, 1440, 700, 200, 40); c.fill(); c.fillStyle = '#7d4a6b'; c.beginPath(); c.roundRect(110, 1380, 760, 110, 50); c.fill(); c.fillStyle = '#5a3350'; c.fillRect(170, 1630, 30, 40); c.fillRect(780, 1630, 30, 40);
}
function bus(c, t) {   // a morning bus: the city streams past the windows
  c.fillStyle = '#f2b68a'; c.fillRect(-400, 900, 1880, 420); const off = (t * 420) % 480;
  for (let i = -1; i < 6; i++) { const bx = i * 480 - off; c.fillStyle = '#5a6aa8'; c.fillRect(bx, 1080, 180, 240); c.fillStyle = '#7d86c0'; c.fillRect(bx + 220, 1000, 140, 320); c.fillStyle = '#3c4c98'; c.fillRect(bx + 380, 1140, 90, 180); for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(255,240,200,.5)'; c.fillRect(bx + 240, 1030 + k * 60, 30, 26); c.fillRect(bx + 300, 1030 + k * 60, 30, 26); } }
  c.fillStyle = TOP; c.fillRect(-400, 0, 1880, 900); c.fillStyle = '#26346f'; c.fillRect(-400, 1320, 1880, 700); for (const px of [-60, 300, 660, 1020]) { c.fillStyle = '#26346f'; c.fillRect(px - 20, 900, 40, 420); }
  c.fillStyle = '#b9bccb'; c.fillRect(-400, 880, 1880, 24); c.fillRect(-400, 1300, 1880, 24); c.strokeStyle = '#d9a332'; c.lineWidth = 10; c.beginPath(); c.moveTo(-400, 960); c.lineTo(1480, 960); c.stroke(); for (const px of [200, 880]) { c.fillStyle = '#d9a332'; c.fillRect(px - 6, 900, 12, 760); }
  c.fillStyle = '#3a4b9e'; c.beginPath(); c.roundRect(-60, 1460, 300, 200, 30); c.fill(); c.beginPath(); c.roundRect(860, 1460, 300, 200, 30); c.fill(); c.fillStyle = '#1b2356'; c.fillRect(-400, 1660, 1880, 400);
}
function cafe(c, t) {   // a café at lunch: a sunny window, a little table with a coffee
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); c.fillStyle = '#e9dcc0'; c.fillRect(-400, 1380, 1880, 260); c.fillStyle = WOOD; c.fillRect(-400, 1370, 1880, 14);
  c.fillStyle = '#e9dcc0'; c.fillRect(620, 940, 380, 380); c.fillStyle = '#9fc7f0'; c.fillRect(636, 956, 348, 348); glow(c, 900, 1030, 160, .5); ell(c, 900, 1030, 40, 40, '#ffe08a'); c.fillStyle = '#7fbf8a'; ell(c, 700, 1300, 70, 50, '#7fbf8a'); c.fillStyle = CREAM; c.fillRect(806, 956, 8, 348);
  c.fillStyle = '#5a3a22'; c.fillRect(-400, 1640, 1880, 600); c.fillStyle = WOOD; c.beginPath(); c.ellipse(220, 1520, 160, 30, 0, 0, 7); c.fill(); c.fillRect(212, 1520, 16, 130); c.fillStyle = CREAM; c.fillRect(190, 1460, 50, 56); c.strokeStyle = CREAM; c.lineWidth = 7; c.beginPath(); c.arc(244, 1488, 13, -1.3, 1.3); c.stroke(); ell(c, 215, 1462, 25, 6, '#6b3d24');
}
function gym(c, t) { c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); c.fillStyle = 'rgba(140,160,220,.12)'; c.fillRect(-400, 1180, 1880, 260); c.fillStyle = '#2a2f45'; c.fillRect(-400, 1640, 1880, 600); for (let k = 0; k < 3; k++) { c.fillStyle = '#3c4c98'; c.fillRect(760, 1460 + k * 56, 260, 10); } c.fillStyle = '#2b3a80'; c.beginPath(); c.roundRect(60, 1560, 260, 30, 15); c.fill(); }
function park(c, t) { c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); const g = c.createLinearGradient(0, 1100, 0, 1640); g.addColorStop(0, '#2d4596'); g.addColorStop(1, '#4a6fb8'); c.fillStyle = g; c.fillRect(-400, 1100, 1880, 540); c.fillStyle = '#3f6b4a'; c.fillRect(-400, 1640, 1880, 600); for (const [tx, s] of [[120, 1], [900, 1.2]]) { c.fillStyle = '#6e4a2c'; c.fillRect(tx - 14 * s, 1420, 28 * s, 230); ell(c, tx, 1380, 110 * s, 120 * s, '#4f8a5e'); ell(c, tx - 40 * s, 1330, 70 * s, 70 * s, '#5f9a6e'); } c.fillStyle = WOOD; c.fillRect(620, 1580, 260, 18); }
function bedroom(c, t) { c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); c.fillStyle = '#e9dcc0'; c.fillRect(760, 960, 240, 260); c.fillStyle = '#0b1440'; c.fillRect(772, 972, 216, 236); ell(c, 900, 1040, 30, 30, '#f1e7cf'); ell(c, 912, 1032, 28, 28, '#0b1440'); glow(c, 160, 1300, 200, .4); c.fillStyle = '#f0d9a8'; c.beginPath(); c.moveTo(110, 1300); c.lineTo(210, 1300); c.lineTo(190, 1240); c.lineTo(130, 1240); c.closePath(); c.fill(); c.fillStyle = '#5a3a22'; c.fillRect(-400, 1640, 1880, 600); c.fillStyle = '#c4566a'; c.beginPath(); c.roundRect(240, 1480, 620, 170, 30); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(260, 1440, 180, 70, 30); c.fill(); }
function bathroom(c, t) {   // her bathroom: tiles, a big round mirror, a shelf
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); for (let r = 0; r < 6; r++) for (let k = -2; k < 12; k++) { c.fillStyle = (r + k) % 2 ? '#24306e' : '#1f2a66'; c.fillRect(k * 110, 1100 + r * 110, 108, 108); }
  c.fillStyle = '#e9dcc0'; c.fillRect(-400, 1640, 1880, 600); c.fillStyle = WOOD; c.fillRect(620, 1300, 340, 18);
}
function shop(c, t) {   // a drugstore aisle: shelves of skincare
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); c.fillStyle = '#e9dcc0'; c.fillRect(-400, 1640, 1880, 600); c.fillStyle = '#26346f'; c.fillRect(60, 980, 960, 660); for (const sy of [1180, 1420]) { c.fillStyle = WOOD; c.fillRect(60, sy, 960, 18); }
}
// —— the people ——
const HER = o => ({ id: 'her', skin: 'blue3', fem: 'long', s: 2.0, smile: .7, ...o });   // our main character
const AUD = [['blue2', 'bob'], ['blue1', 'pony'], ['blue3', 'bun'], ['blue2', 'hat'], ['blue1', 'band']];

const SHOT = {
  sofa(c, t) {   // she scrolls her feed on the sofa; the brand's ad slides past again and again; she has never bought from it: the empty bag
    const H = HIT, sc = KF(t, [[0, 0], [H.seen, 360], [H.insta, 760], [H.never, 1180], [6, 1260]]), adK = E(t, .25, .4, .4);
    stage(c, [60, 860, 1020, 1800], 0, () => { room(c, t);
      mascot(c, HER({ x: 330, y: 1580, sit: 1, f: .35, smile: .8, look: .3, blink: blinkAt(t, 3), handR: [420, 1450] })); handPhone(c, 424, 1442, 1.1);
      adScreen(c, 720, 1170, 1, adK, { scroll: sc, feed: true, gold: true });
      [H.seen, H.insta].forEach((at, i) => { const k = E(t, at, .3, .5) * (1 - ss(seg(t, at + 1.2, at + 1.5))); if (k > 0) badge(c, 'ex', 900 - i * 10, 930 + i * 30, 30, k); });
      const bk = E(t, H.never, .3, .5); if (bk > 0) scaled(c, 560, 1520, Math.min(1.12, bk), () => { c.fillStyle = CREAM; c.beginPath(); c.moveTo(500, 1480); c.lineTo(620, 1480); c.lineTo(630, 1600); c.lineTo(490, 1600); c.closePath(); c.fill(); c.strokeStyle = CREAM; c.lineWidth = 8; c.beginPath(); c.arc(560, 1480, 30, Math.PI, 0); c.stroke(); badge(c, 'x', 625, 1470, 30, 1); }); });
  },
  day(c, t) {   // her days: she stays, the world changes around her: the morning bus (a blurry ad, unknown), lunch in a café (she notices the mark, it sticks), then flashes of the gym, the park, her bed: the ad again and again, the ring fills; it starts to feel familiar, a little bell
    const H = HIT, places = [[5.6, bus], [H.second - .25, cafe], [H.few, gym], [H.few + .6, park], [H.few + 1.2, bedroom]]; let pi = 0; while (pi + 1 < places.length && t >= places[pi + 1][0]) pi++;
    const ring = KF(t, [[H.unk, .1], [H.second, .15], [H.second + .5, .4], [H.few, .4], [H.few + .3, .55], [H.few + .9, .7], [H.few + 1.5, .85], [H.name, 1]]), grey = KF(t, [[H.unk, 1], [H.second, 1], [H.second + .5, .4], [H.few, .4], [H.few + .9, 0]]);
    stage(c, [60, 860, 1020, 1800], 0, () => {
      places[pi][1](c, t); if (pi > 0) { const w = ss(seg(t, places[pi][0], places[pi][0] + .3)); if (w < 1) { c.save(); c.beginPath(); c.rect(-400 + 1880 * w, 0, 1880, 3000); c.clip(); places[pi - 1][1](c, t); c.restore(); c.fillStyle = GOLD; c.fillRect(-400 + 1880 * w - 10, 700, 20, 1400); } }
      const smile = t > H.name ? 1 : t > H.second ? .8 : .65; mascot(c, HER({ x: 320, y: 1790, f: .4, smile, look: .3, blink: blinkAt(t, 3), handR: [410, 1560], o: t > H.memo - .1 && t < H.memo + .5 ? .4 : 0 })); handPhone(c, 414, 1552, 1.1);
      adScreen(c, 720, 1180, 1, E(t, H.unk - .1, .35, .45), { grey, ring, scroll: 0 });
      badge(c, 'q', 890, 900, 36, E(t, H.q, .3, .5) * (1 - ss(seg(t, H.second - .3, H.second))));
      const pk = E(t, H.memo, .3, .5) * (1 - ss(seg(t, H.few, H.few + .3))); if (pk > 0) { badge(c, 'pin', 890, 900, 36, pk); }
      [H.few, H.few + .6, H.few + 1.2].forEach((at, i) => { const k = Math.sin(clamp((t - at) / .55) * Math.PI); if (k > 0) { glow(c, 720, 1180, 260, .35 * k); } });
      const bk = E(t, H.bell, .3, .45); if (bk > 0) { badge(c, 'bell', 905, 1450, 40 * Math.min(1.1, bk), 1); for (let q = 0; q < 2; q++) { c.strokeStyle = `rgba(236,189,74,${.7 * Math.max(0, 1 - (t - H.bell) / 1.4)})`; c.lineWidth = 6; c.beginPath(); c.arc(905, 1450, 56 + q * 24, -.6, .6); c.stroke(); } }
      if (t > H.name) { glow(c, 320, 1450, 140, .3 * ss(seg(t, H.name, H.name + .4))); } });
  },
  mirror(c, t) {   // one day she needs it: at the mirror, her jar is empty, puff; her skin feels dry; the ad comes back: this brand makes exactly that
    const H = HIT, op = ss(seg(t, H.empty - .2, H.empty + .2)), dry = ss(seg(t, H.dry - .1, H.dry + .4)), ad = E(t, H.offers, .35, .45);
    stage(c, [60, 860, 1020, 1800], 0, () => { bathroom(c, t);
      ell(c, 400, 1260, 250, 300, '#e9dcc0'); ell(c, 400, 1260, 230, 280, '#3a4b9e'); glow(c, 340, 1150, 160, .25); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(320, 1140, 60, 140, -.4, 0, 7); c.fill();
      mascot(c, HER({ x: 400, y: 1800, s: 2.1, f: 0, smile: dry > .5 ? 0 : .6, sad: .5 * dry, blink: blinkAt(t, 3), handL: t > H.empty - .3 && t < H.dry + .3 ? [690, 1290] : undefined }));
      if (dry > 0) { c.strokeStyle = `rgba(246,239,220,${.7 * dry})`; c.lineWidth = 3; for (const [dx, dy] of [[-70, 0], [60, 10], [-55, 30]]) { c.beginPath(); c.moveTo(400 + dx - 12, 1500 + dy - 140); c.lineTo(400 + dx, 1500 + dy - 132); c.lineTo(400 + dx + 10, 1500 + dy - 140); c.stroke(); } }
      jar(c, 720, 1300, 1, { open: op > .5, empty: 1, plain: 1 }); if (op > 0 && op < 1) { for (let k = 0; k < 5; k++) ell(c, 720 + Math.cos(k * 1.3) * 60 * op, 1160 - 40 * op + Math.sin(k * 1.3) * 30 * op, 14 * (1 - op), 14 * (1 - op), `rgba(246,239,220,${.7 * (1 - op)})`); }
      adScreen(c, 840, 1050, .62, ad, { grey: 0, scroll: 0, gold: true }); if (ad > 0) spark(c, 840, 1050, t, H.offers, 5, 130, 14); });
  },
  shop(c, t) {   // in the drugstore, among the unknown jars, the familiar one is the first she reaches for
    const H = HIT, f1 = ss(seg(t, H.first - .3, H.first + .3)), take = ss(seg(t, H.take, H.take + .5)), walk = seg(t, 19.95, 20.9);
    stage(c, [40, 860, 1040, 1800], 0, () => { shop(c, t);
      const J = [[180, 1180, 1], [360, 1180, 0], [560, 1180, 2], [760, 1180, 1], [920, 1180, 0], [180, 1420, 0], [380, 1420, 'B'], [600, 1420, 2], [800, 1420, 1]];
      J.forEach(([x, y, p]) => { if (p === 'B') return; c.save(); c.globalAlpha = 1 - .45 * f1; jar(c, x, y, .85, { plain: p + 1 }); c.restore(); });
      const bx = lerp(380, 590, take), by = lerp(1420, 1690, take) - 70 * f1 * (1 - take); jar(c, bx, by, lerp(.85, 1.05, f1), { glow: f1 }); if (f1 > 0 && take < 1) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 6; c.globalAlpha = f1; c.beginPath(); c.roundRect(bx - 90, by - 170, 180, 190, 20); c.stroke(); c.restore(); }
      if (f1 >= 1) spark(c, bx, by - 80, t, H.first + .3, 6, 120, 14);
      mascot(c, HER({ x: lerp(100, 760, ss(walk)), y: 1800, s: 1.9, f: walk < 1 ? .6 : -.3, walk: walk > 0 && walk < 1 ? 1 : 0, phi: walk * 8, smile: f1 > .5 ? 1 : .6, look: -.3, blink: blinkAt(t, 3), handL: take > 0 ? reach([700, 1640], [bx + 50, by - 60], Math.min(1, take * 2)) : undefined })); });
  },
  eye(c, t) {   // the Mere Exposure Effect: an eye opens, the mark is its pupil; copies of the mark ripple outward, one exposure after another
    const H = HIT, op = ss(seg(t, 23.9, 24.4)); bg(c);
    stage(c, [100, 860, 980, 1780], 0, () => { for (let k = 0; k < 5; k++) { const u = ((t - H.mere) * .55 + k / 5) % 1; if (t > H.mere - .1) { c.save(); c.globalAlpha = .8 * (1 - u) * ss(seg(t, H.mere - .1, H.mere + .3)); c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.arc(540, 1300, 170 + u * 300, 0, 7); c.stroke(); c.restore(); for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2 + k; if (u > .15 && u < .8) { c.save(); c.globalAlpha = .7 * (1 - u); mark(c, 540 + Math.cos(a) * (170 + u * 300), 1300 + Math.sin(a) * (170 + u * 300), 24); c.restore(); } } } }
      c.save(); c.fillStyle = CREAM; c.beginPath(); c.moveTo(540 - 260, 1300); c.quadraticCurveTo(540, 1300 - 240 * op, 540 + 260, 1300); c.quadraticCurveTo(540, 1300 + 240 * op, 540 - 260, 1300); c.fill(); if (op > .3) { c.clip(); ell(c, 540, 1300, 100, 100, NAVY); mark(c, 540, 1300, 76); } c.restore(); });
  },
  chart(c, t) {   // again and again: phone icons land on her timeline; familiarity climbs up to her smiling face; liking follows to a heart
    const H = HIT; bg(c);
    stage(c, [60, 880, 1020, 1800], 0, () => { const x0 = 200, x1 = 760, y0 = 1560, y1 = 1020, ax = ss(seg(t, 27.5, 28.1));
      c.strokeStyle = 'rgba(246,239,220,.7)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, lerp(y0, y1 - 20, ax)); c.lineTo(x0, y0); c.lineTo(lerp(x0, x1 + 20, ax), y0); c.stroke();
      H.again.forEach((at, i) => { const k = E(t, at, .3, .45); if (k > 0) scaled(c, x0 + 90 + i * 140, y0 + 80, Math.min(1.12, k), () => { handPhone(c, x0 + 90 + i * 140, y0 + 80, 1.2); mark(c, x0 + 110 + i * 140, y0 + 50, 14); }); });
      const line = (p, col, lift) => { if (p <= 0) return null; c.save(); c.strokeStyle = col; c.lineWidth = 12; c.lineJoin = 'round'; c.beginPath(); const n = 30; let ex = 0, ey = 0; for (let i = 0; i <= n * p; i++) { const u = i / n; ex = x0 + 20 + u * (x1 - x0 - 40); ey = y0 - 20 - (1 - Math.exp(-u * 2.4)) / (1 - Math.exp(-2.4)) * (y0 - y1 - 60) * lift; i ? c.lineTo(ex, ey) : c.moveTo(ex, ey); } c.stroke(); c.restore(); glow(c, ex, ey, 50, .5); return [ex, ey]; };
      const fam = ss(seg(t, H.grow, H.grow + 1.0)), lik = ss(seg(t, H.like, H.like + 1.0));
      const e1 = line(fam, GOLD, 1); if (e1 && fam >= 1) mark(c, e1[0] + 10, e1[1] - 46, 30 * Math.min(1.1, E(t, H.grow + 1.0, .3, .5)));
      const e2 = line(lik, '#e8664f', .62); if (e2 && lik >= 1) heart(c, e2[0] + 10, e2[1] - 40, 34, Math.min(1.12, E(t, H.like + 1.0, .3, .5)), '#e8664f');
      mascot(c, HER({ x: 880, y: 1790, s: 1.7, f: -.4, smile: lerp(.75, 1, Math.max(fam, lik)), blink: blinkAt(t, 3), look: -.2 }));
      if (lik >= 1) for (let k = 0; k < 3; k++) heart(c, 860 + k * 40, 1300 - 50 * clamp((t - H.like - 1.0 - k * .15) / 1.2), 14 + 3 * k, Math.max(0, Math.sin(clamp((t - H.like - 1.0 - k * .15) / 1.2) * Math.PI)), '#c4566a'); });
  },
  everyone(c, t) {   // so a brand should be there regularly in its audience's life: a week, the mark on its days; the women of its audience, their phones light up, they smile
    const H = HIT; bg(c);
    stage(c, [60, 880, 1020, 1800], 0, () => {
      for (let d = 0; d < 7; d++) { const x = 140 + d * 116, y = 1000, k = E(t, 36.3 + d * .05, .3, .45); if (k <= 0) continue; scaled(c, x + 50, y + 70, Math.min(1, k), () => { c.fillStyle = 'rgba(246,239,220,.14)'; c.beginPath(); c.roundRect(x, y, 100, 140, 16); c.fill(); }); if (d % 2 === 0 || d === 5) { const kk = E(t, H.rhythm + d * .1, .3, .45); if (kk > 0) mark(c, x + 50, y + 70, 30 * Math.min(1.12, kk)); } }
      AUD.forEach(([sk, fem], i) => { const x = 170 + i * 185, k = E(t, H.audience - .6 + i * .08, .35, .45); if (k <= 0) return; const lit = t > H.audience + i * .12;
        scaled(c, x, 1790, Math.min(1, k), () => { mascot(c, { id: 'a' + i, skin: sk, fem, s: 1.25, x, y: 1790, f: .2, smile: lit ? 1 : .6, blink: blinkAt(t, i), handR: [x + 50, 1600] }); handPhone(c, x + 52, 1594, .9); if (lit) { glow(c, x + 52, 1560, 50, .5); mark(c, x + 56, 1520, 18 * Math.min(1.1, E(t, H.audience + i * .12, .3, .5))); } }); });
      if (t > H.end) { glow(c, 540, 1500, 420, .3 * ss(seg(t, H.end, H.end + .5))); spark(c, 540, 1450, t, H.end, 8, 360, 18); } });
  },
};

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
