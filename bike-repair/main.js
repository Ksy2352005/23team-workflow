// Story 21, A bicajbolt, ami javított (The Bike Shop That Fixed Instead of Selling): a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, TS } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'ELADVA JAVÍTÁS SZERVIZ ÚJ 899 900 Ft?'), document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC')]);
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

// —— the world: bikes, a repair stand, parts, the shop ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', WOOD2 = '#a6744a', WOOD3 = '#6e4a2c', INKC = '#151018', ROSE = '#c4566a', STEEL = '#8d97b8', RUST = '#8a6a5a';
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
function floor(c) { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, '#0d1d5c'); fl.addColorStop(1, '#071341'); c.fillStyle = fl; c.fillRect(-400, F, 1880, 420); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(-400, F, 1880, 4); }
function line(c, pts, col, w) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
// a bike standing on y, centred on x, facing right; o.old = tired and grey, o.col = the frame colour, o.spin = wheel turn, o.gear = the chain ring colour
function bike(c, x, y, s = 1, o = {}) { const R = 78 * s, bx = x - 120 * s, fx = x + 120 * s, wy = y - R, col = o.col || (o.old ? RUST : GOLD), spin = o.spin || 0;
  for (const wx of [bx, fx]) { c.strokeStyle = '#1a1f3a'; c.lineWidth = 14 * s; c.beginPath(); c.arc(wx, wy, R - 7 * s, 0, 7); c.stroke(); c.strokeStyle = o.old ? '#6b7290' : STEEL; c.lineWidth = 3 * s; c.beginPath(); c.arc(wx, wy, R - 16 * s, 0, 7); c.stroke();
    c.lineWidth = 2 * s; for (let k = 0; k < 8; k++) { const a = spin + k * Math.PI / 4; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * (R - 16 * s), wy + Math.sin(a) * (R - 16 * s)); c.stroke(); } ell(c, wx, wy, 7 * s, 7 * s, STEEL); }
  const px = x - 10 * s, py = wy + 4 * s, sx = x - 40 * s, sy = wy - 105 * s, hx = x + 75 * s, hy = wy - 115 * s;
  line(c, [[bx, wy], [px, py], [sx, sy], [bx, wy]], col, 12 * s); line(c, [[px, py], [hx - 10 * s, hy + 18 * s], [sx, sy]], col, 12 * s); line(c, [[hx - 10 * s, hy + 18 * s], [fx, wy]], col, 11 * s);
  line(c, [[sx, sy], [sx - 8 * s, sy - 26 * s]], STEEL, 7 * s); rrect(c, sx - 40 * s, sy - 38 * s, 62 * s, 16 * s, 8 * s, '#1a1f3a');
  line(c, [[hx - 10 * s, hy + 18 * s], [hx - 4 * s, hy - 10 * s], [hx + 26 * s, hy - 14 * s]], STEEL, 7 * s); rrect(c, hx + 16 * s, hy - 22 * s, 26 * s, 14 * s, 7 * s, '#1a1f3a');
  if (o.gear !== false) { c.save(); c.translate(px, py); c.rotate(spin); gearShape(c, 0, 0, 22 * s, o.gearCol || (o.old ? '#6b7290' : SAND2)); c.restore(); }
  if (o.old) { c.fillStyle = 'rgba(80,60,50,.5)'; for (let k = 0; k < 5; k++) ell(c, lerp(bx, px, hash(k)), lerp(wy, py, hash(k + 3)) - 4 * s, 4 * s, 3 * s, 'rgba(80,60,50,.6)'); }
  if (o.shine) { glow(c, x, wy - 40 * s, 200 * s, .3 * o.shine); } }
function gearShape(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, rr = k % 2 ? r : r * 1.25; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); ell(c, x, y, r * .4, r * .4, '#1a1f3a'); }
function wrench(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); rrect(c, -8, -10, 16, 110, 8, STEEL); c.fillStyle = STEEL; c.beginPath(); c.arc(0, -16, 22, 0, 7); c.fill(); rrect(c, -7, -44, 14, 26, 3, '#22357f'); c.restore(); }
function helmet(c, x, y, s) { c.fillStyle = ROSE; c.beginPath(); c.arc(x, y, 50 * s, Math.PI, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 3; k++) rrect(c, x - 30 * s + k * 22 * s, y - 38 * s, 12 * s, 24 * s, 6 * s, 'rgba(255,255,255,.35)'); rrect(c, x - 54 * s, y - 6 * s, 108 * s, 12 * s, 6 * s, '#9b3f52'); }
function bag(c, x, y, s, col = GOLD) { c.strokeStyle = GOLD2; c.lineWidth = 6 * s; c.beginPath(); c.arc(x, y - 70 * s, 22 * s, Math.PI, 0); c.stroke(); rrect(c, x - 44 * s, y - 72 * s, 88 * s, 72 * s, 8 * s, col); }
function lightIcon(c, x, y, s) { rrect(c, x - 26 * s, y - 20 * s, 52 * s, 40 * s, 12 * s, '#1a1f3a'); ell(c, x + 14 * s, y, 12 * s, 12 * s, '#ffd889'); glow(c, x + 20 * s, y, 70 * s, .5); }
function glovesIcon(c, x, y, s) { for (const d of [-1, 1]) { c.save(); c.translate(x + d * 30 * s, y); c.scale(d, 1); rrect(c, -22 * s, -30 * s, 44 * s, 56 * s, 16 * s, '#3d5cc8'); rrect(c, -30 * s, -14 * s, 14 * s, 30 * s, 7 * s, '#3d5cc8'); rrect(c, -22 * s, 18 * s, 44 * s, 12 * s, 5 * s, '#1a1f3a'); c.restore(); } }
function priceTag(c, x, y, k, str, big = 1) { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k) * big, () => { const w = Math.max(180, str.length * 23 + 70); c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 5, y - 34 + 7, w, 68, 12); c.fill(); rrect(c, x - w / 2, y - 34, w, 68, 12, SAND); ell(c, x - w / 2 + 22, y, 7, 7, GOLD2); text(c, str, x + 14, y + 3, 40, NAVY); }); }
function bulbIcon(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, r * 3, .7); ell(c, x, y, r, r, '#ffd889'); rrect(c, x - r * .45, y + r * .8, r * .9, r * .5, r * .15, SAND2); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y + r * .2); c.lineTo(x, y - r * .25); c.lineTo(x + r * .3, y + r * .2); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); c.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); c.stroke(); } }); }
function sign(c, x, y, w, s, k, lit) { pop(c, x, y, k, () => { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 6, y - 40 + 10, w, 80, 16); c.fill(); rrect(c, x - w / 2, y - 40, w, 80, 16, lit ? GOLD : '#2b3f8e'); if (lit) glow(c, x, y, w * .7, .35 * lit); text(c, s, x, y + 3, 44, lit ? NAVY : SAND2); }); }
function calendarBadge(c, x, y, k, n) { pop(c, x, y, k, () => { rrect(c, x - 60, y - 70, 120, 140, 12, CREAM); rrect(c, x - 60, y - 70, 120, 36, 12, ROSE); c.fillStyle = ROSE; c.fillRect(x - 60, y - 48, 120, 14); text(c, String(n), x, y + 18, 58, NAVY); }); }
// the people: the shop owner is white; the staff and the customers are blue
function owner(c, t, x, y, s, o = {}) { mascot(c, { id: 'own', skin: 'owner', cap: true, s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi || 0, handL: o.handL, handR: o.handR, squash: o.squash || 0 }); }
const CUST = [{ skin: 'blue2', fem: 'pony' }, { skin: 'blue1' }, { skin: 'blue3', fem: 'glasses' }, { skin: 'blue1', tache: true }, { skin: 'blue2' }];
function cust(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'c' + k, ...CUST[k % 5], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0 }); }
function shopBack(c) { c.fillStyle = '#16286b'; c.fillRect(60, 1080, 960, 620); c.fillStyle = 'rgba(255,255,255,.035)'; for (let x = 100; x < 1020; x += 90) c.fillRect(x, 1080, 3, 620); rrect(c, 60, 1060, 960, 26, 8, '#22357f');
  for (let k = 0; k < 6; k++) { const x = 140 + k * 160; c.strokeStyle = STEEL; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 30, 1170); c.lineTo(x + 30, 1170); c.stroke(); } }   // a pegboard wall with hooks
function walkU(t, a, b) { const u = seg(t, a, b); return { u, walk: u > 0 && u < 1 ? 1 : 0 }; }

const SHOT = {
  prices(c, t) {   // people want a new bike, but they see the price and put it off: a shiny bike, a customer walks up; the tag grows; she walks away
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT;
    rrect(c, 300, 1650, 480, 50, 10, SAND2); bike(c, 540, 1650, 1.25, { shine: 1 }); if (t > H.newb) spark(c, 540, 1420, t, H.newb, 6, 220, 14);
    owner(c, t, 900, F, 1.5, { f: -.4, look: -.3, smile: lerp(.95, .4, ss(seg(t, H.away, H.away + .6))) }); badge(c, 'ex', 900, 1180, 42, E(t, H.notice, .3, .5) * (1 - ss(seg(t, H.newb, H.newb + .3))));
    const tg = E(t, H.price - .2, .3, .5), big = 1 + .35 * ss(seg(t, H.price, H.price + .5)); priceTag(c, 540, 1170, tg, '899 900 Ft', big * .9);
    const inn = walkU(t, H.want - .3, H.want + .9), out = walkU(t, H.away, H.away + 1.3), x = out.u > 0 ? lerp(240, -150, ss(out.u)) : lerp(-150, 240, ss(inn.u));
    if (t > H.want - .3) cust(c, t, 0, x, F, 1.5, { f: out.u > 0 ? -.45 : .45, walk: inn.walk || out.walk, look: out.u > 0 ? -.3 : .3, smile: lerp(1, .3, ss(seg(t, H.price, H.price + .4))), sad: .5 * ss(seg(t, H.price + .2, H.price + .6)), squash: wob(t, H.price + .2, .3, 18, .5) });
    calendarBadge(c, 260, 1240, E(t, H.away, .3, .5) * (1 - ss(seg(t, 7.9, 8.2))), '?');
  },
  decide(c, t) {   // one day he decides to try something else
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT; const z = 1 + .05 * ss(seg(t, 8.2, 11)); c.save(); c.translate(540, 1700); c.scale(z, z); c.translate(-540, -1700);
    bike(c, 260, F, .95, { old: true }); bike(c, 830, F, .95);
    owner(c, t, 540, F, 2.0, { f: .1, look: lerp(-.3, .2, ss(seg(t, H.dec - .4, H.dec))), smile: 1, squash: wob(t, H.dec, .4, 18, .5) });
    bulbIcon(c, 540, 1060, 50, E(t, H.dec, .3, .5)); c.restore();
  },
  pitch(c, t) {   // instead of the staff always pushing the newest models: a salesman points at a row of shiny new bikes; it is crossed out; he asks a question instead
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT; const cut = ss(seg(t, H.first - .2, H.first + .3));
    [[330, 0], [600, 1], [870, 2]].forEach(([x, i]) => { const a = E(t, H.newest - .2 + i * .15, .3, .45); pop(c, x, F, a, () => bike(c, x, F, .82, { col: [GOLD, ROSE, '#3fa45f'][i], shine: 1 - cut })); });
    if (t > H.newest) spark(c, 600, 1480, t, H.newest + .2, 7, 300, 14);
    pop(c, 600, 1290, E(t, H.newest, .3, .5) * (1 - cut), () => { rrect(c, 530, 1260, 140, 64, 14, GOLD); text(c, 'ÚJ', 600, 1294, 46, NAVY); });
    cross(c, 600, 1440, 120, seg(t, H.first - .2, H.first + .3) * (1 - ss(seg(t, H.ask - .1, H.ask + .2))));
    cust(c, t, 3, 175, F, 1.5, { f: .4, look: .3, smile: .9, handR: t < H.first ? [260, 1500] : undefined });
    const q = E(t, H.ask, .3, .5); if (q > 0) bubble(c, 300, 1180, 120, 110, Math.min(1.1, q), 200, 1290, () => text(c, '?', 300, 1184, 70, NAVY));
  },
  ask(c, t) {   // "what's wrong with your bike?": a customer with her old bike; the salesman asks
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT;
    const w = walkU(t, 16.9, 17.9), x = lerp(1200, 700, ss(w.u)); bike(c, x - 10, F, 1.05, { old: true, spin: -x / 70 }); cust(c, t, 0, x + 170, F, 1.5, { f: -.45, walk: w.walk, look: -.2, smile: .7, handL: [x + 90, F - 250] });
    cust(c, t, 3, 200, F, 1.6, { f: .45, look: .3, smile: 1 });
    const b = E(t, H.what - .1, .3, .5); if (b > 0) bubble(c, 350, 1160, 230, 150, Math.min(1.1, b), 260, 1300, () => { bike(c, 330, 1210, .32, { old: true }); text(c, '?', 430, 1162, 70, ROSE); });
  },
  fix(c, t) {   // some needed just one part: the old chain ring comes off, a new one goes on; others just a service: the wrench, a drop of oil, it shines; and they ride again
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT;
    // the repair stand and the bike up on it
    const ride = ss(seg(t, H.again - .2, H.again + 1.2)), bx = 520 + ride * 900; rrect(c, 300, 1500, 18, 200, 6, STEEL); rrect(c, 250, 1690, 120, 14, 6, STEEL);
    const up = 1 - ss(seg(t, H.again - .5, H.again - .1)), by = lerp(F, 1620, up), clean = ss(seg(t, H.service + .4, H.service + 1.2));
    if (ride < 1) { if (up > .5) line(c, [[309, 1500], [bx - 60, by - 150]], STEEL, 10); bike(c, bx, by, 1.2, { old: clean < .5, gearCol: t > H.part + .2 ? GOLD : undefined, spin: ride * -30, shine: clean * (1 - ride) }); if (ride > 0) cust(c, t, 1, bx - 40, by - 70, 1.4, { f: .45, look: .3, smile: 1, walk: 0 }); }
    // the part: the old ring flies off, the gold one lands
    const px = 510, py = F - 1.2 * 78 + 4 * 1.2; const off = seg(t, H.part - .3, H.part + .3); if (off > 0 && off < 1) { c.save(); c.globalAlpha = 1 - off; gearShape(c, px - 200 * off, py - 300 * off + 400 * off * off, 26, '#6b7290'); c.restore(); }
    if (t > H.part - .1 && t < H.part + .3) { const u = seg(t, H.part - .1, H.part + .3); gearShape(c, lerp(px + 200, px, ease(u)), lerp(py - 260, py, ease(u)), 26, GOLD); }
    if (t > H.part + .25) spark(c, px, py, t, H.part + .25, 5, 70, 12);
    // the service: the wrench turns; an oil drop
    const wk = E(t, H.service - .3, .3, .45) * (1 - ss(seg(t, H.again - .6, H.again - .3))); if (wk > 0) pop(c, 660, 1440, wk, () => wrench(c, 660, 1440, 1, -.8 + .5 * Math.sin(t * 9)));
    const drop = seg(t, H.service + .2, H.service + .7); if (drop > 0 && drop < 1) { c.fillStyle = GOLD; c.beginPath(); c.arc(420, 1430 + 140 * drop * drop, 10, 0, 7); c.fill(); }
    if (t > H.service + .9) spark(c, 520, 1480, t, H.service + .9, 7, 240, 14);
    owner(c, t, 175, F, 1.45, { f: .4, look: .3, smile: 1, handR: wk > .5 ? [620, 1460] : undefined });
  },
  service(c, t) {   // the shop starts offering repairs and servicing, even when nobody buys anything new: two signs light up; a customer leaves with her own bike, smiling, no bag
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT;
    sign(c, 330, 1190, 330, 'JAVÍTÁS', E(t, H.repair - .2, .35, .45), ss(seg(t, H.repair, H.repair + .3))); sign(c, 750, 1190, 330, 'SZERVIZ', E(t, H.maint - .2, .35, .45), ss(seg(t, H.maint, H.maint + .3)));
    const w = walkU(t, H.nothing - .4, H.nothing + 1.6), x = lerp(420, 1250, ss(w.u)); bike(c, x + 160, F, 1.0, { spin: -x / 60 }); cust(c, t, 0, x, F, 1.5, { f: .45, walk: w.walk, look: .3, smile: 1, handR: [x + 90, F - 250] });
    owner(c, t, 175, F, 1.5, { f: .4, look: .3, smile: 1, handR: t > H.nothing ? [220, 1340 + 20 * Math.sin(t * 12)] : undefined });
    pop(c, x + 20, 1330, E(t, H.nothing + .2, .3, .5) * (1 - ss(seg(t, 31.3, 31.7))), () => heart(c, x + 20, 1330, 36, 1, GOLD));
  },
  doubt(c, t) {   // at first some staff thought it would hurt new bike sales: two worried colleagues; a falling chart over the new bikes
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT;
    const ck = E(t, H.hurt - .7, .35, .45); pop(c, 540, 1240, ck, () => { rrect(c, 360, 1110, 360, 260, 22, CREAM); const dn = ss(seg(t, H.hurt, H.hurt + .7)); [1, .8, .6].forEach((v, i) => { const h = 170 * v * lerp(1, .5 + .15 * i, dn) ; rrect(c, 410 + i * 100, 1340 - h, 60, h, 8, i ? ROSE : '#3d5cc8'); }); if (dn > 0) { c.strokeStyle = ROSE; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(400, 1150); c.lineTo(lerp(400, 680, dn), lerp(1150, 1320, dn)); c.stroke(); } bike(c, 600, 1250, .3); });
    cust(c, t, 1, 190, F, 1.55, { f: .4, look: .3, smile: .2, sad: .7 }); cust(c, t, 2, 890, F, 1.55, { f: -.4, look: -.3, smile: .2, sad: .7 });
    badge(c, 'q', 190, 1180, 40, E(t, H.staff, .3, .5)); badge(c, 'q', 890, 1180, 40, E(t, H.staff + .2, .3, .5));
  },
  later(c, t) {   // a few months later something interesting happened: the calendar flies through months; a "!"
    bg(c, '#163A8C'); floor(c); const H = HIT;
    const n = Math.floor(clamp(seg(t, H.months, H.months + 1.0)) * 4); scaled(c, 540, 1360, 1.8, () => calendarBadge(c, 540, 1360, E(t, 36.3, .35, .45), 3 + n));
    for (let k = 0; k < 4; k++) { const at = H.months + k * .25, u = seg(t, at, at + .6); if (u > 0 && u < 1) { c.save(); c.globalAlpha = 1 - u; c.translate(540 + 300 * u, 1380 - 100 * u + 300 * u * u); c.rotate(u * 2); rrect(c, -108, -126, 216, 252, 14, CREAM); c.restore(); } }
    badge(c, 'ex', 760, 1160, 60, E(t, H.interesting, .3, .5)); if (t > H.interesting) spark(c, 540, 1360, t, H.interesting, 7, 260, 16);
  },
  back(c, t) {   // those who came for repairs came back: for accessories, gear, even a new bike; and they brought their friends
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT;
    // the counter: things pile up as they come back
    rrect(c, 560, 1520, 460, 180, 16, WOOD); rrect(c, 560, 1520, 460, 22, 10, WOOD2);
    pop(c, 640, 1520, E(t, H.acc, .3, .5), () => helmet(c, 640, 1520, 1)); pop(c, 760, 1510, E(t, H.acc + .35, .3, .5), () => lightIcon(c, 760, 1500, 1.1));
    pop(c, 880, 1520, E(t, H.gear, .3, .5), () => glovesIcon(c, 880, 1490, 1)); pop(c, 960, 1520, E(t, H.gear + .3, .3, .5), () => bag(c, 960, 1520, .8));
    const nb = E(t, H.newbike, .35, .5); pop(c, 360, F, nb, () => bike(c, 360, F, 1.0, { shine: 1 })); if (t > H.newbike) { spark(c, 360, 1480, t, H.newbike, 6, 200, 14); pop(c, 360, 1350, E(t, H.newbike + .2, .3, .5), () => { c.save(); c.translate(360, 1350); c.rotate(-.12); rrect(c, -86, -30, 172, 60, 12, GOLD); text(c, 'ELADVA', 0, 3, 32, NAVY); c.restore(); }); }
    // she comes back through the door, then her friends
    const w0 = walkU(t, H.ret - .6, H.ret + .7); cust(c, t, 0, lerp(-150, 140, ss(w0.u)), F, 1.45, { f: .45, walk: w0.walk, look: .3, smile: 1 });
    for (let k = 0; k < 2; k++) { const w = walkU(t, H.friends - .3 + k * .25, H.friends + .9 + k * .25); if (w.u <= 0) continue; const x = lerp(-150, [60, -40][k] + 0, ss(w.u)); cust(c, t, k + 2, x + 90, F + 40, 1.3, { f: .45, walk: w.walk, look: .3, smile: 1 }); }
    owner(c, t, 840, 1560, 1.25, { f: -.3, look: -.3, smile: 1 });
    for (let k = 0; k < 4; k++) { const at = H.recommend + k * .2, u = seg(t, at, at + 1.2); if (u > 0 && u < 1) heart(c, 160 + k * 50, 1300 - u * 200, 22, Math.sin(u * Math.PI) * 1.2, k % 2 ? ROSE : GOLD); }
  },
  lesson(c, t) {   // the owner sees it: the sale doesn't always have to come first. If you help them use what they already have, they trust you next time
    bg(c, '#163A8C'); floor(c); shopBack(c); const H = HIT; const help = ss(seg(t, H.help - .4, H.help + .2));
    // first: the owner thinks; the sale tag steps back
    if (help < 1) { c.save(); c.globalAlpha = 1 - help; owner(c, t, 540, F, 1.9, { f: .1, look: .2, smile: 1 }); bulbIcon(c, 540, 1050, 46, E(t, H.realise, .3, .5));
      priceTag(c, 820, 1300, E(t, H.sale - .1, .3, .5), 'Ft'); cross(c, 820, 1300, 60, seg(t, H.notfirst, H.notfirst + .4)); pop(c, 260, 1300, E(t, H.notfirst + .2, .3, .5), () => heart(c, 260, 1300, 46, 1, ROSE)); c.restore(); }
    // then: he pumps up her old bike's tyre, they shake hands; a heart and trust
    if (help > 0) { c.save(); c.globalAlpha = help; bike(c, 520, F, 1.15, { old: false, col: RUST }); const pump = Math.abs(Math.sin(t * 6)) * (t < H.reason ? 1 : 0);
      rrect(c, 270, 1560 + 40 * pump, 14, 140 - 40 * pump, 6, STEEL); rrect(c, 236, 1550 + 40 * pump, 82, 14, 7, '#1a1f3a'); line(c, [[277, 1700], [330, 1720], [430, 1700]], '#1a1f3a', 5);
      owner(c, t, 170, F, 1.5, { f: .4, look: .3, smile: 1, handR: t < H.reason ? [262, 1560 + 40 * pump] : [lerp(262, 520, ss(seg(t, H.reason, H.reason + .5))), 1440] });
      cust(c, t, 0, 880, F, 1.5, { f: -.45, look: -.3, smile: 1, handL: t > H.reason ? [lerp(800, 560, ss(seg(t, H.reason, H.reason + .5))), 1440] : undefined });
      pop(c, 540, 1240, E(t, H.reason + .5, .3, .5), () => heart(c, 540, 1240, 52, 1, GOLD)); if (t > H.trust) { glow(c, 540, 1400, 520, .25 * ss(seg(t, H.trust, H.trust + .5))); spark(c, 540, 1300, t, H.trust, 8, 360, 18); } c.restore(); }
  },
};
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.06, 1.06); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['kerékpárbolt','árakat','mást','megkérdezték','alkatrészt','szervizzel','javítást','karbantartást','érdekes','visszatértek','barátaiknak','első','segítesz','bízzon']);
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
