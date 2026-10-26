// The Restaurant Nobody Entered — a 23 Team reel in 2D, drawn frame by frame from render(t)
import { clamp, lerp, seg, ss, hash, vnoise } from '/core/lib.js';
import { drawMascot, cup, BASE_H } from './char2d.js';
import * as SET from './sets.js';
import { DUR, HIT, DISSOLVES, sceneAt, TABLES, ROWS, seatPos, sOf } from './story.js';

const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const [buf, bctx] = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; })();
const cache = {}; const get = (k, f) => cache[k] || (cache[k] = f());
const GLOW = SET.glowSprite(), GLOW_COOL = SET.glowSprite('170,200,255');
const { IN, EX } = SET;

function camera(c, cam) { const z = cam[2] * K; c.setTransform(z, 0, 0, z, W / 2 - cam[0] * z, H / 2 - cam[1] * z); }
function glow(c, x, y, r, a = 1, spr = GLOW) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.drawImage(spr, x - r, y - r, 2 * r, 2 * r); c.restore(); }
const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, s]) => g.addColorStop(o, s)); return g; };

// —— furniture ——
function table(c, x, y, s, candle, lamps, low) {
  const h = BASE_H * s, top = y - .5 * h;
  c.fillStyle = 'rgba(5,6,25,.28)'; c.beginPath(); c.ellipse(x, y, .45 * h, .07 * h, 0, 0, 7); c.fill();
  c.fillStyle = '#1d1f2b'; c.beginPath(); c.ellipse(x, y - .01 * h, .16 * h, .035 * h, 0, 0, 7); c.fill(); c.fillRect(x - .025 * h, top, .05 * h, .5 * h);
  c.fillStyle = '#7a4a24'; c.beginPath(); c.ellipse(x, top + .025 * h, .5 * h, .1 * h, 0, 0, 7); c.fill();
  c.fillStyle = lin(c, x - .5 * h, top, x + .5 * h, top, [[0, '#c48a4e'], [.5, '#e0a866'], [1, '#b47a40']]); c.beginPath(); c.ellipse(x, top, .5 * h, .095 * h, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,230,180,.25)'; c.beginPath(); c.ellipse(x - .1 * h, top - .02 * h, .25 * h, .03 * h, 0, 0, 7); c.fill();
  if (candle) { const cx = x + .12 * h, ch = (low ? .05 : .08) * h; c.fillStyle = 'rgba(240,230,210,.7)'; c.fillRect(cx - .025 * h, top - ch, .05 * h, ch);
    if (lamps > .5) { c.fillStyle = '#ffd27a'; c.beginPath(); c.ellipse(cx, top - ch - .02 * h, .01 * h, .022 * h, 0, 0, 7); c.fill(); glow(c, cx, top - ch - .02 * h, .18 * h, .55); } }
  return top;
}
function chair(c, x, y, s, faceRight, flippedOn) {
  const h = BASE_H * s, back = faceRight ? -1 : 1;
  c.save();
  if (flippedOn) { c.translate(x, flippedOn); c.scale(1, -1); c.translate(-x, -(y)); }
  const seat = y - .3 * h, wood = '#8a552a';
  c.strokeStyle = wood; c.lineCap = 'round'; c.lineWidth = .028 * h;
  for (const dx of [-.12, .12]) { c.beginPath(); c.moveTo(x + dx * h, seat); c.lineTo(x + dx * h * 1.1, y); c.stroke(); }
  c.beginPath(); c.moveTo(x + back * .13 * h, seat); c.lineTo(x + back * .15 * h, seat - .4 * h); c.stroke();
  c.beginPath(); c.arc(x + back * .1 * h, seat - .4 * h, .06 * h, Math.PI, 0); c.stroke();
  c.fillStyle = '#6b3f1d'; c.beginPath(); c.ellipse(x, seat + .01 * h, .17 * h, .05 * h, 0, 0, 7); c.fill();
  c.fillStyle = lin(c, x, seat - .04 * h, x, seat + .03 * h, [[0, '#2f45a8'], [1, '#1b2a70']]); c.beginPath(); c.ellipse(x, seat - .012 * h, .16 * h, .045 * h, 0, 0, 7); c.fill();
  c.restore();
}
function plate(c, x, y, s) { const h = BASE_H * s; c.fillStyle = '#f4f1ea'; c.beginPath(); c.ellipse(x, y, .1 * h, .025 * h, 0, 0, 7); c.fill(); c.fillStyle = '#d99a4a'; c.beginPath(); c.ellipse(x, y - .012 * h, .05 * h, .02 * h, 0, 0, 7); c.fill(); }

function rimFor(x, lamps) { let best = lamps[0][0]; for (const [lx] of lamps) if (Math.abs(lx - x) < Math.abs(best - x)) best = lx; return best > x ? 1 : -1; }

// —— the interior ——
function drawInterior(c, S, t) {
  const L = S.look, wall = get('w' + L, () => SET.interiorWall(L)), out = get('o' + L, () => SET.interiorOutside(L)), d = IN.door, w = IN.win;
  c.drawImage(out, 0, 0);
  for (const p of S.outside || []) { c.save(); c.globalAlpha = p.dim ?? 1; drawMascot(c, { ...p, rimSide: 0 }); c.restore(); }
  if (S.rain) { c.save(); c.strokeStyle = 'rgba(180,200,255,.38)'; c.lineWidth = 2;
    for (let i = 0; i < 160; i++) { const x = 100 + hash(i) * 1150, sp = 1100 + hash(i + 50) * 400, y = 520 + ((hash(i + 9) * 900 + t * sp) % 900); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 34); c.stroke(); } c.restore(); }
  c.drawImage(wall, 0, 0);
  // glass: a soft sheen and the drops
  c.save(); SET.winPath(c, w, 14); c.clip();
  c.fillStyle = lin(c, w.x0, w.spring - w.r, w.x1, w.sill, [[0, 'rgba(200,220,255,.10)'], [.45, 'rgba(200,220,255,.02)'], [.5, 'rgba(200,220,255,.08)'], [1, 'rgba(200,220,255,.0)']]); c.fillRect(w.x0, w.spring - w.r, w.x1 - w.x0, w.sill);
  if (S.drops) for (let i = 0; i < 70 * S.drops; i++) { const x = w.x0 + 20 + hash(i * 3.1) * (w.x1 - w.x0 - 40), sp = hash(i * 7.7) > .75 ? 60 : 6, y = w.spring - 180 + ((hash(i * 1.3) * 560 + t * sp) % 560), r = 2.5 + hash(i) * 4;
    c.fillStyle = 'rgba(190,210,255,.45)'; c.beginPath(); c.ellipse(x, y, r * .8, r, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x - r * .3, y - r * .3, r * .3, 0, 7); c.fill(); }
  c.restore();
  // the door: hinged on its right, swinging into the room
  { const op = S.door || 0, th = op * 1.3, dw = d.x1 - d.x0, fx = d.x1 - dw * Math.cos(th), grow = Math.sin(th) * 46;
    if (op > .01) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = S.look === 'morning' ? 'rgba(170,200,255,.22)' : 'rgba(120,140,220,.1)'; c.beginPath(); c.moveTo(d.x0, d.y1); c.lineTo(d.x1, d.y1); c.lineTo(d.x1 + 220 * op, 1900); c.lineTo(d.x0 + 60 * op, 1900); c.fill(); c.restore(); }
    c.fillStyle = lin(c, fx, 0, d.x1, 0, [[0, '#2a3a86'], [1, '#17255c']]); c.beginPath(); c.moveTo(d.x1, d.y0); c.lineTo(d.x1, d.y1); c.lineTo(fx, d.y1 + grow); c.lineTo(fx, d.y0 - grow); c.closePath(); c.fill();
    const gx0 = lerp(d.x1, fx, .2), gx1 = lerp(d.x1, fx, .8), gy0 = d.y0 + 50, gy1 = d.y0 + 200, gg = grow * .6;
    c.fillStyle = S.look === 'morning' ? 'rgba(190,210,255,.85)' : 'rgba(255,190,110,.35)'; c.beginPath(); c.moveTo(gx0, gy0 - gg * .2); c.lineTo(gx1, gy0 - gg * .8); c.lineTo(gx1, gy1 + gg * .8 - 40); c.lineTo(gx0, gy1 + gg * .2 - 40); c.fill();
    c.fillStyle = '#c9a04a'; c.beginPath(); c.arc(lerp(d.x1, fx, .85), (d.y0 + d.y1) / 2 + 20, 8 + grow * .08, 0, 7); c.fill(); }
  // the bell above the door
  { let a = 0; for (const h of [HIT.bell1]) { const dt = t - h + .05; if (dt > 0 && dt < 3) a += Math.sin(dt * 16) * Math.exp(-dt * 2.6) * .55; }
    c.save(); c.translate(d.x1 - 26, d.y0 - 34); c.fillStyle = '#c9a04a'; c.fillRect(-14, -6, 28, 6); c.rotate(a); c.fillRect(-2, 0, 4, 12); c.beginPath(); c.moveTo(-12, 30); c.quadraticCurveTo(-12, 10, 0, 10); c.quadraticCurveTo(12, 10, 12, 30); c.closePath(); c.fill(); c.beginPath(); c.arc(0, 32, 4, 0, 7); c.fill(); c.restore(); }
  // pendant globes
  const lamps = S.lamps ?? 1;
  for (const [px, py] of IN.pendants) { c.fillStyle = lin(c, px, py - 24, px, py + 30, [[0, '#fff3d6'], [1, '#ffc46e']]); c.globalAlpha = .6 + .4 * Math.min(1, lamps); c.beginPath(); c.arc(px, py, 30, 0, 7); c.fill(); c.globalAlpha = 1; glow(c, px, py, 260 * lamps, .75 * lamps); }
  // depth-sorted furniture and people
  const items = [], up = new Set(S.chairsUp || []);
  for (const [id, [tx, r]] of Object.entries(TABLES)) {
    const [ty, ts] = ROWS[r];
    items.push({ y: ty, f: () => { const top = table(c, tx, ty, ts, true, lamps, S.candleLow);
      for (let i = 0; i < 2; i++) { const k = id + i, sx = tx + (i ? 1 : -1) * .26 * BASE_H * ts;
        if ((S.cups || []).includes(k)) cup(c, sx, top + 4, BASE_H * ts * .2);
        if (S.plates && (S.cups || []).includes(k) && id !== 'A') plate(c, sx + (i ? -1 : 1) * .15 * BASE_H * ts, top + 8, ts); }
      if (S.cloth === id) { c.fillStyle = '#f7f5ee'; c.beginPath(); c.ellipse(tx + 30 * ts, top + 3, 26 * ts, 9 * ts, .2, 0, 7); c.fill(); }
      if (up.has(id)) for (let i = 0; i < 2; i++) chair(c, tx + (i ? 1 : -1) * 45 * ts, ty, ts, i === 1, top - 2); } });
    if (!up.has(id)) for (let i = 0; i < 2; i++) {
      let [sx, sy] = seatPos(id, i);
      if (id === 'B' && i === 0 && S.tuck !== undefined) sx += 25 * S.tuck - 25;
      if (id === 'A' && i === 0 && S.pull) sx -= S.pull;
      items.push({ y: sy - 2, f: () => chair(c, sx, ty, ts, i === 0) });
    }
  }
  for (const p of S.chars) if (p.vis !== false) items.push({ y: p.sit ? p.y - .5 : p.y, f: () => drawMascot(c, { rimSide: rimFor(p.x, IN.pendants), ...p }) });
  items.sort((a, b) => a.y - b.y).forEach(it => it.f());
}

// —— the exterior ——
const ANCHOR = [735, 1440];
function layer(c, img, cam, p) { c.drawImage(img, -EX.ox + (cam[0] - ANCHOR[0]) * (1 - p), -EX.oy + (cam[1] - ANCHOR[1]) * (1 - p)); }
function drawExterior(c, S, t) {
  const L = S.look, cam = S.cam;
  layer(c, get('es' + L, () => SET.exteriorSky(L)), cam, .15);
  layer(c, get('ek' + L, () => SET.exteriorSkyline(L)), cam, .55);
  if (S.birds !== undefined && S.birds > 0 && S.birds < 1) for (let i = 0; i < 3; i++) { const u = S.birds + i * .04, bx = lerp(300, 1500, u) + i * 40, by = lerp(-200, 120, u) + i * 30 + Math.sin(u * 20) * 10, fl = Math.sin(t * 18 + i) * 10;
    c.strokeStyle = '#0b1030'; c.lineWidth = 4; c.beginPath(); c.moveTo(bx - 22, by - fl); c.quadraticCurveTo(bx - 8, by - 6, bx, by); c.quadraticCurveTo(bx + 8, by - 6, bx + 22, by - fl); c.stroke(); }
  // the room behind the glass
  c.save(); c.globalAlpha = S.interiorLit ?? 1; c.drawImage(get('if', () => SET.insideFromStreet('night')), -EX.ox, -EX.oy); c.restore();
  if ((S.interiorLit ?? 1) < .5) { c.fillStyle = 'rgba(8,12,40,.85)'; c.fillRect(560, 1100, 760, 600); }
  const WT = 1080, WY = 1640;
  const inItems = [];
  for (const tx of [960 + 0, 1230]) if ((S.inside || []).length > 2) inItems.push({ y: 1566, f: () => table(c, tx, 1566, .5, true, 1) });
  if ((S.inside || []).length) {
    inItems.push({ y: WY + .5, f: () => { const top = table(c, WT, WY, .78, true, 1); if (S.cupsIn >= 1) cup(c, WT - 40, top + 3, 33); if (S.cupsIn >= 2) cup(c, WT + 40, top + 3, 33); } });
    inItems.push({ y: WY - 2, f: () => chair(c, WT - 92, WY, .78, true) });
    for (const p of S.inside) inItems.push({ y: p.sit ? p.y - .5 : p.y, f: () => drawMascot(c, { rimSide: 1, ...p }) });
  }
  inItems.sort((a, b) => a.y - b.y).forEach(it => it.f());
  // the door, hinged on its left, swinging into the room
  { const d = EX.door, op = S.exDoor || 0, th = op * 1.25, dw = d.x1 - d.x0, fx = d.x0 + dw * Math.cos(th), sh = Math.sin(th) * 24;
    c.fillStyle = lin(c, d.x0, 0, fx, 0, [[0, '#1a2864'], [1, '#22337a']]); c.beginPath(); c.moveTo(d.x0, d.y0); c.lineTo(fx, d.y0 + sh); c.lineTo(fx, d.y1 - sh * .4); c.lineTo(d.x0, d.y1); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,190,110,.55)'; const gx0 = lerp(d.x0, fx, .2), gx1 = lerp(d.x0, fx, .8); c.fillRect(gx0, d.y0 + 40 + sh * .5, gx1 - gx0, 120);
    c.fillStyle = '#d4ac52'; c.beginPath(); c.arc(lerp(d.x0, fx, .86), (d.y0 + d.y1) / 2 + 20, 6, 0, 7); c.fill(); }
  c.drawImage(get('et' + L, () => SET.exteriorStreet(L)), -EX.ox, -EX.oy);
  // glass sheen
  c.save(); SET.winPath(c, EX.win, 10); c.clip(); c.fillStyle = lin(c, EX.win.x0, 1150, EX.win.x1, 1580, [[0, 'rgba(200,220,255,.12)'], [.4, 'rgba(200,220,255,.0)'], [.55, 'rgba(200,220,255,.07)'], [1, 'rgba(200,220,255,0)']]); c.fillRect(800, 1100, 600, 500); c.restore();
  // lights
  const ln = S.lanterns ?? 1;
  for (const [lx, ly] of EX.lanterns) glow(c, lx, ly - 6, 120 * ln, .8 * ln);
  for (const [lx, ly] of EX.lamps) glow(c, lx, ly, 300, .7);
  if ((S.interiorLit ?? 1) > .5) { glow(c, EX.win.cx, 1420, 420, .35); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lin(c, 0, 1660, 0, 1800, [[0, 'rgba(255,180,100,.22)'], [1, 'rgba(255,180,100,0)']]); c.fillRect(EX.win.x0 - 40, 1660, EX.win.x1 - EX.win.x0 + 80, 140); c.restore(); }
  for (const p of S.chars) drawMascot(c, { rimSide: p.x < 900 ? 1 : -1, rimCol: '#ffc98a', ...p });
}

function draw(c, t) {
  const S = sceneAt(t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#060c2c'; c.fillRect(0, 0, W, H);
  camera(c, S.cam);
  if (S.set === 'in') drawInterior(c, S, t); else drawExterior(c, S, t);
  // grade: a soft vignette
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(W / 2, H * .48, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, 'rgba(4,6,30,.5)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}

window.DUR = DUR;
window.EV = Object.entries(HIT).map(([type, t]) => ({ t, type })).sort((a, b) => a.t - b.t);
window.render = t => {
  draw(ctx, t);
  const D = DISSOLVES.find(d => t >= d.at && t < d.at + d.d);
  if (D) { draw(bctx, D.at - 1 / 48); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - ss(seg(t, D.at, D.at + D.d)); if (D.blur) ctx.filter = `blur(${D.blur * K * seg(t, D.at, D.at + D.d)}px)`; ctx.drawImage(buf, 0, 0); ctx.restore(); }
};
window.render(0);
window.READY = true;
