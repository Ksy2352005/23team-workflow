// The Brave Flavour: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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
// the display case: a glass counter with tubs of gelato; the special one sits in the middle (level: how full it is)
const TUBS = [['vanilla'], ['choc'], ['special'], ['straw'], ['mango']];
function displayCase(c, x0, x1, top, o = {}) {
  const w = (x1 - x0) / TUBS.length;
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(x0 + 10, top + 230, x1 - x0, 20);
  c.fillStyle = '#26368c'; c.fillRect(x0, top + 120, x1 - x0, 260); c.fillStyle = GOLD; c.fillRect(x0, top + 116, x1 - x0, 5);
  c.fillStyle = '#d9dde6'; c.fillRect(x0, top + 100, x1 - x0, 20);
  TUBS.forEach(([k], i) => { const cx = x0 + w * (i + .5), lvl = o.levels?.[i] ?? 1, special = k === 'special';
    if (o.glowSpecial && special) glow(c, cx, top + 60, w * .9, .5 * o.glowSpecial);
    c.fillStyle = '#c9ccd6'; c.fillRect(cx - w * .42, top + 20, w * .84, 84);
    const col = special ? SCOOP.dark : SCOOP[k]; const sy = top + 20 + 84 * (1 - lvl);
    if (lvl > 0) { c.fillStyle = col; c.beginPath(); c.moveTo(cx - w * .4, top + 104); c.lineTo(cx - w * .4, sy + 14); for (let j = 0; j <= 8; j++) c.lineTo(cx - w * .4 + j * w * .1, sy + (j % 2 ? 0 : 16) * Math.min(1, lvl * 3)); c.lineTo(cx + w * .4, top + 104); c.fill(); }
    if (special && lvl > 0) { for (let j = 0; j < 7; j++) ell(c, cx + (hash(j) - .5) * w * .7, sy + 20 + hash(j + 4) * 50 * lvl, 4, 2.5, '#d23a2a', hash(j) * 3); if (o.flag) flagSign(c, cx, top - 10, o.flag, o.flagK ?? 1); }
  });
  c.fillStyle = 'rgba(180,200,255,.18)'; c.beginPath(); c.moveTo(x0, top + 100); c.lineTo(x0 + 30, top - 40); c.lineTo(x1 - 30, top - 40); c.lineTo(x1, top + 100); c.fill(); c.strokeStyle = 'rgba(233,220,192,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0 + 30, top - 40); c.lineTo(x1 - 30, top - 40); c.stroke();
}
function flagSign(c, x, y, kind, k = 1) { if (k <= 0) return; scaled(c, x, y + 40, k, () => { c.strokeStyle = '#8a5d38'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y + 40); c.lineTo(x, y - 40); c.stroke(); badge(c, kind, x, y - 80, 56); }); }
// the shop: a navy wall, a strip of tiles, the chalkboard on the wall, the counter's back shelf
function parlour(c, t, o = {}) {
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  c.fillStyle = '#1a2563'; c.fillRect(-200, 760, 1480, 900); c.fillStyle = 'rgba(255,255,255,.04)'; for (let x = -200; x < 1280; x += 60) c.fillRect(x, 760, 28, 900);
  for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? '#e9dcc0' : '#26368c'; c.fillRect(-200 + i * 170, 1380, 170, 40); }
  if (o.board !== false) board(c, t, o.boardX ?? 300, o.boardY ?? 1000, o.boardS ?? .55, o.boardMode || 'name', o.boardK ?? 1);
  c.fillStyle = '#5a3a22'; c.fillRect(-200, 1660, 1480, 600); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 1690; y < 2200; y += 40) { c.beginPath(); c.moveTo(-200, y); c.lineTo(1280, y); c.stroke(); }
}
// the chalkboard: 'name' shows the flavour's name, 'wipe' rubs it out (k), 'question' writes the question (k)
function board(c, t, x, y, s, mode, k = 1) {
  const W2 = 400 * s, H2 = 300 * s;
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(x - W2 + 12 * s, y - H2 + 14 * s, W2 * 2, H2 * 2); c.fillStyle = WOOD; c.fillRect(x - W2 - 18 * s, y - H2 - 18 * s, W2 * 2 + 36 * s, H2 * 2 + 36 * s); c.fillStyle = '#121a3a'; c.fillRect(x - W2, y - H2, W2 * 2, H2 * 2);
  c.save(); c.beginPath(); c.rect(x - W2, y - H2, W2 * 2, H2 * 2); c.clip();
  const chalk = (str, yy, sz, col = 'rgba(246,239,220,.92)') => { c.font = `700 ${sz * s}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(str, x, y + yy * s); };
  if (mode === 'name' || mode === 'wipe') { chalk('ÚJ ÍZ!', -170, 54, GOLD); chalk('Étcsoki', -50, 92); chalk('& chili', 70, 92, '#e8664f'); chili(c, x + 260 * s, y + 175 * s, 120 * s, -.4);
    if (mode === 'wipe') { c.fillStyle = '#121a3a'; c.fillRect(x - W2, y - H2, W2 * 2 * k, H2 * 2); c.fillStyle = 'rgba(246,239,220,.07)'; for (let i = 0; i < 6; i++) c.fillRect(x - W2, y - H2 + i * 100 * s, W2 * 2 * k, 40 * s); } }
  if (mode === 'question') { c.save(); c.beginPath(); c.rect(x - W2, y - H2, W2 * 2 * Math.min(1, k * 1.15), H2 * 2); c.clip(); chalk('Van benned', -170, 70); chalk('elég bátorság,', -70, 70, GOLD); chalk('hogy', 25, 70); chalk('megkóstold?', 120, 70); c.restore();
    if (k > .85) chili(c, x + 290 * s, y + 200 * s, 110 * s, -.4); }
  c.restore();
}

function aframe(c, x, ground, gl = 0) {   // a chalkboard A-frame sign: a big gold question mark and a little chili
  if (gl) glow(c, x, ground - 330, 330, .45 * gl);
  c.strokeStyle = WOOD; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 150, ground); c.lineTo(x - 100, ground - 560); c.moveTo(x + 150, ground); c.lineTo(x + 100, ground - 560); c.stroke();
  c.fillStyle = WOOD; c.beginPath(); c.moveTo(x - 130, ground - 120); c.lineTo(x - 98, ground - 560); c.lineTo(x + 98, ground - 560); c.lineTo(x + 130, ground - 120); c.closePath(); c.fill();
  c.fillStyle = '#121a3a'; c.beginPath(); c.moveTo(x - 112, ground - 140); c.lineTo(x - 86, ground - 540); c.lineTo(x + 86, ground - 540); c.lineTo(x + 112, ground - 140); c.closePath(); c.fill();
  c.save(); c.font = '700 240px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('?', x, ground - 360); c.restore(); chili(c, x + 40, ground - 190, 90, -.4);
}
// —— the people ——
const OWNER = o => ({ id: 'owner', skin: 'owner', cap: 1, s: 2.2, smile: .7, ...o });
const GUEST = [['blue1', null], ['blue3', 'long'], ['blue2', 'bob'], ['blue1', 'hat'], ['blue3', null], ['blue2', 'bun']];
const guest = (i, o) => ({ id: 'g' + i, skin: GUEST[i % 6][0], fem: GUEST[i % 6][1], s: 2.0, smile: .5, blink: 0, ...o });
function behindCounter(c, t, o = {}) {   // the owner behind the display case
  mascot(c, OWNER({ x: o.x ?? 640, y: 1560, f: -.2, blink: blinkAt(t, 1), ...o.P })); displayCase(c, o.x0 ?? 360, o.x1 ?? 1000, 1400, o.cs || {});
}

// —— the shots ——
const SHOT = {
  invent(c, t) {   // a gelato maker came up with a new flavour: he whisks it in a bowl, chocolate and chili beside him
    const b = E(t, HIT.bulb1, .35, .5), wa = t * 9;
    stage(c, [140, 820, 940, 1760], seg(t, 0, 3.25), () => { parlour(c, t, { board: false });
      const P = OWNER({ x: 560, y: 1560, f: 0, smile: b > .5 ? 1 : .6, look: .35, blink: blinkAt(t, 1), squash: wob(t, HIT.bulb1, .3, 16, .04) });
      const bx = 560, by = 1420, wx = bx + Math.cos(wa) * 40, wy = by - 40 + Math.sin(wa) * 12; P.handR = [wx + 20, wy - 70]; P.handL = [bx - 120, by - 10]; mascot(c, P);
      displayCase(c, 300, 820, 1400, {});
      ell(c, bx, by + 6, 170, 30, 'rgba(0,0,20,.3)'); c.fillStyle = CREAM; c.beginPath(); c.moveTo(bx - 170, by - 60); c.quadraticCurveTo(bx - 160, by + 20, bx, by + 22); c.quadraticCurveTo(bx + 160, by + 20, bx + 170, by - 60); c.fill();
      ell(c, bx, by - 60, 170, 34, '#e9dcc0'); ell(c, bx, by - 58, 150, 26, SCOOP.dark); c.strokeStyle = 'rgba(120,70,40,.7)'; c.lineWidth = 5; c.beginPath(); c.ellipse(bx, by - 58, 90 + 30 * Math.sin(wa), 14, 0, wa, wa + 4); c.stroke();
      for (let k = 0; k < 6; k++) { const u = ((t * .9 + k / 6) % 1); ell(c, bx + 60 + k * 9, lerp(by - 130, by - 62, u), 5, 3, '#d23a2a', k); }   // chili flakes falling into the bowl, clear of his face
      c.strokeStyle = '#c9ccd6'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(wx + 20, wy - 70); c.lineTo(wx, wy); c.stroke(); for (const d of [-14, 0, 14]) { c.beginPath(); c.ellipse(wx + d * .3, wy + 8, 10 + Math.abs(d) * .4, 26, 0, 0, 7); c.stroke(); }
      bar(c, 320, 1400, 110); chili(c, 810, 1405, 140, -.3);
      if (b > 0) { glow(c, 760, 900, 150, .5 * Math.min(1, b)); badge(c, 'bulb', 760, 900, 60, b); } });
  },
  combo(c, t) {   // a special combination: dark chocolate and red chili
    const bc = E(t, HIT.choc, .35, .45), ch = E(t, HIT.chili, .35, .45), sw = ss(seg(t, HIT.swirl, HIT.swirl + .5)), cn = E(t, HIT.swirl + .2, .35, .45);
    const g = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); g.addColorStop(0, '#2d4596'); g.addColorStop(.8, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
    stage(c, [160, 820, 920, 1720], 0, () => {
      if (bc > 0 && sw < 1) scaled(c, lerp(330, 540, sw), lerp(1050, 1250, sw), bc * (1 - sw * .7), () => bar(c, lerp(330, 540, sw), lerp(1050, 1250, sw), 260));
      if (ch > 0 && sw < 1) scaled(c, lerp(760, 540, sw), lerp(1050, 1250, sw), ch * (1 - sw * .7), () => chili(c, lerp(760, 540, sw), lerp(1050, 1250, sw), 300, -.4));
      if (sw > 0) { glow(c, 540, 1250, 240, .4 * Math.sin(sw * Math.PI)); }
      if (cn > 0) scaled(c, 540, 1680, Math.min(1, cn), () => cone(c, 540, 1680, 150, [SCOOP.dark, SCOOP.dark], true)); });
  },
  offer(c, t) {   // but every time he offered it to the guests, he got the same answer
    stage(c, [120, 820, 1000, 1760], 0, () => { parlour(c, t, { board: false }); behindCounter(c, t, { x: 760, x0: 520, x1: 1000, P: { f: -.4, smile: .8 } });
      HIT.nos.forEach((tn, i) => { const on = t > tn - .5 && (i === 2 || t < HIT.nos[i + 1] - .5); if (!on) return; const shake = t > tn ? Math.sin((t - tn) * 18) * .5 * Math.exp(-(t - tn) * 2.5) : 0;
        mascot(c, guest(i, { x: 320, y: 1740, f: .4, headTurn: shake, smile: .3, alpha: clamp((t - tn + .5) / .25), blink: blinkAt(t, 30 + i) }));
        c.save(); c.translate(560, 1440); c.rotate(-.3); c.fillStyle = CREAM; c.beginPath(); c.ellipse(0, 0, 26, 18, 0, 0, 7); c.fill(); c.fillRect(-4, 0, 8, 90); ell(c, 0, -2, 18, 12, SCOOP.dark); c.restore(); }); });
  },
  plain(c, t) {   // "Thank you, I'd rather have plain chocolate."
    const b = E(t, HIT.ask, .35, .45), hd = ss(seg(t, HIT.hand - .3, HIT.hand + .2));
    stage(c, [120, 780, 1000, 1760], 0, () => { parlour(c, t, { board: false }); behindCounter(c, t, { x: 760, x0: 520, x1: 1000, P: { f: -.4, smile: .5, handR: reach([660, 1300], [560, 1330], hd) } });
      mascot(c, guest(1, { x: 320, y: 1740, f: .4, smile: .8, blink: blinkAt(t, 31), handR: hd > .5 ? [470, 1380] : undefined }));
      cone(c, lerp(580, 480, hd), lerp(1440, 1460, hd), 32, [SCOOP.choc]);
      bubble(c, 320, 1000, 220, 210, b, 320, 1200, () => cone(c, 320, 1080, 44, [SCOOP.choc])); });
  },
  days(c, t) {   // a few days went by, and almost nobody tried it: the other tubs empty, the special one stays full
    const d = HIT.days.filter(x => t > x).length, cyc = (t - 15.6) / 1.1;
    stage(c, [180, 1100, 1000, 1760], 0, () => { parlour(c, t, { board: false });
      const lv = i => i === 2 ? 1 : .25 + .75 * (1 - (cyc % 1)) ;
      behindCounter(c, t, { x: 640, x0: 300, x1: 980, P: { smile: lerp(.6, .1, ss(seg(t, 16, HIT.sad))), sad: ss(seg(t, 17, HIT.sad)) * .6 }, cs: { levels: [lv(0), lv(1), 1, lv(3), lv(4)] } });
      scaled(c, 200, 1250, .55, () => { c.fillStyle = CREAM; c.fillRect(110, 1130, 180, 220); c.fillStyle = '#c4566a'; c.fillRect(110, 1130, 180, 54); text(c, 'NAP', 200, 1158, 34, CREAM); text(c, String(1 + d), 200, 1270, 100, NAVY); }); });
  },
  idea(c, t) {   // then the owner had an idea
    const b = E(t, HIT.bulb2, .35, .5);
    stage(c, [300, 780, 780, 1720], seg(t, 20.05, 22.85), () => { parlour(c, t, { board: false }); mascot(c, OWNER({ s: 2.7, x: 540, y: 1720, f: 0, smile: b > .5 ? 1 : .4, blink: blinkAt(t, 1), squash: wob(t, HIT.bulb2, .3, 14, .04) }));
      if (b > 0) { glow(c, 700, 900, 160, .5 * Math.min(1, b)); badge(c, 'bulb', 700, 900, 66, b); } });
  },
  erase(c, t) {   // he no longer wrote the flavour's name on the board: it is rubbed out
    const w = ss(seg(t, ...HIT.wipe));
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [120, 900, 960, 1620], 0, () => { board(c, t, 540, 1240, 1, 'wipe', w);
      if (w > 0 && w < 1) { const ex = 540 - 400 + 800 * w, ey = 1240 + Math.sin(t * 22) * 120; c.fillStyle = '#e9dcc0'; c.beginPath(); c.roundRect(ex - 60, ey - 40, 120, 80, 14); c.fill(); c.fillStyle = WOOD; c.fillRect(ex - 60, ey - 40, 120, 26); } });
  },
  question(c, t) {   // he wrote only this: "Are you brave enough to taste it?"
    const k = seg(t, ...HIT.write);
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [120, 900, 960, 1620], seg(t, 25.8, 30.6), () => { board(c, t, 540, 1240, 1, 'question', k);
      if (k > 0 && k < 1) { const lines = 4, li = Math.min(3, Math.floor(k * lines)), lx = ((k * lines) % 1), px = 540 - 260 + lx * 520, py = 1240 + (-170 + li * 97); c.save(); c.translate(px + 20, py + 10); c.rotate(.5); c.fillStyle = '#f6efdc'; c.beginPath(); c.roundRect(-9, -70, 18, 80, 6); c.fill(); c.restore(); } });
  },
  crowd(c, t) {   // that same day several came in, and started asking
    stage(c, [80, 780, 1000, 1780], 0, () => { parlour(c, t, { boardMode: 'question', boardX: 540, boardY: 1010, boardS: .5 });
      [[230, 0], [540, 1], [850, 2]].forEach(([x, i]) => { const k = clamp((t - HIT.arrive[i]) / .35); if (k <= 0) return; mascot(c, guest(i + 2, { x, y: 1800, f: 0, back: true, alpha: k }));
        const q = E(t, HIT.qs[i], .3, .5); if (q > 0) { bubble(c, x + 30, 1290, 110, 100, q, x + 10, 1360, () => text(c, '?', x + 30, 1294, 80, GOLD2)); } }); });
  },
  q1(c, t) {   // "Is it really spicy?"
    const b = E(t, HIT.q1 - .3, .35, .45);
    stage(c, [200, 800, 900, 1760], 0, () => { parlour(c, t, { board: false }); mascot(c, guest(2, { s: 2.4, x: 380, y: 1760, f: .3, smile: .5, look: -.3, blink: blinkAt(t, 40) }));
      bubble(c, 640, 1040, 360, 240, b, 470, 1280, () => { badge(c, 'heat', 570, 1040, 72); text(c, '?', 730, 1046, 130, GOLD2); }); });
  },
  q2(c, t) {   // "I wonder what it tastes like?"
    const b = E(t, HIT.q2 - .3, .35, .45);
    stage(c, [180, 800, 880, 1760], 0, () => { parlour(c, t, { board: false }); mascot(c, guest(3, { s: 2.4, x: 700, y: 1760, f: -.3, smile: .6, look: -.3, blink: blinkAt(t, 41) }));
      bubble(c, 440, 1040, 360, 240, b, 600, 1280, () => { cone(c, 380, 1130, 40, [SCOOP.dark, SCOOP.dark], true); text(c, '?', 520, 1046, 130, GOLD2); }); });
  },
  taste(c, t) {   // some tasted it just because they were curious: spoons up, eyes wide, then a smile
    stage(c, [80, 900, 1000, 1760], 0, () => { parlour(c, t, { board: false });
      [[240, 0], [540, 1], [840, 2]].forEach(([x, i]) => { const ts = HIT.spoons[i], up = Math.sin(seg(t, ts - .3, ts + .4) * Math.PI), wow = t > ts + .2 && t < HIT.wow + .6, Hh = Hs(2.0);
        const P = guest(i + 1, { x, y: 1760, f: 0, o: wow ? .8 : 0, smile: t > HIT.wow + .4 ? 1 : .5, blink: blinkAt(t, 50 + i) }); const mouth = [x + 10, 1760 - .62 * Hh]; P.handR = reach([x + 90, 1600], mouth, up); mascot(c, P);
        const [hx, hy] = P.handR; c.save(); c.translate(hx, hy); c.rotate(-.5); c.fillStyle = CREAM; c.fillRect(-4, 0, 8, 70); ell(c, 0, -4, 16, 11, CREAM); if (up < .9) ell(c, 0, -6, 11, 7, SCOOP.dark); c.restore();
        if (t > ts + .3 && t < ts + 1.4) { c.strokeStyle = 'rgba(232,82,62,.8)'; c.lineWidth = 5; c.lineCap = 'round'; for (const d of [-22, 0, 22]) { c.beginPath(); c.moveTo(x + d, 1760 - 1.02 * Hh); c.quadraticCurveTo(x + d + 10, 1760 - 1.1 * Hh, x + d, 1760 - 1.18 * Hh); c.stroke(); } } }); });
  },
  back(c, t) {   // and more interesting still: some of them came back later
    stage(c, [80, 820, 1040, 1780], 0, () => { parlour(c, t, { board: false });
      const dr = Math.max(Math.sin(seg(t, HIT.bell - .2, HIT.bell + .8) * Math.PI), Math.sin(seg(t, HIT.bell2 - .2, HIT.bell2 + .8) * Math.PI));
      c.fillStyle = CREAM; c.fillRect(70, 1020, 230, 640); c.fillStyle = '#2d4596'; c.fillRect(86, 1036, 198, 624); c.fillStyle = WOOD; c.fillRect(86 + 198 * dr, 1036, 198 * (1 - dr), 624);
      const bt = t > HIT.bell2 ? HIT.bell2 : HIT.bell, sw = t > bt ? Math.sin((t - bt) * 14) * .4 * Math.exp(-(t - bt) * 2) : 0; c.save(); c.translate(185, 1000); c.rotate(sw); ell(c, 0, 16, 16, 20, GOLD); c.restore();
      behindCounter(c, t, { x: 780, x0: 560, x1: 1020, P: { f: -.4, smile: 1 }, cs: { glowSpecial: ss(seg(t, HIT.point, HIT.point + .4)) } });
      [[HIT.bell, 1, 520], [HIT.bell2, 2, 290]].forEach(([tb, i, tx]) => { const u = seg(t, tb, tb + 1.0); if (t < tb) return; const P = guest(i, { x: lerp(190, tx, ss(u)), y: 1760, f: .6, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 5, smile: 1, alpha: clamp((t - tb) / .3), blink: blinkAt(t, 60 + i) });
        if (i === 1 && t > HIT.point) P.handR = reach([tx + 80, 1600], [740, 1380], ss(seg(t, HIT.point, HIT.point + .3))); mascot(c, P); }); });
  },
  same(c, t) {   // the gelato hadn't changed
    const ck = E(t, HIT.check, .35, .5);
    const g = c.createRadialGradient(540, 1300, 100, 540, 1300, 1000); g.addColorStop(0, '#26368c'); g.addColorStop(.8, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
    stage(c, [260, 820, 820, 1720], 0, () => { cone(c, 520, 1700, 140, [SCOOP.dark, SCOOP.dark], true); check(c, 740, 960, 70, ck); });
  },
  one(c, t) {   // just one question made people notice it: passers-by stop at the sign, turn, "!"
    const gl = ss(seg(t, HIT.turn - .3, HIT.turn + .4));
    stage(c, [60, 860, 1020, 1800], 0, () => { parlour(c, t, { board: false });
      aframe(c, 540, 1780, gl);
      [[52.04, 980, 790, -1, 0], [52.98, 100, 290, 1, 1]].forEach(([ts, x0, x1, dir, i]) => { const u = seg(t, ts - 1.0, ts), stopped = t >= ts; if (t < ts - 1.2) return;
        mascot(c, guest(i + 2, { x: lerp(x0, x1, ss(u)), y: 1790, s: 1.9, f: stopped ? -dir * .5 : dir * .85, walk: stopped ? 0 : 1, phi: u * Math.PI * 5, smile: stopped ? .7 : .4, look: stopped ? -.25 : 0, o: t > ts + .1 && t < ts + .8 ? .6 : 0, alpha: clamp((t - ts + 1.2) / .3), blink: blinkAt(t, 80 + i) }));
        const ex = E(t, ts + .1, .3, .5); if (ex > 0) scaled(c, x1, 1270, ex, () => text(c, '!', x1, 1270, 120, GOLD)); }); });
  },
  luck(c, t) {   // it was no accident: a die rolls in, tumbles, lands, and is crossed out
    const u = seg(t, 55.3, 56.25), x = ss(seg(t, HIT.nope - .2, HIT.nope + .3)), land = t >= 56.25;
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [120, 960, 960, 1560], 0, () => { c.fillStyle = 'rgba(233,220,192,.12)'; c.fillRect(100, 1452, 880, 6);
      const px = lerp(200, 540, ss(u)), bounce = Math.abs(Math.sin(u * Math.PI * 3)) * (1 - u) * 260, py = 1300 - bounce + (land ? Math.sin(Math.min(1, (t - 56.25) / .25) * Math.PI) * -12 : 0), rot = (1 - ss(u)) * Math.PI * 4;
      const face = land ? 5 : 1 + Math.floor(u * 9) % 6, PIPS = { 1: [[0, 0]], 2: [[-70, -70], [70, 70]], 3: [[-70, -70], [0, 0], [70, 70]], 4: [[-70, -70], [70, -70], [-70, 70], [70, 70]], 5: [[-70, -70], [70, -70], [0, 0], [-70, 70], [70, 70]], 6: [[-70, -70], [70, -70], [-70, 0], [70, 0], [-70, 70], [70, 70]] };
      ell(c, px, 1458, 150 - bounce * .2, 22, 'rgba(0,0,20,.35)');
      c.save(); c.translate(px, py); c.rotate(rot); c.fillStyle = CREAM; c.beginPath(); c.roundRect(-150, -150, 300, 300, 40); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 8; c.stroke(); PIPS[face].forEach(([dx, dy]) => ell(c, dx, dy, 24, 24, NAVY)); c.restore();
      cross(c, 540, 1300, 190, x); });
  },
  curious(c, t) {   // curiosity makes us try things we might not even notice otherwise: a passer-by, a "?" flag on one tub, he stops and tries it
    const u = seg(t, HIT.pass, HIT.notice), stop = t > HIT.notice, tryk = ss(seg(t, HIT.tryit, HIT.tryit + .5)), fk = E(t, HIT.notice - .4, .35, .5);
    stage(c, [100, 900, 1000, 1780], 0, () => { parlour(c, t, { board: false }); displayCase(c, 300, 980, 1420, { flag: 'q', flagK: fk, glowSpecial: fk });
      const P = guest(4, { x: lerp(130, 250, ss(u)), y: 1800, f: stop ? .1 : .7, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 5, smile: tryk > .5 ? 1 : .4, look: stop ? -.3 : 0, alpha: clamp((t - HIT.pass + .3) / .3), blink: blinkAt(t, 70) });
      if (tryk > 0) P.handR = reach([330, 1600], [500, 1420], Math.sin(tryk * Math.PI)); mascot(c, P);
      if (t > HIT.ignore) glow(c, 640, 1400, 200, .3 * ss(seg(t, HIT.ignore, HIT.ignore + .5))); });
  },
  features(c, t) {   // you don't always need to explain every feature: a long list unrolls, then rolls back up
    const un = ss(seg(t, ...HIT.unroll)), rl = ss(seg(t, HIT.roll, HIT.roll + .5)), L = 900 * un * (1 - rl);
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [200, 800, 880, 1780], 0, () => { c.fillStyle = CREAM; c.fillRect(300, 860, 480, L); c.fillStyle = 'rgba(28,36,80,.4)'; for (let y = 900; y < 860 + L - 30; y += 46) { c.fillRect(340, y, 40, 14); c.fillRect(400, y, 280 + (y % 3) * 30, 14); }
      c.fillStyle = WOOD; c.beginPath(); c.roundRect(280, 830, 520, 50, 25); c.fill(); c.beginPath(); c.roundRect(280, 840 + L, 520, 50, 25); c.fill();
      ['choc', 'chili', 'scoop'].forEach((k, i) => badge(c, k, 380 + i * 160, 1000 + i * 180, 54, clamp(un * 3 - i) * (1 - rl))); });
  },
  spark(c, t) {   // it's enough to spark people's curiosity: the question on the board, glowing
    const g = ss(seg(t, HIT.glow - .3, HIT.glow + .5));
    c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920);
    stage(c, [120, 860, 960, 1640], seg(t, 67.7, 70.9), () => { glow(c, 540, 1240, 500, .4 * g); board(c, t, 540, 1240, 1, 'question', 1);
      scaled(c, 540, 1560, 1, () => {}); });
  },
};
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['fagylaltízt', 'étcsokoládét', 'chilit', 'csokisat', 'ötlete', 'bátorság', 'csípős', 'kíváncsiak', 'érdekesebb', 'egyetlen', 'kérdés', 'véletlen', 'kíváncsiság', 'kíváncsiságát']);
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
[HIT.bell, HIT.bell2].forEach(t0 => { for (let k = 1; k < 4; k++) EV.push({ t: +(t0 + k / 4).toFixed(3), type: 'step', pan: lerp(-.7, -.3, k / 4) }); });
for (let k = 1; k < 5; k++) EV.push({ t: +(HIT.pass + k * (HIT.notice - HIT.pass) / 5).toFixed(3), type: 'step', pan: lerp(-.6, 0, k / 5) });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
