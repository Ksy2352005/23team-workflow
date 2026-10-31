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
  if (kind === 'berry') { c.fillStyle = '#d23a4a'; c.beginPath(); c.moveTo(x, y + r * .9); c.quadraticCurveTo(x - r * 1.0, y - r * .1, x - r * .5, y - r * .5); c.quadraticCurveTo(x, y - r * .7, x + r * .5, y - r * .5); c.quadraticCurveTo(x + r * 1.0, y - r * .1, x, y + r * .9); c.fill();
    for (let i = 0; i < 7; i++) ell(c, x + (hash(i) - .5) * r * .9, y - r * .2 + hash(i + 4) * r * .8, r * .05, r * .07, GOLD); ell(c, x - r * .2, y - r * .55, r * .25, r * .1, '#3f7d4f', -.4); ell(c, x + r * .2, y - r * .55, r * .25, r * .1, '#3f7d4f', .4); }
}
// a flavour's name label: a cream card with a gold border, the picture, the name in navy; k reveals the name as if written
function label(c, x, y, w, f, k = 1, sc = 1) {
  if (sc <= 0) return; scaled(c, x, y, sc, () => { const h = w * .3;
    c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(x - w / 2 + 8, y - h / 2 + 10, w, h); c.fillStyle = CREAM; c.fillRect(x - w / 2, y - h / 2, w, h); c.strokeStyle = GOLD2; c.lineWidth = w * .012; c.strokeRect(x - w / 2 + w * .025, y - h / 2 + w * .025, w * .95, h - w * .05);
    art(c, f.art, x - w / 2 + h * .55, y, h * .32);
    c.save(); const tx = x - w / 2 + h * 1.0, room = x + w / 2 - w * .06 - tx; c.font = `700 ${w * .068}px "Montserrat"`; const fs = w * .068 * Math.min(1, room / c.measureText(f.name).width); c.font = `700 ${fs}px "Montserrat"`; c.textAlign = 'left'; c.textBaseline = 'middle'; const tw = c.measureText(f.name).width; c.beginPath(); c.rect(tx - 4, y - h / 2, (tw + 8) * clamp(k), h); c.clip(); c.fillStyle = NAVY; c.fillText(f.name, tx, y + 2); c.restore(); });
}
// —— the kiosk: a street corner at dusk, far roofs with warm windows, cobblestones, string lights; a cream kiosk with a gold-and-cream scalloped awning, a serving window, a menu board on its side ——
function street(c, t) {
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  c.fillStyle = '#16205a'; for (const [bx, bw, bh] of [[-200, 260, 520], [60, 200, 420], [260, 240, 560], [500, 220, 460], [720, 260, 540], [980, 240, 440]]) { c.fillRect(bx, 1500 - bh, bw, bh); c.fillStyle = 'rgba(233,184,96,.55)'; for (let yy = 1500 - bh + 40; yy < 1460; yy += 70) for (let xx = bx + 30; xx < bx + bw - 30; xx += 60) if (hash(xx * 3 + yy) > .4) c.fillRect(xx, yy, 18, 26); c.fillStyle = '#16205a'; }
  const g = c.createLinearGradient(0, 1480, 0, 2100); g.addColorStop(0, '#3a3a5a'); g.addColorStop(1, '#1d1d34'); c.fillStyle = g; c.fillRect(-800, 1480, 2680, 700);
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let r = 0; r < 12; r++) { const y = 1500 + r * r * 5 + r * 22; for (let x = -800 + (r % 2) * 40; x < 1900; x += 80 + r * 4) { c.beginPath(); c.roundRect(x, y, 70 + r * 4, 18 + r * 3, 8); c.stroke(); } }
  c.strokeStyle = 'rgba(20,20,30,.8)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 24; i++) { const x = -100 + i * 55, y = 860 + Math.sin(i / 24 * Math.PI * 2) * 30; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  for (let i = 0; i <= 24; i++) { const x = -100 + i * 55, y = 868 + Math.sin(i / 24 * Math.PI * 2) * 30, on = .75 + .25 * Math.sin(t * 3 + i * 1.7); ell(c, x, y, 6, 6, '#ffe2a0'); glow(c, x, y, 26, .45 * on); }
}
function kiosk(c, t, o = {}) {   // the booth, centred at x, standing on y
  const x = o.x ?? 460, y = o.y ?? 1700;
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(x - 330, y - 10, 680, 30);
  c.fillStyle = '#efe4c8'; c.fillRect(x - 320, y - 700, 640, 700); c.fillStyle = '#d9ccab'; c.fillRect(x - 320, y - 260, 640, 260); c.fillStyle = WOOD; c.fillRect(x - 320, y - 270, 640, 18); c.fillStyle = GOLD2; c.fillRect(x - 320, y - 252, 640, 5);
  c.strokeStyle = 'rgba(120,90,50,.25)'; c.lineWidth = 4; for (let k = 0; k < 3; k++) c.strokeRect(x - 290 + k * 200, y - 220, 170, 190);
  // the serving window, the owner inside
  c.fillStyle = '#26368c'; c.fillRect(x - 260, y - 600, 520, 330); glow(c, x, y - 430, 300, .35);
  if (o.owner !== false) { c.save(); c.beginPath(); c.rect(x - 260, y - 600, 520, 330); c.clip(); drawMascot(c, { ...OWNER({ x: x + (o.ox ?? 60), y: y - 100, s: 1.9, f: o.of ?? -.2, blink: blinkAt(t, 1), ...o.P }), shadow: false }); c.restore(); }
  c.fillStyle = WOOD; c.fillRect(x - 280, y - 280, 560, 22); c.fillStyle = CREAM; c.fillRect(x - 280, y - 286, 560, 8);
  (o.onSill || []).forEach(f => f());
  // the awning: gold and cream scallops
  for (let s2 = 0; s2 < 9; s2++) { const x0 = x - 360 + s2 * 80; c.fillStyle = s2 % 2 ? GOLD : '#f6efdc'; c.fillRect(x0, y - 790, 80, 80); c.beginPath(); c.arc(x0 + 40, y - 710, 40, 0, Math.PI); c.fill(); }
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - 375, y - 805, 750, 24, 10); c.fill();
  c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - 150, y - 900, 300, 92, 16); c.fill(); c.strokeStyle = CREAM; c.lineWidth = 5; c.beginPath(); c.roundRect(x - 138, y - 888, 276, 68, 10); c.stroke();
  c.save(); c.font = '700 44px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('GELATO', x, y - 852); c.restore();
  if (o.menu) menuBoard(c, t, x + 470, y - 380, o.menu);
}
// the menu board on the kiosk's side: the names customers gave the flavours; n how many, kLast writes the newest one
function menuBoard(c, t, x, y, m) {
  const W2 = 150, H2 = 380; c.fillStyle = WOOD; c.fillRect(x - W2 - 14, y - H2 - 14, W2 * 2 + 28, H2 * 2 + 28); c.fillStyle = '#121a3a'; c.fillRect(x - W2, y - H2, W2 * 2, H2 * 2); if (m.glow) glow(c, x, y, 360, .4 * m.glow);
  c.save(); c.font = '700 34px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('MENÜ', x, y - H2 + 44); c.restore();
  FLAV.forEach((f, i) => { if (i >= (m.n ?? 0)) return; const ly = y - H2 + 130 + i * 130, k = i === (m.n ?? 0) - 1 ? (m.kLast ?? 1) : 1; scaled(c, x - W2 + 44, ly, Math.min(1, k * 3), () => { ell(c, x - W2 + 44, ly, 26, 26, f.col); art(c, f.art, x - W2 + 44, ly, 18); });
    c.save(); c.beginPath(); c.rect(x - W2 + 80, ly - 50, 220 * clamp(k), 100); c.clip(); c.font = '700 26px "Montserrat"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(246,239,220,.92)'; const words = f.name.split(' '); c.fillText(words[0], x - W2 + 82, ly - 16); c.fillText(words.slice(1).join(' '), x - W2 + 82, ly + 18); c.restore(); });
  if (m.blank) { const ly = y - H2 + 130 + (m.n ?? 0) * 130; c.strokeStyle = 'rgba(246,239,220,.5)'; c.lineWidth = 4; c.setLineDash([10, 10]); c.beginPath(); c.moveTo(x - W2 + 30, ly + 20); c.lineTo(x + W2 - 30, ly + 20); c.stroke(); c.setLineDash([]); }
}

// —— the people ——
const OWNER = o => ({ id: 'owner', skin: 'owner', fem: 'bun', s: 2.2, smile: .8, ...o });   // a different owner: a woman with her hair up
const GIRL = o => ({ id: 'girl', skin: 'blue2', fem: 'bow', s: 1.5, smile: .7, ...o });
const CUST = [['blue1', null], ['blue3', 'long'], ['blue2', 'bob'], ['blue1', 'beret'], ['blue3', null], ['blue2', 'glasses']];
const cust = (i, o) => ({ id: 'c' + i, skin: CUST[i % 6][0], fem: CUST[i % 6][1], s: 1.9, smile: .6, ...o });
function bg(c) { const g = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); g.addColorStop(0, '#2d4596'); g.addColorStop(.8, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }

// —— the shots ——
const SHOT = {
  kiosk(c, t) {   // an ice-cream seller decided to try something completely different
    const id = E(t, HIT.idea, .35, .5);
    stage(c, [80, 760, 1000, 1760], seg(t, 0, 4.5), () => { street(c, t); kiosk(c, t, { x: 540, P: { smile: id > .5 ? 1 : .7, squash: wob(t, HIT.idea, .3, 16, .04) } });
      if (id > 0) { glow(c, 760, 900, 150, .5 * Math.min(1, id)); badge(c, 'bulb', 760, 900, 60, id); } });
  },
  labels(c, t) {   // instead of always naming the new flavours herself: her own label on the tub, and it is crossed out
    const lk = seg(t, HIT.label - .3, HIT.label + .7), x = ss(seg(t, HIT.labelx, HIT.labelx + .4));
    bg(c);
    stage(c, [180, 980, 900, 1700], 0, () => { c.fillStyle = '#c9ccd6'; c.fillRect(300, 1300, 480, 300); ell(c, 540, 1300, 240, 40, '#d9dde6'); ell(c, 540, 1305, 220, 32, '#e7a0b2');
      label(c, 540, 1460, 440, { name: 'Új íz', art: 'berry' }, lk, 1); cross(c, 540, 1460, 150, x); });
  },
  sign(c, t) {   // she wrote on a board: whoever tastes the new flavour first today can name it
    const w = seg(t, ...HIT.write), f1 = E(t, HIT.first, .35, .5), tg = E(t, HIT.tag, .35, .5);
    bg(c);
    stage(c, [180, 800, 900, 1760], 0, () => {
      c.strokeStyle = WOOD; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(380, 1740); c.lineTo(430, 860); c.moveTo(700, 1740); c.lineTo(650, 860); c.stroke();
      c.fillStyle = WOOD; c.beginPath(); c.moveTo(390, 1560); c.lineTo(432, 840); c.lineTo(648, 840); c.lineTo(690, 1560); c.closePath(); c.fill(); c.fillStyle = '#121a3a'; c.beginPath(); c.moveTo(408, 1540); c.lineTo(446, 860); c.lineTo(634, 860); c.lineTo(672, 1540); c.closePath(); c.fill();
      c.save(); c.beginPath(); c.rect(380, 860, 320 * Math.min(1, w * 1.1), 300); c.clip(); c.font = '700 54px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(246,239,220,.92)'; c.fillText('ADJ', 540, 940); c.fillText('NEVET', 540, 1005); c.fillStyle = GOLD; c.fillText('AZ ÚJ', 540, 1070); c.fillText('ÍZNEK!', 540, 1135); c.restore();
      if (f1 > 0) scaled(c, 470, 1300, f1, () => { ell(c, 470, 1300, 52, 52, GOLD); ell(c, 470, 1300, 40, 40, '#d9a332'); text(c, '1.', 472, 1304, 44, NAVY); c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(440, 1340); c.lineTo(430, 1400); c.lineTo(455, 1385); c.lineTo(470, 1405); c.lineTo(480, 1345); c.fill(); });
      cone(c, 610, 1470, 50, ['#f29a86']); if (tg > 0) scaled(c, 610, 1280, tg, () => { c.fillStyle = CREAM; c.fillRect(560, 1250, 100, 54); c.strokeStyle = GOLD2; c.lineWidth = 3; c.strokeRect(565, 1255, 90, 44); text(c, '?', 610, 1280, 40, GOLD2); }); });
  },
  girl(c, t) {   // the first guest was a young girl
    const u = seg(t, ...HIT.girl);
    stage(c, [60, 760, 1020, 1800], 0, () => { street(c, t); kiosk(c, t, { x: 560, P: { smile: .9 } });
      mascot(c, GIRL({ x: lerp(120, 380, ss(u)), y: 1800, f: u < 1 ? .7 : .3, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, alpha: clamp((t - HIT.girl[0] + .3) / .3), blink: blinkAt(t, 2) })); });
  },
  taste(c, t) {   // she tasted it, and then gave it this name
    const up = Math.sin(seg(t, HIT.spoon - .3, HIT.spoon + .4) * Math.PI), yum = t > HIT.yum, b = E(t, HIT.bubble, .35, .45);
    bg(c);
    stage(c, [220, 820, 900, 1760], 0, () => { const G = GIRL({ s: 2.8, x: 520, y: 1760, f: 0, smile: yum ? 1 : .6, blink: yum && t < HIT.bubble ? 1 : blinkAt(t, 2), squash: wob(t, HIT.yum, .4, 14, .03) }), Hh = Hs(G.s);
      G.handR = reach([620, 1560], [540, 1760 - .64 * Hh], up); G.handL = [430, 1520]; mascot(c, G); cone(c, 420, 1640, 46, ['#f29a86']);
      const [hx, hy] = G.handR; c.save(); c.translate(hx, hy); c.rotate(-.5); c.fillStyle = CREAM; c.fillRect(-5, 0, 10, 80); ell(c, 0, -4, 18, 12, CREAM); if (up < .9) ell(c, 0, -6, 12, 8, '#f29a86'); c.restore();
      bubble(c, 750, 980, 240, 200, b, 640, 1200, () => { c.save(); c.beginPath(); c.roundRect(650, 900, 200, 160, 40); c.clip(); art(c, 'sunset', 750, 990, 110); c.restore(); }); });
  },
  name1(c, t) {   // "Pink Sunset"
    bg(c); stage(c, [120, 1000, 960, 1560], 0, () => { const k = E(t, 20.4, .35, .45); glow(c, 540, 1280, 400, .3 * Math.min(1, k)); label(c, 540, 1280, 820, FLAV[0], seg(t, HIT.name1, HIT.name1 + .9), Math.min(1, k)); });
  },
  nextday(c, t) {   // the next day another guest tried it, and chose this name
    const u = seg(t, ...HIT.man), up = Math.sin(seg(t, HIT.spoon2 - .3, HIT.spoon2 + .4) * Math.PI);
    stage(c, [60, 760, 1020, 1800], 0, () => { street(c, t); kiosk(c, t, { x: 560, P: { smile: .9 } });
      const P = cust(0, { x: lerp(120, 380, ss(u)), y: 1800, f: u < 1 ? .7 : .3, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, smile: t > HIT.spoon2 + .3 ? 1 : .5, alpha: clamp((t - HIT.man[0] + .3) / .3), blink: blinkAt(t, 3) }), Hh = Hs(P.s);
      if (u >= 1) P.handR = reach([P.x + 80, 1600], [P.x + 10, 1800 - .64 * Hh], up); mascot(c, P);
      if (u >= 1) { const [hx, hy] = P.handR; c.save(); c.translate(hx, hy); c.rotate(-.5); c.fillStyle = CREAM; c.fillRect(-4, 0, 8, 64); ell(c, 0, -4, 15, 10, CREAM); if (up < .9) ell(c, 0, -6, 10, 7, FLAV[1].col); c.restore(); }
      const b = E(t, 26.2, .35, .45); bubble(c, 250, 1080, 220, 190, b, 330, 1300, () => { c.save(); c.beginPath(); c.roundRect(160, 1000, 180, 160, 40); c.clip(); c.fillStyle = '#121a3a'; c.fillRect(160, 1000, 180, 160); art(c, 'moon', 250, 1080, 60); c.restore(); }); });
  },
  name2(c, t) {   // "Midnight Chocolate"
    bg(c); stage(c, [120, 1000, 960, 1560], 0, () => { const k = E(t, 27.3, .35, .45); glow(c, 540, 1280, 400, .3 * Math.min(1, k)); label(c, 540, 1280, 820, FLAV[1], seg(t, HIT.name2, HIT.name2 + .7), Math.min(1, k)); });
  },
  menu(c, t) {   // a few days later more names went up on the menu: "Italian Summer", "Strawberry's Secret"
    const n = 2 + (t > HIT.names[2] ? 1 : 0) + (t > HIT.names[3] ? 1 : 0), last = n > 2 ? HIT.names[n - 1] : 0;
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920); stage(c, [340, 920, 740, 1720], 0, () => { menuBoard(c, t, 540, 1320, { n, kLast: n > 2 ? seg(t, last, last + .7) : 1, glow: n > 2 ? Math.sin(seg(t, last, last + 1) * Math.PI) : 0 }); });   // the menu board, close
  },
  queue(c, t) {   // in time, people didn't come only to eat ice cream
    stage(c, [40, 760, 1040, 1800], 0, () => { street(c, t); kiosk(c, t, { x: 460, P: { smile: 1 }, menu: { n: 4 } });
      [[170, 0], [390, 1], [610, 2]].forEach(([x, i]) => { const k = clamp((t - HIT.q[i] + .3) / .3); if (k <= 0) return; mascot(c, cust(i + 1, { x, y: 1800 + (i % 2) * 10, f: -.2, back: i > 0, alpha: k, blink: blinkAt(t, 10 + i) })); }); });
  },
  create(c, t) {   // some wanted to create their own special flavour: fruit and chocolate gather into a scoop, a pen for the name
    const mk = ss(seg(t, HIT.mix, HIT.mix + .5)), pn = E(t, HIT.pen, .35, .45);
    bg(c);
    stage(c, [160, 820, 920, 1760], 0, () => { mascot(c, cust(5, { s: 2.6, x: 330, y: 1760, f: .3, smile: 1, look: -.2, blink: blinkAt(t, 20) }));
      [['berry', 620, 900], ['sun', 820, 960], ['moon', 640, 1120], ['sunset', 840, 1150]].forEach(([a, x, y], i) => { const k = E(t, HIT.picks[i], .3, .5); if (k <= 0) return; const px = lerp(x, 730, mk), py = lerp(y, 1450, mk); scaled(c, px, py, Math.min(1, k) * (1 - mk * .7), () => { ell(c, px, py, 70, 70, CREAM); art(c, a, px, py, 48); }); });
      if (mk > 0) cone(c, 730, 1700, 70 * Math.min(1, mk), ['#f29a86', '#f2d36b']);
      if (pn > 0) scaled(c, 900, 1560, pn, () => { c.fillStyle = CREAM; c.fillRect(840, 1530, 130, 60); c.strokeStyle = GOLD2; c.lineWidth = 3; c.strokeRect(845, 1535, 120, 50); c.save(); c.translate(950, 1500); c.rotate(.6); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-9, -90, 18, 100, 6); c.fill(); c.fillStyle = GOLD; c.fillRect(-9, -90, 18, 20); c.restore(); }); });
  },
  wall(c, t) {   // the owner noticed: they weren't just buying ice cream, they had become part of the shop's story: a wall of name cards, each with its namer
    bg(c);
    stage(c, [80, 800, 1000, 1780], 0, () => {
      c.fillStyle = '#16205a'; c.fillRect(80, 820, 920, 640); c.strokeStyle = 'rgba(20,20,30,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(80, 860); for (let i = 0; i <= 10; i++) c.lineTo(80 + i * 92, 860 + Math.sin(i / 10 * Math.PI) * 30); c.stroke();
      for (let i = 0; i <= 10; i++) { const x = 80 + i * 92, y = 864 + Math.sin(i / 10 * Math.PI) * 30; ell(c, x, y, 5, 5, '#ffe2a0'); glow(c, x, y, 22, .4); }
      HIT.cards.forEach((tc, i) => { const k = E(t, tc, .35, .5); if (k <= 0) return; const cx = 220 + (i % 3) * 320, cy = 1010 + Math.floor(i / 3) * 280, f = FLAV[i % 4];
        scaled(c, cx, cy, Math.min(1, k), () => { c.save(); c.translate(cx, cy); c.rotate((hash(i) - .5) * .12); c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(-112, -112, 230, 240); c.fillStyle = CREAM; c.fillRect(-120, -120, 230, 240); c.fillStyle = '#26368c'; c.fillRect(-104, -104, 198, 140);
          drawMascot(c, { ...cust(i, { x: -5, y: 70, s: .85, smile: 1, f: 0 }), shadow: false }); ell(c, -5, -96, 8, 8, GOLD2); art(c, f.art, -70, 80, 22); c.fillStyle = 'rgba(28,36,80,.6)'; c.fillRect(-40, 72, 120, 8); c.fillRect(-40, 90, 80, 8); c.restore(); }); });
      mascot(c, OWNER({ x: 540, y: 1780, s: 1.8, f: 0, back: t < HIT.notice, smile: 1, blink: blinkAt(t, 1) }));
      if (t > HIT.story) glow(c, 540, 1140, 500, .3 * ss(seg(t, HIT.story, HIT.story + .6))); });
  },
  spark(c, t) {   // and there's something interesting in that
    const s2 = E(t, HIT.spark - .4, .35, .5);
    bg(c); stage(c, [240, 900, 840, 1680], seg(t, 51.5, 53.9), () => { glow(c, 540, 1300, 360, .4 * Math.min(1, s2)); cone(c, 540, 1660, 110, ['#f29a86', '#f2d36b', '#3a2218']); scaled(c, 760, 1050, s2, () => text(c, '!', 760, 1050, 200, GOLD)); });
  },
  build(c, t) {   // when we help create something, we bond with it, and value it more: two pairs of hands build a cone together, a heart thread, stars of value
    const h1 = ss(seg(t, HIT.hands[0] - .4, HIT.hands[0])), h2 = ss(seg(t, HIT.hands[1] - .4, HIT.hands[1])), th = ss(seg(t, HIT.thread, HIT.thread + .8));
    bg(c);
    stage(c, [140, 860, 940, 1760], 0, () => { cone(c, 540, 1740, 90, h2 > .9 ? ['#f29a86', '#3a2218'] : h1 > .9 ? ['#f29a86'] : []);
      const arm = (x0, y0, x1, y1, u, col) => { const hx = lerp(x0, x1, u), hy = lerp(y0, y1, u); c.strokeStyle = col; c.lineWidth = 64; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 300, y0); c.lineTo(hx, hy); c.stroke(); ell(c, hx, hy, 46, 46, col); return [hx, hy]; };
      if (h1 < 1) { const [hx, hy] = arm(160, 1300, 470, 1450, h1, '#2a52c9'); ell(c, hx + 40, hy + 20, 72, 64, '#f29a86'); }
      if (h2 > 0 && h2 < 1) { const [hx, hy] = arm(1220, 1250, 620, 1350, h2, '#eeeeea'); ell(c, hx - 40, hy + 20, 72, 64, '#3a2218'); }
      if (th > 0) { c.strokeStyle = '#d94a6a'; c.lineWidth = 6; c.setLineDash([16, 12]); c.beginPath(); c.moveTo(250, 1100); c.quadraticCurveTo(400, 960, 540, 1300); c.stroke(); c.setLineDash([]); heart(c, 250, 1100, 50, th, '#d94a6a'); }
      HIT.stars.forEach((ts, i) => star(c, 700 + i * 90, 1060 - i * 50, 40, E(t, ts, .3, .55))); });
  },
  sell(c, t) {   // the best way to build a bond with your customers isn't simply to sell them something: a cone for a coin, crossed out
    const tr = ss(seg(t, HIT.trade - .3, HIT.trade + .5)), cn = ss(seg(t, HIT.coin - .3, HIT.coin + .4)), x = ss(seg(t, HIT.cross, HIT.cross + .5));
    bg(c);
    stage(c, [120, 1000, 960, 1600], 0, () => { c.fillStyle = WOOD; c.fillRect(100, 1500, 880, 30); c.fillStyle = CREAM; c.fillRect(100, 1494, 880, 8);
      cone(c, lerp(760, 400, tr), 1490, 60, ['#f2d36b']); ell(c, lerp(320, 700, cn), 1478, 40, 14, GOLD); ell(c, lerp(320, 700, cn), 1474, 34, 10, '#f6d36b');
      cross(c, 540, 1300, 200, x); c.save(); c.globalAlpha = .5 * x; c.fillStyle = TOP; c.fillRect(100, 1000, 880, 600); c.restore(); cross(c, 540, 1300, 200, x); });
  },
  together(c, t) {   // ...but giving them the chance to be part of creating it: she hands over the chalk, the customer writes a new name, the board glows
    const ck = ss(seg(t, HIT.chalk - .3, HIT.chalk + .3)), wr = seg(t, ...HIT.writes), gl = ss(seg(t, HIT.glow - .3, HIT.glow + .5));
    stage(c, [60, 760, 1040, 1800], 0, () => { street(c, t); kiosk(c, t, { x: 400, P: { smile: 1, handL: ck < 1 ? reach([360, 1300], [520, 1400], ck) : undefined }, ox: 80, menu: { n: 4, glow: gl, blank: true } });
      const P = cust(4, { x: 640, y: 1800, f: .6, smile: 1, blink: blinkAt(t, 30) }); if (wr > 0) P.handR = [800 + 120 * clamp(wr * 1.2), 1600 + 8 * Math.sin(wr * 40)]; mascot(c, P);
      if (wr > 0) { c.save(); c.beginPath(); c.rect(800, 1560, 220 * clamp(wr * 1.2), 60); c.clip(); c.font = '700 26px "Montserrat"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(246,239,220,.92)'; c.fillText('A te ízed', 802, 1592); c.restore(); } });
  },
};
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
