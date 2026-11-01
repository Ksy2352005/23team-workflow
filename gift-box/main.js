// The Gift Box: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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
    if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2);
    if (kind === 'eq') { c.fillStyle = GOLD2; c.fillRect(x - g * .7, y - g * .38, g * 1.4, g * .26); c.fillRect(x - g * .7, y + g * .12, g * 1.4, g * .26); } });
}
function equals(c, x, y, w, k = 1) { if (k <= 0) return; scaled(c, x, y, k, () => { c.fillStyle = GOLD; c.beginPath(); c.roundRect(x - w / 2, y - w * .32, w, w * .2, w * .1); c.fill(); c.beginPath(); c.roundRect(x - w / 2, y + w * .12, w, w * .2, w * .1); c.fill(); }); }
function noteCard(c, x, y, w, k = 1, write = 1, rot = -.06) {   // a handwritten note: lines of writing appear, then a heart
  if (k <= 0) return; const h = w * .72; scaled(c, x, y, k, () => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(-w / 2 + 5, -h / 2 + 6, w, h); c.fillStyle = '#fff8e6'; c.fillRect(-w / 2, -h / 2, w, h); c.fillStyle = GOLD; c.fillRect(-w / 2, -h / 2, w, h * .1);
    c.strokeStyle = 'rgba(28,36,80,.6)'; c.lineWidth = w * .028; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = clamp(write * 3 - i), y0 = -h * .14 + i * h * .2; if (u > 0) { c.beginPath(); c.moveTo(-w * .38, y0); for (let j = 0; j <= 10 * u; j++) c.lineTo(-w * .38 + j / 10 * w * (i === 2 ? .4 : .62), y0 + Math.sin(j * 2.3 + i) * w * .018); c.stroke(); } }
    if (write >= 1) heart(c, w * .26, h * .26, w * .09, 1, '#c4566a'); c.restore(); });
}
// —— the gift, and what it comes in ——
function mug(c, x, y, s = 1, o = {}) {   // the same cream mug with a gold heart; y = its bottom
  const w = 120 * s, h = 130 * s; c.save(); c.globalAlpha *= (o.alpha ?? 1);
  if (o.glow) glow(c, x, y - h / 2, w * 1.3, .5 * o.glow);
  if (!o.noShadow) ell(c, x + 6 * s, y, w * .58, 10 * s, 'rgba(0,0,20,.3)');
  c.strokeStyle = '#e9dcc0'; c.lineWidth = 16 * s; c.beginPath(); c.arc(x + w / 2, y - h * .52, h * .24, -1.3, 1.3); c.stroke();
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#fbf3df'); g.addColorStop(.7, '#efe2c2'); g.addColorStop(1, '#d9c9a2'); c.fillStyle = g; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, [6 * s, 6 * s, 22 * s, 22 * s]); c.fill();
  ell(c, x, y - h, w / 2, 12 * s, '#d9c9a2'); ell(c, x, y - h + 2 * s, w / 2 - 8 * s, 8 * s, '#6b3d24');
  heart(c, x - 4 * s, y - h * .45, 22 * s, 1, GOLD); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - w * .36, y - h * .85, 8 * s, h * .6);
  c.restore();
}
function plasticBag(c, x, y, s = 1, o = {}) {   // a thin plastic carrier bag, the mug a faint shape inside; (x, y) = where the handles are held
  const w = 150 * s, h = 170 * s, top = y + 40 * s, sw = (o.swing || 0); c.save(); c.translate(x, y); c.rotate(sw); c.translate(-x, -y);
  c.strokeStyle = 'rgba(235,238,245,.9)'; c.lineWidth = 9 * s; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x + d * 18 * s, top + 4 * s); c.quadraticCurveTo(x + d * 30 * s, y - 14 * s, x, y); c.stroke(); }
  c.fillStyle = 'rgba(235,238,245,.88)'; c.beginPath(); c.moveTo(x - w * .42, top); c.lineTo(x + w * .42, top); c.quadraticCurveTo(x + w * .55, top + h * .6, x + w * .48, top + h); c.lineTo(x - w * .48, top + h); c.quadraticCurveTo(x - w * .55, top + h * .6, x - w * .42, top); c.fill();
  c.save(); c.globalAlpha = .28; mug(c, x, top + h - 6 * s, s * .9, { noShadow: true }); c.restore();
  c.strokeStyle = 'rgba(160,170,190,.6)'; c.lineWidth = 3 * s; for (const [a, b, d] of [[-.3, .2, .4], [.1, .15, .5], [.32, .45, .35], [-.15, .6, .3]]) { c.beginPath(); c.moveTo(x + a * w, top + b * h); c.lineTo(x + (a + .08) * w, top + (b + d) * h); c.stroke(); }
  c.restore();
}
function giftBox(c, x, y, s = 1, o = {}) {   // the navy gift box with a gold ribbon and bow; y = its bottom. o.walls (0..1 rise), o.lid (0..1 on), o.open (0..1), o.ribbon, o.bow, o.seal, o.note, o.mug
  const w = 230 * s, h = 170 * s, wl = o.walls ?? 1, lid = o.lid ?? 1, op = o.open || 0, rb = o.ribbon ?? 1, bw = o.bow ?? 1;
  if (o.glow) glow(c, x, y - h / 2, w * 1.2, .5 * o.glow);
  ell(c, x + 8 * s, y, w * .56, 12 * s, 'rgba(0,0,20,.3)');
  if (o.mug) mug(c, x, y - 6 * s - (op > 0 ? op * 70 * s : 0), s * .95, { glow: op });
  if (wl > 0) { const hh = h * wl; c.fillStyle = '#26346f'; c.fillRect(x - w / 2, y - hh, w, hh); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x - w / 2, y - hh, w * .2, hh);
    if (rb > 0) { c.fillStyle = GOLD; c.fillRect(x - 14 * s, y - hh, 28 * s, hh * Math.min(1, rb * 2)); c.fillRect(x - w / 2, y - hh * .55, w * clamp(rb * 2 - 1), 22 * s); } }
  if (lid > 0) { const ly = lerp(y - h - 260 * s, y - h, ss(lid)) - op * 120 * s, la = -op * .35; c.save(); c.translate(x - w * .55, ly + 20 * s); c.rotate(la); c.translate(-(x - w * .55), -(ly + 20 * s)); c.globalAlpha *= Math.min(1, lid * 3);
    c.fillStyle = '#1f2c62'; c.fillRect(x - w * .55, ly - 6 * s, w * 1.1, 40 * s); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x - w * .55, ly - 6 * s, w * 1.1, 8 * s);
    if (rb > 0) { c.fillStyle = GOLD; c.fillRect(x - 14 * s, ly - 6 * s, 28 * s, 40 * s); }
    if (bw > 0) scaled(c, x, ly - 6 * s, Math.min(1.1, bw), () => { c.fillStyle = GOLD; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x, ly - 6 * s); c.bezierCurveTo(x + d * 70 * s, ly - 90 * s, x + d * 100 * s, ly - 10 * s, x, ly - 6 * s); c.fill(); c.beginPath(); c.moveTo(x, ly - 4 * s); c.lineTo(x + d * 46 * s, ly + 40 * s); c.lineTo(x + d * 26 * s, ly + 44 * s); c.closePath(); c.fill(); } ell(c, x, ly - 10 * s, 18 * s, 16 * s, GOLD2); });
    c.restore(); }
  if (o.seal > 0) scaled(c, x + w * .32, y - h * .25, Math.min(1.1, o.seal), () => { ell(c, x + w * .32, y - h * .25, 22 * s, 22 * s, '#c4566a'); star(c, x + w * .32, y - h * .25, 11 * s, 1, GOLD); });
  if (o.note > 0) noteCard(c, x - w * .3, y - h * .3, 90 * s, o.note, o.write ?? 1, -.12);
}
function priceTag(c, x, y, s, k, rot = 0) {   // a swinging price tag hanging from (x, y)
  if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => { c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = '#b9a888'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 30 * s); c.stroke();
    c.fillStyle = 'rgba(0,0,20,.25)'; c.beginPath(); c.roundRect(-74 * s + 5, 30 * s + 6, 148 * s, 64 * s, 10 * s); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(-74 * s, 30 * s, 148 * s, 64 * s, 10 * s); c.fill(); ell(c, 0, 42 * s, 5 * s, 5 * s, '#b9a888');
    c.font = `700 ${30 * s}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('4 990 Ft', 0, 70 * s); c.restore(); });
}
function calendarPage(c, x, y, w, k = 1) {   // a day on the calendar
  if (k <= 0) return; const h = w * 1.05; scaled(c, x, y, k, () => { c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 6, y - h / 2 + 8, w, h, 16); c.fill(); c.fillStyle = CREAM; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 16); c.fill(); c.fillStyle = '#c4566a'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h * .26, [16, 16, 0, 0]); c.fill();
    for (const d of [-.25, .25]) ell(c, x + d * w, y - h / 2, w * .04, w * .09, '#8f98b0'); c.save(); c.font = `700 ${w * .5}px "Montserrat"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('14', x, y + h * .13); c.restore(); });
}
function pedestal(c, x, y, w = 200) { c.fillStyle = '#d9ccab'; c.fillRect(x - w / 2, y, w, 1760 - y); c.fillStyle = CREAM; c.fillRect(x - w / 2 - 14, y - 6, w + 28, 22); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x - w / 2, y + 16, w * .2, 1760 - y - 16); }
function hammer(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = WOOD; c.beginPath(); c.roundRect(-9 * s, -20 * s, 18 * s, 150 * s, 8 * s); c.fill(); c.fillStyle = '#8f98b0'; c.beginPath(); c.roundRect(-46 * s, -50 * s, 92 * s, 36 * s, 8 * s); c.fill(); c.restore(); }
function brush(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = WOOD; c.beginPath(); c.roundRect(-8 * s, 0, 16 * s, 130 * s, 8 * s); c.fill(); c.fillStyle = '#8f98b0'; c.fillRect(-14 * s, -18 * s, 28 * s, 22 * s); c.fillStyle = '#c4566a'; c.beginPath(); c.moveTo(-16 * s, -18 * s); c.quadraticCurveTo(0, -80 * s, 16 * s, -18 * s); c.fill(); c.restore(); }
function room(c, t) {   // a warm room: the wall is the caption area's blue, cream panelling, a wooden floor, a lamp's glow
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000); glow(c, 540, 1100, 520, .12);
  for (let k = -3; k < 14; k++) { const x0 = k * 130; c.fillStyle = '#e9dcc0'; c.fillRect(x0, 1390, 128, 250); c.strokeStyle = 'rgba(138,93,56,.35)'; c.lineWidth = 4; c.strokeRect(x0 + 16, 1414, 96, 200); }
  c.fillStyle = WOOD; c.fillRect(-400, 1380, 1880, 14);
  c.fillStyle = '#5a3a22'; c.fillRect(-400, 1640, 1880, 600); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 1670; y < 2200; y += 40) { c.beginPath(); c.moveTo(-400, y); c.lineTo(1480, y); c.stroke(); }
}
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }

// —— the people ——
const GIVER = (i, o) => ({ id: 'giver' + i, skin: 'owner', bowtie: i ? 1 : 0, s: 1.9, smile: .8, ...o });   // the two givers, white; the second in a bow tie
const MAN = o => ({ id: 'man', skin: 'blue1', fem: null, s: 1.9, smile: .6, ...o });   // the first receiver
const WOMAN = o => ({ id: 'woman', skin: 'blue3', fem: 'bun', s: 1.9, smile: .6, ...o });   // the second receiver

// —— the shots ——
const SHOT = {
  same(c, t) {   // two people, on the same day, got exactly the same gift: the calendar's day; the two of them; the same mug above each, equal
    const cal = E(t, HIT.cal, .35, .45), eq = E(t, HIT.eq0, .3, .5);
    bg(c);
    stage(c, [80, 860, 1000, 1780], seg(t, 0, 4.25), () => {
      calendarPage(c, 540, 980, 190, cal); if (cal > 0) spark(c, 540, 980, t, HIT.cal + .1, 4, 150, 14);
      [[300, MAN, .35, 0], [780, WOMAN, -.35, 1]].forEach(([x, P, f, i]) => { const k = E(t, HIT.people[i], .35, .45); if (k <= 0) return; scaled(c, x, 1760, Math.min(1, k), () => mascot(c, P({ x, y: 1760, f, smile: lerp(.6, 1, E(t, HIT.mugs[i], .3, .5) > .5 ? 1 : 0), blink: blinkAt(t, 3 + i) })));
        const m = E(t, HIT.mugs[i], .35, .45); if (m > 0) scaled(c, x, 1240, Math.min(1.1, m), () => mug(c, x, 1240, .9, { glow: .4 })); });
      equals(c, 540, 1180, 90, eq); });
  },
  bag(c, t) {   // the first got his in a plain plastic bag: handed over one-handed; he takes it; that's that
    const [a, b] = HIT.bagGive, u = ss(seg(t, a, b)), meh = ss(seg(t, HIT.bagMeh - .2, HIT.bagMeh + .2));
    stage(c, [100, 880, 980, 1800], 0, () => { room(c, t);
      const hx = lerp(690, 420, u), hy = 1600 - Math.sin(u * Math.PI) * 40, sw = .25 * Math.sin(t * 7) * Math.exp(-Math.max(0, t - b) * 2) * (u > 0 ? 1 : 0);
      mascot(c, GIVER(0, { x: 760, y: 1790, f: -.45, smile: .5, blink: blinkAt(t, 1), handL: u < 1 ? [hx + 14, hy] : undefined }));
      mascot(c, MAN({ x: 330, y: 1790, f: .45, smile: lerp(.6, .25, meh), blink: blinkAt(t, 3), handR: u > .85 ? [hx - 10, hy] : undefined }));
      plasticBag(c, hx, hy, 1, { swing: sw }); });
  },
  box(c, t) {   // the second got hers in a beautiful gift box, with a handwritten note: offered with both hands; it sparkles; the note writes itself; she lights up
    const [a, b] = HIT.boxGive, u = ss(seg(t, a, b)), nt = E(t, HIT.note[0] - .1, .3, .5), wr = seg(t, ...HIT.note), hp = E(t, HIT.happy, .3, .5);
    stage(c, [100, 880, 980, 1800], 0, () => { room(c, t);
      const bx = lerp(640, 560, u), by = 1700;
      mascot(c, GIVER(1, { x: 770, y: 1790, f: -.45, smile: 1, lean: .08 * u, blink: blinkAt(t, 1), handL: [bx - 100, by - 80], handR: [bx + 110, by - 80] }));
      mascot(c, WOMAN({ x: 330, y: 1790, f: .45, smile: lerp(.6, 1, hp), o: t > HIT.sparkle && hp < .5 ? .6 : 0, blink: blinkAt(t, 4), handR: u > .9 ? [bx - 118, by - 70] : undefined }));
      giftBox(c, bx, by, .85, { glow: .4 * ss(seg(t, HIT.sparkle - .2, HIT.sparkle + .3)) });
      spark(c, bx, by - 110, t, HIT.sparkle, 6, 170, 16);
      if (nt > 0) noteCard(c, 545, 1340, 170, nt, wr, -.06);
      if (hp > 0) for (let k = 0; k < 3; k++) heart(c, 190 + k * 60 - (k === 1 ? 0 : 0), 1290 - k * 40 - 60 * clamp((t - HIT.happy - k * .1) / 1.2), 18 + 4 * k, Math.max(0, Math.sin(clamp((t - HIT.happy - k * .1) / 1.2) * Math.PI)), '#c4566a'); });
  },
  equal(c, t) {   // yet both gifts were exactly the same and cost the same: the two mugs slide together and match perfectly; the same price tag on each
    const [m0, m1] = HIT.merge, mg = ss(seg(t, m0, m0 + .4)) * (1 - ss(seg(t, m1, m1 + .4))), ok = E(t, m0 + .4, .3, .5) * (1 - ss(seg(t, m1, m1 + .2))), eq = E(t, HIT.eq1, .3, .5);
    bg(c);
    stage(c, [100, 900, 980, 1780], 0, () => { pedestal(c, 320, 1500); pedestal(c, 760, 1500);
      const xl = lerp(320, 540, mg), xr = lerp(760, 540, mg);
      mug(c, xl, 1494, 1.4); c.save(); c.globalAlpha = 1 - .55 * mg; mug(c, xr, 1494, 1.4); c.restore();
      if (mg > .9) { glow(c, 540, 1400, 200, .4); } check(c, 540, 1180, 60, ok);
      HIT.tags.forEach((tt, i) => { const k = E(t, tt, .3, .45), x = [320, 760][i]; priceTag(c, x - 80, 1500, 1, k, .2 * Math.sin((t - tt) * 6) * Math.exp(-(t - tt) * 2.5)); });
      equals(c, 540, 1600, 70, eq); });
  },
  feel(c, t) {   // still, the second person felt hers was far more special: side by side; above him one heart, above her the hearts fill one by one, she glows
    const sp2 = ss(seg(t, HIT.spot - .2, HIT.spot + .4));
    bg(c);
    stage(c, [80, 900, 1000, 1800], 0, () => {
      if (sp2 > 0) glow(c, 760, 1500, 330, .35 * sp2);
      const P1 = MAN({ x: 300, y: 1790, f: .2, smile: .3, blink: blinkAt(t, 3), handR: [380, 1620] }); mascot(c, P1); plasticBag(c, 380, 1620, .8, {});
      const P2 = WOMAN({ x: 760, y: 1790, f: -.2, smile: 1, blink: blinkAt(t, 4), handL: [690, 1700], handR: [830, 1700] }); mascot(c, P2); giftBox(c, 760, 1775, .7, { glow: .5 * sp2 });
      for (let k = 0; k < 5; k++) { const x1 = 180 + k * 60; heart(c, x1, 1250, 20, 1, k === 0 && t > HIT.spot + .4 ? '#c4566a' : 'rgba(246,239,220,.18)'); }
      HIT.hearts.forEach((h, k) => { const x2 = 640 + k * 60, kk = E(t, h, .3, .5); heart(c, x2, 1250, 20, 1, 'rgba(246,239,220,.18)'); if (kk > 0) heart(c, x2, 1250, 20, Math.min(1.25, kk), '#c4566a'); });
      spark(c, 760, 1420, t, HIT.hearts[4] + .1, 6, 200, 16); });
  },
  xray(c, t) {   // yet the product itself didn't change at all: a scan line sweeps the bag and the box; inside both, the very same mug
    const [s0, s1] = HIT.scan, sc = seg(t, s0, s1), eq = E(t, HIT.same2, .3, .5);
    bg(c);
    stage(c, [80, 980, 1000, 1780], 0, () => { const lineY = lerp(1150, 1760, sc);
      [[300, 'bag'], [780, 'box']].forEach(([x, kind]) => {
        c.save(); c.beginPath(); c.rect(x - 220, 0, 440, sc > 0 && sc < 1 ? lineY : sc >= 1 ? 3000 : 0); c.clip(); mug(c, x, 1700, 1.15, { glow: .3 }); c.restore();
        c.save(); c.beginPath(); c.rect(x - 220, sc > 0 ? (sc >= 1 ? 3000 : lineY) : 0, 440, 3000); c.clip(); if (kind === 'bag') plasticBag(c, x, 1450, 1.35); else giftBox(c, x, 1720, 1.15, { note: 1 }); c.restore();
        c.save(); c.globalAlpha = .18 * (sc >= 1 ? 1 : 0); if (kind === 'bag') plasticBag(c, x, 1450, 1.35); else giftBox(c, x, 1720, 1.15); c.restore(); });
      if (sc > 0 && sc < 1) { glow(c, 300, lineY, 160, .35); glow(c, 780, lineY, 160, .35); c.fillStyle = GOLD; c.fillRect(80, lineY - 3, 920, 6); }
      equals(c, 540, 1560, 80, eq); });
  },
  handover(c, t) {   // only the way it was handed over changed: side by side, a bag swung across with one hand; a box offered with both hands and a little bow; a gold ring on the care
    const tb = seg(t, HIT.toss, HIT.toss + .5), pr = ss(seg(t, HIT.present - .2, HIT.present + .4)), rg = E(t, HIT.ring, .35, .5);
    bg(c, '#24398a');
    stage(c, [40, 900, 1040, 1800], 0, () => { c.fillStyle = 'rgba(246,239,220,.15)'; c.fillRect(538, 1080, 4, 640);
      mascot(c, MAN({ x: 140, y: 1780, s: 1.5, f: .45, smile: .3, blink: blinkAt(t, 3), handR: tb >= 1 ? [215, 1650] : undefined }));
      mascot(c, GIVER(0, { x: 420, y: 1780, s: 1.5, f: -.45, smile: .4, blink: blinkAt(t, 1), handL: tb < 1 ? [lerp(360, 300, tb), 1600] : undefined }));
      const bx = tb <= 0 ? 360 : lerp(350, 220, ss(tb)), byy = tb <= 0 ? 1600 : lerp(1600, 1650, tb) - Math.sin(tb * Math.PI) * 90; plasticBag(c, bx, byy, .7, { swing: tb > 0 && tb < 1 ? .8 * tb : .2 * Math.sin(t * 6) * Math.exp(-Math.max(0, t - HIT.toss - .5) * 2) });
      const gx = lerp(830, 790, pr);
      mascot(c, WOMAN({ x: 650, y: 1780, s: 1.5, f: .45, smile: 1, blink: blinkAt(t, 4), handR: pr > .9 ? [gx - 98, 1640] : undefined }));
      mascot(c, GIVER(1, { x: 900, y: 1780, s: 1.5, f: -.45, smile: 1, lean: .12 * pr, blink: blinkAt(t, 1), handL: [gx - 80, 1640], handR: [gx + 80, 1640] }));
      giftBox(c, gx, 1700, .6, { glow: .3 * rg });
      if (rg > 0) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 6; c.globalAlpha = Math.min(1, rg); c.beginPath(); c.ellipse(gx, 1640, 170 * Math.min(1.05, rg), 110 * Math.min(1.05, rg), 0, 0, 7); c.stroke(); c.restore(); spark(c, gx, 1640, t, HIT.ring, 5, 170, 14); } });
  },
  why(c, t) {   // but why?: the ribbon slips off the box and draws a big gold question mark
    const [q0, q1] = HIT.qdraw, p = ss(seg(t, q0, q1)), dot = E(t, HIT.qdot, .3, .5);
    bg(c);
    stage(c, [140, 860, 940, 1780], 0, () => { giftBox(c, 540, 1740, .9, { ribbon: 1 - p * .99, bow: 1 - ss(seg(t, q0 - .2, q0 + .2)) });
      c.save(); c.strokeStyle = GOLD; c.lineWidth = 34; c.lineCap = 'round'; const L = 900; c.setLineDash([L * p, 3000]);
      c.beginPath(); c.moveTo(540, 1330); c.lineTo(540, 1250); c.quadraticCurveTo(540, 1180, 610, 1140); c.bezierCurveTo(720, 1070, 700, 910, 540, 900); c.bezierCurveTo(420, 900, 380, 970, 390, 1030); c.stroke(); c.restore();
      if (dot > 0) ell(c, 540, 1425, 26 * Math.min(1.15, dot), 26 * Math.min(1.15, dot), GOLD); });
  },
  value(c, t) {   // because we don't always value only the product itself: the mug alone on a pedestal, under a light; its stars: three of five
    const al = E(t, HIT.alone, .35, .45), st = HIT.stars0;
    bg(c);
    stage(c, [140, 860, 940, 1780], 0, () => { glow(c, 540, 1350, 300, .25); pedestal(c, 540, 1560, 260); scaled(c, 540, 1554, Math.min(1, al), () => mug(c, 540, 1554, 1.5));
      for (let k = 0; k < 5; k++) { const kk = E(t, st + k * .1, .3, .5); if (kk > 0) star(c, 380 + k * 80, 1060, 30, Math.min(1.1, kk), k < 3 ? GOLD : 'rgba(246,239,220,.2)'); }
      if (t > HIT.value) for (let k = 0; k < 3; k++) { const u = clamp((t - HIT.value - k * .1) / .5); glow(c, 380 + k * 80, 1060, 50, .4 * Math.sin(u * Math.PI)); } });
  },
  build(c, t) {   // it also matters how it's presented, what details we meet, what feeling it gives: the box builds itself round the mug; the ribbon, the bow, a seal, a note; then the feeling: it glows, hearts; the stars fill to five
    const wl = ss(seg(t, HIT.walls, HIT.walls + .6)), ld = ss(seg(t, HIT.lid - .25, HIT.lid + .15)), rb = ss(seg(t, HIT.ribbon - .2, HIT.ribbon + .4)), bw = E(t, HIT.bow, .3, .45), sl = E(t, HIT.seal, .3, .5), nt = E(t, HIT.tag, .3, .5), fl = ss(seg(t, HIT.feel - .2, HIT.feel + .6));
    bg(c);
    stage(c, [140, 860, 940, 1780], 0, () => { glow(c, 540, 1350, 300, .25 + .3 * fl); pedestal(c, 540, 1560, 260);
      if (wl < 1 || ld < 1) mug(c, 540, 1554, 1.5);
      if (wl > 0) giftBox(c, 540, 1560, 1.15, { walls: wl, lid: ld, ribbon: rb, bow: bw, seal: sl, note: nt, glow: .6 * fl });
      const lit = [1, 1, 1, t > HIT.star4 ? 1 : 0, t > HIT.star5 ? 1 : 0];
      for (let k = 0; k < 5; k++) { const pop = k === 3 ? E(t, HIT.star4, .3, .45) : k === 4 ? E(t, HIT.star5, .3, .45) : 1; star(c, 380 + k * 80, 1060, 30, lit[k] ? Math.min(1.15, pop) : 1, lit[k] ? GOLD : 'rgba(246,239,220,.2)'); }
      if (fl > 0) { for (let k = 0; k < 5; k++) { const u = clamp((t - HIT.burst - k * .12) / 1.4); if (u > 0 && u < 1) heart(c, 540 + [-200, 210, -150, 170, 0][k] * (.6 + .5 * u), 1380 - 150 * u, 22, Math.sin(u * Math.PI), '#c4566a'); } spark(c, 540, 1400, t, HIT.shine, 6, 230, 18); }
      if (t > HIT.shine) for (let k = 0; k < 5; k++) glow(c, 380 + k * 80, 1060, 55, .35 * Math.sin(clamp((t - HIT.shine - k * .06) / .6) * Math.PI)); });
  },
  notchange(c, t) {   // to make a product seem more valuable, you don't have to change it: the wrapped gift's glow grows; a hammer and a brush come for the mug, and are crossed out; the mug untouched
    const [a0, a1] = HIT.aura, au = ss(seg(t, a0, a1)), tl = HIT.tools.map(x => ss(seg(t, x, x + .4))), x1 = ss(seg(t, HIT.x1 - .1, HIT.x1 + .3)), x2 = ss(seg(t, HIT.x2 - .1, HIT.x2 + .3)), ok = E(t, HIT.ok, .3, .5);
    bg(c);
    stage(c, [100, 860, 980, 1780], 0, () => { glow(c, 540, 1420, 260 + 160 * au, .25 + .35 * au); pedestal(c, 540, 1580, 260); mug(c, 540, 1574, 1.5, { glow: .4 * au });
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + t * .6, r = 230 + 20 * Math.sin(t * 2 + k); if (au > 0) star(c, 540 + Math.cos(a) * r, 1420 + Math.sin(a) * r * .55, 14, au * (.7 + .3 * Math.sin(t * 4 + k))); }
      c.save(); c.globalAlpha = 1 - .5 * x1; c.globalAlpha *= tl[0]; hammer(c, lerp(190, 250, tl[0]), 1260, 1.1, lerp(-.9, -.5, tl[0])); c.restore(); cross(c, 250, 1260, 70, x1);
      c.save(); c.globalAlpha = 1 - .5 * x2; c.globalAlpha *= tl[1]; brush(c, lerp(890, 830, tl[1]), 1250, 1.1, lerp(.9, .5, tl[1])); c.restore(); cross(c, 830, 1250, 70, x2);
      check(c, 540, 1120, 50, ok); });
  },
  final(c, t) {   // it's enough to create a different experience around it: the box opens, the mug rises glowing; around it a gold ring draws, and the note, the bow, hearts and stars circle it; she smiles beside it
    const op = ss(seg(t, HIT.open, HIT.open + .7)), rg = ss(seg(t, HIT.ring2 - .3, HIT.ring2 + .5)), ob = ss(seg(t, HIT.orbit - .3, HIT.orbit + .4));
    bg(c, '#2a43a0');
    stage(c, [80, 860, 1000, 1780], 0, () => { glow(c, 500, 1450, 380, .3 + .3 * rg);
      giftBox(c, 460, 1720, 1.1, { open: op, mug: true, glow: .5 * op });
      if (rg > 0) { c.save(); c.strokeStyle = GOLD; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.ellipse(460, 1500, 290, 220, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rg); c.stroke(); c.restore(); }
      if (ob > 0) for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + (t - HIT.orbit) * .9, x = 460 + Math.cos(a) * 290, y = 1500 + Math.sin(a) * 220, kind = k % 3;
        scaled(c, x, y, ob, () => { if (kind === 0) heart(c, x, y, 22, 1, '#c4566a'); else if (kind === 1) star(c, x, y, 22, 1); else noteCard(c, x, y, 70, 1, 1, .1); }); }
      mascot(c, WOMAN({ x: 900, y: 1790, s: 1.6, f: -.4, smile: 1, blink: blinkAt(t, 4) })); });
  },
};

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['ugyanolyan','műanyag','zacskóban','gyönyörű','díszdobozban','kézzel','ugyanaz','ugyanannyiba','különlegesebbnek','egyáltalán','átadták','miért','értékeljük','hogyan','részletekkel','érzést','élmény','értékesebbnek','megváltoztatnod','élményt']);
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
