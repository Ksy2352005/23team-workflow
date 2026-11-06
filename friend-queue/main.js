// The Queue: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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
    if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, NAVY);
    if (kind === 'ok') { c.strokeStyle = GOLD2; c.lineWidth = g * .32; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - g * .55, y); c.lineTo(x - g * .15, y + g * .45); c.lineTo(x + g * .6, y - g * .4); c.stroke(); }
    if (kind === 'thumb') { c.fillStyle = GOLD2; c.beginPath(); c.roundRect(x - g * .55, y - g * .1, g * .7, g * .75, g * .15); c.fill(); c.beginPath(); c.roundRect(x - g * .25, y - g * .75, g * .32, g * .8, g * .16); c.fill(); c.fillRect(x - g * .75, y - g * .05, g * .22, g * .7); } });
}
function clockIcon(c, x, y, r, a = 0) { ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .14; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); c.strokeStyle = NAVY; c.lineWidth = r * .12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - Math.PI / 2) * r * .55, y + Math.sin(a - Math.PI / 2) * r * .55); c.moveTo(x, y); c.lineTo(x + r * .4, y); c.stroke(); }
function plate(c, x, y, r, t, steam = 1) {   // a steaming plate of something delicious, seen a little from above
  ell(c, x + 6, y + 10, r * 1.05, r * .42, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r * .4, CREAM); ell(c, x, y, r * .72, r * .28, '#efe2c2');
  ell(c, x - r * .18, y - r * .06, r * .34, r * .16, '#c97b3a'); ell(c, x + r * .2, y - r * .02, r * .3, r * .14, '#d9a35a'); ell(c, x + r * .02, y - r * .14, r * .22, r * .1, '#e8664f'); ell(c, x - r * .3, y - r * .14, r * .1, r * .06, '#7fbf8a'); ell(c, x + r * .36, y - r * .1, r * .08, r * .05, '#7fbf8a');
  for (let k = 0; k < 3; k++) { const u = (t * .7 + k / 3) % 1; c.strokeStyle = `rgba(246,239,220,${.55 * steam * Math.sin(u * Math.PI)})`; c.lineWidth = r * .06; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 10; i++) { const v = i / 10; c.lineTo(x + (k - 1) * r * .3 + Math.sin(t * 3 + v * 5 + k) * r * .06, y - r * .3 - v * r * .9 - u * r * .3); } c.stroke(); }
}
function phone(c, x, y, s, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(-22 * s, -40 * s, 44 * s, 80 * s, 10 * s); c.fill(); c.fillStyle = '#8fb0ff'; c.fillRect(-16 * s, -30 * s, 32 * s, 52 * s); c.restore(); }
function ringWaves(c, x, y, r, t) { for (let k = 0; k < 3; k++) { const u = ((t * 1.5) + k / 3) % 1; c.strokeStyle = `rgba(236,189,74,${.7 * (1 - u)})`; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r * (.5 + u), -.7, .7); c.stroke(); } }
function chalkboard(c, x, y, w, h, k, draw) { if (k <= 0) return; scaled(c, x, y + h / 2, Math.min(1, k), () => { c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, 10); c.fill(); c.fillStyle = '#23302a'; c.fillRect(x - w / 2, y - h / 2, w, h); draw && draw(); }); }
function headIcon(c, x, y, r, col = '#3b5bd1') { ell(c, x, y, r, r, col); c.fillStyle = col; c.beginPath(); c.roundRect(x - r * .9, y + r, r * 1.8, r * 1.3, r * .6); c.fill(); }
function star5(c, x, y, r, k, gap) { for (let i = 0; i < 5; i++) star(c, x + (i - 2) * gap, y, r, Math.max(0, Math.min(1.1, k * 5 - i))); }
// —— the two restaurants ——
function restaurant(c, x0, y0, w, h, o = {}) {   // a little restaurant front: striped awning, sign, a big window onto the room (tables; the owner; or empty with a fly), a door; o.stars and o.plate: what the passers-by imagine about it
  const x1 = x0 + w, y1 = y0 + h, mine = !o.rival, wall = mine ? '#e9dcc0' : '#b9bccb', trim = mine ? WOOD : '#6b6f86', aw = mine ? '#c4566a' : '#8f98b0';
  c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(x0 + 12, y0 + 12, w, h); c.fillStyle = wall; c.fillRect(x0, y0, w, h); c.fillStyle = trim; c.fillRect(x0 - 14, y0 - 20, w + 28, 26);
  c.fillStyle = trim; c.beginPath(); c.roundRect(x0 + w / 2 - 150, y0 + 24, 300, 74, 12); c.fill(); c.save(); c.font = '700 44px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = mine ? GOLD : CREAM; c.fillText(mine ? 'BISZTRÓ' : 'ÉTTEREM', x0 + w / 2, y0 + 62); c.restore();
  if (o.stars > 0) { glow(c, x0 + w / 2, y0 - 60, 200, .3 * Math.min(1, o.stars)); star5(c, x0 + w / 2, y0 - 60, 26, o.stars, 62); }
  const ay = y0 + 120; for (let i = 0; i < 8; i++) { const sx = x0 + 10 + i * (w - 20) / 8; c.fillStyle = i % 2 ? CREAM : aw; c.beginPath(); c.moveTo(sx, ay); c.lineTo(sx + (w - 20) / 8, ay); c.lineTo(sx + (w - 20) / 8, ay + 50); c.arc(sx + (w - 20) / 16, ay + 50, (w - 20) / 16, 0, Math.PI); c.closePath(); c.fill(); }
  const dw = 120, dx = o.door ?? (mine ? x0 + 100 : x1 - 80), left = dx < x0 + w / 2, wx0 = left ? dx + dw / 2 + 24 : x0 + 24, wx1 = left ? x1 - 30 : dx - dw / 2 - 20, wy = ay + 100, wh = h - (wy - y0) - 90;
  c.fillStyle = o.empty ? '#c9c6b8' : '#f0d9a8'; c.fillRect(wx0, wy, wx1 - wx0, wh); c.save(); c.beginPath(); c.rect(wx0, wy, wx1 - wx0, wh); c.clip();
  for (const tx of [wx0 + (wx1 - wx0) * .28, wx0 + (wx1 - wx0) * .72]) { c.fillStyle = 'rgba(90,58,34,.55)'; c.fillRect(tx - 4, wy + wh - 70, 8, 70); ell(c, tx, wy + wh - 70, 50, 10, 'rgba(90,58,34,.65)'); }
  (o.inside || []).forEach(f => f(wx0, wy, wx1, wh));
  if (o.empty) { const fx = (wx0 + wx1) / 2 + Math.cos((o.t || 0) * 3) * 60, fy = wy + 60 + Math.sin((o.t || 0) * 5) * 20; ell(c, fx, fy, 6, 5, '#2a2f45'); ell(c, fx - 4, fy - 5, 5, 3, 'rgba(255,255,255,.6)'); ell(c, fx + 4, fy - 5, 5, 3, 'rgba(255,255,255,.6)'); }
  c.restore(); c.fillStyle = trim; c.fillRect(wx0 - 8, wy + wh, wx1 - wx0 + 16, 12);
  if (o.plate > 0) scaled(c, (wx0 + wx1) / 2, wy + wh * .45, Math.min(1.1, o.plate), () => { glow(c, (wx0 + wx1) / 2, wy + wh * .45, 140, .4); plate(c, (wx0 + wx1) / 2, wy + wh * .5, 80, o.t || 0); });
  const dop = o.doorOpen || 0, pw = (dw - 20) * (1 - .82 * dop); c.fillStyle = '#3a2416'; c.fillRect(dx - dw / 2, y1 - 210, dw, 210); c.fillStyle = `rgba(255,214,140,${.35 + .6 * dop})`; c.fillRect(dx - dw / 2 + 10, y1 - 200, dw - 20, 200); if (dop > 0) glow(c, dx, y1 - 90, 140, .5 * dop);
  c.fillStyle = mine ? '#6e4a2c' : '#4a4f66'; c.fillRect(dx - dw / 2 + 10, y1 - 200, pw, 200); c.fillStyle = 'rgba(255,214,140,.4)'; c.fillRect(dx - dw / 2 + 10 + pw * .18, y1 - 186, pw * .64, 70); ell(c, dx - dw / 2 + 10 + pw * .85, y1 - 96, 6, 6, GOLD);
  if (o.closed) { c.fillStyle = CREAM; c.beginPath(); c.roundRect(dx - 40, y1 - 170, 80, 34, 6); c.fill(); c.save(); c.font = '700 17px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#c4566a'; c.fillText('ZÁRVA', dx, y1 - 152); c.restore(); }
}
function street(c, t, o = {}) {   // the street: the sky in the caption blue (warming at dawn), a few stars, the pavement
  c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
  if (o.dawn) { const g = c.createLinearGradient(0, 900, 0, 1500); g.addColorStop(0, 'rgba(242,154,102,0)'); g.addColorStop(1, `rgba(242,154,102,${.45 * o.dawn})`); c.fillStyle = g; c.fillRect(-400, 900, 1880, 800); glow(c, 960, 1240, 260, .4 * o.dawn); ell(c, 960, 1300 - 120 * o.dawn, 60, 60, `rgba(255,214,120,${o.dawn})`); }
  for (let i = 0; i < 30; i++) { const sx = -100 + hash(i * 2.3) * 1280, sy = 800 + hash(i * 5.1) * 300, tw = .4 + .6 * Math.abs(Math.sin(t * 1.5 + i)); ell(c, sx, sy, 2.4, 2.4, `rgba(246,239,220,${.45 * tw * (1 - (o.dawn || 0))})`); }
  c.fillStyle = '#1e2864'; for (const [bx, bw, bh] of [[-300, 300, 360], [1060, 300, 420]]) c.fillRect(bx, 1700 - bh, bw, bh);
  c.fillStyle = '#2a3054'; c.fillRect(-400, 1700, 1880, 500); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let r = 0; r < 7; r++) for (let x = -400 + (r % 2) * 40; x < 1480; x += 90) { c.beginPath(); c.roundRect(x, 1716 + r * 34, 80, 26, 8); c.stroke(); }
}
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
function face(c, x, y, r, P, k = 1) {   // a person's face in a gold ring
  if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => { ell(c, x + 4, y + 6, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke();
    c.save(); c.beginPath(); c.arc(x, y, r * .82, 0, 7); c.clip(); drawMascot(c, { ...P, x, y: y + r * 1.7, s: r / 66, f: 0, shadow: false }); c.restore(); });
}

// —— the people ——
const OWNER = o => ({ id: 'owner', skin: 'owner', tache: 1, s: 1.9, smile: .8, ...o });   // the bistro's owner, with his moustache
const FR = [['blue2', 'bun'], ['blue1', null], ['blue3', 'long']];
const friend = (i, o) => ({ id: 'f' + i, skin: FR[i][0], fem: FR[i][1], s: 1.05, smile: .9, ...o });
const MAN = o => ({ id: 'man', skin: 'blue1', cap: 1, s: 1.05, smile: .6, ...o });
const GU = [['blue3', 'bob'], ['blue2', null], ['blue1', 'pony'], ['blue3', null], ['blue2', 'hat']];
const guest = (i, o) => ({ id: 'g' + i, skin: GU[i % 5][0], fem: GU[i % 5][1], s: 1.05, smile: .7, ...o });
const SLOT = [140, 252, 364, 476, 588, 700];   // the queue in front of the bistro's door, in order
const OURS = [20, 1080, 740, 620], RIVAL = [800, 1080, 270, 620];

// —— the shots ——
const SHOT = {
  street(c, t) {   // the owner of a little bistro was tired of people walking past it into the competitor next door: a tidy line of passers-by goes past his door and into the other one; he watches from his window
    const sad = ss(seg(t, HIT.tired - .2, HIT.tired + .5)), rv = E(t, HIT.rival, .3, .5);
    const W = HIT.passers.map(st => ({ st, arr: st + (990 - 60) / 380 })), dop = W.reduce((m, w) => Math.max(m, ss(seg(t, w.arr - .4, w.arr - .1)) * (1 - ss(seg(t, w.arr + .2, w.arr + .5)))), 0);
    stage(c, [0, 820, 1080, 1860], 0, () => { street(c, t);
      restaurant(c, ...OURS, { t, inside: [(a, b, cc, d) => mascot(c, OWNER({ x: a + 200, y: b + d + 60, s: 1.1, f: .4, smile: lerp(.8, 0, sad), sad: .5 * sad, blink: blinkAt(t, 1) }))] });
      restaurant(c, ...RIVAL, { rival: 1, t, doorOpen: dop, inside: [(a, b, cc, d) => { for (let i = 0; i < W.length; i++) if (t > W[i].arr + .3) mascot(c, guest(i, { x: a + 30 + (i % 2) * 60, y: b + d + 30, s: .6, f: -.3, smile: 1 })); }] });
      if (rv > 0) glow(c, 935, 1140, 200, .25 * Math.min(1, rv));
      W.forEach((w, i) => { if (t < w.st) return; const x = Math.min(990, 60 + (t - w.st) * 380), inn = ss(seg(t, w.arr, w.arr + .35)); if (inn >= 1) return; c.save(); c.globalAlpha = Math.min(clamp((t - w.st) / .25), 1 - inn); mascot(c, guest(i, { x, y: 1815, s: 1.05, f: x >= 990 ? 0 : .6, back: x >= 990 ? 1 : 0, walk: x < 990 ? 1 : 0, phi: (x - 60) / 30 })); c.restore(); }); });
  },
  idea(c, t) {   // one day he decided to try something unusual: he chalks a plan on the board: a door, and a few people waiting in front of it
    const th = ss(seg(t, HIT.think - .2, HIT.think + .3)) * (1 - ss(seg(t, HIT.spark - .2, HIT.spark + .1))), sp = E(t, HIT.spark, .3, .5), bd = E(t, HIT.board, .35, .45);
    bg(c);
    stage(c, [80, 900, 1000, 1800], 0, () => {
      mascot(c, OWNER({ x: 300, y: 1790, s: 2.1, f: .35, smile: sp > 0 ? 1 : .5, chin: th > .5 ? 'R' : undefined, look: .2, blink: blinkAt(t, 1), handR: bd > .5 && t > HIT.plan[0] ? [520, 1400 + Math.sin(t * 9) * 10] : undefined }));
      if (sp > 0) { glow(c, 430, 1110, 120, .4 * Math.min(1, sp)); star(c, 430, 1110, 34, sp); spark(c, 430, 1110, t, HIT.spark, 5, 70, 12); }
      chalkboard(c, 740, 1260, 380, 300, bd, () => { c.strokeStyle = 'rgba(246,239,220,.85)'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
        const dk = ss(seg(t, HIT.board + .1, HIT.board + .5)); if (dk > 0) { c.beginPath(); c.moveTo(830, 1380); c.lineTo(830, 1380 - 160 * dk); c.lineTo(880, 1380 - 160 * dk); c.lineTo(880, 1380); c.stroke(); }
        HIT.plan.forEach((pt, i) => { const k = E(t, pt, .3, .5); if (k <= 0) return; const hx = 780 - i * 70; scaled(c, hx, 1330, Math.min(1.1, k), () => { c.beginPath(); c.arc(hx, 1310, 18, 0, 7); c.stroke(); c.beginPath(); c.moveTo(hx, 1328); c.lineTo(hx, 1372); c.moveTo(hx - 18, 1350); c.lineTo(hx + 18, 1350); c.stroke(); }); });
        if (t > HIT.plan[2] + .3) { const k = ss(seg(t, HIT.plan[2] + .3, HIT.plan[2] + .7)); c.strokeStyle = 'rgba(236,189,74,.9)'; c.beginPath(); c.moveTo(620, 1180); c.quadraticCurveTo(700, 1140, 780 * k + 620 * (1 - k), 1180); c.stroke(); } }); });
  },
  call(c, t) {   // he rang a few friends: their faces pop up; his plan in a bubble: tomorrow, gather in front of the bistro, pretend to wait for it to open; the friends agreed: thumbs up
    const ph = ss(seg(t, HIT.phone - .2, HIT.phone + .2)), pb = E(t, HIT.planB, .35, .45), gk = E(t, HIT.gather, .3, .5), wk = E(t, HIT.wait, .3, .5), out = ss(seg(t, HIT.agree[0] - .4, HIT.agree[0] - .1));
    bg(c);
    stage(c, [60, 880, 1020, 1800], 0, () => {
      mascot(c, OWNER({ x: 230, y: 1790, s: 1.9, f: .35, smile: 1, blink: blinkAt(t, 1), handR: ph > 0 ? reach([300, 1600], [295, 1430], ph) : undefined }));
      if (ph > 0) { phone(c, 295, 1440, .9 * ph, -.3); if (t < HIT.friends[2] + .4) ringWaves(c, 330, 1400, 60, t); }
      HIT.friends.forEach((ft, i) => { const k = E(t, ft, .35, .45); face(c, 870, 1070 + i * 200, 74, friend(i, { smile: 1, blink: blinkAt(t, 5 + i), o: t < HIT.planB ? .3 : 0 }), k); badge(c, 'thumb', 950, 1020 + i * 200, 28, E(t, HIT.agree[i], .3, .5)); });
      if (pb > 0 && out < 1) bubble(c, 520, 1150, 420, 280, pb * (1 - out), 340, 1400, () => {
        c.save(); c.beginPath(); c.roundRect(320, 1020, 400, 260, 40); c.clip(); c.fillStyle = '#2a3054'; c.fillRect(320, 1210, 400, 80);
        c.fillStyle = '#e9dcc0'; c.fillRect(470, 1060, 200, 150); c.fillStyle = '#c4566a'; c.fillRect(470, 1060, 200, 18); c.fillStyle = '#3a2416'; c.fillRect(620, 1130, 40, 80);
        c.fillStyle = CREAM; c.beginPath(); c.roundRect(340, 1040, 90, 70, 8); c.fill(); c.fillStyle = '#c4566a'; c.fillRect(340, 1040, 90, 18); c.save(); c.font = '700 30px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText('+1', 385, 1086); c.restore();
        [0, 1, 2].forEach(i => { const k = Math.min(1, gk * 3 - i); if (k > 0) scaled(c, 590 - i * 50, 1210, k, () => headIcon(c, 590 - i * 50, 1170, 14, ['#3b5bd1', '#2f4bb0', '#5d7fc4'][i])); });
        if (wk > 0) scaled(c, 400, 1170, Math.min(1, wk), () => clockIcon(c, 400, 1170, 34, t * 3)); c.restore(); }); });
  },
  morning(c, t) {   // next morning a few people were already standing in front of the bistro, chatting: the sun comes up, the friends stand in the queue, little chat bubbles pass between them
    const dawn = ss(seg(t, 24.1, 25.6)), st = E(t, HIT.stand, .35, .45);
    stage(c, [-20, 820, 1100, 1860], 0, () => { street(c, t, { dawn });
      restaurant(c, ...OURS, { t, closed: 1 }); restaurant(c, ...RIVAL, { rival: 1, t });
      [0, 1, 2].forEach(i => { const k = Math.min(1, st * 3 - i * .6); if (k <= 0) return; c.save(); c.globalAlpha = clamp(k * 2); mascot(c, friend(i, { x: SLOT[i], y: 1815, f: i === 1 ? -.5 : .5, smile: 1, blink: blinkAt(t, 5 + i), squash: t > HIT.chat ? .02 * Math.sin(t * 9 + i * 2) : 0 })); c.restore(); });
      HIT.chats.forEach((ct, i) => { const k = E(t, ct, .3, .5) * (1 - ss(seg(t, ct + 1.0, ct + 1.3))); if (k <= 0) return; const x = [196, 308, 196][i], y = 1470; bubble(c, x, y, 90, 60, k, x + (i % 2 ? 30 : -30), y + 55, () => { for (let d = 0; d < 3; d++) ell(c, x - 22 + d * 22, y, 6, 6, NAVY); }); }); });
  },
  man(c, t) {   // a man came walking down the street; two restaurants side by side: one almost empty, a fly circling inside; in front of the other, several people waiting
    const [a, b] = HIT.manWalk, u = seg(t, a, b), mx = lerp(1060, 760, ss(u)), em = E(t, HIT.empty, .3, .5), qg = ss(seg(t, HIT.queueGlow - .2, HIT.queueGlow + .4));
    stage(c, [-20, 820, 1100, 1860], 0, () => { street(c, t, { dawn: 1 });
      restaurant(c, ...OURS, { t, closed: 1 }); restaurant(c, ...RIVAL, { rival: 1, t, empty: em > 0 ? 1 : 0 });
      if (em > 0) { c.save(); c.globalAlpha = .6 * Math.min(1, em); c.fillStyle = '#0b1438'; c.fillRect(0, 0, 0, 0); c.restore(); }
      if (qg > 0) { glow(c, 250, 1650, 300, .3 * qg); }
      [0, 1, 2].forEach(i => mascot(c, friend(i, { x: SLOT[i], y: 1815, f: i === 1 ? -.5 : .5, smile: 1, blink: blinkAt(t, 5 + i), squash: .02 * Math.sin(t * 9 + i * 2) })));
      c.save(); c.globalAlpha = clamp((t - a + .1) / .3); mascot(c, MAN({ x: mx, y: 1815, f: -.6, walk: u > 0 && u < 1 ? 1 : 0, phi: u * (b - a) * 7, blink: blinkAt(t, 2) })); c.restore(); });
  },
  decide(c, t) {   // he stopped for a moment: looks at the empty one, looks at the busy one, and goes to the busy one: he joins the end of the queue
    const lookR = ss(seg(t, HIT.look[0], HIT.look[0] + .3)) * (1 - ss(seg(t, HIT.look[1], HIT.look[1] + .3))), go = seg(t, ...HIT.go), mx = lerp(760, SLOT[3], ss(go)), q1 = E(t, HIT.look[0] + .1, .3, .5) * (1 - ss(seg(t, HIT.look[1], HIT.look[1] + .2))), q2 = E(t, HIT.look[1] + .1, .3, .5) * (1 - ss(seg(t, HIT.go[0], HIT.go[0] + .3)));
    stage(c, [-20, 820, 1100, 1860], 0, () => { street(c, t, { dawn: 1 });
      restaurant(c, ...OURS, { t, closed: 1 }); restaurant(c, ...RIVAL, { rival: 1, t, empty: 1 });
      [0, 1, 2].forEach(i => mascot(c, friend(i, { x: SLOT[i], y: 1815, f: i === 1 ? -.5 : .5, smile: 1, blink: blinkAt(t, 5 + i), squash: .02 * Math.sin(t * 9 + i * 2) })));
      mascot(c, MAN({ x: mx, y: 1815, f: go > 0 ? -.6 : lerp(-.3, .6, lookR), walk: go > 0 && go < 1 ? 1 : 0, phi: go * 8, smile: go > 0 ? .9 : .5, blink: blinkAt(t, 2) }));
      if (q1 > 0) badge(c, 'q', 900, 1460, 30, q1); if (q2 > 0) badge(c, 'ok', 252, 1450, 30, q2); });
  },
  more(c, t) {   // a few minutes later more guests did the same: they walk up and join the queue, one after another
    stage(c, [-20, 820, 1100, 1860], 0, () => { street(c, t, { dawn: 1 });
      restaurant(c, ...OURS, { t, closed: 1 }); restaurant(c, ...RIVAL, { rival: 1, t, empty: 1 });
      [0, 1, 2].forEach(i => mascot(c, friend(i, { x: SLOT[i], y: 1815, f: i === 1 ? -.5 : .5, smile: 1, blink: blinkAt(t, 5 + i), squash: .02 * Math.sin(t * 9 + i * 2) })));
      mascot(c, MAN({ x: SLOT[3], y: 1815, f: -.3, smile: .9, blink: blinkAt(t, 2) }));
      HIT.joiners.forEach((jt, i) => { const tx = SLOT[4 + i], from = 1060, u = seg(t, jt, jt + 1.3); if (u <= 0) return; const x = lerp(from, tx, ss(u)); c.save(); c.globalAlpha = clamp(u / .2); mascot(c, guest(i, { x, y: 1815, f: u < 1 ? -.6 : -.3, walk: u < 1 ? 1 : 0, phi: u * 9, smile: .8, blink: blinkAt(t, 7 + i) })); c.restore(); }); });
  },
  owner(c, t) {   // the owner watched happily from behind the counter the queue he had made himself: inside, the counter; through the window, the line outside
    const hp = E(t, HIT.happy, .35, .45), sp = E(t, HIT.wink, .3, .5);
    stage(c, [60, 880, 1020, 1800], 0, () => { c.fillStyle = TOP; c.fillRect(-800, -600, 2680, 3000);
      c.fillStyle = '#f2b68a'; c.fillRect(140, 1020, 800, 380); glow(c, 540, 1210, 380, .3); c.save(); c.beginPath(); c.rect(140, 1020, 800, 380); c.clip(); c.fillStyle = '#2a3054'; c.fillRect(140, 1340, 800, 60);
        [[260, 0], [380, 1], [500, 2], [620, 'man'], [740, 'g0'], [860, 'g1']].forEach(([x, w]) => mascot(c, (w === 'man' ? MAN : w === 'g0' ? (o => guest(0, o)) : w === 'g1' ? (o => guest(1, o)) : (o => friend(w, o)))({ x, y: 1380, s: .9, f: -.4, smile: 1, blink: blinkAt(t, x) }))); c.restore();
      c.fillStyle = WOOD; c.fillRect(130, 1010, 820, 16); c.fillRect(130, 1396, 820, 16); c.fillRect(532, 1010, 16, 400);
      mascot(c, OWNER({ x: 540, y: 1790, s: 2.0, f: 0, back: hp > 0 ? 0 : 1, smile: 1, blink: sp > 0 && t < HIT.wink + .3 ? 1 : blinkAt(t, 1) }));
      c.fillStyle = '#6e4a2c'; c.fillRect(60, 1600, 960, 200); c.fillStyle = WOOD; c.fillRect(50, 1580, 980, 30); for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(140 + k * 240, 1640, 8, 140); }
      ell(c, 250, 1576, 40, 10, '#8f98b0'); c.fillStyle = CREAM; c.fillRect(800, 1520, 60, 60); c.strokeStyle = CREAM; c.lineWidth = 8; c.beginPath(); c.arc(866, 1550, 16, -1.3, 1.3); c.stroke();
      if (hp > 0) for (let k = 0; k < 3; k++) heart(c, 400 + k * 140, 1180 - 40 * clamp((t - HIT.happy - k * .15) / 1.3), 20, Math.max(0, Math.sin(clamp((t - HIT.happy - k * .15) / 1.3) * Math.PI)), '#c4566a');
      if (sp > 0) spark(c, 650, 1330, t, HIT.wink, 5, 90, 14); });
  },
  nobody(c, t) {   // but none of the guests knew why those people were really standing there: the queue up close; a question over each guest; then a spotlight picks out the friends, gold rings
    const qk = E(t, HIT.qs, .3, .5), rv = ss(seg(t, HIT.reveal - .2, HIT.reveal + .4));
    stage(c, [-20, 1180, 1100, 1860], 0, () => { street(c, t, { dawn: 1 }); restaurant(c, ...OURS, { t, closed: 1 }); restaurant(c, ...RIVAL, { rival: 1, t, empty: 1 });
      if (rv > 0) { c.fillStyle = `rgba(11,20,56,${.45 * rv})`; c.fillRect(-400, 700, 1880, 1400); }
      const ppl = [[SLOT[0], o => friend(0, o), 1], [SLOT[1], o => friend(1, o), 1], [SLOT[2], o => friend(2, o), 1], [SLOT[3], MAN, 0], [SLOT[4], o => guest(0, o), 0], [SLOT[5], o => guest(1, o), 0]];
      ppl.forEach(([x, P, isF], i) => { if (isF && rv > 0) { glow(c, x, 1700, 120, .45 * rv); c.save(); c.strokeStyle = GOLD; c.lineWidth = 6; c.globalAlpha = rv; c.beginPath(); c.ellipse(x, 1818, 70, 18, 0, 0, 7); c.stroke(); c.restore(); } mascot(c, P({ x, y: 1815, f: isF ? (i === 1 ? -.5 : .5) : -.3, smile: isF ? 1 : .6, look: isF ? 0 : -.4, blink: blinkAt(t, i + 3) })); if (!isF) badge(c, 'q', x, 1500, 26, qk * (1 - .5 * rv)); }); });
  },
  think(c, t) {   // they simply assumed the food here must be so good it's even worth the wait: five stars on the bistro's sign, a steaming plate in its window; a clock and a check: worth waiting for
    const sk = ss(seg(t, HIT.stars - .1, HIT.stars + .7)), pk = E(t, HIT.plate, .35, .45), wk = E(t, HIT.worth, .3, .5);
    stage(c, [0, 860, 780, 1860], 0, () => { street(c, t, { dawn: 1 }); restaurant(c, ...OURS, { t, closed: 1, stars: sk, plate: pk });
      [0, 1, 2, 3].forEach(i => mascot(c, (i < 3 ? (o => friend(i, o)) : MAN)({ x: SLOT[i], y: 1815, f: -.4, smile: 1, blink: blinkAt(t, i + 3) })));
      if (wk > 0) { clockIcon(c, 640, 1500, 46 * Math.min(1.1, wk), t * 2); badge(c, 'ok', 695, 1460, 24, wk); } });
  },
  why(c, t) {   // but why did this happen?: little people pop up one by one along the shape of a big question mark
    const [a, b] = HIT.qform, dot = E(t, b + .1, .3, .5);
    bg(c);
    stage(c, [180, 860, 900, 1780], 0, () => { const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12, an = Math.PI * (1.05 + 1.45 * u); pts.push([540 + Math.cos(an) * 150, 1120 + Math.sin(an) * 150]); } pts.push([540, 1330], [540, 1410]);
      pts.forEach(([x, y], i) => { const k = E(t, a + i * (b - a) / pts.length, .3, .5); if (k > 0) scaled(c, x, y + 22, Math.min(1.1, k), () => headIcon(c, x, y, 20, i % 3 ? '#3b5bd1' : '#5d7fc4')); });
      if (dot > 0) scaled(c, 540, 1560, Math.min(1.1, dot), () => headIcon(c, 540, 1530, 26, GOLD)); });
  },
  social(c, t) {   // because we sometimes decide by what others do: a crowd walks toward one door; one person watches, then follows; when many choose something, we think it must be good: the count climbs, a check
    const cr = HIT.crowd, fol = seg(t, HIT.follow, HIT.follow + 1.4), cnt = ss(seg(t, HIT.count - .2, HIT.count + 1.2)), ok = E(t, HIT.good, .3, .5);
    bg(c);
    stage(c, [40, 880, 1040, 1800], 0, () => {
      for (const [dx, lab, n] of [[270, 'A', cnt], [810, 'B', 0]]) { c.fillStyle = '#3a2416'; c.fillRect(dx - 70, 1500, 140, 240); c.fillStyle = `rgba(255,214,140,${dx < 500 ? .6 : .25})`; c.fillRect(dx - 58, 1512, 116, 228); text(c, lab, dx, 1450, 60, CREAM);
        c.fillStyle = 'rgba(246,239,220,.15)'; c.fillRect(dx - 110, 1000, 220, 26); c.fillStyle = GOLD; c.fillRect(dx - 110, 1000, 220 * (dx < 500 ? .2 + .8 * n : .08), 26); }
      for (let i = 0; i < 6; i++) { const st = cr + i * .25, u = seg(t, st, st + 1.4); if (u <= 0) continue; const x0 = 540 + (i % 2 ? 1 : -1) * 60 + (i - 3) * 30, x = lerp(x0, 270 + (i - 2.5) * 22, ss(u)), y = lerp(1800, 1740, ss(u)); c.save(); c.globalAlpha = Math.min(clamp(u / .2), 1 - ss(seg(u, .85, 1))); mascot(c, guest(i, { x, y, s: .95, f: -.6, walk: u < 1 ? 1 : 0, phi: u * 9 })); c.restore(); }
      const fx = lerp(540, 300, ss(fol)); mascot(c, MAN({ x: fx, y: 1800, s: 1.3, f: fol > 0 ? -.6 : -.3, walk: fol > 0 && fol < 1 ? 1 : 0, phi: fol * 9, smile: ok > 0 ? 1 : .6, look: -.3, blink: blinkAt(t, 2) }));
      if (ok > 0) { badge(c, 'ok', 270, 1300, 44, ok); spark(c, 270, 1300, t, HIT.good, 5, 90, 14); } });
  },
  final(c, t) {   // in marketing, people often look at how many chose a product before they even try it: two products on a shelf; one shows how many chose it, the other almost none; a hand picks the popular one
    const pk = E(t, HIT.products, .35, .45), ck = ss(seg(t, HIT.howMany - .2, HIT.howMany + .9)), pick = ss(seg(t, ...HIT.pick));
    bg(c);
    stage(c, [80, 900, 1000, 1800], 0, () => { c.fillStyle = WOOD; c.fillRect(140, 1560, 800, 26); c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(140, 1586, 800, 12);
      [[340, 1, 0], [740, 0, 1]].forEach(([x, popular, i]) => { const y = 1560 - (popular ? pick * 140 : 0), xx = x + (popular ? pick * 60 : 0); scaled(c, xx, y, Math.min(1, pk), () => {
        c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(xx - 88, y - 230, 186, 236, 16); c.fill(); c.fillStyle = popular ? '#26346f' : '#3a4270'; c.beginPath(); c.roundRect(xx - 94, y - 236, 188, 236, 16); c.fill(); c.fillStyle = GOLD; c.fillRect(xx - 94, y - 160, 188, 22); heart(c, xx, y - 80, 36, 1, popular ? GOLD : '#8f98b0');
        const n = popular ? Math.round(2340 * ck) : Math.round(3 * ck), lab = (popular ? n.toLocaleString('hu-HU') : String(n)); c.fillStyle = CREAM; c.beginPath(); c.roundRect(xx - 90, y - 330, 180, 70, 35); c.fill(); headIcon(c, xx - 52, y - 307, 12, '#3b5bd1'); c.save(); c.font = '700 32px "Montserrat"'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(lab, xx - 30, y - 294); c.restore();
        if (popular && ck > .5) star5(c, xx, y - 370, 14, Math.min(1, (ck - .5) * 2), 34); }); });
      if (pick > 0) glow(c, 400, 1400, 220, .35 * pick); if (pick >= 1) spark(c, 400, 1300, t, HIT.pick[1], 6, 170, 16); });
  },
};

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['belefáradt','elsétáltak','konkurenciához','szokatlant','barátját','várnának','beleegyeztek','beszélgettek','férfi','üres','várakoztak','forgalmasabb','ugyanezt','boldogan','sort','legérdekesebb','miért','biztosan','megéri','viselkedése','sokan','ösztönösen','hányan','kipróbálnák']);
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
