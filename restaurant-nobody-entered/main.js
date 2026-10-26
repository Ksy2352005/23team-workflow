// The Restaurant Nobody Entered — a 23 Team reel in 2D, drawn frame by frame from render(t)
import { lerp, seg, ss, hash } from '/core/lib.js';
import { drawMascot, cup, plate, BASE_H } from './char2d.js';
import * as SET from './sets.js';
import { DUR, HIT, DISSOLVES, sceneAt, TABLES, ROWS, seatPos, CARS, CAR_V } from './story.js';

await Promise.all(['74px "Lilita One"', '30px "Fredoka"'].map(f => document.fonts.load(f, 'RESTAURANTÉÜÁÚ')));
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const [buf, bctx] = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; })();
const cache = {}; const get = (k, f) => cache[k] || (cache[k] = f());
const GLOW = SET.glowSprite();
const { IN, EX, HOME, KIT } = SET;

function camera(c, cam) { const z = cam[2] * K; c.setTransform(z, 0, 0, z, W / 2 - cam[0] * z, H / 2 - cam[1] * z); }
function glow(c, x, y, r, a = 1) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(GLOW, x - r, y - r, 2 * r, 2 * r); c.restore(); }
const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, s]) => g.addColorStop(o, s)); return g; };

// —— furniture and props ——
function table(c, x, y, s, lamps, low) {
  const h = BASE_H * s, top = y - .5 * h;
  c.fillStyle = 'rgba(5,6,25,.28)'; c.beginPath(); c.ellipse(x, y, .45 * h, .07 * h, 0, 0, 7); c.fill();
  c.fillStyle = '#1d1f2b'; c.beginPath(); c.ellipse(x, y - .01 * h, .16 * h, .035 * h, 0, 0, 7); c.fill(); c.fillRect(x - .025 * h, top, .05 * h, .5 * h);
  c.fillStyle = '#7a4a24'; c.beginPath(); c.ellipse(x, top + .025 * h, .5 * h, .1 * h, 0, 0, 7); c.fill();
  c.fillStyle = lin(c, x - .5 * h, top, x + .5 * h, top, [[0, '#c48a4e'], [.5, '#e0a866'], [1, '#b47a40']]); c.beginPath(); c.ellipse(x, top, .5 * h, .095 * h, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,230,180,.25)'; c.beginPath(); c.ellipse(x - .1 * h, top - .02 * h, .25 * h, .03 * h, 0, 0, 7); c.fill();
  const ch = (low ? .05 : .08) * h; c.fillStyle = 'rgba(240,230,210,.7)'; c.fillRect(x - .025 * h, top - ch - .01 * h, .05 * h, ch);
  if (lamps > .5) { c.fillStyle = '#ffd27a'; c.beginPath(); c.ellipse(x, top - ch - .03 * h, .01 * h, .022 * h, 0, 0, 7); c.fill(); glow(c, x, top - ch - .03 * h, .18 * h, .55); }
}
function chair(c, x, y, s, faceRight) {
  const h = BASE_H * s, back = faceRight ? -1 : 1, seat = y - .3 * h;
  c.strokeStyle = '#8a552a'; c.lineCap = 'round'; c.lineWidth = .028 * h;
  for (const dx of [-.12, .12]) { c.beginPath(); c.moveTo(x + dx * h, seat); c.lineTo(x + dx * h * 1.1, y); c.stroke(); }
  c.beginPath(); c.moveTo(x + back * .13 * h, seat); c.lineTo(x + back * .15 * h, seat - .4 * h); c.stroke();
  c.beginPath(); c.arc(x + back * .1 * h, seat - .4 * h, .06 * h, Math.PI, 0); c.stroke();
  c.fillStyle = '#6b3f1d'; c.beginPath(); c.ellipse(x, seat + .01 * h, .17 * h, .05 * h, 0, 0, 7); c.fill();
  c.fillStyle = lin(c, x, seat - .04 * h, x, seat + .03 * h, [[0, '#2f45a8'], [1, '#1b2a70']]); c.beginPath(); c.ellipse(x, seat - .012 * h, .16 * h, .045 * h, 0, 0, 7); c.fill();
}
function jar(c, x, y, s, level) {   // a glass jar of coins, y = the surface it stands on
  const w = 46 * s, h = 80 * s;
  c.save(); c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 10 * s); c.clip();
  const lh = h * level; c.fillStyle = '#d9a83e'; c.fillRect(x - w / 2, y - lh, w, lh);
  for (let i = 0; i < 40 * level; i++) { const cx = x - w / 2 + hash(i * 3.3) * w, cy = y - hash(i * 7.1) * lh; c.fillStyle = hash(i) > .5 ? '#f2cf6a' : '#c8952e'; c.beginPath(); c.ellipse(cx, cy, 8 * s, 4 * s, hash(i * 2) * 3, 0, 7); c.fill(); }
  c.restore();
  c.strokeStyle = 'rgba(220,235,255,.7)'; c.lineWidth = 3 * s; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h, 10 * s); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - w / 2 + 6 * s, y - h + 10 * s, 6 * s, h - 24 * s);
  c.fillStyle = '#8a6a3a'; c.fillRect(x - w / 2 - 3 * s, y - h - 6 * s, w + 6 * s, 9 * s);
}
function item(c, it, t) {
  if (it.k === 'plate') plate(c, it.x, it.y, it.s, true, it.steam || 0, t);
  else if (it.k === 'cup') cup(c, it.x, it.y, it.s);
  else if (it.k === 'jar') jar(c, it.x, it.y, it.s || 1, it.level);
  else if (it.k === 'cloth') { c.fillStyle = '#f7f5ee'; c.beginPath(); c.ellipse(it.x, it.y, 20, 7, .15, 0, 7); c.fill(); c.fillStyle = 'rgba(200,190,170,.6)'; c.beginPath(); c.ellipse(it.x + 4, it.y + 1, 12, 3, .15, 0, 7); c.fill(); }
  else if (it.k === 'menu') { c.fillStyle = '#7a2e2e'; c.beginPath(); c.ellipse(it.x, it.y, 22, 6, 0, 0, 7); c.fill(); c.fillStyle = '#f2e6c8'; c.beginPath(); c.ellipse(it.x, it.y - 2, 18, 4, 0, 0, 7); c.fill(); }
  else if (it.k === 'tray') { const h = it.s; for (let i = 0; i < it.plates; i++) plate(c, it.x + (i ? 1 : -1) * .1 * h, it.y - 4, h * .55, true, 1, t);
    c.fillStyle = '#c9ccd6'; c.beginPath(); c.ellipse(it.x, it.y + 2, .24 * h, .035 * h, 0, 0, 7); c.fill(); c.fillStyle = '#eef0f6'; c.beginPath(); c.ellipse(it.x, it.y, .23 * h, .025 * h, 0, 0, 7); c.fill(); }
}
function bubble(c, p) {   // a "!" pops over a head
  const h = BASE_H * (p.s || 1), b = p.bang, x = p.x, y = p.y - 1.12 * h - (p.sit ? .13 * h : 0), r = .14 * h * (b < .3 ? b / .3 * 1.15 : 1);
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - r * .3, y + r * .8); c.lineTo(x - r * .1, y + r * 1.35); c.lineTo(x + r * .25, y + r * .85); c.fill();
  c.fillStyle = '#e8573a'; c.font = `${Math.round(r * 1.5)}px "Lilita One"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', x, y + r * .08);
}
function drawChar(c, p, t) {
  if (p.vis === false) return;
  c.save(); if (p.alpha !== undefined) c.globalAlpha = p.alpha;
  drawMascot(c, { ...p, alpha: undefined });
  if (p.cupAt) cup(c, p.cupAt[0], p.cupAt[1] + 4, BASE_H * p.s * .2);
  if (p.coinAt) { c.fillStyle = '#f2cf6a'; c.beginPath(); c.ellipse(p.coinAt[0], p.coinAt[1] + 6, 8, 6, 0, 0, 7); c.fill(); c.strokeStyle = '#b8902e'; c.lineWidth = 2; c.stroke(); }
  if (p.clothAt) { c.fillStyle = '#f7f5ee'; c.beginPath(); c.ellipse(p.clothAt[0], p.clothAt[1] + 6, 16, 9, .3, 0, 7); c.fill(); }
  if (p.hold === 'tray' && p.trayItems && p.trayItems.length) { const h = BASE_H * p.s, ty = p.y - .25 * h; p.trayItems.forEach((k, i, a) => plate(c, p.x + (i - (a.length - 1) / 2) * .17 * h, ty - .06 * h, h * .55, true, 1, t)); }
  c.restore();
  if (p.bang > 0) bubble(c, p);
}
// a tear-off wall calendar: month header and a big day number; the top page can be torn away
function calendar(c, x, y, w, h, num, tear = 0, month = 'OKT') {
  c.fillStyle = 'rgba(0,0,20,.25)'; c.fillRect(x + 5, y + 6, w, h);
  const page = (n, dx = 0, dy = 0, rot = 0) => { c.save(); c.translate(x + dx + w / 2, y + dy + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2);
    c.fillStyle = '#fbf7ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#c0392b'; c.fillRect(0, 0, w, h * .26);
    c.fillStyle = '#fff'; c.font = `${Math.round(h * .17)}px "Lilita One"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(month, w / 2, h * .13);
    c.fillStyle = '#1c2450'; c.font = `${Math.round(h * .55)}px "Lilita One"`; c.fillText(String(n), w / 2, h * .63); c.restore(); };
  page(num);
  if (tear > 0 && tear < 1) page(num - 1, tear * w * .6, tear * tear * h * 2.2, tear * .9);
  else if (tear === 0) {}
  c.fillStyle = '#2a2a33'; c.fillRect(x + w * .2, y - 6, w * .6, 10);
}
function wallClock(c, x, y, r, hours) {
  c.fillStyle = '#c9a04a'; c.beginPath(); c.arc(x, y, r + 6, 0, 7); c.fill(); c.fillStyle = '#fbf7ee'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = '#1c2450'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillRect(x + Math.sin(a) * r * .8 - 2, y - Math.cos(a) * r * .8 - 2, 4, 4); }
  const hand = (a, l, wd) => { c.lineWidth = wd; c.strokeStyle = '#1c2450'; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a) * l, y - Math.cos(a) * l); c.stroke(); };
  hand(hours / 12 * Math.PI * 2, r * .5, 5); hand((hours % 1) * Math.PI * 2, r * .75, 3);
}

// —— the interior ——
function drawRoom(c, look, S, t) {
  c.drawImage(get('o' + look, () => SET.interiorOutside(look)), 0, 0);
  for (const p of S.outside || []) { c.save(); c.globalAlpha = (p.dim ?? 1) * (p.alpha ?? 1); drawMascot(c, { ...p, alpha: undefined }); c.restore(); }
  if (S.rain) { c.save(); c.strokeStyle = 'rgba(180,200,255,.38)'; c.lineWidth = 2;
    for (let i = 0; i < 160; i++) { const x = 100 + hash(i) * 1150, sp = 1100 + hash(i + 50) * 400, y = 520 + ((hash(i + 9) * 900 + t * sp) % 900); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 34); c.stroke(); } c.restore(); }
  c.drawImage(get('w' + look, () => SET.interiorWall(look)), 0, 0);
}
function drawInterior(c, S, t) {
  const d = IN.door, w = IN.win;
  drawRoom(c, S.look, S, t);
  if (S.blend) { c.save(); c.globalAlpha = S.blend.u; drawRoom(c, S.blend.to, { ...S, outside: [] }, t); c.restore(); }
  c.save(); SET.winPath(c, w, 14); c.clip();
  c.fillStyle = lin(c, w.x0, w.spring - w.r, w.x1, w.sill, [[0, 'rgba(200,220,255,.10)'], [.45, 'rgba(200,220,255,.02)'], [.5, 'rgba(200,220,255,.08)'], [1, 'rgba(200,220,255,.0)']]); c.fillRect(w.x0, w.spring - w.r, w.x1 - w.x0, w.sill);
  if (S.drops) for (let i = 0; i < 70 * S.drops; i++) { const x = w.x0 + 20 + hash(i * 3.1) * (w.x1 - w.x0 - 40), sp = hash(i * 7.7) > .75 ? 60 : 6, y = w.spring - 180 + ((hash(i * 1.3) * 560 + t * sp) % 560), r = 2.5 + hash(i) * 4;
    c.fillStyle = 'rgba(190,210,255,.45)'; c.beginPath(); c.ellipse(x, y, r * .8, r, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x - r * .3, y - r * .3, r * .3, 0, 7); c.fill(); }
  c.restore();
  // the door: hinged on its right, swinging into the room; a ZÁRVA / NYITVA plaque on its glass
  { const op = S.door || 0, th = op * 1.3, dw = d.x1 - d.x0, fx = d.x1 - dw * Math.cos(th), grow = Math.sin(th) * 46;
    if (op > .01) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(120,140,220,${.1 * op})`; c.beginPath(); c.moveTo(d.x0, d.y1); c.lineTo(d.x1, d.y1); c.lineTo(d.x1 + 220 * op, 1900); c.lineTo(d.x0 + 60 * op, 1900); c.fill(); c.restore(); }
    c.fillStyle = lin(c, fx, 0, d.x1, 0, [[0, '#2a3a86'], [1, '#17255c']]); c.beginPath(); c.moveTo(d.x1, d.y0); c.lineTo(d.x1, d.y1); c.lineTo(fx, d.y1 + grow); c.lineTo(fx, d.y0 - grow); c.closePath(); c.fill();
    const gx0 = lerp(d.x1, fx, .2), gx1 = lerp(d.x1, fx, .8), gy0 = d.y0 + 50, gy1 = d.y0 + 200, gg = grow * .6;
    c.fillStyle = S.look === 'morning' ? 'rgba(190,210,255,.85)' : 'rgba(255,190,110,.35)'; c.beginPath(); c.moveTo(gx0, gy0 - gg * .2); c.lineTo(gx1, gy0 - gg * .8); c.lineTo(gx1, gy1 + gg * .8 - 40); c.lineTo(gx0, gy1 + gg * .2 - 40); c.fill();
    const px = lerp(d.x1, fx, .5), py = d.y0 + 365, pw = Math.abs(gx1 - gx0) * .9, flip = S.plaque ?? 0, sx = Math.cos(flip * Math.PI);
    if (pw > 20) { c.save(); c.translate(px, py); c.strokeStyle = '#5a3a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-pw * .3, -30); c.lineTo(0, -46); c.lineTo(pw * .3, -30); c.stroke(); c.scale(sx, 1);
      c.fillStyle = '#f2e6c8'; c.beginPath(); c.roundRect(-pw * .42, -30, pw * .84, 34, 5); c.fill(); c.scale(Math.sign(sx) || 1, 1);
      c.fillStyle = flip > .5 ? '#2f7a4b' : '#a83a2a'; c.font = `${Math.min(22, pw * .17)}px "Lilita One"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(flip > .5 ? 'NYITVA' : 'ZÁRVA', 0, -12); c.restore(); }
    c.fillStyle = '#c9a04a'; c.beginPath(); c.arc(lerp(d.x1, fx, .85), 1250, 8 + grow * .08, 0, 7); c.fill(); }
  { let a = 0; const dt = t - HIT.bell1 + .05; if (dt > 0 && dt < 3) a += Math.sin(dt * 16) * Math.exp(-dt * 2.6) * .55;
    c.save(); c.translate(d.x1 - 26, d.y0 - 34); c.fillStyle = '#c9a04a'; c.fillRect(-14, -6, 28, 6); c.rotate(a); c.fillRect(-2, 0, 4, 12); c.beginPath(); c.moveTo(-12, 30); c.quadraticCurveTo(-12, 10, 0, 10); c.quadraticCurveTo(12, 10, 12, 30); c.closePath(); c.fill(); c.beginPath(); c.arc(0, 32, 4, 0, 7); c.fill(); c.restore(); }
  calendar(c, 22, 600, 92, 120, S.calendar ?? 2, S.tear ?? 0);
  wallClock(c, 1345, 460, 52, S.clock ?? 18.5);
  const lamps = S.lamps ?? 1;
  for (const [px, py] of IN.pendants) { c.fillStyle = lin(c, px, py - 24, px, py + 30, [[0, '#fff3d6'], [1, '#ffc46e']]); c.globalAlpha = .6 + .4 * Math.min(1, lamps); c.beginPath(); c.arc(px, py, 30, 0, 7); c.fill(); c.globalAlpha = 1; glow(c, px, py, 260 * lamps, .75 * lamps); }
  const items = [];
  items.push({ y: 1432, f: () => SET.counter(c) });
  for (const [id, [tx, r]] of Object.entries(TABLES)) {
    const [ty, ts] = ROWS[r];
    items.push({ y: ty, f: () => table(c, tx, ty, ts, lamps, S.candleLow) });
    for (let i = 0; i < 2; i++) { let [sx, sy] = seatPos(id, i);
      if (id === 'A' && i === 0) sx -= S.pullA0 || 0;
      items.push({ y: sy - 2, f: () => chair(c, sx, ty, ts, i === 0) }); }
  }
  const lifted = new Set(S.chars.filter(p => p.cupAt).map(p => p.id));
  for (const it of S.items || []) if (!(it.k === 'cup' && lifted.has(it.of))) items.push({ y: it.d ?? it.y, f: () => item(c, it, t) });
  for (const p of S.chars) if (p.vis !== false) items.push({ y: p.sit ? p.y - .5 : p.y, f: () => drawChar(c, p, t) });
  items.sort((a, b) => a.y - b.y).forEach(it => it.f());
}

// —— the flat: desk with the savings jar, the bed ——
const MONTHS = ['JAN', 'FEB', 'MÁR', 'ÁPR', 'MÁJ', 'JÚN', 'JÚL'];
function drawHome(c, S, t) {
  c.drawImage(get('h' + S.look, () => SET.homeSet(S.look)), 0, 0);
  const mi = Math.min(MONTHS.length - 1, Math.floor(S.month ?? 0));
  calendar(c, 690, 900, 88, 112, 1, 0, MONTHS[mi]);
  if (S.look === 'night') glow(c, 296, 1280, 330, .8);
  jar(c, HOME.jar[0], HOME.jar[1] - 6, 1.1, S.jar ?? .3);
  // the alarm clock, shaking when it rings
  { const [ax, ay] = HOME.clock, ring = S.ring || 0, sh = ring ? Math.sin(t * 90) * 3 : 0;
    c.fillStyle = '#6b4526'; c.fillRect(ax - 50, ay, 100, 12); c.fillRect(ax - 44, ay + 12, 8, 20); c.fillRect(ax + 36, ay + 12, 8, 20);
    c.save(); c.translate(ax + sh, ay); c.fillStyle = '#c0392b'; c.beginPath(); c.arc(0, -34, 30, 0, 7); c.fill(); c.fillStyle = '#fbf7ee'; c.beginPath(); c.arc(0, -34, 22, 0, 7); c.fill();
    c.strokeStyle = '#1c2450'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -34); c.lineTo(0, -50); c.moveTo(0, -34); c.lineTo(10, -34); c.stroke();
    c.fillStyle = '#c0392b'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 20, -62, 10, 0, 7); c.fill(); c.fillRect(s * 16 - 3, -4, 6, 8); } c.restore();
    if (ring) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(ax, ay - 40, 34 + k * 12 + (t * 60 % 12), -2.4, -.7); c.stroke(); } } }
  if (S.look === 'night') chair(c, 625, 1500, 1, false);
  for (const p of S.chars) drawChar(c, p, t);
  if (S.bed) SET.blanket(c, HOME.bed[0], HOME.bed[1], S.bed.up);
}
// —— the kitchen: chopping on the board, a pot steaming ——
function drawKitchen(c, S, t) {
  c.drawImage(get('kit', () => SET.kitchenSet()), 0, 0);
  for (let i = 0; i < 4; i++) { const ph = (t * .6 + i * .25) % 1; c.strokeStyle = `rgba(255,255,255,${.5 * (1 - ph)})`; c.lineWidth = 6; c.beginPath(); const bx = 1170 + i * 20; c.moveTo(bx, 1130 - ph * 200); c.quadraticCurveTo(bx + Math.sin(t * 3 + i) * 20, 1080 - ph * 200, bx, 1040 - ph * 200); c.stroke(); }
  for (const p of S.chars) drawChar(c, p, t);
  const top = KIT.counterTop;
  c.fillStyle = lin(c, 0, top, 0, 1520, [[0, '#8a5530'], [1, '#5a3418']]); c.fillRect(260, top + 10, 1000, 1520 - top);
  c.fillStyle = '#e8e2d6'; c.fillRect(240, top - 8, 1040, 22); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(240, top + 14, 1040, 6);
  const [b0, b1] = KIT.board; c.fillStyle = '#c9944e'; c.beginPath(); c.roundRect(b0, top - 18, b1 - b0, 16, 6); c.fill();
  const cut = S.cut || 0, cl = 110 * (1 - cut * .7);
  c.fillStyle = '#e8762a'; c.beginPath(); c.moveTo(b0 + 30, top - 28); c.lineTo(b0 + 30 + cl, top - 30); c.lineTo(b0 + 30 + cl, top - 20); c.lineTo(b0 + 30, top - 18); c.fill();
  c.fillStyle = '#5c9a45'; c.beginPath(); c.ellipse(b0 + 24, top - 24, 14, 6, 0, 0, 7); c.fill();
  for (let i = 0; i < Math.floor(cut * 9); i++) { c.fillStyle = '#f08a3a'; c.beginPath(); c.ellipse(b0 + 125 + (i % 5) * 9, top - 22 - Math.floor(i / 5) * 6, 6, 4, 0, 0, 7); c.fill(); }
}

// —— the exterior ——
const ANCHOR = [735, 1440];
function layer(c, img, cam, p) { c.drawImage(img, -EX.ox + (cam[0] - ANCHOR[0]) * (1 - p), -EX.oy + (cam[1] - ANCHOR[1]) * (1 - p)); }
function drawExterior(c, S, t) {
  const L = S.look, cam = S.cam, lit = S.interiorLit ?? 1;
  layer(c, get('es' + L, () => SET.exteriorSky(L)), cam, .15);
  layer(c, get('ek' + L, () => SET.exteriorSkyline(L)), cam, .55);
  c.save(); c.globalAlpha = lit; c.drawImage(get('if', () => SET.insideFromStreet('night')), -EX.ox, -EX.oy); c.restore();
  if (lit < .5) { c.fillStyle = 'rgba(8,12,40,.85)'; c.fillRect(560, 1100, 760, 600); }
  const WT = 1080, WY = 1640, inItems = [];
  if ((S.inside || []).length) {
    for (const tx of [960, 1230]) inItems.push({ y: 1566, f: () => table(c, tx, 1566, .5, 1) });
    inItems.push({ y: WY, f: () => table(c, WT, WY, .78, 1) });
    inItems.push({ y: WY - 2, f: () => chair(c, WT - 92, WY, .78, true) });
    for (const it of S.inItems || []) inItems.push({ y: it.d ?? it.y, f: () => item(c, it, t) });
    for (const p of S.inside) inItems.push({ y: p.sit ? p.y - .5 : p.y, f: () => drawChar(c, p, t) });
  }
  inItems.sort((a, b) => a.y - b.y).forEach(it => it.f());
  { const d = EX.door, op = S.exDoor || 0, th = op * 1.25, dw = d.x1 - d.x0, fx = d.x0 + dw * Math.cos(th), sh = Math.sin(th) * 24;
    c.fillStyle = lin(c, d.x0, 0, fx, 0, [[0, '#1a2864'], [1, '#22337a']]); c.beginPath(); c.moveTo(d.x0, d.y0); c.lineTo(fx, d.y0 + sh); c.lineTo(fx, d.y1 - sh * .4); c.lineTo(d.x0, d.y1); c.closePath(); c.fill();
    c.fillStyle = lit > .5 ? 'rgba(255,190,110,.55)' : 'rgba(40,50,100,.8)'; const gx0 = lerp(d.x0, fx, .2), gx1 = lerp(d.x0, fx, .8); c.fillRect(gx0, d.y0 + 40 + sh * .5, gx1 - gx0, 120);
    c.fillStyle = '#d4ac52'; c.beginPath(); c.arc(lerp(d.x0, fx, .86), 1590, 7, 0, 7); c.fill(); c.fillStyle = '#8a6a2a'; c.fillRect(lerp(d.x0, fx, .86) - 3, 1605, 6, 10); }
  c.drawImage(get('et' + L, () => SET.exteriorStreet(L)), -EX.ox, -EX.oy);
  c.save(); SET.winPath(c, EX.win, 10); c.clip(); c.fillStyle = lin(c, EX.win.x0, 1150, EX.win.x1, 1580, [[0, 'rgba(200,220,255,.12)'], [.4, 'rgba(200,220,255,.0)'], [.55, 'rgba(200,220,255,.07)'], [1, 'rgba(200,220,255,0)']]); c.fillRect(800, 1100, 600, 500); c.restore();
  const sg = S.sign ?? 1, flick = S.signFlick ? (hash(Math.floor(t * 30)) > .4 ? 1 : .3) : 1, on = sg * flick;
  for (let i = 0; i <= 15; i++) for (const yy of [977, 1113]) { c.fillStyle = on > .1 ? '#fff0c8' : '#6a6050'; c.beginPath(); c.arc(632 + i * 41.6, yy, 6, 0, 7); c.fill(); }
  for (let j = 1; j < 3; j++) for (const xx of [632, 1248]) { c.fillStyle = on > .1 ? '#fff0c8' : '#6a6050'; c.beginPath(); c.arc(xx, 977 + j * 45, 6, 0, 7); c.fill(); }
  if (on > 0) { glow(c, 940, 1045, 520, .55 * on); for (let i = 0; i <= 15; i += 3) glow(c, 632 + i * 41.6, 977, 40, .5 * on); }
  const sl = Math.max(on, lit > .5 ? 1 : 0);
  c.strokeStyle = '#1a1a22'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 18; i++) { const bx = 575 + i * 41.5, by = 1262 + Math.sin(i / 18 * Math.PI * 3) * -10 + 10; i ? c.lineTo(bx, by) : c.moveTo(bx, by); } c.stroke();
  for (let i = 0; i <= 18; i++) { const bx = 575 + i * 41.5, by = 1268 + Math.sin(i / 18 * Math.PI * 3) * -10 + 10, tw = .8 + .2 * Math.sin(t * 3 + i); c.fillStyle = sl ? '#ffe0a0' : '#5a5040'; c.beginPath(); c.arc(bx, by, 5, 0, 7); c.fill(); if (sl) glow(c, bx, by, 28, .5 * tw * sl); }
  const ln = S.lanterns ?? 1;
  for (const [lx, ly] of EX.lanterns) glow(c, lx, ly - 6, 120 * ln, .8 * ln);
  for (const [lx, ly] of EX.lamps) glow(c, lx, ly, 300, .7);
  if (lit > .5) { glow(c, EX.win.cx, 1420, 420, .35); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lin(c, 0, 1660, 0, 1800, [[0, 'rgba(255,180,100,.22)'], [1, 'rgba(255,180,100,0)']]); c.fillRect(EX.win.x0 - 40, 1660, EX.win.x1 - EX.win.x0 + 80, 140); c.restore(); }
  [...S.chars].sort((a, b) => a.y - b.y).forEach(p => drawChar(c, p, t));
  for (const car of CARS) { const x = carX(car, t); if (x > -800 && x < 2800) drawCar(c, car, x, t, S.look); }
}
const carX = (car, t) => car.dir > 0 ? -700 + (t - car.t0) * CAR_V : 2700 - (t - car.t0) * CAR_V;
// a small rounded retro car, side view, wheels turning, headlights on
function drawCar(c, car, x, t, look) {
  const y = car.lane ? 1930 : 2045, s = car.lane ? .88 : 1.0, d = car.dir, L = 330 * s, Hh = 110 * s, wr = 34 * s;
  c.save(); c.translate(x, y); c.scale(d, 1);
  c.fillStyle = 'rgba(5,6,25,.35)'; c.beginPath(); c.ellipse(0, 6, L * .55, 14 * s, 0, 0, 7); c.fill();
  const body = c.createLinearGradient(0, -Hh - 70 * s, 0, 0); body.addColorStop(0, car.col); body.addColorStop(1, '#1a1a2a');
  c.fillStyle = car.col; c.beginPath(); c.roundRect(-L / 2, -Hh, L, Hh - 12 * s, 34 * s); c.fill();
  c.fillStyle = 'rgba(0,0,30,.25)'; c.fillRect(-L / 2, -40 * s, L, 28 * s);
  c.fillStyle = car.col; c.beginPath(); c.moveTo(-L * .3, -Hh + 4); c.quadraticCurveTo(-L * .22, -Hh - 70 * s, 0, -Hh - 72 * s); c.quadraticCurveTo(L * .2, -Hh - 70 * s, L * .26, -Hh + 4); c.fill();
  c.fillStyle = look === 'night' ? '#ffd796' : '#a9c3ec'; c.beginPath(); c.moveTo(-L * .25, -Hh + 2); c.quadraticCurveTo(-L * .19, -Hh - 56 * s, -L * .03, -Hh - 58 * s); c.lineTo(-L * .03, -Hh + 2); c.fill();
  c.beginPath(); c.moveTo(L * .01, -Hh + 2); c.lineTo(L * .01, -Hh - 58 * s); c.quadraticCurveTo(L * .16, -Hh - 56 * s, L * .21, -Hh + 2); c.fill();
  if (look === 'night') { c.globalAlpha = .55; c.fillStyle = '#ffd796'; c.fillRect(-L * .25, -Hh - 50 * s, L * .45, 50 * s); c.globalAlpha = 1; }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-L / 2 + 20 * s, -Hh + 14 * s, L - 40 * s, 6 * s);
  c.fillStyle = '#fff6d0'; c.beginPath(); c.ellipse(L / 2 - 10 * s, -60 * s, 12 * s, 14 * s, 0, 0, 7); c.fill();
  c.fillStyle = '#e04a3a'; c.fillRect(-L / 2, -66 * s, 10 * s, 16 * s);
  for (const wx of [-L * .3, L * .3]) { c.fillStyle = '#16161e'; c.beginPath(); c.arc(wx, -wr * .6, wr, 0, 7); c.fill(); c.fillStyle = '#9aa0ae'; c.beginPath(); c.arc(wx, -wr * .6, wr * .5, 0, 7); c.fill();
    const a = (t * CAR_V / wr) % 6.283; c.strokeStyle = '#4a4f5a'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(wx + Math.cos(a) * wr * .45, -wr * .6 + Math.sin(a) * wr * .45); c.lineTo(wx - Math.cos(a) * wr * .45, -wr * .6 - Math.sin(a) * wr * .45); c.stroke(); }
  c.restore();
  if (look === 'night') { const hx = x + d * (L / 2 - 10 * s), hy = y - 60 * s; glow(c, hx, hy, 70 * s, .9);
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(hx, 0, hx + d * 420 * s, 0); g.addColorStop(0, 'rgba(255,230,170,.35)'); g.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = g;
    c.beginPath(); c.moveTo(hx, hy - 8 * s); c.lineTo(hx + d * 420 * s, hy - 60 * s); c.lineTo(hx + d * 420 * s, hy + 50 * s); c.lineTo(hx, hy + 8 * s); c.fill(); c.restore(); glow(c, x - d * L / 2, y - 58 * s, 40 * s, .6); }
}

function draw(c, t) {
  const S = sceneAt(t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#060c2c'; c.fillRect(0, 0, W, H);
  camera(c, S.cam);
  if (S.set === 'in') drawInterior(c, S, t); else if (S.set === 'ex') drawExterior(c, S, t); else if (S.set === 'home') drawHome(c, S, t); else drawKitchen(c, S, t);
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H * .48, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, 'rgba(4,6,30,.45)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// sound cues: the fixed hits, plus a footstep wherever a walking character's foot lands
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
{ const last = {};
  for (let t = 0; t < DUR; t += 1 / 60) { const S = sceneAt(t);
    for (const p of S.chars) { if (!p.id || p.vis === false) continue; const key = S.set + p.id;
      if (p.walk > .15) { const k = Math.floor(p.phi / Math.PI); if (last[key] !== undefined && k !== last[key]) EV.push({ t: +t.toFixed(3), type: 'step', surf: S.set === 'ex' ? (S.wet ? 'wet' : 'stone') : 'wood', pan: Math.max(-1, Math.min(1, (p.x - S.cam[0]) * S.cam[2] / 540)), v: p.s || 1 }); last[key] = k; }
      else delete last[key]; } } }
// cars: a pass-by sound centred on when each car crosses the middle of the frame (outside shots only)
for (const car of CARS) { for (let t = car.t0; t < car.t0 + 4.5; t += 1 / 60) { const S = sceneAt(t); if (S.set !== 'ex') continue; if (Math.abs(carX(car, t) - S.cam[0]) < CAR_V / 60) { EV.push({ t: +t.toFixed(3), type: 'car', dir: car.dir, lane: car.lane }); break; } } }
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => {
  draw(ctx, t);
  const D = DISSOLVES.find(d => t >= d.at && t < d.at + d.d);
  if (D) { draw(bctx, D.at - 1 / 48); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - ss(seg(t, D.at, D.at + D.d)); if (D.blur) ctx.filter = `blur(${D.blur * K * seg(t, D.at, D.at + D.d)}px)`; ctx.drawImage(buf, 0, 0); ctx.restore(); }
};
window.render(0);
window.READY = true;
