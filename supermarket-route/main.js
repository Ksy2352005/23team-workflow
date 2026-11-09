// The Long Way Round: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, TS } from './story.js';
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

// —— the supermarket: products, shelves, the floor plan ——
const PCOL = { chips: '#d9443a', chipsG: '#3fa45f', tube: '#f08a24', cookie: '#c0563a', roll: '#8a55b0', choc: '#6b3f2a', juice: '#f39a2c', apple: '#e2463c', cheese: '#f2c94c', cereal: '#4caf6e' };
function prod(c, kind, x, y, s = 1, o = {}) {   // a product, standing on y (its bottom), centred on x; o.grey 0..1 fades it to a dull shape
  c.save(); if (o.grey > 0) { c.filter = `grayscale(${o.grey}) brightness(${1 - .35 * o.grey})`; } if (o.alpha != null) c.globalAlpha = o.alpha;
  if (o.glow) glow(c, x, y - 50 * s, 90 * s, .55 * o.glow);
  ell(c, x + 4 * s, y, 40 * s, 7 * s, 'rgba(0,0,20,.28)');
  if (kind === 'milk') { const w = 64 * s, h = 84 * s; c.fillStyle = '#f7f4ec'; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 6 * s); c.fill(); c.fillStyle = '#e4dfd0'; c.beginPath(); c.moveTo(x - w / 2, y - h); c.lineTo(x - w / 2 + 8 * s, y - h - 26 * s); c.lineTo(x + w / 2 - 8 * s, y - h - 26 * s); c.lineTo(x + w / 2, y - h); c.closePath(); c.fill(); c.fillStyle = '#cfc8b6'; c.fillRect(x - w / 2 + 8 * s, y - h - 34 * s, w - 16 * s, 9 * s);
    c.fillStyle = '#3f6fd6'; c.beginPath(); c.roundRect(x - w / 2, y - h * .52, w, h * .52, [0, 0, 6 * s, 6 * s]); c.fill(); c.fillStyle = '#f7f4ec'; c.beginPath(); c.moveTo(x, y - h * .44); c.quadraticCurveTo(x + 14 * s, y - h * .2, x, y - h * .12); c.quadraticCurveTo(x - 14 * s, y - h * .2, x, y - h * .44); c.fill(); }
  if (kind === 'bread') { const w = 112 * s, h = 60 * s; c.fillStyle = '#c98843'; c.beginPath(); c.roundRect(x - w / 2, y - h * .7, w, h * .7, [4 * s, 4 * s, 12 * s, 12 * s]); c.fill(); c.fillStyle = '#e3a75e'; c.beginPath(); c.ellipse(x, y - h * .62, w / 2, h * .42, 0, Math.PI, 0); c.fill(); c.fillRect(x - w / 2, y - h * .64, w, 4 * s);
    c.strokeStyle = '#a8692f'; c.lineWidth = 6 * s; c.lineCap = 'round'; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 28 * s - 10 * s, y - h * .72); c.lineTo(x + k * 28 * s + 10 * s, y - h * .94); c.stroke(); } }
  if (kind === 'chips' || kind === 'chipsG') {   // a pillow bag of crisps, crimped top and bottom; the green one is taller and slimmer
    const g = kind === 'chipsG', w = (g ? 66 : 80) * s, h = (g ? 108 : 96) * s, col = PCOL[kind];
    c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y - h); for (let i = 0; i <= 7; i++) c.lineTo(x - w / 2 + i * w / 7, y - h - (i % 2 ? 6 * s : 0)); c.quadraticCurveTo(x + w / 2 + 8 * s, y - h / 2, x + w / 2, y); for (let i = 0; i <= 7; i++) c.lineTo(x + w / 2 - i * w / 7, y + (i % 2 ? 5 * s : 0) - 5 * s); c.quadraticCurveTo(x - w / 2 - 8 * s, y - h / 2, x - w / 2, y - h); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - w / 2, y - h + 4 * s, w, 8 * s); c.fillRect(x - w / 2, y - 16 * s, w, 8 * s); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - w / 2 + 6 * s, y - h + 16 * s, 10 * s, h - 34 * s);
    ell(c, x, y - h * .5, w * .32, h * .22, CREAM); for (const [dx, dy, r] of [[-8, -4, 11], [8, 2, 12], [-1, 9, 9]]) ell(c, x + dx * s, y - h * .5 + dy * s, r * s, r * .7 * s, g ? '#e9c45a' : '#f2c94c', g ? .6 : -.3); }
  if (kind === 'tube') {   // a tall can of stacked crisps with a lid
    const w = 52 * s, h = 106 * s; c.fillStyle = PCOL.tube; c.fillRect(x - w / 2, y - h, w, h); ell(c, x, y, w / 2, 7 * s, '#c96d16'); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x - w / 2 + 6 * s, y - h, 9 * s, h);
    c.fillStyle = '#2b3a80'; c.fillRect(x - w / 2, y - h - 6 * s, w, 14 * s); ell(c, x, y - h - 6 * s, w / 2, 7 * s, '#4a5cae'); c.fillStyle = CREAM; c.fillRect(x - w / 2, y - h * .62, w, h * .3); for (let k = 0; k < 3; k++) ell(c, x, y - h * .54 + k * 9 * s, 17 * s, 6 * s, '#f2c94c'); }
  if (kind === 'roll') {   // a wrapped roll of cookies lying down, twisted ends
    const w = 104 * s, h = 46 * s, cy = y - h / 2; c.fillStyle = PCOL.roll; c.beginPath(); c.roundRect(x - w / 2 + 12 * s, y - h, w - 24 * s, h, h / 2); c.fill();
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * (w / 2 - 14 * s), cy - h * .3); c.lineTo(x + d * w / 2, cy - h * .5); c.lineTo(x + d * w / 2, cy + h * .5); c.lineTo(x + d * (w / 2 - 14 * s), cy + h * .3); c.closePath(); c.fill(); }
    c.save(); c.beginPath(); c.roundRect(x - 26 * s, y - h + 6 * s, 52 * s, h - 12 * s, 8 * s); c.clip(); c.fillStyle = CREAM; c.fill(); for (let k = -1; k <= 1; k++) ell(c, x + k * 16 * s, cy, 7 * s, 16 * s, '#c88a4a'); c.restore(); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - w / 2 + 16 * s, y - h + 6 * s, w - 32 * s, 6 * s); }
  if (kind === 'cookie') { const w = 78 * s, h = 94 * s; c.fillStyle = PCOL.cookie; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 8 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x - w / 2, y - h, w * .22, h); ell(c, x, y - h * .5, 25 * s, 25 * s, '#c88a4a'); for (const [dx, dy] of [[-9, -8], [8, -4], [-2, 9], [11, 10]]) ell(c, x + dx * s, y - h * .5 + dy * s, 4 * s, 4 * s, '#6b3f1e'); }
  if (kind === 'juice') { const w = 50 * s, h = 98 * s; c.fillStyle = PCOL.juice; c.beginPath(); c.roundRect(x - w / 2, y - h * .78, w, h * .78, 10 * s); c.fill(); c.fillRect(x - w * .22, y - h * .92, w * .44, h * .2); c.fillStyle = '#4caf6e'; c.beginPath(); c.roundRect(x - w * .28, y - h, w * .56, h * .12, 3 * s); c.fill();
    c.fillStyle = CREAM; c.fillRect(x - w / 2, y - h * .58, w, h * .28); ell(c, x, y - h * .44, 10 * s, 10 * s, PCOL.juice); }
  if (kind === 'apple') { const r = 34 * s; ell(c, x - r * .4, y - r, r * .75, r * .9, PCOL.apple); ell(c, x + r * .4, y - r, r * .75, r * .9, PCOL.apple); ell(c, x - r * .35, y - r * 1.25, r * .2, r * .3, 'rgba(255,255,255,.35)'); c.strokeStyle = '#6b3f1e'; c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x, y - r * 1.7); c.lineTo(x + 3 * s, y - r * 2.15); c.stroke(); ell(c, x + 14 * s, y - r * 2.1, 13 * s, 6 * s, '#4caf6e', -.5); }
  if (kind === 'cheese') { const w = 96 * s, h = 64 * s; c.fillStyle = PCOL.cheese; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.lineTo(x + w / 2, y - h * .55); c.lineTo(x - w / 2, y - h); c.closePath(); c.fill(); c.fillStyle = '#ffe08a'; c.beginPath(); c.moveTo(x - w / 2, y - h); c.lineTo(x + w / 2, y - h * .55); c.lineTo(x + w / 2, y - h * .45); c.lineTo(x - w / 2, y - h * .9); c.fill(); for (const [dx, dy, r] of [[-22, -18, 8], [12, -14, 6], [28, -30, 5], [-4, -36, 5]]) ell(c, x + dx * s, y + dy * s, r * s, r * s, '#d9a832'); }
  if (kind === 'cereal') { const w = 72 * s, h = 104 * s; c.fillStyle = PCOL.cereal; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 8 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x - w / 2, y - h, w * .22, h); ell(c, x, y - h * .36, 24 * s, 12 * s, CREAM); for (const dx of [-12, 0, 12]) ell(c, x + dx * s, y - h * .45, 7 * s, 7 * s, '#f2c94c'); }
  if (kind === 'choc') { const w = 100 * s, h = 44 * s; c.fillStyle = PCOL.choc; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 6 * s); c.fill(); c.fillStyle = GOLD; c.fillRect(x + w / 2 - 24 * s, y - h, 24 * s, h); c.fillRect(x - w / 2, y - h, 10 * s, h); c.fillStyle = CREAM; c.fillRect(x - w / 2 + 18 * s, y - h * .62, w * .42, h * .24); }
  c.restore();
}
const KINDS = ['chips', 'cookie', 'tube', 'roll', 'chipsG', 'choc'];
function basket(c, x, y, s = 1) {   // a hand basket hanging from (x, y): the handle's top
  c.strokeStyle = '#b8482f'; c.lineWidth = 7 * s; c.beginPath(); c.arc(x, y + 40 * s, 36 * s, Math.PI, 0); c.stroke();
  c.fillStyle = '#d9583c'; c.beginPath(); c.moveTo(x - 58 * s, y + 40 * s); c.lineTo(x + 58 * s, y + 40 * s); c.lineTo(x + 46 * s, y + 104 * s); c.lineTo(x - 46 * s, y + 104 * s); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.15)'; for (let k = 0; k < 3; k++) c.fillRect(x - 50 * s, y + 56 * s + k * 16 * s, 100 * s, 5 * s);
}
function shelfUnit(c, x0, x1, tiers, o = {}) {   // a shop shelf seen from the front: a back panel and boards; o.goods(tier, i, x, y) draws what stands on each board
  const top = tiers[0] - 150; c.fillStyle = '#1f2c70'; c.beginPath(); c.roundRect(x0, top, x1 - x0, 1700 - top, [16, 16, 0, 0]); c.fill(); c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(x0, top, x1 - x0, 14);
  tiers.forEach((by, ti) => { if (o.goods) o.goods(ti, by); c.fillStyle = '#4a5cae'; c.fillRect(x0, by, x1 - x0, 16); c.fillStyle = '#34449a'; c.fillRect(x0, by + 16, x1 - x0, 12); });
}
function owner(c, t, x, y, s, o = {}) { mascot(c, { id: 'own', skin: 'blue1', tache: true, cap: true, s, x, y, f: o.f ?? -.3, smile: o.smile ?? .9, sad: o.sad || 0, look: o.look ?? -.3, blink: blinkAt(t, 7), handL: o.handL, handR: o.handR }); }
const SHOPPER = o => ({ id: 'sh', skin: 'blue2', fem: 'pony', s: 1.45, smile: .9, ...o });
// the floor plan, from above: the door at the bottom left, four rows of shelves, the back wall at the top
const PLAN = { x0: 130, y0: 880, x1: 950, y1: 1800 };
const ROWS = [270, 430, 590, 750], ROW_W = 64, ROW_T = 1040, ROW_B = 1580;
const LONG = [[205, 1830], [205, 975], [380, 975], [380, 1665], [540, 1665], [540, 975], [700, 975], [700, 1665], [875, 1665], [875, 1100]];   // the way through every row to the back corner
const SHORT = [[205, 1830], [205, 1745], [300, 1745], [205, 1745], [205, 1830]];   // in, the milk and bread by the door, out
const FRONT = [[295, 1740], [400, 1740]], BACKP = [[820, 1000], [900, 1000]];   // where the milk and bread stand: by the door; in the back corner
function plen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
function pAt(P, u) { const L = plen(P) * clamp(u); let a = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (a + d >= L) { const k = (L - a) / Math.max(1e-6, d); return [lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]; } a += d; } return P[P.length - 1]; }
function pDraw(c, P, u0, u1, col, w, dash) { if (u1 <= u0) return; const n = 160; c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; if (dash) { c.setLineDash(dash); } c.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = pAt(P, lerp(u0, u1, i / n)); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); }
function arrowHead(c, P, u, col, r = 22) { const a = pAt(P, Math.max(0, u - .01)), b = pAt(P, u), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); c.save(); c.translate(b[0], b[1]); c.rotate(ang); c.fillStyle = col; c.beginPath(); c.moveTo(r, 0); c.lineTo(-r * .7, -r * .8); c.lineTo(-r * .7, r * .8); c.closePath(); c.fill(); c.restore(); }
function token(c, x, y, r = 30, col = 'blue2', k = 1) {   // a shopper on the plan: a round head with eyes and a gold ring
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + 3, y + 6, r, r, 'rgba(0,0,20,.35)'); ell(c, x, y, r + 6, r + 6, GOLD); ell(c, x, y, r, r, { blue1: '#2448bb', blue2: '#3a64dc', blue3: '#2c50c0' }[col]); ell(c, x - r * .3, y - r * .1, r * .17, r * .22, '#fff'); ell(c, x + r * .3, y - r * .1, r * .17, r * .22, '#fff'); ell(c, x - r * .28, y - r * .06, r * .09, r * .12, INKC); ell(c, x + r * .32, y - r * .06, r * .09, r * .12, INKC); c.strokeStyle = '#fff'; c.lineWidth = r * .1; c.lineCap = 'round'; c.beginPath(); c.arc(x, y + r * .2, r * .3, .3, Math.PI - .3); c.stroke(); });
}
const INKC = '#151018';
function plan(c, t, o) {   // o: lit[4] (how lit each row's goods are), mb: [[x,y],[x,y]] where the milk and bread are, mbk: their size (pop), dim (the rows nobody visits)
  const { x0, y0, x1, y1 } = PLAN; c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x0 + 12, y0 + 18, x1 - x0, y1 - y0, 28); c.fill();
  c.fillStyle = '#24357f'; c.beginPath(); c.roundRect(x0, y0, x1 - x0, y1 - y0, 28); c.fill();
  c.save(); c.beginPath(); c.roundRect(x0, y0, x1 - x0, y1 - y0, 28); c.clip(); for (let k = 0; k < 12; k++) { c.fillStyle = k % 2 ? 'rgba(255,255,255,.025)' : 'rgba(255,255,255,0)'; c.fillRect(x0, y0 + k * 80, x1 - x0, 80); } c.restore();
  c.fillStyle = '#2f3f8c'; c.fillRect(x0 + 20, y0 + 16, x1 - x0 - 40, 40);   // the back wall's fridges
  c.strokeStyle = CREAM; c.lineWidth = 12; c.lineJoin = 'round'; c.beginPath(); c.moveTo(270, y1); c.lineTo(x1 - 28, y1); c.arcTo(x1, y1, x1, y1 - 28, 28); c.lineTo(x1, y0 + 28); c.arcTo(x1, y0, x1 - 28, y0, 28); c.lineTo(x0 + 28, y0); c.arcTo(x0, y0, x0, y0 + 28, 28); c.lineTo(x0, y1 - 28); c.arcTo(x0, y1, x0 + 28, y1, 28); c.lineTo(145, y1); c.stroke();
  c.fillStyle = GOLD2; c.beginPath(); c.roundRect(150, y1 - 10, 115, 20, 10); c.fill();   // the door mat
  ROWS.forEach((rx, i) => { const l = o.lit ? o.lit[i] : 0; c.fillStyle = '#3b4c9a'; c.beginPath(); c.roundRect(rx, ROW_T, ROW_W, ROW_B - ROW_T, 12); c.fill();
    for (let k = 0; k < 7; k++) for (const side of [0, 1]) { const px = rx + 8 + side * 28, py = ROW_T + 14 + k * 75, col = PCOL[KINDS[(i * 3 + k + side) % 6]]; c.save(); c.globalAlpha = .28 + .72 * l; c.fillStyle = l > .02 ? col : '#5a6aa8'; c.beginPath(); c.roundRect(px, py, 20, 56, 5); c.fill(); c.restore(); }
    if (l > 0 && l < 1) glow(c, rx + ROW_W / 2, lerp(ROW_B, ROW_T, l), 70, .5 * Math.sin(l * Math.PI)); });
  if (o.dim > 0) { c.save(); c.globalAlpha = .3 * o.dim; c.fillStyle = '#0b1438'; c.beginPath(); c.roundRect(ROWS[0] - 30, ROW_T - 40, ROWS[3] + ROW_W - ROWS[0] + 60, ROW_B - ROW_T + 80, 24); c.fill(); c.restore(); }
  if (o.stand) { c.save(); c.globalAlpha = o.stand; c.fillStyle = '#4a5cae'; c.beginPath(); c.roundRect(250, 1700, 200, 70, 14); c.fill(); c.restore(); }
}
function mbPair(c, t, P, k = 1, s = .85, o = {}) { if (k <= 0) return; const [m, b] = P; scaled(c, m[0], m[1], k, () => prod(c, 'milk', m[0], m[1] + 30, s, o)); scaled(c, b[0], b[1], k, () => prod(c, 'bread', b[0], b[1] + 26, s, o)); }

const SHOT = {
  store(c, t) {   // the shop, from the side: the door; milk and bread right by it; the rest of the shop behind. A shopper comes in, takes the two, and leaves; the shelves stay unvisited
    const H = HIT; bg(c, '#2a4195'); const push = 1 + .03 * ss(seg(t, 0, 10.5)); c.save(); c.translate(540, 1500); c.scale(push, push); c.translate(-540, -1500);
    const fl = c.createLinearGradient(0, 1700, 0, 1920); fl.addColorStop(0, '#1e2a6a'); fl.addColorStop(1, '#141c4c'); c.fillStyle = fl; c.fillRect(0, 1700, 1080, 220); c.fillStyle = 'rgba(246,239,220,.12)'; c.fillRect(0, 1700, 1080, 4);
    // the rest of the shop: a long shelf of goods; a soft light looks along it, then it goes dull: nobody looks
    const look = seg(t, H.rest - .1, H.rest + 1.1), dull = ss(seg(t, H.never - .2, H.never + .3));
    shelfUnit(c, 560, 1040, [1020, 1250, 1480], { goods: (ti, by) => { for (let i = 0; i < 4; i++) { const gx = 625 + i * 112, lit = look > 0 && look < 1 ? Math.exp(-Math.pow((gx - lerp(560, 1040, look)) / 90, 2)) : 0; prod(c, KINDS[(ti * 2 + i) % 6], gx, by, 1.0, { grey: dull * .85, glow: lit }); } } });
    if (dull > 0) badge(c, 'x', 800, 860, 66, E(t, H.never, .3, .5));
    // the door, on the left
    const open = Math.max(ss(seg(t, H.enter - .9, H.enter - .5)) * (1 - ss(seg(t, H.enter + .4, H.enter + .8))), ss(seg(t, H.leave + .1, H.leave + .4)) * (1 - ss(seg(t, H.leave + 1.1, H.leave + 1.5))));
    c.fillStyle = '#e9dcc0'; c.fillRect(40, 1120, 220, 580); c.fillStyle = '#16205a'; c.fillRect(56, 1136, 188, 564); glow(c, 150, 1420, 170, .25 + .3 * open); c.fillStyle = 'rgba(159,199,240,.85)'; c.fillRect(56, 1136, 188 * (1 - .8 * open), 564); c.fillStyle = CREAM; c.fillRect(56 + 188 * (1 - .8 * open) - 8, 1136, 8, 564);
    c.save(); c.translate(150, 1078); c.scale(1.4, 1.4); c.translate(-140, -1208); c.fillStyle = GOLD2; c.beginPath(); c.roundRect(60, 1180, 160, 56, 12); c.fill(); c.strokeStyle = NAVY; c.lineWidth = 7; c.lineJoin = 'round'; c.beginPath(); c.moveTo(108, 1196); c.lineTo(118, 1196); c.lineTo(128, 1222); c.lineTo(162, 1222); c.lineTo(170, 1204); c.lineTo(122, 1204); c.stroke(); ell(c, 132, 1230, 4, 4, NAVY); ell(c, 158, 1230, 4, 4, NAVY); c.restore();   // a cart sign over the door
    // the stand by the door: milk and bread
    const tookM = t > H.milk, tookB = t > H.bread; c.fillStyle = WOOD; c.fillRect(330, 1460, 220, 18); c.fillStyle = '#6e4a2c'; c.fillRect(340, 1478, 14, 222); c.fillRect(526, 1478, 14, 222);
    glow(c, 440, 1380, 160, .3 * ss(seg(t, H.owner, H.notice + .3)) * (1 - ss(seg(t, H.leave, H.leave + .5))));
    prod(c, 'milk', 385, 1460, 1.15); if (!tookM) prod(c, 'milk', 425, 1460, 1.15); prod(c, 'bread', 500, 1460, .95); if (!tookB) prod(c, 'bread', 490, 1412, .95);
    // the shopper: in through the door, to the stand, the two into her basket, and straight back out
    const inU = ss(seg(t, H.enter - .7, H.enter + .55)), outU = seg(t, H.leave - .25, H.leave + 1.05), sx = outU > 0 ? lerp(232, -120, ss(outU)) : lerp(-120, 232, inU);
    const walking = (inU > 0 && inU < 1) || (outU > 0 && outU < 1), face = outU > 0 ? -.45 : .45, reachM = Math.sin(clamp(seg(t, H.milk - .45, H.milk + .1)) * Math.PI), reachB = Math.sin(clamp(seg(t, H.bread - .45, H.bread + .1)) * Math.PI);
    if (t > H.enter - .75) { const Hh = Hs(1.7), reachTo = reachM > 0 ? [lerp(sx + 60, 400, reachM), lerp(1700 - Hh * .42, 1400, reachM)] : reachB > 0 ? [lerp(sx + 60, 470, reachB), lerp(1700 - Hh * .42, 1380, reachB)] : undefined;
      c.save(); c.beginPath(); c.rect(56, 0, 2000, 1920); c.clip();   // she comes out of the doorway, not through the wall
      const bx = outU > 0 ? sx + 70 : sx - 70, by = 1700 - Hh * .5; mascot(c, SHOPPER({ s: 1.7, x: sx, y: 1700, f: face, walk: walking ? 1 : 0, phi: sx / 30, blink: blinkAt(t, 2), look: face > 0 ? .3 : -.3, handL: outU > 0 ? undefined : [bx + 4, by + 4], handR: outU > 0 ? [bx - 4, by + 4] : reachTo }));
      basket(c, bx, by, .95); c.save(); c.beginPath(); c.moveTo(bx - 55, by + 30); c.lineTo(bx + 55, by + 30); c.lineTo(bx + 44, by + 99); c.lineTo(bx - 44, by + 99); c.closePath(); c.clip(); if (tookM) prod(c, 'milk', bx - 16, by + 97, .45); if (tookB) prod(c, 'bread', bx + 18, by + 97, .42); c.restore(); c.fillStyle = '#d9583c'; c.fillRect(bx - 55, by + 36, 110, 8);
      c.restore(); }
    // the item flying from the stand into the basket
    for (const [at, kind, fx] of [[H.milk, 'milk', 425], [H.bread, 'bread', 490]]) { const u = seg(t, at - .05, at + .3); if (u > 0 && u < 1) { const bx = 232 - 70 + (kind === 'milk' ? -16 : 18), by = 1700 - Hs(1.7) * .5 + 97, x = lerp(fx, bx, ss(u)), y = lerp(1440, by, ss(u)) + 40 * Math.sin(u * Math.PI); prod(c, kind, x, y, lerp(1.1, kind === 'milk' ? .45 : .42, u)); } }
    // the owner at the back, watching: he notices
    const ok = E(t, H.owner, .35, .45); if (ok > 0) scaled(c, 890, 1700, Math.min(1, ok), () => owner(c, t, 890, 1700, 1.85, { f: -.35, look: t > H.rest && t < H.never ? .2 : -.4, smile: lerp(.9, .2, dull), sad: .4 * dull }));
    { const k = E(t, H.notice, .3, .5) * (1 - ss(seg(t, H.leave + .6, H.leave + 1))); if (k > 0) scaled(c, 700, 1130, Math.min(1.12, k), () => { ell(c, 705, 1139, 66, 66, 'rgba(0,0,20,.3)'); ell(c, 700, 1130, 66, 66, CREAM); eyeIcon(c, 700, 1130, .55, 1); ell(c, 700, 1130, 11, 11, GOLD); }); }
    c.restore();
  },
  map(c, t) {   // the plan: the milk and bread by the door, a short way in and out; the owner moves them to the back; now the way runs through every row, and every row lights up
    const H = HIT; bg(c, '#2c46a0'); c.save(); c.translate(540, 1320); c.scale(.88, .88); c.translate(-540, -1320); 
    const fly = ss(seg(t, H.key + .4, H.there)), lift = E(t, H.key - .2, .3, .5);
    const walkU = seg(t, H.route + .25, H.found - .15), at = pAt(LONG, ss(walkU));
    const lit = ROWS.map((rx, i) => { const lane = [380, 540, 700, 875][i]; let l = 0; if (walkU > 0) { const [x, y] = at; if (x >= lane - 10) l = 1; else if (x > rx - 80) l = clamp((x - (rx - 80)) / 80); } return ss(l); });
    plan(c, t, { lit, dim: ss(seg(t, 10.6, 11.2)) * (1 - ss(seg(t, H.route, H.route + .5))), stand: 1 - fly });
    // the short way: in, take the two, out
    const sh = ss(seg(t, 10.9, 11.7)) * (1 - ss(seg(t, H.key, H.key + .4))); if (sh > 0) { c.save(); c.globalAlpha = sh; pDraw(c, SHORT, 0, 1, 'rgba(246,239,220,.8)', 10, [16, 18]); c.restore(); const u = ((t - 10.9) / 1.4) % 1; token(c, ...pAt(SHORT, u), 28, 'blue2', sh); }
    // the milk and bread: they lift, glow, and fly to the back corner
    const P = [0, 1].map(k => { const a = FRONT[k], b = BACKP[k], u = clamp(fly * 1.05 - k * .05); return [lerp(a[0], b[0], ss(u)), lerp(a[1], b[1], ss(u)) - 220 * Math.sin(ss(u) * Math.PI)]; });
    if (fly > 0 && fly < 1) glow(c, (P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2, 160, .5);
    mbPair(c, t, P, 1 + .2 * lift * (1 - fly) + .12 * wob(t, H.there, .4, 20, 1), 1.0, { glow: t > H.key - .2 ? .6 : 0 });
    if (t > H.there) spark(c, 862, 980, t, H.there, 6, 110, 14);
    // the long way: the line draws along the shopper's walk, through every row, to the back
    if (walkU > 0) { pDraw(c, LONG, 0, ss(walkU), GOLD, 14); token(c, at[0], at[1], 30, 'blue2', 1); }
    const fk = E(t, H.found, .3, .5); if (fk > 0) { scaled(c, 862, 868, Math.min(1.12, fk), () => { ell(c, 866, 876, 62, 62, 'rgba(0,0,20,.35)'); ell(c, 862, 868, 62, 62, NAVY); c.strokeStyle = CREAM; c.lineWidth = 5; c.beginPath(); c.arc(862, 868, 62, 0, 7); c.stroke(); }); check(c, 862, 868, 40, fk * 1.4); spark(c, 862, 900, t, H.found, 7, 140, 16); }
    c.restore();
  },
  aisle(c, t) {   // on the way: she pushes her cart along an aisle (the shelves glide past); products she never planned to buy hop into the cart, one by one
    const H = HIT; bg(c, '#2a4195'); const sp = 230, off = (t - 21.7) * sp;
    const fl = c.createLinearGradient(0, 1700, 0, 1920); fl.addColorStop(0, '#1e2a6a'); fl.addColorStop(1, '#141c4c'); c.fillStyle = fl; c.fillRect(0, 1700, 1080, 220); for (let k = -1; k < 8; k++) { c.fillStyle = 'rgba(246,239,220,.08)'; c.fillRect(k * 180 - (off % 180), 1704, 6, 216); } c.fillStyle = 'rgba(246,239,220,.12)'; c.fillRect(0, 1700, 1080, 4);
    const tiers = [1100, 1300, 1500], gap = 120, picked = H.meet.map(m => t > m - .5);
    c.fillStyle = '#1f2c70'; c.fillRect(0, 950, 1080, 750); tiers.forEach((by, ti) => { const first = Math.floor((off - 60) / gap); for (let n = first; n < first + 11; n++) { const gx = n * gap - off + 60 + (ti % 2) * 40; prod(c, KINDS[((n * 7 + ti * 3) % 6 + 6) % 6], gx, by, .85); } c.fillStyle = '#4a5cae'; c.fillRect(0, by, 1080, 16); c.fillStyle = '#34449a'; c.fillRect(0, by + 16, 1080, 12); });
    // her and her cart
    const Hh = Hs(1.7), hx = 400, cx0 = 620; mascot(c, SHOPPER({ x: hx, y: 1700, s: 1.7, f: .4, walk: 1, phi: off / 30, smile: picked[2] ? 1 : .85, blink: blinkAt(t, 2), look: .4, handR: [cx0 - 6, 1528], handL: [cx0 - 14, 1540] }));
    c.strokeStyle = '#c9ccd6'; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(cx0 - 20, 1520); c.lineTo(cx0 + 20, 1540); c.lineTo(cx0 + 40, 1650); c.lineTo(cx0 + 290, 1650); c.stroke();
    const inside = [['milk', -60], ['bread', 10]].concat(H.meet.map((m, k) => [['chips', 'cookie', 'tube'][k], 70 + k * 60, m]));
    const SLOT = [85, 142, 192, 234, 268]; c.save(); c.beginPath(); c.moveTo(cx0 + 30, 1500); c.lineTo(cx0 + 300, 1500); c.lineTo(cx0 + 300, 1530); c.lineTo(cx0 + 280, 1630); c.lineTo(cx0 + 50, 1630); c.lineTo(cx0 + 30, 1530); c.closePath(); c.clip(); inside.forEach(([kind, dx, m], i) => { if (m != null && t < m) return; prod(c, kind, cx0 + SLOT[i], 1624, kind === 'bread' ? .42 : .5); }); c.restore();
    c.fillStyle = 'rgba(201,204,214,.55)'; c.beginPath(); c.moveTo(cx0 + 30, 1530); c.lineTo(cx0 + 300, 1530); c.lineTo(cx0 + 280, 1630); c.lineTo(cx0 + 50, 1630); c.closePath(); c.fill(); c.strokeStyle = '#e6e8ef'; c.lineWidth = 6; c.stroke(); for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(cx0 + 30 + k * 54, 1530); c.lineTo(cx0 + 50 + k * 46, 1630); c.stroke(); }
    for (const wx of [cx0 + 70, cx0 + 260]) { ell(c, wx, 1684, 16, 16, '#2a2f48'); ell(c, wx, 1684, 6, 6, '#9aa0b8'); }
    // the unplanned ones: one lights up on the shelf ahead, hops into the cart, and a gold + pops over the cart
    H.meet.forEach((m, k) => { const kind = ['chips', 'cookie', 'tube'][k], sx = 860, sy = tiers[k % 2], ex = cx0 + [192, 234, 268][k], ey = 1624, u = seg(t, m - .5, m);
      if (u > 0 && u < 1) { const e = ss(u), x = lerp(sx, ex, e), y = lerp(sy, ey, e) - 180 * Math.sin(e * Math.PI); prod(c, kind, x, y, lerp(.95, .5, e), { glow: 1 - e }); }
      else if (t > m - 1.1 && u <= 0) prod(c, kind, sx, sy, .95, { glow: ss(seg(t, m - 1.1, m - .6)) });
      const pk = E(t, m, .3, .5) * (1 - ss(seg(t, m + 1.0, m + 1.2))); if (pk > 0) scaled(c, ex, 1440, Math.min(1.12, pk), () => { ell(c, ex, 1440, 40, 40, GOLD); text(c, '+', ex, 1444, 60, NAVY); }); });
    // not on her list: the list card, milk and bread ticked; the extras are not on it
    const lk = E(t, H.plan - .2, .3, .5); if (lk > 0) c.save(); c.translate(-90, 0); scaled(c, 880, 1050, Math.min(1.08, lk), () => { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(778, 900, 214, 300, 18); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(770, 890, 214, 300, 18); c.fill();
      prod(c, 'milk', 830, 1010, .62); check(c, 925, 975, 26, 1); prod(c, 'bread', 830, 1110, .5); check(c, 925, 1085, 26, 1); c.fillStyle = 'rgba(28,36,80,.2)'; c.fillRect(800, 1140, 154, 8); c.fillRect(800, 1160, 110, 8); }); c.restore();
  },
  sales(c, t) {   // after the change: the sales of the other products climb; milk and bread stay the same
    const H = HIT; bg(c); const base = 1600, xs = [200, 370, 540, 710, 880], kinds = ['milk', 'chips', 'cookie', 'tube', 'roll'], h0 = [300, 110, 90, 120, 100], h1 = [300, 470, 420, 520, 450];
    // the change, as a little plan icon: the new long way; it turns into the up arrow
    const mapK = E(t, 27.45, .35, .5) * (1 - ss(seg(t, H.up - .3, H.up))), upK = E(t, H.up - .1, .35, .45);
    if (mapK > 0) scaled(c, 540, 940, 1.5 * Math.min(1.1, mapK), () => { c.fillStyle = 'rgba(246,239,220,.14)'; c.beginPath(); c.roundRect(430, 860, 220, 160, 22); c.fill(); for (let k = 0; k < 4; k++) { c.fillStyle = '#5a6aa8'; c.fillRect(470 + k * 40, 885, 16, 110); } c.strokeStyle = GOLD; c.lineWidth = 7; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); c.moveTo(450, 1010); [[450, 875], [490, 875], [490, 1005], [530, 1005], [530, 875], [570, 875], [570, 1005], [610, 1005], [610, 875], [630, 875]].forEach(p => c.lineTo(...p)); c.stroke(); });
    if (upK > 0) scaled(c, 540, 940, 1.3 * Math.min(1.12, upK), () => { ell(c, 540, 940, 80, 80, GOLD); c.fillStyle = NAVY; c.beginPath(); c.moveTo(540, 880); c.lineTo(588, 935); c.lineTo(560, 935); c.lineTo(560, 995); c.lineTo(520, 995); c.lineTo(520, 935); c.lineTo(492, 935); c.closePath(); c.fill(); });
    c.strokeStyle = 'rgba(246,239,220,.6)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(110, base); c.lineTo(970, base); c.stroke();
    xs.forEach((x, i) => { const k = E(t, 27.5 + i * .07, .35, .45), g = i === 0 ? 0 : clamp(E(t, H.grow + (i - 1) * .12, .45, .35), 0, 1.08), hh = lerp(h0[i], h1[i], g) * Math.min(1, k), hot = i > 0 && t > H.others - .1 && t < H.grow;
      if (hh > 0) { c.fillStyle = i === 0 ? 'rgba(246,239,220,.35)' : GOLD; c.beginPath(); c.roundRect(x - 55, base - hh, 110, hh, [16, 16, 0, 0]); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x - 55, base - hh + 10, 22, hh - 10); }
      if (i > 0 && g > .9) spark(c, x, base - hh - 30, t, H.grow + (i - 1) * .12 + .45, 4, 60, 10);
      scaled(c, x, base + 110, Math.min(1, k) * (1 + (hot ? .12 * Math.sin((t - H.others) * 9) ** 2 : 0)), () => prod(c, kinds[i], x, base + 150, 1.15, { glow: hot ? .7 : 0 })); });
  },
  nonew(c, t) {   // the interesting part: a big "!"; it turns into a brand new product… crossed out: they didn't need one
    const H = HIT; bg(c, '#2c46a0'); const X = 540, Y = 1250;
    const ex = E(t, H.here, .35, .45) * (1 - ss(seg(t, 35.1, 35.45))), box = E(t, 35.3, .4, .45), cr = seg(t, H.no - .05, H.no + .4), gone = ss(seg(t, H.gone + .1, H.gone + .5));
    if (ex > 0) { glow(c, X, Y, 340, .35 * Math.min(1, ex)); scaled(c, X, Y, Math.min(1.12, ex) * (1 + .05 * Math.sin(t * 5)), () => { ell(c, X + 8, Y + 12, 190, 190, 'rgba(0,0,20,.3)'); ell(c, X, Y, 190, 190, GOLD); ell(c, X, Y, 166, 166, '#f2c95e'); text(c, '!', X, Y + 12, 280, NAVY); }); if (t > H.part) spark(c, X, Y, t, H.part, 8, 260, 18); }
    // the new product on its shelf: a box with a star "ÚJ" label
    c.save(); c.globalAlpha = 1 - gone; const shake = cr > 0 ? 10 * Math.sin(t * 50) * Math.exp(-(t - H.no) * 4) : 0;
    if (box > 0) { c.fillStyle = '#4a5cae'; c.fillRect(X - 260 * Math.min(1, box), Y + 210, 520 * Math.min(1, box), 22); scaled(c, X, Y + 210, Math.min(1.1, box), () => { c.save(); c.translate(shake, 0); ell(c, X, Y + 210, 150, 16, 'rgba(0,0,20,.3)'); c.fillStyle = '#e8664f'; c.beginPath(); c.roundRect(X - 130, Y - 160, 260, 370, 24); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(X - 130, Y - 160, 56, 370);
      c.fillStyle = CREAM; c.beginPath(); c.roundRect(X - 90, Y - 10, 180, 120, 18); c.fill(); prod(c, 'cookie', X, Y + 90, .7); c.restore();
      const nk = E(t, H.newp, .3, .5); if (nk > 0) { star(c, X + 120, Y - 150, 96, Math.min(1.15, nk)); scaled(c, X + 120, Y - 150, Math.min(1.15, nk), () => { c.font = '700 54px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('ÚJ', X + 120, Y - 145); }); } }); }
    if (cr > 0) cross(c, X, Y + 30, 220, cr);
    c.restore(); poof(c, X, Y + 30, gone, 200);
    if (gone > 0) { c.save(); c.globalAlpha = gone * .6; c.strokeStyle = CREAM; c.lineWidth = 6; c.setLineDash([22, 16]); c.beginPath(); c.roundRect(X - 130, Y - 160, 260, 370, 24); c.stroke(); c.restore(); }
  },
  route(c, t) {   // what changed: only the way. The short loop by the door; the milk and bread move to the back; the long way draws; shoppers walk it and every row lights up
    const H = HIT; bg(c, '#2c46a0'); c.save(); c.translate(540, 1320); c.scale(.88, .88); c.translate(-540, -1320); 
    const fly = ss(seg(t, H.changed, H.changed + .9)), draw = ss(seg(t, H.path - .1, H.path + .8));
    const walkers = [0, 1, 2].map(k => seg(t, H.walk - .1 + k * .45, H.walk + 1.9 + k * .45));
    const lit = ROWS.map((rx, i) => { const lane = [380, 540, 700, 875][i]; let l = 0; walkers.forEach(w => { if (w <= 0) return; const [x] = pAt(LONG, ss(w)); l = Math.max(l, x >= lane - 10 ? 1 : x > rx - 80 ? clamp((x - (rx - 80)) / 80) : 0); }); return ss(l); });
    plan(c, t, { lit, stand: 1 - fly });
    const sh = 1 - ss(seg(t, H.changed - .2, H.changed + .2)); if (sh > 0) { c.save(); c.globalAlpha = sh; pDraw(c, SHORT, 0, 1, 'rgba(246,239,220,.8)', 10, [16, 18]); c.restore(); token(c, ...pAt(SHORT, ((t - 38.85) / 1.0) % 1), 28, 'blue2', sh); }
    const P = [0, 1].map(k => { const a = FRONT[k], b = BACKP[k]; return [lerp(a[0], b[0], fly), lerp(a[1], b[1], fly) - 200 * Math.sin(fly * Math.PI)]; });
    mbPair(c, t, P, 1, 1.0, { glow: .5 });
    if (draw > 0) { pDraw(c, LONG, 0, draw, GOLD, 14); if (draw < 1) arrowHead(c, LONG, draw, GOLD, 26); else arrowHead(c, LONG, 1, GOLD, 26); }
    walkers.forEach((w, k) => { if (w > 0 && w < 1) token(c, ...pAt(LONG, ss(w)), 28, ['blue2', 'blue1', 'blue3'][k], 1); });
    c.restore();
  },
  rule(c, t) {   // the principle: a light bulb; it turns into the new product, crossed out; that turns into sales climbing
    const H = HIT; bg(c); const X = 540, Y = 1250;
    const bulb = E(t, H.rule - .1, .35, .45) * (1 - ss(seg(t, H.notnew - .5, H.notnew - .2))), on = ss(seg(t, H.alap - .2, H.alap + .2));
    if (bulb > 0) scaled(c, X, Y, Math.min(1.12, bulb), () => { glow(c, X, Y - 60, 380, .2 + .5 * on); if (on > 0) for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + (k - 3.5) * .42, r0 = 250, r1 = 250 + 70 * on; c.strokeStyle = GOLD; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(X + Math.cos(a) * r0, Y - 60 + Math.sin(a) * r0); c.lineTo(X + Math.cos(a) * r1, Y - 60 + Math.sin(a) * r1); c.stroke(); }
      ell(c, X + 8, Y - 50, 190, 190, 'rgba(0,0,20,.25)'); ell(c, X, Y - 60, 190, 190, on > .5 ? '#ffe08a' : CREAM); ell(c, X - 60, Y - 120, 50, 70, 'rgba(255,255,255,.5)'); c.fillStyle = '#9aa0b8'; c.beginPath(); c.roundRect(X - 80, Y + 110, 160, 110, 20); c.fill(); c.fillStyle = '#7a809a'; for (let k = 0; k < 3; k++) c.fillRect(X - 80, Y + 130 + k * 30, 160, 10);
      c.strokeStyle = GOLD2; c.lineWidth = 10; c.beginPath(); c.moveTo(X - 40, Y + 110); c.lineTo(X - 40, Y - 20); c.quadraticCurveTo(X, Y - 70, X + 40, Y - 20); c.lineTo(X + 40, Y + 110); c.stroke(); });
    // not new products…
    const bx = E(t, H.notnew - .3, .35, .45) * (1 - ss(seg(t, H.raise - .6, H.raise - .3))), cr = seg(t, H.notnew + .5, H.notnew + .9);
    if (bx > 0) scaled(c, X, Y, Math.min(1.1, bx), () => { c.fillStyle = '#e8664f'; c.beginPath(); c.roundRect(X - 120, Y - 170, 240, 340, 24); c.fill(); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(X - 120, Y - 170, 52, 340); c.fillStyle = CREAM; c.beginPath(); c.roundRect(X - 84, Y - 20, 168, 110, 18); c.fill(); prod(c, 'cookie', X, Y + 74, .65); star(c, X + 110, Y - 160, 86, 1); c.font = '700 48px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('ÚJ', X + 110, Y - 155); cross(c, X, Y, 210, cr); });
    // …to grow the sales: bars climb, the arrow rises
    const ch = E(t, H.raise - .35, .4, .45);
    if (ch > 0) scaled(c, X, Y + 200, Math.min(1.08, ch), () => { const g = ss(seg(t, H.raise, H.sales + .5)); c.strokeStyle = 'rgba(246,239,220,.6)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(X - 300, Y + 200); c.lineTo(X + 300, Y + 200); c.stroke();
      [0, 1, 2, 3].forEach(k => { const hh = lerp(70, 130 + k * 110, clamp(g * 1.3 - k * .1)); c.fillStyle = GOLD; c.beginPath(); c.roundRect(X - 250 + k * 135, Y + 200 - hh, 95, hh, [14, 14, 0, 0]); c.fill(); });
      const ak = E(t, H.sales, .35, .45); if (ak > 0) scaled(c, X + 240, Y - 260, Math.min(1.12, ak), () => { ell(c, X + 240, Y - 260, 70, 70, CREAM); c.fillStyle = NAVY; c.beginPath(); c.moveTo(X + 240, Y - 310); c.lineTo(X + 282, Y - 262); c.lineTo(X + 258, Y - 262); c.lineTo(X + 258, Y - 212); c.lineTo(X + 222, Y - 212); c.lineTo(X + 222, Y - 262); c.lineTo(X + 198, Y - 262); c.closePath(); c.fill(); }); });
  },
  finale(c, t) {   // more chances to be seen: a long shelf of the products the shop already has; three shoppers walk in along the gold way and stop; each one looks up, and a product lights up; then all of them
    const H = HIT; bg(c, '#2a4195');
    const fl = c.createLinearGradient(0, 1700, 0, 1920); fl.addColorStop(0, '#1e2a6a'); fl.addColorStop(1, '#141c4c'); c.fillStyle = fl; c.fillRect(0, 1700, 1080, 220); c.fillStyle = 'rgba(246,239,220,.12)'; c.fillRect(0, 1700, 1080, 4);
    const all = ss(seg(t, H.existing - .1, H.existing + .4)), spots = [[220, 0], [540, 1], [860, 2]], looks = [H.notice2 - .3, H.notice2, H.notice2 + .3];
    shelfUnit(c, 60, 1020, [930, 1100, 1265], { goods: (ti, by) => { for (let i = 0; i < 7; i++) { const gx = 125 + i * 138, near = spots.findIndex(([sx], k) => Math.abs(gx - sx) < 70 && ti === 2 - k % 2 && t > looks[k]); prod(c, KINDS[(ti * 3 + i) % 6], gx, by, .82, { glow: Math.max(all * .7, near >= 0 ? 1 : 0) }); } } });
    // the gold way along the floor
    const way = ss(seg(t, H.chances - .3, H.chances + .7)); if (way > 0) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 10; c.lineCap = 'round'; c.setLineDash([30, 22]); c.lineDashOffset = -t * 120; c.beginPath(); c.moveTo(40, 1780); c.lineTo(40 + 1000 * way, 1780); c.stroke(); c.restore(); }
    spots.forEach(([sx], k) => { const u = seg(t, 51.9 + k * .35, 53.5 + k * .35), x = lerp(-120 - k * 40, sx, ss(u)), lk = t > looks[k], skin = ['blue2', 'blue1', 'blue3'][k], fem = ['pony', null, 'bun'][k];
      if (u <= 0) return; mascot(c, { id: 'f' + k, skin, fem: fem || undefined, tache: k === 1, s: 1.25, x, y: 1700, f: u < 1 ? .5 : .15, walk: u < 1 ? 1 : 0, phi: x / 28, smile: lk ? 1 : .85, look: lk ? .1 : .4, blink: blinkAt(t, 4 + k) });
      const ek = E(t, looks[k], .3, .5) * (1 - ss(seg(t, H.existing + .6, H.existing + 1))); if (ek > 0) { const ex = x + 112, ey = 1700 - Hs(1.25) * 1.22; scaled(c, ex, ey, Math.min(1.12, ek), () => { ell(c, ex + 3, ey + 6, 40, 40, 'rgba(0,0,20,.3)'); ell(c, ex, ey, 40, 40, CREAM); eyeIcon(c, ex, ey, .33, 1); ell(c, ex, ey, 6, 6, GOLD); }); } });
    if (t > H.end) { glow(c, 540, 1260, 460, .3 * ss(seg(t, H.end, H.end + .5))); spark(c, 540, 1260, t, H.end, 8, 380, 18); }
  },
};
function eyeIcon(c, x, y, s, open = 1) { c.save(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); ell(c, x, y, 34 * s, 34 * s, CREAM); c.restore(); }

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); c.translate(540, 1310); c.scale(1.08, 1.08); c.translate(-540, -1310); SHOT[SHOTS[i][1]](c, t); c.setTransform(K, 0, 0, K, 0, 0); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['szupermarket','tejet','kenyeret','azonnal','hátsó','sorokon','terveztek','megnőtt','érdekes','egyetlen','új','útvonalat','alapelve','eladásokat','lehetőséget','meglévő']);
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
const PH = [540, 1300];
const SOFT = .7, DIVE = .6, WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55, PAGE = .6;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'soft' && dt < SOFT && i > 0) {
    const e = ss(dt / SOFT), b = Math.sin(e * Math.PI);
    const pic = (cx, j, tt) => { NOW = tt; cx.setTransform(K, 0, 0, K, 0, 0); cx.translate(540, 1310); cx.scale(1.08, 1.08); cx.translate(-540, -1310); SHOT[SHOTS[j][1]](cx, tt); };
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
