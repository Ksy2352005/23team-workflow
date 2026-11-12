// Story 23, A nyugalom bőröndje (The Brand That Sold Peace of Mind): a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, TS } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', '+ Ft ×4 ?'), document.fonts.load('700 74px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…abcABC')]);
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

// —— the world: suitcases, the plane's hold, the baggage belt, a phone with a map ——
const T = i => WORDS[i][1];
const F = 1700;   // the floor line
const SAND = '#e9dcc0', SAND2 = '#cdbf9c', SAND3 = '#b5a682', INKC = '#151018', ROSE = '#c4566a', ROSE2 = '#9b3f52', STEEL = '#aab3cf', STEEL2 = '#7d87a8', MINT = '#5fb89a', MINT2 = '#3f8f74';
const ease = u => 1 - Math.pow(1 - clamp(u), 3);
function rrect(c, x, y, w, h, r, col) { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function pop(c, x, y, k, f) { if (k > 0) scaled(c, x, y, Math.min(1.12, k), f); }
function floor(c, col) { const fl = c.createLinearGradient(0, F, 0, 1920); fl.addColorStop(0, col || '#0d1d5c'); fl.addColorStop(1, '#071341'); c.fillStyle = fl; c.fillRect(0, F, 1080, 220); c.fillStyle = 'rgba(246,239,220,.1)'; c.fillRect(0, F, 1080, 4); }
// a hard-shell suitcase standing on y, centred on x; o.col; o.ours = the new one, gold, with the little tracker light; o.rot; o.handle 0..1 pulls the handle up
function suitcase(c, x, y, s = 1, o = {}) { const col = o.col || (o.ours ? GOLD : '#3d5cc8'), dk = o.dk || (o.ours ? GOLD2 : '#2b3f8e'); c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  if (!o.noShadow) { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.ellipse(0, 2, 80, 10, 0, 0, 7); c.fill(); }
  const hu = o.handle || 0; if (hu > 0) { rrect(c, -34, -220 - 120 * hu, 8, 120 * hu + 10, 4, STEEL2); rrect(c, 26, -220 - 120 * hu, 8, 120 * hu + 10, 4, STEEL2); rrect(c, -40, -232 - 120 * hu, 80, 16, 8, '#1a1f3a'); }
  rrect(c, -30, -236, 60, 18, 9, '#1a1f3a');   // the top handle
  rrect(c, -74, -222, 148, 210, 22, col); for (const dx of [-36, 0, 36]) rrect(c, dx - 5, -214, 10, 194, 5, dk); rrect(c, -74, -126, 148, 10, 0, dk);
  ell(c, -50, -4, 12, 12, '#1a1f3a'); ell(c, 50, -4, 12, 12, '#1a1f3a');
  if (o.ours) { const on = .5 + .5 * Math.sin(NOW * 6); ell(c, 52, -196, 9, 9, '#ffffff'); ell(c, 52, -196, 6, 6, `rgba(95,184,154,${.5 + .5 * on})`); }
  if (o.tag) { c.strokeStyle = SAND2; c.lineWidth = 3; c.beginPath(); c.moveTo(-20, -232); c.lineTo(-40, -200); c.stroke(); rrect(c, -64, -204, 44, 28, 6, o.tag); }
  if (o.crack) { c.strokeStyle = '#1a1f3a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, -210); c.lineTo(-4, -170); c.lineTo(-22, -140); c.lineTo(0, -100); c.stroke(); }
  c.restore(); }
function signal(c, x, y, r, t, a = 1) { for (let k = 0; k < 3; k++) { const u = ((t * .9 + k / 3) % 1); c.save(); c.globalAlpha = a * (1 - u); c.strokeStyle = MINT; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r * (.4 + u), -Math.PI * .8, -Math.PI * .2); c.stroke(); c.restore(); } }
function chip(c, x, y, s) { rrect(c, x - 34 * s, y - 34 * s, 68 * s, 68 * s, 10 * s, '#1a1f3a'); rrect(c, x - 22 * s, y - 22 * s, 44 * s, 44 * s, 6 * s, MINT); c.fillStyle = STEEL; for (let k = 0; k < 4; k++) for (const d of [-1, 1]) { c.fillRect(x - 26 * s + k * 16 * s, y + d * 34 * s - (d > 0 ? 0 : 8 * s), 6 * s, 8 * s); c.fillRect(x + d * 34 * s - (d > 0 ? 0 : 8 * s), y - 26 * s + k * 16 * s, 8 * s, 6 * s); } }
function phone(c, x, y, w, h, draw) { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - h / 2 + 12, w, h, 34); c.fill(); rrect(c, x - w / 2, y - h / 2, w, h, 34, '#1a1f3a'); rrect(c, x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24, '#dfe8f5'); c.save(); c.beginPath(); c.roundRect(x - w / 2 + 14, y - h / 2 + 14, w - 28, h - 28, 24); c.clip(); draw(); c.restore(); rrect(c, x - 30, y - h / 2 + 22, 60, 12, 6, '#1a1f3a'); }
function mapView(c, x, y, w, h, pin, t) { c.fillStyle = '#dfe8f5'; c.fillRect(x - w / 2, y - h / 2, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 16; for (const d of [-.3, .15]) { c.beginPath(); c.moveTo(x - w / 2, y + d * h); c.lineTo(x + w / 2, y + d * h + 40); c.stroke(); c.beginPath(); c.moveTo(x + d * w, y - h / 2); c.lineTo(x + d * w - 30, y + h / 2); c.stroke(); }
  rrect(c, x - w * .4, y - h * .42, w * .25, h * .18, 8, '#c7e3c9'); rrect(c, x + w * .12, y + h * .2, w * .3, h * .16, 8, '#c7e3c9');
  if (pin) { const [px, py] = pin, b = 6 * Math.abs(Math.sin(t * 4)); ell(c, px, py + 4, 16, 6, 'rgba(0,0,20,.25)'); c.fillStyle = ROSE; c.beginPath(); c.moveTo(px, py); c.bezierCurveTo(px - 30, py - 40 - b, px - 30, py - 76 - b, px, py - 76 - b); c.bezierCurveTo(px + 30, py - 76 - b, px + 30, py - 40 - b, px, py); c.fill(); ell(c, px, py - 54 - b, 12, 12, '#ffffff'); scaled(c, px, py - 54 - b, .12, () => suitcase(c, px, py - 54 - b + 110, 1, { ours: true, noShadow: true })); } }
function clockB(c, x, y, r, k, t) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = NAVY; c.lineWidth = r * .1; c.lineCap = 'round'; const a = t * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - Math.PI / 2) * r * .65, y + Math.sin(a - Math.PI / 2) * r * .65); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a / 12 - Math.PI / 2) * r * .45, y + Math.sin(a / 12 - Math.PI / 2) * r * .45); c.stroke(); ell(c, x, y, r * .1, r * .1, GOLD); }); }
function iconCard(c, x, y, r, k, cut, draw) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, '#2b3f8e'); c.strokeStyle = CREAM; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r - 6, 0, 7); c.stroke(); draw(); cross(c, x, y, r * .62, cut); }); }
function bulbIcon(c, x, y, r, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, r * 3, .7); ell(c, x, y, r, r, '#ffd889'); rrect(c, x - r * .45, y + r * .8, r * .9, r * .5, r * .15, SAND2); c.strokeStyle = GOLD2; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * .3, y + r * .2); c.lineTo(x, y - r * .25); c.lineTo(x + r * .3, y + r * .2); c.stroke(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35); c.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75); c.stroke(); } }); }
function worry(c, x, y, r, k) { pop(c, x, y, k, () => { ell(c, x + 4, y + 8, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, '#2b3f8e'); c.strokeStyle = CREAM; c.lineWidth = r * .08; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); text(c, '?', x, y + r * .08, r * 1.3, CREAM); }); }
// the people: the traveller is white; other travellers and staff are blue
function trav(c, t, x, y, s, o = {}) { mascot(c, { id: 'tr', skin: 'owner', s, x, y, f: o.f ?? .3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? .2, blink: blinkAt(t, 7), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0, cap: true }); }
const CUST = [{ skin: 'blue2', fem: 'pony' }, { skin: 'blue1' }, { skin: 'blue3', fem: 'glasses' }, { skin: 'blue1', tache: true }];
function cust(c, t, k, x, y, s, o = {}) { mascot(c, { id: 'c' + k, ...CUST[k % 4], s, x, y, f: o.f ?? -.4, smile: o.smile ?? .85, sad: o.sad || 0, look: o.look ?? -.2, blink: blinkAt(t, 3 + k), walk: o.walk || 0, phi: o.phi ?? x / 30, handL: o.handL, handR: o.handR, squash: o.squash || 0 }); }
function terminal(c) { c.fillStyle = '#16286b'; c.fillRect(0, 1060, 1080, 640); c.fillStyle = 'rgba(159,199,240,.18)'; for (let k = 0; k < 6; k++) c.fillRect(30 + k * 175, 1100, 150, 300); c.fillStyle = 'rgba(255,255,255,.06)'; for (let k = 0; k < 6; k++) c.fillRect(30 + k * 175 + 72, 1100, 6, 300);
  // a plane taking off in the windows
  c.save(); c.globalAlpha = .5; c.fillStyle = CREAM; c.translate(700 + ((NOW * 40) % 300), 1250 - ((NOW * 15) % 100)); c.rotate(-.15); rrect(c, -60, -8, 120, 16, 8, CREAM); c.beginPath(); c.moveTo(-10, 0); c.lineTo(20, -36); c.lineTo(32, -36); c.lineTo(20, 0); c.fill(); c.restore(); }
function belt(c, t, y, run = 1) { rrect(c, 40, y - 20, 1000, 90, 16, '#2b2f48'); c.fillStyle = '#41466a'; for (let k = 0; k < 16; k++) { const x = 40 + ((k * 70 + t * 120 * run) % 1000); c.fillRect(x, y - 16, 6, 70); } rrect(c, 40, y + 50, 1000, 24, 10, STEEL2); rrect(c, 40, y - 26, 1000, 12, 6, STEEL); }

const SHOT = {
  airport(c, t) {   // at the airport, travellers fear the same thing, again and again: three travellers with their cases; a question pops over each
    bg(c, '#163A8C'); terminal(c); floor(c); const H = HIT;
    const P = [[200, 1], [540, 0], [860, 2]];
    P.forEach(([x, k], i) => { suitcase(c, x + 110, F, .95, { col: ['#3d5cc8', ROSE, MINT][i], dk: ['#2b3f8e', ROSE2, MINT2][i], handle: 1 }); if (i === 1) trav(c, t, x, F, 1.55, { f: .3, look: .3, smile: lerp(.9, .3, ss(seg(t, H.fear, H.fear + .4))), sad: .5 * ss(seg(t, H.fear, H.fear + .4)), handR: [x + 80, F - 330] }); else cust(c, t, k, x, F, 1.45, { f: .3, look: .2, smile: lerp(.9, .3, ss(seg(t, H.again[0], H.again[0] + .4))), sad: .4 * ss(seg(t, H.again[0], H.again[0] + .4)), handR: [x + 80, F - 330] }); });
    worry(c, 200, 1150, 42, E(t, H.again[0], .3, .5)); worry(c, 860, 1150, 42, E(t, H.again[1], .3, .5)); worry(c, 540, 1110, 50, E(t, H.fear, .3, .5));
  },
  hold(c, t) {   // they don't know what happens to their case in the hold, or whether it comes back in one piece: the plane cut open; cases slide and bump; one cracks; a question
    bg(c, '#163A8C'); const H = HIT; const sh = Math.sin(t * 9) * 4 * ss(seg(t, H.hold - .3, H.hold));
    c.save(); c.translate(0, sh);
    // the plane's belly, cut open: a big rounded hull
    c.fillStyle = '#cfd6e8'; c.beginPath(); c.ellipse(540, 1380, 560, 330, 0, 0, 7); c.fill(); c.fillStyle = '#16286b'; c.beginPath(); c.ellipse(540, 1390, 520, 290, 0, 0, 7); c.fill();
    rrect(c, 40, 1320, 1000, 14, 6, '#aab3cf'); c.fillStyle = 'rgba(159,199,240,.6)'; for (let k = 0; k < 9; k++) ell(c, 170 + k * 92, 1210, 18, 24, 'rgba(159,199,240,.6)');   // the cabin floor and windows above the hold
    // the cases in the hold: they slide back and forth and bump
    const slide = Math.sin((t - 6) * 2.2) * 40 * ss(seg(t, H.cases - .3, H.cases + .3));
    [[300, ROSE, ROSE2, .05], [470, '#3d5cc8', '#2b3f8e', -.12], [660, MINT, MINT2, .1], [820, '#3d5cc8', '#2b3f8e', .2]].forEach(([x, col, dk, r], i) => suitcase(c, x + slide * (i % 2 ? -1 : 1), 1620, .75, { col, dk, rot: r + .06 * Math.sin(t * 3 + i), crack: i === 2 && t > H.safe }));
    c.restore();
    pop(c, 660, 1300, E(t, H.safe + .1, .3, .5), () => worry(c, 660, 1300, 48, 1));
    if (t > H.hold && t < H.hold + .6) badge(c, 'ex', 300, 1300, 44, E(t, H.hold, .3, .5) * (1 - ss(seg(t, H.hold + .3, H.hold + .6))));
  },
  newcase(c, t) {   // the firm decides to put something quite different into its new case: the gold case on a plinth; a spark of light inside
    bg(c, '#163A8C'); floor(c); const H = HIT;
    rrect(c, 380, 1640, 320, 60, 10, SAND2); const a = E(t, H.decide - .3, .35, .45); pop(c, 540, 1640, a, () => suitcase(c, 540, 1640, 1.6, { ours: true }));
    if (t > H.different) { glow(c, 540, 1460, 260, .5 * ss(seg(t, H.different, H.different + .4))); spark(c, 540, 1460, t, H.different, 7, 260, 18); }
    badge(c, 'q', 540, 1120, 50, E(t, H.different - .2, .3, .5));
    cust(c, t, 3, 190, F, 1.5, { f: .4, look: .3, smile: 1 });
  },
  track(c, t) {   // a small system built in: a chip goes into the case; it sends a signal; on the owner's phone, a map shows where the case is
    bg(c, '#163A8C'); floor(c); const H = HIT;
    suitcase(c, 300, F, 1.4, { ours: true }); const u = ease(seg(t, H.built - .2, H.built + .5));
    if (u < 1) chip(c, lerp(300, 372, u), lerp(1200, 1430, u), lerp(1.4, .3, u)); if (u >= 1) signal(c, 372, 1420, 90, t, ss(seg(t, H.system, H.system + .4)));
    const pk = E(t, H.phone - .2, .35, .45); pop(c, 760, 1380, pk, () => phone(c, 760, 1380, 330, 560, () => { mapView(c, 760, 1380, 300, 530, t > H.where ? [lerp(700, 790, ease(seg(t, H.where, H.where + .6))), lerp(1460, 1400, ease(seg(t, H.where, H.where + .6)))] : null, t); }));
    if (u >= 1) { c.save(); c.setLineDash([8, 14]); c.strokeStyle = 'rgba(95,184,154,.6)'; c.lineWidth = 5; c.beginPath(); c.moveTo(400, 1380); c.quadraticCurveTo(520, 1200, 620, 1300); c.stroke(); c.restore(); }
  },
  adidea(c, t) {   // but the firm didn't just talk about tracking: the tech icons fade; the whole ad is built on a familiar moment: a screen opens onto the scene
    bg(c, '#163A8C'); floor(c); const H = HIT; const sc = ease(seg(t, H.familiar - .2, H.familiar + .7));
    iconCard(c, 350, 1250, 70, E(t, 21.0, .35, .45) * (1 - sc), seg(t, H.notonly - .1, H.notonly + .4), () => chip(c, 350, 1250, .8));
    iconCard(c, 730, 1250, 70, E(t, 21.2, .35, .45) * (1 - sc), seg(t, H.notonly + .1, H.notonly + .6), () => signal(c, 730, 1290, 60, t, 1));
    if (sc > 0) pop(c, 540, 1420, sc, () => { rrect(c, 140, 1180, 800, 480, 26, '#1a1f3a'); rrect(c, 160, 1200, 760, 440, 16, '#22357f'); c.save(); c.beginPath(); c.rect(160, 1200, 760, 440); c.clip(); c.translate(540, 1420); c.scale(.42, .42); c.translate(-540, -1500); belt(c, t, 1500); suitcase(c, 760, 1510, .62, { col: ROSE, dk: ROSE2, noShadow: true }); trav(c, t, 420, 1700, 1.6, { f: .25, look: .3, smile: .3, sad: .5 }); c.restore();
      rrect(c, 120, 1150, 160, 60, 10, '#2b2f48'); for (let k = 0; k < 4; k++) { c.save(); c.translate(130 + k * 40, 1150); c.rotate(-.5); rrect(c, 0, -16, 34, 16, 2, k % 2 ? CREAM : '#2b2f48'); c.restore(); } });   // a clapper on the corner
  },
  carousel(c, t) {   // a traveller stands at the baggage belt, and his case still hasn't come: other cases go by; the clock ticks; he worries
    bg(c, '#163A8C'); floor(c); const H = HIT;
    belt(c, t, 1500);
    for (let k = 0; k < 4; k++) { const x = ((t - 26.9) * 150 + k * 290) % 1240 - 120; suitcase(c, x, 1510, .62, { col: ['#3d5cc8', ROSE, MINT, '#3d5cc8'][k], dk: ['#2b3f8e', ROSE2, MINT2, '#2b3f8e'][k], rot: .05 * Math.sin(k), noShadow: true }); }
    trav(c, t, 300, F, 1.7, { f: .25, look: .3 + Math.sin(t * 1.6) * .3, smile: lerp(.6, .2, ss(seg(t, H.notyet - .5, H.notyet))), sad: lerp(.2, .7, ss(seg(t, H.notyet - .5, H.notyet))) });
    clockB(c, 820, 1170, 56, E(t, H.belt, .3, .5), t); worry(c, 300, 1150, 46, E(t, H.notyet, .3, .5));
  },
  phonecheck(c, t) {   // he takes out his phone and looks where it is: the map; the pin; it's right here, coming round; he smiles
    bg(c, '#163A8C'); floor(c); const H = HIT; const rel = ss(seg(t, H.whereis, H.whereis + .4));
    trav(c, t, 250, F, 1.6, { f: .4, look: .3, smile: lerp(.3, 1, rel), sad: .5 * (1 - rel), handR: [400, 1440] });
    const pk = E(t, H.takeout, .35, .45); pop(c, 640, 1360, pk, () => phone(c, 640, 1360, 340, 580, () => { mapView(c, 640, 1360, 312, 552, t > H.check ? [lerp(560, 650, ease(seg(t, H.check, H.whereis + .3))), lerp(1460, 1420, ease(seg(t, H.check, H.whereis + .3)))] : null, t); }));
    if (t > H.whereis) { pop(c, 870, 1170, E(t, H.whereis + .1, .3, .5), () => check(c, 870, 1170, 44, 1)); spark(c, 640, 1300, t, H.whereis, 6, 220, 14); }
  },
  notmaterial(c, t) {   // the ad wasn't about the material or the number of wheels, but about making an old travel worry smaller: two icons crossed; the big "?" shrinks
    bg(c, '#163A8C'); floor(c); const H = HIT;
    iconCard(c, 300, 1200, 74, E(t, H.material - .2, .3, .5), seg(t, H.material + .1, H.material + .5), () => { c.fillStyle = GOLD; for (let k = 0; k < 4; k++) rrect(c, 260, 1166 + k * 20, 80, 12, 6, k % 2 ? GOLD2 : GOLD); });
    iconCard(c, 780, 1200, 74, E(t, H.wheels - .2, .3, .5), seg(t, H.wheels + .1, H.wheels + .5), () => { for (const d of [-1, 1]) { ell(c, 780 + d * 22, 1200, 20, 20, '#1a1f3a'); ell(c, 780 + d * 22, 1200, 7, 7, STEEL); } text(c, '×4', 780, 1250, 30, CREAM); });
    const sh = ss(seg(t, H.smaller - .2, H.smaller + .8)); worry(c, 540, 1470, lerp(130, 40, sh), E(t, H.butabout - .2, .35, .45) * (1 - ss(seg(t, 41.0, 41.3))));
    if (t > H.smaller) suitcase(c, 540, F, lerp(0, 1.1, ease(seg(t, H.smaller + .3, H.smaller + .9))), { ours: true });
  },
  lesson(c, t) {   // the firm sees it: buyers don't always want more features; they gladly pay more to be rid of a small but constant worry
    bg(c, '#163A8C'); terminal(c); floor(c); const H = HIT; const free = ss(seg(t, H.rid - .2, H.rid + .6));
    // a long feature list, crossed
    const lk = E(t, H.features - .4, .35, .45) * (1 - ss(seg(t, H.pay - .5, H.pay - .2))); pop(c, 760, 1260, lk, () => { rrect(c, 640, 1060, 240, 400, 16, '#ffffff'); for (let k = 0; k < 9; k++) { rrect(c, 664, 1090 + k * 40, 22, 22, 5, MINT); rrect(c, 698, 1096 + k * 40, 150 - (k % 3) * 30, 10, 5, SAND3); } cross(c, 760, 1260, 90, seg(t, H.features + .3, H.features + .7)); });
    // the price tag rises: he pays a bit more, happily
    pop(c, 760, 1260, E(t, H.pay - .2, .3, .5), () => { rrect(c, 650, 1220, 220, 80, 14, SAND); ell(c, 675, 1260, 8, 8, GOLD2); text(c, '+ Ft', 775, 1263, 46, NAVY); });
    // the traveller and his gold case; the worry above him flies off and pops
    suitcase(c, 400, F, 1.1, { ours: true, handle: 1 }); trav(c, t, 250, F, 1.6, { f: .4, look: .3, smile: lerp(.6, 1, free), handR: [370, F - 360] });
    const wq = E(t, 41.5, .35, .45), fly = ease(seg(t, H.rid, H.rid + .8)); if (fly < 1) worry(c, 250 + fly * 300, 1150 - fly * 260, 44, wq * (1 - fly));
    if (t > H.rid + .6) { glow(c, 300, 1450, 420, .25 * free); spark(c, 250, 1150, t, H.rid + .6, 7, 140, 14); heart(c, 250, 1160, 36, E(t, H.end, .3, .5), GOLD); }
  },
};
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1790); c.scale(1.18, 1.18); c.translate(-540, -1790); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['bőröndgyártó','újra','csomagterében,','épségben','mást','telefonján','ismerős','csomagszalag','megnézi,','kisebb','aggodalma.','funkciót','többet','aggodalomtól.']);
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
