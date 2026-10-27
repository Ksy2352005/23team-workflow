// The Lemonade Sign — a 23 Team reel in 2D, drawn frame by frame from render(t)
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import * as SET from './sets.js';
import { DUR, STORY, HIT, DISSOLVES, sceneAt, ST, BOARD, LANE } from './story.js';

await Promise.all(['74px "Lilita One"', '40px "Caveat Brush"'].map(f => document.fonts.load(f, 'LimonádéHázifrisscitrombólaforrónyárinapokra500Ft')));
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const [buf, bctx] = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; })();
const cache = {}; const get = (k, f) => cache[k] || (cache[k] = f());
const GLOW = SET.glowSprite(), GOLDGLOW = SET.glowSprite('255,214,120');
const { G } = SET;
const NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', FONT = '"Caveat Brush"';

function camera(c, cam, sh = 0, t = 0, cy = H / 2) { const z = cam[2] * K, dx = sh * (hash(Math.floor(t * 60)) - .5), dy = sh * (hash(Math.floor(t * 60) + 7) - .5); c.setTransform(z, 0, 0, z, W / 2 - cam[0] * z + dx * K, cy - cam[1] * z + dy * K); }
function glow(c, x, y, r, a = 1, img = GLOW) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(img, x - r, y - r, 2 * r, 2 * r); c.restore(); }
const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, s]) => g.addColorStop(o, s)); return g; };

// —— props ——
// a clear plastic cup, base at (x, y), height h; lemonade up to 'lvl'
function lcup(c, x, y, h = 24, lvl = 1, ice = false) {
  const tw = h * .36, bw = h * .27, top = y - h;
  const path = () => { c.beginPath(); c.moveTo(x - tw, top); c.lineTo(x + tw, top); c.lineTo(x + bw, y); c.lineTo(x - bw, y); c.closePath(); };
  if (lvl > 0) { c.save(); path(); c.clip(); const ly = y - h * .92 * lvl; c.fillStyle = lin(c, 0, ly, 0, y, [[0, '#f6cf63'], [1, GOLD2]]); c.fillRect(x - tw, ly, tw * 2, y - ly);
    if (ice) { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x - tw * .5, ly - h * .02, h * .22, h * .2); c.fillRect(x + tw * .05, ly + h * .05, h * .2, h * .18); }
    c.restore(); }
  path(); c.fillStyle = 'rgba(230,240,255,.18)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = Math.max(1, h * .05); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - tw * .7, top + h * .12, h * .05, h * .6);
}
function stackCups(c, x, y, n) { for (let i = 0; i < n; i++) lcup(c, x, y - i * 4, 24, 0); }
// the glass pitcher: base centre (x, y), tipped by 'rot' about its base; a stream when it pours
function pitcher(c, x, y, lvl, rot = 0, drop = 0) {
  const h = 52, w = 20;
  c.save(); c.translate(x, y); c.rotate(rot);
  const body = () => { c.beginPath(); c.moveTo(-w * .8, 0); c.lineTo(w * .8, 0); c.quadraticCurveTo(w * 1.05, -h * .5, w * .72, -h); c.lineTo(w * 1.02, -h - 6); c.lineTo(-w * .75, -h); c.quadraticCurveTo(-w * 1.05, -h * .5, -w * .8, 0); c.closePath(); };
  if (lvl > 0) { c.save(); body(); c.clip(); c.rotate(-rot);   // the surface stays level as it tips
    const surf = -h * .9 * lvl + Math.min(0, Math.sin(rot) * -8) ; c.fillStyle = lin(c, 0, surf, 0, 0, [[0, '#f6cf63'], [1, GOLD2]]); c.fillRect(-60, surf, 120, 120);
    c.fillStyle = 'rgba(255,255,255,.5)'; for (const [ix, iy] of [[-8, 10], [5, 16]]) if (lvl > .3) c.fillRect(ix, surf + iy * lvl - 6, 9, 8);
    c.fillStyle = '#f8e8a0'; if (lvl > .2) { c.beginPath(); c.arc(-2, surf + 26 * lvl, 6, 0, 7); c.fill(); }
    c.restore(); }
  body(); c.fillStyle = 'rgba(225,238,255,.16)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2.2; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-w * .85, -h * .82); c.quadraticCurveTo(-w * 1.75, -h * .55, -w * .9, -h * .2); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(w * .3, -h * .8, 3, h * .55);
  c.restore();
  if (rot > .55 && lvl > .02) { const sx = x + Math.cos(rot) * w * 1.02 + Math.sin(rot) * (h + 6), sy = y + Math.sin(rot) * w * 1.02 - Math.cos(rot) * (h + 6);
    c.strokeStyle = GOLD; c.lineWidth = 3.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + 3, (sy + ST.pour[1]) / 2, ST.pour[0], ST.pour[1] - 6); c.stroke(); }
  if (drop > 0) { const sx = x + Math.cos(rot) * w + Math.sin(rot) * (h + 6), sy = y + Math.sin(rot) * w - Math.cos(rot) * (h + 6); c.fillStyle = GOLD; c.beginPath(); c.ellipse(sx, sy + drop * 30, 2.4, 3.4, 0, 0, 7); c.fill(); }
}
function coin(c, x, y, r = 5.5) { c.fillStyle = '#f2cf6a'; c.beginPath(); c.ellipse(x, y, r, r * .55, 0, 0, 7); c.fill(); c.fillStyle = GOLD2; c.fillRect(x - r, y, r * 2, 2); c.strokeStyle = '#b8902e'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, r, r * .55, 0, 0, 7); c.stroke(); }
function tin(c, x, y, n) {   // a round biscuit tin, open, coins showing
  c.fillStyle = '#26346f'; c.fillRect(x - 15, y - 14, 30, 14); c.beginPath(); c.ellipse(x, y, 15, 4, 0, 0, Math.PI); c.fill();
  c.fillStyle = '#3d4f96'; c.beginPath(); c.ellipse(x, y - 14, 15, 4.2, 0, 0, 7); c.fill(); c.fillStyle = '#121a40'; c.beginPath(); c.ellipse(x, y - 14, 13, 3.4, 0, 0, 7); c.fill();
  for (let i = 0; i < Math.min(n, 12); i++) coin(c, x - 8 + hash(i * 3.1) * 16, y - 14 - hash(i * 5.3) * 2 + (i > 6 ? -1.5 : 0), 3.6);
  c.strokeStyle = GOLD2; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 15, y - 7); c.lineTo(x + 15, y - 7); c.stroke();
}
// the first sign: a sheet of paper, "Limonádé 500 Ft" in marker; drawn at its place on the front of the stand
function paperSign(c, x, y, w = 118, hgt = 66) {
  c.save(); c.translate(x, y); c.rotate(-.03);
  c.fillStyle = 'rgba(0,0,20,.18)'; c.fillRect(-w / 2 + 2, -hgt / 2 + 3, w, hgt);
  c.fillStyle = '#fbf8f0'; c.fillRect(-w / 2, -hgt / 2, w, hgt);
  c.fillStyle = 'rgba(230,240,255,.6)'; for (const [tx, ty] of [[-w / 2, -hgt / 2], [w / 2, -hgt / 2]]) { c.save(); c.translate(tx, ty); c.rotate(tx < 0 ? -.7 : .7); c.fillRect(-12, -4, 24, 8); c.restore(); }
  c.fillStyle = NAVY; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `26px ${FONT}`; c.fillText('Limonádé', 0, -9); c.font = `21px ${FONT}`; c.fillText('500 Ft', 0, 17);
  c.restore();
}
// the new sign's painted face, in board units (170 × 150); 'p' reveals parts as they are painted
function boardFace(c, p = {}) {
  const r = k => clamp(p[k] ?? 1);
  c.fillStyle = '#f7efd9'; c.beginPath(); c.roundRect(0, 0, 170, 150, 6); c.fill();
  c.strokeStyle = NAVY; c.lineWidth = 3.2; c.save(); c.beginPath(); c.rect(0, 0, 170 * r('frame'), 150); c.clip(); c.beginPath(); c.roundRect(6, 6, 158, 138, 5); c.stroke(); c.restore();
  // the art: a lemon, its leaf, a slice, a little sun
  const a = r('art');
  if (a > 0) { c.save(); c.globalAlpha = Math.min(1, a * 2.2); c.fillStyle = GOLD; c.beginPath(); c.ellipse(28, 120, 13 * Math.min(1, a * 1.6), 9 * Math.min(1, a * 1.6), -.4, 0, 7); c.fill(); c.fillStyle = '#2f7180'; c.beginPath(); c.ellipse(38, 108, 7, 3, -.9, 0, 7); c.fill(); c.restore(); }
  if (a > .4) { const k = Math.min(1, (a - .4) / .6); c.save(); c.translate(150, 22); c.scale(k, k); c.fillStyle = GOLD; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 2.2; c.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283; c.beginPath(); c.moveTo(Math.cos(an) * 11, Math.sin(an) * 11); c.lineTo(Math.cos(an) * 16, Math.sin(an) * 16); c.stroke(); } c.restore(); }
  const line = (txt, size, y, k, col = NAVY) => { if (k <= 0) return; c.save(); c.font = `${size}px ${FONT}`; const tw = c.measureText(txt).width; c.beginPath(); c.rect(85 - tw / 2 - 4, y - size, (tw + 8) * k, size * 1.6); c.clip(); c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 85, y); c.restore(); };
  line('Házi limonádé', 27, 32, r('l1'));
  line('friss citromból', 21, 58, r('l2'), '#2a5a9a');
  line('a forró nyári napokra', 16.5, 82, r('l3'));
  if (r('price') > 0) { line('500 Ft', 25, 122, r('price')); c.strokeStyle = GOLD2; c.lineWidth = 2; if (r('price') >= 1) { c.beginPath(); c.ellipse(85, 121, 42, 16, -.05, 0, 7); c.stroke(); } }
}
function aBoard(c, t) {   // the A-frame board on the pavement
  const { x0, x1, y0, y1, feet } = BOARD, w = x1 - x0;
  c.fillStyle = 'rgba(5,6,25,.3)'; c.beginPath(); c.ellipse((x0 + x1) / 2, feet + 2, w * .6, 9, 0, 0, 7); c.fill();
  c.fillStyle = '#7a5232'; c.fillRect(x0 + 10, y1 - 4, 8, feet - y1 + 4); c.fillRect(x1 - 18, y1 - 4, 8, feet - y1 + 4); c.fillRect(x0 + 28, y1 - 20, 6, feet - y1 + 14); c.fillRect(x1 - 34, y1 - 20, 6, feet - y1 + 14);
  c.fillStyle = '#9a6a42'; c.beginPath(); c.roundRect(x0 - 5, y0 - 5, w + 10, y1 - y0 + 10, 8); c.fill();
  c.save(); c.translate(x0, y0); c.scale(w / 170, (y1 - y0) / 150); boardFace(c); c.restore();
}
function stand(c, S, t) {
  const st = S.stand, { x0, x1, front, top, back } = ST;
  c.fillStyle = 'rgba(5,6,25,.3)'; c.beginPath(); c.ellipse((x0 + x1) / 2 + 10, front + 4, (x1 - x0) * .6, 12, 0, 0, 7); c.fill();
  c.fillStyle = '#6e4a2c'; c.beginPath(); c.moveTo(x0 + 6, back); c.lineTo(x1 - 6, back); c.lineTo(x1, top); c.lineTo(x0, top); c.fill();
  c.fillStyle = lin(c, 0, back, 0, top, [[0, '#d7ad7a'], [1, '#c39462']]); c.beginPath(); c.moveTo(x0 + 6, back); c.lineTo(x1 - 6, back); c.lineTo(x1, top - 2); c.lineTo(x0, top - 2); c.fill();
  c.fillStyle = lin(c, x0, 0, x1, 0, [[0, '#b9875a'], [.5, '#c99766'], [1, '#a77650']]); c.fillRect(x0, top, x1 - x0, front - top);
  c.strokeStyle = 'rgba(70,40,15,.45)'; c.lineWidth = 2; for (let yy = top + 22; yy < front; yy += 22) { c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy); c.stroke(); }
  c.fillStyle = '#8a5d38'; c.fillRect(x0, top, 10, front - top); c.fillRect(x1 - 10, top, 10, front - top); c.fillRect(x0, top, x1 - x0, 7);
  // a striped gold-and-cream awning on two posts, and a crate of lemons at the side
  c.fillStyle = '#8a5d38'; c.fillRect(x0 + 4, 1468, 7, back - 1468 + 2); c.fillRect(x1 - 11, 1468, 7, back - 1468 + 2);
  for (let i = 0; i < 8; i++) { const ax = x0 - 14 + i * (x1 - x0 + 28) / 8, aw = (x1 - x0 + 28) / 8; c.fillStyle = i % 2 ? CREAM : GOLD;
    c.beginPath(); c.moveTo(ax + 6, 1440); c.lineTo(ax + aw + 6, 1440); c.lineTo(ax + aw, 1478); c.arc(ax + aw / 2, 1478, aw / 2, 0, Math.PI); c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(0,0,30,.15)'; c.fillRect(x0 - 8, 1472, x1 - x0 + 16, 4);
  c.fillStyle = '#9a6a42'; c.fillRect(x0 - 62, front - 30, 54, 30); c.fillStyle = '#7a5232'; c.fillRect(x0 - 62, front - 18, 54, 3);
  for (const [lx, ly] of [[-52, -32], [-38, -36], [-24, -33], [-45, -40], [-30, -42], [-16, -38]]) { c.fillStyle = GOLD; c.beginPath(); c.ellipse(x0 + lx, front + ly, 9, 6.5, .2, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x0 + lx - 3, front + ly - 2, 2.2, 0, 7); c.fill(); }
  if (st.paper) paperSign(c, 880, 1656);
  // on top: the pitcher (unless it is in his hands), the stack of cups, the tin, the poured cups, the coin stacks
  if (!st.pAt) pitcher(c, ...ST.pitcher, st.pitcher);
  stackCups(c, ...ST.cups, st.cups);
  tin(c, ...ST.tin, st.tin);
  for (const cu of st.served) lcup(c, cu.x, cu.y, 24, cu.lvl, cu.ice);
  (st.stacks || []).forEach((n, i) => { for (let k = 0; k < n; k++) coin(c, 905 + i * 20, 1604 - k * 3.5, 6); });
}
function box(c, n) {   // the cardboard box behind the stand, the cups go in
  const x = 1012, y = 1668; c.fillStyle = '#b48a5a'; c.fillRect(x - 26, y - 40, 52, 40); c.fillStyle = '#9a7246'; c.beginPath(); c.moveTo(x - 26, y - 40); c.lineTo(x - 36, y - 52); c.lineTo(x + 14, y - 52); c.lineTo(x + 26, y - 40); c.fill();
  if (n) for (let i = 0; i < 3; i++) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x - 2 + i, y - 44 - i * 3, 9, 2.5, 0, 0, 7); c.stroke(); }
}
function gate(c, open) {   // the garden gate, hinged on its left post, swinging in towards the house
  const [g0, g1] = G.gate, fy = G.fenceY, fh = G.fenceH, w = (g1 - g0) * Math.cos(open * 1.25), col = '#8d887f';
  c.fillStyle = '#797163'; c.fillRect(g0, fy - fh * .72 - open * 8, w, 9); c.fillRect(g0, fy - fh * .28 - open * 8, w, 9);
  for (let i = 0; i < 3; i++) { const px = g0 + (6 + i * 32) / (g1 - g0) * w, pw = 20 * Math.cos(open * 1.25); c.fillStyle = col; c.beginPath(); c.moveTo(px, fy - open * 8); c.lineTo(px, fy - fh + 10 - open * 8); c.lineTo(px + pw / 2, fy - fh - open * 8); c.lineTo(px + pw, fy - fh + 10 - open * 8); c.lineTo(px + pw, fy - open * 8); c.closePath(); c.fill(); }
}
function houseDoor(c, open, look) {
  const d = G.door, w = d.x1 - d.x0, ww = w * Math.cos(open * 1.2);
  if (open > .01) { c.fillStyle = look === 'dusk' ? '#5a3a20' : '#2a1d28'; c.fillRect(d.x0, d.y0, w, d.y1 - d.y0); }
  c.fillStyle = lin(c, d.x0, 0, d.x0 + ww, 0, [[0, '#1f2c66'], [1, '#162152']]); c.fillRect(d.x0, d.y0, ww, d.y1 - d.y0);
  if (ww > 20) { c.fillStyle = look === 'dusk' ? '#e9b860' : '#3f5592'; c.fillRect(d.x0 + ww * .25, d.y0 + 24, ww * .5, 60); c.fillStyle = GOLD; c.beginPath(); c.arc(d.x0 + ww * .82, d.y0 + 110, 5, 0, 7); c.fill(); }
}
// a bicycle, drawn to the mascots' proportions: front wheel to the left (it rides in from the right)
function bike(c, bx, crank) {
  const wy = LANE - 30, fw = bx - 58, rw = bx + 62, bb = [bx + 4, 1764], sd = [bx + 14, 1726], hd = [bx - 44, 1702], fr = '#efe4c8';
  c.fillStyle = 'rgba(5,6,25,.3)'; c.beginPath(); c.ellipse(bx, LANE + 2, 105, 9, 0, 0, 7); c.fill();
  for (const [wx, k] of [[fw, 0], [rw, 1]]) { c.strokeStyle = '#16161e'; c.lineWidth = 6; c.beginPath(); c.arc(wx, wy, 27, 0, 7); c.stroke(); c.strokeStyle = 'rgba(220,225,235,.6)'; c.lineWidth = 1.2;
    const a0 = (bx * -.037) % 6.283; for (let i = 0; i < 6; i++) { const a = a0 + i / 6 * Math.PI; c.beginPath(); c.moveTo(wx + Math.cos(a) * 24, wy + Math.sin(a) * 24); c.lineTo(wx - Math.cos(a) * 24, wy - Math.sin(a) * 24); c.stroke(); }
    c.fillStyle = '#9aa0ae'; c.beginPath(); c.arc(wx, wy, 4, 0, 7); c.fill(); }
  c.strokeStyle = fr; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(rw, wy); c.lineTo(...bb); c.lineTo(...sd); c.lineTo(rw, wy); c.moveTo(...bb); c.lineTo(...hd); c.lineTo(sd[0] - 4, sd[1] + 6); c.moveTo(...hd); c.lineTo(fw, wy); c.stroke();
  c.strokeStyle = '#2a2a33'; c.lineWidth = 4; c.beginPath(); c.moveTo(...hd); c.lineTo(hd[0] - 4, hd[1] - 24); c.lineTo(hd[0] - 18, hd[1] - 26); c.stroke();
  c.fillStyle = '#2a2a33'; c.beginPath(); c.ellipse(sd[0] + 2, sd[1] - 3, 13, 4, 0, 0, 7); c.fill();
  c.strokeStyle = '#3a3a44'; c.lineWidth = 3; for (const s of [0, Math.PI]) { const px = bb[0] + Math.cos(crank + s) * 11, py = bb[1] + Math.sin(crank + s) * 11; c.beginPath(); c.moveTo(...bb); c.lineTo(px, py); c.stroke(); c.fillRect(px - 5, py - 1.5, 10, 3); }
  c.fillStyle = GOLD2; c.beginPath(); c.arc(...bb, 6, 0, 7); c.fill();
  c.fillStyle = '#c8c8d0'; c.beginPath(); c.arc(hd[0] - 12, hd[1] - 28, 3.5, 0, 7); c.fill();   // the bell
}
function bubble(c, p) {   // a "!" pops over a head
  const h = BASE_H * (p.s || 1) * 1.08, b = p.bang, x = p.x, y = p.y - 1.1 * h, r = .16 * h * (b < .3 ? b / .3 * 1.15 : 1);
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - r * .3, y + r * .8); c.lineTo(x - r * .1, y + r * 1.35); c.lineTo(x + r * .25, y + r * .85); c.fill();
  c.fillStyle = '#e8573a'; c.font = `${Math.round(r * 1.5)}px "Lilita One"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', x, y + r * .08);
}
function drawChar(c, p, t, S) {
  if (p.vis === false) return;
  c.save(); if (p.alpha !== undefined) c.globalAlpha = p.alpha;
  drawMascot(c, { ...p, alpha: undefined });
  if (p.cupAt) lcup(c, p.cupAt[0], p.cupAt[1] + 12, 24, p.cupLvl ?? 1);
  if (p.coinAt) coin(c, p.coinAt[0], p.coinAt[1] + 4, 5.5);
  if (p.id === 'boy' && S.stand && S.stand.pAt) { const q = S.stand.pAt; pitcher(c, q.x, q.y, S.stand.pitcher, q.rot, S.stand.drop); }
  if (p.id === 'boy' && S.stand && S.stand.stackAt) stackCups(c, S.stand.stackAt[0], S.stand.stackAt[1] + 14, 4);
  c.restore();
  if (p.bang > 0) bubble(c, p);
}

// —— the street ——
const ANCHOR = [850, 1500];
// the sun crosses the sky through the afternoon: high on the right, setting low on the left
function sunPos(tod) { return tod <= 1 ? [lerp(1180, 250, tod), lerp(560, 1200, .4 * tod + .6 * tod * tod)] : [250, 1200 + (tod - 1) * 300]; }
// the clock on the house wall: the hour, from the story time (scenes can set their own)
function clockAt(t) { if (t < 6.7) return 13.2; if (t < 11.3) return lerp(13.2, 18.2, ss(seg(t, 6.75, 11.25))); if (t < 37.2) return 18.2 + (t - 11.3) * .02; if (t < 40) return lerp(18.7, 20.5, ss(seg(t, 37.3, 39.7))); if (t < 52.36) return 20.6; return 14.1; }
function wallClock(c, x, y, r, hours, dusk) {
  c.fillStyle = 'rgba(0,0,30,.25)'; c.beginPath(); c.arc(x + 3, y + 4, r + 5, 0, 7); c.fill();
  c.fillStyle = '#c9a04a'; c.beginPath(); c.arc(x, y, r + 5, 0, 7); c.fill(); c.fillStyle = dusk ? '#c9c4b4' : '#f7f0de'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = NAVY; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.arc(x + Math.sin(a) * r * .8, y - Math.cos(a) * r * .8, i % 3 ? 1.6 : 2.6, 0, 7); c.fill(); }
  const hand = (a, l, wd) => { c.lineWidth = wd; c.strokeStyle = NAVY; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a) * l, y - Math.cos(a) * l); c.stroke(); };
  hand(hours / 12 * Math.PI * 2, r * .5, 4); hand((hours % 1) * Math.PI * 2, r * .75, 2.5); c.fillStyle = NAVY; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill();
}
// soft clouds drifting across; in a time-lapse they race
function clouds(c, t, look) {
  if (look === 'dusk') return; const off = 18 * t + 1700 * ss(seg(t, 6.75, 11.3)) + 900 * ss(seg(t, 37.2, 39.7));
  c.fillStyle = look === 'gold' ? 'rgba(255,215,190,.38)' : 'rgba(225,235,255,.4)';
  for (const [bx, by, s] of [[100, 520, 1], [900, 380, .75], [1600, 700, .9], [2200, 470, .7]]) { const cx = ((bx + off) % 2600) - 450;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(cx + (i - 2.5) * 50 * s, by - Math.sin(i / 5 * Math.PI) * 36 * s, 66 * s, 36 * s, 0, 0, 7); c.fill(); } }
}
function drawStreet(c, S, t) {
  const cam = S.cam, looks = [[S.look, 1]]; if (S.blend && S.blend.u > 0) looks.push([S.blend.to, S.blend.u]);
  const each = (key, fn, dx = 0, dy = 0) => { for (const [L, a] of looks) { c.save(); c.globalAlpha = a; c.drawImage(get(key + L, () => fn(L)), dx, dy); c.restore(); } };
  const p = .3; each('sky', SET.skySet, (cam[0] - ANCHOR[0]) * (1 - p), (cam[1] - ANCHOR[1]) * (1 - p));
  const tod = S.tod ?? 0, [sx, sy] = sunPos(tod), sunA = clamp(1.6 - tod);
  if (sunA > 0) { const r = lerp(46, 64, Math.min(1, tod)); glow(c, sx, sy, r * 10, .75 * sunA, GOLDGLOW); c.save(); c.globalAlpha = sunA; c.fillStyle = tod > .6 ? '#f2a03e' : '#f7c44e'; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill(); c.restore(); glow(c, sx, sy, r * 3, .5 * sunA, GOLDGLOW); }
  if (S.blend && S.blend.u > 0) { c.save(); c.globalAlpha = 1 - S.blend.u; clouds(c, t, S.look); c.globalAlpha = S.blend.u; clouds(c, t, S.blend.to); c.restore(); } else clouds(c, t, S.look);
  each('street', SET.streetSet);
  houseDoor(c, S.door || 0, S.look);
  wallClock(c, 915, 1085, 34, S.clock ?? clockAt(t), S.look === 'dusk');
  if (S.look === 'dusk' || S.porch) { const d = G.door; glow(c, d.x1 + 34, d.y0 + 44, 160, .7); glow(c, 720 + 65, 1230, 220, .35); glow(c, 980 + 65, 1230, 220, .35); }
  // long afternoon shadows of the stand and the board, away from the sun
  const sh = clamp(tod), dir = clamp((880 - sx) / 300, -1.4, 2.4);   // the shadows swing round as the sun moves
  c.fillStyle = `rgba(8,12,45,${.18 + .12 * sh})`;
  c.beginPath(); c.moveTo(ST.x0, ST.front); c.lineTo(ST.x1, ST.front); c.lineTo(ST.x1 + 60 * dir, ST.front + 26); c.lineTo(ST.x0 + 60 * dir, ST.front + 26); c.fill();
  if (S.board) { c.beginPath(); c.moveTo(BOARD.x0, BOARD.feet); c.lineTo(BOARD.x1, BOARD.feet); c.lineTo(BOARD.x1 + 90 * dir, BOARD.feet + 30); c.lineTo(BOARD.x0 + 90 * dir, BOARD.feet + 30); c.fill(); }
  const items = [];
  items.push({ y: G.fenceY, f: () => { each('fence', SET.fenceSet); gate(c, S.gate || 0); } });
  if (S.stand) { items.push({ y: ST.front, f: () => stand(c, S, t) }); if (S.stand.box) items.push({ y: 1668, f: () => box(c, S.stand.box) }); }
  if (S.board) items.push({ y: BOARD.feet, f: () => aBoard(c, t) });
  if (S.bike) items.push({ y: LANE - .5, f: () => bike(c, S.bike.x, S.bike.crank) });
  for (const p of S.chars) if (p.vis !== false) items.push({ y: p.id === 'rider' ? LANE + 1 : p.y, f: () => drawChar(c, p, t, S) });
  items.sort((a, b) => a.y - b.y).forEach(it => it.f());
  each('crown', SET.crownSet);
  if (S.hot) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lin(c, 0, 500, 0, 1900, [[0, 'rgba(255,190,110,.16)'], [1, 'rgba(255,190,110,0)']]); c.fillRect(-500, 0, 3000, 2600); c.restore(); }
  if (S.timelapse > 0 && S.timelapse < 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .06 * Math.sin(S.timelapse * Math.PI); c.fillStyle = '#ffd890'; c.fillRect(-500, 0, 3000, 2600); c.restore(); }
}

// —— top-down close-ups on the table: writing the first sign, painting the new one ——
const DESK = () => get('desk', () => SET.deskSet(1080, 1920));
function hand(c, x, y, ang = -.6, tool = 'marker', capOn = false) {   // the boy's white mitten from the bottom right, holding a marker or a brush
  const ax = x + Math.cos(ang) * -900, ay = y + Math.sin(ang) * -900 + 900;
  c.save(); c.lineCap = 'round';
  c.strokeStyle = 'rgba(0,0,30,.25)'; c.lineWidth = 92; c.beginPath(); c.moveTo(x + 40, y + 70); c.lineTo(x + 460, y + 900); c.stroke();
  if (tool === 'marker') { c.strokeStyle = NAVY; c.lineWidth = 26; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 80, y + 150); c.stroke(); c.fillStyle = NAVY; c.beginPath(); c.moveTo(x - 9, y - 4); c.lineTo(x + 2, y - 26); c.lineTo(x + 11, y + 2); c.fill();
    if (capOn) { c.strokeStyle = '#efe4c8'; c.lineWidth = 30; c.beginPath(); c.moveTo(x - 4, y - 8); c.lineTo(x + 20, y + 38); c.stroke(); } }
  else { c.strokeStyle = '#9a6a42'; c.lineWidth = 16; c.beginPath(); c.moveTo(x + 6, y + 10); c.lineTo(x + 90, y + 170); c.stroke(); c.fillStyle = '#c9c9d0'; c.fillRect(x - 6, y - 6, 18, 22); c.fillStyle = GOLD2; c.beginPath(); c.ellipse(x - 2, y - 14, 10, 16, -.45, 0, 7); c.fill(); }
  const g = c.createLinearGradient(x, y, x + 400, y + 800); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bfc4d4');
  c.strokeStyle = g; c.lineWidth = 78; c.beginPath(); c.moveTo(x + 60, y + 110); c.lineTo(x + 470, y + 900); c.stroke();
  c.fillStyle = g; c.beginPath(); c.arc(x + 54, y + 96, 58, 0, 7); c.fill();
  c.restore();
}
function drawDesk(c, S, t) {
  c.drawImage(DESK(), 0, 0);
  if (S.mode === 'write') {
    // the stand's top, seen from above: the pitcher and the cups at the edges
    c.fillStyle = 'rgba(0,0,30,.25)'; c.beginPath(); c.arc(130, 380, 150, 0, 7); c.fill(); c.fillStyle = 'rgba(230,240,255,.35)'; c.beginPath(); c.arc(120, 360, 150, 0, 7); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.arc(120, 360, 128, 0, 7); c.fill(); c.fillStyle = '#f8e8a0'; c.beginPath(); c.arc(80, 330, 30, 0, 7); c.fill();
    for (const [x, y] of [[980, 1650], [1060, 1560]]) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 8; c.beginPath(); c.arc(x, y, 80, 0, 7); c.stroke(); }
    c.save(); c.translate(540, 1000); c.rotate(-.025);
    c.fillStyle = 'rgba(0,0,30,.3)'; c.fillRect(-382, -262, 780, 540); c.fillStyle = '#fbf8f0'; c.fillRect(-390, -270, 780, 540);
    c.fillStyle = NAVY; c.textAlign = 'left'; c.textBaseline = 'middle';
    const L = (txt, size, y, k) => { c.font = `${size}px ${FONT}`; const tw = c.measureText(txt).width, x0 = -tw / 2; if (k > 0) { c.save(); c.beginPath(); c.rect(x0 - 10, y - size, (tw + 20) * k, size * 1.8); c.clip(); c.fillText(txt, x0, y); c.restore(); } return [x0, tw]; };
    const [a0, aw] = L('Limonádé', 172, -60, S.w1), [b0, bw] = L('500 Ft', 150, 130, S.w2);
    c.restore();
    // the marker follows the line as it is written
    let tip;
    if (S.w2 > 0) tip = [540 + b0 + bw * S.w2, 1130 + 40 * Math.sin(S.w2 * 30)];
    else if (S.w1 > 0) tip = [540 + a0 + aw * S.w1, 940 + 46 * Math.sin(S.w1 * 44)];
    else tip = [540 + a0 - 20, 940 + 20];
    if (S.w1 >= 1 && S.w2 <= 0) tip = [lerp(540 + a0 + aw, 540 + b0, ss(seg(t, 5.6, 5.72))), lerp(940, 1130, ss(seg(t, 5.6, 5.72)))];
    if (S.w2 >= 1) tip = [540 + b0 + bw + 30, 1130];
    const off = (1 - S.handIn) * 900 + S.handOut * 900;
    if (S.cap < 1 && S.handIn > 0) { /* cap on */ }
    const capPos = [lerp(tip[0] + off, 880, ss(S.cap)), lerp(tip[1] + off, 1420, ss(S.cap)) - Math.sin(S.cap * Math.PI) * 160];
    hand(c, tip[0] + off, tip[1] + off, -.6, 'marker', S.cap <= 0);
    if (S.cap > 0) { c.save(); c.translate(...capPos); c.rotate(S.cap * 4); c.fillStyle = '#efe4c8'; c.beginPath(); c.roundRect(-16, -30, 32, 60, 10); c.fill(); c.restore(); }
  } else {
    // painting: the board flat on the table, a jar of gold paint
    c.fillStyle = 'rgba(0,0,30,.3)'; c.beginPath(); c.arc(140, 1650, 110, 0, 7); c.fill(); c.fillStyle = '#e9e4d8'; c.beginPath(); c.arc(130, 1640, 105, 0, 7); c.fill(); c.fillStyle = GOLD2; c.beginPath(); c.arc(130, 1640, 86, 0, 7); c.fill();
    const p = S.p, k = { frame: seg(p, 0, .22), art: seg(p, .2, .5), l1: seg(p, .5, .72), l2: seg(p, .72, .86), l3: seg(p, .86, 1), price: 0 };
    c.save(); c.translate(540 - 410, 940 - 362); c.scale(820 / 170, 724 / 150);
    c.fillStyle = 'rgba(0,0,30,.3)'; c.fillRect(4, 6, 170, 150); boardFace(c, k); c.restore();
    const B = (bx, by) => [540 - 410 + bx * 820 / 170, 940 - 362 + by * 724 / 150];
    let tip = B(170 * k.frame, 6);
    if (p > .2) tip = B(28 + 14 * Math.cos(p * 60), 118 + 10 * Math.sin(p * 60));
    if (p > .35 && p < .5) tip = B(150 + 10 * Math.cos(p * 70), 22 + 10 * Math.sin(p * 70));
    if (p >= .5) { const ln = p < .72 ? [k.l1, 32, 130] : p < .86 ? [k.l2, 58, 112] : [k.l3, 82, 120]; tip = B(85 - ln[2] / 2 + ln[2] * ln[0], ln[1] + 6 * Math.sin(p * 90)); }
    const off = (1 - ss(seg(t, 21.66, 21.85))) * 900;
    hand(c, tip[0] + off, tip[1] + off, -.6, 'brush');
  }
}

// —— a glass of lemonade: plain, then a cold drink on a hot day ——
function drawGlass(c, S, t) {
  const m = S.m;
  c.fillStyle = lin(c, 0, 0, 0, 1920, [[0, '#1e2a5c'], [1, '#0d1438']]); c.fillRect(0, 0, 1080, 1920);
  if (m > 0) { c.save(); c.globalAlpha = m; c.fillStyle = lin(c, 0, 0, 0, 1500, [[0, '#1d48a8'], [.65, '#4f84d6'], [1, '#9cc3f0']]); c.fillRect(0, 0, 1080, 1920);
    glow(c, 820, 380, 900, .8, GOLDGLOW); c.fillStyle = '#f6d27a'; c.beginPath(); c.arc(820, 380, 120, 0, 7); c.fill(); glow(c, 820, 380, 300, .6, GOLDGLOW);
    c.strokeStyle = 'rgba(255,240,200,.12)'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { const y = 1180 + i * 40; c.beginPath(); for (let x = 0; x <= 1080; x += 20) c.lineTo(x, y + Math.sin(x * .02 + t * 6 + i) * 6); c.stroke(); }
    c.restore(); }
  // the table top
  c.fillStyle = lin(c, 0, 1380, 0, 1920, [[0, '#c99766'], [1, '#8a5a34']]); c.fillRect(0, 1380, 1080, 540); c.fillStyle = 'rgba(255,240,210,.25)'; c.fillRect(0, 1380, 1080, 8);
  const x = 540, y = 1420, h = 560, tw = 190, bw = 145, top = y - h, lvl = .8;
  c.fillStyle = 'rgba(0,0,30,.3)'; c.beginPath(); c.ellipse(x + 40, y + 6, 200, 26, 0, 0, 7); c.fill();
  const path = () => { c.beginPath(); c.moveTo(x - tw, top); c.lineTo(x + tw, top); c.lineTo(x + bw, y); c.lineTo(x - bw, y); c.closePath(); };
  c.save(); path(); c.clip();
  const ly = y - h * .92 * lvl; c.fillStyle = lin(c, 0, ly, 0, y, [[0, m > 0 ? '#f9d76e' : '#e8c057'], [1, m > 0 ? '#e4a836' : '#c99a3a']]); c.fillRect(x - tw, ly, tw * 2, y - ly);
  if (m > 0) { for (let i = 0; i < 26; i++) { const ph = ((t * (.3 + hash(i) * .3)) + hash(i * 3)) % 1, bx = x - 120 + hash(i * 7) * 240, by = y - 20 - ph * (y - ly - 30); c.fillStyle = `rgba(255,255,255,${.5 * m * (1 - ph)})`; c.beginPath(); c.arc(bx, by, 4 + hash(i) * 6, 0, 7); c.fill(); }
    S.ices.forEach((k, i) => { if (k <= 0) return; const ix = x - 90 + i * 85, iy = ly + 30 + Math.sin(t * 2 + i) * 6 + (i % 2) * 40; c.save(); c.translate(ix, iy); c.rotate(.3 * i - .3); c.scale(k, k); c.fillStyle = 'rgba(240,250,255,.6)'; c.beginPath(); c.roundRect(-45, -45, 90, 90, 16); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-30, -32, 22, 10); c.restore(); }); }
  c.restore();
  if (S.straw > 0) { c.save(); c.beginPath(); c.rect(0, 0, 1080, top + 4 + 999 * 0); c.restore(); c.save(); c.translate(x + 70, top + 40); c.rotate(.25); const L = 520 * S.straw; c.fillStyle = CREAM; c.fillRect(-14, -L, 28, L + 380);
    c.fillStyle = '#26346f'; for (let k = -L; k < 380; k += 56) c.fillRect(-14, k, 28, 24); c.restore(); }
  path(); c.fillStyle = 'rgba(230,240,255,.12)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 7; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(x - tw * .72, top + 60, 18, h * .7);
  if (m > 0) { c.save(); path(); c.clip(); for (let i = 0; i < 60; i++) { const dx = x - tw + hash(i * 1.7) * tw * 2, dy = top + 60 + ((hash(i * 2.9) * h + t * (hash(i) > .8 ? 60 : 4)) % (h - 80)), r = 4 + hash(i * 5) * 7;
    c.fillStyle = `rgba(255,255,255,${.55 * m})`; c.beginPath(); c.ellipse(dx, dy, r * .8, r, 0, 0, 7); c.fill(); } c.restore(); }
  if (S.lemon > 0) { c.save(); c.translate(x - tw + 30, top + 10); c.scale(S.lemon, S.lemon); c.rotate(-.3); c.fillStyle = GOLD2; c.beginPath(); c.arc(0, 0, 105, 0, 7); c.fill(); c.fillStyle = '#f7e39a'; c.beginPath(); c.arc(0, 0, 90, 0, 7); c.fill();
    c.strokeStyle = '#f2cf6a'; c.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 82, Math.sin(a) * 82); c.stroke(); } c.fillStyle = '#8a5d38'; c.fillRect(-14, 70, 28, 60); c.restore(); }
}

// —— assembling a frame ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
// the locked 23 Team end card (ANIMATION-STYLE.md): the logo's exact shape in soft pale blue at 75%, 30% of the frame width, centred on the dark blue
const END_BLUE = '#0b1438';
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();
function endCard(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  const u = ss(seg(t, STORY + .15, STORY + 1.05)), w = W * .30, h = w * LOGO.height / LOGO.width, sc = 1.04 - .04 * u;
  c.save(); c.globalAlpha = u * .75; c.filter = u < 1 ? `blur(${(1 - u) * 6 * K}px)` : 'none';
  c.translate(W / 2, H / 2); c.scale(sc, sc); c.drawImage(LOGO_W, -w / 2, -h / 2, w, h); c.restore();
}
function vignette(c, a = .4) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H * .48, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, `rgba(4,6,30,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function drawScene(c, S, t, cy = H / 2) {
  if (S.set === 'st') { camera(c, S.cam, S.shake || 0, t, cy); drawStreet(c, S, t); }
  else if (S.set === 'desk') { camera(c, S.cam, 0, t, cy); drawDesk(c, S, t); }
  else if (S.set === 'glass') { camera(c, S.cam, 0, t, cy); drawGlass(c, S, t); }
}
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const S = sceneAt(t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b1235'; c.fillRect(0, 0, W, H);
  if (S.set === 'split') {
    for (const [half, sc] of [[0, S.top], [1, S.bot]]) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.beginPath(); c.rect(0, half * H / 2, W, H / 2); c.clip(); drawScene(c, sc, t, H / 4 + half * H / 2); c.restore(); }
    c.setTransform(1, 0, 0, 1, 0, 0); const lw = W * S.open; c.fillStyle = CREAM; c.fillRect((W - lw) / 2, H / 2 - 4 * K, lw, 8 * K);
  } else drawScene(c, S, t);
  vignette(c, S.set === 'glass' ? .3 : .4);
  if (S.bloom > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = S.bloom; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }   // the last shot fades into the dark blue
}

// sound cues: the fixed hits, plus a footstep wherever a walking character's foot lands
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
{ const last = {};
  for (let t = 0; t < STORY; t += 1 / 60) { const S = sceneAt(t); if (S.set !== 'st') continue;
    for (const p of S.chars) { if (!p.id || p.vis === false) continue; const key = p.id;
      if (p.walk > .15) { const k = Math.floor((p.phi - Math.PI / 2) / Math.PI); if (last[key] !== undefined && k !== last[key]) EV.push({ t: +t.toFixed(3), type: 'step', who: p.skin === 'owner' ? (p.id === 'dad' ? 'dad' : 'boy') : 'guest', pan: Math.max(-1, Math.min(1, (p.x - S.cam[0]) * S.cam[2] / 540)), v: p.s || 1 }); last[key] = k; }
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
