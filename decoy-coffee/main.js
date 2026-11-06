// The Decoy Cup: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
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

// —— keyframes: the whole film is one stage where a few things glide, grow and hand over to each other ——
function KF(t, keys) {   // keys: [[time, value], ...]; eased (smoothstep) between keys, held before the first and after the last
  if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i]; if (t <= t1) { const [t0, v0] = keys[i - 1]; return lerp(v0, v1, ss((t - t0) / Math.max(1e-6, t1 - t0))); } } return keys[keys.length - 1][1];
}
function badge(c, kind, x, y, r, k = 1) {
  if (k <= 0) return; scaled(c, x, y, k, () => { ell(c, x + r * .06, y + r * .1, r, r, 'rgba(0,0,20,.3)'); ell(c, x, y, r, r, CREAM); c.strokeStyle = GOLD2; c.lineWidth = r * .1; c.beginPath(); c.arc(x, y, r * .9, 0, 7); c.stroke(); const g = r * .55;
    if (kind === 'ex') text(c, '!', x, y + g * .08, g * 2.2, GOLD2); if (kind === 'q') text(c, '?', x, y + g * .08, g * 2.2, NAVY); });
}
function spark(c, x, y, t, at, n = 5, r = 120, sz = 16) { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + .4, u = clamp((t - at - k * .05) / .8); if (u <= 0 || u >= 1) continue; star(c, x + Math.cos(a) * r * (.6 + .5 * u), y + Math.sin(a) * r * (.6 + .5 * u), sz, Math.sin(u * Math.PI)); } }
function bg(c, col = '#2d4596') { const g = c.createRadialGradient(540, 1420, 60, 540, 1420, 640); g.addColorStop(0, col); g.addColorStop(.98, TOP); g.addColorStop(1, TOP); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
// —— the coffee cup: one drawing, three sizes (sz 0 small .. 1 medium .. 2 large); o.xray shows the coffee inside, o.fill how high ——
function cupH(s, sz) { return (150 + 55 * sz) * s; }
function cup(c, x, y, s, sz, o = {}) {
  if (s <= 0.01 || (o.a ?? 1) <= 0) return; const h = cupH(s, sz), wt = (100 + 20 * sz) * s, wb = wt * .72, xr = o.xray || 0, a = o.a ?? 1;
  c.save(); c.globalAlpha *= a;
  if (o.glow) glow(c, x, y - h / 2, h * 1.1, .55 * o.glow);
  ell(c, x + 6 * s, y + 2, wb * .62, 10 * s, 'rgba(0,0,20,.3)');
  const body = () => { c.beginPath(); c.moveTo(x - wb / 2, y); c.lineTo(x + wb / 2, y); c.lineTo(x + wt / 2, y - h); c.lineTo(x - wt / 2, y - h); c.closePath(); };
  if (xr > 0) { c.save(); body(); c.clip(); const f = o.fill ?? .6, top = y - h * .92 * f; c.fillStyle = '#5a3420'; c.fillRect(x - wt, top, wt * 2, y - top); ell(c, x, top, wt * .55, 7 * s, '#8a5434');
      if (o.extra > 0) { const e0 = y - h * .92 * (o.extraFrom ?? f); c.fillStyle = `rgba(236,189,74,${.45 * o.extra})`; c.fillRect(x - wt, top, wt * 2, e0 - top); } c.restore(); }
  const g = c.createLinearGradient(x - wt / 2, 0, x + wt / 2, 0); g.addColorStop(0, '#fbf3df'); g.addColorStop(.7, '#efe2c2'); g.addColorStop(1, '#d9c9a2'); c.fillStyle = g; c.globalAlpha *= 1 - .78 * xr; body(); c.fill(); c.globalAlpha /= (1 - .78 * xr) || 1;
  if (xr > 0) { c.strokeStyle = `rgba(246,239,220,${.8 * xr})`; c.lineWidth = 3 * s; body(); c.stroke(); }
  const sy = y - h * .52, sh = h * .24; c.fillStyle = WOOD; c.globalAlpha *= 1 - .6 * xr; c.beginPath(); c.moveTo(x - lerp(wb, wt, .38) / 2 - 2, sy + sh / 2); c.lineTo(x + lerp(wb, wt, .38) / 2 + 2, sy + sh / 2); c.lineTo(x + lerp(wb, wt, .62) / 2 + 2, sy - sh / 2); c.lineTo(x - lerp(wb, wt, .62) / 2 - 2, sy - sh / 2); c.closePath(); c.fill(); heart(c, x, sy + 2 * s, 14 * s, 1, GOLD); c.globalAlpha /= (1 - .6 * xr) || 1;
  c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(x - wt * .56, y - h - 14 * s, wt * 1.12, 18 * s, 8 * s); c.fill(); c.beginPath(); c.ellipse(x, y - h - 14 * s, wt * .44, 14 * s, 0, Math.PI, 0); c.fill(); ell(c, x + wt * .18, y - h - 22 * s, 6 * s, 3 * s, 'rgba(255,255,255,.25)');
  if (o.dashed) { c.save(); c.strokeStyle = `rgba(246,239,220,${.8 * o.dashed})`; c.lineWidth = 5; c.setLineDash([16, 12]); c.lineDashOffset = -(o.t || 0) * 40; c.beginPath(); c.roundRect(x - wt / 2 - 30, y - h - 50, wt + 60, h + 70, 24); c.stroke(); c.restore(); }
  c.restore();
}
function tag(c, x, y, s, label, k = 1, gold = 0) {   // a price pill: "850 Ft"
  if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { c.font = `700 ${36 * s}px "Montserrat"`; const w = c.measureText(label).width + 44 * s, h = 60 * s;
    c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 4, y - h / 2 + 6, w, h, h / 2); c.fill(); c.fillStyle = gold > 0 ? `rgb(${Math.round(lerp(246, 236, gold))},${Math.round(lerp(239, 189, gold))},${Math.round(lerp(220, 74, gold))})` : CREAM; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, h / 2); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 3 * s; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = NAVY; c.fillText(label, x, y + 2 * s); });
}
function crown(c, x, y, s, k) { if (k <= 0) return; scaled(c, x, y, Math.min(1.12, k), () => { glow(c, x, y, 110 * s, .4); c.fillStyle = GOLD; c.beginPath(); c.moveTo(x - 60 * s, y + 30 * s); c.lineTo(x - 70 * s, y - 34 * s); c.lineTo(x - 30 * s, y - 2 * s); c.lineTo(x, y - 50 * s); c.lineTo(x + 30 * s, y - 2 * s); c.lineTo(x + 70 * s, y - 34 * s); c.lineTo(x + 60 * s, y + 30 * s); c.closePath(); c.fill(); for (const d of [-1, 0, 1]) ell(c, x + d * 34 * s, y + 14 * s, 8 * s, 8 * s, '#c4566a'); }); }
const fmt = n => String(Math.round(n / 10) * 10).replace(/(\d)(?=(\d{3})+$)/, '$1 ') + ' Ft';

// —— the people ——
const BUYER = o => ({ id: 'buyer', skin: 'blue3', fem: 'bob', s: 1.5, smile: .8, ...o });   // a customer choosing

// —— the one shot: everything flows ——
const SHOT = {
  flow(c, t) {
    bg(c, '#2c46a0');
    stage(c, [150, 900, 930, 1700], 0, () => { c.translate(0, -80);
      const H = HIT, MENU = { x: 540, y: 1300, w: 660, h: 560 }, rowY = [1170, 1300, 1430];
      // the menu board (10.0 .. 18.8)
      const mk = E(t, H.menu, .4, .35) * (1 - ss(seg(t, H.menuOut, H.menuOut + .45)));
      if (mk > 0) scaled(c, MENU.x, MENU.y, Math.min(1.05, mk), () => { const { x, y, w, h } = MENU; c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(x - w / 2 + 10, y - h / 2 + 14, w, h, 26); c.fill(); c.fillStyle = WOOD; c.beginPath(); c.roundRect(x - w / 2 - 16, y - h / 2 - 16, w + 32, h + 32, 30); c.fill(); c.fillStyle = '#1b2559'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 20); c.fill();
        c.save(); c.font = '700 34px "Montserrat"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('MENÜ', x, y - h / 2 + 46); c.restore(); c.fillStyle = 'rgba(236,189,74,.4)'; c.fillRect(x - 60, y - h / 2 + 72, 120, 4);
        const row = (i, name, price, k) => { if (k <= 0) return; c.save(); c.globalAlpha *= Math.min(1, k); c.font = '700 40px "Montserrat"'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillStyle = CREAM; c.fillText(name, x - 140, rowY[i] + 4); c.textAlign = 'right'; c.fillStyle = GOLD; c.fillText(price, x + w / 2 - 40, rowY[i] + 4); c.fillStyle = 'rgba(246,239,220,.15)'; c.fillRect(x - 140, rowY[i] + 38, w / 2 + 100, 2); c.restore(); };
        row(0, 'KIS', '850 Ft', 1); row(2, 'NAGY', '1 350 Ft', 1);
        const slot = ss(seg(t, H.third - .1, H.third + .3)) * (1 - ss(seg(t, H.medium - .1, H.medium + .2))); if (slot > 0) { c.save(); c.globalAlpha *= slot; c.strokeStyle = GOLD; c.lineWidth = 4; c.setLineDash([14, 10]); c.lineDashOffset = -t * 40; c.beginPath(); c.roundRect(x - w / 2 + 30, rowY[1] - 46, w - 60, 92, 16); c.stroke(); c.restore(); badge(c, 'q', x, rowY[1], 34, E(t, H.third, .3, .5) * (1 - ss(seg(t, H.medium - .1, H.medium + .1)))); }
        row(1, 'KÖZEPES', '', E(t, H.medium + .3, .3, .5)); if (t > H.mPrice) { const pk = E(t, H.mPrice, .3, .5); c.save(); c.globalAlpha *= Math.min(1, pk); c.font = '700 40px "Montserrat"'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = GOLD; c.fillText('1 200 Ft', x + w / 2 - 40, rowY[1] + 4); c.restore(); if (pk > 0) glow(c, x + w / 2 - 120, rowY[1], 90, .4 * Math.max(0, 1 - (t - H.mPrice) / 1.2)); } });
      // the three cups: their paths through the film
      const big = { x: KF(t, [[2.28, 700], [2.73, 600], [5.26, 600], [5.75, 770], [H.menu, 770], [H.menu + .5, 330], [H.menuOut, 330], [H.menuOut + .5, 700], [H.best, 700], [H.best + .5, 540], [H.decoy, 540], [H.decoy + .45, 820], [H.row, 820], [H.row + .5, 790], [H.butWhy, 790], [H.butWhy + .6, 600]]),
        y: KF(t, [[0, 1600], [H.menu, 1600], [H.menu + .5, rowY[2] + 24], [H.menuOut, rowY[2] + 24], [H.menuOut + .5, 1640], [H.best, 1640], [H.best + .5, 1650], [H.decoy, 1650], [H.decoy + .45, 1640], [H.butWhy + .15, 1640], [H.butWhy + .75, 1490]]),
        s: KF(t, [[2.28, 0], [2.73, 1.45], [5.26, 1.45], [5.75, 1.05], [H.menu, 1.05], [H.menu + .5, .3], [H.menuOut, .3], [H.menuOut + .5, 1.3], [H.best, 1.3], [H.best + .5, 1.75], [H.decoy, 1.75], [H.decoy + .45, .95], [H.row, .95], [H.row + .5, 1.0], [H.win - .1, 1.0], [H.win + .4, 1.3]]),
        a: KF(t, [[H.decoy, 1], [H.decoy + .45, .45], [H.row, .45], [H.row + .5, 1]]) };
      const sm = { x: KF(t, [[2.28, 540], [2.73, 250], [5.26, 250], [5.75, 320], [H.menu, 320], [H.menu + .5, 330], [H.row, 330], [H.row + .5, 290], [H.butWhy, 290], [H.butWhy + .6, 330]]),
        y: KF(t, [[0, 1600], [H.menu, 1600], [H.menu + .5, rowY[0] + 24], [H.row, rowY[0] + 24], [H.row + .5, 1640]]),
        s: KF(t, [[0, 0], [0.44, 1.5], [2.28, 1.5], [2.73, .9], [5.26, .9], [5.75, 1.05], [H.menu, 1.05], [H.menu + .5, .3], [H.menuOut, .3], [H.menuOut + .4, 0], [H.row, 0], [H.row + .5, 1.0]]),
        a: KF(t, [[2.28, 1], [2.73, .45], [5.26, .45], [5.75, 1], [H.row, 1], [H.row + .5, 1], [H.butWhy, 1], [H.butWhy + .5, .45], [H.win, .45], [H.win + .4, .3]]) };
      const md = { x: KF(t, [[H.medium, 330], [H.menuOut, 330], [H.menuOut + .5, 390], [H.best, 390], [H.best + .5, 200], [H.decoy, 470], [H.row, 470], [H.row + .5, 540], [H.butWhy, 540], [H.butWhy + .45, 600]]),
        y: KF(t, [[H.medium, rowY[1] - 260], [H.medium + .35, rowY[1] + 24], [H.menuOut, rowY[1] + 24], [H.menuOut + .5, 1640], [H.best + .5, 1640], [H.decoy - .01, 980], [H.decoy, 980], [H.decoy + .55, 1560], [H.row, 1560], [H.row + .5, 1640]]),
        s: KF(t, [[H.medium - .05, 0], [H.medium + .1, .3], [H.menuOut, .3], [H.menuOut + .5, 1.3], [H.best, 1.3], [H.best + .5, .8], [H.decoy, 1.05], [H.row, 1.05], [H.row + .5, 1.0], [H.butWhy + .2, 1.0], [H.butWhy + .6, .6]]),
        a: KF(t, [[H.best, 1], [H.best + .45, 0], [H.decoy, 0], [H.decoy + .2, 1], [H.notThis - .1, 1], [H.notThis + .4, .5], [H.butWhy + .3, .5], [H.butWhy + .6, 0]]) };
      const bob = t > H.decoy + .55 && t < H.row + .2 ? Math.sin((t - H.decoy) * 3.2) * 16 : 0, lineOn = ss(seg(t, H.decoy, H.decoy + .3)) * (1 - ss(seg(t, H.row - .1, H.row + .35)));
      const xr = ss(seg(t, H.menuOut + .3, H.menuOut + .8)) * (1 - ss(seg(t, H.best, H.best + .4))), mFill = .5, lFill = KF(t, [[H.more - .1, .5], [H.more + .7, .95]]), extra = ss(seg(t, H.more, H.more + .7));
      // the customer (5.6 .. 10.0): she reaches for the small cup; its price glows
      const bk = ss(seg(t, 5.41, 5.80)) * (1 - ss(seg(t, H.menu - .2, H.menu + .2)));
      if (bk > 0) { c.save(); c.globalAlpha = bk; mascot(c, BUYER({ x: 545, y: 1795 + (1 - bk) * 40, f: -.15, smile: t > H.cheap ? 1 : .7, look: -.3, blink: blinkAt(t, 3), handL: t > H.pick - .25 ? reach([500, 1640], [395, 1520], ss(seg(t, H.pick - .25, H.pick + .1))) : undefined })); c.restore(); }
      // the cups themselves
      cup(c, sm.x, sm.y, sm.s, 0, { a: sm.a, glow: t > H.pick && t < H.menu ? ss(seg(t, H.pick, H.pick + .3)) : 0 });
      if (lineOn > 0) { c.save(); c.strokeStyle = `rgba(246,239,220,${.8 * lineOn})`; c.lineWidth = 3; c.beginPath(); c.moveTo(md.x, 960); c.lineTo(md.x, md.y + bob - cupH(md.s, 1) - 30 * md.s); c.stroke(); c.strokeStyle = `rgba(185,188,203,${lineOn})`; c.lineWidth = 6; c.beginPath(); c.arc(md.x + 10, md.y + bob - cupH(md.s, 1) - 22 * md.s, 12, Math.PI * .9, Math.PI * 2.1); c.stroke(); c.restore(); }
      cup(c, md.x, md.y + bob, md.s, 1, { a: md.a, xray: xr, fill: mFill, glow: t > H.decoyWord && t < H.row ? .8 * Math.sin(clamp((t - H.decoyWord) / 1.2) * Math.PI) : 0, dashed: ss(seg(t, H.notThis, H.notThis + .4)) * (1 - ss(seg(t, H.butWhy, H.butWhy + .3))), t });
      const pod = ss(seg(t, H.butWhy + .15, H.butWhy + .75)); if (pod > 0) { const ph = 150 * pod, px = 600, pw = 250; if (t > H.win) { const rk = ss(seg(t, H.win, H.win + .5)); c.save(); c.translate(px, 1490 - 160); c.rotate((t - H.win) * .5); for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.fillStyle = `rgba(236,189,74,${.16 * rk})`; c.beginPath(); c.moveTo(0, 0); c.lineTo(-38, -360 * rk); c.lineTo(38, -360 * rk); c.closePath(); c.fill(); } c.restore(); }
        ell(c, px + 8, 1644, pw * .56, 12, 'rgba(0,0,20,.3)'); c.fillStyle = '#e9dcc0'; c.fillRect(px - pw / 2, 1640 - ph, pw, ph); c.fillStyle = GOLD; c.fillRect(px - pw / 2 - 12, 1640 - ph - 10, pw + 24, 18); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(px - pw / 2, 1640 - ph + 8, pw * .18, ph - 8); if (pod > .6) heart(c, px, 1640 - ph / 2 + 4, 22 * pod, 1, GOLD2); }
      cup(c, big.x, big.y, big.s, 2, { a: big.a, xray: xr, fill: lFill, extra, extraFrom: mFill, glow: t > H.best + .3 && t < H.decoy ? .8 : t > H.win ? ss(seg(t, H.win, H.win + .4)) : 0 });
      if (extra > 0 && xr > .5) for (let k = 0; k < 4; k++) { const u = ((t - H.more) * .8 + k / 4) % 1; c.save(); c.globalAlpha = extra * Math.sin(u * Math.PI); text(c, '+', big.x + (k - 1.5) * 34, big.y - cupH(big.s, 2) * (.6 + .5 * u) - 40, 44, GOLD); c.restore(); }
      // price tags, riding under the cups
      tag(c, sm.x, sm.y + 70, 1, '850 Ft', E(t, 0.64, .35, .4) * (1 - ss(seg(t, H.menu - .1, H.menu + .2))) * Math.min(1, sm.a * 1.4), t > H.cheap && t < H.menu ? ss(seg(t, H.cheap, H.cheap + .3)) : 0);
      tag(c, big.x, big.y + 70, 1, '1 350 Ft', E(t, 3.22, .35, .4) * (1 - ss(seg(t, H.menu - .1, H.menu + .2))));
      if (t > H.plus) { const k = E(t, H.plus, .35, .4) * (1 - ss(seg(t, H.best - .1, H.best + .2))); if (k > 0) { tag(c, 545, 1190, 1.05, '+150 Ft', k, .6); c.save(); c.globalAlpha = Math.min(1, k); c.strokeStyle = GOLD; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(430, 1260); c.quadraticCurveTo(545, 1250, 640, 1280); c.stroke(); c.fillStyle = GOLD; c.beginPath(); c.moveTo(660, 1290); c.lineTo(626, 1294); c.lineTo(642, 1266); c.closePath(); c.fill(); c.restore(); } }
      // the interesting part: a big "!"
      badge(c, 'ex', 540, 930, 54, E(t, H.wow, .3, .5) * (1 - ss(seg(t, H.menuOut - .1, H.menuOut + .2))));
      // the best choice: a crown, sparkles
      crown(c, 540, 1650 - cupH(1.75, 2) - 110, 1.1, E(t, H.crown, .35, .4) * (1 - ss(seg(t, H.decoy - .1, H.decoy + .2)))); if (t > H.crown && t < H.decoy) spark(c, 540, 1350, t, H.crown, 6, 260, 18);
      if (t > H.win) spark(c, big.x, big.y - 170, t, H.win, 8, 250, 20); });
  },
};

function dreamHaze(c) { const g = c.createRadialGradient(540, 1250, 420, 540, 1150, 1150); g.addColorStop(0, 'rgba(255,236,190,0)'); g.addColorStop(1, 'rgba(255,236,190,.2)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { NOW = t; c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); captions(c, t); }   // the words belong to the page: a transition moves them with the picture

// —— the captions: the script, word by word as it is spoken, in the top left ——
const KEY = new Set(['kis','nagy','kedvezőbb','harmadik','közepes','érdekes','mindössze','több','legjobb','Decoy','Effectnek','nem','választásnak','vonzóbbnak','másik']);
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
