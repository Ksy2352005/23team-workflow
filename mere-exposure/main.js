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
const HER = o => ({ id: 'her', skin: 'blue3', fem: 'long', s: 2.0, smile: .8, ...o });   // our main character
const AUD = [['blue2', 'bob'], ['blue1', 'pony'], ['blue3', 'bun'], ['blue2', 'hat'], ['blue1', 'band']];
// —— two kinds of picture, cut together: short calm moments of her day (she stands in the middle, one or two props) and one clean main visual (her phone, big, with the ad and a familiarity meter); the camera dives into her phone and rises back out ——
const PH = [598, 1622];   // where her phone is in every scene: the point the camera dives into and rises out of
function scenery(c, kind, t) {   // a soft room in the caption blue with a floor; a couple of props tell where she is
  c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920); const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 700); g.addColorStop(0, '#2b4396'); g.addColorStop(1, 'rgba(17,26,82,0)'); c.fillStyle = g; c.fillRect(0, 760, 1080, 1160);
  const fl = c.createLinearGradient(0, 1700, 0, 1920); fl.addColorStop(0, '#1e2a6a'); fl.addColorStop(1, '#141c4c'); c.fillStyle = fl; c.fillRect(0, 1700, 1080, 220); c.fillStyle = 'rgba(246,239,220,.12)'; c.fillRect(0, 1700, 1080, 4);
  if (kind === 'home') { c.fillStyle = '#e9dcc0'; c.fillRect(120, 980, 240, 300); c.fillStyle = '#16205a'; c.fillRect(134, 994, 212, 272); for (let i = 0; i < 3; i++) { c.fillStyle = '#24306e'; c.fillRect(140 + i * 70, 1140 - (i % 2) * 50, 60, 126 + (i % 2) * 50); if (i !== 1) { c.fillStyle = 'rgba(255,214,140,.7)'; c.fillRect(156 + i * 70, 1170 - (i % 2) * 50, 10, 12); } } c.fillStyle = CREAM; c.fillRect(237, 994, 6, 272); glow(c, 900, 1140, 230, .35); c.fillStyle = '#8f98b0'; c.fillRect(897, 1160, 6, 540); c.fillStyle = '#f0d9a8'; c.beginPath(); c.moveTo(850, 1160); c.lineTo(950, 1160); c.lineTo(925, 1095); c.lineTo(875, 1095); c.closePath(); c.fill(); }
  if (kind === 'bus') { c.save(); c.beginPath(); c.roundRect(60, 1000, 960, 300, 40); c.clip(); c.fillStyle = '#f2b68a'; c.fillRect(60, 1000, 960, 300); const off = (t * 360) % 420; for (let i = -1; i < 4; i++) { const bx = 60 + i * 420 - off; c.fillStyle = '#6576b8'; c.fillRect(bx, 1130, 150, 170); c.fillStyle = '#7d86c0'; c.fillRect(bx + 190, 1070, 120, 230); } c.restore(); c.strokeStyle = '#b9bccb'; c.lineWidth = 16; c.beginPath(); c.roundRect(60, 1000, 960, 300, 40); c.stroke(); c.fillStyle = GOLD2; c.fillRect(880, 900, 14, 800); }
  if (kind === 'cafe') { c.fillStyle = '#e9dcc0'; c.fillRect(110, 980, 260, 260); c.fillStyle = '#9fc7f0'; c.fillRect(124, 994, 232, 232); glow(c, 300, 1060, 120, .5); ell(c, 300, 1060, 30, 30, '#ffe08a'); c.fillStyle = WOOD; c.beginPath(); c.ellipse(860, 1520, 140, 26, 0, 0, 7); c.fill(); c.fillRect(852, 1520, 16, 180); c.fillStyle = CREAM; c.fillRect(840, 1462, 48, 54); c.strokeStyle = CREAM; c.lineWidth = 7; c.beginPath(); c.arc(892, 1490, 12, -1.3, 1.3); c.stroke(); for (let k = 0; k < 2; k++) { c.strokeStyle = 'rgba(246,239,220,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(856 + k * 16, 1450); c.quadraticCurveTo(848 + k * 16 + Math.sin(t * 3 + k) * 6, 1420, 860 + k * 16, 1395); c.stroke(); } }
  if (kind === 'gym') { c.fillStyle = '#2b3a80'; c.beginPath(); c.roundRect(130, 1660, 280, 26, 13); c.fill(); for (let k = 0; k < 3; k++) { c.fillStyle = '#3c4c98'; c.fillRect(760, 1420 + k * 70, 220, 10); c.fillStyle = '#5a6aa8'; for (const d of [-1, 1]) c.fillRect(870 + d * 70 - 10, 1400 + k * 70, 20, 50); } }
  if (kind === 'park') { for (const [tx, s] of [[180, 1], [900, 1.15]]) { c.fillStyle = '#6e4a2c'; c.fillRect(tx - 12 * s, 1460, 24 * s, 240); ell(c, tx, 1400, 100 * s, 110 * s, '#4f8a5e'); ell(c, tx - 36 * s, 1350, 60 * s, 60 * s, '#5f9a6e'); } }
  if (kind === 'bed') { c.fillStyle = '#e9dcc0'; c.fillRect(780, 980, 200, 220); c.fillStyle = '#0b1440'; c.fillRect(792, 992, 176, 196); ell(c, 900, 1050, 26, 26, '#f1e7cf'); ell(c, 910, 1042, 24, 24, '#0b1440'); glow(c, 190, 1360, 180, .35); c.fillStyle = '#f0d9a8'; c.beginPath(); c.moveTo(150, 1360); c.lineTo(230, 1360); c.lineTo(214, 1310); c.lineTo(166, 1310); c.closePath(); c.fill(); c.fillStyle = '#8f98b0'; c.fillRect(186, 1360, 8, 340); }
  if (kind === 'bath') { for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) { c.fillStyle = (r + k) % 2 ? 'rgba(246,239,220,.05)' : 'rgba(246,239,220,.09)'; c.fillRect(k * 110, 1260 + r * 110, 108, 108); } c.fillStyle = WOOD; c.fillRect(700, 1420, 300, 16); }
  if (kind === 'shop') { c.fillStyle = WOOD; c.fillRect(60, 1290, 960, 16); }
}
function her(c, t, o = {}) { mascot(c, HER({ x: 540, y: 1790, f: .25, smile: o.smile ?? 1, look: o.look ?? .3, blink: blinkAt(t, 3), handR: o.hand === false ? undefined : [PH[0] - 4, PH[1] + 12], ...o.P })); if (o.hand !== false) handPhone(c, PH[0], PH[1], 1.15); }
// the main visual: her phone, big and clean; the ad; the familiarity meter under it
function bigPhone(c, t, o = {}) {
  bg(c, '#2c46a0'); const x = 540, y = 1230, w = 470, h = 840;
  c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 14, y - h / 2 + 18, w, h, 60); c.fill(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 60); c.fill(); c.fillStyle = '#efe6d2'; c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 46); c.fill();
  c.save(); c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 46); c.clip();
  const pw = w - 80, ph = pw * 1.18, gap = 30, sc = o.scroll || 0;
  for (let i = -1; i < 5; i++) { const py = y - h / 2 + 80 + i * (ph + gap) - (sc % (ph + gap)), n = i + Math.floor(sc / (ph + gap)), isAd = o.feed ? n % 3 === 1 : i === 0; if (!o.feed && i !== 0) continue;
    const py2 = o.feed ? py : y - ph / 2 - 20; c.fillStyle = '#fbf6ea'; c.beginPath(); c.roundRect(x - pw / 2, py2, pw, ph, 20); c.fill(); ell(c, x - pw / 2 + 32, py2 + 32, 16, 16, isAd ? GOLD : '#9aa0b8'); c.fillStyle = 'rgba(28,36,80,.3)'; c.fillRect(x - pw / 2 + 60, py2 + 24, 110, 14);
    c.fillStyle = isAd ? '#1f2c62' : ['#d9ccab', '#c9d6b0', '#e6c3b8'][(n % 3 + 3) % 3]; c.fillRect(x - pw / 2 + 14, py2 + 64, pw - 28, pw - 28);
    if (isAd) { c.save(); if (o.grey > 0) c.filter = `grayscale(${o.grey}) blur(${o.grey * 10 * K}px)`; glow(c, x, py2 + 64 + (pw - 28) / 2, 150, .35); jar(c, x, py2 + 64 + (pw - 28) * .8, 1.25); c.restore(); if (o.gold) { c.strokeStyle = GOLD; c.lineWidth = 8; c.beginPath(); c.roundRect(x - pw / 2 - 4, py2 - 4, pw + 8, ph + 8, 22); c.stroke(); }
      c.fillStyle = o.buyOff ? '#b9bccb' : GOLD; c.beginPath(); c.roundRect(x - pw / 2 + 14, py2 + ph - 70, pw - 28, 50, 25); c.fill(); }
    else { ell(c, x - pw * .14, py2 + 64 + pw * .3, pw * .12, pw * .12, 'rgba(255,255,255,.5)'); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x - pw / 2 + 14, py2 + 64 + pw - 28); c.lineTo(x - pw * .05, py2 + 64 + pw * .4); c.lineTo(x + pw / 2 - 14, py2 + 64 + pw - 28); c.fill(); } }
  c.restore(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - 60, y - h / 2 + 30, 120, 26, 13); c.fill();
  if (o.meter != null) { const mx = x, my = y + h / 2 + 80, mw = 460; c.fillStyle = 'rgba(246,239,220,.15)'; c.beginPath(); c.roundRect(mx - mw / 2, my - 18, mw, 36, 18); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.roundRect(mx - mw / 2, my - 18, Math.max(36, mw * o.meter), 36, 18); c.fill(); eyeIcon(c, mx - mw / 2 - 60, my, .4, 1); if (o.meter >= .99) heart(c, mx + mw / 2 + 50, my, 22, 1, '#e8664f'); }
}
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = CREAM; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, NAVY); c.restore(); }

function SHOT_PRODUCT(c, t) {   // the empty jar turns into the brand's jar: exactly what it makes
    const H = HIT, k = E(t, 18.3, .45, .4); bg(c, '#2c46a0'); glow(c, 540, 1300, 320, .35 * Math.min(1, k)); c.save(); c.strokeStyle = GOLD; c.lineWidth = 8; c.globalAlpha = Math.min(1, k); c.beginPath(); c.arc(540, 1310, 300 * Math.min(1, k), 0, 7); c.stroke(); c.restore();
    scaled(c, 540, 1500, Math.min(1.08, k), () => jar(c, 540, 1500, 2.2, { glow: .5 })); if (t > H.offers) spark(c, 540, 1300, t, H.offers, 6, 300, 18); }
function SHOT_SHOP(c, t) {   // in the drugstore: unknown jars, and the familiar one; she takes it first
    const H = HIT, f1 = ss(seg(t, H.first - .3, H.first + .3)), take = ss(seg(t, H.take, H.take + .5)); scenery(c, 'shop', t);
    [[160, 1], [320, 2], [680, 1], [840, 2]].forEach(([x, p]) => { c.save(); c.globalAlpha = 1 - .45 * f1; jar(c, x, 1290, .85, { plain: p }); c.restore(); });
    const bx = lerp(500, 640, take), by = lerp(1290, 1690, take) - 60 * f1 * (1 - take); jar(c, bx, by, lerp(.85, 1, f1), { glow: f1 }); if (f1 >= 1) spark(c, bx, by - 80, t, H.first + .3, 6, 120, 14);
    mascot(c, HER({ x: 760, y: 1790, f: -.35, smile: f1 > .5 ? 1 : .8, look: -.3, blink: blinkAt(t, 3), handL: take > 0 ? reach([710, 1640], [bx + 50, by - 60], Math.min(1, take * 2)) : undefined })); }
function SHOT_EYE(c, t) {   // the Mere Exposure Effect: an eye opens, the mark its pupil; rings of the mark ripple out
    const H = HIT, op = ss(seg(t, 23.9, 24.4)); bg(c);
    for (let k = 0; k < 5; k++) { const u = ((t - H.mere) * .55 + k / 5) % 1; if (t > H.mere - .1) { c.save(); c.globalAlpha = .8 * (1 - u) * ss(seg(t, H.mere - .1, H.mere + .3)); c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.arc(540, 1300, 190 + u * 320, 0, 7); c.stroke(); c.restore(); for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2 + k; if (u > .15 && u < .8) { c.save(); c.globalAlpha = .7 * (1 - u); mark(c, 540 + Math.cos(a) * (190 + u * 320), 1300 + Math.sin(a) * (190 + u * 320), 26); c.restore(); } } } }
    c.save(); c.fillStyle = CREAM; c.beginPath(); c.moveTo(250, 1300); c.quadraticCurveTo(540, 1300 - 270 * op, 830, 1300); c.quadraticCurveTo(540, 1300 + 270 * op, 250, 1300); c.fill(); if (op > .3) { c.clip(); ell(c, 540, 1300, 115, 115, NAVY); mark(c, 540, 1300, 86); } c.restore(); }
function SHOT_CHART(c, t) {   // again and again: phones land on the timeline; familiarity climbs; liking follows; she smiles beside it
    const H = HIT; bg(c); const x0 = 170, x1 = 720, y0 = 1540, y1 = 1000, ax = ss(seg(t, 27.5, 28.1));
    c.strokeStyle = 'rgba(246,239,220,.7)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, lerp(y0, y1 - 20, ax)); c.lineTo(x0, y0); c.lineTo(lerp(x0, x1 + 20, ax), y0); c.stroke();
    H.again.forEach((at, i) => { const k = E(t, at, .3, .45); if (k > 0) scaled(c, x0 + 90 + i * 140, y0 + 80, Math.min(1.12, k), () => { handPhone(c, x0 + 90 + i * 140, y0 + 80, 1.2); mark(c, x0 + 112 + i * 140, y0 + 46, 14); }); });
    const line = (p, col, lift) => { if (p <= 0) return null; c.save(); c.strokeStyle = col; c.lineWidth = 12; c.lineJoin = 'round'; c.beginPath(); const n = 30; let ex = 0, ey = 0; for (let i = 0; i <= n * p; i++) { const u = i / n; ex = x0 + 20 + u * (x1 - x0 - 40); ey = y0 - 20 - (1 - Math.exp(-u * 2.4)) / (1 - Math.exp(-2.4)) * (y0 - y1 - 60) * lift; i ? c.lineTo(ex, ey) : c.moveTo(ex, ey); } c.stroke(); c.restore(); glow(c, ex, ey, 50, .5); return [ex, ey]; };
    const fam = ss(seg(t, H.grow, H.grow + 1.0)), lik = ss(seg(t, H.like, H.like + 1.0)); const e1 = line(fam, GOLD, 1); if (e1 && fam >= 1) mark(c, e1[0] + 10, e1[1] - 46, 30 * Math.min(1.1, E(t, H.grow + 1.0, .3, .5)));
    const e2 = line(lik, '#e8664f', .62); if (e2 && lik >= 1) heart(c, e2[0] + 10, e2[1] - 40, 34, Math.min(1.12, E(t, H.like + 1.0, .3, .5)), '#e8664f');
    mascot(c, HER({ x: 880, y: 1790, s: 1.7, f: -.4, smile: lerp(.8, 1, Math.max(fam, lik)), blink: blinkAt(t, 3), look: -.2 })); }
// —— 0..15 s: half and half: her day on the left, her phone on the right, scrolling ——
const LP = { x: 54, y: 860, w: 470, h: 940 };   // the left panel
function panelPlace(c, kind, t) {   // a place, drawn small inside the left panel (local coordinates 0..470 × 0..940)
  const g = c.createLinearGradient(0, 0, 0, 940); g.addColorStop(0, '#22348a'); g.addColorStop(1, '#2d4596'); c.fillStyle = g; c.fillRect(0, 0, 470, 940); c.fillStyle = '#1b2660'; c.fillRect(0, 820, 470, 120); c.fillStyle = 'rgba(246,239,220,.12)'; c.fillRect(0, 820, 470, 3);
  if (kind === 'home') { c.fillStyle = '#e9dcc0'; c.fillRect(40, 200, 150, 190); c.fillStyle = '#16205a'; c.fillRect(50, 210, 130, 170); c.fillStyle = '#24306e'; c.fillRect(56, 300, 40, 80); c.fillRect(110, 270, 50, 110); c.fillStyle = 'rgba(255,214,140,.7)'; c.fillRect(70, 320, 8, 10); c.fillStyle = CREAM; c.fillRect(112, 210, 5, 170); glow(c, 400, 260, 140, .35); c.fillStyle = '#8f98b0'; c.fillRect(398, 280, 5, 540); c.fillStyle = '#f0d9a8'; c.beginPath(); c.moveTo(366, 280); c.lineTo(436, 280); c.lineTo(420, 236); c.lineTo(382, 236); c.closePath(); c.fill(); }
  if (kind === 'bus') { c.save(); c.beginPath(); c.roundRect(20, 180, 430, 220, 30); c.clip(); c.fillStyle = '#f2b68a'; c.fillRect(20, 180, 430, 220); const off = (t * 300) % 300; for (let i = -1; i < 3; i++) { const bx = 20 + i * 300 - off; c.fillStyle = '#6576b8'; c.fillRect(bx, 290, 110, 110); c.fillStyle = '#7d86c0'; c.fillRect(bx + 140, 240, 90, 160); } c.restore(); c.strokeStyle = '#b9bccb'; c.lineWidth = 12; c.beginPath(); c.roundRect(20, 180, 430, 220, 30); c.stroke(); c.fillStyle = GOLD2; c.fillRect(420, 120, 12, 700); }
  if (kind === 'cafe') { c.fillStyle = '#e9dcc0'; c.fillRect(30, 200, 160, 160); c.fillStyle = '#9fc7f0'; c.fillRect(40, 210, 140, 140); glow(c, 140, 260, 70, .5); ell(c, 140, 260, 20, 20, '#ffe08a'); c.fillStyle = WOOD; c.beginPath(); c.ellipse(390, 660, 90, 18, 0, 0, 7); c.fill(); c.fillRect(384, 660, 12, 160); c.fillStyle = CREAM; c.fillRect(372, 616, 36, 42); c.strokeStyle = CREAM; c.lineWidth = 6; c.beginPath(); c.arc(412, 636, 10, -1.3, 1.3); c.stroke(); }
  if (kind === 'gym') { for (let k = 0; k < 3; k++) { c.fillStyle = '#3c4c98'; c.fillRect(300, 520 + k * 60, 150, 8); c.fillStyle = '#5a6aa8'; for (const d of [-1, 1]) c.fillRect(375 + d * 50 - 8, 502 + k * 60, 16, 42); } c.fillStyle = '#2b3a80'; c.beginPath(); c.roundRect(30, 800, 180, 20, 10); c.fill(); }
  if (kind === 'park') { c.fillStyle = '#3f6b4a'; c.fillRect(0, 820, 470, 120); for (const [tx, s] of [[70, .8], [400, 1]]) { c.fillStyle = '#6e4a2c'; c.fillRect(tx - 10 * s, 560, 20 * s, 260); ell(c, tx, 500, 90 * s, 100 * s, '#4f8a5e'); } }
  if (kind === 'bed') { c.fillStyle = '#e9dcc0'; c.fillRect(300, 200, 140, 150); c.fillStyle = '#0b1440'; c.fillRect(310, 210, 120, 130); ell(c, 380, 260, 20, 20, '#f1e7cf'); ell(c, 388, 254, 18, 18, '#0b1440'); glow(c, 70, 520, 110, .4); c.fillStyle = '#f0d9a8'; c.beginPath(); c.moveTo(40, 520); c.lineTo(100, 520); c.lineTo(88, 482); c.lineTo(52, 482); c.closePath(); c.fill(); c.fillStyle = '#8f98b0'; c.fillRect(67, 520, 6, 300); }
}
const SPLIT_PLACES = () => { const H = HIT; return [[0, 'home'], [H.unk - .2, 'bus'], [H.second - .2, 'cafe'], [H.few, 'gym'], [H.few + .55, 'park'], [H.few + 1.1, 'bed']]; };
function scrollerPhone(c, t, x, y, w, h, o) {   // her phone, big: the feed scrolls up with each swipe of her thumb; the ad comes past
  c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 12, y - h / 2 + 16, w, h, 54); c.fill(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 54); c.fill(); c.fillStyle = '#efe6d2'; c.beginPath(); c.roundRect(x - w / 2 + 16, y - h / 2 + 16, w - 32, h - 32, 42); c.fill();
  c.save(); c.beginPath(); c.roundRect(x - w / 2 + 16, y - h / 2 + 16, w - 32, h - 32, 42); c.clip();
  const pw = w - 70, ph = pw * 1.2, step = ph + 26, sc = o.scroll, first = Math.floor(sc / step);
  for (let n = first - 1; n < first + 4; n++) { const py = y - h / 2 + 70 + n * step - sc, isAd = o.adAt.includes(n);
    c.fillStyle = '#fbf6ea'; c.beginPath(); c.roundRect(x - pw / 2, py, pw, ph, 18); c.fill(); ell(c, x - pw / 2 + 28, py + 28, 14, 14, isAd ? GOLD : '#9aa0b8'); c.fillStyle = 'rgba(28,36,80,.3)'; c.fillRect(x - pw / 2 + 52, py + 21, 96, 13);
    c.fillStyle = isAd ? '#1f2c62' : ['#d9ccab', '#c9d6b0', '#e6c3b8', '#b8c6e6'][((n % 4) + 4) % 4]; c.fillRect(x - pw / 2 + 12, py + 56, pw - 24, pw - 24);
    if (isAd) { c.save(); const gr = o.grey(n); if (gr > 0) c.filter = `grayscale(${gr}) blur(${gr * 9 * K}px)`; glow(c, x, py + 56 + (pw - 24) / 2, 130, .35); jar(c, x, py + 56 + (pw - 24) * .8, 1.05); c.restore(); if (o.gold(n)) { c.strokeStyle = GOLD; c.lineWidth = 7; c.beginPath(); c.roundRect(x - pw / 2 - 4, py - 4, pw + 8, ph + 8, 20); c.stroke(); } c.fillStyle = o.buyOff ? '#b9bccb' : GOLD; c.beginPath(); c.roundRect(x - pw / 2 + 12, py + ph - 62, pw - 24, 44, 22); c.fill(); }
    else { ell(c, x - pw * .14, py + 56 + pw * .3, pw * .11, pw * .11, 'rgba(255,255,255,.5)'); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x - pw / 2 + 12, py + 56 + pw - 24); c.lineTo(x - pw * .05, py + 56 + pw * .4); c.lineTo(x + pw / 2 - 12, py + 56 + pw - 24); c.fill(); } }
  // her thumb: a soft dot sliding up the screen on each swipe
  if (o.thumb != null) { const u = o.thumb; if (u > 0 && u < 1) { const ty = lerp(y + h * .3, y - h * .15, ss(u)); c.fillStyle = `rgba(255,255,255,${.55 * Math.sin(u * Math.PI)})`; c.beginPath(); c.arc(x + w * .18, ty, 34, 0, 7); c.fill(); c.strokeStyle = `rgba(255,255,255,${.35 * Math.sin(u * Math.PI)})`; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + w * .18, ty + 30); c.lineTo(x + w * .18, Math.min(y + h * .3, ty + 140)); c.stroke(); } }
  c.restore(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - 50, y - h / 2 + 26, 100, 22, 11); c.fill();
}
// the swipes: [time, how far], each one a flick of her thumb
const SWIPES = () => { const H = HIT, sw = [.5, 1.25, H.seen - .45, 2.15, H.insta - .45, 3.3, H.never - .5, 4.9, H.unk + .2, H.unk + 1.3, H.second + .2, H.few - .1, H.few + .45, H.few + 1.0]; return sw; };
const AD_AT = [3, 5, 7, 9, 11, 12, 13, 14];
const SHOT = {
  split(c, t) {   // her day on the left (the place changes around her), her phone on the right (the feed scrolls with her thumb; the ad keeps coming back)
    const H = HIT; bg(c, '#26398c');
    const sw = SWIPES(), step = (420 - 70) * 1.2 + 26; let scroll = 0, thumb = null; sw.forEach(s => { scroll += step * ss(clamp((t - s) / .35)); if (t > s - .12 && t < s + .4) thumb = (t - s + .12) / .52; });
    // the left panel: her, in each place
    const PL = SPLIT_PLACES(); let pi = 0; while (pi + 1 < PL.length && t >= PL[pi + 1][0]) pi++;
    c.save(); c.translate(LP.x, LP.y); c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(10, 14, LP.w, LP.h, 36); c.fill(); c.beginPath(); c.roundRect(0, 0, LP.w, LP.h, 36); c.clip();
    panelPlace(c, PL[pi][1], t); if (pi > 0) { const w = ss(clamp((t - PL[pi][0]) / .3)); if (w < 1) { c.save(); c.beginPath(); c.rect(0, 0, LP.w * (1 - w), LP.h); c.clip(); panelPlace(c, PL[pi - 1][1], t); c.restore(); c.fillStyle = GOLD; c.fillRect(LP.w * (1 - w) - 4, 0, 8, LP.h); } }
    const smile = t > H.name ? 1 : t > H.second ? .9 : .75; mascot(c, HER({ x: 235, y: 905, s: 1.55, f: .2, smile, look: .35, blink: blinkAt(t, 3), handR: [278, 800] })); handPhone(c, 282, 790, .95); if (thumb != null) glow(c, 282, 790, 50, .45 * Math.sin(clamp(thumb) * Math.PI));
    c.restore(); c.strokeStyle = 'rgba(246,239,220,.25)'; c.lineWidth = 4; c.beginPath(); c.roundRect(LP.x, LP.y, LP.w, LP.h, 36); c.stroke();
    // the right: her phone, big
    const px = 790, py = 1270;
    scrollerPhone(c, t, px, py, 420, 800, { scroll, adAt: AD_AT, thumb, grey: n => n === 9 ? 1 : n === 11 ? KF(t, [[H.second, .6], [H.memo, .15]]) : 0, gold: n => n >= 11, buyOff: false });
    // the badges: +1, +1; the buy button left alone; unknown; pinned; familiar: the bell
    [H.seen, H.insta].forEach((at, i) => { const k = E(t, at + .05, .3, .5) * (1 - ss(seg(t, at + .8, at + 1.0))); if (k > 0) scaled(c, 985, 940, Math.min(1.12, k), () => { ell(c, 985, 940, 44, 44, GOLD); text(c, '+1', 985, 942, 38, NAVY); }); });
    badge(c, 'x', 985, 1560, 40, E(t, H.never, .3, .5) * (1 - ss(seg(t, H.unk - .3, H.unk))));
    badge(c, 'q', 985, 940, 40, E(t, H.q, .3, .5) * (1 - ss(seg(t, H.second, H.second + .2))));
    badge(c, 'pin', 985, 940, 40, E(t, H.memo, .3, .5) * (1 - ss(seg(t, H.few - .1, H.few + .1))));
    const bk = E(t, H.bell, .3, .45); if (bk > 0) { badge(c, 'bell', 985, 940, 42 * Math.min(1.1, bk), 1); for (let q = 0; q < 2; q++) { c.strokeStyle = `rgba(236,189,74,${.7 * Math.max(0, 1 - (t - H.bell) / 1.4)})`; c.lineWidth = 6; c.beginPath(); c.arc(985, 940, 62 + q * 22, -.6, .6); c.stroke(); } }
    // the familiarity meter under the phone
    const mt = KF(t, [[H.unk, 0], [H.unk + .6, .12], [H.second + .2, .12], [H.second + .7, .4], [H.few, .4], [H.few + .3, .58], [H.few + .85, .74], [H.few + 1.4, .9], [H.name, 1]]); const mx = 790, my = 1730, mw = 340;
    if (t > H.unk - .2) { c.save(); c.globalAlpha = ss(seg(t, H.unk - .2, H.unk + .2)); c.fillStyle = 'rgba(246,239,220,.15)'; c.beginPath(); c.roundRect(mx - mw / 2, my - 16, mw, 32, 16); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.roundRect(mx - mw / 2, my - 16, Math.max(32, mw * mt), 32, 16); c.fill(); eyeIcon(c, mx - mw / 2 - 46, my, .34, 1); if (mt >= .99) heart(c, mx + mw / 2 + 40, my, 20, 1, '#e8664f'); c.restore(); }
  },
  recog(c, t) {   // from stranger to familiar: she stands on the left; the ad swoops in beside her each time she sees it: first a grey blur (a question by her), then clearer (she notices: a pin), then again and again, brighter, until she smiles and it rings a bell
    const H = HIT; bg(c, '#2c46a0');
    const visits = [[H.unk - .05, H.second - .45, 1, 'R'], [H.second - .2, H.few - .2, .3, 'T'], [H.few, H.few + .5, 0, 'R'], [H.few + .55, H.few + 1.05, 0, 'T'], [H.few + 1.1, 99, 0, 'R']];
    const cx = 750, cy = 1170, cw = 360; let lit = 0;
    visits.forEach(([a, b, grey, from], i) => { if (t < a || t > b + .4) return; const inn = ss(seg(t, a, a + .35)), out = ss(seg(t, b, b + .35)); if (out >= 1) return; const dx = from === 'R' ? 520 : from === 'L' ? -520 : 0, dy = from === 'T' ? -500 : 0;
      const x = cx + dx * (1 - inn) + 600 * out, y = cy + dy * (1 - inn) - 140 * out, rot = (1 - inn) * (from === 'T' ? -.2 : .3) + out * .25, al = Math.min(inn * 1.5, 1 - out);
      c.save(); c.globalAlpha = al; c.translate(x, y); c.rotate(rot); c.translate(-x, -y); const ch = cw * 1.22;
      if (i >= 2) glow(c, x, y, 260, .25 + .1 * i); c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - cw / 2 + 10, y - ch / 2 + 14, cw, ch, 22); c.fill(); c.fillStyle = '#fbf6ea'; c.beginPath(); c.roundRect(x - cw / 2, y - ch / 2, cw, ch, 22); c.fill();
      ell(c, x - cw / 2 + 32, y - ch / 2 + 32, 15, 15, grey > .5 ? '#9aa0b8' : GOLD); c.fillStyle = 'rgba(28,36,80,.3)'; c.fillRect(x - cw / 2 + 58, y - ch / 2 + 25, 110, 14); c.fillStyle = '#1f2c62'; c.fillRect(x - cw / 2 + 14, y - ch / 2 + 62, cw - 28, cw - 28);
      c.save(); if (grey > 0) c.filter = `grayscale(${grey}) blur(${grey * 10 * K}px)`; glow(c, x, y - ch / 2 + 62 + (cw - 28) / 2, 120, .35); jar(c, x, y - ch / 2 + 62 + (cw - 28) * .8, 1.15); c.restore();
      if (i >= 2) { c.strokeStyle = GOLD; c.lineWidth = 8; c.beginPath(); c.roundRect(x - cw / 2 - 4, y - ch / 2 - 4, cw + 8, ch + 8, 24); c.stroke(); } c.fillStyle = GOLD; c.beginPath(); c.roundRect(x - cw / 2 + 14, y + ch / 2 - 62, cw - 28, 44, 22); c.fill(); c.restore();
      if (i === 1) badge(c, 'pin', cx + 150, cy - 210, 40, E(t, H.memo, .3, .5) * (1 - out)); });
    // her: blank at first, then noticing, then smiling
    const notice = t > H.memo - .1 && t < H.few, fam = ss(seg(t, H.name - .2, H.name + .3));
    mascot(c, HER({ x: 300, y: 1790, s: 2.2, f: .45, smile: t < H.second ? .75 : lerp(.85, 1, fam), o: notice ? .6 : 0, look: .35, blink: blinkAt(t, 3), handR: [380, 1640] })); handPhone(c, 384, 1632, 1.2);
    badge(c, 'q', 470, 1180, 44, E(t, H.q, .3, .5) * (1 - ss(seg(t, H.second - .4, H.second - .1))));
    badge(c, 'ex', 470, 1180, 40, E(t, H.memo, .3, .5) * (1 - ss(seg(t, H.memo + .9, H.memo + 1.2))));
    if (fam > 0) for (let k = 0; k < 3; k++) heart(c, 400 + k * 46, 1220 - 60 * clamp((t - H.name - k * .15) / 1.3), 14 + 4 * k, Math.max(0, Math.sin(clamp((t - H.name - k * .15) / 1.3) * Math.PI)), '#c4566a');
    const bk = E(t, H.bell, .3, .45); if (bk > 0) { badge(c, 'bell', cx + 190, cy - 250, 44 * Math.min(1.1, bk), 1); for (let q = 0; q < 2; q++) { c.strokeStyle = `rgba(236,189,74,${.7 * Math.max(0, 1 - (t - H.bell) / 1.4)})`; c.lineWidth = 6; c.beginPath(); c.arc(cx + 190, cy - 250, 64 + q * 22, -.6, .6); c.stroke(); } }
    // the familiarity meter: it fills a step with every encounter
    const mt = KF(t, [[H.unk, 0], [H.unk + .6, .12], [H.second, .12], [H.second + .5, .4], [H.few, .4], [H.few + .3, .58], [H.few + .85, .74], [H.few + 1.4, .9], [H.name, 1]]), mx = 750, my = 1680, mw = 380;
    c.fillStyle = 'rgba(246,239,220,.15)'; c.beginPath(); c.roundRect(mx - mw / 2, my - 18, mw, 36, 18); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.roundRect(mx - mw / 2, my - 18, Math.max(36, mw * mt), 36, 18); c.fill(); eyeIcon(c, mx - mw / 2 - 52, my, .38, 1); if (mt >= .99) heart(c, mx + mw / 2 + 44, my, 22, 1, '#e8664f');
  },
  mirror(c, t) {   // one day she needs it: at her bathroom mirror; her reflection; the cream jar on the shelf is empty, puff; she touches her dry cheek
    const H = HIT, op = ss(seg(t, H.empty - .2, H.empty + .2)), dry = ss(seg(t, H.dry - .1, H.dry + .4)); scenery(c, 'bath', t);
    const mxc = 720, myc = 1200; c.fillStyle = '#e9dcc0'; c.beginPath(); c.ellipse(mxc, myc, 230, 300, 0, 0, 7); c.fill(); c.save(); c.beginPath(); c.ellipse(mxc, myc, 212, 282, 0, 0, 7); c.clip(); const mg = c.createLinearGradient(mxc - 200, myc - 280, mxc + 200, myc + 280); mg.addColorStop(0, '#5272c4'); mg.addColorStop(1, '#2b4396'); c.fillStyle = mg; c.fillRect(mxc - 220, myc - 290, 440, 580);
      mascot(c, HER({ x: mxc + 30, y: myc + 420, s: 2.0, f: -.5, smile: lerp(.8, 0, dry), sad: .5 * dry, blink: blinkAt(t, 3), handL: dry > .3 ? [mxc - 10, myc + 120] : undefined })); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(mxc - 90, myc - 120, 40, 120, -.4, 0, 7); c.fill(); c.restore();
    c.fillStyle = WOOD; c.fillRect(560, 1530, 330, 16); jar(c, 800, 1530, .9, { open: op > .5, empty: 1, plain: 1 }); if (op > 0 && op < 1) for (let k = 0; k < 5; k++) ell(c, 800 + Math.cos(k * 1.3) * 54 * op, 1400 - 36 * op + Math.sin(k * 1.3) * 26 * op, 12 * (1 - op), 12 * (1 - op), `rgba(246,239,220,${.7 * (1 - op)})`);
    mascot(c, HER({ x: 340, y: 1790, f: .55, smile: lerp(.8, 0, dry), sad: .5 * dry, blink: blinkAt(t, 3), handR: t > H.empty - .4 && t < H.dry ? [760, 1440] : dry > .3 ? [380, 1500] : undefined }));
    if (dry > 0) { c.strokeStyle = `rgba(246,239,220,${.8 * dry})`; c.lineWidth = 4; for (const [dx, dy] of [[-48, 0], [30, 14]]) { c.beginPath(); c.moveTo(370 + dx - 12, 1450 + dy); c.lineTo(370 + dx, 1460 + dy); c.lineTo(370 + dx + 10, 1450 + dy); c.stroke(); } } },
  product: SHOT_PRODUCT, shop: SHOT_SHOP, eye: SHOT_EYE, chart: SHOT_CHART,
  finale(c, t) {   // so a brand should be there regularly in its audience's life: the week fills with the mark; then the women of its audience: one by one their phones light up with it, and they smile
    const H = HIT; bg(c);
    for (let d = 0; d < 7; d++) { const x = 140 + d * 116, y = 960, k = E(t, 36.3 + d * .06, .3, .45); if (k <= 0) continue; scaled(c, x + 50, y + 80, Math.min(1, k), () => { c.fillStyle = 'rgba(246,239,220,.14)'; c.beginPath(); c.roundRect(x, y, 100, 160, 16); c.fill(); }); if (d % 2 === 0 || d === 5) { const kk = E(t, 37.0 + d * .14, .3, .45); if (kk > 0) mark(c, x + 50, y + 80, 32 * Math.min(1.12, kk)); } }
    AUD.forEach(([sk, fem], i) => { const x = 150 + i * 195, k = E(t, 38.3 + i * .08, .35, .45), lt = 39.3 + i * .18, lit = t > lt; if (k <= 0) return;
      scaled(c, x, 1790, Math.min(1, k), () => { mascot(c, { id: 'a' + i, skin: sk, fem, s: 1.35, x, y: 1790, f: .2, smile: lit ? 1 : .75, blink: blinkAt(t, i), handR: [x + 52, 1620] }); handPhone(c, x + 54, 1614, .95); if (lit) { glow(c, x + 54, 1580, 60, .55); mark(c, x + 58, 1520, 20 * Math.min(1.1, E(t, lt, .3, .5))); } }); });
    if (t > 40.35) { glow(c, 540, 1500, 420, .3 * ss(seg(t, 40.35, 40.85))); spark(c, 540, 1450, t, 40.35, 8, 360, 18); } },
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
const DIVE = .6, WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55, PAGE = .6;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if ((kind === 'dive' || kind === 'rise') && dt < DIVE && i > 0) {
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
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
