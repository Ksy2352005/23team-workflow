// Two Salesmen: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// The story plays in the middle of the frame; the script is written word by word in the top left as it is spoken.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT } from './story.js';
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'ELADVA?'), document.fonts.load('700 74px "Fredoka"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű„”…'), document.fonts.load('700 74px "Fredoka"', 'abc')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', WOOD = '#8a5d38', END_BLUE = '#0b1438';
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

// —— the icons the salesmen talk in: cream badges with a gold ring and a navy glyph ——
function icon(c, kind, x, y, r, k = 1, o = {}) {
  if (k <= 0) return; scaled(c, x, y, k, () => {
    if (o.glow) glow(c, x, y, r * 2.4, .5 * o.glow);
    ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, o.bg || CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke();
    const g = r * .55; c.fillStyle = NAVY; c.strokeStyle = NAVY; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = r * .1;
    if (kind === 'gauge') { c.beginPath(); c.arc(x, y + g * .25, g, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); for (let i = 0; i <= 4; i++) { const a = Math.PI * (1.1 + i * .2); c.beginPath(); c.moveTo(x + Math.cos(a) * g * .75, y + g * .25 + Math.sin(a) * g * .75); c.lineTo(x + Math.cos(a) * g * .95, y + g * .25 + Math.sin(a) * g * .95); c.stroke(); }
      c.strokeStyle = '#d94a3a'; c.beginPath(); c.moveTo(x, y + g * .25); c.lineTo(x + g * .6, y - g * .35); c.stroke(); ell(c, x, y + g * .25, g * .14, g * .14, NAVY); }
    if (kind === 'seat') { c.beginPath(); c.roundRect(x - g * .35, y - g * .95, g * .6, g * 1.2, g * .2); c.fill(); c.beginPath(); c.roundRect(x - g * .45, y + g * .2, g * 1.15, g * .4, g * .15); c.fill(); c.fillRect(x - g * .3, y + g * .6, g * .15, g * .35); c.fillRect(x + g * .45, y + g * .6, g * .15, g * .35); }
    if (kind === 'speaker') { c.beginPath(); c.moveTo(x - g * .8, y - g * .3); c.lineTo(x - g * .4, y - g * .3); c.lineTo(x, y - g * .75); c.lineTo(x, y + g * .75); c.lineTo(x - g * .4, y + g * .3); c.lineTo(x - g * .8, y + g * .3); c.closePath(); c.fill();
      for (const rr of [.4, .75]) { c.beginPath(); c.arc(x + g * .1, y, g * rr, -.8, .8); c.stroke(); } }
    if (kind === 'cog') { c.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? g * .62 : g * .85; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); ell(c, x, y, g * .28, g * .28, o.bg || CREAM); }
    if (kind === 'screen') { c.beginPath(); c.roundRect(x - g * .85, y - g * .55, g * 1.7, g * 1.05, g * .15); c.fill(); c.fillStyle = '#5a80f0'; c.fillRect(x - g * .7, y - g * .42, g * 1.4, g * .78); c.fillStyle = NAVY; c.fillRect(x - g * .1, y + g * .5, g * .2, g * .3); }
    if (kind === 'rim') { c.beginPath(); c.arc(x, y, g * .85, 0, 7); c.stroke(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; c.beginPath(); c.moveTo(x + Math.cos(a) * g * .2, y + Math.sin(a) * g * .2); c.lineTo(x + Math.cos(a) * g * .8, y + Math.sin(a) * g * .8); c.stroke(); } ell(c, x, y, g * .2, g * .2, NAVY); }
    if (kind === 'shield') { c.fillStyle = GOLD; c.beginPath(); c.moveTo(x, y - g); c.lineTo(x + g * .8, y - g * .65); c.quadraticCurveTo(x + g * .75, y + g * .5, x, y + g); c.quadraticCurveTo(x - g * .75, y + g * .5, x - g * .8, y - g * .65); c.closePath(); c.fill();
      c.strokeStyle = NAVY; c.lineWidth = r * .12; c.beginPath(); c.moveTo(x - g * .35, y); c.lineTo(x - g * .05, y + g * .3); c.lineTo(x + g * .4, y - g * .3); c.stroke(); }
    if (kind === 'family') { for (const [dx, dy, s] of [[-.45, -.1, 1], [.45, -.1, .95], [0, .25, .7]]) { ell(c, x + dx * g, y + (dy - .35) * g, g * .25 * s, g * .25 * s, NAVY); c.beginPath(); c.ellipse(x + dx * g, y + (dy + .35) * g, g * .3 * s, g * .38 * s, 0, Math.PI, 0); c.fill(); } }
    if (kind === 'child') { c.beginPath(); c.roundRect(x - g * .55, y - g * .8, g * 1.1, g * 1.5, g * .45); c.fill(); ell(c, x, y - g * .25, g * .25, g * .25, GOLD); c.fillStyle = GOLD; c.beginPath(); c.ellipse(x, y + g * .3, g * .3, g * .25, 0, Math.PI, 0); c.fill(); }
    if (kind === 'heart') heart(c, x, y, g * .9, 1, '#d94a6a');
    if (kind === 'star') star(c, x, y, g, 1, GOLD);
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, GOLD2);
  });
}
const FEATS = ['gauge', 'seat', 'speaker', 'cog', 'screen', 'rim'];

// —— the car: a cream SUV, side on, facing right; y = the ground under the wheels ——
function suv(c, x, y, w, o = {}) {
  const f = o.flip ? -1 : 1, rot = o.wheel || 0;
  c.save(); c.translate(x, y); c.scale(f, 1);
  spot(c, 0, 4, w * .6, .55);
  if (o.glow) glow(c, 0, -w * .25, w * .8, .4 * o.glow);
  const body = () => { c.beginPath(); c.moveTo(-w * .5, -w * .12); c.lineTo(-w * .5, -w * .3); c.quadraticCurveTo(-w * .49, -w * .33, -w * .44, -w * .33); c.lineTo(-w * .4, -w * .5); c.quadraticCurveTo(-w * .39, -w * .53, -w * .35, -w * .53);
    c.lineTo(w * .14, -w * .53); c.quadraticCurveTo(w * .18, -w * .53, w * .2, -w * .5); c.lineTo(w * .3, -w * .35); c.lineTo(w * .46, -w * .32); c.quadraticCurveTo(w * .51, -w * .31, w * .51, -w * .26); c.lineTo(w * .51, -w * .14); c.quadraticCurveTo(w * .5, -w * .1, w * .46, -w * .1); c.lineTo(-w * .46, -w * .1); c.closePath(); };
  const g = c.createLinearGradient(0, -w * .53, 0, -w * .1); g.addColorStop(0, '#fbf6ea'); g.addColorStop(.6, '#efe4c8'); g.addColorStop(1, '#cdbf9c'); c.fillStyle = o.col || g; body(); c.fill();
  c.fillStyle = '#9a8a68'; c.fillRect(-w * .5, -w * .15, w * 1.01, w * .04);
  // the windows (or, cut away, the inside)
  const win = () => { c.beginPath(); c.moveTo(-w * .37, -w * .35); c.lineTo(-w * .34, -w * .49); c.lineTo(w * .13, -w * .49); c.lineTo(w * .25, -w * .35); c.closePath(); };
  if (o.inside) {   // cut away: the whole cabin opens up so we can see who sits inside
    const cab = () => { c.beginPath(); c.moveTo(-w * .45, -w * .14); c.lineTo(-w * .45, -w * .3); c.lineTo(-w * .39, -w * .49); c.lineTo(w * .13, -w * .49); c.lineTo(w * .26, -w * .33); c.lineTo(w * .3, -w * .14); c.closePath(); };
    c.save(); cab(); c.clip(); c.fillStyle = '#2a3784'; c.fillRect(-w * .5, -w * .55, w, w * .45); c.fillStyle = 'rgba(150,180,255,.18)'; c.fillRect(-w * .5, -w * .49, w, w * .13);
    c.fillStyle = '#d9cba8'; c.fillRect(-w * .5, -w * .2, w, w * .1); c.scale(f, 1); c.translate(-x, -y); o.inside(); c.restore(); c.strokeStyle = '#cdbf9c'; c.lineWidth = w * .02; cab(); c.stroke(); }
  else { const wg = c.createLinearGradient(-w * .3, -w * .5, w * .1, -w * .35); wg.addColorStop(0, '#3a52a8'); wg.addColorStop(1, '#1a2463'); c.fillStyle = wg; win(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-w * .2, -w * .49); c.lineTo(-w * .12, -w * .49); c.lineTo(-w * .2, -w * .35); c.lineTo(-w * .28, -w * .35); c.fill(); }
  c.fillStyle = '#efe4c8'; c.fillRect(-w * .1, -w * .5, w * .025, w * .16);
  c.fillStyle = '#3a3f55'; c.fillRect(-w * .36, -w * .565, w * .44, w * .02);
  c.fillStyle = GOLD2; c.fillRect(-w * .48, -w * .245, w * .95, w * .012);
  c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(-w * .02, -w * .22, w * .04, w * .008); c.fillRect(-w * .27, -w * .22, w * .04, w * .008);
  ell(c, w * .48, -w * .27, w * .028, w * .02, '#ffe7a6'); if (o.lights) glow(c, w * .52, -w * .27, w * .2, .6 * o.lights); ell(c, -w * .49, -w * .27, w * .014, w * .03, '#c4566a');
  for (const wx of [-w * .3, w * .3]) { ell(c, wx, -w * .12, w * .13, w * .13, '#141a33'); ell(c, wx, -w * .1, w * .105, w * .105, '#1c1f2b'); ell(c, wx, -w * .1, w * .06, w * .06, '#d9dde6');
    c.strokeStyle = '#8f98b0'; c.lineWidth = w * .008; for (let i = 0; i < 5; i++) { const a = rot + i * Math.PI * 2 / 5; c.beginPath(); c.moveTo(wx, -w * .1); c.lineTo(wx + Math.cos(a) * w * .055, -w * .1 + Math.sin(a) * w * .055); c.stroke(); } ell(c, wx, -w * .1, w * .015, w * .015, GOLD2); }
  c.restore();
}
// a tiny old hatchback, for "already too small"
function tinyCar(c, x, y, w, squeeze = 0) {
  c.save(); c.translate(x, y); c.scale(1 + squeeze * .06, 1 - squeeze * .06); spot(c, 0, 4, w * .6, .5);
  c.fillStyle = '#7d93cf'; c.beginPath(); c.roundRect(-w * .5, -w * .38, w, w * .26, w * .08); c.fill(); c.beginPath(); c.moveTo(-w * .38, -w * .38); c.quadraticCurveTo(-w * .3, -w * .66, w * .02, -w * .66); c.quadraticCurveTo(w * .25, -w * .64, w * .32, -w * .38); c.fill();
  c.fillStyle = '#1a2463'; c.beginPath(); c.moveTo(-w * .3, -w * .4); c.quadraticCurveTo(-w * .24, -w * .6, w * .02, -w * .6); c.quadraticCurveTo(w * .2, -w * .58, w * .25, -w * .4); c.fill();
  for (const wx of [-w * .3, w * .3]) { ell(c, wx, -w * .1, w * .1, w * .1, '#1c1f2b'); ell(c, wx, -w * .1, w * .05, w * .05, '#d9dde6'); }
  c.restore();
}

// —— the showroom: a dark ceiling with small spots (calm behind the captions), a band of tall windows, a glossy floor ——
const FLOOR = 1500;
function showroom(c, t, o = {}) {
  const g = c.createLinearGradient(0, -400, 0, FLOOR); g.addColorStop(0, '#0a1036'); g.addColorStop(1, '#1d2868'); c.fillStyle = g; c.fillRect(-800, -600, 2680, FLOOR + 600);
  for (let x = -700; x < 1800; x += 260) { ell(c, x, 120, 26, 8, '#ffe7a6'); const cg = c.createLinearGradient(0, 120, 0, FLOOR); cg.addColorStop(0, 'rgba(255,225,160,.10)'); cg.addColorStop(1, 'rgba(255,225,160,0)'); c.fillStyle = cg; c.beginPath(); c.moveTo(x - 20, 124); c.lineTo(x + 20, 124); c.lineTo(x + 170, FLOOR); c.lineTo(x - 170, FLOOR); c.fill(); }
  if (o.windows !== false) { c.fillStyle = '#0d1546'; c.fillRect(-800, 700, 2680, 600); for (let x = -760; x < 1800; x += 300) { const wg = c.createLinearGradient(0, 720, 0, 1280); wg.addColorStop(0, '#1a2c74'); wg.addColorStop(1, '#2d4596'); c.fillStyle = wg; c.fillRect(x, 720, 270, 560);
      c.fillStyle = 'rgba(10,18,60,.8)'; for (const [bx, bw, bh] of [[10, 60, 160], [80, 80, 240], [170, 90, 130]]) c.fillRect(x + bx, 1280 - bh, bw, bh); c.fillStyle = 'rgba(233,184,96,.5)'; for (let k = 0; k < 6; k++) c.fillRect(x + 20 + hash(k + x) * 220, 1150 + hash(k + x + 9) * 110, 10, 14); }
    c.fillStyle = '#e9dcc0'; c.fillRect(-800, 1290, 2680, 12); }
  const fg = c.createLinearGradient(0, FLOOR - 200, 0, 2300); fg.addColorStop(0, '#26337a'); fg.addColorStop(1, '#0d1338'); c.fillStyle = fg; c.fillRect(-800, FLOOR - 200, 2680, 1200);
  c.fillStyle = '#e9dcc0'; c.fillRect(-800, FLOOR - 204, 2680, 6);
  c.strokeStyle = 'rgba(233,220,192,.07)'; c.lineWidth = 3; for (let k = 1; k < 10; k++) { const py = FLOOR - 200 + k * k * 9; c.beginPath(); c.moveTo(-800, py); c.lineTo(1900, py); c.stroke(); }
  for (let k = -12; k <= 12; k++) { c.beginPath(); c.moveTo(540 + k * 110, FLOOR - 200); c.lineTo(540 + k * 110 * 4, 2300); c.stroke(); }
}
function plinth(c, x, y, w) { ell(c, x, y + 10, w * .62, w * .09, 'rgba(0,0,20,.35)'); ell(c, x, y, w * .6, w * .085, '#2e3b86'); ell(c, x, y - 6, w * .58, w * .075, '#3a4a9c'); c.strokeStyle = GOLD2; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y - 6, w * .58, w * .075, 0, 0, 7); c.stroke(); }

// —— the people ——
const BUYER = o => ({ id: 'buyer', skin: 'blue1', s: 2.2, smile: .5, ...o });
const S1 = o => ({ id: 's1', skin: 'owner', specs: 1, bowtie: 1, s: 2.2, smile: .8, ...o });   // the one who knows everything
const S2 = o => ({ id: 's2', skin: 'owner', tache: 1, s: 2.2, smile: .7, ...o });              // the one who asks
const talk = (t, a = 1) => .5 + .4 * a * Math.abs(Math.sin(t * 9));   // a moving smile while he talks (no voice)

// —— the shots (the story lives in the middle of the frame; the top left is kept calm for the captions) ——
const SHOT = {
  twins(c, t) {   // two salesmen, exactly the same car
    const k1 = E(t, HIT.car1, .4, .35), k2 = E(t, HIT.car2, .4, .35), eq = E(t, HIT.eq, .3, .5);
    cam(c, 540, 1330, 1.16 + .04 * seg(t, 0, 3.9), 0, () => {
      showroom(c, t);
      for (const [x, k, P] of [[290, k1, S1({ x: 160, y: 1660, f: .4, blink: blinkAt(t, 1) })], [790, k2, S2({ x: 920, y: 1660, f: -.4, blink: blinkAt(t, 2) })]]) {
        if (k <= 0) continue; plinth(c, x, 1520, 420); scaled(c, x, 1520, Math.min(1, k), () => suv(c, x, 1514, 420, { flip: x > 540 })); mascot(c, P, Math.min(1, k)); }
      if (eq > 0) scaled(c, 540, 1380, eq, () => { c.fillStyle = GOLD; c.beginPath(); c.roundRect(505, 1352, 70, 18, 9); c.roundRect(505, 1392, 70, 18, 9); c.fill(); }); });
  },
  sold(c, t) {   // yet the one who knew less about cars sold it
    const st = E(t, HIT.stamp, .3, .5), bb = E(t, HIT.bubbles, .35, .45);
    cam(c, 540, 1300, 1.16, 0, () => {
      showroom(c, t); c.fillStyle = 'rgba(6,10,36,.25)'; c.fillRect(-800, -600, 1340, 3000);
      plinth(c, 290, 1520, 420); suv(c, 290, 1514, 420); plinth(c, 790, 1520, 420); suv(c, 790, 1514, 420, { flip: 1, glow: st });
      mascot(c, S1({ x: 160, y: 1660, f: .4, smile: .6, blink: blinkAt(t, 1) })); mascot(c, S2({ x: 920, y: 1660, f: -.4, smile: st > .5 ? 1 : .7, blink: blinkAt(t, 2), squash: wob(t, HIT.stamp, .3, 18, .04) }));
      // a ribbon tag on the second car: sold
      if (st > 0) scaled(c, 800, 1300, st, () => { c.save(); c.translate(800, 1300); c.rotate(-.12); c.fillStyle = '#c4304a'; c.beginPath(); c.roundRect(-120, -38, 240, 76, 14); c.fill(); text(c, 'ELADVA', 0, 2, 48, CREAM); c.restore(); });
      // what each knows: a crowded bubble, and a small one
      bubble(c, 230, 860, 380, 330, bb, 170, 1220, () => { FEATS.forEach((f, i) => icon(c, f, 120 + (i % 3) * 110, 790 + Math.floor(i / 3) * 140, 46)); });
      bubble(c, 870, 960, 170, 150, bb, 920, 1220, () => icon(c, 'q', 870, 960, 50)); });
  },
  why(c, t) {   // "I'll tell you why": the showroom's glass doors slide open onto the floor
    const op = ss(seg(t, HIT.doors - .1, HIT.doors + .6));
    cam(c, 540, 1100, 1 + .25 * ss(seg(t, 7.3, 9.1)), 0, () => {
      showroom(c, t, { windows: false });
      c.fillStyle = '#e9dcc0'; c.fillRect(220, 660, 640, 860); const dg = c.createLinearGradient(0, 680, 0, 1500); dg.addColorStop(0, '#2d4596'); dg.addColorStop(1, '#4a66b8'); c.fillStyle = dg; c.fillRect(240, 680, 600, 820);
      glow(c, 540, 1200, 500, .4 * op); plinth(c, 540, 1440, 360); suv(c, 540, 1436, 360, { lights: op });
      for (const d of [-1, 1]) { c.fillStyle = 'rgba(150,180,255,.25)'; c.fillRect(540 + d * 300 * op - (d < 0 ? 300 : 0), 680, 300, 820); c.fillStyle = '#e9dcc0'; c.fillRect(540 + d * 300 * op + (d < 0 ? -12 : 0), 680, 12, 820); } });
  },
  enter(c, t) {   // a buyer walks into the showroom, looking for an SUV
    const u = seg(t, ...HIT.walk), th = E(t, HIT.suv, .35, .45);
    cam(c, 540, 1330, 1.15 + .06 * seg(t, 9.1, 13.35), 0, () => {
      showroom(c, t); plinth(c, 300, 1480, 380); suv(c, 300, 1474, 380); plinth(c, 800, 1480, 380); suv(c, 800, 1474, 380, { flip: 1 });
      const P = BUYER({ x: lerp(-150, 540, u), y: 1700, f: u < 1 ? .7 : 0, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 9, look: u >= 1 ? -.3 : 0, headTurn: u >= 1 ? Math.sin(t * 2) * .4 : 0, blink: blinkAt(t, 3) });
      mascot(c, P);
      if (th > 0) { const tx = 640, ty = 1060; scaled(c, P.x + 60, 1240, th, () => { c.fillStyle = '#ffffff'; for (const [dx, dy, r] of [[-110, 0, 95], [-30, -50, 110], [70, -40, 105], [130, 10, 90], [10, 45, 110]]) ell(c, tx + dx, ty + dy, r, r, '#ffffff'); ell(c, P.x + 60, 1210, 20, 20, '#ffffff'); ell(c, P.x + 40, 1250, 12, 12, '#ffffff'); suv(c, tx + 10, ty + 70, 240); }); } });
  },
  expert(c, t) {   // the first salesman knows everything about the car
    const k = E(t, HIT.s1, .35, .4), pt = ss(seg(t, HIT.point, HIT.point + .3));
    cam(c, 560, 1240, 1.12 + .05 * seg(t, 13.35, 16.1), 0, () => {
      showroom(c, t); plinth(c, 640, 1520, 520); suv(c, 640, 1514, 520, { flip: 1 });
      mascot(c, BUYER({ x: 1000, y: 1700, f: -.4, blink: blinkAt(t, 3) }));
      const P = S1({ x: lerp(-120, 300, Math.min(1, k)), y: 1690, f: .5, smile: talk(t, pt), blink: blinkAt(t, 1), squash: wob(t, HIT.s1 + .3, .3, 16, .04) }); if (pt > 0) P.handR = reach([P.x + 60, 1500], [P.x + 170, 1330], pt);
      mascot(c, P);
      if (pt > 0) bubble(c, 330, 1000, 220, 170, pt, 330, 1200, () => icon(c, 'star', 330, 1000, 56)); });
  },
  features(c, t) {   // horsepower, leather seats, a premium sound system...
    const spots = [[880, 1310, 'gauge', 920, 980], [500, 1250, 'seat', 330, 960], [430, 1300, 'speaker', 640, 860]];
    cam(c, 560, 1250, 1.3 + .06 * seg(t, 16.1, 19.0), -.02, () => {
      showroom(c, t); plinth(c, 600, 1520, 640); suv(c, 600, 1514, 640, { lights: 1 });
      spots.forEach(([px, py, kind, ix, iy], i) => { const k = E(t, HIT.feats[i], .35, .5); if (k <= 0) return;
        c.strokeStyle = 'rgba(236,189,74,.8)'; c.lineWidth = 5; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(px, py); c.lineTo(lerp(px, ix, Math.min(1, k)), lerp(py, iy, Math.min(1, k))); c.stroke(); c.setLineDash([]);
        ell(c, px, py, 12, 12, GOLD); icon(c, kind, ix, iy, 78, k); }); });
  },
  tenmin(c, t) {   // ten minutes of every single feature: the clock spins, the icons pile up, the buyer glazes over
    const spin = seg(t, ...HIT.clock), tired = ss(seg(t, 20.6, 22.6));
    cam(c, 540, 1320, 1.18, 0, () => {
      showroom(c, t); plinth(c, 560, 1500, 420); suv(c, 560, 1494, 420, { flip: 1 });
      c.save(); c.translate(860, 820); ell(c, 0, 0, 110, 110, CREAM); c.strokeStyle = GOLD2; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 100, 0, 7); c.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillStyle = NAVY; c.fillRect(Math.cos(a) * 80 - 3, Math.sin(a) * 80 - 3, 6, 6); }
      c.strokeStyle = NAVY; c.lineCap = 'round'; c.lineWidth = 9; c.beginPath(); c.moveTo(0, 0); const am = -Math.PI / 2 + spin * Math.PI * 2 * 1.67; c.lineTo(Math.cos(am) * 72, Math.sin(am) * 72); c.stroke();
      c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); const ah = -Math.PI / 3 + spin * Math.PI * .28; c.lineTo(Math.cos(ah) * 46, Math.sin(ah) * 46); c.stroke(); ell(c, 0, 0, 10, 10, GOLD2); c.restore();
      mascot(c, S1({ x: 230, y: 1700, f: .5, smile: talk(t), blink: blinkAt(t, 1), armR: .6 + .5 * Math.sin(t * 7), armL: .3 + .3 * Math.sin(t * 5) }));
      const B = BUYER({ x: 880, y: 1720, f: -.4, smile: lerp(.4, 0, tired), blink: tired > .5 ? .65 : blinkAt(t, 3), look: .3 * tired, squash: tired * .04, lean: -.06 * tired });
      HIT.rain.forEach((tk, i) => { const k = E(t, tk, .3, .45); if (k <= 0) return; const fx = 330 + (i % 4) * 120 + (Math.floor(i / 4) % 2) * 60, fy = 1060 - Math.floor(i / 4) * 105 + 60;
        icon(c, FEATS[i % FEATS.length], fx + Math.sin(t * 3 + i) * 6, fy + Math.cos(t * 2.4 + i) * 6, 50, k); });
      mascot(c, B); });
  },
  leave(c, t) {   // the buyer says thanks, and walks away
    const nod = t > HIT.thanks && t < HIT.thanks + .6 ? Math.sin(seg(t, HIT.thanks, HIT.thanks + .6) * Math.PI * 2) * .05 : 0, u = seg(t, ...HIT.away), drop = ss(seg(t, 24.9, 25.6));
    cam(c, 540, 1330, 1.18, 0, () => {
      showroom(c, t); plinth(c, 560, 1500, 420); suv(c, 560, 1494, 420, { flip: 1 });
      mascot(c, S1({ x: 230, y: 1700, f: .5, smile: lerp(.8, .3, drop), o: drop > .5 ? .5 : 0, armR: lerp(1.0, .1, drop), blink: blinkAt(t, 1) }));
      FEATS.forEach((f, i) => icon(c, f, 330 + (i % 3) * 120, lerp(1000 - Math.floor(i / 3) * 110, 1640, ss(seg(t, 24.9 + i * .06, 25.5 + i * .06))), 50, 1 - .3 * drop));
      mascot(c, BUYER({ x: lerp(880, 1300, u), y: 1720, f: u > 0 ? .7 : -.4, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, smile: .45, squash: nod, blink: blinkAt(t, 3) })); });
  },
  meet(c, t) {   // then he meets the second salesman
    const u = ss(seg(t, 25.95, 27.2)), wv = t > HIT.wave && t < HIT.wave + 1.2 ? Math.sin((t - HIT.wave) * 12) * .3 : 0;
    cam(c, 540, 1330, 1.18, 0, () => {
      showroom(c, t); plinth(c, 540, 1500, 440); suv(c, 540, 1494, 440);
      mascot(c, BUYER({ x: lerp(-150, 260, u), y: 1720, f: u < 1 ? .7 : .4, walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 6, smile: .5, blink: blinkAt(t, 3) }));
      mascot(c, S2({ x: 830, y: 1710, f: -.4, smile: .9, armL: t > HIT.wave ? 2.4 + wv : .12, blink: blinkAt(t, 2), squash: wob(t, HIT.s2, .3, 16, .03) })); });
  },
  instead(c, t) {   // instead of presenting the car straight away: the brochure goes back under his arm
    const br = E(t, HIT.brochure, .35, .4), aw = ss(seg(t, HIT.putaway, HIT.putaway + .4));
    cam(c, 640, 1300, 1.25, 0, () => {
      showroom(c, t); plinth(c, 540, 1500, 440); suv(c, 540, 1494, 440);
      mascot(c, BUYER({ x: 260, y: 1720, f: .4, smile: .5, blink: blinkAt(t, 3) }));
      const P = S2({ x: 830, y: 1710, f: -.4, smile: .7, blink: blinkAt(t, 2) }), Hh = Hs(P.s), hp = reach([P.x - .35 * Hh, P.y - .55 * Hh], [P.x + .05 * Hh, P.y - .45 * Hh], aw); P.handL = hp; mascot(c, P);
      if (br > 0) scaled(c, hp[0], hp[1], Math.min(1, br) * (1 - .35 * aw), () => { c.save(); c.translate(hp[0], hp[1] - 60); c.rotate(-.15 + .4 * aw); c.fillStyle = CREAM; c.fillRect(-70, -90, 140, 180); c.fillStyle = GOLD2; c.fillRect(-70, -90, 140, 26); suv(c, 0, 40, 110); c.fillStyle = 'rgba(28,36,80,.35)'; for (let i = 0; i < 2; i++) c.fillRect(-50, 55 + i * 16, 100 - i * 30, 6); c.restore(); });
      cross(c, hp[0], hp[1] - 60, 70, ss(seg(t, HIT.putaway - .25, HIT.putaway + .15)) * (1 - aw)); });
  },
  question(c, t) {   // he asks just one question: why are you looking for a new car?
    const q = E(t, HIT.ask, .35, .45), cl = ss(seg(t, HIT.miert - .3, HIT.miert + .2)), qp = 1 + .25 * Math.sin(clamp((t - HIT.qpulse) / .35) * Math.PI) * (t > HIT.qpulse);
    cam(c, lerp(640, 760, cl), lerp(1300, 1240, cl), lerp(1.25, 1.75, cl), 0, () => {
      showroom(c, t); plinth(c, 540, 1500, 440); suv(c, 540, 1494, 440);
      mascot(c, BUYER({ x: 260, y: 1720, f: .4, smile: .5, look: -.1, blink: blinkAt(t, 3) }));
      mascot(c, S2({ x: 830, y: 1710, f: -.4, smile: .85, look: -.05, lean: -.04 * cl, blink: blinkAt(t, 2), squash: wob(t, HIT.ask, .3, 16, .03) }));
      bubble(c, 640, 1040, 230, 210, q * qp, 760, 1230, () => { icon(c, 'q', 640, 1040, 70); }); });
  },
  story(c, t) {   // a second child was just born
    const b1 = E(t, HIT.baby, .35, .45), b2 = E(t, HIT.kid2, .35, .45), hh = E(t, HIT.heart, .35, .5);
    cam(c, 540, 1180, 1.05, 0, () => {
      showroom(c, t); c.fillStyle = 'rgba(6,10,36,.35)'; c.fillRect(-800, -600, 2680, 3000);
      mascot(c, BUYER({ x: 220, y: 1760, f: .4, smile: .8, blink: blinkAt(t, 3) }));
      bubble(c, 610, 1080, 640, 520, Math.min(1, E(t, 35.6, .35, .45)), 330, 1420, () => {
        c.fillStyle = '#e9dcc0'; c.fillRect(350, 870, 520, 410); c.fillStyle = '#2c3f8f'; c.fillRect(370, 890, 480, 370);
        drawMascot(c, { id: 'k1', skin: 'blue3', fem: 'pony', s: .95, x: 520, y: 1250, smile: .9, shadow: false, blink: blinkAt(t, 7) });
        if (b2 > 0) scaled(c, 690, 1250, Math.min(1, b2), () => drawMascot(c, { id: 'k2', skin: 'blue2', s: .6, x: 690, y: 1250, smile: 1, shadow: false, blink: 1 }));
        heart(c, 700, 960, 46, hh, '#d94a6a'); if (b1 > 0 && b2 <= 0) heart(c, 690, 1180, 30, b1 * .8, '#d94a6a'); }); });
  },
  tiny(c, t) {   // his car is already too small: the whole family squeezed into a little hatchback
    const sq = Math.max(0, Math.sin(clamp((t - HIT.squeeze) / .4) * Math.PI)) * (t > HIT.squeeze), pp = E(t, HIT.pop, .3, .5);
    cam(c, 540, 1300, 1.25, 0, () => {
      showroom(c, t, { windows: false });
      tinyCar(c, 540, 1560, 560, sq);
      c.save(); c.beginPath(); c.moveTo(540 - 168, 1336); c.quadraticCurveTo(540 - 134, 1224, 551, 1224); c.quadraticCurveTo(652, 1235, 680, 1336); c.clip();
      [[420, 'blue1', null, 1.0], [520, 'blue2', 'long', .95], [600, 'blue3', 'pony', .6], [660, 'blue2', null, .45]].forEach(([x, skin, fem, s], i) => drawMascot(c, { id: 'c' + i, skin, fem, s: s * 1.05, x, y: 1395 + s * 25, smile: .4, sad: .3, shadow: false, squash: sq * .08, blink: blinkAt(t, 12 + i) }));
      c.restore();
      if (pp > 0) { const u = Math.min(1.2, pp); c.save(); c.translate(760 + u * 120, 1140 - u * 160); c.rotate(u * 1.5); c.fillStyle = '#c99a3a'; c.beginPath(); c.roundRect(-50, -36, 100, 72, 10); c.fill(); c.fillStyle = '#8a5d38'; c.fillRect(-14, -48, 28, 14); c.restore(); }
      poof(c, 700, 1250, seg(t, HIT.pop, HIT.pop + .5), 70); });
  },
  safety(c, t) {   // and safety matters most now
    const sh = E(t, HIT.shield, .4, .45), shine = ss(seg(t, HIT.shine, HIT.shine + .5));
    cam(c, 540, 1230, 1.05, 0, () => {
      showroom(c, t); c.fillStyle = 'rgba(6,10,36,.35)'; c.fillRect(-800, -600, 2680, 3000);
      [[340, 'blue1', null, 2.0], [520, 'blue2', 'long', 1.9], [660, 'blue3', 'pony', 1.2], [760, 'blue2', null, .8]].forEach(([x, skin, fem, s], i) => mascot(c, { id: 'f' + i, skin, fem, s, x, y: 1720, f: 0, smile: .5 + .4 * shine, blink: blinkAt(t, 12 + i) }));
      if (sh > 0) { glow(c, 560, 1050, 420, .45 * sh); icon(c, 'shield', 560, 1000, 150, sh, { glow: shine }); } });
  },
  flip(c, t) {   // suddenly the whole conversation changes: their speech bubbles flip from features to family
    const tu = seg(t, HIT.turn - .25, HIT.turn + .25), sx = Math.abs(Math.cos(tu * Math.PI)), after = tu > .5;
    cam(c, 540, 1240, 1.1, 0, () => {
      showroom(c, t); plinth(c, 540, 1500, 420); suv(c, 540, 1494, 420);
      mascot(c, BUYER({ x: 240, y: 1720, f: .4, smile: after ? .9 : .5, blink: blinkAt(t, 3) })); mascot(c, S2({ x: 840, y: 1710, f: -.4, smile: after ? .95 : .7, blink: blinkAt(t, 2) }));
      for (const [bx, by, tx2, ty2, kinds] of [[330, 1020, 260, 1250, after ? ['family', 'heart'] : ['gauge', 'speaker']], [760, 1020, 830, 1250, after ? ['shield', 'child'] : ['seat', 'cog']]]) {
        c.save(); c.translate(bx, by); c.scale(Math.max(.02, sx), 1); c.translate(-bx, -by); bubble(c, bx, by, 330, 190, 1, tx2, ty2, () => kinds.forEach((kd, i) => icon(c, kd, bx - 75 + i * 150, by, 58, 1, { bg: after ? '#fff3cf' : CREAM }))); c.restore(); }
      if (after) glow(c, 540, 1020, 500, .3 * (1 - seg(t, HIT.turn + .25, HIT.turn + 1.2))); });
  },
  nomore(c, t) {   // no more talk of horsepower or features nobody needs
    cam(c, 540, 1240, 1.0, 0, () => {
      showroom(c, t); c.fillStyle = 'rgba(6,10,36,.3)'; c.fillRect(-800, -600, 2680, 3000);
      const P = [[340, 1120], [740, 1120], [340, 1470], [740, 1470]], kinds = ['gauge', 'speaker', 'screen', 'rim'];
      HIT.poofs.forEach((tp, i) => { const [x, y] = P[i], gone = seg(t, tp + .15, tp + .45);   // crossed out, then gone in a puff
        if (gone < 1) icon(c, kinds[i], x, y + gone * 40, 120, (1 - gone) * Math.min(1, E(t, 47.25 + i * .08, .3, .45)));
        poof(c, x, y, gone, 110); cross(c, x, y, 110, seg(t, tp - .1, tp + .2) * (1 - gone)); }); });
  },
  stars(c, t) {   // only the safety rating: five gold stars
    cam(c, 540, 1300, 1.12, 0, () => {
      showroom(c, t); plinth(c, 540, 1560, 600); suv(c, 540, 1554, 600, { glow: ss(seg(t, HIT.stars[4], HIT.stars[4] + .5)) });
      icon(c, 'shield', 540, 900, 90, E(t, 51.0, .35, .45));
      HIT.stars.forEach((ts, i) => star(c, 540 + (i - 2) * 120, 1080, 52, E(t, ts, .3, .55))); });
  },
  seats(c, t) {   // room for the child seats: the car cut away, two child seats click into the back
    const ok = E(t, HIT.seatok, .35, .5);
    cam(c, 470, 1390, 1.6, 0, () => {
      showroom(c, t, { windows: false });
      suv(c, 540, 1600, 700, { inside: () => { for (const sx of [540 - 700 * .17, 540 + 700 * .1]) { c.fillStyle = '#c9b791'; c.beginPath(); c.roundRect(sx - 700 * .03, 1600 - 700 * .37, 700 * .07, 700 * .18, 14); c.fill(); }   // the seat backs
        HIT.seats.forEach((ts, i) => { const k = E(t, ts, .3, .5), sx = 540 - 700 * .33 + i * 700 * .11, sy = 1600 - 700 * .19; if (k > 0) scaled(c, sx, sy, Math.min(1.1, k), () => { c.fillStyle = '#efe4c8'; c.beginPath(); c.roundRect(sx - 34, sy - 150, 68, 150, 28); c.fill(); c.fillStyle = '#d9ccab'; c.beginPath(); c.roundRect(sx - 24, sy - 138, 48, 70, 18); c.fill(); c.fillStyle = GOLD; c.fillRect(sx - 30, sy - 50, 60, 10); c.fillRect(sx - 4, sy - 120, 8, 70); }); }); } });
      check(c, 640, 1200, 56, ok); });
  },
  family(c, t) {   // and whether the whole family fits in comfortably
    const hh = E(t, HIT.famheart, .35, .5);
    cam(c, 470, 1390, 1.6, 0, () => {
      showroom(c, t, { windows: false });
      suv(c, 540, 1600, 700, { glow: hh, inside: () => {
        for (const sx of [540 - 700 * .17, 540 + 700 * .1]) { c.fillStyle = '#c9b791'; c.beginPath(); c.roundRect(sx - 700 * .03, 1600 - 700 * .37, 700 * .07, 700 * .18, 14); c.fill(); }
        for (const sx of [540 - 700 * .33, 540 - 700 * .22]) { const sy = 1600 - 700 * .19; c.fillStyle = '#efe4c8'; c.beginPath(); c.roundRect(sx - 34, sy - 150, 68, 150, 28); c.fill(); c.fillStyle = GOLD; c.fillRect(sx - 30, sy - 50, 60, 10); }   // the kids in their child seats
        const who = [[540 - 700 * .33, 'blue3', 'pony', .55, 0], [540 - 700 * .22, 'blue2', null, .42, 1], [540 - 700 * .05, 'blue2', 'long', .72, 2], [540 + 700 * .13, 'blue1', null, .74, 3]];
        who.forEach(([x, skin, fem, s, i]) => { const k = E(t, HIT.fam[i], .3, .5); if (k <= 0) return; drawMascot(c, { id: 'm' + i, skin, fem, s, x, sit: 1, y: 1600 - 700 * .2 + (1 - Math.min(1, k)) * 120, smile: 1, shadow: false, blink: blinkAt(t, 20 + i) }); }); } });
      heart(c, 470, 1190, 56, hh, '#d94a6a'); });
  },
  deal(c, t) {   // and this time, he buys the car
    const sh = ss(seg(t, HIT.shake - .4, HIT.shake)), bob = t > HIT.shake && t < HIT.shake + .6 ? Math.sin((t - HIT.shake) * 20) * 10 : 0, ky = E(t, HIT.keys, .35, .45), sold = E(t, HIT.sold2, .3, .5);
    cam(c, 540, 1240, 1.12, 0, () => {
      showroom(c, t); plinth(c, 540, 1500, 460); suv(c, 540, 1494, 460, { glow: sold, lights: sold });
      const B = BUYER({ x: lerp(240, 400, sh), y: 1730, f: .4, smile: 1, blink: blinkAt(t, 3) }), S = S2({ x: lerp(840, 680, sh), y: 1720, f: -.4, smile: 1, blink: blinkAt(t, 2) }), Hb = Hs(B.s), hy = B.y - .42 * Hb + bob;
      if (sh > 0) { B.handR = [540, hy]; S.handL = [540, hy]; } mascot(c, B); mascot(c, S);
      if (ky > 0) scaled(c, 540, 1230, ky, () => { glow(c, 540, 1230, 120, .5); c.fillStyle = '#26368c'; c.beginPath(); c.roundRect(505, 1190, 70, 100, 22); c.fill(); ell(c, 540, 1225, 14, 14, GOLD); c.strokeStyle = GOLD2; c.lineWidth = 6; c.beginPath(); c.arc(540, 1172, 22, 0, 7); c.stroke(); });
      if (sold > 0) scaled(c, 560, 1180 - 120, sold, () => { c.save(); c.translate(560, 1060); c.rotate(-.1); c.fillStyle = '#c4304a'; c.beginPath(); c.roundRect(-130, -40, 260, 80, 14); c.fill(); text(c, 'ELADVA', 0, 2, 52, CREAM); c.restore(); }); });
  },
  mind(c, t) {   // people don't always need more information: a pile of cards bounces off
    cam(c, 540, 1200, 1.0, 0, () => {
      const g = c.createRadialGradient(540, 1150, 100, 540, 1150, 1100); g.addColorStop(0, '#26368c'); g.addColorStop(1, '#0a1034'); c.fillStyle = g; c.fillRect(-200, -200, 1480, 2400);
      const B = BUYER({ s: 3.6, x: 540, y: 1960, f: 0, smile: .3, blink: blinkAt(t, 3), squash: HIT.cards.reduce((a, tc) => a + wob(t, tc + .3, .25, 20, .02), 0) });
      mascot(c, B);
      HIT.cards.forEach((tc, i) => { const u = seg(t, tc - .35, tc + .3), side = i % 2 ? 1 : -1; if (u <= 0) return; const hit = Math.min(1, u / .55), back = clamp((u - .55) / .45);
        const x = lerp(540 + side * 700, 540 + side * 70, ss(hit)) + side * back * 520, y = lerp(700 + i * 40, 1100, ss(hit)) + back * back * 700 - back * 200;
        c.save(); c.translate(x, y); c.rotate(side * (.3 + back * 2)); c.fillStyle = CREAM; c.beginPath(); c.roundRect(-70, -90, 140, 180, 14); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 4; c.stroke(); icon(c, FEATS[i % 6], 0, -18, 44); c.fillStyle = 'rgba(28,36,80,.35)'; c.fillRect(-45, 45, 90, 8); c.fillRect(-45, 62, 60, 8); c.restore(); }); });
  },
  piece(c, t) {   // but the information that truly matters to them: one gold card clicks into place
    const u = ss(seg(t, HIT.gold, HIT.click)), cl = E(t, HIT.click, .3, .5), gl = ss(seg(t, HIT.glowup, HIT.glowup + .6));
    cam(c, 540, 1200, 1.0 + .06 * seg(t, 69.1, 73.4), 0, () => {
      const g = c.createRadialGradient(540, 1150, 100, 540, 1150, 1100); g.addColorStop(0, '#26368c'); g.addColorStop(1, '#0a1034'); c.fillStyle = g; c.fillRect(-200, -200, 1480, 2400);
      glow(c, 540, 1350, 600, .4 * gl);
      mascot(c, BUYER({ s: 3.6, x: 540, y: 1960, f: 0, smile: lerp(.3, 1, gl), blink: blinkAt(t, 3) }));
      const sx = 540, sy = 1460; c.strokeStyle = GOLD2; c.lineWidth = 6; c.setLineDash([16, 12]); c.strokeRect(sx - 80, sy - 100, 160, 200); c.setLineDash([]);
      const x = lerp(1250, sx, u), y = lerp(700, sy, u) - Math.sin(u * Math.PI) * 200;
      c.save(); c.translate(x, y); c.rotate((1 - u) * .8); const k = 1 + .12 * Math.sin(Math.min(1, cl) * Math.PI); c.scale(k, k); glow(c, 0, 0, 220, .5 + .4 * gl);
      c.fillStyle = GOLD; c.beginPath(); c.roundRect(-80, -100, 160, 200, 16); c.fill(); icon(c, 'family', 0, -25, 50, 1, { bg: '#fff3cf' }); icon(c, 'shield', 0, 52, 34, 1, { bg: '#fff3cf' }); c.restore(); });
  },
  compare(c, t) {   // the first sold the car's features; the second understood the buyer's problem
    const L = E(t, HIT.left, .35, .45), R = E(t, HIT.right, .35, .45), dimL = ss(seg(t, HIT.right, HIT.right + .5)), ok = E(t, HIT.understood, .35, .5);
    cam(c, 540, 1200, 1.0, 0, () => {
      showroom(c, t); c.fillStyle = 'rgba(6,10,36,.3)'; c.fillRect(-800, -600, 2680, 3000);
      c.save(); c.beginPath(); c.rect(-200, 560, 740, 1500); c.clip();
      mascot(c, S1({ x: 270, y: 1720, s: 2.0, smile: talk(t), blink: blinkAt(t, 1) }), Math.min(1, L));
      FEATS.forEach((f, i) => icon(c, f, 130 + (i % 3) * 140, 900 + Math.floor(i / 3) * 150, 56, E(t, HIT.left + .1 + i * .08, .3, .45)));
      c.fillStyle = `rgba(6,10,36,${.55 * dimL})`; c.fillRect(-200, 560, 740, 1500); c.restore();
      c.fillStyle = GOLD2; c.fillRect(536, 600, 8, 1260);
      c.save(); c.beginPath(); c.rect(540, 560, 740, 1500); c.clip();
      mascot(c, S2({ x: 700, y: 1720, s: 2.0, f: .3, smile: .9, blink: blinkAt(t, 2) }), Math.min(1, R)); mascot(c, BUYER({ x: 920, y: 1730, s: 2.0, f: -.3, smile: .9, blink: blinkAt(t, 3) }), Math.min(1, R));
      icon(c, 'family', 700, 960, 70, E(t, HIT.right + .2, .3, .45)); icon(c, 'shield', 900, 960, 70, E(t, HIT.right + .35, .3, .45)); check(c, 810, 1180, 56, ok); c.restore(); });
  },
  what(c, t) {   // good salespeople don't only explain what a product can do...
    cam(c, 540, 1250, 1.15, 0, () => {
      showroom(c, t); plinth(c, 540, 1520, 560); suv(c, 540, 1514, 560);
      const P = [[300, 1000], [480, 920], [660, 920], [840, 1000]], kinds = ['gauge', 'seat', 'speaker', 'cog'];
      HIT.what.forEach((tw, i) => icon(c, kinds[i], P[i][0], P[i][1], 64, E(t, tw, .3, .5))); });
  },
  whyneed(c, t) {   // ...they understand why someone needs it: the family drives off in their new car
    const ins = E(t, HIT.inside, .35, .45), dr = ss(seg(t, HIT.drive, STORY)), lv = E(t, HIT.love, .35, .5);
    cam(c, 540 + dr * 200, 1250, 1.15, 0, () => {
      showroom(c, t); const x = 540 + dr * dr * 900;
      suv(c, x, 1514, 560, { lights: 1, wheel: dr * 30, inside: () => {
        [[x - 560 * .33, 'blue3', 'pony', .48], [x - 560 * .22, 'blue2', null, .36], [x - 560 * .05, 'blue2', 'long', .6], [x + 560 * .13, 'blue1', null, .62]].forEach(([px, skin, fem, s], i) => {
          const k = Math.min(1, ins * 1.3 - i * .1); if (k > 0) drawMascot(c, { id: 'd' + i, skin, fem, s, x: px, sit: 1, y: 1514 - 560 * .2 + (1 - k) * 100, smile: 1, shadow: false, armR: i === 3 ? 2.2 + Math.sin(t * 10) * .3 : .1, blink: blinkAt(t, 30 + i) }); }); } });
      heart(c, x - 40, 1070, 56, lv, '#d94a6a'); });
  },
};
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); }

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['SUV-t', 'Tíz', 'percen', 'kérdést', 'Miért', 'biztonság', 'család', 'megveszi', 'pszichológia', 'fontos', 'tulajdonságait', 'problémáját', 'miért', 'szüksége']);
const bare = w => w.replace(/[.,:;!?…„”"]/g, '');
const CAP = { x: 64, y: 290, size: 72, lh: 88, maxW: 820, maxLines: 3 }, CAPFONT = `700 ${CAP.size}px "Fredoka"`;   // Fredoka Bold: it has the Hungarian ő and ű
const PAGES = (() => {   // group the words into short pages: a new page after a full stop, a question, a colon, or once a page is full
  const m = document.createElement('canvas').getContext('2d'); m.font = CAPFONT; const space = m.measureText(' ').width;
  const pages = []; let cur = [], x = 0, line = 0;
  const flush = () => { if (cur.length) pages.push(cur); cur = []; x = 0; line = 0; };
  WORDS.forEach(([w, t0], i) => { const wd = m.measureText(w).width;
    if (x > 0 && x + space + wd > CAP.maxW) { line++; x = 0; if (line >= CAP.maxLines) flush(); }
    cur.push({ w, t: t0, x: x ? x + space : 0, line, wd, key: KEY.has(bare(w)) }); x = (x ? x + space : 0) + wd;
    const prev = WORDS[i + 1]; if (/[.?!:…”]$/.test(w) || (/,$/.test(w) && cur.length >= 4) || cur.length >= 9 || (prev && prev[1] - t0 > 1.1)) flush(); });
  flush(); return pages.map((p, i) => ({ words: p, t0: p[0].t - .05, t1: pages[i + 1] ? pages[i + 1][0].t - .05 : STORY - .5 }));
})();
function captions(c, t) {
  c.setTransform(K, 0, 0, K, 0, 0);
  const g = c.createRadialGradient(330, 330, 60, 330, 330, 720); g.addColorStop(0, 'rgba(5,8,30,.55)'); g.addColorStop(1, 'rgba(5,8,30,0)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1100);
  const p = PAGES.find(p => t >= p.t0 && t < p.t1); if (!p) return;
  const out = ss(seg(t, p.t1 - .12, p.t1)), now = p.words.filter(w => t >= w.t - .02).pop();
  c.save(); c.globalAlpha = 1 - out; c.translate(0, -30 * out); c.font = CAPFONT; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  p.words.forEach(w => { const k = E(t, w.t - .06, .28, .45); if (k <= 0) return; const a = Math.min(1, k * 2.2), y = CAP.y + w.line * CAP.lh + (1 - Math.min(1, k)) * 34, sc = .75 + .25 * k, cx = CAP.x + w.x + w.wd / 2;
    const hot = w === now, col = hot || w.key ? GOLD : CREAM;
    c.save(); c.globalAlpha = a * (1 - out); c.translate(cx, y); c.scale(sc, sc); c.translate(-cx, -y);
    c.shadowColor = 'rgba(0,0,15,.65)'; c.shadowBlur = 14; c.shadowOffsetY = 4; c.fillStyle = col; c.fillText(w.w, CAP.x + w.x, y); c.shadowColor = 'transparent';
    if (hot) { c.fillStyle = GOLD; c.fillRect(CAP.x + w.x, y + 14, w.wd * Math.min(1, (t - w.t + .06) / .2), 7); }
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
const WHIP = .24, PUNCH = .26;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'whip' && dt < WHIP && i > 0) {
    const e = ss(dt / WHIP), blur = Math.sin(e * Math.PI) * 26 * K;
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${blur}px)`; c.drawImage(bufA, -W * e, 0); c.drawImage(bufB, W * (1 - e), 0); c.restore();
  } else if (kind === 'punch' && dt < PUNCH && i > 0) {
    const e = 1 - Math.pow(1 - dt / PUNCH, 3), s = lerp(1.22, 1, e);
    paintShot(bctx, i, t); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.filter = `blur(${(1 - e) * 10 * K}px)`; c.drawImage(bufB, 0, 0); c.restore();
  } else paintShot(c, i, t);
  vignette(c);
  captions(c, t);
  const fade = ss(seg(t, STORY - .7, STORY)); if (fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits and the footsteps
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
for (let k = 1; k < 8; k++) EV.push({ t: +(HIT.walk[0] + k * (HIT.walk[1] - HIT.walk[0]) / 8).toFixed(3), type: 'step', pan: lerp(-.7, 0, k / 8) });
for (let k = 1; k < 5; k++) EV.push({ t: +(HIT.away[0] + k * (HIT.away[1] - HIT.away[0]) / 5).toFixed(3), type: 'step', pan: lerp(.3, .8, k / 5) });
for (let k = 1; k < 5; k++) EV.push({ t: +(25.95 + k * 1.25 / 5).toFixed(3), type: 'step', pan: lerp(-.7, -.3, k / 5) });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
