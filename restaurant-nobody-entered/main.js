// The Restaurant Nobody Entered — a 23 Team reel in 2D, drawn frame by frame from render(t)
import { lerp, seg, ss, hash } from '/core/lib.js';
import { drawMascot, cup, plate, BASE_H } from './char2d.js';
import * as SET from './sets.js';
import { DUR, HIT, DISSOLVES, sceneAt, TABLES, ROWS, seatPos } from './story.js';

await Promise.all(['74px "Lilita One"', '30px "Fredoka"'].map(f => document.fonts.load(f, 'RESTAURANTÉÜ')));
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const [buf, bctx] = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; })();
const cache = {}; const get = (k, f) => cache[k] || (cache[k] = f());
const GLOW = SET.glowSprite();
const { IN, EX } = SET;

function camera(c, cam) { const z = cam[2] * K; c.setTransform(z, 0, 0, z, W / 2 - cam[0] * z, H / 2 - cam[1] * z); }
function glow(c, x, y, r, a = 1, spr = GLOW) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(spr, x - r, y - r, 2 * r, 2 * r); c.restore(); }
const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, s]) => g.addColorStop(o, s)); return g; };

// —— furniture and props ——
function table(c, x, y, s, lamps, low) {
  const h = BASE_H * s, top = y - .5 * h;
  c.fillStyle = 'rgba(5,6,25,.28)'; c.beginPath(); c.ellipse(x, y, .45 * h, .07 * h, 0, 0, 7); c.fill();
  c.fillStyle = '#1d1f2b'; c.beginPath(); c.ellipse(x, y - .01 * h, .16 * h, .035 * h, 0, 0, 7); c.fill(); c.fillRect(x - .025 * h, top, .05 * h, .5 * h);
  c.fillStyle = '#7a4a24'; c.beginPath(); c.ellipse(x, top + .025 * h, .5 * h, .1 * h, 0, 0, 7); c.fill();
  c.fillStyle = lin(c, x - .5 * h, top, x + .5 * h, top, [[0, '#c48a4e'], [.5, '#e0a866'], [1, '#b47a40']]); c.beginPath(); c.ellipse(x, top, .5 * h, .095 * h, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,230,180,.25)'; c.beginPath(); c.ellipse(x - .1 * h, top - .02 * h, .25 * h, .03 * h, 0, 0, 7); c.fill();
  const cx = x, ch = (low ? .05 : .08) * h; c.fillStyle = 'rgba(240,230,210,.7)'; c.fillRect(cx - .025 * h, top - ch - .01 * h, .05 * h, ch);
  if (lamps > .5) { c.fillStyle = '#ffd27a'; c.beginPath(); c.ellipse(cx, top - ch - .03 * h, .01 * h, .022 * h, 0, 0, 7); c.fill(); glow(c, cx, top - ch - .03 * h, .18 * h, .55); }
  return top;
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
function item(c, it, t) {
  if (it.k === 'plate') plate(c, it.x, it.y, it.s, true, it.steam || 0, t);
  else if (it.k === 'cup') cup(c, it.x, it.y, it.s);
  else if (it.k === 'cloth') { c.fillStyle = '#f7f5ee'; c.beginPath(); c.ellipse(it.x, it.y, 20, 7, .15, 0, 7); c.fill(); c.fillStyle = 'rgba(200,190,170,.6)'; c.beginPath(); c.ellipse(it.x + 4, it.y + 1, 12, 3, .15, 0, 7); c.fill(); }
  else if (it.k === 'glass') { c.fillStyle = 'rgba(220,235,255,.55)'; c.beginPath(); c.moveTo(it.x - 9, it.y - 26); c.lineTo(it.x + 9, it.y - 26); c.lineTo(it.x + 6, it.y); c.lineTo(it.x - 6, it.y); c.fill(); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(it.x - 6, it.y - 22, 3, 16); }
  else if (it.k === 'menu') { c.fillStyle = '#7a2e2e'; c.beginPath(); c.ellipse(it.x, it.y, 22, 6, 0, 0, 7); c.fill(); c.fillStyle = '#f2e6c8'; c.beginPath(); c.ellipse(it.x, it.y - 2, 18, 4, 0, 0, 7); c.fill(); }
  else if (it.k === 'tray') { const h = it.s; for (let i = 0; i < it.plates; i++) plate(c, it.x + (i ? 1 : -1) * .1 * h, it.y - 4, h * .55, true, 1, t);
    c.fillStyle = '#c9ccd6'; c.beginPath(); c.ellipse(it.x, it.y + 2, .24 * h, .035 * h, 0, 0, 7); c.fill(); c.fillStyle = '#eef0f6'; c.beginPath(); c.ellipse(it.x, it.y, .23 * h, .025 * h, 0, 0, 7); c.fill(); }
}
function drawChar(c, p, rimSide, t) {
  drawMascot(c, { rimSide, ...p });
  if (p.cupAt) cup(c, p.cupAt[0], p.cupAt[1] + 4, BASE_H * p.s * .2);
  if (p.trayItems && p.trayItems.length && p.hold === 'tray') { /* plates on a carried tray */
    const h = BASE_H * p.s, ty = p.y - (.47 - .24) * h - .02 * h - (p.sit ? .13 * h : 0);
    p.trayItems.forEach((k, i, a) => plate(c, p.x + (i - (a.length - 1) / 2) * .17 * h, ty - .06 * h, h * .55, true, 1, t)); }
}
const rimFor = (x, lamps) => { let b = lamps[0][0]; for (const [lx] of lamps) if (Math.abs(lx - x) < Math.abs(b - x)) b = lx; return b > x ? 1 : -1; };

// —— the interior ——
function drawInterior(c, S, t) {
  const L = S.look, wall = get('w' + L, () => SET.interiorWall(L)), out = get('o' + L, () => SET.interiorOutside(L)), d = IN.door, w = IN.win;
  c.drawImage(out, 0, 0);
  for (const p of S.outside || []) { c.save(); c.globalAlpha = p.dim ?? 1; drawMascot(c, { ...p, rimSide: 0 }); c.restore(); }
  if (S.rain) { c.save(); c.strokeStyle = 'rgba(180,200,255,.38)'; c.lineWidth = 2;
    for (let i = 0; i < 160; i++) { const x = 100 + hash(i) * 1150, sp = 1100 + hash(i + 50) * 400, y = 520 + ((hash(i + 9) * 900 + t * sp) % 900); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 34); c.stroke(); } c.restore(); }
  c.drawImage(wall, 0, 0);
  c.save(); SET.winPath(c, w, 14); c.clip();
  c.fillStyle = lin(c, w.x0, w.spring - w.r, w.x1, w.sill, [[0, 'rgba(200,220,255,.10)'], [.45, 'rgba(200,220,255,.02)'], [.5, 'rgba(200,220,255,.08)'], [1, 'rgba(200,220,255,.0)']]); c.fillRect(w.x0, w.spring - w.r, w.x1 - w.x0, w.sill);
  if (S.drops) for (let i = 0; i < 70 * S.drops; i++) { const x = w.x0 + 20 + hash(i * 3.1) * (w.x1 - w.x0 - 40), sp = hash(i * 7.7) > .75 ? 60 : 6, y = w.spring - 180 + ((hash(i * 1.3) * 560 + t * sp) % 560), r = 2.5 + hash(i) * 4;
    c.fillStyle = 'rgba(190,210,255,.45)'; c.beginPath(); c.ellipse(x, y, r * .8, r, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x - r * .3, y - r * .3, r * .3, 0, 7); c.fill(); }
  c.restore();
  // the door: hinged on its right, swinging into the room; a ZÁRVA / NYITVA plaque on its glass
  { const op = S.door || 0, th = op * 1.3, dw = d.x1 - d.x0, fx = d.x1 - dw * Math.cos(th), grow = Math.sin(th) * 46;
    if (op > .01) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = S.look === 'morning' ? `rgba(170,200,255,${.25 * op})` : `rgba(120,140,220,${.1 * op})`; c.beginPath(); c.moveTo(d.x0, d.y1); c.lineTo(d.x1, d.y1); c.lineTo(d.x1 + 220 * op, 1900); c.lineTo(d.x0 + 60 * op, 1900); c.fill(); c.restore(); }
    c.fillStyle = lin(c, fx, 0, d.x1, 0, [[0, '#2a3a86'], [1, '#17255c']]); c.beginPath(); c.moveTo(d.x1, d.y0); c.lineTo(d.x1, d.y1); c.lineTo(fx, d.y1 + grow); c.lineTo(fx, d.y0 - grow); c.closePath(); c.fill();
    const gx0 = lerp(d.x1, fx, .2), gx1 = lerp(d.x1, fx, .8), gy0 = d.y0 + 50, gy1 = d.y0 + 200, gg = grow * .6;
    c.fillStyle = S.look === 'morning' ? 'rgba(190,210,255,.85)' : 'rgba(255,190,110,.35)'; c.beginPath(); c.moveTo(gx0, gy0 - gg * .2); c.lineTo(gx1, gy0 - gg * .8); c.lineTo(gx1, gy1 + gg * .8 - 40); c.lineTo(gx0, gy1 + gg * .2 - 40); c.fill();
    const px = lerp(d.x1, fx, .5), py = d.y0 + 130, pw = Math.abs(gx1 - gx0) * .9, flip = S.plaque ?? 0, sx = Math.cos(flip * Math.PI);
    if (pw > 20) { c.save(); c.translate(px, py); c.scale(sx, 1); c.strokeStyle = '#5a3a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-pw * .3, -30); c.lineTo(0, -46); c.lineTo(pw * .3, -30); c.stroke();
      c.fillStyle = '#f2e6c8'; c.beginPath(); c.roundRect(-pw * .42, -30, pw * .84, 34, 5); c.fill(); c.scale(Math.sign(sx) || 1, 1);
      c.fillStyle = flip > .5 ? '#2f7a4b' : '#a83a2a'; c.font = `${Math.min(22, pw * .17)}px "Lilita One"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(flip > .5 ? 'NYITVA' : 'ZÁRVA', 0, -12); c.restore(); }
    c.fillStyle = '#c9a04a'; c.beginPath(); c.arc(lerp(d.x1, fx, .85), 1160, 8 + grow * .08, 0, 7); c.fill(); }
  { let a = 0; const dt = t - HIT.bell1 + .05; if (dt > 0 && dt < 3) a += Math.sin(dt * 16) * Math.exp(-dt * 2.6) * .55;
    c.save(); c.translate(d.x1 - 26, d.y0 - 34); c.fillStyle = '#c9a04a'; c.fillRect(-14, -6, 28, 6); c.rotate(a); c.fillRect(-2, 0, 4, 12); c.beginPath(); c.moveTo(-12, 30); c.quadraticCurveTo(-12, 10, 0, 10); c.quadraticCurveTo(12, 10, 12, 30); c.closePath(); c.fill(); c.beginPath(); c.arc(0, 32, 4, 0, 7); c.fill(); c.restore(); }
  const lamps = S.lamps ?? 1;
  for (const [px, py] of IN.pendants) { c.fillStyle = lin(c, px, py - 24, px, py + 30, [[0, '#fff3d6'], [1, '#ffc46e']]); c.globalAlpha = .6 + .4 * Math.min(1, lamps); c.beginPath(); c.arc(px, py, 30, 0, 7); c.fill(); c.globalAlpha = 1; glow(c, px, py, 260 * lamps, .75 * lamps); }
  // depth-sorted furniture, props and people
  const items = [];
  items.push({ y: 1432, f: () => SET.counter(c) });
  for (const [id, [tx, r]] of Object.entries(TABLES)) {
    const [ty, ts] = ROWS[r];
    items.push({ y: ty, f: () => table(c, tx, ty, ts, lamps, S.candleLow) });
    for (let i = 0; i < 2; i++) { let [sx, sy] = seatPos(id, i);
      if (id === 'B' && i === 0) sx += 15 * (S.tuck ?? 1) - 15;
      if (id === 'A' && i === 0) sx -= S.pullA0 || 0;
      items.push({ y: sy - 2, f: () => chair(c, sx, ty, ts, i === 0) }); }
  }
  const lifted = new Set(S.chars.filter(p => p.cupAt).map(p => p.id));
  for (const it of S.items || []) if (!(it.k === 'cup' && lifted.has(it.of))) items.push({ y: it.d ?? it.y, f: () => item(c, it, t) });
  for (const p of S.chars) if (p.vis !== false) items.push({ y: p.sit ? p.y - .5 : p.y, f: () => drawChar(c, p, rimFor(p.x, IN.pendants), t) });
  items.sort((a, b) => a.y - b.y).forEach(it => it.f());
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
    for (const p of S.inside) inItems.push({ y: p.sit ? p.y - .5 : p.y, f: () => drawChar(c, p, 1, t) });
  }
  inItems.sort((a, b) => a.y - b.y).forEach(it => it.f());
  { const d = EX.door, op = S.exDoor || 0, th = op * 1.25, dw = d.x1 - d.x0, fx = d.x0 + dw * Math.cos(th), sh = Math.sin(th) * 24;
    c.fillStyle = lin(c, d.x0, 0, fx, 0, [[0, '#1a2864'], [1, '#22337a']]); c.beginPath(); c.moveTo(d.x0, d.y0); c.lineTo(fx, d.y0 + sh); c.lineTo(fx, d.y1 - sh * .4); c.lineTo(d.x0, d.y1); c.closePath(); c.fill();
    c.fillStyle = lit > .5 ? 'rgba(255,190,110,.55)' : 'rgba(40,50,100,.8)'; const gx0 = lerp(d.x0, fx, .2), gx1 = lerp(d.x0, fx, .8); c.fillRect(gx0, d.y0 + 40 + sh * .5, gx1 - gx0, 120);
    c.fillStyle = '#d4ac52'; c.beginPath(); c.arc(lerp(d.x0, fx, .86), 1495, 6, 0, 7); c.fill(); }
  c.drawImage(get('et' + L, () => SET.exteriorStreet(L)), -EX.ox, -EX.oy);
  c.save(); SET.winPath(c, EX.win, 10); c.clip(); c.fillStyle = lin(c, EX.win.x0, 1150, EX.win.x1, 1580, [[0, 'rgba(200,220,255,.12)'], [.4, 'rgba(200,220,255,.0)'], [.55, 'rgba(200,220,255,.07)'], [1, 'rgba(200,220,255,0)']]); c.fillRect(800, 1100, 600, 500); c.restore();
  // the sign lights up: bulbs around the board, a warm wash, a short flicker as it comes on
  const sg = S.sign ?? 1, flick = S.signFlick ? (hash(Math.floor(t * 30)) > .4 ? 1 : .3) : 1, on = sg * flick;
  for (let i = 0; i <= 15; i++) for (const yy of [977, 1113]) { const bx = 632 + i * 41.6; c.fillStyle = on > .1 ? '#fff0c8' : '#6a6050'; c.beginPath(); c.arc(bx, yy, 6, 0, 7); c.fill(); }
  for (let j = 1; j < 3; j++) for (const xx of [632, 1248]) { c.fillStyle = on > .1 ? '#fff0c8' : '#6a6050'; c.beginPath(); c.arc(xx, 977 + j * 45, 6, 0, 7); c.fill(); }
  if (on > 0) { glow(c, 940, 1045, 520, .55 * on); for (let i = 0; i <= 15; i += 3) glow(c, 632 + i * 41.6, 977, 40, .5 * on); }
  // string lights under the awning
  const sl = Math.max(on, lit > .5 ? 1 : 0);
  c.strokeStyle = '#1a1a22'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 18; i++) { const bx = 575 + i * 41.5, by = 1262 + Math.sin(i / 18 * Math.PI * 3) * -10 + 10; i ? c.lineTo(bx, by) : c.moveTo(bx, by); } c.stroke();
  for (let i = 0; i <= 18; i++) { const bx = 575 + i * 41.5, by = 1268 + Math.sin(i / 18 * Math.PI * 3) * -10 + 10, tw = .8 + .2 * Math.sin(t * 3 + i); c.fillStyle = sl ? '#ffe0a0' : '#5a5040'; c.beginPath(); c.arc(bx, by, 5, 0, 7); c.fill(); if (sl) glow(c, bx, by, 28, .5 * tw * sl); }
  const ln = S.lanterns ?? 1;
  for (const [lx, ly] of EX.lanterns) glow(c, lx, ly - 6, 120 * ln, .8 * ln);
  for (const [lx, ly] of EX.lamps) glow(c, lx, ly, 300, .7);
  if (lit > .5) { glow(c, EX.win.cx, 1420, 420, .35); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lin(c, 0, 1660, 0, 1800, [[0, 'rgba(255,180,100,.22)'], [1, 'rgba(255,180,100,0)']]); c.fillRect(EX.win.x0 - 40, 1660, EX.win.x1 - EX.win.x0 + 80, 140); c.restore(); }
  for (const p of S.chars) drawChar(c, { rimCol: '#ffc98a', ...p }, p.x < 900 ? 1 : -1, t);
}

function draw(c, t) {
  const S = sceneAt(t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#060c2c'; c.fillRect(0, 0, W, H);
  camera(c, S.cam);
  if (S.set === 'in') drawInterior(c, S, t); else drawExterior(c, S, t);
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H * .48, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, 'rgba(4,6,30,.5)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// sound cues: the fixed hits, plus a footstep wherever a walking character's foot lands
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
{ const last = {};
  for (let t = 0; t < DUR; t += 1 / 60) { const S = sceneAt(t);
    for (const p of S.chars) { if (!p.id) continue; const key = S.set + p.id;
      if (p.walk > .15) { const k = Math.floor(p.phi / Math.PI); if (last[key] !== undefined && k !== last[key]) EV.push({ t: +t.toFixed(3), type: 'step', surf: S.set === 'in' ? 'wood' : (S.wet ? 'wet' : 'stone'), pan: Math.max(-1, Math.min(1, (p.x - S.cam[0]) * S.cam[2] / 540)), v: p.s || 1 }); last[key] = k; }
      else delete last[key]; } } }
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => {
  draw(ctx, t);
  const D = DISSOLVES.find(d => t >= d.at && t < d.at + d.d);
  if (D) { draw(bctx, D.at - 1 / 48); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - ss(seg(t, D.at, D.at + D.d)); if (D.blur) ctx.filter = `blur(${D.blur * K * seg(t, D.at, D.at + D.d)}px)`; ctx.drawImage(buf, 0, 0); ctx.restore(); }
};
window.render(0);
window.READY = true;
