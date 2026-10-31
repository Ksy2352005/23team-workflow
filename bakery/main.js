// The Bread Clock: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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
    if (kind === 'bulb') { ell(c, x, y - g * .15, g * .55, g * .6, GOLD); c.fillStyle = '#8f98b0'; c.fillRect(x - g * .25, y + g * .4, g * .5, g * .35); }
    if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (kind === 'bell') { c.fillStyle = GOLD; c.beginPath(); c.moveTo(x - g * .7, y + g * .4); c.quadraticCurveTo(x - g * .6, y - g * .8, x, y - g * .8); c.quadraticCurveTo(x + g * .6, y - g * .8, x + g * .7, y + g * .4); c.closePath(); c.fill(); ell(c, x, y + g * .55, g * .18, g * .18, GOLD2); } });
}
// —— bread ——
function loaf(c, x, y, w, o = {}) {   // a crusty loaf, side on; y = its bottom
  const h = w * .52; if (o.glow) glow(c, x, y - h * .5, w * 1.1, .5 * o.glow);
  ell(c, x + w * .03, y - h * .04, w * .5, h * .14, 'rgba(0,0,20,.3)');
  const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, o.stale ? '#9a8a6a' : '#e0a258'); g.addColorStop(1, o.stale ? '#6e6250' : '#9a5a26'); c.fillStyle = g;
  c.beginPath(); c.moveTo(x - w * .5, y); c.quadraticCurveTo(x - w * .52, y - h * 1.0, x, y - h); c.quadraticCurveTo(x + w * .52, y - h * 1.0, x + w * .5, y); c.closePath(); c.fill();
  c.strokeStyle = o.stale ? 'rgba(60,50,40,.5)' : 'rgba(120,60,20,.6)'; c.lineWidth = w * .03; c.lineCap = 'round'; for (const d of [-.22, 0, .22]) { c.beginPath(); c.moveTo(x + w * (d - .07), y - h * .58); c.lineTo(x + w * (d + .07), y - h * .82); c.stroke(); }
  ell(c, x - w * .16, y - h * .76, w * .14, h * .06, 'rgba(255,240,210,.35)', -.3);
  if (o.steam > 0) for (let k = 0; k < 3; k++) { const u = ((o.t || 0) * .6 + k / 3) % 1; c.strokeStyle = `rgba(246,239,220,${.5 * o.steam * Math.sin(u * Math.PI)})`; c.lineWidth = w * .035; c.beginPath(); for (let i = 0; i <= 10; i++) { const v = i / 10; c.lineTo(x + (k - 1) * w * .2 + Math.sin((o.t || 0) * 3 + v * 5 + k) * w * .05, y - h - v * w * .6 - u * w * .2); } c.stroke(); }
}
// —— the sky through the windows: dawn, noon, sunset, night (0..3, blended) ——
const SKY = [['#3a3f8c', '#f6b38c'], ['#3c5fb4', '#9fb6ea'], ['#5a3f8c', '#f29a66'], ['#0b1440', '#22357a']];
function skyAt(k) { const i = Math.min(2, Math.floor(k)), f = k - i, a = SKY[i], b = SKY[i + 1], mix = (p, q) => { const pa = parseInt(p.slice(1), 16), qa = parseInt(q.slice(1), 16), r = n => Math.round(lerp((pa >> n) & 255, (qa >> n) & 255, f)); return `rgb(${r(16)},${r(8)},${r(0)})`; }; return [mix(a[0], b[0]), mix(a[1], b[1])]; }
function skyWindow(c, x, y, w, h, k, t) {   // a window onto the sky at time k: the sun rides an arc, the moon comes out
  const [top, bot] = skyAt(Math.max(0, Math.min(3, k))); c.fillStyle = CREAM; c.fillRect(x - 12, y - 12, w + 24, h + 24); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); const sa = Math.PI * (1 - Math.min(1, k / 2.4)), sx = x + w / 2 + Math.cos(sa) * w * .42, sy = y + h * .85 - Math.sin(sa) * h * .7;
  if (k < 2.6) { glow(c, sx, sy, 120, .5); ell(c, sx, sy, 34, 34, '#ffe08a'); } if (k > 2.4) { const a = clamp((k - 2.4) / .5); c.globalAlpha = a; ell(c, x + w * .7, y + h * .3, 26, 26, '#f1e7cf'); ell(c, x + w * .7 + 10, y + h * .3 - 8, 24, 24, top); c.globalAlpha = 1; }
  c.fillStyle = 'rgba(20,24,70,.85)'; for (const [bx, bw, bh] of [[0, .25, .3], [.24, .3, .45], [.55, .2, .25], [.76, .24, .38]]) c.fillRect(x + bx * w, y + h - bh * h, bw * w, bh * h); c.restore();
  c.fillStyle = CREAM; c.fillRect(x + w / 2 - 6, y, 12, h); c.fillRect(x, y + h / 2 - 6, w, 12);
}
// —— the bakery from outside, and inside ——
function bakeryFront(c, t, o = {}) {
  const k = o.sky ?? 0, [top, bot] = skyAt(k); c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); const g = c.createLinearGradient(0, 760, 0, 1500); g.addColorStop(0, TOP); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(-800, 760, 2680, 900);
  if (k < 1.5) { glow(c, 860, 1200, 300, .5 * (1 - k / 1.5)); ell(c, 860, 1250, 70, 70, '#ffd27a'); }
  c.fillStyle = '#16205a'; c.fillRect(-300, 1100, 1680, 700);
  c.fillStyle = '#7a4a2c'; c.fillRect(700, 880, 80, 200); for (let i = 0; i < 5; i++) { const u = ((t * .4 + i / 5) % 1); ell(c, 740 + Math.sin(u * 6 + i) * 30, 860 - u * 140, 26 + u * 30, 20 + u * 22, `rgba(233,220,192,${.35 * (1 - u)})`); }
  c.fillStyle = '#e9dcc0'; c.fillRect(100, 1060, 880, 680); c.fillStyle = '#d9ccab'; c.fillRect(100, 1500, 880, 240);
  c.fillStyle = WOOD; c.beginPath(); c.moveTo(80, 1080); c.lineTo(540, 900); c.lineTo(1000, 1080); c.closePath(); c.fill();
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(340, 1000, 400, 90, 14); c.fill(); c.strokeStyle = CREAM; c.lineWidth = 5; c.beginPath(); c.roundRect(352, 1012, 376, 66, 10); c.stroke(); c.save(); c.font = '700 50px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('PÉKSÉG', 540, 1046); c.restore();
  for (let s2 = 0; s2 < 11; s2++) { const x0 = 100 + s2 * 80; c.fillStyle = s2 % 2 ? '#8a5d38' : '#efe4c8'; c.fillRect(x0, 1110, 80, 60); c.beginPath(); c.arc(x0 + 40, 1170, 40, 0, Math.PI); c.fill(); }
  c.fillStyle = '#2a2f6a'; c.fillRect(160, 1240, 460, 380); glow(c, 390, 1430, 300, .5 + .2 * (o.lit || 0)); c.fillStyle = WOOD; for (const ry of [1380, 1500]) c.fillRect(170, ry, 440, 14);
  for (let i = 0; i < (o.loaves ?? 6); i++) loaf(c, 220 + (i % 4) * 110, i < 4 ? 1380 : 1500, 90);
  c.fillStyle = CREAM; c.fillRect(380, 1240, 12, 380); c.fillStyle = WOOD; c.fillRect(700, 1260, 200, 480); ell(c, 870, 1500, 10, 10, GOLD);
  c.fillStyle = '#2a3054'; c.fillRect(-300, 1740, 1680, 400); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let r = 0; r < 7; r++) for (let x = -300 + (r % 2) * 40; x < 1400; x += 90) { c.beginPath(); c.roundRect(x, 1756 + r * 34, 80, 26, 8); c.stroke(); }
}
function oven(c, t, x, y, o = {}) {   // a brick oven: the arch, its mouth (fire when lit), a door that opens; y = its base
  const fire = o.fire || 0, door = o.door ?? 0;
  c.fillStyle = '#7a4a2c'; c.beginPath(); c.roundRect(x - 280, y - 520, 560, 520, [140, 140, 10, 10]); c.fill();
  c.strokeStyle = 'rgba(40,20,10,.35)'; c.lineWidth = 3; for (let r = 0; r < 9; r++) for (let k = 0; k < 7; k++) { const bx = x - 270 + k * 80 + (r % 2) * 40; c.strokeRect(bx, y - 500 + r * 56, 80, 56); }
  c.fillStyle = '#1a0e08'; c.beginPath(); c.roundRect(x - 170, y - 330, 340, 230, [120, 120, 0, 0]); c.fill();
  if (fire > 0) { glow(c, x, y - 200, 300, .6 * fire); for (let k = 0; k < 7; k++) { const fx = x - 120 + k * 40, fh = (60 + 40 * Math.sin(t * 9 + k)) * fire; c.fillStyle = k % 2 ? '#ecbd4a' : '#e8664f'; c.beginPath(); c.moveTo(fx - 22, y - 105); c.quadraticCurveTo(fx, y - 105 - fh * 1.4, fx + 22, y - 105); c.fill(); } }
  (o.inside || []).forEach(f => f());
  if (door < 1) { c.save(); c.translate(x - 170, y - 330); c.scale(1 - door, 1); c.fillStyle = '#3a3f55'; c.beginPath(); c.roundRect(0, 0, 340, 230, [120, 120, 0, 0]); c.fill(); c.strokeStyle = '#8f98b0'; c.lineWidth = 6; c.beginPath(); c.roundRect(10, 10, 320, 210, [110, 110, 0, 0]); c.stroke(); ell(c, 300, 130, 14, 14, GOLD); c.restore(); }
  c.fillStyle = '#5a3a22'; c.fillRect(x - 300, y - 20, 600, 30);
}
function bakeryInside(c, t, o = {}) {
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); c.fillStyle = '#1a2563'; c.fillRect(-300, 760, 1680, 1000);
  c.fillStyle = '#e9dcc0'; for (let r = 0; r < 4; r++) for (let k = 0; k < 14; k++) { c.fillStyle = (r + k) % 2 ? '#e9dcc0' : '#d9ccab'; c.fillRect(-300 + k * 120, 1380 + r * 60, 118, 58); }
  if (o.window !== false) skyWindow(c, 80, 880, 340, 380, o.sky ?? 0, t);
  c.fillStyle = '#5a3a22'; c.fillRect(-300, 1640, 1680, 600); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 1670; y < 2200; y += 40) { c.beginPath(); c.moveTo(-300, y); c.lineTo(1380, y); c.stroke(); }
}
function rack(c, x, y, n, o = {}) {   // a wooden rack with three shelves of loaves (n loaves showing)
  c.fillStyle = '#5a3a22'; c.fillRect(x - 230, y - 560, 20, 560); c.fillRect(x + 210, y - 560, 20, 560);
  for (let r = 0; r < 3; r++) { const sy = y - 30 - r * 180; c.fillStyle = WOOD; c.fillRect(x - 240, sy, 480, 18); for (let k = 0; k < 4; k++) { const i = r * 4 + k; if (i < n) loaf(c, x - 165 + k * 110, sy, 96, { stale: o.stale, steam: o.steam ? .6 : 0, t: o.t }); } }
}
function clockFace(c, x, y, r, a, o = {}) {   // a big kitchen clock; a = the hour hand's angle in hours (0..24 shown as 12)
  glow(c, x, y, r * 1.4, .25 + .3 * (o.glow || 0)); ell(c, x + 10, y + 14, r, r, 'rgba(0,0,20,.35)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .06; c.beginPath(); c.arc(x, y, r * .94, 0, 7); c.stroke();
  for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2 - Math.PI / 2; c.fillStyle = NAVY; c.beginPath(); c.arc(x + Math.cos(an) * r * .8, y + Math.sin(an) * r * .8, i % 3 ? r * .02 : r * .04, 0, 7); c.fill(); }
  const ha = (a % 12) / 12 * Math.PI * 2 - Math.PI / 2, ma = ((a * 12) % 12) / 12 * Math.PI * 2 - Math.PI / 2; c.strokeStyle = NAVY; c.lineCap = 'round'; c.lineWidth = r * .06; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ha) * r * .5, y + Math.sin(ha) * r * .5); c.stroke(); c.lineWidth = r * .035; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ma) * r * .72, y + Math.sin(ma) * r * .72); c.stroke(); ell(c, x, y, r * .05, r * .05, GOLD2);
}
function token(c, x, y, r, who, k = 1) {   // a customer's bread token: their face and a little loaf
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + 4, y + 6, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, '#f6efdc'); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke();
    c.save(); c.beginPath(); c.arc(x, y, r * .82, 0, 7); c.clip(); drawMascot(c, { ...cust(who, { x: x - r * .2, y: y + r * 1.6, s: r / 70, smile: 1 }), shadow: false }); c.restore(); loaf(c, x + r * .45, y + r * .55, r * .7); });
}

function ticket(c, x, y, w, who, o = {}) {   // an order ticket hanging from its pin at (x, y): the customer's face and a loaf on the front, a clock on the back
  const h = w * 1.33, fl = o.flip || 0, sx = Math.cos(fl * Math.PI), back = fl > .5, r = w * .08;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(Math.max(.03, Math.abs(sx)), 1); c.translate(-x, -y);
  c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + w * .04, y + 8 + w * .05, w, h, r); c.fill();
  c.fillStyle = back ? '#f1e3c2' : CREAM; c.beginPath(); c.roundRect(x - w / 2, y + 8, w, h, r); c.fill();
  if (!back) { c.fillStyle = GOLD; c.beginPath(); c.roundRect(x - w / 2, y + 8, w, h * .14, [r, r, 0, 0]); c.fill();
    token(c, x, y + 8 + h * .37, w * .25, who, 1); c.fillStyle = 'rgba(28,36,80,.22)'; c.beginPath(); c.roundRect(x - w * .3, y + 8 + h * .62, w * .6, h * .04, 4); c.fill(); c.beginPath(); c.roundRect(x - w * .2, y + 8 + h * .7, w * .4, h * .04, 4); c.fill();
    loaf(c, x, y + 8 + h * .94, w * .42); if (o.check > 0) check(c, x + w * .3, y + 8 + h * .8, w * .14, o.check); }
  else clockFace(c, x, y + 8 + h * .48, w * .34, 7);
  ell(c, x, y + 8 + h * .07, w * .045, w * .045, '#c4566a');
  c.restore();
}

// —— the people ——
const OWNER = o => ({ id: 'baker', skin: 'owner', toque: 1, s: 2.2, smile: .8, ...o });   // the baker in his tall white hat
const CUST = [['blue2', 'long'], ['blue1', null], ['blue3', 'bun'], ['blue2', 'bob'], ['blue1', 'beret'], ['blue3', 'glasses']];
const cust = (i, o) => ({ id: 'c' + i, skin: CUST[i % 6][0], fem: CUST[i % 6][1], s: 2.0, smile: .6, ...o });
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); g.addColorStop(0, col); g.addColorStop(.8, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }

// —— the shots ——
const SHOT = {
  dawn(c, t) {   // a little bakery baked lots of fresh bread every morning: dawn outside, smoke from the chimney; inside, the oven door opens and loaves tumble onto the racks
    const into = ss(seg(t, HIT.into - .2, HIT.into + .3)), glide = ss(seg(t, 0, HIT.into + .2));
    const front = lerpBox([20, 780, 1060, 1860], [60, 840, 1020, 1800], glide), z = Math.min(980 / (front[2] - front[0]), 1100 / (front[3] - front[1])), wx = 540 + (390 - (front[0] + front[2]) / 2) * z, wy = 1310 + (1430 - (front[1] + front[3]) / 2) * z;
    if (into < 1) stage(c, front, 0, () => bakeryFront(c, t, { sky: .1 + t * .1, lit: glide }));
    if (into > 0) { c.save(); c.beginPath(); c.arc(wx, wy, 1500 * into, 0, 7); c.clip(); stage(c, [-40, 780, 1120, 1800], seg(t, 1.3, 3.85), () => { bakeryInside(c, t, { window: false });
      const n = HIT.pour.filter(p => t > p + .25).length; rack(c, 250, 1640, n, { steam: 1, t });
      oven(c, t, 820, 1640, { fire: .6, door: ss(seg(t, 1.4, 1.7)), inside: [() => HIT.pour.forEach((p, i) => { const u = seg(t, p - .1, p + .25); if (u <= 0 || u >= 1) return; const r = Math.floor(i / 4), k = i % 4; loaf(c, lerp(820, 85 + k * 110, u), lerp(1420, 1610 - r * 180, u) - Math.sin(u * Math.PI) * 340, 96, { steam: .5, t }); })] });
      mascot(c, OWNER({ x: 530, y: 1780, s: 1.8, f: .3, smile: 1, blink: blinkAt(t, 1) })); }); c.restore();
      if (into < 1) { c.save(); c.strokeStyle = GOLD; c.globalAlpha = 1 - into; c.lineWidth = 10; c.beginPath(); c.arc(wx, wy, 1500 * into, 0, 7); c.stroke(); c.restore(); } }
  },
  leftover(c, t) {   // but some days, the bread wasn't gone even by evening: a day passes in the window, a couple of customers take one loaf each, the racks stay full
    const k = ss(seg(t, ...HIT.sunarc)) * 3, n = 12 - HIT.buys.filter(b => t > b + .3).length, sad = ss(seg(t, HIT.sad - .3, HIT.sad + .4));
    stage(c, [60, 780, 1040, 1780], 0, () => { bakeryInside(c, t, { sky: k }); rack(c, 760, 1640, n, { stale: k > 2.4 });
      HIT.buys.forEach((tb, i) => { const u = seg(t, tb - .6, tb + .9); if (u <= 0 || u >= 1) return; const P = cust(i + 1, { x: lerp(560, 640, Math.sin(u * Math.PI)), y: 1780, f: u < .5 ? .5 : -.5, walk: 1, phi: u * 10, smile: .6, alpha: Math.sin(u * Math.PI) }); mascot(c, P); });
      mascot(c, OWNER({ x: 400, y: 1780, s: 2.0, f: .3, smile: lerp(.8, 0, sad), sad: .6 * sad, look: .2 * sad, blink: blinkAt(t, 1) })); });
  },
  decide(c, t) {   // the owner decided to change the way he sells completely: a lightbulb, and the hanging sign spins round: pre-order
    const bl = E(t, HIT.bulb, .35, .5), fl = ss(seg(t, HIT.flip, HIT.flipped)), sx = Math.cos(fl * Math.PI);
    bg(c);
    stage(c, [120, 820, 980, 1760], seg(t, 8.6, 14.3), () => { mascot(c, OWNER({ x: 340, y: 1760, s: 2.6, f: .3, smile: bl > .5 ? 1 : .5, look: -.2, blink: blinkAt(t, 1), squash: wob(t, HIT.bulb, .3, 16, .04), handR: fl > 0 && fl < 1 ? [600, 1180] : undefined }));
      if (bl > 0) { glow(c, 340, 920, 150, .5 * Math.min(1, bl)); badge(c, 'bulb', 340, 920, 60, bl); }
      c.strokeStyle = '#8a7a60'; c.lineWidth = 4; c.beginPath(); c.moveTo(720, 900); c.lineTo(720, 1040); c.stroke();
      c.save(); c.translate(720, 1180); c.scale(Math.max(.04, Math.abs(sx)), 1); c.fillStyle = WOOD; c.beginPath(); c.roundRect(-220, -140, 440, 280, 20); c.fill(); c.fillStyle = sx > 0 ? CREAM : '#121a3a'; c.beginPath(); c.roundRect(-196, -116, 392, 232, 14); c.fill();
      if (sx > 0) { loaf(c, -60, 40, 120); loaf(c, 70, 40, 120); c.font = '700 40px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('KÉSZ KENYÉR', 0, -70); }
      else { c.save(); c.font = '700 40px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('ELŐRENDELÉS', 0, -60); clockFace(c, -90, 40, 56, 7 + t); loaf(c, 70, 80, 110); c.restore(); }
      c.restore(); });
  },
  meter(c, t) {   // from then on certain loaves were baked only once enough customers had reserved them: order tickets swing onto the line one by one, the dough rises with each; five: the line glows, the oven lights
    const full = E(t, HIT.full, .35, .5), fire = ss(seg(t, HIT.fire, HIT.fire + .6)), filled = HIT.orders.filter(o => t > o).length;
    stage(c, [40, 800, 1040, 1800], 0, () => { bakeryInside(c, t, { window: false });
      scaled(c, 830, 1640, .72, () => oven(c, t, 830, 1640, { fire, door: fire > .4 ? 1 : 0 }));
      c.strokeStyle = full > 0 ? GOLD : '#b9a888'; c.lineWidth = 5; c.beginPath(); c.moveTo(90, 930); c.quadraticCurveTo(540, 1050, 990, 930); c.stroke(); for (const px of [90, 990]) ell(c, px, 930, 12, 12, WOOD);
      HIT.orders.forEach((to, i) => { const k = E(t, to - .12, .3, .45); if (k <= 0) return; const px = 210 + i * 165, tt = (px - 90) / 900, py = 930 + 120 * tt * (1 - tt), dt = t - to + .12;
        const rot = .38 * Math.sin(dt * 9) * Math.exp(-dt * 2.6) + (full > 0 ? .06 * Math.sin((t - HIT.full) * 12 + i) * Math.exp(-(t - HIT.full) * 2) : 0);
        if (full > 0) glow(c, px, py + 90, 110, .35 * Math.min(1, full));
        scaled(c, px, py, Math.min(1.1, k), () => ticket(c, px, py, 118, i, { rot })); });
      // the counter, the baker behind it, the dough rising in its bowl
      mascot(c, OWNER({ x: 470, y: 1650, s: 1.9, f: -.25, smile: lerp(.5, 1, Math.min(1, filled / 5)), blink: blinkAt(t, 1), squash: HIT.orders.reduce((m, o) => m + wob(t, o, .3, 16, .03), 0), handL: filled >= 5 ? [360, 1440] : undefined }));
      c.fillStyle = '#6e4a2c'; c.fillRect(70, 1560, 540, 230); c.fillStyle = WOOD; c.fillRect(56, 1530, 568, 36); c.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 4; k++) c.fillRect(110 + k * 130, 1600, 8, 160);
      const dk = HIT.orders.reduce((m, o, i) => Math.max(m, (i + 1) * Math.min(1, E(t, o + .1, .35, .55))), 0) / 5, dh = 50 + 110 * dk + (full > 0 ? 14 * Math.sin((t - HIT.full) * 10) * Math.exp(-(t - HIT.full) * 3) : 0);
      const dg = c.createLinearGradient(0, 1500 - dh, 0, 1500); dg.addColorStop(0, '#fbf1da'); dg.addColorStop(1, '#e6cf9f'); c.fillStyle = dg; c.beginPath(); c.ellipse(250, 1490, 110 + 20 * dk, dh, 0, Math.PI, 0); c.fill();
      ell(c, 210, 1490 - dh * .7, 30, 12, 'rgba(255,255,255,.4)', -.3);
      c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(110, 1480); c.lineTo(390, 1480); c.quadraticCurveTo(380, 1530, 340, 1532); c.lineTo(160, 1532); c.quadraticCurveTo(120, 1530, 110, 1480); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(110, 1480, 280, 8);
      if (full > 0) for (let k = 0; k < 4; k++) star(c, 250 + Math.cos(k * 1.7) * 150, 1390 - Math.abs(Math.sin(k * 1.3)) * 80, 16, Math.max(0, Math.sin(clamp((t - HIT.full - k * .08) / .8) * Math.PI))); });
  },
  special(c, t) {   // but there was something special in it: the camera finds one ticket; it turns over: on its back, a clock
    const fl = ss(seg(t, HIT.special - .6, HIT.special - .05)), bang = E(t, HIT.special, .3, .5), sw = .07 * Math.sin((t - 21.3) * 2.4) * (1 - fl);
    stage(c, lerpBox([60, 800, 1020, 1800], [170, 820, 910, 1560], ss(seg(t, 21.3, 22.2))), 0, () => { bakeryInside(c, t, { window: false }); c.fillStyle = 'rgba(17,26,82,.55)'; c.fillRect(-300, 700, 1680, 1300);
      c.strokeStyle = '#b9a888'; c.lineWidth = 5; c.beginPath(); c.moveTo(540, 700); c.lineTo(540, 900); c.stroke(); if (fl > .5) glow(c, 540, 1180, 360, .3 * bang);
      ticket(c, 540, 900, 380, 4, { rot: sw, flip: fl });
      if (bang > 0) { badge(c, 'ex', 760, 960, 56, bang); for (let k = 0; k < 4; k++) star(c, 540 + [-250, 250, -230, 230][k], [1000, 1180, 1360, 1420][k], 18, Math.max(0, Math.sin(clamp((t - HIT.special - k * .1) / .9) * Math.PI))); } });
  },
  clockface(c, t) {   // customers didn't just order bread: they had to choose exactly when it would come out of the oven: her stamped ticket flies up and becomes the oven's clock; she points, the hand sweeps round to seven; ding, her loaf slides out to her
    const tk = E(t, 23.75, .35, .5), st = E(t, HIT.stamp, .3, .5), mo = ss(seg(t, HIT.morph, HIT.morph + .5)), ck = E(t, HIT.morph + .3, .4, .45);
    const sweep = ss(seg(t, ...HIT.hands)), ha = lerp(12, 19, sweep), pick = E(t, HIT.hands[1], .3, .5), door = ss(seg(t, HIT.ding - .1, HIT.ding + .2)), out = ss(seg(t, HIT.ding + .15, HIT.ding + .75));
    const CX = 720, CY = 1050, R0 = 160;
    stage(c, [60, 800, 1020, 1800], 0, () => { bakeryInside(c, t, { window: false });
      scaled(c, CX, 1640, .62, () => oven(c, t, CX, 1640, { fire: .5, door }));
      if (ck > 0) { clockFace(c, CX, CY, R0 * Math.min(1.1, ck), ha, { glow: pick });
        if (sweep > 0) { c.save(); c.strokeStyle = GOLD; c.lineCap = 'round'; c.lineWidth = 16; c.beginPath(); c.arc(CX, CY, R0 * 1.12, -Math.PI / 2, -Math.PI / 2 + (ha - 12) / 12 * Math.PI * 2); c.stroke(); c.restore(); }
        [7, 12, 18].forEach((h, i) => { const k = E(t, HIT.tokens[i], .3, .5); if (k <= 0) return; const an = (h % 12) / 12 * Math.PI * 2 - Math.PI / 2, lx = CX + Math.cos(an) * R0 * 1.42, ly = CY + Math.sin(an) * R0 * 1.42 + 22, chosen = i === 0;
          c.save(); c.globalAlpha = chosen ? 1 : 1 - .65 * pick; scaled(c, lx, ly - 18, Math.min(1.1, k) * (chosen ? 1 + .35 * pick : 1), () => { if (chosen && pick > 0) glow(c, lx, ly - 18, 90, .5 * pick); loaf(c, lx, ly, 70, { steam: chosen ? pick : 0, t }); }); c.restore(); }); }
      const point = ss(seg(t, HIT.hands[0] - .3, HIT.hands[0])) * (1 - ss(seg(t, HIT.ding - .3, HIT.ding)));
      const P = cust(2, { x: 290, y: 1790, s: 2.0, f: .5, smile: lerp(.6, 1, Math.max(pick, out)), blink: blinkAt(t, 9) });
      if (mo < 1) P.handR = [470, 1600]; if (point > 0) P.handR = reach([460, 1575], [425, 1455], point); if (out > .5) P.handR = [430, 1650];
      mascot(c, P);
      if (mo < 1 && tk > 0) { const x = lerp(480, CX, mo), y = lerp(1390, CY - 80, mo) - Math.sin(mo * Math.PI) * 120; c.save(); c.globalAlpha = 1 - ss(seg(mo, .6, 1)); scaled(c, x, y, Math.min(1.1, tk) * lerp(1, .5, mo), () => ticket(c, x, y, 150, 2, { rot: .05 * Math.sin(t * 3), check: st, flip: ss(seg(mo, .1, .5)) })); c.restore(); }
      if (point > 0 && sweep > 0 && sweep < 1) for (let k = 0; k < 3; k++) star(c, 445 + k * 10, 1430 - k * 26, 10, Math.max(0, Math.sin((t * 4 + k / 3) % 1 * Math.PI)));
      if (t > HIT.ding) { badge(c, 'bell', CX + 200, CY - 150, 46, E(t, HIT.ding, .3, .5)); if (door > .5) loaf(c, lerp(CX, 440, out), lerp(1520, 1650, out) - Math.sin(out * Math.PI) * 70, 120, { steam: 1, t, glow: 1 - .5 * out }); } });
  },
  meals(c, t) {   // some wanted warm bread for breakfast, others for lunch, others for dinner: one table, the sky turns, the table and the guest change with each meal
    const ph = t < HIT.noon - .2 ? 0 : t < HIT.night - .2 ? 1 : 2, k = [.4, 1.2, 3][ph], sw = Math.max(0, Math.sin(clamp((t - [31.8, HIT.noon - .2, HIT.night - .2][ph]) / .35) * Math.PI));
    stage(c, [60, 800, 1040, 1780], 0, () => { bakeryInside(c, t, { window: false }); skyWindow(c, 300, 860, 480, 420, k, t);
      c.fillStyle = WOOD; c.fillRect(160, 1520, 760, 30); c.fillStyle = '#6e4a2c'; c.fillRect(200, 1550, 26, 220); c.fillRect(854, 1550, 26, 220); c.fillStyle = '#efe4c8'; c.fillRect(150, 1500, 780, 24);
      const who = [0, 1, 3][ph]; mascot(c, cust(who, { x: 820, y: 1780, s: 2.0, f: -.4, sit: 0, smile: 1, blink: blinkAt(t, 20 + ph) }));
      loaf(c, 400, 1500, 200, { steam: 1, t });
      if (ph === 0) { c.fillStyle = CREAM; c.beginPath(); c.roundRect(560, 1410, 70, 90, 12); c.fill(); c.strokeStyle = CREAM; c.lineWidth = 10; c.beginPath(); c.arc(640, 1450, 20, -1.3, 1.3); c.stroke(); ell(c, 595, 1418, 30, 8, '#6b3d24'); }
      if (ph === 1) { ell(c, 600, 1490, 80, 18, CREAM); ell(c, 600, 1478, 70, 14, '#e8664f'); }
      if (ph === 2) { c.fillStyle = CREAM; c.fillRect(590, 1380, 22, 120); glow(c, 601, 1360, 90, .6); ell(c, 601, 1362, 10, 18, '#ffd27a'); }
      if (sw > 0) { c.fillStyle = `rgba(17,26,82,${.5 * sw})`; c.fillRect(-200, 760, 1480, 1100); } });
  },
  instead(c, t) {   // instead of trying to sell bread baked in advance, the customers planned when theirs would be ready: the stale pile is crossed out; a day's timeline fills with their pins
    const st = E(t, HIT.stale - .4, .35, .5), x = ss(seg(t, HIT.cross - .2, HIT.cross + .3)), tl = ss(seg(t, 42.4, 43.2));
    bg(c);
    stage(c, lerpBox([250, 1150, 890, 1700], [70, 1060, 1010, 1620], tl), 0, () => {
      if (tl < 1) { c.save(); c.globalAlpha = 1 - tl; for (let i = 0; i < 9; i++) scaled(c, 540, 1600, Math.min(1, st), () => loaf(c, 360 + (i % 4) * 120 + (Math.floor(i / 4) % 2) * 60, 1600 - Math.floor(i / 4) * 80, 130, { stale: 1 })); cross(c, 540, 1460, 240, x); c.restore(); }
      if (tl > 0) { c.save(); c.globalAlpha = tl; const y0 = 1500; c.strokeStyle = CREAM; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(120, y0); c.lineTo(960, y0); c.stroke();
        for (let h = 6; h <= 21; h++) { const px = 120 + (h - 6) / 15 * 840; c.lineWidth = 4; c.beginPath(); c.moveTo(px, y0 - (h % 3 ? 14 : 26)); c.lineTo(px, y0 + (h % 3 ? 14 : 26)); c.stroke(); if (h % 3 === 0) text(c, String(h), px, y0 + 60, 34, 'rgba(246,239,220,.8)'); }
        const k3 = [.4, 1.2, 2.0, 2.6, 3]; for (let i = 0; i < 5; i++) { const ph = [7, 10, 13, 16, 19][i], px = 120 + (ph - 6) / 15 * 840, pk = E(t, HIT.pins[i], .3, .5); if (pk <= 0) continue;
          c.strokeStyle = GOLD; c.lineWidth = 5; c.beginPath(); c.moveTo(px, y0); c.lineTo(px, y0 - 170 * Math.min(1, pk)); c.stroke(); token(c, px, y0 - 230 * Math.min(1, pk), 64, i, pk); loaf(c, px, y0 - 330 * Math.min(1, pk), 88, { steam: .6, t }); }
        c.restore(); } });
  },
  arrive(c, t) {   // they planned when they'd come for it: her planner fills in six o'clock; she walks in just as the oven dings, and the baker hands her the warm loaf at waist height
    const pc = E(t, 47.4, .35, .5), pl = E(t, HIT.plan, .3, .5), pout = ss(seg(t, 50.1, 50.5)), u = seg(t, ...HIT.walk), ding = t > HIT.ding2, out = ss(seg(t, HIT.ding2, HIT.ding2 + .3)), hand = ss(seg(t, HIT.hand + .1, HIT.hand + .8));
    stage(c, [40, 780, 1060, 1800], 0, () => { bakeryInside(c, t, { window: false }); oven(c, t, 800, 1640, { fire: .5, door: ding ? 1 : 0 });
      if (pc > 0 && pout < 1) { c.save(); c.globalAlpha = 1 - pout; scaled(c, 300, 1140, pc * (1 - .3 * pout), () => { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(158, 988, 300, 320, 22); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(150, 980, 300, 320, 22); c.fill(); c.fillStyle = '#c4566a'; c.beginPath(); c.roundRect(150, 980, 300, 70, [22, 22, 0, 0]); c.fill();
        for (const rx of [200, 400]) ell(c, rx, 980, 10, 18, '#8f98b0');
        if (pl <= 0) text(c, '– – : – –', 300, 1150, 54, 'rgba(28,36,80,.35)'); else { glow(c, 300, 1150, 160, .35 * Math.min(1, pl)); scaled(c, 300, 1150, Math.min(1.15, pl), () => text(c, '18:00', 300, 1150, 78, NAVY)); }
        loaf(c, 300, 1268, 80); }); c.restore(); }
      const B = OWNER({ x: 560, y: 1780, s: 2.0, f: -.3, smile: 1, blink: blinkAt(t, 1) }); if (out > 0) B.handR = [650, 1650]; if (hand > 0) { B.handL = reach([470, 1650], [450, 1650], hand); B.handR = reach([650, 1650], [480, 1650], hand); } mascot(c, B);
      const P = cust(2, { x: lerp(110, 300, ss(u)), y: 1790, f: .5, walk: u > 0 && u < 1 ? 1 : 0, phi: u * 12, smile: hand > .5 ? 1 : .7, alpha: clamp((t - HIT.walk[0] + .3) / .3), blink: blinkAt(t, 9) }); if (hand > .6) P.handR = [410, 1650]; if (t > HIT.walk[0] - .3) mascot(c, P);
      if (ding) { badge(c, 'bell', 800, 1030, 48, E(t, HIT.ding2, .3, .5)); const lx = hand > 0 ? lerp(660, 430, hand) : lerp(800, 660, out), ly = hand > 0 ? 1650 - Math.sin(hand * Math.PI) * 30 : lerp(1440, 1650, out) - Math.sin(out * Math.PI) * 60; loaf(c, lx, ly, 140, { steam: 1, t, glow: 1 - hand * .5 }); } });
  },
  ending(c, t) {   // less bread wasted: the bin lid lifts on nothing; more customers came back: the bakery at dusk, one after another they step in at the glowing door
    const bin = ss(seg(t, HIT.bin - .4, HIT.bin)), out = ss(seg(t, 55.6, 56.1)), gl = ss(seg(t, HIT.glow - .3, HIT.glow + .6));
    bg(c);
    if (out < 1) { c.save(); c.globalAlpha = 1 - out; stage(c, [180, 860, 900, 1740], 0, () => { spot(c, 540, 1700, 220);
      c.fillStyle = '#8f98b0'; c.beginPath(); c.moveTo(370, 1310); c.lineTo(710, 1310); c.lineTo(670, 1700); c.lineTo(410, 1700); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.18)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(430 + k * 62, 1360, 26, 300, 13); c.fill(); }
      ell(c, 540, 1310, 170, 34, '#2a2f45'); ell(c, 540, 1316, 150, 24, '#1b1f33');
      c.save(); c.translate(712, 1300); c.rotate(bin * 1.15); c.fillStyle = '#6b6f86'; c.beginPath(); c.roundRect(-350, -26, 360, 32, 14); c.fill(); c.beginPath(); c.roundRect(-205, -50, 60, 28, 10); c.fill(); c.restore();
      if (bin > .7) { glow(c, 540, 1180, 180, .3); check(c, 540, 1130, 70, E(t, HIT.bin, .3, .5)); } }); c.restore(); }
    if (out > 0) stage(c, [20, 780, 1060, 1860], 0, () => { bakeryFront(c, t, { sky: 2.4, lit: gl, loaves: 3 });
      let dk = 0; HIT.back.forEach((tb, i) => { const u = seg(t, tb - .55, tb + .25); dk = Math.max(dk, Math.sin(clamp((t - tb + .2) / .8) * Math.PI)); if (u <= 0 || u >= 1) return; mascot(c, cust(i + 2, { x: lerp(975, 810, ss(u)), y: 1800, s: 1.7, f: -.7, walk: 1, phi: u * 8, smile: 1, alpha: Math.min(clamp(u / .25), clamp((1 - u) / .2)) })); });
      c.fillStyle = `rgba(255,224,160,${.45 * dk})`; c.fillRect(700, 1260, 200, 480); if (gl > 0) glow(c, 800, 1480, 420, .35 * gl);
      HIT.back.forEach((tb, i) => heart(c, 800, 1225 - seg(t, tb, tb + 1) * 110, 40, Math.sin(clamp((t - tb) / 1) * Math.PI))); });
  },
};

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['rengeteg','estére','teljesen','előre','lefoglalta','különleges','pontosan','mikor','reggelire','ebédre','vacsorára','maguk','megtervezték','kevesebb','visszatérjen']);
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
