// Más márka (Same product, different brand): an original split-screen simulation in the format of the boss video (HU 011, 50% retention to the end).
// Top: the cheap shop: a scribbled „OLCSÓ!!!” sign, plain bottles, a shouting seller with a megaphone; he races ahead at first, then keeps cutting
// his price while customers taste, pull faces and leave, until his giant sale sign falls on his head. Bottom: the brand (LIMÓ): a clean logo,
// labelled bottles, a smiling owner; customers photograph the bottle and share it, more come, he even raises the price and opens a second shop.
// Lesson: competing only on price loses, building a brand wins. One scene, no voice, original music; ends where it loops (no end card).
// Colours: the locked brand palette (black, dark blue #00113F, turquoise #2ED3C6, white); the cheap shop in dull greys and a red sign.
import { start, ss, seg, clamp, lerp, ease3, hash, K } from './kit.js';
import { drawMascot } from './char2d.js';
await document.fonts.load('700 40px "Montserrat"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű');
const STORY = 22.0, DUR = 22.0;   // v2 (user 2026-11-14): longer and calmer, customers one at a time
const REDT = '#ff5a5a', TURQ = '#2ED3C6', WHITE_T = '#F4F7FF', GREENT = '#2ED3C6', NAVY = '#03122e', CREAM = '#F4F7FF', GOLD = '#ffd36a';
function heartShape(c, x, y, r, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = '#ff7aa2'; c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.3, y, x - r * .8, y - r, x, y - r * .35); c.bezierCurveTo(x + r * .8, y - r, x + r * 1.3, y, x, y + r * .9); c.fill(); c.restore(); }
const spring = (t, at, d = .35, b = .45) => { if (t < at) return 0; const u = (t - at) / d; return 1 - Math.exp(-4.5 * u) * Math.cos(u * Math.PI * (1 + b * 2)) ; };
const pop = (t, at, d = .3) => t < at ? 0 : Math.min(1.12, spring(t, at, d));
const rr = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
const ell = (c, x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); c.fill(); };
function text(c, s, x, y, size, col, align = 'center', o = {}) { c.save(); c.font = `700 ${size}px "Montserrat"`; c.textAlign = align; c.textBaseline = 'middle'; if (o.ls) c.letterSpacing = o.ls + 'px';
  if (o.stroke) { c.lineJoin = 'round'; c.strokeStyle = o.stroke; c.lineWidth = o.sw || size * .16; c.strokeText(s, x, y); } c.fillStyle = 'rgba(5,6,25,.35)'; c.fillText(s, x + 2, y + 4); c.fillStyle = col; c.fillText(s, x, y); c.restore(); }
function star(c, x, y, r) { c.fillStyle = '#ffd36a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
const fmt = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft';
const KF = (t, keys) => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const u = ss(seg(t, keys[i - 1][0], keys[i][0])); return keys[i].slice(1).map((v, k) => lerp(keys[i - 1][k + 1], v, u)); } return keys[keys.length - 1].slice(1); };
function coin(c, x, y, r = 12, k = 1) { if (k <= 0) return; ell(c, x, y + 2, r, r, '#a8741a'); ell(c, x, y, r, r, '#ffcf4a'); c.strokeStyle = '#e09a22'; c.lineWidth = r * .22; c.beginPath(); c.arc(x, y, r * .62, 0, 7); c.stroke(); ell(c, x - r * .35, y - r * .35, r * .22, r * .16, 'rgba(255,255,255,.7)'); }
function bubble(c, x, y, s, k) { if (k <= 0) return; scaled(c, x, y + 30, Math.min(1.1, k), () => { c.save(); c.font = '700 28px "Montserrat"'; const w = c.measureText(s).width + 36; c.restore();
  rr(c, x - w / 2, y - 26, w, 52, 14, '#ffffff'); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x - 10, y + 24); c.lineTo(x + 8, y + 24); c.lineTo(x - 4, y + 42); c.fill(); text(c, s, x, y + 1, 28, NAVY); }); }
function badge(c, s, x, y, k, col = GREENT, sz = 28) { if (k <= 0) return; scaled(c, x, y, Math.min(1.1, k), () => text(c, s, x, y, sz, col, 'center', { stroke: 'rgba(5,10,40,.65)', sw: 6 })); }
const SUIT = ['#3f58b8', '#2a3e8f', '#18245c'];
function limb(c, x0, y0, x1, y1, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
function headBall(c, x, y, R, grey) { const g = c.createRadialGradient(x - R * .35, y - R * .45, R * .1, x, y, R * 1.05);
  if (grey) { g.addColorStop(0, '#b9bcc4'); g.addColorStop(.5, '#8d9099'); g.addColorStop(1, '#5d606b'); } else { g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#eeeeea'); g.addColorStop(1, '#aeb4c8'); }
  c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill(); }
function face(c, x, y, R, f, kind, o = {}) { const fx = x + f * R * .35, INK = '#151018'; c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.dark && kind !== 'grim') { c.save(); c.beginPath(); c.arc(x, y, R, 0, 7); c.clip(); const g = c.createLinearGradient(0, y - R, 0, y + .15 * R); g.addColorStop(0, 'rgba(40,0,10,.55)'); g.addColorStop(.7, 'rgba(40,0,10,.35)'); g.addColorStop(1, 'rgba(40,0,10,0)'); c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 1.15 * R); c.restore(); }
  const blush = () => { for (const sd of [-1, 1]) ell(c, fx + sd * .56 * R, y + .2 * R, .14 * R, .08 * R, 'rgba(232,120,140,.45)'); };
  const happyEyes = (w = .075) => { c.strokeStyle = INK; c.lineWidth = w * R; for (const sd of [-1, 1]) { c.beginPath(); c.arc(fx + sd * .3 * R, y - .05 * R, .13 * R, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } };
  const angryBrows = () => { c.strokeStyle = INK; c.lineWidth = .13 * R; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(fx + sd * .52 * R, y - .4 * R); c.lineTo(fx + sd * .1 * R, y - .2 * R); c.stroke(); } };
  const angryEyes = (look = 0) => { for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .07 * R, .14 * R, .1 * R, '#ffffff'); ell(c, fx + sd * .3 * R + f * .05 * R, y - .06 * R + look * .04 * R, .06 * R, .06 * R, INK); } };
  if (kind === 'greedy') {   // laughing with a mouth full of coins
    happyEyes(.09); blush(); const op = o.open ?? 1, top = y + .1 * R, bot = y + (.32 + .3 * op) * R, w = .44 * R;
    c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - w, top); c.lineTo(fx + w, top); c.quadraticCurveTo(fx + w, bot, fx, bot); c.quadraticCurveTo(fx - w, bot, fx - w, top); c.fill();
    c.save(); c.clip(); rr(c, fx - w, top, 2 * w, .1 * R, 0, '#ffffff'); for (const k of [-1, 0, 1]) coin(c, fx + k * .19 * R, bot - .12 * R - (k ? 0 : .04 * R), .12 * R); c.restore(); }
  if (kind === 'gobble') {   // gobbling the coins: furious little eyes, puffed cheeks, a round mouth full of gold (no smile)
    angryBrows(); for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .06 * R, .1 * R, .05 * R, INK); ell(c, fx + sd * .6 * R, y + .22 * R, .16 * R, .12 * R, 'rgba(255,255,255,.55)'); }
    const op = o.open ?? 1, rx = .2 * R * (.7 + .3 * op), ry = .19 * R * (.6 + .4 * op), my = y + .38 * R; ell(c, fx, my, rx, ry, '#3b1220'); c.save(); c.beginPath(); c.ellipse(fx, my, rx, ry, 0, 0, 7); c.clip(); for (const k of [-1, 0, 1]) coin(c, fx + k * .12 * R, my + .06 * R - (k ? 0 : .05 * R), .1 * R); c.restore(); }
  if (kind === 'coins') {   // the close-up: his eyes turn into spinning gold coins, he gobbles and drools (greedy, evil, funny)
    angryBrows(); const sp = Math.abs(Math.cos((o.t || 0) * 9)); for (const sd of [-1, 1]) { const ex = fx + sd * .3 * R, ey = y - .07 * R; c.save(); c.translate(ex, ey); c.scale(.35 + .65 * sp, 1); coin(c, 0, 0, .15 * R); c.restore(); }
    const op = o.open ?? 1, rx = .24 * R, ry = .2 * R * (.6 + .4 * op), my = y + .42 * R; ell(c, fx, my, rx, ry, '#3b1220'); c.save(); c.beginPath(); c.ellipse(fx, my, rx, ry, 0, 0, 7); c.clip(); for (const k of [-1, 0, 1]) coin(c, fx + k * .13 * R, my + .07 * R - (k ? 0 : .05 * R), .1 * R); c.restore();
    ell(c, fx + .12 * R, my + ry + .04 * R, .07 * R, .05 * R, '#d9566a'); const dl = ((o.t || 0) * .9) % 1; ell(c, fx + .18 * R, my + ry + (.05 + .35 * dl) * R, .035 * R, (.05 + .05 * dl) * R, 'rgba(170,215,255,.85)'); }
  if (kind === 'glare') {   // a dark, furious glare: low heavy brows, red pupils, a clenched frown
    angryBrows(); for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .06 * R, .14 * R, .06 * R, '#ffffff'); ell(c, fx + sd * .3 * R + f * .04 * R, y - .055 * R, .05 * R, .05 * R, '#d81e2a'); }
    c.strokeStyle = INK; c.lineWidth = .06 * R; c.beginPath(); c.moveTo(fx - .26 * R, y + .44 * R); c.quadraticCurveTo(fx, y + .26 * R, fx + .26 * R, y + .44 * R); c.stroke();
    c.lineWidth = .03 * R; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(fx + sd * .3 * R, y + .38 * R); c.lineTo(fx + sd * .36 * R, y + .5 * R); c.stroke(); } }
  if (kind === 'side') {     // a suspicious side-eye: one brow up, one down, a wobbly flat mouth
    const tw = Math.sin((o.t || 0) * 22) * .03 * R; c.strokeStyle = INK; c.lineWidth = .09 * R; c.beginPath(); c.moveTo(fx - .5 * R, y - .3 * R + tw); c.lineTo(fx - .12 * R, y - .38 * R + tw); c.stroke(); c.beginPath(); c.moveTo(fx + .1 * R, y - .22 * R); c.lineTo(fx + .5 * R, y - .26 * R); c.stroke();
    for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .07 * R, .14 * R, sd < 0 ? .12 * R : .07 * R, '#ffffff'); ell(c, fx + sd * .3 * R - .07 * R, y - .06 * R, .055 * R, .055 * R, INK); }
    c.lineWidth = .05 * R; c.beginPath(); c.moveTo(fx - .2 * R, y + .34 * R); for (let k = 1; k <= 4; k++) c.lineTo(fx - .2 * R + k * .1 * R, y + .34 * R + (k % 2 ? .04 : -.02) * R); c.stroke(); }
  if (kind === 'smirk') {    // an evil lopsided sneer with sharp little teeth and narrow red-eyed slits (scheming)
    angryBrows(); for (const sd of [-1, 1]) { ell(c, fx + sd * .3 * R, y - .07 * R, .13 * R, .045 * R, '#ffffff'); ell(c, fx + sd * .3 * R - .03 * R, y - .065 * R, .04 * R, .04 * R, '#d81e2a'); }
    c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - .3 * R, y + .36 * R); c.quadraticCurveTo(fx, y + .42 * R, fx + .34 * R, y + .2 * R); c.quadraticCurveTo(fx + .05 * R, y + .32 * R, fx - .3 * R, y + .36 * R); c.fill();
    c.fillStyle = '#ffffff'; for (const k of [0, 1, 2]) { const bx = fx - .14 * R + k * .13 * R, by = y + .36 * R - k * .045 * R; c.beginPath(); c.moveTo(bx - .04 * R, by - .03 * R); c.lineTo(bx + .04 * R, by - .045 * R); c.lineTo(bx, by + .03 * R); c.fill(); } }
  if (kind === 'pout') {     // a red, furious pout
    angryBrows(); angryEyes(); for (const sd of [-1, 1]) ell(c, fx + sd * .56 * R, y + .22 * R, .15 * R, .09 * R, 'rgba(232,80,90,.55)');
    c.strokeStyle = INK; c.lineWidth = .06 * R; c.beginPath(); c.moveTo(fx - .16 * R, y + .44 * R); c.quadraticCurveTo(fx, y + .3 * R, fx + .16 * R, y + .44 * R); c.stroke(); }
  if (kind === 'yell') {     // furious, shouting
    angryBrows(); angryEyes(); const top = y + .16 * R, bot = y + .64 * R, wt = .38 * R, wb = .26 * R;
    c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - wt, top); c.lineTo(fx + wt, top); c.quadraticCurveTo(fx + wt, bot, fx + wb, bot); c.lineTo(fx - wb, bot); c.quadraticCurveTo(fx - wt, bot, fx - wt, top); c.fill();
    c.save(); c.clip(); rr(c, fx - wt, top, 2 * wt, .1 * R, 0, '#ffffff'); rr(c, fx - wt, bot - .08 * R, 2 * wt, .08 * R, 0, '#ffffff'); ell(c, fx, bot - .1 * R, .16 * R, .08 * R, '#d9566a'); c.restore();
    for (let k = 0; k < 5; k++) { const u2 = (((o.t || 0) * 2.4 + k / 5) % 1); ell(c, fx - .2 * R - u2 * .8 * R + k * .06 * R, y + .4 * R - .3 * R * Math.sin(u2 * Math.PI) + k * .03 * R, .035 * R * (1 - u2 * .5), .035 * R * (1 - u2 * .5), 'rgba(190,225,255,.9)'); }   // spit
    c.strokeStyle = '#e8414a'; c.lineWidth = .06 * R; const vx = x - f * .5 * R + .2 * R, vy = y - .62 * R; for (const a of [0, Math.PI / 2]) { c.beginPath(); c.moveTo(vx + Math.cos(a) * .1 * R, vy + Math.sin(a) * .1 * R); c.lineTo(vx - Math.cos(a) * .1 * R, vy - Math.sin(a) * .1 * R); c.stroke(); } }
  if (kind === 'grim') {     // grey, gritting his teeth
    angryBrows(); angryEyes(1); const mx = fx - .34 * R, my = y + .24 * R, mw = .68 * R, mh = .24 * R; rr(c, mx, my, mw, mh, .06 * R, '#f2f2f2'); c.strokeStyle = INK; c.lineWidth = .035 * R; c.beginPath(); c.roundRect(mx, my, mw, mh, .06 * R); c.stroke();
    c.beginPath(); c.moveTo(mx, my + mh / 2); c.lineTo(mx + mw, my + mh / 2); for (let k = 1; k < 5; k++) { c.moveTo(mx + mw * k / 5, my); c.lineTo(mx + mw * k / 5, my + mh); } c.stroke(); }
  if (kind === 'cheer') {    // the good boss cheering for his team: big open smile
    happyEyes(.07); blush(); const top = y + .16 * R, w = .3 * R; c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - w, top); c.quadraticCurveTo(fx, top + .46 * R, fx + w, top); c.closePath(); c.fill();
    c.save(); c.clip(); rr(c, fx - w, top, 2 * w, .07 * R, 0, '#ffffff'); ell(c, fx, top + .28 * R, .15 * R, .08 * R, '#d9566a'); c.restore(); }
  if (kind === 'kind') {     // the good boss: closed happy eyes and a warm open smile
    happyEyes(.07); blush(); const top = y + .18 * R, w = .24 * R; c.fillStyle = '#3b1220'; c.beginPath(); c.moveTo(fx - w, top); c.quadraticCurveTo(fx, top + .34 * R, fx + w, top); c.closePath(); c.fill();
    c.save(); c.clip(); ell(c, fx, top + .2 * R, .12 * R, .07 * R, '#d9566a'); c.restore(); }
  c.restore(); }
function suitTorso(c, x, top, bot, w, tie, shape) {   // a suit jacket with a white shirt V, a tie, lapels and buttons
  const g = c.createRadialGradient(x - w * .35, top + (bot - top) * .3, 10, x, (top + bot) / 2, w * 1.2); g.addColorStop(0, SUIT[0]); g.addColorStop(.55, SUIT[1]); g.addColorStop(1, SUIT[2]); c.fillStyle = g;
  c.beginPath(); if (shape === 'fat') c.ellipse(x, (top + bot) / 2, w, (bot - top) / 2, 0, 0, 7); else c.roundRect(x - w, top, 2 * w, bot - top, w * .6); c.fill();
  const vb = top + (bot - top) * .5; c.fillStyle = '#f4f4f0'; c.beginPath(); c.moveTo(x - w * .34, top + 6); c.lineTo(x + w * .34, top + 6); c.lineTo(x, vb); c.closePath(); c.fill();
  c.fillStyle = tie; c.beginPath(); c.moveTo(x - w * .09, top + 10); c.lineTo(x + w * .09, top + 10); c.lineTo(x + w * .06, top + 26); c.lineTo(x - w * .06, top + 26); c.fill();
  c.beginPath(); c.moveTo(x - w * .06, top + 26); c.lineTo(x + w * .06, top + 26); c.lineTo(x + w * .13, vb + (bot - top) * .1); c.lineTo(x, vb + (bot - top) * .2); c.lineTo(x - w * .13, vb + (bot - top) * .1); c.closePath(); c.fill();
  c.strokeStyle = SUIT[2]; c.lineWidth = 4; c.beginPath(); c.moveTo(x - w * .5, top + 14); c.lineTo(x - w * .02, vb + 4); c.moveTo(x + w * .5, top + 14); c.lineTo(x + w * .02, vb + 4); c.stroke();
  for (const k of [0, 1]) ell(c, x + w * .2, vb + 20 + k * 26, 4, 4, SUIT[2]); }
function boss(c, o) { const { x, FL, u, fat } = o, sit = o.sit || 0, lift = (1 - sit) * 34 * u, sh = o.shake ? Math.sin(o.t * 46) * 4 * u : 0;
  const R = (fat ? 82 : 60) * u, hx = x + sh + (o.lean || 0) * 40 * u, hy = FL - (fat ? 312 : 325) * u - lift;
  const shY = FL - (fat ? 242 : 255) * u - lift, shX = (fat ? 108 : 44) * u, legTop = FL - (fat ? 100 : 125) * u - (fat ? lift : 0);
  for (const sd of [-1, 1]) { const lx = x + sd * (fat ? 50 : 17) * u, st = o.walk ? Math.sin(o.walk + (sd > 0 ? Math.PI : 0)) * 16 * u : 0, kk = sd < 0 ? (o.kick || 0) : 0;
    if (kk > 0) { const ex = lx - 150 * u * kk, ey = FL - 16 * u - 110 * u * kk; limb(c, lx, legTop, ex, ey, 36 * u, SUIT[2]); ell(c, ex - 12 * u, ey, 27 * u, 13 * u, '#14121c'); continue; }
    limb(c, lx, legTop, lx + sd * (fat ? 6 : 2) * u + st, FL - 16 * u - Math.max(0, st) * .5, (fat ? 34 : 27) * u, SUIT[2]); ell(c, lx + sd * 4 * u - 6 * u, FL - 9 * u, 25 * u, 12 * u, '#14121c'); }
  const hand = (sd, tgt, rest) => { const sx = x + sd * shX, sy = shY + 8 * u; let [tx, ty] = tgt || rest; const L = (fat ? 112 : 100) * u, d = Math.hypot(tx - sx, ty - sy); if (d > L) { tx = sx + (tx - sx) / d * L; ty = sy + (ty - sy) / d * L; }
    limb(c, sx, sy, tx, ty, (fat ? 30 : 24) * u, SUIT[1]); ell(c, tx, ty, (fat ? 18 : 15) * u, (fat ? 18 : 15) * u, '#eeeeea'); };
  const restL = fat ? [x - 80 * u, FL - 150 * u - lift] : [x - 50 * u, FL - 140 * u], restR = fat ? [x + 80 * u, FL - 150 * u - lift] : [x + 50 * u, FL - 140 * u];
  const back = o.handR && !fat && !o.front; if (back) hand(1, o.handR, restR);
  if (fat) { suitTorso(c, x, FL - 292 * u - lift, FL - 58 * u - lift, 134 * u, '#f2c230', 'fat'); ell(c, x + 30 * u, FL - 118 * u - lift, 9 * u, 9 * u, '#f4f4f0'); c.strokeStyle = '#f4f4f0'; c.lineWidth = 3; for (const a of [-.6, 0, .6]) { c.beginPath(); c.moveTo(x + 30 * u + Math.cos(a) * 14 * u, FL - 118 * u - lift + Math.sin(a) * 14 * u); c.lineTo(x + 30 * u + Math.cos(a) * 22 * u, FL - 118 * u - lift + Math.sin(a) * 22 * u); c.stroke(); } } else suitTorso(c, x, FL - 272 * u, FL - 112 * u, 46 * u, '#5aa2f2', 'slim');
  hand(-1, o.handL, restL); if (!back) hand(1, o.handR, restR);
  if (fat) { c.save(); c.fillStyle = o.grey > .5 ? '#80838c' : '#d6d8de'; c.beginPath(); c.ellipse(hx + (o.f ?? -.3) * R * .2, hy + R * .78, R * .62, R * .3, 0, 0, Math.PI); c.fill(); c.restore(); }   // double chin
  headBall(c, hx, hy, R, o.grey > .5); if (o.grey > 0 && o.grey < 1) { c.save(); c.globalAlpha = o.grey; headBall(c, hx, hy, R, true); c.restore(); }
  if (o.flush > 0) { c.save(); c.globalAlpha = o.flush * .78; const g = c.createRadialGradient(hx, hy + R * .2, R * .1, hx, hy, R); g.addColorStop(0, 'rgba(235,40,40,1)'); g.addColorStop(1, 'rgba(200,30,40,.55)'); c.fillStyle = g; c.beginPath(); c.arc(hx, hy, R, 0, 7); c.fill(); c.restore(); }
  face(c, hx, hy, R, o.f ?? -.3, o.face, o); if (o.stache) villainStache(c, hx + (o.f ?? -.3) * R * .35, hy + R * .2, R, o.t, o.grey > .5); return { mouth: [hx + (o.f ?? -.3) * R * .35, hy + .38 * R], head: [hx, hy], R }; }
// —— the two shops ——
const DY = 130, TOP = { Y0: 330 + DY, kind: 'bad' }, BOT = { Y0: 990 + DY, kind: 'good' };
for (const R of [TOP, BOT]) R.FL = R.Y0 + 560;
const STALL = 760, SELLER = 830, SLOT0 = 600, SLOTW = 150;   // v3: a spaced line of at most three   // the counter, the seller behind it, the front of the queue
// the story's clock
const ZOOM_IN = 2.6, TALK_B = 2.9, GLIDE = 5.0, ZOOM_OUT = 6.6, M1 = 7.0, MONTHS = [[M1, 1], [11.2, 3], [15.4, 6]];
const CUT = [[0, 290], [7.6, 190], [10.8, 99], [14.4, 29]];      // the cheap shop keeps cutting its price…
const SALE = [[0, '−50%'], [7.6, '−70%'], [10.8, '−90%']];      // …and its sign keeps growing
const FALL = 17.6;                                              // the giant sign falls on his head
const RAISE = 12.2, SHOP2 = 16.4;                                // the brand raises its price, then opens a second shop
const priceB = t => CUT.filter(p => t >= p[0]).pop()[1], priceG = t => t < RAISE ? 990 : 1290;
// the customers: the cheap shop pulls a crowd at first, then it thins out; the brand starts slow and keeps growing
const ARR_B = [0, .8, 1.6, 2.4, 3.3, 4.5, 7.5, 9.4, 11.8, 14.8], ARR_G = [.2, 2.3, 4.3, 6.8, 8.0, 9.1, 10.1, 11.0, 11.8, 12.6, 13.3, 14.0, 14.7, 15.4, 16.1, 16.8, 17.5, 18.2, 18.9, 19.6];   // later customers come faster: a neat queue that grows
function queue(arr, svc, walk = 1.35) { const C = []; let free = 0; arr.forEach((a, i) => { if (i >= 3) a = Math.max(a, C[i - 3].e - walk + .15);   // the next customer only walks in when there is room in the line
    const s = Math.max(a + walk, free), e = s + svc; free = e; C.push({ i, a, s, e }); }); return C; }
const QB = queue(ARR_B, .5), QG = queue(ARR_G, .9);
const SKINS = ['blue1', 'blue2', 'blue3'], LOOKS = [{}, { fem: 'bun' }, { cap: true }, { fem: 'pony' }, { specs: true }, { fem: 'bob' }, { helmet: true }, { fem: 'beret' }, { tache: true }, { fem: 'band' }, { fem: 'long' }, {}];
const look = i => ({ skin: SKINS[i % 3], ...LOOKS[(i * 5) % LOOKS.length] });
const SALES_B = QB.map(q => [q.e, 100 * priceB(q.s)]), SALES_G = QG.map(q => [q.e, 100 * priceG(q.s)]);   // each customer stands for a day's sales
const revenue = (S, t) => S.reduce((a, [e, p]) => a + (t >= e ? p : 0), 0);
const CAM = [[0, 540, 960, 1], [ZOOM_IN, 540, 960, 1], [ZOOM_IN + .3, 760, 640 + DY, 2.1], [GLIDE, 770, 630 + DY, 2.2], [GLIDE + .25, 720, 1290 + DY, 1.8], [ZOOM_OUT, 720, 1290 + DY, 1.8], [ZOOM_OUT + .25, 540, 960, 1],
  [FALL - .1, 540, 960, 1], [FALL + .1, 760, 700 + DY, 1.6], [FALL + 1.3, 760, 700 + DY, 1.6], [FALL + 1.55, 540, 960, 1]];
// —— the sets ——
function roomSet(c, R, t) { const { Y0, FL, kind } = R, bad = kind === 'bad';
  const g = c.createLinearGradient(0, Y0, 0, FL); if (bad) { g.addColorStop(0, '#3b3236'); g.addColorStop(1, '#262024'); } else { g.addColorStop(0, '#071433'); g.addColorStop(1, '#030918'); }
  c.fillStyle = g; c.fillRect(-300, Y0, 1680, 560);
  const gl = c.createRadialGradient(560, Y0 + 300, 30, 560, Y0 + 300, 620); gl.addColorStop(0, bad ? 'rgba(120,110,90,.25)' : 'rgba(0,17,63,.9)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gl; c.fillRect(-300, Y0, 1680, 560);
  for (let x = -60; x < 1180; x += 132) { c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(x, Y0, 5, 560); c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(x + 5, Y0, 3, 560); }
  rr(c, -300, Y0, 1680, 16, 0, bad ? '#1c1719' : '#020611');
  if (bad) { const fl = (hash(Math.floor(t * 9)) > .82 ? .25 : 1); rr(c, 380, Y0 + 26, 300, 12, 6, '#d8dccf'); c.save(); c.globalAlpha = .16 * fl; const cg = c.createLinearGradient(0, Y0 + 40, 0, FL); cg.addColorStop(0, 'rgba(230,240,210,1)'); cg.addColorStop(1, 'rgba(230,240,210,0)'); c.fillStyle = cg; c.beginPath(); c.moveTo(380, Y0 + 40); c.lineTo(680, Y0 + 40); c.lineTo(820, FL); c.lineTo(240, FL); c.closePath(); c.fill(); c.restore(); }   // a buzzing, flickering tube light
  else { rr(c, -300, Y0 + 150, 1680, 6, 0, 'rgba(46,211,198,.55)'); for (const lx of [500, 760]) { const cg = c.createLinearGradient(0, Y0 + 40, 0, FL); cg.addColorStop(0, 'rgba(255,236,190,.14)'); cg.addColorStop(1, 'rgba(255,236,190,0)'); c.fillStyle = cg; c.beginPath(); c.moveTo(lx - 22, Y0 + 44); c.lineTo(lx + 22, Y0 + 44); c.lineTo(lx + 150, FL); c.lineTo(lx - 150, FL); c.closePath(); c.fill();
    rr(c, lx - 2, Y0 + 14, 4, 18, 2, '#0a1636'); c.fillStyle = '#0f1d45'; c.beginPath(); c.ellipse(lx, Y0 + 40, 28, 14, 0, Math.PI, 0); c.fill(); ell(c, lx, Y0 + 42, 12, 5, '#ffe6a8'); } }   // warm lamps and a turquoise stripe
  const f = c.createLinearGradient(0, FL, 0, FL + 80); if (bad) { f.addColorStop(0, '#1d181a'); f.addColorStop(1, '#141113'); } else { f.addColorStop(0, '#051026'); f.addColorStop(1, '#020713'); }
  c.fillStyle = f; c.fillRect(-300, FL, 1680, 80); c.fillStyle = bad ? '#5a4c50' : '#2ED3C6'; c.fillRect(-300, FL - 2, 1680, 5);
  c.save(); c.font = '700 44px "Montserrat"'; const w1 = c.measureText(bad ? 'OLCSÓ ' : 'MÁRKÁS ').width; c.restore();
  text(c, bad ? 'OLCSÓ ' : 'MÁRKÁS ', 92, Y0 + 62, 44, bad ? REDT : TURQ, 'left'); text(c, 'BOLT', 92 + w1, Y0 + 62, 44, WHITE_T, 'left'); }
// a lemonade bottle: plain and grey (cheap) or with the brand's turquoise label (LIMÓ)
function lemon(c, x, y, r) { c.save(); c.translate(x, y); c.rotate(-.4); ell(c, 0, 0, r * 1.25, r, '#f5d23a'); ell(c, r * 1.2, 0, r * .18, r * .14, '#f5d23a'); ell(c, -r * .35, -r * .35, r * .35, r * .18, 'rgba(255,255,255,.45)'); ell(c, r * .2, -r * .95, r * .35, r * .14, '#4fae4f'); c.restore(); }
function bottle(c, x, y, s = 1, brand = false, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rr(c, -9, -78, 18, 14, 4, brand ? '#2ED3C6' : '#8b8f86'); rr(c, -8, -66, 16, 18, 4, brand ? '#eaf6e6' : '#c9cfc0');
  c.fillStyle = brand ? '#f6f1c8' : '#c9cfb2'; c.beginPath(); c.moveTo(-8, -50); c.quadraticCurveTo(-24, -40, -24, -22); c.lineTo(-24, 0); c.quadraticCurveTo(-24, 6, -18, 6); c.lineTo(18, 6); c.quadraticCurveTo(24, 6, 24, 0); c.lineTo(24, -22); c.quadraticCurveTo(24, -40, 8, -50); c.closePath(); c.fill();
  if (brand) { rr(c, -24, -30, 48, 26, 4, '#2ED3C6'); text(c, 'LIMÓ', 3, -17, 12, '#03222a'); lemon(c, -15, -17, 5); ell(c, 14, -38, 5, 3, 'rgba(255,255,255,.7)'); }
  else { c.strokeStyle = 'rgba(80,80,70,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, -18); c.lineTo(14, -14); c.stroke(); }
  c.restore(); }
function stall(c, R, t) { const { Y0, FL, kind } = R, bad = kind === 'bad', x0 = STALL - 120, w = 300;
  if (bad) { rr(c, x0, FL - 165, w, 165, 6, '#5b4a3c'); rr(c, x0 - 8, FL - 178, w + 16, 18, 4, '#6e5a48'); c.strokeStyle = 'rgba(30,20,15,.5)'; c.lineWidth = 3; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x0 + k * 75 + (k % 2) * 6, FL - 160); c.lineTo(x0 + k * 75 - 4, FL - 4); c.stroke(); }
    for (let k = 0; k < 4; k++) bottle(c, x0 + 40 + k * 32, FL - 178, .85, false, (k - 1.5) * .08);
    c.save(); c.translate(345, Y0 + 165); c.rotate(-.06 + .02 * Math.sin(t * 3)); rr(c, -150, -48, 300, 96, 6, '#e9e3cf'); text(c, 'LIMONÁDÉ', 0, 30, 22, '#3a2a10'); text(c, 'OLCSÓ!!!', 0, -12, 46, '#d2232a'); c.restore();
    const p = priceB(t), pk = pop(t, CUT.filter(q => t >= q[0]).pop()[0]); scaled(c, x0 - 20, FL - 335, pk, () => { rr(c, x0 - 125, FL - 375, 210, 80, 14, '#ffd36a'); text(c, p + ' Ft', x0 - 20, FL - 333, 46, '#3a1b0a'); }); }
  else { rr(c, x0, FL - 165, w, 165, 16, '#0d1d40'); rr(c, x0 - 8, FL - 178, w + 16, 18, 8, '#13295a'); rr(c, x0, FL - 100, w, 10, 0, '#2ED3C6');
    for (let k = 0; k < 4; k++) bottle(c, x0 + 40 + k * 32, FL - 178, .85, true);
    c.save(); c.translate(340, Y0 + 185); rr(c, -150, -52, 300, 104, 22, '#071a3a'); c.strokeStyle = '#2ED3C6'; c.lineWidth = 4; c.beginPath(); c.roundRect(-150, -52, 300, 104, 22); c.stroke();
    lemon(c, -86, 2, 26); text(c, 'LIMÓ', 20, 4, 54, WHITE_T); c.restore();
    const p = priceG(t), pk = pop(t, t < RAISE ? 0 : RAISE); scaled(c, x0 - 20, FL - 335, pk, () => { rr(c, x0 - 150, FL - 375, 260, 80, 14, '#2ED3C6'); text(c, fmt(p), x0 - 20, FL - 333, 44, '#03222a'); }); } }
// the cheap shop's sale sign: it gets bigger every month, and at the end it falls on his head
function saleSign(c, t) { const { Y0, FL } = TOP; const k = SALE.filter(q => t >= q[0]).length - 1, s = [.8, 1.15, 1.5][k], pk = pop(t, SALE[k][0], .3);
  let x = 190, y = Y0 + 300, rot = -.1;
  if (t > FALL - .3) { const u = seg(t, FALL - .3, FALL); x = lerp(190, SELLER - 70, ease3(u)); y = lerp(Y0 + 300, FL - 200, u * u); rot = lerp(-.1, .35, u); if (t > FALL) { y = FL - 200 + 4 * Math.sin((t - FALL) * 40) * Math.exp(-(t - FALL) * 5); rot = .35; } }
  scaled(c, x, y, s * Math.min(1.08, pk), () => { c.save(); c.translate(x, y); c.rotate(rot); rr(c, -110, -60, 220, 120, 10, '#d2232a'); rr(c, -100, -50, 200, 100, 8, '#ff3b30'); text(c, SALE[k][1], 0, 4, 60, '#ffffff'); c.restore(); }); }
// —— the people ——
function custPos(Q, q, t, R) { const ahead = Q.filter(o => o.i < q.i).reduce((a, o) => a + (1 - ss(seg(t, o.e, o.e + .3))), 0), slotX = SLOT0 - SLOTW * ahead, walkX = -140 + 430 * (t - q.a);
  return Math.min(slotX, walkX); }
function customer(c, Q, q, t, R, good) { const { FL } = R, L = look(q.i + (good ? 3 : 0)); if (t < q.a) return;
  if (t < q.e) { const x = custPos(Q, q, t, R), moving = Math.abs(custPos(Q, q, t + .05, R) - x) > 1;
    drawMascot(c, { id: 'c' + q.i + R.kind, ...L, s: .95, x, y: FL, f: .6, walk: moving ? 1 : 0, phi: t * 10, smile: good ? .8 : .35, look: .1, handR: t > q.e - .25 ? [x + 60, FL - 160] : undefined }); return; }
  const u = t - q.e, out = seg(t, q.e + .05, q.e + 3.3); if (out >= 1) return;   // v3: pays and walks straight out to the right (photo or sip on the way)
  const x = lerp(SLOT0 + 95, 1260, ease3(out) * .3 + out * .7), y = FL + 46;   // v3: leaving to the right, past the counter, away from the line
  if (good) { const phone = false;   // v4: no phones (user)
    drawMascot(c, { id: 'o' + q.i + R.kind, ...L, s: .95, x, y, f: .6, walk: out > 0 ? 1 : 0, phi: t * 10, smile: 1, look: -.2, handL: phone ? [x - 30, y - 230] : undefined, handR: [x + 34, y - 120] });
    if (phone) { rr(c, x - 52, y - 268, 34, 56, 6, '#11182c'); rr(c, x - 49, y - 265, 28, 50, 4, '#2ED3C6'); const fl = seg(t, q.e + .35, q.e + .55); if (fl > 0 && fl < 1) { c.save(); c.globalAlpha = 1 - fl; ell(c, x - 35, y - 240, 60 * fl + 10, 60 * fl + 10, 'rgba(255,255,255,.9)'); c.restore(); } }
    bottle(c, x + 40, y - 106, .7, true); for (let k = 0; k < 2; k++) { const v = seg(t, q.e + .55 + k * .15, q.e + 1.4 + k * .15); if (v > 0 && v < 1) heartShape(c, x - 30 + (k ? 30 : -10) + 10 * Math.sin(v * 8), y - 280 - 120 * v, 16, 1 - v); } }
  else { const sip = u > .15 && u < 1.0; drawMascot(c, { id: 'o' + q.i + R.kind, ...L, s: .95, x, y, f: .6, walk: out > 0 ? 1 : 0, phi: t * 10, smile: 0, sad: u > .5 ? 1 : .3, o: u > .5 && u < 1.2 ? .8 : 0, look: .2, handR: sip ? [x + 22, y - 175] : [x + 34, y - 110] });
    bottle(c, sip ? x + 26 : x + 40, sip ? y - 195 : y - 96, .7, false, sip ? -2.2 : 0); bubble(c, x + 10, y - 330, q.i % 2 ? 'FÚJ!' : 'BLEH!', pop(t, q.e + .55, .2) * (1 - ss(seg(t, q.e + 1.25, q.e + 1.4))));
    if (u > .5 && u < 1.3) for (let k = 0; k < 3; k++) { c.save(); c.globalAlpha = .6; c.strokeStyle = '#9fd36a'; c.lineWidth = 4; c.beginPath(); const yy = y - 200 - k * 18 - 30 * (u - .5); c.moveTo(x - 30, yy); c.quadraticCurveTo(x - 15, yy - 10, x, yy); c.quadraticCurveTo(x + 15, yy + 10, x + 30, yy); c.stroke(); c.restore(); } } }   // stink lines
// —— the rooms ——
function badRoom(c, t) { const R = TOP, { Y0, FL } = R; roomSet(c, R, t);
  const shout = (t > TALK_B && t < GLIDE) || [7.6, 10.8].some(m => t > m - .15 && t < m + .8), bonk = t > FALL, grey = ss(seg(t, FALL + 1.5, FALL + 2));
  const B = boss(c, { t, x: SELLER, FL: FL - 40, u: .95, fat: true, sit: 0, f: -.35, face: bonk ? (grey > .4 ? 'grim' : 'pout') : shout ? 'yell' : (t > 13.0 ? 'glare' : 'smirk'), grey, shake: shout, flush: shout ? 1 : .3,
    handL: shout ? [SELLER - 120, FL - 330] : [SELLER - 90, FL - 220] });
  stall(c, R, t);   // the counter in front of the seller
  if (shout && !bonk) { const mx = SELLER - 120, my = FL - 335; c.save(); c.translate(mx, my); c.rotate(-.15); c.fillStyle = '#e8e2d0'; c.beginPath(); c.moveTo(0, -14); c.lineTo(-90, -40); c.lineTo(-90, 40); c.lineTo(0, 14); c.closePath(); c.fill(); rr(c, -6, -16, 30, 32, 6, '#d2232a'); c.restore();   // the megaphone
    for (let k = 0; k < 3; k++) { const u = ((t * 2.4 + k / 3) % 1); c.save(); c.globalAlpha = 1 - u; c.strokeStyle = '#ffd36a'; c.lineWidth = 6; c.beginPath(); c.arc(mx - 90, my - 15, 30 + 60 * u, Math.PI * .8, Math.PI * 1.2); c.stroke(); c.restore(); }
    bubble(c, mx - 150, my - 90, 'OLCSÓ! OLCSÓ!', pop(t, Math.max(TALK_B, [7.6, 10.8].find(m => t > m - .15 && t < m + .8) ?? TALK_B) + .05, .2)); }
  for (const q of QB) customer(c, QB, q, t, R, false);
  saleSign(c, t);
  if (bonk) { for (let k = 0; k < 3; k++) { const a = t * 7 + k * 2.1; star(c, B.head[0] + Math.cos(a) * 70, B.head[1] - B.R - 10 + Math.sin(a) * 14, 15); } }
  if (t > 19.4) { const fx = B.head[0] + 90 * Math.cos(t * 5), fy = B.head[1] - 70 + 30 * Math.sin(t * 7.3); ell(c, fx, fy, 6, 5, '#111'); c.save(); c.globalAlpha = .6; ell(c, fx - 4, fy - 6, 6, 3, '#dfe8f0'); ell(c, fx + 4, fy - 6, 6, 3, '#dfe8f0'); c.restore(); }   // a fly buzzes around him
  if (CNT > 0) { c.save(); c.globalAlpha = CNT; text(c, fmt(revenue(SALES_B, t)), 990, Y0 + 100, 54, t > 12.5 ? REDT : '#ffd36a', 'right', { stroke: 'rgba(20,10,10,.6)', sw: 8 }); c.restore(); } }
function goodRoom(c, t) { const R = BOT, { Y0, FL } = R; roomSet(c, R, t);
  const cheer = t > RAISE + .2 && t < RAISE + 1.0 || t > SHOP2 && t < SHOP2 + 1, serving = QG.some(q => t > q.e - .25 && t < q.e + .05);
  boss(c, { t, x: SELLER + 10, FL: FL - 40, u: .85, fat: false, f: -.25, face: cheer ? 'cheer' : 'kind', front: cheer, handL: cheer ? [SELLER - 10, FL - 270] : serving ? [SELLER - 120, FL - 210] : undefined, handR: cheer ? [SELLER + 30, FL - 272] : undefined });
  stall(c, R, t);
  for (const q of QG) customer(c, QG, q, t, R, true);
  badge(c, 'ÁREMELÉS!', STALL - 140, FL - 410, pop(t, RAISE) * (1 - ss(seg(t, RAISE + 1.6, RAISE + 1.9))), TURQ, 30);
  if (t > SHOP2) { const k = pop(t, SHOP2, .35); scaled(c, 195, Y0 + 285, k, () => { rr(c, 80, Y0 + 240, 230, 92, 18, '#071a3a'); c.strokeStyle = '#2ED3C6'; c.lineWidth = 4; c.beginPath(); c.roundRect(80, Y0 + 240, 230, 92, 18); c.stroke(); text(c, '2. ÜZLET', 195, Y0 + 270, 30, TURQ); text(c, 'NYÍLT!', 195, Y0 + 305, 24, WHITE_T); }); }
  if (CNT > 0) { c.save(); c.globalAlpha = CNT; text(c, fmt(revenue(SALES_G, t)), 990, Y0 + 100, 54, TURQ, 'right', { stroke: 'rgba(0,10,20,.6)', sw: 8 }); c.restore(); } }
// —— the frame ——
let CNT = 1;
function take(c, t) { const [cx, cy, z] = KF(t, CAM); CNT = clamp(1 - (z - 1) / .25); const shk = t > FALL && t < FALL + .25 ? 16 * (1 - (t - FALL) / .25) : 0;
  c.save(); c.translate(540 + shk * Math.sin(t * 90), 960 + shk * Math.cos(t * 77)); c.scale(z, z); c.translate(-cx, -cy);
  c.fillStyle = '#000'; c.fillRect(-400, 0, 1880, 2400);
  badRoom(c, t); goodRoom(c, t);
  rr(c, -300, TOP.Y0 + 640, 1680, 20, 0, '#000'); c.fillStyle = '#2ED3C6'; c.fillRect(-300, BOT.Y0 - 3, 1680, 3);
  const mi = MONTHS.filter(m => t >= m[0]).length; if (mi) { const [mt, mn] = MONTHS[mi - 1], k = pop(t, mt, .3); scaled(c, 300, BOT.Y0 - 10, Math.min(1.1, .8 + .2 * k), () => { rr(c, 300 - 82, BOT.Y0 - 30, 164, 40, 12, TURQ); text(c, `${mn}. HÓNAP`, 300, BOT.Y0 - 9, 24, '#03222a'); }); }
  if (t > FALL && t < FALL + .4) { const u = seg(t, FALL, FALL + .4); c.save(); c.globalAlpha = 1 - u; c.translate(SELLER - 30, TOP.FL - 400); c.scale(1.4 * (.6 + .6 * u), 1.4 * (.6 + .6 * u)); c.fillStyle = '#ffd36a'; c.beginPath(); for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2, r = k % 2 ? 26 : 58; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); c.restore(); }   // BONK
  c.restore();
  const ta = 1 - ss(seg(t, FALL, FALL + .15)) * (1 - ss(seg(t, FALL + 1.3, FALL + 1.5))); if (ta > 0) { c.save(); c.globalAlpha = ta; text(c, 'UGYANAZ A TERMÉK.', 540, 196 + DY, 58, WHITE_T); text(c, 'MÁS MÁRKA.', 540, 266 + DY, 62, TURQ); c.restore(); }
  const tk = pop(t, ZOOM_IN + .15, .28) * (1 - ss(seg(t, GLIDE - .05, GLIDE + .15))); if (tk > 0) scaled(c, 540, 1640, tk, () => text(c, 'CSAK AZ ÁRRAL VERSENYEZ.', 540, 1640, 50, REDT, 'center', { stroke: '#1a0a0a', sw: 10 }));
  const sk = pop(t, GLIDE + .15, .28) * (1 - ss(seg(t, ZOOM_OUT - .05, ZOOM_OUT + .15))); if (sk > 0) scaled(c, 540, 1560, sk, () => text(c, 'MÁRKÁT ÉPÍT.', 540, 1560, 72, TURQ, 'center', { stroke: '#00111f', sw: 12 })); }
await start({ scenes: [[0, take]], words: [], story: STORY, dur: DUR, stage: false, ending: false });
window.EV = [...QB.map(q => ({ t: q.e, type: 'saleB' })), ...QG.map(q => ({ t: q.e, type: 'saleG' })), ...QB.map(q => ({ t: q.e + .55, type: 'yuck' })), ...QG.map(q => ({ t: q.e + .4, type: 'photo' })),
  { t: ZOOM_IN, type: 'zoom' }, { t: GLIDE, type: 'zoom' }, { t: ZOOM_OUT, type: 'zoom' }, { t: TALK_B, type: 'shout' }, { t: 7.45, type: 'shout' }, { t: 10.65, type: 'shout' },
  ...SALE.slice(1).map(s => ({ t: s[0], type: 'sign' })), ...MONTHS.map(m => ({ t: m[0], type: 'month' })), { t: FALL - .3, type: 'fall' }, { t: FALL, type: 'bonk' }, { t: FALL + 1.5, type: 'grey' },
  { t: RAISE, type: 'raise' }, { t: SHOP2, type: 'shop2' }, { t: 19.4, type: 'fly' }].sort((p, q) => p.t - q.t);
