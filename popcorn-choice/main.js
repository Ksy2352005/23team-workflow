// The Popcorn Choice: a 23 Team reel in 2D, drawn frame by frame from render(t)
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import * as SET from './sets.js';
import { DUR, STORY, HIT, DISSOLVES, sceneAt, DISP, PRICES } from './story.js';

await Promise.all(['74px "Lilita One"'].map(f => document.fonts.load(f, 'POPCORNKICSIKÖZEPESNAGYTEREM 1900Ft+200')));
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const [buf, bctx] = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; })();
const cache = {}; const get = (k, f) => cache[k] || (cache[k] = f());
const GLOW = SET.glowSprite(), GOLDGLOW = SET.glowSprite('255,214,120');
const { L, NAVY, GOLD, GOLD2, CREAM, bucket } = SET;

function camera(c, cam, t = 0) { const z = cam[2] * K; c.setTransform(z, 0, 0, z, W / 2 - cam[0] * z, H / 2 - cam[1] * z); }
function glow(c, x, y, r, a = 1, img = GLOW) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(img, x - r, y - r, 2 * r, 2 * r); c.restore(); }

// —— the menu board, live: prices going up, the +200 arrow, the medium marked as the decoy, the large lit as "the best" ——
function boardLive(c, B, t) {
  const b = L.board, py = b.y1 - 48;
  L.panels.forEach((px, i) => {
    if (i === 2 && (B.best || B.big)) { glow(c, px, 960, 300, .55 * Math.max(B.best || 0, B.big || 0), GOLDGLOW); }
    if (i === 2 && B.big) { const k = 1 + .12 * Math.sin(clamp(B.big) * Math.PI); c.save(); c.translate(px, b.y0 + 245); c.scale(k, k); bucket(c, 0, 0, 128, 1.15, 9); c.restore(); }
    const k = B.prices[i]; if (k > 0) { c.save(); c.translate(px, py); c.scale(1, Math.min(1.08, k)); c.fillStyle = i === 2 && B.best ? GOLD : NAVY; c.beginPath(); c.roundRect(-92, -34, 184, 68, 12); c.fill();
      c.fillStyle = i === 2 && B.best ? NAVY : CREAM; c.font = '46px "Lilita One"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PRICES[i], 0, 3); c.restore(); }
    if (i === 0 && B.dimS) { c.fillStyle = `rgba(10,15,45,${.45 * B.dimS})`; c.beginPath(); c.roundRect(px - 115, b.y0, 230, b.y1 - b.y0, 10); c.fill(); }
  });
  if (B.decoy) { const px = L.panels[1]; c.save(); c.strokeStyle = GOLD; c.lineWidth = 7; c.setLineDash([22, 14]); c.lineDashOffset = -t * 60; c.globalAlpha = B.decoy * (.75 + .25 * Math.sin(t * 6));
    c.beginPath(); c.roundRect(px - 124, b.y0 - 9, 248, b.y1 - b.y0 + 18, 14); c.stroke(); c.restore(); }
  if (B.nudge > 0 && B.nudge < 1) {   // a dark-blue hand comes up from below and sets the medium price just so
    const u = B.nudge, out = Math.sin(u * Math.PI), wig = u > .35 && u < .7 ? Math.sin((u - .35) * 60) * 6 : 0, hx = L.panels[1] + 70 + wig, hy = lerp(1320, py + 26, out);
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#2448bb'; c.lineWidth = 34; c.beginPath(); c.moveTo(hx + 190, Math.min(1330, hy + 170)); c.lineTo(hx, hy); c.stroke();
    c.fillStyle = '#2a52c9'; c.beginPath(); c.arc(hx, hy, 24, 0, 7); c.fill(); c.restore(); }
  if (B.best) { const px = L.panels[2], s = B.best * (1 + .15 * (B.best2 ? Math.sin(clamp(B.best2) * Math.PI) : 0)); c.save(); c.translate(px + 92, b.y0 + 30); c.scale(s, s); c.rotate(.15);
    c.fillStyle = GOLD; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 19 : 44; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }
  if (B.arrow > 0) {   // from the medium's price to the large's, with "+200 Ft" on it
    const x0 = L.panels[1] + 40, x1 = L.panels[2] - 40, y0 = py - 44; c.save(); c.strokeStyle = GOLD; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); for (let k = 0; k <= 30 * B.arrow; k++) { const u = k / 30, x = lerp(x0, x1, u), y = y0 - Math.sin(u * Math.PI) * 60; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    if (B.arrow >= 1) { c.fillStyle = GOLD; c.beginPath(); c.moveTo(x1 + 4, y0 + 6); c.lineTo(x1 - 22, y0 - 8); c.lineTo(x1 - 6, y0 - 26); c.closePath(); c.fill(); }
    c.restore(); }
  if (B.chip > 0) { const cx = (L.panels[1] + L.panels[2]) / 2, cy = py - 130; c.save(); c.translate(cx, cy); c.scale(B.chip, B.chip); c.fillStyle = GOLD; c.beginPath(); c.roundRect(-92, -32, 184, 64, 32); c.fill();
    c.fillStyle = NAVY; c.font = '42px "Lilita One"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+200 Ft', 0, 3); c.restore(); }
}
function marquee(c, t) { for (let i = 0; i < 22; i++) { const u = i / 22, [x, y] = u < .5 ? [540 + u * 2 * 420, 600] : [960 - (u - .5) * 2 * 420, 710], on = (Math.floor(t * 4) + i) % 3 !== 0;
  c.fillStyle = on ? '#ffe7a6' : '#8a7040'; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); if (on) glow(c, x, y, 22, .45, GOLDGLOW); } }
// the popcorn machine: a glass cabinet, a kettle at the top, kernels popping and tumbling onto the heap
function machine(c, t) {
  const m = L.machine, top = m.y0, base = L.counter.top, w = m.x1 - m.x0, cx = (m.x0 + m.x1) / 2;
  c.fillStyle = '#121a46'; c.fillRect(m.x0 - 6, base - 22, w + 12, 22); c.fillStyle = '#26346f'; c.beginPath(); c.moveTo(m.x0 - 10, top); c.lineTo(m.x1 + 10, top); c.lineTo(m.x1 - 8, top - 34); c.lineTo(m.x0 + 8, top - 34); c.fill();
  c.fillStyle = GOLD2; c.fillRect(m.x0 - 10, top - 4, w + 20, 5);
  c.fillStyle = 'rgba(255,240,200,.12)'; c.fillRect(m.x0, top, w, base - 22 - top);
  c.save(); c.beginPath(); c.rect(m.x0, top, w, base - 22 - top); c.clip();
  glow(c, cx, top + 40, 120, .35, GOLDGLOW);
  for (let i = 0; i < 40; i++) { c.fillStyle = hash(i) > .4 ? '#f7dd8a' : GOLD; c.beginPath(); c.arc(m.x0 + 8 + hash(i * 3.1) * (w - 16), base - 30 - hash(i * 7.3) * 34 * (1 - Math.abs(hash(i * 3.1) - .5)), 6 + hash(i) * 3, 0, 7); c.fill(); }
  c.fillStyle = '#c8ccd6'; c.beginPath(); c.ellipse(cx, top + 46, 30, 18, Math.sin(t * 3) * .15, 0, Math.PI); c.fill(); c.fillStyle = '#9aa0ae'; c.fillRect(cx - 2, top, 4, 30);
  for (let k = 0; k < 14; k++) { const per = .9 + hash(k) * .6, ph = ((t + hash(k * 5) * per) % per) / per, vx = (hash(k * 9) - .5) * 160, x = cx + vx * ph, y = top + 52 - Math.sin(ph * Math.PI) * 40 + ph * ph * 90;
    if (y < base - 34) { c.fillStyle = '#fff1c4'; c.beginPath(); c.arc(x, y, 5.5, 0, 7); c.fill(); } }
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.strokeRect(m.x0, top, w, base - 22 - top); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(m.x0 + 10, top + 12, 6, base - 70 - top);
}
function register(c, drawer) {
  const [x, y] = L.register; c.fillStyle = '#121a46'; c.fillRect(x - 36, y - 60, 72, 50); c.fillStyle = '#2a3566'; c.fillRect(x - 40, y - 12, 80, 12);
  c.fillStyle = GOLD; c.fillRect(x - 26, y - 54, 52, 14); c.fillStyle = CREAM; for (let i = 0; i < 6; i++) c.fillRect(x - 26 + (i % 3) * 18, y - 34 + Math.floor(i / 3) * 10, 12, 6);
  if (drawer > 0) { c.fillStyle = '#3a4580'; c.fillRect(x - 38, y - 4, 76, 10 + 20 * drawer); c.fillStyle = GOLD; for (let i = 0; i < 4; i++) c.fillRect(x - 30 + i * 16, y + 4, 10, 6 + 14 * drawer); }
}
function bubble(c, p) {   // a "!" or "?" pops over a head
  const h = BASE_H * (p.s || 1) * 1.08, b = p.bang, x = p.x, y = p.y - 1.1 * h, r = .16 * h * (b < .3 ? b / .3 * 1.15 : 1);
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - r * .3, y + r * .8); c.lineTo(x - r * .1, y + r * 1.35); c.lineTo(x + r * .25, y + r * .85); c.fill();
  c.fillStyle = '#e8573a'; c.font = `${Math.round(r * 1.5)}px "Lilita One"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.mark || '!', x, y + r * .08);
}
function thought(c, p) {   // a thought cloud with the small bucket in it
  const h = BASE_H * 1.08, k = p.think, x = p.x + 70, y = p.y - 1.25 * h;
  c.save(); c.globalAlpha = Math.min(1, k * 1.5); c.fillStyle = '#ffffff';
  for (const [dx, dy, r] of [[-38, -6, 38], [0, -24, 44], [40, -6, 38], [0, 16, 36]]) { c.beginPath(); c.arc(x + dx * k, y + dy * k, r * k, 0, 7); c.fill(); }
  c.beginPath(); c.arc(x - 52 * k, y + 48 * k, 9 * k, 0, 7); c.fill(); c.beginPath(); c.arc(x - 66 * k, y + 70 * k, 5 * k, 0, 7); c.fill();
  c.translate(x, y + 22 * k); c.scale(k, k); bucket(c, 0, 0, 48, 1, 3); c.restore();
}
function drawChar(c, p, t, S) {
  if (p.vis === false) return;
  drawMascot(c, p);
  const hold = p.id === 'man' ? S.manHold : p.id === 'cashier' ? S.held : p.id === 'c1' ? (S.holds || [])[0] : null;
  if (hold) bucket(c, hold[0], hold[1], p.id === 'cashier' ? 80 : 70, S.heldFill ?? 1, 11);
  if (p.id === 'cashier' && S.held && S.spill > 0 && S.spill < 1) for (let i = 0; i < 6; i++) { const ph = ((S.spill * 4 + hash(i)) % 1), x = S.held[0] + (hash(i * 3) - .5) * 70 + (hash(i * 3) - .5) * 40 * ph, y = S.held[1] - 100 + ph * ph * 120;
    c.fillStyle = '#f7dd8a'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
  if (p.bang > 0) bubble(c, p);
  if (p.think > 0) thought(c, p);
}
function drawLobby(c, S, t) {
  c.drawImage(get('lobby', SET.lobby), 0, 0);
  for (const lx of [200, 520, 980, 1300]) glow(c, lx, 290, 260, .35, GOLDGLOW);
  marquee(c, t);
  boardLive(c, S.board, t);
  { const d = L.door, op = S.door || 0; if (op > 0) { glow(c, (d.x0 + d.x1) / 2, 1400, 260 * op, .5 * op, GOLDGLOW); }
    const w = (d.x1 - d.x0) * (1 - .85 * op); c.fillStyle = '#26346f'; c.fillRect(d.x0, d.y0, w, d.y1 - d.y0); c.fillStyle = GOLD2; c.fillRect(d.x0 + w - 22, 1370, 8, 46); }
  const behind = S.chars.filter(p => p.y < L.counter.front - 30), front = S.chars.filter(p => p.y >= L.counter.front - 30);
  behind.forEach(p => drawChar(c, p, t, S));
  c.drawImage(get('counter', SET.counterFront), 0, 0);
  register(c, S.drawer || 0);
  const pops = S.dispPop || [1, 1, 1];
  [['S', 0], ['M', 1], ['Lg', 2]].forEach(([k, i]) => { if (!S.disp[k]) return; const [x, y, h] = DISP[k]; c.save(); c.translate(x, y); c.scale(pops[i], pops[i]); bucket(c, 0, 0, h, 1, 20 + i); c.restore(); });
  machine(c, t);
  if (S.wisps > 0) { c.save(); c.strokeStyle = `rgba(255,240,200,${.5 * S.wisps})`; c.lineWidth = 6; c.lineCap = 'round';
    for (let k = 0; k < 3; k++) { c.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, x = lerp(1060, 520, u), y = lerp(1220, 1430, u) + Math.sin(u * 9 + t * 3 + k * 2) * 26 - k * 22; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } c.restore(); }
  front.sort((a, b) => a.y - b.y).forEach(p => drawChar(c, p, t, S));
}

// —— the locked 23 Team end card (ANIMATION-STYLE.md) ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const END_BLUE = '#0b1438';
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();
function endCard(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  const u = ss(seg(t, STORY + .15, STORY + 1.05)), w = W * .30, h = w * LOGO.height / LOGO.width, sc = 1.04 - .04 * u;
  c.save(); c.globalAlpha = u * .75; c.filter = u < 1 ? `blur(${(1 - u) * 6 * K}px)` : 'none';
  c.translate(W / 2, H / 2); c.scale(sc, sc); c.drawImage(LOGO_W, -w / 2, -h / 2, w, h); c.restore();
}
function vignette(c, a = .4) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H * .48, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, `rgba(4,6,30,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const S = sceneAt(t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  camera(c, S.cam, t); drawLobby(c, S, t);
  vignette(c, .42);
  if (S.dim > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(8,12,40,${.5 * S.dim})`; c.fillRect(0, 0, W, H); }
  if (S.fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = S.fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits, plus a footstep wherever a walking character's foot lands
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
{ const last = {};
  for (let t = 0; t < STORY; t += 1 / 60) { const S = sceneAt(t);
    for (const p of S.chars) { if (!p.id || p.vis === false) continue; const key = p.id;
      if (p.walk > .15) { const k = Math.floor((p.phi - Math.PI / 2) / Math.PI); if (last[key] !== undefined && k !== last[key]) EV.push({ t: +t.toFixed(3), type: 'step', who: p.id === 'man' ? 'man' : 'guest', pan: Math.max(-1, Math.min(1, (p.x - S.cam[0]) * S.cam[2] / 540)), v: p.s || 1 }); last[key] = k; }
      else delete last[key]; } } }
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => {
  draw(ctx, t);
  const D = DISSOLVES.find(d => t >= d.at && t < d.at + d.d);
  if (D) { draw(bctx, D.at - 1 / 48); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - ss(seg(t, D.at, D.at + D.d)); ctx.drawImage(buf, 0, 0); ctx.restore(); }
};
window.render(0);
window.READY = true;
