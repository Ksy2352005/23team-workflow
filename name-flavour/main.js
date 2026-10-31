// Name It: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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

// —— little badges: cream with a gold ring and a mark ——
function badge(c, kind, x, y, r, k = 1, o = {}) {
  if (k <= 0) return; scaled(c, x, y, k, () => {
    if (o.glow) glow(c, x, y, r * 2.4, .5 * o.glow);
    ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke();
    const g = r * .55;
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, GOLD2);
    if (kind === 'bulb') { ell(c, x, y - g * .15, g * .55, g * .6, GOLD); c.fillStyle = '#8f98b0'; c.fillRect(x - g * .25, y + g * .4, g * .5, g * .35); }
    if (kind === 'chili') chili(c, x, y, g * 1.5, -.5);
    if (kind === 'choc') bar(c, x, y, g * 1.4);
    if (kind === 'scoop') cone(c, x, y + g * .9, g * 1.1, ['#4a2a1a']);
    if (kind === 'heat') { chili(c, x - g * .15, y + g * .2, g * 1.2, -.5); c.strokeStyle = '#d94a3a'; c.lineWidth = r * .07; c.lineCap = 'round'; for (const d of [-.35, 0, .35]) { c.beginPath(); c.moveTo(x + g * (.4 + d), y - g * .2); c.quadraticCurveTo(x + g * (.55 + d), y - g * .5, x + g * (.4 + d), y - g * .8); c.stroke(); } }
  });
}
// —— the gelato: scoops, cones, tubs, the chili, the chocolate ——
const SCOOP = { choc: '#6b3d24', dark: '#3e2216', vanilla: '#f3e6c4', straw: '#e7a0b2', mango: '#ecbd4a', mint: '#a7d3c0' };
function scoopBall(c, x, y, r, col, chiliFlakes = false) {
  ell(c, x, y, r, r * .9, col); ell(c, x - r * .3, y - r * .3, r * .3, r * .18, 'rgba(255,255,255,.25)', -.5);
  c.fillStyle = col; c.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; c.lineTo(x - r * 1.02 + i * r * .204, y + r * .55 + (i % 2 ? r * .2 : 0)); } c.lineTo(x + r, y + r * .3); c.lineTo(x - r, y + r * .3); c.fill();
  if (chiliFlakes) for (let i = 0; i < 9; i++) { ell(c, x + (hash(i) - .5) * r * 1.4, y + (hash(i + 9) - .5) * r * 1.1, r * .07, r * .04, '#d23a2a', hash(i + 3) * 3); }
}
function cone(c, x, y, r, cols, chiliTop = false) {   // y = the cone's tip; scoops stack above
  c.fillStyle = '#d29b45'; c.beginPath(); c.moveTo(x - r * .75, y - r * 1.9); c.lineTo(x + r * .75, y - r * 1.9); c.lineTo(x, y); c.closePath(); c.fill();
  c.save(); c.clip(); c.strokeStyle = 'rgba(120,70,20,.45)'; c.lineWidth = r * .06; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(x + k * r * .25, y - r * 2); c.lineTo(x + k * r * .25 + r * 1.2, y); c.stroke(); c.beginPath(); c.moveTo(x + k * r * .25, y - r * 2); c.lineTo(x + k * r * .25 - r * 1.2, y); c.stroke(); } c.restore();
  cols.forEach((col, i) => scoopBall(c, x, y - r * 2.15 - i * r * 1.15, r * .85, col, chiliTop && i === cols.length - 1));
  if (chiliTop) chili(c, x + r * .2, y - r * 2.15 - (cols.length - 1) * r * 1.15 - r * .8, r * .7, -.9);
}
function chili(c, x, y, L, a = 0) { c.save(); c.translate(x, y); c.rotate(a); const g = c.createLinearGradient(0, -L * .2, 0, L * .2); g.addColorStop(0, '#e8523e'); g.addColorStop(1, '#a8231a'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-L * .5, -L * .12); c.quadraticCurveTo(L * .1, -L * .22, L * .5, L * .05); c.quadraticCurveTo(L * .1, L * .14, -L * .5, L * .12); c.closePath(); c.fill(); ell(c, -L * .15, -L * .06, L * .2, L * .03, 'rgba(255,255,255,.35)', .05);
  c.fillStyle = '#3f7d4f'; c.beginPath(); c.ellipse(-L * .52, 0, L * .08, L * .14, 0, 0, 7); c.fill(); c.strokeStyle = '#3f7d4f'; c.lineWidth = L * .05; c.lineCap = 'round'; c.beginPath(); c.moveTo(-L * .56, 0); c.quadraticCurveTo(-L * .7, -L * .05, -L * .72, -L * .2); c.stroke(); c.restore(); }
function bar(c, x, y, L) { c.save(); c.translate(x, y); c.rotate(-.2); c.fillStyle = '#3e2216'; c.beginPath(); c.roundRect(-L * .55, -L * .3, L * 1.1, L * .6, L * .06); c.fill(); c.strokeStyle = '#5a3424'; c.lineWidth = L * .04; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * L * .3, -L * .3); c.lineTo(i * L * .3, L * .3); c.stroke(); } c.beginPath(); c.moveTo(-L * .55, 0); c.lineTo(L * .55, 0); c.stroke();
  c.fillStyle = GOLD; c.fillRect(-L * .6, -L * .34, L * .36, L * .68); c.restore(); }
// —— the four new flavours, their colours and their little pictures ——
const FLAV = [{ name: 'Rózsaszín naplemente', col: '#f29a86', art: 'sunset' }, { name: 'Éjféli csokoládé', col: '#3a2218', art: 'moon' }, { name: 'Olasz nyár', col: '#f2d36b', art: 'sun' }, { name: 'Eper titka', col: '#e46f86', art: 'berry' }];
function art(c, kind, x, y, r) {
  if (kind === 'sunset') { c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); const g = c.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#f6b38c'); g.addColorStop(.6, '#e7a0b2'); g.addColorStop(1, '#26368c'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); ell(c, x, y + r * .25, r * .45, r * .45, GOLD); c.fillStyle = '#26368c'; c.fillRect(x - r, y + r * .3, 2 * r, r); c.restore(); }
  if (kind === 'moon') { ell(c, x, y, r, r, '#1c2450'); ell(c, x - r * .15, y, r * .55, r * .55, CREAM); ell(c, x + r * .1, y - r * .1, r * .5, r * .5, '#1c2450'); star(c, x + r * .5, y - r * .45, r * .2); star(c, x + r * .45, y + r * .45, r * .14); }
  if (kind === 'sun') { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; c.strokeStyle = GOLD; c.lineWidth = r * .14; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + Math.cos(a) * r * .6, y + Math.sin(a) * r * .6); c.lineTo(x + Math.cos(a) * r * .95, y + Math.sin(a) * r * .95); c.stroke(); } ell(c, x, y, r * .45, r * .45, GOLD); }
  if (kind === 'berry') berry(c, x, y, r);
}
function berry(c, x, y, r, key = 0) { c.fillStyle = '#d23a4a'; c.beginPath(); c.moveTo(x, y + r * .9); c.quadraticCurveTo(x - r * 1.0, y - r * .1, x - r * .5, y - r * .5); c.quadraticCurveTo(x, y - r * .7, x + r * .5, y - r * .5); c.quadraticCurveTo(x + r * 1.0, y - r * .1, x, y + r * .9); c.fill();
  for (let i = 0; i < 9; i++) ell(c, x + (hash(i) - .5) * r * .9, y - r * .2 + hash(i + 4) * r * .8, r * .05, r * .07, GOLD); ell(c, x - r * .2, y - r * .55, r * .25, r * .1, '#3f7d4f', -.4); ell(c, x + r * .2, y - r * .55, r * .25, r * .1, '#3f7d4f', .4);
  if (key) { glow(c, x, y + r * .1, r * 1.4, .6 * key); ell(c, x, y, r * .14, r * .14, '#2a0d12'); c.fillStyle = '#2a0d12'; c.beginPath(); c.moveTo(x - r * .08, y + r * .05); c.lineTo(x + r * .08, y + r * .05); c.lineTo(x + r * .12, y + r * .35); c.lineTo(x - r * .12, y + r * .35); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,214,120,${.8 * key})`; c.beginPath(); c.moveTo(x - r * .12, y + r * .35); c.lineTo(x + r * .12, y + r * .35); c.lineTo(x + r * .6, y + r * 1.6); c.lineTo(x - r * .6, y + r * 1.6); c.fill(); c.restore(); } }
// a wooden tag on two strings that swings in and flips to show a name (flip 0 = the blank back, 1 = the name)
function nameTag(c, x, y, w, f, flip, swing = 0, k = 1) {
  if (k <= 0) return; const h = w * .32, top = y - h / 2 - 120;
  c.strokeStyle = 'rgba(233,220,192,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - w * .3, top - 400); c.lineTo(x - w * .3 + swing * 40, y - h / 2); c.moveTo(x + w * .3, top - 400); c.lineTo(x + w * .3 + swing * 40, y - h / 2); c.stroke();
  c.save(); c.translate(x + swing * 40, y); c.rotate(swing * .05); const sx = Math.cos(Math.PI * (1 - Math.min(1, flip))); c.scale(Math.max(.03, Math.abs(sx)) * Math.min(1, k), Math.min(1, k));
  c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(-w / 2 + 10, -h / 2 + 14, w, h, 18); c.fill(); c.fillStyle = WOOD; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 18); c.fill(); c.fillStyle = 'rgba(255,230,190,.15)'; c.fillRect(-w / 2 + 10, -h / 2 + 8, w - 20, 8);
  c.fillStyle = CREAM; c.beginPath(); c.roundRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 12); c.fill(); ell(c, -w * .3, -h / 2 + 8, 8, 8, GOLD2); ell(c, w * .3, -h / 2 + 8, 8, 8, GOLD2);
  if (sx > 0) { art(c, f.art, -w / 2 + h * .55, 0, h * .3); c.font = `700 ${w * .064}px "Montserrat"`; const room = w / 2 - 30 - (-w / 2 + h); const fs = w * .064 * Math.min(1, room / c.measureText(f.name).width); c.font = `700 ${fs}px "Montserrat"`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(f.name, -w / 2 + h, 2); }
  else { c.font = `700 ${h * .5}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD2; c.fillText('?', 0, 4); }
  c.restore();
}
// the imagined worlds inside each scoop (drawn full-frame under the captions)
function dream(c, kind, t, k = 1) {
  if (k <= 0) return; c.save(); c.globalAlpha = Math.min(1, k);
  if (kind === 'sunset') { const g = c.createLinearGradient(0, 640, 0, 1400); g.addColorStop(0, '#2b2f78'); g.addColorStop(.45, '#c9788e'); g.addColorStop(1, '#f6b38c'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
    const sy = 1330 + (t % 30) * 2; glow(c, 540, 1300, 520, .6); c.save(); c.beginPath(); c.rect(0, 0, 1080, 1400); c.clip(); scoopBall(c, 540, sy, 230, '#f29a86'); ell(c, 480, sy - 80, 50, 26, 'rgba(255,255,255,.3)', -.4); c.restore();
    const wg = c.createLinearGradient(0, 1400, 0, 1920); wg.addColorStop(0, '#5a4f9e'); wg.addColorStop(1, '#1c2450'); c.fillStyle = wg; c.fillRect(0, 1400, 1080, 520);
    for (let i = 0; i < 16; i++) { const y = 1420 + i * 30, w2 = 260 - i * 12 + Math.sin(t * 3 + i) * 20; c.fillStyle = `rgba(246,179,140,${.5 - i * .025})`; c.fillRect(540 - w2 / 2 + Math.sin(t * 2 + i) * 10, y, w2, 6); }
    c.fillStyle = '#1c2450'; c.beginPath(); c.moveTo(0, 1400); c.quadraticCurveTo(200, 1330, 380, 1400); c.fill(); c.beginPath(); c.moveTo(700, 1400); c.quadraticCurveTo(900, 1340, 1080, 1390); c.lineTo(1080, 1400); c.fill();
    const bx = 760 + Math.sin(t * .8) * 20, by = 1470 + Math.sin(t * 2) * 6; c.fillStyle = '#1c2450'; c.beginPath(); c.moveTo(bx - 60, by); c.lineTo(bx + 60, by); c.lineTo(bx + 40, by + 22); c.lineTo(bx - 40, by + 22); c.fill(); c.beginPath(); c.moveTo(bx, by - 120); c.lineTo(bx, by - 4); c.lineTo(bx + 60, by - 10); c.fill(); }
  if (kind === 'moon') { const g = c.createLinearGradient(0, 640, 0, 1900); g.addColorStop(0, '#060b2a'); g.addColorStop(1, '#16205a'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 40; i++) { const tw = .5 + .5 * Math.sin(t * 3 + i * 2.3); ell(c, hash(i) * 1080, 700 + hash(i + 40) * 700, 3, 3, `rgba(246,239,220,${.3 + .6 * tw})`); }
    glow(c, 560, 1080, 420, .35); ell(c, 560, 1080, 230, 230, '#5a3424'); ell(c, 520, 1040, 210, 210, '#6b3d24'); for (const [dx, dy, r] of [[-60, -40, 40], [70, 30, 30], [-10, 90, 24], [90, -90, 22]]) ell(c, 560 + dx, 1080 + dy, r, r, '#4a2a1a');
    for (let i = 0; i < 5; i++) { const dx = -150 + i * 75, L = 60 + 40 * Math.abs(Math.sin(t * 1.5 + i)); c.fillStyle = '#5a3424'; c.beginPath(); c.roundRect(560 + dx - 16, 1250 + Math.abs(dx) * -.6, 32, L, 16); c.fill(); ell(c, 560 + dx, 1250 + Math.abs(dx) * -.6 + L, 18, 18, '#5a3424'); }
    c.fillStyle = '#0a1036'; for (const [x0, w, h] of [[0, 180, 300], [170, 140, 380], [300, 200, 260], [490, 160, 340], [640, 220, 290], [850, 230, 360]]) { c.fillRect(x0, 1920 - h, w, h); c.beginPath(); c.moveTo(x0, 1920 - h); c.lineTo(x0 + w / 2, 1920 - h - 60); c.lineTo(x0 + w, 1920 - h); c.fill(); }
    c.fillStyle = 'rgba(233,184,96,.7)'; for (let i = 0; i < 14; i++) c.fillRect(30 + hash(i + 7) * 1000, 1650 + hash(i + 3) * 200, 16, 22); }
  if (kind === 'sun') { const g = c.createLinearGradient(0, 640, 0, 1900); g.addColorStop(0, '#3c5fb4'); g.addColorStop(1, '#9fb6ea'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
    glow(c, 760, 960, 360, .7); ell(c, 760, 960, 110, 110, '#ffe08a'); c.fillStyle = '#26368c'; c.fillRect(0, 1500, 1080, 420); for (let i = 0; i < 10; i++) { c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(hash(i) * 1000, 1530 + i * 36, 80 + hash(i + 2) * 80, 5); }
    c.fillStyle = '#efe4c8'; c.fillRect(60, 1180, 300, 330); c.fillStyle = '#d29b45'; c.beginPath(); c.moveTo(40, 1180); c.lineTo(210, 1080); c.lineTo(380, 1180); c.fill(); c.fillStyle = '#26368c'; c.fillRect(120, 1260, 60, 90); c.fillRect(240, 1260, 60, 90);
    c.strokeStyle = '#6b4423'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(1080, 760); c.quadraticCurveTo(800, 780, 620, 900); c.stroke();
    for (const [lx, ly] of [[700, 870], [860, 820], [980, 790]]) { ell(c, lx, ly + 40, 50, 38, '#f2d36b'); ell(c, lx - 14, ly + 26, 14, 8, 'rgba(255,255,255,.5)'); ell(c, lx + 30, ly - 6, 40, 16, '#3f7d4f', -.5); } }
  if (kind === 'berry') { const g = c.createRadialGradient(540, 1250, 50, 540, 1250, 900); g.addColorStop(0, '#5a1a2a'); g.addColorStop(1, '#16205a'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); berry(c, 540, 1240, 380, k); }
  c.restore();
}

// —— the street at dusk, the kiosk, the menu board ——
function street(c, t, o = {}) {
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  if (o.moon) { glow(c, 860, 820, 140, .4); ell(c, 860, 820, 46, 46, '#f1e7cf'); ell(c, 878, 808, 42, 42, TOP); }
  c.fillStyle = '#16205a'; for (const [bx, bw, bh] of [[-300, 260, 520], [-40, 200, 420], [160, 240, 560], [400, 220, 460], [620, 260, 540], [880, 240, 440], [1120, 240, 500]]) { c.fillRect(bx, 1500 - bh, bw, bh); c.fillStyle = 'rgba(233,184,96,.55)'; for (let yy = 1500 - bh + 40; yy < 1460; yy += 70) for (let xx = bx + 30; xx < bx + bw - 30; xx += 60) if (hash(xx * 3 + yy) > .4) c.fillRect(xx, yy, 18, 26); c.fillStyle = '#16205a'; }
  const g = c.createLinearGradient(0, 1480, 0, 2100); g.addColorStop(0, '#3a3a5a'); g.addColorStop(1, '#1d1d34'); c.fillStyle = g; c.fillRect(-800, 1480, 2680, 700);
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let r = 0; r < 12; r++) { const y = 1500 + r * r * 5 + r * 22; for (let x = -800 + (r % 2) * 40; x < 1900; x += 80 + r * 4) { c.beginPath(); c.roundRect(x, y, 70 + r * 4, 18 + r * 3, 8); c.stroke(); } }
  const wave = o.wave ?? -1;   // a ripple of light along the string when she has her idea
  c.strokeStyle = 'rgba(20,20,30,.8)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 30; i++) { const x = -300 + i * 60, y = 860 + Math.sin(i / 30 * Math.PI * 2) * 30; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  for (let i = 0; i <= 30; i++) { const x = -300 + i * 60, y = 868 + Math.sin(i / 30 * Math.PI * 2) * 30, on = .75 + .25 * Math.sin(t * 3 + i * 1.7), w = wave >= 0 ? Math.max(0, 1 - Math.abs(i / 30 - wave) * 6) : 0; ell(c, x, y, 6 + 4 * w, 6 + 4 * w, '#ffe2a0'); glow(c, x, y, 26 + 40 * w, .45 * on + .5 * w); }
}
function kiosk(c, t, o = {}) {   // the booth, centred at x, standing on y
  const x = o.x ?? 460, y = o.y ?? 1700;
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(x - 330, y - 10, 680, 30);
  c.fillStyle = '#efe4c8'; c.fillRect(x - 320, y - 700, 640, 700); c.fillStyle = '#d9ccab'; c.fillRect(x - 320, y - 260, 640, 260); c.fillStyle = WOOD; c.fillRect(x - 320, y - 270, 640, 18); c.fillStyle = GOLD2; c.fillRect(x - 320, y - 252, 640, 5);
  c.strokeStyle = 'rgba(120,90,50,.25)'; c.lineWidth = 4; for (let k = 0; k < 3; k++) c.strokeRect(x - 290 + k * 200, y - 220, 170, 190);
  c.fillStyle = '#26368c'; c.fillRect(x - 260, y - 600, 520, 330); glow(c, x, y - 430, 300, .35);
  if (o.owner !== false) { c.save(); c.beginPath(); c.rect(x - 260, y - 600, 520, 330); c.clip(); drawMascot(c, { ...OWNER({ x: x + (o.ox ?? 60), y: y - 100, s: 1.9, f: o.of ?? -.2, blink: blinkAt(t, 1), ...o.P }), shadow: false }); c.restore(); }
  c.fillStyle = WOOD; c.fillRect(x - 280, y - 280, 560, 22); c.fillStyle = CREAM; c.fillRect(x - 280, y - 286, 560, 8);
  (o.onSill || []).forEach(f => f());
  for (let s2 = 0; s2 < 9; s2++) { const x0 = x - 360 + s2 * 80; c.fillStyle = s2 % 2 ? GOLD : '#f6efdc'; c.fillRect(x0, y - 790, 80, 80); c.beginPath(); c.arc(x0 + 40, y - 710, 40, 0, Math.PI); c.fill(); }
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - 375, y - 805, 750, 24, 10); c.fill();
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - 150, y - 900, 300, 92, 16); c.fill(); c.strokeStyle = CREAM; c.lineWidth = 5; c.beginPath(); c.roundRect(x - 138, y - 888, 276, 68, 10); c.stroke();
  c.save(); c.font = '700 44px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('GELATO', x, y - 852); c.restore();
  // the names hanging under the awning, swinging a little
  (o.tags || []).forEach((f, i) => { const tx = x - 210 + i * 140, sw = Math.sin(t * 2 + i) * .06; c.save(); c.translate(tx, y - 700); c.rotate(sw); c.strokeStyle = 'rgba(233,220,192,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 40); c.stroke(); c.fillStyle = WOOD; c.beginPath(); c.roundRect(-52, 40, 104, 46, 8); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(-46, 46, 92, 34, 6); c.fill(); art(c, f.art, 0, 63, 13); c.restore(); });
  if (o.menu) menuBoard(c, t, x + 470, y - 380, o.menu);
}
function menuBoard(c, t, x, y, m) {
  const W2 = 150, H2 = 380; c.fillStyle = WOOD; c.fillRect(x - W2 - 14, y - H2 - 14, W2 * 2 + 28, H2 * 2 + 28); c.fillStyle = '#121a3a'; c.fillRect(x - W2, y - H2, W2 * 2, H2 * 2); if (m.glow) glow(c, x, y, 360, .4 * m.glow);
  c.save(); c.font = '700 34px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('MENÜ', x, y - H2 + 44); c.restore();
  FLAV.forEach((f, i) => { if (i >= (m.n ?? 0)) return; const ly = y - H2 + 130 + i * 130, k = i === (m.n ?? 0) - 1 ? (m.kLast ?? 1) : 1; scaled(c, x - W2 + 44, ly, Math.min(1, k * 3), () => { ell(c, x - W2 + 44, ly, 26, 26, f.col); art(c, f.art, x - W2 + 44, ly, 18); });
    c.save(); c.beginPath(); c.rect(x - W2 + 80, ly - 50, 220 * clamp(k), 100); c.clip(); c.font = '700 26px "Montserrat"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(246,239,220,.92)'; const words = f.name.split(' '); c.fillText(words[0], x - W2 + 82, ly - 16); c.fillText(words.slice(1).join(' '), x - W2 + 82, ly + 18); c.restore(); });
  if (m.mine !== undefined) { const ly = y - H2 + 130 + 4 * 130; c.strokeStyle = 'rgba(246,239,220,.4)'; c.lineWidth = 4; c.setLineDash([10, 10]); c.beginPath(); c.moveTo(x - W2 + 30, ly + 30); c.lineTo(x + W2 - 30, ly + 30); c.stroke(); c.setLineDash([]);
    if (m.mine > 0) { c.save(); c.beginPath(); c.rect(x - W2 + 20, ly - 50, 280 * clamp(m.mine), 100); c.clip(); ell(c, x - W2 + 44, ly, 26, 26, '#a7d3c0'); star(c, x - W2 + 44, ly, 16); c.font = '700 26px "Montserrat"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('A te', x - W2 + 82, ly - 16); c.fillText('ízed', x - W2 + 82, ly + 18); c.restore(); } }
}
// a tub of gelato seen from the front, set into the counter, with a little label on a pick
function tub(c, x, y, w, col, lbl = null, lk = 1) {
  c.fillStyle = '#c9ccd6'; c.fillRect(x - w / 2, y - w * .45, w, w * .45); ell(c, x, y - w * .45, w / 2, w * .1, '#d9dde6');
  c.fillStyle = col; c.beginPath(); c.moveTo(x - w * .46, y - w * .45); for (let j = 0; j <= 8; j++) c.lineTo(x - w * .46 + j * w * .115, y - w * .5 - (j % 2 ? w * .1 : w * .02)); c.lineTo(x + w * .46, y - w * .45); c.fill();
  if (lbl && lk > 0) scaled(c, x, y - w * .58, Math.min(1, lk), () => { c.strokeStyle = '#8a5d38'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + w * .1, y - w * .5); c.lineTo(x + w * .1, y - w * .78); c.stroke(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(x - w * .38, y - w * .98, w * .76, w * .24, 6); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 3; c.stroke();
    c.font = `700 ${w * .12}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(lbl, x, y - w * .86); });
}
function polaroid(c, x, y, i, sw = 0, w = 210) {   // a photo of a customer with their cone, pinned with a clothes peg
  const f = FLAV[i % 4]; c.save(); c.translate(x, y); c.rotate(sw);
  c.fillStyle = WOOD; c.fillRect(-10, -20, 20, 40);
  c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(-w / 2 + 8, 18, w, w * 1.2); c.fillStyle = CREAM; c.fillRect(-w / 2, 10, w, w * 1.2); c.fillStyle = '#2d4596'; c.fillRect(-w / 2 + 14, 24, w - 28, w * .86);
  c.save(); c.beginPath(); c.rect(-w / 2 + 14, 24, w - 28, w * .86); c.clip(); drawMascot(c, { ...cust(i, { x: -14, y: 24 + w * 1.1, s: w / 200, smile: 1, f: .2, handR: [w * .18, 24 + w * .55] }), shadow: false }); cone(c, w * .2, 24 + w * .72, w * .08, [f.col]); c.restore();
  art(c, f.art, -w * .32, 24 + w * 1.0, w * .07); c.fillStyle = 'rgba(28,36,80,.6)'; c.fillRect(-w * .2, 24 + w * .96, w * .5, 7); c.fillRect(-w * .2, 24 + w * 1.04, w * .32, 7);
  c.restore();
}

// —— the people ——
const OWNER = o => ({ id: 'owner', skin: 'owner', fem: 'bun', s: 2.2, smile: .8, ...o });   // a different owner: a woman with her hair up
const GIRL = o => ({ id: 'girl', skin: 'blue2', fem: 'bow', s: 1.5, smile: .7, ...o });
const CUST = [['blue1', null], ['blue3', 'long'], ['blue2', 'bob'], ['blue1', 'beret'], ['blue3', null], ['blue2', 'glasses']];
const cust = (i, o) => ({ id: 'c' + i, skin: CUST[i % 6][0], fem: CUST[i % 6][1], s: 1.9, smile: .6, ...o });
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); g.addColorStop(0, col); g.addColorStop(.8, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function spoon(c, hx, hy, col, full = true) { c.save(); c.translate(hx, hy); c.rotate(-.5); c.fillStyle = CREAM; c.fillRect(-5, 0, 10, 80); ell(c, 0, -4, 18, 12, CREAM); if (full) ell(c, 0, -6, 12, 8, col); c.restore(); }

// —— the shots ——
const SHOT = {
  kiosk(c, t) {   // an ice-cream seller decided to try something completely different: from the street into her window; a snap of the fingers and the string lights ripple
    const id = E(t, HIT.idea, .35, .5), push = ss(seg(t, 0, 3.0));
    stage(c, lerpBox([-100, 760, 1180, 1820], [140, 780, 940, 1520], push), 0, () => { street(c, t, { wave: t > HIT.idea ? seg(t, HIT.idea, HIT.idea + 1.2) : -1 }); kiosk(c, t, { x: 540, ox: 0, of: 0, P: { s: 2.1, smile: id > .5 ? 1 : .6, look: id > .5 ? -.3 : .2, armR: id > .5 ? 2.2 : .2, squash: wob(t, HIT.idea, .3, 16, .05) } });
      if (id > 0) { glow(c, 720, 1000, 150, .5 * Math.min(1, id)); badge(c, 'bulb', 720, 1000, 54, id); } });
  },
  labels(c, t) {   // instead of always naming the new flavours herself: stamp, stamp, stamp, her labels go on every tub; over the new one she stops, and puts the label away
    bg(c);
    const names = ['Vanília', 'Csoki', 'Mangó'], cols = [SCOOP.vanilla, SCOOP.choc, SCOOP.mango], st = [4.75, 5.3, 5.88], away = ss(seg(t, HIT.labelx, HIT.labelx + .6));
    stage(c, [50, 1180, 1030, 1640], 0, () => { c.fillStyle = '#26368c'; c.fillRect(0, 1560, 1080, 200); c.fillStyle = GOLD; c.fillRect(0, 1556, 1080, 5);
      names.forEach((nm, i) => tub(c, 175 + i * 243, 1560, 228, cols[i], nm, E(t, st[i], .25, .5)));
      tub(c, 904, 1560, 228, '#f29a86'); glow(c, 904, 1440, 170, .3 + .2 * Math.sin(t * 4));
      // her hand with the next label: it hovers over the new tub, then lifts away
      const ht = t < 6.4 ? Math.min(...st.map((s1, i) => Math.abs(t - s1) < .4 ? i : 9)) : 3; const hx = ht < 3 ? 175 + ht * 243 : lerp(904, 1000, away), hy = ht < 3 ? 1300 - 60 * Math.abs(Math.sin((t - st[ht]) * 8)) : lerp(1270, 1200, away);
      c.strokeStyle = '#e6e8ee'; c.lineWidth = 46; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx + 220, hy - 160); c.lineTo(hx + 30, hy - 20); c.stroke(); ell(c, hx + 16, hy - 12, 36, 32, '#ffffff');
      if (t > 6.4) { c.save(); c.translate(hx - 30, hy + 20); c.rotate(-.2 - away); c.fillStyle = CREAM; c.beginPath(); c.roundRect(-70, -24, 140, 48, 6); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 3; c.stroke(); text(c, '?', 0, 2, 34, GOLD2); c.restore(); } });
  },
  sign(c, t) {   // she wrote on a board: whoever tastes it first today can name it; she sets the sign down by the kiosk, chalk writes, a medal, a blank line with a "?"
    const set = ss(seg(t, 7.8, 8.4)), w = seg(t, ...HIT.write), f1 = E(t, HIT.first, .35, .5), tg = E(t, HIT.tag, .35, .5), push = ss(seg(t, 9.8, 11.0));
    stage(c, lerpBox([160, 820, 1000, 1800], [260, 860, 1000, 1790], push), 0, () => { street(c, t);
      mascot(c, OWNER({ x: 430, y: 1790, s: 2.1, f: .5, smile: .9, look: -.2, blink: blinkAt(t, 1), handR: w > 0 && w < 1 ? [560 + 220 * w, 1060 + Math.sin(w * 30) * 30] : undefined }));
      const sx = 780, gy = 1760 - (1 - set) * 120;
      c.strokeStyle = WOOD; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - 160, gy); c.lineTo(sx - 110, gy - 820); c.moveTo(sx + 160, gy); c.lineTo(sx + 110, gy - 820); c.stroke();
      c.fillStyle = WOOD; c.beginPath(); c.moveTo(sx - 150, gy - 180); c.lineTo(sx - 108, gy - 840); c.lineTo(sx + 108, gy - 840); c.lineTo(sx + 150, gy - 180); c.closePath(); c.fill(); c.fillStyle = '#121a3a'; c.beginPath(); c.moveTo(sx - 132, gy - 200); c.lineTo(sx - 94, gy - 820); c.lineTo(sx + 94, gy - 820); c.lineTo(sx + 132, gy - 200); c.closePath(); c.fill();
      c.save(); c.beginPath(); c.rect(sx - 140, gy - 820, 280 * Math.min(1, w * 1.1), 300); c.clip(); c.font = '700 56px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(246,239,220,.92)'; c.fillText('NEVEZD', sx, gy - 750); c.fillStyle = GOLD; c.fillText('EL!', sx, gy - 680); c.restore();
      if (w > 0 && w < 1) { c.save(); c.translate(sx - 120 + 260 * w, gy - 720 + Math.sin(w * 30) * 30); c.rotate(.5); c.fillStyle = '#f6efdc'; c.beginPath(); c.roundRect(-9, -70, 18, 80, 6); c.fill(); c.restore(); }
      cone(c, sx - 40, gy - 260, 46, ['#f29a86']);
      if (f1 > 0) scaled(c, sx + 60, gy - 520, f1, () => { c.save(); c.translate(sx + 60, gy - 520); c.scale(Math.cos(Math.max(0, t - HIT.first) * 6) * .3 + .7, 1); ell(c, 0, 0, 56, 56, GOLD); ell(c, 0, 0, 44, 44, '#d9a332'); text(c, '1.', 2, 4, 48, NAVY); c.restore(); c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(sx + 30, gy - 476); c.lineTo(sx + 20, gy - 410); c.lineTo(sx + 46, gy - 428); c.lineTo(sx + 62, gy - 404); c.lineTo(sx + 74, gy - 474); c.fill(); });
      if (tg > 0) scaled(c, sx + 60, gy - 290, tg, () => { c.strokeStyle = 'rgba(246,239,220,.7)'; c.lineWidth = 5; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(sx + 10, gy - 260); c.lineTo(sx + 110, gy - 260); c.stroke(); c.setLineDash([]); text(c, '?', sx + 60, gy - 300, 60, GOLD); }); });
  },
  girl(c, t) {   // the first guest was a young girl: she skips in, stops at the sign, reads it, jumps for joy
    const u = seg(t, ...HIT.girl), hop = u < 1 ? Math.abs(Math.sin(u * Math.PI * 4)) * 30 : 0, joy = t > 16.3 ? Math.max(0, Math.sin((t - 16.3) * 8)) * 40 * Math.exp(-(t - 16.3) * 2) : 0;
    stage(c, [140, 860, 980, 1800], 0, () => { street(c, t);
      const sx = 760, gy = 1760; c.fillStyle = WOOD; c.beginPath(); c.moveTo(sx - 120, gy - 140); c.lineTo(sx - 86, gy - 640); c.lineTo(sx + 86, gy - 640); c.lineTo(sx + 120, gy - 140); c.closePath(); c.fill(); c.fillStyle = '#121a3a'; c.beginPath(); c.moveTo(sx - 104, gy - 160); c.lineTo(sx - 74, gy - 624); c.lineTo(sx + 74, gy - 624); c.lineTo(sx + 104, gy - 160); c.closePath(); c.fill();
      c.save(); c.font = '700 44px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(246,239,220,.92)'; c.fillText('NEVEZD', sx, gy - 560); c.fillStyle = GOLD; c.fillText('EL!', sx, gy - 506); c.restore(); cone(c, sx - 30, gy - 230, 36, ['#f29a86']);
      mascot(c, GIRL({ s: 1.9, x: lerp(240, 500, ss(u)), y: 1780 - hop - joy, f: u < 1 ? .7 : .5, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, look: u >= 1 ? -.35 : 0, headTurn: u >= 1 ? Math.sin(t * 3) * .2 : 0, smile: joy > 5 ? 1 : .8, armL: joy > 5 ? 2.4 : undefined, armR: joy > 5 ? 2.4 : undefined, alpha: clamp((t - HIT.girl[0] + .3) / .3), blink: blinkAt(t, 2) })); });
  },
  taste(c, t) {   // she tastes it, eyes closed, and a sunset glow fills the air around her
    const up = Math.sin(seg(t, HIT.spoon - .3, HIT.spoon + .4) * Math.PI), yum = t > HIT.yum, sun = ss(seg(t, HIT.yum, HIT.bubble + .6));
    bg(c, '#2d4596'); if (sun > 0) { c.save(); c.globalAlpha = sun; const g = c.createRadialGradient(540, 1350, 100, 540, 1350, 1000); g.addColorStop(0, '#f6b38c'); g.addColorStop(.5, '#c9788e'); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); c.restore(); }
    stage(c, [240, 840, 880, 1760], seg(t, 17.2, 20.3), () => { const G = GIRL({ s: 3.0, x: 540, y: 1760, f: 0, smile: yum ? 1 : .6, blink: yum ? 1 : blinkAt(t, 2), tilt: yum ? Math.sin(t * 3) * .06 : 0, squash: wob(t, HIT.yum, .4, 14, .03) }), Hh = Hs(G.s);
      G.handR = reach([680, 1560], [560, 1760 - .64 * Hh], up); mascot(c, G); spoon(c, ...G.handR, '#f29a86', up < .9);
      if (sun > .3) for (let i = 0; i < 6; i++) { const a = t * .6 + i, r = 300 + 40 * Math.sin(t * 2 + i); ell(c, 540 + Math.cos(a) * r, 1150 + Math.sin(a) * r * .6, 10, 10, `rgba(255,224,138,${.6 * sun})`); } });
  },
  name1(c, t) {   // "Pink Sunset": into the scoop, a sunset over the water; the tag swings in and flips
    const k = ss(seg(t, 20.3, 20.7)); dream(c, 'sunset', t, 1); nameTag(c, 540, 1000, 760, FLAV[0], seg(t, HIT.name1, HIT.name1 + .5), Math.sin(t * 2) * .3, E(t, 20.35, .4, .4)); dreamHaze(c);
  },
  nextday(c, t) {   // the next day, at night, another guest: he tastes the dark one, slowly, and smiles
    const u = seg(t, ...HIT.man), up = Math.sin(seg(t, HIT.spoon2 - .3, HIT.spoon2 + .4) * Math.PI), push = ss(seg(t, 24.0, 26.0));
    stage(c, lerpBox([40, 760, 1040, 1800], [150, 820, 970, 1800], push), 0, () => { street(c, t, { moon: 1 }); kiosk(c, t, { x: 560, P: { smile: .9 }, tags: [FLAV[0]] });
      const P = cust(0, { s: 2.2, x: lerp(120, 400, ss(u)), y: 1800, f: u < 1 ? .7 : .3, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, smile: t > HIT.spoon2 + .4 ? 1 : .4, blink: t > HIT.spoon2 + .1 && t < HIT.spoon2 + .9 ? 1 : blinkAt(t, 3), alpha: clamp((t - HIT.man[0] + .3) / .3) }), Hh = Hs(P.s);
      if (u >= 1) P.handR = reach([P.x + 90, 1600], [P.x + 10, 1800 - .64 * Hh], up); mascot(c, P); if (u >= 1) spoon(c, ...P.handR, FLAV[1].col, up < .9);
      const b = E(t, 26.2, .35, .45); bubble(c, 300, 1100, 200, 180, b, 380, 1290, () => { c.save(); c.beginPath(); c.roundRect(210, 1020, 180, 160, 40); c.clip(); c.fillStyle = '#121a3a'; c.fillRect(210, 1020, 180, 160); art(c, 'moon', 300, 1100, 60); c.restore(); }); });
  },
  name2(c, t) {   // "Midnight Chocolate": a dripping chocolate moon over the rooftops; the tag flips
    dream(c, 'moon', t, 1); nameTag(c, 540, 1520, 740, FLAV[1], seg(t, HIT.name2, HIT.name2 + .45), Math.sin(t * 2) * .3, E(t, 27.3, .4, .4)); dreamHaze(c);
  },
  menu(c, t) {   // a few days later, more names went up on the menu: a calendar flips, then quick glimpses of "Italian Summer" and "Strawberry's Secret" as they are chalked up
    const n = 2 + (t > HIT.names[2] + .7 ? 1 : 0) + (t > HIT.names[3] + .7 ? 1 : 0), last = n > 2 ? HIT.names[n - 1] + .7 : 0;
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [300, 880, 780, 1740], ss(seg(t, 29.0, 35.4)), () => { menuBoard(c, t, 540, 1320, { n, kLast: n > 2 ? seg(t, last, last + .6) : 1, glow: n > 2 ? Math.sin(seg(t, last, last + 1) * Math.PI) : 0 });
      if (n > 2 && t < last + .7) { const w = seg(t, last, last + .6), ly = 1320 - 380 + 130 + (n - 1) * 130; c.save(); c.translate(430 + 200 * w, ly + Math.sin(w * 30) * 14); c.rotate(.5); c.fillStyle = '#f6efdc'; c.beginPath(); c.roundRect(-8, -60, 16, 70, 6); c.fill(); c.restore(); } });
    for (const [i, t0] of [[2, HIT.names[2]], [3, HIT.names[3]]]) { const a = Math.sin(clamp((t - t0 + .1) / .8) * Math.PI); if (a > 0) { dream(c, FLAV[i].art, t, a); nameTag(c, 540, 1600, 640, FLAV[i], 1, 0, a); } }
  },
  queue(c, t) {   // in time, people didn't come only to eat ice cream: a queue snakes along under the lights, bubbles of flavour ideas over their heads
    const pan = ss(seg(t, 35.4, 39.6));
    stage(c, [20, 760, 1060, 1830], pan * 0, () => { street(c, t); kiosk(c, t, { x: 660, P: { smile: 1 }, tags: FLAV });
      [[90, 0], [250, 1], [410, 2]].forEach(([x, i]) => { mascot(c, cust(i + 1, { s: 1.75, x, y: 1810 + (i % 2) * 14, f: .5, smile: .8, blink: blinkAt(t, 10 + i), bob: Math.sin(t * 3 + i) * .006 }));
        const b = E(t, HIT.q[i], .3, .5); if (b > 0) bubble(c, x + 20, 1260, 120, 110, b, x + 10, 1350, () => { ell(c, x + 20, 1260, 40, 40, FLAV[(i + 1) % 4].col); art(c, FLAV[(i + 1) % 4].art, x + 20, 1260, 28); }); }); });
  },
  create(c, t) {   // some wanted to create their own: scoops leap from the tubs into her cone, one by one, then a blank tag and a pen
    bg(c);
    stage(c, [80, 820, 1000, 1780], 0, () => { c.fillStyle = '#26368c'; c.fillRect(-100, 1500, 1280, 300); c.fillStyle = GOLD; c.fillRect(-100, 1496, 1280, 5);
      const cols = ['#f29a86', '#f2d36b', '#a7d3c0', '#3a2218']; cols.forEach((col, i) => tub(c, 170 + i * 240, 1500, 190, col));
      const stack = HIT.picks.filter(p => t > p + .45).length; mascot(c, cust(5, { s: 2.3, x: 760, y: 1790, f: -.3, smile: 1, look: -.3, blink: blinkAt(t, 20), handL: [640, 1500] }));
      cone(c, 620, 1440, 56, cols.slice(0, stack));
      HIT.picks.forEach((p, i) => { const u = seg(t, p, p + .45); if (u <= 0 || u >= 1) return; const x = lerp(170 + i * 240, 620, u), y = lerp(1380, 1440 - 56 * 2.15 - i * 56 * 1.15, u) - Math.sin(u * Math.PI) * 260; scoopBall(c, x, y, 48, cols[i]); });
      const pn = E(t, HIT.pen, .35, .45); if (pn > 0) scaled(c, 420, 1200, pn, () => { c.fillStyle = CREAM; c.beginPath(); c.roundRect(330, 1160, 180, 80, 10); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 4; c.stroke(); text(c, '?', 420, 1202, 50, GOLD2); c.save(); c.translate(530, 1150); c.rotate(.6); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-10, -110, 20, 120, 7); c.fill(); c.fillStyle = GOLD; c.fillRect(-10, -110, 20, 24); c.restore(); }); });
  },
  wall(c, t) {   // she noticed they had become part of the shop's story: polaroids of the namers swing on a string, then fly into a storybook
    const bk = ss(seg(t, HIT.story - .4, HIT.story + .5)), fly = ss(seg(t, HIT.story + .2, HIT.story + 1.4));
    bg(c);
    stage(c, [60, 760, 1020, 1800], 0, () => {
      c.strokeStyle = 'rgba(20,20,30,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 900); c.quadraticCurveTo(540, 980, 1040, 900); c.stroke(); for (let i = 0; i <= 12; i++) { const x = 40 + i * 83, y = 900 + Math.sin(i / 12 * Math.PI) * 40; ell(c, x, y, 5, 5, '#ffe2a0'); glow(c, x, y, 20, .4); }
      HIT.cards.forEach((tc, i) => { const k = E(t, tc, .35, .45); if (k <= 0) return; const px0 = 150 + (i % 3) * 390 * (i < 3 ? 1 : 1), row = Math.floor(i / 3), px = 150 + (i % 3) * 390 + row * 0, py = row ? 1240 : 930 + Math.sin((150 + (i % 3) * 390 - 40) / 1000 * Math.PI) * 38;
        const bx = 540 + ((i % 3) - 1) * 120, by = 1560, x = lerp(px, bx, fly), y = lerp(py, by, fly), sw = Math.sin(t * 2 + i) * .08 * (1 - fly);
        if (row) { c.strokeStyle = 'rgba(20,20,30,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 1220); c.quadraticCurveTo(540, 1290, 1040, 1220); c.stroke(); }
        c.save(); c.globalAlpha = 1 - ss(seg(t, HIT.story + 1.1, HIT.story + 1.5)); scaled(c, x, y, Math.min(1, k) * lerp(1, .5, fly), () => polaroid(c, x, y, i, sw)); c.restore(); });
      if (bk > 0) scaled(c, 540, 1640, bk, () => { const op = ss(seg(t, HIT.story + 1.0, HIT.story + 1.8));
        c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(220, 1480, 660, 300); c.fillStyle = '#26368c'; c.fillRect(200, 1460, 680, 300); c.fillStyle = CREAM; c.fillRect(220 + 320 * (1 - op), 1474, 320 + 320 * op, 272); c.fillStyle = '#26368c'; c.fillRect(530, 1460, 20, 300);
        if (op < 1) { c.fillStyle = '#26368c'; c.fillRect(540, 1460, 340 * (1 - op), 300); c.save(); c.font = '700 34px "Montserrat"'; c.textAlign = 'center'; c.fillStyle = GOLD; c.globalAlpha = 1 - op; c.fillText('A MI', 710, 1580); c.fillText('FAGYIZÓNK', 710, 1625); c.restore(); }
        if (op > 0) { c.save(); c.globalAlpha = op; for (let i = 0; i < 4; i++) { c.save(); c.translate(320 + (i % 2) * 120 + (i > 1 ? 330 : 0), 1610); c.scale(.42, .42); polaroid(c, 0, -140, i, (i - 1.5) * .06); c.restore(); } c.restore(); } });
      mascot(c, OWNER({ x: 900, y: 1790, s: 1.8, f: -.4, smile: 1, look: -.3, blink: blinkAt(t, 1) })); });
  },
  spark(c, t) {   // and there's something interesting in that: the book glows on the counter, a "!"
    const s2 = E(t, HIT.spark - .4, .35, .5);
    bg(c); stage(c, [200, 900, 880, 1700], seg(t, 51.5, 53.9), () => { glow(c, 540, 1400, 380, .45 * Math.min(1, s2));
      c.fillStyle = '#26368c'; c.fillRect(220, 1300, 640, 360); c.fillStyle = CREAM; c.fillRect(240, 1314, 600, 332); c.fillStyle = '#26368c'; c.fillRect(530, 1300, 20, 360);
      for (let i = 0; i < 4; i++) { c.save(); c.translate(330 + (i % 2) * 130 + (i > 1 ? 300 : 0), 1500); c.scale(.46, .46); polaroid(c, 0, -160, i, (i - 1.5) * .06); c.restore(); }
      scaled(c, 540, 1090, s2, () => text(c, '!', 540, 1090, 220, GOLD)); });
  },
  build(c, t) {   // when we take part in making something, we bond with it and value it more: owner and customer stack a giant cone together, a heart thread, gold stars
    const h1 = E(t, HIT.hands[0], .35, .45), h2 = E(t, HIT.hands[1], .35, .45), th = ss(seg(t, HIT.thread, HIT.thread + .8)), g = ss(seg(t, HIT.stars[0], HIT.stars[2] + .5));
    bg(c);
    stage(c, [60, 760, 1020, 1800], 0, () => { glow(c, 540, 1250, 420, .35 * g);
      c.fillStyle = '#d29b45'; c.beginPath(); c.moveTo(380, 1380); c.lineTo(700, 1380); c.lineTo(540, 1790); c.closePath(); c.fill(); c.save(); c.clip(); c.strokeStyle = 'rgba(120,70,20,.45)'; c.lineWidth = 8; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(540 + k * 60, 1370); c.lineTo(540 + k * 60 + 300, 1800); c.stroke(); c.beginPath(); c.moveTo(540 + k * 60, 1370); c.lineTo(540 + k * 60 - 300, 1800); c.stroke(); } c.restore();
      if (h1 > 0) scaled(c, 540, 1300, Math.min(1, h1), () => scoopBall(c, 540, 1300, 170, '#f29a86'));
      if (h2 > 0) scaled(c, 540, 1080, Math.min(1, h2), () => scoopBall(c, 540, 1080, 150, '#a7d3c0'));
      const C = cust(4, { s: 2.2, x: 180, y: 1790, f: .4, smile: 1, blink: blinkAt(t, 30) }), O = OWNER({ s: 2.2, x: 900, y: 1790, f: -.4, smile: 1, blink: blinkAt(t, 1) });
      if (t < HIT.hands[0] + .2) C.handR = reach([300, 1500], [420, 1300], ss(seg(t, HIT.hands[0] - .6, HIT.hands[0]))); if (t < HIT.hands[1] + .2) O.handL = reach([780, 1500], [660, 1080], ss(seg(t, HIT.hands[1] - .6, HIT.hands[1])));
      mascot(c, C); mascot(c, O);
      if (th > 0) { c.strokeStyle = '#d94a6a'; c.lineWidth = 6; c.setLineDash([16, 12]); c.beginPath(); c.moveTo(200, 1300); c.quadraticCurveTo(300, 1050, 440, 1150); c.stroke(); c.setLineDash([]); heart(c, 200, 1290, 46, th, '#d94a6a'); }
      HIT.stars.forEach((ts, i) => star(c, 380 + i * 160, 860 + (i % 2) * 40, 46, E(t, ts, .3, .55))); });
  },
  sell(c, t) {   // the best way to bond with your customers isn't simply to sell them something: a quick grey trade, a cone for a coin, and they go; it is crossed out
    const tr = ss(seg(t, HIT.trade - .3, HIT.trade + .5)), cn = ss(seg(t, HIT.coin - .3, HIT.coin + .4)), go = ss(seg(t, 66.2, 67.4)), x = ss(seg(t, HIT.cross, HIT.cross + .5));
    stage(c, [60, 760, 1040, 1800], 0, () => { street(c, t); kiosk(c, t, { x: 420, P: { smile: .4 } });
      c.save(); c.globalAlpha = 1 - go; const P = cust(2, { x: lerp(820, 1000, go), y: 1800, f: go > 0 ? .7 : -.5, walk: go > 0 && go < 1 ? 1 : 0, phi: go * 12, smile: .3, blink: blinkAt(t, 40) }); P.handL = [lerp(720, P.x - 60, tr), 1440]; mascot(c, P); cone(c, P.handL[0], 1450, 32, ['#f2d36b']); c.restore();
      if (cn > 0 && cn < 1) { ell(c, lerp(760, 620, cn), 1430 - Math.sin(cn * Math.PI) * 80, 26, 10, GOLD); }
      c.fillStyle = `rgba(17,26,82,${.45 * x})`; c.fillRect(-200, 700, 1480, 1200); cross(c, 860, 1450, 170, x); });
  },
  together(c, t) {   // ...but giving them the chance to be part of the making: she hands over the chalk, the customer writes on the menu, the camera pulls out over the glowing kiosk and the crowd
    const ck = ss(seg(t, HIT.chalk - .3, HIT.chalk + .3)), wr = seg(t, ...HIT.writes), gl = ss(seg(t, HIT.glow - .3, HIT.glow + .5)), pull = ss(seg(t, 72.4, 74.4));
    stage(c, lerpBox([440, 900, 1180, 1800], [-140, 760, 1220, 1800], pull), 0, () => { street(c, t, { wave: t > HIT.glow - .4 ? seg(t, HIT.glow - .4, HIT.glow + .8) : -1 }); kiosk(c, t, { x: 400, P: { smile: 1, handL: [ck < 1 ? lerp(420, 640, ck) : 640, 1430] }, ox: 120, tags: FLAV, menu: { n: 4, glow: gl, mine: wr } });
      [[-40, 3], [100, 0]].forEach(([x, i]) => mascot(c, cust(i, { x, y: 1800, f: .4, smile: 1, alpha: pull, blink: blinkAt(t, 50 + i) })));
      const P = cust(4, { s: 1.9, x: 700, y: 1800, f: .5, smile: 1, blink: blinkAt(t, 30) }); if (wr > 0 && wr < 1) P.handR = [790 + 110 * clamp(wr * 1.2), 1600 + 8 * Math.sin(wr * 40)]; mascot(c, P); });
  },
};
function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['egészen', 'nevet', 'elsőként', 'lány', 'Rózsaszín', 'naplemente', 'Éjféli', 'csokoládé', 'Olasz', 'nyár', 'Eper', 'titka', 'saját', 'történetének', 'kötődünk', 'értéket', 'részesei', 'alkotásnak']);
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
const WHIP = .24, PUNCH = .26, DREAM = .6, CLOCK = .55;
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
for (const [a0, b0] of [HIT.girl, HIT.man]) for (let k = 1; k < 5; k++) EV.push({ t: +(a0 + k * (b0 - a0) / 5).toFixed(3), type: 'step', pan: lerp(-.6, -.2, k / 5) });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
