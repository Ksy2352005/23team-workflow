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

// —— motion helpers: one stage, bold single visuals handing over to each other ——
function KF(t, keys) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i]; if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, ss((t - t0) / Math.max(1e-6, t1 - t0))); } } return keys[keys.length - 1][1]; }
const life = (t, a, b, fi = .35, fo = .3) => Math.min(ss(seg(t, a, a + fi)), 1 - ss(seg(t, b - fo, b)));   // 0..1: in from a, out by b
function enter(c, x, y, k, kind, f) {   // a section comes in and goes out with a bold, eased move
  if (k <= 0) return; c.save(); c.globalAlpha *= Math.min(1, k * 1.4); c.translate(x, y);
  if (kind === 'up') c.translate(0, (1 - k) * 160); if (kind === 'left') c.translate((1 - k) * -260, 0); if (kind === 'right') c.translate((1 - k) * 260, 0);
  const sc = kind === 'pop' ? lerp(.6, 1, k) : kind === 'zoom' ? lerp(1.5, 1, k) : 1; c.scale(sc, sc); c.translate(-x, -y); f(); c.restore();
}
function badge(c, kind, x, y, r, k = 1) {
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); const g = r * .55;
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, NAVY); if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (typeof kind === 'number') { c.save(); c.font = `700 ${g * 1.6}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(String(kind), x, y + g * .08); c.restore(); } });
}
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
// —— the brand: MIRA, a gold wave in a circle ——
function logo(c, x, y, r, o = {}) {   // o.grey 0..1 (unknown: grey, blurred), o.name 0..1 (the name underneath)
  const gr = o.grey || 0; c.save(); if (gr > 0) c.filter = `grayscale(${gr}) blur(${gr * r * .08 * K}px)`;
  ell(c, x + r * .05, y + r * .08, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, GOLD); ell(c, x, y, r * .86, r * .86, '#f2c95e');
  c.strokeStyle = CREAM; c.lineWidth = r * .14; c.lineCap = 'round'; for (const d of [-.32, .02, .36]) { c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(x - r * .55 + u * r * 1.1, y + d * r + Math.sin(u * Math.PI * 2) * r * .12); } c.stroke(); }
  c.restore();
  if (o.name > 0) { c.save(); c.globalAlpha *= Math.min(1, o.name); c.font = `700 ${r * .62}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = CREAM; c.fillText('MIRA', x, y + r * 1.5 + (1 - Math.min(1, o.name)) * 30); c.restore(); }
}
function ring(c, x, y, r, p, w = 14) { c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(246,239,220,.15)'; c.lineWidth = w; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); if (p > 0) { c.strokeStyle = GOLD; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke(); } c.restore(); }
function eyeIcon(c, x, y, s, open = 1, inner) { c.save(); c.fillStyle = CREAM; c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.fill(); if (open > .2) { c.beginPath(); c.moveTo(x - 90 * s, y); c.quadraticCurveTo(x, y - 80 * s * open, x + 90 * s, y); c.quadraticCurveTo(x, y + 80 * s * open, x - 90 * s, y); c.clip(); ell(c, x, y, 40 * s, 40 * s, NAVY); inner && inner(); } c.restore(); }
function bell(c, x, y, s, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = GOLD; c.beginPath(); c.moveTo(-26 * s, 18 * s); c.quadraticCurveTo(-24 * s, -30 * s, 0, -32 * s); c.quadraticCurveTo(24 * s, -30 * s, 26 * s, 18 * s); c.closePath(); c.fill(); c.fillRect(-32 * s, 14 * s, 64 * s, 8 * s); ell(c, 0, 26 * s, 7 * s, 7 * s, GOLD2); ell(c, 0, -34 * s, 5 * s, 5 * s, GOLD2); c.restore(); }
function bottle(c, x, y, s) { c.fillStyle = '#5d7fc4'; c.beginPath(); c.roundRect(x - 34 * s, y - 150 * s, 68 * s, 150 * s, 18 * s); c.fill(); c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(x - 22 * s, y - 182 * s, 44 * s, 36 * s, 8 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 24 * s, y - 136 * s, 10 * s, 110 * s); }
function cart(c, x, y, s, shake = 0) { c.save(); c.translate(x + Math.sin(shake * 40) * 8 * shake, y); c.strokeStyle = CREAM; c.lineWidth = 10 * s; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-90 * s, -70 * s); c.lineTo(-62 * s, -70 * s); c.lineTo(-40 * s, 30 * s); c.lineTo(60 * s, 30 * s); c.lineTo(80 * s, -40 * s); c.lineTo(-52 * s, -40 * s); c.stroke(); ell(c, -30 * s, 56 * s, 13 * s, 13 * s, CREAM); ell(c, 50 * s, 56 * s, 13 * s, 13 * s, CREAM); c.restore(); }
// a feed post in the phone; brand posts carry the logo
function post(c, x, y, w, i, brand, t, o = {}) {
  const h = w * 1.18; c.fillStyle = '#fbf6ea'; c.beginPath(); c.roundRect(x - w / 2, y, w, h, 16); c.fill();
  ell(c, x - w / 2 + 34, y + 32, 18, 18, brand ? GOLD : ['#8f98b0', '#c4566a', '#7fbf8a', '#5d7fc4'][i % 4]); c.fillStyle = 'rgba(28,36,80,.35)'; c.fillRect(x - w / 2 + 62, y + 24, brand ? 70 : 90 + (i % 3) * 20, 14);
  c.fillStyle = brand ? '#1f2c62' : ['#d9ccab', '#c9d6b0', '#e6c3b8', '#b8c6e6'][i % 4]; c.fillRect(x - w / 2 + 14, y + 62, w - 28, w - 28);
  if (brand) logo(c, x, y + 62 + (w - 28) / 2, w * .24, { grey: o.grey || 0 }); else { ell(c, x - w * .1, y + 62 + w * .3, w * .14, w * .14, 'rgba(255,255,255,.5)'); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x - w / 2 + 14, y + 62 + w - 28); c.lineTo(x, y + 62 + w * .4); c.lineTo(x + w / 2 - 14, y + 62 + w - 28); c.fill(); }
  heart(c, x - w / 2 + 34, y + h - 30, 12, 1, brand ? '#c4566a' : 'rgba(28,36,80,.4)');
}
function phone(c, x, y, w, h, f) { c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 12, y - h / 2 + 16, w, h, 56); c.fill(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 56); c.fill(); c.fillStyle = '#efe6d2'; c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 42); c.fill(); c.save(); c.beginPath(); c.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, 42); c.clip(); f(); c.restore(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(x - 60, y - h / 2 + 26, 120, 26, 13); c.fill(); }
function face(c, x, y, r, P, k = 1) { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => { ell(c, x + 4, y + 6, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); c.save(); c.beginPath(); c.arc(x, y, r * .82, 0, 7); c.clip(); drawMascot(c, { ...P, x, y: y + r * 1.7, s: r / 66, f: 0, shadow: false }); c.restore(); }); }
const AUD = [['blue2', 'bob'], ['blue1', null], ['blue3', 'pony'], ['blue2', null], ['blue3', 'long']];
const ME = o => ({ id: 'me', skin: 'blue3', fem: 'pony', s: 1.7, smile: .8, ...o });

// —— one object in the centre that keeps transforming: phone → post → logo → bottle → her head → eye → the chart's line → the week → the audience ——
const HX = 540, HY = 1270, MD = .5;   // the hero's centre; how long a transformation takes
const FORMS = { phone: { w: 430, h: 780, r: 64, col: [14, 20, 64] }, card: { w: 540, h: 600, r: 34, col: [251, 246, 234] }, coin: { w: 400, h: 400, r: 200, col: [185, 188, 203] }, gold: { w: 400, h: 400, r: 200, col: [236, 189, 74] },
  bottle: { w: 190, h: 500, r: 70, col: [93, 127, 196] }, head: { w: 440, h: 440, r: 220, col: [31, 63, 166] }, eye: { w: 640, h: 300, r: 150, col: [246, 239, 220] }, line: { w: 660, h: 14, r: 7, col: [246, 239, 220] } };
const STEPS = () => { const H = HIT; return [['phone', -9], ['card', H.unk - .3], ['coin', H.second - .25], ['gold', H.second + .3], ['bottle', H.need - .25], ['head', H.mind - .25], ['eye', H.term - .25], ['line', H.chart - .25]]; };
function form(t) {   // the hero's shape at time t: blending between forms, with a half-turn flip during each change
  const S = STEPS(); let i = 0; while (i + 1 < S.length && t >= S[i + 1][1]) i++;
  const cur = FORMS[S[i][0]], p = clamp((t - S[i][1]) / MD), prev = i > 0 ? FORMS[S[i - 1][0]] : cur, e = ss(p), flip = S[i][0] === 'gold' ? 0 : Math.PI * e;
  const mix = k => lerp(prev[k], cur[k], e); return { name: S[i][0], prevName: i > 0 ? S[i - 1][0] : S[i][0], p, w: mix('w'), h: mix('h'), r: mix('r'), col: [0, 1, 2].map(j => Math.round(lerp(prev.col[j], cur.col[j], e))), rot: i > 0 && p < 1 ? flip : 0 };
}
function stageBack(c, t) {   // depth without a grid: a deep radial room, three layers of soft bokeh drifting with the camera, a light pool on the floor
  c.fillStyle = TOP; c.fillRect(0, 0, 1080, 1920); const g = c.createRadialGradient(540, 1350, 40, 540, 1350, 760); g.addColorStop(0, '#3550b4'); g.addColorStop(.55, '#1b2a78'); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 760, 1080, 1160);
  const camX = Math.sin(t * .45) * 70, camY = Math.cos(t * .33) * 30;
  for (const [n, depth, size, al] of [[10, .25, 90, .07], [14, .55, 46, .1], [18, 1, 18, .22]]) for (let i = 0; i < n; i++) {
    const x = ((hash(i * 3.7 + depth) * 1400 - 160 + camX * depth * 2 + t * 12 * depth) % 1400 + 1400) % 1400 - 160, y = 820 + hash(i * 7.1 + depth) * 1060 + camY * depth - Math.sin(t * .6 + i) * 12 * depth, r = size * (.6 + hash(i * 1.3) * .8);
    const gg = c.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, i % 3 ? `rgba(246,239,220,${al})` : `rgba(236,189,74,${al * 1.4})`); gg.addColorStop(1, 'rgba(246,239,220,0)'); c.fillStyle = gg; c.fillRect(x - r, y - r, r * 2, r * 2); }
  const fl = c.createRadialGradient(540, 1720, 10, 540, 1720, 420); fl.addColorStop(0, 'rgba(120,150,255,.28)'); fl.addColorStop(1, 'rgba(120,150,255,0)'); c.save(); c.translate(540, 1720); c.scale(1, .22); c.translate(-540, -1720); c.fillStyle = fl; c.fillRect(100, 1300, 880, 840); c.restore();
}
function heroPath(c, w, h, r) { c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, Math.min(r, w / 2, h / 2)); }
const KICKS = () => STEPS().slice(1).map(s => s[1]).concat([HIT.regular - .25, HIT.audience - .25, HIT.first, HIT.bell]);
const kick = t => KICKS().reduce((m, k) => t < k ? m : Math.max(m, Math.exp(-(t - k) * 5) * Math.sin(Math.min(1, (t - k) / .1) * Math.PI / 2)), 0);
const WOMAN = o => ({ id: 'me', skin: 'blue3', fem: 'pony', s: 1.9, smile: .8, ...o });
const GREYS = [['#8f98b0', 'sq'], ['#6b7aa8', 'tri'], ['#9aa0b8', 'oval'], ['#7d86a6', 'hex'], ['#a1a8c0', 'sq']];
function otherBrand(c, x, y, r, i) { const [col, sh] = GREYS[i % GREYS.length]; ell(c, x + r * .05, y + r * .08, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, '#d6d9e4'); c.fillStyle = col; c.beginPath(); if (sh === 'sq') c.roundRect(x - r * .45, y - r * .45, r * .9, r * .9, r * .15); else if (sh === 'tri') { c.moveTo(x, y - r * .55); c.lineTo(x + r * .5, y + r * .4); c.lineTo(x - r * .5, y + r * .4); c.closePath(); } else if (sh === 'oval') c.ellipse(x, y, r * .55, r * .36, 0, 0, 7); else for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.lineTo(x + Math.cos(a) * r * .5, y + Math.sin(a) * r * .5); } c.fill(); }
function almond(c, w, h) { c.beginPath(); c.moveTo(-w / 2, 0); c.quadraticCurveTo(0, -h, w / 2, 0); c.quadraticCurveTo(0, h, -w / 2, 0); c.closePath(); }
function waves(c, r, col = CREAM) { c.strokeStyle = col; c.lineWidth = r * .14; c.lineCap = 'round'; for (const d of [-.32, .02, .36]) { c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(-r * .55 + u * r * 1.1, d * r + Math.sin(u * Math.PI * 2) * r * .12); } c.stroke(); } }

const SHOT = {
  flow(c, t) {
    const H = HIT; stageBack(c, t);
    const F = form(t), k = kick(t), sway = Math.sin(t * .8) * .05;
    c.save(); c.translate(HX, HY); c.scale(1 + .06 * k, 1 + .06 * k); c.translate(-HX, -HY);
    // where the line goes, the hero goes: the chart's axis sits lower
    const hy = F.name === 'line' ? lerp(HY, 1600, ss(F.p)) : HY, decoA = F.p < 1 ? Math.abs(Math.cos(F.rot)) : 1, showNew = F.p >= .5 || F.rot === 0, nm = showNew ? F.name : F.prevName;
    const tilt = F.name === 'line' || F.name === 'head' ? 0 : sway;
    // the week and the audience take over from the line
    const wk = ss(seg(t, H.regular - .25, H.regular + .25)), au = ss(seg(t, H.audience - .25, H.audience + .25));
    if (wk <= 0) {
      // reflection on the floor
      c.save(); c.translate(HX, hy); const sx = Math.cos(F.rot + tilt); c.scale(Math.max(.02, Math.abs(sx)), 1);
      ell(c, 12, F.h / 2 + 24, F.w * .45, 16, 'rgba(0,0,20,.35)');
      if (nm === 'eye') { c.fillStyle = `rgb(${F.col})`; almond(c, F.w, F.h * 1.05); c.fill(); }
      else { c.fillStyle = `rgb(${F.col})`; if (nm === 'bottle' && t < H.product) { c.save(); c.setLineDash([22, 14]); c.lineDashOffset = -t * 40; c.strokeStyle = CREAM; c.lineWidth = 7; heroPath(c, F.w, F.h, F.r); c.stroke(); c.restore(); if (F.p < 1) { c.globalAlpha = 1 - F.p; heroPath(c, F.w, F.h, F.r); c.fill(); c.globalAlpha = 1; } } else { heroPath(c, F.w, F.h, F.r); c.fill(); } }
      c.globalAlpha = decoA;
      // —— what each form carries ——
      if (nm === 'phone') { c.fillStyle = '#efe6d2'; c.beginPath(); c.roundRect(-F.w / 2 + 18, -F.h / 2 + 18, F.w - 36, F.h - 36, 44); c.fill(); c.save(); c.beginPath(); c.roundRect(-F.w / 2 + 18, -F.h / 2 + 18, F.w - 36, F.h - 36, 44); c.clip(); const sc = KF(t, [[0, 0], [H.seen, 300], [H.insta, 620], [H.never, 900], [H.unk, 960]]); c.translate(-HX, -HY); for (let i = 0; i < 8; i++) { const brand = i === 2 || i === 4 || i === 6, y = 940 + i * 400 - sc; if (y > 1700 || y < 600) continue; post(c, HX, y, 340, i, brand, t); if (brand && y > 860 && y < 1480) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 7; c.beginPath(); c.roundRect(HX - 176, y - 6, 352, 340 * 1.18 + 12, 18); c.stroke(); c.restore(); } } c.restore(); c.fillStyle = '#0e1440'; c.beginPath(); c.roundRect(-60, -F.h / 2 + 26, 120, 26, 13); c.fill();
        [H.seen, H.insta].forEach((at, i) => { const kk = E(t, at, .3, .5) * (1 - ss(seg(t, at + 1.1, at + 1.4))); if (kk > 0) scaled(c, 170, -300 + i * 70, Math.min(1.12, kk), () => { ell(c, 170, -300 + i * 70, 46, 46, GOLD); text(c, '+1', 170, -298 + i * 70, 40, NAVY); }); });
        const ck = E(t, H.never, .3, .5); if (ck > 0) scaled(c, 150, 330, Math.min(1.12, ck), () => { ell(c, 150, 330, 88, 88, '#c4566a'); cart(c, 150, 330, .74, Math.max(0, 1 - (t - H.never - .3) / .6)); }); }
      if (nm === 'card') { c.fillStyle = '#1f2c62'; c.fillRect(-F.w / 2 + 24, -F.h / 2 + 70, F.w - 48, F.h - 140); ell(c, -F.w / 2 + 50, -F.h / 2 + 38, 18, 18, '#b9bccb'); c.fillStyle = 'rgba(28,36,80,.3)'; c.fillRect(-F.w / 2 + 80, -F.h / 2 + 30, 110, 14);
        c.save(); c.filter = `grayscale(1) blur(${10 * K}px)`; c.translate(-HX, -HY); logo(c, HX, HY, 140); c.restore(); badge(c, 'q', F.w / 2 - 50, -F.h / 2 + 60, 50, E(t, H.q, .3, .55)); }
      if (nm === 'coin' || nm === 'gold') { const gr = KF(t, [[H.second, 1], [H.second + .6, .5], [H.few, .5], [H.few + .8, 0]]); c.save(); if (gr > 0) c.filter = `blur(${gr * 8 * K}px)`; waves(c, F.w / 2); c.restore();
        const mk = E(t, H.memo, .3, .5) * (1 - ss(seg(t, H.few, H.few + .3))); if (mk > 0) scaled(c, 170, -200, Math.min(1.12, mk), () => { c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(136, -260); c.lineTo(204, -260); c.lineTo(204, -140); c.lineTo(170, -170); c.lineTo(136, -140); c.closePath(); c.fill(); }); }
      if (nm === 'bottle') { c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(-58, -F.h / 2 - 62, 116, 70, 16); c.fill(); if (t > H.product) { const fl = ss(seg(t, H.product, H.product + .5)); c.save(); heroPath(c, F.w, F.h, F.r); c.clip(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-F.w / 2 + 26, -F.h / 2 + 40, 22, F.h * .7 * fl); c.restore(); }
        const ok = E(t, H.offers, .3, .55); if (ok > 0) { c.save(); c.translate(-HX, -HY); logo(c, HX, HY + 20, 62 * Math.min(1.12, ok)); c.restore(); } }
      if (nm === 'eye' && F.p >= 1) { ell(c, 0, 0, 120, 120, NAVY); c.save(); c.translate(-HX, -HY); logo(c, HX, HY, 86); c.restore(); }
      if (nm === 'eye' && F.p < 1 && F.p >= .5) { ell(c, 0, 0, 120 * (F.p - .5) * 2, 120 * (F.p - .5) * 2, NAVY); }
      c.restore();
      // around the coin: the exposure ring, the eyes that count, the spins, the name and the bell
      if (nm === 'coin' || nm === 'gold') { const rp = KF(t, [[H.unk + .2, .1], [H.second, .15], [H.second + .5, .4], [H.few, .4], [H.name - .3, .95], [H.name, 1]]); if (F.p >= 1 || F.name === 'gold') ring(c, HX, hy, 250, rp, 18);
        const ne = Math.min(5, Math.max(1, Math.floor(rp * 5.4))); for (let i = 0; i < ne; i++) scaled(c, HX + (i - (ne - 1) / 2) * 110, hy - 340, Math.min(1, rp * 5.4 - i), () => eyeIcon(c, HX + (i - (ne - 1) / 2) * 110, hy - 340, .5, 1));
        const nk = E(t, H.name, .35, .45); if (nk > 0) { c.save(); c.globalAlpha = Math.min(1, nk); c.font = '700 96px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = CREAM; c.fillText('MIRA', HX, hy + 330 + (1 - Math.min(1, nk)) * 40); c.restore(); }
        const bk = E(t, H.bell, .3, .45); if (bk > 0 && t < H.need - .3) { bell(c, HX + 280, hy + 220, 1.3 * Math.min(1.1, bk), .5 * Math.sin((t - H.bell) * 18) * Math.exp(-(t - H.bell) * 2.5)); for (let q = 0; q < 2; q++) { c.strokeStyle = `rgba(236,189,74,${.7 * Math.max(0, 1 - (t - H.bell) / 1.4)})`; c.lineWidth = 6; c.beginPath(); c.arc(HX + 280, hy + 210, 56 + q * 24, -.6, .6); c.stroke(); } } }
      // her head: the face appears; brands circle above like a halo; MIRA rises out of it
      if (nm === 'head' && F.p >= .6) { c.save(); c.globalAlpha = ss(clamp((F.p - .6) / .4)); const f1 = ss(seg(t, H.first - .4, H.first + .3)), items = [0, 1, 2, 3, 4, 'M'];
        const pos = items.map((it, i) => { const a = (t - H.mind) * .9 + i / items.length * Math.PI * 2; let x = HX + Math.cos(a) * 340, y = HY - 330 + Math.sin(a) * 40, d = Math.sin(a), r = 54 + 14 * d; if (it === 'M') { x = lerp(x, HX, f1); y = lerp(y, HY - 470, f1); d = lerp(d, 2, f1); r = lerp(r, 104, f1); } return { it, x, y, d, r }; }).sort((p, q) => p.d - q.d);
        const draw = p => { c.save(); c.globalAlpha *= p.it === 'M' ? 1 : lerp(.95, .4, f1) * (.6 + .4 * clamp(p.d + .5)); if (p.it === 'M') { if (f1 > 0) glow(c, p.x, p.y, p.r * 2, .5 * f1); logo(c, p.x, p.y, p.r); } else otherBrand(c, p.x, p.y, p.r, p.it); c.restore(); };
        pos.filter(p => p.d < 0).forEach(draw); c.save(); c.beginPath(); c.arc(HX, HY - 10, 280, 0, 7); c.clip(); const s = 440 / 2 / .225 / (BASE_H * 1.08); drawMascot(c, { ...WOMAN({ s, smile: f1 > .5 ? 1 : .75, blink: blinkAt(t, 3), look: f1 > .3 ? -.3 : 0 }), x: HX, y: HY + .76 * BASE_H * s * 1.08, f: 0, shadow: false }); c.restore(); pos.filter(p => p.d >= 0).forEach(draw);
        if (f1 >= 1) spark(c, HX, HY - 470, t, H.first + .3, 6, 160, 18); c.restore(); }
      // the eye's orbit of copies
      if (nm === 'eye' && F.p >= 1) for (let q = 0; q < 7; q++) { const a = q / 7 * Math.PI * 2 + (t - H.term) * .9, rr = 380 * ss(seg(t, H.mere - .2 + q * .05, H.mere + .4 + q * .05)); if (rr > 1) logo(c, HX + Math.cos(a) * rr, HY + Math.sin(a) * rr * .7, 44); }
      // the line becomes the chart: the y axis grows, exposures land, familiarity climbs, liking follows
      if (nm === 'line' && F.p >= .5) { const x0 = HX - 330, x1 = HX + 330, y0 = 1600, y1 = 1030, ya = ss(seg(t, H.chart + .1, H.chart + .5)); c.strokeStyle = CREAM; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, lerp(y0, y1, ya)); c.stroke();
        H.again.forEach((at, i) => { const kk = E(t, at, .3, .45); if (kk > 0) logo(c, x0 + 100 + i * 150, y0 + 80 - 40 * Math.max(0, 1 - (t - at) / .3), 38 * Math.min(1.12, kk)); });
        const line = (p, col, lift, end) => { if (p <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = 14; c.lineJoin = 'round'; c.beginPath(); const n = 30; let ex = 0, ey = 0; for (let i = 0; i <= n * p; i++) { const u = i / n; ex = x0 + 24 + u * (x1 - x0 - 48); ey = y0 - 24 - (1 - Math.exp(-u * 2.4)) / (1 - Math.exp(-2.4)) * (y0 - y1 - 70) * lift; i ? c.lineTo(ex, ey) : c.moveTo(ex, ey); } c.stroke(); c.restore(); glow(c, ex, ey, 56, .55); if (p >= 1) end(ex, ey); };
        line(ss(seg(t, H.grow, H.grow + 1.0)), GOLD, 1, (x, y) => eyeIcon(c, x + 10, y - 64, .6 * Math.min(1, E(t, H.grow + 1.0, .3, .5)), 1));
        line(ss(seg(t, H.like, H.like + 1.0)), '#e8664f', .62, (x, y) => heart(c, x + 10, y - 54, 44, Math.min(1.12, E(t, H.like + 1.0, .3, .5)), '#e8664f')); }
    }
    // the line splits into the week's seven days; MIRA lands on them in rhythm; then the days round into the audience's faces
    if (wk > 0) { const cw = 104, chh = 150, gap = 14, row0 = HX - (7 * cw + 6 * gap) / 2, ry = 1180;
      for (let d = 0; d < 7; d++) { const fx = HX - 330 + d * (660 / 7), cx = row0 + d * (cw + gap) + cw / 2; let x = lerp(fx + 660 / 14, cx, wk), y = lerp(1600, ry, wk), w = lerp(660 / 7 - 4, cw, wk), h = lerp(14, chh, wk), r = lerp(7, 18, wk), a = 1;
        if (au > 0) { if (d < 5) { const fxx = 200 + d * 170; x = lerp(x, fxx, au); y = lerp(y, 1420, au); w = lerp(w, 156, au); h = lerp(h, 156, au); r = lerp(r, 78, au); } else a = 1 - au; }
        if (a <= 0) continue; c.save(); c.globalAlpha = a; c.fillStyle = au > .5 ? CREAM : 'rgba(246,239,220,.18)'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, r); c.fill();
        if ((d % 2 === 0 || d === 5) && au < .5) { const kk = E(t, H.rhythm + d * .1, .3, .45); if (kk > 0) logo(c, x, y, 34 * Math.min(1.12, kk) * (1 - au * 2)); }
        if (d < 5 && au > .4) { const P = { id: 'a' + d, skin: AUD[d][0], fem: AUD[d][1], smile: 1, blink: blinkAt(t, d) }; c.save(); c.beginPath(); c.arc(x, y, w / 2 - 6, 0, 7); c.clip(); drawMascot(c, { ...P, x, y: y + (w / 2) * 1.7, s: (w / 2) / 66, f: 0, shadow: false }); c.restore(); c.strokeStyle = GOLD2; c.lineWidth = 6; c.beginPath(); c.arc(x, y, w / 2 - 3, 0, 7); c.stroke(); if (t > H.audience + .4 + d * .1) logo(c, x + w * .36, y - h * .36, 22 * Math.min(1.12, E(t, H.audience + .4 + d * .1, .3, .5))); }
        c.restore(); }
      if (t > H.end) { glow(c, HX, 1500, 420, .3 * ss(seg(t, H.end, H.end + .5))); spark(c, HX, 1500, t, H.end, 8, 360, 18); } }
    c.restore();
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
